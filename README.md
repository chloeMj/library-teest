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

## 스타일 커스터마이징

디자인이 바뀌어도 컴포넌트를 새로 만들지 않고 대응할 수 있도록, 커스터마이징을
아래 3단계로 열어두고 있습니다 (설계 배경은 [docs/DESIGN.md](docs/DESIGN.md) 참고).

### 1. CSS 변수(토큰) 재정의 — 색상·간격·폰트 등

라이브러리 CSS(`library-test/dist/library-test.css`)를 불러온 뒤, 그보다 **나중에
로드되는** 프로젝트 스타일에서 `--lib-*` 변수만 재정의하면 됩니다. 선택자 명시도
경쟁이 없어서 `!important` 없이 값만 덮어씁니다.

```css
/* 프로젝트 전역 스타일 */
:root {
  --lib-color-primary: #ff5722;
  --lib-color-border: #ccc;
  --lib-radius-sm: 2px;
}
```

전체 변수 목록은 [src/styles/tokens.scss](src/styles/tokens.scss)를 참고하세요.

### 2. Variant prop으로 자주 쓰는 배치 전환

컴포넌트마다 자주 쓰이는 레이아웃 변형을 prop으로 제공합니다. 예를 들어
`Input`은 라벨 위치와 에러 메시지 위치를 prop 하나로 바꿀 수 있습니다.

```vue
<LibInput label="이름" label-position="left" />
<LibInput label="이름" label-position="inside" />
<LibInput label="이름" error-position="top" />
```

### 3. Slot으로 구조 자체 교체

prop으로도 안 되는 특이 케이스는 slot으로 완전히 갈아끼울 수 있습니다.

```vue
<LibInput v-model="keyword">
  <template #prefix>🔍</template>
</LibInput>
```

### 4. (필요 시) 클래스 직접 오버라이드

컴포넌트 스타일은 `scoped`를 쓰지 않고 `lib-<컴포넌트명>` 접두사의 BEM 클래스만
사용합니다. 위 방법으로도 부족하면 같은 명시도로 클래스를 직접 덮어쓸 수 있습니다.

```css
.lib-input__field {
  font-family: 'Pretendard', sans-serif;
}
```
