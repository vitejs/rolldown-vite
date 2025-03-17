export interface ChunkMetadata {
  importedAssets: Set<string>
  importedCss: Set<string>
  /** @internal */
  __modules: any
}

declare module 'rolldown' {
  export interface RenderedChunk {
    viteMetadata?: ChunkMetadata
  }
  export interface OutputChunk {
    viteMetadata?: ChunkMetadata
  }
}
