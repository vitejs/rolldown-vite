build-vite:
  pnpm --filter vite run build-bundle

test:
  pnpm run test-serve

test-build:
  pnpm run test-build

fmt:
  pnpm --filter vite run format
