# Quickstart: Reading Pal

**Branch**: `002-reading-pal-app` | **Date**: 2026-05-26

---

## Prerequisites

- Node.js 20+ and npm 10+
- A modern browser (Chrome 110+, Firefox 110+, Safari 16+, Edge 110+)

---

## 1. Scaffold the project

```bash
npm create vite@latest reading-pal -- --template react-ts
cd reading-pal
```

## 2. Install dependencies

```bash
npm install \
  react-router-dom \
  @mui/material @mui/icons-material @emotion/react @emotion/styled \
  zustand \
  dexie dexie-react-hooks \
  react-hook-form

npm install --save-dev \
  vitest \
  @vitest/coverage-v8 \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  fake-indexeddb \
  jsdom
```

## 3. Configure TypeScript

In `tsconfig.json`, ensure:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

## 4. Configure Vitest

In `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
```

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

## 5. Create the DB singleton

Create `src/db/db.ts` — see [data-model.md](data-model.md) for the full schema.

## 6. Run the dev server

```bash
npm run dev
```

App opens at `http://localhost:5173`.

## 7. Run tests

```bash
npm test              # watch mode
npm run test -- --run # single run (CI)
```

## 8. Build for production

```bash
npm run build
```

Output is in `dist/`. Open `dist/index.html` in any modern browser — no server needed.

---

## Validation Checklist

After scaffolding, verify:

- [ ] `npm run dev` starts without errors
- [ ] Browser shows the Vite + React default page at `localhost:5173`
- [ ] `npm test` runs and exits 0 (no tests yet — that's fine)
- [ ] `npm run build` produces a `dist/` folder
- [ ] TypeScript strict mode is on: add `const x: any = 1` anywhere and confirm `tsc` errors
