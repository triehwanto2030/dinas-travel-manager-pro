import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to_email, subject, message, link, type } = await req.json();

    if (!to_email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to_email, subject, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine color based on type
    const typeColors: Record<string, string> = {
      approval: "#16a34a",
      rejection: "#dc2626",
      info: "#2563eb",
    };
    const accentColor = typeColors[type] || "#2563eb";

    const typeLabels: Record<string, string> = {
      approval: "Disetujui",
      rejection: "Ditolak",
      info: "Menunggu Tindakan",
    };
    const statusLabel = typeLabels[type] || "Notifikasi";

    // Build HTML email
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:${accentColor};padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">
                PJM - Perjalanan Dinas Manager
              </h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">
                ${statusLabel}
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">${subject}</h2>
              <p style="margin:0 0 24px;color:#4b5563;font-size:14px;line-height:1.6;">
                ${message}
              </p>
              ${link ? `
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:8px;background-color:${accentColor};">
                    <a href="${link}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">
                      Buka Halaman Approval →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                Email ini dikirim otomatis oleh sistem PJM. Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Try to send email using Supabase's built-in email or log
    // Check if we have SMTP or email configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use Supabase admin client to send email via auth.admin
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Log the notification for tracking
    console.log(`📧 Email notification to: ${to_email}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Link: ${link}`);

    // For now, we store the email attempt. 
    // Actual email delivery requires email domain configuration.
    // The in-app notification is already created by the client.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification processed",
        email_sent: false,
        note: "Email delivery requires email domain configuration" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
