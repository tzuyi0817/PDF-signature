import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssPresetEnv from 'postcss-preset-env';
import postcssPxtorem from 'postcss-pxtorem';

export default {
  plugins: [
    autoprefixer(),
    postcssPxtorem({
      rootValue: 16,
      propList: ['*'],
      selectorBlackList: ['norem'],
    }),
    postcssPresetEnv({ stage: 3 }),
    ...(process.env.NODE_ENV === 'production' ? [cssnano({ preset: 'default' })] : []),
  ],
};
