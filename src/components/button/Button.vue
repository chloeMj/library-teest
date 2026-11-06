<script setup lang="ts">
import { computed, resolveComponent, useSlots } from "vue";
import { readableTextColor } from "../../utils/color";

/**
 * 모양. Input의 variant와 같은 단어를 같은 뜻으로 씁니다.
 *   filled   배경이 채워진 버튼. 화면의 핵심 동작 (저장, 다음)
 *   outlined 테두리만 있는 버튼. 보조 동작 (취소, 이전)
 *   ghost    배경·테두리 없이 hover 때만 배경. 툴바, 아이콘 버튼
 *   text     여백 없이 글자만, hover 때 밑줄. 문장 옆 "더보기", "비밀번호 찾기"
 */
type ButtonVariant = "filled" | "outlined" | "ghost" | "text";
/**
 * 색. 용도를 정하지 않고 색의 성격만 정합니다. 어떤 동작에 어떤 색을 쓸지는 디자인이 정합니다.
 *   primary   브랜드 주조색. 가장 강조
 *   secondary 강조하지 않는 보조색 (기본 회색)
 *   danger    경고색 (기본 빨강)
 * 실제 색은 토큰(--ui-<이름>-default / -on)으로 바꿉니다.
 */
const NAMED_COLORS = ["primary", "secondary", "danger"] as const;
type ButtonColor = (typeof NAMED_COLORS)[number];
type ButtonSize = "sm" | "md" | "lg";
/** vue-router의 RouteLocationRaw와 같은 모양. 라이브러리가 vue-router에 의존하지 않도록 직접 적습니다 */
type RouteTarget = string | Record<string, unknown>;

interface Props {
  variant?: ButtonVariant;
  /**
   * 이름(primary/secondary/danger) 또는 색상값("#1e3a8a", "rgb(...)").
   * 색상값은 특별한 버튼 하나에만 쓰는 예외용이고, variant="filled"에 쓰세요.
   * outlined·ghost·text는 색이 글자가 되므로 고정 색 하나로는 라이트·다크 모두에서
   * 읽히게 할 수 없습니다 → 그런 경우와 프로젝트 전체 색은 토큰으로 바꾸세요.
   * 색상값을 주면 hover/active는 자동 계산되고, 글자색은 명암비가 높은 쪽(흰색/진회색)을
   * 자동으로 고릅니다. 직접 정하려면 style="--ui-button-on: ..."을 주세요.
   */
  // (string & {}): 아무 문자열이나 받되 자동완성에는 이름 세 개가 보이게 하는 TypeScript 관용구
  color?: ButtonColor | (string & {});
  /**
   * 표준 크기. 높이·여백 값은 tokens.scss의 --ui-button-height-* / --ui-button-padding-x-*.
   * 버튼 하나만 다른 크기가 필요하면 prop을 늘리지 말고 변수를 직접 주세요.
   * 예) <UiButton style="--ui-button-height: 52px; --ui-button-padding-x: 24px">
   */
  size?: ButtonSize;
  /**
   * HTML 기본값은 submit이라 form 안에서 누르면 의도치 않게 제출됩니다.
   * 그래서 기본값을 button으로 둡니다. 제출 버튼만 type="submit"을 주세요.
   * (href/to를 주면 링크가 되므로 이 값은 쓰이지 않습니다)
   */
  type?: "button" | "submit" | "reset";
  /** 주면 <a>로 렌더링됩니다. 외부 사이트·파일 다운로드 등 */
  href?: string;
  /** 링크를 새 탭에서 열 때 "_blank" */
  target?: string;
  /** 주면 vue-router의 <RouterLink>로 렌더링됩니다. 앱 안의 페이지 이동 */
  to?: RouteTarget;
  disabled?: boolean;
  /** 저장 중처럼 처리 중일 때. 스피너를 보여주고 다시 누르지 못하게 막습니다 */
  loading?: boolean;
  /** 부모 너비를 꽉 채웁니다 (모바일 하단 버튼 등) */
  block?: boolean;
  /**
   * 아이콘만 있는 정사각형 버튼. 글자가 없으므로 화면 낭독기용 이름을
   * 반드시 aria-label로 주세요. 예) <UiButton icon aria-label="닫기">✕</UiButton>
   */
  icon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "filled",
  color: "primary",
  size: "md",
  type: "button",
  disabled: false,
  loading: false,
  block: false,
  icon: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const slots = useSlots();

const inactive = computed(() => props.disabled || props.loading);

// --- 색 ---
const isNamedColor = computed(() =>
  (NAMED_COLORS as readonly string[]).includes(props.color),
);

/** 색상값을 직접 준 경우에만 그 색을 CSS 변수로 넘깁니다 */
const colorStyle = computed(() => {
  if (isNamedColor.value) return undefined;
  const on = readableTextColor(props.color);
  return {
    "--ui-button-color": props.color,
    ...(on ? { "--ui-button-on": on } : {}),
  };
});

/**
 * 무엇으로 그릴지 고릅니다.
 *   to   → RouterLink (앱에 vue-router가 설치되어 있어야 합니다)
 *   href → a
 *   없음 → button
 * 비활성 링크는 이동하면 안 되므로 href 없는 <a>로 그립니다.
 */
const tag = computed(() => {
  if (props.to !== undefined && !inactive.value) return resolveComponent("RouterLink");
  if (props.to !== undefined || props.href !== undefined) return "a";
  return "button";
});

/** 태그마다 필요한 속성이 달라서 여기서 모아 만듭니다 */
const tagAttrs = computed(() => {
  if (tag.value === "button") {
    return { type: props.type, disabled: inactive.value };
  }
  if (inactive.value) {
    // <a>에는 disabled 속성이 없어서, href를 빼고 aria-disabled로 비활성을 알립니다.
    return { "aria-disabled": "true", tabindex: -1 };
  }
  if (props.to !== undefined) return { to: props.to };
  return {
    href: props.href,
    target: props.target,
    // 새 탭으로 연 페이지가 원래 페이지를 조작하지 못하게 막는 보안 설정
    rel: props.target === "_blank" ? "noopener noreferrer" : undefined,
  };
});

const onClick = (event: MouseEvent) => {
  if (inactive.value) {
    event.preventDefault();
    return;
  }
  emit("click", event);
};
</script>

<template>
  <component
    :is="tag"
    class="ui-button"
    :class="[
      `ui-button--${variant}`,
      isNamedColor ? `ui-button--${color}` : 'ui-button--custom',
      `ui-button--${size}`,
      {
        'ui-button--block': block,
        'ui-button--icon': icon,
        'ui-button--loading': loading,
        'ui-button--disabled': disabled,
      },
    ]"
    :style="colorStyle"
    v-bind="tagAttrs"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <!-- 로딩 중에는 아이콘 자리에 스피너를 보여줍니다 -->
    <span v-if="loading" class="ui-button__spinner" aria-hidden="true" />
    <span v-else-if="slots.prefix" class="ui-button__affix">
      <slot name="prefix" />
    </span>

    <!-- 아이콘 버튼이 로딩 중이면 아이콘 대신 스피너만 보입니다 -->
    <span v-if="!(icon && loading)" class="ui-button__label">
      <slot />
    </span>

    <span v-if="slots.suffix" class="ui-button__affix">
      <slot name="suffix" />
    </span>
  </component>
</template>

<!--
  Input과 같은 이유로 scoped를 쓰지 않습니다.
  설치한 프로젝트가 .ui-button 같은 단일 클래스로 덮어쓸 수 있게 하기 위해서입니다.

  모양·크기는 CSS 변수로 바꿉니다 (DESIGN.md 5장의 fallback 방식 — 선언하지 않으면 기본값).
    프로젝트 기준  :root에 --ui-button-radius, --ui-button-font-weight,
                   --ui-button-height-sm/lg, --ui-button-padding-x-sm/md/lg
                   (md 높이는 폼과 같은 --ui-field-height)
    버튼 하나만    그 버튼에 --ui-button-height, --ui-button-padding-x 지정
  '버튼 하나만' 변수는 :root에 두지 마세요. 모든 크기가 같은 값이 됩니다.

  색은 color 클래스가 대표색(--_c)과 그 위 글자색(--_on)만 정하고,
  variant 클래스가 그 둘을 어디(배경/글자/테두리)에 쓸지 정합니다.
  hover/active는 --_c에 --_on을 섞어 계산하므로 색마다 따로 정하지 않습니다.
  버튼 하나만 색을 바꾸려면 --ui-button-color(대표색), --ui-button-on(글자색),
  --ui-button-border(outlined 테두리)를 주세요. 반복되면 클래스로 묶으세요.
-->
<style lang="scss">
.ui-button {
  // 크기 클래스가 이 두 값만 바꿉니다.
  // md는 Input·Select와 같은 폼 높이(--ui-field-height)를 씁니다. 감싼 요소에
  // <form style="--ui-field-height: 44px">처럼 주면 그 안의 md 버튼도 같이 맞춰집니다.
  --_size-height: var(--ui-field-height, 36px);
  --_size-padding-x: var(--ui-button-padding-x-md, var(--ui-spacing-md));

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-spacing-xs);
  box-sizing: border-box;
  min-height: var(--ui-button-height, var(--_size-height));
  padding: 0 var(--ui-button-padding-x, var(--_size-padding-x));
  border: 1px solid transparent;
  border-radius: var(--ui-button-radius, var(--ui-radius-sm));
  background: transparent;
  color: var(--_c);
  font: inherit;
  font-size: var(--ui-font-size-md);
  font-weight: var(--ui-button-font-weight, 600);
  line-height: 1.2;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition:
    background var(--ui-duration-normal) var(--ui-easing-standard),
    border-color var(--ui-duration-normal) var(--ui-easing-standard),
    color var(--ui-duration-normal) var(--ui-easing-standard);

  // 마우스 클릭에는 안 보이고 키보드(Tab)로 왔을 때만 보이는 포커스 링
  &:focus-visible {
    outline: 2px solid var(--ui-border-focus-ring);
    outline-offset: 2px;
  }
}

// ---------------------------------------------------------------------------
// 크기
// ---------------------------------------------------------------------------
.ui-button--sm {
  --_size-height: var(--ui-button-height-sm, 28px);
  --_size-padding-x: var(--ui-button-padding-x-sm, var(--ui-spacing-sm));
  font-size: var(--ui-font-size-sm);
}

.ui-button--lg {
  // 모바일 터치 영역 권장 크기(44px)
  --_size-height: var(--ui-button-height-lg, 44px);
  --_size-padding-x: var(--ui-button-padding-x-lg, var(--ui-spacing-lg));
  font-size: var(--ui-font-size-lg);
}

.ui-button--block {
  display: flex;
  width: 100%;
}

// 아이콘만 있는 버튼은 높이와 같은 너비의 정사각형
.ui-button--icon {
  width: var(--ui-button-height, var(--_size-height));
  padding: 0;
}

// ---------------------------------------------------------------------------
// 색 — 대표색과 그 위 글자색만 고릅니다
//   --_c      대표색 (filled 배경 / 나머지는 글자)
//   --_on     filled 배경 위 글자색
//   --_border outlined 테두리 (기본은 대표색)
// --ui-button-border를 주면 글자색과 다른 테두리색을 쓸 수 있습니다 (outlined).
// --ui-button-color / --ui-button-on을 버튼에 주면 그 버튼만 색이 바뀝니다.
// ---------------------------------------------------------------------------
.ui-button--primary {
  --_c: var(--ui-button-color, var(--ui-primary-default));
  --_on: var(--ui-button-on, var(--ui-primary-on));
}

.ui-button--secondary {
  --_c: var(--ui-button-color, var(--ui-secondary-default));
  --_on: var(--ui-button-on, var(--ui-secondary-on));
  // 회색 테두리는 대표색(진회색)이면 너무 무거워서 입력 박스와 같은 테두리를 씁니다.
  --_border: var(--ui-border-control);
}

.ui-button--danger {
  --_c: var(--ui-button-color, var(--ui-danger-default));
  --_on: var(--ui-button-on, var(--ui-danger-on));
}

// color에 색상값을 직접 준 경우 (스크립트가 --ui-button-color를 넣어 줌)
.ui-button--custom {
  --_c: var(--ui-button-color);
  --_on: var(--ui-button-on, #fff);
}

// ---------------------------------------------------------------------------
// 모양 — 위 변수를 어디에 쓸지
// ---------------------------------------------------------------------------
.ui-button--filled {
  background: var(--_c);
  color: var(--_on);
}

.ui-button--outlined {
  border-color: var(--ui-button-border, var(--_border, var(--_c)));
}

// ---------------------------------------------------------------------------
// hover · active — 대표색에서 자동 계산 (Material Design의 state layer 방식)
//   filled           대표색에 글자색을 8% / 12% 섞음 (토큰의 hover/active와 같은 식)
//   outlined · ghost 투명 배경에 대표색을 8% / 14% 깔아 줌
//
// - color-mix()를 모르는 오래된 브라우저(iOS 16.1 이하 등)에서는 @supports로 빠져
//   hover 색만 안 바뀌고 버튼은 정상으로 보입니다.
// - hover는 마우스가 있는 기기에서만 적용합니다. 터치 기기는 탭한 뒤 hover 색이
//   남아 있는 문제가 있어서, 누르는 동안(active)만 색이 바뀝니다.
// - 비활성·로딩 중에는 :not(...)으로 막습니다.
// ---------------------------------------------------------------------------
$interactive: ":not(.ui-button--disabled):not(.ui-button--loading)";

@supports (color: color-mix(in srgb, red, blue)) {
  @media (hover: hover) {
    .ui-button--filled#{$interactive}:hover {
      background: color-mix(in srgb, var(--_c) 92%, var(--_on));
    }

    .ui-button--outlined#{$interactive}:hover,
    .ui-button--ghost#{$interactive}:hover {
      background: color-mix(in srgb, var(--_c) 8%, transparent);
    }
  }

  .ui-button--filled#{$interactive}:active {
    background: color-mix(in srgb, var(--_c) 88%, var(--_on));
  }

  .ui-button--outlined#{$interactive}:active,
  .ui-button--ghost#{$interactive}:active {
    background: color-mix(in srgb, var(--_c) 14%, transparent);
  }
}

// 글자처럼 문장 옆에 놓이도록 높이·여백을 없앱니다.
.ui-button--text {
  min-height: 0;
  padding: 0;
  border: none;
  border-radius: 0;

  @media (hover: hover) {
    &#{$interactive}:hover {
      text-decoration: underline;
      text-underline-offset: 0.2em;
    }
  }
}

// ---------------------------------------------------------------------------
// 상태
// 비활성은 색과 상관없이 똑같이 보입니다. 모양(배경 유무)은 유지합니다.
// 로딩은 눌리지 않을 뿐 비활성이 아니므로 원래 색을 유지합니다.
// ---------------------------------------------------------------------------
.ui-button.ui-button--disabled {
  color: var(--ui-text-disabled);
  cursor: not-allowed;
}

.ui-button--filled.ui-button--disabled {
  background: var(--ui-surface-disabled);
}

.ui-button--outlined.ui-button--disabled {
  border-color: var(--ui-border-disabled);
}

.ui-button--loading {
  cursor: progress;
}

// ---------------------------------------------------------------------------
// 슬롯 · 스피너
// ---------------------------------------------------------------------------
.ui-button__affix,
.ui-button__label {
  display: inline-flex;
  align-items: center;
}

.ui-button__spinner {
  width: 1em;
  height: 1em;
  box-sizing: border-box;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  // 회전은 "처리 중"이라는 정보 자체라서 동작 줄이기 설정에서도 멈추지 않도록
  // 모션 토큰을 쓰지 않습니다.
  animation: ui-button-spin 0.8s linear infinite;
}

@keyframes ui-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
