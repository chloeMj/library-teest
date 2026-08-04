<script setup lang="ts">
import { ref, defineEmits, defineProps, withDefaults, watchEffect, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  title: string,
  msg?: string,
  cancelLabel?: string,
  confirmLabel?: string
}>(),
{
  cancelLabel: 'Cancel',
  confirmLabel: 'OK'
});


const slots = useSlots()

const emit = defineEmits(['hide', 'cancel', 'confirm'])
const modelValue = defineModel<boolean | null>({ default: false })

const onClose = function() {
  emit('hide')
}
const onCancel = () => {
  emit('cancel', false)
}
const onConfirm = () => {
  emit('confirm', true)
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
          <q-btn flat :label="cancelLabel" color="negative" @click="onCancel" />
          <q-btn flat :label="confirmLabel" color="primary" @click="onConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<style scoped>
</style>
