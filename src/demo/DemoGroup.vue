<script setup lang="ts">
// 섹션 안의 소제목 + 예제 그리드. 예제들이 한 줄에 나란히 놓여 비교하기 쉽습니다.
defineProps<{ title?: string; note?: string }>()
</script>

<template>
  <div class="demo__group">
    <h3 v-if="title" class="demo__sub">{{ title }}</h3>
    <div class="demo__row">
      <slot />
    </div>
    <p v-if="note" class="demo__note">{{ note }}</p>
  </div>
</template>
