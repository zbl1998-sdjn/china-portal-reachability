# Can you reach China's company register from abroad?

Raw measurements of how eight Chinese official due-diligence portals, including the national company register GSXT (`www.gsxt.gov.cn`), respond to requests from outside mainland China. Two public measurement networks were used, and this repository is built so that you can check every number **without trusting us**.

## Findings for GSXT

| Layer | What was measured | Result |
|---|---|---|
| DNS | Name resolution from probes in 32 countries | 1,789 of 1,789 succeeded (100%) |
| Network | TLS handshake with `www.gsxt.gov.cn` | 1,623 of 1,726 completed (94.0%) |
| Network | Same, probe in Germany | 0 of 56 (every attempt timed out) |
| Network | Same, probe in Japan | 27 of 56 |
| HTTP | Page request from check-host.net nodes in 19 countries, 26 August 2026 | HTTP 403 on 21 of 24 requests, 521 on 2, one network failure |

In short: from most countries GSXT is reachable at the network level, but it answers ordinary page requests with HTTP 403. The refusal happens at the application layer, not because the site cannot be reached. Germany is an exception in this sample: the connection itself failed.

Network-layer window: 26 August to 9 September 2026, 31 RIPE Atlas measurements, 50,248 rows. Results for the other seven portals are in the same file (run `scripts/recompute.mjs`).

## Check it yourself

### 1. The measurements are public on RIPE Atlas

RIPE Atlas is run by RIPE NCC, the regional internet registry for Europe. All 31 measurements are public, and anyone can open them without an account. For example, the TLS measurement against GSXT:

<https://atlas.ripe.net/measurements/204800712/>

All measurement IDs are listed in [`data/metadata.json`](data/metadata.json) (`measurementIds`).

### 2. Compare our file with RIPE's own data

```bash
node scripts/spot-check-ripe.mjs www.gsxt.gov.cn sslcert DE
```

This downloads the raw results for one probe directly from `atlas.ripe.net` (no key needed) and compares them with our CSV. Output on 30 September 2026:

```
probe 24886 (DE)
  CSV rows:        56, successful: 0
  RIPE raw results: 56, successful: 0
  RIPE error strings: { 'connect: timeout': 56 }
MATCH
```

Try other combinations, such as `www.gsxt.gov.cn sslcert JP` or `wenshu.court.gov.cn ping FR`. Requires Node 18 or later and no packages.

### 3. Recompute the table from the file

```bash
node scripts/recompute.mjs
```

Success is defined per measurement type: at least one packet received for ping, a completed handshake for TLS, and at least one answer for DNS.

### 4. Re-run the HTTP test (this part must be repeated, not reopened)

check-host.net deletes its report pages after a few weeks, so our original report links no longer open. The files in [`data/http-layer/`](data/http-layer/) are the API responses we saved at the time. You do not need to trust them, because you can repeat the test yourself:

```bash
curl -s -H "Accept: application/json" "https://check-host.net/check-http?host=https://www.gsxt.gov.cn/&max_nodes=12"
# take "request_id" from the reply, wait about 20 seconds, then:
curl -s -H "Accept: application/json" "https://check-host.net/check-result/REQUEST_ID"
```

Run the same request against `https://www.gov.cn/` as a control. If the control also fails, the nodes had a problem and the run should be ignored.

## Independent archives

The same CSV is archived with two research repositories:

- Harvard Dataverse: [doi:10.7910/DVN/EUOGRK](https://doi.org/10.7910/DVN/EUOGRK). The stored MD5 of the original file is `6ceb0937b782b2548f1f05aef3696ab7`, identical to the copy here.
- Zenodo: [doi:10.5281/zenodo.22681948](https://doi.org/10.5281/zenodo.22681948). The files have the same sizes as here.

Checksums for this repository are in [`SHA256SUMS`](SHA256SUMS).

## Limitations

- A completed TLS handshake does not mean the portal served content. An HTTP 403 is invisible to RIPE Atlas.
- RIPE Atlas probes are hosted by volunteers, so coverage follows where volunteers are, not trade volume. Each measurement used about one probe per country, so a single country's result reflects one network, not the whole country.
- A missing reading can mean the probe was offline rather than the portal being unreachable.
- The HTTP runs are snapshots from a commercial monitoring service with 12 nodes per run.
- Ping failures on some portals (for example `wenshu.court.gov.cn`) only show that ICMP is blocked. Their TLS handshakes succeeded.

## Privacy

The probes are mostly on volunteers' home connections. The dataset keeps only the probe ID, country and ASN. It holds no addresses, coordinates or host identities.

## Who made this, and our interest

Made by Derrick Zhou, founder of Currawong (<https://currawongweb.com>), a paid service that checks Chinese suppliers against official records. Currawong is operated by Jinan Shenyu International Trade Co., Ltd., unified social credit code `91370105MAKM7P5L3P`. You can look that code up on GSXT itself.

Because we sell supplier checks, we have a commercial interest in this topic. That is why this repository relies on public measurement networks and gives you the tools to check it yourself, rather than asking you to take our word.

The network measurements used research credits granted by RIPE NCC (ticket #1094691).

## License

- Data (`data/`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Scripts (`scripts/`): MIT

If you find an error, please open an issue. Corrections will be dated and kept visible.