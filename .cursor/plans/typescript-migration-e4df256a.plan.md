<!-- e4df256a-a5f4-436a-9cb5-92f623f19f38 d59c8f86-b58f-4b8a-8547-b637d602c5a9 -->
# Redux Toolkit Store Migration Plan

## Overview

Upgrade from legacy `createStore` to RTK's `configureStore`. The slices are already modern (using `createSlice`), so this is primarily a store configuration update.

## Current State Analysis

- **Good**: All reducers already use RTK's `createSlice` ✓
- **Good**: Typed hooks already exist (`useAppDispatch`, `useAppSelector`) ✓
- **Issue**: Still using legacy `createStore` from 'redux'
- **Issue**: Manual `combineReducers` (unnecessary with RTK)

## Implementation Steps

### 1. Update Store Configuration

**File**: `src/store.ts`

Replace the entire file with modern RTK setup:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import currentReducer from './reducers/currentSlice';
import directoryReducer from './reducers/directorySlice';
import envReducer from './reducers/envSlice';
import playerReducer from './reducers/playerSlice';
import toastReducer from './reducers/toastSlice';

export const store = configureStore({
  reducer: {
    current: currentReducer,
    directory: directoryReducer,
    env: envReducer,
    player: playerReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in serialization check
        ignoredActions: ['current/setAlgorithm', 'current/setScratchPaper'],
        ignoredPaths: ['current.files', 'current.editingFile'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Key improvements**:

- Redux DevTools auto-enabled in development
- Default middleware includes redux-thunk, immutability checks, serialization checks
- Cleaner reducer registration (no manual combineReducers)
- Serialization check configured to ignore file objects

### 2. Update Reducer Index Exports

**File**: `src/reducers/index.ts`

Update to export individual reducers instead of default exports:

```typescript
// Export the reducer functions (not the default exports)
export { default as currentReducer } from './currentSlice';
export { default as directoryReducer } from './directorySlice';
export { default as envReducer } from './envSlice';
export { default as playerReducer } from './playerSlice';
export { default as toastReducer } from './toastSlice';

// Re-export all action creators (keep existing)
export * from './currentSlice';
export * from './directorySlice';
export * from './envSlice';
export * from './playerSlice';
export * from './toastSlice';
```

**Note**: This maintains backward compatibility for action imports while improving reducer clarity.

### 3. Verify Package Dependencies

**File**: `package.json`

Ensure `@reduxjs/toolkit` is installed (already present at version 2.10.1 ✓)

No changes needed - dependency already exists.

### 4. Remove Legacy Redux Imports

The legacy 'redux' package can remain as a peer dependency (RTK uses it internally), but we no longer directly import from it.

**Verify no breaking changes**:

- Search for any direct imports from 'redux' (excluding RTK)
- Only `src/store.ts` uses it (which we're replacing)

### 5. Test Migration

After changes, verify:

1. **Store initialization**: App loads without errors
2. **State persistence**: All existing reducers work identically
3. **DevTools**: Open Redux DevTools in browser (auto-enabled)
4. **Dispatch actions**: Test algorithm loading, player controls, file editing
5. **Type safety**: No TypeScript errors in components using store

## Benefits After Migration

1. **Redux DevTools**: Automatic time-travel debugging
2. **Better middleware**: Immutability and serialization checks catch bugs early
3. **Simpler code**: No manual combineReducers
4. **Future-ready**: Easy to add RTK Query, async thunks, listeners
5. **Performance**: Optimized middleware defaults
6. **Type safety**: Enhanced TypeScript inference

## Rollback Plan

If issues arise, revert `src/store.ts` to use `createStore` with `combineReducers`:

```typescript
import { combineReducers, createStore } from 'redux';
import * as reducers from 'reducers';
export const store = createStore(combineReducers(reducers));
```

## Estimated Time

- Implementation: 10-15 minutes
- Testing: 15-20 minutes
- Total: 30 minutes

## Files Changed

1. `src/store.ts` - Complete rewrite with configureStore
2. `src/reducers/index.ts` - Update exports (optional, for clarity)

## No Changes Required

- All slice files (already RTK-compatible)
- All components (hooks remain the same)
- All tests (store interface unchanged)

### To-dos

- [ ] Install Vitest + React Testing Library and create test configuration
- [ ] Migrate 7 core tracer files with unit tests
- [ ] Migrate 8 renderer components with tests
- [ ] Migrate 3 layout components with tests
- [ ] Migrate common/config, components index, files module
- [ ] Run full test suite, build, and browser smoke test
- [ ] Delete duplicate .js/.jsx files and commit