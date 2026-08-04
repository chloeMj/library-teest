<template>
  <div style="width: 100%;">
      <v-chart
        ref="chartEl"
        manual-update
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
import { computed, ref } from 'vue';

// ===================================================
// 🧩 Components
// ===================================================
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
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
  BarChart,
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
    width?: number | string,
    height?: number | string,
    showLegend?: boolean,
    legendPosition?: 'top' | 'right' | 'bottom' | 'left',
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
const chartOption = ref({
  title: {
    text: '월별 판매량',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: ['월', '화', '수', '목', '금', '토', '일']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '판매량',
      type: 'bar', // 바 차트 타입 지정
      data: [120, 200, 150, 80, 70, 110, 130],
      stack: 'total',
      // 막대 스타일 설정
      itemStyle: {
        color: '#5470C6'
      }
    },
    {
      name: '판매량2',
      type: 'bar', // 바 차트 타입 지정
      data: [120, 200, 150, 80, 70, 110, 130],
      stack: 'total',
      // 막대 스타일 설정
      itemStyle: {
        color: '#5470C6'
      }
    },
    {
      name: '판매량3',
      type: 'bar', // 바 차트 타입 지정
      data: [120, 200, 150, 80, 70, 110, 130],
      // 막대 스타일 설정
      itemStyle: {
        color: '#5470C6'
      }
    }
  ]
});

// ===================================================
// 🧮 Computed
// ===================================================
</script>   

<style lang="scss" scoped>
.chart {
  // height: 100vh;
}
</style>
