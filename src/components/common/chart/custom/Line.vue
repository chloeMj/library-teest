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
      <Line smoothed show-legend :categories="categories" :legend-labels="legendLables" :series-data="echartSeries" />
    </div>
  </div>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { computed, ref } from 'vue';
import Line from '@/components/common/chart/eCharts/Line.vue';
import dayjs from 'dayjs';

// ===================================================
// 📥 Props / Emits
// ===================================================
const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    fetchParams?: Record<string, string | number>
    categoryFormat?: string
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
// echart-line
const categories = computed(() => {
  return (series.value?.length ? series.value[0]?.values?.map((row: any) => {
    if(props.categoryFormat) {
      return dayjs(row.timestamp).format(props.categoryFormat)
    }
    return row.timestamp
  }) : null) || []
})
const echartSeries = computed(() => {
  return series.value?.length ? series.value.map((seriesItem: any) => {
    return {
      name: seriesItem.label,
      type: 'line',
      smooth: true,
      data: seriesItem.values?.map((row: any) => {
        return (Math.floor(row.value * 100))
      }) || [],
    }
  }) : []

  /*
  [{
    name: 'CPU user',
    type: 'line',
    smooth: true,
    data: series.value?.map((row: any) => {
      return (Math.floor(row.value * 10000)) / 100
    }) || [],
    markLine: {
      symbol: 'none',
      data: [{
        name: 'fixedVal',
        yAxis: 260,
        symbol: 'none',
        lineStyle: {
          type: 'solid',
          color: '#ff0000',
          // ... (다른 선 스타일)
        },
        label: {
          position: 'insideEndTop',
          show: true
        },
      }]
    }
  }]
  */
})
const legendLables = computed(() => {
  return echartSeries.value.map((series: any) => {
    return series.name
  })
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
