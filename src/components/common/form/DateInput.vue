<template>
  <div class="date-wrap">
    <template v-if="type === 'basic'">
      <q-input
        :key="inputKey"
        :model-value="inputBasic"
        :mask="mask"
        type="text"
        inputmode="numeric"
        outlined
        color="grey-9"
        class="input"
        :placeholder="placeholder"
        :disable="disable"
        @update:model-value="(val) =>handleInputChange(val, 'basic')"
        @click="basicProxy.show()"
        @keypress.enter.prevent="basicProxy.show()"
        :error="hasBasicError"
        error-message="선택 가능한 날짜를 입력하세요"
        :hide-bottom-space="!hasBasicError"
      >
        <template v-slot:prepend>
          <q-popup-proxy ref="basicProxy" anchor="bottom left" :offset="[12, 0]">
            <q-date
              :model-value="calendarModel"
              mask="YYYY/MM/DD"
              :title="basicTitle"
              :options="dateDisable"
              @update:model-value="handleBasicDateChange"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="닫기" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </template>
        <template v-slot:append>
          <q-icon name="calendar_today" clickable @click.stop="basicProxy.show()" />
        </template>
      </q-input>
    </template>

    <template v-if="type === 'range'">
      <q-input
        :key="inputFromKey"
        :model-value="inputFrom"
        :mask="mask"
        type="text"
        inputmode="numeric"
        outlined
        color="grey-9"
        class="input"
        :placeholder="placeholder"
        :disable="disable"
        @keypress.enter.prevent="rangeProxy.show()"
        @update:model-value="(val) =>handleInputChange(val, 'from')"
        :error="hasFromError"
        :error-message="validateFromError ? '종료일 이전 날짜를 입력하세요':'선택 가능한 날짜를 입력하세요'"
        :hide-bottom-space="!hasFromError"
      >
        <template v-slot:append>
          <q-icon name="calendar_today" />
        </template>
      </q-input>

      <span class="dash">~</span>

      <q-input
        :key="inputToKey"
        :model-value="inputTo"
        :mask="mask"
        type="text"
        inputmode="numeric"
        outlined
        color="grey-9"
        class="input"
        :placeholder="placeholderTo ?? placeholder"
        :disable="disableTo"
        @keypress.enter.prevent="rangeProxy.show()"
        @update:model-value="(val) =>handleInputChange(val, 'to')"
        :error="hasToError"
        :error-message="validateToError ? '시작일 이후 날짜를 입력하세요':'선택 가능한 날짜를 입력하세요'"
        :hide-bottom-space="!hasToError"
      >
        <template v-slot:append>
          <q-icon name="calendar_today" />
        </template>
      </q-input>

      <q-popup-proxy ref="rangeProxy" anchor="bottom middle" self="top middle" :offset="[12, 0]">
        <q-date
          :model-value="calendarModel"
          mask="YYYY/MM/DD"
          :title="rangeTitle"
          :subtitle="rangeSubTitle"
          :options="dateDisable"
          :default-year-month="defaultYearMonth"
          @update:model-value="handleRangeDateSelect"
          @navigation="onNavigation"
          range
        >
          <div class="row items-center justify-end">
            <q-btn v-close-popup label="닫기" color="primary" flat />
          </div>
        </q-date>
      </q-popup-proxy>
    </template>
  </div>
</template>

<script setup lang="ts">
// ===================================================
// 📦 Imports
// ===================================================
import { ref, computed, watch } from 'vue'

// ===================================================
// 🧩 Components
// ===================================================
import dayjs from 'dayjs';
import 'dayjs/locale/ko';  // 한국어
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);
// ===================================================
// 📥 Props / Emits
// ===================================================
interface RangeData {
  from: string | null,
  to: string | null
}

type dateModel = string | RangeData | null;

const props = withDefaults(
  defineProps<{
    modelValue: string | RangeData | null
    type?: string
    mask?: string
    disable?: boolean
    disableTo?: boolean
    disableFuture?: boolean
    disablePast?: boolean
    placeholder?: string
    placeholderTo?: string
    minDate?: string | null
    maxDate?: string | null
  }>(),
  {
    type: 'basic',
    mask: '####.##.##',
    placeholder: 'YYYY.MM.DD',
    disable: false,
    disableTo: false,
    disableFuture: false,
    disablePast: false,
    minDate: null,
    maxDate: null,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | RangeData | null]
}>();

// ===================================================
// 📦 State
// ===================================================
const basicProxy = ref();
const rangeProxy = ref();

const calendarModel = ref<dateModel>(null);

// Input 입력을 위한 상태 (타이핑용)
const inputBasic = ref();
const inputFrom = ref();
const inputTo = ref();

// 에러 상태
const hasBasicError = ref(false);
const hasFromError = ref(false);
const hasToError = ref(false);
const validateFromError = ref(false);
const validateToError = ref(false);

const inputKey = ref(0);
const inputFromKey = ref(0);
const inputToKey = ref(0);

// 달력 기본 연월 (null일 때 현재 보고 있던 화면 유지용(범위모드))
const defaultYearMonth = ref<string>();
// ===================================================
// 🧮 Computed
// ===================================================

// 달력 타이틀 - 단일
const basicTitle = computed(() => {
  const target = calendarModel.value;
  if(typeof target === 'string' && target.length >= 10) {
    return dayjs(target, 'YYYY/MM/DD').locale('ko').format('M월 D일(ddd)');
  }
  return '';
});

// 달력 타이틀 - 범위
const rangeTitle = computed(() => {
  const model = calendarModel.value;

  if (model && typeof model === 'object' && model.from) {
    if(model.to) {
      // from,to 둘 다 선택 상태
      return `${dayjs(model.from, 'YYYYMMDD').format('M월 D일')} ~ ${dayjs(model.to, 'YYYYMMDD').format('M월 D일')}`;
    } else {
      // from만 선택 상태
      return `${dayjs(model.from, 'YYYYMMDD').format('M월 D일')} - 입력 중`;
    }
  }
  // 시작일 = 종료일
  if (typeof model === 'string') {
    return `${dayjs(model, 'YYYYMMDD').format('M월 D일')}`;
  }
  return '기간 선택';
});

// 달력 서브 타이틀 - 범위
const rangeSubTitle = computed(() => {
  const model = calendarModel.value;

  if(model && typeof model === 'object' && model.from && model.to) {
    const days = dayjs(model.to, 'YYYYMMDD').diff(model.from, 'day') + 1; // +1: 당일 포함

    if(dayjs(model.from).format('YYYY.M') ===  dayjs(model.to).format('YYYY.M')) {
      return `${dayjs(model.from).format('YYYY.M')} (${days}일)`;
    } else {
      return `${dayjs(model.from).format('YYYY.M')} ~ ${dayjs(model.to).format('YYYY.M')} (${days}일)`;
    }
  }
  // 시작일 = 종료일
  if (typeof model === 'string') {
    return `${dayjs(model).format('YYYY.M')} (1일)`;
  }
  return '-';
});

// input에 파싱된 날짜형식
const dateFormat = computed(() => {
  // mask가 ####.##.## 형태면 YYYY.MM.DD로 변환
  // mask가 ####/##/## 형태면 YYYY/MM/DD로 변환
  const separator = props.mask.replace(/#+/g, '')[0] || '.';
  return `YYYY${separator}MM${separator}DD`;
});


// ===================================================
// ⚙️ Methods
// ===================================================
// 범위 유효성 검증 함수 추가
const validateRange = (from: string | null, to: string | null): boolean => {
  if (!from || !to) return true; // 둘 중 하나라도 없으면 검증 스킵

  const fromDate = dayjs(from, 'YYYYMMDD');
  const toDate = dayjs(to, 'YYYYMMDD');

  return fromDate.isSameOrBefore(toDate);
};

// 날짜 disable 범위
const dateDisable = (d: string) => {
  const today = dayjs().format('YYYY/MM/DD');

  if (props.disableFuture && d > today) {
    return false;
  }
  if (props.disablePast && d < today) {
    return false;
  }
  if (props.minDate) {
    const min = dayjs(props.minDate, 'YYYYMMDD').format('YYYY/MM/DD');
    if (d < min) return false;
  }
  if (props.maxDate) {
    const max = dayjs(props.maxDate, 'YYYYMMDD').format('YYYY/MM/DD');
    if (d > max) return false;
  }

  return true;
}

// 날짜 선택 - 단일
const handleBasicDateChange = (newDate: string | null) => {
  if(!newDate) {
    return
  }
  const formatted = dayjs(newDate, 'YYYY/MM/DD').format('YYYYMMDD');
  emit('update:modelValue', formatted);
  basicProxy.value?.hide();
};

// 날짜 선택 - 범위
const handleRangeDateSelect = (range: any) => {
  if(!range) {
    emit('update:modelValue', {
      from: null,
      to: null,
    });
    return;
  }

  // 시작일 = 종료일
  if (typeof range === 'string') {
    const formatted = dayjs(range, 'YYYY/MM/DD').format('YYYYMMDD');
    emit('update:modelValue', formatted);
    rangeProxy.value?.hide();
    return;
  }

  if (typeof range === 'object' && range.from && range.to) {
    const formattedFrom = dayjs(range.from, 'YYYY/MM/DD').format('YYYYMMDD');
    const formattedTo = dayjs(range.to, 'YYYY/MM/DD').format('YYYYMMDD');

    emit('update:modelValue', {
      from: formattedFrom,
      to: formattedTo,
    });

    if (range.to) {
      rangeProxy.value?.hide();
    }
  }
};

// input 날짜 타이핑
const handleInputChange = (val: any, field: 'basic' | 'from' | 'to') => {
  const strVal = String(val || '');

  // 값이 비었을 때
  if (!strVal) {
    if (field === 'basic') {
      hasBasicError.value = false;
      emit('update:modelValue', null);
    }
    else if (field === 'from') {
      hasFromError.value = false;
      emit('update:modelValue', { ...calendarModel.value as RangeData, from: null });
    }
    else if (field === 'to') {
      hasToError.value = false;
      emit('update:modelValue', { ...calendarModel.value as RangeData, to: null });
    }
    return;
  }

  // 입력 중 (10자 미만)
  if (strVal.length < 10) {
    if (field === 'basic') hasBasicError.value = false;
    else if (field === 'from') hasFromError.value = false;
    else if (field === 'to') hasToError.value = false;
    return;
  }

  // 유효하지 않은 날짜 or 비활성화 날짜
  const parsed = dayjs(strVal, dateFormat.value, true);
  if (!parsed.isValid() || !dateDisable(parsed.format('YYYY/MM/DD'))) {

    // 캘린더 모델 null로 초기화
    if (field === 'basic') {
      hasBasicError.value = true;
      emit('update:modelValue', null);
      return;
    } else if (field === 'from') {
      hasFromError.value = true;
      const current = calendarModel.value as RangeData;
      emit('update:modelValue', {
        from: null,
        to: current?.to || null
      });
    } else if (field === 'to') {
      hasToError.value = true;
      const current = calendarModel.value as RangeData;
      emit('update:modelValue', {
        from: current?.from || null,
        to: null,
      });
    }
    return;
  }

  // 정상 날짜
  const formatted = parsed.format('YYYY/MM/DD');

  // 값 업데이트
  if (field === 'basic') {
    hasBasicError.value = false;
    emit('update:modelValue', formatted);
  } else {

    // 범위 모드에서는 기존 값을 유지하면서 해당 필드만 업데이트
    let currentFrom: string | null = null;
    let currentTo: string | null = null;

    // calendarModel이 string이면 from/to 둘 다 같은 값
    if (typeof calendarModel.value === 'string') {
      const dateStr = dayjs(calendarModel.value, 'YYYY/MM/DD').format('YYYY/MM/DD');
      currentFrom = dateStr;
      currentTo = dateStr;
    } else {
      const current = calendarModel.value as RangeData;
      currentFrom = current?.from || null;
      currentTo = current?.to || null;
    }

    const newRange = {
      from: field === 'from' ? formatted : currentFrom,
      to: field === 'to' ? formatted : currentTo
    };

    // 범위 유효성 검증 (시작일 - 종료일이 마이너스일 때)
    if (!validateRange(newRange.from, newRange.to)) {
      if (field === 'from') {
        hasFromError.value = true;
        validateFromError.value = true;
        emit('update:modelValue', {
          from: null,
          to: currentTo
        });
      } else if (field === 'to') {
        hasToError.value = true;
        validateToError.value = true;
        emit('update:modelValue', {
          from: currentFrom,
          to: null
        });
      }
      return;
    }

    hasFromError.value = false;
    hasToError.value = false;
    validateFromError.value = false;
    validateToError.value = false;

    // 시작일 = 종료일이면 string, 아니면 객체
    emit('update:modelValue', newRange.from === newRange.to ? newRange.from : newRange);
  }
}

// 달력 네비게이션 변경 시
const onNavigation = (view: any) => {
  // view = { year: 2024, month: 3 }
  defaultYearMonth.value = `${view.year}/${String(view.month).padStart(2, '0')}`
}

// ===================================================
// 👀 Watchers
// ===================================================
watch(
  () => props.modelValue,
  (newVal,oldVal) => {
    if (props.type === 'basic') {
      calendarModel.value = newVal ? dayjs(newVal as string, 'YYYYMMDD').format('YYYY/MM/DD') : null;
      if(newVal) {
        inputBasic.value = calendarModel.value;
      }
      // null 상태에서 초기화 버튼 클릭 시 강제 업데이트
      if (oldVal === null) {
        inputKey.value++;
        hasBasicError.value = false
      }
    }
    else if (props.type === 'range') {
      const val = newVal as RangeData;

      // 시작일 = 종료일
      if(typeof newVal === 'string') {
        calendarModel.value = dayjs(newVal, 'YYYYMMDD').format('YYYY/MM/DD');

        inputFrom.value = calendarModel.value;
        inputTo.value = calendarModel.value;
      } else {
        calendarModel.value = {
          from: val.from ? dayjs(val.from, 'YYYYMMDD').format('YYYY/MM/DD') : null,
          to: val.to ? dayjs(val.to, 'YYYYMMDD').format('YYYY/MM/DD') : null
        }

        // from값 default-year-month로 설정
        if(val.from) {
          defaultYearMonth.value = dayjs(val.from, 'YYYYMMDD').format('YYYY/MM')
        }

        // 유효한 값이 들어오면 에러 상태 먼저 해제
        if(val.from) {
          hasFromError.value = false;
          validateFromError.value = false;
        }
        if(val.to) {
          hasToError.value = false;
          validateToError.value = false;
        }
        if(!hasFromError.value && !hasToError.value) {
          inputFrom.value = calendarModel.value.from;
          inputTo.value = calendarModel.value.to;
        }

        // null 상태에서 초기화 버튼 클릭 시 강제 업데이트
        if (oldVal === null && val.from === null) {
          inputFromKey.value++;
          hasFromError.value = false;
        }
        if (oldVal === null && val.to === null) {
          inputToKey.value++;
          hasToError.value = false;
        }
      }

    }
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.date-wrap {
  display: flex;
  column-gap: 8rem;
  .dash {
    line-height: 36rem;
  }
  .input {
    &:deep() {
      .q-field__prepend {
        height: 100%;
        padding: 0;
      }
      input {
        cursor: pointer;
      }
      .q-field__append {
        height: 100%;
      }
    }
  }
}
</style>
