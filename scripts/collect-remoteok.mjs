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


function isJunkJob(job) {
  const title = String(
    job.position || ""
  )
    .trim()
    .toLowerCase();

  const blockedTitles = new Set([
    "across all departments",
    "all departments",
    "view all jobs",
    "all jobs",
    "jobs",
    "remote jobs",
  ]);

  if (!title) {
    return true;
  }

  if (blockedTitles.has(title)) {
    return true;
  }

  if (title.length < 3) {
    return true;
  }

  return false;
}
function cleanHtml(html) {
  if (!html) return null;

  return String(html)
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
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

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

    const date =
      new Date(milliseconds);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date.toISOString();
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}

function formatSalary(job) {
  const min =
    Number(job.salary_min);

  const max =
    Number(job.salary_max);

  const minValid =
    Number.isFinite(min) &&
    min > 0;

  const maxValid =
    Number.isFinite(max) &&
    max > 0;

  if (!minValid && !maxValid) {
    return null;
  }

  if (
    minValid &&
    maxValid
  ) {
    return `$${min.toLocaleString()}–$${max.toLocaleString()}`;
  }

  if (minValid) {
    return `From $${min.toLocaleString()}`;
  }

  return `Up to $${max.toLocaleString()}`;
}

function buildTags(job) {
  const tags =
    Array.isArray(job.tags)
      ? job.tags
      : [];

  return [
    ...new Set([
      ...tags,
      "Remote",
    ]),
  ]
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeCategory(job) {
  const title =
    String(
      job.position || ""
    ).toLowerCase();

  const tags =
    buildTags(job)
      .join(" ")
      .toLowerCase();

  if (
    title.includes("intern") ||
    tags.includes("intern")
  ) {
    return "Internship";
  }

  if (
    title.includes("freelance") ||
    title.includes("contract") ||
    tags.includes("freelance")
  ) {
    return "Freelance";
  }

  return "Remote Jobs";
}

function normalizeLocation(job) {
  const location =
    String(
      job.location || ""
    ).trim();

  if (!location) {
    return "Worldwide";
  }

  return location;
}

function isIndonesiaLikelyEligible(
  job
) {
  const location =
    normalizeLocation(job)
      .toLowerCase();

  if (
    location.includes(
      "worldwide"
    ) ||
    location.includes(
      "anywhere"
    ) ||
    location === "remote"
  ) {
    return true;
  }

  if (
    location.includes(
      "indonesia"
    )
  ) {
    return true;
  }

  return null;
}

/* =========================
   COLLECT
========================= */

async function run() {
  console.log("");
  console.log("==========================");
  console.log("REMOTE OK COLLECTOR");
  console.log("==========================");

  const response = await fetch(
    "https://remoteok.com/api",
    {
      headers: {
        "User-Agent":
          "Xeveza Opportunity Radar",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Remote OK request failed: ${response.status}`
    );
  }

  const payload =
    await response.json();

  // Remote OK biasanya item pertama metadata/API info.
  const jobs = Array.isArray(payload)
    ? payload.filter(
        (item) =>
          item &&
          item.position &&
          (
            item.url ||
            item.apply_url
          )
      )
    : [];

  console.log(
    `Received   : ${jobs.length}`
  );

  const {
    data: existingRows,
    error: existingError,
  } = await supabase
    .from("opportunities")
    .select("source_url")
    .eq("source", "Remote OK");

  if (existingError) {
    throw existingError;
  }

  const existingUrls =
    new Set(
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
      const sourceUrl =
        String(
          job.apply_url ||
          job.url ||
          ""
        ).trim();

      if (
        !job.position ||
        !sourceUrl ||
        isJunkJob(job)
      ) {
        skipped++;
        continue;
      }

      if (
        existingUrls.has(
          sourceUrl
        )
      ) {
        duplicate++;
        continue;
      }

      const description =
        cleanHtml(
          job.description
        );

      const record = {
        title:
          job.position,

        company:
          job.company ||
          null,

        source:
          "Remote OK",

        source_url:
          sourceUrl,

        category:
          normalizeCategory(
            job
          ),

        location:
          normalizeLocation(
            job
          ),

        remote: true,

        compensation:
          formatSalary(job),

        description:
          description
            ? description.slice(
                0,
                12000
              )
            : null,

        requirements:
          null,

        tags:
          buildTags(job),

        xeveza_score:
          null,

        why_it_matters:
          null,

        published_at:
          toIsoDate(
            job.date ||
            job.epoch
          ) ||
          new Date().toISOString(),

        discovered_at:
          new Date().toISOString(),

        expires_at:
          null,

        status:
          "active",

        indonesia_eligible:
          isIndonesiaLikelyEligible(
            job
          ),

        seniority:
          null,

        work_mode:
          "Remote",

        ai_relevant:
          false,

        entry_barrier:
          null,

        ai_enriched:
          false,

        ai_enriched_at:
          null,
      };

      const {
        error: insertError,
      } = await supabase
        .from(
          "opportunities"
        )
        .insert(record);

      if (insertError) {
        throw insertError;
      }

      existingUrls.add(
        sourceUrl
      );

      inserted++;
    } catch (error) {
      failed++;

      console.error(
        `FAILED: ${
          job.position ||
          "Unknown"
        }`
      );

      console.error(
        error?.message ||
        error
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

run().catch(
  (error) => {
    console.error("");
    console.error(
      "REMOTE OK COLLECTOR FAILED"
    );
    console.error(
      error
    );

    process.exit(1);
  }
);
