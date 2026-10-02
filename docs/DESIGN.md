# UI 컴포넌트 라이브러리 설계 문서

> 이 문서는 `library-test` 프로젝트를 Quasar 의존성이 없는 자체 UI 컴포넌트
> 라이브러리로 재구축하기 위한 설계 방향을 정리한 것입니다. 세션이 바뀌어도
> 이 문서를 기준으로 작업을 이어갈 수 있도록 합니다.

## 1. 목적

- text-input, select, modal-popup, toast 메시지 등 다양한 UI 컴포넌트 모음을
  만들고, 이를 다른 프로젝트에서 import해서 사용할 수 있게 배포한다.
- 현재 설치되어 있는 **Quasar 프레임워크는 제거**하고, 그 자리를 자체 컴포넌트로
  대체한다.
- 핵심 목적은 **디자인이 바뀌어도 손쉽게 대응 가능한 커스텀 용이성**이다.
  모든 변형을 props/attr로 나열하는 방식은 지양하고, 기본형(base) 위에 커스텀
  스타일을 얹었을 때 충돌이 적도록 설계한다.

## 2. 기존 코드 처리

- `src/components/common/` 하위의 Quasar 기반 컴포넌트(chart, form 등)는
  마이그레이션하지 않고 **삭제 후 새로 작성**한다.

## 3. 기술 스택

- Vue 3 (현재 3.5.x 유지, 이후 메이저 업그레이드에도 깨지지 않도록 설계)
- Vite + TypeScript
- SCSS (Tailwind는 사용하지 않음)
- 빌드 산출물: ESM/UMD + CSS 분리 export (기존 `package.json` 설정 유지)

## 4. 커스터마이징 아키텍처 — 3단계 전략

props 조합 폭발을 막기 위해, 커스터마이징 범위를 아래 3단계로 나눈다.

| 단계 | 방법 | 커버 범위 | 예시 |
|---|---|---|---|
| 1. 테마 토큰 | CSS 커스텀 프로퍼티 (`--lib-*`) | 색상, 간격, 폰트, radius 등 시각값 | `--lib-input-border-color` 를 소비 프로젝트 `:root`에서 재정의 |
| 2. 구조 변형 (variant) | 한정된 prop (예: `labelPosition`) | 자주 쓰는 레이아웃 패턴 전환 | `labelPosition: 'top' \| 'left' \| 'inside'` (inside는 Quasar식 floating label) |
| 3. 완전 커스텀 | `slot` | prop으로 못 미치는 구조 자체 교체 | `#label` slot으로 라벨 영역을 완전히 다르게 렌더링 |

설계 원칙:

- CSS 변수는 소비 프로젝트의 CSS 우선순위(specificity)와 경쟁하지 않고 값만
  덮어쓰므로 충돌이 없다.
- 클래스명은 네임스페이스 접두사 + BEM으로 스코프한다 (예: `lib-input__label`,
  `lib-input--label-inside`). 소비 프로젝트 클래스명과의 충돌을 방지한다.
- 내부 선택자는 얕게(단일 클래스) 유지하여, 소비 측이 `!important` 없이도
  동일 명시도로 오버라이드할 수 있게 한다.
- variant prop은 "자주 쓰는 배치 몇 가지"만 제공하고, 그 이상의 특이 케이스는
  slot으로 탈출구를 연다.

## 5. 작업 우선순위

1. **폼 인풋(form input) 계열부터 시작**
2. 이후 select, modal-popup, toast 등으로 확장

## 6. Form Input 요구사항

- `v-model` 지원 (필수)
- 내장 validation:
  - 필수 입력 여부 (required)
  - 최대 입력 길이 (문자열 길이 / 숫자 입력 시 max 값)
- 확장 validation: 사용자가 커스텀 검증 로직을 함수 형태로 직접 주입 가능해야
  한다 (validator 확장 포인트를 열어둠).
- 에러 메시지: 기본은 인풋 박스 **하단**에 표시하되, 위치 변경이 가능해야 한다.
- 라벨 위치: 위 / 왼쪽 / 내부(포커스·입력값 존재 시 축소되어 위로 이동하는
  floating 방식) 세 가지를 variant로 지원한다.

### 6.1 컴포넌트 분리 기준 (text vs number 등)

처음엔 텍스트/숫자 입력을 별 컴포넌트로 나눌지 고민했으나, 기존 코드의
SearchInput/DateInput 분리는 "돋보기 아이콘", "캘린더 팝업" 같은 **디자인·구조
차이** 때문이었지 입력 타입 자체 때문이 아니었다는 게 확인되어 아래처럼
정리한다.

- **`Input`** 하나로 통합 (이름은 `Select`/`Modal`/`Toast`와 통일감 있게
  한 단어로). "TextInput"이라는 이름은 쓰지 않는다 — 숫자도 받는데 이름에
  "Text"가 들어가면 오해의 소지가 있음.
  - `type` prop으로 네이티브 input처럼 `'text' | 'number' | ...` 전환
  - `#prefix` / `#suffix` slot으로 아이콘 등 장식 요소 처리 (기존
    SearchInput의 돋보기 아이콘 역할을 대체)
  - `type="number"`일 때만 의미 있는 증감 버튼은 선택적 variant prop
    (예: `showStepper`)으로 노출 여부만 결정 — 필수 아님
- **`DateInput`**은 캘린더 팝업이라는 실질적으로 다른 구조를 가지므로 별도
  컴포넌트로 유지하되, 내부적으로 `Input`을 재사용(합성)한다.

### 6.2 전역 이름 충돌 방지 — 네임스페이스 접두사

`index.ts`가 `components/**/*.vue`를 자동으로 글롭(glob)하여
`app.component(name, component)`로 전역 등록하는 구조이기 때문에, `Input`,
`Select`, `Modal`, `Toast`처럼 흔한 이름을 그대로 쓰면 소비 프로젝트에 이미
있는 다른 전역 컴포넌트와 충돌할 위험이 있다.

이를 막기 위해 전역/공개 이름에는 **`Lib` 접두사**를 붙이기로 한다
(`LibInput`, `LibSelect`, `LibModal`, `LibToast`). 소스 파일명은 접두사 없이
그대로 두고(`Input.vue`), `index.ts`의 자동 등록 로직에서 접두사를 붙여
export/등록한다 — 컴포넌트를 추가할 때마다 접두사를 신경 쓰지 않아도 자동으로
적용된다. (`Lib`는 패키지명이 정식으로 정해지면 그에 맞춰 일괄 변경 가능한
임시 접두사)

## 7. 배포 및 테스트 전략

- 별도 npm 레지스트리는 사용하지 않는다.
- 개인 GitHub 저장소(`chloeMj/library-teest`)에 push하고, git dependency
  형태로 설치한다.
- 동일 상위 디렉토리에 있는 `library-test-playground` 프로젝트의
  `package.json`에 아래와 같이 이미 의존성이 설정되어 있으며, 이 프로젝트에서
  실제 동작을 테스트한다.

  ```json
  "library-test": "github:chloeMj/library-teest"
  ```

- 참고: 개발 중 매번 push → 재설치하는 흐름은 느릴 수 있으므로, 필요 시
  `npm link` 또는 로컬 경로 참조로 빠르게 반복 테스트하는 방법을 별도로
  검토할 수 있다 (아직 결정된 사항 아님).
- **중요**: git 저장소를 직접 설치하는 방식이라 설치 시점에 별도 빌드가
  실행되지 않는다 (`prepare` 스크립트 없음). 따라서 `dist/`가 커밋되어 있어야
  하며, 컴포넌트를 추가/수정할 때마다 `npm run build` 결과물을 함께 커밋해야
  playground 프로젝트에 변경 사항이 반영된다.

## 8. 폴더 구조

컴포넌트 수가 늘어나도 파일이 선형으로 불어나지 않도록, "컴포넌트 1개 =
파일 1개"를 기본으로 하고 여러 컴포넌트가 공유하는 것만 별도 계층으로 뺀다.

```
src/
  styles/
    tokens.scss           # 전역 CSS 변수 (--lib-* 색상/간격/폰트 등)
    mixins/
      _field-layout.scss  # 라벨 위치(top/left/inside) 등 폼 필드 공통 레이아웃 mixin
  composables/
    useFieldValidation.ts # required/maxLength + 커스텀 validator 주입 공통 로직
    useFloatingLabel.ts   # focus/입력값 여부에 따른 라벨 축소·이동 로직
  components/
    form/
      Input.vue
      DateInput.vue
      Select.vue
    overlay/
      Modal.vue
    feedback/
      Toast.vue
  types/
    form.ts               # 여러 폼 컴포넌트가 공유하는 타입만 (컴포넌트 전용 타입은 SFC 내부)
  index.ts
```

- 컴포넌트 전용 스타일/타입은 해당 `.vue` SFC 안에 그대로 둔다 (`.scss`,
  `types.ts` 파일을 컴포넌트마다 억지로 분리하지 않음).
- `composables/`, `styles/mixins/`, `types/`로 뽑아내는 기준은 "2개 이상의
  컴포넌트가 실제로 재사용하는가"이다.
- `components/` 하위 카테고리 폴더(`form`, `overlay`, `feedback`)는
  `index.ts`의 `import.meta.glob('./components/**/*.vue')`가 재귀적으로
  잡아주므로 추가 설정이 필요 없다.

## 9. Select 컴포넌트

`Input`과 동일하게 `useFieldValidation`/`useFloatingLabel`을 재사용하고, `lib-select`
BEM 클래스(scoped 미사용)로 구현했다.

- `labelPosition`(top/left/inside), `required`+`validator` 검증, `errorPosition`은
  `Input`과 동일한 규칙
- `searchable` prop: 트리거가 텍스트 input으로 바뀌어 입력한 검색어로 옵션을
  필터링하고, 화살표 위/아래 + Enter로 필터링된 목록을 키보드로 탐색·선택
- `mobileBreakpoint`(기본 640px) 이하 뷰포트에서는 절대 위치 드롭다운 대신
  화면 하단에서 올라오는 bottomSheet로 열림 (`Teleport to="body"` + `Transition`).
  뷰포트 판별은 공용 composable `useIsMobile`(matchMedia 기반)을 사용 — Modal 등
  다른 오버레이 컴포넌트도 재사용할 수 있음
- 오버레이류가 공유하는 `--lib-z-index-overlay` 토큰을 `tokens.scss`에 추가함

## 10. Radio 컴포넌트

`Select`처럼 `options`(`SelectOption[]`, 재사용) + `v-model` 방식. 커스텀 원형을
그리지 않고 **네이티브 `<input type="radio">`를 그대로 쓰고 `accent-color:
var(--lib-color-primary)`로만 테마**를 입힌다 — 브라우저가 포커스 링, 그룹 내
화살표 키 탐색, 폼 시맨틱을 공짜로 처리해준다. 같은 그룹의 radio는 자동 생성된
`name`을 공유해야 하므로 `useId()`로 생성한 `groupId`를 기본 `name`으로 쓴다.

- `direction`: `'vertical' | 'horizontal'` — 옵션을 세로로 쌓을지 가로로 나열할지
- `labelPosition`은 `Input`/`Select`와 같은 `LabelPosition` 타입을 그대로 쓰지만
  `'inside'`는 라디오 그룹에 의미가 없어 `'top'`처럼 동작함(별도 타입을 만들지
  않고 전체 폼 컴포넌트의 prop 타입 일관성을 택함)
- `required`/`validator`/`errorPosition`, `useFieldValidation`·`useFieldClasses`
  재사용은 `Input`/`Select`와 동일
- `variant`: `'dot'`(기본, 네이티브 input은 숨기고 CSS로 그린 원형 인디케이터) /
  `'button'`(토글 버튼처럼 보이는 스타일). 겉모습만 CSS로 스위치되고
  클릭/키보드/validation 로직은 동일 — `--lib-color-on-primary` 토큰을 이때
  추가함(선택된 버튼 배경 위 텍스트 색)
- `SelectOption.icon`(`OptionIcon = string | { src, alt? }`): 옵션 라벨 앞에
  이모지/텍스트 또는 이미지를 표시. `isImageIcon()` 타입가드로 구분해서
  이미지면 `<img>`(16x16, `object-fit: contain`), 아니면 텍스트로 렌더링.
  Radio/Checkbox 둘 다, dot/box·button variant 모두에서 동일하게 동작함.
  완전히 다른 아이콘(컴포넌트 등)은 `#option` 슬롯으로 오버라이드.

## 11. Checkbox 컴포넌트

`Radio`와 동일한 뼈대(`options`, `useFieldClasses`, BEM `lib-checkbox-group`,
`variant`)를 쓰되 두 가지 모드를 하나의 컴포넌트로 지원한다.

- **`options`를 생략** → 단일 boolean 체크박스 (예: 약관 동의). `v-model`이 `boolean`.
- **`options`를 지정** → 다중 선택 그룹. `v-model`이 `(string | number)[]`.
- 내부적으로 단일 모드도 "옵션 하나짜리 그룹"(`normalizedOptions`)으로 취급해서
  렌더링/선택(`toggleOption`) 로직을 하나로 통일함 — 템플릿을 두 벌 만들지 않음.
- 체크 모양은 원+점이 아니라 사각형(`--lib-radius-sm`) + 회전된 테두리로 그린
  체크마크. 체크되면 배경이 `--lib-color-primary`로 채워지고 체크마크는
  `--lib-color-on-primary` (라디오의 "테두리만 강조 + 속 점" 스타일과 의도적으로
  다르게 해서 라디오/체크박스가 시각적으로 구분되게 함).
- `variant`: `'box'`(기본) / `'button'` — Radio와 동일한 토글 버튼 스타일 재사용.
- `useFieldValidation`에 `isEmpty` 커스텀 옵션을 추가해 일반화함 — Checkbox는
  "비어있음"의 기준이 `false`/빈 배열이라 기존 null/undefined/'' 기준과 다름.
  `FieldValidator`/`useFieldValidation`이 제네릭(`<T>`)이 되었고, 기존
  Input/Select/Radio 호출부는 변경 없이 그대로 동작함.

## 12. 2026-09-05 정리 작업

폴더 구조를 다시 잡기 전 단계로, 기존 Quasar 기반 앱(특정 트레이딩 플랫폼)에서
그대로 넘어온 불필요한 코드를 전부 삭제했다.

- 삭제: `src/components/common/*`(form/modal/chart/grid), `src/css/*`,
  `src/assets/*`(로고·아이콘·Pretendard 폰트 포함), `src/composables`,
  `src/plugins`, `src/utils`, `src/style.css`, `public/icons.svg`
- `package.json`에서 quasar 계열 3종과 echarts/highcharts/apexcharts/uplot/
  vue-virtual-scroller 제거, `vue`만 dependency로 유지
- `vite.config.ts`의 quasar 플러그인/외부화 설정 제거
- `main.ts`를 Quasar/Pinia 등록 없는 순수 `createApp(App).mount()`로 교체
- `App.vue`를 빈 데모 셸로 교체 (컴포넌트 추가 시 여기서 미리보기)
- Pretendard 폰트는 라이브러리가 특정 폰트를 강제하지 않는다는 원칙에 따라
  삭제하기로 결정함 (소비 프로젝트 폰트를 그대로 상속)

## 13. 색상 토큰 체계 정리 (2026-10-02)

디자인 확정 전에 색상 구조를 먼저 잡아두기 위해, 색을 역할(semantic) 기준 토큰으로
정리했다. 상세 명세와 디자이너 확인 항목은 [COLOR-TOKENS.md](COLOR-TOKENS.md) 참고.

- 이름 규칙: `--lib-color-<역할>[-<상태/변형>]`. 색 이름(blue 등)은 쓰지 않는다.
- 그룹: Brand / Text / Surface / Border / Feedback
- 기존 토큰 이름은 그대로 두고 값도 바꾸지 않았다. 빌드된 CSS에서 모든 var()를
  실제 값으로 치환해 비교한 결과 선언 442개가 전부 동일함을 확인했다(화면 변화 없음).
- 의미가 섞여 있던 두 곳을 분리했다 (기본값이 같아 겉모습은 동일).
  - Select 옵션의 hover/활성 배경: `--lib-color-bg-disabled` → `--lib-color-bg-hover`
  - Radio/Checkbox의 hover 테두리: `--lib-color-border-focus` → `--lib-color-border-hover`
  - 비활성 테두리: `--lib-color-border` → `--lib-color-border-disabled`
  - 포커스 링: `--lib-color-border-focus` → `--lib-color-focus-ring`
  - placeholder/비활성 글자: `--lib-color-text-muted` → `-placeholder` / `-disabled`
  - 드롭다운·bottomSheet 배경: `--lib-color-bg` → `--lib-color-bg-raised`
- Modal/Toast에서 쓸 색(success/warning/info, text-inverse, bg-subtle 등)은 값만
  미리 정의해두고 아직 사용하지 않는다. 디자인 확정 시 값만 교체하면 된다.
- 검증 스크립트: 빌드 CSS의 var()를 재귀 치환해 선언 단위로 정렬 비교하는 방식.
  브라우저 렌더링에 의존하지 않아 토큰 리팩터링마다 재사용할 수 있다.
