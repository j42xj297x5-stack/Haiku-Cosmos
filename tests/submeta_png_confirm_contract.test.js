const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.resolve(__dirname, "..", "hc.submeta_png.js"), "utf8");

assert.match(source, /image\.classList\.add\("submeta-png-action", "submeta-png-confirm", "is-inactive"\)/);
assert.match(source, /image\.addEventListener\("click", activateConfirm\)/);
assert.match(source, /SubMetaPanels\?\.getConfirmButtonState\?\.\(\) !== "ready"/);
assert.match(source, /SubMetaPanels\.confirmPendingAssignment\?\.\(\) === true/);
assert.match(source, /\.submeta-png-confirm\.is-ready:hover/);
assert.match(source, /Math\.max\(320,/);
assert.match(source, /clearPendingAssignment\?\.\(\{ reason: "submeta-closed", render: false \}\)/);
assert.match(source, /aria-disabled/);

console.log("submeta_png_confirm_contract.test.js: OK");
