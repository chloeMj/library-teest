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
  block: "fm-select",
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
  const trigger = controlRef.value?.querySelector<HTMLElement>(".fm-select__trigger");
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
  "fm-select__control--open": isOpen.value,
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
    class="fm-select"
    :class="[rootClasses, `fm-select--${variant}`, { 'fm-select--readonly': readonly }]"
  >
    <label
      v-if="label && labelPosition !== 'inside'"
      class="fm-select__label"
      :for="triggerId"
    >
      <slot name="label">
        {{ label }}
        <span v-if="required" class="fm-select__required-mark">*</span>
      </slot>
    </label>

    <div class="fm-select__body">
      <div ref="controlRef" class="fm-select__control" :class="controlClasses">
        <label
          v-if="label && labelPosition === 'inside'"
          class="fm-select__label fm-select__label--inside"
          :for="triggerId"
        >
          <slot name="label">
            {{ label }}
            <span v-if="required" class="fm-select__required-mark">*</span>
          </slot>
        </label>

        <button
          v-if="!searchable"
          :id="triggerId"
          ref="triggerRef"
          type="button"
          class="fm-select__trigger"
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
          <span v-if="$slots.prefix" class="fm-select__affix">
            <slot name="prefix" />
          </span>
          <span
            class="fm-select__value"
            :class="{ 'fm-select__value--placeholder': !selectedOption }"
          >
            {{
              selectedOption
                ? selectedOption.label
                : labelPosition === "inside"
                  ? ""
                  : placeholder
            }}
          </span>
          <span class="fm-select__arrow" aria-hidden="true">▾</span>
        </button>

        <div v-else class="fm-select__trigger fm-select__trigger--searchable">
          <span v-if="$slots.prefix" class="fm-select__affix">
            <slot name="prefix" />
          </span>
          <input
            :id="triggerId"
            ref="triggerRef"
            type="text"
            class="fm-select__search-input"
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
          <span class="fm-select__arrow" aria-hidden="true">▾</span>
        </div>

        <Teleport to="body">
        <ul
          v-if="isDropdownOpen"
          :id="listboxId"
          class="fm-select__menu"
          :style="menuStyle"
          role="listbox"
        >
          <li
            v-for="(option, index) in filteredOptions"
            :id="`${triggerId}-option-${index}`"
            :key="option.value"
            role="option"
            :aria-selected="option.value === modelValue"
            class="fm-select__option"
            :class="{
              'fm-select__option--selected': option.value === modelValue,
              'fm-select__option--active': index === activeIndex,
            }"
            @mousedown.prevent="selectOption(option)"
            @mouseenter="activeIndex = index"
          >
            <slot name="option" :option="option">{{ option.label }}</slot>
          </li>
          <li v-if="filteredOptions.length === 0" class="fm-select__empty">
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
        class="fm-select__error"
        role="alert"
      >
        <slot name="error" :message="errorMessage">{{ errorMessage }}</slot>
      </p>
    </div>

    <Teleport to="body">
      <Transition name="fm-select-sheet">
        <div
          v-if="isOpen && isMobile"
          class="fm-select__sheet-backdrop"
          @click="closeMenu"
        >
          <div class="fm-select__sheet" role="listbox" @click.stop>
            <div class="fm-select__sheet-header">
              <span class="fm-select__sheet-title">
                {{ label || placeholder }}
              </span>
              <button
                type="button"
                class="fm-select__sheet-close"
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
              class="fm-select__sheet-search"
              placeholder="검색"
              :value="query"
              @input="onSearchInput"
              @keydown="onTriggerKeydown"
            />

            <ul class="fm-select__sheet-list">
              <li
                v-for="(option, index) in filteredOptions"
                :key="option.value"
                role="option"
                :aria-selected="option.value === modelValue"
                class="fm-select__sheet-option"
                :class="{
                  'fm-select__sheet-option--selected':
                    option.value === modelValue,
                  'fm-select__sheet-option--active': index === activeIndex,
                }"
                @click="selectOption(option)"
              >
                <slot name="option" :option="option">{{ option.label }}</slot>
              </li>
              <li
                v-if="filteredOptions.length === 0"
                class="fm-select__sheet-empty"
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

<!-- Input.vue와 동일한 이유로 scoped를 쓰지 않습니다 (fm-select BEM 클래스만으로 격리). -->
<style lang="scss">
@use "../../styles/mixins/field-layout" as field;

.fm-select {
  @include field.field-label-top;
  font-size: var(--fm-font-size-md);
  color: var(--fm-text-default);
}

.fm-select--label-left {
  @include field.field-label-left;
}

.fm-select--label-inside {
  @include field.field-label-inside;
}

.fm-select__label {
  font-size: var(--fm-font-size-sm);
  color: var(--fm-text-default);
}

.fm-select--label-left > .fm-select__label {
  flex: 0 0 auto;
}

.fm-select__required-mark {
  color: var(--fm-danger-default);
  margin-left: 2px;
}

.fm-select__body {
  display: flex;
  flex-direction: column;
  gap: var(--fm-spacing-xs);
  flex: 1 1 auto;
  min-width: 0;
}

.fm-select__control {
  order: 1;
  position: relative;
}

.fm-select__error {
  order: 2;
  margin: 0;
  font-size: var(--fm-font-size-sm);
  color: var(--fm-danger-default);
}

.fm-select--error-top .fm-select__control {
  order: 2;
}

.fm-select--error-top .fm-select__error {
  order: 1;
}

.fm-select--invalid .fm-select__trigger {
  border-color: var(--fm-danger-default);
}

.fm-select--disabled .fm-select__trigger {
  background: var(--fm-surface-disabled);
  cursor: not-allowed;
}

.fm-select__trigger {
  // 검색 모드는 <div>라서 기본값이 content-box입니다. <button>(기본 border-box)과
  // 너비 계산을 맞추지 않으면 padding·테두리만큼 18px 넓어집니다.
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fm-spacing-xs);
  border: 1px solid var(--fm-border-control);
  border-radius: var(--fm-radius-xs);
  background: var(--fm-surface-default);
  // Input과 같은 조절점
  min-height: var(--fm-field-height, 36px);
  padding: var(--fm-field-padding-y, var(--fm-spacing-sm)) var(--fm-spacing-sm);
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: border-color var(--fm-duration-normal) var(--fm-easing-standard);
}

.fm-select__trigger--searchable {
  cursor: text;
}

.fm-select--readonly .fm-select__trigger {
  cursor: default;
}

.fm-select__affix {
  display: inline-flex;
  flex: 0 0 auto;
  color: var(--fm-text-muted);
}

.fm-select__search-input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: inherit;
  padding: 0;
}

.fm-select__control--focused .fm-select__trigger,
.fm-select__control--open .fm-select__trigger {
  border-color: var(--fm-border-focus);
}

.fm-select__value {
  flex: 1 1 auto;
  min-width: 0;
  // inside 라벨이라 값이 비어 있어도 한 줄 높이를 차지해야 Input과 높이가 같습니다.
  min-height: 1lh;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fm-select__value--placeholder {
  color: var(--fm-text-placeholder);
}

.fm-select__arrow {
  flex: 0 0 auto;
  // ▾ 글자가 폰트에 따라 줄 높이를 키워 Input보다 1px 커지던 문제를 막습니다.
  line-height: 1;
  color: var(--fm-text-muted);
  transition: transform var(--fm-duration-normal) var(--fm-easing-standard);
}

.fm-select__control--open .fm-select__arrow {
  transform: rotate(180deg);
}

.fm-select__label--inside {
  position: absolute;
  left: var(--fm-spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--fm-font-size-md);
  color: var(--fm-text-muted);
  background: var(--fm-surface-default);
  padding: 0 4px;
  pointer-events: none;
  transition:
    top var(--fm-duration-normal) var(--fm-easing-standard),
    font-size var(--fm-duration-normal) var(--fm-easing-standard),
    transform var(--fm-duration-normal) var(--fm-easing-standard),
    color var(--fm-duration-normal) var(--fm-easing-standard);
  z-index: 1;
}

.fm-select__control--floated .fm-select__label--inside {
  top: 0;
  font-size: var(--fm-font-size-sm);
  color: var(--fm-primary-default);
}

// <body>로 옮겨져 화면 기준으로 놓입니다. top/left/width/max-height는 스크립트가 넣습니다.
.fm-select__menu {
  position: fixed;
  box-sizing: border-box;
  z-index: var(--fm-z-index-overlay);
  margin: 0;
  padding: var(--fm-spacing-xs) 0;
  list-style: none;
  background: var(--fm-surface-raised);
  border: 1px solid var(--fm-border-default);
  border-radius: var(--fm-radius-xs);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
}

.fm-select__option {
  padding: var(--fm-spacing-sm);
  cursor: pointer;
  color: var(--fm-text-default);
}

.fm-select__option--active {
  background: var(--fm-surface-hover);
}

.fm-select__option--selected {
  color: var(--fm-primary-default);
  font-weight: 600;
}

.fm-select__empty {
  padding: var(--fm-spacing-sm);
  color: var(--fm-text-muted);
}

// --- 모바일 bottomSheet ---

.fm-select__sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--fm-z-index-overlay);
  display: flex;
  align-items: flex-end;
  background: var(--fm-surface-backdrop);
}

.fm-select__sheet {
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--fm-surface-raised);
  border-radius: var(--fm-radius-sm) var(--fm-radius-sm) 0 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
  overflow: hidden;
}

.fm-select__sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--fm-spacing-md);
  border-bottom: 1px solid var(--fm-border-default);
  font-size: var(--fm-font-size-lg);
  color: var(--fm-text-default);
}

.fm-select__sheet-close {
  border: none;
  background: transparent;
  font-size: var(--fm-font-size-lg);
  color: var(--fm-text-muted);
  cursor: pointer;
  line-height: 1;
}

.fm-select__sheet-search {
  margin: var(--fm-spacing-sm) var(--fm-spacing-md) 0;
  padding: var(--fm-spacing-sm);
  border: 1px solid var(--fm-border-control);
  border-radius: var(--fm-radius-xs);
  font: inherit;
  color: inherit;
  outline: none;
}

.fm-select__sheet-list {
  margin: 0;
  padding: var(--fm-spacing-xs) 0;
  list-style: none;
  overflow-y: auto;
}

.fm-select__sheet-option {
  padding: var(--fm-spacing-md);
  font-size: var(--fm-font-size-lg);
  color: var(--fm-text-default);
  cursor: pointer;
}

.fm-select__sheet-option--active {
  background: var(--fm-surface-hover);
}

.fm-select__sheet-option--selected {
  color: var(--fm-primary-default);
  font-weight: 600;
}

.fm-select__sheet-empty {
  padding: var(--fm-spacing-md);
  color: var(--fm-text-muted);
}

.fm-select-sheet-enter-active,
.fm-select-sheet-leave-active {
  transition: opacity var(--fm-duration-slow) var(--fm-easing-standard);
}

.fm-select-sheet-enter-from,
.fm-select-sheet-leave-to {
  opacity: 0;
}

// 올라올 때는 빠르게 시작해 부드럽게 멈추고, 내려갈 때는 천천히 시작해 빠르게 빠집니다.
.fm-select-sheet-enter-active .fm-select__sheet {
  transition: transform var(--fm-duration-slow) var(--fm-easing-enter);
}

.fm-select-sheet-leave-active .fm-select__sheet {
  transition: transform var(--fm-duration-slow) var(--fm-easing-exit);
}

.fm-select-sheet-enter-from .fm-select__sheet,
.fm-select-sheet-leave-to .fm-select__sheet {
  transform: translateY(100%);
}
// inside 라벨은 variant와 상관없이 같은 높이 (Input과 같은 규칙)
.fm-select--label-inside .fm-select__trigger {
  min-height: max(var(--fm-field-height, 36px), var(--fm-field-height-inside, 44px));
}

// --- variant: Input과 같은 규칙입니다 (Input.vue의 variant 블록 참고) ---
// outlined(기본)는 위의 .fm-select__trigger 규칙을 그대로 씁니다.

// filled: 테두리 대신 배경으로 입력 영역을 표시
.fm-select--filled .fm-select__trigger {
  background: var(--fm-surface-hover);
  border-color: transparent;
}

.fm-select--filled .fm-select__control--focused .fm-select__trigger,
.fm-select--filled .fm-select__control--open .fm-select__trigger {
  border-color: var(--fm-border-focus);
}

.fm-select--filled.fm-select--invalid .fm-select__trigger {
  border-color: var(--fm-danger-default);
}

.fm-select--filled.fm-select--disabled .fm-select__trigger {
  background: var(--fm-surface-disabled);
}

// filled + inside 라벨: 라벨을 박스 안쪽 위에 두고 값을 아래로 내립니다
.fm-select--filled .fm-select__label--inside {
  padding: 0;
  background: transparent;
}

.fm-select--filled .fm-select__control--floated .fm-select__label--inside {
  top: var(--fm-spacing-xs);
  transform: none;
}

.fm-select--filled.fm-select--label-inside .fm-select__trigger {
  padding-top: calc(
    var(--fm-field-padding-y, var(--fm-spacing-sm)) + var(--fm-font-size-sm)
  );
  padding-bottom: var(--fm-spacing-xs);
}

// 위 여백이 아래보다 커서 화살표가 아래로 처집니다. 위아래 여백 차이만큼 음수 margin을
// 주면(가운데 정렬에서 그 절반만큼 올라감) 박스 전체 기준으로 가운데에 옵니다.
.fm-select--filled.fm-select--label-inside .fm-select__arrow {
  margin-top: calc(
    -1 * (var(--fm-field-padding-y, var(--fm-spacing-sm)) + var(--fm-font-size-sm) - var(--fm-spacing-xs))
  );
}

// underline: 아래쪽 선만 남김
.fm-select--underline .fm-select__trigger {
  border-width: 0 0 1px 0;
  border-radius: 0;
  background: transparent;
  padding-left: 0;
  padding-right: 0;
}

.fm-select--underline.fm-select--disabled .fm-select__trigger {
  background: transparent;
  opacity: 0.6;
}

.fm-select--underline .fm-select__label--inside {
  left: 0;
  padding-left: 0;
  background: transparent;
}
</style>
