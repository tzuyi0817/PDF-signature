/** @type {import('lint-staged').Configuration} */

export default {
  '*.{ts,vue}': () => 'pnpm typecheck',
  '*.{ts,js,vue}': () => 'pnpm lint',
};
