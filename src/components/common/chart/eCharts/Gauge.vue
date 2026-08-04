<template>
  <div ref="chartElWrap" style="width: 100%; height: 100%;">
      <v-chart
        ref="chartEl"
        class="chart"
        :option="chartOption"
        :autoresize="true"
      />
  </div>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { computed, ref, useAttrs } from 'vue';

// ===================================================
// 🧩 Components
// ===================================================
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GaugeChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent } from 'echarts/components'; // 구성 요소
import VChart from 'vue-echarts';
import { formatUnitValue } from '@/plugins/grafana';

use([
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer
]);
// ===================================================
// 📥 Props / Emits
// ===================================================
// interface series {
//     type?: string,
//     data: any[],
// }
const attrs = useAttrs()
const props = withDefaults(
  defineProps<{
    title?: string
    width?: number | string,
    height?: number | string,
    min?: number | string,
    max?: number | string,
    color?: object
    unit?: string
  }>(),
  {
    min: 0,
    max: 100,
    unit: ''
  },
)

interface modelValue {
  title?: string
  value: string | value
}
const modelValue = defineModel<modelValue[]>({ default: { value: 0 } })

// ===================================================
// 📦 State
// ===================================================
const chartElWrap = ref(null);
const chartEl = ref(null);

// ===================================================
// 🧮 Computed
// ===================================================
const chartOption = computed(() => {
  const progressWidth = (24 - (attrs.gridPos?.w ?? 6)) * 1.2
  const chartWidth = chartEl.value?.getWidth() ?? (chartElWrap.value?.clientWidth || 100)
  const chartHeight = chartEl.value?.getHeight() ?? (chartElWrap.value?.clientHeight || 100)
  const radius = `${(100 - ((progressWidth/chartWidth) * 100)).toFixed(0)}%`

  return {
    tooltip: {
      formatter: `{a} <br/>{b} : {c}${props.unit}`
    },
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      center: ['50%', '55%'],
      radius: '100%',
      min: Number(props.min),
      max: 1,
      progress: {
        show: false,
      },
      axisLine: {
        show: !!props.color,
        lineStyle: {
          width: 5,
          color: props.color ?? [
            [0.3, '#67e0e3'],
            [0.7, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        show: false
      },
    },{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      center: ['50%', '55%'],
      radius: radius,
      min: Number(props.min),
      max: Number(props.max),
    // splitNumber: 12,
      progress: {
        show: true,
        overlap: false,
        width: 5,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        show: false
      },
      anchor: {
        show: false,
      },
      pointer: {
        show: false
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        fontSize: 20,
        offsetCenter: [0, '-10%'],
        formatter: function(value) {
          return formatUnitValue(value, {}, "number", attrs?.fieldConfig?.defaults?.unit ?? "auto")
        },
        color: 'inherit'
      },
      data: modelValue?.value?.map((item: modelValue, index: number) => {
        const fontSize = (chartWidth / 12).toFixed(0) < '10' ? 8 : Number((chartWidth / 12).toFixed(0))
        const offsetCenter = `${index > 0 ? (-(((fontSize + 4)/chartHeight) * 100) * (index < 2 ? 1 : (index))) + 40 - (10 * index) : 40}%`
        return {
          value: item.value,
          name: item.title ?? '',
          detail: {
            fontSize: fontSize,
            offsetCenter: ['0%', offsetCenter]
          },
          itemStyle: props.color ? {
            color: props.color ? props.color?.find((step) => {
              return (step[0] * 100) > item.value
            })?.[1] : ''
          } : null
        }
      }) || [{
          value: 0,
          name: ''
      }]
    }]
  }
})
</script>

<style lang="scss" scoped>
.chart {
  width: 100%;
  height: 100%;
  min-width: 50px;
  // height: 100vh;
}
</style>
