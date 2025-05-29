import { sleep } from '@/utils/common';
import { preloadFont } from './font';
import { preloadImages, preloadStorage } from './local';

export default {
  install() {
    const preloads = [
      { promise: preloadFont('Gen Jyuu Gothic P', 'GenJyuuGothic-P.woff2'), weight: 20 },
      { promise: preloadStorage(), weight: 20 },
      { promise: preloadImages(), weight: 20 },
    ];

    setProgressBar(40);

    const trackPreloads = preloads.map(preload => {
      let currentOffset = 0;

      return trackablePromise(preload.promise, progress => {
        const offset = (progress / 100) * preload.weight;
        const addedOffset = offset - currentOffset;

        currentOffset = offset;
        updateProgressBar(addedOffset);
      });
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

function updateProgressBar(offset: number) {
  const progressBar = document.querySelector('#loading-progress');

  if (!(progressBar instanceof HTMLProgressElement)) return;

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
