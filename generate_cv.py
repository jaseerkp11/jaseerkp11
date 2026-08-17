#!/usr/bin/env python3
"""Generate ATS-friendly CV for Mohammed Jaseer (DOCX + PDF)."""

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor, Twips
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT_DIR = Path("/workspace")
NAVY = RGBColor(0x1B, 0x3A, 0x4B)
NAVY_HEX = HexColor("#1B3A4B")
ACCENT = HexColor("#2C5F7C")
GRAY = HexColor("#333333")
MUTED = HexColor("#555555")


def set_run_font(run, name="Calibri", size=11, bold=False, color=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    if color is not None:
        run.font.color.rgb = color


def set_paragraph_spacing(p, before=0, after=0, line=240, after_auto=False):
    pf = p.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = Twips(line)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE


def add_bottom_border(paragraph):
    p = paragraph._p
    pPr = p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "12")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "1B3A4B")
    pBdr.append(bottom)
    pPr.append(pBdr)


def add_section(doc, title):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=10, after=4, line=240)
    run = p.add_run(title.upper())
    set_run_font(run, size=12, bold=True, color=NAVY)
    add_bottom_border(p)
    return p


def add_body(doc, text, size=10.5, bold=False, before=0, after=4, align=None):
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=before, after=after, line=230)
    if align:
        p.alignment = align
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold)
    return p


def add_mixed(doc, parts, size=10.5, before=0, after=2, align=None):
    """parts: list of (text, bold)."""
    p = doc.add_paragraph()
    set_paragraph_spacing(p, before=before, after=after, line=230)
    if align:
        p.alignment = align
    for text, bold in parts:
        run = p.add_run(text)
        set_run_font(run, size=size, bold=bold)
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
    tab_stops = p.paragraph_format.tab_stops
    tab_stops.add_tab_stop(Inches(7.1), WD_TAB_ALIGNMENT.RIGHT)
    run = p.add_run(title)
    set_run_font(run, size=11, bold=True, color=NAVY)
    run = p.add_run("\t" + dates)
    set_run_font(run, size=10.5, bold=False)
    return p


def build_docx(path: Path):
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.55)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.7)
        section.right_margin = Inches(0.7)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11)

    # Default style
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(10.5)
    style.font.color.rgb = RGBColor(0x22, 0x22, 0x22)

    name = doc.add_paragraph()
    name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(name, before=0, after=2, line=240)
    run = name.add_run("MOHAMMED JASEER")
    set_run_font(run, size=20, bold=True, color=NAVY)

    headline = doc.add_paragraph()
    headline.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(headline, before=0, after=4, line=230)
    run = headline.add_run(
        "Accounting  |  Finance  |  Operations  |  Procurement  |  Project Coordination"
    )
    set_run_font(run, size=11, bold=True, color=RGBColor(0x2C, 0x5F, 0x7C))

    contact = doc.add_paragraph()
    contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(contact, before=0, after=1, line=220)
    run = contact.add_run(
        "Currently in India  |  Available for UAE Relocation  |  UAE Residence Visa valid until December 2027"
    )
    set_run_font(run, size=10)

    contact2 = doc.add_paragraph()
    contact2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(contact2, before=0, after=2, line=220)
    run = contact2.add_run(
        "+971 56 454 9259  |  mohammedjaseerkp11@gmail.com  |  linkedin.com/in/jaseerkp/"
    )
    set_run_font(run, size=10.5)

    add_section(doc, "Professional Summary")
    add_body(
        doc,
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
        "Coordination, Administration, and related roles in the UAE.",
        after=2,
    )

    add_section(doc, "Core Skills")

    skills = [
        (
            "Accounting & Finance: ",
            "Accounting and Bookkeeping; Accounts Payable (AP); Accounts Receivable (AR); "
            "Purchase and Sales Entries; Invoicing and Billing; Receivables Follow-up; "
            "Payment Follow-up; Financial Documentation; VAT Preparation and Filing",
        ),
        (
            "Procurement & Purchasing: ",
            "Procurement and Purchasing; Supplier Sourcing; Supplier Coordination; "
            "Supplier Negotiation; Quotation Comparison; Material Sourcing; Purchase Coordination; "
            "Cost Calculation; Cost Control; Delivery Coordination",
        ),
        (
            "Project & Operations: ",
            "Project Initiation; Project Coordination; Project Scheduling; Daily Work Planning; "
            "Workforce Coordination; Staff Supervision; Task Allocation; Deadline Management; "
            "Material Planning; Operational Coordination",
        ),
        (
            "Client & Business Coordination: ",
            "RFQ Management; Quotation Preparation; Pricing; LPO Processing; Client Requirement "
            "Gathering; Client Communication; Hotel Client Coordination; Meeting and Site Visit "
            "Coordination; Cross-functional Coordination; Project Documentation",
        ),
    ]
    for label, rest in skills:
        add_mixed(doc, [(label, True), (rest, False)], after=3)

    add_section(doc, "Professional Experience")

    add_job_header(doc, "INTROYALE INTERIORS LLC  —  Abu Dhabi, United Arab Emirates", "27 Oct 2023 – 16 May 2026")
    add_mixed(
        doc,
        [
            (
                "Accountant  →  Expanded Operations, Procurement & Project Responsibilities",
                True,
            )
        ],
        size=10.5,
        after=1,
    )
    add_body(doc, "Industry: Interior Fit-Out / Hotel Projects", size=10, after=3)

    add_mixed(doc, [("Accounting & Finance", True)], size=10.5, before=2, after=2)
    for t in [
        "Managed day-to-day accounting activities including purchase entries, sales entries, accounts payable (AP), and accounts receivable (AR).",
        "Recorded and maintained financial transactions and supporting documentation required for financial and operational activities.",
        "Prepared invoices, maintained billing records, monitored customer outstanding balances, and followed up with clients on receivables by email and telephone.",
        "Prepared VAT-related records and handled VAT preparation and filing activities.",
        "Coordinated financial follow-ups connected with ongoing business and project activities.",
    ]:
        add_bullet(doc, t)

    add_mixed(doc, [("RFQ, Quotation & Client Coordination", True)], size=10.5, before=4, after=2)
    for t in [
        "Managed the quotation workflow from client RFQ receipt through requirement review, site visits, hotel client meetings, quotation submission, follow-up, and approval.",
        "Prepared quotations and calculated project pricing based on requirements, materials, labour, and related costs; coordinated with purchasing teams and suppliers for material information and pricing.",
        "Submitted quotations, followed up on clarifications and approvals, maintained client communication, processed approved LPOs, and initiated procurement and project execution.",
    ]:
        add_bullet(doc, t)

    add_mixed(doc, [("Procurement & Purchasing", True)], size=10.5, before=4, after=2)
    for t in [
        "Managed material sourcing after receiving approved client LPOs and identified suppliers according to project requirements.",
        "Obtained and compared supplier quotations; negotiated purchase prices and coordinated procurement according to project budgets and deadlines.",
        "Calculated project-related costs, monitored expenses, and worked to minimize unnecessary expenditure while meeting project requirements.",
        "Coordinated purchasing and material delivery schedules with project deadlines and followed up with suppliers on availability, purchasing, and delivery.",
    ]:
        add_bullet(doc, t)

    add_mixed(doc, [("Project Coordination & Execution", True)], size=10.5, before=4, after=2)
    for t in [
        "Coordinated interior fit-out projects from initiation through execution, prioritizing approved LPOs according to client deadlines.",
        "Prepared project and workforce schedules; coordinated materials, staff, suppliers, and internal teams; and monitored ongoing and upcoming project requirements.",
        "Communicated with clients on progress, requirements, approvals, and schedules; attended meetings and coordinated between hotel representatives and internal teams.",
        "Coordinated with purchasing managers, housekeeping managers, finance, operations, and engineering departments.",
        "Prepared daily work schedules, assigned tasks and deadlines, followed up on progress, and coordinated staff according to project priorities.",
    ]:
        add_bullet(doc, t)

    add_mixed(doc, [("Staff & Operations Management", True)], size=10.5, before=4, after=2)
    for t in [
        "Expanded from Accountant into company-wide operations within approximately 5–6 months, handling day-to-day operational coordination alongside accounting.",
        "Supervised and coordinated approximately 25–30 staff, including daily schedules, work assignment, deadline communication, and workforce planning.",
        "Supported HR-related staff management activities and acted as a key coordination point between management, staff, clients, suppliers, and project stakeholders.",
    ]:
        add_bullet(doc, t)

    add_job_header(doc, "TUBEES FOODS  —  Junior Accounts Assistant", "2022 – 2023")
    for t in [
        "Assisted with recording daily accounting transactions and maintaining financial records and accounting documentation.",
        "Supported invoice preparation, payment follow-ups, and routine accounting and administrative activities.",
        "Supported general office and operational requirements.",
    ]:
        add_bullet(doc, t)

    add_section(doc, "Education")
    add_job_header(doc, "UNIVERSITY OF CALICUT  —  Bachelor of Commerce (B.Com)", "2019 – 2021")
    add_job_header(doc, "HSS ANAMANGAD  —  Higher Secondary Education", "2017 – 2018")

    add_section(doc, "Languages")
    add_body(
        doc,
        "Malayalam — Native    |    English — Fluent    |    Hindi — Basic",
        after=2,
    )

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
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def p(text, style):
    """Build a paragraph. Pass already-escaped HTML where tags are needed."""
    return Paragraph(text, style)


def build_pdf(path: Path):
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=12 * mm,
        bottomMargin=12 * mm,
        title="Mohammed Jaseer — CV",
        author="Mohammed Jaseer",
    )
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="Name",
            fontName="Helvetica-Bold",
            fontSize=17,
            leading=20,
            alignment=TA_CENTER,
            textColor=NAVY_HEX,
            spaceAfter=1,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Headline",
            fontName="Helvetica-Bold",
            fontSize=9.5,
            leading=12,
            alignment=TA_CENTER,
            textColor=ACCENT,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Contact",
            fontName="Helvetica",
            fontSize=9,
            leading=11.5,
            alignment=TA_CENTER,
            textColor=GRAY,
            spaceAfter=1,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Sec",
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=13,
            textColor=NAVY_HEX,
            spaceBefore=7,
            spaceAfter=2,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyJust",
            fontName="Helvetica",
            fontSize=9.4,
            leading=12.2,
            alignment=TA_JUSTIFY,
            textColor=GRAY,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SkillLine",
            fontName="Helvetica",
            fontSize=9.3,
            leading=12,
            textColor=GRAY,
            spaceAfter=2.5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="JobTitle",
            fontName="Helvetica-Bold",
            fontSize=9.7,
            leading=12.5,
            textColor=NAVY_HEX,
            spaceBefore=4,
            spaceAfter=0,
        )
    )
    styles.add(
        ParagraphStyle(
            name="JobMeta",
            fontName="Helvetica-Bold",
            fontSize=9.3,
            leading=12,
            textColor=GRAY,
            spaceAfter=1,
        )
    )
    styles.add(
        ParagraphStyle(
            name="JobDates",
            fontName="Helvetica",
            fontSize=9.3,
            leading=12.5,
            alignment=TA_RIGHT,
            textColor=GRAY,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubHead",
            fontName="Helvetica-Bold",
            fontSize=9.4,
            leading=12,
            textColor=NAVY_HEX,
            spaceBefore=4,
            spaceAfter=1.5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletText",
            fontName="Helvetica",
            fontSize=9.3,
            leading=12,
            textColor=GRAY,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Industry",
            fontName="Helvetica-Oblique",
            fontSize=8.8,
            leading=11,
            textColor=MUTED,
            spaceAfter=2,
        )
    )

    story = []

    def section(title):
        story.append(p(title.upper(), styles["Sec"]))
        story.append(
            HRFlowable(
                width="100%",
                thickness=1,
                color=NAVY_HEX,
                spaceBefore=0,
                spaceAfter=5,
            )
        )

    def bullets(items):
        for item in items:
            story.append(p("&#8226;&nbsp;&nbsp;" + html_escape(item), styles["BulletText"]))
            story.append(Spacer(1, 0.8))

    def job_row(left, right):
        t = Table(
            [[p(left, styles["JobTitle"]), p(right, styles["JobDates"])]],
            colWidths=[135 * mm, 42 * mm],
        )
        t.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ]
            )
        )
        story.append(t)

    story.append(p(html_escape("MOHAMMED JASEER"), styles["Name"]))
    story.append(
        p(
            html_escape(
                "Accounting  |  Finance  |  Operations  |  Procurement  |  Project Coordination"
            ),
            styles["Headline"],
        )
    )
    story.append(
        p(
            html_escape(
                "Currently in India  |  Available for UAE Relocation  |  UAE Residence Visa valid until December 2027"
            ),
            styles["Contact"],
        )
    )
    story.append(
        p(
            html_escape(
                "+971 56 454 9259  |  mohammedjaseerkp11@gmail.com  |  linkedin.com/in/jaseerkp/"
            ),
            styles["Contact"],
        )
    )
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=NAVY_HEX, spaceAfter=2))

    section("Professional Summary")
    story.append(
        p(
            html_escape(
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
            ),
            styles["BodyJust"],
        )
    )

    section("Core Skills")
    skill_lines = [
        (
            "<b>Accounting &amp; Finance:</b> Accounting and Bookkeeping; Accounts Payable (AP); "
            "Accounts Receivable (AR); Purchase and Sales Entries; Invoicing and Billing; "
            "Receivables Follow-up; Payment Follow-up; Financial Documentation; VAT Preparation and Filing"
        ),
        (
            "<b>Procurement &amp; Purchasing:</b> Procurement and Purchasing; Supplier Sourcing; "
            "Supplier Coordination; Supplier Negotiation; Quotation Comparison; Material Sourcing; "
            "Purchase Coordination; Cost Calculation; Cost Control; Delivery Coordination"
        ),
        (
            "<b>Project &amp; Operations:</b> Project Initiation; Project Coordination; Project Scheduling; "
            "Daily Work Planning; Workforce Coordination; Staff Supervision; Task Allocation; "
            "Deadline Management; Material Planning; Operational Coordination"
        ),
        (
            "<b>Client &amp; Business Coordination:</b> RFQ Management; Quotation Preparation; Pricing; "
            "LPO Processing; Client Requirement Gathering; Client Communication; Hotel Client Coordination; "
            "Meeting and Site Visit Coordination; Cross-functional Coordination; Project Documentation"
        ),
    ]
    for line in skill_lines:
        story.append(p(line, styles["SkillLine"]))

    section("Professional Experience")
    job_row(
        html_escape("INTROYALE INTERIORS LLC — Abu Dhabi, United Arab Emirates"),
        html_escape("27 Oct 2023 – 16 May 2026"),
    )
    story.append(
        p(
            html_escape(
                "Accountant → Expanded Operations, Procurement & Project Responsibilities"
            ),
            styles["JobMeta"],
        )
    )
    story.append(
        p(html_escape("Industry: Interior Fit-Out / Hotel Projects"), styles["Industry"])
    )

    story.append(p("Accounting &amp; Finance", styles["SubHead"]))
    bullets(
        [
            "Managed day-to-day accounting activities including purchase entries, sales entries, accounts payable (AP), and accounts receivable (AR).",
            "Recorded and maintained financial transactions and supporting documentation required for financial and operational activities.",
            "Prepared invoices, maintained billing records, monitored customer outstanding balances, and followed up with clients on receivables by email and telephone.",
            "Prepared VAT-related records and handled VAT preparation and filing activities.",
            "Coordinated financial follow-ups connected with ongoing business and project activities.",
        ]
    )

    story.append(p("RFQ, Quotation &amp; Client Coordination", styles["SubHead"]))
    bullets(
        [
            "Managed the quotation workflow from client RFQ receipt through requirement review, site visits, hotel client meetings, quotation submission, follow-up, and approval.",
            "Prepared quotations and calculated project pricing based on requirements, materials, labour, and related costs; coordinated with purchasing teams and suppliers for material information and pricing.",
            "Submitted quotations, followed up on clarifications and approvals, maintained client communication, processed approved LPOs, and initiated procurement and project execution.",
        ]
    )

    story.append(p("Procurement &amp; Purchasing", styles["SubHead"]))
    bullets(
        [
            "Managed material sourcing after receiving approved client LPOs and identified suppliers according to project requirements.",
            "Obtained and compared supplier quotations; negotiated purchase prices and coordinated procurement according to project budgets and deadlines.",
            "Calculated project-related costs, monitored expenses, and worked to minimize unnecessary expenditure while meeting project requirements.",
            "Coordinated purchasing and material delivery schedules with project deadlines and followed up with suppliers on availability, purchasing, and delivery.",
        ]
    )

    story.append(p("Project Coordination &amp; Execution", styles["SubHead"]))
    bullets(
        [
            "Coordinated interior fit-out projects from initiation through execution, prioritizing approved LPOs according to client deadlines.",
            "Prepared project and workforce schedules; coordinated materials, staff, suppliers, and internal teams; and monitored ongoing and upcoming project requirements.",
            "Communicated with clients on progress, requirements, approvals, and schedules; attended meetings and coordinated between hotel representatives and internal teams.",
            "Coordinated with purchasing managers, housekeeping managers, finance, operations, and engineering departments.",
            "Prepared daily work schedules, assigned tasks and deadlines, followed up on progress, and coordinated staff according to project priorities.",
        ]
    )

    story.append(p("Staff &amp; Operations Management", styles["SubHead"]))
    bullets(
        [
            "Expanded from Accountant into company-wide operations within approximately 5–6 months, handling day-to-day operational coordination alongside accounting.",
            "Supervised and coordinated approximately 25–30 staff, including daily schedules, work assignment, deadline communication, and workforce planning.",
            "Supported HR-related staff management activities and acted as a key coordination point between management, staff, clients, suppliers, and project stakeholders.",
        ]
    )

    job_row(
        html_escape("TUBEES FOODS — Junior Accounts Assistant"),
        html_escape("2022 – 2023"),
    )
    story.append(Spacer(1, 3))
    bullets(
        [
            "Assisted with recording daily accounting transactions and maintaining financial records and accounting documentation.",
            "Supported invoice preparation, payment follow-ups, and routine accounting and administrative activities.",
            "Supported general office and operational requirements.",
        ]
    )

    section("Education")
    job_row(
        html_escape("UNIVERSITY OF CALICUT — Bachelor of Commerce (B.Com)"),
        html_escape("2019 – 2021"),
    )
    job_row(
        html_escape("HSS ANAMANGAD — Higher Secondary Education"),
        html_escape("2017 – 2018"),
    )

    section("Languages")
    story.append(
        p(
            html_escape("Malayalam — Native    |    English — Fluent    |    Hindi — Basic"),
            styles["SkillLine"],
        )
    )

    section("Additional Information")
    story.append(
        p(
            html_escape(
                "Current Location: India  |  UAE Experience: Abu Dhabi  |  "
                "UAE Residence Visa: Valid until December 2027  |  "
                "Relocation: Available for UAE opportunities  |  "
                "Availability: Open to suitable opportunities"
            ),
            styles["SkillLine"],
        )
    )
    story.append(
        p(
            "<b>Target Roles:</b> Accounting | Finance | Procurement | Purchasing | "
            "Operations | Project Coordination | Administration | Business Support",
            styles["SkillLine"],
        )
    )

    def footer(canvas, doc_):
        canvas.saveState()
        canvas.setStrokeColor(NAVY_HEX)
        canvas.setLineWidth(0.6)
        canvas.line(16 * mm, 9 * mm, A4[0] - 16 * mm, 9 * mm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(16 * mm, 5.2 * mm, "Mohammed Jaseer  |  Curriculum Vitae")
        canvas.drawRightString(A4[0] - 16 * mm, 5.2 * mm, f"Page {doc_.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


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
