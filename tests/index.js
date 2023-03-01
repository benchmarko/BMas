import assert from "assert";
import { bench00, bench01, bench02, bench03, bench04, bench05 } from "../dist/debug.js";

const n = 1000000;

assert.strictEqual(bench00(1, n, ((n / 2) * (n + 1)) % 65536), 0);
assert.strictEqual(bench01(1, n, ((n + 1) / 2) | 0), 0);
assert.strictEqual(bench02(1, n, ((n + 1) / 2) | 0), 0);
assert.strictEqual(bench03(1, n, 41538), 0);
assert.strictEqual(bench04(1, n, 1227283347), 0);
assert.strictEqual(bench05(1, n, 27200), 0);

console.log("ok");
