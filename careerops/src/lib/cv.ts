import { PROFILE } from "./profile";
import { pickBullets, tailorSummary } from "./match";
import type { Job } from "./types";

export function resumeHtml(job: Job): string {
  const bullets = pickBullets(job.description);
  const summary = tailorSummary(job);
  const skills = PROFILE.skills.map((s) => `<p><strong>${esc(s.title)}:</strong> ${esc(s.body)}</p>`).join("");
  const edu = PROFILE.education.map((e) => `<p>${esc(e.school)} — ${esc(e.detail)} (${esc(e.dates)})</p>`).join("");
  const langs = PROFILE.languages.map((l) => `${esc(l.name)} (${esc(l.level)})`).join(" · ");

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(PROFILE.fullName)} — ${esc(job.title)}</title>
<style>
  body{font-family:Calibri,Arial,sans-serif;color:#222;margin:24px;max-width:800px}
  h1{margin:0;font-size:26px;color:#0F2C3C}
  .meta{color:#5A6570;font-size:13px;margin:6px 0 16px}
  h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#0F2C3C;border-bottom:2px solid #C4A35A;padding-bottom:4px}
  ul{margin-top:6px}
  li{margin:4px 0}
  .target{background:#EEF4F7;padding:10px 12px;border-left:4px solid #C4A35A;margin:12px 0}
</style></head><body>
<h1>${esc(PROFILE.fullName)}</h1>
<div class="meta">${esc(PROFILE.phone)} · ${esc(PROFILE.email)} · ${esc(PROFILE.linkedin)}<br>
${esc(PROFILE.targetLocation)}</div>
<div class="target"><strong>Tailored for:</strong> ${esc(job.title)} — ${esc(job.company)}</div>
<h2>Summary</h2>
<p>${esc(summary)}</p>
<h2>Core skills</h2>
${skills}
<h2>Experience</h2>
<p><strong>${esc(PROFILE.experience[0].title)}</strong><br>
${esc(PROFILE.experience[0].company)} — ${esc(PROFILE.experience[0].place)} · ${esc(PROFILE.experience[0].dates)}</p>
<ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
<p><strong>${esc(PROFILE.experience[1].title)}</strong><br>
${esc(PROFILE.experience[1].company)} · ${esc(PROFILE.experience[1].dates)}</p>
<ul>${PROFILE.experience[1].bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
<h2>Education</h2>
${edu}
<h2>Languages</h2>
<p>${langs}</p>
<p style="color:#888;font-size:11px">ATS text resume. Use Print → Save as PDF. You submit the application yourself.</p>
</body></html>`;
}

export function coverLetter(job: Job): string {
  return `Dear Hiring Team,

I am applying for the ${job.title} role at ${job.company}. I recently completed UAE-based work as an Accountant at Introyale Interiors LLC in Abu Dhabi, where I also covered procurement, RFQ-to-LPO, project coordination for hotel fit-out jobs, and day-to-day supervision of about 25–30 staff.

That mix of accounting (AP/AR, invoicing, VAT) and operations is what I would bring to this position. I am currently in India, hold a UAE residence visa valid until December 2027, and can relocate.

Thank you for your consideration.

Mohammed Jaseer
${PROFILE.phone}
${PROFILE.email}
`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
