import { computed } from "vue";
import { type Ref } from "vue";

export function useDouble(value: Ref<number>) {
  return computed(() => value.value * 2);
}
