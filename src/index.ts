import { createNoUnnecessaryImportRule } from './rules/no-unnecessary-import'

export function createPlugin(opts: {
  items?: string
}) {
  return {
    meta: {
      name: 'eslint-plugin-auto-imports',
      version: '1.0.0',
    },
    rules: {
      'no-unnecessary-import': createNoUnnecessaryImportRule(opts),
    },
  }
}

const plugin = createPlugin({
  items: '.unimport-items.json',
})

export default plugin
