<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, useSlots, watch } from "vue";
import Button from "../button/Button.vue";

type ModalSize = "sm" | "md" | "lg";

interface Props {
  /** 열림 여부. v-model로 씁니다 */
  modelValue?: boolean;
  /** 제목. #header 슬롯을 쓰면 무시됩니다 */
  title?: string;
  /**
   * 너비. 값은 --ui-modal-width-sm/md/lg(400/560/800px)로 바꿀 수 있고,
   * 모달 하나만 다르게 하려면 style="--ui-modal-width: 640px"를 주세요.
   */
  size?: ModalSize;
  /** 바깥(어두운 배경)을 누르면 닫기. 입력 중인 내용이 있는 모달은 false를 권장합니다 */
  closeOnBackdrop?: boolean;
  /** Esc 키로 닫기 */
  closeOnEsc?: boolean;
  /** 오른쪽 위 닫기(✕) 버튼 숨기기 */
  hideClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: "md",
  closeOnBackdrop: true,
  closeOnEsc: true,
  hideClose: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  /** 열리고 나서 (애니메이션 시작 시점) */
  open: [];
  /** 닫히고 나서 */
  close: [];
}>();

const slots = useSlots();
const titleId = useId();
const panelRef = ref<HTMLElement | null>(null);

const close = () => emit("update:modelValue", false);

const onBackdropClick = () => {
  if (props.closeOnBackdrop) close();
};

// --- 포커스 ---
// 열릴 때 모달 안으로 포커스를 옮기고, 닫힐 때 원래 누르던 버튼으로 돌려줍니다.
// Tab은 모달 안에서만 돕니다 (뒤의 화면으로 빠져나가지 않게).
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let returnFocusTo: HTMLElement | null = null;

const focusables = () =>
  Array.from(panelRef.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.closeOnEsc) {
    event.stopPropagation();
    close();
    return;
  }
  if (event.key !== "Tab") return;
  const list = focusables();
  if (list.length === 0) {
    event.preventDefault();
    return;
  }
  const first = list[0];
  const last = list[list.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

// --- 뒤 화면 스크롤 막기 ---
// 모달이 열린 동안 뒤의 페이지가 같이 스크롤되지 않게 합니다.
// 여러 모달이 겹쳐 열려도 마지막 모달이 닫힐 때만 풀리도록 개수를 셉니다.
const lockScroll = () => {
  const count = Number(document.body.dataset.uiModalCount ?? 0);
  if (count === 0) {
    document.body.dataset.uiModalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  document.body.dataset.uiModalCount = String(count + 1);
};

const unlockScroll = () => {
  const count = Number(document.body.dataset.uiModalCount ?? 1) - 1;
  if (count <= 0) {
    document.body.style.overflow = document.body.dataset.uiModalOverflow ?? "";
    delete document.body.dataset.uiModalCount;
    delete document.body.dataset.uiModalOverflow;
  } else {
    document.body.dataset.uiModalCount = String(count);
  }
};

let locked = false;

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      returnFocusTo = document.activeElement as HTMLElement | null;
      lockScroll();
      locked = true;
      emit("open");
      await nextTick();
      // 첫 입력 요소(없으면 패널 자체)에 포커스
      (focusables().find((el) => !el.classList.contains("ui-modal__close")) ?? panelRef.value)?.focus();
    } else if (locked) {
      unlockScroll();
      locked = false;
      returnFocusTo?.focus();
      returnFocusTo = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (locked) unlockScroll();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal" @after-leave="emit('close')">
      <div v-if="modelValue" class="ui-modal" @keydown="onKeydown">
        <div class="ui-modal__backdrop" aria-hidden="true" @click="onBackdropClick" />

        <div
          ref="panelRef"
          class="ui-modal__panel"
          :class="`ui-modal__panel--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title || slots.header ? titleId : undefined"
          tabindex="-1"
        >
          <header v-if="title || slots.header || !hideClose" class="ui-modal__header">
            <div :id="titleId" class="ui-modal__title">
              <slot name="header">{{ title }}</slot>
            </div>
            <Button
              v-if="!hideClose"
              class="ui-modal__close"
              icon
              size="sm"
              variant="ghost"
              color="secondary"
              aria-label="닫기"
              @click="close"
            >
              ✕
            </Button>
          </header>

          <div class="ui-modal__body">
            <slot />
          </div>

          <footer v-if="slots.footer" class="ui-modal__footer">
            <slot name="footer" :close="close" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<!--
  다른 컴포넌트와 같은 이유로 scoped를 쓰지 않습니다 (BEM + ui- 접두사).
  <body>로 Teleport되므로, 프로젝트가 감싼 요소에 준 CSS 변수는 모달에 닿지 않습니다.
  모달 변수는 :root나 모달 자신(style/class)에 주세요.

  조절할 수 있는 변수 (DESIGN.md 5장 fallback 방식)
    --ui-modal-width-sm / -md / -lg  크기별 너비 (400 / 560 / 800px)
    --ui-modal-width                 모달 하나만 너비 지정
    --ui-modal-radius                모서리 (기본 --ui-radius-md)
-->
<style lang="scss">
.ui-modal {
  position: fixed;
  inset: 0;
  z-index: var(--ui-z-index-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  // 화면 가장자리와 모달 사이 최소 여백 (모바일에서도 양옆이 붙지 않게)
  padding: var(--ui-spacing-lg);
  box-sizing: border-box;
}

.ui-modal__backdrop {
  position: absolute;
  inset: 0;
  background: var(--ui-surface-backdrop);
}

.ui-modal__panel {
  --_width: var(--ui-modal-width-md, 560px);

  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  max-width: var(--ui-modal-width, var(--_width));
  // 내용이 길면 본문만 스크롤되고 제목·버튼은 고정됩니다
  max-height: 100%;
  background: var(--ui-surface-raised);
  color: var(--ui-text-default);
  border-radius: var(--ui-modal-radius, var(--ui-radius-md));
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  font-size: var(--ui-font-size-md);
  outline: none;
}

.ui-modal__panel--sm {
  --_width: var(--ui-modal-width-sm, 400px);
}

.ui-modal__panel--lg {
  --_width: var(--ui-modal-width-lg, 800px);
}

.ui-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-spacing-sm);
  padding: var(--ui-spacing-lg) var(--ui-spacing-lg) var(--ui-spacing-sm);
}

.ui-modal__title {
  font-size: var(--ui-font-size-lg);
  font-weight: 600;
}

// 제목 없이 닫기 버튼만 있을 때도 오른쪽에 붙도록
.ui-modal__close {
  margin-left: auto;
}

.ui-modal__body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--ui-spacing-sm) var(--ui-spacing-lg);
  line-height: 1.5;
}

.ui-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-spacing-sm);
  padding: var(--ui-spacing-md) var(--ui-spacing-lg) var(--ui-spacing-lg);
}

// ---------------------------------------------------------------------------
// 열고 닫기 애니메이션 — 모션 토큰 사용 (동작 줄이기 설정이면 자동으로 꺼짐)
//   배경: 흐려졌다 진해짐
//   패널: 살짝 아래에서 올라오며 나타나고, 사라질 땐 빠르게
// ---------------------------------------------------------------------------
.ui-modal-enter-active,
.ui-modal-leave-active {
  transition: opacity var(--ui-duration-slow) var(--ui-easing-standard);
}

.ui-modal-enter-active .ui-modal__panel {
  transition: transform var(--ui-duration-slow) var(--ui-easing-enter);
}

.ui-modal-leave-active .ui-modal__panel {
  transition: transform var(--ui-duration-slow) var(--ui-easing-exit);
}

.ui-modal-enter-from,
.ui-modal-leave-to {
  opacity: 0;
}

.ui-modal-enter-from .ui-modal__panel,
.ui-modal-leave-to .ui-modal__panel {
  transform: translateY(16px) scale(0.98);
}
</style>
