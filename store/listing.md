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

## Privacy practices tab

Every field below is required before the store will let you publish. Paste each
into its matching box.

### Single purpose description

Offramp has one purpose: to block distracting websites. It stops short-form video feeds (YouTube Shorts, Instagram Reels, Facebook Reels, TikTok) and any additional sites the user chooses to add, replacing them with a blocked page that encourages the user to do something else.

### Justification — declarativeNetRequest

Offramp's only function is blocking distracting sites, and declarativeNetRequest is the API Chrome provides to do that. It is used to block or redirect page loads for the sites the user has switched on: YouTube Shorts are redirected to the standard YouTube video player, and other blocked sites are sent to the extension's own blocked page.

Rules are evaluated by Chrome itself. The extension never sees, reads, or modifies the contents of any request or response, and it does not use the webRequest API. Static rules ship in the package; rules for user-added sites are created as dynamic rules from the user's own list.

### Justification — host permissions

Host permissions are requested for exactly four domains: youtube.com, instagram.com, tiktok.com, and facebook.com.

Chrome requires host access for declarativeNetRequest rules that use the `redirect` action. Offramp redirects on these four sites — YouTube Shorts to the normal video player, and Instagram/Facebook Reels and TikTok to the extension's blocked page — so host access for them is required for the extension to function.

No content is read from these sites. The only content script polls the page URL to catch in-page navigations that network rules cannot see (for example, clicking a Short from the YouTube home feed) and redirects when the URL matches. It does not read page contents, cookies, form data, or any user information.

Sites the user adds themselves deliberately use the `block` action rather than `redirect`, specifically so that adding a site never requires requesting access to additional hosts.

### Justification — remote code

Offramp does not use remote code. All JavaScript, HTML, and CSS is contained in the uploaded package. The extension loads no external scripts, fetches no code at runtime, and uses no eval() or equivalent. It has no runtime dependencies and makes no network requests of any kind.

### Justification — storage

The storage permission saves the user's own settings: which built-in sites are switched on, and their list of custom sites with the optional names they gave them. It is stored with chrome.storage.sync so settings persist between sessions and follow the user's Chrome profile across their devices.

No browsing history, page content, or personal information is stored. Nothing is sent anywhere — the data stays in the user's browser and their own Google account.

### Data usage certification

Tick all three:

- Does not sell or transfer user data to third parties, outside of approved use cases
- Does not use or transfer user data for purposes unrelated to the item's single purpose
- Does not use or transfer user data to determine creditworthiness or for lending purposes

Declare **no data collected** in every category. Offramp collects nothing.
