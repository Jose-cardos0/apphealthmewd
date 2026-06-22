import { Resend } from "resend";

/**
 * Versendet die Willkommens-E-Mail (auf Deutsch) an einen neuen Käufer.
 * Enthält die Zugangsdaten und einen Login-Link.
 */
export async function sendWelcomeEmail(opts: {
  to: string;
  loginUrl: string;
  password: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "HealthMe A.I <onboarding@resend.dev>";
  if (!apiKey) {
    throw new Error("RESEND_API_KEY ist nicht konfiguriert.");
  }

  const resend = new Resend(apiKey);
  const { to, loginUrl, password } = opts;

  const html = welcomeHtml({ to, loginUrl, password });
  const text = welcomeText({ to, loginUrl, password });

  return resend.emails.send({
    from,
    to,
    subject: "🧚‍♀️ Willkommen bei HealthMe A.I – deine Zugangsdaten",
    html,
    text,
  });
}

function welcomeText({ to, loginUrl, password }: { to: string; loginUrl: string; password: string }) {
  return `Willkommen bei HealthMe A.I!

Vielen Dank für deinen Kauf. Dein Zugang ist ab sofort freigeschaltet.

Deine Zugangsdaten:
  E-Mail:   ${to}
  Passwort: ${password}

Melde dich hier an: ${loginUrl}

WICHTIG: Aus Sicherheitsgründen wirst du beim ersten Login aufgefordert,
dein Passwort zu ändern.

Viel Freude mit deiner kleinen Küchenfee!
Dein HealthMe A.I Team`;
}

function welcomeHtml({ to, loginUrl, password }: { to: string; loginUrl: string; password: string }) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fdf6e3;font-family:'Segoe UI',Arial,sans-serif;color:#374151;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(200,147,10,0.12);">
      <div style="background:linear-gradient(135deg,#e6b325,#c8930a);padding:32px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">HealthMe A.I 🧚‍♀️</h1>
        <p style="margin:8px 0 0;color:#fff7e0;font-size:14px;">Deine kleine Küchenfee</p>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#1f2937;">Willkommen an Bord! 🎉</h2>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4b5563;">
          Vielen Dank für deinen Kauf. Dein Zugang zu HealthMe A.I ist ab sofort freigeschaltet.
          Hier sind deine persönlichen Zugangsdaten:
        </p>

        <div style="background:#fffdf4;border:1px solid #fbe8a8;border-radius:16px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">
            <strong style="color:#c8930a;">E-Mail:</strong><br>
            <span style="font-size:15px;color:#1f2937;">${escapeHtml(to)}</span>
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;">
            <strong style="color:#c8930a;">Passwort:</strong><br>
            <span style="font-size:18px;font-weight:700;letter-spacing:1px;color:#1f2937;">${escapeHtml(password)}</span>
          </p>
        </div>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#e6b325;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;">
            Jetzt anmelden →
          </a>
        </div>

        <div style="background:#fef3f2;border:1px solid #fecaca;border-radius:12px;padding:14px 16px;margin-bottom:8px;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:#b91c1c;">
            🔒 <strong>Wichtig:</strong> Aus Sicherheitsgründen musst du beim ersten Login
            dein Passwort ändern, um die App nutzen zu können.
          </p>
        </div>
      </div>
      <div style="padding:20px 32px;background:#fffdf4;border-top:1px solid #fdf4d9;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          Diese E-Mail wurde automatisch nach deinem Kauf versendet.<br>
          © HealthMe A.I
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
