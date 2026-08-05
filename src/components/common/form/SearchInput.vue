<template>
  <q-input v-model="keyword" outlined color="grey-9" class="input">
    <template v-slot:prepend>
      <q-icon name="search" />
    </template>
    <template v-slot:append>
      <q-icon v-if="keyword" name="close" class="cursor-pointer" @click="keyword = ''" />
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
.input {
  &:deep() {
    .q-field__prepend {
      height: 100%;
      // padding: 0;
    }
    .q-field__append {
      height: 100%;
    }
  }
}
</style>
