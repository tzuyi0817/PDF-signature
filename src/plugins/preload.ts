export default {
  install() {
    const genJyuuGothicFont = new FontFace('Gen Jyuu Gothic P', 'url(/font/GenJyuuGothic-P.woff2)');
    const preloads = [genJyuuGothicFont.load()];

    Promise.all(preloads).then(([loadedFont]) => {
      // loadedFont is now available
      document.fonts.add(loadedFont);
      document.body.style.fontFamily = 'Gen Jyuu Gothic P';

      // close loading screen
      const loadingScreen = document.getElementById('loading-screen');

      if (!loadingScreen) return;
      loadingScreen.style.display = 'none';
    });
  },
};
