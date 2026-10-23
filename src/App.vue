<script setup lang="ts">
// 로컬 개발용 데모 카탈로그의 셸입니다.
// 컴포넌트를 추가하면 demo/ 에 섹션 파일을 만들고 아래 두 곳(sections, 템플릿)에만 추가하세요.
import { ref, watchEffect } from "vue";
// 팔레트는 소비 프로젝트가 선택적으로 불러오는 파일입니다(dist/palette.css).
// 데모에서는 켜고 끌 수 있도록 문자열로 가져와 <style>로 넣고 뺍니다.
import paletteCss from "./styles/palette.scss?inline";
import InputSection from "./demo/InputSection.vue";
import SelectSection from "./demo/SelectSection.vue";
import RadioSection from "./demo/RadioSection.vue";
import CheckboxSection from "./demo/CheckboxSection.vue";

type Theme = "system" | "light" | "dark";
const themes: { value: Theme; label: string }[] = [
  { value: "system", label: "시스템" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];
const theme = ref<Theme>("system");

watchEffect(() => {
  const root = document.documentElement;
  if (theme.value === "system") delete root.dataset.theme;
  else root.dataset.theme = theme.value;
});

// 팔레트 on/off — 소비 프로젝트가 palette.css를 불러왔을 때와 아닐 때를 비교합니다
const PALETTE_STYLE_ID = "ui-palette";
const paletteOn = ref(true);

watchEffect(() => {
  const existing = document.getElementById(PALETTE_STYLE_ID);
  if (!paletteOn.value) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const style = document.createElement("style");
  style.id = PALETTE_STYLE_ID;
  style.textContent = paletteCss;
  // 코어 CSS보다 뒤에 와야 값이 덮어씌워집니다
  document.head.append(style);
});

// 목차 — 섹션을 추가하면 여기에 한 줄 더합니다
const sections = [
  { id: "input", label: "Input" },
  { id: "select", label: "Select" },
  { id: "radio", label: "Radio" },
  { id: "checkbox", label: "Checkbox" },
];
</script>

<template>
  <div class="demo">
    <header class="demo__header">
      <div>
        <h1 class="demo__title">UI 컴포넌트 카탈로그</h1>
        <nav class="demo__nav">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
          >
            {{ section.label }}
          </a>
        </nav>
      </div>

      <div class="demo__controls">
        <div class="demo__theme" role="group" aria-label="테마">
          <button
            v-for="option in themes"
            :key="option.value"
            class="demo__theme-btn"
            :class="{ 'demo__theme-btn--active': theme === option.value }"
            @click="theme = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <label class="demo__switch">
          <input v-model="paletteOn" type="checkbox" />
          <span>팔레트</span>
        </label>
      </div>
    </header>

    <InputSection />
    <SelectSection />
    <RadioSection />
    <CheckboxSection />
  </div>
</template>

<style>
/* 데모 화면도 라이브러리 토큰으로 스타일링해, 토큰을 바꾸면 함께 바뀌는지 확인합니다. */
body {
  margin: 0;
  background: var(--ui-surface-subtle);
  color: var(--ui-text-default);
  font-family: system-ui, sans-serif;
}

.demo {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.demo__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ui-border-default);
}

.demo__title {
  margin: 0 0 8px;
  font-size: 20px;
}

.demo__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: var(--ui-font-size-sm);
}

.demo__nav a {
  color: var(--ui-text-muted);
  text-decoration: none;
}

.demo__nav a:hover {
  color: var(--ui-primary-default);
}

.demo__controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.demo__switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-text-muted);
  cursor: pointer;
}

.demo__switch input {
  accent-color: var(--ui-primary-default);
}

.demo__theme {
  display: flex;
  border: 1px solid var(--ui-border-default);
  border-radius: var(--ui-radius-sm);
  overflow: hidden;
}

.demo__theme-btn {
  border: none;
  background: var(--ui-surface-default);
  color: var(--ui-text-muted);
  padding: 6px 14px;
  font: inherit;
  font-size: var(--ui-font-size-sm);
  cursor: pointer;
}

.demo__theme-btn--active {
  background: var(--ui-primary-default);
  color: var(--ui-primary-on);
}

/* --- 섹션 공통 (demo/DemoSection.vue, demo/DemoGroup.vue가 사용) --- */
.demo__section {
  scroll-margin-top: 16px;
  background: var(--ui-surface-default);
  border: 1px solid var(--ui-border-default);
  border-radius: var(--ui-radius-sm);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.demo__heading {
  margin: 0;
  font-size: 16px;
}

.demo__group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo__sub {
  margin: 0;
  font-size: var(--ui-font-size-sm);
  font-weight: 600;
  color: var(--ui-text-muted);
}

/* 한 줄에 여러 예시를 나열해 상태를 한눈에 비교합니다 */
.demo__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  align-items: start;
}

.demo__note {
  margin: 0;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-text-muted);
}
</style>
