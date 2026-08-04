
const getDecimalsForValue = (value: number) => {
  const absValue = Math.abs(value);
  if (!Number.isFinite(absValue) || absValue === 0) return 0;
  const log10 = Math.floor(Math.log(absValue) / Math.LN10);
  let dec = -log10 + 1;
  const magn = Math.pow(10, -dec);
  const norm = absValue / magn;
  if (norm > 2.25) dec += 1;
  if (value % 1 === 0) dec = 0;
  return Math.max(0, dec);
};

export function toFixedGrafana(value: number, decimals?: number) {
  if (value === Number.NEGATIVE_INFINITY || value === Number.POSITIVE_INFINITY) {
    return value.toLocaleString();
  }

  let nextDecimals = decimals;
  if (nextDecimals == null) {
    nextDecimals = getDecimalsForValue(value);
  }

  if (value === 0) {
    return value.toFixed(nextDecimals);
  }

  const factor = nextDecimals ? Math.pow(10, Math.max(0, nextDecimals)) : 1;
  const formatted = String(Math.round(value * factor) / factor);
  if (formatted.indexOf("e") !== -1 || value === 0) {
    return formatted;
  }

  const decimalPos = formatted.indexOf(".");
  const precision = decimalPos === -1 ? 0 : formatted.length - decimalPos - 1;
  if (precision < nextDecimals) {
    return (
      (precision ? formatted : `${formatted}.`) +
      String(factor).slice(1, nextDecimals - precision + 1)
    );
  }

  return formatted;
};
const appendPluralIf = (suffix: string, condition: boolean) => {
  if (!condition) return suffix;
  switch (suffix) {
    case " min":
    case " hour":
    case " day":
    case " week":
    case " year":
      return `${suffix}s`;
    default:
      return suffix;
  }
};

// node-exporter(panel unit)에서 들어올 수 있는 표시 단위 목록
const NODE_EXPORTER_UNITS = [
  "bps",
  "Bps",
  "reqps",
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
  "ms",
  "short",
] as const;
type NodeExporterUnit = (typeof NODE_EXPORTER_UNITS)[number];
const NODE_EXPORTER_UNIT_SET = new Set<string>(NODE_EXPORTER_UNITS);
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

type BaseUnit = "number" | "bps" | "B/s";

const SI_PREFIXES = ["f", "p", "n", "\u00B5", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
const SI_BASE_INDEX = SI_PREFIXES.indexOf("");
const BIN_PREFIXES = ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi", "Yi"];
const SHORT_SUFFIXES = ["", " K", " Mil", " Bil", " Tri", " Quadr", " Quint", " Sext", " Sept"];
const SIMPLE_COUNT_SUFFIXES = ["", "K", "M", "B", "T"];const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const logBase = (base: number, value: number) => Math.log10(value) / Math.log10(base);

const formatScaledUnits = (value: number, factor: number, suffixes: string[], offset = 0) => {
  if (
    value === Number.NEGATIVE_INFINITY ||
    value === Number.POSITIVE_INFINITY ||
    Number.isNaN(value)
  ) {
    return value.toLocaleString();
  }

  const scaleIndex = value === 0 ? 0 : Math.floor(logBase(factor, Math.abs(value)));
  const suffix = suffixes[clamp(offset + scaleIndex, 0, suffixes.length - 1)] ?? "";
  const power = clamp(scaleIndex, -offset, suffixes.length - offset - 1);
  const scaled = value / factor ** power;
  return `${toFixedGrafana(scaled)}${suffix}`;
};

const formatSIPrefix = (value: number, unit: string, offset = 0) => {
  const suffixes = SI_PREFIXES.map((prefix) => ` ${prefix}${unit}`);
  return formatScaledUnits(value, 1000, suffixes, SI_BASE_INDEX + offset);
};

const formatBinaryPrefix = (value: number, unit: string, offset = 0) => {
  const suffixes = BIN_PREFIXES.map((prefix) => ` ${prefix}${unit}`);
  return formatScaledUnits(value, 1024, suffixes, offset);
};

const formatSimpleCountUnit = (value: number, symbol: string) => {
  const scaled = formatScaledUnits(value, 1000, SIMPLE_COUNT_SUFFIXES);
  return `${scaled} ${symbol}`;
};

const toFixedScaled = (value: number, suffix: string) =>
  `${toFixedGrafana(value)}${appendPluralIf(suffix, Math.abs(value) > 1)}`;

const formatSecondsGrafana = (value: number) => {
  if (value === 0) return "0 s";

  const abs = Math.abs(value);
  if (abs < 0.000001) return `${toFixedGrafana(value * 1e9)} ns`;
  if (abs < 0.001) return `${toFixedGrafana(value * 1e6)} \u00B5s`;
  if (abs < 1) return `${toFixedGrafana(value * 1e3)} ms`;
  if (abs < 60) return `${toFixedGrafana(value)} s`;
  if (abs < 3600) return toFixedScaled(value / 60, " min");
  if (abs < 86400) return toFixedScaled(value / 3600, " hour");
  if (abs < 604800) return toFixedScaled(value / 86400, " day");
  if (abs < 31536000) return toFixedScaled(value / 604800, " week");
  return toFixedScaled(value / 3.15569e7, " year");
};

// 축/툴팁/범례에서 공통으로 쓰는 단위 포맷터
export function formatUnitValue(input: number | null | undefined, options?: { decimals?: number }, baseUnit?: BaseUnit = "number", displayUnit?: string = "auto") {
  if (input == null || !Number.isFinite(input)) return "-";

  const value = Number(input);
  const normalizedDisplayUnit = normalizeDisplayUnit(displayUnit);
  const decimals = options?.decimals;

  if (isNodeExporterUnit(normalizedDisplayUnit)) {
    switch (normalizedDisplayUnit) {
      case "percentunit":
        return `${toFixedGrafana(value * 100, decimals)}%`;
      case "percent":
        return `${toFixedGrafana(value, decimals)}%`;
      case "short":
        return formatScaledUnits(value, 1000, SHORT_SUFFIXES);
      case "s":
        return formatSecondsGrafana(value);
      case "ms":
        return formatSecondsGrafana(value / 1000);
      case "bytes":
        return formatBinaryPrefix(value, "B");
      case "decbytes":
        return formatSIPrefix(value, "B");
      case "bps":
        return formatSIPrefix(value, "b/s");
      case "Bps":
        return formatSIPrefix(value, "B/s");
      case "reqps":
        return formatSimpleCountUnit(value, "req/s");
      case "pps":
        return formatSIPrefix(value, "p/s");
      case "iops":
        return formatSimpleCountUnit(value, "io/s");
      case "hertz":
        return formatSIPrefix(value, "Hz");
      case "celsius":
        return `${toFixedGrafana(value, decimals)} \u00B0C`;
      case "none":
        return toFixedGrafana(value, decimals);
      default:
        return toFixedGrafana(value, decimals);
    }
  }
  if (baseUnit === "B/s") return formatBinaryPrefix(value, "B/s");
  if (baseUnit === "bps") return formatSIPrefix(value, "b/s");
  // if (displayUnit && displayUnit !== 'auto') return toFixedGrafana(value, decimals) + displayUnit;

  return toFixedGrafana(value, decimals);
};
