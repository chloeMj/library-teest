<script setup lang="ts">
// 로컬 개발/데모용 화면입니다. 새 컴포넌트를 추가하면 여기서 바로 미리보기 하세요.
import { ref } from 'vue'
import type { FieldValue } from './composables/useFieldValidation'

const name = ref('')
const nickname = ref('')
const bio = ref('')
const age = ref<number | null>(null)
const email = ref('')

const fruit = ref<string | null>(null)
const city = ref<string | null>(null)
const fruitOptions = [
  { label: '사과', value: 'apple' },
  { label: '바나나', value: 'banana' },
  { label: '포도', value: 'grape' },
]
const cityOptions = [
  { label: '서울', value: 'seoul' },
  { label: '부산', value: 'busan' },
  { label: '대구', value: 'daegu' },
]
const country = ref<string | null>(null)
const countryOptions = [
  { label: '대한민국', value: 'kr', keywords: 'korea republic' },
  { label: '미국', value: 'us', keywords: 'usa united states america' },
  { label: '일본', value: 'jp', keywords: 'japan' },
  { label: '중국', value: 'cn', keywords: 'china' },
  { label: '독일', value: 'de', keywords: 'germany deutschland' },
  { label: '프랑스', value: 'fr', keywords: 'france' },
  { label: '영국', value: 'gb', keywords: 'uk united kingdom britain' },
  { label: '캐나다', value: 'ca', keywords: 'canada' },
]

const gender = ref<string | null>(null)
const genderOptions = [
  { label: '남성', value: 'male' },
  { label: '여성', value: 'female' },
  { label: '선택 안 함', value: 'none' },
]

const plan = ref<string | null>(null)
const planOptions = [
  { label: '무료', value: 'free', icon: '🆓' },
  {
    label: '프로 (이미지 아이콘)',
    value: 'pro',
    icon: {
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='8' cy='8' r='8' fill='%23f59e0b'/%3E%3C/svg%3E",
      alt: '프로 플랜',
    },
  },
  { label: '엔터프라이즈 (품절)', value: 'enterprise', icon: '🏢', disabled: true },
]

const agree = ref(false)
const interests = ref<string[]>([])
const interestOptions = [
  { label: '스포츠', value: 'sports', icon: '⚽' },
  { label: '음악', value: 'music', icon: '🎵' },
  { label: '영화', value: 'movie', icon: '🎬' },
  { label: '독서', value: 'reading', icon: '📚' },
]

const validateEmail = (value: FieldValue) => {
  if (!value) return null
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
  return isValid ? null : '올바른 이메일 형식이 아닙니다.'
}
</script>

<template>
  <main class="demo">
    <h1>library-test</h1>

    <section>
      <h2>라벨 위치</h2>
      <LibInput v-model="name" label="이름 (top)" label-position="top" placeholder="홍길동" />
      <LibInput v-model="nickname" label="닉네임 (left)" label-position="left" placeholder="길동이" />
      <LibInput v-model="bio" label="한줄소개 (inside)" label-position="inside" />
    </section>

    <section>
      <h2>Validation</h2>
      <LibInput v-model="name" label="필수 + 최대 10자" required :max="10" />
      <LibInput v-model="email" label="이메일 (커스텀 validator)" :validator="validateEmail" />
    </section>

    <section>
      <h2>숫자 + 스테퍼</h2>
      <LibInput v-model="age" type="number" label="나이" :max="120" :min="0" show-stepper />
    </section>

    <section>
      <h2>아이콘 슬롯</h2>
      <LibInput v-model="name" label="검색">
        <template #prefix>🔍</template>
      </LibInput>
    </section>

    <section>
      <h2>Select</h2>
      <LibSelect v-model="fruit" label="좋아하는 과일" placeholder="선택하세요" :options="fruitOptions" />
      <LibSelect
        v-model="city"
        label="거주 도시 (필수, inside)"
        label-position="inside"
        required
        :options="cityOptions"
      />
      <LibSelect
        v-model="country"
        label="국가 (label/value/영문 키워드로 검색, 좁은 화면이면 bottomSheet)"
        placeholder="예: kr, korea, 대한"
        searchable
        :filter-keys="['label', 'value', 'keywords']"
        :options="countryOptions"
      />
    </section>

    <section>
      <h2>Radio</h2>
      <LibRadio v-model="gender" label="성별 (필수, 가로)" required direction="horizontal" :options="genderOptions" />
      <LibRadio v-model="plan" label="요금제 (옵션별 disabled)" :options="planOptions" />
      <LibRadio v-model="plan" label="요금제 (토글 버튼)" variant="button" :options="planOptions" />
    </section>

    <section>
      <h2>Checkbox</h2>
      <LibCheckbox v-model="agree" label="이용약관에 동의합니다 (필수, 단일)" required />
      <LibCheckbox v-model="interests" label="관심사 (다중 선택, 가로)" direction="horizontal" :options="interestOptions" />
      <LibCheckbox v-model="interests" label="관심사 (토글 버튼)" variant="button" :options="interestOptions" />
    </section>
  </main>
</template>

<style>
.demo {
  max-width: 420px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  font-family: system-ui, sans-serif;
}

.demo section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
