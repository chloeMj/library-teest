<template>
  <div class="chart-wrappper" :class="currentState">
    <div :class="[{ empty: props.data?.length === 0 }, `chart-pie`]" ref="chartContainer" />
    <!-- <div class="percent-wrap">
      <div v-for="(p, i) in percentages" :key="i" class="chart-label">{{ p }}%</div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import Highcharts from "highcharts";
import { computed, onMounted, ref, watch } from "vue";
import { useChartColors } from "@/composables/useChartColors";

const { pieColors } = useChartColors();
// ===================================================
// 📥 Props / Emits
// ===================================================
interface ChartData {
  [key: string]: string;
}

type PieDatum = {
  label: string;
  percentage: number | string; // 숫자/문자 모두 허용
};

const props = defineProps<{
  data: PieDatum[];
  chartMsg?: string;
  state?: string;
}>();

// ===================================================
// 📦 State
// ===================================================
// 각 항목별 색상 정의
const COLORS = pieColors;
const chartContainer = ref<HTMLElement | null>(null);

// Pie - 자산 구성 Chart
const percentages = ref<number[]>([]);

let chartInstance: Highcharts.Chart | null = null;

// ===================================================
// 🧮 Computed
// ===================================================
const currentState = computed(() => props.state);

// ===================================================
// ⚙️ Methods
// ===================================================

const getSeriesData = () => {
  // 0 % 미만 데이터 제거
  const filteredData = props.data
    .map((d, index) => ({
      label: d.label,
      pct: parseFloat(String(d.percentage)),
      color: COLORS.value[index],
      index,
    }))
    .filter((d) => d.pct > 0);

  const minVisiblePercent = 3; // 1% 미만은 차트에서 3% 정도의 영역 차지하게 하기
  const smallSlices = filteredData.filter((d) => d.pct < minVisiblePercent);
  const bigSlices = filteredData.filter((d) => d.pct >= minVisiblePercent);

  const sumBigOriginal = bigSlices.reduce((sum, slice) => sum + slice.pct, 0);
  const availablePercentageForBig = 100 - smallSlices.length * minVisiblePercent;

  const adjustedBigSlices = bigSlices.map((slice) => ({
    ...slice,
    adjustedPercent: slice.pct * (availablePercentageForBig / sumBigOriginal),
  }));

  const adjustedSmallSlices = smallSlices.map((slice) => ({
    ...slice,
    adjustedPercent: minVisiblePercent,
  }));

  const seriesData: Highcharts.PointOptionsObject[] = [...adjustedBigSlices, ...adjustedSmallSlices].map((slice) => ({
    name: slice.label,
    y: slice.adjustedPercent,
    originalPercent: slice.pct,
    color: slice.color,
    borderWidth: filteredData.length === 1 ? 0 : 10, // 조건 추가 (100% 시 borderWidth 버그)
    borderColor: "var(--gray_0)",
    legendIndex: slice.index,
    custom: { originalPercent: slice.pct },
  }));

  return {
    data: seriesData.reverse(), // 반시계방향으로 수정
    isSingleData: filteredData.length === 1, // 조건 100%
  };
};

// Pie - 자산 구성 Chart
const getPieOptions = (): Highcharts.Options => {
  const containerWidth = chartContainer.value?.getBoundingClientRect()?.width || 200;
  const seriesResult = getSeriesData();

  return {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      spacing: [0, 0, 0, 0],
      events: {
        // 중앙 텍스트
        render() {
          const chart = this;
          if ((chart as any).customText) (chart as any).customText.destroy();
          (chart as any).customText = chart.renderer
            .text(props.chartMsg, chart.plotWidth / 2 + chart.plotLeft, chart.plotHeight / 2 + chart.plotTop - 10)
            .attr({
              align: "center",
              class: "chart-center-label",
            })
            .css({
              lineHeight: `24px`,
            })
            .add();
          // 퍼센트
          const data = chart.series[0].points.map((p) => Number((p.percentage || 0).toFixed(1)));
          percentages.value = data;
        },
      },
      width: containerWidth,
      height: containerWidth,
    },
    title: { text: "" },
    tooltip: { enabled: false },
    legend: {
      enabled: false,
      layout: "horizontal",
      symbolRadius: 2,
      symbolHeight: 8,
      symbolWidth: 8,
      align: "center",
      verticalAlign: "bottom",
      x: 0,
      y: 0,
      padding: 0,
      // 하단 범례 style
      itemStyle: {
        fontFamily: "'Pretendard Std', 'Roboto', '-apple-system', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: "14px",
      },
      itemDistance: 12,
      events: {
        itemClick: function (e) {
          e.preventDefault();
        },
      },
    },
    plotOptions: {
      pie: {
        // style: donut 그래프 굵기 등 스타일
        innerSize: seriesResult.isSingleData ? "80 100%" : "70 100%", // donut 내부 size - 숫자가 클수록 얇은 링
        // innerSize: "70 480%", // donut 내부 size - 숫자가 클수록 얇은 링
        borderRadius: 100,
        enableMouseTracking: false,
        allowPointSelect: false,
        // startAngle: 0.01,
        // endAngle: 359.99,
        states: {
          hover: {
            enabled: false,
          },
          inactive: {
            enabled: false,
          },
          select: {
            enabled: false,
          },
        },
        showInLegend: true,
        dataLabels: {
          enabled: false,
          // style: chart와 연결된 %문구 간격 및 색상 등 설정
          distance: 0,
          // distance: 30,

          connectorWidth: 1,
          // connectorColor: "black",
          // connectorPadding: 5,
          // softConnector: true,

          style: {
            fontSize: "12px",
            fontWeight: "400",
            fontFamily: "Pretendard",
          },

          formatter: function () {
            const v =
              (
                this.options as Highcharts.PointOptionsObject & {
                  custom?: { originalPercent?: number };
                }
              ).custom?.originalPercent ?? 0;
            return `${v}%`;
          },
        },
      },
    },
    series: [
      {
        name: "자산 구성",
        type: "pie",
        data: getSeriesData().data,
      },
    ],
    credits: { enabled: false },
  };
};

const drawChart = () => {
  if (!chartContainer.value) return;
  if (chartInstance) {
    updateSeriese();
    return;
    // chartInstance.destroy()
    // chartInstance = null
  }
  chartInstance = Highcharts.chart(chartContainer.value, getPieOptions());
};

const updateSeriese = () => {
  chartInstance?.series[0]?.setData(getSeriesData().data);
};

// ===================================================
// 👀 Watchers
// ===================================================
watch(() => [props.data], drawChart, { deep: true });
// watch(() => [props.data], updateSeriese, {deep: true})

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onMounted(drawChart);
</script>

<style lang="scss" scoped>
@use "@/css/components/chart/pie" as *;
</style>
