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

    registerModule(id: string, exports: Record<string, () => unknown>) {
      this.modules[id] = {
        exports,
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
    // @ts-expect-error need to add typing
    createEsmInitializer = (fn, res) => () => (fn && (res = fn((fn = 0))), res)
    // __commonJSMin
    // @ts-expect-error need to add typing
    createCjsInitializer = (cb, mod) => () => (
      mod || cb((mod = { exports: {} }).exports, mod), mod.exports
    )
    // @ts-expect-error it is exits
    __toESM = __toESM
    // @ts-expect-error it is exits
    __toCommonJS = __toCommonJS
    // @ts-expect-error it is exits
    __export = __export
  }

  // @ts-expect-error __rolldown_runtime__
  globalThis.__rolldown_runtime__ ||= new DevRuntime()
}
