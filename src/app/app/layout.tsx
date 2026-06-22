import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LuxBackground from "@/components/LuxBackground";
import LogoutButton from "@/components/LogoutButton";

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

  return (
    <>
      <LuxBackground />
      <div className="relative z-10 min-h-screen">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gold-100">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <Image src="/logo.png" alt="HealthMe A.I" width={64} height={40} className="h-10 w-auto" />
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-xs text-gray-400 truncate max-w-[180px]">
                {user.email}
              </span>
              <LogoutButton className="text-sm font-medium text-gray-500 hover:text-gold-500 transition flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Abmelden
              </LogoutButton>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
      </div>
    </>
  );
}
