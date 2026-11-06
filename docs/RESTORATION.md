# Restoration record — November 6, 2026

Update: owner-approved production publication is complete. See [PRODUCTION.md](PRODUCTION.md).
Backup/deletion gates below remain outstanding.

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

## Current restoration state

AI restoration is now implemented in the review preview. The owner subsequently
approved US$2 maximum testing and supplied a dedicated OpenRouter key via hidden
Terminal input. Ten models passed compatibility checks. Current implementation,
cost accounting, tests and limitations: [AI preview](AI-PREVIEW.md).

The preserved original deployment and retirement gate below remain unchanged.
The old OpenAI endpoint/key has not been used or modified.

## Production cutover and retirement gate

Keep current droplet (~US$4/month base) until owner approves the replacement.
Choose stable production URL, verify live assets/AI/manual/export paths and
credits; then update Iddo/Ori portfolio links as authorized. Verify private backup
on a separate storage target and rollback availability. Obtain explicit approval
before deleting the droplet AND any attached billable resources identified in a
fresh read-only inventory. Powering off does not stop DigitalOcean billing.
Production publication is complete; no new subscription or droplet deletion occurred.
