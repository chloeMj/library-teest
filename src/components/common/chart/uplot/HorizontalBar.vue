<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

type HorizontalBarItem = {
  label: string;
  value: number;
  color?: string;
};

const props = withDefaults(
  defineProps<{
    items: HorizontalBarItem[];
    width?: number;
    height?: number;
    valueFormatter?: (value: number) => string;
    showValue?: boolean;
    colors?: string[];
  }>(),
  {
    items: () => [],
    height: 320,
    showValue: true,
  },
);

// ===================================================
// 📦 State
// ===================================================
const root = ref<HTMLDivElement | null>(null);
let chart: uPlot | null = null;
let resizeObserver: ResizeObserver | null = null;

  const colorPalette = ref<string[]>([
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

// ===================================================
// 🧮 Computed
// ===================================================
const normalized = computed(() =>
  props.items.map((item, idx) => ({
    ...item,
    color: item.color ?? palette.value[idx % palette.value.length],
    display: props.valueFormatter ? props.valueFormatter(item.value) : item.value.toFixed(2),
  })),
);

const data = computed<uPlot.AlignedData>(() => {
  const xVals = normalized.value.map((i) => i.value);
  const yIdx = normalized.value.map((_, idx) => idx);
  return [xVals, yIdx];
});

// ===================================================
// 🛠️ Actions
// ===================================================
const destroy = () => {
  chart?.destroy();
  chart = null;
};

const onResize = () => buildChart();

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  const radius = Math.min(r, h / 2, Math.abs(w) / 2);
  const dir = w >= 0 ? 1 : -1;
  const absW = Math.abs(w);
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.arcTo(x, y, x + dir * radius, y, radius);
  ctx.lineTo(x + dir * (absW - radius), y);
  ctx.arcTo(x + dir * absW, y, x + dir * absW, y + radius, radius);
  ctx.lineTo(x + dir * absW, y + h - radius);
  ctx.arcTo(x + dir * absW, y + h, x + dir * (absW - radius), y + h, radius);
  ctx.lineTo(x + dir * radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.closePath();
};

const buildChart = () => {
  if (!root.value) return;
  destroy();

  const width = (props.width ?? root.value.clientWidth) || 600;
  const height = props.height ?? 320;
  const yCount = normalized.value.length || 1;
  const yMax = Math.max(0.5, yCount - 0.5);

  chart = new uPlot(
    {
      width,
      height,
      padding: [12, 96, 24, 96],
      scales: {
        x: {
          time: false,
          range: () => [0, 100],
        },
        y: {
          time: false,
          range: () => [-0.5, yMax],
        },
      },
      legend: { show: false },
      axes: [
        {
          side: 0,
          stroke: "#93a1b0",
          grid: { show: false },
          values: (_, vals) => vals.map((v) => `${v}`),
        },
        {
          side: 3,
          stroke: "#93a1b0",
          grid: { show: false },
          ticks: { incr: 1 },
          values: (_, vals) =>
            vals.map((v) => {
              const idx = Math.round(v as number);
              return normalized.value[idx]?.label ?? "";
            }),
        },
      ],
      series: [
        { label: "value-x", show: false },
        {
          label: "categories",
          stroke: "transparent",
          points: { show: false },
          paths: () => null,
        },
      ],
      cursor: { show: false },
      hooks: {
        draw: [
          (u) => {
            const ctx = u.ctx;
            const xScale = "x";
            const yScale = "y";
            const x0 = u.valToPos(0, xScale, true);
            const barHeight = (u.bbox.height - 24) / yCount;
            const thicknessRatio = 0.6;
            const h = Math.max(4, barHeight * thicknessRatio);
            const radius = Math.min(h * 0.25, 6);

            normalized.value.forEach((item, idx) => {
              const x = u.valToPos(item.value, xScale, true);
              const yCenter = u.valToPos(idx, yScale, true);
              const y = yCenter - h / 2;

              ctx.fillStyle = item.color;
              const rectX = Math.min(x0, x);
              const rectW = Math.abs(x - x0);
              drawRoundedRect(ctx, rectX, y, rectW, h, radius);
              ctx.fill();

              if (props.showValue) {
                ctx.fillStyle = "#1f2933";
                ctx.font = "12px system-ui";
                ctx.textAlign = x >= x0 ? "left" : "right";
                ctx.textBaseline = "middle";
                const offset = 6;
                ctx.fillText(item.display, x >= x0 ? x + offset : x - offset, yCenter);
              }
            });
          },
        ],
      },
    },
    data.value,
    root.value,
  );
};

// ===================================================
// 👀 Watchers
// ===================================================
watch(data, () => buildChart(), { deep: true });
watch(
  () => [props.width, props.height, props.showValue, props.colors],
  () => buildChart(),
  { deep: true },
);

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  resizeObserver?.disconnect();
  resizeObserver = null;
  destroy();
});
onMounted(() => {
  buildChart();
  window.addEventListener("resize", onResize);
  if (typeof ResizeObserver !== "undefined" && root.value) {
    resizeObserver = new ResizeObserver(() => buildChart());
    resizeObserver.observe(root.value);
  }
});
</script>

<template>
  <div ref="root" class="uplot-hbar-root" />
</template>

<style scoped>
.uplot-hbar-root {
  width: 100%;
}
</style>
