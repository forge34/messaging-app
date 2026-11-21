import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
  },
  // SWC is required so that decorator metadata is emitted for Nest DI.
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
