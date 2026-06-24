import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.app_metadata?.must_change_password === true) redirect("/passwort-aendern");
  if (user.app_metadata?.onboarding_completed !== true) redirect("/onboarding");

  return <>{children}</>;
}
