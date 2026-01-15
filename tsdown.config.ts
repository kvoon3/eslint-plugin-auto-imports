import { defineConfig } from 'tsdown'
import AutoImport from 'unplugin-auto-import/rolldown'

export default defineConfig({
  exports: true,
  // ...config options
  plugins: [
    AutoImport({
      dts: true,
      dumpUnimportItems: true,
      imports: ['vue'],
      dirs: ['./playground/composibles'],
    })
  ]
})
