import { ESLintUtils } from '@typescript-eslint/utils'

export const createEslintRule = ESLintUtils.RuleCreator(
  name => `https://github.com/kvoon3/eslint-plugin-auto-imports/blob/main/src/rules/${name}.md`,
)
