<template>
  <div>
    <div v-if="title" class="list-title-wrap">
      <div class="list-title">
        <slot name="title">
          {{ title }}
          <!-- <span class="unit">(단위 : 원, %)</span> -->
        </slot>
      </div>
    </div>

    <div class="list-wrapper">
      <div class="list-wrap scroll">
        <div class="col-headers">
          <div class="row">
            <div
              v-for="(column, colIdx) in columns"
              :key="`col-header-${colIdx}`"
              class="col col-header"
            >
              {{ column.label }}
            </div>
          </div>
        </div>
        <TransitionGroup tag="div" name="fade" class="list-body" appear>
          <div
            v-for="(item, index) in rows"
            :key="getRowKey(item, index)"
            :class="{
              row: true,
              'realtime-data': item.realtimeData,
              active: selectedRowIdx === index,
            }"
            @click="(e) => onClickRow(e, index)"
          >
            <div
              v-for="(column, colIdx) in columns"
              :key="`list-${index}-col-${colIdx}`"
              :class="`col ${column.align ? 'text-' + column.align : ''}`"
            >
              <slot
                :name="`body-cell-${column.field}`"
                :value="item[column.field]"
                :column="column"
                :row="item"
              >
                {{ item[column.field] }}
              </slot>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import { computed, ref } from 'vue'

// ===================================================
// 📥 Props / Emits
// ===================================================
interface Column {
  label: string
  field: string
  align?: 'center' | 'left' | 'right'
}
const props = withDefaults(
  defineProps<{
    title?: string
    columns: Column[]
    rows?: Record<string, unknown>[]
    keyField?: string
  }>(),
  {
    rows: () => [],
  },
)

// ===================================================
// 📦 State
// ===================================================
const selectedRowIdx = ref<number | null>(null)

// ===================================================
// 🧮 Computed
// ===================================================
const keyField = computed(() => {
  if (props.keyField) {
    return props.keyField;
  } else {
    return props.columns[0].field;
  }
});

// ===================================================
// ⚙️ Methods
// ===================================================
const onClickRow = (evnt: Event, rowIndex: number) => {
  selectedRowIdx.value = rowIndex
}

// 고유키 생성
const getRowKey = (row: Record<string, any>, idx: number) => {
  if (keyField.value) return `ts-${row[keyField.value]}`
  // if (row?.receivedTime) return `ts-${row.receivedTime}-${row.shortCode}`
  return `ph-${idx}`
}
</script>

<style lang="scss" scoped>
@use '@/css/components/grid/transition' as *;
</style>
