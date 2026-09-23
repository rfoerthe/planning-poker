# Firebase CLI security compatibility patch

`firebase-tools@15.28.2` is pinned while its transitive dependencies are overridden:

- `csv-parse@7.0.2` fixes [GHSA-8cw4-87c7-c6xx](https://github.com/advisories/GHSA-8cw4-87c7-c6xx).
- `stream-json@3.5.0` fixes [GHSA-528h-pc64-c93x](https://github.com/advisories/GHSA-528h-pc64-c93x).

The workspace also overrides vulnerable `qs` versions to `6.16.0` for
[GHSA-x5fp-wj9c-mxmx](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) and
[GHSA-4mjr-xmp4-gh2g](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g), including
the exact pins used by Express and body-parser.

The stream-json upgrade changes module paths and replaces the old stream factories
with generator factories. The pnpm patch updates all three Firebase consumers
(Auth import, Realtime Database import, and Next.js dependency discovery) to the
new module paths and explicit Node stream adapters. Firebase's existing
stream-chain 2 pipelines remain unchanged. The Auth error handler stays attached
because the new adapters can forward a parser error through multiple stages.
Use the documented Node 22.13+ runtime
so the CLI can load stream-json's ES modules from CommonJS.

`pnpm test` includes offline integration tests of the installed CLI, JSON and CSV
Auth imports, database imports, and the CSV prototype regression. Remote writes
are mocked; no Firebase project or credentials are required.

Remove the pin, overrides, and patch together when Firebase adopts fixed versions
and compatible APIs upstream. Until then, regenerate the patch and run the full
test suite when updating Firebase. Do not upgrade stream-json alone without
checking all three consumers.
