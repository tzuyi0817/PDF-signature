export default {
  install() {
    const genJyuuGothicFont = new FontFace('Gen Jyuu Gothic P', 'url(/font/GenJyuuGothic-P.woff2)');
    const preloads = [genJyuuGothicFont.load()];

    Promise.all(preloads).then(([genJyuuGothic]) => {
      // loadedFont is now available
      setupFont(genJyuuGothic, 'Gen Jyuu Gothic P');

      // close loading screen
      closeLoadingScreen();
    });

    function setupFont(font: FontFace, name: string) {
      document.fonts.add(font);
      document.body.style.fontFamily = name;
    }

    function closeLoadingScreen() {
      const loadingScreen = document.getElementById('loading-screen');

      if (!loadingScreen) return;
      loadingScreen.style.display = 'none';
    }
  },
};
