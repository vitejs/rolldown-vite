import type { Plugin } from '../plugin'

interface ChunkMetadata {
  importedAssets: Set<string>
  importedCss: Set<string>
}

const chunkMetadataMap = new Map<string, ChunkMetadata>()

/**
 * Prepares the rendered chunks to contain additional metadata during build.
 */
export function metadataPlugin(): Plugin {
  return {
    name: 'vite:build-metadata',

    async renderChunk(_code, chunk) {
      chunkMetadataMap.set(chunk.fileName, {
        importedAssets: new Set(),
        importedCss: new Set(),
      })
      return null
    },
  }
}

export function getChunkMetadata(fileName: string): ChunkMetadata | undefined {
  return chunkMetadataMap.get(fileName)
}
