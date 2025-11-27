import cssnano from 'cssnano';
import postcssPresetEnv from 'postcss-preset-env';
import postcssPxtorem from 'postcss-pxtorem';

export default {
  plugins: [
    postcssPresetEnv({ stage: 3 }),
    postcssPxtorem({
      rootValue: 16,
      propList: ['*'],
      selectorBlackList: ['norem'],
    }),
    ...(process.env.NODE_ENV === 'production' ? [cssnano({ preset: 'default' })] : []),
  ],
};
