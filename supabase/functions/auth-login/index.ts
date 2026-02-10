import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new TextDecoder().decode(hexEncode(new Uint8Array(hashBuffer)));
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username dan password wajib diisi" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email, role, employee_id, is_active, password_hash")
      .eq("username", username)
      .maybeSingle();

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: "Username atau password salah" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!user.is_active) {
      return new Response(
        JSON.stringify({ error: "Akun tidak aktif. Hubungi administrator." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const inputHash = await hashPassword(password);

    if (user.password_hash !== inputHash) {
      return new Response(
        JSON.stringify({ error: "Username atau password salah" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last_login
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Fetch employee data if linked
    let employee = null;
    if (user.employee_id) {
      const { data: emp } = await supabase
        .from("employees")
        .select("id, name, email, position, department, company_id, photo_url, employee_id")
        .eq("id", user.employee_id)
        .maybeSingle();
      employee = emp;
    }

    const sessionToken = crypto.randomUUID();

    const { password_hash: _, ...safeUser } = user;

    return new Response(
      JSON.stringify({
        user: safeUser,
        employee,
        session_token: sessionToken,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
