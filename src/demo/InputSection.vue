<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from './DemoSection.vue'
import DemoGroup from './DemoGroup.vue'
import type { FieldValue } from '../composables/useFieldValidation'

const text = ref('')
const filled = ref('')
const underline = ref('')
const labelTop = ref('')
const labelLeft = ref('')
const labelInside = ref('')
const labelInsideFilled = ref('')
const required = ref('')
const email = ref('')
const age = ref<number | null>(null)
const search = ref('')
const price = ref<number | null>(null)
const readonlyValue = ref('수정할 수 없는 값')
const disabledValue = ref('비활성 상태')

const validateEmail = (value: FieldValue) => {
  if (!value) return null
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
  return isValid ? null : '올바른 이메일 형식이 아닙니다.'
}
</script>

<template>
  <DemoSection id="input" title="Input">
    <DemoGroup title="variant — 박스 모양">
      <UiInput v-model="text" label="outlined (기본)" placeholder="입력하세요" />
      <UiInput v-model="filled" variant="filled" label="filled" placeholder="입력하세요" />
      <UiInput v-model="underline" variant="underline" label="underline" placeholder="입력하세요" />
    </DemoGroup>

    <DemoGroup title="라벨 위치">
      <UiInput v-model="labelTop" label="top (기본)" placeholder="홍길동" />
      <UiInput v-model="labelLeft" label="left" label-position="left" placeholder="홍길동" />
      <UiInput v-model="labelInside" label="inside (floating)" label-position="inside" />
      <UiInput
        v-model="labelInsideFilled"
        label="inside + filled"
        label-position="inside"
        variant="filled"
      />
    </DemoGroup>

    <DemoGroup title="상태">
      <UiInput v-model="required" label="필수 (입력 후 지워보세요)" required />
      <UiInput
        v-model="email"
        label="커스텀 validator"
        :validator="validateEmail"
        placeholder="hong@example.com"
      />
      <UiInput v-model="readonlyValue" label="readonly" readonly />
      <UiInput v-model="disabledValue" label="disabled" disabled />
    </DemoGroup>

    <DemoGroup title="숫자 · 슬롯">
      <UiInput v-model="age" type="number" label="나이 (스테퍼)" :max="120" :min="0" show-stepper />
      <UiInput v-model="search" label="prefix 슬롯">
        <template #prefix>🔍</template>
      </UiInput>
      <UiInput v-model="price" type="number" label="suffix 슬롯" variant="filled">
        <template #suffix>원</template>
      </UiInput>
    </DemoGroup>
  </DemoSection>
</template>
