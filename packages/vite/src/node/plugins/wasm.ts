import { exactRegex } from '@rolldown/pluginutils'
import {
  wasmFallbackPlugin as nativeWasmFallbackPlugin,
  wasmHelperPlugin as nativeWasmHelperPlugin,
} from 'rolldown/experimental'
import type { Plugin } from '../plugin'
import type { ResolvedConfig } from '..'
import { fileToUrl } from './asset'

const wasmHelperId = '\0vite/wasm-helper.js'

const wasmInitRE = /(?<![?#].*)\.wasm\?init/

const wasmHelper = async (opts = {}, url: string) => {
  let result
  if (url.startsWith('data:')) {
    const urlContent = url.replace(/^data:.*?base64,/, '')
    let bytes
    if (typeof Buffer === 'function' && typeof Buffer.from === 'function') {
      bytes = Buffer.from(urlContent, 'base64')
    } else if (typeof atob === 'function') {
      const binaryString = atob(urlContent)
      bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
    } else {
      throw new Error(
        'Failed to decode base64-encoded data URL, Buffer and atob are not supported',
      )
    }
    result = await WebAssembly.instantiate(bytes, opts)
  } else {
    // https://github.com/mdn/webassembly-examples/issues/5
    // WebAssembly.instantiateStreaming requires the server to provide the
    // correct MIME type for .wasm files, which unfortunately doesn't work for
    // a lot of static file servers, so we just work around it by getting the
    // raw buffer.
    const response = await fetch(url)
    const contentType = response.headers.get('Content-Type') || ''
    if (
      'instantiateStreaming' in WebAssembly &&
      contentType.startsWith('application/wasm')
    ) {
      result = await WebAssembly.instantiateStreaming(response, opts)
    } else {
      const buffer = await response.arrayBuffer()
      result = await WebAssembly.instantiate(buffer, opts)
    }
  }
  return result.instance
}

const wasmHelperCode = wasmHelper.toString()

export const wasmHelperPlugin = (config: ResolvedConfig): Plugin => {
  if (
    config.experimental.enableNativePlugin === true &&
    config.command === 'build'
  ) {
    return nativeWasmHelperPlugin({
      decodedBase: config.decodedBase,
    })
  }

  return {
    name: 'vite:wasm-helper',

    resolveId: {
      filter: { id: exactRegex(wasmHelperId) },
      handler(id) {
        return id
      },
    },

    load: {
      filter: { id: [exactRegex(wasmHelperId), wasmInitRE] },
      async handler(id) {
        if (id === wasmHelperId) {
          return `export default ${wasmHelperCode}`
        }

        const url = await fileToUrl(this, id)

        return `
  import initWasm from "${wasmHelperId}"
  export default opts => initWasm(opts, ${JSON.stringify(url)})
  `
      },
    },
  }
}

export const wasmFallbackPlugin = (config: ResolvedConfig): Plugin => {
  if (config.experimental.enableNativePlugin === true) {
    return nativeWasmFallbackPlugin()
  }

  return {
    name: 'vite:wasm-fallback',

    load: {
      filter: { id: /\.wasm$/ },
      handler(_id) {
        throw new Error(
          '"ESM integration proposal for Wasm" is not supported currently. ' +
            'Use vite-plugin-wasm or other community plugins to handle this. ' +
            'Alternatively, you can use `.wasm?init` or `.wasm?url`. ' +
            'See https://vite.dev/guide/features.html#webassembly for more details.',
        )
      },
    },
  }
}
