import { name, version } from '../package.json'
import { createRule } from './rules/no-unnecessary-import'

export function createPlugin(opts: {
  items?: string
}) {
  return {
    meta: {
      name,
      version,
    },
    rules: {
      'no-unnecessary-import': createRule(opts),
    },
  }
}

const plugin = createPlugin({
  items: '.unimport-items.json',
})

export default plugin
