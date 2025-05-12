import { sleep } from '@/utils/common';
import { preloadFont } from './font';
import { preloadImages, preloadStorage } from './local';

export default {
  install() {
    const preloads = [
      { promise: preloadFont('Gen Jyuu Gothic P', 'GenJyuuGothic-P.woff2'), weight: 10 },
      { promise: preloadStorage(), weight: 10 },
      { promise: preloadImages(), weight: 10 },
    ];

    setProgressBar(70);

    const trackPreloads = preloads.map(preload => {
      return trackablePromise(preload.promise, progress => updateTotalProgress(progress, preload.weight));
    });

    Promise.all(trackPreloads).then(async () => {
      await sleep(600); // Simulate a delay for the loading screen
      closeLoadingScreen();
    });
  },
};

function trackablePromise<T>(promise: Promise<T>, onProgress: (progress: number) => void): Promise<T> {
  let progress = 0;
  let tick = 0;

  const interval = setInterval(() => {
    progress = Math.min(progress + (Math.sin(tick++) + 1) * 5, 90);
    onProgress(progress);
  }, 100);

  return promise.finally(() => {
    clearInterval(interval);
    onProgress(100);
  });
}

function updateTotalProgress(progress: number, weight: number) {
  const progressBar = document.querySelector('#loading-progress');

  if (!(progressBar instanceof HTMLProgressElement)) return;
  const offset = (progress / 100) * weight;

  progressBar.value += offset;
}

function setProgressBar(value: number) {
  const progressBar = document.querySelector('#loading-progress');

  if (!(progressBar instanceof HTMLProgressElement)) return;

  progressBar.value = value;
}

function closeLoadingScreen() {
  const loadingScreen = document.querySelector('#loading-screen');

  if (!loadingScreen || !(loadingScreen instanceof HTMLElement)) return;

  loadingScreen.style.display = 'none';
}
