import assert from "node:assert/strict";
import { quote } from "./pricing";

const small = quote({ companies: 10, phones: 4, signatoryPhones: 1, emails: 2 });
assert.equal(small.rawOre, 10 * 10 + 4 * 30 + 40 + 2 * 40);
assert.equal(small.minimumApplied, true);
assert.equal(small.totalOre, 39900);

const large = quote({ companies: 5000, phones: 1000, signatoryPhones: 0, emails: 0 });
assert.equal(large.rawOre, 5000 * 10 + 1000 * 30);
assert.equal(large.minimumApplied, false);
assert.equal(large.totalOre, large.rawOre);

const empty = quote({ companies: 0, phones: 3, signatoryPhones: 1, emails: 1 });
assert.equal(empty.totalOre, 0);

console.log("pricing ok");
