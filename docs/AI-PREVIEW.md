# OpenRouter review preview — November 6, 2026

This is the working preview, not production cutover:
https://text2typo-preview.iddosadeh.workers.dev

## Models and renderer

Ten choices: Claude Sonnet 5.5, Opus 5.5, Haiku 5.5; GPT-6.1 Sol,
GPT-6.1 Terra, GPT-6 Luna; Gemini 4 Argon, Gemini 3.8 Flash; Mistral Large 4;
Grok 4.7. IDs and maximum accepted provider prices are in `worker/models.mjs`.
Catalog prices and structured-output support were checked through OpenRouter's
public model/endpoint APIs, then each candidate was actually called. DeepSeek
V4.1 Flash and Qwen3.8 Flash failed this integration's response checks and were
excluded. A model advertising JSON support is not sufficient verification.

Sonnet remains default. On three prompts (mint travelling wave, animated
orange torus-knot text, purple particles), Sonnet and Opus each returned three
valid renderable patches. Sonnet: 3.139–3.233 seconds, US$0.034458 total.
Opus: 4.000–6.361 seconds, US$0.069336 total. Both preserved wording; Opus gave
more particle settings but no clear benefit in this small comparison. Inputs
were 4,149–4,167 tokens; outputs 194–471 across those six calls. Reported
reasoning tokens were zero for these calls, not proof that providers did no
internal reasoning. Other models received only one compatibility prompt; this
is not a comprehensive model-quality ranking.

The model emits bounded JSON parameter changes, never executable code. Current
scene comes from each visitor's browser; no shared server scene/history. New
GPU wave/twist/ripple/float deformation is also available manually. Particles
use the existing particle animation, not these new vertex effects. New effects
respect reduced-motion and have a dedicated pause button; this button does not
pause every legacy animation. Mesh normals are not recomputed for deformation.
OBJ exports undeformed base geometry, not shader motion, textures or particles.

## Allowances and accounting

- Signed Secure/HttpOnly/SameSite cookie, 90-day visitor record; three successful
  requests TOTAL across every model. Cookie deletion plus IP changes can evade
  a unique-person limit; no anonymous scheme proves identity.
- Atomic singleton SQLite Durable Object: visitor in-flight lock, 6 attempts per
  visitor/hour, 12 per IP/hour, 40 globally/hour; 12 new cookies/IP/day and 9
  successes/IP/day. Shared networks can encounter limits. IPs are HMAC-hashed;
  daily IP records expire, visitor records expire after 90 days. No prompts or
  full scenes are persisted in the allowance ledger.
- Failures consume attempts and billed/reserved cost, but not successful-request
  allowance. Invalid/malformed input is rejected before a provider call.
- Prompt <=600 characters, HTTP body <=16KB, serialized provider request <=32KB,
  text <=48 characters; typed parameter limits, <=24 changes. max_tokens=2048,
  low reasoning effort, 45-second timeout, zero automatic retries or fallbacks.
- Pre-call reserve: 2 tokens per serialized UTF-8 byte +8192 framing allowance,
  plus twice max_tokens for output/reasoning, at pinned maximum provider prices.
  Price routing rejects more expensive endpoints. This bound assumes the provider
  honors its token/price contract; known cost above reservation disables further
  AI. Unknown/timeout costs retain the full reservation, including stale holds.
- US$10/calendar-month ceiling exists, but this preview has a STRICTER US$2
  lifetime application allowance, including US$0.139108 benchmark cost/reserves
  seeded before first use. Do not raise/reset either ledger without authorization.
- OpenRouter key has a US$5 lifetime provider limit, no reset. It was preserved;
  no credits purchased. It is an additional safeguard, not the application cap.
- Six live integration calls followed the sixteen benchmark attempts. Latest
  provider usage check: US$0.161290084. App accounting is higher because it retains
  unknown-cost failure reservations and rounds charges upward. Evidence in
  ignored outputs/evaluation/ and the Assistant report copy. A test harness typo
  after the first three live successes required a second run; all six were
  covered by the durable app cap, without resetting quotas or accounting.

At 150 requests/month, this small Sonnet sample projects about US$1.72 in model
usage, or US$3.47 for Opus. This is an estimate, not a guarantee; full visitor
state can increase input tokens (live Sonnet used 4,923). Monthly/lifetime bounds
and attempt limits remain authoritative. Existing Workers Paid plan reused;
shared infrastructure usage/overages are not a separate free-service guarantee.

## Verified and limited

Nine unit tests cover success/failure allowance, concurrency reservations,
unknown costs, issuance limits, stale holds, unsafe patches and provider parsing.
All fourteen successful benchmark responses were replayed through the actual
renderer without more model calls; no JS errors. Chrome 320/390/1440 local
checks passed scene presets, manual edits, Hebrew, intro and overflow. Live
390/1440 checks passed ten-model selector, all four motion modes and pause.
Live mobile AI switched Sonnet → Luna → Gemini: remaining 2 →1 →0; fourth
request using Haiku got HTTP429, Send disabled, manual Wire scene still worked.
Actual live desktop/mobile downloads: PNG, OBJ, five-second WebM and parameter
JSON, verified to include motion settings. No real iPhone/Safari,
MP4 or exhaustive scene-combination/accessibility claim.

Credentials: preview Worker secrets `OPENROUTER_API_KEY` and `VISITOR_SECRET`.
Mac setup key is restricted in ignored Assistant operations/private/text2typo/;
see operations/mac-service-access.md. Never print secrets, put them in public
assets, or commit them. Local dev has AI disabled unless secrets are supplied.

Original DigitalOcean droplet remains intact and billable at approximately
US$4/month. Owner preview approval, production URL/cutover verification,
separate-device backup verification and explicit resource-deletion approval
are still required. See RESTORATION.md.
