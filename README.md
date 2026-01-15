# eslint-plugin-auto-imports

[![npm version](https://img.shields.io/npm/v/eslint-plugin-auto-imports.svg?color=black&labelColor=white&style=flat)](https://www.npmjs.com/package/eslint-plugin-auto-imports)

> [!TIP]
> This plugin requires [unplugin-auto-import](https://unplugin.unjs.io/showcase/unplugin-auto-import) to be installed

## Rules

| Rule                                 | Description                             | Fixable |
| ------------------------------------ | --------------------------------------- | ------- |
| `auto-imports/no-unnecessary-import` | Disallow imports that are auto-imported | ✅ Yes  |

## Prepare

Enable `dumpUnimportItems` in your bundler configuration:

```diff
import AutoImport from 'unplugin-auto-import/vite' // or /webpack, /rollup, /rspack, /rolldown

export default {
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: true,
+     dumpUnimportItems: true, // Enable this to generate .unimport-items.json
    })
  ]
}
```

## Configuration

### ESLint

```ts
// eslint.config.js
import autoImports from 'eslint-plugin-auto-imports'

export default [
  {
    plugins: {
      'auto-imports': autoImports
    },
    rules: {
      'auto-imports/no-unnecessary-import': 'error'
    }
  }
]
```

With custom options:

```ts
import { createPlugin } from 'eslint-plugin-auto-imports'

export default [
  {
    plugins: {
      'auto-imports': createPlugin({
        items: '.unimport-items.json' // Path to the generated file (default)
      })
    },
    rules: {
      'auto-imports/no-unnecessary-import': 'error'
    }
  }
]
```

### Oxlint

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "jsPlugins": ["eslint-plugin-auto-imports"],
  "rules": {
    "auto-imports/no-unnecessary-import": "error"
  }
}
```

## License

MIT
