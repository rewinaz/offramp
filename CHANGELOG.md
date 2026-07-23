# Changelog

All notable changes to Offramp are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Versions are Chrome Web Store compatible: 1–4 dot-separated integers, no
pre-release suffixes. The store also requires each uploaded version to be
strictly greater than the last, so numbers only ever go up.

## [Unreleased]

### Added

- Stats page (`stats.html`), opened from the popup footer or the blocked page.
  Shows total blocks, estimated time reclaimed, best day, days active, a per-site
  breakdown, and a 14-day bar chart. Backed by a shared tally in
  `chrome.storage.local`; blocks are tagged by site via a `?s=` redirect param.

## [1.0.0] — 2026-07-23

First release.

### Added

- Built-in blocking for YouTube Shorts, Instagram Reels, Facebook Reels, and
  TikTok. YouTube Shorts redirect to the normal `/watch?v=ID` player; the rest
  go to the blocked page.
- Custom sites: block any domain you name, each with an optional label and its
  own toggle. Backed by dynamic `declarativeNetRequest` rules using `block`, so
  no extra host permissions are needed.
- Popup with per-site toggles and a power button that flips every built-in site
  at once. Settings persist via `chrome.storage.sync`.
- Blocked page with a breathing animation, a rotating quote, a nudge toward
  something better, and a local tally of rabbit holes dodged.
- SPA navigation handling for built-in sites via a `document_start` content
  script, catching in-page routing that network rules never see.

[Unreleased]: https://github.com/rewinaz/offramp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rewinaz/offramp/releases/tag/v1.0.0
