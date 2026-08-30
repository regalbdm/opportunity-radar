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
   HELPERS
========================= */

function cleanHtml(html) {
  if (!html) return null;

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategory(job) {
  const type =
    String(job.job_type || "").toLowerCase();

  const category =
    String(job.category || "").toLowerCase();

  if (type.includes("intern")) {
    return "Internship";
  }

  if (
    type.includes("freelance") ||
    type.includes("contract")
  ) {
    return "Freelance";
  }

  if (
    category.includes("data") ||
    category.includes("software") ||
    category.includes("devops")
  ) {
    return "Remote Jobs";
  }

  return "Remote Jobs";
}

function buildTags(job) {
  const tags = [];

  if (job.category) {
    tags.push(job.category);
  }

  if (job.job_type) {
    tags.push(
      String(job.job_type)
        .replaceAll("_", " ")
    );
  }

  tags.push("Remote");

  return [...new Set(tags)].slice(0, 6);
}

/* =========================
   COLLECT
========================= */

async function run() {
  console.log("");
  console.log("==========================");
  console.log("REMOTIVE COLLECTOR");
  console.log("==========================");

  const response = await fetch(
    "https://remotive.com/api/remote-jobs"
  );

  if (!response.ok) {
    throw new Error(
      `Remotive request failed: ${response.status}`
    );
  }

  const payload = await response.json();

  const jobs = Array.isArray(payload.jobs)
    ? payload.jobs
    : [];

  console.log(`Received   : ${jobs.length}`);

  let inserted = 0;
  let duplicate = 0;
  let skipped = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      if (!job.title || !job.url) {
        skipped++;
        continue;
      }

      const sourceUrl =
        String(job.url).trim();

      const { data: existing, error: checkError } =
        await supabase
          .from("opportunities")
          .select("id")
          .eq("source_url", sourceUrl)
          .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existing) {
        duplicate++;
        continue;
      }

      const description =
        cleanHtml(job.description);

      const record = {
        title: job.title,
        company:
          job.company_name || null,

        source: "Remotive",
        source_url: sourceUrl,

        category:
          normalizeCategory(job),

        location:
          job.candidate_required_location ||
          "Remote",

        remote: true,

        compensation:
          job.salary || null,

        description:
          description
            ? description.slice(0, 12000)
            : null,

        requirements: null,

        tags: buildTags(job),

        xeveza_score: null,
        why_it_matters: null,

        published_at:
          job.publication_date ||
          new Date().toISOString(),

        discovered_at:
          new Date().toISOString(),

        expires_at: null,

        status: "active",

        ai_enriched: false,
      };

      const { error: insertError } =
        await supabase
          .from("opportunities")
          .insert(record);

      if (insertError) {
        throw insertError;
      }

      inserted++;
    } catch (error) {
      failed++;

      console.error(
        `FAILED: ${job.title || "Unknown"}`
      );

      console.error(
        error?.message || error
      );
    }
  }

  console.log("");
  console.log("==========================");
  console.log(`Received   : ${jobs.length}`);
  console.log(`New        : ${inserted}`);
  console.log(`Duplicate  : ${duplicate}`);
  console.log(`Skipped    : ${skipped}`);
  console.log(`Failed     : ${failed}`);
  console.log("==========================");

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("");
  console.error("REMOTIVE COLLECTOR FAILED");
  console.error(error);

  process.exit(1);
});