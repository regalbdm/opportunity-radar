import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL tidak ditemukan");
}

if (!supabaseKey) {
  throw new Error("SUPABASE_SECRET_KEY tidak ditemukan");
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) =>
      typeof tag === "string"
        ? tag.trim()
        : tag?.name?.trim()
    )
    .filter(Boolean)
    .slice(0, 8);
}

function calculateBasicScore(job) {
  let score = 50;

  if (job.remote) score += 15;
  if (job.location) score += 5;
  if (job.tags?.length) score += 5;
  if (job.description) score += 5;

  const text = `${job.title ?? ""} ${job.description ?? ""}`
    .toLowerCase();

  if (
    text.includes("junior") ||
    text.includes("entry level") ||
    text.includes("intern")
  ) {
    score += 5;
  }

  if (
    text.includes("ai") ||
    text.includes("artificial intelligence") ||
    text.includes("machine learning") ||
    text.includes("data")
  ) {
    score += 5;
  }

  return Math.min(score, 100);
}

async function collect() {
  console.log("Fetching Arbeitnow jobs...");

  const response = await fetch(
    "https://www.arbeitnow.com/api/job-board-api"
  );

  if (!response.ok) {
    throw new Error(
      `Arbeitnow API error: ${response.status}`
    );
  }

  const payload = await response.json();
  const jobs = payload.data ?? [];

  console.log(`Jobs received: ${jobs.length}`);

  const { data: existingRows, error: existingError } =
  await supabase
    .from("opportunities")
    .select("source_url")
    .eq("source", "Arbeitnow");

if (existingError) {
  throw existingError;
}

  const existingUrls = new Set(
    (existingRows ?? []).map(
      (row) => row.source_url
    )
  );

  let inserted = 0;
  let duplicate = 0;
  let skipped = 0;
  let failed = 0;

  for (const job of jobs) {
    const sourceUrl = job.url;

    if (!sourceUrl || !job.title) {
      skipped++;
      continue;
    }

    if (existingUrls.has(sourceUrl)) {
      console.log(`DUPLICATE: ${job.title}`);
      duplicate++;
      continue;
    }

    const tags = normalizeTags(job.tags);

    const normalized = {
      title: job.title,
      company: job.company_name ?? null,

      source: "Arbeitnow",
      source_url: sourceUrl,

      category:
        tags[0] ??
        (job.remote ? "Remote Jobs" : "Jobs"),

      location: job.location ?? null,
      remote: Boolean(job.remote),

      compensation: null,

      description: stripHtml(
        job.description ?? ""
      ),

      requirements: null,

      tags,

      xeveza_score:
        calculateBasicScore(job),

      why_it_matters: job.remote
        ? "Remote opportunity discovered automatically by Xeveza."
        : "New opportunity discovered automatically by Xeveza.",

      published_at: job.created_at
        ? new Date(
            job.created_at * 1000
          ).toISOString()
        : new Date().toISOString(),

      status: "active",

      ai_enriched: false,
      ai_enriched_at: null,
    };

    const { error } = await supabase
      .from("opportunities")
      .insert(normalized);

    if (error) {
      console.error(
        `FAILED: ${job.title}`
      );

      console.error(error.message);

      failed++;
      continue;
    }

    console.log(`NEW: ${job.title}`);

    existingUrls.add(sourceUrl);
    inserted++;
  }

  console.log("");
  console.log("==========================");
  console.log(`Received   : ${jobs.length}`);
  console.log(`New        : ${inserted}`);
  console.log(`Duplicate  : ${duplicate}`);
  console.log(`Skipped    : ${skipped}`);
  console.log(`Failed     : ${failed}`);
  console.log("==========================");
}

collect().catch((error) => {
  console.error("Collector failed:");
  console.error(error);
  process.exit(1);
});