import { ESLintUtils } from '@typescript-eslint/utils'

// TODO
export const createEslintRule = ESLintUtils.RuleCreator(name => `https://example.com/rule/${name}`)
