import type { Connect } from 'dep-types/connect'
import { cleanUrl } from '../../../shared/utils'
import type { ViteDevServer } from '..'

export function memoryFilesMiddleware(server: ViteDevServer, handleHtml: boolean): Connect.NextHandleFunction {
  return function viteMemoryFilesMiddleware(req, res, next)  {
      const cleanedUrl = cleanUrl(req.url!).slice(1) // remove first /
      if (cleanedUrl.endsWith('.html') && !handleHtml) { 
        return next()
      }
      const file = server.memoryFiles[cleanedUrl]
      if (
        file
      ) {
        if (cleanedUrl.endsWith('.js')) {
          res.setHeader('Content-Type', 'text/javascript')
        }
        const headers = server.config.server.headers
        if (headers) {
          for (const name in headers) {
            res.setHeader(name, headers[name]!)
          }
        }
        
        return res.end(file)
      }
      next()
    }
}
