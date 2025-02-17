import {
  parseAst as rolldownParseAst,
  parseAstAsync as rolldownParseAstAsync,
} from 'rolldown/parseAst'

// TODO: move this compat layer to Rolldown

export const parseAst = (code: string, opts?: any, filename?: string): any => {
  return rolldownParseAst(filename ?? 'file.js', code, {
    sourceType: 'module',
    lang: 'js',
    preserveParens: false,
    convertSpanUtf16: true,
    ...opts,
  })
}

export const parseAstAsync = async (
  code: string,
  opts?: any,
  filename?: string,
): Promise<any> => {
  return await rolldownParseAstAsync(filename ?? 'file.js', code, {
    sourceType: 'module',
    lang: 'js',
    preserveParens: false,
    convertSpanUtf16: true,
    ...opts,
  })
}
