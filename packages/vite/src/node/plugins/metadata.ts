import type { ChunkMetadata } from 'types/metadata'
import type { OutputChunk, RenderedChunk } from 'rolldown'
import type { Plugin } from '../plugin'

// TODO: avoid memory leak
const chunkMetadataMap = new Map<string, ChunkMetadata>()

/**
 * Prepares the rendered chunks to contain additional metadata during build.
 */
export function metadataPlugin(): Plugin {
  // const chunkMetadataMap = new Map<string, ChunkMetadata>();
  return {
    name: 'vite:build-metadata',

    // api: {
    //   getChunkMatadata: (chunk: RenderedChunk | OutputChunk): ChunkMetadata | undefined => {
    //     const preliminaryFileName =
    //     'preliminaryFileName' in chunk ? chunk.preliminaryFileName : chunk.fileName
    //     return chunkMetadataMap.get(preliminaryFileName)
    //   }
    // },

    renderChunk(_code, chunk) {
      // Since the chunk come from rust side, mutate it directly will not sync back to rust side.
      // The next usage will lost the metadata
      chunkMetadataMap.set(chunk.fileName, {
        importedAssets: new Set(),
        importedCss: new Set(),
      })
    },

    // generateBundle: {
    //   order: "pre",
    //   handler(outputOptions, bundle, isWrite) {
    //     bundle;
    //   },
    // }
  }
}

// TODO: give users a way to access the metadata
export function getChunkMetadata(
  chunk: RenderedChunk | OutputChunk,
): ChunkMetadata | undefined {
  // console.log(chunk.fileName, chunk.viteMetadata);
  return chunk.viteMetadata
  // const preliminaryFileName =
  //   'preliminaryFileName' in chunk ? chunk.preliminaryFileName : chunk.fileName
  // return chunkMetadataMap.get(preliminaryFileName)
}
