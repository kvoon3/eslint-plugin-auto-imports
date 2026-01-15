import { type Ref } from 'vue'
import { ref } from 'vue'
import { useDouble } from './composables/useDouble'

export const one: Ref<number> = ref(1)
export const doubled = useDouble(one)
