# UI 컴포넌트 라이브러리 설계 문서

> 이 문서는 **현재 구조와 그렇게 정한 이유**를 담습니다.

사용법(설치·테마 변경)은 [README](../README.md),
색상 토큰 목록은 [COLOR-TOKENS.md](COLOR-TOKENS.md)를 보세요.

## 1. 목적

- Quasar 등 UI 프레임워크 의존성 없이, 여러 프로젝트에서 가져다 쓰는 Vue 3
  컴포넌트 라이브러리를 만든다. "경량화된 Quasar"가 목표다.
- 핵심 가치는 **디자인이 바뀌어도 컴포넌트를 새로 만들지 않고 대응 가능한 것**이다.
  모든 변형을 props로 나열하지 않고, 기본형 위에 커스텀을 얹어도 충돌이 적게 설계한다.
- 프로젝트마다 디자인 색이 새로 나오는 상황을 전제한다. 라이브러리는 중립적인
  기본값을 갖고, 프로젝트가 토큰 몇 개만 덮어써서 쓴다.

## 2. 기술 스택

- Vue 3.5 / TypeScript / Vite (라이브러리 모드)
- SCSS (Tailwind 미사용), 컴포넌트 스타일은 `scoped` 미사용 + BEM
- 빌드 산출물: ESM/UMD + CSS 분리, `vue`는 external

## 3. 커스터마이징 전략 — 3단계

props 조합 폭발을 막기 위해 커스터마이징 범위를 3단계로 나눈다.

| 단계 | 방법 | 커버 범위 |
|---|---|---|
| 1. 토큰 | CSS 변수 (`--ui-*`) | 색상, 간격, 폰트, radius, 높이 등 시각값 |
| 2. variant | 한정된 prop | 자주 쓰는 레이아웃 패턴 (`labelPosition` 등) |
| 3. slot | 슬롯 | prop으로 못 미치는 구조 자체 교체 |

원칙:

- CSS 변수는 설치한 프로젝트의 명시도와 경쟁하지 않고 값만 덮어쓰므로 충돌이 없다.
- 클래스명은 `ui-` 접두사 + BEM으로 스코프한다 (`ui-input__label`).
- 내부 선택자는 얕게(단일 클래스) 유지해, 소비 측이 `!important` 없이 덮을 수 있게 한다.
- variant는 "자주 쓰는 배치 몇 가지"만, 그 이상은 slot으로 탈출구를 연다.

### 접두사 규칙

전역 등록 시 설치한 프로젝트와 이름이 충돌하지 않도록 모두 `ui`로 통일한다.

| 대상 | 표기 |
|---|---|
| CSS 변수 | `--ui-surface-default`, `--ui-gray-100` |
| 클래스 | `.ui-input__field` |
| 컴포넌트 | `<UiInput>` |

소스 파일명은 접두사 없이 두고(`Input.vue`), `index.ts`에서 `Ui`를 붙여 등록한다.
컴포넌트를 추가하면 `index.ts`에 두 줄(import, 목록)을 더한다.

## 4. 색상 토큰 구조

### 두 층

`styles/tokens.scss` 한 파일에 두 층이 있다.

| 층 | 예 | 성격 |
|---|---|---|
| 1. 팔레트(Primitive) | `--ui-gray-100`, `--ui-brand-500` | "무슨 색인가". 모드와 무관하게 고정 |
| 2. 역할(Semantic) | `--ui-surface-default` | "어디에 쓰는가". 라이트/다크가 다른 단계를 가리킴 |

- 컴포넌트는 **2층만** 참조한다.
- 프로젝트는 **1층을 재정의**해 색을 바꾼다. 2층을 직접 덮으면 다크 모드에서
  다시 덮어써져 풀린다.
- 2층 이름은 Figma 변수와 1:1로 맞춘다. `surface/default` ↔ `--ui-surface-default`.
  변환 규칙이 "슬래시를 하이픈으로, `--ui-` 붙이기" 하나뿐이라 매핑표가 필요 없다.
- 1층 단계 체계(`--ui-<계열>-<단계>`, 0~900, 클수록 어두움)는 기본값일 뿐이다.
  디자인 시스템에 이미 체계가 있으면 그것을 따르고 2층에 연결만 하면 된다.

### 다크 모드

- 설치만 하면 동작한다. 별도 설정이 필요 없다.
- **팔레트 값을 반전시키지 않는다.** 2층이 가리키는 단계만 바꾼다. 그래야
  `--ui-gray-900`이 라이트/다크에서 같은 색이고, 시안의 "Gray/900"과 일치한다.
  (유채색은 반전이 불가능하므로 브랜드·상태 색은 밝은 단계로 옮긴다)
- 적용 조건은 `styles/mixins/_theme.scss`의 `dark` mixin에 한 번만 정의하고
  `tokens.scss`가 사용한다: OS 설정(`prefers-color-scheme`), `data-theme="dark"`,
  `body.body--dark`(Quasar 쓰던 프로젝트 호환). `data-theme="light"`로 라이트 강제.

### 공개 기준

Semantic 토큰은 **컴포넌트가 쓰거나, 다음에 만들 컴포넌트가 확실히 쓸 것**만
공개한다. 한 번 공개하면 설치한 프로젝트가 쓰기 시작해 되돌리기 어렵다.
프로젝트 화면에만 있는 개념(사이드바 배경, 업무용 뱃지 색 등)은 라이브러리가
아니라 프로젝트가 자기 토큰으로 정의한다.

### Figma 연동

`npm run build:tokens`가 빌드된 CSS에서 `design-tokens/*.json`을 생성한다.
Figma 기본 Import가 읽는 형식이며, 파일 하나가 컬렉션의 모드 하나에 대응한다.
자세한 절차는 [design-tokens/README.md](../design-tokens/README.md) 참고.

## 5. 치수 토큰과 확장 규칙

색상 외의 시각값(높이, 여백 등)도 토큰으로 연다. 색상이 1층(팔레트)·2층(역할)
구조를 쓰는 것과 달리, 치수는 층을 나누지 않고 필요한 자리에만 조절점을 뚫는다.

### 뚫는 방식 — 선언하지 않고 fallback으로

```scss
// 변수를 선언하지 않는다. 쓰는 자리에 fallback만 둔다.
padding: var(--ui-field-padding-y, var(--ui-spacing-sm)) 0;
```

- 설치한 프로젝트가 선언하면 그 값을, 아니면 기존 전역 토큰을 그대로 따른다.
- 변수를 미리 선언해두면 소비 측의 변경이 "덮어쓰기"가 되어 로드 순서를 타지만,
  fallback 형태는 비어 있는 칸을 채우는 것이라 순서 싸움이 없다.
- 선언한 프로젝트가 없으면 동작이 그대로이므로 기존 사용처가 깨지지 않는다.

현재 열려 있는 치수 토큰:

| 토큰 | 기본값 | 적용 대상 |
|---|---|---|
| `--ui-field-height` | `36px` | Input `__control`, Select `__trigger`의 최소 높이. md 버튼도 같은 값 |
| `--ui-field-height-inside` | `44px` | inside 라벨일 때 위 두 곳의 최소 높이 (variant 무관) |
| `--ui-field-padding-y` | `--ui-spacing-sm` | 같은 두 곳의 상하 여백 |
| `--ui-button-height-sm` / `-lg` | `28px` / `44px` | Button sm·lg 높이 |
| `--ui-button-padding-x-sm` / `-md` / `-lg` | `--ui-spacing-sm/md/lg` | Button 좌우 여백 |
| `--ui-button-radius` | `--ui-radius-sm` | Button 모서리 (알약 모양은 `999px`) |
| `--ui-button-font-weight` | `600` | Button 글자 굵기 |
| `--ui-button-height` / `--ui-button-padding-x` | — | **버튼 하나에만** 지정하는 높이·여백 (`:root`에 두지 않음) |
| `--ui-button-color` / `--ui-button-on` / `--ui-button-border` | — | 버튼 하나의 대표색·글자색·outlined 테두리 (클래스로 묶어 쓰기 권장) |
| `--ui-modal-width-sm` / `-md` / `-lg` | `400px` / `560px` / `800px` | Modal 크기별 너비 |
| `--ui-modal-width` | — | 모달 하나만 너비 지정 |
| `--ui-modal-radius` | `--ui-radius-md` | Modal 모서리 |

높이를 토큰으로 고정할 때 두 컴포넌트가 같은 값에서 같은 높이가 나오도록,
박스 역할을 하는 요소는 `box-sizing: border-box`로 맞춘다.

### 이름은 컴포넌트가 아니라 역할 기준으로

| 금지 | 권장 |
|---|---|
| `--ui-input-padding-y`, `--ui-select-padding-y` | `--ui-field-padding-y` |

컴포넌트 기준으로 지으면 토큰 수가 **컴포넌트 수 × 속성 수**로 늘어난다. 역할
기준이면 Textarea, DatePicker를 추가해도 기존 토큰을 그대로 쓴다. 토큰은 컴포넌트
수가 아니라 디자인 언어가 넓어질 때만 늘어나야 한다.

### 뚫을지 판단하는 기준

1. 디자이너가 값을 지정해 오는 종류인가 (높이, 여백, radius) → 후보
2. 둘 이상의 컴포넌트가 공유할 값인가 → 역할 기준 이름으로 연다
3. 구조상 계산되는 내부 값인가 (`translateY(-50%)`, 라벨 좌우 보정 4px) → 열지 않는다
4. 실제 요구가 있었는가 → 미리 열어두지 않는다

공개 여부의 판단 기준 자체는 색상 토큰과 같다. 4장의 "공개 기준"을 따른다.

### 단위 기준 — px와 rem

공통 라이브러리는 어떤 프로젝트에 설치될지 모른다. rem은 설치한 프로젝트의
`html` 글자 크기를 기준으로 실제 크기가 정해지므로(`62.5%` 프로젝트에서
`0.875rem` = 8.75px), 라이브러리 기본값은 **어디서나 같은 크기가 나오는 px**로 둔다.

| 대상 | 단위 | 이유 |
|---|---|---|
| 글자 크기 | px, **`--ui-font-size-*` 토큰으로만** | 설치 환경과 무관하게 같은 크기. 컴포넌트 안에 직접 쓰지 않는다 |
| 간격·테두리·radius | px | 레이아웃 고정 |
| 높이 | px + `min-height` | 기본 높이는 고정, 글자가 커지면 박스도 늘어난다 (`height` 금지) |
| line-height | 단위 없음 (`1.2`) | 글자 크기에 비례 |
| 글자를 따라가야 하는 크기 (스피너 등) | em | 같은 요소의 글자 크기 기준 |

화면 너비에 따라 글자를 키우는 프로젝트는 글자 토큰 세 개만 rem으로 재정의한다.
글자 크기를 토큰 세 개로만 쓰는 규칙이 지켜져야 이 재정의가 전체에 먹는다.

### 열지 않았을 때의 비용

조절점이 없으면 설치한 프로젝트는 `.ui-input__field { ... !important }`처럼 내부
클래스를 직접 겨냥한다. 그 순간부터 내부 클래스 구조가 암묵적 공개 API가 되어
리팩터링이 막힌다. 토큰은 "여기까지 공개, 나머지는 내부"라는 경계를 명시해 안쪽을
자유롭게 바꿀 수 있게 하는 장치다. 라이브러리가 커질수록 이 경계가 더 필요하다.

### 정리

참조되지 않는 토큰은 주기적으로 지운다. 쓰이지 않는 채 남은 토큰이 쌓이는 것이
"토큰이 방대해졌다"는 상태의 실체다.

## 6. 폴더 구조

컴포넌트 수가 늘어도 파일이 선형으로 불어나지 않도록, "컴포넌트 1개 = 파일 1개"를
기본으로 하고 여러 컴포넌트가 공유하는 것만 별도 계층으로 뺀다.

```
src/
  styles/
    tokens.scss           # 역할 토큰 + 다크 모드 (코어)
    mixins/
      _theme.scss         # 다크 모드 적용 조건
      _field-layout.scss  # 라벨 위치 등 폼 필드 공통 레이아웃
  composables/
    useFieldValidation.ts # required/max + 커스텀 validator
    useFieldClasses.ts    # BEM 루트/컨트롤 클래스 계산
    useFloatingLabel.ts   # inside 라벨 축소·이동
    useIsMobile.ts        # matchMedia 기반 뷰포트 판별
  components/
    form/                 # Input, Select, Radio, Checkbox
    overlay/              # Modal (예정)
    feedback/             # Toast (예정)
  types/form.ts           # 여러 폼 컴포넌트가 공유하는 타입만
  index.ts
scripts/
  export-figma-tokens.mjs # Figma용 토큰 JSON 생성
```

- 컴포넌트 전용 스타일/타입은 해당 `.vue` 안에 둔다.
- `composables/`, `mixins/`, `types/`로 빼는 기준은 "2개 이상이 실제로 재사용하는가".
- `components/` 하위 폴더는 `index.ts`의 glob이 재귀적으로 잡으므로 설정이 필요 없다.

## 7. 폼 컴포넌트 공통 규칙

- `v-model` 필수
- 내장 validation: `required`, `max`(문자열 길이 또는 숫자 최댓값), `min`(숫자 하한)
- 확장 validation: `validator` 함수를 주입받아 함께 평가
- 에러 메시지 위치: 기본 하단, `errorPosition`으로 변경 가능
- 라벨 위치: `labelPosition` = top / left / inside(floating)
- `defineExpose({ validate })` — 폼 제출 시 강제로 검증을 노출

### 입력 경로가 갈라지지 않게 한다

네이티브 input 위에 커스텀 UI를 얹으면 값을 바꾸는 경로가 여러 개가 된다.
**버튼·키보드·타이핑 세 경로가 같은 결과를 내야 한다.** 한쪽만 구현하면 화면과
값이 어긋나거나, 같은 제약이 경로에 따라 적용되지 않는다.

실제로 나왔던 사례:

| 증상 | 원인 |
|---|---|
| 선택했는데 "필수 입력값입니다"가 사라지지 않음 | 선택 표시는 네이티브 `:checked`로, 검증은 Vue 상태로 판단 |
| 스테퍼로는 하한 아래로 못 내려가는데 타이핑하면 통과 | `min`을 스테퍼에서만 클램프하고 검증에는 넣지 않음 |
| `step: 0.1`인데 화살표 키는 1씩 움직임 | `step`을 커스텀 버튼에만 쓰고 input 속성으로 넘기지 않음 |

점검 방법: 제약(`min`·`max`·`step`)을 하나 걸어두고 **버튼으로, 화살표 키로,
직접 타이핑으로** 각각 값을 넣어본다. 셋 다 같은 값과 같은 에러가 나와야 한다.

## 8. 컴포넌트별 설계

### Input

- `Input` 하나로 text/number를 모두 처리한다. 입력 타입이 아니라 **디자인·구조
  차이**가 있을 때만 컴포넌트를 나눈다. (기존 SearchInput/DateInput 분리는
  돋보기 아이콘·캘린더 팝업 때문이었지 타입 때문이 아니었다)
- `#prefix` / `#suffix` 슬롯으로 아이콘 등 장식 요소를 처리한다.
- `showStepper`: `type="number"`일 때만 의미 있는 증감 버튼 노출 여부.
- `DateInput`(예정)은 캘린더 팝업이라는 다른 구조를 가지므로 별도 컴포넌트로
  두되 내부적으로 `Input`을 재사용한다.

### Select

- `searchable`: 트리거가 텍스트 input으로 바뀌어 검색어로 옵션을 필터링하고,
  화살표 키 + Enter로 탐색·선택한다. `filterKeys` / `filterOption`으로 검색
  대상을 조정한다.
- `mobileBreakpoint`(기본 640px) 이하에서는 드롭다운 대신 화면 하단에서 올라오는
  bottomSheet로 열린다 (`Teleport` + `Transition`). 뷰포트 판별은 `useIsMobile`을
  쓰며 Modal 등 다른 오버레이도 재사용할 수 있다.

### Radio

- `options` + `v-model`. 네이티브 `<input type="radio">`를 쓰고 시각 요소만 CSS로
  그린다 — 포커스 링, 그룹 내 화살표 키 탐색, 폼 시맨틱을 브라우저가 처리해준다.
  같은 그룹이 `name`을 공유해야 하므로 `useId()`로 생성한 값을 기본 `name`으로 쓴다.
- `direction`: vertical / horizontal
- `variant`: `dot`(기본) / `button`(토글 버튼 스타일) — 겉모습만 CSS로 바뀌고
  클릭·키보드·validation 로직은 동일하다.
- `labelPosition`은 `Input`과 같은 타입을 쓰되 `inside`는 의미가 없어 `top`처럼
  동작한다 (전체 폼 컴포넌트의 prop 타입 일관성을 택함).

### Checkbox

- `options`를 **생략하면** 단일 boolean(약관 동의 등), **지정하면** 다중 선택
  배열이다. 내부적으로 단일 모드도 "옵션 하나짜리 그룹"으로 취급해 렌더링·선택
  로직을 하나로 통일한다.
- 체크 모양은 사각형 + 회전된 테두리로 그린 체크마크. 라디오의 "테두리 강조 +
  속 점"과 의도적으로 다르게 해서 둘이 시각적으로 구분되게 한다.
- `useFieldValidation`의 `isEmpty` 옵션으로 "비어있음" 기준을 바꿔 쓴다
  (`false` / 빈 배열). 이 때문에 `FieldValidator`가 제네릭이다.

### 공통 옵션 타입

`SelectOption`(label/value/disabled/icon)을 Select·Radio·Checkbox가 공유한다.
`icon`은 이모지·텍스트(string) 또는 이미지(`{ src, alt }`)를 받고, 그 외
완전한 커스텀은 `#option` 슬롯으로 처리한다.

## 9. 배포와 테스트

- npm 레지스트리를 쓰지 않고, GitHub 저장소를 git dependency로 설치한다.

  ```json
  "library-test": "github:chloeMj/library-teest"
  ```

- **설치 시점에 빌드가 실행되지 않으므로 `dist/`를 커밋해야 한다.** 컴포넌트나
  토큰을 수정하면 `npm run build` 결과물을 함께 커밋한다.
- 로컬 미리보기는 `npm run dev` + `App.vue`. 컴포넌트를 추가하면 여기에 데모를 넣는다.
- 토큰 리팩터링처럼 "화면이 바뀌지 않아야 하는" 작업은 빌드된 CSS의 `var()`를
  모두 실제 값으로 치환해 수정 전후를 비교하는 방식으로 검증한다. 브라우저
  렌더링에 의존하지 않아 재현이 쉽다.

## 10. 브랜치와 커밋

`<타입>/<내용>` 형식을 쓰고, 타입은 아래 넷으로 제한한다. 커밋 메시지도 같은
타입을 접두사로 쓴다 (`feat: ...`).

| 타입 | 쓸 때 |
| --- | --- |
| `feat/` | 기능·컴포넌트 추가 |
| `fix/` | 버그 수정 |
| `refactor/` | 동작은 그대로, 구조만 변경 |
| `docs/` | 문서만 변경 |

애매하면 더 큰 쪽을 고른다. 코드가 함께 바뀌었으면 `docs/`가 아니라 `refactor/`다.
