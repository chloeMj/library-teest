<script setup lang="ts">
import { useSlots } from 'vue'

const props = withDefaults(defineProps<{
  title: string,
  msg: string
}>(),
{
});
const modelValue = defineModel<boolean>({ default: false })
const slots = useSlots()

const emit = defineEmits(['hide'])
const onClose = function() {
  emit('hide')
}

</script>

<template>
  <q-dialog v-model="modelValue" @hide="onClose">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            {{ title }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <template v-if="slots.content">
            <slot name="content"></slot>
          </template>
          <template v-else>
            {{ msg }}
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<style scoped>
</style>
