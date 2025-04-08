import aliasPlugin, { type ResolverFunction } from '@rollup/plugin-alias'
import type { ObjectHook } from 'rolldown'
import {
  aliasPlugin as nativeAliasPlugin,
  dynamicImportVarsPlugin as nativeDynamicImportVarsPlugin,
  importGlobPlugin as nativeImportGlobPlugin,
  jsonPlugin as nativeJsonPlugin,
  modulePreloadPolyfillPlugin as nativeModulePreloadPolyfillPlugin,
  transformPlugin as nativeTransformPlugin,
  wasmFallbackPlugin as nativeWasmFallbackPlugin,
  wasmHelperPlugin as nativeWasmHelperPlugin,
} from 'rolldown/experimental'
import type { PluginHookUtils, ResolvedConfig } from '../config'
import {
  type HookHandler,
  type Plugin,
  type PluginWithRequiredHook,
  perEnvironmentPlugin,
} from '../plugin'
import { watchPackageDataPlugin } from '../packages'
import { jsonPlugin } from './json'
import { oxcResolvePlugin, resolvePlugin } from './resolve'
// import { optimizedDepsPlugin } from './optimizedDeps'
// import { importAnalysisPlugin } from './importAnalysis'
import { 
  // cssAnalysisPlugin,
   cssPlugin, cssPostPlugin } from './css'
import { assetPlugin } from './asset'
// import { clientInjectionsPlugin } from './clientInjections'
import { buildHtmlPlugin, htmlInlineProxyPlugin } from './html'
import { wasmFallbackPlugin, wasmHelperPlugin } from './wasm'
import { modulePreloadPolyfillPlugin } from './modulePreloadPolyfill'
import { webWorkerPlugin } from './worker'
// import { preAliasPlugin } from './preAlias'
import { definePlugin } from './define'
import { workerImportMetaUrlPlugin } from './workerImportMetaUrl'
import { assetImportMetaUrlPlugin } from './assetImportMetaUrl'
import { dynamicImportVarsPlugin } from './dynamicImportVars'
import { importGlobPlugin } from './importMetaGlob'
import {
  type PluginFilterWithFallback,
  type TransformHookFilter,
  createFilterForTransform,
  createIdFilter,
} from './pluginFilter'
import { oxcPlugin } from './oxc'

export async function resolvePlugins(
  config: ResolvedConfig,
  prePlugins: Plugin[],
  normalPlugins: Plugin[],
  postPlugins: Plugin[],
): Promise<Plugin[]> {
  const isBuild = config.command === 'build'
  const isWorker = config.isWorker
  const buildPlugins = isBuild
    ? await (await import('../build')).resolveBuildPlugins(config)
    : { pre: [], post: [] }
  const { modulePreload } = config.build
  const enableNativePlugin = config.experimental.enableNativePlugin

  return [
    // !isBuild ? optimizedDepsPlugin() : null,
    !isWorker ? watchPackageDataPlugin(config.packageCache) : null,
    // !isBuild ? preAliasPlugin(config) : null,
    enableNativePlugin === true
      ? nativeAliasPlugin({
          entries: config.resolve.alias.map((item) => {
            return {
              find: item.find,
              replacement: item.replacement,
            }
          }),
        })
      : aliasPlugin({
          // @ts-expect-error aliasPlugin receives rollup types
          entries: config.resolve.alias,
          customResolver: viteAliasCustomResolver,
        }),

    ...prePlugins,

    modulePreload !== false && modulePreload.polyfill
      ? enableNativePlugin === true
        ? perEnvironmentPlugin(
            'native:modulepreload-polyfill',
            (environment) => {
              if (
                config.command !== 'build' ||
                environment.config.consumer !== 'client'
              )
                return false
              return nativeModulePreloadPolyfillPlugin({
                skip: false,
              })
            },
          )
        : modulePreloadPolyfillPlugin(config)
      : null,
    ...(enableNativePlugin
      ? oxcResolvePlugin(
          {
            root: config.root,
            isProduction: config.isProduction,
            isBuild,
            packageCache: config.packageCache,
            asSrc: true,
            optimizeDeps: true,
            externalize: true,
          },
          isWorker ? { ...config, consumer: 'client' } : undefined,
        )
      : [
          resolvePlugin({
            root: config.root,
            isProduction: config.isProduction,
            isBuild,
            packageCache: config.packageCache,
            asSrc: true,
            optimizeDeps: true,
            externalize: true,
          }),
        ]),
    htmlInlineProxyPlugin(config),
    cssPlugin(config),
    config.oxc !== false
      ? enableNativePlugin === true
        ? nativeTransformPlugin()
        : oxcPlugin(config)
      : null,
    enableNativePlugin === true
      ? nativeJsonPlugin({ ...config.json, isBuild })
      : jsonPlugin(config.json, isBuild),
    enableNativePlugin === true ? nativeWasmHelperPlugin() : wasmHelperPlugin(),
    webWorkerPlugin(config),
    assetPlugin(config),

    ...normalPlugins,

    enableNativePlugin === true
      ? nativeWasmFallbackPlugin()
      : wasmFallbackPlugin(),
    definePlugin(config),
    cssPostPlugin(config),
    // isBuild && 
    buildHtmlPlugin(config),
    workerImportMetaUrlPlugin(config),
    assetImportMetaUrlPlugin(config),
    ...buildPlugins.pre,
    enableNativePlugin === true
      ? nativeDynamicImportVarsPlugin()
      : dynamicImportVarsPlugin(config),
    enableNativePlugin === true
      ? nativeImportGlobPlugin({
          root: config.root,
          restoreQueryExtension: config.experimental.importGlobRestoreExtension,
        })
      : importGlobPlugin(config),

    ...postPlugins,

    ...buildPlugins.post,

    // // internal server-only plugins are always applied after everything else
    // ...(isBuild
    //   ? []
    //   : [
    //       clientInjectionsPlugin(config),
    //       cssAnalysisPlugin(config),
    //       importAnalysisPlugin(config),
    //     ]),
  ].filter(Boolean) as Plugin[]
}

export function createPluginHookUtils(
  plugins: readonly Plugin[],
): PluginHookUtils {
  // sort plugins per hook
  const sortedPluginsCache = new Map<keyof Plugin, Plugin[]>()
  function getSortedPlugins<K extends keyof Plugin>(
    hookName: K,
  ): PluginWithRequiredHook<K>[] {
    if (sortedPluginsCache.has(hookName))
      return sortedPluginsCache.get(hookName) as PluginWithRequiredHook<K>[]
    const sorted = getSortedPluginsByHook(hookName, plugins)
    sortedPluginsCache.set(hookName, sorted)
    return sorted
  }
  function getSortedPluginHooks<K extends keyof Plugin>(
    hookName: K,
  ): NonNullable<HookHandler<Plugin[K]>>[] {
    const plugins = getSortedPlugins(hookName)
    return plugins.map((p) => getHookHandler(p[hookName])).filter(Boolean)
  }

  return {
    getSortedPlugins,
    getSortedPluginHooks,
  }
}

export function getSortedPluginsByHook<K extends keyof Plugin>(
  hookName: K,
  plugins: readonly Plugin[],
): PluginWithRequiredHook<K>[] {
  const sortedPlugins: Plugin[] = []
  // Use indexes to track and insert the ordered plugins directly in the
  // resulting array to avoid creating 3 extra temporary arrays per hook
  let pre = 0,
    normal = 0,
    post = 0
  for (const plugin of plugins) {
    const hook = plugin[hookName]
    if (hook) {
      if (typeof hook === 'object') {
        if (hook.order === 'pre') {
          sortedPlugins.splice(pre++, 0, plugin)
          continue
        }
        if (hook.order === 'post') {
          sortedPlugins.splice(pre + normal + post++, 0, plugin)
          continue
        }
      }
      sortedPlugins.splice(pre + normal++, 0, plugin)
    }
  }

  return sortedPlugins as PluginWithRequiredHook<K>[]
}

export function getHookHandler<T extends ObjectHook<Function>>(
  hook: T,
): HookHandler<T> {
  return (typeof hook === 'object' ? hook.handler : hook) as HookHandler<T>
}

type FilterForPluginValue = {
  resolveId?: PluginFilterWithFallback | undefined
  load?: PluginFilterWithFallback | undefined
  transform?: TransformHookFilter | undefined
}
const filterForPlugin = new WeakMap<Plugin, FilterForPluginValue>()

export function getCachedFilterForPlugin<
  H extends 'resolveId' | 'load' | 'transform',
>(plugin: Plugin, hookName: H): FilterForPluginValue[H] | undefined {
  let filters = filterForPlugin.get(plugin)
  if (filters && hookName in filters) {
    return filters[hookName]
  }

  if (!filters) {
    filters = {}
    filterForPlugin.set(plugin, filters)
  }

  let filter: PluginFilterWithFallback | TransformHookFilter | undefined
  switch (hookName) {
    case 'resolveId': {
      const rawFilter =
        typeof plugin.resolveId === 'object'
          ? plugin.resolveId.filter?.id
          : undefined
      filters.resolveId = createIdFilter(rawFilter)
      filter = filters.resolveId
      break
    }
    case 'load': {
      const rawFilter =
        typeof plugin.load === 'object' ? plugin.load.filter?.id : undefined
      filters.load = createIdFilter(rawFilter)
      filter = filters.load
      break
    }
    case 'transform': {
      const rawFilters =
        typeof plugin.transform === 'object'
          ? plugin.transform.filter
          : undefined
      filters.transform = createFilterForTransform(
        rawFilters?.id,
        rawFilters?.code,
      )
      filter = filters.transform
      break
    }
  }
  return filter as FilterForPluginValue[H] | undefined
}

// Same as `@rollup/plugin-alias` default resolver, but we attach additional meta
// if we can't resolve to something, which will error in `importAnalysis`
export const viteAliasCustomResolver: ResolverFunction = async function (
  id,
  importer,
  options,
) {
  const resolved = await this.resolve(id, importer, options)
  return resolved || { id, meta: { 'vite:alias': { noResolved: true } } }
}
