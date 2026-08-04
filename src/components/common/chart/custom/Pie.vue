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
    <div class="col">
      <Pie show-legend :series-data="echartSeries" />
    </div>
  </div>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { computed, ref } from 'vue';
import Pie from '@/components/common/chart/eCharts/Pie.vue';

// ===================================================
// 📥 Props / Emits
// ===================================================
const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    fetchParams?: Record<string, string | number>
  }>(),
  {
  },
)
// const slots = useSlots()

// ===================================================
// 📦 State
// ===================================================
// const stackBar = ref<Element | null>(null)
const series = ref<Record<string, string | number>[]>([])

// ===================================================
// 🧮 Computed
// ===================================================
const echartSeries = computed(() => {
  return [{
    name: props.title,
    type: 'pie',
    data: series.value?.map((seriesItem: any) => {
      return {
        ...seriesItem,
        name: seriesItem.label
      }
    }) || [],
  }]
})


// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================

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
