import { createHotContext } from './client'

class DevRuntime {
    modules: Record<string, { exports: any }> = {}

    static getInstance() {
      // @ts-expect-error __rolldown_runtime__
      let instance = globalThis.__rolldown_runtime__;
      if (!instance) {
        instance = new DevRuntime();
        // @ts-expect-error __rolldown_runtime__
        globalThis.__rolldown_runtime__ = instance;
      }
      return instance
    }

    createModuleHotContext(moduleId: string) {
      return createHotContext(moduleId);
    }

    applyUpdates(_boundaries: string[]) {
      // trigger callbacks of accept() correctly
      // for (const moduleId of boundaries) {
      //   const hotContext = this.moduleHotContexts.get(moduleId);
      //   if (hotContext) {
      //     const acceptCallbacks = hotContext.acceptCallbacks;
      //     acceptCallbacks.filter((cb) => {
      //       cb.fn(this.modules[moduleId].exports);
      //     })
      //   }
      // }
      // this.moduleHotContextsToBeUpdated.forEach((hotContext, moduleId) => {
      //   this.moduleHotContexts[moduleId] = hotContext;
      // })
      // this.moduleHotContextsToBeUpdated.clear()
      // swap new contexts
    }

    registerModule(id: string, exportGetters: Record<string, () => any>) {
      const exports = {};
      Object.keys(exportGetters).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(exportGetters, key)) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: exportGetters[key],
          });
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
        };
      }
    }
  
    loadExports(id: string) {
      const module = this.modules[id];
      if (module) {
        return module.exports;
      } else {
        console.warn(`Module ${id} not found`);
        return {};
      }
    }
  
    // __esmMin
    // createEsmInitializer = (fn, res) => () => (fn && (res = fn(fn = 0)), res)
    // __commonJSMin
    // createCjsInitializer = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports)
  }
  
  DevRuntime.getInstance();
  
  // export function loadScript(url: string): void {
  //   const script = document.createElement('script');
  //   script.src = url;
  //   script.type = 'module';
  //   script.onerror = function () {
  //     console.error('Failed to load script: ' + url);
  //   }
  //   document.body.appendChild(script);
  // }
  