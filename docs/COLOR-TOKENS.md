# 색상 토큰

이 라이브러리가 쓰는 색은 아래 **역할 토큰 31개**가 전부입니다. 컴포넌트는 이것만
참조하므로, 값만 채워지면 어떤 팔레트를 쓰든 동작합니다.

- 정의: [src/styles/tokens.scss](../src/styles/tokens.scss)
- 기본 팔레트(선택): [src/styles/palette.scss](../src/styles/palette.scss) → `dist/palette.css`
- 설계 배경: [DESIGN.md](DESIGN.md) 4장

## 쓰는 쪽에서 바꾸는 법

```scss
:root {
  --ui-primary-default: #ff5722;
  --ui-border-default: #cccccc;
}
```

팔레트 단계(`--ui-gray-100` 등)를 쓰든, 위처럼 색값을 직접 넣든 상관없습니다.
**라이브러리가 요구하는 것은 아래 토큰의 값뿐입니다.** 다만 다크 모드를 쓴다면
라이트/다크 두 값이 필요하므로, 팔레트 단계를 경유하는 쪽이 관리하기 쉽습니다.

## 이름 규칙

```
--ui-<그룹>-<역할>        예) --ui-surface-default, --ui-text-muted
```

그룹은 `surface`(배경) / `border`(테두리) / `text`(글자) / `primary`(주요 액션) /
`danger`·`success`·`warning`·`info`(상태)입니다. 색 이름(blue 등)은 쓰지 않습니다 —
다크 모드에서 실제 색이 달라지기 때문입니다.

---

## Surface — 배경

| 토큰 | 용도 | 기본 팔레트 (Light / Dark) |
|---|---|---|
| `--ui-surface-default` | 입력 박스, 카드 등 기본 표면 | Gray/0 · Gray/900 |
| `--ui-surface-subtle` | 한 단계 눌린 배경 (영역 구분, 헤더) | Gray/50 · Gray/800 |
| `--ui-surface-hover` | 목록 항목 hover·키보드 이동 | Gray/100 · Gray/700 |
| `--ui-surface-selected` | 선택된 항목 배경 | Brand/50 · Brand/900 |
| `--ui-surface-disabled` | 비활성 입력 박스 | Gray/100 · Gray/700 |
| `--ui-surface-raised` | 떠 있는 레이어 (드롭다운, Modal, Toast) | Gray/0 · Gray/800 |
| `--ui-surface-backdrop` | 오버레이 뒤 딤 | 검정 40% · 60% |

> `surface-raised`는 라이트에서 그림자로, 다크에서 배경보다 밝은 색으로 띄웁니다.
> 그래서 다크에서만 `surface-default`와 다른 값을 씁니다.

## Border — 테두리

| 토큰 | 용도 | 기본 팔레트 (Light / Dark) |
|---|---|---|
| `--ui-border-default` | 입력 박스, 구분선 | Gray/200 · Gray/600 |
| `--ui-border-strong` | 강조 테두리 | Gray/400 · Gray/400 |
| `--ui-border-focus` | 포커스·열림 상태 | Brand/500 · Brand/400 |
| `--ui-border-hover` | 마우스 올렸을 때 (기본은 focus와 같음) | Brand/500 · Brand/400 |
| `--ui-border-disabled` | 비활성 테두리 | Gray/200 · Gray/600 |
| `--ui-border-focus-ring` | 키보드 포커스 링(outline) | Brand/500 · Brand/400 |

## Text — 글자

| 토큰 | 용도 | 기본 팔레트 (Light / Dark) |
|---|---|---|
| `--ui-text-default` | 본문, 라벨, 입력값 | Gray/900 · Gray/0 |
| `--ui-text-muted` | 보조 설명, 아이콘 | Gray/500 · Gray/300 |
| `--ui-text-placeholder` | 입력 전 안내 문구 | Gray/500 · Gray/400 |
| `--ui-text-disabled` | 비활성 입력값 | Gray/500 · Gray/500 |
| `--ui-text-inverse` | 어두운 배경 위 글자 (Toast 등) | Gray/0 · Gray/900 |

## Primary — 주요 액션

| 토큰 | 용도 | 기본 팔레트 (Light / Dark) |
|---|---|---|
| `--ui-primary-default` | 포커스 테두리, 선택 표시, 버튼 배경 | Brand/500 · Brand/400 |
| `--ui-primary-hover` | hover | Brand/600 · Brand/300 |
| `--ui-primary-active` | 누름 | Brand/700 · Brand/500 |
| `--ui-primary-subtle` | 옅은 강조 배경 | Brand/50 · Brand/900 |
| `--ui-primary-on` | primary 배경 위 글자·아이콘 | Gray/0 · Gray/900 |

> `--ui-primary-default`를 직접 덮어쓰면 **다크 모드에서 풀립니다.** 다크 블록이
> 팔레트 단계를 다시 가리키기 때문입니다. 팔레트(`--ui-brand-*`)를 바꾸세요.

## Feedback — 상태

| 토큰 | 용도 | 기본 팔레트 (Light / Dark) |
|---|---|---|
| `--ui-danger-default` | 에러 메시지, 필수 표시, 에러 테두리 | Red/500 · Red/300 |
| `--ui-danger-subtle` | 에러 배경 | Red/50 · Red/900 |
| `--ui-success-default` / `-subtle` | 성공 (Toast 등, 아직 미사용) | Green/500·300 / Green/50·900 |
| `--ui-warning-default` / `-subtle` | 경고 (미사용) | Amber/500·300 / Amber/50·900 |
| `--ui-info-default` / `-subtle` | 안내 (미사용) | Blue/500·300 / Blue/50·900 |

---

## 토큰을 늘릴 때

**컴포넌트가 실제로 쓰거나, 다음에 만들 컴포넌트가 확실히 쓰는 것만** 공개합니다.
한 번 내보내면 소비 프로젝트가 쓰기 시작해 되돌리기 어렵습니다.

프로젝트 화면에만 있는 개념(사이드바 배경, 업무용 뱃지 색 등)은 라이브러리가 아니라
프로젝트가 자기 토큰으로 정의합니다.

## Figma 연동

`npm run build:tokens`가 위 토큰을 Figma Variables로 가져갈 JSON으로 내보냅니다.
절차는 [design-tokens/README.md](../design-tokens/README.md)를 참고하세요.
