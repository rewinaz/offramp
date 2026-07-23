# Shorts Blocker

Chrome MV3 extension, TypeScript. `tsc` only — no bundler, no runtime deps.

- YouTube `/shorts/ID` → redirected to the normal `/watch?v=ID` player.
- Instagram Reels, Facebook Reels, all of TikTok → blocked page.

## Build

```
npm install && npm run build
```

Then `chrome://extensions` → Developer mode → **Load unpacked** → this folder
(the manifest loads `dist/block.js`).

## Test

```
npm test
```

Node runs `test.ts` directly (native type stripping) — no build needed.

## Edit what's blocked

Per-site toggles live in the toolbar popup (`popup.html` / `popup.ts`), stored
in `chrome.storage.sync`. Unset means ON.

To add a site: a rule in `rules.json`, a branch in `decide()` in `block.ts`, and
a row in `SITES` in `popup.ts` (the row's `ruleId` must match the rule).
