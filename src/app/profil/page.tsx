import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileEdit from "@/components/ProfileEdit";
import type { Profile } from "@/lib/types";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return <ProfileEdit profile={(profile as Profile) ?? null} />;
}
