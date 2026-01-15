/* eslint-disable antfu/no-import-dist */
// @ts-check

import antfu from '@antfu/eslint-config'
import { globalIgnores } from 'eslint/config'
import autoImports from './dist/index.mjs'

export default antfu({}, {
  files: ['playground/**/*.ts'],
  plugins: {
    'auto-imports': autoImports,
  },
  rules: {
    'auto-imports/no-unnecessary-import': 'warn',
  },
}, globalIgnores([
  '.unimport-items.json',
]))
