import { resolve } from 'node:path'
import { loadConfigFromFile } from 'vite'
import { describe, expect, it } from 'vitest'

const [nvMajor, nvMinor] = process.versions.node.split('.').map(Number)
const isImportAttributesSupported =
  (nvMajor === 18 && nvMinor >= 20) ||
  // Node v19 doesn't support import attributes
  (nvMajor === 20 && nvMinor >= 10) ||
  nvMajor >= 21

it('loadConfigFromFile', async () => {
  const { config } = await loadConfigFromFile(
    {} as any,
    resolve(__dirname, '../packages/entry/vite.config.ts'),
    resolve(__dirname, '../packages/entry'),
  )
  expect(config).toMatchInlineSnapshot(`
    {
      "array": [
        [
          1,
          3,
        ],
        [
          2,
          4,
        ],
      ],
      "importsField": "imports-field",
      "moduleCondition": "import condition",
    }
  `)
})

it.runIf(isImportAttributesSupported)(
  'loadConfigFromFile with import attributes',
  async () => {
    const { config } = await loadConfigFromFile(
      {} as any,
      resolve(__dirname, '../packages/entry/vite.config.import-attributes.ts'),
      resolve(__dirname, '../packages/entry'),
    )
    expect(config).toMatchInlineSnapshot(`
      {
        "jsonValue": "vite",
      }
    `)
  },
)

describe('loadConfigFromFile with configLoader: native', () => {
  const fixtureRoot = resolve(import.meta.dirname, '../packages/native-import')

  it('imports a basic js config', async () => {
    const result = await loadConfigFromFile(
      {} as any,
      resolve(fixtureRoot, 'basic.js'),
      fixtureRoot,
      undefined,
      undefined,
      'native',
    )
    expect(result.config).toMatchInlineSnapshot(`
      {
        "value": "works",
      }
    `)
    expect(result.dependencies.length).toBe(0)
  })
})
