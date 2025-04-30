/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-ignore `rollup` may not be installed
import type * as rollup from 'rollup'

/* eslint-enable @typescript-eslint/ban-ts-comment */

// https://github.com/type-challenges/type-challenges/issues/29285
type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false

type RawRollupPlugin = rollup.Plugin

// If rollup is not installed, we need to use `never`
// This is to make `Plugin | RollupPlugin` to be `Plugin` instead of `any`.
export type RollupPlugin =
  IsAny<RawRollupPlugin> extends false ? RawRollupPlugin : never
