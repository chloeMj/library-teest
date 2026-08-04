<template>
  <div v-if="direction === 'horizontal'" class="full-width full-height flex items-center">
    <div ref="barGaugeEl" class="flex q-gutter-xs full-width justify-stretch stack-bar-wrap">
      <div class="col-auto stack-bar-title row column items-center justify-center">
        <div v-for="(item, index) in modelValue" :key="index" class="horizontal-item text col flex items-center justify-center">
          {{ item.label }}
        </div>
      </div>
      <div class="col">
        <div v-for="(item, index) in modelValue" :key="index" class="horizontal-item stack-bar-item-wrapper q-pa-xs" :style="`height: calc(100%/${modelValue.length});`">
          <div class="stack-bar-item horizontal">
            <div class="bg" :style="`${stackBarWidth[index]} background-color: ${getColor(index)};`" />
            <div v-for="(point, idx) in points[index]" :key="idx" class="stack-point" :style="`${getPointPosition(point.value, item.max)} ${point.color ? `background-color: ${point.color};` : ''};`">
              <q-tooltip class="tooltip-point">
                <div class="point-info">
                  {{ point.label }}: {{ point.value }}
                </div>
              </q-tooltip>
            </div>
            <!-- <div v-for="(point, idx) in points" :key="idx" class="bg bg-point" :style="`${getPointWidth(item, index, point.pointValue)} background-color: ${point.color ?? getColor(0)};`" /> -->
          </div>
        </div>
      </div>
      <div class="col-auto stack-bar-value row column items-end justify-end">
        <div v-for="(item, index) in modelValue" :key="index" class="horizontal-item col flex items-center justify-end">
          <div class="text text-right" :style="setTextColor ? `color: ${getColor(index)};` : ''">
            {{ formattedUnitValues[index] }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else ref="barGaugeEl" class="row full-height full-width">
    <div v-for="(item, index) in modelValue" :key="index" :class="`col stack-bar-wrap flex column items-center justify-center`">
        <div class="stack-bar-title">
            <div class="text">{{ item.label }}</div>
        </div>
        <div class="stack-bar-item-wrapper col q-pa-xs full-height full-width">
          <div class="stack-bar-item vertical full-height">
            <div class="bg" :style="`height:${stackBarWidth[index]}; background-color: ${getColor(index)};`" />
          </div>
        </div>
        <div class="stack-bar-value">
          <div class="text" :style="setTextColor ? `color: ${getColor(index)};` : ''">
            {{ formattedUnitValues[index] }}
          </div>
        </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { formatUnitValue } from '@/plugins/grafana';
import { util } from '@/plugins/util';
import { computed, ref, useAttrs } from 'vue';

// ===================================================
// 📐 Types / Interfaces
// ===================================================
interface pointItem {
  value: number // 임계점
  color: string // 배경색
  [key: string]: string | number
}

const show = ref(true)

// ===================================================
// 📥 Props / Emits
// ===================================================
const props = withDefaults(
  defineProps<{
    color?: string[]
    visiblePrecision?: number // 표시용
    precision?: number // 최소 값 확인용
    max?: number
    direction?: 'horizontal' | 'vertical'
    displayUnit?: boolean
    setTextColor?: boolean
    points?: pointItem[] // 임계점
  }>(),
  {
    color: ['#4B8EFF', 'rgb(254 82 70 / 90%)', 'rgb(250 193 50 / 90%)', 'rgb(63 237 115 / 90%)'], //['#4B8EFF'],
    visiblePrecision: 2,
    precision: 4,
    max: 100,
    displayUnit: false,
    setTextColor: false,
    points: []
  },
)

const attrs = useAttrs()

interface modelValue {
  label: string
  value: string | number
  unit?: string
  max?: number
}
const modelValue = defineModel<modelValue[]>({ default: [] }); //<string | number>({ default: 0 })

// ===================================================
// 📦 State
// ===================================================
const barGaugeEl = ref<Element>()

// ===================================================
// ⚙️ Methods
// ===================================================
const getColor = (index: number) => {
  if(props.points && props.points.length > 0) {
    const isOver = props.points[index].find((point: pointItem) => {
      return point.value <= Number(modelValue.value[index].value)
    })

    if(isOver?.color) {
      return isOver.color
    }
  }
  // return props.color[0]
  return props.color[index % props.color.length]
}
const getWidthPercent = (value: number | string, max: number = 100) => {
  const val = Number(value) / (max ?? 100) // percentage
  const stackBarElBoundingRects = barGaugeEl.value?.querySelector('.stack-bar-item-wrapper')?.children[0]?.getBoundingClientRect()
  const barSize = (direction.value === 'horizontal' ? stackBarElBoundingRects?.width : stackBarElBoundingRects?.height) ?? 1

  return val * barSize < 1 ? 0 : (val * 100)
}
const getPointPosition = (pointValue: number, max: number = 100) => {
  const stackBarElBoundingRects = barGaugeEl.value?.querySelector('.stack-bar-item-wrapper')?.children[0]?.getBoundingClientRect()
  const barSize = (direction.value === 'horizontal' ? stackBarElBoundingRects?.width : stackBarElBoundingRects?.height) ?? 1

  return `left: ${barSize * (pointValue / max) - 1}px;`;
}
// ===================================================
// 📦 State
// ===================================================

// ===================================================
// 🧮 Computed
// ===================================================
const direction = computed<'horizontal' | 'vertical'>(() => {
  return props.direction ?? attrs?.options?.orientation ?? 'vertical'
})
const stackBarWidth = computed<string[]>(() => {
  return modelValue.value.map((v: modelValue) => {
    const width = getWidthPercent(v.value, v.max)
    return width === 0 ? 'width: 1px;' : `width: ${width}%;`

    // const val = Number(v.value) / (v.max ?? 100) // percentage
    // const stackBarElBoundingRects = barGaugeEl.value?.querySelector('.stack-bar-item-wrapper')?.children[0]?.getBoundingClientRect()
    // const barSize = (direction.value === 'horizontal' ? stackBarElBoundingRects?.width : stackBarElBoundingRects?.height) ?? 1

    // return val * barSize < 1 ? '1px' : `${val * 100}%`
  })
})
const formattedUnitValues = computed<string[] | number[]>(() => {
  return modelValue.value.map((v: modelValue) => {
    let val = util.comma(util.floatFixed(formatUnitValue(
        Number(v.value),
        {},
        "number",
        v.unit ?? "auto",
      ), 2))
      if(props.displayUnit && v.unit && !val.includes(v.unit)) {
        val += v.unit
      }
      return val
  })
})
// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
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
  .stack-bar-item-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    .stack-bar-item {
      position: relative;
      width: 100%;
      background: var(--border-light);
      border-radius: 12px;
      overflow: hidden;
      &.horizontal {
        height: 1rem;
      }
      &.vertical {
        width: 1rem;
      }
      .bg {
        width: 100%;
        height: 100%;
        border-radius: 12px;
        opacity: 70%;
      }
      .stack-point {
        position: absolute;
        top: 1px;
        left: 0;
        width: 3px;
        height: calc(100% - 2px);
        background: var(--gray_0);

      }
    }
  }

  .horizontal-item {
    height: 32px;
  }
  .stack-bar-title {
    .text {
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      line-height: 160%;
      letter-spacing: 0.2px;
    }
  }
  .stack-bar-value {
    padding: 0 10px;
    .text {
      font-weight: 700;
      font-size: 16px;
      text-align: center;
      line-height: 160%;
      letter-spacing: 0.2px;
    }
  }
}
</style>
