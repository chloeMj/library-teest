<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import { formatUnitValue } from "@/utils/formatUnit";
import dayjs from "dayjs";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

type AlignedData = uPlot.AlignedData;
type ChartType = "line" | "area" | "bar";
type LegendStatRow = {
  label?: string;
  first?: number | null;
  last?: number | null;
  min?: number | null;
  max?: number | null;
  mean?: number | null;
};

// node-exporter(panel unit)에서 들어올 수 있는 표시 단위 목록
const NODE_EXPORTER_UNITS = [
  "bps",
  "Bps",
  "bytes",
  "celsius",
  "decbytes",
  "hertz",
  "iops",
  "none",
  "percent",
  "percentunit",
  "pps",
  "s",
  "short",
] as const;
type NodeExporterUnit = (typeof NODE_EXPORTER_UNITS)[number];

const NODE_EXPORTER_UNIT_SET = new Set<string>(NODE_EXPORTER_UNITS);

defineOptions({
  name: "UplotChart",
});

const props = withDefaults(
  defineProps<{
    data: AlignedData;
    rawData?: AlignedData;
    series?: uPlot.Series[];
    options?: Partial<uPlot.Options>;
    showTitle?: boolean;
    title?: string;
    height?: number;
    chartType?: ChartType;
    xLabel?: string;
    showLegend?: boolean;
    colors?: string[];
    baseUnit?: string;
    displayUnit?: string;
    legendStats?: LegendStatRow[];
  }>(),
  {
    showTitle: true,
    series: () => [],
    height: 260,
    chartType: "line",
    xLabel: "time",
    showLegend: true,
    baseUnit: "number",
    displayUnit: "auto",
  },
);

// ===================================================
// 📦 State
// ===================================================
const LIST_LEGEND_VISIBLE_LINES = 3;
const TABLE_LEGEND_VISIBLE_LINES_WITH_HEADER = 4;
const LEGEND_ROW_HEIGHT_PX = 28;
const LEGEND_MARGIN_TOP_REM = 2; // 1rem = 8px
const MIN_PLOT_HEIGHT_PX = 120;

const wrapperEl = ref<HTMLDivElement | null>(null);
const el = ref<HTMLDivElement | null>(null);
const legendListEl = ref<HTMLDivElement | null>(null);
const legendTableEl = ref<HTMLDivElement | null>(null);
const plotHeightPx = ref(props.height ?? 260);
let chart: uPlot | null = null;
let resizeObserver: ResizeObserver | null = null;
const activeSeriesIdx = ref<number | null>(null);  const colorPalette = ref<string[]>([
    "#7EB26D",
    "#EAB839",
    "#1F78C1",
    "#E24D42",
    "#BA43A9",
    "#6ED0E0",
    "#EF843C",
    "#705DA0",
    "#508642",
    "#CCA300",
    "#447EBC",
    "#C15C17",
    "#890F02",
    "#0A437C",
    "#6D1F62",
    "#584477",
    "#629E51",
    "#E5AC0E",
    "#64B0C8",
    "#E0752D",
    "#BF1B00",
    "#0A50A1",
    "#962D82",
    "#614D93",
    "#3F6833",
    "#B28F14",
    "#3B7AA0",
    "#B95F2A",
    "#7A2E6B",
    "#5F8FAF",
    "#DFAF66",
    "#D0815E",
    "#9A7BB5",
    "#6E9E8A",
    "#C9A94D",
    "#7A6A9C",
    "#5195CE",
    "#F9934E",
    "#EA6460",
    "#806EB7",
    "#65C5DB",
    "#D683CE",
    "#8FBECF",
    "#9AC48A",
    "#F2C96D",
    "#B7DBAB",
    "#F4D598",
    "#70DBED",
    "#F9BA8F",
    "#F29191",
    "#82B5D8",
    "#E5A8E2",
    "#AEA2E0",
    "#A6C8B8",
    "#F1D9A6",
    "#8BC9E8",
    "#F4B183",
    "#B18CCF",
    "#B3D1C2",
    "#E3B7A0",
  ])
const palette = computed(() => (props.colors?.length ? props.colors : colorPalette));
const tooltip = ref<{
  show: boolean;
  left: number;
  top: number;
  xLabel: string;
  rows: { label: string; color: string; value: string }[];
}>({
  show: false,
  left: 0,
  top: 0,
  xLabel: "",
  rows: [],
});

// ===================================================
// 🧮 Computed
// ===================================================
const resolvedSeries = computed(() => buildSeriesByType());
const baseVisibility = computed(() => resolvedSeries.value.map((s) => s.show !== false));

const legendItems = computed(() =>
  resolvedSeries.value.map((s, idx) => {
    const color =
      typeof s.stroke === "string" ? s.stroke : typeof s.fill === "string" ? s.fill : "#5c6f82";
    return { label: s.label ?? `Series ${idx + 1}`, color };
  }),
);

// statistics 값이 있으면 table용 legend rows 생성=
const legendTableRows = computed(() => {
  const rows = Array.isArray(props.legendStats) ? props.legendStats : [];
  if (!rows.length) return [];

  const hasAnyValue = rows.some((row) =>
    [row?.first, row?.last, row?.min, row?.max, row?.mean].some(
      (value) => value != null && Number.isFinite(Number(value)),
    ),
  );
  if (!hasAnyValue) return [];

  return legendItems.value.map((item, idx) => {
    const row = rows[idx] ?? {};
    return {
      label: typeof row.label === "string" && row.label.length ? row.label : item.label,
      color: item.color,
      first: row.first ?? null,
      last: row.last ?? null,
      min: row.min ?? null,
      max: row.max ?? null,
      mean: row.mean ?? null,
    };
  });
});
const legendToggleEnabled = computed(() => legendItems.value.length > 1);
const maxVisibleTableDataRows = Math.max(1, TABLE_LEGEND_VISIBLE_LINES_WITH_HEADER - 1);
const legendVisibleCapPx = computed(() => {
  if (!props.showLegend) return 0;

  if (legendTableRows.value.length) {
    // table mode: header + visible data rows (up to configured cap)
    const visibleDataRows = Math.min(legendTableRows.value.length, maxVisibleTableDataRows);
    return (visibleDataRows + 1) * LEGEND_ROW_HEIGHT_PX;
  }

  if (legendItems.value.length) {
    return LIST_LEGEND_VISIBLE_LINES * LEGEND_ROW_HEIGHT_PX;
  }

  return 0;
});

// ===================================================
// ⚙️ Methods
// ===================================================
// 선 색(hex)을 area 채우기용 반투명 색(rgba)으로 변환
const addAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(0,0,0,${alpha})`;
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const isNodeExporterUnit = (unit: string): unit is NodeExporterUnit =>
  NODE_EXPORTER_UNIT_SET.has(unit);

// 입력 unit 문자열을 내부 포맷용 unit id로 정규화
const normalizeDisplayUnit = (unit?: string) => {
  const raw = (unit ?? "").trim();
  if (!raw) return "none";
  if (raw === "%") return "percent";
  if (isNodeExporterUnit(raw)) return raw;

  const lowered = raw.toLowerCase();
  const alias: Record<string, NodeExporterUnit> = {
    bps: "bps",
    bytes: "bytes",
    celsius: "celsius",
    decbytes: "decbytes",
    hertz: "hertz",
    iops: "iops",
    none: "none",
    percent: "percent",
    percentunit: "percentunit",
    pps: "pps",
    s: "s",
    short: "short",
  };
  return alias[lowered] ?? raw;
};

// y축 tick 간격을 기준으로 표시 소수 자릿수 계산
const getAxisDecimalsFromTicks = (ticks: number[]) => {
  if (!ticks.length) return undefined;

  const displayUnit = normalizeDisplayUnit(props.displayUnit);
  const transformed = ticks
    .filter((v) => Number.isFinite(v))
    .map((v) => (displayUnit === "percentunit" ? v * 100 : v))
    .sort((a, b) => a - b);

  let minGap = Number.POSITIVE_INFINITY;
  for (let i = 1; i < transformed.length; i++) {
    const gap = Math.abs(transformed[i] - transformed[i - 1]);
    if (gap > 0 && gap < minGap) minGap = gap;
  }

  if (!Number.isFinite(minGap) || minGap <= 0) return undefined;

  const decimals = Math.max(0, Math.ceil(-Math.log10(minGap)));
  return Math.min(decimals, 6);
};

// const toAxisLabelText = (raw: unknown) => {
//   if (typeof raw === "number") return formatUnitValue(raw);
//   if (typeof raw === "string" && raw.trim().length > 0) return raw;
//   return `${raw ?? ""}`;
// };

let yAxisSizeCacheKey = "";
let yAxisSizeCacheValue = 36;

// y축 라벨 길이에 따라 축 너비를 계산하고 캐시로 재사용
const getYAxisSize: uPlot.Axis.Size = (u, values, axisIdx) => {
  const labels = (Array.isArray(values) ? values : [])
    .filter((v) => v != null && `${v}`.length > 0)
    .map((v) => `${v}`);
  if (!labels.length) return 36;

  const axisFont = u.axes?.[axisIdx]?.font ?? "";
  const maxLen = labels.reduce((max, label) => Math.max(max, label.length), 0);
  const estimate = Math.ceil(maxLen * 7 + 14);
  const cacheKey = `${axisFont}|${labels.join("\u0001")}`;

  if (cacheKey === yAxisSizeCacheKey) return yAxisSizeCacheValue;

  // 라벨 폭에 여유를 조금 더하고, 너무 작거나 크지 않게 제한
  const nextSize = Math.max(40, Math.min(140, estimate));
  yAxisSizeCacheKey = cacheKey;
  yAxisSizeCacheValue = nextSize;
  return nextSize;
};

// chartType(line/area/bar)에 맞게 시리즈 기본 스타일 보정
const buildSeriesByType = () => {
  const ys = props.series ?? [];
  if (!ys.length) return ys;

  return ys.map((s, idx) => {
    const next: uPlot.Series = {
      ...s,
      stroke: s.stroke ?? palette.value[idx % palette.value.length],
    };

    if (props.chartType === "area") {
      if (next.fill == null && typeof next.stroke === "string") {
        next.fill = addAlpha(next.stroke, 0.12);
      }
      if (!next.points) next.points = { show: false };
    }

    if (props.chartType === "bar") {
      const barsBuilder = uPlot.paths?.bars;
      if (!next.paths && typeof barsBuilder === "function") {
        next.paths = barsBuilder();
      }
      if (!next.points) next.points = { show: false };
    }

    return next;
  });
};

const legendOpacity = (idx: number) =>
  activeSeriesIdx.value == null || activeSeriesIdx.value === idx ? 1 : 0.5;

// 범례 선택 상태를 실제 시리즈 show/hide 상태에 반영
const applySeriesVisibility = () => {
  if (!chart) return;
  const ySeriesCount = resolvedSeries.value.length;

  for (let i = 0; i < ySeriesCount; i++) {
    const show =
      activeSeriesIdx.value == null ? baseVisibility.value[i] : i === activeSeriesIdx.value;
    chart.setSeries(i + 1, { show });
  }
};

// 커서 위치 기준으로 tooltip 내용과 위치를 계산
const updateTooltip = (u: uPlot) => {
  const idx = u.cursor.idx;
  if (idx == null || idx < 0) {
    tooltip.value.show = false;
    return;
  }

  const xVal = u.data?.[0]?.[idx] as number | undefined;
  if (xVal == null) {
    tooltip.value.show = false;
    return;
  }

  const visibleSeriesIdxs =
    activeSeriesIdx.value != null
      ? [activeSeriesIdx.value]
      : resolvedSeries.value
          .map((_, i) => i)
          .filter((i) => (chart?.series?.[i + 1] as uPlot.Series | undefined)?.show !== false);
  const rows = visibleSeriesIdxs
    .map((seriesIdx) => {
      const s = resolvedSeries.value[seriesIdx];
      if (!s) return null;

      const chartYVal = (u.data?.[seriesIdx + 1] as (number | null | undefined)[] | undefined)?.[
        idx
      ];
      const rawYVal = (
        props.rawData?.[seriesIdx + 1] as (number | null | undefined)[] | undefined
      )?.[idx];
      const yVal = rawYVal ?? chartYVal;
      const color =
        typeof s.stroke === "string"
          ? s.stroke
          : typeof s.fill === "string"
            ? s.fill
            : palette.value[seriesIdx % palette.value.length];
      return {
        label: typeof s.label === "string" ? s.label : `Series ${seriesIdx + 1}`,
        color: String(color),
        value: formatUnitValue(Number(yVal), {}, props.displayUnit),
      };
    })
    .filter((row): row is { label: string; color: string; value: string } => row != null);

  const rootRect = el.value?.getBoundingClientRect();
  if (!rootRect) {
    tooltip.value.show = false;
    return;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const viewportPadding = 8;
  const cursorGapX = 18;
  const cursorGapY = 22;
  const cursorX = rootRect.left + (u.cursor.left ?? 0);
  const cursorY = rootRect.top + (u.cursor.top ?? 0);
  const tipWidth = 240;
  const maxTipHeight = Math.max(80, viewportHeight - viewportPadding * 2);
  const tipHeight = Math.min(32 + rows.length * 18, maxTipHeight);

  // Prefer rendering tooltip to the bottom-right of the cursor.
  let left = cursorX + cursorGapX;
  if (left + tipWidth > viewportWidth - viewportPadding) {
    left = cursorX - tipWidth - cursorGapX;
  }
  const minLeft = viewportPadding;
  const maxLeft = Math.max(minLeft, viewportWidth - tipWidth - viewportPadding);
  left = Math.min(Math.max(left, minLeft), maxLeft);

  let top = cursorY + cursorGapY;
  if (top + tipHeight > viewportHeight - viewportPadding) {
    top = cursorY - tipHeight - cursorGapY;
  }
  const minTop = viewportPadding;
  const maxTop = Math.max(minTop, viewportHeight - tipHeight - viewportPadding);
  top = Math.min(Math.max(top, minTop), maxTop);

  tooltip.value = {
    show: true,
    left,
    top,
    xLabel: dayjs(xVal * 1000).format("YYYY-MM-DD HH:mm:ss"),
    rows,
  };
};

const onLegendClick = (idx: number) => {
  if (!legendToggleEnabled.value) return;
  activeSeriesIdx.value = activeSeriesIdx.value === idx ? null : idx;
  applySeriesVisibility();
};

const getLegendMarginTopPx = () => {
  if (typeof window === "undefined") return LEGEND_MARGIN_TOP_REM * 8;

  const rootFontSize = Number.parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  );
  return LEGEND_MARGIN_TOP_REM * (Number.isFinite(rootFontSize) ? rootFontSize : 8);
};

const getPlotHeight = () => {
  const requestedHeight = props.height ?? 260;
  const wrapperHeight = wrapperEl.value?.clientHeight ?? 0;
  if (wrapperHeight <= 0) return requestedHeight;

  const legendEl = legendTableRows.value.length ? legendTableEl.value : legendListEl.value;
  const legendHeight = props.showLegend && legendEl ? legendEl.offsetHeight : 0;
  const reservedLegendHeight = legendHeight > 0 ? legendHeight + getLegendMarginTopPx() : 0;
  const maxPlotHeight = Math.max(MIN_PLOT_HEIGHT_PX, wrapperHeight - reservedLegendHeight);

  return Math.max(MIN_PLOT_HEIGHT_PX, Math.min(requestedHeight, maxPlotHeight));
};

// ===================================================
// 🛠️ Actions
// ===================================================
const buildChart = () => {
  if (!el.value) return;

  const width = el.value.clientWidth || 600;
  const height = getPlotHeight();
  plotHeightPx.value = height;
  const displayUnit = normalizeDisplayUnit(props.displayUnit);
  const defaultYScale =
    displayUnit === "percentunit"
      ? ({ auto: false, range: [0, 1] } as uPlot.Scale)
      : displayUnit === "percent"
        ? ({ auto: false, range: [0, 100] } as uPlot.Scale)
        : undefined;

  chart?.destroy();

  const ySeries = resolvedSeries.value;

  const mergedOptions: uPlot.Options = {
    ...(props.options ?? {}),
    title: props.showTitle ? (props.title ?? props.options?.title) : "",
    width,
    height,
    padding: [12, 24, 12, 12],
    // axes: x/y 축 설정 (라벨, 그리드, 포맷터)
    axes: props.options?.axes ?? [
      {
        stroke: "#93a1b0",
        grid: { stroke: "1f2a36", width: 1 },
        size: 16,
        values: (u, vals) =>
          vals.map((v) => {
            const value = v as number;
            return dayjs(value * 1000).format("HH:mm:ss");
          }),
      },
      {
        stroke: "#93a1b0",
        grid: { stroke: "1f2a36", width: 1 },
        size: getYAxisSize,
        values: (u, vals) => {
          const numericVals = vals.map((v) => Number(v)).filter((v) => Number.isFinite(v));
          const axisDecimals = getAxisDecimalsFromTicks(numericVals);
          return vals.map((v) =>
            formatUnitValue(Number(v), { decimals: axisDecimals }, props.displayUnit),
          );
        },
      },
    ],
    // scales: 좌표계 정의 (x를 time 축으로 처리)
    scales: {
      x: { time: true },
      ...(defaultYScale ? { y: defaultYScale } : {}),
      ...props.options?.scales,
    },
    // cursor: 포커스/드래그 동작
    cursor: {
      focus: { prox: 32 },
      drag: { x: true, y: false },
      ...props.options?.cursor,
    },
    hooks: {
      ...(props.options?.hooks ?? {}),
      setCursor: [...(props.options?.hooks?.setCursor ?? []), (u) => updateTooltip(u)],
    },
    // legend: 범례 표시 설정 (기본 legend는 숨기고 커스텀 legend 사용)
    legend: {
      live: true,
      ...(props.options?.legend ?? {}),
      show: false,
    },
    // series: x-axis placeholder(legend 숨김) + 외부에서 넘긴 y-series 나열
    series: [{ label: props.xLabel, show: false }, ...ySeries],
  };

  chart = new uPlot(mergedOptions, props.data, el.value);
  applySeriesVisibility();
};

const onResize = () => {
  if (!chart || !el.value) return;
  const height = getPlotHeight();
  plotHeightPx.value = height;
  chart.setSize({ width: el.value.clientWidth || 600, height });
};

// ===================================================
// 👀 Watchers
// ===================================================
watch(
  () => props.data,
  (next) => {
    if (!chart) return;
    chart.setData(next);
    applySeriesVisibility();
  },
  { deep: true },
);

watch(
  () => [
    props.series,
    props.title,
    props.height,
    props.options,
    props.chartType,
    props.colors,
    props.showLegend,
    props.legendStats,
  ],
  () => buildChart(),
  { deep: true },
);

watch(
  resolvedSeries,
  (next) => {
    if (activeSeriesIdx.value != null && activeSeriesIdx.value >= next.length) {
      activeSeriesIdx.value = null;
    }
  },
  { deep: true },
);

watch(
  () => [props.showLegend, legendTableRows.value.length, legendItems.value.length],
  async () => {
    await nextTick();
    onResize();
  },
  { flush: "post", immediate: true },
);

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onMounted(() => {
  buildChart();
  window.addEventListener("resize", onResize);
  if (typeof ResizeObserver !== "undefined" && el.value) {
    resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(el.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  resizeObserver?.disconnect();
  resizeObserver = null;
  chart?.destroy();
  chart = null;
});
</script>

<template>
  <div
    ref="wrapperEl"
    class="uplot-wrapper"
    :style="{
      '--plot-height': `${plotHeightPx}px`,
      '--legend-min-height': `${legendVisibleCapPx}px`,
      '--legend-margin-top': `${LEGEND_MARGIN_TOP_REM}rem`,
    }"
  >
    <div ref="el" class="uplot-root" />
    <teleport to="body">
      <div
        v-if="tooltip.show"
        class="uplot-tooltip"
        :style="{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }"
      >
        <div class="tooltip-title">{{ tooltip.xLabel }}</div>
        <div v-for="(row, idx) in tooltip.rows" :key="idx" class="tooltip-row">
          <span class="dot" :style="{ backgroundColor: row.color }" />
          <span class="label">{{ row.label }}</span>
          <span class="value">{{ `${row.value}` }}</span>
        </div>
      </div>
    </teleport>
    <div
      v-if="props.showLegend && legendTableRows.length"
      ref="legendTableEl"
      class="uplot-legend-table-wrap"
    >
      <table class="uplot-legend-table">
        <colgroup>
          <col class="legend-col-name" />
          <col class="legend-col-stat" />
          <col class="legend-col-stat" />
          <col class="legend-col-stat" />
          <col class="legend-col-stat" />
          <col class="legend-col-stat" />
        </colgroup>
        <thead>
          <tr>
            <th class="legend-name-header">Name</th>
            <th>First</th>
            <th>Last</th>
            <th>Min</th>
            <th>Max</th>
            <th>Mean</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in legendTableRows"
            :key="`legend-table-${idx}`"
            :class="{ active: activeSeriesIdx === idx }"
            :style="{
              cursor: legendToggleEnabled ? 'pointer' : 'default',
              opacity: legendOpacity(idx),
            }"
            @click="onLegendClick(idx)"
          >
            <td class="legend-name-cell">
              <div class="legend-name-content">
                <span
                  class="legend-color-bar"
                  :style="{ backgroundColor: row.color, opacity: legendOpacity(idx) }"
                />
                <span
                  class="legend-name-text"
                  :style="{ opacity: legendOpacity(idx) }"
                  :title="row.label"
                  >{{ row.label }}</span
                >
              </div>
            </td>
            <td>{{ formatUnitValue(row.first, {}, displayUnit) }}</td>
            <td>{{ formatUnitValue(row.last, {}, displayUnit) }}</td>
            <td>{{ formatUnitValue(row.min, {}, displayUnit) }}</td>
            <td>{{ formatUnitValue(row.max, {}, displayUnit) }}</td>
            <td>{{ formatUnitValue(row.mean, {}, displayUnit) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="props.showLegend && legendItems.length" ref="legendListEl" class="uplot-legend">
      <button
        v-for="(item, idx) in legendItems"
        :key="idx"
        type="button"
        class="legend-item"
        :class="{ active: activeSeriesIdx === idx }"
        :style="{
          cursor: legendToggleEnabled ? 'pointer' : 'default',
          opacity: legendOpacity(idx),
        }"
        @click="onLegendClick(idx)"
      >
        <span
          class="legend-color"
          :style="{ backgroundColor: item.color, opacity: legendOpacity(idx) }"
        />
        <span class="legend-label" :style="{ opacity: legendOpacity(idx) }" :title="item.label">{{
          item.label
        }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.uplot-wrapper {
  width: 100%;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.uplot-root {
  width: 100%;
  flex: 0 0 auto;
}

.uplot-legend-table-wrap {
  margin-top: var(--legend-margin-top);
  overflow-y: auto;
  overflow-x: auto;
  padding-right: 4px;
  max-height: max(
    var(--legend-min-height, 112px),
    calc(100% - var(--plot-height) - var(--legend-margin-top))
  );
}

.uplot-legend-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px;
}

.uplot-legend-table col.legend-col-name {
  width: 44%;
}

.uplot-legend-table col.legend-col-stat {
  width: 11.2%;
}

.uplot-legend-table th,
.uplot-legend-table td {
  padding: 4px 6px;
  text-align: right;
  white-space: nowrap;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-variant-numeric: tabular-nums;
  vertical-align: middle;
}

.uplot-legend-table td {
  overflow: hidden;
  text-overflow: ellipsis;
}

.uplot-legend-table td:last-child,
.uplot-legend-table th:last-child {
  padding-right: 10px;
}

.uplot-legend-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f8fafc;
  color: #3b4a5a;
  font-weight: 700;
}

.uplot-legend-table tbody tr {
  transition: background-color 0.15s ease;
}

.uplot-legend-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.03);
}

.uplot-legend-table tbody tr.active {
  background: rgba(0, 0, 0, 0.04);
}

.legend-name-cell {
  text-align: left !important;
}

.legend-name-header {
  text-align: left !important;
}

.legend-name-content {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.legend-color-bar {
  flex: 0 0 14px;
  width: 12px;
  height: 5px;
  border-radius: 999px;
  /* border: 1px solid #e5e7eb; */
  background: #9ca3af;
}

.legend-name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uplot-legend {
  display: flex;
  flex-wrap: wrap;
  /* gap: 8px 12px; */
  margin-top: var(--legend-margin-top);
  align-items: center;
  justify-content: center;
  align-content: flex-start;
  max-height: max(
    var(--legend-min-height, 84px),
    calc(100% - var(--plot-height) - var(--legend-margin-top))
  );
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.uplot-tooltip {
  position: fixed;
  z-index: 4000;
  min-width: 180px;
  max-width: 240px;
  max-height: calc(100vh - 16px);
  overflow-y: auto;
  padding: 8px 10px;
  border-radius: 6px;
  background: #111827;
  color: #e5e7eb;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: #f3f4f6;
}

.tooltip-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 6px;
  line-height: 1.4;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.label {
  color: #d1d5db;
}

.value {
  color: #fef3c7;
  font-variant-numeric: tabular-nums;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--gray_900);
  font-weight: 600;
  user-select: none;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}

.legend-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.legend-item.active {
  font-weight: 600;
}

.legend-color {
  width: 12px;
  height: 5px;
  border-radius: 100px;
  /* border: 1px solid #e5e7eb; */
  background: #9ca3af;
}

.legend-label {
  white-space: nowrap;
  font-size: 12px;
  font-weight: 400;
  line-height: 160%;
}
</style>
