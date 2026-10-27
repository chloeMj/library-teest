<script setup lang="ts">
import { computed, ref, toRef, useId } from 'vue'
import { useFieldClasses } from '../../composables/useFieldClasses'
import { useFieldValidation, type FieldValidator } from '../../composables/useFieldValidation'
import { isImageIcon, type ErrorPosition, type LabelPosition, type SelectOption } from '../../types/form'

type RadioDirection = 'vertical' | 'horizontal'
/** 원형 라디오(dot, 기본) 또는 토글 버튼처럼 보이는 스타일(button) */
type RadioVariant = 'dot' | 'button'

interface Props {
  modelValue?: string | number | null
  options?: SelectOption[]
  label?: string
  /** 'inside'는 라디오 그룹엔 의미가 없어 'top'처럼 동작합니다 */
  labelPosition?: LabelPosition
  /** 옵션들을 세로로 쌓을지, 가로로 나열할지 */
  direction?: RadioDirection
  variant?: RadioVariant
  required?: boolean
  errorPosition?: ErrorPosition
  /** 내장 required 검증 외에 추가로 실행할 커스텀 검증 함수 */
  validator?: FieldValidator
  disabled?: boolean
  name?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => [],
  labelPosition: 'top',
  direction: 'vertical',
  variant: 'dot',
  required: false,
  errorPosition: 'bottom',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  blur: [event: FocusEvent]
}>()

const touched = ref(false)

const generatedId = useId()
const groupId = computed(() => props.id ?? generatedId)
// radio는 같은 name을 공유해야 네이티브 화살표 키 탐색/상호배타 선택이 동작합니다.
const groupName = computed(() => props.name ?? groupId.value)
const errorId = computed(() => `${groupId.value}-error`)

const modelValueRef = toRef(props, 'modelValue')
const { errorMessage } = useFieldValidation({
  value: modelValueRef,
  // maxLength 개념이 없으므로 'number'가 아닌 임의의 타입으로 고정
  type: computed(() => 'radio'),
  required: toRef(props, 'required'),
  validator: toRef(props, 'validator'),
  touched,
})

const { rootClasses } = useFieldClasses({
  block: 'ui-radio-group',
  labelPosition: toRef(props, 'labelPosition'),
  errorPosition: toRef(props, 'errorPosition'),
  invalid: computed(() => !!errorMessage.value),
  disabled: toRef(props, 'disabled'),
  // 라디오 그룹은 하나의 포커스/floating 개념이 없어 항상 false
  focused: computed(() => false),
  floated: computed(() => false),
})

const isOptionDisabled = (option: SelectOption) => props.disabled || !!option.disabled

const selectOption = (option: SelectOption) => {
  if (isOptionDisabled(option)) return
  touched.value = true
  emit('update:modelValue', option.value)
}

const onBlur = (event: FocusEvent) => {
  touched.value = true
  emit('blur', event)
}

/** 폼 제출 시 강제로 validation을 노출시키고 유효 여부를 받고 싶을 때 사용 */
const validate = () => {
  touched.value = true
  return !errorMessage.value
}

defineExpose({ validate })
</script>

<template>
  <div class="ui-radio-group" :class="rootClasses">
    <span v-if="label" class="ui-radio-group__label">
      <slot name="label">{{ label }}<span v-if="required" class="ui-radio-group__required-mark">*</span></slot>
    </span>

    <div class="ui-radio-group__body">
      <div
        class="ui-radio-group__options"
        :class="[
          `ui-radio-group__options--${variant}`,
          { 'ui-radio-group__options--horizontal': direction === 'horizontal' },
        ]"
        role="radiogroup"
        :aria-label="label"
        :aria-required="required"
        :aria-describedby="errorMessage ? errorId : undefined"
      >
        <label
          v-for="option in options"
          :key="option.value"
          class="ui-radio-group__option"
          :class="{
            'ui-radio-group__option--disabled': isOptionDisabled(option),
            'ui-radio-group__option--selected': option.value === modelValue,
          }"
        >
          <input
            type="radio"
            class="ui-radio-group__input"
            :name="groupName"
            :value="option.value"
            :checked="option.value === modelValue"
            :disabled="isOptionDisabled(option)"
            @change="selectOption(option)"
            @blur="onBlur"
          />
          <span class="ui-radio-group__control" aria-hidden="true"></span>
          <span class="ui-radio-group__option-label">
            <slot name="option" :option="option">
              <span v-if="option.icon" class="ui-radio-group__option-icon" aria-hidden="true">
                <img
                  v-if="isImageIcon(option.icon)"
                  class="ui-radio-group__option-icon-img"
                  :src="option.icon.src"
                  :alt="option.icon.alt ?? ''"
                />
                <template v-else>{{ option.icon }}</template>
              </span>
              {{ option.label }}
            </slot>
          </span>
        </label>

        <p v-if="options.length === 0" class="ui-radio-group__empty">
          <slot name="empty">표시할 항목이 없습니다.</slot>
        </p>
      </div>

      <p v-if="errorMessage" :id="errorId" class="ui-radio-group__error" role="alert">
        <slot name="error" :message="errorMessage">{{ errorMessage }}</slot>
      </p>
    </div>
  </div>
</template>

<!-- Input.vue와 동일한 이유로 scoped를 쓰지 않습니다 (ui-radio-group BEM 클래스만으로 격리). -->
<style lang="scss">
@use '../../styles/mixins/field-layout' as field;

.ui-radio-group {
  @include field.field-label-top;
  font-size: var(--ui-font-size-md);
  color: var(--ui-text-default);
}

.ui-radio-group--label-left {
  @include field.field-label-left;
}

.ui-radio-group__label {
  font-size: var(--ui-font-size-sm);
  color: var(--ui-text-default);
}

.ui-radio-group--label-left > .ui-radio-group__label {
  flex: 0 0 auto;
}

.ui-radio-group--invalid > .ui-radio-group__label {
  color: var(--ui-danger-default);
}

.ui-radio-group__required-mark {
  color: var(--ui-danger-default);
  margin-left: 2px;
}

.ui-radio-group__body {
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-xs);
  flex: 1 1 auto;
  min-width: 0;
}

.ui-radio-group__options {
  order: 1;
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-sm);
}

.ui-radio-group__options--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--ui-spacing-lg);
}

.ui-radio-group__error {
  order: 2;
  margin: 0;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-danger-default);
}

.ui-radio-group--error-top .ui-radio-group__options {
  order: 2;
}

.ui-radio-group--error-top .ui-radio-group__error {
  order: 1;
}

.ui-radio-group__option {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-spacing-sm);
  cursor: pointer;
}

.ui-radio-group__option--disabled {
  cursor: not-allowed;
  color: var(--ui-text-muted);
}

// 네이티브 input은 시각적으로 숨기되(접근성/포커스/클릭 영역은 유지),
// 실제 원형은 옆의 .ui-radio-group__control로 그립니다.
.ui-radio-group__input {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 18px;
  height: 18px;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.ui-radio-group__input:disabled {
  cursor: not-allowed;
}

.ui-radio-group__control {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--ui-border-control);
  background: var(--ui-surface-default);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.ui-radio-group__control::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ui-primary-default);
  transform: scale(0);
  transition: transform 0.12s ease;
}

.ui-radio-group__option:not(.ui-radio-group__option--disabled):hover .ui-radio-group__control {
  border-color: var(--ui-border-hover);
}

// :checked는 v-model이 없어도 브라우저가 켜므로, Vue 상태로 그립니다.
.ui-radio-group__option--selected .ui-radio-group__control {
  border-color: var(--ui-primary-default);
}

.ui-radio-group__option--selected .ui-radio-group__control::after {
  transform: scale(1);
}

.ui-radio-group__input:focus-visible ~ .ui-radio-group__control {
  outline: 2px solid var(--ui-border-focus-ring);
  outline-offset: 2px;
}

.ui-radio-group__input:disabled ~ .ui-radio-group__control {
  background: var(--ui-surface-disabled);
  border-color: var(--ui-border-disabled);
}

.ui-radio-group__option-icon {
  display: inline-flex;
  align-items: center;
  margin-right: var(--ui-spacing-xs);
}

.ui-radio-group__option-icon-img {
  display: block;
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.ui-radio-group__empty {
  margin: 0;
  color: var(--ui-text-muted);
}

// --- variant="button": 토글 버튼처럼 보이는 스타일 ---

.ui-radio-group__options--button {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--ui-spacing-sm);
}

.ui-radio-group__options--button.ui-radio-group__options--horizontal {
  flex-direction: row;
}

.ui-radio-group__options--button .ui-radio-group__option {
  padding: var(--ui-spacing-sm) var(--ui-spacing-md);
  border: 1px solid var(--ui-border-control);
  border-radius: 999px;
  background: var(--ui-surface-default);
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.ui-radio-group__options--button .ui-radio-group__option:not(.ui-radio-group__option--disabled):hover {
  border-color: var(--ui-border-hover);
}

.ui-radio-group__options--button .ui-radio-group__option--selected {
  border-color: var(--ui-primary-default);
  background: var(--ui-primary-default);
  color: var(--ui-primary-on);
}

.ui-radio-group__options--button .ui-radio-group__option--disabled {
  background: var(--ui-surface-disabled);
}

// 원형 dot 인디케이터는 숨기고, 대신 input이 버튼 전체를 덮어 클릭/포커스 영역이 되게 함
.ui-radio-group__options--button .ui-radio-group__control {
  display: none;
}

.ui-radio-group__options--button .ui-radio-group__input {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ui-radio-group__options--button .ui-radio-group__option:focus-within {
  outline: 2px solid var(--ui-border-focus-ring);
  outline-offset: 2px;
}
</style>
