# eslint-plugin-auto-imports

Automatically remove unnecessary imports that are already auto-imported by `unplugin-auto-import`.

> [!TIP]
> This plugin requires `unplugin-auto-import` to be installed

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

## Custom Configuration

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

## License

MIT
