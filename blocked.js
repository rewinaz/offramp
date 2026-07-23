const HEADS = ["Nope.", "Not today.", "Touch grass.", "Look up.", "Reclaim it."];
const SUBS = [
  "That itch you felt? It'll pass.",
  "The feed will survive without you.",
  "Your future self says thanks.",
  "Nothing new down there anyway.",
];
// Short, attributed aphorisms.
const QUOTES = [
  ["The best time to plant a tree was 20 years ago. The second best is now.", "Proverb"],
  ["Amateurs sit and wait for inspiration; the rest of us just get up and work.", "Stephen King"],
  ["It always seems impossible until it's done.", "Nelson Mandela"],
  ["The way to get started is to quit talking and begin doing.", "Walt Disney"],
  ["You do not rise to your goals; you fall to your systems.", "James Clear"],
  ["Well done is better than well said.", "Benjamin Franklin"],
];
const NUDGES = [
  "Instead: write one line of the thing you keep putting off.",
  "Instead: stand up, stretch, get a glass of water.",
  "Instead: step outside for two minutes.",
  "Instead: open your to-do list and knock out the smallest item.",
  "Instead: message someone you've been meaning to reach.",
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

document.getElementById("head").textContent = pick(HEADS);
document.getElementById("sub").textContent = pick(SUBS);
const q = pick(QUOTES);
document.getElementById("quote").innerHTML = "“" + q[0] + "”<cite>— " + q[1] + "</cite>";
document.getElementById("nudge").textContent = pick(NUDGES);

// Record this block, then show the running tally as a link to the stats page.
// Helpers come from stats-lib.js, loaded before this script.
void (async () => {
  // One-time migration of the old per-page localStorage counter.
  const legacy = +localStorage.blocks || 0;
  if (legacy) {
    const s = await statsGet();
    if (!s.migrated) {
      s.total += legacy;
      s.migrated = true;
      await chrome.storage.local.set({ stats: s });
    }
    delete localStorage.blocks;
  }

  // The blocking rule passes the source site as ?s= (see rules.json / block.ts).
  const site = new URLSearchParams(location.search).get("s") || "other";
  const s = await statsBump(site);
  const el = document.getElementById("stat");
  el.textContent =
    s.total + " rabbit hole" + (s.total === 1 ? "" : "s") +
    " dodged · ~" + statsFmtTime(s.total * STATS_MINUTES) + " reclaimed";
  el.classList.add("link");
  el.title = "See your stats";
  el.addEventListener("click", () => (location.href = chrome.runtime.getURL("stats.html")));
})();
