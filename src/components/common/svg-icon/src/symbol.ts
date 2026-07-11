/** 依 vite-plugin-svg-icons 的 sprite 命名規則組合 symbol id（例如 `#icon-ic_folder`） */
export function toSvgSymbolId(name: string, prefix = 'icon') {
  return `#${prefix}-ic_${name}`;
}
