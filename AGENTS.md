# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Algorithm Visualizer** frontend: a Vite + React + TypeScript SPA (npm, Node `>=18`). Standard commands live in `package.json` (`start`, `build`, `test`, `lint`, `type-check`, `validate`); dev server runs on port 3000.

### Services

- **Frontend (this repo):** `npm start` → http://localhost:3000. This is the product.
- **Backend `server` (separate repo, port 8080):** required for full end-to-end (algorithm side menu, code tracing). The frontend proxies `/api` → `http://localhost:8080` (see `vite.config.js`). It is NOT in this repo. To run it: clone `https://github.com/algorithm-visualizer/server`, create `.env.local` with dummy `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`/`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`, `npm install`, then `npm run watch`. First boot clones the `algorithms` content repo and builds tracers (takes ~30-60s).

### Non-obvious gotchas

- **JavaScript tracing needs the server** even though it runs in the browser: `/api/tracers/js` 302-redirects to the tracer lib on `unpkg.com` (needs outbound internet). C++/Java tracing additionally requires Docker on the server; JS does not.
- **`npm run type-check` and `npm run validate` fail** (~44 pre-existing TS errors, tracked in `TYPECHECK-ERRORS.md`). This is expected; don't treat it as env breakage.
- **`npm run lint` passes** (warnings only, 0 errors).
- **One test suite fails pre-existing:** `src/core/layouts/Layout.test.tsx` errors resolving `@/lib/utils` because `vitest.config.ts` omits the `@` alias that `vite.config.js` defines. The other 6 suites (21 tests) pass. Run single-shot with `npm test -- --run`.
