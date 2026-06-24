import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  const meta = user.app_metadata || {};
  if (meta.active === false) redirect("/konto-deaktiviert");
  if (meta.must_change_password === true) redirect("/passwort-aendern");
  if (meta.onboarding_completed !== true) redirect("/onboarding");
  redirect("/app");
}
