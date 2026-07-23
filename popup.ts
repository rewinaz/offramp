// Popup toggles. Each row maps to one static rule in rules.json (hard
// navigations) and to one branch of decide() in block.ts (SPA navigations).
// Unset in storage means ON — no install-time seeding, so no service worker.

const SITES: { key: string; label: string; ruleId: number }[] = [
  { key: "youtube", label: "YouTube Shorts", ruleId: 1 },
  { key: "instagram", label: "Instagram Reels", ruleId: 2 },
  { key: "tiktok", label: "TikTok", ruleId: 3 },
  { key: "facebook", label: "Facebook Reels", ruleId: 4 },
];

void (async () => {
  const saved = (await chrome.storage.sync.get(null)) as Settings;
  const list = document.getElementById("list")!;

  for (const site of SITES) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = saved[site.key] !== false;
    input.addEventListener("change", () => {
      void chrome.storage.sync.set({ [site.key]: input.checked });
      void chrome.declarativeNetRequest.updateStaticRules({
        rulesetId: "rules",
        [input.checked ? "enableRuleIds" : "disableRuleIds"]: [site.ruleId],
      });
    });
    label.append(input, site.label);
    list.append(label);
  }
})();
