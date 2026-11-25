import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

interface UseInViewOptions {
  /** 要觀察的元素 */
  target: MaybeRefOrGetter<Element | null>;
  /** 捲動容器；還沒有值時先不觀察 */
  root: MaybeRefOrGetter<Element | null>;
  /** 把捲動容器的可視範圍往外擴的距離，寫法同 CSS margin；百分比以捲動容器的尺寸計算 */
  rootMargin?: string;
}

/** 追蹤元素是否在捲動容器的可視範圍（含往外擴的距離）內 */
export function useInView({ target, root, rootMargin }: UseInViewOptions) {
  const isInView = ref(false);

  watch(
    [() => toValue(target), () => toValue(root)],
    ([element, rootElement], _, onCleanup) => {
      if (!element || !rootElement) return;

      const observer = new IntersectionObserver(
        entries => {
          isInView.value = entries.at(-1)?.isIntersecting ?? false;
        },
        { root: rootElement, rootMargin },
      );

      observer.observe(element);
      onCleanup(() => observer.disconnect());
    },
    { immediate: true, flush: 'post' },
  );

  return { isInView };
}
