import { defineConfig } from 'vite'

export default defineConfig(() => ({
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'VisualController',
      fileName: (format) => `visual-controller-for-vue3.${format === 'es' ? 'esm.mjs' : format === 'umd' ? 'umd.js' : 'cjs'}`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'ask-for-promise'],
      output: {
        dir: 'dist',
        globals: { vue: 'vue', 'ask-for-promise': 'askForPromise' }
      }
    }
  }
}))