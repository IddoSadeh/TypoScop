# Production — November 6, 2026

Owner approved publication and portfolio update on November 6.
Canonical app: https://text2typo.iddosadeh.workers.dev/
Portfolio: https://isadeh.com/ (Text2Typo View link).

## Hosting and deploy

Own Cloudflare account a8d402fb6d8371d959f03478b920157f only.
`text2typo` is a small public entry Worker (wrangler.production.jsonc), forwarding
through service binding APP to the existing `text2typo-preview` application Worker.
The internal name is historical: **text2typo-preview is now a production dependency**.
Do not delete it or assume changes there are isolated from production. Its secrets,
SQLite Durable Object identity, successful-request counters and spending ledger are
preserved. No duplicated budget, new key or zeroed accounting. The public entry
removes the preview noindex header and serves permissive robots.txt; the old
workers.dev preview address retains noindex.

Deploy application changes: `npm run deploy:preview` (this also changes production).
Deploy public entry/config changes: `npm run deploy:production`.
Public entry version: 1a07ecd6-fb26-483b-a786-ab9026334f2d.
Application version: 290da463-c01e-49fc-b0c6-7f213c2acdc8.
Production uses existing paid Workers infrastructure, no new subscription.

AI remains under the existing stricter US$2 lifetime cap (including approved tests),
plus US$10 monthly ceiling and US$5 provider-key lifetime limit. Publication did not
increase spending authorization. Any ongoing budget increase needs owner approval.
Network limits adjusted after QA exhausted issuance: 24 new identities and 12
successes per IP/day; still 3 successes/visitor, 6 attempts/visitor/hour,
12 attempts/IP/hour and40 globally/hour. Existing counters/budgets were not reset.

## Verified production

Actual Chrome320/390/1440 controls/rendering, Hebrew, modal, separate visitor state
and no overflow. Actual390/1440 PNG, OBJ, WebM and JSON downloads. Real production
AI call returned200, changed wording to HELLO and font to Optimer, rendered correctly,
remaining allowance2, reported costUS$0.01087. Initial checks hit issuance throttling;
after the shared-network adjustment the real call passed. Prior mocked verification
is superseded for this text/font request. No physical iPhone/Safari or MP4 claim.

Portfolio commit a100de6c80097093c8a8f95f6536ed07a3e590ab, GitHub Pages main/root:
build succeeded and live390/1440 link verified, all15 project rows preserved.
Ori's public homepage and seven linked internal project pages checked: no Text2Typo,
TypoScop or104.248.34.197 reference found. Homepage links to TetrisTypo, a separate
project. This is not proof about unlinked pages, social profiles or private links.
No contact with Ori and no edits to his website.

Evidence and retirement handoff:
Assistant operations/reports/text2typo-2026-11-06/production/
Assistant operations/handoffs/text2typo-production-and-retirement-2026-11-06.md

## DigitalOcean remains intact

Droplet463995615 /104.248.34.197 still active and HTTP200, approximatelyUS$4/month.
Read-only live inventory: no attached volumes/backups/snapshots/reserved IPs/load
balancers. Recheck immediately before deletion. Mac private archive SHA256 reverified:
60f84e69d06f7cba6ccf0e0134e70796b43ccf8c4138664f94507bf1eb7ef39e.
No separate backup device mounted; off-device verification remains required.
Owner must separately approve deleting the exact droplet and any billable resources
then discovered. Powering off does not stop billing. Do not delete shared account,
client infrastructure or unrelated API keys. Old saved/public IP links stop working
once the droplet is deleted; there is no permanent redirect for a released IP.
