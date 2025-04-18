import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssPxtorem from 'postcss-pxtorem';

export default {
  plugins: [
    autoprefixer(),
    postcssPxtorem({
      rootValue: 16,
      propList: ['*'],
      selectorBlackList: ['norem'],
    }),
    ...(process.env.NODE_ENV === 'production' ? [cssnano({ preset: 'default' })] : []),
  ],
};
