import autoImports from './dist/index.mjs'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.d.ts', '**/*.mjs'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['playground/**/*.ts'],
    plugins: {
      'auto-imports': autoImports,
    },
    rules: {
      'auto-imports/no-unnecessary-import': 'error',
    },
  },
])
