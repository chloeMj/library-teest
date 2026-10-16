<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from './DemoSection.vue'
import DemoGroup from './DemoGroup.vue'

const agree = ref(false)
const interests = ref<(string | number)[]>(['music'])
const interestsHorizontal = ref<(string | number)[]>([])
const interestsButton = ref<(string | number)[]>(['sports'])

const interestOptions = [
  { label: '스포츠', value: 'sports', icon: '⚽' },
  { label: '음악', value: 'music', icon: '🎵' },
  { label: '영화', value: 'movie', icon: '🎬' },
  { label: '독서', value: 'reading', icon: '📚' },
]
</script>

<template>
  <DemoSection id="checkbox" title="Checkbox">
    <DemoGroup title="단일 · 다중" note="options를 생략하면 boolean 단일 체크박스로 동작합니다.">
      <UiCheckbox v-model="agree" label="약관에 동의합니다 (단일)" required />
      <UiCheckbox v-model="interests" label="다중 선택" :options="interestOptions" />
    </DemoGroup>

    <DemoGroup title="배치 · variant">
      <UiCheckbox
        v-model="interestsHorizontal"
        label="가로"
        direction="horizontal"
        :options="interestOptions"
      />
      <UiCheckbox
        v-model="interestsButton"
        label="button"
        variant="button"
        :options="interestOptions"
      />
    </DemoGroup>
  </DemoSection>
</template>
