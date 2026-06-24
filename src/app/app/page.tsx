import { createClient } from "@/lib/supabase/server";
import AppClient from "@/components/AppClient";
import type { Profile } from "@/lib/types";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  return <AppClient profile={(profile as Profile) ?? null} />;
}
