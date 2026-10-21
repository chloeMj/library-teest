<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from './DemoSection.vue'
import DemoGroup from './DemoGroup.vue'

const gender = ref<string | null>(null)
const genderHorizontal = ref<string | null>('female')
const plan = ref<string | null>('free')
const planButton = ref<string | null>('pro')
const genderRequired = ref<string | null>(null)

const genderOptions = [
  { label: '남성', value: 'male' },
  { label: '여성', value: 'female' },
  { label: '선택 안 함', value: 'none' },
]

const planOptions = [
  { label: '무료', value: 'free', icon: '🆓' },
  {
    label: '프로',
    value: 'pro',
    icon: {
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='8' cy='8' r='8' fill='%23f59e0b'/%3E%3C/svg%3E",
      alt: '프로 플랜',
    },
  },
  { label: '엔터프라이즈 (품절)', value: 'enterprise', icon: '🏢', disabled: true },
]
</script>

<template>
  <DemoSection id="radio" title="Radio">
    <DemoGroup title="배치">
      <UiRadio v-model="gender" label="세로 (기본)" :options="genderOptions" />
      <UiRadio
        v-model="genderHorizontal"
        label="가로"
        direction="horizontal"
        :options="genderOptions"
      />
    </DemoGroup>

    <DemoGroup title="variant · 아이콘">
      <UiRadio v-model="plan" label="dot (기본) + 아이콘 + 비활성 옵션" :options="planOptions" />
      <UiRadio v-model="planButton" label="button" variant="button" :options="planOptions" />
    </DemoGroup>

    <DemoGroup title="검증">
      <UiRadio
        v-model="genderRequired"
        label="필수 (선택하지 않고 Tab으로 지나가 보세요)"
        required
        :options="genderOptions"
      />
    </DemoGroup>
  </DemoSection>
</template>
