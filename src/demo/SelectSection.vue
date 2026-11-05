<script setup lang="ts">
// Input 데모와 같은 순서(variant → 라벨 위치 → 상태 → 슬롯)로 구성합니다.
import { ref } from 'vue'
import DemoSection from './DemoSection.vue'
import DemoGroup from './DemoGroup.vue'
import type { FieldValue } from '../composables/useFieldValidation'

const outlined = ref<string | null>(null)
const filled = ref<string | null>(null)
const underline = ref<string | null>(null)
const labelTop = ref<string | null>(null)
const labelLeft = ref<string | null>(null)
const labelInside = ref<string | null>(null)
const labelInsideFilled = ref<string | null>(null)
const labelInsideUnderline = ref<string | null>(null)
const required = ref<string | null>(null)
const notBanana = ref<string | null>(null)
const readonlyValue = ref<string | null>('apple')
const disabledValue = ref<string | null>('grape')
const country = ref<string | null>(null)
const prefixed = ref<string | null>(null)
const withIcon = ref<string | null>('music')

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

const genreOptions = [
  { label: '스포츠', value: 'sports', icon: '⚽' },
  { label: '음악', value: 'music', icon: '🎵' },
  { label: '영화', value: 'movie', icon: '🎬' },
]

const validateNotBanana = (value: FieldValue) =>
  value === 'banana' ? '바나나는 품절입니다.' : null
</script>

<template>
  <DemoSection
    id="select"
    title="Select"
    description="목록에서 항목을 고릅니다. variant·라벨 위치·상태는 Input과 같은 값을 씁니다."
  >
    <DemoGroup title="variant — 박스 모양" note="Input과 같은 outlined / filled / underline입니다.">
      <UiSelect v-model="outlined" label="outlined (기본)" :options="fruitOptions" placeholder="선택하세요" />
      <UiSelect v-model="filled" variant="filled" label="filled" :options="fruitOptions" placeholder="선택하세요" />
      <UiSelect v-model="underline" variant="underline" label="underline" :options="fruitOptions" placeholder="선택하세요" />
    </DemoGroup>

    <DemoGroup title="라벨 위치">
      <UiSelect v-model="labelTop" label="top (기본)" :options="fruitOptions" placeholder="과일 선택" />
      <UiSelect v-model="labelLeft" label="left" label-position="left" :options="fruitOptions" placeholder="과일 선택" />
      <UiSelect v-model="labelInside" label="inside (floating)" label-position="inside" :options="fruitOptions" />
      <UiSelect
        v-model="labelInsideFilled"
        label="inside + filled"
        label-position="inside"
        variant="filled"
        :options="fruitOptions"
      />
      <UiSelect
        v-model="labelInsideUnderline"
        label="inside + underline"
        label-position="inside"
        variant="underline"
        :options="fruitOptions"
      />
    </DemoGroup>

    <DemoGroup title="상태">
      <UiSelect
        v-model="required"
        label="필수 (열었다 닫아보세요)"
        required
        :options="fruitOptions"
        placeholder="과일 선택"
      />
      <UiSelect
        v-model="notBanana"
        label="커스텀 validator (바나나 선택)"
        :validator="validateNotBanana"
        :options="fruitOptions"
        placeholder="과일 선택"
      />
      <UiSelect v-model="readonlyValue" label="readonly" readonly :options="fruitOptions" />
      <UiSelect v-model="disabledValue" label="disabled" disabled :options="fruitOptions" />
    </DemoGroup>

    <DemoGroup
      title="검색 · 슬롯"
      note="화면 너비를 640px 이하로 줄이면 드롭다운이 bottomSheet로 열립니다."
    >
      <UiSelect
        v-model="country"
        label="검색 (searchable)"
        searchable
        :filter-keys="['label', 'keywords']"
        :options="countryOptions"
        placeholder="국가 검색 (korea도 됨)"
      />
      <UiSelect v-model="prefixed" label="prefix 슬롯" :options="fruitOptions" placeholder="과일 선택">
        <template #prefix>🍎</template>
      </UiSelect>
      <UiSelect v-model="withIcon" label="옵션 아이콘" variant="filled" :options="genreOptions" />
    </DemoGroup>
  </DemoSection>
</template>
