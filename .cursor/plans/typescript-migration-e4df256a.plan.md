<!-- e4df256a-a5f4-436a-9cb5-92f623f19f38 7da4d4f8-ee35-4fc0-be2a-60366c83567c -->

# Development Tooling Setup

## Overview

Implement a complete development tooling stack to enforce code quality, consistent formatting, and automated checks. This includes ESLint for linting, Prettier for formatting, Husky for git hooks, and lint-staged for pre-commit validation.

## Current State

- No ESLint configuration exists
- No Prettier configuration exists
- No git hooks configured
- No automated code quality checks

## Implementation Steps

### 1. Install Required Dependencies

Add development dependencies for all tooling:

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier \
  husky \
  lint-staged
```

**Key Packages:**

- `eslint` - Core linting tool
- `@typescript-eslint/*` - TypeScript support for ESLint
- `eslint-plugin-react*` - React-specific linting rules
- `prettier` - Code formatter
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier
- `husky` - Git hooks manager
- `lint-staged` - Run linters on staged files only

### 2. Create ESLint Configuration

**File:** `.eslintrc.json`

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "env": {
    "browser": true,
    "es2020": true,
    "node": true
  },
  "ignorePatterns": ["dist", "build", "node_modules", "*.config.js", "*.config.ts"]
}
```

**Key Features:**

- TypeScript support with recommended rules
- React and React Hooks rules
- Prettier integration to avoid conflicts
- Relaxed rules for `any` (warn vs error) to avoid overwhelming errors
- Ignore build artifacts and config files

### 3. Create Prettier Configuration

**File:** `.prettierrc`

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**File:** `.prettierignore`

```
dist
build
node_modules
coverage
*.min.js
*.config.js
package-lock.json
public
```

### 4. Add NPM Scripts

Update `package.json` scripts section:

```json
{
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,scss}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,scss}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm run format:check && npm run test -- --run",
    "prepare": "husky"
  }
}
```

**Script Purposes:**

- `lint` - Check code for linting issues
- `lint:fix` - Automatically fix linting issues where possible
- `format` - Format all code with Prettier
- `format:check` - Check if code is formatted (CI/CD)
- `type-check` - Run TypeScript type checking without emitting files
- `validate` - Run all checks (useful for CI/CD)
- `prepare` - Automatically install Husky hooks after npm install

### 5. Initialize Husky

```bash
npx husky init
```

This creates `.husky/` directory with git hooks.

### 6. Create Pre-commit Hook

**File:** `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

Make it executable:

```bash
chmod +x .husky/pre-commit
```

### 7. Configure lint-staged

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,scss,md}": ["prettier --write"]
  }
}
```

**What it does:**

- TypeScript files: Run ESLint with auto-fix, then Prettier
- Other files: Just run Prettier
- Only processes staged files (fast!)

### 8. Create ESLint Ignore File

**File:** `.eslintignore`

```
dist
build
node_modules
coverage
*.config.js
*.config.ts
public
vite-env.d.ts
```

### 9. Initial Format and Lint Fix

After setup, run a one-time format and fix:

```bash
npm run format
npm run lint:fix
```

This will format all existing code and fix auto-fixable linting issues.

### 10. Verification

Test the setup:

```bash
# Run all checks
npm run validate

# Test git hook by making a commit
echo "test" >> test.txt
git add test.txt
git commit -m "test: verify pre-commit hook"
rm test.txt
```

The pre-commit hook should run lint-staged automatically.

## Benefits

1. **Code Quality**: ESLint catches bugs and enforces best practices
2. **Consistency**: Prettier ensures uniform code style across the project
3. **Automation**: Husky + lint-staged runs checks automatically before commits
4. **Type Safety**: type-check script catches TypeScript errors
5. **CI/CD Ready**: validate script can be used in CI pipelines
6. **Fast**: lint-staged only checks changed files, not entire codebase
7. **Developer Experience**: Auto-fix capabilities reduce manual formatting

## Files Created/Modified

**New Files:**

1. `.eslintrc.json` - ESLint configuration
2. `.prettierrc` - Prettier configuration
3. `.prettierignore` - Prettier ignore patterns
4. `.eslintignore` - ESLint ignore patterns
5. `.husky/pre-commit` - Pre-commit git hook

**Modified Files:**

1. `package.json` - Added scripts, devDependencies, and lint-staged config

## Testing Strategy

1. Run `npm run lint` - Should complete without blocking errors
2. Run `npm run format` - Should format all files
3. Run `npm run type-check` - Should pass (existing TS errors are separate issue)
4. Run `npm run validate` - All checks should pass
5. Make a test commit - Pre-commit hook should run
6. Intentionally break formatting and try to commit - Should fail

## Expected Warnings

After initial setup, expect some linting warnings for:

- `@typescript-eslint/no-explicit-any` - Many existing `any` types
- `@typescript-eslint/no-unused-vars` - Some unused variables
- These are set to "warn" not "error" to avoid blocking development

## Future Improvements

- Add `commitlint` for commit message conventions
- Add `eslint-plugin-import` for import/export rules
- Add `eslint-plugin-jsx-a11y` for accessibility rules
- Configure editor integrations (VSCode settings.json)

## Estimated Time

- Installation: 5 minutes
- Configuration files: 10 minutes
- Initial formatting/fixing: 10 minutes
- Testing and verification: 5 minutes
- Total: 30 minutes

## Success Criteria

- [ ] All dependencies installed
- [ ] ESLint and Prettier configs created
- [ ] Husky and lint-staged configured
- [ ] Pre-commit hook working
- [ ] npm scripts added and functional
- [ ] Initial codebase formatted and linted
- [ ] All tests still passing
- [ ] Git hook successfully prevents commits with issues

### To-dos

- [ ] Install Vitest + React Testing Library and create test configuration
- [ ] Migrate 7 core tracer files with unit tests
- [ ] Migrate 8 renderer components with tests
- [ ] Migrate 3 layout components with tests
- [ ] Migrate common/config, components index, files module
- [ ] Run full test suite, build, and browser smoke test
- [ ] Delete duplicate .js/.jsx files and commit
- [ ] Install ESLint, Prettier, Husky, lint-staged dependencies
- [ ] Create .eslintrc.json with TypeScript and React rules
- [ ] Create .prettierrc and .prettierignore
- [ ] Add lint, format, type-check, validate scripts to package.json
- [ ] Initialize Husky and create pre-commit hook
- [ ] Configure lint-staged in package.json
- [ ] Create .eslintignore file
- [ ] Run initial format and lint:fix on codebase
- [ ] Test all scripts and pre-commit hook
