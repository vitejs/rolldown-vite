import {
  type ParseResult,
  parseAst as rolldownParseAst,
  parseAstAsync as rolldownParseAstAsync,
} from 'rolldown/parseAst'

// TODO: move this compat layer to Rolldown

const parseAstGeneric = (
  code: string,
  opts?: any,
  filename?: string,
): ParseResult => {
  const result = rolldownParseAst(filename ?? 'file.js', code, {
    sourceType: 'module',
    lang: 'js',
    preserveParens: false,
    convertSpanUtf16: true,
    ...opts,
  })
  if (result.errors.length > 0) {
    throw new AggregateError(result.errors)
  }

  return result
}

export const parseAstGenericAsync = async (
  code: string,
  opts?: any,
  filename?: string,
): Promise<ParseResult> => {
  const result = await rolldownParseAstAsync(filename ?? 'file.js', code, {
    sourceType: 'module',
    lang: 'js',
    preserveParens: false,
    convertSpanUtf16: true,
    ...opts,
  })
  if (result.errors.length > 0) {
    throw new AggregateError(result.errors)
  }

  return result
}

export const parseAst = (code: string, opts?: any, filename?: string): any => {
  return parseAstGeneric(code, opts, filename).program
}

export const parseAstAsync = async (
  code: string,
  opts?: any,
  filename?: string,
): Promise<any> => {
  const result = await parseAstGenericAsync(code, opts, filename)
  return result.program
}
