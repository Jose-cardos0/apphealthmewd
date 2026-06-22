import Image from "next/image";
import LuxBackground from "@/components/LuxBackground";
import LogoutButton from "@/components/LogoutButton";

export default function KontoDeaktiviertPage() {
  return (
    <>
      <LuxBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <Image
            src="/logo.png"
            alt="HealthMe A.I"
            width={150}
            height={94}
            priority
            className="h-24 w-auto mx-auto mb-4"
          />
          <div className="bg-white rounded-3xl shadow-xl shadow-gold-100 p-8">
            <div className="w-16 h-16 mx-auto bg-gold-100 text-gold-500 rounded-2xl flex items-center justify-center mb-4 text-3xl">
              🔒
            </div>
            <h1 className="text-xl font-extrabold text-gray-800 mb-2">
              Zugang deaktiviert
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dein Zugang zu HealthMe A.I ist aktuell nicht aktiv. Das kann nach
              einer Rückerstattung oder Stornierung deiner Bestellung passieren.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              Wenn du denkst, dass das ein Fehler ist, melde dich bitte bei
              unserem Support.
            </p>
            <div className="mt-6">
              <LogoutButton className="text-sm font-medium text-gold-500 hover:underline" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
