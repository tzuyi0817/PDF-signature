import postcssPxtorem from 'postcss-pxtorem';
import cssnano from 'cssnano';

export default {
  plugins: [
    postcssPxtorem({
      rootValue: 16,
      propList: ['*'],
      selectorBlackList: ['norem'],
    }),
    ...(process.env.NODE_ENV === 'production' ? [cssnano({ preset: 'default' })] : []),
  ],
};
