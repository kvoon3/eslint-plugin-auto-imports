import * as tsParser from '@typescript-eslint/parser'
import { unindent as $, createRuleTester } from 'eslint-vitest-rule-tester'
import { describe, expect, it } from 'vitest'
import { createRule } from '../src/rules/no-unnecessary-import'

describe('no-unnecessary-import', () => {
  const { valid, invalid } = createRuleTester({
    name: 'no-unnecessary-import',
    rule: createRule({
      items: './tests/.unimport-items-fixture.json',
    }),
    configs: {
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
    },
  })

  describe('valid cases', () => {
    it('should not report when import is not auto-imported', () => {
      valid('import { createApp } from "vue"')
    })

    it('should not report when importing from different source', () => {
      valid('import { reactive } from "@vue/reactivity"')
    })

    it('should not report namespace imports', () => {
      valid('import * as Vue from "vue"')
    })

    it('should not report default imports that are not auto-imported', () => {
      valid('import Vue from "vue"')
    })

    it('should not report mixed imports with only non-auto-imported items', () => {
      valid('import { createApp, shallowRef } from "vue"')
    })

    it('should not report type imports that are not auto-imported', () => {
      valid('import type { Component } from "vue"')
    })
  })

  describe('invalid cases - single source', () => {
    it('should remove entire statement for single auto-imported item', async () => {
      const { result } = await invalid({
        code: 'import { ref } from "vue"',
        errors: [{ message: 'Unnecessary import: ref' }],
      })
      expect(result.output).toMatchInlineSnapshot(`""`)
    })

    it('should remove entire statement for multiple auto-imported items', async () => {
      const { result } = await invalid({
        code: 'import { ref, computed, watch } from "vue"',
        errors: [{ message: 'Unnecessary import: ref, computed, watch' }],
      })
      expect(result.output).toMatchInlineSnapshot(`""`)
    })

    it('should remove only auto-imported items when mixed', async () => {
      const { result } = await invalid({
        code: 'import { ref, computed, createApp } from "vue"',
        errors: 2,
      })
      expect(result.output).toMatchInlineSnapshot(`"import {   createApp } from "vue""`)
    })

    it('should handle auto-imported with trailing comma', async () => {
      const { result } = await invalid({
        code: 'import { ref, createApp } from "vue"',
        errors: 1,
      })
      expect(result.output).toMatchInlineSnapshot(`"import {  createApp } from "vue""`)
    })

    it('should handle auto-imported without trailing comma', async () => {
      const { result } = await invalid({
        code: 'import { createApp, ref } from "vue"',
        errors: 1,
      })
      expect(result.output).toMatchInlineSnapshot(`"import { createApp, } from "vue""`)
    })

    it('should handle imports with aliases', async () => {
      const { result } = await invalid({
        code: 'import { ref as vueRef } from "vue"',
        errors: [{ message: 'Unnecessary import: ref' }],
      })
      expect(result.output).toMatchInlineSnapshot(`""`)
    })
  })

  describe('invalid cases - multiple sources', () => {
    it('should remove auto-imported from vue-router', async () => {
      const { result } = await invalid({
        code: 'import { useRoute } from "vue-router"',
        errors: [{ message: 'Unnecessary import: useRoute' }],
      })
      expect(result.output).toMatchInlineSnapshot(`""`)
    })

    it('should handle multiple packages in same file', async () => {
      const { result } = await invalid({
        code: $`
          import { ref } from "vue"
          import { useRouter } from "vue-router"
        `,
        errors: 2,
      })
      expect(result.output).toMatchInlineSnapshot(`"
"`)
    })

    it('should handle imports from pinia', async () => {
      const { result } = await invalid({
        code: 'import { defineStore } from "pinia"',
        errors: [{ message: 'Unnecessary import: defineStore' }],
      })
      expect(result.output).toMatchInlineSnapshot(`""`)
    })
  })

  describe('invalid cases - type imports', () => {
    it('should remove auto-imported type imports', async () => {
      const { result } = await invalid({
        code: 'import type { Ref } from "vue"',
        errors: [{ message: 'Unnecessary import: Ref' }],
      })
      expect(result.output).toMatchInlineSnapshot(`""`)
    })

    it('should remove only auto-imported types when mixed', async () => {
      const { result } = await invalid({
        code: 'import type { Ref, Component } from "vue"',
        errors: 1,
      })
      expect(result.output).toMatchInlineSnapshot(`"import type {  Component } from "vue""`)
    })

    it('should handle mixed value and type imports', async () => {
      const { result } = await invalid({
        code: 'import { ref, type Reactive } from "vue"',
        errors: 1,
      })
      expect(result.output).toMatchInlineSnapshot(`"import {  type Reactive } from "vue""`)
    })
  })

  describe('invalid cases - multiline imports', () => {
    it('should remove entire multiline import when all are auto-imported', async () => {
      const { result } = await invalid({
        code: $`
          import {
            ref,
            computed,
            watch
          } from "vue"
        `,
        errors: [{ message: 'Unnecessary import: ref, computed, watch' }],
      })
      expect(result.output).toMatchInlineSnapshot(`""`)
    })

    it('should remove only auto-imported items from multiline import', async () => {
      const { result } = await invalid({
        code: $`
          import {
            ref,
            computed,
            createApp
          } from "vue"
        `,
        errors: 2,
      })
      expect(result.output).toMatchInlineSnapshot(`
        "import {
          
          
          createApp
        } from "vue""
      `)
    })

    it('should handle complex multiline with mixed types', async () => {
      const { result } = await invalid({
        code: $`import { ref, computed, createApp, defineComponent } from "vue"`,
        errors: 2,
      })
      expect(result.output).toMatchInlineSnapshot(`"import {   createApp, defineComponent } from "vue""`)
    })
  })

  describe('edge cases', () => {
    it('should handle empty .unimport-items.json gracefully', () => {
      const ruleWithEmptyConfig = createRule({
        items: './tests/.unimport-items-empty.json',
      })
      expect(ruleWithEmptyConfig).toBeDefined()
    })

    it('should handle missing config file gracefully', () => {
      const ruleWithMissingConfig = createRule({
        items: './tests/.unimport-items-nonexistent.json',
      })
      expect(ruleWithMissingConfig).toBeDefined()
    })

    it('should not report when source is not in auto-import list', () => {
      valid('import { something } from "unknown-package"')
    })

    it('should preserve formatting when removing items', async () => {
      const { result } = await invalid({
        code: $`
          import {
            ref,
            // some other imports
            createApp
          } from "vue"
        `,
        errors: 1,
      })
      expect(result.output).toMatchInlineSnapshot(`
        "import {
          
          // some other imports
          createApp
        } from "vue""
      `)
    })

    it('should handle single line with multiple auto-imports and comments', async () => {
      const { result } = await invalid({
        code: 'import { ref, /* comment */ computed } from "vue"',
        errors: 1,
      })
      expect(result.output).toMatchInlineSnapshot(`""`)
    })

    it('should handle imports with different spacing', async () => {
      const { result } = await invalid({
        code: 'import {ref,computed,createApp} from "vue"',
        errors: 2,
      })
      expect(result.output).toMatchInlineSnapshot(`"import {createApp} from "vue""`)
    })

    it('should handle complex real-world scenario', async () => {
      const { result } = await invalid({
        code: $`
          import {
            ref,
            computed,
            watch,
            createApp,
            defineComponent,
            shallowRef
          } from "vue"
        `,
        errors: 3,
      })
      expect(result.output).toMatchInlineSnapshot(`
        "import {
          
          
          createApp,
          defineComponent,
          shallowRef
        } from "vue""
      `)
    })
  })
})
