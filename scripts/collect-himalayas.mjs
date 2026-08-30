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

function toIsoDate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  // Unix timestamp dalam detik
  if (
    typeof value === "number" ||
    /^\d+$/.test(String(value))
  ) {
    const timestamp = Number(value);

    if (!Number.isFinite(timestamp)) {
      return null;
    }

    const milliseconds =
      timestamp < 1000000000000
        ? timestamp * 1000
        : timestamp;

    const date = new Date(milliseconds);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }

  // Kalau API suatu saat mengirim ISO date
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function formatSalary(job) {
  if (
    job.minSalary == null &&
    job.maxSalary == null
  ) {
    return null;
  }

  const currency =
    job.currency || "";

  const period =
    job.salaryPeriod || "annual";

  if (
    job.minSalary != null &&
    job.maxSalary != null
  ) {
    return `${currency} ${job.minSalary}–${job.maxSalary} / ${period}`;
  }

  if (job.minSalary != null) {
    return `${currency} ${job.minSalary}+ / ${period}`;
  }

  return `Up to ${currency} ${job.maxSalary} / ${period}`;
}

function normalizeCategory(job) {
  const employment =
    String(job.employmentType || "")
      .toLowerCase();

  if (employment.includes("intern")) {
    return "Internship";
  }

  if (
    employment.includes("contract") ||
    employment.includes("freelance")
  ) {
    return "Freelance";
  }

  return "Remote Jobs";
}

function buildTags(job) {
  const tags = [
    ...(Array.isArray(job.categories)
      ? job.categories
      : []),

    ...(Array.isArray(job.parentCategories)
      ? job.parentCategories
      : []),
  ];

  if (job.employmentType) {
    tags.push(job.employmentType);
  }

  if (job.seniority) {
    tags.push(job.seniority);
  }

  tags.push("Remote");

  return [...new Set(tags)]
    .filter(Boolean)
    .slice(0, 8);
}

function buildLocation(job) {
  const restrictions =
    Array.isArray(job.locationRestrictions)
      ? job.locationRestrictions
      : [];

  if (restrictions.length === 0) {
    return "Worldwide";
  }

  return restrictions.join(", ");
}

/* =========================
   FETCH HIMALAYAS
========================= */

async function fetchJobs() {
  const allJobs = [];

  let cursor = null;

  // Kita batasi awal ke 5 halaman = maksimal 100 job.
  // Setelah pipeline stabil bisa dinaikkan.
  const MAX_PAGES = 5;

  for (
    let page = 1;
    page <= MAX_PAGES;
    page++
  ) {
    const url = new URL(
      "https://himalayas.app/jobs/api"
    );

    url.searchParams.set(
      "limit",
      "20"
    );

    if (cursor) {
      url.searchParams.set(
        "cursor",
        cursor
      );
    }

    console.log(
      `Fetching Himalayas page ${page}...`
    );

    const response = await fetch(
      url.toString(),
      {
        headers: {
          "User-Agent":
            "Xeveza Opportunity Radar",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Himalayas API error: ${response.status}`
      );
    }

    const payload =
      await response.json();

    const jobs =
      Array.isArray(payload.jobs)
        ? payload.jobs
        : [];

    allJobs.push(...jobs);

    cursor =
      payload.nextCursor || null;

    if (!cursor) {
      break;
    }
  }

  return allJobs;
}

/* =========================
   COLLECT
========================= */

async function run() {
  console.log("");
  console.log("==========================");
  console.log("HIMALAYAS COLLECTOR");
  console.log("==========================");

  const jobs = await fetchJobs();

  console.log("");
  console.log(
    `Received   : ${jobs.length}`
  );

  const {
    data: existingRows,
    error: existingError,
  } = await supabase
    .from("opportunities")
    .select("source_url")
    .eq("source", "Himalayas");

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
    try {
      if (
        !job.title ||
        !job.applicationLink
      ) {
        skipped++;
        continue;
      }

      const sourceUrl =
        String(
          job.applicationLink
        ).trim();

      if (
        existingUrls.has(sourceUrl)
      ) {
        duplicate++;
        continue;
      }

      const description =
        cleanHtml(job.description);

      const locationRestrictions =
        Array.isArray(
          job.locationRestrictions
        )
          ? job.locationRestrictions
          : [];

      const indonesiaEligible =
        locationRestrictions.length === 0
          ? true
          : locationRestrictions.some(
              (country) =>
                String(country)
                  .toLowerCase()
                  .includes("indonesia")
            );

      const record = {
        title: job.title,

        company:
          job.companyName || null,

        source: "Himalayas",
        source_url: sourceUrl,

        category:
          normalizeCategory(job),

        location:
          buildLocation(job),

        remote: true,

        compensation:
          formatSalary(job),

        description:
          description
            ? description.slice(
                0,
                12000
              )
            : job.excerpt || null,

        requirements: null,

        tags:
          buildTags(job),

        xeveza_score: null,

        why_it_matters: null,

        published_at:
            toIsoDate(job.pubDate) ||
            new Date().toISOString(),

        discovered_at:
          new Date().toISOString(),

        expires_at:
          toIsoDate(job.expiryDate),

        status: "active",

        indonesia_eligible:
          indonesiaEligible,

        seniority:
          job.seniority || null,

        work_mode: "Remote",

        ai_relevant: false,

        entry_barrier: null,

        ai_enriched: false,

        ai_enriched_at: null,
      };

      const { error: insertError } =
        await supabase
          .from("opportunities")
          .insert(record);

      if (insertError) {
        throw insertError;
      }

      existingUrls.add(sourceUrl);
      inserted++;
    } catch (error) {
      failed++;

      console.error(
        `FAILED: ${
          job.title || "Unknown"
        }`
      );

      console.error(
        error?.message || error
      );
    }
  }

  console.log("");
  console.log("==========================");
  console.log(
    `Received   : ${jobs.length}`
  );
  console.log(
    `New        : ${inserted}`
  );
  console.log(
    `Duplicate  : ${duplicate}`
  );
  console.log(
    `Skipped    : ${skipped}`
  );
  console.log(
    `Failed     : ${failed}`
  );
  console.log("==========================");

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("");
  console.error(
    "HIMALAYAS COLLECTOR FAILED"
  );
  console.error(error);

  process.exit(1);
});