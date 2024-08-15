import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const timeout = process.env.CI ? 50000 : 30000

export default defineConfig({
  resolve: {
    alias: {
      '~utils': resolve(__dirname, './playground/test-utils'),
    },
  },
  test: {
    include: ['./playground/**/*.spec.[tj]s'],
    exclude: [
      './playground/alias/**/*.spec.[tj]s',
      './playground/assets/**/*.spec.[tj]s',
      './playground/backend-integration/**/*.spec.[tj]s',
      './playground/css-codesplit/**/*.spec.[tj]s',
      './playground/css-codesplit/**/*.spec.[tj]s',
      './playground/css-codesplit/**/*.spec.[tj]s',
      './playground/css-dynamic-import/**/*.spec.[tj]s',
      './playground/dynamic-import/**/*.spec.[tj]s',
      './playground/extensions/**/*.spec.[tj]s',
      './playground/external/**/*.spec.[tj]s',
      './playground/glob-import/**/*.spec.[tj]s',
      './playground/html/**/*.spec.[tj]s',
      './playground/js-sourcemap/**/*.spec.[tj]s',
      './playground/legacy/**/*.spec.[tj]s',
      './playground/lib/**/*.spec.[tj]s',
      './playground/multiple-entrypoints/**/*.spec.[tj]s',
      './playground/object-hooks/**/*.spec.[tj]s',
      './playground/optimize-deps/**/*.spec.[tj]s',
      './playground/proxy-bypass/**/*.spec.[tj]s',
      './playground/resolve/**/*.spec.[tj]s',
      './playground/resolve-config/**/*.spec.[tj]s',
      './playground/ssr-resolve/**/*.spec.[tj]s',
      './playground/ssr-webworker/**/*.spec.[tj]s',
      './playground/worker/**/*.spec.[tj]s',
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
    onConsoleLog(log) {
      if (
        log.match(
          /experimental|jit engine|emitted file|tailwind|The CJS build of Vite/i,
        )
      )
        return false
    },
  },
  esbuild: {
    target: 'node18',
  },
  publicDir: false,
})
