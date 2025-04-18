import { useRoute, useRouter } from 'vue-router';

export function useRedirect() {
  const router = useRouter();
  const route = useRoute();

  function goPage(name: string) {
    router.push({ name });
  }

  function goBack() {
    router.go(-1);
  }

  return {
    goPage,
    goBack,
    route,
  };
}
