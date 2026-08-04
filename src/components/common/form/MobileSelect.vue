<script setup lang="ts">

import {defineProps, ref, watchEffect, withDefaults} from "vue";

interface option {
  label: string,
  value: string
}
interface propsType {
  options: option[],
  modelValue?: string | number | null
}

const props = withDefaults(defineProps<propsType>(), {
  options: () => [],
  modelValue: null
})

const emit = defineEmits(['update:modelValue'])

const selectedOption = ref<option | null>(null)
watchEffect(() => {
  selectedOption.value = props.options.find((option: option) => {
    return option.value == props.modelValue
  }) ?? null
})
const selectOption = (option: option) => {
  emit('update:modelValue', option.value)

  showSelectList(false)
}


const isShowList = ref<boolean>(false)
const showSelectList = (flag:boolean) => {
  isShowList.value = flag
}
</script>

<template>
  <div class="row full-width border" @click="() => showSelectList(true)">
    <div class="col">
      {{ selectedOption ? selectedOption.label : '선택해주세요.' }}
    </div>
    <div>
      <q-icon name="arrow_drop_down" />
    </div>
    <q-dialog v-model="isShowList" @hide="() => showSelectList(false)">
      <q-card>
        <q-card-section class="q-pa-none">
          <q-list separator>
            <q-item v-for="(option, key) in options" :key="key" clickable v-ripple @click="() => selectOption(option)">
              <q-item-section>{{ option.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.border {
  border: 1px solid grey
}
</style>
