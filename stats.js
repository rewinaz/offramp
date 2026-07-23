// Renders the stats page from the shared tally. Helpers from stats-lib.js.

const fmt = (n) => n.toLocaleString();

function tiles(s) {
  const dayVals = Object.values(s.days);
  const best = dayVals.length ? Math.max(...dayVals) : 0;
  const active = dayVals.filter((n) => n > 0).length;
  return `
    <div class="tiles">
      <div class="tile"><div class="val">${fmt(s.total)}</div><div class="lbl">rabbit holes dodged</div></div>
      <div class="tile"><div class="val">~${statsFmtTime(s.total * STATS_MINUTES)}</div><div class="lbl">time reclaimed</div></div>
      <div class="tile"><div class="val">${fmt(best)}</div><div class="lbl">most in one day</div></div>
      <div class="tile"><div class="val">${fmt(active)}</div><div class="lbl">day${active === 1 ? "" : "s"} you stayed out</div></div>
    </div>`;
}

// Donut of which platform you tried to open, + legend with counts and share.
function sites(s) {
  const rows = Object.entries(s.sites || {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  if (!rows.length) return "";

  const sum = rows.reduce((a, [, n]) => a + n, 0);
  const R = 54, SW = 20, C = 2 * Math.PI * R;

  let acc = 0;
  const arcs = rows
    .map(([key, n]) => {
      const frac = n / sum;
      // 1px gap between slices so adjacent colours stay readable
      const len = Math.max(0, frac * C - (rows.length > 1 ? 1.5 : 0));
      const arc = `<circle cx="70" cy="70" r="${R}" fill="none"
        stroke="${SITE_COLORS[key] || SITE_COLORS.other}" stroke-width="${SW}"
        stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}"
        stroke-dashoffset="${(-acc).toFixed(2)}" />`;
      acc += frac * C;
      return arc;
    })
    .join("");

  const legend = rows
    .map(([key, n]) => {
      const pct = Math.round((n / sum) * 100);
      return `
        <div class="lrow">
          <span class="dot" style="background:${SITE_COLORS[key] || SITE_COLORS.other}"></span>
          <span class="lname">${SITE_LABELS[key] || key}</span>
          <span class="lcount">${fmt(n)}</span>
          <span class="lpct">${pct}%</span>
        </div>`;
    })
    .join("");

  return `
    <div class="chart"><h2>What you tried to open</h2>
      <div class="donut">
        <svg viewBox="0 0 140 140" role="img" aria-label="Share of blocks by platform">
          <circle cx="70" cy="70" r="${R}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="${SW}" />
          <g transform="rotate(-90 70 70)">${arcs}</g>
          <text class="ctr" x="70" y="70" text-anchor="middle" dominant-baseline="middle">${fmt(sum)}</text>
          <text class="csub" x="70" y="88" text-anchor="middle">BLOCKED</text>
        </svg>
        <div class="legend">${legend}</div>
      </div>
    </div>`;
}

function chart(s) {
  // Last 14 days, oldest → today. Drawn as SVG so bar heights are exact — flex
  // height resolution is unreliable for zero-height bars.
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: statsDayKey(d), date: d });
  }
  const counts = days.map((d) => s.days[d.key] || 0);
  const max = Math.max(1, ...counts);
  const todayKey = statsDayKey();

  const SLOT = 40, BAR = 26, PLOT = 120, TOP = 18, BOTTOM = 20;
  const W = days.length * SLOT;
  const H = TOP + PLOT + BOTTOM;

  const rects = days
    .map((d, i) => {
      const n = counts[i];
      const h = n === 0 ? 3 : Math.max(5, Math.round((n / max) * PLOT));
      const cx = i * SLOT + SLOT / 2;
      const x = cx - BAR / 2;
      const y = TOP + (PLOT - h);
      const isToday = d.key === todayKey;
      const fill = n === 0 ? "rgba(255,255,255,0.06)" : "url(#barGrad)";
      const label = isToday ? "Today" : d.date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2);
      return (
        `<rect x="${x}" y="${y}" width="${BAR}" height="${h}" rx="4" fill="${fill}" />` +
        (n ? `<text class="num" x="${cx}" y="${y - 5}" text-anchor="middle">${n}</text>` : "") +
        `<text class="lbl${isToday ? " today" : ""}" x="${cx}" y="${H - 5}" text-anchor="middle">${label}</text>`
      );
    })
    .join("");

  return `
    <div class="chart"><h2>Last 14 days</h2>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Daily blocks, last 14 days">
        <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3b82f6" /><stop offset="1" stop-color="#1d4ed8" />
        </linearGradient></defs>
        ${rects}
      </svg>
    </div>`;
}

void (async () => {
  const s = await statsGet();
  const body = document.getElementById("body");

  if (s.total === 0) {
    body.innerHTML = `
      <div class="empty">
        <div class="big">🌱</div>
        <div>No blocks yet — nothing to report.</div>
        <div style="margin-top:6px;opacity:.7">Come back after Offramp has caught a few feeds.</div>
      </div>`;
    return;
  }

  body.innerHTML =
    tiles(s) +
    sites(s) +
    chart(s) +
    `<p class="note">Counts YouTube Shorts you opened from a feed, plus Instagram
     and Facebook Reels and TikTok. Custom sites are blocked before any page
     loads, so they can't be counted here. Time reclaimed assumes ${STATS_MINUTES}
     minutes per dodged rabbit hole.</p>`;
})();
