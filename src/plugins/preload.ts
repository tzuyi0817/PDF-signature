export default {
  install() {
    const genJyuuGothicFont = new FontFace('Gen Jyuu Gothic P', 'url(/font/GenJyuuGothic-P.woff2)');

    genJyuuGothicFont.load().then(loadedFont => {
      document.fonts.add(loadedFont);
      document.body.style.fontFamily = 'Gen Jyuu Gothic P';
    });
  },
};
