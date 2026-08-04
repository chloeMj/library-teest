<template>
  <div>
    <div class="numberic-input">
      <q-input
        v-model="visibleValue"
        class="numberic-input__field"
        :placeholder="placeholder ? placeholder : ''"
        :mask="mask"
        reverse-fill-mask
        :readonly="readonly"
        :disable="disable"
        :error="error"
        :error-message="errorMsg"
        outlined
        color="grey-9"
      >
        <template #append>
          <q-btn class="numberic-input__button minus" :disable="readonly" @click="onClickMinus">
            <q-icon aria-label="-1" />
          </q-btn>
          <q-btn class="numberic-input__button plus" :disable="readonly" @click="onClickPlus">
            <q-icon aria-label="+1" />
          </q-btn>
        </template>
      </q-input>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';

// ===================================================
// 📥 Props / Emits
// ===================================================
const props = withDefaults(
  defineProps<{
    placeholder?: string
    unit?: string | number
    mask?: string
    readonly?: boolean
    disable?: boolean
    error?: boolean
    errorMsg?: string
  }>(),
  {
    placeholder: '',
    unit: 1,
    readonly: false,
    disable: false,
    error: false
  },
)

/// ===================================================
// 📦 State
// ===================================================
const modelValue = defineModel<number | null>()
const visibleValue = ref<string>(modelValue.value === null ? '' : `${modelValue.value}`)

watch(() => modelValue.value, (v: number | null) => {
  visibleValue.value = v === null ? '' : v.toString()
})
watch(() => visibleValue.value, (v: string) => {
  modelValue.value = visibleValue.value === '' ? null : Number(visibleValue.value.replace(/[^0-9]/g, '') || '0')
})

// ===================================================
// 🛠️ Actions
// ===================================================
const onClickMinus = () => {
  modelValue.value = Number(modelValue.value || '0') - Number(props.unit)
}
const onClickPlus = () => {
  modelValue.value = Number(modelValue.value || '0') + Number(props.unit)
}
</script>

<style lang="scss" scoped>
// @use '@/css/components/flexLayout/partials/numbericInput' as *;
</style>
