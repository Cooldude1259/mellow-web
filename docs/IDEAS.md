# Mellow — Idea Board

Parking lot for future directions. Nothing here is committed or scheduled —
it's the north star / someday pile. Build the core first.

---

## Ecosystem (someday, not now)

The idea: a small family of apps that share **one account** and **one design
language** — not by cloning giants, but by doing the boring school-tool jobs in
the calm, safe, ad-free, playful *Mellow* way. "The step further" = the *feel*,
not the feature list.

**Why it's cheap for us:** we already have the two hard ingredients —
- **One Supabase project + one login** = single sign-on across anything we build.
- **The design-token system** = one look everywhere (change `--primary` once).

So each new app is just another static frontend hitting the same backend with
the same tokens.

**Candidate apps (all buildable on our stack, all youth/school-fit):**
- **Mellow** — the social core (current).
- **Mellow Boards** — calm shared pinboards/notes for classes & clubs (Padlet/Keep, but safe).
- **Mellow Rooms** — safe group chat, realtime, with the `canInteract` age rules applied.
- **Mellow Events** — club meetups / school events, tied into Areas.
- **Mellow Study** — flashcards (Quizlet-ish), leans into "school-focused".
- **Mellow Draw** — a tiny creative canvas, leans into the animator identity.

**Guardrails:** focus (nail the core first — a suite before users is the classic
trap); every app is new safety/moderation/consent surface; each must solve a
real pain, not exist "because Google has one". Treat as a *north star*, expand
into it once Mellow is genuinely loved.

---

## Experiments lab (Chrome-Experiments energy)

Useless. Cool. Shareable. Whimsy is our moat — big social can't do it. A
**"Mellow Experiments"** hub where pointless-but-delightful toys live, **opt-in /
hidden** so they never complicate the core (same pattern as more-motion / TADC).

**Ideas:**
- **Toast a Marshmallow** — hold to toast over the campfire loader; don't burn it. (Strong first pick — turns the loader into a game.)
- **Gravity** — drop every card in a heap (Google Gravity homage), then spring back.
- **Set it on fire** 🔥 — the UI burns to ash and reassembles.
- **Feed the shredder** — drop anything into the existing shredder for no reason.
- **Fling the mascot** — throw pomni/scene around with physics + bounce.
- **Ember cursor** — sparks trail the mouse.
- **Campfire o'clock** — warmth shifts with real time of day; crackling ambient toggle.
- **Secret commands** — extend the `/announce` command idea (`/barrelroll`, `/night`, Konami code).
- **Marshmallow creature generator** — random googly-eyed critters (fun avatars).

**The tie-in:** it's open source, so **contributors can add experiments** —
Chrome-Experiments model. Feeds the coding channel, gives devs a low-stakes way
to contribute, grows the whole thing.

**Guardrails:** keep off the core path (opt-in/hidden); client-side toys only
(no real user data, not exploitable); time-box so they don't eat the roadmap.

---

## Split deployments: separate apps, not one app twice (someday, not now)

Instead of `app.mellow.pages.dev` being the *same* bundle at another URL, split
out the parts that are **fundamentally different concerns** into their own
frontends on their own subdomains — one Supabase backend, one design-token set
behind all of them.

- **`auth.mellow.pages.dev`** — the sign-in / signup / onboarding surface.
  Rationale: auth churns constantly (providers, consent copy, tier logic, email
  flows). Isolating it means we can iterate hard on it without redeploying or
  destabilising the main feed, and it keeps the security-sensitive surface small.
- **`kids.mellow.pages.dev`** — a *genuinely different* kids app, not the adult
  UI with things hidden. Different layout, language, pacing, and stronger rails.
  Rationale: building the same app "into itself twice" (one codebase trying to
  be both) gets fragile fast; a purpose-built kids frontend hitting the shared
  backend (with the tier/`canInteract` rules) is cleaner and safer.

**What makes this cheap for us:** same login, same tokens, same Supabase — each
is "just another static frontend." **Guardrail:** only worth it once the core +
tier system are solid; don't fork the frontend before there's one to fork.

_(Note: the plain `app.` subdomain trick is explicitly not pursued — the value
is in separating different concerns, not relocating the same app.)_

---

## Emergency-relay layer (someday, not now)

Reach the devices official alerts *can't* — desktops, iPads, school-locked
machines can't receive AusAlert (cell broadcast is OS/modem-only; no web app,
and not even third-party native apps, can tap it). Mellow could be a *complement*
that surfaces emergency info on those devices.

**Hard caveat (non-negotiable):** never present this as authoritative or
something people *rely on* in a life emergency. Frame it as "an extra heads-up on
devices that can't get the official alert — always follow emergency services."
For a youth/school app, dressing up a best-effort relay as a safety system is a
real liability. Complementary, clearly labelled, never primary.

**Signal source — feeds, not radios.** A cell-broadcast "ground station" (SDR +
srsRAN reading LTE SIB12) is technically real but fatally *local*: an antenna
only hears alerts targeted to where it physically sits, so "one per state" gives
one-suburb coverage, not statewide. Instead poll the official **CAP (Common
Alerting Protocol)** feeds the warnings already publish (state emergency
services, BOM). Nationwide, legal, no hardware. A scheduled edge function /
pg_cron polling every minute stays on the current stack.

**Architecture (BFF / priority-lane):**
- **Client → Supabase direct for critical writes** (RLS) — the short, always-up
  path. Never touches the new server, so the server being busy can't block it.
- **Client → server → Supabase for the heavy stuff** — feed ranking on reads,
  tagging/enrichment. This is the *sheddable* lane.
- **Emergency mode:** server sheds its own lane — drop reads (safe: a dropped
  read leaves nothing broken, client just retries), let in-flight DB writes
  commit-or-rollback (transactions are atomic, so no corruption either way),
  and **defer tagging to a queue** (post still lands via direct write, just sits
  untagged until a later sweep). Then fire the warning.
- **Emergency-mode flag** lives in shared state (a `system_state` row or Redis),
  not process memory — serverless instances don't share globals.

**Fan-out:** Supabase **Realtime** (instant to open apps) + **Web Push** (reaches
closed apps, incl. installed iOS PWAs 16.4+). In-app: a full-screen takeover
(sound/vibrate/flash on allowed devices). No web app can interrupt the OS itself;
device-level interrupt (Android full-screen intent, iOS Critical Alerts — needs
Apple entitlement approval) is native-only, for the future Flutter app.

**"Drop everything" is load-shedding, not memory.** After the initial blast,
hold the incident as a small **state machine** (`active → updates → all-clear`)
and reserve a *capacity lane* (concurrency/rate budget, not a RAM %) for the
ongoing safety work until cleared:
- **ACK tracking + retries** — first push ≠ receipt; re-send to who didn't ack.
- **Replay on reconnect** — a device that opens later gets the active warning
  immediately (alert stored as live state, not fire-and-forget).
- **Updates + all-clear** — follow-ups and the cancellation that ends the mode.

Reserve the lane via a dedicated worker pool / priority queue + rate-limiting
normal routes so everyday traffic can't starve the safety lane.

**Scale reality:** at small scale one modest server does all this easily —
shedding/reservation are knobs for later. The *valuable* bits to design now are
the incident state machine, ACK tracking, and reconnect-replay; don't build a
heavy load-shedder before there's load to shed.

---

## Featurebase as the built-in support process (someday, not now)

We'll have a lot of support issues — use **Featurebase** as the actual support
backbone rather than reinventing a helpdesk. It already gives us the pieces:
feedback boards, a changelog, and (key here) a **help/knowledge base** + ticketing.

**How it plugs into Mellow:**
- **In-app widget** — Featurebase ships an embeddable widget/SDK. Drop it behind
  a "Help / Report a problem" button so users never leave the app. (We already
  reference Featurebase thinking + use Tally for feedback forms — this slots
  alongside.)
- **SSO / identity passthrough** — Featurebase supports identifying the logged-in
  user (JWT-based SSO) so tickets arrive already tied to the account, no "what's
  your email" back-and-forth. Cuts support time hugely.
- **Deflection first** — surface the **knowledge-base search** *before* the
  ticket form so common answers ("how do I change my area", "why can't I post")
  self-serve. Most volume never becomes a ticket.
- **Private by default** — as noted earlier, Featurebase can be set so users
  don't see each other's submissions (important for a youth/school context and
  for anything safety/wellbeing-related).
- **Tie into moderation/safety** — a "Report a safety concern" path should stay
  *inside* our own Reports table + admin tooling (not a public Featurebase
  board). Featurebase is for product/support issues; safeguarding stays in-house.

**Why Featurebase over rolling our own:** we're a tiny team; a hosted helpdesk +
KB + changelog + roadmap in one, on a free/cheap tier, beats building and
moderating a support system ourselves. Keep the *safety* reporting bespoke, let
Featurebase carry the ordinary "how do I / it's broken" load.

**Open questions for later:** free-tier limits vs. expected volume; whether the
KB can be seeded from our existing docs (ADMIN.md, AUTH_SETUP.md, updates.html);
age-appropriateness of the widget UI for the Kids tier (may need it hidden or
guardian-routed there).
