import { createHotContext } from './client'

declare const __FULL_BUNDLE_MODE__: boolean

if (__FULL_BUNDLE_MODE__) {
  class DevRuntime {
    modules: Record<string, { exports: any }> = {}

    static getInstance() {
      // @ts-expect-error __rolldown_runtime__
      let instance = globalThis.__rolldown_runtime__
      if (!instance) {
        instance = new DevRuntime()
        // @ts-expect-error __rolldown_runtime__
        globalThis.__rolldown_runtime__ = instance
      }
      return instance
    }

    createModuleHotContext(moduleId: string) {
      return createHotContext(moduleId)
    }

    applyUpdates(_boundaries: string[]) {
      //
    }

    registerModule(
      id: string,
      esmExportGettersOrCjsExports: Record<string, () => any>,
      meta: { cjs?: boolean } = {},
    ) {
      const exports = {}
      Object.keys(esmExportGettersOrCjsExports).forEach((key) => {
        if (
          Object.prototype.hasOwnProperty.call(
            esmExportGettersOrCjsExports,
            key,
          )
        ) {
          if (meta.cjs) {
            Object.defineProperty(exports, key, {
              enumerable: true,
              get: () => esmExportGettersOrCjsExports[key],
            })
          } else {
            Object.defineProperty(exports, key, {
              enumerable: true,
              get: esmExportGettersOrCjsExports[key],
            })
          }
        }
      })
      if (this.modules[id]) {
        this.modules[id] = {
          exports,
        }
      } else {
        // If the module is not in the cache, we need to register it.
        this.modules[id] = {
          exports,
        }
      }
    }

    loadExports(id: string) {
      const module = this.modules[id]
      if (module) {
        return module.exports
      } else {
        console.warn(`Module ${id} not found`)
        return {}
      }
    }

    // __esmMin
    // createEsmInitializer = (fn, res) => () => (fn && (res = fn(fn = 0)), res)
    // __commonJSMin
    // createCjsInitializer = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports)
  }

  DevRuntime.getInstance()
}
