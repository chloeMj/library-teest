# 색상 토큰

컴포넌트는 tokens.scss의 **역할 토큰**만 참조합니다. 값만 채워지면 어떤 팔레트를 쓰든 동작합니다.

- 정의: [src/styles/tokens.scss](../src/styles/tokens.scss) — 팔레트와 역할 토큰이 한 파일에 있습니다
- 설계 배경: [DESIGN.md](DESIGN.md) 4장
- 바꾸는 방법: [README.md](../README.md#프로젝트-테마-파일-만들기)

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
| `--ui-border-default` | 카드, 구분선, 드롭다운 패널 (장식) | Gray/200 · Gray/600 |
| `--ui-border-control` | 입력 박스, 체크박스, 라디오, 버튼 경계 | Gray/400 · Gray/400 |
| `--ui-border-strong` | 강조 테두리 | Gray/600 · Gray/300 |
| `--ui-border-focus` | 포커스·열림 상태 | Brand/700 · Brand/400 |
| `--ui-border-hover` | 마우스 올렸을 때 (기본은 focus와 같음) | Brand/700 · Brand/400 |
| `--ui-border-disabled` | 비활성 테두리 | Gray/200 · Gray/600 |
| `--ui-border-focus-ring` | 키보드 포커스 링(outline) | Brand/700 · Brand/400 |

## Text — 글자

| 토큰 | 용도 | 기본 팔레트 (Light / Dark) |
|---|---|---|
| `--ui-text-default` | 본문, 라벨, 입력값 | Gray/900 · Gray/0 |
| `--ui-text-muted` | 보조 설명, 아이콘 | Gray/600 · Gray/300 |
| `--ui-text-placeholder` | 입력 전 안내 문구 | Gray/600 · Gray/400 |
| `--ui-text-disabled` | 비활성 입력값 | Gray/500 · Gray/500 |
| `--ui-text-inverse` | 어두운 배경 위 글자 (Toast 등) | Gray/0 · Gray/900 |

## Primary — 주요 액션

| 토큰 | 용도 | 기본 팔레트 (Light / Dark) |
|---|---|---|
| `--ui-primary-default` | 포커스 테두리, 선택 표시, 버튼 배경 | Brand/700 · Brand/400 |
| `--ui-primary-hover` | hover | 자동 계산 (default에 on 8%) |
| `--ui-primary-active` | 누름 | 자동 계산 (default에 on 12%) |
| `--ui-primary-subtle` | 옅은 강조 배경 | Brand/50 · Brand/900 |
| `--ui-primary-on` | primary 배경 위 글자·아이콘 | Gray/0 · Gray/900 |

> hover/active는 default에서 `color-mix()`로 계산합니다. 프로젝트는 **default와 on만**
> 바꾸면 되고, hover/active는 따라옵니다. Figma에는 계산된 색이 들어갑니다.
>
> 라이트 모드가 500이 아니라 **700**을 쓰는 이유는 명암비입니다. Brand/500은
> 흰 배경에서 3.20:1이라 글자·버튼 배경으로 쓸 수 없습니다. 다크 모드는 배경이
> 어두워 Brand/400으로 충분합니다.

## Secondary — 보조

| 토큰 | 용도 | 기본 팔레트 (Light / Dark) |
|---|---|---|
| `--ui-secondary-default` | 강조하지 않는 버튼 배경·글자 | Gray/900 · Gray/0 |
| `--ui-secondary-hover` / `-active` | hover·누름 | 자동 계산 (primary와 같은 식) |
| `--ui-secondary-on` | secondary 배경 위 글자·아이콘 | Gray/0 · Gray/900 |

> 기본은 본문 글자와 같은 회색 계열입니다. 프로젝트에 보조색(남색 등)이 있으면
> default/on만 바꾸세요. outlined 테두리는 `--ui-border-control`을 씁니다.

## Feedback — 상태

| 토큰 | 용도 | 기본 팔레트 (Light / Dark) |
|---|---|---|
| `--ui-danger-default` | 에러 메시지, 필수 표시, 에러 테두리 | Red/700 · Red/300 |
| `--ui-danger-hover` / `-active` | danger 버튼 hover·누름 | 자동 계산 (primary와 같은 식) |
| `--ui-danger-subtle` | 에러 배경 | Red/50 · Red/900 |
| `--ui-danger-on` | danger 배경 위 글자·아이콘 | Gray/0 · Gray/900 |
| `--ui-success-default` / `-subtle` | 성공 (Toast 등, 아직 미사용) | Green/500·300 / Green/50·900 |
| `--ui-warning-default` / `-subtle` | 경고 (미사용) | Amber/500·300 / Amber/50·900 |
| `--ui-info-default` / `-subtle` | 안내 (미사용) | Blue/500·300 / Blue/50·900 |

미사용 토큰(success·warning·info)은 아직 `check:contrast` 대상이 아닙니다.
컴포넌트가 실제로 글자색으로 쓰기 시작할 때 danger와 같이 700 단계로 내리고
검사 목록에 추가하세요.

---

## 명암비 기준

팔레트 값을 바꿀 때 아래 조합은 반드시 기준을 넘겨야 합니다. 라이트·다크 모드를
각각 봅니다.

| 조합 | 기준 | 근거 |
| --- | --- | --- |
| 본문·보조·안내 글자 vs 배경 | 4.5:1 | WCAG 2.2 AA 1.4.3 |
| primary 버튼 글자 vs 버튼 배경 | 4.5:1 | 〃 |
| 에러 글자 vs 배경 | 4.5:1 | 〃 |
| 입력 박스·포커스 테두리 vs 배경 | 3:1 | WCAG 2.2 AA 1.4.11 |

`--ui-text-disabled`는 1.4.3의 비활성 요소 예외라 검사하지 않습니다.

```bash
npm run check:contrast
```

미달이면 종료 코드 1로 끝납니다. 색조와 톤은 디자이너가 정하고, 퍼블리셔는 이
숫자만 확인하면 됩니다.

**이 검사는 라이브러리 기본 팔레트에만 적용됩니다.** 설치한 프로젝트가
`--ui-gray-600` 등을 재정의하면 그때부터는 그 프로젝트가 직접 확인해야 합니다.


## Figma 연동

`npm run build:tokens`가 위 토큰을 Figma Variables로 가져갈 JSON으로 내보냅니다.
절차는 [design-tokens/README.md](../design-tokens/README.md)를 참고하세요.
