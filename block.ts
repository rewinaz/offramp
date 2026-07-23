// Catches in-page (SPA) navigations that declarativeNetRequest never sees,
// e.g. clicking a Short from the YouTube home feed. Hard navigations are
// handled by rules.json before any bytes load.
//
// ponytail: no imports/exports — MV3 content scripts aren't ES modules, so this
// stays a plain global script and tsc emits it as-is (no bundler). The
// module.exports guard is only so test.ts can require it.

type Settings = Record<string, boolean | undefined>;

function decide(url: string, on: Settings): string | null {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, "");
  const path = u.pathname;

  if (host.endsWith("youtube.com") && on.youtube !== false) {
    const m = path.match(/^\/shorts\/([\w-]+)/);
    return m ? "https://www.youtube.com/watch?v=" + m[1] : null;
  }
  if (host.endsWith("instagram.com") && on.instagram !== false && /^\/reels?(\/|$)/.test(path))
    return "BLOCKED";
  if (host.endsWith("facebook.com") && on.facebook !== false && /^\/reels?(\/|$)/.test(path))
    return "BLOCKED";
  return null;
}

if (typeof module !== "undefined") module.exports = { decide };

if (typeof chrome !== "undefined" && chrome.runtime) {
  let settings: Settings = {};
  void chrome.storage.sync.get(null).then((s) => (settings = s));
  chrome.storage.sync.onChanged.addListener((changes) => {
    for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue as boolean;
  });

  let last = "";
  // ponytail: 400ms poll, no history.pushState patching or navigation API.
  // Swap for the navigation API if the redirect ever feels laggy.
  setInterval(() => {
    if (location.href === last) return;
    last = location.href;
    const target = decide(location.href, settings);
    if (target) location.replace(target === "BLOCKED" ? chrome.runtime.getURL("blocked.html") : target);
  }, 400);
}
