# 색상 토큰 명세 (디자인 확정용)

이 라이브러리의 모든 색은 아래 토큰으로만 지정됩니다. 디자인이 확정되면
**토큰 이름은 그대로 두고 값만 교체**하면 전체 컴포넌트에 반영됩니다.

- 정의 위치: [src/styles/tokens.scss](../src/styles/tokens.scss)
- 현재 값은 디자인 확정 전까지 쓰는 **임시값**입니다.
- 소비 프로젝트에서 바꿀 때는 라이브러리 CSS를 불러온 뒤 `:root`에서 재정의합니다.

```css
:root {
  --lib-color-primary: #ff5722;
  --lib-color-border: #cccccc;
}
```

## 토큰 층 구조

색은 세 층으로 나눠 관리합니다. 이 문서가 다루는 건 **2층(역할 토큰)**입니다.

| 층 | 예시 | 들어가는 곳 | 상태 |
|---|---|---|---|
| 1. 팔레트 | `--gray-100`, `--primary` | 라이브러리의 회사 테마 파일 | **예정** (별도 작업) |
| 2. 역할 | `--lib-color-border` | `src/styles/tokens.scss` | 이 문서 |
| 3. 프로젝트 예외 | 프로젝트에서 2층을 재정의 | 각 소비 프로젝트 | 프로젝트 담당 |

컴포넌트는 **2층만** 참조합니다. 1층이 생기면 2층의 값이 `var(--gray-300)`처럼
팔레트를 가리키도록 바뀌고, 컴포넌트와 토큰 이름은 그대로 유지됩니다.

## 이름 규칙

```
--lib-color-<역할>[-<상태/변형>]
```

- **역할**: `primary`, `text`, `bg`, `border`, `error` 등 쓰임새로 부릅니다.
  "blue", "gray" 같은 색 이름은 쓰지 않습니다. 디자인이 바뀌어도 이름이 유지되도록.
- **상태**: `hover`, `active`, `focus`, `disabled`
- **변형**: `subtle`(옅은 배경), `strong`(진한), `inverse`(반전), `on-*`(그 배경 위 글자색)

---

## 1. Brand — 주요 액션·강조

| 토큰 | 현재값 | 쓰이는 곳 |
|---|---|---|
| `--lib-color-primary` | `#2563eb` | 포커스 테두리, 선택된 항목, 체크 표시 배경 |
| `--lib-color-primary-hover` | `#1d4ed8` | (예정) 버튼 hover |
| `--lib-color-primary-active` | `#1e40af` | (예정) 버튼 누름 |
| `--lib-color-primary-subtle` | `#eff6ff` | 선택 항목 배경 등 옅은 강조 |
| `--lib-color-on-primary` | `#ffffff` | primary 배경 위 글자·체크 표시 |

## 2. Text — 글자

| 토큰 | 현재값 | 쓰이는 곳 |
|---|---|---|
| `--lib-color-text` | `#18181b` | 본문, 라벨, 입력값 |
| `--lib-color-text-muted` | `#71717a` | 보조 설명, 아이콘, 단위 |
| `--lib-color-text-placeholder` | muted와 동일 | 입력 전 안내 문구 |
| `--lib-color-text-disabled` | muted와 동일 | 비활성 입력값 |
| `--lib-color-text-inverse` | `#ffffff` | (예정) 어두운 배경 위 글자 (Toast) |

## 3. Surface — 배경

| 토큰 | 현재값 | 쓰이는 곳 |
|---|---|---|
| `--lib-color-bg` | `#ffffff` | 입력 박스, 기본 표면 |
| `--lib-color-bg-subtle` | `#fafafa` | (예정) 영역 구분, 헤더 |
| `--lib-color-bg-hover` | `#f4f4f5` | 목록 항목 hover·키보드 이동 |
| `--lib-color-bg-selected` | primary-subtle와 동일 | (예정) 선택된 항목 배경 |
| `--lib-color-bg-disabled` | `#f4f4f5` | 비활성 입력 박스 |
| `--lib-color-bg-raised` | bg와 동일 | 드롭다운, bottomSheet, (예정) Modal·Toast |
| `--lib-color-backdrop` | `rgba(0,0,0,0.4)` | 오버레이 뒤 딤 |

## 4. Border — 테두리

| 토큰 | 현재값 | 쓰이는 곳 |
|---|---|---|
| `--lib-color-border` | `#d4d4d8` | 입력 박스, 구분선 |
| `--lib-color-border-strong` | `#a1a1aa` | (예정) 강조 테두리 |
| `--lib-color-border-focus` | primary와 동일 | 포커스·열림 상태 테두리 |
| `--lib-color-border-hover` | focus와 동일 | 마우스 올렸을 때 테두리 |
| `--lib-color-border-disabled` | border와 동일 | 비활성 테두리 |
| `--lib-color-focus-ring` | focus와 동일 | 키보드 포커스 링(outline) |

## 5. Feedback — 상태 전달

| 토큰 | 현재값 | 쓰이는 곳 |
|---|---|---|
| `--lib-color-error` | `#dc2626` | 에러 메시지, 필수 표시, 에러 테두리 |
| `--lib-color-error-subtle` | `#fef2f2` | (예정) 에러 배경 |
| `--lib-color-success` | `#16a34a` | (예정) 성공 Toast |
| `--lib-color-success-subtle` | `#f0fdf4` | (예정) 성공 배경 |
| `--lib-color-warning` | `#d97706` | (예정) 경고 |
| `--lib-color-warning-subtle` | `#fffbeb` | (예정) 경고 배경 |
| `--lib-color-info` | `#0284c7` | (예정) 안내 |
| `--lib-color-info-subtle` | `#f0f9ff` | (예정) 안내 배경 |

---

## 디자인 요청 시 체크리스트

디자이너에게 확인받을 항목입니다. **(예정)** 표시는 아직 쓰는 컴포넌트가 없고,
Modal·Toast 등이 추가되면 사용됩니다.

1. **Primary 계열 3단계** — 기본 / hover / 누름 색이 각각 필요합니다.
2. **글자색 단계** — 본문, 보조 설명, placeholder가 같은 색인지 다른지.
3. **hover와 focus 구분** — 지금은 같은 색입니다. 다르게 할지 결정이 필요합니다.
4. **선택 항목 표시 방식** — 지금은 글자색만 바뀝니다. 배경까지 칠할지.
5. **상태 색 4종** — 에러 / 성공 / 경고 / 안내. 각각 글자색과 옅은 배경색.
6. **다크 모드 지원 여부** — 지원한다면 위 토큰의 다크 버전 값이 한 벌 더 필요합니다.
7. **색 대비** — 글자와 배경의 대비가 WCAG AA(4.5:1) 이상인지. 특히 muted 계열.
8. **팔레트 단계** — 1층 팔레트를 만들 때 필요합니다. 아래 단위로 요청합니다.

| 요청 항목 | 보통 필요한 단계 |
|---|---|
| 회색(중립) | 5~7단계 — 배경 2, 테두리 2, 글자 2~3 |
| 브랜드 색 | 3~4단계 — 기본, hover, 누름, 옅은 배경 |
| 상태 색 | 각 2단계 — 본색 + 옅은 배경 (에러/성공/경고/안내) |

## 아직 토큰으로 열지 않은 것

- **그림자 색** — `--lib-shadow-*`로 그림자 전체를 토큰화할 때 함께 다룹니다.
- **다크 모드 전용 토큰 세트** — 지원 여부 확정 후 구조를 정합니다.
- **컴포넌트 전용 색 토큰**(예: `--lib-input-border-color`) — 전역 토큰으로
  부족한 경우가 생기면 그때 한 겹 더 둡니다. 지금은 토큰 수를 늘리지 않습니다.
