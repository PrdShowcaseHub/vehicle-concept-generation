import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/vehicle-concept-generation/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        management: resolve(__dirname, 'management.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true
  }
})
