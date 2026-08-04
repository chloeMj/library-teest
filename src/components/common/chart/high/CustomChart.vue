<!-- 사용 예시
<custom-chart type="pie" :data="chartData" />
<custom-chart type="bar" :data="chartData" />
<custom-chart type="area" :data="assetData" :chart-msg="assetDataMsg" />
-->

<!-- 데이터 형식 예시
// 실제 데이터 = RESPONSE.myAsset.chart
// BarChart와 Pie(donut)Chart는 data 동일
const chartData = [
  {
    "code": "1",
    "label": "주식",
    "percentage": "0.02"
  },
  {
    "code": "2",
    "label": "채권",
    "percentage": "0.02"
  },
  {
    "code": "3",
    "label": "펀드",
    "percentage": "10.00"
  },
  {
    "code": "4",
    "label": "신탁/기타",
    "percentage": "5.00"
  },
  {
    "code": "5",
    "label": "선물옵션",
    "percentage": "0.00"
  },
  {
    "code": "6",
    "label": "예수금",
    "percentage": "84.96"
  }
]

// 실제 데이터 = RESPONSE.graphCaption
const assetDataMsg = "어제보다 자산이 줄었어요."

// 실제 데이터 = RESPONSE.graph
const assetData = [
  {
    "eotEvalAmt": "5951988949",
    "baseDt": "20250530"
  },
  {
    "eotEvalAmt": "5951990139",
    "baseDt": "20250529"
  },
  {
    "eotEvalAmt": "5952741828",
    "baseDt": "20250528"
  },
  {
    "eotEvalAmt": "77013422",
    "baseDt": "20250527"
  },
  {
    "eotEvalAmt": "76915032",
    "baseDt": "20250526"
  },
  {
    "eotEvalAmt": "76916227",
    "baseDt": "20250525"
  },
  {
    "eotEvalAmt": "76916227",
    "baseDt": "20250524"
  },
  {
    "eotEvalAmt": "76916227",
    "baseDt": "20250523"
  }
]

-->

<template>
  <div class="chart-wrappper" :class="currentState">
    <!-- area 자산 추이 chart 상단 문구 -->
    <div v-if="props.chartMsg && props.type === 'area'" class="text-wrap" :class="currentState">
      <p class="text">{{ props.chartMsg }}</p>
    </div>
    <div :class="[{ empty: props.data?.length === 0 }, `chart-${props.type}`]" ref="chartContainer" />
  </div>
</template>

<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import Highcharts from "highcharts";
import { computed, onMounted, ref, watch } from "vue";

// ===================================================
// 📥 Props / Emits
// ===================================================
interface ChartData {
  [key: string]: string;
}

const props = defineProps<{
  type: "pie" | "bar" | "area";
  data: ChartData[];
  chartMsg?: string;
  state?: string;
}>();

// ===================================================
// 📦 State
// ===================================================
// style: 각 항목별 색상 정의 - pie, bar chart용
const COLORS: Record<string, any> = {
  주식: {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 }, // 위에서 아래로
    stops: [
      [0, "#027039"], // 시작점 (상단) 색상
      [1, "#A6F2C2"], // 끝점 (하단) 색상
    ],
  },
  채권: "#D4D4D4",
  펀드: "#3FB1E7",
  선옵: "#30DBC6",
  // "신탁": "#9973EA",
  예수금: "#FFC92C",
  기타: "#C2C2C2", // 신탁 포함
};

const chartContainer = ref<HTMLElement | null>(null);

let chartInstance: Highcharts.Chart | null = null;

// ===================================================
// 🧮 Computed
// ===================================================
const currentState = computed(() => props.state);

// area 컬러
const AreaBgColor = computed(() => {
  if (!props.data) {
    return "rgba(151,155,170,0.2)";
  }

  if (currentState.value === "up") {
    return "rgba(255,152,136,0.3)";
  } else if (currentState.value === "down") {
    return "rgba(78,128,239,0.2)";
  } else {
    return "rgba(151,155,170,0.2)";
  }
});

const AreaLineColor = computed(() => {
  if (currentState.value === "up") {
    return "#f33a26";
  } else if (currentState.value === "down") {
    return "#4e80ef";
  } else {
    return "#979baa";
  }
});

// ===================================================
// ⚙️ Methods
// ===================================================
// Area - 자산 추이 Chart
const getAreaOptions = (items: ChartData[]): Highcharts.Options => {
  const sorted = [...items]?.sort((a, b) => a?.baseDt.localeCompare(b?.baseDt));

  const values = sorted?.map((d) => parseFloat(d.eotEvalAmt));

  return {
    chart: {
      type: "area",
      // style: chart 배경색 및 위치
      backgroundColor: "transparent",
      spacing: [0, 0, 0, 0],
      margin: [10, 10, 10, 10],
      plotBorderWidth: 0,
      events: {
        load() {
          // console.log(this.chartHeight)
        },
      },
    },
    title: { text: undefined },
    subtitle: { text: undefined },
    legend: {
      enabled: false,
    },
    xAxis: {
      visible: false,
    },
    yAxis: {
      visible: false,
      startOnTick: false,
      endOnTick: false,
    },
    series: [
      {
        name: "",
        type: "area",
        data: values,
        showInLegend: false,
        fillColor: AreaBgColor.value,
      },
    ],

    // style: 그래프 클릭 시 보이는 tooltip style
    tooltip: {
      enabled: true,
      headerFormat: "",
      // pointFormat: "<b>{values}원</b>",

      formatter: function () {
        return `${this.y.toLocaleString()}원`;
      },

      backgroundColor: "#fff",
      style: {
        fontSize: "9px",
      },
      // useHTML: true,
      // formatter() {
      //   return `<div>${this.series[0]}: ${this.series[0]}</div>`
      // }
    },
    plotOptions: {
      area: {
        lineWidth: 2,
        threshold: null,
        lineColor: AreaLineColor.value,
        // chart 클릭 시 실행되는 이벤트 - // style: 그래프 클릭 시 생성되는 동그란 마커 스타일
        marker: { enabled: false, radius: 4, fillColor: AreaLineColor.value },
        states: {
          hover: {
            enabled: true,
            halo: {
              attributes: { fill: AreaLineColor.value },
            },
          },
        },
        enableMouseTracking: true,
      },
    },
    credits: { enabled: false },
  };
};

// Pie - 자산 구성 Chart
const getPieOptions = (items: ChartData[]): Highcharts.Options => {
  // 0 % 미만 데이터 제거
  const filteredData = items
    .map((d, index) => ({
      label: d.label,
      pct: parseFloat(d.percentage),
      color: COLORS[d.label],
      index,
    }))
    .filter((d) => d.pct > 0);

  const minVisiblePercent = 1; // 1% 미만은 차트에서 1% 정도의 영역 차지하게 하기
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

  const seriesData = [...adjustedBigSlices, ...adjustedSmallSlices].map((slice) => ({
    name: slice.label,
    y: slice.adjustedPercent,
    originalPercent: slice.pct,
    color: slice.color,
    borderWidth: 10,
    borderColor: "",
    legendIndex: slice.index,
  }));

  console.log(seriesData);
  return {
    chart: {
      type: "pie",
      spacing: [0, 0, 0, 0],
      events: {
        // 중앙 텍스트
        render() {
          const chart = this;
          if ((chart as any).customText) (chart as any).customText.destroy();
          (chart as any).customText = chart.renderer
            .text(props.chartMsg, chart.plotWidth / 2 + chart.plotLeft, chart.plotHeight / 2 + chart.plotTop)
            .attr({
              align: "center",
              class: "chart-center-label",
            })
            .add();
        },
      },
    },
    title: { text: "" },
    tooltip: { enabled: false },
    legend: {
      enabled: true,
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
        innerSize: "70 100%", // donut 내부 size - 숫자가 클수록 얇은 링
        // innerSize: "70 480%", // donut 내부 size - 숫자가 클수록 얇은 링

        borderRadius: 20,

        enableMouseTracking: false,
        allowPointSelect: false,
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
          enabled: true,
          // style: chart와 연결된 %문구 간격 및 색상 등 설정
          distance: 12,
          // distance: 30,

          connectorWidth: 1,
          // connectorColor: "black",
          // connectorPadding: 5,
          // softConnector: true,

          style: {
            fontSize: "12px",
            fontWeight: 400,
            fontFamily: "Pretendard",
          },

          formatter: function () {
            return `${this.originalPercent as number}%`;
          },
        },
      },
    },
    series: [
      {
        name: "자산 구성",
        type: "pie",
        data: seriesData,
      },
    ],
    credits: { enabled: false },
  };
};

// Bar - 자산 구성 Chart
const getBarOptions = (items: ChartData[]): Highcharts.Options => {
  // 0 % 미만 데이터 제거
  const filteredData = items.filter((i) => parseFloat(i.percentage) > 0);

  const minBarPercent = 1; // 1% 미만은 차트에서 1% 정도의 영역 차지하게 하기

  const categories = filteredData.map((i) => i.label);
  const seriesData = filteredData.map((i) => ({
    y: parseFloat(i.percentage) < minBarPercent ? minBarPercent : parseFloat(i.percentage),
    customPct: i.percentage,
    color: COLORS[i.label],
  }));

  return {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      marginTop: 20,
      marginRight: 20,
      marginLeft: 50, // style: 왼쪽 % 표시 영역
      spacingBottom: 10,
    },
    title: { text: "" },
    tooltip: { enabled: false },
    xAxis: {
      categories,
      labels: {
        // style: barChart x축(자산 종류 text)
        style: {
          fontSize: "14px",
          fontFamily: "'Pretendard Std', 'Roboto', '-apple-system', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          textOverflow: "visible",
        },
        rotation: 0,
        align: "center",
      },
      // style: x축 text 색상
      // style: x축 선 굵기
      lineWidth: 0.5,
      tickLength: 0,
      title: { text: "" },
    },
    yAxis: {
      min: 0,
      max: 100,
      tickInterval: 25,
      title: { text: "" },
      labels: {
        format: "{value}%",
        style: {
          fontSize: "12px",
          fontFamily: "'Pretendard Std', 'Roboto', '-apple-system', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          textOverflow: "visible",
        },
      },
      gridLineWidth: 0,
    },
    plotOptions: {
      column: {
        pointWidth: 12, // style: 막대 너비
        borderRadius: 10, // style: 막대 윗부분 둥근 정도 style
        borderWidth: 0,
        enableMouseTracking: false,
        allowPointSelect: false,
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
        point: {
          events: {
            click: () => false,
          },
        },
        dataLabels: {
          enabled: true,
          inside: false,
          // style: 막대 상단 % 문구
          style: {
            fontSize: "12px",
            fontWeight: "400",
          },
          formatter: function () {
            return `${this.customPct}%`;
          },
        },
      },
    },
    series: [
      {
        name: "자산 구성",
        type: "column",
        data: seriesData,
        showInLegend: false,
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

  const options =
    props.type === "pie"
      ? getPieOptions(props.data)
      : props.type === "bar"
        ? getBarOptions(props.data)
        : getAreaOptions(props.data);

  chartInstance = Highcharts.chart(chartContainer.value, options);
};

// ===================================================
// 👀 Watchers
// ===================================================
watch(() => [props.type, props.data], drawChart, { deep: true });

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onMounted(drawChart);
</script>

<style lang="scss" scoped>
// @use "@/assets/scss/components/customChart.scss" as *;
@use "sass:math";
.chart-wrappper {
  position: relative;
  > [class*="chart-"] {
    width: 100%;
    height: 220px;
    &.empty {
      height: 150px;
      &:deep() {
        .highcharts-series-0 path {
          stroke: #c7d2d9 !important;
        }
      }
    }
    &:deep() {
      .chart-center-label {
        font-size: 14px;
        line-height: 1;
        font-weight: 700;
        fill: rgb(72, 72, 72);
        transform: translateY(8.4px);
      }
      .highcharts-data-label text {
        fill: gray !important;
        tspan {
          stroke-width: 0;
        }
      }
      .highcharts-legend-item text {
        fill: gray !important;
      }
    }
  }
  > .chart-bar {
    &:deep() {
      .highcharts-yaxis-labels text {
        fill: rgb(175, 175, 175) !important;
      }
      .highcharts-xaxis-labels text {
        fill: gray !important;
      }
      .highcharts-axis-line {
        stroke: rgb(200, 200, 200);
      }
    }
  }
  > .chart-area {
    height: 70px;
  }
  .text-wrap {
    .text {
      display: flex;
      align-items: center;
      font-size: 15px;
      font-weight: 600;
      padding-bottom: 20px;
      &::before {
        content: "";
        display: block;
        width: 48px;
        height: 48px;
        margin-right: 12px;
        border-radius: 50%;
        // @include bg-img($img: '/src/assets/images/home/img-emoji3.png', $size: rem(32), $color: #efefef);
      }
    }

    // &.up {
    //   .text::before {
    //     @include bg-img($img: '/src/assets/images/home/img-emoji.png', $size: rem(32), $color: #efefef);
    //   }
    // }

    // &.down {
    //   .text::before {
    //     @include bg-img($img: '/src/assets/images/home/img-emoji2.png', $size: rem(32), $color: #efefef);
    //   }
    // }
  }
}
</style>
