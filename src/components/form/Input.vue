<script setup lang="ts">
import { computed, ref, toRef, useId } from "vue";
import { useFieldClasses } from "../../composables/useFieldClasses";
import {
  useFieldValidation,
  type FieldValidator,
} from "../../composables/useFieldValidation";
import { useFloatingLabel } from "../../composables/useFloatingLabel";
import type { ErrorPosition, FieldVariant, LabelPosition } from "../../types/form";

type InputType = "text" | "number" | "email" | "password" | "tel" | "search";

interface Props {
  modelValue?: string | number | null;
  type?: InputType;
  /** 입력 박스 모양 (Select와 같은 값) */
  variant?: FieldVariant;
  label?: string;
  labelPosition?: LabelPosition;
  placeholder?: string;
  required?: boolean;
  /** 문자열 입력이면 최대 글자 수, type="number"면 최댓값 */
  max?: number;
  /** type="number"에서만 사용 (스테퍼 하한, 네이티브 min 속성) */
  min?: number;
  /** type="number"에서 한 번에 증감할 값. 스테퍼 버튼과 화살표 키에 함께 적용됩니다 */
  step?: number;
  /** type="number"일 때만 의미 있는 증감 버튼 노출 여부 */
  showStepper?: boolean;
  errorPosition?: ErrorPosition;
  /** 내장 required/max 검증 외에 추가로 실행할 커스텀 검증 함수 */
  validator?: FieldValidator;
  disabled?: boolean;
  readonly?: boolean;
  name?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  type: "text",
  variant: "outlined",
  labelPosition: "top",
  required: false,
  showStepper: false,
  errorPosition: "bottom",
  step: 1,
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const touched = ref(false);

const generatedId = useId();
const inputId = computed(() => props.id ?? generatedId);
const errorId = computed(() => `${inputId.value}-error`);

const modelValueRef = toRef(props, "modelValue");
const floating = useFloatingLabel(modelValueRef);
const { errorMessage } = useFieldValidation({
  value: modelValueRef,
  type: toRef(props, "type"),
  required: toRef(props, "required"),
  max: toRef(props, "max"),
  min: toRef(props, "min"),
  validator: toRef(props, "validator"),
  touched,
});

const displayValue = computed(() => props.modelValue ?? "");

const { rootClasses, controlClasses } = useFieldClasses({
  block: "fm-input",
  labelPosition: toRef(props, "labelPosition"),
  errorPosition: toRef(props, "errorPosition"),
  invalid: computed(() => !!errorMessage.value),
  disabled: toRef(props, "disabled"),
  focused: floating.isFocused,
  floated: floating.isFloated,
});

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (props.type === "number") {
    if (target.value === "") {
      emit("update:modelValue", null);
      return;
    }
    const parsed = Number(target.value);
    emit("update:modelValue", Number.isNaN(parsed) ? target.value : parsed);
    return;
  }

  emit("update:modelValue", target.value);
};

const onFocus = (event: FocusEvent) => {
  floating.onFocus();
  emit("focus", event);
};

const onBlur = (event: FocusEvent) => {
  floating.onBlur();
  touched.value = true;
  emit("blur", event);
};

const handleStep = (direction: 1 | -1) => {
  if (props.disabled || props.readonly) return;

  const current =
    typeof props.modelValue === "number"
      ? props.modelValue
      : Number(props.modelValue) || 0;
  // 0.1 + 0.2 = 0.30000000000000004 같은 부동소수점 찌꺼기를 step의 자릿수로 잘라냅니다.
  const decimals = (String(props.step).split(".")[1] ?? "").length;
  let next = Number((current + direction * props.step).toFixed(decimals));

  if (props.max != null) next = Math.min(next, props.max);
  if (props.min != null) next = Math.max(next, props.min);

  emit("update:modelValue", next);
};

/** 폼 제출 시 강제로 validation을 노출시키고 유효 여부를 받고 싶을 때 사용 */
const validate = () => {
  touched.value = true;
  return !errorMessage.value;
};

defineExpose({
  focus: () => inputRef.value?.focus(),
  validate,
});
</script>

<template>
  <div class="fm-input" :class="[rootClasses, `fm-input--${variant}`]">
    <label
      v-if="label && labelPosition !== 'inside'"
      class="fm-input__label"
      :for="inputId"
    >
      <slot name="label">
        {{ label }}
        <span v-if="required" class="fm-input__required-mark">*</span>
      </slot>
    </label>

    <div class="fm-input__body">
      <div class="fm-input__control" :class="controlClasses">
        <span
          v-if="$slots.prefix"
          class="fm-input__affix fm-input__affix--prefix"
        >
          <slot name="prefix" />
        </span>

        <label
          v-if="label && labelPosition === 'inside'"
          class="fm-input__label fm-input__label--inside"
          :for="inputId"
        >
          <slot name="label">
            {{ label }}
            <span v-if="required" class="fm-input__required-mark">*</span>
          </slot>
        </label>

        <input
          :id="inputId"
          ref="inputRef"
          class="fm-input__field"
          :type="type"
          :value="displayValue"
          :placeholder="labelPosition === 'inside' ? undefined : placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :name="name"
          :min="type === 'number' ? min : undefined"
          :max="type === 'number' ? max : undefined"
          :step="type === 'number' ? step : undefined"
          :aria-invalid="!!errorMessage"
          :aria-describedby="errorMessage ? errorId : undefined"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
        />

        <span
          v-if="$slots.suffix"
          class="fm-input__affix fm-input__affix--suffix"
        >
          <slot name="suffix" />
        </span>

        <!-- 화살표 키로 증감되므로 보조기술에는 노출하지 않습니다 -->
        <span
          v-if="type === 'number' && showStepper"
          class="fm-input__stepper"
          aria-hidden="true"
        >
          <button
            type="button"
            class="fm-input__stepper-btn"
            tabindex="-1"
            :disabled="disabled || readonly"
            @click="handleStep(-1)"
          >
            −
          </button>
          <button
            type="button"
            class="fm-input__stepper-btn"
            tabindex="-1"
            :disabled="disabled || readonly"
            @click="handleStep(1)"
          >
            +
          </button>
        </span>
      </div>

      <p v-if="errorMessage" :id="errorId" class="fm-input__error" role="alert">
        <slot name="error" :message="errorMessage">{{ errorMessage }}</slot>
      </p>
    </div>
  </div>
</template>

<!--
  이 스타일 블록은 의도적으로 `scoped`를 쓰지 않습니다.
  scoped를 쓰면 모든 선택자에 [data-v-xxxx] 속성이 붙어 명시도가 한 단계
  올라가고, 설치한 프로젝트가 같은 명시도(단일 클래스)로 오버라이드할 수 없게
  됩니다. 대신 `fm-input` 접두사 + BEM 네이밍만으로 충돌을 방지합니다.
-->
<style lang="scss">
@use "../../styles/mixins/field-layout" as field;

.fm-input {
  @include field.field-label-top;
  font-size: var(--fm-font-size-md);
  color: var(--fm-text-default);
}

.fm-input--label-left {
  @include field.field-label-left;
}

.fm-input--label-inside {
  @include field.field-label-inside;
}

.fm-input__label {
  font-size: var(--fm-font-size-sm);
  color: var(--fm-text-default);
}

.fm-input--label-left > .fm-input__label {
  flex: 0 0 auto;
}

.fm-input__required-mark {
  color: var(--fm-danger-default);
  margin-left: 2px;
}

.fm-input__body {
  display: flex;
  flex-direction: column;
  gap: var(--fm-spacing-xs);
  flex: 1 1 auto;
  min-width: 0;
}

.fm-input__control {
  order: 1;
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-xs);
  border: 1px solid var(--fm-border-control);
  border-radius: var(--fm-radius-xs);
  background: var(--fm-surface-default);
  padding: 0 var(--fm-spacing-sm);
  // 높이 조절점. Select trigger(button)와 같은 높이가 나오도록 border-box로 맞춥니다.
  box-sizing: border-box;
  min-height: var(--fm-field-height, 36px);
  transition: border-color var(--fm-duration-normal) var(--fm-easing-standard);
}

.fm-input__error {
  order: 2;
  margin: 0;
  font-size: var(--fm-font-size-sm);
  color: var(--fm-danger-default);
}

.fm-input--error-top .fm-input__control {
  order: 2;
}

.fm-input--error-top .fm-input__error {
  order: 1;
}

.fm-input__control--focused {
  border-color: var(--fm-border-focus);
}

.fm-input--invalid .fm-input__control {
  border-color: var(--fm-danger-default);
}

.fm-input--disabled .fm-input__control {
  background: var(--fm-surface-disabled);
}

.fm-input__field {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: inherit;
  // 상하 여백 조절점
  padding: var(--fm-field-padding-y, var(--fm-spacing-sm)) 0;
}

.fm-input__field:disabled {
  color: var(--fm-text-disabled);
  cursor: not-allowed;
}

// type="number"의 브라우저 기본 스피너를 숨깁니다.
// showStepper가 true면 우리 커스텀 버튼과 이중으로 보이고, false여도 브라우저마다
// 생김새가 달라 디자인 통제가 안 되므로 항상 숨기고 showStepper로만 노출을 제어합니다.
.fm-input__field[type="number"]::-webkit-outer-spin-button,
.fm-input__field[type="number"]::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}

.fm-input__field[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.fm-input__affix {
  display: inline-flex;
  align-items: center;
  color: var(--fm-text-muted);
}

.fm-input__label--inside {
  position: absolute;
  // 좌우 padding(4px)만큼 당겨, 라벨 글자가 입력 글자와 같은 x에서 시작하게 합니다
  left: calc(var(--fm-spacing-sm) - 4px);
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
}

.fm-input__control--floated .fm-input__label--inside {
  top: 0;
  font-size: var(--fm-font-size-sm);
  color: var(--fm-primary-default);
}

.fm-input__stepper {
  display: inline-flex;
  flex-direction: row;
}

.fm-input__stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  // WCAG 2.5.8(최소 24x24). 가로로 놓아 입력 박스 높이는 그대로 둡니다.
  min-width: 24px;
  min-height: 24px;
  border: none;
  background: transparent;
  color: var(--fm-text-muted);
  // button은 브라우저 기본 글꼴(13.3px)을 쓰므로, 사용자가 글꼴 크기를 키울 때
  // 같이 커지도록 부모 글꼴을 물려받습니다.
  font: inherit;
  line-height: 1;
  padding: 0 var(--fm-spacing-xs);
  cursor: pointer;
}

.fm-input__stepper-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

// 손가락으로 쓰는 기기에서는 44x44로 키웁니다. 화면 너비가 아니라 입력 장치를
// 기준으로 하므로, 좁은 창으로 줄인 데스크톱에서는 그대로 24px입니다.
@media (pointer: coarse) {
  .fm-input__stepper-btn {
    min-width: 44px;
    min-height: 44px;
  }
}

// inside 라벨은 variant와 상관없이 같은 높이입니다. filled는 라벨을 박스 안 위쪽에
// 넣느라 공간이 더 필요해서, 셋 다 그 높이에 맞춥니다.
.fm-input--label-inside .fm-input__control {
  min-height: max(var(--fm-field-height, 36px), var(--fm-field-height-inside, 44px));
}

// --- variant: 테두리 구조가 달라 토큰으로 표현되지 않는 부분만 분기합니다 ---
// outlined(기본)는 위의 .fm-input__control 규칙을 그대로 씁니다.

// filled: 테두리 대신 배경으로 입력 영역을 표시
.fm-input--filled .fm-input__control {
  background: var(--fm-surface-hover);
  border-color: transparent;
}

.fm-input--filled .fm-input__control--focused {
  border-color: var(--fm-border-focus);
}

.fm-input--filled.fm-input--invalid .fm-input__control {
  border-color: var(--fm-danger-default);
}

.fm-input--filled.fm-input--disabled .fm-input__control {
  background: var(--fm-surface-disabled);
}

// --- filled + inside 라벨 ---
// outlined는 라벨이 위로 올라가 테두리를 끊고 걸터앉지만(그래서 배경색으로 선을
// 가림), filled에는 끊을 선이 없어 그냥 떠 보입니다. 그래서 filled에서는 라벨을
// 박스 안쪽 위에 두고, 입력값을 아래로 내립니다 (filled 스타일의 일반적인 방식).
// 가릴 테두리가 없으므로 배경과 좌우 padding을 모두 뺍니다
.fm-input--filled .fm-input__label--inside {
  left: var(--fm-spacing-sm);
  padding: 0;
  background: transparent;
}

.fm-input--filled .fm-input__control--floated .fm-input__label--inside {
  top: var(--fm-spacing-xs);
  transform: none;
}

// 라벨이 들어갈 자리만큼 위를 비우고, 전체 높이는 유지되도록 아래를 줄입니다
.fm-input--filled.fm-input--label-inside .fm-input__field {
  padding-top: calc(
    var(--fm-field-padding-y, var(--fm-spacing-sm)) + var(--fm-font-size-sm)
  );
  padding-bottom: var(--fm-spacing-xs);
}

// underline: 아래쪽 선만 남김
.fm-input--underline .fm-input__control {
  border-width: 0 0 1px 0;
  border-radius: 0;
  background: transparent;
  padding-left: 0;
  padding-right: 0;
}

.fm-input--underline.fm-input--disabled .fm-input__control {
  background: transparent;
  opacity: 0.6;
}

// 좌우 패딩이 없어졌으므로 inside 라벨도 왼쪽 끝에 맞춥니다
.fm-input--underline .fm-input__label--inside {
  left: 0;
  padding-left: 0;
  background: transparent;
}
</style>
