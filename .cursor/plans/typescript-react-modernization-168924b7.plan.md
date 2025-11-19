<!-- 168924b7-9b5e-4d04-af8f-74a3c355fea5 2b3f090c-ca1c-4ec8-8d20-c0536f8580c6 -->
# TypeScript React Modernization Plan

## Phase 1: TypeScript Infrastructure Setup

**Add TypeScript configuration and dependencies**

- Install TypeScript, type definitions for React, Redux, React Router, and all third-party libraries
- Create `tsconfig.json` with strict type checking enabled
- Update Vite config to handle TypeScript
- Create base types and interfaces in `src/types/` directory

## Phase 2: Redux Migration to Redux Toolkit

**Convert Redux state management** (`src/reducers/`)

- Migrate `current.js` → `currentSlice.ts` using RTK's `createSlice`
- Migrate `directory.js` → `directorySlice.ts`
- Migrate `env.js` → `envSlice.ts`
- Migrate `player.js` → `playerSlice.ts`
- Migrate `toast.js` → `toastSlice.ts`
- Create typed store configuration with `configureStore`
- Create typed hooks (`useAppDispatch`, `useAppSelector`)

## Phase 3: Core Infrastructure Components

**Modernize routing and utilities**

- Remove `src/common/withRouter.js` - use hooks directly
- Create typed utility functions in `src/common/util.ts`
- Update API clients in `src/apis/` with TypeScript

## Phase 4: Simple Components Migration

**Convert basic presentational components** (no complex state/lifecycle)

- `Ellipsis` → functional with TypeScript
- `Divider` → functional with TypeScript
- `ListItem` → functional with TypeScript
- `Button` → functional with TypeScript (useState for confirming state)
- `ProgressBar` → functional with TypeScript

## Phase 5: Complex Components Migration

**Convert stateful components**

- `Navigator` → functional with useState, useEffect, typed Redux hooks
- `ExpandableListItem` → functional with TypeScript
- `TabContainer` → functional with TypeScript
- `FoldableAceEditor` → functional with useRef, forwardRef
- `CodeEditor` → functional with useRef, forwardRef, typed Redux hooks
- `Player` → functional with useState, useEffect, useRef, typed Redux hooks
- `ToastContainer` → functional with TypeScript
- `ResizableContainer` → functional with useState, useRef
- `VisualizationViewer` → functional with TypeScript

## Phase 6: Main App Component

**Convert App component**

- Remove `BaseComponent` class entirely
- `Header` → functional with useState, useEffect, typed hooks
- `App` → functional with useState, useEffect, useRef, useNavigate, useLocation, useParams

## Phase 7: Core Renderers & Tracers

**Convert visualization core**

- Create base types for renderers and tracers
- `Renderer` → functional base with useRef, useCallback for pan/zoom
- `Array1DRenderer` → functional extending Renderer patterns
- `Array2DRenderer` → functional with TypeScript
- `ChartRenderer` → functional with TypeScript
- `GraphRenderer` → functional with TypeScript
- `LogRenderer` → functional with TypeScript
- `MarkdownRenderer` → functional with TypeScript
- `ScatterRenderer` → functional with TypeScript
- `Tracer.jsx` → `Tracer.tsx` with functional patterns

## Phase 8: File Extensions & Cleanup

**Finalize TypeScript migration**

- Rename all `.js` → `.ts` or `.tsx` as appropriate
- Update all import statements to remove `.js` extensions
- Remove deprecated lifecycle methods patterns
- Add proper interface/type exports for public APIs
- Verify no `any` types remain (strict type checking)

## Key Technical Decisions

**TypeScript Configuration:**

- Strict mode enabled (`strict: true`)
- Path aliases preserved from Vite config
- Module resolution: `bundler`

**Component Patterns:**

- Functional components with explicit return types
- Props interfaces exported for reusability
- Use `React.FC` sparingly, prefer explicit typing
- forwardRef for components needing ref forwarding

**Redux Toolkit:**

- Use `createSlice` with immer for immutability
- Typed `RootState` and `AppDispatch`
- Custom hooks: `useAppDispatch()`, `useAppSelector()`
- Async operations with `createAsyncThunk` where needed

**Hooks Strategy:**

- `useState` replaces component state
- `useEffect` replaces lifecycle methods
- `useCallback` for event handlers passed as props
- `useMemo` for expensive computations
- `useRef` for DOM refs and mutable values

**Error Handling:**

- Remove BaseComponent error handler
- Create custom `useErrorHandler` hook
- Integrate with toast actions from Redux

### To-dos

- [ ] Install TypeScript dependencies and create tsconfig.json with strict configuration
- [ ] Create base type definitions and interfaces in src/types/
- [ ] Convert all Redux reducers to RTK slices with typed store configuration
- [ ] Convert API clients and utility functions to TypeScript
- [ ] Convert Ellipsis, Divider, ListItem, Button, ProgressBar to functional TypeScript
- [ ] Convert Navigator, TabContainer, CodeEditor, Player, etc. to functional TypeScript with hooks
- [ ] Convert App and Header components, remove BaseComponent and withRouter HOC
- [ ] Convert all renderers and tracers to functional TypeScript components
- [ ] Rename all files to .ts/.tsx, verify strict typing, remove deprecated patterns