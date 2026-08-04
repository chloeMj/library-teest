// composables/useChartColors.ts
import { computed } from "vue";

export type ClientName = "bnk" | "hmsec";

export function useChartColors() {
  const clientName = (import.meta.env.VITE_CLIENT_NAME || "bnk") as ClientName;

  const gradient = (start: string, end: string) => ({
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [
      [0, start],
      [1, end],
    ],
  });

  // 클라이언트별 컬러 정의
  const colorPalettes = {
    bnk: {
      pieGradient1: { start: "rgba(255, 72, 72, 1)", end: "rgba(255, 131, 77, 1)" },
      pieGradient2: { start: "rgba(239, 177, 8, 1)", end: "rgba(255, 240, 104, 1)" },
      columnGradient: { start: "rgba(255, 109, 107, 0.5)", end: "rgba(246, 215, 107, 0.25)" },
      lineColor: "var(--gray_500)",
    },
    hmsec: {
      pieGradient1: { start: "rgba(0, 122, 252, 1)", end: "rgba(0, 170, 255, 1)" },
      pieGradient2: { start: "rgba(239, 177, 8, 1)", end: "rgba(255, 240, 104, 1)" },
      columnGradient: { start: "rgba(0, 125, 252, 0.75)", end: "rgba(154, 220, 255, 0.5)" },
      lineColor: "var(--gray_500)",
    },
  };

  const palette = colorPalettes[clientName] || colorPalettes.bnk;

  // 공통 컬러
  const commonColors = ["var(--gray_300)", "#3FB1E7", "#30DBC6", "#9973EA", "#FFC92C", "#C2C2C2"];

  // Pie 차트 컬러
  const pieColors = computed(() => [
    gradient(palette.pieGradient1.start, palette.pieGradient1.end),
    gradient(palette.pieGradient2.start, palette.pieGradient2.end),
    ...commonColors,
  ]);

  // ColumnLine 차트 컬러
  const columnLineColors = computed(() => ({
    columnGradient: gradient(palette.columnGradient.start, palette.columnGradient.end),
    lineColor: palette.lineColor,
  }));

  return {
    // 차트 타입별 컬러 세트
    pieColors,
    columnLineColors,
  };
}
