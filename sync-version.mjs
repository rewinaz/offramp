// package.json is the single source of truth for the version; the Chrome Web
// Store reads manifest.json. This keeps them in lockstep and enforces the
// store's format, which is stricter than semver.
//
//   node sync-version.mjs           write package.json's version into manifest
//   node sync-version.mjs --check   fail if they disagree (used by `npm run package`)

import { readFileSync, writeFileSync } from "node:fs";

const check = process.argv.includes("--check");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const raw = readFileSync("manifest.json", "utf8");
const manifest = JSON.parse(raw);

// Store rule: 1-4 dot-separated integers, each 0-65535, no leading zeros, no
// suffixes. `1.0.0-beta.1` is valid semver but the store rejects it outright.
const parts = pkg.version.split(".");
const valid =
  /^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){0,3}$/.test(pkg.version) &&
  parts.every((n) => Number(n) <= 65535);

if (!valid) {
  console.error(
    `✗ "${pkg.version}" is not a valid Chrome Web Store version.\n` +
      `  Needs 1-4 dot-separated integers, each 0-65535 (e.g. 1.2.0).\n` +
      `  Pre-release suffixes like -beta are rejected by the store.`
  );
  process.exit(1);
}

if (check) {
  if (manifest.version !== pkg.version) {
    console.error(
      `✗ version drift: package.json is ${pkg.version}, manifest.json is ${manifest.version}\n` +
        `  Run: npm run sync-version`
    );
    process.exit(1);
  }
  console.log(`✓ version ${pkg.version} in sync`);
} else {
  // Rewrite only the version line so the manifest's formatting survives.
  // Anchored to line start so it can't touch "manifest_version".
  const next = raw.replace(/^(\s*"version"\s*:\s*)"[^"]*"/m, `$1"${pkg.version}"`);
  if (next === raw && manifest.version !== pkg.version) {
    console.error("✗ could not find a version field to rewrite in manifest.json");
    process.exit(1);
  }
  writeFileSync("manifest.json", next);
  console.log(`✓ manifest.json set to ${pkg.version}`);
}
