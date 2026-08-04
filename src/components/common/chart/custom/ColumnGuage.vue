<template>
  <div style="width: 100%">
    <div ref="stackBar" class="stack-bar-wrap">
        <div class="stack-bar-title">
            <div class="text">{{ title }}</div>
        </div>
        <div class="stack-bar-item" >
          <div class="bg" :style="{width: stackbarWidth, backgroundColor: color}" />
        </div>
        <div class="stack-bar-value">
            <div class="text">{{ value.toFixed(visiblePrecision) }}%</div>
        </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { getMetricsData } from '@/api/metricsService';
import useFetch from '@/composables/useFetch';
import { computed, onBeforeMount, onMounted, ref, useSlots } from 'vue';

// ===================================================
// 📥 Props / Emits
// ===================================================
const props = withDefaults(
  defineProps<{
    title?: string
    color?: string
    visiblePrecision?: number // 표시용
    precision?: number // 최소 값 확인용
    useFetch?: boolean
    fetchParams?: Record<string, string | number>
  }>(),
  {
    color: '#4B8EFF',
    visiblePrecision: 1,
    precision: 4,
    useFetch: false
  },
)
const slots = useSlots()
const percentValue = defineModel<string | number>({ default: 0 })

// ===================================================
// 📦 State
// ===================================================
const stackBar = ref<Element | null>(null)

// ===================================================
// 🧮 Computed
// ===================================================

const value = computed<number>(() => {
  const val = Number(Number(percentValue.value).toFixed(props.precision))
  return Number(val.toFixed(props.visiblePrecision)) > 0 ?
            Number(val.toFixed(props.visiblePrecision))
            : Number(val.toFixed(props.precision)) > 0 ?
              (1 / Math.pow(10, props.visiblePrecision)) // minimum value
              :0 // zero
})
const stackbarWidth = computed(() => {
  return value.value > (1 / Math.pow(10, props.visiblePrecision)) ? `${value.value}%` : '1px'
})

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onBeforeMount(async () => {
  if(props.useFetch) {
    const fetch = useFetch({
      apiFn: getMetricsData,
      defaultData: [],
      calcType: 'irate',
      parameter: props.fetchParams,
      isCallAuto: false
    })

    await fetch.getData()
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
