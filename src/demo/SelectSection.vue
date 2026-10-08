<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from './DemoSection.vue'
import DemoGroup from './DemoGroup.vue'

const fruit = ref<string | null>(null)
const fruitInside = ref<string | null>(null)
const country = ref<string | null>(null)

const fruitOptions = [
  { label: '사과', value: 'apple' },
  { label: '바나나', value: 'banana' },
  { label: '포도', value: 'grape' },
]

const countryOptions = [
  { label: '대한민국', value: 'kr', keywords: 'korea republic' },
  { label: '미국', value: 'us', keywords: 'usa united states america' },
  { label: '일본', value: 'jp', keywords: 'japan' },
  { label: '중국', value: 'cn', keywords: 'china' },
  { label: '독일', value: 'de', keywords: 'germany deutschland' },
  { label: '프랑스', value: 'fr', keywords: 'france' },
]
</script>

<template>
  <DemoSection id="select" title="Select">
    <DemoGroup note="화면 너비를 640px 이하로 줄이면 드롭다운이 bottomSheet로 열립니다.">
      <UiSelect v-model="fruit" label="기본" :options="fruitOptions" placeholder="과일 선택" />
      <UiSelect
        v-model="fruitInside"
        label="inside 라벨"
        label-position="inside"
        :options="fruitOptions"
      />
      <UiSelect
        v-model="country"
        label="검색 가능"
        searchable
        :filter-keys="['label', 'keywords']"
        :options="countryOptions"
        placeholder="국가 검색"
      />
      <UiSelect label="disabled" disabled :options="fruitOptions" placeholder="선택 불가" />
    </DemoGroup>
  </DemoSection>
</template>
