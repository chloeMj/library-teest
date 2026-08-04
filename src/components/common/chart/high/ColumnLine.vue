<template>
  <div class="chart-wrappper" :class="currentState">
    <span class="date">{{
      dayjs(props.categories[0]).format("YYYY.MM.DD") +
      "~" +
      dayjs(props.categories[props.categories.length - 1]).format("YYYY.MM.DD")
    }}</span>
    <div class="chart-wrap">
      <div :class="[{ empty: props.categories?.length === 0 }, `chart-pie`]" ref="chartContainer" />
    </div>
  </div>
</template>

<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import dayjs from "dayjs";
import Highcharts from "highcharts";
import { computed, onMounted, ref, watch } from "vue";
import { useChartColors } from "@/composables/useChartColors";

const { columnLineColors } = useChartColors();
// ===================================================
// 📥 Props / Emits
// ===================================================
interface ChartData {
  [key: string]: string;
}

type Num = number | null | undefined;

const props = withDefaults(
  defineProps<{
    categories: string[]; // x축 라벨
    columnName?: string;
    lineName?: string;
    columnData: Num[]; // 막대 데이터
    lineData: Num[]; // 라인 데이터
    chartMsg?: string;
    state?: string;
  }>(),
  {
    categories: () => [],
    columnName: "Column",
    lineName: "Line",
    columnData: () => [],
    lineData: () => [],
  }
);

// undefined만 걸러서 null로 치환
const filterUndefined = (a: Array<number | null | undefined>) => a.map((v) => (v ? Number(v) : 0));

// ===================================================
// 📦 State
// ===================================================
const chartContainer = ref<HTMLElement | null>(null);

let chartInstance: Highcharts.Chart | null = null;

const containerWidth = chartContainer.value?.getBoundingClientRect()?.width || 300;
const containerHeight = chartContainer.value?.getBoundingClientRect()?.height || 124;

// ===================================================
// 🧮 Computed
// ===================================================
const currentState = computed(() => props.state);

// ===================================================
// ⚙️ Methods
// ===================================================
const getOptions = (): Highcharts.Options => {
  return {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      spacing: [0, 0, 0, 0],
      // width: containerWidth,
      height: containerHeight,
    },
    xAxis: [
      {
        categories: props.categories,
        gridLineWidth: 0,
        tickWidth: 0,
        lineWidth: 0,
        labels: {
          enabled: false, // <-- 틱 텍스트(눈금 레이블) 비활성화
          step: 5,
          style: {
            color: "var(--gray_400)",
            fontSize: "15px",
            fontFamily: "'Pretendard Std', 'Roboto', '-apple-system', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          },
          formatter: function () {
            return dayjs(this.value as string).format("YYYY.MM.DD");
          },
        },
      },
    ],
    yAxis: [
      {
        // 주 Y축 (왼쪽)
        title: {
          text: undefined, // <-- 이 부분을 undefined로 설정하여 타이틀 제거
        },
        labels: {
          enabled: false, // <-- 틱 텍스트(눈금 레이블) 비활성화
          style: {
            color: "var(--gray_400)",
            fontSize: "15px",
            fontFamily: "'Pretendard Std', 'Roboto', '-apple-system', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          },
        },
        gridLineWidth: 0,
        tickWidth: 0,
      },
    ],
    title: { text: "" },
    tooltip: {
      enabled: true,
      className: "tooltip",
      style: {
        fontFamily: "'Pretendard Std', 'Roboto', '-apple-system', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: "14px",
        color: "#000",
      },
    },
    legend: {
      enabled: true,
      layout: "vertical",
      // symbolRadius: 2,
      // symbolHeight: 8,
      // symbolWidth: 8,
      align: "right",
      verticalAlign: "bottom",
      x: 0,
      y: 0,
      padding: 0,
      // 하단 범례 style
      itemStyle: {
        fontFamily: "'Pretendard Std', 'Roboto', '-apple-system', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: "12px",
        color: "var(--gray_700)",
      },
      itemMarginTop: 0,
      itemMarginBottom: 10,
      itemHoverStyle: {
        color: "var(--gray_900)",
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
        name: props.columnName,
        type: "column", // 막대 차트
        data: filterUndefined(props.columnData),
        // color: 'var(--gray_300)',
        borderWidth: 0,
        color: columnLineColors.value.columnGradient,
      },
      {
        name: props.lineName,
        type: "spline", // 곡선형 라인 차트
        data: filterUndefined(props.lineData),
        color: columnLineColors.value.lineColor,
        lineWidth: 1,
        marker: {
          enabled: false,
        },
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

  chartInstance = Highcharts.chart(chartContainer.value, getOptions());
};
const updateSeriese = () => {
  chartInstance?.series[0]?.setData(props.columnData as any, false);
  chartInstance?.series[1]?.setData(props.lineData as any, true);
};

// ===================================================
// 👀 Watchers
// ===================================================
watch(() => [props.categories], drawChart, { deep: true });
watch(() => [props.columnData, props.lineData], updateSeriese, { deep: true });

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onMounted(drawChart);
</script>

<style lang="scss" scoped>
@use "@/css/components/chart/columnLine" as *;
</style>
