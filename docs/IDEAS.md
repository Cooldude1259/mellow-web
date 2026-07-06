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
