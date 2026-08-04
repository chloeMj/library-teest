<template>
  <div style="width: 100%;">
      <v-chart
        ref="chartEl"
        class="chart"
        :option="chartOption"
        :style="{
          width: width,
          minWidth: '200px',
          height: height
        }"
      />
  </div>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { computed, onMounted, ref } from 'vue';

// ===================================================
// 🧩 Components
// ===================================================
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent
} from 'echarts/components';
import VChart from 'vue-echarts';

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent
]);
// ===================================================
// 📥 Props / Emits
// ===================================================
// interface series {
//     type?: string,
//     data: any[],
// }
const props = withDefaults(
  defineProps<{
    title?: string
    smoothed?: boolean
    width?: number | string,
    height?: number | string,
    showLegend?: boolean,
    legendPosition?: 'top' | 'right' | 'bottom' | 'left',
    categories: string[],
    legendLables?: string[],
    seriesData: any
  }>(),
  {
    smoothed: false,
    width: '100%',
    height: '300px',
    showLegend: true,
    legendPosition: 'bottom'
  },
)

// ===================================================
// 📦 State
// ===================================================
const chartEl = ref(null);

// ===================================================
// 🧮 Computed
// ===================================================
const chartOption = computed(() => {
  return {
    title: {
      show: !!props.title,
      text: props.title,
      textStyle: {
        color: '#333333',
        fontWeight: 600,
        fontSize: '15px'
      },
      left: 'auto'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      show: props.showLegend, // && props.legendLables?.length,
      // data: props.legendLables || []
    },
    xAxis: {
      type: 'category',
      data: props.categories
    },
    yAxis: {
      type: 'value'
    },
    series: props.seriesData
  }
})
</script>

<style lang="scss" scoped>
.chart {
  // height: 100vh;
}
</style>
