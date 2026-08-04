
type MetricMap = Record<string, string | number | boolean | undefined>;
// 유효한 숫자만 number로 반환하고, 아니면 null로 처리
const toFiniteNumberOrNull = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// metric 객체를 비교 가능한 문자열 키로 정규화
const metricSignature = (metric: MetricMap = {}) => {
  const keys = Object.keys(metric).sort();
  if (!keys.length) return "";

  const normalized = keys.reduce<Record<string, string | number | boolean | undefined>>(
    (acc, key) => {
      acc[key] = metric[key];
      return acc;
    },
    {},
  );
  return JSON.stringify(normalized);
};


// statistics 결과에서 현재 metric에 맞는 통계값 1개를 찾아 반환
const getStatValueForMetric = (
  statPayload: any,
  metric: MetricMap = {},
  fallbackIndex = 0,
): number | null => {
  const resultList = statPayload?.data?.result;
  if (!Array.isArray(resultList) || !resultList.length) return null;

  const signature = metricSignature(metric);
  if (signature) {
    const exactMatch = resultList.find(
      (item: any) => metricSignature(item?.metric ?? {}) === signature,
    );
    if (exactMatch) return toFiniteNumberOrNull(exactMatch?.value?.[1]);

    const subsetMatch = resultList.find((item: any) => {
      const statMetric = item?.metric ?? {};
      return Object.keys(metric).every((key) => statMetric?.[key] === metric[key]);
    });
    if (subsetMatch) return toFiniteNumberOrNull(subsetMatch?.value?.[1]);
  }

  if (resultList[fallbackIndex]) {
    return toFiniteNumberOrNull(resultList[fallbackIndex]?.value?.[1]);
  }

  return toFiniteNumberOrNull(resultList[0]?.value?.[1]);
};

type LegendStatRow = {
  label: string;
  first: number | null;
  last: number | null;
  min: number | null;
  max: number | null;
  mean: number | null;
};
// 범례 테이블(First/Last/Min/Max/Mean) 데이터 생성
export const buildLegendStatRow = (
  label: string,
  statistics: any,
  metric: MetricMap = {},
  fallbackIndex = 0,
): LegendStatRow => {
  return {
    label,
    first: getStatValueForMetric(statistics?.first, metric, fallbackIndex),
    last: getStatValueForMetric(statistics?.last, metric, fallbackIndex),
    min: getStatValueForMetric(statistics?.min, metric, fallbackIndex),
    max: getStatValueForMetric(statistics?.max, metric, fallbackIndex),
    mean: getStatValueForMetric(statistics?.mean, metric, fallbackIndex),
  };
};

/**
 * 쿼리 문자열에서 "원 데이터의 기본 단위"를 추정
 * _bits 포함: bits/sec(bps)로 간주
 * _bytes + *8 포함: bytes 값을 비트로 변환한 식이므로 bps로 간주
 * _bytes 포함: bytes/sec(B/s)로 간주
 * - 그 외: 단위 정보 없음(number)
 */
export const inferBaseUnitFromExpr = (expr: string): string => {
  const normalized = (expr || "").toLowerCase().replace(/\s+/g, "");
  const hasBytesMetric = normalized.includes("_bytes");
  const hasBitsMetric = normalized.includes("_bits");
  const hasTimes8 = /\*8(?:[^\d]|$)/.test(normalized);

  if (hasBitsMetric) return "bps";
  if (hasBytesMetric && hasTimes8) return "bps";
  if (hasBytesMetric) return "B/s";
  return "number";
};
const toMatcherRegex = (options: unknown): RegExp | null => {
  if (typeof options !== "string") return null;
  const raw = options.trim();
  if (!raw) return null;

  const match = raw.match(/^\/(.*?)\/([gimsuy]*)$/);
  if (match) {
    const [, pattern, flags] = match;
    try {
      return new RegExp(pattern, flags);
    } catch {
      return null;
    }
  }

  try {
    return new RegExp(raw);
  } catch {
    return null;
  }
};


type GrafanaMatcher = {
  id?: string;
  options?: unknown;
};

type GrafanaFieldProperty = {
  id?: string;
  value?: unknown;
};
type GrafanaFieldOverride = {
  matcher?: GrafanaMatcher;
  properties?: GrafanaFieldProperty[];
};
export const getFieldOverrides = (attrs: any): GrafanaFieldOverride[] => {
  const overrides = (attrs as any)?.fieldConfig?.overrides;
  return Array.isArray(overrides) ? (overrides as GrafanaFieldOverride[]) : [];
};

const testRegex = (regex: RegExp, value: string) => {
  regex.lastIndex = 0;
  return regex.test(value);
};

type SeriesMatchMeta = {
  label: string;
  refId: string;
};
export const isSeriesMatched = (override: GrafanaFieldOverride, meta: SeriesMatchMeta) => {
  const matcher = override.matcher ?? {};
  const id = matcher.id;
  const options = matcher.options;

  if (id === "byName") {
    if (typeof options !== "string") return false;
    return meta.label === options || meta.refId === options;
  }

  if (id === "byRegexp") {
    const regex = toMatcherRegex(options);
    if (!regex) return false;
    return testRegex(regex, meta.label) || testRegex(regex, meta.refId);
  }

  if (id === "byFrameRefID") {
    return typeof options === "string" && meta.refId === options;
  }

  return false;
};

export const logFieldTableRowmapping = (labels: Record<string, string>) => {
  return Object.keys(labels).map((key: string) => {
    return {
      name: key,
      content: labels[key]
    }
  })
}
