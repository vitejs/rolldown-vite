import fs from 'node:fs'
import module from 'node:module'
import { defineConfig } from 'vite'
const require = module.createRequire(import.meta.url)

export default defineConfig({
  resolve: {
    dedupe: ['react'],
    alias: {
      'node:url': 'url',
      '@vitejs/test-dep-alias-using-absolute-path': require.resolve(
        '@vitejs/test-dep-alias-using-absolute-path',
      ),
    },
  },
  optimizeDeps: {
    include: [
      '@vitejs/test-dep-linked-include',
      '@vitejs/test-nested-exclude > @vitejs/test-nested-include',
      '@vitejs/test-dep-cjs-external-package-omit-js-suffix',
      // will throw if optimized (should log warning instead)
      '@vitejs/test-non-optimizable-include',
      '@vitejs/test-dep-optimize-exports-with-glob/**/*',
      '@vitejs/test-dep-optimize-exports-with-root-glob/**/*.js',
      '@vitejs/test-dep-optimize-with-glob/**/*.js',
      '@vitejs/test-dep-cjs-with-external-deps',
    ],
    exclude: [
      '@vitejs/test-nested-exclude',
      '@vitejs/test-dep-non-optimized',
      '@vitejs/test-dep-esm-external',
      'stream',
    ],
    rollupOptions: {
      plugins: [
        {
          name: 'replace-a-file',
          load(id) {
            if (/dep-esbuild-plugin-transform(?:\\|\/)index\.js$/.test(id)) {
              return `export const hello = () => 'Hello from an esbuild plugin'`
            }
          },
        },
      ],
    },
    entries: ['index.html', 'unused-split-entry.js'],
  },

  build: {
    // to make tests faster
    minify: false,
  },

  plugins: [
    testVue(),
    notjs(),
    // for axios request test
    {
      name: 'mock',
      configureServer({ middlewares }) {
        middlewares.use('/ping', (_, res) => {
          res.statusCode = 200
          res.end('pong')
        })
      },
      configurePreviewServer({ middlewares }) {
        middlewares.use('/ping', (_, res) => {
          res.statusCode = 200
          res.end('pong')
        })
      },
    },
    {
      name: 'test-astro',
      transform(code, id) {
        if (id.endsWith('.astro')) {
          code = `export default {}`
          return { code }
        }
      },
    },
  ],
})

// Handles Test.vue in dep-linked-include package
function testVue() {
  return {
    name: 'testvue',
    transform(code, id) {
      if (id.includes('dep-linked-include/Test.vue')) {
        return {
          code: `
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Test',
  render() {
    return '[success] rendered from Vue'
  }
})
`.trim(),
        }
      }

      // fallback to empty module for other vue files
      if (id.endsWith('.vue')) {
        return { code: `export default {}` }
      }
    },
  }
}

// Handles .notjs file, basically remove wrapping <notjs> and </notjs> tags
function notjs() {
  return {
    name: 'notjs',
    config() {
      return {
        optimizeDeps: {
          extensions: ['.notjs'],
          rollupOptions: {
            plugins: [
              {
                name: 'esbuild-notjs',
                load: {
                  filter: { id: /\.notjs$/ },
                  handler(id) {
                    let contents = fs.readFileSync(id, 'utf-8')
                    contents = contents
                      .replace('<notjs>', '')
                      .replace('</notjs>', '')
                    return contents
                  },
                },
              },
            ],
          },
        },
      }
    },
    transform(code, id) {
      if (id.endsWith('.notjs')) {
        code = code.replace('<notjs>', '').replace('</notjs>', '')
        return { code }
      }
    },
  }
}
