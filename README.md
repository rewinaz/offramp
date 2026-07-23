<img src="icons/icon128.png" width="88" alt="Offramp">

# Offramp

An exit from the endless scroll. Chrome MV3 extension, TypeScript. `tsc` only —
no bundler, no runtime deps.

- YouTube `/shorts/ID` → redirected to the normal `/watch?v=ID` player.
- Instagram Reels, Facebook Reels, all of TikTok → blocked page.
- Any site you name → blocked, via dynamic rules you manage from the popup.

Instead of a dead end, the blocked page gives you a breathing beat, a quote, a
nudge toward something better, and a tally of the rabbit holes you've dodged.

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

## Releasing

`package.json` is the single source of truth for the version; `manifest.json` is
kept in lockstep by `sync-version.mjs`, which runs automatically on `npm version`.

```
npm version patch    # or minor / major
```

That runs the tests, bumps `package.json`, rewrites `manifest.json`, then commits
and tags (`v1.2.3`). Push with `git push --follow-tags`. Then:

```
npm run package
```

which refuses to build if the two versions have drifted, and emits
`offramp-<version>.zip` for the Chrome Web Store.

Store version rules are stricter than semver: 1–4 dot-separated integers, each
0–65535, **no** pre-release suffixes (`1.0.0-beta` is rejected), and every upload
must be strictly greater than the last. `sync-version.mjs` enforces all of this
before you get as far as the upload form. Record changes in [CHANGELOG.md](CHANGELOG.md).

## Edit what's blocked

Per-site toggles live in the toolbar popup (`popup.html` / `popup.ts`), stored
in `chrome.storage.sync`. Unset means ON. The power button in the header flips
all built-in sites at once.

**Custom sites** are added from the popup with an optional name, each with its
own toggle. They become dynamic `declarativeNetRequest` block rules (ids 1000+)
— `block` rather than `redirect`, so no host permission is needed for arbitrary
domains. This catches hard navigations only; the content script isn't injected
on custom sites, so in-page SPA routing there isn't caught.

To add a **built-in** site: a rule in `rules.json`, a branch in `decide()` in
`block.ts`, and a row in `SITES` in `popup.ts` (the row's `ruleId` must match
the rule).
