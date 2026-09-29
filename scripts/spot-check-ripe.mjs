// Check the published CSV against RIPE Atlas's own public API, without any key.
// For one target, measurement type and probe country, it downloads the raw results
// from atlas.ripe.net and compares them with the matching CSV rows.
// Usage: node scripts/spot-check-ripe.mjs [target] [type] [country]
// Example: node scripts/spot-check-ripe.mjs www.gsxt.gov.cn sslcert DE
import { readFileSync } from "node:fs";

const [target = "www.gsxt.gov.cn", type = "sslcert", country = "DE"] = process.argv.slice(2);
const file = "data/china-portal-network-reachability-2026-09-09.csv";
const lines = readFileSync(file, "utf8").trim().split(/\r?\n/);
const header = lines.shift().split(",");
const col = Object.fromEntries(header.map((k, i) => [k, i]));
const rows = lines.map(l => l.split(",")).filter(c =>
  c[col.target] === target && c[col.type] === type && c[col.probeCountry] === country);
if (!rows.length) { console.error("No CSV rows for that combination."); process.exit(1); }

const msm = rows[0][col.measurementId];
const probe = rows[0][col.probeId];
const okCsv = c => type === "ping" ? Number(c[col.packetsReceived]) > 0
  : type === "sslcert" ? c[col.handshakeCompleted] === "True"
  : Number(c[col.answerCount]) > 0;
const okRaw = r => type === "ping" ? (r.rcvd ?? 0) > 0
  : type === "sslcert" ? Array.isArray(r.cert) && r.cert.length > 0
  : Array.isArray(r.result?.answers) ? r.result.answers.length > 0 : (r.result?.ANCOUNT ?? 0) > 0;

const meta = await (await fetch(`https://atlas.ripe.net/api/v2/measurements/${msm}/`)).json();
console.log(`measurement ${msm}: ${meta.type} -> ${meta.target || target}, public=${meta.is_public}`);
console.log(`page: https://atlas.ripe.net/measurements/${msm}/`);

// RIPE refuses windows longer than 7 days, so fetch in 6-day slices.
const raw = [];
for (let t = meta.start_time; t < meta.stop_time; t += 6 * 86400) {
  const url = `https://atlas.ripe.net/api/v2/measurements/${msm}/results/?start=${t}&stop=${Math.min(t + 6 * 86400 - 1, meta.stop_time)}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  raw.push(...(await res.json()).filter(r => String(r.prb_id) === String(probe)));
}

const csvOk = rows.filter(okCsv).length;
const rawOk = raw.filter(okRaw).length;
console.log(`probe ${probe} (${country})`);
console.log(`  CSV rows:        ${rows.length}, successful: ${csvOk}`);
console.log(`  RIPE raw results: ${raw.length}, successful: ${rawOk}`);
const errs = {};
for (const r of raw) if (r.err) errs[r.err] = (errs[r.err] ?? 0) + 1;
if (Object.keys(errs).length) console.log("  RIPE error strings:", errs);
console.log(csvOk === rawOk ? "MATCH" : "DIFFERENT - please open an issue");