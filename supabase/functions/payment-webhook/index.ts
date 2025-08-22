import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
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
    const configuredSecret = Deno.env.get("WEBHOOK_SECRET") || "";
    if (!configuredSecret) {
      console.error("WEBHOOK_SECRET is not set in project secrets");
      return jsonResponse({ error: "Server not configured" }, 500);
    }

    const providedSecret = req.headers.get("x-webhook-secret") || req.headers.get("X-Webhook-Secret");
    if (!providedSecret || providedSecret !== configuredSecret) {
      console.warn("Invalid or missing webhook secret");
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    // Extract payer info
    const payer = (body as any).payer || {};
    const emailRaw = (payer.email ?? "").toString().trim();
    const nameRaw = (payer.name ?? "").toString().trim();
    const phoneRaw = (payer.phone ?? "").toString().trim();

    if (!emailRaw) {
      return jsonResponse({ error: "Missing payer.email" }, 400);
    }

    // Basic email validation
    const email = emailRaw.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: "Invalid email format" }, 400);
    }

    if (!phoneRaw) {
      return jsonResponse({ error: "Missing payer.phone" }, 400);
    }

    // Derive password from phone (digits preferred). Ensure >= 6 chars.
    const digits = phoneRaw.replace(/\D/g, "");
    let password = digits.length >= 6 ? digits : phoneRaw;
    if (password.length < 6) {
      return jsonResponse({ error: "Phone number too short to use as password (min 6 characters)" }, 400);
    }

    const displayName = nameRaw || email.split("@")[0];

    // Supabase Admin client (service role)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceKey) {
      console.error("Supabase URL or Service Role Key missing");
      return jsonResponse({ error: "Server not configured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Try to create the user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: displayName },
    });

    if (createErr) {
      // If user already exists, do not fail the webhook
      const alreadyExists =
        createErr.status === 422 ||
        /exists|registered/i.test(createErr.message || "");

      if (!alreadyExists) {
        console.error("Failed to create user:", createErr);
        return jsonResponse({ error: createErr.message || "Failed to create user" }, 500);
      }

      console.info(`User already exists for email ${email}. Skipping creation.`);
      return jsonResponse({ status: "ok", message: "user already exists", email });
    }

    const userId = created?.user?.id;

    // Upsert profile (optional, best-effort)
    if (userId) {
      const { error: upsertErr } = await admin
        .from("profiles")
        .upsert({ id: userId, display_name: displayName })
        .select("id")
        .single();
      if (upsertErr) {
        console.warn("Profile upsert failed (non-fatal):", upsertErr);
      }
    }

    return jsonResponse({ status: "ok", user_id: userId, email });
  } catch (err: any) {
    console.error("Unhandled error in payment-webhook:", err);
    return jsonResponse({ error: err?.message || "Internal error" }, 500);
  }
});
