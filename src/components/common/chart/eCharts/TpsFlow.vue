<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import { CustomChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import VChart from "vue-echarts";
import { util } from "@/plugins/util";

use([CanvasRenderer, CustomChart, GridComponent]);

// ===================================================
// 📐 Types / Interfaces
// ===================================================
type StageKey = "request" | "processing" | "complete";
type FlowStreamKey = "request" | "complete";

interface StageZone {
  key: StageKey;
  label: string;
  color: string;
  start: number;
  end: number;
}

interface FlowParticle {
  id: number;
  stream: FlowStreamKey;
  progress: number;
  speed: number;
  size: number;
  tail: number;
  lane: number;
}

interface ProcessingBridgeParticle {
  id: number;
  progress: number;
  speed: number;
  size: number;
  tail: number;
  lane: number;
}

interface QueueFlowMetric {
  tps?: number;
}

interface QueueFlowValue {
  queue?: QueueFlowMetric;
  dbInsert?: QueueFlowMetric;
  pending?: number;
}

interface TpsSpeedRange {
  min: number;
  max: number;
  speedMin: number;
  speedMax: number;
}

interface FlowStreamState {
  pendingSpawnParticleCount: number;
  latestTps: number;
}

// bridge/response dot을 요청 흐름 뒤에 생성하기 위한 지연 큐 항목
interface ScheduledParticleSpawn {
  type: "stream" | "bridge";
  stream?: FlowStreamKey;
  count: number;
  tps: number;
  releaseAt: number;
}

// ===================================================
// 📦 State
// ===================================================
// TPS 구간별 입자 이동 속도 조절
const TPS_SPEED_RANGES: TpsSpeedRange[] = [
  { min: 0, max: 50, speedMin: 0.5, speedMax: 0.7 },
  { min: 50, max: 100, speedMin: 1, speedMax: 1.5 },
  { min: 100, max: 200, speedMin: 1.7, speedMax: 2.2 },
  { min: 200, max: Infinity, speedMin: 2.5, speedMax: 3.0 },
];

// stream별 화면에 동시에 남겨둘 수 있는 최대 dot 개수
const MAX_VISIBLE_PARTICLE_COUNT_PER_STREAM = 90;
// dot 위치를 갱신하는 주기(ms)
const PARTICLE_TICK_MS = 80;
// stream별 한 번의 tick에서 새로 생성할 최대 dot 개수
const MAX_PARTICLE_SPAWN_PER_TICK = 3;
// websocket 응답이 빠르게 들어올 때 stream별로 쌓아둘 최대 생성 대기량
const MAX_PENDING_SPAWN_PARTICLE_COUNT = 120;
// 가운데 처리중 구간을 이어 보이게 하는 보조 dot 개수 범위
const MAX_VISIBLE_BRIDGE_PARTICLE_COUNT = 45;
const MAX_PENDING_BRIDGE_SPAWN_PARTICLE_COUNT = 140;
const MAX_BRIDGE_SPAWN_PER_TICK = 4;
// 요청/응답 dot 수 대비 가운데 보조 dot을 얼마나 보여줄지 조절
const BRIDGE_PARTICLE_COUNT_RATIO = 1;
// 요청 dot이 먼저 흐른 뒤 bridge/응답 dot이 따라 나오도록 하는 시각 지연 비율
const BRIDGE_VISUAL_DELAY_RATIO = 0.9;
const RESPONSE_VISUAL_DELAY_RATIO = 0.25;
const MIN_VISUAL_CASCADE_DELAY_MS = 320;
const MAX_VISUAL_CASCADE_DELAY_MS = 3000;
// 요청/bridge/응답 dot이 코일 근처에서 살짝 겹쳐 보이도록 하는 연결 구간
const REQUEST_CONNECTOR_OVERLAP = 1;
const REQUEST_CONNECTOR_OVERLAP_RATIO = 0.78;
const RESPONSE_START_OVERLAP = 7;
const BRIDGE_RESPONSE_OVERLAP = 8;
const EMPTY_RESPONSE_START_OVERLAP = 8;
const EMPTY_BRIDGE_RESPONSE_OVERLAP = 8;
const PROCESSING_VISUAL_MAX_DELAY_MS = 1600;
const RESPONSE_RELEASE_GATE_RATIO = 0.72;
const EMPTY_RESPONSE_RELEASE_GATE_RATIO = 0.45;
const PROCESSING_VISUAL_GATE_RATIO = 0.12;
const EMPTY_PROCESSING_VISUAL_GATE_RATIO = 0.35;
const INITIAL_FLOW_WARM_START_RATIO = 0.45;
const INITIAL_BRIDGE_WARM_START_RATIO = 0.75;
// bridge dot 속도 비율. 1에 가까울수록 요청/응답 dot과 비슷한 속도로 이동
const BRIDGE_SPEED_RATIO = 0.65;

// 처리중 값이 0일 때 가운데 원통 영역 너비
const EMPTY_PROCESSING_WIDTH = 16;
// 처리중 값이 있을 때 가운데 원통 영역 너비 범위
const PROCESSING_WIDTH_MIN = 26;
const PROCESSING_WIDTH_MAX = 42;
// 처리중 값 증가에 따라 원통 영역이 넓어지는 정도
const PROCESSING_WIDTH_GROWTH = 4;
// 처리중 값이 있을 때 표시할 최소 원통 개수
const PROCESSING_COIL_MIN_COUNT = 2;
// 원통 사이 간격 기준(px)
const PROCESSING_COIL_GAP_PX = 14;

// 요청/처리/응답 구간 설정
const defaultStageZones: Record<StageKey, StageZone> = {
  request: { key: "request", label: "요청", color: "#2f80ed", start: 0, end: 31 },
  processing: { key: "processing", label: "처리중", color: "#28b8d8", start: 31, end: 69 },
  complete: { key: "complete", label: "응답", color: "#18a058", start: 69, end: 100 },
};

const props = defineProps<{
  modelValue?: QueueFlowValue | null;
}>();

// 현재 화면에 렌더링 중인 dot 목록
const particles = ref<FlowParticle[]>([]);
// 가운데 처리중 구간 연결감만 담당하는 보조 dot 목록
const bridgeParticles = ref<ProcessingBridgeParticle[]>([]);
// Display values: request/response use tps, processing uses pending.
const stageValues = ref<Record<StageKey, number>>({
  request: 0,
  processing: 0,
  complete: 0,
});
const visualProcessingValue = ref(0);
const pendingVisualProcessingValue = ref(0);
// dot 이동 timer 핸들
let timer: ReturnType<typeof setInterval> | null = null;
// ECharts data key로 사용할 dot 고유 id
let nextId = 1;
// 요청/응답 stream별 dot 생성 상태
const streamStates: Record<FlowStreamKey, FlowStreamState> = {
  request: {
    pendingSpawnParticleCount: 0,
    latestTps: 0,
  },
  complete: {
    pendingSpawnParticleCount: 0,
    latestTps: 0,
  },
};
let hasBridgeFlow = false;
let latestBridgeTps = 0;
let targetBridgeParticleCount = 0;
let pendingBridgeSpawnParticleCount = 0;
// websocket 수신 시점과 실제 dot 생성 시점을 분리하는 대기 큐
let scheduledSpawns: ScheduledParticleSpawn[] = [];
let pendingVisualProcessingUpdatedAt = 0;
let hasAppliedInitialFlowWarmStart = false;

// ===================================================
// 🧮 Computed
// ===================================================
// 처리중 건수
const processingLoad = computed(() => {
  return visualProcessingValue.value;
});

// 처리중 영역 너비
const processingWidth = computed(() => {
  const load = Math.max(0, processingLoad.value);
  if (load === 0) {
    return EMPTY_PROCESSING_WIDTH;
  }

  return clamp(
    PROCESSING_WIDTH_MIN + Math.log10(load + 1) * PROCESSING_WIDTH_GROWTH,
    PROCESSING_WIDTH_MIN,
    PROCESSING_WIDTH_MAX,
  );
});

const requestDisplayValue = computed(() => {
  return formatTpsDisplayValue(stageValues.value.request);
});

const responseDisplayValue = computed(() => {
  return formatTpsDisplayValue(stageValues.value.complete);
});

// 처리중 영역 너비에 맞춰 요청/처리중/응답 구간을 동적으로 계산
const stages = computed<StageZone[]>(() => {
  const processStart = 50 - processingWidth.value / 2;
  const processEnd = 50 + processingWidth.value / 2;

  return [
    { key: "request", label: "요청", color: "#2f80ed", start: 0, end: processStart },
    { key: "processing", label: "처리중", color: "#38bdf8", start: processStart, end: processEnd },
    { key: "complete", label: "응답", color: "#18a058", start: processEnd, end: 100 },
  ];
});

const stageStats = computed(() => {
  return stages.value.map((stage) => ({
    ...stage,
    value:
      stage.key === "processing"
        ? formatCountDisplayValue(stageValues.value[stage.key])
        : formatTpsDisplayValue(stageValues.value[stage.key]),
    unit: stage.key === "processing" ? "건" : "tps",
  }));
});

// ===================================================
// ⚙️ Methods
// ===================================================
// min~max 사이 난수 생성
const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// value를 min~max 범위 안으로 제한
const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const getCssVariable = (name: string, fallback: string) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const bodyValue = getComputedStyle(document.body).getPropertyValue(name).trim();
  const rootValue = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  return bodyValue || rootValue || fallback;
};

const chartThemeColors = computed(() => ({
  trackFill: getCssVariable("--light-gray", "#fafafa"),
  trackStroke: getCssVariable("--border-medium", "#dfe6f1"),
  primaryText: getCssVariable("--gray_800", "#252a33"),
  secondaryText: getCssVariable("--gray_600", "#596273"),
}));

// 숫자로 변환할 수 없는 값은 fallback으로 보정
const toFiniteNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const truncateDecimal = (value: number, decimalPlaces = 2) => {
  const factor = 10 ** decimalPlaces;
  return Math.trunc(value * factor) / factor;
};

// tps는 소수점 2자리까지 표시
const formatTpsDisplayValue = (value: number) => {
  return util.comma(truncateDecimal(value));
};

const formatCountDisplayValue = (value: number) => {
  const displayValue = Number.isInteger(value) ? value : truncateDecimal(value);

  return util.comma(displayValue);
};

// tps 개수에 따라 dot 생성
const getParticleCountByTps = (tps: number) => {
  if (tps <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(tps));
};

// 현재 TPS에 맞는 속도 범위 선택
const getTpsSpeedRange = (tps: number) => {
  return (
    TPS_SPEED_RANGES.find((range) => {
      return tps >= range.min && tps < range.max;
    }) ?? TPS_SPEED_RANGES[TPS_SPEED_RANGES.length - 1]!
  );
};

const getAverageSpeedByTps = (tps: number) => {
  const speedRange = getTpsSpeedRange(tps);
  return (speedRange.speedMin + speedRange.speedMax) / 2;
};

// 현재 tps 속도 기준으로 특정 구간을 지나가는 데 걸리는 시각 지연 시간 계산
const getVisualTravelDelayMs = (distance: number, tps: number, ratio = 1) => {
  if (distance <= 0 || tps <= 0) {
    return 0;
  }

  return clamp(
    (distance / getAverageSpeedByTps(tps)) * PARTICLE_TICK_MS * ratio,
    MIN_VISUAL_CASCADE_DELAY_MS,
    MAX_VISUAL_CASCADE_DELAY_MS,
  );
};

// stageZones가 아직 준비되지 않았을 때 기본 구간으로 fallback
const getStageZone = (stageZones: StageZone[], key: StageKey, index: number): StageZone => {
  return stageZones[index] ?? defaultStageZones[key];
};

const getResponseStartOverlap = () => {
  return processingLoad.value === 0 ? EMPTY_RESPONSE_START_OVERLAP : RESPONSE_START_OVERLAP;
};

const getBridgeResponseOverlap = () => {
  return processingLoad.value === 0 ? EMPTY_BRIDGE_RESPONSE_OVERLAP : BRIDGE_RESPONSE_OVERLAP;
};

const getRequestConnectorOverlap = (stageZones = stages.value) => {
  const processing = getStageZone(stageZones, "processing", 1);
  return Math.max(
    REQUEST_CONNECTOR_OVERLAP,
    (processing.end - processing.start) * REQUEST_CONNECTOR_OVERLAP_RATIO,
  );
};

const getRequestStageEnd = (stageZones = stages.value) => {
  const request = getStageZone(stageZones, "request", 0);
  const processing = getStageZone(stageZones, "processing", 1);

  return Math.min(processing.end, request.end + getRequestConnectorOverlap(stageZones));
};

const getBridgeStage = (stageZones = stages.value): StageZone => {
  const processing = getStageZone(stageZones, "processing", 1);
  const requestEnd = getRequestStageEnd(stageZones);

  return {
    ...processing,
    start:
      processingLoad.value === 0
        ? Math.max(processing.start, requestEnd - REQUEST_CONNECTOR_OVERLAP)
        : Math.max(0, processing.start - REQUEST_CONNECTOR_OVERLAP),
    end: Math.min(100, processing.end + getBridgeResponseOverlap()),
  };
};

// stream이 실제로 움직일 구간 선택. 코일 근처는 bridge와 살짝 겹치게 표시
const getStreamStage = (stream: FlowStreamKey, stageZones = stages.value): StageZone => {
  const processing = getStageZone(stageZones, "processing", 1);

  if (stream === "request") {
    const request = getStageZone(stageZones, "request", 0);
    return {
      ...request,
      end: getRequestStageEnd(stageZones),
    };
  }

  const complete = getStageZone(stageZones, "complete", 2);
  return {
    ...complete,
    start: Math.max(processing.start, complete.start - getResponseStartOverlap()),
  };
};

// 요청 dot이 처리중 입구에 가까워지는 시점에 bridge dot을 풀기 위한 지연 시간
const getBridgeVisualDelayMs = (tps: number) => {
  const requestStage = getStreamStage("request");
  return getVisualTravelDelayMs(
    requestStage.end - requestStage.start,
    tps,
    BRIDGE_VISUAL_DELAY_RATIO,
  );
};

// bridge dot 이후 응답 dot을 풀기 위한 지연 시간
const getResponseVisualDelayMs = (tps: number, bridgeDelayMs: number) => {
  const bridgeStage = getBridgeStage();
  return (
    bridgeDelayMs +
    getVisualTravelDelayMs(bridgeStage.end - bridgeStage.start, tps, RESPONSE_VISUAL_DELAY_RATIO)
  );
};

const getStreamKeyByIndex = (index: number): FlowStreamKey => {
  return index === 0 ? "request" : "complete";
};

const getStreamIndex = (stream: FlowStreamKey) => {
  return stream === "request" ? 0 : 1;
};

const getBridgeColor = (progress: number, stageZones = stages.value) => {
  const request = getStageZone(stageZones, "request", 0);
  const processing = getStageZone(stageZones, "processing", 1);
  const complete = getStageZone(stageZones, "complete", 2);
  const progressRatio = clamp(
    (progress - processing.start) / Math.max(1, processing.end - processing.start),
    0,
    1,
  );

  if (progressRatio < 0.38) {
    return request.color;
  }

  if (progressRatio > 0.62) {
    return complete.color;
  }

  return processing.color;
};

// dot 하나의 stream, 위치, 속도, 크기, 꼬리 길이를 생성
const makeParticle = (
  stream: FlowStreamKey,
  tps = 0,
  progress = getStreamStage(stream).start + randomBetween(0, stream === "complete" ? 1.2 : 3),
): FlowParticle => {
  const speedRange = getTpsSpeedRange(tps);

  return {
    id: nextId++,
    stream,
    progress,
    speed: randomBetween(speedRange.speedMin, speedRange.speedMax),
    size: randomBetween(5.5, 9.5),
    tail: randomBetween(5, 13),
    lane: randomBetween(-0.12, 0.12),
  };
};

// 가운데 처리중 구간에서만 움직이는 보조 dot 생성
const makeBridgeParticle = (
  tps = 0,
  progress = getBridgeStage().start + randomBetween(0, 2),
): ProcessingBridgeParticle => {
  const speedRange = getTpsSpeedRange(tps);

  return {
    id: nextId++,
    progress,
    speed: randomBetween(speedRange.speedMin, speedRange.speedMax) * BRIDGE_SPEED_RATIO,
    size: randomBetween(5.2, 8.4),
    tail: randomBetween(12, 22),
    lane: randomBetween(-0.12, 0.12),
  };
};

const getWarmStartParticleCount = (targetCount: number, maxCount: number, ratio: number) => {
  if (targetCount <= 0) {
    return 0;
  }

  return Math.min(maxCount, Math.max(1, Math.round(targetCount * ratio)));
};

const makeWarmStartProgress = (start: number, end: number) => {
  if (end <= start) {
    return start;
  }

  return randomBetween(start, end);
};

const shouldWarmStartInitialFlow = (
  pendingCount: number,
  hasRequestFlow: boolean,
  hasResponseFlow: boolean,
) => {
  return !hasAppliedInitialFlowWarmStart && pendingCount > 0 && (hasRequestFlow || hasResponseFlow);
};

const seedInitialFlow = (
  requestTps: number,
  responseTps: number,
  requestParticleCount: number,
  responseParticleCount: number,
) => {
  const requestStage = getStreamStage("request");
  const responseStage = getStreamStage("complete");
  const bridgeStage = getBridgeStage();
  const requestSeedCount = getWarmStartParticleCount(
    requestParticleCount,
    MAX_VISIBLE_PARTICLE_COUNT_PER_STREAM,
    INITIAL_FLOW_WARM_START_RATIO,
  );
  const responseSeedCount = getWarmStartParticleCount(
    responseParticleCount,
    MAX_VISIBLE_PARTICLE_COUNT_PER_STREAM,
    INITIAL_FLOW_WARM_START_RATIO,
  );
  const bridgeSeedCount = hasBridgeFlow
    ? getWarmStartParticleCount(
        getBridgeParticleCount(),
        MAX_VISIBLE_BRIDGE_PARTICLE_COUNT,
        INITIAL_BRIDGE_WARM_START_RATIO,
      )
    : 0;

  particles.value = [
    ...particles.value,
    ...Array.from({ length: requestSeedCount }, () =>
      makeParticle(
        "request",
        requestTps,
        makeWarmStartProgress(requestStage.start, requestStage.end),
      ),
    ),
    ...Array.from({ length: responseSeedCount }, () =>
      makeParticle(
        "complete",
        responseTps,
        makeWarmStartProgress(responseStage.start, responseStage.end),
      ),
    ),
  ];

  bridgeParticles.value = [
    ...bridgeParticles.value,
    ...Array.from({ length: bridgeSeedCount }, () =>
      makeBridgeParticle(
        Math.max(requestTps, responseTps),
        makeWarmStartProgress(bridgeStage.start, bridgeStage.end),
      ),
    ),
  ];

  particles.value = limitParticlesByStream(particles.value);
  bridgeParticles.value = bridgeParticles.value.slice(-MAX_VISIBLE_BRIDGE_PARTICLE_COUNT);
  scheduledSpawns = [];
  hasAppliedInitialFlowWarmStart = true;
};

const getVisibleParticleCount = (stream: FlowStreamKey) => {
  return particles.value.filter((particle) => particle.stream === stream).length;
};

const limitParticlesByStream = (nextParticles: FlowParticle[]) => {
  const requestParticles = nextParticles
    .filter((particle) => particle.stream === "request")
    .slice(-MAX_VISIBLE_PARTICLE_COUNT_PER_STREAM);
  const completeParticles = nextParticles
    .filter((particle) => particle.stream === "complete")
    .slice(-MAX_VISIBLE_PARTICLE_COUNT_PER_STREAM);

  return [...requestParticles, ...completeParticles];
};

// 가운데 보조 dot 목표 개수 계산
const getBridgeParticleCount = () => {
  return clamp(targetBridgeParticleCount, 0, MAX_VISIBLE_BRIDGE_PARTICLE_COUNT);
};

const getResponseReleaseGateProgress = (stageZones = stages.value) => {
  const processing = getStageZone(stageZones, "processing", 1);
  const gateRatio =
    processingLoad.value === 0 ? EMPTY_RESPONSE_RELEASE_GATE_RATIO : RESPONSE_RELEASE_GATE_RATIO;

  return processing.start + (processing.end - processing.start) * gateRatio;
};

const hasFlowReachedResponseGate = () => {
  const gateProgress = getResponseReleaseGateProgress();
  const hasRequestReachedGate = particles.value.some((particle) => {
    return particle.stream === "request" && particle.progress >= gateProgress;
  });
  const hasBridgeReachedGate = bridgeParticles.value.some((particle) => {
    return particle.progress >= gateProgress;
  });

  return hasRequestReachedGate || hasBridgeReachedGate;
};

const getProcessingVisualGateProgress = (stageZones = stages.value) => {
  const processing = getStageZone(stageZones, "processing", 1);
  const gateRatio =
    processingLoad.value === 0 ? EMPTY_PROCESSING_VISUAL_GATE_RATIO : PROCESSING_VISUAL_GATE_RATIO;

  return processing.start + (processing.end - processing.start) * gateRatio;
};

const hasFlowReachedProcessingGate = () => {
  const gateProgress = getProcessingVisualGateProgress();
  const hasRequestReachedGate = particles.value.some((particle) => {
    return particle.stream === "request" && particle.progress >= gateProgress;
  });
  const hasBridgeReachedGate = bridgeParticles.value.some((particle) => {
    return particle.progress >= gateProgress;
  });

  return hasRequestReachedGate || hasBridgeReachedGate;
};

const syncVisualProcessingValue = (force = false) => {
  if (visualProcessingValue.value === pendingVisualProcessingValue.value) {
    return;
  }

  const elapsedMs = Date.now() - pendingVisualProcessingUpdatedAt;
  const hasNoVisibleFlow = particles.value.length === 0 && bridgeParticles.value.length === 0;
  const shouldApply =
    force ||
    hasFlowReachedProcessingGate() ||
    elapsedMs >= PROCESSING_VISUAL_MAX_DELAY_MS ||
    (pendingVisualProcessingValue.value === 0 && hasNoVisibleFlow);

  if (shouldApply) {
    visualProcessingValue.value = pendingVisualProcessingValue.value;
  }
};

// tps가 0으로 바뀐 stream의 아직 생성되지 않은 예약 dot 제거
const removeScheduledSpawns = (type: "stream" | "bridge", stream?: FlowStreamKey) => {
  scheduledSpawns = scheduledSpawns.filter((spawn) => {
    if (spawn.type !== type) {
      return true;
    }

    return type === "stream" ? spawn.stream !== stream : false;
  });
};

// 실제 생성 가능한 상태가 된 stream dot을 대기량에 추가
const addPendingStreamSpawn = (stream: FlowStreamKey, count: number, tps: number) => {
  if (count <= 0) {
    return;
  }

  const state = streamStates[stream];
  state.latestTps = tps;
  state.pendingSpawnParticleCount = Math.min(
    MAX_PENDING_SPAWN_PARTICLE_COUNT,
    state.pendingSpawnParticleCount + count,
  );
};

// stream dot 생성 요청을 즉시 또는 delay 이후로 예약
const scheduleStreamSpawn = (stream: FlowStreamKey, count: number, tps: number, delayMs = 0) => {
  if (count <= 0) {
    return;
  }

  if (stream === "complete" && !hasFlowReachedResponseGate()) {
    scheduledSpawns.push({
      type: "stream",
      stream,
      count,
      tps,
      releaseAt: Date.now() + Math.max(0, delayMs),
    });
    return;
  }

  if (delayMs <= 0) {
    addPendingStreamSpawn(stream, count, tps);
    return;
  }

  scheduledSpawns.push({
    type: "stream",
    stream,
    count,
    tps,
    releaseAt: Date.now() + delayMs,
  });
};

// 실제 생성 가능한 상태가 된 bridge dot을 대기량에 추가
const addPendingBridgeSpawn = (count: number, tps: number) => {
  if (count <= 0) {
    return;
  }

  latestBridgeTps = tps;
  pendingBridgeSpawnParticleCount = Math.min(
    MAX_PENDING_BRIDGE_SPAWN_PARTICLE_COUNT,
    pendingBridgeSpawnParticleCount + count,
  );
};

// bridge dot 생성 요청을 즉시 또는 delay 이후로 예약
const scheduleBridgeSpawn = (count: number, tps: number, delayMs = 0) => {
  if (count <= 0) {
    return;
  }

  if (delayMs <= 0) {
    addPendingBridgeSpawn(count, tps);
    return;
  }

  scheduledSpawns.push({
    type: "bridge",
    count,
    tps,
    releaseAt: Date.now() + delayMs,
  });
};

// 예약 시간이 지난 dot 생성 요청을 실제 생성 대기량으로 이동
const releaseScheduledSpawns = () => {
  if (scheduledSpawns.length === 0) {
    return;
  }

  const now = Date.now();
  const nextScheduledSpawns: ScheduledParticleSpawn[] = [];

  scheduledSpawns.forEach((spawn) => {
    if (spawn.releaseAt > now) {
      nextScheduledSpawns.push(spawn);
      return;
    }

    if (spawn.type === "stream" && spawn.stream === "complete" && !hasFlowReachedResponseGate()) {
      nextScheduledSpawns.push(spawn);
      return;
    }

    if (spawn.type === "bridge") {
      if (hasBridgeFlow) {
        addPendingBridgeSpawn(spawn.count, spawn.tps);
      }
      return;
    }

    if (spawn.stream && streamStates[spawn.stream].latestTps > 0) {
      addPendingStreamSpawn(spawn.stream, spawn.count, spawn.tps);
    }
  });

  scheduledSpawns = nextScheduledSpawns;
};

// 기존 dot들을 각 stream 방향으로 이동시키고 stream 끝까지 간 dot은 제거
const advanceParticles = () => {
  const stageZones = stages.value;
  const nextParticles = particles.value
    .map((particle) => ({
      ...particle,
      progress: particle.progress + particle.speed,
    }))
    .filter((particle) => particle.progress < getStreamStage(particle.stream, stageZones).end);

  particles.value = limitParticlesByStream(nextParticles);
};

// 가운데 보조 dot을 처리중 구간 안에서만 이동
const advanceBridgeParticles = () => {
  const bridgeStage = getBridgeStage();

  bridgeParticles.value = bridgeParticles.value
    .map((particle) => ({
      ...particle,
      progress: particle.progress + particle.speed,
    }))
    .filter((particle) => particle.progress < bridgeStage.end)
    .slice(-MAX_VISIBLE_BRIDGE_PARTICLE_COUNT);
};

// stream별 생성 대기량에서 일부를 꺼내 새 dot으로 추가
const spawnParticles = (stream: FlowStreamKey) => {
  const state = streamStates[stream];

  if (state.pendingSpawnParticleCount <= 0) {
    return;
  }

  if (stream === "complete" && !hasFlowReachedResponseGate()) {
    return;
  }

  const maxSlots = MAX_VISIBLE_PARTICLE_COUNT_PER_STREAM - getVisibleParticleCount(stream);
  const spawnCount = Math.min(
    MAX_PARTICLE_SPAWN_PER_TICK,
    state.pendingSpawnParticleCount,
    maxSlots,
  );

  if (spawnCount <= 0) {
    return;
  }

  particles.value = [
    ...particles.value,
    ...Array.from({ length: spawnCount }, () => makeParticle(stream, state.latestTps)),
  ];
  state.pendingSpawnParticleCount -= spawnCount;
};

// 요청/응답이 둘 다 흐를 때 가운데 보조 dot을 일정량 유지
const spawnBridgeParticles = () => {
  if (!hasBridgeFlow) {
    pendingBridgeSpawnParticleCount = 0;
    return;
  }

  const bridgeParticleCount = getBridgeParticleCount();

  if (bridgeParticles.value.length > bridgeParticleCount) {
    bridgeParticles.value =
      bridgeParticleCount > 0 ? bridgeParticles.value.slice(-bridgeParticleCount) : [];
  }

  const maxSlots =
    Math.min(MAX_VISIBLE_BRIDGE_PARTICLE_COUNT, bridgeParticleCount) - bridgeParticles.value.length;
  const spawnCount = Math.min(MAX_BRIDGE_SPAWN_PER_TICK, pendingBridgeSpawnParticleCount, maxSlots);

  if (spawnCount <= 0) {
    return;
  }

  bridgeParticles.value = [
    ...bridgeParticles.value,
    ...Array.from({ length: spawnCount }, () => makeBridgeParticle(latestBridgeTps)),
  ];
  pendingBridgeSpawnParticleCount -= spawnCount;
};

// 한 tick마다 이동과 생성을 같이 처리
const tickParticles = () => {
  advanceParticles();
  advanceBridgeParticles();
  syncVisualProcessingValue();
  releaseScheduledSpawns();
  spawnParticles("request");
  spawnParticles("complete");
  spawnBridgeParticles();
};

const clearStream = (stream: FlowStreamKey) => {
  const state = streamStates[stream];
  state.pendingSpawnParticleCount = 0;
  state.latestTps = 0;
  removeScheduledSpawns("stream", stream);
};

// stream tps를 dot 생성 대기량에 반영
const applyStreamFlow = (
  stream: FlowStreamKey,
  tps: number,
  hasStreamFlow: boolean,
  delayMs = 0,
) => {
  const state = streamStates[stream];
  const particleCount = getParticleCountByTps(tps);

  state.latestTps = tps;

  if (!hasStreamFlow) {
    clearStream(stream);
    return;
  }

  scheduleStreamSpawn(stream, particleCount, tps, delayMs);
};

// queue-flow payload를 요청/응답 stream과 화면 표시값에 반영
const applyQueueFlow = (value?: QueueFlowValue | null) => {
  const requestTps = toFiniteNumber(value?.queue?.tps);
  const responseTps = toFiniteNumber(value?.dbInsert?.tps);
  const pendingCount = toFiniteNumber(value?.pending);
  const hasRequestFlow = requestTps > 0;
  const hasResponseFlow = responseTps > 0;
  const requestParticleCount = getParticleCountByTps(requestTps);
  const responseParticleCount = getParticleCountByTps(responseTps);
  const shouldWarmStartFlow = shouldWarmStartInitialFlow(
    pendingCount,
    hasRequestFlow,
    hasResponseFlow,
  );

  pendingVisualProcessingValue.value = pendingCount;
  pendingVisualProcessingUpdatedAt = Date.now();

  if (shouldWarmStartFlow) {
    visualProcessingValue.value = pendingCount;
  }

  const bridgeDelayMs = hasRequestFlow ? getBridgeVisualDelayMs(requestTps) : 0;
  const responseDelayMs =
    hasRequestFlow && hasResponseFlow
      ? getResponseVisualDelayMs(Math.max(requestTps, responseTps), bridgeDelayMs)
      : 0;

  hasBridgeFlow = hasRequestFlow && hasResponseFlow;
  latestBridgeTps = Math.max(requestTps, responseTps);
  targetBridgeParticleCount = hasBridgeFlow
    ? Math.round(((requestParticleCount + responseParticleCount) / 2) * BRIDGE_PARTICLE_COUNT_RATIO)
    : 0;

  if (hasBridgeFlow) {
    scheduleBridgeSpawn(getBridgeParticleCount(), latestBridgeTps, bridgeDelayMs);
  } else {
    removeScheduledSpawns("bridge");
    pendingBridgeSpawnParticleCount = 0;
  }

  stageValues.value = {
    request: requestTps,
    processing: pendingCount,
    complete: responseTps,
  };
  syncVisualProcessingValue(!hasRequestFlow && !hasResponseFlow);
  if (shouldWarmStartFlow) {
    seedInitialFlow(requestTps, responseTps, requestParticleCount, responseParticleCount);
  }
  applyStreamFlow("request", requestTps, hasRequestFlow);
  applyStreamFlow("complete", responseTps, hasResponseFlow, responseDelayMs);
};

const chartOption = computed<any>(() => ({
  animation: true,
  animationDurationUpdate: 80,
  animationEasingUpdate: "linear",
  grid: {
    top: 24,
    right: 18,
    bottom: 34,
    left: 18,
    containLabel: false,
  },
  xAxis: {
    type: "value",
    min: 0,
    max: 100,
    axisLabel: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    type: "value",
    min: 0,
    max: 1,
    axisLabel: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: false,
    },
  },
  series: [
    {
      name: "flow-track",
      type: "custom",
      coordinateSystem: "cartesian2d",
      silent: true,
      z: 1,
      data: [0],
      // 도형 생성 - 일자라인, 가운데 원통, 요청 숫자 등
      renderItem: (_params: any, api: any) => {
        const stageZones = stages.value;
        const request = getStageZone(stageZones, "request", 0);
        const processing = getStageZone(stageZones, "processing", 1);
        const complete = getStageZone(stageZones, "complete", 2);
        const themeColors = chartThemeColors.value;

        const trackLeftTop = api.coord([0, 0.78]);
        const trackRightBottom = api.coord([100, 0.22]);
        const centerY = api.coord([0, 0.5])[1];
        const trackX = Math.min(trackLeftTop[0], trackRightBottom[0]);
        const trackY = Math.min(trackLeftTop[1], trackRightBottom[1]);
        const trackWidth = Math.abs(trackRightBottom[0] - trackLeftTop[0]);
        const trackHeight = Math.abs(trackRightBottom[1] - trackLeftTop[1]);

        const requestStart = api.coord([request.start, 0.5]);
        const requestEnd = api.coord([request.end, 0.5]);

        const processStart = api.coord([processing.start, 0.5]);
        const processEnd = api.coord([processing.end, 0.5]);
        const completeEnd = api.coord([complete.end, 0.5]);

        const processWidthPx = processEnd[0] - processStart[0];
        const isProcessingEmpty = processingLoad.value === 0;

        // 처리중 값이 있을 때만 내부 코일을 추가로 그림. 0일 때는 입구/출구 원통만 표시
        const coilCount = Math.max(
          PROCESSING_COIL_MIN_COUNT,
          Math.floor(processWidthPx / PROCESSING_COIL_GAP_PX),
        );
        const coilGap = processWidthPx / coilCount;
        const coilRadiusX = Math.max(3.4, coilGap * 0.58);
        const coilStyle = {
          fill: "rgba(90, 139, 247, 0.12)",
          stroke: processing.color,
          opacity: 0.58,
          lineWidth: 2,
        };

        const topLabelY = trackY - 12;
        const bottomLabelY = trackY + trackHeight + 14;
        const processCenterX = processStart[0] + processWidthPx * 0.5;
        const children: Record<string, any>[] = [
          {
            type: "rect",
            shape: {
              x: trackX,
              y: trackY,
              width: trackWidth,
              height: trackHeight,
            },
            style: {
              fill: themeColors.trackFill,
              stroke: "transparent",
              lineWidth: 0,
            },
          },
          {
            type: "line",
            shape: {
              x1: requestStart[0],
              y1: centerY,
              x2: requestEnd[0],
              y2: centerY,
            },
            style: {
              stroke: request.color,
              opacity: 0.3,
              lineWidth: 4,
              lineCap: "round",
            },
          },
          {
            type: "line",
            shape: {
              x1: completeEnd[0],
              y1: centerY,
              x2: processEnd[0],
              y2: centerY,
            },
            style: {
              stroke: complete.color,
              opacity: 0.22,
              lineWidth: 4,
              lineCap: "round",
            },
          },
          {
            type: "line",
            shape: {
              x1: processStart[0],
              y1: centerY,
              x2: processEnd[0],
              y2: centerY,
            },
            style: {
              stroke: processing.color,
              opacity: 0.18,
              lineWidth: 4,
              lineCap: "round",
            },
          },
          {
            type: "text",
            x: processCenterX,
            y: topLabelY,
            style: {
              text: formatCountDisplayValue(processingLoad.value),
              fill: processing.color,
              font: "700 14px sans-serif",
              align: "center",
              verticalAlign: "middle",
            },
          },
          {
            type: "text",
            x: requestStart[0] + 8,
            y: bottomLabelY,
            style: {
              text: requestDisplayValue.value,
              fill: themeColors.primaryText,
              font: "700 14px sans-serif",
              align: "left",
              verticalAlign: "middle",
            },
          },
          {
            type: "text",
            x: processCenterX,
            y: bottomLabelY,
            style: {
              text: processing.label,
              fill: themeColors.secondaryText,
              font: "600 14px sans-serif",
              align: "center",
              verticalAlign: "middle",
            },
          },
          {
            type: "text",
            x: completeEnd[0] - 8,
            y: bottomLabelY,
            style: {
              text: responseDisplayValue.value,
              fill: themeColors.primaryText,
              font: "700 14px sans-serif",
              align: "right",
              verticalAlign: "middle",
            },
          },
        ];

        const innerCoilIndexes = isProcessingEmpty
          ? []
          : Array.from({ length: Math.max(1, coilCount - 1) }, (_, index) => index + 1);

        if (isProcessingEmpty) {
          children.push({
            type: "ellipse",
            shape: {
              cx: processCenterX,
              cy: centerY,
              rx: 10,
              ry: trackHeight * 0.48,
            },
            style: {
              ...coilStyle,
              opacity: 0.48,
            },
          });
        } else {
          children.push(
            {
              type: "ellipse",
              shape: {
                cx: processStart[0] - 3,
                cy: centerY,
                rx: 10,
                ry: trackHeight * 0.48,
              },
              style: {
                ...coilStyle,
                opacity: 0.48,
              },
            },
            {
              type: "ellipse",
              shape: {
                cx: processEnd[0] + 3,
                cy: centerY,
                rx: 10,
                ry: trackHeight * 0.48,
              },
              style: {
                ...coilStyle,
                opacity: 0.48,
              },
            },
          );
        }

        for (const coilIndex of innerCoilIndexes) {
          const cx = processStart[0] + coilIndex * coilGap;
          children.push({
            type: "ellipse",
            shape: {
              cx,
              cy: centerY,
              rx: coilRadiusX,
              ry: trackHeight * 0.34,
            },
            style: coilStyle,
          });
        }

        const streamOffsets = [-0.18, -0.09, 0.09, 0.18];
        streamOffsets.forEach((offset) => {
          const requestStartPoint = api.coord([request.start, 0.5 + offset]);
          const requestEndPoint = api.coord([getRequestStageEnd(stageZones), 0.5 + offset * 0.22]);
          const responseStartPoint = api.coord([
            Math.max(processing.start, complete.start - getResponseStartOverlap()),
            0.5 + offset * 0.22,
          ]);
          const responseEndPoint = api.coord([complete.end, 0.5 + offset]);

          children.push({
            type: "line",
            shape: {
              x1: requestStartPoint[0],
              y1: requestStartPoint[1],
              x2: requestEndPoint[0],
              y2: requestEndPoint[1],
            },
            style: {
              stroke: request.color,
              opacity: 0.18,
              lineWidth: 2,
              lineCap: "round",
            },
          });

          children.push({
            type: "line",
            shape: {
              x1: responseStartPoint[0],
              y1: responseStartPoint[1],
              x2: responseEndPoint[0],
              y2: responseEndPoint[1],
            },
            style: {
              stroke: complete.color,
              opacity: 0.16,
              lineWidth: 2,
              lineCap: "round",
            },
          });

          // 실제 dot 데이터는 요청/응답으로 분리하고, 가운데는 연결 통로만 연하게 표시
          children.push({
            type: "line",
            shape: {
              x1: requestEndPoint[0],
              y1: requestEndPoint[1],
              x2: responseStartPoint[0],
              y2: responseStartPoint[1],
            },
            style: {
              stroke: processing.color,
              opacity: 0.1,
              lineWidth: 2,
              lineCap: "round",
            },
          });
        });

        return {
          type: "group",
          children,
        };
      },
    },
    {
      name: "processing-bridge",
      type: "custom",
      coordinateSystem: "cartesian2d",
      clip: true,
      silent: true,
      z: 2,
      data: bridgeParticles.value.map((particle) => [
        particle.progress,
        0.5 + particle.lane,
        particle.tail,
        particle.size,
        particle.id,
      ]),
      renderItem: (_params: any, api: any) => {
        const progress = Number(api.value(0));
        const y = Number(api.value(1));
        const tail = Number(api.value(2));
        const size = Number(api.value(3));
        const bridgeStage = getBridgeStage();
        const color = getBridgeColor(progress);
        const head = api.coord([progress, y]);
        const tailStart = api.coord([Math.max(bridgeStage.start, progress - tail), y]);

        return {
          type: "group",
          children: [
            {
              type: "line",
              shape: {
                x1: tailStart[0],
                y1: tailStart[1],
                x2: head[0],
                y2: head[1],
              },
              style: {
                stroke: color,
                opacity: 0.28,
                lineWidth: Math.max(1.5, size * 0.45),
                lineCap: "round",
              },
            },
            {
              type: "circle",
              shape: {
                cx: head[0],
                cy: head[1],
                r: size / 2,
              },
              style: {
                fill: color,
                opacity: 0.7,
                shadowBlur: 6,
                shadowColor: color,
              },
            },
          ],
        };
      },
    },
    {
      name: "TPS",
      type: "custom",
      coordinateSystem: "cartesian2d",
      clip: true,
      z: 3,
      data: particles.value.map((particle) => [
        particle.progress,
        0.5 + particle.lane,
        particle.tail,
        particle.size,
        particle.id,
        getStreamIndex(particle.stream),
      ]),
      renderItem: (_params: any, api: any) => {
        const progress = Number(api.value(0));
        const y = Number(api.value(1));
        const tail = Number(api.value(2));
        const size = Number(api.value(3));
        const stream = getStreamKeyByIndex(Number(api.value(5)));
        const stage = getStreamStage(stream);
        const head = api.coord([progress, y]);
        const tailStart = api.coord([Math.max(stage.start, progress - tail), y]);

        return {
          type: "group",
          children: [
            {
              type: "line",
              shape: {
                x1: tailStart[0],
                y1: tailStart[1],
                x2: head[0],
                y2: head[1],
              },
              style: {
                stroke: stage.color,
                opacity: 0.34,
                lineWidth: Math.max(2, size * 0.5),
                lineCap: "round",
              },
            },
            {
              type: "circle",
              shape: {
                cx: head[0],
                cy: head[1],
                r: size / 2,
              },
              style: {
                fill: stage.color,
                opacity: 0.92,
                shadowBlur: 9,
                shadowColor: stage.color,
              },
            },
          ],
        };
      },
    },
  ],
}));

// ===================================================
// 👀 Watchers
// ===================================================
watch(
  () => props.modelValue,
  (value) => {
    applyQueueFlow(value);
  },
  {
    immediate: true,
  },
);

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onMounted(() => {
  // websocket 수신 주기와 별개로 일정한 간격으로 dot을 움직임
  timer = setInterval(tickParticles, PARTICLE_TICK_MS);
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="tps-flow">
    <div class="tps-flow__summary">
      <div v-for="stage in stageStats" :key="stage.key" class="tps-flow__chip">
        <span class="tps-flow__dot" :style="{ backgroundColor: stage.color }" />
        <span class="tps-flow__label">{{ stage.label }}</span>
        <strong class="tps-flow__value">{{ stage.value }}</strong>
        <span class="tps-flow__unit">{{ stage.unit }}</span>
      </div>
    </div>
    <v-chart class="tps-flow__chart" :option="chartOption" autoresize />
  </div>
</template>

<style scoped lang="scss">
.tps-flow {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 220px;
}

.tps-flow__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 0 2px 8px;
}

.tps-flow__chip {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  flex: 0 0 145px;
  width: 145px;
  min-width: 145px;
  max-width: 145px;
  gap: 6px;
  box-sizing: border-box;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--gray_300);
  border-radius: 24px;
  background: var(--gray_0);
  color: var(--gray_700);
  font-size: 13px;
  font-weight: 500;
}

.tps-flow__dot {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tps-flow__label {
  flex: 0 0 auto;
  color: var(--gray_700);
  white-space: nowrap;
}

.tps-flow__value {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.tps-flow__unit {
  flex: 0 0 auto;
  color: var(--gray_500);
  font-size: 12px;
  white-space: nowrap;
}

.tps-flow__chart {
  flex: 1;
  width: 100%;
  min-height: 170px;
}
</style>
