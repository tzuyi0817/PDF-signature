import { ref } from 'vue';
import { sleep } from './common';

export default {
  msg: ref(''),
  status: ref('success'),
  isShowToast: ref(false),
  timer: null as NodeJS.Timeout | null,
  transitionDuration: 150,
  showToast(msg: string, status: 'success' | 'error', time = 1800) {
    this.timer && clearTimeout(this.timer);
    this.msg.value = msg;
    this.status.value = status;
    this.isShowToast.value = true;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.closeToast();
    }, time);
  },
  async closeToast() {
    this.timer && clearTimeout(this.timer);
    this.timer = null;
    this.isShowToast.value = false;
    await sleep(this.transitionDuration);
    this.msg.value = '';
  },
};
