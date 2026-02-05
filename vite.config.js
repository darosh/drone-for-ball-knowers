import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    outDir: './docs'
  }
  // optimizeDeps: {
  //   include: ['three', 'three/webgpu', 'three/tsl'],
  //   exclude: ['@threlte/core', '@threlte/extras', '@threlte/rapier']
  // },
  // resolve: {
  //   dedupe: ['three']
  // }
})
