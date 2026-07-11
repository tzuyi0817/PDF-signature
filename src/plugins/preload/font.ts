export async function preloadFont(name: string, file: string) {
  const fontFace = new FontFace(name, `url(/font/${file})`);
  const font = await fontFace.load();

  document.fonts.add(font);
  document.body.style.fontFamily = name;
}
