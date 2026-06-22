# HealthMe A.I — echte App (Next.js + Supabase + Vercel)

Echte Version der bisherigen HTML-App. Komplett auf **Deutsch**, mit echter
Authentifizierung, automatischer Freischaltung nach dem Kauf über einen
**Digistore24-Webhook**, **Resend**-E-Mail-Versand und KI-Funktionen über
**Grok (xAI)** — der API-Key liegt sicher auf dem Server.

## Funktionen

- 🔐 **Login** mit der Kauf-E-Mail. Standard-Passwort `123456789`, das beim
  **ersten Login zwingend geändert** werden muss.
- 🛒 **Digistore24-Webhook**: Bei genehmigter Zahlung wird automatisch ein Konto
  angelegt und eine **Willkommens-E-Mail (Resend)** mit Zugangsdaten verschickt.
  Bei **Rückerstattung/Stornierung** wird der Zugang deaktiviert.
- 🧚‍♀️ **7 Bereiche**: Rezept-Generator, gespeicherte Rezepte, Nutrition-Chat,
  Community, Coach (Trainingsplan), Scan (Kalorien), Planner (7-Tage-Plan).
- 💾 Gespeicherte Inhalte liegen **pro Nutzer in Supabase** (geräteübergreifend).

## Tech-Stack

Next.js 14 (App Router, TypeScript) · TailwindCSS · Supabase (Auth + Postgres) ·
Resend · Grok/xAI · Deployment auf Vercel.

---

## 1. Lokale Einrichtung

```bash
npm install
cp .env.local.example .env.local   # Werte ausfüllen (siehe unten)
npm run dev
```

App läuft auf http://localhost:3000

## 2. Supabase einrichten

1. Projekt auf [supabase.com](https://supabase.com) erstellen.
2. **SQL-Editor** öffnen und den Inhalt von [`supabase/schema.sql`](supabase/schema.sql)
   ausführen (Tabellen, RLS, Hilfsfunktion).
3. Unter **Project Settings → API** die Werte kopieren:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (geheim!)
4. **Authentication → Providers → Email** aktivieren.
5. **Authentication → Email Templates**: optional die Vorlagen (z. B.
   „Reset Password") auf Deutsch anpassen. Für das Zurücksetzen die
   Redirect-URL `${NEXT_PUBLIC_SITE_URL}/passwort-zuruecksetzen` unter
   **URL Configuration → Redirect URLs** eintragen.

## 3. Grok / xAI

API-Key auf [console.x.ai](https://console.x.ai) erstellen → `GROK_API_KEY`.
Modell ggf. über `GROK_MODEL` (Standard `grok-3`) anpassen.

## 4. Resend (E-Mail)

1. Account auf [resend.com](https://resend.com), API-Key erstellen → `RESEND_API_KEY`.
2. **Domain verifizieren** und Absender setzen, z. B.
   `EMAIL_FROM="HealthMe A.I <noreply@deine-domain.de>"`.
   (Zum Testen geht `onboarding@resend.dev`, dann aber nur an die eigene Adresse.)

## 5. Deployment auf Vercel

1. Repository zu GitHub pushen und in Vercel importieren.
2. Alle Variablen aus `.env.local.example` unter
   **Project Settings → Environment Variables** eintragen.
3. `NEXT_PUBLIC_SITE_URL` auf die finale Vercel-URL (oder eigene Domain) setzen.
4. Deployen.

## 6. Digistore24-Webhook einrichten

1. In Digistore24: **Einstellungen → IPN / Zahlungs-Benachrichtigung** (bzw. beim
   jeweiligen Produkt) eine neue IPN-Verbindung anlegen.
2. **URL**: `https://DEINE-APP.vercel.app/api/webhooks/digistore24`
3. Eine **Passphrase** vergeben und denselben Wert als `DIGISTORE_PASSPHRASE`
   in Vercel hinterlegen (damit die Signatur geprüft wird).
4. Mit „Verbindung testen" prüfen — der Endpunkt antwortet mit `OK`.

### Welche Events macht was?

| Digistore-Event       | Aktion                                            |
| --------------------- | ------------------------------------------------- |
| `on_payment`          | Konto anlegen (falls neu) + Willkommens-E-Mail    |
| `on_rebill_resumed`   | Zugang reaktivieren                               |
| `on_refund`           | Zugang **deaktivieren**                            |
| `on_chargeback`       | Zugang **deaktivieren**                            |
| `on_rebill_cancelled` | Zugang **deaktivieren**                            |
| `on_payment_missed`   | Zugang **deaktivieren**                            |

> Diese Zuordnung steht in
> [`src/app/api/webhooks/digistore24/route.ts`](src/app/api/webhooks/digistore24/route.ts)
> (`GRANT_EVENTS` / `REVOKE_EVENTS`) und kann dort angepasst werden — z. B. wenn
> bei `on_rebill_cancelled` der Zugang bis zum bezahlten Zeitraum erhalten
> bleiben soll.

---

## Login-Ablauf (Käufer)

1. Kauf bei Digistore24 → Webhook legt Konto an → **E-Mail mit Zugangsdaten**.
2. Käufer meldet sich mit **Kauf-E-Mail** + Passwort `123456789` an.
3. **Pflicht-Passwortwechsel** → danach voller Zugriff auf die App.
4. Bei Rückerstattung → Zugang wird gesperrt (Seite „Konto deaktiviert").

## Projektstruktur (Auszug)

```
src/
  app/
    login/                     Anmeldung
    passwort-aendern/          Pflicht-Passwortwechsel (erster Login)
    passwort-vergessen/        Reset anfordern
    passwort-zuruecksetzen/    Reset abschließen
    konto-deaktiviert/         Gesperrter Zugang
    app/                       Geschützter App-Bereich (7 Tabs)
    api/
      grok/{recipe,chat,coach,scan,planner}/   KI-Routen (Key serverseitig)
      account/passwort-gesetzt/                 entfernt das Pflicht-Flag
      webhooks/digistore24/                     Kauf-Webhook
  components/                  UI + Tabs
  lib/                         supabase/, grok, email, digistore, saved
supabase/schema.sql            DB-Schema + RLS
```

## Sicherheitshinweise

- Der `SUPABASE_SERVICE_ROLE_KEY` und alle API-Keys liegen **ausschließlich**
  serverseitig (keine `NEXT_PUBLIC_`-Präfixe).
- Die KI-Aufrufe laufen über serverseitige Routen und sind nur für eingeloggte
  Nutzer erreichbar.
- Setze in Produktion unbedingt `DIGISTORE_PASSPHRASE`, damit der Webhook nur
  echte Digistore24-Aufrufe akzeptiert.
