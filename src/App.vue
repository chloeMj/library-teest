<script setup lang="ts">
import { ref } from 'vue';
import DateInput from './components/common/form/DateInput.vue';
import SearchInput from './components/common/form/SearchInput.vue';
import NumbericInput from './components/common/form/NumbericInput.vue';

const value = ref<string>('')
const numValue = ref<string>(11)
</script>

<template>
  <DateInput v-model="value" />
  <SearchInput v-model="value" /> 
  <NumbericInput v-model="numValue" /> 
</template>
