import componentHookPlugin from '@component-hook/eslint-plugin';

export default [
  ...componentHookPlugin.configs.basic,
  ...componentHookPlugin.configs.vue,
  componentHookPlugin.configs.prettier,
  ...componentHookPlugin.configs.sonarjs,
  componentHookPlugin.configs.security,
  ...componentHookPlugin.configs.markdown,
  {
    files: ['e2e/**/*.spec.[jt]s?(x)'],
    ...componentHookPlugin.configs.playwright,
  },
  {
    files: ['e2e/**/*.spec.[jt]s?(x)'],
    rules: {
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
    },
  },
  {
    rules: {
      /* Blob#arrayBuffer 尚未涵蓋 browserslist 目標（iOS < 14、Chrome < 76），保留 FileReader fallback */
      'unicorn/prefer-blob-reading-methods': 'off',
    },
  },
];
