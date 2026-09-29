# HTTP-layer snapshots (check-host.net)

These are the JSON responses we saved from the public check-host.net API (`/check-http`), with 12 nodes requested per run.

| File | Run time (UTC) | GSXT result |
|---|---|---|
| `check-host-http-2026-08-26-run1.json` | 2026-08-26 08:00 | 403 × 10, 521 × 1, network failure × 1 |
| `check-host-http-2026-08-26-run2.json` | 2026-08-26 08:07 | 403 × 11, 521 × 1 |
| `check-host-http-2026-09-21.json` | 2026-09-21 20:03 | 403 × 9, 521 × 1, network failure × 2 |

Each file also covers seven other portals and two controls (`www.gov.cn`, `www.baidu.com`). A run counts only if at least one control returned an HTTP response (`controlsHealthy`).

Some labels and notes inside the files are in Chinese, because this was our working record. `label` is a short name for each portal. The `method.why` note says the check was run from check-host.net nodes because our own network exits could not give an independent view. `method.verification` says the report links could be reopened. **That is no longer true**: check-host.net deletes reports after a few weeks, and these links now show "Check report was removed". To verify, repeat the test as described in the main README.