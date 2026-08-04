<template>
  <div v-if="!hideTop" class="table-info">
    <div>
      <h3 v-if="title">{{ title }}</h3>
      <!-- 01-15 총건수 변경 -->
      <span v-else-if="!hideCount" class="count">
        총
        <strong>{{ rowData.length }}</strong>
        건
      </span>
      <slot name="left"></slot>
    </div>
    <div>
      <slot name="right"></slot>
      <button v-if="isExpand" type="button" class="btn-expand" @click="onShowColumns">
        <span v-if="!isShow">expand</span>
        <span v-else>contract</span>
        <span class="hide">데이터 더보기</span>
      </button>
      <!-- 12-23 건수 숨기기 조건 추가, 01-15 총건수 변경 -->
      <span v-if="title && !hideCount" class="count">
        총
        <strong>{{ rowData.length }}</strong>
        건
      </span>
      <slot v-if="$slots.unit" name="unit"></slot>
    </div>
  </div>
  <q-markup-table :style="{ maxWidth: width + 'px' }" class="sticky-header-table" :class="{ 'fixed-table': fixedTableLayout }" ref="tableRef" @scroll="onScroll">
    <colgroup>
      <col v-for="(col, colIdx) in colGroup" :key="`col-${colIdx}`" :style="col.width ? `width: ${col.width}px; max-width: ${col.width}px;` : ''" />
    </colgroup>
    <thead>
      <q-tr v-for="(columns, groupIdx) in visibleColumns" :key="groupIdx">
        <!-- 12-26 클래스 수정, 마지막 sticky 요소에 last-sticky 붙여주세요 -->
        <q-th
          v-for="(col, colIdx) in columns"
          :key="`${groupIdx}_${colIdx}_${col.name}`"
          :class="`${col.sticky ? 'sticky' : ''} ${col.checkColumn ? 'checkbox-column' : ''} ${col.borderLeft ? 'border-left' : ''} ${col.isLastSticky ? 'last-sticky' : '' }`"
          :rowspan="col.maxRowspan ?? (col.rowspan || 1)"
          :colspan="col.colspan || 1"
          :style="`
                           ${col.width ? 'width: ' + col.width + 'px;min-width: ' + col.width + 'px;max-width: ' + col.width + 'px;' : fixedTableLayout ? `width: ${defaultColWidth}px; min-width: ${defaultColWidth}px;` : ''}
                           ${col.height ? 'height: ' + col.height + 'px;min-height: ' + col.height + 'px;max-height: ' + col.height + 'px;' : ''}
                           ${col.left ? 'left: ' + col.left + 'px;' : col.sticky ? 'left: 0;' : ''}
                           `"
          @click="`${isSort ? sortFn(col) : ''}`"
        >
          <!-- ▲▲▲ ※※ 2025-01-06 sort여부 조건 추가 : @click="sortFn(col)"  => @click="`${isSort ? sortFn(col) : ''}`"  -->
          <template v-if="col.checkColumn && selection !== 'single'">
            <q-checkbox size="sm" v-model="selectAll" :val="true" @update:modelValue="selectAllRows" />
          </template>
          <template v-else>
            <span v-html="col.label"></span>
            <q-icon name="arrow_upward" v-if="sortData.sortColumn == col.name && sortData.sortDirection == 'asc'" />
            <q-icon name="arrow_downward" v-if="sortData.sortColumn == col.name && sortData.sortDirection == 'desc'" />
          </template>
        </q-th>
      </q-tr>
    </thead>
    <!-- 24-12-30 : loading -->
    <tbody v-if="loading">
      <tr>
        <td :colspan="Array.isArray(columns[0]) ? columns.flatMap((col) => col).length : columns.length">
          <q-inner-loading :showing="loading">
            <q-spinner-dots size="40px" />
          </q-inner-loading>
        </td>
      </tr>
    </tbody>
    <!-- 24-12-30 : nodata -->
    <tbody v-else-if="!loading && rows.length === 0">
      <tr>
        <td :colspan="Array.isArray(columns[0]) ? columns.flatMap((col) => col).length : columns.length">
          <div class="no-data">
            <p class="text">조회된 자료가 없습니다.</p>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <template v-for="(row, rowIdx) in rowData">
        <q-tr
          v-for="(columns, groupIdx) in columnFields"
          :key="`${rowIdx}-${groupIdx}`"
          :class="
          {
            'odd': visibleColumns.length > 1 ? (rowIdx % 10) > 4 : rowIdx % oddNum === oddNum - 1,
            'selected': selectedRow.includes(rowIdx)
          }
          "
        >
          <!-- 12-26 클래스 부분 수정 -->
          <!-- ※※ 2025-01-06 align class 추가: ${col.align? 'text-' + col.align : 'align-center'} -->
          <template v-for="(col, colIndex) in columns">
            <q-td
              v-if="!row.rowspan || !(row.rowspan && row.rowspan[col.field] && row.rowspan[col.field].hidden)"
              :key="`${rowIdx}-${groupIdx}-${col.name}`"
              :class="`
                ${col.sticky ? 'sticky' : ''}
                ${col.isLastSticky ? 'last-sticky' : '' }
                ${col.checkColumn ? 'checkbox-column' : ''}
                ${col.frozen ? 'frozen' : ''}
                ${col.grouping ? 'hidden' : ''}
                ${col.borderLeft ? 'border-left' : ''}
                ${col.align ? 'text-' + col.align : 'align-center'}
              `"
               :rowspan="rowspanColumns > colIndex && row.rowspan && row.rowspan[col.field] && row.rowspan[col.field].rowspan ?
                 row.rowspan[col.field].rowspan : col.maxRowspan ?? (col.rowspan || 1)"
              :colspan="col.colspan || 1"
              :style="`
                            ${col.width ? 'width: ' + col.width + 'px;min-width: ' + col.width + 'px;max-width: ' + col.width + 'px;' : fixedTableLayout ? 'width: 100px; min-width: 100px;' : ''}
                            ${col.left ? 'left: ' + col.left + 'px;' : col.sticky ? 'left: 0;' : ''}
                        `"
              @click="(evnt) => onRowClick(evnt, row, rowIdx, groupIdx, colIndex)"
            >
              <template v-if="col.name === 'index'">
                {{ rowIdx + 1 }}
              </template>
              <template v-else-if="col.checkColumn">
                <q-checkbox size="sm" v-model="selectedRow" :val="rowIdx" @update:modelValue="onSelect(row)"></q-checkbox>
              </template>
              <!-- 2024-12-11 김재연 포메팅 및 popup 옵션 추가-->
              <template v-else-if="col.popOption === 'Detail'">
                <a class="link">{{ _formatting(row, col) }}</a>
              </template>
              <template v-else-if="col.popOption === 'send'">
                <!-- clcl_f == 1 (취소거래) && invst_expl_grnt_gds_ccd == 002 (사모펀드) 경우 막음 -->
                <p v-if="row.cncl_f === '1'">취소거래</p>
                <p v-else-if="row.invst_expl_grnt_gds_ccd === '002'">사모펀드</p>
                <button v-else class="btn-sm-outlined">보내기</button>
              </template>
              <template v-else-if="col.popOption === 'bizPortal'">
                <!-- 2024-12-24: a링크 버튼으로 수정 -->
                <button class="btn-sm-outlined">보기</button>
              </template>
              <template v-else-if="col.popOption === 'PDF'">
                <!-- 2024-12-24: a링크 버튼으로 수정 -->
                <button v-if="row[col.field] === 'Y' || row[col.field] === true" class="btn-sm-outlined">PDF</button>
              </template>
              <template v-else-if="col.name === 'CS_NM'">
                <a href="#" class="user" v-customer-info="row.CS_NO">{{ row.CS_NM }}</a>
              </template>
              <template v-else-if="col.name === 'cs_nm'">
                <a href="#" class="user" v-customer-info="row.cs_no">{{ row.cs_nm }}</a>
              </template>
              <!-- 2025-01-02 말줄임 옵션 추가 -->
              <template v-else-if="col.ellipsis">
                <span class="ellipsis">{{ _formatting(row, col) }}</span>
              </template>
              <template v-else>
                {{ _formatting(row, col) }}
              </template>
            </q-td>
          </template>
        </q-tr>
      </template>
      <template v-if="!!noDataLabel">
        <slot v-if="!!slots.noData" name="no-data"></slot>
        <div class="no-data">
          <i class="icon" aria-hidden="true"></i>
          <p class="text">noDataMessage</p>
        </div>
      </template>
    </tbody>

    <!-- 12/19 bottom 위치 및 변경 -->
    <tfoot v-if="!hideBottom">
      <slot name="footer"></slot>
    </tfoot>
  </q-markup-table>

  <!-- 12-24: 로딩중 추가 -->
  <!-- <div v-if="loading">
      <q-inner-loading :showing="loading">
         <q-spinner-dots size="40px" />
      </q-inner-loading>
   </div> -->
  <!-- <div class="no-data" v-if="!loading && rows.length === 0">
      <p class="text">조회된 자료가 없습니다.</p>
   </div> -->

  <!-- 12-05 버튼 수정 -->
  <button type="button" class="btn-top" v-if="showScrollIcon" @click="scrollUp">
    <SvgIcon icon-name="arrowUp" size="sm" stroke="#fff" />
    <span class="hide">상단으로 이동</span>
  </button>
</template>

<script setup lang="ts">
import { useTemplateRef, defineProps, computed, ref, toRef, reactive, useSlots, watch, watchEffect } from 'vue'

export interface Columns {
  name: String
  field: String
  label: String
  sortable?: boolean
  type?: 'number' | 'date' | 'dateTime' | 'dateTimes' | 'time' | 'dateTimeToTime' | 'float2' | 'account1' | 'telNumber' | 'bfrRgstNo' | 'yesNo' | 'float' | undefined
  align?: 'left' | 'center' | 'right'
  visible?: boolean
  sticky?: boolean
  borderLeft?: boolean
  format?: (val: string, row: any) => string
  ellipsis?: boolean // 2025-01-02 말줄임 옵션 추가
}

export interface MarkupTableProps {
  columns: Columns[]
  rows: any[]
  rowKey?: number | string
  selection?: string
  title?: string
  loading?: boolean
  hideTop?: boolean // top 숨기기
  hideHeader?: boolean // 헤더 숨기기
  hideBottom?: boolean // 푸터 숨기기
  hideCount?: boolean // 12-23 건수 숨기기 추가
  hidePagination?: boolean
  hideScrollUp?: boolean
  width?: string | number
  height?: string | number
  noDataLabel?: string
  style?: any
  class?: any
  oddNum?: number | string
  isExpand?: boolean
  isRowClick?: boolean
  selectedRows?: any[]
  selected?: any[]
  isSort?: boolean // ※※ 2025-01-06 sort여부 추가
  rowspanColumns?: number
  defaultColWidth?: number
}

/**
 * columns : 2중 배열로 props 받기 (단일 행의 경우 q-table 사용)
 * rows : 데이터
 * oddNum : n번째 행 마다 색상 표시 (기본 2번째 행 마다 색상 표시)
 * **/
const props = withDefaults(defineProps<MarkupTableProps>(), {
  columns: () => [],
  rows: () => [],
  rowKey: '',
  selection: '',
  loading: false,
  hideTop: false,
  hideHeader: false,
  hideBottom: false,
  hidePagination: false,
  hideScrollUp: false,
  hideCount: false, // 12-23 추가
  height: 600,
  width: '100%',
  oddNum: 2,
  isRowClick: true,
  selectedRows: () => [],
  selected: () => [],
  isSort: true, // ※※ 2025-01-06 sort여부 추가
  rowspanColumns: 0,
  defaultColWidth: 100, // sticky column(fixed) 기본 너비 100px
})

const emits = defineEmits<{
  (e: 'rowClick', row: any): void
  (e: 'select', row: any): void
  (e: 'selectAll'): void
  (e: 'update:selected', rows: any): void
  (e: 'update:visibleColumns', columns: any): void
  (e: 'update:columnFields', columns: any): void
  (e: 'update:isExpanded', val: boolean): void
}>()

const slots = useSlots()
const slotKeys = computed(() => Object.keys(slots))

const tableRef = useTemplateRef('tableRef')

const columnNames = ref<string[]>([])
const showColumnNames = ref<string[]>([])
const visibleColumns = reactive<any[]>([])

/** columnFields : 바디 영역에 데이터를 표시할 column 목록. 헤더 줄 수에 상관없이 한 줄 짜리로 표시하는 테이블의 경우 해당 데이터는 1개의 array를 가진 2차원 배열이 됨.  */
const columnFields = reactive<any[]>([])
const colGroup = reactive<any[]>([])

const rowData = ref<any[]>(props.rows.slice())
const rowKey = ref(props.rowKey)
const oddNum = Number(props.oddNum)

const sortData: { [key: string]: string } = reactive({
  sortColumn: '',
  sortDirection: '',
})

const fixedTableLayout = ref(false)

const isShow = ref(false) // 전체 컬럼 표시 여부
const columnLeftInits = reactive<any[]>([]) // 각 열의 시작 위치. 윗 행에서 rowspan을 사용한 경우 아래 행의 left값은 더 커져야한다.
const colspanGroupStartIndex = reactive<any[]>([])

/**
 * body rows merge :테이블 바디 rows 내 동일 데이터를 가진 경우 rowspan 처리
 * 헤더가 1줄인 경우만 사용 가능
 * rowspanColumns가 1 이상이어야함
 * rowspanColumns가 1인 경우 : 첫 번째 컬럼의 row 데이터가 동일한 만큼 rowspan
 * rowspanColumns가 2인 경우 : 첫 번째 컬럼의 row 데이터, 두 번째 컬럼의 row 데이터가 동일한 만큼 rowspan
 * */
const setRowspanColumns = () => {
  if(props.rowspanColumns <= 0 || visibleColumns.length > 1) {
    return
  }

  rowData.value.map((row) => {
    return row.rowspan = {}
  })

  for(let i=0; i < props.rowspanColumns; i++) {
    const fieldText = visibleColumns[0][i].field
    let originRowIdx = 0;
    let duplicatedCountOrigin = 0
    let duplicatedCount = 0

    for(let j=0; j < rowData.value.length; j++) {
      if(duplicatedCount > 1) {
        rowData.value[j].rowspan[fieldText] = {
          originRowIdx: originRowIdx,
          originRowspan: duplicatedCountOrigin,
          rowspan: 1,
          hidden: true
        }
        duplicatedCount -= 1
        continue
      } else {
        rowData.value[j].rowspan[fieldText] = null
      }

      const displayValue = rowData.value[j][fieldText]

      const listForFilter = [...rowData.value].splice(j, rowData.value.length)
      if(listForFilter.length > 1 && listForFilter[1][fieldText] === displayValue) {
        duplicatedCount = listForFilter.filter((row, rowIndex) => {
          if(
            row[fieldText] === displayValue
            && (
              (rowIndex > 0 && listForFilter[rowIndex - 1][fieldText] === displayValue)
              || (rowIndex < listForFilter.length - 1 && listForFilter[rowIndex + 1][fieldText] === displayValue)
            )
          ) {
            return true
          }
          listForFilter.splice(rowIndex, listForFilter.length)
          return false
        }).length

        if(i > 0) {
          const prevColumn_rowspan = rowData.value[j].rowspan[visibleColumns[0][i-1].field]

          if(prevColumn_rowspan ) {
            // 이전 셀의  rowspan 보다 커질 수 없음
            if(prevColumn_rowspan.originRowIdx + prevColumn_rowspan.originRowspan < j + duplicatedCount){
              const maxRowspan = Math.abs(j - (prevColumn_rowspan.originRowIdx + prevColumn_rowspan.originRowspan))
              duplicatedCount = duplicatedCount > maxRowspan ? maxRowspan : duplicatedCount - maxRowspan
            }
          } else if (duplicatedCount > 1) {
            // 이전 셀의  rowspan = 1
            // 해당 셀의 rowspan도 1보다 커질 수 없음
            duplicatedCount = 1
          }
        }

        originRowIdx = j
        duplicatedCountOrigin = duplicatedCount
        if(duplicatedCount > 0) {
          rowData.value[j].rowspan[fieldText] = {
            originRowIdx: j,
            rowspan: duplicatedCount,
            originRowspan: duplicatedCount,
            hidden: false
          }

          if(visibleColumns[0][i+1]) {
            visibleColumns[0][i+1].borderLeft = true
          }
        }
      }
    }
  }
}

const filteredColumns: Columns[] = computed(() => {
  return [...props.columns.slice()].map((colGroup: any[]) => {
    const group = colGroup.filter((col) => {
      //  전체 컬럼 표시 false && 컬럼 visible 값 false
      if(!isShow.value) {
        return col.visible !== false
      }
      return true
    })
    columnLeftInits.push(0)
    colspanGroupStartIndex.push(0)

    return group.length > 0 ? group : null
  }).filter((colGroup) => {
    return colGroup
  })
})

const setVisibleColumns = async () => {
  // init
  columnLeftInits.splice(0, columnLeftInits.length)
  visibleColumns.splice(0, visibleColumns.length)
  colGroup.splice(0, colGroup.length)
  columnFields.splice(0, columnFields.length)

  const currentColumns = []
  for (let groupIdx = 0; groupIdx < filteredColumns.value.length; groupIdx++) {
    const group = [...filteredColumns.value[groupIdx]]
    const maxRowspan = filteredColumns.value.length - groupIdx
    // 첫 행의 시작 left는 0
    let leftValue = groupIdx > 0 ? columnLeftInits[groupIdx - 1] : 0

    if (props.selection && groupIdx < 1) {
      const stickyColumnIndex =
        group?.findIndex((c) => {
          return !!c.sticky
        }) ?? -1
      const checkColumn = {
        name: 'selection',
        label: '',
        checkColumn: true,
        width: 50,
        rowspan: maxRowspan,
        sticky: stickyColumnIndex > -1,
      }
      group.splice(0, 0, checkColumn)
      colGroup.push({
        width: 50,
      })
      if(!columnFields[0]) {
        columnFields[0] = []
      }
      columnFields[0].push(checkColumn)
    }

    const lastStickyColumnIdx = Math.max.apply(null, group.map((col, colIdx) => {
      return col.sticky ? colIdx : 0
    }))

    for (let colIdx = 0; colIdx < group.length; colIdx++) {
      const col = group[colIdx]
      if (col) {
        // if (!isShow.value && col.visible === false) {
        //   // 전체 컬럼 표시 false && 컬럼 visible 값 false
        //   group.splice(colIdx, 1)
        //   colIdx -= 1
        //   continue
        // }
        const colGroupItem = {}

        if (!rowKey.value && col.name) {
          rowKey.value = col.name
        }
        if (col.sticky) {
          const width = col.width ?? props.defaultColWidth
          if (!fixedTableLayout.value) {
            fixedTableLayout.value = true
          }
          col.left = leftValue
          if (col.left) {
            col.left = col.left
            // leftValue += Number(col.left)
          }
          leftValue += Number(width)
          if (col.rowspan) {
            // rowspan을 갖는 행의 경우 다음 행의 left 시작값에 영향을 준다.
            for(let rowspanGroupIdx=groupIdx; rowspanGroupIdx < col.rowspan-1; rowspanGroupIdx++) {
              columnLeftInits[rowspanGroupIdx] += Number(width)
            }
            //  columnLeftInits[groupIdx] += Number(width)
          }

          //last-sticky
          col.isLastSticky = colIdx === lastStickyColumnIdx
          colGroupItem.width = width
        }
        if (col.height) {
          colGroupItem.height = col.height
        }
         if (col.rowspan) {
          col.maxRowspan = maxRowspan
         }

        if (!colGroup[colIdx] || (colGroup[colIdx] && !colGroup[colIdx].width)) {
          colGroup[colIdx] = colGroupItem
        }
      }
    }

    visibleColumns.push(group)
  }

  setColumnFields()
  emits('update:visibleColumns', visibleColumns)
  emits('update:isExpanded', isShow.value)
}

const checkDupliColumnField = (columnField: string) => {
  return columnFields.findIndex((child: any) => {
    return child.find((col: any) => {
      return col.field === columnField
    })
  }) > -1
}

const setColumnFields = async () => {
  let groupIdx = 0
  let columnFieldIndex = -1;
  filteredColumns.value.forEach((colGroup, groupIdx) => {
    colspanGroupStartIndex[groupIdx] = 0
  })

  for(let group of filteredColumns.value) {
    // columnFields.push([])
    const filteredGroup = group.slice().filter((col) => {
      return !checkDupliColumnField(col.field)
    })
    if(filteredGroup.length > 0) {
      columnFieldIndex++
    }
    for(let col of filteredGroup) {
      if(!checkDupliColumnField(col.field)) {
        if(!col.grouping) {
          if(!columnFields[columnFieldIndex]) {
            columnFields[columnFieldIndex] = []
          }
          columnFields[columnFieldIndex].push(col)
        } else if(!!col.grouping && filteredColumns.value[groupIdx+1]){
          await setColumnfieldChildren(groupIdx, columnFieldIndex, col.colspan)
        }
        /*
         else {
        }
        */
      }
    }
    groupIdx++
  }

  emits('update:columnFields', columnFields)
}

const setColumnfieldChildren = async (colGroupIndex: number, inputIndex: number, childrenCount:number = 1) => {
  if(!filteredColumns.value[colGroupIndex+1]) {
    return []
  }
  const children = filteredColumns.value[colGroupIndex+1].slice().splice(colspanGroupStartIndex[colGroupIndex+1], childrenCount)
  for(let child of children) {
    if(!child.grouping) {
      if(!columnFields[inputIndex]) {
        columnFields[inputIndex] = []
      }
      if(!checkDupliColumnField(child.field)) {
        columnFields[inputIndex].push(child)
        colspanGroupStartIndex[colGroupIndex + 1] += 1
      }
    } else {
      await setColumnfieldChildren(colGroupIndex + 1, inputIndex, child.colspan)
    }
  }
}

setVisibleColumns()
watchEffect(async () => {
  rowData.value = props.rows.slice()
  setRowspanColumns()
})

const selectAll = ref<boolean>(false) // rows 전체 체크
const selectedRow = ref<any[]>([]) // 선택된 rows의 index
const selectedRows = toRef(props, 'selectedRows') // 부모에서 넘겨진 선택된 rows
const selected = ref<any>([]) // 선택된 rows (model value)

const selectAllRows = (value, event) => {
  if (props.selection === 'single') return

  if (selectAll.value) {
    selectedRow.value = rowData.value.map((row, rowIdx) => {
      return rowIdx
    })
  } else {
    selectedRow.value = []
  }

  emits('selectAll')
}

const onSelect = (row: any) => {
  emits('select', row)
}

const onRowClick = (event: Event, row: any, rowIndex: Number, groupIdx: Number, colIndex: Number) => {
  row.colIndex = colIndex
  row.groupIdx = groupIdx
  if (props.isRowClick && (event.target.nodeName === 'TD' || event.target.nodeName === 'DIV' || event.target.nodeName === 'SPAN')) {
    selectedRow.value = [rowIndex]
    emits('rowClick', row)
  } else {
    selectedRow.value = [rowIndex]
    emits('rowClick', row)
  }
}

/*** Column 포멧팅 추가 */
const _formatting = (row: any, col: Columns) => {
  const value: string = row[col.field + '']
  if (col.type) {
    // return tableFn.formatCell(value, col.type)
    return value
  } else {
    if (typeof col.format === 'function') {
      return col.format(value, row)
    } else {
      return value
    }
  }
}

watch(
  selectedRow,
  () => {
    if (props.selection === 'single' && selectedRow.value.length > 1) {
      selectedRow.value.splice(0, selectedRow.value.length - 1)
      return
    }

    selected.value = selectedRow.value.map((rowIdx) => {
      return rowData.value[rowIdx]
    })

    emits('update:selected', selected.value)
  },
  { deep: true },
)

const onShowColumns = () => {
  isShow.value = !isShow.value
  setVisibleColumns()
}

const scrollUp = () => {
  tableRef.value.$el.scrollTo(0, 0)
}

const showScrollIcon = ref(false)
const onScroll = (evnt: any) => {
  if(props.hideScrollUp) {
    return
  }
  // 01-20 테이블 스크롤버튼 사용안함
  // showScrollIcon.value = evnt.target.scrollTop === 0 ? false : true
}

watch(selectedRows, () => {
  selectedRow.value = selectedRows.value
})

defineExpose({
  selected,
})

/**
 * fixed column이 있는 경우 테이블 레이아웃 고정
 * table-layout의 경우 열 너비가 자동으로 지정되지 않음 -> 현재 기본 100px로 template영역에 지정됨
 * fixed column을 사용할 경우 column object내에 { sticky: true, width: ??px } 기입 필수
 * **/

const sortFn = (column: Object) => {
  // 기존 정렬 상태
  const originSort = sortData.sortColumn
  const originDirection = sortData.sortDirection

  sortData.sortColumn = originSort === column.name ? (sortData.sortDirection === 'desc' ? '' : column.name) : column.name
  if (originSort === column.name) {
    if (originDirection === 'asc') {
      sortData.sortDirection = 'desc'
    } else if (originDirection === 'desc') {
      sortData.sortDirection = ''
    }
  } else {
    sortData.sortDirection = 'asc'
  }

  if (sortData.sortDirection === '') {
    rowData.value = props.rows.slice()
  } else {
    rowData.value = rowData.value.sort((a, b) => {
      if (sortData.sortDirection === 'asc') {
        return a[sortData.sortColumn] > b[sortData.sortColumn] ? 1 : a[sortData.sortColumn] < b[sortData.sortColumn] ? -1 : 0
      } else {
        return a[sortData.sortColumn] < b[sortData.sortColumn] ? 1 : a[sortData.sortColumn] > b[sortData.sortColumn] ? -1 : 0
      }
    })
  }

  setRowspanColumns()
}

</script>

<style lang="scss" scoped>
$bg-gray1: #c6c6c6;
$bluePurple-light: #5428e3;
.fixed-table:deep() {
  table {
    table-layout: fixed;
    border-collapse: collapse;
  }
}

// grouping header
.sticky-header-table,
.my-sticky-header-column-table {
  table {
    border-collapse: separate;
    thead {
      // position: sticky;
      // z-index: 2;
      // top: 0;
    }
    tr {
      &.frozen {
        position: sticky;
        z-index: 1;
        background-color: $bg-gray1;
      }
      th.sticky,
      td.sticky {
        position: sticky;
        z-index: 1;
        // border-left: 0;
        &:last-child {
          border-right-color: $bluePurple-light;
          box-shadow: 3px 0 5px 0 rgba(0, 0, 0, 0.07);
        }
      }
      &.odd {
        th.sticky,
        td.sticky,
        td {
          background-color: $bg-gray1;
        }
      }
      th.sticky {
        background-color: $bg-gray1;
      }
    }
  }
  .sticky.last-sticky {
    border-right-color: $bluePurple-light;
    box-shadow: 3px 0 5px 0 rgba(0, 0, 0, 0.07);
  }
}
</style>
