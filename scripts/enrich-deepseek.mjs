import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

/* =========================
   ENV
========================= */

const envPath = path.resolve(".env.local");

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");

  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY;

const deepseekKey =
  process.env.DEEPSEEK_API_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL tidak ditemukan"
  );
}

if (!supabaseSecretKey) {
  throw new Error(
    "SUPABASE_SECRET_KEY tidak ditemukan"
  );
}

if (!deepseekKey) {
  throw new Error(
    "DEEPSEEK_API_KEY tidak ditemukan"
  );
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

/* =========================
   NORMALIZERS
========================= */

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

  return allowed.includes(value)
    ? value
    : "Jobs";
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

  return allowed.includes(value)
    ? value
    : "Unknown";
}

function normalizeWorkMode(value) {
  const allowed = [
    "Remote",
    "Hybrid",
    "On-site",
    "Unknown",
  ];

  return allowed.includes(value)
    ? value
    : "Unknown";
}

function normalizeEntryBarrier(value) {
  const allowed = [
    "Low",
    "Medium",
    "High",
    "Unknown",
  ];

  return allowed.includes(value)
    ? value
    : "Unknown";
}

function normalizeScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(number)
    )
  );
}

function resolveCategory(analysis) {
  const original =
    normalizeCategory(
      analysis.category
    );

  // Kategori khusus punya prioritas.
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

  if (
    analysis.ai_relevant === true
  ) {
    return "AI Jobs";
  }

  if (
    analysis.work_mode ===
    "Remote"
  ) {
    return "Remote Jobs";
  }

  return "Jobs";
}

/* =========================
   DEEPSEEK
========================= */

async function analyzeJob(job) {
  const prompt = `
You are the analysis engine for Xeveza Opportunity Radar.

Xeveza discovers global jobs, freelance opportunities, internships, grants, competitions and digital opportunities.

IMPORTANT:
Do NOT translate or rewrite the original job title, company name, source description, location, or requirements.

Analyze the opportunity below.

SOURCE:
${job.source ?? "Unknown"}

TITLE:
${job.title}

COMPANY:
${job.company ?? "Unknown"}

LOCATION:
${job.location ?? "Unknown"}

REMOTE FLAG:
${job.remote ? "Yes" : "No"}

CURRENT CATEGORY:
${job.category ?? "Unknown"}

CURRENT TAGS:
${(job.tags ?? []).join(", ") || "None"}

COMPENSATION:
${job.compensation ?? "Not disclosed"}

DESCRIPTION:
${job.description?.slice(0, 9000) ?? "No description"}

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
  "why_it_matters_en": "",
  "why_it_matters_id": "",
  "why_it_matters_es": "",
  "why_it_matters_pt": "",
  "why_it_matters_de": ""
}

CATEGORY RULES:

- Internship:
  internships, traineeships, working-student opportunities when clearly student-oriented.

- Freelance:
  freelance, independent contractor, gig, project-based independent work.

- AI Jobs:
  AI, ML, LLM, generative AI, computer vision, NLP, AI evaluation, AI training, AI research or an AI product is a meaningful part of the role.

- Remote Jobs:
  primarily remote and not better classified above.

- Competition:
  competitions, contests, hackathons, challenges.

- Grants:
  grants and funding-focused programs.

- Jobs:
  everything else.

AI RELEVANCE:

Set ai_relevant=true ONLY if AI or machine learning is genuinely relevant to the person's work.

Do NOT mark a role AI-relevant merely because:
- the company uses AI,
- AI is mentioned in corporate marketing,
- the role interacts with an AI company but does not perform meaningful AI-related work.

INDONESIA ELIGIBILITY:

true:
- Indonesia explicitly allowed
- worldwide/global applicants allowed
- unrestricted global remote
- APAC/Asia where Indonesia is not excluded

false:
- clearly restricted to another country/region that excludes Indonesia
- legal work authorization requires another country

null:
- cannot determine confidently

WORK MODE:

Return only:
Remote
Hybrid
On-site
Unknown

Do not assume Remote solely because the opportunity came from a remote job board.

SENIORITY:

Infer from title and requirements.

ENTRY BARRIER:

Low:
entry, junior, intern, minimal experience, simple evaluation/annotation/basic freelance work.

Medium:
typical skilled professional role.

High:
senior, lead, manager, director, executive, highly specialized role.

COMPENSATION:

Only return compensation when explicitly stated in the source.
Never invent salary.
If not confidently available, return null.

SCORING:

Score usefulness for a broad Xeveza audience from 0 to 100.

Consider:
- accessibility / remote: 0-20
- Indonesia eligibility: 0-15
- entry barrier: 0-15
- compensation transparency: 0-10
- digital / AI relevance: 0-15
- flexibility: 0-10
- career value: 0-10
- clarity / freshness: 0-5

Do not automatically give AI jobs high scores.
A highly restricted or senior job can have a low score.

MULTILINGUAL WHY IT MATTERS:

All five fields must express the SAME factual meaning.

why_it_matters_en:
English.

why_it_matters_id:
Bahasa Indonesia.

why_it_matters_es:
Natural Spanish.

why_it_matters_pt:
Natural Brazilian/neutral Portuguese.

why_it_matters_de:
Natural German.

Each version:
- maximum 2 short sentences
- practical and concise
- mention strengths and limitations when relevant
- do not invent facts
- do not translate the job title
- do not translate the company name

Example meaning:

EN:
"Fully remote and open globally, making it accessible from Indonesia. However, the role requires senior-level experience."

ID:
"Sepenuhnya remote dan terbuka secara global sehingga dapat diakses dari Indonesia. Namun, posisi ini membutuhkan pengalaman tingkat senior."

ES:
"Es completamente remoto y está abierto a candidatos de todo el mundo, por lo que es accesible desde Indonesia. Sin embargo, requiere experiencia de nivel senior."

PT:
"É totalmente remoto e aberto a candidatos do mundo todo, sendo acessível a partir da Indonésia. No entanto, exige experiência de nível sênior."

DE:
"Die Stelle ist vollständig remote und weltweit offen, sodass sie auch aus Indonesien zugänglich ist. Allerdings wird Erfahrung auf Senior-Niveau vorausgesetzt."
`;

  const response = await fetch(
    "https://api.deepseek.com/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${deepseekKey}`,
      },

      body: JSON.stringify({
        model: "deepseek-chat",

        messages: [
          {
            role: "system",

            content:
              "Analyze opportunities and return strict JSON only. Never return markdown.",
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
    const text =
      await response.text();

    throw new Error(
      `DeepSeek ${response.status}: ${text}`
    );
  }

  const payload =
    await response.json();

  const content =
    payload.choices?.[0]
      ?.message?.content;

  if (!content) {
    throw new Error(
      "DeepSeek mengembalikan response kosong"
    );
  }

  return JSON.parse(
    cleanJsonResponse(content)
  );
}

/* =========================
   ENRICH
========================= */

async function run() {
  console.log("");
  console.log("==========================");
  console.log("XEVEZA AI ENRICHMENT");
  console.log("==========================");

  console.log(
    "Finding opportunities needing enrichment..."
  );

  const {
    data: jobs,
    error,
  } = await supabase
    .from("opportunities")
    .select("*")
    .eq("status", "active")
    .or(
      [
        "ai_enriched.eq.false",
        "ai_enriched.is.null",
        "why_it_matters_en.is.null",
        "why_it_matters_id.is.null",
        "why_it_matters_es.is.null",
        "why_it_matters_pt.is.null",
        "why_it_matters_de.is.null",
      ].join(",")
    )
    .order(
      "discovered_at",
      {
        ascending: false,
      }
    )
    .limit(50);

  if (error) {
    throw error;
  }

  if (!jobs?.length) {
    console.log(
      "No opportunities need enrichment."
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

    console.log(
      `Source: ${job.source}`
    );

    try {
      const analysis =
        await analyzeJob(job);

      const score =
        normalizeScore(
          analysis.score
        );

      const updateData = {
        category:
          resolveCategory(
            analysis
          ),

        xeveza_score:
          score ??
          job.xeveza_score,

        indonesia_eligible:
          typeof analysis.indonesia_eligible ===
          "boolean"
            ? analysis.indonesia_eligible
            : null,

        seniority:
          normalizeSeniority(
            analysis.seniority
          ),

        work_mode:
          normalizeWorkMode(
            analysis.work_mode
          ),

        ai_relevant:
          analysis.ai_relevant ===
          true,

        entry_barrier:
          normalizeEntryBarrier(
            analysis.entry_barrier
          ),

        why_it_matters_en:
          analysis.why_it_matters_en ||
          null,

        why_it_matters_id:
          analysis.why_it_matters_id ||
          job.why_it_matters_id ||
          job.why_it_matters ||
          null,

        why_it_matters_es:
          analysis.why_it_matters_es ||
          null,

        why_it_matters_pt:
          analysis.why_it_matters_pt ||
          null,

        why_it_matters_de:
          analysis.why_it_matters_de ||
          null,

        // Kolom lama tetap dijaga
        // sebagai fallback Bahasa Indonesia.
        why_it_matters:
          analysis.why_it_matters_id ||
          job.why_it_matters ||
          null,

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

      const {
        error: updateError,
      } = await supabase
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
        "Languages: EN ✓ ID ✓ ES ✓ PT ✓ DE ✓"
      );

      console.log(
        "Updated successfully"
      );

      success++;
    } catch (error) {
      console.error(
        `FAILED: ${job.title}`
      );

      console.error(
        error?.message ||
        error
      );

      failed++;
    }
  }

  console.log("");
  console.log("==========================");
  console.log(
    `Selected : ${jobs.length}`
  );
  console.log(
    `Success  : ${success}`
  );
  console.log(
    `Failed   : ${failed}`
  );
  console.log("==========================");

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("");
  console.error(
    "DeepSeek enrichment failed:"
  );

  console.error(error);

  process.exit(1);
});