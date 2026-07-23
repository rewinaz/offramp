// Popup toggles. Each row maps to one static rule in rules.json (hard
// navigations) and to one branch of decide() in block.ts (SPA navigations).
// Unset in storage means ON — no install-time seeding, so no service worker.

const SITES: { key: string; label: string; ruleId: number }[] = [
  { key: "youtube", label: "YouTube Shorts", ruleId: 1 },
  { key: "instagram", label: "Instagram Reels", ruleId: 2 },
  { key: "tiktok", label: "TikTok", ruleId: 3 },
  { key: "facebook", label: "Facebook Reels", ruleId: 4 },
];

function apply(site: { key: string; ruleId: number }, on: boolean): void {
  void chrome.storage.sync.set({ [site.key]: on });
  void chrome.declarativeNetRequest.updateStaticRules({
    rulesetId: "rules",
    [on ? "enableRuleIds" : "disableRuleIds"]: [site.ruleId],
  });
}

void (async () => {
  const saved = (await chrome.storage.sync.get(null)) as Settings;
  const list = document.getElementById("list")!;
  const inputs: HTMLInputElement[] = [];

  for (const site of SITES) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = saved[site.key] !== false;
    input.addEventListener("change", () => apply(site, input.checked));
    label.append(input, site.label);
    list.append(label);
    inputs.push(input);
  }

  // Power button: any on → turn all off, else turn all on.
  document.getElementById("power")!.addEventListener("click", () => {
    const next = !inputs.some((i) => i.checked);
    inputs.forEach((input, i) => {
      input.checked = next;
      apply(SITES[i], next);
    });
  });
})();
