<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from './DemoSection.vue'
import DemoGroup from './DemoGroup.vue'

const saving = ref(false)
const count = ref(0)

const variants = ['filled', 'outlined', 'ghost', 'text'] as const
const colors = ['primary', 'secondary', 'danger'] as const

const categories = [
  { label: '전체', value: 'all' },
  { label: '공지', value: 'notice' },
]

// 저장 버튼을 누르면 1.5초 동안 로딩 상태를 보여줍니다
const save = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    count.value++
  }, 1500)
}
</script>

<template>
  <DemoSection id="button" title="Button" description="동작을 실행하거나 페이지를 이동합니다. 모양(variant)과 색(color)을 조합해 씁니다.">
    <DemoGroup
      v-for="variant in variants"
      :key="variant"
      :title="`variant=&quot;${variant}&quot;`"
    >
      <UiButton v-for="color in colors" :key="color" :variant="variant" :color="color">
        {{ color }}
      </UiButton>
    </DemoGroup>

    <DemoGroup title="size" note="sm·lg 높이는 --ui-button-height-sm/lg, md는 Input·Select와 같은 --ui-field-height로 바꿉니다.">
      <UiButton size="sm">small</UiButton>
      <UiButton>medium (기본)</UiButton>
      <UiButton size="lg">large</UiButton>
    </DemoGroup>

    <DemoGroup
      title="버튼 하나만 크기·모양 바꾸기"
      note="prop을 늘리지 않고 그 버튼에만 변수를 줍니다. 알약 모양은 radius에 999px을 씁니다."
    >
      <UiButton style="--ui-button-height: 52px; --ui-button-padding-x: 32px">
        시작하기 (52px)
      </UiButton>
      <UiButton style="--ui-button-radius: 999px">알약 모양</UiButton>
      <div class="demo-button-row">
        <UiButton icon aria-label="추가" style="--ui-button-radius: 999px">+</UiButton>
        <UiButton
          icon
          variant="outlined"
          color="secondary"
          aria-label="닫기"
          style="--ui-button-radius: 999px"
        >
          ✕
        </UiButton>
      </div>
    </DemoGroup>

    <DemoGroup title="상태" :note="`저장 버튼을 누르면 로딩 상태가 됩니다. 저장 횟수: ${count}`">
      <UiButton :loading="saving" @click="save">저장</UiButton>
      <UiButton disabled>filled disabled</UiButton>
      <UiButton variant="outlined" disabled>outlined disabled</UiButton>
    </DemoGroup>

    <DemoGroup title="아이콘 · slot" note="icon은 정사각형 버튼입니다. 글자가 없으므로 aria-label을 꼭 주세요.">
      <div class="demo-button-row">
        <UiButton icon aria-label="추가">+</UiButton>
        <UiButton icon variant="outlined" color="secondary" aria-label="닫기">✕</UiButton>
        <UiButton icon variant="ghost" color="secondary" size="sm" aria-label="더보기">⋯</UiButton>
      </div>
      <UiButton variant="outlined" color="secondary">
        <template #prefix>←</template>
        이전
      </UiButton>
      <UiButton>
        다음
        <template #suffix>→</template>
      </UiButton>
    </DemoGroup>

    <DemoGroup title="링크" note="href를 주면 <a>, to를 주면 vue-router의 RouterLink로 그려집니다.">
      <UiButton href="https://vuejs.org" target="_blank" variant="outlined">
        Vue 문서 (새 탭)
        <template #suffix>↗</template>
      </UiButton>
      <p class="demo-button-text">
        비밀번호를 잊으셨나요?
        <UiButton href="#input" variant="text">비밀번호 찾기</UiButton>
      </p>
      <UiButton href="#input" disabled>비활성 링크</UiButton>
    </DemoGroup>

    <DemoGroup title="block">
      <UiButton block>block (부모 너비 채움)</UiButton>
    </DemoGroup>

    <DemoGroup
      title="폼 요소와 나란히"
      note="Input·Select·Button(md) 높이가 같습니다. 감싼 요소에 --ui-field-height를 주면 셋이 함께 바뀝니다 (아래 줄은 44px)."
    >
      <div class="demo-button-row">
        <UiSelect :options="categories" placeholder="분류" />
        <UiInput placeholder="검색어" />
        <UiButton>검색</UiButton>
      </div>
      <div class="demo-button-row" style="--ui-field-height: 44px">
        <UiSelect variant="filled" :options="categories" placeholder="분류" />
        <UiInput variant="filled" placeholder="검색어" />
        <UiButton>검색</UiButton>
      </div>
    </DemoGroup>
  </DemoSection>
</template>

<style>
/* 데모 그리드는 칸을 꽉 채우므로, 버튼은 원래 크기로 보이게 왼쪽에 붙입니다 */
#button .demo__row > .ui-button:not(.ui-button--block) {
  justify-self: start;
}

.demo-button-row {
  display: flex;
  align-items: flex-end;
  gap: var(--ui-spacing-sm);
}

.demo-button-text {
  margin: 0;
  font-size: var(--ui-font-size-md);
  color: var(--ui-text-muted);
}
</style>
