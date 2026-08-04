<template>
  <q-input v-model="keyword" outlined color="grey-9" class="input">
    <template v-slot:prepend>
      <q-icon class="icon-search" />
    </template>
    <template v-slot:append>
      <q-icon v-if="keyword" class="icon-clear cursor-pointer" @click="keyword = ''" />
    </template>
  </q-input>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================

// ===================================================
// 📥 Props / Emits
// ===================================================
const keyword = defineModel({default: ''})


</script>

<style lang="scss" scoped>
@use '@/css/components/form/select' as *;
</style>
