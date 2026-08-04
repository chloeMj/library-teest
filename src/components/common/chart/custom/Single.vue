<template>
  <div class="flex column" style="width: 100%; height: 100%;">
    <div class="col-auto q-px-sm q-pt-xs">
      <span>{{ title }}</span>
      <span v-if="description" class="q-pl-sm">
        <q-icon name="info">
          <q-tooltip>
            {{ description }}
          </q-tooltip>
        </q-icon>
      </span>
    </div>
    <div class="col row items-center justify-center q-my-md">
      <div class="col text-center">
        {{ value }}{{ showUnit ? ` ${unit}` : '' }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { computed, onBeforeMount, onMounted, ref, useSlots } from 'vue';
import { getMetricsData } from '@/api/metricsService';
import useFetch from '@/composables/useFetch';
import dayjs from 'dayjs';

// ===================================================
// 📥 Props / Emits
// ===================================================
const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    useFetch?: boolean
    fetchParams?: Record<string, string | number>
    dateFormat?: string
    showUnit?: boolean
  }>(),
  {
    useFetch: false,
    showUnit: true
  },
)
// const slots = useSlots()

// ===================================================
// 📦 State
// ===================================================
const value = ref<string | number>('')
const unit = ref<string>('')

// ===================================================
// 🧮 Computed
// ===================================================


// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onBeforeMount(async () => {
  if(props.useFetch) {
    const fetch = useFetch({
      apiFn: getMetricsData,
      defaultData: [],
      parameter: props.fetchParams,
      isCallAuto: false
    })

    await fetch.getData()

    if(props.dateFormat) {
      value.value = dayjs(fetch.data.value?.value || '').format(props.dateFormat)
    } else {
      value.value = fetch.data.value?.value || ''
    }

    unit.value = fetch.data.value?.unit || ''
  }
})
onMounted(() => {
})
</script>

<style lang="scss" scoped>
.title-warp {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    .title {
        font-weight: 700;
        font-size: 18px;
    }
}
.stack-bar-wrap {
    display: flex;
    width: 100%;
    min-height: 20px;
    .stack-bar-title {
      width: 60px;
      margin-right: 8px;
      text-align: right;
    }
    .stack-bar-item {
        position: relative;
        width: 100%;
        height: inherit;
        background: lightgray;
        .bg {
            border-radius: 12px;
            width: 100%;
            height: 100%;
        }
    }
    .stack-bar-value {
      width: 100px;
      padding: 0 10px;
      .text {
        font-weight: 600;
        font-size: 16px;
        text-align: right;
      }
    }
}
</style>
