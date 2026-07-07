# Deploying Mellow to Cloudflare Pages (free)

Mellow is a buildless static site, so there's **no build step** — Cloudflare just
serves the files. This gets you `https://mellow.pages.dev` for free, off GitHub
Pages and off Vercel.

## One-time setup

1. Create a free account at <https://dash.cloudflare.com> (no card needed).
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize GitHub and pick the `cooldude1259/my-social-media` repo.
4. Configure the build:
   - **Project name:** `mellow`  → this becomes `mellow.pages.dev`
     (if taken, try `mellow-app`; the name is the subdomain)
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`  (repo root — keeps `/app/`, `/school/`, etc.)
5. **Save and Deploy.** First deploy takes ~1 min. Done — `mellow.pages.dev` is live.

Every push to `main` auto-redeploys. No CI to maintain.

## Sub-subdomains like `app.mellow.pages.dev`

Cloudflare publishes each **git branch** to `<branch>.mellow.pages.dev`:

- `main`             → `mellow.pages.dev`
- a branch named `app` → `app.mellow.pages.dev`

So to get `app.mellow.pages.dev`, just keep a branch called `app` in sync with
what you want served there. These branch URLs are permanent (not throwaway
previews) as long as the branch exists.

## Notes

- Supabase already sends `Access-Control-Allow-Origin: *`, so the new domain
  needs no CORS changes.
- `app-manifest.json` (the custom Swift-playground pointer) is untouched and keeps
  working on whatever URL the iPad app targets.
- GitHub Pages can stay live in parallel — nothing forces you to turn it off.
- A real top-level domain (e.g. `mellow.app`) can be added later under
  **Custom domains** if you ever buy one; not required.
