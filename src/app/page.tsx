import HomeClient from "@/components/HomeClient";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const {
    data: opportunities,
    error,
  } = await supabase
    .from("opportunities")
    .select("*")
    .eq("status", "active")
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Supabase error:",
      error
    );
  }

  const items =
    opportunities ?? [];

  const today =
    new Date();

  const addedToday =
    items.filter((item) => {
      if (!item.discovered_at) {
        return false;
      }

      const discovered =
        new Date(
          item.discovered_at
        );

      return (
        discovered.getFullYear() ===
          today.getFullYear() &&
        discovered.getMonth() ===
          today.getMonth() &&
        discovered.getDate() ===
          today.getDate()
      );
    }).length;

  const sourcesScanned =
    new Set(
      items
        .map(
          (item) =>
            item.source
        )
        .filter(Boolean)
    ).size;

  return (
    <HomeClient
      items={items}
      addedToday={addedToday}
      sourcesScanned={
        sourcesScanned
      }
    />
  );
}