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

  // Records a block into the shared tally (chrome.storage.local "stats").
  // Only YouTube Shorts are recorded here — they redirect to the watch page, so
  // they never hit blocked.html. IG/FB Reels and TikTok land on blocked.html,
  // which counts them itself; recording here too would double-count. Custom
  // sites use the `block` action (no page loads), so they can't be counted.
  function recordBlock(site: string): Promise<void> {
    return chrome.storage.local.get("stats").then(({ stats }) => {
      const s: { total: number; days: Record<string, number>; sites: Record<string, number> } =
        stats ?? { total: 0, days: {}, sites: {} };
      s.sites = s.sites || {};
      s.total++;
      const day = new Date().toLocaleDateString("en-CA");
      s.days[day] = (s.days[day] || 0) + 1;
      s.sites[site] = (s.sites[site] || 0) + 1;
      return chrome.storage.local.set({ stats: s });
    });
  }

  const siteOf = (host: string): string => {
    host = host.replace(/^www\./, "");
    if (host.endsWith("instagram.com")) return "instagram";
    if (host.endsWith("facebook.com")) return "facebook";
    if (host.endsWith("tiktok.com")) return "tiktok";
    return "other";
  };

  let last = "";
  // ponytail: 400ms poll, no history.pushState patching or navigation API.
  // Swap for the navigation API if the redirect ever feels laggy.
  setInterval(() => {
    if (location.href === last) return;
    last = location.href;
    const target = decide(location.href, settings);
    if (!target) return;
    if (target === "BLOCKED") {
      // IG/FB Reels via in-page nav. blocked.html records it, tagged by site.
      const s = siteOf(location.hostname);
      location.replace(chrome.runtime.getURL("blocked.html") + "?s=" + s);
    } else {
      // YouTube Short → watch page, which never hits blocked.html, so record
      // it here. Persist before navigating away.
      void recordBlock("youtube").finally(() => location.replace(target));
    }
  }, 400);
}
