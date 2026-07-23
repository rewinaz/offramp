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

type Custom = { url: string; on: boolean; name?: string };

async function syncDynamic(custom: Custom[]): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules: custom
      .filter((c) => c.on)
      .map((c, i) => ({
        id: 1000 + i,
        priority: 1,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          urlFilter: "||" + c.url,
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

// Extension-page URLs aren't known until runtime, so set the stats link here.
(document.getElementById("statsLink") as HTMLAnchorElement).href =
  chrome.runtime.getURL("stats.html");

// Running total in the footer, so the stats link has something to promise.
void chrome.storage.local.get("stats").then(({ stats }) => {
  const total = (stats as { total?: number } | undefined)?.total ?? 0;
  const el = document.getElementById("count")!;
  if (!total) return; // keep the tagline until there's something to show
  el.classList.add("has");
  el.innerHTML = `<b>${total.toLocaleString()}</b> dodged`;
});

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
  const name = document.getElementById("name") as HTMLInputElement;
  // Older versions stored plain strings; migrate them to {url, on}.
  const raw = (saved.custom as unknown as (string | Custom)[] | undefined) ?? [];
  const custom: Custom[] = raw.map((c) => (typeof c === "string" ? { url: c, on: true } : c));

  function save(): void {
    void chrome.storage.sync.set({ custom });
    void syncDynamic(custom);
  }

  function render(): void {
    customList.replaceChildren();
    custom.forEach((entry, i) => {
      const row = document.createElement("div");
      row.className = "custom-row";

      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.checked = entry.on;
      toggle.addEventListener("change", () => {
        entry.on = toggle.checked;
        save();
      });

      // Named entries show the name on top with the url beneath; unnamed
      // entries just show the url.
      const label = document.createElement("div");
      label.className = "label";
      label.title = entry.url;
      const title = document.createElement("span");
      title.textContent = entry.name || entry.url;
      label.append(title);
      if (entry.name) {
        const host = document.createElement("span");
        host.className = "host";
        host.textContent = entry.url;
        label.append(host);
      }

      const del = document.createElement("button");
      del.textContent = "×";
      del.title = "Remove";
      del.addEventListener("click", () => {
        custom.splice(i, 1);
        save();
        render();
      });

      row.append(toggle, label, del);
      customList.append(row);
    });
  }

  function add(): void {
    const entry = normalize(url.value);
    const label = name.value.trim();
    url.value = "";
    name.value = "";
    if (!entry || custom.some((c) => c.url === entry)) return;
    custom.push({ url: entry, on: true, ...(label && { name: label }) });
    save();
    render();
  }

  document.getElementById("addBtn")!.addEventListener("click", add);
  for (const field of [url, name])
    field.addEventListener("keydown", (e) => {
      if (e.key === "Enter") add();
    });
  render();
})();
