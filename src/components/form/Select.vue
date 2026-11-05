<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, toRef, useId, watch } from "vue";
import { useFieldClasses } from "../../composables/useFieldClasses";
import {
  useFieldValidation,
  type FieldValidator,
} from "../../composables/useFieldValidation";
import { useFloatingLabel } from "../../composables/useFloatingLabel";
import { useIsMobile } from "../../composables/useIsMobile";
import type {
  ErrorPosition,
  FieldVariant,
  LabelPosition,
  SelectOption,
} from "../../types/form";

interface Props {
  modelValue?: string | number | null;
  options?: SelectOption[];
  /** 입력 박스 모양. Input과 같은 값을 써서 한 폼 안에서 모양을 맞춥니다 */
  variant?: FieldVariant;
  label?: string;
  labelPosition?: LabelPosition;
  placeholder?: string;
  required?: boolean;
  errorPosition?: ErrorPosition;
  /** 내장 required 검증 외에 추가로 실행할 커스텀 검증 함수 */
  validator?: FieldValidator;
  disabled?: boolean;
  /** 값은 보이지만 바꿀 수 없음 (Input의 readonly와 같음). 목록이 열리지 않습니다 */
  readonly?: boolean;
  /** 검색어로 옵션을 필터링할 수 있는 콤보박스 모드 */
  searchable?: boolean;
  /** searchable일 때 검색 대상으로 볼 SelectOption의 필드명 목록 (기본: label, value) */
  filterKeys?: string[];
  /** 검색 매칭 로직을 완전히 직접 구현하고 싶을 때 사용. 지정하면 filterKeys는 무시됨 */
  filterOption?: (option: SelectOption, query: string) => boolean;
  /** 이 너비(px) 이하에서는 드롭다운 대신 bottomSheet로 열림 */
  mobileBreakpoint?: number;
  name?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  options: () => [],
  variant: "outlined",
  labelPosition: "top",
  required: false,
  errorPosition: "bottom",
  disabled: false,
  readonly: false,
  searchable: false,
  filterKeys: () => ["label", "value"],
  mobileBreakpoint: 640,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const triggerRef = ref<HTMLButtonElement | HTMLInputElement | null>(null);
const sheetSearchRef = ref<HTMLInputElement | null>(null);
const touched = ref(false);
const isOpen = ref(false);
const activeIndex = ref(-1);
const query = ref("");

const isMobile = useIsMobile(props.mobileBreakpoint);

const generatedId = useId();
const triggerId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${triggerId.value}-error`);
const listboxId = computed(() => `${triggerId.value}-listbox`);

const modelValueRef = toRef(props, "modelValue");
const floating = useFloatingLabel(modelValueRef);
const { errorMessage } = useFieldValidation({
  value: modelValueRef,
  // maxLength 개념이 없으므로 'number'가 아닌 임의의 타입으로 고정
  type: computed(() => "select"),
  required: toRef(props, "required"),
  validator: toRef(props, "validator"),
  touched,
});

const selectedOption = computed(
  () =>
    props.options.find((option) => option.value === props.modelValue) ?? null,
);

/** searchable일 때 query로 걸러진 목록. 아니면 options 그대로 */
const filteredOptions = computed(() => {
  if (!props.searchable || !query.value.trim()) return props.options;
  const q = query.value.trim().toLowerCase();

  if (props.filterOption) {
    return props.options.filter((option) => props.filterOption!(option, q));
  }

  const keys =
    props.filterKeys.length > 0 ? props.filterKeys : ["label", "value"];
  return props.options.filter((option) =>
    keys.some((key) =>
      String(option[key] ?? "")
        .toLowerCase()
        .includes(q),
    ),
  );
});

/** searchable input에 실제로 표시할 값: 열려있는 동안은 입력 중인 query, 닫히면 선택된 라벨 */
const displayValue = computed(() => {
  if (isOpen.value) return query.value;
  return selectedOption.value?.label ?? "";
});

const { rootClasses, controlClasses: baseControlClasses } = useFieldClasses({
  block: "ui-select",
  labelPosition: toRef(props, "labelPosition"),
  errorPosition: toRef(props, "errorPosition"),
  invalid: computed(() => !!errorMessage.value),
  disabled: toRef(props, "disabled"),
  focused: floating.isFocused,
  floated: floating.isFloated,
});

// Select만 갖는 open 상태 modifier를 공통 controlClasses 위에 얹음
// --- 드롭다운 위치 ---
// 목록을 <body>로 옮겨(Teleport) 화면에 고정 배치합니다. 부모 카드·Modal에
// overflow: hidden이 있어도 잘리지 않게 하기 위해서입니다. 대신 위치를 직접 계산하고,
// 아래 공간이 부족하면 위로 엽니다.
const controlRef = ref<HTMLElement | null>(null);
const menuStyle = ref<Record<string, string>>({});
const MENU_GAP = 4;
const MENU_MAX_HEIGHT = 240;
const MENU_MIN_HEIGHT = 120;

const updateMenuPosition = () => {
  const trigger = controlRef.value?.querySelector<HTMLElement>(".ui-select__trigger");
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP * 2;
  const spaceAbove = rect.top - MENU_GAP * 2;
  const openUp = spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;
  const space = openUp ? spaceAbove : spaceBelow;

  menuStyle.value = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${Math.max(MENU_MIN_HEIGHT, Math.min(MENU_MAX_HEIGHT, space))}px`,
    ...(openUp
      ? { bottom: `${window.innerHeight - rect.top + MENU_GAP}px` }
      : { top: `${rect.bottom + MENU_GAP}px` }),
  };
};

const stopTracking = () => {
  window.removeEventListener("scroll", updateMenuPosition, true);
  window.removeEventListener("resize", updateMenuPosition);
};

// 열려 있는 동안 스크롤·창 크기 변경을 따라 위치를 다시 잡습니다.
// (scroll은 capture로 받아야 카드 안쪽 스크롤도 잡힙니다)
const isDropdownOpen = computed(() => isOpen.value && !isMobile.value);
watch(isDropdownOpen, (open) => {
  if (open) {
    updateMenuPosition();
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
  } else {
    stopTracking();
  }
});
onBeforeUnmount(stopTracking);

/** 목록을 열거나 값을 바꿀 수 없는 상태 */
const locked = computed(() => props.disabled || props.readonly);

const controlClasses = computed(() => ({
  ...baseControlClasses.value,
  "ui-select__control--open": isOpen.value,
}));

const openMenu = () => {
  if (locked.value || isOpen.value) return;
  isOpen.value = true;
  if (props.searchable) query.value = "";

  const list = filteredOptions.value;
  const currentIndex = list.findIndex(
    (option) => option.value === props.modelValue,
  );
  activeIndex.value =
    currentIndex >= 0 ? currentIndex : list.length > 0 ? 0 : -1;

  if (props.searchable) {
    // 모바일은 bottomSheet 안의 검색 input이 이번 렌더에서 새로 마운트되므로 nextTick에서 포커스
    nextTick(() => {
      if (isMobile.value) sheetSearchRef.value?.focus();
      else triggerRef.value?.focus();
    });
  }
};

const closeMenu = () => {
  isOpen.value = false;
  activeIndex.value = -1;
  touched.value = true;
  if (props.searchable) query.value = "";
};

const toggleOpen = () => {
  if (locked.value) return;
  if (isOpen.value) closeMenu();
  else openMenu();
};

const selectOption = (option: SelectOption) => {
  if (locked.value) return;
  emit("update:modelValue", option.value);
  closeMenu();
  triggerRef.value?.focus();
};

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  query.value = target.value;
  isOpen.value = true;
  activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1;
};

const onFocus = (event: FocusEvent) => {
  floating.onFocus();
  if (props.searchable) openMenu();
  emit("focus", event);
};

const onBlur = (event: FocusEvent) => {
  floating.onBlur();
  // 모바일 bottomSheet는 explicit하게(바깥탭/닫기버튼/선택) 닫아야 하므로 blur로는 닫지 않음
  if (!isMobile.value) closeMenu();
  else touched.value = true;
  emit("blur", event);
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (locked.value) return;

  const list = filteredOptions.value;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (!isOpen.value) {
        openMenu();
        return;
      }
      activeIndex.value = Math.min(activeIndex.value + 1, list.length - 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      if (!isOpen.value) {
        openMenu();
        return;
      }
      activeIndex.value = Math.max(activeIndex.value - 1, 0);
      break;
    case "Enter":
      event.preventDefault();
      if (isOpen.value && activeIndex.value >= 0 && list[activeIndex.value]) {
        selectOption(list[activeIndex.value]);
      } else if (!props.searchable) {
        toggleOpen();
      }
      break;
    case " ":
      // searchable 모드에서는 스페이스가 검색어 입력이어야 함
      if (!props.searchable) {
        event.preventDefault();
        if (isOpen.value && activeIndex.value >= 0 && list[activeIndex.value]) {
          selectOption(list[activeIndex.value]);
        } else {
          toggleOpen();
        }
      }
      break;
    case "Escape":
      closeMenu();
      triggerRef.value?.focus();
      break;
  }
};

/** 폼 제출 시 강제로 validation을 노출시키고 유효 여부를 받고 싶을 때 사용 */
const validate = () => {
  touched.value = true;
  return !errorMessage.value;
};

defineExpose({
  focus: () => triggerRef.value?.focus(),
  validate,
});
</script>

<template>
  <div
    class="ui-select"
    :class="[rootClasses, `ui-select--${variant}`, { 'ui-select--readonly': readonly }]"
  >
    <label
      v-if="label && labelPosition !== 'inside'"
      class="ui-select__label"
      :for="triggerId"
    >
      <slot name="label">
        {{ label }}
        <span v-if="required" class="ui-select__required-mark">*</span>
      </slot>
    </label>

    <div class="ui-select__body">
      <div ref="controlRef" class="ui-select__control" :class="controlClasses">
        <label
          v-if="label && labelPosition === 'inside'"
          class="ui-select__label ui-select__label--inside"
          :for="triggerId"
        >
          <slot name="label">
            {{ label }}
            <span v-if="required" class="ui-select__required-mark">*</span>
          </slot>
        </label>

        <button
          v-if="!searchable"
          :id="triggerId"
          ref="triggerRef"
          type="button"
          class="ui-select__trigger"
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
          <span v-if="$slots.prefix" class="ui-select__affix">
            <slot name="prefix" />
          </span>
          <span
            class="ui-select__value"
            :class="{ 'ui-select__value--placeholder': !selectedOption }"
          >
            {{
              selectedOption
                ? selectedOption.label
                : labelPosition === "inside"
                  ? ""
                  : placeholder
            }}
          </span>
          <span class="ui-select__arrow" aria-hidden="true">▾</span>
        </button>

        <div v-else class="ui-select__trigger ui-select__trigger--searchable">
          <span v-if="$slots.prefix" class="ui-select__affix">
            <slot name="prefix" />
          </span>
          <input
            :id="triggerId"
            ref="triggerRef"
            type="text"
            class="ui-select__search-input"
            role="combobox"
            aria-autocomplete="list"
            :value="displayValue"
            :placeholder="labelPosition === 'inside' ? undefined : placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :aria-expanded="isOpen"
            aria-haspopup="listbox"
            :aria-controls="listboxId"
            :aria-activedescendant="
              activeIndex >= 0
                ? `${triggerId}-option-${activeIndex}`
                : undefined
            "
            :aria-describedby="errorMessage ? errorId : undefined"
            autocomplete="off"
            @input="onSearchInput"
            @keydown="onTriggerKeydown"
            @focus="onFocus"
            @blur="onBlur"
          />
          <span class="ui-select__arrow" aria-hidden="true">▾</span>
        </div>

        <Teleport to="body">
        <ul
          v-if="isDropdownOpen"
          :id="listboxId"
          class="ui-select__menu"
          :style="menuStyle"
          role="listbox"
        >
          <li
            v-for="(option, index) in filteredOptions"
            :id="`${triggerId}-option-${index}`"
            :key="option.value"
            role="option"
            :aria-selected="option.value === modelValue"
            class="ui-select__option"
            :class="{
              'ui-select__option--selected': option.value === modelValue,
              'ui-select__option--active': index === activeIndex,
            }"
            @mousedown.prevent="selectOption(option)"
            @mouseenter="activeIndex = index"
          >
            <slot name="option" :option="option">{{ option.label }}</slot>
          </li>
          <li v-if="filteredOptions.length === 0" class="ui-select__empty">
            <slot name="empty">
              {{
                searchable && query
                  ? "검색 결과가 없습니다."
                  : "표시할 항목이 없습니다."
              }}
            </slot>
          </li>
        </ul>
        </Teleport>
      </div>

      <p
        v-if="errorMessage"
        :id="errorId"
        class="ui-select__error"
        role="alert"
      >
        <slot name="error" :message="errorMessage">{{ errorMessage }}</slot>
      </p>
    </div>

    <Teleport to="body">
      <Transition name="ui-select-sheet">
        <div
          v-if="isOpen && isMobile"
          class="ui-select__sheet-backdrop"
          @click="closeMenu"
        >
          <div class="ui-select__sheet" role="listbox" @click.stop>
            <div class="ui-select__sheet-header">
              <span class="ui-select__sheet-title">
                {{ label || placeholder }}
              </span>
              <button
                type="button"
                class="ui-select__sheet-close"
                aria-label="닫기"
                @click="closeMenu"
              >
                ✕
              </button>
            </div>

            <input
              v-if="searchable"
              ref="sheetSearchRef"
              type="text"
              class="ui-select__sheet-search"
              placeholder="검색"
              :value="query"
              @input="onSearchInput"
              @keydown="onTriggerKeydown"
            />

            <ul class="ui-select__sheet-list">
              <li
                v-for="(option, index) in filteredOptions"
                :key="option.value"
                role="option"
                :aria-selected="option.value === modelValue"
                class="ui-select__sheet-option"
                :class="{
                  'ui-select__sheet-option--selected':
                    option.value === modelValue,
                  'ui-select__sheet-option--active': index === activeIndex,
                }"
                @click="selectOption(option)"
              >
                <slot name="option" :option="option">{{ option.label }}</slot>
              </li>
              <li
                v-if="filteredOptions.length === 0"
                class="ui-select__sheet-empty"
              >
                <slot name="empty">
                  {{
                    searchable && query
                      ? "검색 결과가 없습니다."
                      : "표시할 항목이 없습니다."
                  }}
                </slot>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<!-- Input.vue와 동일한 이유로 scoped를 쓰지 않습니다 (ui-select BEM 클래스만으로 격리). -->
<style lang="scss">
@use "../../styles/mixins/field-layout" as field;

.ui-select {
  @include field.field-label-top;
  font-size: var(--ui-font-size-md);
  color: var(--ui-text-default);
}

.ui-select--label-left {
  @include field.field-label-left;
}

.ui-select--label-inside {
  @include field.field-label-inside;
}

.ui-select__label {
  font-size: var(--ui-font-size-sm);
  color: var(--ui-text-default);
}

.ui-select--label-left > .ui-select__label {
  flex: 0 0 auto;
}

.ui-select__required-mark {
  color: var(--ui-danger-default);
  margin-left: 2px;
}

.ui-select__body {
  display: flex;
  flex-direction: column;
  gap: var(--ui-spacing-xs);
  flex: 1 1 auto;
  min-width: 0;
}

.ui-select__control {
  order: 1;
  position: relative;
}

.ui-select__error {
  order: 2;
  margin: 0;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-danger-default);
}

.ui-select--error-top .ui-select__control {
  order: 2;
}

.ui-select--error-top .ui-select__error {
  order: 1;
}

.ui-select--invalid .ui-select__trigger {
  border-color: var(--ui-danger-default);
}

.ui-select--disabled .ui-select__trigger {
  background: var(--ui-surface-disabled);
  cursor: not-allowed;
}

.ui-select__trigger {
  // 검색 모드는 <div>라서 기본값이 content-box입니다. <button>(기본 border-box)과
  // 너비 계산을 맞추지 않으면 padding·테두리만큼 18px 넓어집니다.
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-spacing-xs);
  border: 1px solid var(--ui-border-control);
  border-radius: var(--ui-radius-xs);
  background: var(--ui-surface-default);
  // Input과 같은 조절점
  min-height: var(--ui-field-height, 36px);
  padding: var(--ui-field-padding-y, var(--ui-spacing-sm)) var(--ui-spacing-sm);
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: border-color var(--ui-duration-normal) var(--ui-easing-standard);
}

.ui-select__trigger--searchable {
  cursor: text;
}

.ui-select--readonly .ui-select__trigger {
  cursor: default;
}

.ui-select__affix {
  display: inline-flex;
  flex: 0 0 auto;
  color: var(--ui-text-muted);
}

.ui-select__search-input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: inherit;
  padding: 0;
}

.ui-select__control--focused .ui-select__trigger,
.ui-select__control--open .ui-select__trigger {
  border-color: var(--ui-border-focus);
}

.ui-select__value {
  flex: 1 1 auto;
  min-width: 0;
  // inside 라벨이라 값이 비어 있어도 한 줄 높이를 차지해야 Input과 높이가 같습니다.
  min-height: 1lh;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-select__value--placeholder {
  color: var(--ui-text-placeholder);
}

.ui-select__arrow {
  flex: 0 0 auto;
  // ▾ 글자가 폰트에 따라 줄 높이를 키워 Input보다 1px 커지던 문제를 막습니다.
  line-height: 1;
  color: var(--ui-text-muted);
  transition: transform var(--ui-duration-normal) var(--ui-easing-standard);
}

.ui-select__control--open .ui-select__arrow {
  transform: rotate(180deg);
}

.ui-select__label--inside {
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
    top var(--ui-duration-normal) var(--ui-easing-standard),
    font-size var(--ui-duration-normal) var(--ui-easing-standard),
    transform var(--ui-duration-normal) var(--ui-easing-standard),
    color var(--ui-duration-normal) var(--ui-easing-standard);
  z-index: 1;
}

.ui-select__control--floated .ui-select__label--inside {
  top: 0;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-primary-default);
}

// <body>로 옮겨져 화면 기준으로 놓입니다. top/left/width/max-height는 스크립트가 넣습니다.
.ui-select__menu {
  position: fixed;
  box-sizing: border-box;
  z-index: var(--ui-z-index-overlay);
  margin: 0;
  padding: var(--ui-spacing-xs) 0;
  list-style: none;
  background: var(--ui-surface-raised);
  border: 1px solid var(--ui-border-default);
  border-radius: var(--ui-radius-xs);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
}

.ui-select__option {
  padding: var(--ui-spacing-sm);
  cursor: pointer;
  color: var(--ui-text-default);
}

.ui-select__option--active {
  background: var(--ui-surface-hover);
}

.ui-select__option--selected {
  color: var(--ui-primary-default);
  font-weight: 600;
}

.ui-select__empty {
  padding: var(--ui-spacing-sm);
  color: var(--ui-text-muted);
}

// --- 모바일 bottomSheet ---

.ui-select__sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--ui-z-index-overlay);
  display: flex;
  align-items: flex-end;
  background: var(--ui-surface-backdrop);
}

.ui-select__sheet {
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--ui-surface-raised);
  border-radius: var(--ui-radius-sm) var(--ui-radius-sm) 0 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
  overflow: hidden;
}

.ui-select__sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ui-spacing-md);
  border-bottom: 1px solid var(--ui-border-default);
  font-size: var(--ui-font-size-lg);
  color: var(--ui-text-default);
}

.ui-select__sheet-close {
  border: none;
  background: transparent;
  font-size: var(--ui-font-size-lg);
  color: var(--ui-text-muted);
  cursor: pointer;
  line-height: 1;
}

.ui-select__sheet-search {
  margin: var(--ui-spacing-sm) var(--ui-spacing-md) 0;
  padding: var(--ui-spacing-sm);
  border: 1px solid var(--ui-border-control);
  border-radius: var(--ui-radius-xs);
  font: inherit;
  color: inherit;
  outline: none;
}

.ui-select__sheet-list {
  margin: 0;
  padding: var(--ui-spacing-xs) 0;
  list-style: none;
  overflow-y: auto;
}

.ui-select__sheet-option {
  padding: var(--ui-spacing-md);
  font-size: var(--ui-font-size-lg);
  color: var(--ui-text-default);
  cursor: pointer;
}

.ui-select__sheet-option--active {
  background: var(--ui-surface-hover);
}

.ui-select__sheet-option--selected {
  color: var(--ui-primary-default);
  font-weight: 600;
}

.ui-select__sheet-empty {
  padding: var(--ui-spacing-md);
  color: var(--ui-text-muted);
}

.ui-select-sheet-enter-active,
.ui-select-sheet-leave-active {
  transition: opacity var(--ui-duration-slow) var(--ui-easing-standard);
}

.ui-select-sheet-enter-from,
.ui-select-sheet-leave-to {
  opacity: 0;
}

// 올라올 때는 빠르게 시작해 부드럽게 멈추고, 내려갈 때는 천천히 시작해 빠르게 빠집니다.
.ui-select-sheet-enter-active .ui-select__sheet {
  transition: transform var(--ui-duration-slow) var(--ui-easing-enter);
}

.ui-select-sheet-leave-active .ui-select__sheet {
  transition: transform var(--ui-duration-slow) var(--ui-easing-exit);
}

.ui-select-sheet-enter-from .ui-select__sheet,
.ui-select-sheet-leave-to .ui-select__sheet {
  transform: translateY(100%);
}
// inside 라벨은 variant와 상관없이 같은 높이 (Input과 같은 규칙)
.ui-select--label-inside .ui-select__trigger {
  min-height: max(var(--ui-field-height, 36px), var(--ui-field-height-inside, 44px));
}

// --- variant: Input과 같은 규칙입니다 (Input.vue의 variant 블록 참고) ---
// outlined(기본)는 위의 .ui-select__trigger 규칙을 그대로 씁니다.

// filled: 테두리 대신 배경으로 입력 영역을 표시
.ui-select--filled .ui-select__trigger {
  background: var(--ui-surface-hover);
  border-color: transparent;
}

.ui-select--filled .ui-select__control--focused .ui-select__trigger,
.ui-select--filled .ui-select__control--open .ui-select__trigger {
  border-color: var(--ui-border-focus);
}

.ui-select--filled.ui-select--invalid .ui-select__trigger {
  border-color: var(--ui-danger-default);
}

.ui-select--filled.ui-select--disabled .ui-select__trigger {
  background: var(--ui-surface-disabled);
}

// filled + inside 라벨: 라벨을 박스 안쪽 위에 두고 값을 아래로 내립니다
.ui-select--filled .ui-select__label--inside {
  padding: 0;
  background: transparent;
}

.ui-select--filled .ui-select__control--floated .ui-select__label--inside {
  top: var(--ui-spacing-xs);
  transform: none;
}

.ui-select--filled.ui-select--label-inside .ui-select__trigger {
  padding-top: calc(
    var(--ui-field-padding-y, var(--ui-spacing-sm)) + var(--ui-font-size-sm)
  );
  padding-bottom: var(--ui-spacing-xs);
}

// 위 여백이 아래보다 커서 화살표가 아래로 처집니다. 위아래 여백 차이만큼 음수 margin을
// 주면(가운데 정렬에서 그 절반만큼 올라감) 박스 전체 기준으로 가운데에 옵니다.
.ui-select--filled.ui-select--label-inside .ui-select__arrow {
  margin-top: calc(
    -1 * (var(--ui-field-padding-y, var(--ui-spacing-sm)) + var(--ui-font-size-sm) - var(--ui-spacing-xs))
  );
}

// underline: 아래쪽 선만 남김
.ui-select--underline .ui-select__trigger {
  border-width: 0 0 1px 0;
  border-radius: 0;
  background: transparent;
  padding-left: 0;
  padding-right: 0;
}

.ui-select--underline.ui-select--disabled .ui-select__trigger {
  background: transparent;
  opacity: 0.6;
}

.ui-select--underline .ui-select__label--inside {
  left: 0;
  padding-left: 0;
  background: transparent;
}
</style>
