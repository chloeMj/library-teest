<template>
  <div style="width: 100%">
    <div v-if="title || slots.action" class="title-warp">
        <div class="title">{{ title }}</div>
        <div class="actions"><slot name="action"></slot></div>
    </div>
    <div ref="stackBar" class="stack-bar-wrap">
        <div
            v-for="(item, index) in seriesData"
            :key="index"
            :class="{'stack-bar-item': true, 'hidden': seriesData.length > 1 && index >= seriesData.length - 1 && item.guageWidth <= 0}"
            :style="{width: item.guageWidth+'%'}"
        >
            <div class="text">{{ Math.floor(item.percent * 100) / 100 }} %</div>
            <div class="bg" :style="{backgroundColor: item.bgColor}"></div>
        </div>
    </div>
    <div class="series-card-wrap">
        <q-carousel
            v-model="slide"
            transition-prev="slide-right"
            transition-next="slide-left"
            swipeable
            animated
        >
            <q-carousel-slide v-for="page of seriesCardPage" :key="page" :name="page" class="q-pa-none">
                <q-scroll-area class="fit">
                    <div class="row q-col-gutter-sm">
                        <div
                            v-for="(item, index) in seriesCardList.slice((page-1) * seriesCardPageUnit, ((page) * seriesCardPageUnit))"
                            :key="`${page}-${index}`"
                            :class="`col-${12 / seriesCardList.length} no-wrap series-card-item-wrap`"
                        >
                            <div class="series-card-item">
                                <div class="row justify-start items-center title">
                                    <div class="col-auto">
                                        {{ item.label }}
                                    </div>
                                    <div class="col-auto q-ml-sm">
                                        <div class="symbol" :style="{background: getColor( ((page-1) * seriesCardPageUnit + index) > colors.length-1 ? colors.length - 1 : ((page-1) * seriesCardPageUnit + index) )}" />
                                    </div>
                                </div>
                                <div class="value">
                                    {{ item.value }}
                                </div>
                            </div>
                        </div>
                    </div>
                </q-scroll-area>
            </q-carousel-slide>
        </q-carousel>
            <q-btn v-if="slide > 1" round dense class="control control-left" icon="arrow_left" @click="slide=slide-1" />
            <q-btn v-if="slide < seriesCardPage" round dense class="control control-right" icon="arrow_right" @click="slide=slide+1" />
    </div>
  </div>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { computed, onMounted, ref, useSlots } from 'vue';

// ===================================================
// 📐 Types / Interfaces
// ===================================================
import type { optionItem } from '@/types/common';
interface seriesItem extends optionItem {
  [key: string]: string | number | boolean
}
// ===================================================
// 📥 Props / Emits
// ===================================================
const props = withDefaults(
  defineProps<{
    title?: string,
    colors?: string[],
    series: seriesItem[],
    activeItemCount?: number,
    leftItemsLabel?: string,
    seriesCardPageUnit?: number,
    showAllSeriesItemCard?: boolean
  }>(),
  {
    width: 500,
    height: 200,
    colors: ['#4B8EFF', '#FFC814', '#3FED73', '#979BAA'],
    activeItemCount: 3,
    leftItemsLabel: '기타',
    seriesCardPageUnit: 4,
    showAllSeriesItemCard: false
  },
)
const slots = useSlots()

// ===================================================
// 📦 State
// ===================================================
const stackBar = ref<Element | null>(null)
const slide = ref<number>(1)

// ===================================================
// 🧮 Computed
// ===================================================
const totalValue = computed<number>(() => {
    return props.series.reduce((acc: number, current: seriesItem) => {
        return acc + Number(current.value)
    }, 0)
})
const sortedSeries = computed<seriesItem[]>(() => {
    return props.series.slice().sort((a: seriesItem, b: seriesItem) => {
        return a.value > b.value ? -1 : 1
    })
})
const seriesData = computed(() => {
    if(props.series.length < 1) {
      return [{
        label: props.leftItemsLabel,
        value: 0,
        percent: 0,
        guageWidth: 100,
        bgColor: getColor(props.activeItemCount)
      }]
    }

    const returnVal = sortedSeries.value.slice(0, props.activeItemCount)
    const ectValue = sortedSeries.value.slice(props.activeItemCount).reduce((acc: number, curr: seriesItem) => {
        return acc + Number(curr.value)
      }, 0)
    returnVal.push({
      label: props.leftItemsLabel,
      value: ectValue
    })
    return returnVal.map((item: seriesItem, index: number) => {
        return {
            ...item,
            percent: totalValue.value <= 0 ? 0 : (Number(item.value) / totalValue.value) * 100,
            guageWidth: totalValue.value <= 0 ? (100 / returnVal.length) : (Number(item.value) / totalValue.value) * 100,
            bgColor: getColor(index)
        }
    })
})
const seriesCardList = computed<optionItem[]>(() => {
    return props.showAllSeriesItemCard ? sortedSeries.value : seriesData.value
})
const seriesCardPage = computed<number>(() => {
    return Math.ceil(seriesCardList.value.length / props.seriesCardPageUnit)
})
// ===================================================
// ⚙️ Methods
// ===================================================
const getColor = (index: number) => {
    return props.colors[index % props.colors.length]
}

// ===================================================
// 🛠️ Actions
// ===================================================

// ===================================================
// 👀 Watchers
// ===================================================

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onMounted(() => {
    if(stackBar.value?.querySelectorAll) {
        const items = stackBar.value.querySelectorAll('.stack-bar-item:not(.hidden)') ?? []
        const textHeights = new Array(items.length).fill(0).map((item: number, index: number) => {
            return items[index]?.querySelector('.text')?.offsetHeight ?? 100
        });
        const minHeight = Math.min(...textHeights)
        items.forEach((item: Element) => {
            const textEl = item.querySelector('.text')
            if((textEl?.offsetHeight || 100) > minHeight) {
                textEl?.classList.add('hidden')
            }
        })
    }

})
</script>

<style lang="scss" scoped>
.title-warp {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    .title {
        font-weight: 700;
        font-size: 18px;
    }
}
.stack-bar-wrap {
    display: flex;
    width: 100%;
    .stack-bar-item {
        position: relative;
        height: 100%;
        margin: 0 2px;
        // text-align: center;
        padding-top: 24px;
        &:first-child {
            margin-left: 0;
        }
        &:last-child {
            margin-right: 0;
        }
        .text {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
            height: fit-content;
            text-align: center;
        }
        .bg {
            border-radius: 12px;
            width: 100%;
            height: 2px;
        }
    }
}
.series-card-wrap {
    position: relative;
    margin-top: 16px;

    .q-carousel:deep() {
        background: transparent;
        // overflow: visible;
        height: 65px;
    }
    .series-card-item-wrap {
        .series-card-item {
            background: #F5F6FA;
            border-radius: 12px;
            padding: 8px;

            .title {
                color: #454855;
                font-weight: 400;
                font-size: 12px;
            }
            .symbol {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }
            .value {
                color: #333333;
                font-weight: 600;
                font-size: 16px;
                margin-top: 8px;
            }
        }
    }
    .control {
        position: absolute;
        width: 36px;
        height: 36px;
        top: calc((65px/2) - (36px/2));
        color: #FFFFFF !important;
        background: #d3d6de71 !important;
        &-left {
            left: -15px;
            margin-left: 0 !important;
        }
        &-right {
            right: -15px;
            margin-right: 0 !important;
        }
    }
}
</style>
