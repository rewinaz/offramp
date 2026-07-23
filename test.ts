// node test.ts  (Node >= 22.18 strips types natively; no compile step for tests)
const assert: typeof import("node:assert") = require("node:assert");
// aliased: block.ts is a global script, so `decide` is already a global name here
const { decide: check } = require("./block.ts") as {
  decide: (url: string, on: Record<string, boolean | undefined>) => string | null;
};

const ON = {};

assert.strictEqual(
  check("https://www.youtube.com/shorts/abc_123-X", ON),
  "https://www.youtube.com/watch?v=abc_123-X"
);
assert.strictEqual(check("https://www.youtube.com/watch?v=abc", ON), null);
assert.strictEqual(check("https://youtube.com/shortsfoo", ON), null);
assert.strictEqual(check("https://www.instagram.com/reels/", ON), "BLOCKED");
assert.strictEqual(check("https://www.instagram.com/reel/xyz/", ON), "BLOCKED");
assert.strictEqual(check("https://www.instagram.com/reelsomething", ON), null);
assert.strictEqual(check("https://www.instagram.com/someuser/", ON), null);
assert.strictEqual(check("https://www.facebook.com/reel/999", ON), "BLOCKED");
assert.strictEqual(check("https://www.facebook.com/marketplace", ON), null);

// toggled off in the popup
assert.strictEqual(check("https://www.youtube.com/shorts/abc", { youtube: false }), null);
assert.strictEqual(check("https://www.instagram.com/reels/", { instagram: false }), null);
assert.strictEqual(check("https://www.facebook.com/reel/1", { facebook: false }), null);
// one toggle off doesn't disable the others
assert.strictEqual(check("https://www.instagram.com/reels/", { youtube: false }), "BLOCKED");

console.log("ok");
