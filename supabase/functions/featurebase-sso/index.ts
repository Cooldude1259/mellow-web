// Featurebase web-portal SSO. The browser SSO page (app/sso/featurebase.html)
// holds the Supabase session, so it calls us with the user's access token + the
// `return_to` Featurebase handed it. We verify the user, mint a Featurebase JWT
// (HS256, signed with the secret that never leaves the server), and hand back
// the final redirect URL the page should send the browser to.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.4/mod.ts";

const SCHEMA = "social-media-public";
const FEATUREBASE_ORG = "mellow-app"; // -> https://mellow-app.featurebase.app
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const secret = Deno.env.get("FEATUREBASE_SSO_SECRET");
  if (!secret) return json({ error: "sso not configured" }, 500);

  // Identify the caller from their Supabase session.
  const authHeader = req.headers.get("Authorization") || "";
  const asUser = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: u } = await asUser.auth.getUser();
  const user = u?.user;
  if (!user) return json({ error: "unauthorized" }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const returnTo = typeof body?.return_to === "string" ? body.return_to : "";

  // Prefer the public handle (never a real name); fall back to the email local part.
  let name = "";
  try {
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { db: { schema: SCHEMA } });
    const { data: prof } = await admin.from("Users").select("Name").eq("user_id", user.id).maybeSingle();
    name = prof?.Name || "";
  } catch { /* handle stays empty */ }
  const email = user.email || "";
  if (!name) name = email ? email.split("@")[0] : "Mellow user";

  // Mint the Featurebase JWT (HS256). Claims per Featurebase SSO spec.
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"],
  );
  const jwt = await create(
    { alg: "HS256", typ: "JWT" },
    { userId: user.id, email, name, iat: getNumericDate(0), exp: getNumericDate(60 * 5) },
    key,
  );

  const redirect = new URL(`https://${FEATUREBASE_ORG}.featurebase.app/api/v1/auth/access/jwt`);
  redirect.searchParams.set("jwt", jwt);
  if (returnTo) redirect.searchParams.set("return_to", returnTo);

  return json({ redirect: redirect.toString() });
});
