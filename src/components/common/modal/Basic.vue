<template>
  <q-dialog v-model="modelValue" no-shake @hide="onClose" transition-duration="300" :class="['popup-wrapper', type]">
    <q-card class="popup-wrap">
      <q-card-section class="popup-header">
        <h4 class="title">
          {{ title }}
        </h4>
        <q-btn v-if="showCloseButton" flat :ripple="false" round dense v-close-popup class="btn-close"
          aria-label="닫기" />
      </q-card-section>
      <q-card-section class="popup-contents scroll">
        <template v-if="slots.content">
          <slot name="content"></slot>
        </template>
        <template v-else>
          {{ message }}
        </template>
      </q-card-section>

      <q-card-actions v-if="!hideBtns" class="popup-footer">
        <template v-if="slots.bottom">
          <slot name="bottom"></slot>
        </template>

        <template v-else>
          <div class="btns-wrap">
            <q-btn v-if="showCancelButton" :label="cancelLabel" flat no-caps :ripple="false" class="btn-cancel"
              @click="onCancel" />
            <q-btn :label="confirmLabel" flat no-caps :ripple="false" class="btn-confirm" @click="onConfirm" />
          </div>
        </template>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import {
  defineEmits,
  defineProps,
  ref,
  useSlots,
  withDefaults,
  watchEffect,
} from "vue";

// ===================================================
// 📥 Props / Emits
// ===================================================
const props = withDefaults(
  defineProps<{
    title?: string;
    message?: string;
    showCloseButton?: boolean;
    hideBtns?: boolean;
    cancelLabel?: string;
    confirmLabel?: string;
    showCancelButton?: boolean;
    type?: string;
  }>(),
  {
    showCloseButton: true,
    hideBtns: false,
    cancelLabel: "취소",
    confirmLabel: "확인",
    showCancelButton: false,
    type: 'basic'
  }
);
const slots = useSlots();
const emit = defineEmits(["hide", "cancel", "confirm"]);
const modelValue = defineModel<boolean | null>({ default: false })

const onClose = () => {
  emit("hide");
};
const onCancel = () => {
  emit("cancel", false);
};
const onConfirm = () => {
  emit("confirm", true);
};

</script>

<style lang="scss" scoped>
@use "@/css/components/modal" as *;
</style>
