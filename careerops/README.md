# CareerOps (Mohammed Jaseer)

Local job desk inspired by [career-ops](https://github.com/santifer/career-ops), built around **your** CV (Introyale Interiors LLC, Abu Dhabi accountant → operations/procurement).

## What it does

- Scans **public** job APIs (Greenhouse boards including Careem, Remotive, Jobicy)
- Scores roles against your accounting / procurement / operations profile
- Sorts **strong UAE / GCC / remote** matches first
- Rewrites a **per-job ATS HTML resume** + cover letter (Print → Save as PDF)
- Tracks saved / applied / skip in the browser

## What it does not do

It does **not** auto-submit applications or fill Greenhouse/LinkedIn/Bayt forms. Career-Ops itself drafts answers for you to paste and tells you to follow each site’s terms. Auto-apply bots get accounts banned.

## Run

```bat
cd C:\Users\DELL\jaseerkp11
git fetch origin cursor/career-match-dashboard-9059
git checkout cursor/career-match-dashboard-9059
cd careerops
npm install
npm run dev
```

Open http://localhost:3200
