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

function isValidHttpUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function isForbiddenUrl(value) {
  if (!value) return true;

  const lower = value.toLowerCase();

  return (
    lower.includes("example.com") ||
    lower.includes("localhost") ||
    lower.includes("127.0.0.1")
  );
}

async function run() {
  console.log("");
  console.log("==========================");
  console.log("XEVEZA QUALITY CHECK");
  console.log("==========================");
  console.log("");

  const { data: rows, error } =
    await supabase
      .from("opportunities")
      .select("*");

  if (error) {
    throw error;
  }

  const opportunities = rows ?? [];

  let invalidUrl = 0;
  let missingTitle = 0;
  let missingSource = 0;
  let invalidScore = 0;
  let duplicateUrl = 0;
  let active = 0;
  let enriched = 0;

  const seenUrls = new Set();

  for (const item of opportunities) {
    if (item.status === "active") {
      active++;
    }

    if (item.ai_enriched === true) {
      enriched++;
    }

    if (!item.title?.trim()) {
      missingTitle++;

      console.log(
        `MISSING TITLE: ${item.id}`
      );
    }

    if (!item.source?.trim()) {
      missingSource++;

      console.log(
        `MISSING SOURCE: ${item.title}`
      );
    }

    if (
      !isValidHttpUrl(item.source_url) ||
      isForbiddenUrl(item.source_url)
    ) {
      invalidUrl++;

      console.log(
        `INVALID URL: ${item.title}`
      );

      console.log(
        `  ${item.source_url}`
      );
    }

    if (
      item.xeveza_score !== null &&
      (
        item.xeveza_score < 0 ||
        item.xeveza_score > 100
      )
    ) {
      invalidScore++;

      console.log(
        `INVALID SCORE: ${item.title}`
      );
    }

    if (seenUrls.has(item.source_url)) {
      duplicateUrl++;

      console.log(
        `DUPLICATE URL: ${item.source_url}`
      );
    } else {
      seenUrls.add(item.source_url);
    }
  }

  console.log("");
  console.log("==========================");
  console.log(
    `Total records    : ${opportunities.length}`
  );
  console.log(
    `Active           : ${active}`
  );
  console.log(
    `AI enriched      : ${enriched}`
  );
  console.log(
    `Invalid URL      : ${invalidUrl}`
  );
  console.log(
    `Missing title    : ${missingTitle}`
  );
  console.log(
    `Missing source   : ${missingSource}`
  );
  console.log(
    `Invalid score    : ${invalidScore}`
  );
  console.log(
    `Duplicate URL    : ${duplicateUrl}`
  );
  console.log("==========================");

  const criticalIssues =
    invalidUrl +
    missingTitle +
    missingSource +
    invalidScore +
    duplicateUrl;

  if (criticalIssues > 0) {
    console.log("");
    console.log(
      "QUALITY CHECK: ISSUES FOUND"
    );

    process.exitCode = 1;
  } else {
    console.log("");
    console.log(
      "QUALITY CHECK: PASSED"
    );
  }
}

run().catch((error) => {
  console.error("");
  console.error(
    "QUALITY CHECK FAILED"
  );

  console.error(error);

  process.exit(1);
});