<!-- e4df256a-a5f4-436a-9cb5-92f623f19f38 69ea309b-0960-4a8c-907a-ed889a464f63 -->

# Enable Strict TypeScript Mode

## Overview

Enable strict TypeScript incrementally by fixing all 80+ `any` types across 23 files, then enabling strict compiler flags one at a time to ensure the entire codebase compiles with full type safety.

## Current State

- `strict: false` in tsconfig.json
- 80+ instances of `: any` across 23 files
- Key problem areas:
- `src/apis/index.ts` - API request/response types (3 any)
- `src/components/App/index.tsx` - Props and callbacks (13 any)
- `src/components/Player/index.tsx` - Playback state (3 any)
- `src/core/tracers/*.tsx` - Tracer data structures (15 any)
- `src/core/renderers/*.tsx` - Renderer props (30+

### To-dos

- [ ] Install Vitest + React Testing Library and create test configuration
- [ ] Migrate 7 core tracer files with unit tests
- [ ] Migrate 8 renderer components with tests
- [ ] Migrate 3 layout components with tests
- [ ] Migrate common/config, components index, files module
- [ ] Run full test suite, build, and browser smoke test
- [ ] Delete duplicate .js/.jsx files and commit
