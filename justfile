build-vite:
  pnpm --filter vite run build-bundle

test:
  pnpm run test-serve
  pnpm run test-build
