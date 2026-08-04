<template>
  <div>
      <apexchart
        :width="width"
        :height="height"
        type="line"
        :options="options"
        :series="seriesData"
    />
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

// ===================================================
// 📦 Imports
// ===================================================

// ===================================================
// 📥 Props / Emits
// ===================================================
// interface series {
//     type?: string,
//     data: any[],
// }
const props = withDefaults(
  defineProps<{
    title?: string,
    width?: number | string,
    height?: number | string,
    colors?: string[],
    showLegend?: boolean,
    legendPosition?: 'top' | 'right' | 'bottom' | 'left',
    series: any,
    xaxis: any,
    yaxis: any
    referenceValues?: number[]
  }>(),
  {
    height: 200,
    colors: () => {
      return ['#4B8EFF', '#FFC814']
    },
    showLegend: true,
    legendPosition: 'bottom',
  },
)

// ===================================================
// 📦 State
// ===================================================

// ===================================================
// 🧮 Computed
// ===================================================
const seriesData = computed(() => {
    return props.series.map((data: any, index: number) => {
        return {
            ...data,
            color: props.colors[index] || props.colors[0]
        }
    })
})
const annotations = computed(() => {
    const yaxis = props.referenceValues?.map((referenceValue: number) => {
        return {
            y: referenceValue, // 기준선이 위치할 Y축 값
            borderColor: '#FF0000', // 선 색상 (빨간색)
            strokeDashArray: 0, // 선 스타일 (0은 실선, 숫자 클수록 점선 간격 커짐)
            label: {
                borderColor: 'transparent',
                style: {
                    color: '#FF0000',
                    background: 'transparent',
                },
                text: `${referenceValue}%`, // 라벨 텍스트
                textAnchor: 'start',
                offsetX: 10,
                position: 'left'

            }
        }
    })
    return yaxis ? {
        yaxis: yaxis
    } : {}
})
const options = computed(() => {
    return {
        zoom: {
            enabled: true
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 1,
        },
        title: {
            text: props.title || '',
            align: 'left'
        },
        legend: {
          show: props.showLegend,
          position: props.legendPosition
        },
        grid: {
            row: {
                colors: ['#EFF0F3', 'transparent'],
                opacity: 1
            }
        },
        xaxis: props.xaxis,
        yaxis: props.yaxis,
        annotations: annotations.value
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
</style>
