<template>
  <div ref="wrapper" style="width: 100%; height: 100%; overflow: hidden;">
    <v-chart
      ref="chartEl"
      class="chart"
      :option="chartOption"
      autoresize
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
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { nextTick } from 'vue';

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
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
    legendLabels?: string[],
    legendPosition?: 'top' | 'right' | 'bottom' | 'left',
    color?: string[],
  }>(),
  {
    width: '100%',
    // height: '300px',
    showLegend: true,
    legendPosition: 'bottom',
    color: ['#4B8EFF', 'rgb(254 82 70 / 90%)', 'rgb(250 193 50 / 90%)', 'rgb(63 237 115 / 90%)'],
  },
)

const modelValue = defineModel({ defualt: { value: 0, name: '' }})

// ===================================================
// 📦 State
// ===================================================
const wrapper = ref()
const mounted = ref<boolean>(false)
const chartEl = ref(null);
const wrapperHeight = ref(0)

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
      trigger: 'item'
    },
    legend: {
      show: props.showLegend && props.legendLabels?.length,
      data: props.legendLabels || []
    },
    color: props.color,
    series: [{
      name: props.title,
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: 'transparent',
        borderWidth: 0
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: false,
          fontSize: 12,
          // fontWeight: 'bold'
        },
        focus: 'none',
        scale: false
      },
      labelLine: {
        show: false
      },
      data: modelValue.value
    }]
  }
})
// const height = computed(() => {
//   return props.height ? props.height : wrapperHeight.value ? wrapperHeight.value + 'px' : '100%'
// })

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onMounted(() => {
  // setTimeout(() => {

  //   const rect = wrapper.value?.getBoundingClientRect()
  //   wrapperHeight.value = rect?.height ?? 0
  //   console.log('parent>>', wrapper.value.parentElement, wrapper.value.parentElement?.getBoundingClientRect())
  // }, 0);
  // nextTick(() => {
  //   mounted.value = true
  // })
})
</script>

<style lang="scss" scoped>
.chart {
  // height: 100vh;
}
</style>
