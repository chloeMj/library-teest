<script setup lang="ts">
// 데모 섹션 공통 레이아웃. 제목 + 예제 묶음을 감쌉니다.
defineProps<{ title: string; id: string }>()
</script>

<template>
  <section :id="id" class="demo__section">
    <h2 class="demo__heading">{{ title }}</h2>
    <slot />
  </section>
</template>
