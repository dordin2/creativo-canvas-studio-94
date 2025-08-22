import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const emailRaw = (body as any).email?.toString().trim() || "";
    const phoneRaw = (body as any).phone?.toString().trim() || "";

    if (!emailRaw || !phoneRaw) {
      return jsonResponse({ error: "Missing email or phone" }, 400);
    }

    const email = emailRaw.toLowerCase();
    const phoneDigits = phoneRaw.replace(/\D/g, "");

    // Validate: email ends with .com and phone exactly 10 digits
    const emailValid = /^[^\s@]+@[^\s@]+\.com$/i.test(email);
    if (!emailValid) {
      return jsonResponse({ error: "Email must end with .com" }, 400);
    }
    if (phoneDigits.length !== 10) {
      return jsonResponse({ error: "Phone must have exactly 10 digits" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceKey) {
      console.error("Supabase URL or Service Role Key missing");
      return jsonResponse({ error: "Server not configured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Try to create the user; if already exists, respond OK
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: phoneDigits,
      email_confirm: true,
      user_metadata: { source: "profiles 2 trigger" },
    });

    if (createErr) {
      const alreadyExists = createErr.status === 422 || /exists|registered/i.test(createErr.message || "");
      if (!alreadyExists) {
        console.error("Failed to create user:", createErr);
        return jsonResponse({ error: createErr.message || "Failed to create user" }, 500);
      }
      console.info(`User already exists for email ${email}. Skipping creation.`);
      return jsonResponse({ status: "ok", message: "user already exists", email });
    }

    const userId = created?.user?.id;

    // Optional: upsert a basic profile
    if (userId) {
      const { error: upsertErr } = await admin
        .from("profiles")
        .upsert({ id: userId })
        .select("id")
        .maybeSingle();
      if (upsertErr) {
        console.warn("Profile upsert failed (non-fatal):", upsertErr);
      }
    }

    return jsonResponse({ status: "ok", user_id: userId, email });
  } catch (err: any) {
    console.error("Unhandled error in create-user-from-profiles2:", err);
    return jsonResponse({ error: err?.message || "Internal error" }, 500);
  }
});
