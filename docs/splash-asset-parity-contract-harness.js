const assert = require('assert');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');

const repo = process.env.NOVASOCIAL_REPO || path.resolve(__dirname, "..");
const branch2 = fs.readFileSync(`${repo}/index.html`, 'utf8');
const main = cp.execFileSync('git', ['show', 'refs/remotes/origin/main:index.html'], {cwd: repo, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
const pattern = /<img[^>]+class=["']splash-icon["'][^>]+src=["']data:image\/png;base64,([^"']+)/;
function payload(name, html) {
  const match = html.match(pattern);
  assert(match, `${name} splash payload must exist`);
  return match[1];
}
function inspect(name, encoded) {
  const padded = encoded + '='.repeat((4 - encoded.length % 4) % 4);
  const bytes = Buffer.from(padded, 'base64');
  assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${name} must retain PNG signature`);
  let offset = 8;
  let sawIend = false;
  let truncated = false;
  while (offset + 8 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    if (offset + 12 + length > bytes.length) { truncated = true; break; }
    offset += 12 + length;
    if (type === 'IEND') { sawIend = true; break; }
  }
  assert.strictEqual(truncated, true, `${name} must retain the known truncated chunk stream`);
  assert.strictEqual(sawIend, false, `${name} must not falsely appear complete`);
  return {chars: encoded.length, bytes: bytes.length};
}
const branch2Payload = payload('Branch2', branch2);
const mainPayload = payload('origin/main', main);
assert.strictEqual(branch2Payload, mainPayload, 'Branch2 splash payload must match untouched origin/main');
const branch2Info = inspect('Branch2', branch2Payload);
const mainInfo = inspect('origin/main', mainPayload);
assert.deepStrictEqual(branch2Info, mainInfo, 'Branch2 and origin/main splash metadata must remain identical');
console.log('SPLASH_ASSET_PARITY_HARNESS=PASS');
console.log(`BASE64_CHARS=${branch2Info.chars}`);
console.log(`DECODED_BYTES=${branch2Info.bytes}`);
console.log('BRANCH2_MAIN_PARITY=PASS');
console.log('TRUNCATION_CLASSIFICATION=PRE_EXISTING');
