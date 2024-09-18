export function setupFont(name: string, file: string) {
  const fontFace = new FontFace(name, `url(/font/${file})`);

  fontFace.load().then(font => {
    document.fonts.add(font);
    document.body.style.fontFamily = name;
  });
}
