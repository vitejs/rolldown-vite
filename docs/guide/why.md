# Why Vite

Vite is the most popular JavaScript build tool because it solves modern JavaScript problems with new advancements in the ecosystem:

1. Availability of native ES modules in the browser
2. The rise of JavaScript tools written in native languages.

## The Problems

Before ES modules were available in browsers, developers lacked a native mechanism for authoring JavaScript in a modularized fashion. This is why we are all familiar with the concept of "bundling": using tools that crawl, process and concatenate our source modules into files that can run in the browser.

Over time, bundlers like `webpack`, `Rollup` and `Parcel` emerged. JavaScript code can now live in separate files, which the bundler can make work.

However, as applications become more ambitious, the amount of JavaScript we are dealing with is also increasing dramatically. Large scale projects contains thousands of modules. Developers hit performance bottlenecks for JavaScript based tooling.

### Slow Server Start

As applications got larger, it could take an unreasonably long wait (sometimes up to minutes!) when cold-starting a dev server. The traditional bundler-based build setup has to eagerly crawl and build your entire application before it can be served.

Vite improves the dev server start time by first dividing the modules in an application into two categories: **dependencies** and **source code**.

- **Dependencies** are mostly plain JavaScript that do not change often during development. Some large dependencies (e.g. component libraries with hundreds of modules) are also quite expensive to process. Dependencies may also be shipped in various module formats (e.g. ESM or CommonJS).
  Vite uses [Rolldown](https://rolldown.rs/), which is written in Rust, to [pre-bundle dependencies](/dep-pre-bundling.md). Previous versions of Vite (v7 and earlier) used `esbuild`.
- **Source code** often contains non-plain JavaScript that needs transforming (e.g. JSX, CSS or Vue/Svelte components), and will be edited very often. Also, not all source code needs to be loaded at the same time (e.g. with route-based code-splitting).
  Vite serves source code over [native ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). This is essentially letting the browser take over part of the job of a bundler: Vite only needs to transform and serve source code on demand, as the browser requests it. Code behind conditional dynamic imports is only processed if actually used on the current screen.

<script setup>
import bundlerSvg from '../images/bundler.svg?raw'
import esmSvg from '../images/esm.svg?raw'
</script>
<svg-image :svg="bundlerSvg" />
<svg-image :svg="esmSvg" />

### Slow Updates

When a file is edited in a bundler-based build setup, it is inefficient to rebuild the whole bundle for an obvious reason: the update speed will degrade linearly with the size of the app.

In some bundlers, the dev server runs the bundling in memory so that it only needs to invalidate part of its module graph when a file changes, but it still needs to re-construct the entire bundle and reload the web page. Reconstructing the bundle can be expensive, and reloading the page blows away the current state of the application. This is why some bundlers support Hot Module Replacement (HMR): allowing a module to "hot replace" itself without affecting the rest of the page. This greatly improves DX - however, in practice we've found that even HMR update speed deteriorates significantly as the size of the application grows.

In Vite, HMR is performed over native ESM. When a file is edited, Vite only needs to precisely invalidate the chain between the edited module and its closest HMR boundary (most of the time only the module itself), making HMR updates consistently fast regardless of the size of your application.

Vite also leverages HTTP headers to speed up full page reloads (again, let the browser do more work for us): source code module requests are made conditional via `304 Not Modified`, and dependency module requests are strongly cached via `Cache-Control: max-age=31536000,immutable` so they don't hit the server again once cached.

## Why Rolldown

Vite previously relied on two bundlers to meet differing requirements for development and production builds:

1. esbuild for fast compilation during development
2. Rollup for bundling, chunking, and optimizing production builds

This approach lets Vite focus on developer experience and orchestration instead of reinventing parsing and bundling. However, maintaining two separate bundling pipelines introduced inconsistencies: separate transformation pipelines, different plugin systems and a growing amount of glue code to keep bundling behavior aligned between development and production.

To solve this, [**VoidZero team**](https://voidzero.dev/) has built **Rolldown**, the next-generation bundler with the goal to be used in Vite. It is designed for:

- **Performance**: Rolldown is written in Rust and operates at native speed. It matches esbuild’s performance level and is [**10–30× faster than Rollup**](https://github.com/rolldown/benchmarks).
- **Compatibility**: Rolldown supports the same plugin API as Rollup and Vite. Most Vite plugins work out of the box with Vite 8.
- **More Features**: Rolldown unlocks more advanced features for Vite, including full bundle mode, more flexible chunk split control, module-level persistent cache, Module Federation, and more.

## How Vite Relates to Other Unbundled Build Tools?

[WMR](https://github.com/preactjs/wmr) by the Preact team looked to provide a similar feature set. Vite's universal Rollup plugin API for dev and build was inspired by it. WMR is no longer maintained. The Preact team now recommends Vite with [@preactjs/preset-vite](https://github.com/preactjs/preset-vite).

[Snowpack](https://www.snowpack.dev/) was also a no-bundle native ESM dev server, very similar in scope to Vite. Vite's dependency pre-bundling is also inspired by Snowpack v1 (now [`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall)). Snowpack is no longer being maintained. The Snowpack team is now working on [Astro](https://astro.build/), a static site builder powered by Vite.

[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/) (previously `es-dev-server`) is a great project and Vite 1.0's Koa-based server setup was inspired by it. The `@web` umbrella project is actively maintained and contains many other excellent tools that may benefit Vite users as well.
