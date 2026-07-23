// Popup toggles. Each row maps to one static rule in rules.json (hard
// navigations) and to one branch of decide() in block.ts (SPA navigations).
// Unset in storage means ON — no install-time seeding, so no service worker.

const SITES: { key: string; label: string; ruleId: number }[] = [
  { key: "youtube", label: "YouTube Shorts", ruleId: 1 },
  { key: "instagram", label: "Instagram Reels", ruleId: 2 },
  { key: "tiktok", label: "TikTok", ruleId: 3 },
  { key: "facebook", label: "Facebook Reels", ruleId: 4 },
];

// Custom sites become dynamic block rules (ids 1000+). Block, not redirect,
// so no host permission is needed for arbitrary domains.
// ponytail: hard-navigation blocking only — the content script isn't injected
// on custom sites, so in-page SPA routing there isn't caught. Fine for "block
// this whole site"; revisit if someone needs custom in-page paths.
function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

async function syncDynamic(custom: string[]): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules: custom.map((entry, i) => ({
      id: 1000 + i,
      priority: 1,
      action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
      condition: {
        urlFilter: "||" + entry,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
      },
    })),
  });
}

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

  // Custom sites.
  const customList = document.getElementById("customList")!;
  const url = document.getElementById("url") as HTMLInputElement;
  let custom = (saved.custom as unknown as string[] | undefined) ?? [];

  function commit(): void {
    void chrome.storage.sync.set({ custom });
    void syncDynamic(custom);
    render();
  }

  function render(): void {
    customList.replaceChildren();
    custom.forEach((entry, i) => {
      const row = document.createElement("div");
      row.className = "custom-row";
      const name = document.createElement("span");
      name.textContent = entry;
      const del = document.createElement("button");
      del.textContent = "×";
      del.title = "Remove";
      del.addEventListener("click", () => {
        custom.splice(i, 1);
        commit();
      });
      row.append(name, del);
      customList.append(row);
    });
  }

  function add(): void {
    const entry = normalize(url.value);
    url.value = "";
    if (!entry || custom.includes(entry)) return;
    custom.push(entry);
    commit();
  }

  document.getElementById("addBtn")!.addEventListener("click", add);
  url.addEventListener("keydown", (e) => {
    if (e.key === "Enter") add();
  });
  render();
})();
