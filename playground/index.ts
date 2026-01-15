import { ref } from 'vue'
import { useDouble } from './composables/useDouble'

export const one = ref(1)
export const doubled = useDouble(one)
