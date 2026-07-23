// Shared block tally, persisted in chrome.storage.local under "stats":
//   { total: number, days: { "YYYY-MM-DD": count }, sites: { <key>: count } }
// Loaded by blocked.html (which records) and stats.html (which displays).
// block.ts inlines its own copy — it's a content script in a separate world
// and can't share this file without another manifest entry.
//
// ponytail: 6 min/block is a guess at a short-video rabbit hole avoided.
// It's the one calibration knob — tune STATS_MINUTES to taste.
const STATS_MINUTES = 6;

const SITE_LABELS = {
  youtube: "YouTube Shorts",
  instagram: "Instagram Reels",
  facebook: "Facebook Reels",
  tiktok: "TikTok",
  other: "Other",
};

const statsDayKey = (d = new Date()) => d.toLocaleDateString("en-CA"); // local YYYY-MM-DD

async function statsGet() {
  const { stats } = await chrome.storage.local.get("stats");
  const s = stats || { total: 0, days: {}, sites: {} };
  s.sites = s.sites || {}; // migrate tallies saved before per-site tracking
  return s;
}

async function statsBump(site) {
  const s = await statsGet();
  s.total++;
  const k = statsDayKey();
  s.days[k] = (s.days[k] || 0) + 1;
  s.sites[site] = (s.sites[site] || 0) + 1;
  await chrome.storage.local.set({ stats: s });
  return s;
}

function statsFmtTime(mins) {
  if (mins < 60) return mins + " min";
  const h = mins / 60;
  return (h < 10 ? h.toFixed(1) : Math.round(h)) + " hrs";
}
