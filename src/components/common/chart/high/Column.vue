<template>
  <div class="chart-wrappper" :class="currentState">
    <div :class="[{ empty: props.data?.length === 0 }, `chart-pie`]" ref="chartContainer" />
  </div>
</template>

<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import Highcharts from 'highcharts';
import { computed, onMounted, ref, watch } from 'vue';

// ===================================================
// 📥 Props / Emits
// ===================================================
interface ChartData {
  [key: string]: string | number;
}

const props = defineProps<{
  categories: string[];
  data: ChartData[];
  chartMsg?: string;
  state?: string;
}>();

// ===================================================
// 📦 State
// ===================================================
const chartContainer = ref<HTMLElement | null>(null);

let chartInstance: Highcharts.Chart | null = null;

const containerWidth = chartContainer.value?.getBoundingClientRect()?.width || 300;
const containerHeight = chartContainer.value?.getBoundingClientRect()?.height || 250;

// ===================================================
// 🧮 Computed
// ===================================================
const currentState = computed(() => props.state);

// ===================================================
// ⚙️ Methods
// ===================================================
const getColumnOptions = (items: ChartData[]): Highcharts.Options => {
  return {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      spacing: [0, 0, 0, 0],
      // width: containerWidth + 'px',
      height: containerHeight + 'px',
    },
    xAxis: {
      categories: props.categories,
      gridLineWidth: 0,
      tickWidth: 0,
      lineWidth: 0,
      // labels: {
      //   enabled: false // <-- 틱 텍스트(눈금 레이블) 비활성화
      // }
    },
    yAxis: [
      {
        // 주 Y축 (왼쪽)
        title: {
          text: undefined, // <-- 이 부분을 undefined로 설정하여 타이틀 제거
        },
        labels: {
          enabled: true, // <-- 틱 텍스트(눈금 레이블) 비활성화
        },
        gridLineWidth: 0,
        tickWidth: 0,
      },
    ],
    title: { text: '' },
    tooltip: { enabled: true },
    legend: {
      enabled: true,
      layout: 'horizontal',
      // symbolRadius: 2,
      // symbolHeight: 8,
      // symbolWidth: 8,
      align: 'left',
      verticalAlign: 'top',
      x: 0,
      y: 0,
      padding: 0,
      // 하단 범례 style
      itemStyle: {
        fontFamily:
          "'Pretendard Std', 'Roboto', '-apple-system', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: '14px',
      },
      itemDistance: 12,
      events: {
        itemClick: function (e) {
          e.preventDefault();
        },
      },
    },
    series: [
      {
        type: 'column', // 막대 차트
        data: props.data,
        color: '#EEEEEE',
      },
    ],
    credits: { enabled: false },
  };
};

const drawChart = () => {
  if (!chartContainer.value) return;
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = Highcharts.chart(chartContainer.value, getColumnOptions(props.data));
};
const updateSeriese = () => {
  chartInstance?.series[0]?.setData(props.data);
};

// ===================================================
// 👀 Watchers
// ===================================================
watch(() => [props.categories], drawChart, { deep: true });
watch(() => [props.data], updateSeriese, { deep: true });

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onMounted(drawChart);
</script>

<style lang="scss" scoped>
.chart-wrappper {
  width: 100%;
  height: 100%;
}
</style>
