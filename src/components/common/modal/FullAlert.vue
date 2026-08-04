<script setup lang="ts">
import {ref, defineEmits, watchEffect, useSlots, withDefaults, defineProps} from 'vue'

const props = withDefaults(defineProps<{
  title: string,
  msg: string,
  isShow?: boolean
  showCancelButton?: boolean
  cancelLabel?: string,
  confirmLabel?: string
}>(),
{
  isShow: false,
  showCancelButton: false,
  cancelLabel: 'Cancel',
  confirmLabel: 'OK'
});

const slots = useSlots()

const emit = defineEmits(['hide', 'cancel', 'confirm'])
const onClose = function() {
  emit('hide')
}
const onCancel = () => {
  emit('cancel', false)
}
const onConfirm = () => {
  emit('confirm', true)
}

const value = ref(false)

watchEffect(() => {
  value.value = props.isShow
})

</script>

<template>
  <q-dialog
      v-model="value"
      @hide="onClose"
      maximized
  >
      <q-card class="flex column">
        <q-card-section class="row items-center">
          <div class="text-h6">
            {{ title }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none col overflow-auto">
          <template v-if="slots.content">
            <slot name="content"></slot>
          </template>
          <template v-else>
            {{ msg }}
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-if="showCancelButton" flat :label="cancelLabel" color="negative" @click="onCancel" />
          <q-btn flat :label="confirmLabel" color="primary" @click="onConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<style scoped>

</style>
