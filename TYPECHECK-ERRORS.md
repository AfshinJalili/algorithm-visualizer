# TypeCheck Errors - Status Tracker

**Total Errors: 55**

## ✅ Fixed

### Easy Fixes

- [x] Install @types/sprintf-js (1 error) - ✅ DONE
- [x] Fix useCallback return type annotations (2 errors) - ✅ DONE
- [x] Add return type annotations to test functions (7 errors) - ✅ DONE
- [x] Fix import.meta.glob type issue (1 error) - ✅ DONE (created vite-env.d.ts)

**Total Fixed: 11 errors**
**Remaining: ~44 errors**

## 🚧 In Progress

### Bluebird/Promise Compatibility (5 errors)

- [ ] src/apis/index.ts - GET method
- [ ] src/apis/index.ts - POST method
- [ ] src/apis/index.ts - DELETE method
- [ ] src/apis/index.ts - PUT method
- [ ] src/apis/index.ts - PATCH method

### Unknown Type Replacements (15 errors)

- [ ] src/components/App/index.tsx - Algorithm type (line 191)
- [ ] src/components/App/index.tsx - loadAlgorithm return type (line 236)
- [ ] src/components/Header/index.tsx - ScratchPaper type mismatch (line 141)
- [ ] src/components/Header/index.tsx - File type mismatch (line 144)
- [ ] src/components/Header/index.tsx - GitHubApi overload (line 139)
- [ ] src/components/Player/index.tsx - Chunk properties (lines 63-64, 70)
- [ ] src/components/Player/index.tsx - reset parameter type (line 110)
- [ ] src/components/Player/index.tsx - error type (line 117)
- [ ] src/components/VisualizationViewer/index.tsx - Type casting (lines 65, 76)
- [ ] src/components/VisualizationViewer/index.tsx - Chunk.lineNumber (lines 114-115)
- [ ] src/components/VisualizationViewer/index.tsx - Chunk array (line 124)
- [ ] src/core/tracers/GraphTracer.tsx - Array value type (line 83)

### Class Hierarchy Issues (12 errors)

- [ ] src/core/tracers/Tracer.tsx - getRendererClass return type generic
- [ ] src/core/tracers/Array2DTracer.tsx - getRendererClass override (line 19)
- [ ] src/core/tracers/GraphTracer.tsx - getRendererClass override (line 52)
- [ ] src/core/tracers/LogTracer.tsx - getRendererClass override (line 8)
- [ ] src/core/tracers/MarkdownTracer.tsx - getRendererClass override (line 7)
- [ ] src/core/tracers/Array1DTracer.tsx - ChartTracer type (line 40)
- [ ] src/core/tracers/GraphTracer.tsx - LogTracer type (line 350)
- [ ] src/core/renderers/GraphRenderer/index.tsx - handleMouseDown method conflict (lines 38-39)
- [ ] src/core/renderers/GraphRenderer/index.tsx - handleMouseMove method conflict (lines 46, 54)
- [ ] src/core/renderers/Renderer/index.tsx - Generic constraint (line 29)
- [ ] src/core/renderers/Renderer/index.tsx - toString return (line 104)

### Component Prop Issues (10 errors)

- [ ] src/components/CodeEditor/index.tsx - IMarker \_key property (line 62)
- [ ] src/core/renderers/MarkdownRenderer/index.tsx - children property (line 47)
- [ ] src/core/renderers/MarkdownRenderer/index.tsx - link component type (line 89)
- [ ] src/core/renderers/MarkdownRenderer/index.tsx - image component type (line 89)
- [ ] src/core/renderers/ScatterRenderer/index.tsx - ChartData type (line 31)
- [ ] src/core/layouts/Layout.tsx - forceUpdate property (line 49)
- [ ] src/core/layouts/Layout.tsx - ref type mismatch (line 58)

## 📝 Notes

- Primary issue: Used `unknown` as temporary placeholder instead of proper types
- Need proper interface definitions for Algorithm, ScratchPaper, Chunk, Command
- Tracer/Renderer class hierarchy needs generic type parameters
- Some React component prop types need refinement
