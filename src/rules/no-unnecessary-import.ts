import type { Rule } from 'eslint'
import { readFileSync } from 'node:fs'

interface CreateRuleOptions {
  items?: string
}

export function createNoUnnecessaryImportRule(opts?: CreateRuleOptions): Rule.RuleModule & {
  createOnce?: Rule.RuleModule['create']
} {
  const {
    items = '.unimport-items.json',
  } = opts || {}

  let sourceToNames: Map<string, Set<string>> | null = null
  let sourceToTypeNames: Map<string, Set<string>> = new Map()

  function loadAutoImports() {
    if (sourceToNames !== null)
      return true

    try {
      const content = readFileSync(items, 'utf-8')
      const autoImports = JSON.parse(content)

      if (!Array.isArray(autoImports)) {
        return false
      }

      sourceToNames = new Map()
      sourceToTypeNames = new Map()

      for (const item of autoImports) {
        if (!item.from || !item.name)
          continue

        const isType = item.type === true
        const source = item.from
        const name = item.as || item.name

        if (!sourceToNames.has(source)) {
          sourceToNames.set(source, new Set())
        }
        sourceToNames.get(source)?.add(name)

        if (isType) {
          if (!sourceToTypeNames.has(source)) {
            sourceToTypeNames.set(source, new Set())
          }
          sourceToTypeNames.get(source)?.add(name)
        }
      }

      return true
    }
    catch {
      return false
    }
  }

  function findMatchingAutoImportSource(importSource: string) {
    if (sourceToNames?.has(importSource)) {
      return importSource
    }

    const extMatch = importSource.match(/\.(ts|js|tsx|jsx|vue|mjs|cjs)$/)
    if (extMatch) {
      const withoutExt = importSource.slice(0, -extMatch[0].length)
      if (sourceToNames?.has(withoutExt)) {
        return withoutExt
      }
    }

    return null
  }

  function createImportVisitor(context: Rule.RuleContext): Rule.RuleListener {
    return {
      ImportDeclaration(node) {
        const importSource = node.source.value

        if (typeof importSource !== 'string')
          return

        const matchedSource = findMatchingAutoImportSource(importSource)

        if (!matchedSource || !sourceToNames?.has(matchedSource)) {
          return
        }

        const autoImportedNames = sourceToNames.get(matchedSource)

        // Analyze the import specifiers
        const autoImportedSpecifiers = []
        const manuallyImportedSpecifiers = []

        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportSpecifier') {
            const imported = specifier.imported
            const importedName = imported.type === 'Identifier' ? imported.name : String(imported.value)
            const localName = specifier.local.name

            if (autoImportedNames?.has(importedName)) {
              autoImportedSpecifiers.push({
                importedName,
                localName,
                specifier,
              })
            }
            else {
              manuallyImportedSpecifiers.push({
                importedName,
                localName,
                specifier,
              })
            }
          }
          else if (specifier.type === 'ImportDefaultSpecifier') {
            const localName = specifier.local.name

            if (autoImportedNames?.has('default')) {
              autoImportedSpecifiers.push({
                importedName: 'default',
                localName,
                specifier,
              })
            }
            else {
              manuallyImportedSpecifiers.push({
                importedName: 'default',
                localName,
                specifier,
              })
            }
          }
          else if (specifier.type === 'ImportNamespaceSpecifier') {
            const localName = specifier.local.name

            // Namespace imports are rarely auto-imported, skip them
            manuallyImportedSpecifiers.push({
              importedName: '*',
              localName,
              specifier,
            })
          }
        }

        // If all specifiers are auto-imported, remove the entire import
        if (autoImportedSpecifiers.length > 0 && manuallyImportedSpecifiers.length === 0) {
          const unnecessaryNames = autoImportedSpecifiers.map(s => s.importedName).join(', ')
          context.report({
            node,
            message: `Unnecessary import: ${unnecessaryNames}`,
            fix(fixer) {
              return fixer.remove(node)
            },
          })
        }
        // If some specifiers are auto-imported, remove only those
        else if (autoImportedSpecifiers.length > 0) {
          const unnecessaryNames = autoImportedSpecifiers.map(s => s.importedName).join(', ')
          for (const autoImport of autoImportedSpecifiers) {
            context.report({
              node: autoImport.specifier,
              message: `Remove auto-imported '{{name}}' (unnecessary: ${unnecessaryNames})`,
              data: { name: autoImport.importedName },
              fix(fixer) {
                if (node.specifiers.length === 1) {
                  return fixer.remove(node)
                }

                const sourceCode = context.getSourceCode()
                const prevToken = sourceCode.getTokenBefore(autoImport.specifier)
                const nextToken = sourceCode.getTokenAfter(autoImport.specifier)

                const isOnlyNamedImport = node.specifiers.every(
                  s => s.type === 'ImportSpecifier',
                )

                if (isOnlyNamedImport && autoImport.specifier.range) {
                  const specifierStart = autoImport.specifier.range[0]
                  const specifierEnd = autoImport.specifier.range[1]

                  let endOffset = 0
                  if (nextToken && nextToken.value === ',') {
                    endOffset = nextToken.range[1] - specifierEnd
                  }

                  let startOffset = 0
                  if (prevToken && prevToken.value !== '{') {
                    startOffset = specifierStart - prevToken.range[1]
                  }

                  return fixer.removeRange([
                    specifierStart - startOffset,
                    specifierEnd + endOffset,
                  ])
                }
                else {
                  return fixer.remove(autoImport.specifier)
                }
              },
            })
          }
        }
      },
    }
  }

  return {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Disallow imports that are auto-imported',
        category: 'Best Practices',
        recommended: false,
      },
      fixable: 'code',
      hasSuggestions: false,
      schema: [],
    },
    create(context) {
      if (!loadAutoImports()) {
        return {}
      }
      return createImportVisitor(context)
    },
    createOnce(context) {
      return {
        before() {
          if (!loadAutoImports()) {
            return false
          }
        },
        ...createImportVisitor(context),
      }
    },
  }
}
