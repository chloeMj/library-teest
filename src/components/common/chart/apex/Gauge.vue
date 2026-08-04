<template>
  <div class="chart-wrapper">
    <apexchart
      v-if="values?.length"
      type="radialBar"
      :height="height"
      :width="width"
      :options="options"
      :series="values"
      :plot-options="plotOptions"
    />
  </div>
</template>
<script lang="ts" setup>
import type { optionItem } from '@/types/common';
import { computed } from 'vue';

// ===================================================
// 📦 Imports
// ===================================================

// ===================================================
// 📥 Props / Emits
// ===================================================

const props = withDefaults(
  defineProps<{
    width?: number | string,
    height?: number | string,
    color?: string,
    series: optionItem[]
  }>(),
  {
    width: '100%',
    height: '100%',
    color: '#4B8EFF'
  },
)

// ===================================================
// 📦 State
// ===================================================

// ===================================================
// 🧮 Computed
// ===================================================
const labels = computed(() => {
    return props.series?.map((item: series) => {
        return item.label
    }) ?? []
})
const values = computed(() => {
    return props.series?.map((item: series) => {
        return item.value
    })?? []
})
const plotOptions = computed(() => {
  return {
    radialBar: {
      // offsetY: -20,
      hollow: {
        size: '60%'
      },
      startAngle: -180,
      endAngle: 180,
      // endAngle: 135,
      track: {
        // startAngle: -135,
        // endAngle: 135,
        // strokeWidth: '50%',
        background: ['#EBEBEB']
      },
      dataLabels: {
        name: {
          show: true,
          fontWeight: 600,
          fontSize: '12px',
          color: '#5A5E6C',
          offsetY: 25
        },
        value: {
          show: true,
          fontSize: "20px",
          fontWeight: 600,
          color: '#111111',
          offsetY: -15,
          // formatter: function(val: number) {
          //     return val + ' %'
          // }
        }
      },
    }
  }
})
const options = computed(() => {
  return {
    chart: {
      width: '100%',
      height: '100%',
      sparkline: {
        enabled: true // 여백을 제거하고 컨테이너 크기에 맞춤
      },
    },
    plotOptions: plotOptions.value,
    grid: {
      padding: {
        top: 0,
        bottom: 0, // 3. 그리드 패딩 최소화
        left: 0,
        right: 0
      },
    },
    fill: {
        colors: [ '#4B8EFF', '#FE5246', '#FFC814' ],
        opacity: 100
    },
    stroke: {
        colors: [ '#4B8EFF', '#FE5246', '#FFC814' ],
        lineCap: "round",
        width: 1
    },
    labels: labels.value
  }
})
// ===================================================
// ⚙️ Methods
// ===================================================

// ===================================================
// 🛠️ Actions
// ===================================================

// ===================================================
// 👀 Watchers
// ===================================================

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
</script>

<style lang="scss" scoped>
.chart-wrapper {
  height: 100%; /* 부모 높이를 명확히 지정 */
  overflow: hidden; /* 차트의 보이지 않는 여백이 레이아웃을 깨는 것 방지 */
}
</style>
