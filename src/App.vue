<script setup lang="ts">
import { ref } from 'vue';
import DateInput from './components/common/form/DateInput.vue';

const value = ref<string | null>(null)
</script>

<template>
  <DateInput v-model="value">
  </DateInput>
</template>
