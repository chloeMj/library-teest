# library-test

Quasar 등 UI 프레임워크 의존성 없이, 디자인 변경에 유연하게 대응할 수 있도록 만드는
커스텀 Vue 3 UI 컴포넌트 라이브러리입니다.

설계 방향은 [docs/DESIGN.md](docs/DESIGN.md)를 참고하세요.

## 개발

```
npm install
npm run dev
```

## 빌드

```
npm run build
```

## 다른 프로젝트에서 설치

```
npm i https://github.com/chloeMj/library-teest.git
```

```ts
// main.ts
import LibraryTest from 'library-test'
import 'library-test/dist/library-test.css'

app.use(LibraryTest)
```

`app.use`로 전역 등록하면 `<UiInput>` `<UiSelect>` `<UiRadio>` `<UiCheckbox>`를
import 없이 쓸 수 있습니다. 개별 import도 가능합니다.

```ts
import { UiInput } from 'library-test'
```

## TypeScript

빌드 시 타입 선언(`dist/*.d.ts`)이 함께 생성되므로 추가 설정 없이 동작합니다.

### v-model 값 타입

컴포넌트가 받을 수 있는 값의 범위에 맞춰 ref를 선언하세요. 좁게 선언하면
`strictTemplates`를 켠 프로젝트에서 타입 오류가 납니다.

```ts
// Input — text/number를 모두 받으므로
const name = ref<string | number | null>('')

// Select / Radio — 옵션 value의 타입
const city = ref<string | number | null>(null)

// Checkbox — options 없으면 boolean, 있으면 배열
const agree = ref(false)
const interests = ref<(string | number)[]>([])
```

> 라이브러리가 `string | number | null`처럼 넓은 타입을 쓰는 이유는 하나의
> 컴포넌트가 여러 입력 타입을 처리하기 때문입니다. 좁은 타입(`ref('')`)으로
> 쓰고 싶다면 템플릿 검사를 끄거나(`strictTemplates: false`, Vue 기본값)
> 위처럼 넓게 선언하면 됩니다.

### 템플릿 검사 권장 설정

props 오타나 잘못된 값을 잡으려면 소비 프로젝트의 `tsconfig.app.json`에
아래를 추가하세요. Vue 기본값은 꺼져 있어서 `variant="없는값"` 같은 실수가
그냥 통과합니다.

```json
{
  "vueCompilerOptions": { "strictTemplates": true }
}
```

## 스타일 커스터마이징

디자인이 바뀌어도 컴포넌트를 새로 만들지 않고 대응할 수 있도록, 커스터마이징을
아래 3단계로 열어두고 있습니다 (설계 배경은 [docs/DESIGN.md](docs/DESIGN.md) 참고).

### 1. CSS 변수(토큰) 재정의 — 색상·간격·폰트 등

라이브러리 CSS(`library-test/dist/library-test.css`)를 불러온 뒤, 그보다 **나중에
로드되는** 프로젝트 스타일에서 `--ui-*` 변수만 재정의하면 됩니다. 선택자 명시도
경쟁이 없어서 `!important` 없이 값만 덮어씁니다.

전체 변수 목록은 [src/styles/tokens.scss](src/styles/tokens.scss)를 참고하세요.
아래는 프로젝트를 새로 시작할 때 쓰는 테마 파일 예시입니다.

#### 프로젝트 테마 파일 만들기

```
my-project/src/styles/ui-theme.scss   ← Quasar의 quasar.variables.scss 역할
```

```ts
// main.ts — 순서가 중요합니다. 라이브러리 CSS를 먼저 불러오세요.
import LibraryTest from 'library-test'
import 'library-test/dist/library-test.css'
import './styles/ui-theme.scss'

app.use(LibraryTest)
```

```scss
// ui-theme.scss
:root {
  // --- 브랜드 색 ---
  // 색은 "팔레트 단계"로 지정합니다. 라이트/다크가 각각 다른 단계를 쓰기 때문에,
  // --ui-primary-default를 직접 덮으면 다크 모드에서 풀립니다.
  --ui-brand-50: #ffeee8;    // 선택된 항목 등 옅은 배경
  --ui-brand-300: #ff8a65;   // 다크 모드 hover
  --ui-brand-400: #ff7043;   // 다크 모드 기본
  --ui-brand-500: #ff5722;   // 기본 (버튼 배경, 포커스 테두리)
  --ui-brand-600: #f4511e;   // hover
  --ui-brand-700: #e64a19;   // 누름(active)
  --ui-brand-900: #4a1505;   // 다크 모드 옅은 배경

  // --- 중립 색 (필요할 때만) ---
  --ui-gray-200: #d9d9d9;    // 입력 박스 테두리
  --ui-gray-500: #8c8c8c;    // 보조 글자
  --ui-gray-900: #1a1a1a;    // 본문 글자

  // --- 상태 색 ---
  --ui-red-500: #e53935;     // 에러
  --ui-green-500: #43a047;   // 성공

  // --- 모양 ---
  --ui-radius-sm: 2px;
  --ui-field-height: 40px;    // 입력 박스 최소 높이 (기본 auto)
  --ui-field-padding-y: 10px; // 입력 영역 상하 여백 (기본 --ui-spacing-sm)
  --ui-font-size-md: 13px;
}
```

`--ui-field-*`는 Input과 Select의 입력 박스에만 적용되는 치수 토큰입니다.
`--ui-spacing-sm`처럼 전역 값을 건드리면 Radio·Checkbox까지 함께 움직이므로,
입력 박스만 조절하고 싶을 때 이 둘을 쓰세요. 토큰을 새로 늘릴 때의 기준은
[docs/DESIGN.md](docs/DESIGN.md) 5장에 있습니다.

색 단계를 다 뽑기 어렵다면 **기본 단계만 먼저** 지정해도 됩니다. hover가 티나지
않는 것 외에는 문제없고, 나중에 디자인이 확정되면 나머지를 채우면 됩니다.

```scss
:root {
  --ui-brand-500: #ff5722;
  --ui-brand-600: #ff5722;  // hover도 일단 같은 색
  --ui-brand-400: #ff5722;  // 다크 모드도 같은 색
}
```

> 바꿀 수 있는 토큰 전체 목록은 [docs/COLOR-TOKENS.md](docs/COLOR-TOKENS.md)에 있습니다.

#### 세 가지 사용 방식

| 상황 | 설정 |
|---|---|
| 디자인이 아직 없다 | 코어만 불러옴 — 중립 톤으로 동작 |
| 기본 팔레트를 그대로 쓴다 | `palette.css`를 함께 불러옴 |
| 프로젝트 색이 따로 있다 | `:root`에서 `--ui-brand-500` 등을 재정의 |

```ts
import 'library-test/dist/library-test.css'
import 'library-test/dist/palette.css'   // 선택 사항
```

> `palette.css`의 값은 디자인 확정 전까지 쓰는 임시값입니다.
> 토큰 목록은 [docs/COLOR-TOKENS.md](docs/COLOR-TOKENS.md)를 참고하세요.

#### 다크 모드

별도 설정 없이 동작합니다. 적용 조건은 세 가지입니다.

| 조건 | 용도 |
|---|---|
| OS/브라우저가 다크 모드 | 자동 |
| `<html data-theme="dark">` | 사용자가 직접 고를 때 |
| `<body class="body--dark">` | Quasar 쓰던 프로젝트 호환 |

```ts
// 사용자가 테마를 고르는 기능
document.documentElement.dataset.theme = 'dark'    // 강제 다크
document.documentElement.dataset.theme = 'light'   // 강제 라이트
delete document.documentElement.dataset.theme      // OS 설정 따라가기
```

#### 내가 만든 화면에서도 같은 토큰 쓰기

라이브러리 컴포넌트가 아닌 영역도 같은 토큰을 쓰면 다크 모드가 자동으로 따라옵니다.

```scss
.my-card {
  background: var(--ui-surface-raised);
  border: 1px solid var(--ui-border-default);
  color: var(--ui-text-default);
}
```

### 2. Variant prop으로 자주 쓰는 배치 전환

컴포넌트마다 자주 쓰이는 레이아웃 변형을 prop으로 제공합니다. 예를 들어
`Input`은 라벨 위치와 에러 메시지 위치를 prop 하나로 바꿀 수 있습니다.

```vue
<UiInput label="이름" label-position="left" />
<UiInput label="이름" label-position="inside" />
<UiInput label="이름" error-position="top" />
```

### 3. Slot으로 구조 자체 교체

prop으로도 안 되는 특이 케이스는 slot으로 완전히 갈아끼울 수 있습니다.

```vue
<UiInput v-model="keyword">
  <template #prefix>🔍</template>
</UiInput>
```

### 4. (필요 시) 클래스 직접 오버라이드

컴포넌트 스타일은 `scoped`를 쓰지 않고 `ui-<컴포넌트명>` 접두사의 BEM 클래스만
사용합니다. 위 방법으로도 부족하면 같은 명시도로 클래스를 직접 덮어쓸 수 있습니다.

```css
.ui-input__field {
  font-family: 'Pretendard', sans-serif;
}
```
