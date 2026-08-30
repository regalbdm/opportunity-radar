import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(".env.local");

const envContent = fs.readFileSync(envPath, "utf8");

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) continue;

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex === -1) continue;

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim();

  process.env[key] = value;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const deepseekKey = process.env.DEEPSEEK_API_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL tidak ditemukan");
}

if (!supabaseSecretKey) {
  throw new Error("SUPABASE_SECRET_KEY tidak ditemukan");
}

if (!deepseekKey) {
  throw new Error("DEEPSEEK_API_KEY tidak ditemukan");
}

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

function cleanJsonResponse(text = "") {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeCategory(value) {
  const allowed = [
    "Remote Jobs",
    "Freelance",
    "AI Jobs",
    "Internship",
    "Competition",
    "Grants",
    "Jobs",
  ];

  return allowed.includes(value) ? value : "Jobs";
}

function normalizeSeniority(value) {
  const allowed = [
    "Intern",
    "Entry",
    "Junior",
    "Mid",
    "Senior",
    "Lead",
    "Manager",
    "Director",
    "Executive",
    "Unknown",
  ];

  return allowed.includes(value) ? value : "Unknown";
}

function normalizeWorkMode(value) {
  const allowed = [
    "Remote",
    "Hybrid",
    "On-site",
    "Unknown",
  ];

  return allowed.includes(value) ? value : "Unknown";
}

function normalizeEntryBarrier(value) {
  const allowed = ["Low", "Medium", "High", "Unknown"];

  return allowed.includes(value) ? value : "Unknown";
}

function resolveCategory(analysis) {
  const original = normalizeCategory(
    analysis.category
  );

  // Kategori khusus punya prioritas tertinggi.
  if (
    [
      "Internship",
      "Freelance",
      "Competition",
      "Grants",
    ].includes(original)
  ) {
    return original;
  }

  // Kalau AI memang bagian penting pekerjaan,
  // selalu kelompokkan sebagai AI Jobs.
  if (analysis.ai_relevant === true) {
    return "AI Jobs";
  }

  // Non-AI tetapi remote.
  if (analysis.work_mode === "Remote") {
    return "Remote Jobs";
  }

  return "Jobs";
}

function normalizeScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return null;

  return Math.max(
    0,
    Math.min(100, Math.round(number))
  );
}

async function analyzeJob(job) {
  const prompt = `
You are the AI analysis engine for Xeveza Opportunity Radar.

Xeveza helps people discover useful jobs, freelance work, internships, grants, competitions, and other digital opportunities.

Analyze the opportunity below.

TITLE:
${job.title}

COMPANY:
${job.company ?? "Unknown"}

LOCATION:
${job.location ?? "Unknown"}

REMOTE FLAG:
${job.remote ? "Yes" : "No"}

CURRENT TAGS:
${(job.tags ?? []).join(", ") || "None"}

DESCRIPTION:
${job.description?.slice(0, 8000) ?? "No description"}

Return ONLY valid JSON.

Use EXACTLY this schema:

{
  "category": "Remote Jobs | Freelance | AI Jobs | Internship | Competition | Grants | Jobs",
  "score": 0,
  "compensation": null,
  "indonesia_eligible": null,
  "seniority": "Intern | Entry | Junior | Mid | Senior | Lead | Manager | Director | Executive | Unknown",
  "work_mode": "Remote | Hybrid | On-site | Unknown",
  "ai_relevant": false,
  "entry_barrier": "Low | Medium | High | Unknown",
  "why_it_matters": ""
}

CATEGORY RULES:

1. If the opportunity is clearly an internship, use:
   "Internship"

2. If it is freelance, contract-based independent work, gig work, project work, or creator work, use:
   "Freelance"

3. If the role substantially involves AI, machine learning, LLMs, generative AI, computer vision, NLP, AI products, AI evaluation, AI training, or AI research, use:
   "AI Jobs"

4. If it is primarily a remote role but not strongly AI-related, use:
   "Remote Jobs"

5. Use "Competition" only for competitions, challenges, hackathons, contests, or similar programs.

6. Use "Grants" only for grants, funding programs, fellowships focused primarily on funding, or similar funding opportunities.

7. Otherwise use:
   "Jobs"

AI RELEVANCE:

Set ai_relevant=true only when AI or machine learning is a meaningful part of the role.

A company merely using technology does not automatically make the job AI-related.

INDONESIA ELIGIBILITY:

Set indonesia_eligible=true if the description clearly allows:
- worldwide applicants,
- global remote applicants,
- Asia/APAC applicants where Indonesia is not excluded,
- Indonesia specifically.

Set false if the description clearly restricts applicants to another country or region excluding Indonesia.

Set null if eligibility cannot be determined confidently.

WORK MODE:

Use:
- Remote
- Hybrid
- On-site
- Unknown

Do not assume Remote just because the job appeared on a job board.

SENIORITY:

Infer from title and requirements.

Examples:
Intern → Intern
Entry Level → Entry
Junior → Junior
Senior → Senior
Lead → Lead
Manager → Manager
Director → Director
VP / Chief / C-level → Executive

If unclear, use Unknown.

ENTRY BARRIER:

Low:
- internship
- entry-level
- junior
- no experience required
- general content evaluation
- annotation
- basic freelance work

Medium:
- typical professional role
- several years experience
- specialized skills

High:
- senior
- lead
- manager
- director
- executive
- highly specialized roles

COMPENSATION:

Only extract compensation if explicitly present in the description.

Do not estimate.
Do not invent.
If unavailable, use null.

SCORING:

Score from 0 to 100 based on usefulness for a broad Xeveza audience.

Suggested weighting:

Remote / accessible:
0-20

Indonesia eligibility:
0-15

Entry barrier:
0-15

Compensation transparency:
0-10

AI / digital relevance:
0-15

Flexibility / freelance potential:
0-10

Career value:
0-10

Freshness / clarity:
0-5

Important:
Do not automatically give AI jobs a high score.
A senior AI executive role may be AI-relevant but have a high entry barrier.

WHY IT MATTERS:

Write in Indonesian.

Maximum 2 short sentences.

Mention practical strengths or limitations.

Examples:
"Fully remote dan terbuka secara global, sehingga relatif mudah diakses dari Indonesia. Namun posisi ini membutuhkan pengalaman senior."

"Relevan untuk pemula karena tidak mensyaratkan pengalaman teknis berat dan menawarkan kerja fleksibel."

Do not exaggerate.
Do not invent facts.
`;

  const response = await fetch(
    "https://api.deepseek.com/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepseekKey}`,
      },

      body: JSON.stringify({
        model: "deepseek-chat",

        messages: [
          {
            role: "system",
            content:
              "Return strict JSON only. Never add markdown or commentary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.1,
        response_format: {
          type: "json_object",
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `DeepSeek ${response.status}: ${text}`
    );
  }

  const payload = await response.json();

  const content =
    payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "DeepSeek mengembalikan response kosong"
    );
  }

  return JSON.parse(
    cleanJsonResponse(content)
  );
}

async function run() {
  console.log(
    "Finding unenriched opportunities..."
  );

  const { data: jobs, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("source", "Arbeitnow")
    .eq("ai_enriched", false)
    .order("discovered_at", {
      ascending: false,
    })
    .limit(25);

  if (error) {
    throw error;
  }

  if (!jobs?.length) {
    console.log(
      "No unenriched opportunities found."
    );

    return;
  }

  console.log(
    `Jobs selected: ${jobs.length}`
  );

  let success = 0;
  let failed = 0;

  for (const job of jobs) {
    console.log("");
    console.log(
      `Analyzing: ${job.title}`
    );

    try {
      const analysis =
        await analyzeJob(job);

      const score =
        normalizeScore(analysis.score);

      const updateData = {
        category: resolveCategory(analysis),

        xeveza_score:
          score ?? job.xeveza_score,

        indonesia_eligible:
          typeof analysis.indonesia_eligible ===
          "boolean"
            ? analysis.indonesia_eligible
            : null,

        seniority: normalizeSeniority(
          analysis.seniority
        ),

        work_mode: normalizeWorkMode(
          analysis.work_mode
        ),

        ai_relevant:
          Boolean(analysis.ai_relevant),

        entry_barrier:
          normalizeEntryBarrier(
            analysis.entry_barrier
          ),

        why_it_matters:
          analysis.why_it_matters ??
          job.why_it_matters,

        ai_enriched: true,

        ai_enriched_at:
          new Date().toISOString(),
      };

      if (
        typeof analysis.compensation ===
          "string" &&
        analysis.compensation.trim()
      ) {
        updateData.compensation =
          analysis.compensation.trim();
      }

      const { error: updateError } =
        await supabase
          .from("opportunities")
          .update(updateData)
          .eq("id", job.id);

      if (updateError) {
        throw updateError;
      }

      console.log(
        `Score: ${updateData.xeveza_score}`
      );

      console.log(
        `Category: ${updateData.category}`
      );

      console.log(
        `AI relevant: ${updateData.ai_relevant}`
      );

      console.log(
        `Indonesia eligible: ${
          updateData.indonesia_eligible ??
          "Unknown"
        }`
      );

      console.log(
        `Seniority: ${updateData.seniority}`
      );

      console.log(
        `Work mode: ${updateData.work_mode}`
      );

      console.log(
        `Entry barrier: ${updateData.entry_barrier}`
      );

      console.log(
        "Updated successfully"
      );

      success++;
    } catch (error) {
      console.error(
        `FAILED: ${job.title}`
      );

      console.error(error.message);

      failed++;
    }
  }

  console.log("");
  console.log(
    "=========================="
  );
  console.log(
    `Selected : ${jobs.length}`
  );
  console.log(
    `Success  : ${success}`
  );
  console.log(
    `Failed   : ${failed}`
  );
  console.log(
    "=========================="
  );
}

run().catch((error) => {
  console.error(
    "DeepSeek enrichment failed:"
  );

  console.error(error);

  process.exit(1);
});