# Migration from v7

## New Features

::: tip Temporary section

This section will be moved to the release post before the stable release.

:::

### Built-in tsconfig `paths` Support

**_TODO: write this section_**

### `emitDecoratorMetadata` Support

**_TODO: write this section_**

## Default Browser Target change

**_TODO: implement this change later_**

The default browser value of `build.target`, `'baseline-widely-available'`, is updated to a newer browser.

- Chrome 107 → 111
- Edge 107 → 111
- Firefox 104 → 114
- Safari 16.0 → 16.4

These browser versions align with [Baseline](https://web-platform-dx.github.io/web-features/) Widely Available feature sets as of 2026-01-01. In other words, they were all released before 2026-01-01.

## Rolldown Integration

**_TODO: write this section_**

### Gradual migration

`rolldown-vite` package implements Vite 7 with Rolldown integration, but without the other Vite 8 changes. This can be used as a intermediate step to migrate to Vite 8. See [the Rolldown Integration guide](https://v7.vite.dev/guide/rolldown) in the Vite 7 docs to switch to `rolldown-vite` from Vite 7.

For users migrating from `rolldown-vite` to Vite 8, you can undo the dependencies changes in `package.json` and update to Vite 8.

### Dependency Optimizer now uses Rolldown

_**TODO: write this section**_

### JS Transformation by Oxc

_**TODO: write this section**_

`esbuild` option, `oxc` option...

Note that if you use a plugin that uses `transformWithEsbuild` function, you need to install `esbuild` as a dev dependency as it's now an optional dependency. `transformWithEsbuild` function is now deprecated and will be removed in the future.

TODO: No Native Decorator Support
TODO: `supported` option https://github.com/rolldown/rolldown/issues/6212
TODO: `jsxSideEffects` option

### JS Minification by Oxc

Oxc Minifier is now used for JS minification by default. You can use `build.minify: 'esbuild'` option to switch back to esbuild. Note that you need to install `esbuild` as a dev dependency as it's now an optional dependency.

TODO: explain that `mangleProps` / `reserveProps` / `mangleQuoted` / `mangleCache` options are not supported by Oxc but are supported by esbuild.
TODO: write about different assumptions (https://esbuild.github.io/content-types/#javascript-caveats)

### CSS Minification by LightningCSS

LightningCSS is now used for CSS minification by default. You can use `build.cssMinify: 'esbuild'` option to switch back to esbuild. Note that you need to install `esbuild` as a dev dependency as it's now an optional dependency.

### Consistent CJS Interop

**_TODO: write this section_**

https://github.com/rolldown/rolldown/issues/6438
https://esbuild.github.io/content-types/#default-interop

### Removed Module Resolution Using Format Sniffing

When both `browser` and `module` fields are present in `package.json`, Vite used to resolve the field based on the content of the file, trying to pick the ESM file for browsers. This was introduced because some packages were using the `module` field to point to ESM files for Node.js and some other packages were using the `browser` field to point to UMD files for browsers. Given that the modern `exports` field solved this problem and is now adopted by many packages, Vite no longer uses this heuristic and always respects the order of the `resolve.mainFields` option. If you were relying on this behavior, you can use the `resolve.alias` option to map the field to the desired file or apply a patch with your package manager (e.g. `patch-package`, `pnpm patch`).

### Deprecate `build.rollupOptions.output.manualChunks`

**_TODO: write this section_**

### Require Calls For Externalized Modules

`require` calls for externalized modules are now preserved as `require` calls and not converted to `import` statements.

https://github.com/rolldown/rolldown/issues/6269
https://rolldown.rs/in-depth/bundling-cjs#require-external-modules

_**TODO: write this section**_

### `import.meta.url` in UMD / IIFE

_**TODO: write this section**_

https://rolldown.rs/in-depth/non-esm-output-formats#well-known-import-meta-properties

### Removed `build.rollupOptions.watch.chokidar` option

_**TODO: write this section**_

`build.rollupOptions.watch.chokidar` option is removed. Please migrate to `build.rollupOptions.watch.notify` option.

### Deprecations

The following options are deprecated.

- `build.rollupOptions`: please use `build.rolldownOptions` instead.
- `esbuild`: please use `oxc` option instead.
- `worker.rollupOptions`: please use `worker.rolldownOptions` instead.
- `optimizeDeps.esbuildOptions`: please use `optimizeDeps.rolldownOptions` instead.

## General Changes

## Removed deprecated features

**_TODO: implement these changes later_**

## Advanced

There are other breaking changes which only affect few users.

- **[TODO: fix before stable release (better if it's fixed before first beta)]** https://github.com/vitejs/rolldown-vite/issues/461 (blocking sveltekit)
- **[TODO: fix before stable release (better if it's fixed before first beta)]** https://github.com/rolldown/rolldown/issues/5867
- **[TODO: fix before stable release]** https://github.com/rolldown/rolldown/issues/5726 (affects nuxt, qwik)
- **[TODO: fix before stable release]** https://github.com/rolldown/rolldown/issues/3403 (affects sveltekit)
- **[TODO: fix before stable release]** Legacy chunks are emitted as an asset file instead of a chunk file due to the lack of prebuilt chunk emit feature ([rolldown#4304](https://github.com/rolldown/rolldown/issues/4034)). This means the chunk related options does not apply to legacy chunks and the manifest file will not include legacy chunks as a chunk file.
- **[TODO: fix before stable release]** resolver cache breaks minor cases in Vitest ([rolldown-vite#466](https://github.com/vitejs/rolldown-vite/issues/466), [vitest#8754](https://github.com/vitest-dev/vitest/issues/8754#issuecomment-3441115032))
- **[TODO: fix before stable release]** The resolver does not work with yarn pnp ([rolldown-vite#324](https://github.com/vitejs/rolldown-vite/issues/324), [rolldown-vite#392](https://github.com/vitejs/rolldown-vite/issues/392))
- **[TODO: fix before stable release]** native plugin ordering issue ([rolldown-vite#373](https://github.com/vitejs/rolldown-vite/issues/373))
- **[TODO: fix before stable release]** `@vite-ignore` comment edge case ([rolldown-vite#426](https://github.com/vitejs/rolldown-vite/issues/426))
- **[TODO: fix before stable release]** https://github.com/rolldown/rolldown/issues/3403
- ext glob support ([rolldown-vite#365](https://github.com/vitejs/rolldown-vite/issues/365))
- `define` does not share reference for objects: When you pass an object as a value to `define`, each variable will have a separate copy of the object.
- `bundle` object changes (`bundle` is an object passed in `generateBundle` / `writeBundle` hooks, returned by `build` function):
  - Assigning to `bundle[foo]` is not supported. This is discouraged by Rollup as well. Please use `this.emitFile()` instead.
  - the reference is not shared across the hooks ([rolldown-vite#410](https://github.com/vitejs/rolldown-vite/issues/410))
  - `structuredClone(bundle)` errors with `DataCloneError: #<Object> could not be cloned`. This is not supported anymore. Please clone it with `structuredClone({ ...bundle })`. ([rolldown-vite#128](https://github.com/vitejs/rolldown-vite/issues/128))
- **[TODO: clarify this in Rolldown's docs and link it from here]** All parallel hooks in Rollup works as sequential hooks.
- **[TODO: clarify this in Rolldown's docs and link it from here]** `"use strict";` is not injected sometimes.
- Transforming to lower than ES5 with plugin-legacy is not supported ([rolldown-vite#452](https://github.com/vitejs/rolldown-vite/issues/452))
- Passing the same browser with multiple versions of it to `build.target` option now errors: esbuild selects the latest version of it, which was probably not what you intended.
- Missing support by Rolldown: The following features are not supported by Rolldown and is no longer supported by Vite.
  - `build.rollupOptions.output.format: 'system'` ([rolldown#2387](https://github.com/rolldown/rolldown/issues/2387))
  - `build.rollupOptions.output.format: 'amd'` ([rolldown#2387](https://github.com/rolldown/rolldown/issues/2528))
  - Complete support for TypeScript legacy namespace ([oxc-project/oxc#14227](https://github.com/oxc-project/oxc/issues/14227))
  - `shouldTransformCachedModule` hook ([rolldown#4389](https://github.com/rolldown/rolldown/issues/4389))
  - `resolveImportMeta` hook ([rolldown#1010](https://github.com/rolldown/rolldown/issues/1010))
  - `renderDynamicImport` hook ([rolldown#4532](https://github.com/rolldown/rolldown/issues/4532))
  - `resolveFileUrl` hook

## Migration from v6

Check the [Migration from v6 Guide](https://v7.vite.dev/guide/migration.html) in the Vite v7 docs first to see the needed changes to port your app to Vite 7, and then proceed with the changes on this page.
