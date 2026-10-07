<script setup lang="ts">
import { computed, ref, toRef, useId } from 'vue'
import { useFieldClasses } from '../../composables/useFieldClasses'
import { useFieldValidation, type FieldValidator } from '../../composables/useFieldValidation'
import { useFloatingLabel } from '../../composables/useFloatingLabel'
import type { ErrorPosition, LabelPosition } from '../../types/form'

type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'search'

interface Props {
  modelValue?: string | number | null
  type?: InputType
  label?: string
  labelPosition?: LabelPosition
  placeholder?: string
  required?: boolean
  /** 문자열 입력이면 최대 글자 수, type="number"면 최댓값 */
  max?: number
  /** type="number"에서만 사용 (스테퍼 하한, 네이티브 min 속성) */
  min?: number
  /** type="number" + showStepper에서 한 번에 증감할 값 */
  step?: number
  /** type="number"일 때만 의미 있는 증감 버튼 노출 여부 */
  showStepper?: boolean
  errorPosition?: ErrorPosition
  /** 내장 required/max 검증 외에 추가로 실행할 커스텀 검증 함수 */
  validator?: FieldValidator
  disabled?: boolean
  readonly?: boolean
  name?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  labelPosition: 'top',
  required: false,
  showStepper: false,
  errorPosition: 'bottom',
  step: 1,
  disabled: false,
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const touched = ref(false)

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const errorId = computed(() => `${inputId.value}-error`)

const modelValueRef = toRef(props, 'modelValue')
const floating = useFloatingLabel(modelValueRef)
const { errorMessage } = useFieldValidation({
  value: modelValueRef,
  type: toRef(props, 'type'),
  required: toRef(props, 'required'),
  max: toRef(props, 'max'),
  validator: toRef(props, 'validator'),
  touched,
})

const displayValue = computed(() => props.modelValue ?? '')

const { rootClasses, controlClasses } = useFieldClasses({
  block: 'ui-input',
  labelPosition: toRef(props, 'labelPosition'),
  errorPosition: toRef(props, 'errorPosition'),
  invalid: computed(() => !!errorMessage.value),
  disabled: toRef(props, 'disabled'),
  focused: floating.isFocused,
  floated: floating.isFloated,
})

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (props.type === 'number') {
    if (target.value === '') {
      emit('update:modelValue', null)
      return
    }
    const parsed = Number(target.value)
    emit('update:modelValue', Number.isNaN(parsed) ? target.value : parsed)
    return
  }

  emit('update:modelValue', target.value)
}

const onFocus = (event: FocusEvent) => {
  floating.onFocus()
  emit('focus', event)
}

const onBlur = (event: FocusEvent) => {
  floating.onBlur()
  touched.value = true
  emit('blur', event)
}

const handleStep = (direction: 1 | -1) => {
  if (props.disabled || props.readonly) return

  const current = typeof props.modelValue === 'number' ? props.modelValue : Number(props.modelValue) || 0
  let next = current + direction * props.step

  if (props.max != null) next = Math.min(next, props.max)
  if (props.min != null) next = Math.max(next, props.min)

  emit('update:modelValue', next)
}

/** 폼 제출 시 강제로 validation을 노출시키고 유효 여부를 받고 싶을 때 사용 */
const validate = () => {
  touched.value = true
  return !errorMessage.value
}

defineExpose({
  focus: () => inputRef.value?.focus(),
  validate,
})
</script>

<template>
  <div class="ui-input" :class="rootClasses">
    <label v-if="label && labelPosition !== 'inside'" class="ui-input__label" :for="inputId">
      <slot name="label">{{ label }}<span v-if="required" class="ui-input__required-mark">*</span></slot>
    </label>

    <div class="ui-input__body">
      <div class="ui-input__control" :class="controlClasses">
        <span v-if="$slots.prefix" class="ui-input__affix ui-input__affix--prefix">
          <slot name="prefix" />
        </span>

        <label
          v-if="label && labelPosition === 'inside'"
          class="ui-input__label ui-input__label--inside"
          :for="inputId"
        >
          <slot name="label">{{ label }}<span v-if="required" class="ui-input__required-mark">*</span></slot>
        </label>

        <input
          :id="inputId"
          ref="inputRef"
          class="ui-input__field"
          :type="type"
          :value="displayValue"
          :placeholder="labelPosition === 'inside' ? undefined : placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :name="name"
          :min="type === 'number' ? min : undefined"
          :max="type === 'number' ? max : undefined"
          :aria-invalid="!!errorMessage"
          :aria-describedby="errorMessage ? errorId : undefined"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
        />

        <span v-if="$slots.suffix" class="ui-input__affix ui-input__affix--suffix">
          <slot name="suffix" />
        </span>

        <span v-if="type === 'number' && showStepper" class="ui-input__stepper">
          <button
            type="button"
            class="ui-input__stepper-btn"
            tabindex="-1"
            :disabled="disabled || readonly"
            @click="handleStep(1)"
          >+</button>
          <button
            type="button"
            class="ui-input__stepper-btn"
            tabindex="-1"
            :disabled="disabled || readonly"
            @click="handleStep(-1)"
          >-</button>
        </span>
      </div>

      <p v-if="errorMessage" :id="errorId" class="ui-input__error" role="alert">
        <slot name="error" :message="errorMessage">{{ errorMessage }}</slot>
      </p>
    </div>
  </div>
</template>

<!--
  이 스타일 블록은 의도적으로 `scoped`를 쓰지 않습니다.
  scoped를 쓰면 모든 선택자에 [data-v-xxxx] 속성이 붙어 명시도가 한 단계
  올라가고, 소비 프로젝트가 같은 명시도(단일 클래스)로 오버라이드할 수 없게
  됩니다. 대신 `ui-input` 접두사 + BEM 네이밍만으로 충돌을 방지합니다.
-->
<style lang="scss">
@use '../../styles/mixins/field-layout' as field;

.ui-input {
  @include field.field-label-top;
  font-size: var(--ui-font-size-md);
  color: var(--ui-text-default);
}

.ui-input--label-left {
  @include field.field-label-left;
}

.ui-input--label-inside {
  @include field.field-label-inside;
}

.ui-input__label {
  font-size: var(--ui-font-size-sm);
  color: var(--ui-text-default);
}

.ui-input--label-left > .ui-input__label {
  flex: 0 0 auto;
}

.ui-input__required-mark {
  color: var(--ui-danger-default);
  margin-left: 2px;
}

.ui-input__body {
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-xs);
  flex: 1 1 auto;
  min-width: 0;
}

.ui-input__control {
  order: 1;
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ui-spacing-xs);
  border: 1px solid var(--ui-border-default);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface-default);
  padding: 0 var(--ui-spacing-sm);
  transition: border-color 0.15s ease;
}

.ui-input__error {
  order: 2;
  margin: 0;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-danger-default);
}

.ui-input--error-top .ui-input__control {
  order: 2;
}

.ui-input--error-top .ui-input__error {
  order: 1;
}

.ui-input__control--focused {
  border-color: var(--ui-border-focus);
}

.ui-input--invalid .ui-input__control {
  border-color: var(--ui-danger-default);
}

.ui-input--disabled .ui-input__control {
  background: var(--ui-surface-disabled);
}

.ui-input__field {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: inherit;
  padding: var(--ui-spacing-sm) 0;
}

.ui-input__field:disabled {
  color: var(--ui-text-disabled);
  cursor: not-allowed;
}

// type="number"의 브라우저 기본 스피너를 숨깁니다.
// showStepper가 true면 우리 커스텀 버튼과 이중으로 보이고, false여도 브라우저마다
// 생김새가 달라 디자인 통제가 안 되므로 항상 숨기고 showStepper로만 노출을 제어합니다.
.ui-input__field[type='number']::-webkit-outer-spin-button,
.ui-input__field[type='number']::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}

.ui-input__field[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.ui-input__affix {
  display: inline-flex;
  align-items: center;
  color: var(--ui-text-muted);
}

.ui-input__label--inside {
  position: absolute;
  left: var(--ui-spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--ui-font-size-md);
  color: var(--ui-text-muted);
  background: var(--ui-surface-default);
  padding: 0 4px;
  pointer-events: none;
  transition:
    top 0.15s ease,
    font-size 0.15s ease,
    transform 0.15s ease,
    color 0.15s ease;
}

.ui-input__control--floated .ui-input__label--inside {
  top: 0;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-primary-default);
}

.ui-input__stepper {
  display: inline-flex;
  flex-direction: column;
}

.ui-input__stepper-btn {
  border: none;
  background: transparent;
  color: var(--ui-text-muted);
  line-height: 1;
  padding: 0 var(--ui-spacing-xs);
  cursor: pointer;
}

.ui-input__stepper-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
