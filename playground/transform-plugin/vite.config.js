import { resolve } from 'node:path'
import { defineConfig, normalizePath } from 'vite'

const file = normalizePath(resolve(__dirname, 'index.js'))
let transformCount = 1

const transformPlugin = {
  name: 'transform',
  load(id) {
    if (id === file) {
      // Ensure `index.js` is reloaded if 'plugin-dep-load.js' is changed
      this.addWatchFile('./plugin-dep-load.js')
    }
  },
  transform(code, id) {
    if (id === file) {
      // Ensure `index.js` is reevaluated if 'plugin-dep.js' is changed
      this.addWatchFile('./plugin-dep.js')

      return `
        // Inject TRANSFORM_COUNT
        let TRANSFORM_COUNT = ${transformCount++};

        ${code}
      `
    }
  },
}

const moduleTypePlugins = /** @type {const} */ (['pre', 'post']).map(
  (enforce) => ({
    name: `module-type-${enforce}`,
    enforce,
    transform(code, id, opts) {
      if (id.endsWith('/foo.json')) {
        code = code.replace(
          `MODULE_TYPE_${enforce.toUpperCase()}`,
          opts.moduleType,
        )
        return code
      }
    },
  }),
)

export default defineConfig({
  plugins: [transformPlugin, moduleTypePlugins],
})
