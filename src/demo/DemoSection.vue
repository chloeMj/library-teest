<script setup lang="ts">
// 데모 페이지 하나의 공통 레이아웃. 제목 + 설명 + 예제 카드들을 감쌉니다.
defineProps<{ title: string; id: string; description?: string }>()
</script>

<template>
  <section :id="id" class="demo__section">
    <h2 class="demo__heading">{{ title }}</h2>
    <p v-if="description" class="demo__desc">{{ description }}</p>
    <slot />
  </section>
</template>
