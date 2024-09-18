import { setupFont } from './font';
import { setupLocalFiles } from './local';

export default {
  install() {
    const preloads = [setupFont('Gen Jyuu Gothic P', 'GenJyuuGothic-P.woff2'), setupLocalFiles()];

    Promise.all(preloads).then(() => {
      closeLoadingScreen();
    });
  },
};

function closeLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');

  if (!loadingScreen) return;
  loadingScreen.style.display = 'none';
}
