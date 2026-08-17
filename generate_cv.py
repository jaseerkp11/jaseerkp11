#!/usr/bin/env python3
"""Generate a scannable, recruiter-friendly CV for Mohammed Jaseer (DOCX + PDF)."""

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor, Twips
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Flowable,
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT_DIR = Path("/workspace")

# Palette — professional navy + gold, easy to scan
NAVY = RGBColor(0x0F, 0x2C, 0x3C)
GOLD_RGB = RGBColor(0xC4, 0xA3, 0x5A)
NAVY_HEX = HexColor("#0F2C3C")
NAVY_MID = HexColor("#17384A")
GOLD = HexColor("#C4A35A")
SAND = HexColor("#F6F1E6")
PALE = HexColor("#EEF4F7")
GRAY = HexColor("#2C2C2C")
MUTED = HexColor("#5A6570")
RULE = HexColor("#D9D2C5")


SUMMARY = (
    "Versatile Accounting and Operations professional with UAE experience across accounting, "
    "finance, procurement, purchasing, project coordination, client management, staff supervision, "
    "and business operations in the interior fit-out industry. Joined Introyale Interiors LLC "
    "(Abu Dhabi) as an Accountant and, within the first 5–6 months, took on additional "
    "responsibilities across company operations, procurement, project coordination, client "
    "management, staff supervision, and HR-related activities. Handled the complete workflow from "
    "client RFQ and quotation preparation through LPO receipt, material sourcing, purchasing, "
    "project scheduling, workforce coordination, and client follow-up. Worked directly with major "
    "hotel clients in the UAE and coordinated with purchasing, housekeeping, finance, operations, "
    "and engineering teams. Managed daily work allocation and scheduling for approximately 25–30 "
    "staff. B.Com graduate seeking Accounting, Finance, Procurement, Operations, Project "
    "Coordination, Administration, and related roles in the UAE."
)

SKILLS = [
    (
        "Accounting & Finance",
        "Accounting and Bookkeeping; Accounts Payable (AP); Accounts Receivable (AR); "
        "Purchase and Sales Entries; Invoicing and Billing; Receivables Follow-up; "
        "Payment Follow-up; Financial Documentation; VAT Preparation and Filing",
    ),
    (
        "Procurement & Purchasing",
        "Procurement and Purchasing; Supplier Sourcing; Supplier Coordination; "
        "Supplier Negotiation; Quotation Comparison; Material Sourcing; Purchase Coordination; "
        "Cost Calculation; Cost Control; Delivery Coordination",
    ),
    (
        "Project & Operations",
        "Project Initiation; Project Coordination; Project Scheduling; Daily Work Planning; "
        "Workforce Coordination; Staff Supervision; Task Allocation; Deadline Management; "
        "Material Planning; Operational Coordination",
    ),
    (
        "Client & Business Coordination",
        "RFQ Management; Quotation Preparation; Pricing; LPO Processing; Client Requirement "
        "Gathering; Client Communication; Hotel Client Coordination; Meeting and Site Visit "
        "Coordination; Cross-functional Coordination; Project Documentation",
    ),
]

ACCOUNTING_BULLETS = [
    "Managed day-to-day accounting activities including purchase entries, sales entries, accounts payable (AP), and accounts receivable (AR).",
    "Recorded and maintained financial transactions and supporting documentation required for financial and operational activities.",
    "Prepared invoices, maintained billing records, monitored customer outstanding balances, and followed up with clients on receivables by email and telephone.",
    "Prepared VAT-related records and handled VAT preparation and filing activities.",
    "Coordinated financial follow-ups connected with ongoing business and project activities.",
]

RFQ_BULLETS = [
    "Managed the quotation workflow from client RFQ receipt through requirement review, site visits, hotel client meetings, quotation submission, follow-up, and approval.",
    "Prepared quotations and calculated project pricing based on requirements, materials, labour, and related costs; coordinated with purchasing teams and suppliers for material information and pricing.",
    "Submitted quotations, followed up on clarifications and approvals, maintained client communication, processed approved LPOs, and initiated procurement and project execution.",
]

PROCUREMENT_BULLETS = [
    "Managed material sourcing after receiving approved client LPOs and identified suppliers according to project requirements.",
    "Obtained and compared supplier quotations; negotiated purchase prices and coordinated procurement according to project budgets and deadlines.",
    "Calculated project-related costs, monitored expenses, and worked to minimize unnecessary expenditure while meeting project requirements.",
    "Coordinated purchasing and material delivery schedules with project deadlines and followed up with suppliers on availability, purchasing, and delivery.",
]

PROJECT_BULLETS = [
    "Coordinated interior fit-out projects from initiation through execution, prioritizing approved LPOs according to client deadlines.",
    "Prepared project and workforce schedules; coordinated materials, staff, suppliers, and internal teams; and monitored ongoing and upcoming project requirements.",
    "Communicated with clients on progress, requirements, approvals, and schedules; attended meetings and coordinated between hotel representatives and internal teams.",
    "Coordinated with purchasing managers, housekeeping managers, finance, operations, and engineering departments.",
    "Prepared daily work schedules, assigned tasks and deadlines, followed up on progress, and coordinated staff according to project priorities.",
]

STAFF_BULLETS = [
    "Expanded from Accountant into company-wide operations within approximately 5–6 months, handling day-to-day operational coordination alongside accounting.",
    "Supervised and coordinated approximately 25–30 staff, including daily schedules, work assignment, deadline communication, and workforce planning.",
    "Supported HR-related staff management activities and acted as a key coordination point between management, staff, clients, suppliers, and project stakeholders.",
]

TUBEES_BULLETS = [
    "Assisted with recording daily accounting transactions and maintaining financial records and accounting documentation.",
    "Supported invoice preparation, payment follow-ups, and routine accounting and administrative activities.",
    "Supported general office and operational requirements.",
]


def set_run_font(run, name="Calibri", size=11, bold=False, color=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    if color is not None:
        run.font.color.rgb = color


def set_paragraph_spacing(p, before=0, after=0, line=240):
    pf = p.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = Twips(line)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE


def shade(paragraph, fill):
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    paragraph._p.get_or_add_pPr().append(shd)


def set_run_white(run):
    run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)


def add_section(doc, title):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=10, after=6, line=240)
    shade(p, "0F2C3C")
    run = p.add_run("  " + title.upper() + "  ")
    set_run_font(run, size=11, bold=True)
    set_run_white(run)
    return p


def add_body(doc, text, size=10.5, bold=False, before=0, after=4, align=None, color=None):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=before, after=after, line=230)
    if align:
        p.alignment = align
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold, color=color)
    return p


def add_mixed(doc, parts, size=10.5, before=0, after=2, color=None):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=before, after=after, line=230)
    for text, bold in parts:
        run = p.add_run(text)
        set_run_font(run, size=size, bold=bold, color=color)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=0, after=2, line=220)
    p.paragraph_format.left_indent = Inches(0.2)
    p.paragraph_format.first_line_indent = Inches(-0.15)
    run = p.add_run("• " + text)
    set_run_font(run, size=10.5)
    return p


def add_job_header(doc, title, dates):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=6, after=0, line=230)
    p.paragraph_format.tab_stops.add_tab_stop(Inches(7.1), WD_TAB_ALIGNMENT.RIGHT)
    run = p.add_run(title)
    set_run_font(run, size=11, bold=True, color=NAVY)
    run = p.add_run("\t" + dates)
    set_run_font(run, size=10.5, bold=True, color=GOLD_RGB)
    return p


def build_docx(path: Path):
    doc = Document()
    for section in doc.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.65)
        section.right_margin = Inches(0.65)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11)

    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(10.5)
    style.font.color.rgb = RGBColor(0x2C, 0x2C, 0x2C)

    banner = doc.add_paragraph()
    banner.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(banner, before=0, after=2, line=240)
    shade(banner, "0F2C3C")
    run = banner.add_run("MOHAMMED JASEER")
    set_run_font(run, size=22, bold=True)
    set_run_white(run)

    headline = doc.add_paragraph()
    headline.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(headline, before=0, after=2, line=230)
    shade(headline, "0F2C3C")
    run = headline.add_run(
        "Accounting  |  Finance  |  Operations  |  Procurement  |  Project Coordination"
    )
    set_run_font(run, size=11, bold=True, color=GOLD_RGB)

    contact = doc.add_paragraph()
    contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(contact, before=0, after=0, line=220)
    shade(contact, "17384A")
    run = contact.add_run(
        "Currently in India  |  Available for UAE Relocation  |  UAE Residence Visa valid until December 2027"
    )
    set_run_font(run, size=10)
    set_run_white(run)

    contact2 = doc.add_paragraph()
    contact2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(contact2, before=0, after=8, line=220)
    shade(contact2, "17384A")
    run = contact2.add_run(
        "+971 56 454 9259  |  mohammedjaseerkp11@gmail.com  |  linkedin.com/in/jaseerkp/"
    )
    set_run_font(run, size=10.5)
    set_run_white(run)

    add_section(doc, "At a Glance")
    glances = [
        ("UAE Experience: ", "Abu Dhabi — Interior Fit-Out / Hotel Projects"),
        ("Career Growth: ", "Joined as Accountant; expanded into operations, procurement and project coordination within 5–6 months"),
        ("Team Leadership: ", "Supervised and coordinated approximately 25–30 staff"),
        ("Visa & Relocation: ", "UAE Residence Visa valid until December 2027; available for UAE relocation"),
    ]
    for label, rest in glances:
        add_mixed(doc, [(label, True), (rest, False)], after=2, color=NAVY if False else None)

    add_section(doc, "Professional Summary")
    add_body(doc, SUMMARY, after=2)

    add_section(doc, "Core Skills")
    for label, rest in SKILLS:
        add_mixed(doc, [(label + ": ", True), (rest, False)], after=3)

    add_section(doc, "Professional Experience")
    add_job_header(
        doc,
        "INTROYALE INTERIORS LLC  —  Abu Dhabi, United Arab Emirates",
        "27 Oct 2023 – 16 May 2026",
    )
    add_mixed(
        doc,
        [("Accountant  →  Expanded Operations, Procurement & Project Responsibilities", True)],
        after=1,
    )
    add_body(doc, "Industry: Interior Fit-Out / Hotel Projects", size=10, after=3)

    add_mixed(doc, [("Accounting & Finance", True)], size=10.5, before=2, after=2, color=NAVY)
    for t in ACCOUNTING_BULLETS:
        add_bullet(doc, t)
    add_mixed(doc, [("RFQ, Quotation & Client Coordination", True)], size=10.5, before=4, after=2, color=NAVY)
    for t in RFQ_BULLETS:
        add_bullet(doc, t)
    add_mixed(doc, [("Procurement & Purchasing", True)], size=10.5, before=4, after=2, color=NAVY)
    for t in PROCUREMENT_BULLETS:
        add_bullet(doc, t)
    add_mixed(doc, [("Project Coordination & Execution", True)], size=10.5, before=4, after=2, color=NAVY)
    for t in PROJECT_BULLETS:
        add_bullet(doc, t)
    add_mixed(doc, [("Staff & Operations Management", True)], size=10.5, before=4, after=2, color=NAVY)
    for t in STAFF_BULLETS:
        add_bullet(doc, t)

    add_job_header(doc, "TUBEES FOODS  —  Junior Accounts Assistant", "2022 – 2023")
    for t in TUBEES_BULLETS:
        add_bullet(doc, t)

    add_section(doc, "Education")
    add_job_header(doc, "UNIVERSITY OF CALICUT  —  Bachelor of Commerce (B.Com)", "2019 – 2021")
    add_job_header(doc, "HSS ANAMANGAD  —  Higher Secondary Education", "2017 – 2018")

    add_section(doc, "Languages")
    add_body(doc, "Malayalam — Native    |    English — Fluent    |    Hindi — Basic", after=2)

    add_section(doc, "Additional Information")
    add_body(
        doc,
        "Current Location: India  |  UAE Experience: Abu Dhabi  |  "
        "UAE Residence Visa: Valid until December 2027  |  "
        "Relocation: Available for UAE opportunities  |  "
        "Availability: Open to suitable opportunities",
        after=2,
    )
    add_mixed(
        doc,
        [
            ("Target Roles: ", True),
            (
                "Accounting | Finance | Procurement | Purchasing | Operations | "
                "Project Coordination | Administration | Business Support",
                False,
            ),
        ],
        after=2,
    )
    doc.save(path)


def html_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def para(text, style):
    return Paragraph(text, style)


class GoldRule(Flowable):
    def __init__(self, width, thickness=1.6):
        super().__init__()
        self.width = width
        self.height = thickness
        self.thickness = thickness

    def draw(self):
        self.canv.setFillColor(GOLD)
        self.canv.rect(0, 0, self.width, self.thickness, fill=1, stroke=0)


class SectionBar(Flowable):
    def __init__(self, title, width):
        super().__init__()
        self.title = title.upper()
        self.width = width
        self.height = 16

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.setFillColor(NAVY_HEX)
        c.roundRect(0, 0, self.width, 15, 1.5, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(0, 0, 4, 15, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(10, 4.5, self.title)


def build_pdf(path: Path):
    page_w, page_h = A4
    side = 14 * mm
    content_w = page_w - 2 * side

    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=side,
        rightMargin=side,
        topMargin=11 * mm,
        bottomMargin=12 * mm,
        title="Mohammed Jaseer — CV",
        author="Mohammed Jaseer",
    )
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="Name",
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            alignment=TA_CENTER,
            textColor=white,
            spaceAfter=1,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Headline",
            fontName="Helvetica-Bold",
            fontSize=9.2,
            leading=12,
            alignment=TA_CENTER,
            textColor=GOLD,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Contact",
            fontName="Helvetica",
            fontSize=8.6,
            leading=11.2,
            alignment=TA_CENTER,
            textColor=white,
            spaceAfter=0,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SnapLabel",
            fontName="Helvetica",
            fontSize=7.2,
            leading=9,
            alignment=TA_CENTER,
            textColor=MUTED,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SnapValue",
            fontName="Helvetica-Bold",
            fontSize=8.4,
            leading=11,
            alignment=TA_CENTER,
            textColor=NAVY_HEX,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyJust",
            fontName="Helvetica",
            fontSize=9.1,
            leading=12,
            alignment=TA_JUSTIFY,
            textColor=GRAY,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SkillTitle",
            fontName="Helvetica-Bold",
            fontSize=8.4,
            leading=11,
            textColor=NAVY_HEX,
            spaceAfter=2,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SkillBody",
            fontName="Helvetica",
            fontSize=8.1,
            leading=10.6,
            textColor=GRAY,
        )
    )
    styles.add(
        ParagraphStyle(
            name="JobTitle",
            fontName="Helvetica-Bold",
            fontSize=9.6,
            leading=12.4,
            textColor=NAVY_HEX,
        )
    )
    styles.add(
        ParagraphStyle(
            name="JobMeta",
            fontName="Helvetica-Bold",
            fontSize=8.8,
            leading=11.5,
            textColor=HexColor("#3D5A68"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="JobDates",
            fontName="Helvetica-Bold",
            fontSize=8.6,
            leading=12.4,
            alignment=TA_RIGHT,
            textColor=HexColor("#8A7040"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubHead",
            fontName="Helvetica-Bold",
            fontSize=8.8,
            leading=11.5,
            textColor=NAVY_HEX,
            spaceBefore=3.5,
            spaceAfter=1.2,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletText",
            fontName="Helvetica",
            fontSize=8.85,
            leading=11.4,
            textColor=GRAY,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Industry",
            fontName="Helvetica-Oblique",
            fontSize=8.3,
            leading=10.8,
            textColor=MUTED,
            spaceAfter=1,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Lang",
            fontName="Helvetica",
            fontSize=8.8,
            leading=11.5,
            alignment=TA_CENTER,
            textColor=GRAY,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallCenter",
            fontName="Helvetica",
            fontSize=8.3,
            leading=11,
            alignment=TA_CENTER,
            textColor=GRAY,
        )
    )

    story = []

    def section(title):
        story.append(Spacer(1, 5))
        story.append(SectionBar(title, content_w))
        story.append(Spacer(1, 5))

    def bullets(items):
        for item in items:
            story.append(
                para("&#8226;&nbsp;&nbsp;" + html_escape(item), styles["BulletText"])
            )
            story.append(Spacer(1, 0.6))

    def job_block(left, right, meta=None, industry=None):
        t = Table(
            [[para(left, styles["JobTitle"]), para(right, styles["JobDates"])]],
            colWidths=[content_w * 0.72, content_w * 0.28],
        )
        t.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 2),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
                    ("LINEBELOW", (0, 0), (-1, -1), 0.4, RULE),
                ]
            )
        )
        story.append(t)
        if meta:
            story.append(para(html_escape(meta), styles["JobMeta"]))
        if industry:
            story.append(para(html_escape(industry), styles["Industry"]))

    # Header band
    header = Table(
        [
            [para("MOHAMMED JASEER", styles["Name"])],
            [
                para(
                    html_escape(
                        "Accounting  |  Finance  |  Operations  |  Procurement  |  Project Coordination"
                    ),
                    styles["Headline"],
                )
            ],
            [
                para(
                    html_escape(
                        "Currently in India  |  Available for UAE Relocation  |  UAE Residence Visa valid until December 2027"
                    ),
                    styles["Contact"],
                )
            ],
            [
                para(
                    html_escape(
                        "+971 56 454 9259  |  mohammedjaseerkp11@gmail.com  |  linkedin.com/in/jaseerkp/"
                    ),
                    styles["Contact"],
                )
            ],
        ],
        colWidths=[content_w],
    )
    header.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NAVY_HEX),
                ("TOPPADDING", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
                ("TOPPADDING", (0, 1), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -2), 1),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(header)
    story.append(GoldRule(content_w, 3))
    story.append(Spacer(1, 6))

    # Snapshot cards — same facts, easier to notice in 5 seconds
    snaps = [
        ("UAE EXPERIENCE", "Abu Dhabi"),
        ("TEAM SUPERVISED", "25–30 Staff"),
        ("RESIDENCE VISA", "Valid to Dec 2027"),
        ("INDUSTRY", "Hotel Fit-Out"),
    ]
    snap_cells = []
    for label, value in snaps:
        inner = Table(
            [
                [para(label, styles["SnapLabel"])],
                [para(html_escape(value), styles["SnapValue"])],
            ],
            colWidths=[content_w / 4 - 6],
        )
        inner.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), SAND),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("TOPPADDING", (0, 0), (-1, 0), 5),
                    ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
                    ("TOPPADDING", (0, 1), (-1, 1), 0),
                    ("LEFTPADDING", (0, 0), (-1, -1), 3),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 3),
                    ("LINEABOVE", (0, 0), (-1, 0), 2.2, GOLD),
                ]
            )
        )
        snap_cells.append(inner)
    snap_row = Table([snap_cells], colWidths=[content_w / 4] * 4)
    snap_row.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 2.5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2.5),
            ]
        )
    )
    story.append(snap_row)

    section("Professional Summary")
    story.append(para(html_escape(SUMMARY), styles["BodyJust"]))

    section("Core Skills")
    skill_cells = []
    for title, body in SKILLS:
        box = Table(
            [
                [para(html_escape(title), styles["SkillTitle"])],
                [para(html_escape(body), styles["SkillBody"])],
            ],
            colWidths=[content_w / 2 - 6],
        )
        box.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), PALE),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                    ("TOPPADDING", (0, 0), (-1, 0), 6),
                    ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
                    ("TOPPADDING", (0, 1), (-1, 1), 0),
                    ("LINEBEFORE", (0, 0), (0, -1), 3, GOLD),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        skill_cells.append(box)
    skill_grid = Table(
        [[skill_cells[0], skill_cells[1]], [skill_cells[2], skill_cells[3]]],
        colWidths=[content_w / 2, content_w / 2],
    )
    skill_grid.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 2.5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2.5),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ]
        )
    )
    story.append(skill_grid)

    section("Professional Experience")
    job_block(
        html_escape("INTROYALE INTERIORS LLC — Abu Dhabi, UAE"),
        html_escape("27 Oct 2023 – 16 May 2026"),
        meta="Accountant → Expanded Operations, Procurement & Project Responsibilities",
        industry="Industry: Interior Fit-Out / Hotel Projects",
    )

    story.append(para("Accounting &amp; Finance", styles["SubHead"]))
    bullets(ACCOUNTING_BULLETS)
    story.append(para("RFQ, Quotation &amp; Client Coordination", styles["SubHead"]))
    bullets(RFQ_BULLETS)
    story.append(para("Procurement &amp; Purchasing", styles["SubHead"]))
    bullets(PROCUREMENT_BULLETS)
    story.append(para("Project Coordination &amp; Execution", styles["SubHead"]))
    bullets(PROJECT_BULLETS)
    story.append(para("Staff &amp; Operations Management", styles["SubHead"]))
    bullets(STAFF_BULLETS)

    story.append(Spacer(1, 4))
    job_block(
        html_escape("TUBEES FOODS — Junior Accounts Assistant"),
        html_escape("2022 – 2023"),
    )
    story.append(Spacer(1, 2))
    bullets(TUBEES_BULLETS)

    section("Education")
    job_block(
        html_escape("UNIVERSITY OF CALICUT — Bachelor of Commerce (B.Com)"),
        html_escape("2019 – 2021"),
    )
    job_block(
        html_escape("HSS ANAMANGAD — Higher Secondary Education"),
        html_escape("2017 – 2018"),
    )

    section("Languages")
    lang_items = [
        ("Malayalam", "Native"),
        ("English", "Fluent"),
        ("Hindi", "Basic"),
    ]
    lang_cells = []
    for name, level in lang_items:
        box = Table(
            [
                [para(html_escape(name), styles["SnapValue"])],
                [para(html_escape(level), styles["SnapLabel"])],
            ],
            colWidths=[content_w / 3 - 8],
        )
        box.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), SAND),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("TOPPADDING", (0, 0), (-1, 0), 5),
                    ("BOTTOMPADDING", (0, -1), (-1, -1), 5),
                    ("LINEABOVE", (0, 0), (-1, 0), 2, GOLD),
                ]
            )
        )
        lang_cells.append(box)
    langs = Table([lang_cells], colWidths=[content_w / 3] * 3)
    langs.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 3),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    story.append(langs)

    section("Additional Information")
    story.append(
        para(
            html_escape(
                "Current Location: India  |  UAE Experience: Abu Dhabi  |  "
                "UAE Residence Visa: Valid until December 2027  |  "
                "Relocation: Available for UAE opportunities  |  "
                "Availability: Open to suitable opportunities"
            ),
            styles["SmallCenter"],
        )
    )
    story.append(
        para(
            "<b>Target Roles:</b> Accounting | Finance | Procurement | Purchasing | "
            "Operations | Project Coordination | Administration | Business Support",
            styles["SmallCenter"],
        )
    )

    def decorate(canvas, doc_):
        canvas.saveState()
        canvas.setFillColor(NAVY_HEX)
        canvas.rect(0, 0, 4.2 * mm, page_h, fill=1, stroke=0)
        canvas.setFillColor(GOLD)
        canvas.rect(4.2 * mm, 0, 1.1 * mm, page_h, fill=1, stroke=0)
        canvas.setFillColor(NAVY_HEX)
        canvas.rect(0, 0, page_w, 8 * mm, fill=1, stroke=0)
        canvas.setFillColor(GOLD)
        canvas.rect(0, 8 * mm, page_w, 1.1 * mm, fill=1, stroke=0)
        canvas.setFillColor(white)
        canvas.setFont("Helvetica", 7.5)
        canvas.drawString(side, 3.2 * mm, "Mohammed Jaseer  |  Curriculum Vitae")
        canvas.drawRightString(page_w - side, 3.2 * mm, f"Page {doc_.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=decorate, onLaterPages=decorate)


def main():
    out = OUT_DIR / "cv"
    out.mkdir(exist_ok=True)
    docx_path = out / "Mohammed_Jaseer_CV_ATS.docx"
    pdf_path = out / "Mohammed_Jaseer_CV_ATS.pdf"
    build_docx(docx_path)
    build_pdf(pdf_path)
    print(f"Wrote {docx_path}")
    print(f"Wrote {pdf_path}")


if __name__ == "__main__":
    main()
