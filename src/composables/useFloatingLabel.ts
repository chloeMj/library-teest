import { computed, ref, type Ref } from 'vue'

/**
 * labelPosition="inside" 케이스에서 focus 여부/입력값 존재 여부에 따라
 * 라벨이 축소·이동(floating)해야 하는지를 계산합니다.
 */
export function useFloatingLabel(value: Ref<string | number | null | undefined>) {
  const isFocused = ref(false)

  const hasValue = computed(
    () => value.value !== null && value.value !== undefined && value.value !== '',
  )
  const isFloated = computed(() => isFocused.value || hasValue.value)

  const onFocus = () => {
    isFocused.value = true
  }
  const onBlur = () => {
    isFocused.value = false
  }

  return { isFocused, hasValue, isFloated, onFocus, onBlur }
}
