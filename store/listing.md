# Store listing copy

Paste-ready text for the Chrome Web Store "Product details" form. Keep this in
sync with the actual behavior — every claim below is verifiable in the source.

- **Category:** Well-being (alternate: Workflow & Planning)
- **Language:** English (United States)
- **Title:** Offramp *(pulled from the package)*
- **Summary:** An exit from the endless scroll. Blocks short-form video feeds and any site you name. *(pulled from the package)*

## Description

Offramp is an exit from the endless scroll.

Short-form video is built to keep you there. One Short becomes forty minutes, and you never quite decided to stay. Offramp puts a door where the trapdoor was.

WHAT IT BLOCKS

• YouTube Shorts — sent to the normal video player, so you keep the video and lose the feed
• Instagram Reels
• Facebook Reels
• TikTok
• Anything else you name — a news site, a forum, whatever pulls you in

Every entry has its own switch. Turn one off for the afternoon and back on tonight; nothing disappears from your list.

CUSTOM SITES

Paste a domain, add a name if you want one, and it's blocked. Your list reads like your life instead of a config file.

NOT JUST A WALL

Most blockers slam a door and leave you on an error page. So you open a new tab and land somewhere just as bad.

Offramp gives you somewhere to go instead. The blocked page offers a slow breathing circle to break the reflex, a short quote, one concrete thing worth doing — "write one line of the thing you keep putting off" — and a running count of the rabbit holes you've dodged.

PRIVACY

Offramp collects nothing. No account, no sign-in, no analytics, no tracking, no servers, and not a single network request. Your settings stay in your browser.

Blocking runs through Chrome's declarativeNetRequest API, which means Chrome matches the rules itself — the extension never reads the contents of your browsing. Blocked pages are stopped before they load.

No runtime dependencies. The full source is public: https://github.com/rewinaz/offramp

## Permission justifications

For the dashboard's privacy tab.

**declarativeNetRequest** — Blocks and redirects the sites the user has enabled. Rules are evaluated by Chrome itself; the extension never reads request or response contents.

**storage** — Saves the user's toggle states and custom site list via chrome.storage.sync so settings persist and follow their Chrome profile.

**Host permissions (youtube.com, instagram.com, tiktok.com, facebook.com)** — Required because these sites use `redirect` rules, which Chrome only permits with host access. User-added custom sites deliberately use `block` instead, so adding a site never requires new permissions.

**Remote code** — None. All code ships in the package.

**Data usage** — No user data is collected or transmitted.
