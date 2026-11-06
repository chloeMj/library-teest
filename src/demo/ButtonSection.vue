<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from './DemoSection.vue'
import DemoGroup from './DemoGroup.vue'

const saving = ref(false)
const count = ref(0)

const variants = ['filled', 'outlined', 'ghost', 'text'] as const
const colors = ['primary', 'secondary', 'danger'] as const

// 예외 색상: 어두운 남색, 밝은 노랑(글자색 자동 전환 확인), 중간 밝기 보라
const customColors = ['#1e3a8a', '#facc15', '#8b5cf6']

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
      <FmButton v-for="color in colors" :key="color" :variant="variant" :color="color">
        {{ color }}
      </FmButton>
    </DemoGroup>

    <DemoGroup
      title="예외 색상 — color에 색상값"
      note="특별한 버튼 하나에만 쓰는 용도로, filled에 쓰세요. hover·누름 색은 자동 계산되고 글자색(흰색/진회색)도 자동으로 고릅니다. outlined·ghost·text는 색이 글자가 되어서, 고정 색 하나로는 라이트·다크 둘 다 읽히게 할 수 없습니다(노랑은 라이트에서, 남색은 다크에서 안 보임). 그런 버튼은 토큰으로 색을 정하세요."
    >
      <div class="demo-button-row">
        <FmButton v-for="custom in customColors" :key="custom" :color="custom">{{ custom }}</FmButton>
      </div>
    </DemoGroup>

    <DemoGroup title="size" note="sm·lg 높이는 --fm-button-height-sm/lg, md는 Input·Select와 같은 --fm-field-height로 바꿉니다.">
      <FmButton size="sm">small</FmButton>
      <FmButton>medium (기본)</FmButton>
      <FmButton size="lg">large</FmButton>
    </DemoGroup>

    <DemoGroup
      title="버튼 하나만 크기·모양 바꾸기"
      note="prop을 늘리지 않고 그 버튼에만 변수를 줍니다. 알약 모양은 radius에 999px을 씁니다."
    >
      <FmButton style="--fm-button-height: 52px; --fm-button-padding-x: 32px">
        시작하기 (52px)
      </FmButton>
      <FmButton style="--fm-button-radius: 999px">알약 모양</FmButton>
      <div class="demo-button-row">
        <FmButton icon aria-label="추가" style="--fm-button-radius: 999px">+</FmButton>
        <FmButton
          icon
          variant="outlined"
          color="secondary"
          aria-label="닫기"
          style="--fm-button-radius: 999px"
        >
          ✕
        </FmButton>
      </div>
    </DemoGroup>

    <DemoGroup title="상태" :note="`저장 버튼을 누르면 로딩 상태가 됩니다. 저장 횟수: ${count}`">
      <FmButton :loading="saving" @click="save">저장</FmButton>
      <FmButton disabled>filled disabled</FmButton>
      <FmButton variant="outlined" disabled>outlined disabled</FmButton>
    </DemoGroup>

    <DemoGroup title="아이콘 · slot" note="icon은 정사각형 버튼입니다. 글자가 없으므로 aria-label을 꼭 주세요.">
      <div class="demo-button-row">
        <FmButton icon aria-label="추가">+</FmButton>
        <FmButton icon variant="outlined" color="secondary" aria-label="닫기">✕</FmButton>
        <FmButton icon variant="ghost" color="secondary" size="sm" aria-label="더보기">⋯</FmButton>
      </div>
      <FmButton variant="outlined" color="secondary">
        <template #prefix>←</template>
        이전
      </FmButton>
      <FmButton>
        다음
        <template #suffix>→</template>
      </FmButton>
    </DemoGroup>

    <DemoGroup title="링크" note="href를 주면 <a>, to를 주면 vue-router의 RouterLink로 그려집니다.">
      <FmButton href="https://vuejs.org" target="_blank" variant="outlined">
        Vue 문서 (새 탭)
        <template #suffix>↗</template>
      </FmButton>
      <p class="demo-button-text">
        비밀번호를 잊으셨나요?
        <FmButton href="#input" variant="text">비밀번호 찾기</FmButton>
      </p>
      <FmButton href="#input" disabled>비활성 링크</FmButton>
    </DemoGroup>

    <DemoGroup title="block">
      <FmButton block>block (부모 너비 채움)</FmButton>
    </DemoGroup>

    <DemoGroup
      title="폼 요소와 나란히"
      note="Input·Select·Button(md) 높이가 같습니다. 감싼 요소에 --fm-field-height를 주면 셋이 함께 바뀝니다 (아래 줄은 44px)."
    >
      <div class="demo-button-row">
        <FmSelect :options="categories" placeholder="분류" />
        <FmInput placeholder="검색어" />
        <FmButton>검색</FmButton>
      </div>
      <div class="demo-button-row" style="--fm-field-height: 44px">
        <FmSelect variant="filled" :options="categories" placeholder="분류" />
        <FmInput variant="filled" placeholder="검색어" />
        <FmButton>검색</FmButton>
      </div>
    </DemoGroup>
  </DemoSection>
</template>

<style>
.demo-button-row {
  display: flex;
  align-items: flex-end;
  gap: var(--fm-spacing-sm);
}

.demo-button-text {
  margin: 0;
  font-size: var(--fm-font-size-md);
  color: var(--fm-text-muted);
}
</style>
