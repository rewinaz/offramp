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

// Local tally of dodged rabbit holes (extension-page origin, persists).
// ponytail: 6 min/block is a guess — tune MINUTES to taste.
const MINUTES = 6;
const n = +(localStorage.blocks || 0) + 1;
localStorage.blocks = n;
const mins = n * MINUTES;
const time = mins < 60 ? mins + " min" : (mins / 60).toFixed(1) + " hrs";
document.getElementById("stat").textContent =
  n + " rabbit hole" + (n === 1 ? "" : "s") + " dodged · ~" + time + " reclaimed";
