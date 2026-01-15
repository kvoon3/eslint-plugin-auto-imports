import { ref } from 'vue'
import { useDouble } from './composibles/useDouble'

export const one = ref(1)
export const doubled = useDouble(one)
