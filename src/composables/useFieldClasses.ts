import { computed, type Ref } from 'vue'
import type { ErrorPosition, LabelPosition } from '../types/form'

export interface UseFieldClassesOptions {
  /** BEM 블록명. 예: 'lib-input', 'lib-select' */
  block: string
  labelPosition: Ref<LabelPosition>
  errorPosition: Ref<ErrorPosition>
  invalid: Ref<boolean>
  disabled: Ref<boolean>
  focused: Ref<boolean>
  floated: Ref<boolean>
}

/**
 * Input/Select 등 폼 필드류가 공통으로 쓰는 rootClasses/controlClasses.
 * BEM 블록명만 다르고 나머지 규칙(라벨 위치, 에러 위치, invalid/disabled,
 * control의 focused/floated)은 동일해서 여기서 한 번만 구현합니다.
 */
export function useFieldClasses(options: UseFieldClassesOptions) {
  const { block, labelPosition, errorPosition, invalid, disabled, focused, floated } = options

  const rootClasses = computed(() => [
    `${block}--label-${labelPosition.value}`,
    `${block}--error-${errorPosition.value}`,
    {
      [`${block}--invalid`]: invalid.value,
      [`${block}--disabled`]: disabled.value,
    },
  ])

  const controlClasses = computed(() => ({
    [`${block}__control--focused`]: focused.value,
    [`${block}__control--floated`]: floated.value,
  }))

  return { rootClasses, controlClasses }
}
