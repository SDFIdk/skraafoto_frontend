import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        singleview: resolve(__dirname, 'singleview.html'),
        twinview: resolve(__dirname, 'twinview.html'),
        was: resolve(__dirname, 'was/index.html'),
      },
    },
  },
  assetsInclude: ['**/*.tiff']
})