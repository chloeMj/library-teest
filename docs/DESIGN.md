# UI 컴포넌트 라이브러리 설계 문서

> 이 문서는 **현재 구조와 그렇게 정한 이유**를 담습니다. 작업 이력은 git 히스토리에
> 있으므로 여기에 날짜별로 덧붙이지 않고, 구조가 바뀌면 해당 절을 고쳐 씁니다.

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

- CSS 변수는 소비 프로젝트의 명시도와 경쟁하지 않고 값만 덮어쓰므로 충돌이 없다.
- 클래스명은 `ui-` 접두사 + BEM으로 스코프한다 (`ui-input__label`).
- 내부 선택자는 얕게(단일 클래스) 유지해, 소비 측이 `!important` 없이 덮을 수 있게 한다.
- variant는 "자주 쓰는 배치 몇 가지"만, 그 이상은 slot으로 탈출구를 연다.

### 접두사 규칙

전역 등록 시 소비 프로젝트와 이름이 충돌하지 않도록 모두 `ui`로 통일한다.

| 대상 | 표기 |
|---|---|
| CSS 변수 | `--ui-surface-default`, `--ui-gray-100` |
| 클래스 | `.ui-input__field` |
| 컴포넌트 | `<UiInput>` (`index.ts`의 `PREFIX` 한 줄로 일괄 적용) |

소스 파일명은 접두사 없이 두고(`Input.vue`), `index.ts`가 glob으로 모아 접두사를
붙여 등록한다. 컴포넌트를 추가할 때 따로 신경 쓸 것이 없다.

## 4. 색상 토큰 구조

### 두 층

| 층 | 예 | 파일 | 성격 |
|---|---|---|---|
| 1. 팔레트(Primitive) | `--ui-gray-100`, `--ui-brand-500` | `styles/palette.scss` | "무슨 색인가". 모드와 무관하게 고정 |
| 2. 역할(Semantic) | `--ui-surface-default` | `styles/tokens.scss` | "어디에 쓰는가". 라이트/다크가 다른 단계를 가리킴 |

- 컴포넌트는 **2층만** 참조한다.
- 2층은 `var(--ui-gray-0, #ffffff)` 형태로 1층을 참조한다. 팔레트를 불러오지
  않으면 fallback(중립 톤)으로 동작하므로, 코어만 설치해도 완결된다.
- 이름은 Figma 변수와 1:1로 맞춘다. `surface/default` ↔ `--ui-surface-default`.
  변환 규칙이 "슬래시를 하이픈으로, `--ui-` 붙이기" 하나뿐이라 매핑표가 필요 없다.
- 1층(팔레트) 단계 체계는 라이브러리가 강제하지 않는다. 디자인 시스템에 이미
  체계가 있으면 그것을 따르고, 2층 토큰에 연결만 하면 된다. 기본 팔레트는
  `--ui-<계열>-<단계>`(0~900, 클수록 어두움) 규칙을 쓴다.

### 다크 모드

- 코어(`tokens.scss`)에서 기본 지원한다. 팔레트 없이도 중립 톤으로 동작한다.
- **팔레트 값을 반전시키지 않는다.** 2층이 가리키는 단계만 바꾼다. 그래야
  `--ui-gray-900`이 라이트/다크에서 같은 색이고, 시안의 "Gray/900"과 일치한다.
  (유채색은 반전이 불가능하므로 브랜드·상태 색은 밝은 단계로 옮긴다)
- 적용 조건은 `styles/mixins/_theme.scss`의 `dark` mixin에 한 번만 정의하고
  `tokens.scss`가 사용한다: OS 설정(`prefers-color-scheme`), `data-theme="dark"`,
  `body.body--dark`(Quasar 쓰던 프로젝트 호환). `data-theme="light"`로 라이트 강제.

### 공개 기준

Semantic 토큰은 **컴포넌트가 쓰거나, 다음에 만들 컴포넌트가 확실히 쓸 것**만
공개한다. 한 번 공개하면 소비 프로젝트가 쓰기 시작해 되돌리기 어렵다.
프로젝트 화면에만 있는 개념(사이드바 배경, 업무용 뱃지 색 등)은 라이브러리가
아니라 프로젝트가 자기 토큰으로 정의한다.

### Figma 연동

`npm run build:tokens`가 빌드된 CSS에서 `design-tokens/*.json`을 생성한다.
Figma 기본 Import가 읽는 형식이며, 파일 하나가 컬렉션의 모드 하나에 대응한다.
자세한 절차는 [design-tokens/README.md](../design-tokens/README.md) 참고.

## 5. 폴더 구조

컴포넌트 수가 늘어도 파일이 선형으로 불어나지 않도록, "컴포넌트 1개 = 파일 1개"를
기본으로 하고 여러 컴포넌트가 공유하는 것만 별도 계층으로 뺀다.

```
src/
  styles/
    tokens.scss           # 역할 토큰 + 다크 모드 (코어)
    palette.scss          # 팔레트 (선택 — dist/palette.css로 별도 빌드)
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

## 6. 폼 컴포넌트 공통 규칙

- `v-model` 필수
- 내장 validation: `required`, `max`(문자열 길이 또는 숫자 최댓값)
- 확장 validation: `validator` 함수를 주입받아 함께 평가
- 에러 메시지 위치: 기본 하단, `errorPosition`으로 변경 가능
- 라벨 위치: `labelPosition` = top / left / inside(floating)
- `defineExpose({ validate })` — 폼 제출 시 강제로 검증을 노출

## 7. 컴포넌트별 설계

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

## 8. 배포와 테스트

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
