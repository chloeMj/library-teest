<script setup lang="ts">
import { computed, ref, toRef, useId } from 'vue'
import { useFieldClasses } from '../../composables/useFieldClasses'
import { useFieldValidation, type FieldValidator } from '../../composables/useFieldValidation'
import { isImageIcon, type ErrorPosition, type LabelPosition, type SelectOption } from '../../types/form'

type CheckboxDirection = 'vertical' | 'horizontal'
/** 체크된 사각형(box, 기본) 또는 토글 버튼처럼 보이는 스타일(button) */
type CheckboxVariant = 'box' | 'button'
/** options를 생략하면 boolean 단일 체크박스, 주면 다중 선택 그룹 */
type CheckboxValue = boolean | (string | number)[]

interface Props {
  modelValue?: CheckboxValue
  /** 지정하면 다중 선택 그룹(v-model: 배열), 생략하면 label 하나짜리 단일 체크박스(v-model: boolean) */
  options?: SelectOption[]
  label?: string
  labelPosition?: LabelPosition
  direction?: CheckboxDirection
  variant?: CheckboxVariant
  required?: boolean
  errorPosition?: ErrorPosition
  /** 내장 required 검증 외에 추가로 실행할 커스텀 검증 함수 */
  validator?: FieldValidator<CheckboxValue>
  disabled?: boolean
  name?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  // options는 기본값을 주지 않습니다 — undefined여야 "단일 체크박스 모드"로 판단합니다.
  labelPosition: 'top',
  direction: 'vertical',
  variant: 'box',
  required: false,
  errorPosition: 'bottom',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: CheckboxValue]
  blur: [event: FocusEvent]
}>()

const touched = ref(false)

const generatedId = useId()
const groupId = computed(() => props.id ?? generatedId)
// 같은 그룹의 체크박스는 name을 공유하는 게 표준 시맨틱입니다 (다중 값 필드).
const groupName = computed(() => props.name ?? groupId.value)
const errorId = computed(() => `${groupId.value}-error`)

const isGroup = computed(() => Array.isArray(props.options))

/**
 * 단일 모드도 "옵션 하나짜리 그룹"으로 취급해서 렌더링/선택 로직을 하나로 통일합니다.
 * 단일 모드에서는 체크 여부를 modelValue(boolean)로만 판단하므로 value는 쓰이지 않습니다.
 */
const SINGLE_VALUE = 'single'

const normalizedOptions = computed<SelectOption[]>(() =>
  isGroup.value
    ? (props.options as SelectOption[])
    : [{ label: props.label ?? '', value: SINGLE_VALUE }],
)

const modelValueRef = toRef(props, 'modelValue')
const { errorMessage } = useFieldValidation<CheckboxValue>({
  value: modelValueRef,
  // max 개념이 없으므로 'number'가 아닌 임의의 타입으로 고정
  type: computed(() => 'checkbox'),
  required: toRef(props, 'required'),
  validator: toRef(props, 'validator'),
  touched,
  isEmpty: (value) => (Array.isArray(value) ? value.length === 0 : value !== true),
})

const { rootClasses } = useFieldClasses({
  block: 'ui-checkbox-group',
  labelPosition: toRef(props, 'labelPosition'),
  errorPosition: toRef(props, 'errorPosition'),
  invalid: computed(() => !!errorMessage.value),
  disabled: toRef(props, 'disabled'),
  // 체크박스 그룹은 하나의 포커스/floating 개념이 없어 항상 false
  focused: computed(() => false),
  floated: computed(() => false),
})

const isOptionDisabled = (option: SelectOption) => props.disabled || !!option.disabled

const isChecked = (option: SelectOption) => {
  if (!isGroup.value) return props.modelValue === true
  const current = Array.isArray(props.modelValue) ? props.modelValue : []
  return current.includes(option.value)
}

const toggleOption = (option: SelectOption) => {
  if (isOptionDisabled(option)) return
  touched.value = true

  if (!isGroup.value) {
    emit('update:modelValue', !isChecked(option))
    return
  }

  const current = Array.isArray(props.modelValue) ? props.modelValue : []
  const next = isChecked(option)
    ? current.filter((value) => value !== option.value)
    : [...current, option.value]
  emit('update:modelValue', next)
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
  <div class="ui-checkbox-group" :class="rootClasses">
    <span v-if="isGroup && label" class="ui-checkbox-group__label">
      <slot name="label">{{ label }}<span v-if="required" class="ui-checkbox-group__required-mark">*</span></slot>
    </span>

    <div class="ui-checkbox-group__body">
      <div
        class="ui-checkbox-group__options"
        :class="[
          `ui-checkbox-group__options--${variant}`,
          { 'ui-checkbox-group__options--horizontal': direction === 'horizontal' },
        ]"
        :role="isGroup ? 'group' : undefined"
        :aria-label="isGroup ? label : undefined"
        :aria-required="required"
        :aria-describedby="errorMessage ? errorId : undefined"
      >
        <label
          v-for="(option, index) in normalizedOptions"
          :key="isGroup ? option.value : 'single'"
          class="ui-checkbox-group__option"
          :class="{
            'ui-checkbox-group__option--disabled': isOptionDisabled(option),
            'ui-checkbox-group__option--selected': isChecked(option),
          }"
        >
          <input
            type="checkbox"
            class="ui-checkbox-group__input"
            :name="groupName"
            :value="option.value"
            :checked="isChecked(option)"
            :disabled="isOptionDisabled(option)"
            @change="toggleOption(option)"
            @blur="onBlur"
          />
          <span class="ui-checkbox-group__control" aria-hidden="true"></span>
          <span class="ui-checkbox-group__option-label">
            <slot name="option" :option="option" :index="index">
              <span v-if="option.icon" class="ui-checkbox-group__option-icon" aria-hidden="true">
                <img
                  v-if="isImageIcon(option.icon)"
                  class="ui-checkbox-group__option-icon-img"
                  :src="option.icon.src"
                  :alt="option.icon.alt ?? ''"
                />
                <template v-else>{{ option.icon }}</template>
              </span>
              {{ option.label }}<span v-if="!isGroup && required" class="ui-checkbox-group__required-mark">*</span>
            </slot>
          </span>
        </label>

        <p v-if="isGroup && normalizedOptions.length === 0" class="ui-checkbox-group__empty">
          <slot name="empty">표시할 항목이 없습니다.</slot>
        </p>
      </div>

      <p v-if="errorMessage" :id="errorId" class="ui-checkbox-group__error" role="alert">
        <slot name="error" :message="errorMessage">{{ errorMessage }}</slot>
      </p>
    </div>
  </div>
</template>

<!-- Input.vue와 동일한 이유로 scoped를 쓰지 않습니다 (ui-checkbox-group BEM 클래스만으로 격리). -->
<style lang="scss">
@use '../../styles/mixins/field-layout' as field;

.ui-checkbox-group {
  @include field.field-label-top;
  font-size: var(--ui-font-size-md);
  color: var(--ui-text-default);
}

.ui-checkbox-group--label-left {
  @include field.field-label-left;
}

.ui-checkbox-group__label {
  font-size: var(--ui-font-size-sm);
  color: var(--ui-text-default);
}

.ui-checkbox-group--label-left > .ui-checkbox-group__label {
  flex: 0 0 auto;
}

.ui-checkbox-group--invalid > .ui-checkbox-group__label {
  color: var(--ui-danger-default);
}

.ui-checkbox-group__required-mark {
  color: var(--ui-danger-default);
  margin-left: 2px;
}

.ui-checkbox-group__body {
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-xs);
  flex: 1 1 auto;
  min-width: 0;
}

.ui-checkbox-group__options {
  order: 1;
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-sm);
}

.ui-checkbox-group__options--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--ui-spacing-lg);
}

.ui-checkbox-group__error {
  order: 2;
  margin: 0;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-danger-default);
}

.ui-checkbox-group--error-top .ui-checkbox-group__options {
  order: 2;
}

.ui-checkbox-group--error-top .ui-checkbox-group__error {
  order: 1;
}

.ui-checkbox-group__option {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-spacing-sm);
  cursor: pointer;
}

.ui-checkbox-group__option--disabled {
  cursor: not-allowed;
  color: var(--ui-text-muted);
}

// 네이티브 input은 시각적으로 숨기되(접근성/포커스/클릭 영역은 유지),
// 실제 체크 모양은 옆의 .ui-checkbox-group__control로 그립니다.
.ui-checkbox-group__input {
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

.ui-checkbox-group__input:disabled {
  cursor: not-allowed;
}

.ui-checkbox-group__control {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--ui-radius-sm);
  border: 1.5px solid var(--ui-border-default);
  background: var(--ui-surface-default);
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.ui-checkbox-group__control::after {
  content: '';
  width: 5px;
  height: 9px;
  margin-bottom: 2px;
  border: solid var(--ui-primary-on);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  transition: transform 0.12s ease;
}

.ui-checkbox-group__option:not(.ui-checkbox-group__option--disabled):hover .ui-checkbox-group__control {
  border-color: var(--ui-border-hover);
}

.ui-checkbox-group__input:checked ~ .ui-checkbox-group__control {
  background: var(--ui-primary-default);
  border-color: var(--ui-primary-default);
}

.ui-checkbox-group__input:checked ~ .ui-checkbox-group__control::after {
  transform: rotate(45deg) scale(1);
}

.ui-checkbox-group__input:focus-visible ~ .ui-checkbox-group__control {
  outline: 2px solid var(--ui-border-focus-ring);
  outline-offset: 2px;
}

.ui-checkbox-group__input:disabled ~ .ui-checkbox-group__control {
  background: var(--ui-surface-disabled);
  border-color: var(--ui-border-disabled);
}

.ui-checkbox-group__option-icon {
  display: inline-flex;
  align-items: center;
  margin-right: var(--ui-spacing-xs);
}

.ui-checkbox-group__option-icon-img {
  display: block;
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.ui-checkbox-group__empty {
  margin: 0;
  color: var(--ui-text-muted);
}

// --- variant="button": 토글 버튼처럼 보이는 스타일 ---

.ui-checkbox-group__options--button {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--ui-spacing-sm);
}

.ui-checkbox-group__options--button.ui-checkbox-group__options--horizontal {
  flex-direction: row;
}

.ui-checkbox-group__options--button .ui-checkbox-group__option {
  padding: var(--ui-spacing-sm) var(--ui-spacing-md);
  border: 1px solid var(--ui-border-default);
  border-radius: 999px;
  background: var(--ui-surface-default);
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.ui-checkbox-group__options--button .ui-checkbox-group__option:not(.ui-checkbox-group__option--disabled):hover {
  border-color: var(--ui-border-hover);
}

.ui-checkbox-group__options--button .ui-checkbox-group__option--selected {
  border-color: var(--ui-primary-default);
  background: var(--ui-primary-default);
  color: var(--ui-primary-on);
}

.ui-checkbox-group__options--button .ui-checkbox-group__option--disabled {
  background: var(--ui-surface-disabled);
}

.ui-checkbox-group__options--button .ui-checkbox-group__control {
  display: none;
}

.ui-checkbox-group__options--button .ui-checkbox-group__input {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ui-checkbox-group__options--button .ui-checkbox-group__option:focus-within {
  outline: 2px solid var(--ui-border-focus-ring);
  outline-offset: 2px;
}
</style>
