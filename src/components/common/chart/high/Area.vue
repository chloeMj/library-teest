<template>
  <div class="chart-wrappper">
    <div :class="[{ empty: props.data?.length === 0 }, `chart-pie`]" ref="chartContainer" />
  </div>
</template>

<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import Highcharts from 'highcharts';
import { onMounted, ref, watch } from 'vue';

// ===================================================
// 📥 Props / Emits
// ===================================================
interface ChartData {
  [key: string]: string | number;
}

type HCPoint = number | null | [number, number] | [string, number] | Highcharts.PointOptionsObject;

const props = withDefaults(
  defineProps<{
    type?: 'area' | 'areaspline';
    name?: string;
    categories: string[];
    data: HCPoint[];
    lineColor?: string;
    fillColor?: any;
    plotLines?: Highcharts.XAxisPlotLinesOptions[] | any[];
    chartMsg?: string;
    state?: string;
    width?: number | string;
    height?: number | string;
  }>(),
  {
    type: 'area',
    name: '',
    lineColor: 'var(--border-light)',
    fillColor: {
      // area에 그라데이션 채우기
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, '#66BB6A'], // 시작점 색상
        [1, 'rgba(102, 187, 106, 0)'], // 끝점 색상 (투명)
      ],
    },
    plotLines: () => [],
  }
);

// ===================================================
// 📦 State
// ===================================================
const chartContainer = ref<HTMLElement | null>(null);

let chartInstance: Highcharts.Chart | null = null;

// ===================================================
// ⚙️ Methods
// ===================================================
const getOptions = (): Highcharts.Options => {
  const containerWidth = props.width || chartContainer.value?.getBoundingClientRect()?.width || 300;
  const containerHeight =
    props.height || chartContainer.value?.getBoundingClientRect()?.height || 250;

  return {
    chart: {
      type: props.type,
      backgroundColor: 'transparent',
      spacing: [30, 0, 0, 0],
      // width: containerWidth + 'px',
      height: containerHeight + 'px',
    },
    plotOptions: {
      areaspline: {
        // areaspline 타입의 모든 시리즈에 공통 적용
        fillOpacity: 1, // 채우기 색상의 투명도 조절
        marker: {
          enabled: true, // 마커를 숨김 (호버 시에만 나타남)
          states: {
            hover: {
              enabled: true,
            },
          },
        },
      },
    },
    xAxis: {
      categories: props.categories,
      labels: {
        enabled: false, // <-- 틱 텍스트(눈금 레이블) 비활성화
      },

      // ----------------- 여기에 plotLines 추가 -----------------
      plotLines: [...props.plotLines],
    },
    yAxis: [
      {
        // 주 Y축 (왼쪽)
        title: {
          text: undefined, // <-- 이 부분을 undefined로 설정하여 타이틀 제거
        },
        labels: {
          enabled: false, // <-- 틱 텍스트(눈금 레이블) 비활성화
        },
        gridLineWidth: 0,
        // tickWidth: 0
      },
    ],
    title: {
      text: undefined, // 차트 타이틀 숨김 처리
    },
    subtitle: {
      text: undefined, // 서브타이틀도 함께 숨김
    },
    tooltip: {
      enabled: true,

      style: {
        color: '#000',
        fontSize: '14px',
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        type: props.type,
        connectNulls: true,
        name: props.name,
        data: props.data,
        color: props.lineColor, // 선 색상
        fillColor: props.fillColor,
      },
    ],
    credits: { enabled: false },
  };
};

const drawChart = () => {
  // console.log('>>>>>>>>>>>>>>>>>drawChart AREA<<<<<<<<<<<<<<<<<<<<<<<');
  if (!chartContainer.value) return;
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = Highcharts.chart(chartContainer.value, getOptions());
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
@use '@/css/components/chart/area' as *;
</style>
