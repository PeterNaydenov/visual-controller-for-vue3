import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  publicDir: false,
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'VisualController',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `visual-controller-for-vue3.${format === 'es' ? 'esm.mjs' : format === 'umd' ? 'umd.js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue', 'ask-for-promise'],
      output: {
        dir: 'dist',
        globals: { vue: 'vue', 'ask-for-promise': 'askForPromise' }
      }
    }
  }
})