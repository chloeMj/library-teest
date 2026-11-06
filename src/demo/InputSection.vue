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
const labelInsideUnderline = ref('')
const required = ref('')
const email = ref('')
const age = ref<number | null>(null)
const search = ref('')
const price = ref<number | null>(null)
const ratio = ref<number | null>(0)
const readonlyValue = ref('수정할 수 없는 값')
const disabledValue = ref('비활성 상태')

const validateEmail = (value: FieldValue) => {
  if (!value) return null
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
  return isValid ? null : '올바른 이메일 형식이 아닙니다.'
}
</script>

<template>
  <DemoSection id="input" title="Input" description="글자나 숫자를 입력받습니다. 검증, 라벨 위치, prefix/suffix 슬롯을 지원합니다.">
    <DemoGroup title="variant — 박스 모양">
      <FmInput v-model="text" label="outlined (기본)" placeholder="입력하세요" />
      <FmInput v-model="filled" variant="filled" label="filled" placeholder="입력하세요" />
      <FmInput v-model="underline" variant="underline" label="underline" placeholder="입력하세요" />
    </DemoGroup>

    <DemoGroup title="라벨 위치">
      <FmInput v-model="labelTop" label="top (기본)" placeholder="홍길동" />
      <FmInput v-model="labelLeft" label="left" label-position="left" placeholder="홍길동" />
      <FmInput v-model="labelInside" label="inside (floating)" label-position="inside" />
      <FmInput
        v-model="labelInsideFilled"
        label="inside + filled"
        label-position="inside"
        variant="filled"
      />
      <FmInput
        v-model="labelInsideUnderline"
        label="inside + underline"
        label-position="inside"
        variant="underline"
      />
    </DemoGroup>

    <DemoGroup title="상태">
      <FmInput v-model="required" label="필수 (입력 후 지워보세요)" required />
      <FmInput
        v-model="email"
        label="커스텀 validator"
        :validator="validateEmail"
        placeholder="hong@example.com"
      />
      <FmInput v-model="readonlyValue" label="readonly" readonly />
      <FmInput v-model="disabledValue" label="disabled" disabled />
    </DemoGroup>

    <DemoGroup title="숫자 · 슬롯">
      <FmInput v-model="age" type="number" label="나이 (스테퍼)" :max="120" :min="0" show-stepper />
      <FmInput
        v-model="ratio"
        type="number"
        label="비율 (step 0.1)"
        :step="0.1"
        :min="0"
        :max="1"
        show-stepper
      />
      <FmInput v-model="search" label="prefix 슬롯">
        <template #prefix>🔍</template>
      </FmInput>
      <FmInput v-model="price" type="number" label="suffix 슬롯" variant="filled">
        <template #suffix>원</template>
      </FmInput>
    </DemoGroup>
  </DemoSection>
</template>
