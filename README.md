# Text2Typo

An experimental browser tool for 3D typography. Designed and commissioned by
[Ori Mor / @ormitus](https://www.ormitus.com/); implementation by
[Iddo Sadeh](https://isadeh.com/). Preserve these credits and the original black
canvas / live typography identity.

The Git history starts December 15, 2024 using GPT-4o, for Ori's Shenkar 2025
experimental design project. Historical revisions also used GPT-4o-mini. The
server inspected November 6, 2026 uses GPT-4o and process-global scene state.

## Restoration preview — November 2026

Frontend: pinned, locally served Three.js 0.152.0. Cloudflare Worker serves static
assets and an explicit AI-unavailable API response. **AI is not yet connected.**
The old Express backend in `server/` is retained as historical reference, not
used by the Worker or the new npm commands. No API credential belongs in public/.

- First-visit introduction, with About to reopen it.
- Free Solid, Wire, Cloud and Orbit presets; original manual controls retained.
- Corrected framing, legacy material defaults, particle colours, projection
  texture, and projection animation cleanup.
- Repaired current-mesh OBJ and mobile export handlers.
- PNG, five-second browser video (WebM or MP4 depending on actual browser
  support), geometry OBJ, and scene-parameter JSON export.
- OBJ is for solid/wireframe geometry; particle export reports a clear limitation.
  OBJ does not package textures/materials or represent an animation.
- Reduced-motion preference disables motion in presets. Manual animation remains
  an explicit choice.

## Local development and preview

Canonical workspace: `/Users/iddo/Desktop/text2typo` (independent Git checkout).

```
npm ci
npm run dev -- --port 3031
npm run check
npm run deploy:preview
```

Wrangler uses existing Mac OAuth. Explicit owner account is
`a8d402fb6d8371d959f03478b920157f`; never use the WPM/client account. Preview Worker
name is `text2typo-preview`, no custom production route. Public assets alone are
uploaded, and preview responses include `X-Robots-Tag: noindex, nofollow`.

Read `docs/RESTORATION.md` before AI integration or migration. A preview deployment
is not production cutover and does not authorize deleting the droplet.

## Verification

With desktop Chrome installed and `npm run dev -- --port 3031` running:

```
npm run test:browser
npm run test:exports
```

Use `REVIEW_URL=https://text2typo-preview.iddosadeh.workers.dev` for live preview
checks. Artifacts go to ignored `outputs/`. These use Chromium mobile emulation,
not physical iPhone testing. Both suites passed against the November 6 deployment
(Worker version `69641517-9a0e-4d98-97cb-43469f5cfb32`).
