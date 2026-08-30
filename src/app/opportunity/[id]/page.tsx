import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

import OpportunityDetailClient from "@/components/OpportunityDetailClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function getOpportunity(id: string) {
  if (!isValidUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("Opportunity query error:", error);
    throw new Error("Failed to load opportunity");
  }

  return data;
}

/* =========================
   DYNAMIC PAGE METADATA
========================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  const opportunity =
    await getOpportunity(id);

  if (!opportunity) {
    return {
      title: "Opportunity Not Found",
      description:
        "This opportunity is no longer available on Xeveza.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    opportunity.why_it_matters ||
    `${opportunity.title} at ${
      opportunity.company ||
      "an organization"
    }. Discover details and analysis on Xeveza.`;

  const pageUrl =
    `https://www.xeveza.com/opportunity/${opportunity.id}`;

  return {
    title: opportunity.title,

    description,

    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      title: `${opportunity.title} | Xeveza`,
      description,
      url: pageUrl,
      siteName: "Xeveza",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: `${opportunity.title} | Xeveza`,
      description,
    },
  };
}

/* =========================
   OPPORTUNITY DETAIL PAGE
========================= */

export default async function OpportunityDetail({
  params,
}: PageProps) {
  const { id } = await params;

  const opportunity =
    await getOpportunity(id);

  if (!opportunity) {
    notFound();
  }

  return (
  <OpportunityDetailClient
    opportunity={opportunity}
  />
);
}