import type { Ref } from 'vue'
import { computed } from 'vue'

export function useDouble(value: Ref<number>) {
  return computed(() => value.value * 2)
}
