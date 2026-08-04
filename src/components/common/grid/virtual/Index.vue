<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

// ===================================================
// 🧩 Components
// ===================================================
import { RecycleScroller } from 'vue-virtual-scroller';

// ===================================================
// 📥 Props / Emits
// ===================================================
interface column {
  key: string;
  title?: string;
  width?: string;
  height?: string;
  edit?: boolean;
  sort?: boolean;
  sticky?: boolean;
  colspan?: number;
  rowspan?: number;
  align?: 'left' | 'center' | 'right';
  // visible?: boolean
  // type?:string
  // left?: string
}
const props = withDefaults(
  defineProps<{
    headerType?: 'depth' | 'multi';
    columns: column[][];
    rows?: Record<string, any>[];

    isLoading?: boolean;
    keyField?: string;
    stickyHeader?: boolean;

    showSequence?: boolean;
    selection?: 'none' | 'single' | 'multi'; // check selection
    selectMode?: 'cell' | 'row' | 'column'; // row selection  // TODO:: cell, column selectmode
    defaultSelectRow?: number;

    contextMenu?: any[];
    // [
    //   { type: 'item', label: 'a', disable: true, onClick: function(rows: any[]) { console.log(rows) }},
    //   { type: 'divider' },
    //   { type: 'item', label: 'b', disable: false },
    //   { type: 'item', label: 'c', disable: false }
    // ]

    perPage?: number;

    noDataMessage?: string;

    defaultColWidth?: number;
    defaultRowHeight?: number;
    dataRowMerge?: boolean;
    highlightRepeat?: number;
  }>(),
  {
    headerType: 'multi',
    rows: [],
    isLoading: false,
    keyField: '',
    showSequence: false,
    selection: 'none',
    stickyHeader: false,
    perPage: 50,
    selectMode: 'row',
    noDataMessage: '조회된 결과가 없습니다.',
    defaultColWidth: 80,
    defaultRowHeight: 36,
    dataRowMerge: false,
    highlightRepeat: 0,
  }
);
const emits = defineEmits(['onClickRow', 'load']);

// ===================================================
// 📦 State
// ===================================================
const sheetAreaEl = ref<Element | null>(null);
const RecycleScrollerEl = ref();

const renderedWrapper = ref<boolean>(false);
let resizeObserver: any = null;
const dimensions = ref({ width: 0, height: 0 });

const waitForLoad = ref<boolean>(false);
// 선택한 row
const selectedRowModel = defineModel<string[]>('selected', { default: [] });
// 선택한 row index
const selectedRowIdxs = ref<string[]>([]);
// 선택한 cell column index (편집모드용)
const selectedColKey = ref<null | string>(null);

// row 선택 핸들러
const rowSelectHandler = ref<any>(null);

// 체크된 rows 정보
const allChecked = defineModel<boolean>('allChecked', { default: false });
const lastCheckedIndex = ref<number | null>(null); // 마지막 체크 row index

// cell 수정모드
const editMode = ref<boolean>(false);

// sorting 정렬
const sort = ref<any>({
  field: '',
  order: '',
});

// 우클릭메뉴 context menu
const visibleContextMenu = ref<boolean>(false)
const visibleContextMenuOffset = ref<number[]>([0, 0])

// ===================================================
// 🧮 Computed
// ===================================================
const extend = computed(() => {
  return dimensions.value.width > Number(rowWidth.value?.replace(/[^0-9]/g, ''));
});

const columnFields = computed(() => {
  if (props.headerType === 'multi') return [];

  return props.columns[0].map((column: any, columnIdx: number) => {
    return props.columns
      .map((row: any, rowIndex: number) => {
        return props.columns[rowIndex][columnIdx];
      })
      .filter((column: any) => column.key)
      .pop();
  });
});

const keyField = computed(() => {
  if (props.keyField) {
    return props.keyField;
  } else {
    return props.columns[0][0].key;
  }
});
const rowWidth = computed<string>(() => {
  let ww = 0;
  if (props.selection !== 'none') {
    ww += 40;
  }
  if (props.showSequence) {
    ww += 40;
  }
  return (
    (props.columns[0].reduce((acc: number, cur: any) => {
      return acc + Number(String(cur.width || props.defaultColWidth).replace(/[^0-9]/g, '') || '0');
    }, 0) || 0) +
    ww +
    'px'
  );
});
const rowCount = computed(() => {
  return props.rows?.length || 0;
});

const visibleBodyData = computed<any[]>(() => {
  const rows = props.rows.slice()

  if (sort.value.field && sort.value.order) {
    if (sort.value.order === 'asc') {
      return rows.sort((a: any, b: any) => {
        return a[sort.value.field] > b[sort.value.field] ? 1 : -1;
      });
    } else {
      return rows.sort((a: any, b: any) => {
        return a[sort.value.field] > b[sort.value.field] ? -1 : 1;
      });
    }
  }
  return rows;
});

// ===================================================
// 👀 Watchers
// ===================================================
watch(selectedRowModel, value => {
  if (!value) {
    selectedRowIdxs.value = [];
  }
  if (value && value.length === undefined) {
    value = [value];
  }

  selectedRowIdxs.value =
    value?.map((row: any) => {
      return (visibleBodyData.value.find((originRow: any) => {
        return originRow[keyField.value] === row[keyField.value];
      }) || {})[keyField.value];
    }) || [];
});
watch(allChecked, value => {
  if (value) {
    selectedRowIdxs.value = visibleBodyData.value.map((row: any) => {
      return row[keyField.value];
    });
  } else if (selectedRowIdxs.value.length === visibleBodyData.value.length) {
    selectedRowIdxs.value = [];
  }
  updateSelectedRowModel();
});
watch(() => visibleBodyData.value.length, async(value, oldValue) => {
  if(value < 1) {
    selectedRowModel.value = []
  } else if (value > 0 && !oldValue && (selectedRowModel.value?.length || 0) < 1) {
    selectedRowModel.value = []
    if(typeof props.defaultSelectRow === 'number') {
      selectedRowModel.value = [visibleBodyData.value[0] ? visibleBodyData.value[0] : []]
    }
  }
}, { deep: true })

watch(
  () => rowCount.value,
  (newCnt: number, oldCnt: number | undefined = 0) => {
    if (newCnt >= oldCnt + props.perPage && waitForLoad.value) {
      // infinity scroll
      waitForLoad.value = false;

      setScrollPosition(oldCnt);
    } else if (newCnt === oldCnt + 1) {
      // 단건 추가 (실시간 데이터 반영 등)
      setScrollPosition(RecycleScrollerEl.value?.$_startIndex || 0);
    }
  },
  { immediate: false, deep: true }
);
// ===================================================
// ⚙️ Methods
// ===================================================
const setViewportSize = () => {
  if (
    RecycleScrollerEl.value?.$el?.querySelector('.vue-recycle-scroller__item-wrapper') &&
    !extend.value
  ) {
    RecycleScrollerEl.value.$el.querySelector('.vue-recycle-scroller__item-wrapper').style.width =
      rowWidth.value;
  } else {
    RecycleScrollerEl.value.$el.querySelector('.vue-recycle-scroller__item-wrapper').style.width =
      'inherit';
  }

  if (RecycleScrollerEl.value?.$el?.querySelector('.scroller')) {
    RecycleScrollerEl.value.$el.querySelector('.scroller').style.width =
      Number(String(rowWidth.value || '').replace(/[^0-9]/g, '') || '0') + 10 + 'px';
  }
};
const updateVisibleItems = () => {
  RecycleScrollerEl.value?.updateVisibleItems();
};
const setScrollPosition = (idx: number = 0) => {
  updateVisibleItems();
  RecycleScrollerEl.value?.scrollToItem(idx + 1);
  RecycleScrollerEl.value?.scrollToItem(idx);
  // RecycleScrollerEl.value?.scrollToPosition(0)
};
const onResize = (entries: any) => {
  const [entry] = entries;
  dimensions.value.width = entry.contentRect.width;
  dimensions.value.height = entry.contentRect.height;

  setViewportSize();
};
const getColumnStyle = (
  column: any,
  columns: any = [],
  colIndex: number = 0,
  rowIndex: number = 0
) => {
  let width = '';
  let height = '';
  let sticky = '';

  let display = '';
  if (column.visible === false) {
    display = 'display: none;';
  } else {
    width = `${String(column.width || props.defaultColWidth).replace(/[^0-9]/g, '') + 'px'};`;
    height = `height: ${props.defaultRowHeight * (column.type === 'action' ? column.rowspan || 1 : 1)}px;`;
    if (column.colspan && column.colspan > 1) {
      width =
        columns.slice(colIndex, colIndex + column.colspan).reduce((acc: number, cur: any) => {
          return (
            acc + Number(String(cur.width || props.defaultColWidth).replace(/[^0-9]/g, '') || '0')
          );
        }, 0) + 'px';

      // for(let i=colIndex + 1; i<colIndex + column.colspan; i++) {
      //     props.columns[rowIndex][i].visible = false
      // }
    }

    if (!column.fixedWidth && extend.value) {
      width = `flex-grow: 1; flex-shrink: 1; flex-basis: ${width}; min-width: ${width};`;
    } else {
      width = `width: ${width}; min-width: ${width};`;
    }


    if (column.sticky || (column.type === 'action' && hasStickyColumn.value)) {
      const left = columns
        .slice(0, colIndex)
        .filter((col: any) => {
          return col.sticky;
        })
        .reduce((acc: number, cur: any) => {
          return (
            acc + Number(String(cur.width || props.defaultColWidth).replace(/[^0-9]/g, '') || '0')
          );
        }, 0) + (props.selection !== 'none' && column.name !== 'check' ? 40 : 0) +  + (props.showSequence && column.name !== 'sequence' ? 40 : 0);

      sticky = `position: sticky; left: ${left > 0 ? left + 'px' : left}; top: 0; z-index:${column.rowspan > 1 ? 11 : 10}; ${column.rowspan > 1 ? 'overflow:visible' : ''};`;
    }
  }

  return `${width} ${height} ${sticky} ${display}`;
};
const hasStickyColumn = computed(() => {
  return props.columns.findIndex((columnRow: any) => {
    return columnRow.find((col: any) => {
      return !!col.sticky
    })
  }) > -1
})
const getRowspanStyle = (column: any) => {
  if (column.rowspan && column.rowspan > 1) {
    return `position: absolute; top: 0; left: 0; z-index: 99; height: ${props.defaultRowHeight * (column.rowspan || 1) - 1}px; background: inherit`;
  }
  return;
};
const isSelectedRow = (keyFieldValue: string) => {
  return selectedRowIdxs.value.includes(keyFieldValue);
};
const isSelectedCell = (rowIdx: number, colKey: string, keyFieldValue: string) => {
  return selectedRowIdxs.value.includes(keyFieldValue) && selectedColKey.value === colKey;
};
const selectMultiRows = (start: number, end: number, selected: boolean) => {
  for (let i = start; i <= end; i++) {
    const keyValue = visibleBodyData.value[i][keyField.value];

    if (selected) {
      if (!selectedRowIdxs.value.includes(keyValue)) {
        selectedRowIdxs.value.push(keyValue);
      }
    } else {
      if (selectedRowIdxs.value.includes(keyValue)) {
        selectedRowIdxs.value.splice(selectedRowIdxs.value.indexOf(keyValue), 1);
      }
    }
  }
};
const updateSelectedRowModel = () => {
  selectedRowModel.value = selectedRowIdxs.value.map((key: string) => {
    return visibleBodyData.value.find((row: any) => {
      return row[keyField.value] === key;
    });
  });
};

defineExpose({
  updateVisibleItems,
  setScrollPosition,
});
// ===================================================
// 🛠️ Actions
// ===================================================
const handleScroll = (evnt: Event) => {
  const el = evnt.target || {
    offsetHeight: 0,
    scrollTop: 0,
    scrollHeight: 0,
  };
  if (
    !props.isLoading &&
    !waitForLoad.value &&
    el.offsetHeight + el.scrollTop >= el.scrollHeight - props.defaultRowHeight * 5
  ) {
    // 스크롤이 끝에 도달했을 때의 로직 (무한 스크롤 트리거)
    waitForLoad.value = true;
    emits('load');
  }
};

const hasStartedKeyMouseEvntOnRow = ref<string>('');
const hasStartedMouseEvntOnRow = ref<number>(-1);
const onMousedownRow = (evnt: MouseEvent, key: string, columnField: string) => {
  hasStartedKeyMouseEvntOnRow.value = key;
  hasStartedMouseEvntOnRow.value = visibleBodyData.value.findIndex((row: any) => {
    return row[keyField.value] === key;
  });
};
const onMouseupRow = (evnt: MouseEvent, key: string, columnField: string) => {
  if (hasStartedMouseEvntOnRow.value >= 0) {
    rowSelectHandler.value = setTimeout(() => {
      editMode.value = false;
      let keyValue = key;
      const rowIdx = visibleBodyData.value.findIndex((row: any) => {
        return row[keyField.value] === key;
      });
      if (hasStartedMouseEvntOnRow.value >= 0 && hasStartedKeyMouseEvntOnRow.value !== key) {
        // 다건 드래그
        selectMultiRows(
          hasStartedMouseEvntOnRow.value <= rowIdx ? hasStartedMouseEvntOnRow.value : rowIdx,
          hasStartedMouseEvntOnRow.value > rowIdx ? hasStartedMouseEvntOnRow.value : rowIdx,
          !selectedRowIdxs.value.includes(key)
        );
      } else if (evnt.shiftKey && lastCheckedIndex.value !== null) {
        // 다건 shift key
        keyValue = visibleBodyData.value[lastCheckedIndex.value][keyField.value];
        selectMultiRows(
          lastCheckedIndex.value <= rowIdx ? lastCheckedIndex.value : rowIdx,
          lastCheckedIndex.value > rowIdx ? lastCheckedIndex.value : rowIdx,
          selectedRowIdxs.value.includes(keyValue)
        );
      } else if (evnt.ctrlKey) {
        // 다건 ctrl key
        selectedRowIdxs.value.push(keyValue);
      } else if (props.selection === 'multi') {
        if(evnt.button === 2) {
          // 우클릭 -> 선택만 가능. 우클릭으로 선택해제 불가
          if(!selectedRowIdxs.value.includes(keyValue)) {
            selectedRowIdxs.value.push(keyValue);
          }
        }
        else if (selectedRowIdxs.value.includes(keyValue)) {
          // 단건 선택해제
          selectedRowIdxs.value.splice(selectedRowIdxs.value.indexOf(keyValue), 1);
        } else {
          // 단건 선택
          selectedRowIdxs.value.push(keyValue);
        }
      } else {
        selectedRowIdxs.value = [keyValue];
      }
      updateSelectedRowModel();

      selectedColKey.value = columnField;
      lastCheckedIndex.value = rowIdx;

      hasStartedMouseEvntOnRow.value = -1;
    }, 0);
  }
};
const onContextmenu = (evnt: MouseEvent, key: string, columnField: string) => {
  if(!props.contextMenu || props.contextMenu?.length < 1) return
  evnt.preventDefault()

  // onMouseupRow(evnt, key, columnField)
  setTimeout(() => {
    visibleContextMenu.value = true

    const sheetAreaRect = sheetAreaEl.value?.getBoundingClientRect() || {x: 0, y: 0}
    visibleContextMenuOffset.value = [-(evnt.x - sheetAreaRect.x), (evnt.y - sheetAreaRect.y - (props.columns.length * props.defaultRowHeight))]
  }, 0);

}

const onDblClickCell = (
  evnt: Event,
  editable: boolean = false,
  rowIdx: number,
  columnField: string
) => {
  if (rowSelectHandler.value) {
    clearTimeout(rowSelectHandler.value);
    rowSelectHandler.value = null;
  }

  selectedColKey.value = columnField;

  if (editable) {
    editMode.value = true;
    nextTick(() => {
      sheetAreaEl.value?.querySelector('[name=input-edit]')?.focus();
    });
  }
};

const onClickHeader = (evnt: Event, column: column) => {
  if (column.sort) {
    if (sort.value.field === column.key) {
      if (!sort.value.order) {
        sort.value.order = 'asc';
      } else if (sort.value.order === 'asc') {
        sort.value.order = 'desc';
      } else {
        sort.value.field = '';
        sort.value.order = '';
      }
    } else {
      sort.value.field = column.key;
      sort.value.order = 'asc';
    }
  }
};

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onMounted(() => {
  renderedWrapper.value = true;
  resizeObserver = new ResizeObserver(onResize);

  nextTick(() => {
    if (sheetAreaEl.value) {
      resizeObserver.observe(sheetAreaEl.value);
    }
  });
});
onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<template>
  <div ref="sheetAreaEl" class="sheetArea">
    <RecycleScroller
      v-if="renderedWrapper"
      ref="RecycleScrollerEl"
      class="scroller"
      :class="{
        'multi-header': true,
        'sticky-header': stickyHeader,
        extend: extend,
      }"
      :items="visibleBodyData"
      :item-size="defaultRowHeight * (headerType === 'multi' ? columns.length : 1)"
      item-class="body-row-wrapper"
      :key-field="keyField"
      @visible="setViewportSize"
      @scroll.native="handleScroll"
    >
      <template #before>
        <div class="multi-col-header" :style="`width: ${extend ? '100%' : rowWidth}`">
          <div
            v-for="(headerRow, headerRowIndex) in columns"
            :key="`header-row-${headerRowIndex}`"
            class="row"
          >
            <div
              v-if="selection !== 'none'"
              class="header-cell-wrapper header-action-cell-wrapper"
              :style="getColumnStyle({ type: 'action', name: 'check', width: '40px', fixedWidth: true })"
            >
              <div
                v-if="headerRowIndex === 0"
                class="header-cell header-action-cell"
                :style="
                  getColumnStyle({
                    type: 'action',
                    name: 'check',
                    width: '40px',
                    rowspan: columns.length,
                    fixedWidth: true,
                  })
                "
              >
                <slot :name="`header-cell-selection`" :sequence="headerRowIndex">
                  <q-checkbox
                    v-if="selection === 'multi'"
                    v-model="allChecked"
                    :label="''"
                    class="checkbox-wrap"
                    @update:model-value="updateSelectedRowModel"
                  />
                </slot>
              </div>
            </div>
            <div
              v-if="showSequence"
              class="header-cell-wrapper header-action-cell-wrapper"
              :style="getColumnStyle({ type: 'action', name: 'sequence', width: '40px', fixedWidth: true })"
            >
              <div
                v-if="headerRowIndex === 0"
                class="header-cell header-action-cell"
                :style="
                  getColumnStyle({
                    type: 'action',
                    name: 'sequence',
                    width: '40px',
                    rowspan: columns.length,
                    fixedWidth: true,
                  })
                "
              >
                <slot :name="`header-cell-sequence`" :sequence="headerRowIndex"> # </slot>
              </div>
            </div>
            <div
              v-for="(headerCol, headerColIndex) in headerRow"
              :key="`header-row-${headerRowIndex}-${headerColIndex}`"
              :style="getColumnStyle(headerCol, headerRow, headerColIndex, headerRowIndex)"
              @click="evnt => onClickHeader(evnt, headerCol)"
              class="header-cell-wrapper"
            >
              <div class="header-cell" :style="getRowspanStyle(headerCol)">
                <slot :name="`header-cell-${headerCol.key}`" :column="headerCol">
                  {{ headerCol?.title }}
                </slot>
                <span v-if="sort.field === headerCol.key" class="sort">
                  <template v-if="sort.order === 'asc'"><q-icon name="arrow_drop_up" /></template>
                  <template v-else><q-icon name="arrow_drop_down" /></template>
                </span>
              </div>
            </div>
          </div>
        </div>
        <q-menu v-if="contextMenu" v-model="visibleContextMenu" style class="bg-purple text-white" :offset="visibleContextMenuOffset" self="top left">
          <q-list>
            <template v-for="(menu, index) in contextMenu">
              <q-item
                v-if="menu.type === 'item'"
                :key="index"
                :clickable="!menu.disable"
                :disable="menu.disable"
                v-close-popup
                @click="() => menu.onClick ? menu.onClick(selectedRowModel) : null"
              >
                <q-item-section v-html="menu.label" />
              </q-item>
              <q-separator v-else-if="menu.type === 'divider'" :key="`divide-${index}`" dark />
            </template>
          </q-list>
        </q-menu>
      </template>
      <template #empty>
        <div
          v-if="visibleBodyData.length < 1"
          class="empty"
        >
        </div>
      </template>
      <template v-slot="{ item: rowData, index: rowIdx, active }">
        <div
          :class="`body-row body-row-multi ${isSelectedRow(rowData[keyField]) ? 'active' : ''}`"
          :idx="rowData[keyField]"
          :style="`width: ${extend ? '100%' : rowWidth}`"
        >
          <template v-if="headerType === 'multi'">
            <div
              v-for="(headerRow, headerRowIndex) in columns"
              :key="`header-row-${headerRowIndex}`"
              class="row"
            >
              <div
                v-if="selection !== 'none'"
                :class="`body-row-col cell`"
                :style="getColumnStyle({ type: 'action', name: 'check', width: '40px', fixedWidth: true })"
              >
                <div
                  v-if="headerRowIndex === 0"
                  :style="
                    getColumnStyle({
                      type: 'action',
                      name: 'check',
                      width: '40px',
                      rowspan: columns.length,
                      fixedWidth: true,
                    }) + 'position: absolute; top: 0; left: 0; z-index: 1; display: flex; align-items: center; justify-content: center;'
                  "
                >
                  <slot
                    :name="`body-cell-selection`"
                    :selected="selectedRowIdxs.find(key => key === rowData[keyField])"
                    :row="rowData"
                  >
                    <q-checkbox
                      :val="rowData[keyField]"
                      :label="''"
                      v-model="selectedRowIdxs"
                      class="checkbox-wrap"
                      @update:model-value="updateSelectedRowModel"
                    />
                  </slot>
                </div>
              </div>
              <div
                v-if="showSequence"
                :class="`body-row-col cell`"
                :style="getColumnStyle({ type: 'action', name: 'sequence', width: '40px', fixedWidth: true })"
                style="position: relative; overflow: visible"
              >
                <div
                  v-if="headerRowIndex === 0"
                  :style="
                    getColumnStyle({
                      type: 'action',
                      name: 'sequence',
                      width: '40px',
                      rowspan: columns.length,
                      fixedWidth: true,
                    }) +
                    'position: absolute; top: 0; left: 0; z-index: 1; display: flex; align-items: center; justify-content: center;'
                  "
                >
                  <slot :name="`body-cell-sequence`" :row="rowData" :sequence="rowIdx">
                    {{ rowIdx + 1 }}
                  </slot>
                </div>
              </div>
              <div
                v-for="(headerCol, headerColIndex) in headerRow"
                :key="`header-row-${headerRowIndex}-${headerColIndex}`"
                :class="`body-row-col cell ${headerCol.align ? 'text-'+headerCol.align : ''}`"
                :style="getColumnStyle(headerCol, headerRow, headerColIndex, headerRowIndex)"
                @dblclick="evnt => onDblClickCell(evnt, headerCol.edit, rowIdx, headerCol.key)"
                @mousedown="evnt => onMousedownRow(evnt, rowData[keyField], headerCol.key)"
                @mouseup="evnt => onMouseupRow(evnt, rowData[keyField], headerCol.key)"
                @contextmenu="evnt => onContextmenu(evnt, rowData[keyField], headerCol.key)"
              >
                <div :style="getRowspanStyle(headerCol)" >
                  <slot
                    :name="`body-cell-${headerCol.key}`"
                    :value="rowData[headerCol.key]"
                    :column="headerCol"
                    :row="rowData"
                    :edit-mode="
                      editMode && isSelectedCell(rowIdx, headerCol.key, rowData[keyField])
                    "
                  >
                    <input
                      v-if="editMode && isSelectedCell(rowIdx, headerCol.key, rowData[keyField])"
                      name="input-edit"
                      v-model="rowData[headerCol.key]"
                      @blur="editMode = false"
                    />
                    <template v-else>{{ headerCol?.key ? rowData[headerCol.key] : '' }}</template>
                  </slot>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="row">
              <div
                v-if="selection !== 'none'"
                class="body-row-col cell"
                :style="getColumnStyle({ type: 'action', name: 'check', width: '40px', fixedWidth: true })"
                style="position: relative; overflow: visible"
              >
                <div
                  :style="
                    getColumnStyle({ type: 'action', name: 'check', width: '40px', fixedWidth: true }) +
                    'position: absolute; top: 0; left: 0; z-index: 1; display: flex; align-items: center; justify-content: center;'
                  "
                >
                  <slot
                    :name="`body-cell-selection`"
                    :selected="selectedRowIdxs.find(idx => idx === rowIdx)"
                    :row="rowData"
                  >
                    <q-checkbox
                      :val="rowIdx"
                      :label="''"
                      v-model="selectedRowIdxs"
                      class="checkbox-wrap"
                      @update:model-value="updateSelectedRowModel"
                    />
                  </slot>
                </div>
              </div>
              <div
                v-if="showSequence"
                class="body-row-col cell"
                :style="getColumnStyle({ type: 'action', name: 'sequence', width: '40px', fixedWidth: true })"
                style="position: relative; overflow: visible"
              >
                <div
                  v-if="headerRowIndex === 0"
                  :style="
                    getColumnStyle({ type: 'action', name: 'sequence', width: '40px', fixedWidth: true }) +
                    'position: absolute; top: 0; left: 0; z-index: 1; display: flex; align-items: center; justify-content: center;'
                  "
                >
                  <slot :name="`body-cell-sequence`" :row="rowData" :sequence="rowIdx">
                    {{ rowIdx + 1 }}
                  </slot>
                </div>
              </div>
              <div
                v-for="(headerCol, headerColIndex) in columnFields"
                :key="`header-row-${1}-${headerColIndex}`"
                class="body-row-col cell"
                :style="getColumnStyle(headerCol, columnFields, headerColIndex, 0)"
                @dblclick="evnt => onDblClickCell(evnt, headerCol.edit, rowIdx, headerCol.key)"
                @mousedown="evnt => onMousedownRow(evnt, rowData[keyField], headerCol.key)"
                @mouseup="evnt => onMouseupRow(evnt, rowData[keyField], headerCol.key)"
                @contextmenu="evnt => onContextmenu(evnt, rowData[keyField], headerCol.key)"
              >
                <div :style="getRowspanStyle(headerCol)">
                  <slot
                    :name="`body-cell-${headerCol.key}`"
                    :value="rowData[headerCol.key]"
                    :column="headerCol"
                    :row="rowData"
                    :edit-mode="
                      editMode && isSelectedCell(rowIdx, headerCol.key, rowData[keyField])
                    "
                  >
                    <input
                      v-if="editMode && isSelectedCell(rowIdx, headerCol.key, rowData[keyField])"
                      name="input-edit"
                      v-model="rowData[headerCol.key]"
                      @blur="editMode = false"
                    />
                    <template v-else>{{ headerCol?.key ? rowData[headerCol.key] : '' }}</template>
                  </slot>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
      <template #after>
      </template>
    </RecycleScroller>
    <!-- 이 요소를 관찰하여 무한 스크롤 트리거로 사용 -->
    <div v-if="isLoading" class="loading-wrap">
      <div>
        <q-spinner color="primary" size="3em" />
      </div>
    </div>
    <div v-if="visibleBodyData.length < 1" class="empty-wrap">
        <div class="empty-text">{{ noDataMessage }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/css/components/grid/virtual' as *;

.sheetArea {
}
</style>
