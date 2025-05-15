import type { ModuleInfo } from 'rolldown'
import type { ViteDevServer } from "..";
import type { Plugin } from '../plugin'
import { cleanUrl } from "../../shared/utils";
import type { TransformResult } from './transformRequest'
import type { EnvironmentModuleNode, ResolvedUrl } from "./moduleGraph"

export class BuildModuleNode {
    _id: string
    _file: string
    _importers = new Set<BuildModuleNode>
    constructor(id: string, file: string) {
        this._id = id
        this._file = file
    }
  
    // TODO using id also could be work
    get url(): string {
      return this._id
    }
    set url(_value: string) {
        throw new Error("BuildModuleNode set url is not support");
    }
 
    get id(): string | null {
      return this._id
    }
    set id(_value: string | null) {
        throw new Error("BuildModuleNode set id is not support");
    }
    get file(): string | null {
        return this._file
    }
    set file(_value: string | null) {
        throw new Error("BuildModuleNode set file is not support");
    }
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get type(): 'js' | 'css' {
      return 'js'
    }
    // `info` needs special care as it's defined as a proxy in `pluginContainer`,
    // so we also merge it as a proxy too
    get info(): ModuleInfo | undefined {
        throw new Error("BuildModuleNode get info is not support");
    }
    get meta(): Record<string, any> | undefined {
        throw new Error("BuildModuleNode get meta is not support");
    }
    get importers(): Set<BuildModuleNode> {
        throw this._importers;
    }
    set importers(importers: Set<BuildModuleNode>) {
        this._importers = importers;
    }
    get clientImportedModules(): Set<BuildModuleNode> {
        throw new Error("BuildModuleNode get clientImportedModules is not support");
    }
    get ssrImportedModules(): Set<BuildModuleNode> {
        throw new Error("BuildModuleNode get ssrImportedModules is not support");
    }
    get importedModules(): Set<BuildModuleNode> {
        throw new Error("BuildModuleNode get importedModules is not support");
    }
    get acceptedHmrDeps(): Set<BuildModuleNode> {
        throw new Error("BuildModuleNode get acceptedHmrDeps is not support");
    }
    get acceptedHmrExports(): Set<string> | null {
        throw new Error("BuildModuleNode get acceptedHmrExports is not support");
    }
    get importedBindings(): Map<string, Set<string>> | null {
        throw new Error("BuildModuleNode get importedBindings is not support");
    }
    get isSelfAccepting(): boolean | undefined {
        throw new Error("BuildModuleNode get isSelfAccepting is not support");
    }
    get transformResult(): TransformResult | null {
        throw new Error("BuildModuleNode get transformResult is not support");
    }
    set transformResult(_value: TransformResult | null) {
        throw new Error("BuildModuleNode set transformResult is not support");
    }
    get ssrTransformResult(): TransformResult | null {
        throw new Error("BuildModuleNode get ssrTransformResult is not support");
    }
    set ssrTransformResult(_value: TransformResult | null) {
        throw new Error("BuildModuleNode set ssrTransformResult is not support");
    }
    get ssrModule(): Record<string, any> | null {
        throw new Error("BuildModuleNode get ssrModule is not support");
    }
    get ssrError(): Error | null {
        throw new Error("BuildModuleNode get ssrError is not support");
    }
    get lastHMRTimestamp(): number {
        throw new Error("BuildModuleNode get lastHMRTimestamp is not support");
    }
    set lastHMRTimestamp(_value: number) {
        throw new Error("BuildModuleNode set lastHMRTimestamp is not support");
    }
    get lastInvalidationTimestamp(): number {
        throw new Error("BuildModuleNode get lastInvalidationTimestamp is not support");
    }
    get invalidationState(): TransformResult | 'HARD_INVALIDATED' | undefined {
        throw new Error("BuildModuleNode get invalidationState is not support");
    }
    get ssrInvalidationState(): TransformResult | 'HARD_INVALIDATED' | undefined {
        throw new Error("BuildModuleNode get ssrInvalidationState is not support");
    }
}
  

export class BuildModuleGraph {
  idToModuleMap = new Map<string, BuildModuleNode>()
  fileToModulesMap = new Map<string, Set<BuildModuleNode>>()

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  getModuleById(id: string): BuildModuleNode | undefined {
    return this.idToModuleMap.get(id);
  }

  async getModuleByUrl(
    _url: string,
    _ssr?: boolean,
  ): Promise<BuildModuleNode | undefined> {
    throw new Error("BuildModuleGraph getModuleByUrl is not support");
  }

  getModulesByFile(file: string): Set<BuildModuleNode> | undefined {
    return this.fileToModulesMap.get(file);
  }

  onFileChange(_file: string): void {
    throw new Error("BuildModuleGraph onFileChange is not support");
  }

  onFileDelete(_file: string): void {
    throw new Error("BuildModuleGraph onFileDelete is not support");
  }

  
  invalidateModule(
    _mod: BuildModuleNode,
    _seen = new Set<BuildModuleNode>(),
    _timestamp: number = Date.now(),
    _isHmr: boolean = false,
    /** @internal */
    _softInvalidate = false,
  ): void {
    throw new Error("BuildModuleGraph invalidateModule is not support");
  }

  invalidateAll(): void {
    throw new Error("BuildModuleGraph invalidateAll is not support");
  }


  async ensureEntryFromUrl(
    _rawUrl: string,
    _ssr?: boolean,
    _setIsSelfAccepting = true,
  ): Promise<BuildModuleNode> {
    throw new Error("BuildModuleGraph invalidateAll is not support");
  }

  createFileOnlyEntry(_file: string): BuildModuleNode {
    throw new Error("BuildModuleGraph createFileOnlyEntry is not support");
  }

  async resolveUrl(_url: string, _ssr?: boolean): Promise<ResolvedUrl> {
    throw new Error("BuildModuleGraph resolveUrl is not support");
  }

  updateModuleTransformResult(
    _mod: BuildModuleNode,
    _result: TransformResult | null,
    _ssr?: boolean,
  ): void {
    throw new Error("BuildModuleGraph updateModuleTransformResult is not support");
  }

  getModuleByEtag(_etag: string): BuildModuleNode | undefined {
    throw new Error("BuildModuleGraph getModuleByEtag is not support");
  }

  getBackwardCompatibleBrowserModuleNode(
    _clientModule: EnvironmentModuleNode,
  ): BuildModuleNode {
    throw new Error("BuildModuleGraph getBackwardCompatibleBrowserModuleNode is not support");
  }

  getBackwardCompatibleServerModuleNode(
    _ssrModule: EnvironmentModuleNode,
  ): BuildModuleNode {
    throw new Error("BuildModuleGraph getBackwardCompatibleServerModuleNode is not support");
  }

  getBackwardCompatibleModuleNode(_mod: EnvironmentModuleNode): BuildModuleNode {
    throw new Error("BuildModuleGraph getBackwardCompatibleModuleNode is not support");
  }

  getBackwardCompatibleModuleNodeDual(
    _clientModule?: EnvironmentModuleNode,
    _ssrModule?: EnvironmentModuleNode,
  ): BuildModuleNode {
    throw new Error("BuildModuleGraph getBackwardCompatibleModuleNodeDual is not support");
  }
}

export function buildModuleGraphPlugin(server: ViteDevServer): Plugin {
    return {
        name: 'build-module-graph-plugin',
       renderStart() {
            const moduleGraph = server.moduleGraph as BuildModuleGraph
            for (const id of this.getModuleIds()) {
                // const moduleInfo = this.getModuleInfo(id)!
                const file = cleanUrl(id)
                const moduleNode = new BuildModuleNode(id, file);
                moduleGraph.idToModuleMap.set(id, moduleNode)

                moduleGraph.fileToModulesMap.set(file, new Set([moduleNode]))
                let fileMappedModules = moduleGraph.fileToModulesMap.get(file)
                if (!fileMappedModules) {
                fileMappedModules = new Set()
                moduleGraph.fileToModulesMap.set(file, fileMappedModules)
                }
                fileMappedModules.add(moduleNode)
            }
            for (const id of this.getModuleIds()) {
                const moduleInfo = this.getModuleInfo(id)!
                const moduleNode = moduleGraph.idToModuleMap.get(id);
                moduleNode!.importers = new Set(moduleInfo.importers.map((importerId) => moduleGraph.idToModuleMap.get(importerId)!))
            }
        }
    }
}