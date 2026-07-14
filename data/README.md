# data/ — Slovak listing datasets

Reserved for scraper output for the SK market, mirroring how CZ datasets live
in `estima-frontend/` (Apify JSON exports).

Planned sources:

- nehnutelnosti.sk — primary portal (Apify actors exist)
- topreality.sk — secondary coverage
- reality.sk — optional

Conventions (keep parity with the CZ datasets):

- One JSON file per scraper run: `dataset_<source>_<YYYY-MM-DD_HH-mm-ss>.json`
- Raw actor output, no post-processing — cleaning happens at ingestion time
- Files here are historical data once created: do not delete or rewrite them

Nothing in the app reads this directory yet; it feeds the future SK valuation
model (trained in estima-backend, not here).
