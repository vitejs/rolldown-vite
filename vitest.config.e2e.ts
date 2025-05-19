import { resolve } from 'node:path'
import { defaultExclude, defineConfig } from 'vitest/config'

const isBuild = !!process.env.VITE_TEST_BUILD

const timeout = process.env.PWDEBUG ? Infinity : process.env.CI ? 50000 : 30000

export default defineConfig({
  resolve: {
    alias: {
      '~utils': resolve(__dirname, './playground/test-utils'),
    },
  },
  test: {
    include: process.env.VITE_TEST_FULL_BUNDLE_MODE
      ? [
          './playground/define/**/*.spec.[tj]s',
          './playground/hmr-root/**/*.spec.[tj]s',
          './playground/hmr/**/*.spec.[tj]s',
        ]
      : ['./playground/**/*.spec.[tj]s'],
    exclude: [
      './playground/legacy/**/*.spec.[tj]s', // system format
      ...(isBuild
        ? [
            './playground/object-hooks/**/*.spec.[tj]s', // object hook sequential
          ]
        : []),
      ...defaultExclude,
    ],
    setupFiles: ['./playground/vitestSetup.ts'],
    globalSetup: ['./playground/vitestGlobalSetup.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    reporters: 'dot',
    deps: {
      // Prevent Vitest from running the workspace packages in Vite's SSR runtime
      moduleDirectories: ['node_modules', 'packages'],
    },
  },
  esbuild: {
    target: 'node18',
  },
  publicDir: false,
})
