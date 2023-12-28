import { ref } from 'vue';

export default {
  msg: ref(''),
  status: ref('success'),
  isShowToast: ref(false),
  timer: null as NodeJS.Timeout | null,
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
  closeToast() {
    this.timer && clearTimeout(this.timer);
    this.timer = null;
    this.msg.value = '';
    this.isShowToast.value = false;
  },
};
