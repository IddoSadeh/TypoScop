# Restoration record — November 6, 2026

## Preservation and deployed inspection

Original GitHub HEAD: 32fc068 (February 10, 2025). Deployed clean checkout:
dbb040ff600afad2bfd6e8acdd0ca2297a17102f. Comparing tracked files to GitHub found
only README.md and .gitignore differences; no unique public assets. The deployed
server code explicitly uses gpt-4o and shared `let currentState`.

Owner's DigitalOcean droplet: 463995615 / 104.248.34.197, root/TypoScop. Inspected
via logged-in DO Web Console. Archive includes complete checkout/dependencies,
private .env, nginx config, PM2 dump and systemd unit. Private local path:
`/Users/iddo/Desktop/assistant/operations/private/text2typo/2026-11-06/deployed.tar.gz`.
SHA256: 60f84e69d06f7cba6ccf0e0134e70796b43ccf8c4138664f94507bf1eb7ef39e.
Server/local checksums match; extraction verified. Original Git bundle alongside.
Private directory 700, files restricted; never add the archive/env/config to Git.
The server retains `/root/text2typo-migration-20261106.tar.gz`. A temporary SSH key
was restricted to `cat` of this archive; host fingerprint checked via trusted
console, then temporary authorized-key entry removed (count 0) and local key
removed. Existing SSH access and service configuration otherwise unchanged.
The original app still returns HTTP 200. No restart, deletion or paid snapshot.
Backup is on the Mac, not yet verified on a separate backup device: verify that
coverage before eventual droplet retirement.

## Current scope and verified results

Owner steered work toward reviewing/improving the existing experience before
model selection. US$2 fixed evaluation budget was proposed but **not approved**;
no paid model call has run, no provider secret retrieved, no model selected.
Publicly served original main.js matches GitHub byte-for-byte. Old AI endpoint
was not called; a key's presence is not proof of a working/billable service.

New preview is static frontend + small Cloudflare Worker, with AI explicitly
paused. Three.js and Latin fonts now self-hosted with their license notices.
Original Hebrew font retained. Renderer and controls keep state in each visitor's
browser. Future requests include that visitor's snapshot rather than rely on
server-global scene state. This does NOT yet constitute a functioning AI service
or verified AI quota enforcement.

Local Chrome: 320/390/1440, all four presets render, manual colour/depth changes,
Latin font switch, Hebrew font auto-selection, first-entry dialog, Escape close,
About reopen and no horizontal overflow. Separate browser context starts with
its own scene. Desktop/mobile emulation PNG, OBJ, WebM and parameter JSON
actually downloaded. MP4 depends on browser codec support and is not independently
verified. Real iPhone/Safari testing and a comprehensive accessibility audit have
not been performed. Existing complex combinations (e.g. every projection /
scramble / multi-copy permutation) are not exhaustively tested.
Evidence: Assistant operations/reports/text2typo-2026-11-06/. Live preview checks
and exact deployment identifiers are recorded in Assistant website handoff.

## Next phase: AI and cost controls (not implemented/enabled yet)

Do not replace the paused endpoint with an unmetered provider call. Before enabling:

1. Obtain explicit fixed test-budget approval (proposed US$2 total) and the owner's
   Anthropic credential via hidden local prompt, never chat/Git. Confirm account
   access for model IDs and use an application budget ledger for the evaluation.
2. Compare representative prompts: restrained material change; kinetic/pulse;
   particles; pattern projection; Hebrew; multi-turn preserving manual edits;
   ambiguous request; impossible request. Judge rendering as well as schema
   validity, latency and total billed tokens (including reasoning/failures).
3. Introduce strict bounded scene patch schema, server-side input validation,
   supported parameter allowlist, geometry bounds, total output/reasoning cap and
   zero automatic retries. Keep only the visitor's submitted validated scene;
   never persist a shared scene or expose provider keys to the browser.
4. Use a durable, atomic global cost ledger, reserving worst-case request cost
   BEFORE the provider call. Reconcile only verified usage; ambiguous failures
   retain reservations. Include in-flight work, all failures and evaluation calls.
   Default global AI allowance US$10/calendar month, explicit disable switch.
   Provider alerts alone do not enforce the cap. Document hard bound assumptions.
5. Three successful requests per signed anonymous visitor identity. Durable
   success counter, in-flight lock, IP-based issuance/attempt limits and global
   attempt limits. Failed requests do not consume success allowance but must
   consume attempt limits and billed cost. Cookie deletion/IP changes cannot
   prove a unique human without accounts: document practical limitations.
6. Exhaustion/refusal/timeout messages must leave manual controls, presets and
   exports available. Test concurrency, cookie resets, failed retries, forged
   identities, oversized input, exhausted budgets and actual rendered AI output.
7. Update introduction with selected model and restoration date only after actual
   integration/testing. Proposed three-request limit must not be presented as
   already operating while AI is disabled.

Initial official-doc research (no benchmark, no recommendation yet):
- https://platform.claude.com/docs/en/models/opus-5-5/overview
  claude-opus-5-5; input US$4/M, output US$20/M; adaptive thinking always on.
- https://platform.claude.com/docs/en/models/sonnet-5-5/overview
  claude-sonnet-5-5; input US$2/M, output US$10/M; adaptive thinking.
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs
  Structured JSON and strict tool use documented. Verify request compatibility
  and account availability when evaluation resumes.
Prices and IDs need reconfirmation at evaluation time. Prior 6000 input / 500 output
estimate excludes unmeasured reasoning and retries and is not a spending bound.

## Production cutover and retirement gate

Keep current droplet (~US$4/month base) until owner approves the replacement.
Choose stable production URL, verify live assets/AI/manual/export paths and
credits; then update Iddo/Ori portfolio links as authorized. Verify private backup
on a separate storage target and rollback availability. Obtain explicit approval
before deleting the droplet AND any attached billable resources identified in a
fresh read-only inventory. Powering off does not stop DigitalOcean billing.
No production cutover, new subscription or droplet deletion has occurred.
