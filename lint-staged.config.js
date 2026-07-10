/** @type {import('lint-staged').Configuration} */

export default {
  '*.{ts,vue}': () => 'pnpm typecheck',
  '*.{ts,js,vue,json,yml,yaml,md}': () => 'pnpm lint',
};
