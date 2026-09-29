// Recompute success rates from the published CSV. No dependencies (Node 18+).
// Usage: node scripts/recompute.mjs [path/to/file.csv] [target-for-country-breakdown]
import { readFileSync } from "node:fs";

const file = process.argv[2] ?? "data/china-portal-network-reachability-2026-09-09.csv";
const focus = process.argv[3] ?? "www.gsxt.gov.cn";
const lines = readFileSync(file, "utf8").trim().split(/\r?\n/);
const header = lines.shift().split(",");
const col = Object.fromEntries(header.map((k, i) => [k, i]));

// Success is defined per measurement type, exactly as in the dataset metadata:
// ping = at least one packet received; sslcert = TLS handshake completed; dns = at least one answer.
function ok(c) {
  const type = c[col.type];
  if (type === "ping") return Number(c[col.packetsReceived]) > 0;
  if (type === "sslcert") return c[col.handshakeCompleted] === "True";
  if (type === "dns") return Number(c[col.answerCount]) > 0;
  return false;
}

const byKey = new Map();
const byCountry = new Map();
for (const line of lines) {
  const c = line.split(",");
  const key = `${c[col.target]} | ${c[col.type]}`;
  const a = byKey.get(key) ?? { n: 0, ok: 0 };
  a.n++; if (ok(c)) a.ok++;
  byKey.set(key, a);
  if (c[col.target] === focus && c[col.type] === "sslcert") {
    const cc = c[col.probeCountry];
    const b = byCountry.get(cc) ?? { n: 0, ok: 0 };
    b.n++; if (ok(c)) b.ok++;
    byCountry.set(cc, b);
  }
}

console.log(`rows: ${lines.length}`);
for (const [k, a] of [...byKey].sort()) {
  console.log(`${k.padEnd(34)} ${String(a.ok).padStart(5)}/${String(a.n).padEnd(5)} ${(100 * a.ok / a.n).toFixed(1)}%`);
}
console.log(`\nTLS handshake by probe country for ${focus}:`);
for (const [cc, b] of [...byCountry].sort()) console.log(`  ${cc} ${b.ok}/${b.n}`);