import componentHookPlugin from '@component-hook/eslint-plugin';

export default [
  ...componentHookPlugin.configs.basic,
  ...componentHookPlugin.configs.vue,
  componentHookPlugin.configs.prettier,
  ...componentHookPlugin.configs.sonarjs,
  componentHookPlugin.configs.security,
  ...componentHookPlugin.configs.markdown,
  {
    files: ['**/__tests__/e2e/**/*.spec.[jt]s?(x)'],
    ...componentHookPlugin.configs.playwright,
  },
];
