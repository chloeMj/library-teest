<script setup lang="ts">
import { computed, nextTick, ref, toRef, useId } from 'vue'
import { useFieldClasses } from '../../composables/useFieldClasses'
import { useFieldValidation, type FieldValidator } from '../../composables/useFieldValidation'
import { useFloatingLabel } from '../../composables/useFloatingLabel'
import { useIsMobile } from '../../composables/useIsMobile'
import type { ErrorPosition, LabelPosition, SelectOption } from '../../types/form'

interface Props {
  modelValue?: string | number | null
  options?: SelectOption[]
  label?: string
  labelPosition?: LabelPosition
  placeholder?: string
  required?: boolean
  errorPosition?: ErrorPosition
  /** 내장 required 검증 외에 추가로 실행할 커스텀 검증 함수 */
  validator?: FieldValidator
  disabled?: boolean
  /** 검색어로 옵션을 필터링할 수 있는 콤보박스 모드 */
  searchable?: boolean
  /** searchable일 때 검색 대상으로 볼 SelectOption의 필드명 목록 (기본: label, value) */
  filterKeys?: string[]
  /** 검색 매칭 로직을 완전히 직접 구현하고 싶을 때 사용. 지정하면 filterKeys는 무시됨 */
  filterOption?: (option: SelectOption, query: string) => boolean
  /** 이 너비(px) 이하에서는 드롭다운 대신 bottomSheet로 열림 */
  mobileBreakpoint?: number
  name?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => [],
  labelPosition: 'top',
  required: false,
  errorPosition: 'bottom',
  disabled: false,
  searchable: false,
  filterKeys: () => ['label', 'value'],
  mobileBreakpoint: 640,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const triggerRef = ref<HTMLButtonElement | HTMLInputElement | null>(null)
const sheetSearchRef = ref<HTMLInputElement | null>(null)
const touched = ref(false)
const isOpen = ref(false)
const activeIndex = ref(-1)
const query = ref('')

const isMobile = useIsMobile(props.mobileBreakpoint)

const generatedId = useId()
const triggerId = computed(() => props.id ?? generatedId)
const errorId = computed(() => `${triggerId.value}-error`)
const listboxId = computed(() => `${triggerId.value}-listbox`)

const modelValueRef = toRef(props, 'modelValue')
const floating = useFloatingLabel(modelValueRef)
const { errorMessage } = useFieldValidation({
  value: modelValueRef,
  // maxLength 개념이 없으므로 'number'가 아닌 임의의 타입으로 고정
  type: computed(() => 'select'),
  required: toRef(props, 'required'),
  validator: toRef(props, 'validator'),
  touched,
})

const selectedOption = computed(
  () => props.options.find((option) => option.value === props.modelValue) ?? null,
)

/** searchable일 때 query로 걸러진 목록. 아니면 options 그대로 */
const filteredOptions = computed(() => {
  if (!props.searchable || !query.value.trim()) return props.options
  const q = query.value.trim().toLowerCase()

  if (props.filterOption) {
    return props.options.filter((option) => props.filterOption!(option, q))
  }

  const keys = props.filterKeys.length > 0 ? props.filterKeys : ['label', 'value']
  return props.options.filter((option) =>
    keys.some((key) => String(option[key] ?? '').toLowerCase().includes(q)),
  )
})

/** searchable input에 실제로 표시할 값: 열려있는 동안은 입력 중인 query, 닫히면 선택된 라벨 */
const displayValue = computed(() => {
  if (isOpen.value) return query.value
  return selectedOption.value?.label ?? ''
})

const { rootClasses, controlClasses: baseControlClasses } = useFieldClasses({
  block: 'lib-select',
  labelPosition: toRef(props, 'labelPosition'),
  errorPosition: toRef(props, 'errorPosition'),
  invalid: computed(() => !!errorMessage.value),
  disabled: toRef(props, 'disabled'),
  focused: floating.isFocused,
  floated: floating.isFloated,
})

// Select만 갖는 open 상태 modifier를 공통 controlClasses 위에 얹음
const controlClasses = computed(() => ({
  ...baseControlClasses.value,
  'lib-select__control--open': isOpen.value,
}))

const openMenu = () => {
  if (props.disabled || isOpen.value) return
  isOpen.value = true
  if (props.searchable) query.value = ''

  const list = filteredOptions.value
  const currentIndex = list.findIndex((option) => option.value === props.modelValue)
  activeIndex.value = currentIndex >= 0 ? currentIndex : list.length > 0 ? 0 : -1

  if (props.searchable) {
    // 모바일은 bottomSheet 안의 검색 input이 이번 렌더에서 새로 마운트되므로 nextTick에서 포커스
    nextTick(() => {
      if (isMobile.value) sheetSearchRef.value?.focus()
      else triggerRef.value?.focus()
    })
  }
}

const closeMenu = () => {
  isOpen.value = false
  activeIndex.value = -1
  touched.value = true
  if (props.searchable) query.value = ''
}

const toggleOpen = () => {
  if (props.disabled) return
  if (isOpen.value) closeMenu()
  else openMenu()
}

const selectOption = (option: SelectOption) => {
  if (props.disabled) return
  emit('update:modelValue', option.value)
  closeMenu()
  triggerRef.value?.focus()
}

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  query.value = target.value
  isOpen.value = true
  activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1
}

const onFocus = (event: FocusEvent) => {
  floating.onFocus()
  if (props.searchable) openMenu()
  emit('focus', event)
}

const onBlur = (event: FocusEvent) => {
  floating.onBlur()
  // 모바일 bottomSheet는 explicit하게(바깥탭/닫기버튼/선택) 닫아야 하므로 blur로는 닫지 않음
  if (!isMobile.value) closeMenu()
  else touched.value = true
  emit('blur', event)
}

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return

  const list = filteredOptions.value

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        openMenu()
        return
      }
      activeIndex.value = Math.min(activeIndex.value + 1, list.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        openMenu()
        return
      }
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (isOpen.value && activeIndex.value >= 0 && list[activeIndex.value]) {
        selectOption(list[activeIndex.value])
      } else if (!props.searchable) {
        toggleOpen()
      }
      break
    case ' ':
      // searchable 모드에서는 스페이스가 검색어 입력이어야 함
      if (!props.searchable) {
        event.preventDefault()
        if (isOpen.value && activeIndex.value >= 0 && list[activeIndex.value]) {
          selectOption(list[activeIndex.value])
        } else {
          toggleOpen()
        }
      }
      break
    case 'Escape':
      closeMenu()
      triggerRef.value?.focus()
      break
  }
}

/** 폼 제출 시 강제로 validation을 노출시키고 유효 여부를 받고 싶을 때 사용 */
const validate = () => {
  touched.value = true
  return !errorMessage.value
}

defineExpose({
  focus: () => triggerRef.value?.focus(),
  validate,
})
</script>

<template>
  <div class="lib-select" :class="rootClasses">
    <label v-if="label && labelPosition !== 'inside'" class="lib-select__label" :for="triggerId">
      <slot name="label">{{ label }}<span v-if="required" class="lib-select__required-mark">*</span></slot>
    </label>

    <div class="lib-select__body">
      <div class="lib-select__control" :class="controlClasses">
        <label
          v-if="label && labelPosition === 'inside'"
          class="lib-select__label lib-select__label--inside"
          :for="triggerId"
        >
          <slot name="label">{{ label }}<span v-if="required" class="lib-select__required-mark">*</span></slot>
        </label>

        <button
          v-if="!searchable"
          :id="triggerId"
          ref="triggerRef"
          type="button"
          class="lib-select__trigger"
          :disabled="disabled"
          :aria-expanded="isOpen"
          aria-haspopup="listbox"
          :aria-controls="listboxId"
          :aria-describedby="errorMessage ? errorId : undefined"
          @click="toggleOpen"
          @keydown="onTriggerKeydown"
          @focus="onFocus"
          @blur="onBlur"
        >
          <span class="lib-select__value" :class="{ 'lib-select__value--placeholder': !selectedOption }">
            {{ selectedOption ? selectedOption.label : (labelPosition === 'inside' ? '' : placeholder) }}
          </span>
          <span class="lib-select__arrow" aria-hidden="true">▾</span>
        </button>

        <div v-else class="lib-select__trigger lib-select__trigger--searchable">
          <input
            :id="triggerId"
            ref="triggerRef"
            type="text"
            class="lib-select__search-input"
            role="combobox"
            aria-autocomplete="list"
            :value="displayValue"
            :placeholder="labelPosition === 'inside' ? undefined : placeholder"
            :disabled="disabled"
            :aria-expanded="isOpen"
            aria-haspopup="listbox"
            :aria-controls="listboxId"
            :aria-activedescendant="activeIndex >= 0 ? `${triggerId}-option-${activeIndex}` : undefined"
            :aria-describedby="errorMessage ? errorId : undefined"
            autocomplete="off"
            @input="onSearchInput"
            @keydown="onTriggerKeydown"
            @focus="onFocus"
            @blur="onBlur"
          />
          <span class="lib-select__arrow" aria-hidden="true">▾</span>
        </div>

        <ul v-if="isOpen && !isMobile" :id="listboxId" class="lib-select__menu" role="listbox">
          <li
            v-for="(option, index) in filteredOptions"
            :id="`${triggerId}-option-${index}`"
            :key="option.value"
            role="option"
            :aria-selected="option.value === modelValue"
            class="lib-select__option"
            :class="{
              'lib-select__option--selected': option.value === modelValue,
              'lib-select__option--active': index === activeIndex,
            }"
            @mousedown.prevent="selectOption(option)"
            @mouseenter="activeIndex = index"
          >
            <slot name="option" :option="option">{{ option.label }}</slot>
          </li>
          <li v-if="filteredOptions.length === 0" class="lib-select__empty">
            <slot name="empty">{{ searchable && query ? '검색 결과가 없습니다.' : '표시할 항목이 없습니다.' }}</slot>
          </li>
        </ul>
      </div>

      <p v-if="errorMessage" :id="errorId" class="lib-select__error" role="alert">
        <slot name="error" :message="errorMessage">{{ errorMessage }}</slot>
      </p>
    </div>

    <Teleport to="body">
      <Transition name="lib-select-sheet">
        <div v-if="isOpen && isMobile" class="lib-select__sheet-backdrop" @click="closeMenu">
          <div class="lib-select__sheet" role="listbox" @click.stop>
            <div class="lib-select__sheet-header">
              <span class="lib-select__sheet-title">{{ label || placeholder }}</span>
              <button type="button" class="lib-select__sheet-close" aria-label="닫기" @click="closeMenu">✕</button>
            </div>

            <input
              v-if="searchable"
              ref="sheetSearchRef"
              type="text"
              class="lib-select__sheet-search"
              placeholder="검색"
              :value="query"
              @input="onSearchInput"
              @keydown="onTriggerKeydown"
            />

            <ul class="lib-select__sheet-list">
              <li
                v-for="(option, index) in filteredOptions"
                :key="option.value"
                role="option"
                :aria-selected="option.value === modelValue"
                class="lib-select__sheet-option"
                :class="{
                  'lib-select__sheet-option--selected': option.value === modelValue,
                  'lib-select__sheet-option--active': index === activeIndex,
                }"
                @click="selectOption(option)"
              >
                <slot name="option" :option="option">{{ option.label }}</slot>
              </li>
              <li v-if="filteredOptions.length === 0" class="lib-select__sheet-empty">
                <slot name="empty">{{ searchable && query ? '검색 결과가 없습니다.' : '표시할 항목이 없습니다.' }}</slot>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<!-- Input.vue와 동일한 이유로 scoped를 쓰지 않습니다 (lib-select BEM 클래스만으로 격리). -->
<style lang="scss">
@use '../../styles/mixins/field-layout' as field;

.lib-select {
  @include field.field-label-top;
  font-size: var(--lib-font-size-md);
  color: var(--lib-color-text);
}

.lib-select--label-left {
  @include field.field-label-left;
}

.lib-select--label-inside {
  @include field.field-label-inside;
}

.lib-select__label {
  font-size: var(--lib-font-size-sm);
  color: var(--lib-color-text);
}

.lib-select--label-left > .lib-select__label {
  flex: 0 0 auto;
}

.lib-select__required-mark {
  color: var(--lib-color-error);
  margin-left: 2px;
}

.lib-select__body {
  display: flex;
  flex-direction: column;
  gap: var(--lib-spacing-xs);
  flex: 1 1 auto;
  min-width: 0;
}

.lib-select__control {
  order: 1;
  position: relative;
}

.lib-select__error {
  order: 2;
  margin: 0;
  font-size: var(--lib-font-size-sm);
  color: var(--lib-color-error);
}

.lib-select--error-top .lib-select__control {
  order: 2;
}

.lib-select--error-top .lib-select__error {
  order: 1;
}

.lib-select--invalid .lib-select__trigger {
  border-color: var(--lib-color-error);
}

.lib-select--disabled .lib-select__trigger {
  background: var(--lib-color-bg-disabled);
  cursor: not-allowed;
}

.lib-select__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--lib-spacing-xs);
  border: 1px solid var(--lib-color-border);
  border-radius: var(--lib-radius-sm);
  background: var(--lib-color-bg);
  padding: var(--lib-spacing-sm);
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.lib-select__trigger--searchable {
  cursor: text;
}

.lib-select__search-input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: inherit;
  padding: 0;
}

.lib-select__control--focused .lib-select__trigger,
.lib-select__control--open .lib-select__trigger {
  border-color: var(--lib-color-border-focus);
}

.lib-select__value {
  flex: 1 1 auto;
  min-width: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lib-select__value--placeholder {
  color: var(--lib-color-text-muted);
}

.lib-select__arrow {
  flex: 0 0 auto;
  color: var(--lib-color-text-muted);
  transition: transform 0.15s ease;
}

.lib-select__control--open .lib-select__arrow {
  transform: rotate(180deg);
}

.lib-select__label--inside {
  position: absolute;
  left: var(--lib-spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--lib-font-size-md);
  color: var(--lib-color-text-muted);
  background: var(--lib-color-bg);
  padding: 0 4px;
  pointer-events: none;
  transition:
    top 0.15s ease,
    font-size 0.15s ease,
    transform 0.15s ease,
    color 0.15s ease;
  z-index: 1;
}

.lib-select__control--floated .lib-select__label--inside {
  top: 0;
  font-size: var(--lib-font-size-sm);
  color: var(--lib-color-primary);
}

.lib-select__menu {
  position: absolute;
  top: calc(100% + var(--lib-spacing-xs));
  left: 0;
  right: 0;
  z-index: var(--lib-z-index-overlay);
  margin: 0;
  padding: var(--lib-spacing-xs) 0;
  list-style: none;
  background: var(--lib-color-bg);
  border: 1px solid var(--lib-color-border);
  border-radius: var(--lib-radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
}

.lib-select__option {
  padding: var(--lib-spacing-sm);
  cursor: pointer;
  color: var(--lib-color-text);
}

.lib-select__option--active {
  background: var(--lib-color-bg-disabled);
}

.lib-select__option--selected {
  color: var(--lib-color-primary);
  font-weight: 600;
}

.lib-select__empty {
  padding: var(--lib-spacing-sm);
  color: var(--lib-color-text-muted);
}

// --- 모바일 bottomSheet ---

.lib-select__sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--lib-z-index-overlay);
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.4);
}

.lib-select__sheet {
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--lib-color-bg);
  border-radius: var(--lib-radius-md) var(--lib-radius-md) 0 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
  overflow: hidden;
}

.lib-select__sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--lib-spacing-md);
  border-bottom: 1px solid var(--lib-color-border);
  font-size: var(--lib-font-size-lg);
  color: var(--lib-color-text);
}

.lib-select__sheet-close {
  border: none;
  background: transparent;
  font-size: var(--lib-font-size-lg);
  color: var(--lib-color-text-muted);
  cursor: pointer;
  line-height: 1;
}

.lib-select__sheet-search {
  margin: var(--lib-spacing-sm) var(--lib-spacing-md) 0;
  padding: var(--lib-spacing-sm);
  border: 1px solid var(--lib-color-border);
  border-radius: var(--lib-radius-sm);
  font: inherit;
  color: inherit;
  outline: none;
}

.lib-select__sheet-list {
  margin: 0;
  padding: var(--lib-spacing-xs) 0;
  list-style: none;
  overflow-y: auto;
}

.lib-select__sheet-option {
  padding: var(--lib-spacing-md);
  font-size: var(--lib-font-size-lg);
  color: var(--lib-color-text);
  cursor: pointer;
}

.lib-select__sheet-option--active {
  background: var(--lib-color-bg-disabled);
}

.lib-select__sheet-option--selected {
  color: var(--lib-color-primary);
  font-weight: 600;
}

.lib-select__sheet-empty {
  padding: var(--lib-spacing-md);
  color: var(--lib-color-text-muted);
}

.lib-select-sheet-enter-active,
.lib-select-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.lib-select-sheet-enter-from,
.lib-select-sheet-leave-to {
  opacity: 0;
}

.lib-select-sheet-enter-active .lib-select__sheet,
.lib-select-sheet-leave-active .lib-select__sheet {
  transition: transform 0.2s ease;
}

.lib-select-sheet-enter-from .lib-select__sheet,
.lib-select-sheet-leave-to .lib-select__sheet {
  transform: translateY(100%);
}
</style>
