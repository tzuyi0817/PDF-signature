/** @type {import('prettier').RequiredOptions} */

export default {
  $schema: 'https://json.schemastore.org/prettierrc',
  singleQuote: true,
  semi: true,
  endOfLine: 'lf',
  printWidth: 120,
  proseWrap: 'preserve',
  arrowParens: 'avoid',
  singleAttributePerLine: true,
  plugins: ['prettier-plugin-tailwindcss'],
};
