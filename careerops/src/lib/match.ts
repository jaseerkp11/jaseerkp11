import { PROFILE, TITLE_HINTS } from "./profile";
import type { Job } from "./types";

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9+]+/g, " ");
}

export function scoreJob(input: {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  description: string;
  posted?: string;
}): Job | null {
  const title = input.title.trim();
  const loc = input.location || "";
  const blob = norm(`${title} ${loc} ${input.description} ${input.company}`);
  const t = norm(title);

  if (!TITLE_HINTS.some((h) => t.includes(h))) return null;

  let score = 20;
  const why: string[] = [];

  for (const role of PROFILE.targetRoles) {
    if (t.includes(norm(role).slice(0, 8))) {
      score += 18;
      why.push(`Title close to target: ${role}`);
      break;
    }
  }
  if (/\baccountant|accounts (assistant|officer|executive)|bookkeep/i.test(title)) {
    score += 12;
    why.push("Direct accounting title");
  }
  if (/procure|purchas|buyer|sourcing/i.test(title)) {
    score += 10;
    why.push("Procurement / purchasing title");
  }
  if (/operation|coordina|admin/i.test(title)) {
    score += 8;
    why.push("Operations / coordination title");
  }

  const locL = loc.toLowerCase();
  if (/abu dhabi|dubai|sharjah|uae|united arab/i.test(loc + title + input.description.slice(0, 400))) {
    score += 22;
    why.push("UAE location (visa + prior Abu Dhabi role)");
  } else if (/india|kerala|calicut|kochi|bangalore|mumbai/i.test(loc)) {
    score += 8;
    why.push("India-based (current location)");
  } else if (/remote|anywhere|work from home/i.test(loc + title)) {
    score += 6;
    why.push("Remote-friendly");
  } else if (/saudi|qatar|oman|bahrain|kuwait|gcc/i.test(loc)) {
    score += 10;
    why.push("GCC (relocation-adjacent)");
  }

  let kwHits = 0;
  for (const k of PROFILE.keywords) {
    if (blob.includes(k)) kwHits += 1;
  }
  score += Math.min(24, kwHits * 2);
  if (kwHits >= 6) why.push(`JD overlaps ${kwHits} profile keywords`);

  if (/hotel|hospitality|fit-?out|interior|construction|fmcg/i.test(blob)) {
    score += 8;
    why.push("Industry overlap (fit-out / hotel / ops)");
  }

  score = Math.max(0, Math.min(99, score));
  if (score < 32) return null;

  const fit: Job["fit"] = score >= 62 ? "strong" : score >= 45 ? "possible" : "stretch";
  if (why.length === 0) why.push("Keyword match on title");

  return {
    ...input,
    description: input.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1800),
    score,
    why: why.slice(0, 5),
    fit,
  };
}

export function pickBullets(description: string): string[] {
  const d = description.toLowerCase();
  const ranked = PROFILE.experience[0].bullets
    .map((b) => {
      const words = b.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
      const hits = words.filter((w) => d.includes(w)).length;
      return { b, hits };
    })
    .sort((a, b) => b.hits - a.hits);
  const top = ranked.filter((x) => x.hits > 0).map((x) => x.b);
  const rest = PROFILE.experience[0].bullets.filter((b) => !top.includes(b));
  return [...top, ...rest].slice(0, 5);
}

export function tailorSummary(job: Job): string {
  return (
    `${PROFILE.fullName.split(" ")[0]} is a ${job.title} candidate with UAE accounting, procurement, and operations experience at Introyale Interiors LLC (Abu Dhabi). ` +
    `Handles AP/AR, VAT, RFQ-to-LPO, supplier coordination, and project scheduling for hotel fit-out work. ` +
    `B.Com; currently in India with a UAE residence visa valid until December 2027 and ready to relocate.`
  );
}
