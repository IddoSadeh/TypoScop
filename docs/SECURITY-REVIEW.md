# Focused security review and creative text update — November 6, 2026

This is a scoped dependency/source/exposure review, not a penetration test or a
claim of zero vulnerabilities. Production app version d2fec6fb-20b7-49dc-8226-1a00a1dec37f.

## Replacement

`npm audit` initially reported six affected packages: five high and one low,
all in local development/deployment tooling (Wrangler/miniflare/esbuild/sharp/
undici/ws). They are not Node runtime dependencies of the deployed Cloudflare
Worker. Upgraded project-local Wrangler4.92.0 to4.158.0 and regenerated lockfile;
full npm audit now reports zero known vulnerabilities. New Wrangler local dev
and actual deployment succeeded. No automatic broad application framework upgrade.

Three.js0.152.0 is vendored, so npm audit alone does not cover it. Separately queried
npm security advisory bulk API for that exact version: no matching advisories
returned. This is database coverage, not proof all defects are known or fixed.

Source checks: keys remain server-side, no private config files in public assets,
no matching credential-shaped literals in tracked source; user/model chat output
uses textContent. Model emits validated bounded parameter patches, not executable
code. Same-origin POST, signed Secure/HttpOnly/SameSite visitor cookies, rate limits,
atomic cost reservations and per-visitor counters remain. These are practical
controls, not a claim anonymous abuse is impossible. No prompt or full scene stored
in quota ledger. Nine safety tests passed.

Live /.env, /.dev.vars, /.git/config, /server/server.js, /worker/index.js all404.
POST without signed visitor rejected403 before any provider call. No secrets or
backend source exposed in those checks. No exhaustive secret-history scan, active
penetration test, old-host compromise investigation or account-permission audit.

## Legacy DigitalOcean server — still needs retirement

The preserved deployed package-lock audit (temporary manifest copy, omit-dev)
reports six affected production packages: two critical (form-data, proxy-addr),
three high (body-parser, express, path-to-regexp), one moderate (qs). These are
advisory matches, not proof the specific exploit paths are reachable. Server
package installation was not freshly inspected or changed in this review.

Last verified OS Ubuntu24.10 is unsupported since July10,2025:
https://lists.ubuntu.com/archives/ubuntu-security-announce/2025-July/009561.html
Previous Node patch does not resolve unsupported OS or old dependency issues.
Do not describe that server as secure or vulnerability-free. Prioritize existing
retirement plan: verified separate-device backup and explicit deletion approval.
Droplet463995615 has not been deleted, stopped or reconfigured here.

## Creative wording/typeface

Removed instructions to preserve wording/font by default for broad briefs.
AI now chooses brief-specific text and a matching bundled typeface for themes,
moods or redesign requests; narrow adjustments preserve unrelated settings and
explicit quoted/keep-text/keep-font instructions take priority. No arbitrary fonts
or executable model code added; same limits and budget.

Fixed Hebrew→Latin fallback and dropdown synchronization, and ignored stale async
font loads so older renders cannot replace the newest request. Local320/390/1440
controls passed; explicit Hebrew→HELLO test selects and displays Helvetiker.

Real production Sonnet prompt “Make this feel like a Victorian poetry book cover
about the sea. Surprise me.” returned200 and rendered “Songs of the Sea” in Gentilis
with changed palette/motion, costUS$0.015442, remaining2. A subsequent preservation
check returned429 from existing network throttling; do not claim that second live
check passed. No counters/budget limits reset or increased. Earlier explicit
HELLO/Optimer live request remains verified. Evidence in Assistant operations/
reports/text2typo-2026-11-06/security/ and ignored project outputs/security/.
