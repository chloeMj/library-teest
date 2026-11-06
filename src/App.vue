<script setup lang="ts">
// 로컬 개발용 데모 카탈로그의 셸입니다.
// 컴포넌트를 추가하면 demo/ 에 섹션 파일을 만들고 demo/registry.ts에 한 줄만 더하세요.
import { computed, onBeforeUnmount, ref, watchEffect } from "vue";
import { demos } from "./demo/registry";

// --- 테마 -------------------------------------------------------------------
// 시스템: data-theme을 지워 OS 설정(prefers-color-scheme)을 따르게 합니다.
//         라이브러리를 설치한 프로젝트의 기본 동작과 같습니다 (mixins/_theme.scss).
// 라이트/다크: data-theme으로 강제합니다.
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

// --- 화면 전환 ----------------------------------------------------------------
// vue-router 없이 주소의 #id로 지금 볼 컴포넌트를 고릅니다.
// (#input처럼 섹션 안 링크도 그대로 동작합니다)
const readHash = () => location.hash.slice(1);
const currentId = ref(readHash());
const onHashChange = () => {
  currentId.value = readHash();
  window.scrollTo({ top: 0 });
};
window.addEventListener("hashchange", onHashChange);
onBeforeUnmount(() => window.removeEventListener("hashchange", onHashChange));

const current = computed(
  () => demos.find((demo) => demo.id === currentId.value) ?? demos[0],
);

// --- 사이드바 검색 · 분류 ---------------------------------------------------------
const query = ref("");
const grouped = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  const groups = new Map<string, typeof demos>();
  for (const demo of demos) {
    if (keyword && !demo.label.toLowerCase().includes(keyword)) continue;
    groups.set(demo.group, [...(groups.get(demo.group) ?? []), demo]);
  }
  return [...groups.entries()];
});
</script>

<template>
  <div class="demo">
    <aside class="demo__sidebar">
      <div class="demo__brand">
        <h1 class="demo__title">UI 컴포넌트</h1>
        <span class="demo__count">{{ demos.length }}개</span>
      </div>

      <UiInput v-model="query" class="demo__search" placeholder="컴포넌트 검색" />

      <nav class="demo__nav" aria-label="컴포넌트 목록">
        <div v-for="[group, items] in grouped" :key="group" class="demo__nav-group">
          <p class="demo__nav-title">{{ group }}</p>
          <a
            v-for="item in items"
            :key="item.id"
            :href="`#${item.id}`"
            class="demo__nav-link"
            :class="{ 'demo__nav-link--active': item.id === current.id }"
            :aria-current="item.id === current.id ? 'page' : undefined"
          >
            {{ item.label }}
          </a>
        </div>
        <p v-if="!grouped.length" class="demo__nav-empty">검색 결과가 없습니다.</p>
      </nav>

      <div class="demo__theme" role="group" aria-label="테마">
        <button
          v-for="option in themes"
          :key="option.value"
          type="button"
          class="demo__theme-btn"
          :class="{ 'demo__theme-btn--active': theme === option.value }"
          :aria-pressed="theme === option.value"
          @click="theme = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </aside>

    <main class="demo__main">
      <component :is="current.component" :key="current.id" />
    </main>
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

/* --- 레이아웃: 왼쪽 사이드바 + 오른쪽 본문 --- */
.demo {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  min-height: 100vh;
}

.demo__sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px;
  background: var(--ui-surface-default);
  border-right: 1px solid var(--ui-border-default);
  overflow-y: auto;
}

.demo__brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 0 8px;
}

.demo__title {
  margin: 0;
  font-size: 18px;
}

.demo__count {
  font-size: var(--ui-font-size-sm);
  color: var(--ui-text-muted);
}

.demo__nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.demo__nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.demo__nav-title {
  margin: 0 0 4px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}

.demo__nav-link {
  padding: 8px;
  border-radius: var(--ui-radius-xs);
  color: var(--ui-text-default);
  font-size: var(--ui-font-size-md);
  text-decoration: none;
}

.demo__nav-link:hover {
  background: var(--ui-surface-hover);
}

.demo__nav-link--active {
  background: var(--ui-primary-subtle);
  color: var(--ui-primary-default);
  font-weight: 600;
}

.demo__nav-empty {
  margin: 0;
  padding: 0 8px;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-text-muted);
}

.demo__theme {
  display: flex;
  border: 1px solid var(--ui-border-default);
  border-radius: var(--ui-radius-sm);
  overflow: hidden;
}

.demo__theme-btn {
  flex: 1;
  border: none;
  background: var(--ui-surface-default);
  color: var(--ui-text-muted);
  padding: 6px 0;
  font: inherit;
  font-size: var(--ui-font-size-sm);
  cursor: pointer;
}

.demo__theme-btn--active {
  background: var(--ui-primary-default);
  color: var(--ui-primary-on);
}

.demo__main {
  min-width: 0;
  max-width: 1040px;
  box-sizing: border-box;
  padding: 40px 48px 80px;
}

/* --- 모바일: 사이드바를 위쪽 가로 메뉴로 --- */
@media (max-width: 767px) {
  .demo {
    grid-template-columns: minmax(0, 1fr);
  }

  .demo__sidebar {
    position: sticky;
    z-index: 10;
    height: auto;
    padding: 12px 16px;
    gap: 12px;
    border-right: none;
    border-bottom: 1px solid var(--ui-border-default);
  }

  .demo__sidebar .demo__search {
    display: none;
  }

  .demo__nav {
    flex: none;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
    gap: 4px;
  }

  .demo__nav-group {
    flex-direction: row;
    gap: 4px;
  }

  .demo__nav-title {
    display: none;
  }

  .demo__nav-link {
    white-space: nowrap;
  }

  .demo__main {
    padding: 24px 16px 64px;
  }
}

/* --- 섹션 공통 (demo/DemoSection.vue, demo/DemoGroup.vue가 사용) --- */
.demo__section {
  /* 주소의 #id로 들어왔을 때 제목이 위에 붙어 잘리지 않게 */
  scroll-margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo__heading {
  margin: 0;
  font-size: 28px;
}

.demo__desc {
  margin: -12px 0 8px;
  font-size: var(--ui-font-size-lg);
  color: var(--ui-text-muted);
}

/* 예제 묶음 하나가 카드 하나 */
.demo__group {
  display: flex;
  flex-direction: column;
  background: var(--ui-surface-default);
  border: 1px solid var(--ui-border-default);
  border-radius: var(--ui-radius-md);
  overflow: hidden;
}

.demo__sub {
  margin: 0;
  padding: 12px 20px;
  font-size: var(--ui-font-size-sm);
  font-weight: 600;
  color: var(--ui-text-muted);
  border-bottom: 1px solid var(--ui-border-default);
}

/* 한 줄에 여러 예시를 나열해 상태를 한눈에 비교합니다 */
.demo__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  align-items: start;
  padding: 24px 20px;
}

/* 그리드는 칸을 꽉 채우므로, 버튼은 원래 크기로 보이게 왼쪽에 붙입니다 (모든 데모 공통) */
.demo__row > .ui-button:not(.ui-button--block) {
  justify-self: start;
}

.demo__note {
  margin: 0;
  padding: 10px 20px;
  font-size: var(--ui-font-size-sm);
  color: var(--ui-text-muted);
  background: var(--ui-surface-subtle);
  border-top: 1px solid var(--ui-border-default);
}
</style>
