export function preloadFont(name: string, file: string) {
  const fontFace = new FontFace(name, `url(/font/${file})`);

  return fontFace.load().then(font => {
    document.fonts.add(font);
    document.body.style.fontFamily = name;
  });
}
