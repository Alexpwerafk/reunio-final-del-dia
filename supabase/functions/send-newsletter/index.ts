// Supabase Edge Function — send-newsletter
// Desplegar con: supabase functions deploy send-newsletter

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface NewsletterPayload {
  reviewId: string;
  userName: string;
  userEmail: string;
  date: string;
  dayNumber: number;
  streak: number;
  accomplishments: string;
  pending: string;
  learnings: string;
  blockers: string;
  tomorrow_priority: string;
}

function buildEmailHTML(data: NewsletterPayload): string {
  const dateFormatted = new Date(data.date + "T00:00:00").toLocaleDateString(
    "es-ES",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 24px; background-color: #0a0a0a;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 8px;">📓</div>
      <h1 style="color: #f5f5f5; font-size: 24px; margin: 0;">Reunión Final del Día</h1>
      <p style="color: #737373; font-size: 14px; margin-top: 4px;">${dateFormatted}</p>
    </div>

    <!-- Greeting -->
    <p style="color: #e5e5e5; font-size: 16px; margin-bottom: 24px;">
      Hola ${data.userName},
    </p>
    <p style="color: #737373; font-size: 14px; margin-bottom: 32px;">
      Esta fue tu reunión final del día.
    </p>

    <!-- Sections -->
    <div style="border-top: 1px solid #1f1f1f; padding-top: 24px; margin-bottom: 24px;">
      <p style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">✅ ¿Qué hice hoy?</p>
      <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6; margin: 0;">${data.accomplishments.replace(/\n/g, "<br>")}</p>
    </div>

    <div style="border-top: 1px solid #1f1f1f; padding-top: 24px; margin-bottom: 24px;">
      <p style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">⏳ ¿Qué quedó pendiente?</p>
      <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6; margin: 0;">${data.pending.replace(/\n/g, "<br>")}</p>
    </div>

    <div style="border-top: 1px solid #1f1f1f; padding-top: 24px; margin-bottom: 24px;">
      <p style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">🧠 ¿Qué aprendí hoy?</p>
      <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6; margin: 0;">${data.learnings.replace(/\n/g, "<br>")}</p>
    </div>

    <div style="border-top: 1px solid #1f1f1f; padding-top: 24px; margin-bottom: 24px;">
      <p style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">🚧 ¿Qué me bloqueó?</p>
      <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6; margin: 0;">${data.blockers.replace(/\n/g, "<br>")}</p>
    </div>

    <div style="border-top: 1px solid #1f1f1f; padding-top: 24px; margin-bottom: 32px;">
      <p style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">🎯 Prioridad absoluta para mañana</p>
      <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6; margin: 0;">${data.tomorrow_priority.replace(/\n/g, "<br>")}</p>
    </div>

    <!-- Streak -->
    <div style="text-align: center; padding: 24px 0; border-top: 1px solid #1f1f1f;">
      <p style="color: #f97316; font-size: 32px; font-weight: bold; margin: 0;">🔥 ${data.streak} días</p>
      <p style="color: #737373; font-size: 14px; margin-top: 4px;">de streak</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #1f1f1f;">
      <p style="color: #737373; font-size: 14px;">Nos vemos mañana.</p>
      <p style="color: #525252; font-size: 12px; margin-top: 16px;">— Reunión Final del Día</p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const data: NewsletterPayload = await req.json();

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const subject = `📓 Reunión Final del Día #${data.dayNumber} — ${new Date(data.date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Reunión Final <noreply@tu-dominio.com>",
        to: [data.userEmail],
        subject,
        html: buildEmailHTML(data),
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await res.json();

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
