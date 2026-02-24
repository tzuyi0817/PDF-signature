/** @type {import('lint-staged').Configuration} */

export default {
  '*.{ts,vue}': () => 'pnpm typecheck',
  '*.{ts,js,vue,json,yml}': () => 'pnpm lint',
};
