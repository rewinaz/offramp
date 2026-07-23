# Store listing assets

Chrome Web Store screenshots, 1280×800 PNG (store also accepts 640×400).

| File | Shows |
|---|---|
| `01-overview.png` | Popup with built-in toggles + custom sites |
| `02-blocked-page.png` | The blocked page: breathing circle, quote, nudge, counter |
| `03-custom-sites.png` | Adding and naming custom sites |

Regenerate with the scripts in the repo history, or re-shoot after UI changes.
The popup shots run the real `dist/popup.js` against a mocked `chrome` API, so
they stay accurate — they are not redrawn mockups.

Also required by the store and already in the repo: `icons/icon128.png`.

## Promo tiles

| File | Size | Format |
|---|---|---|
| `promo-small-440x280.png` | 440×280 | 24-bit PNG, no alpha |
| `promo-marquee-1400x560.png` | 1400×560 | 24-bit PNG, no alpha |

The store rejects PNGs with an alpha channel. These render on an opaque
background and are verified `mode=RGB` before committing.

See `listing.md` for the description and every Privacy-practices field.
