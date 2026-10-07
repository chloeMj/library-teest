# 색상 토큰 명세 (디자이너 요청서)

컴포넌트 라이브러리에서 쓸 색 체계입니다. 이 문서의 형식대로 Figma 변수를 만들어
주시면, 시안에 적힌 변수 이름을 그대로 코드로 옮길 수 있습니다.

- 코드상 정의: [src/styles/tokens.scss](../src/styles/tokens.scss) (Semantic),
  [src/styles/palette.scss](../src/styles/palette.scss) (Primitive)
- 현재 색값은 디자인 확정 전까지 쓰는 임시값입니다.

---

## 1. 컬렉션 구조

Figma Variables에 **컬렉션 2개**를 만듭니다.

| | Primitives | Semantic |
|---|---|---|
| 예시 이름 | `Gray/100`, `Brand/500` | `surface/default`, `text/muted` |
| 값 | 실제 색값 (`#eff1f5`) | 다른 변수를 가리킴 (→ `Gray/100`) |
| 모드 | 없음 (한 벌 고정) | **Light / Dark 2개** |
| 시안 레이어에 적용 | 사용하지 않음 | 이것만 사용 |

### 규칙

1. **시안 레이어에는 Semantic 변수만 적용합니다.** Primitive를 직접 칠하거나 색값을
   직접 입력하면, 다크 모드에서 어떤 색이 되어야 하는지 알 수 없습니다.
2. **Primitive 값은 모드에 따라 바뀌지 않습니다.** `Gray/900`은 라이트에서도
   다크에서도 같은 색입니다. 모드에 따라 달라지는 것은 "어느 단계를 가리키는가"입니다.
3. 다크 모드는 명도 반전이 아닙니다. 아래 Semantic 표의 Dark 열대로 단계를 지정합니다.

---

## 2. Primitives — 채워 주실 색

### 이름 규칙

```
<계열>/<단계>        예) Gray/100, Brand/500, Red/50
```

단계는 숫자가 클수록 어둡습니다. 단계별 쓰임새는 모든 계열이 동일합니다.

| 단계 | 쓰임 |
|---|---|
| 0 | 흰색 (Gray 계열에만) |
| 50 | 가장 옅은 배경 |
| 100 | 옅은 배경 / 옅은 테두리 |
| 200 | 테두리 |
| 300 | 진한 테두리 / 다크 모드 보조 글자 |
| 400 | 보조 요소 / 다크 모드 기본색 |
| **500** | **기본색** |
| 600 | hover |
| 700 | 누름(active) |
| 800 | 본문 글자 |
| 900 | 가장 진한 글자 / 다크 모드 배경 |

### 필요한 계열

| 계열 | 단계 | 비고 |
|---|---|---|
| Gray | 0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 | 배경·테두리·글자 |
| Brand | 50 ~ 900 | 주조색 |
| Red | 50 ~ 900 | 에러 |
| Amber | 50 ~ 900 | 경고 |
| Green | 50 ~ 900 | 성공 |
| Blue | 50 ~ 900 | 안내 |
| 확장 (Orange, Teal, Navy, Purple 등) | 500만 | 차트·뱃지 항목 구분용 |

### 조건

- 같은 계열 안에서 색조(hue)를 일정하게 유지합니다. 중간 단계만 중립 회색이 되는 식은
  연속된 배경·테두리에서 색감이 튑니다.
- `500` 단계는 흰 글자를 올렸을 때 대비 **4.5:1 이상**이어야 합니다 (WCAG AA).
  버튼 배경으로 쓰이기 때문입니다.
- 옅은 배경(50, 100)은 투명도(rgba) 대신 **불투명 값**으로 주세요. 투명도는 배경이
  흰색이 아닌 곳에서 색이 달라집니다.
- 중간값(150, 250 등)은 두지 않습니다. 단계가 부족하면 전 계열에 동일하게 추가합니다.

---

## 3. Semantic — 모드별 연결

각 변수에 Light / Dark 모드별로 가리킬 Primitive를 지정합니다.
오른쪽 CSS 변수는 개발에서 쓰는 이름이며 1:1로 대응합니다.

### Surface (배경)

| Figma 변수 | Light | Dark | CSS 변수 |
|---|---|---|---|
| `surface/default` | Gray/0 | Gray/900 | `--ui-surface-default` |
| `surface/subtle` | Gray/50 | Gray/800 | `--ui-surface-subtle` |
| `surface/hover` | Gray/100 | Gray/700 | `--ui-surface-hover` |
| `surface/selected` | Brand/50 | Brand/900 | `--ui-surface-selected` |
| `surface/disabled` | Gray/100 | Gray/700 | `--ui-surface-disabled` |
| `surface/raised` | Gray/0 | Gray/800 | `--ui-surface-raised` |

> `surface/raised`는 드롭다운·모달처럼 떠 있는 레이어입니다. 라이트에서는 그림자로,
> 다크에서는 배경보다 밝은 색으로 띄웁니다.

### Border (테두리)

| Figma 변수 | Light | Dark | CSS 변수 |
|---|---|---|---|
| `border/default` | Gray/200 | Gray/600 | `--ui-border-default` |
| `border/strong` | Gray/400 | Gray/400 | `--ui-border-strong` |
| `border/focus` | Brand/500 | Brand/400 | `--ui-border-focus` |

### Text (글자)

| Figma 변수 | Light | Dark | CSS 변수 |
|---|---|---|---|
| `text/default` | Gray/900 | Gray/0 | `--ui-text-default` |
| `text/muted` | Gray/500 | Gray/300 | `--ui-text-muted` |
| `text/placeholder` | Gray/500 | Gray/400 | `--ui-text-placeholder` |
| `text/disabled` | Gray/500 | Gray/500 | `--ui-text-disabled` |
| `text/inverse` | Gray/0 | Gray/900 | `--ui-text-inverse` |

### Primary (주요 액션)

| Figma 변수 | Light | Dark | CSS 변수 |
|---|---|---|---|
| `primary/default` | Brand/500 | Brand/400 | `--ui-primary-default` |
| `primary/hover` | Brand/600 | Brand/300 | `--ui-primary-hover` |
| `primary/active` | Brand/700 | Brand/500 | `--ui-primary-active` |
| `primary/subtle` | Brand/50 | Brand/900 | `--ui-primary-subtle` |
| `primary/on` | Gray/0 | Gray/900 | `--ui-primary-on` |

> `primary/on`은 primary 배경 위에 올라가는 글자색입니다.

### Feedback (상태)

| Figma 변수 | Light | Dark | CSS 변수 |
|---|---|---|---|
| `danger/default` | Red/500 | Red/300 | `--ui-danger-default` |
| `danger/subtle` | Red/50 | Red/900 | `--ui-danger-subtle` |
| `success/default` | Green/500 | Green/300 | `--ui-success-default` |
| `success/subtle` | Green/50 | Green/900 | `--ui-success-subtle` |
| `warning/default` | Amber/500 | Amber/300 | `--ui-warning-default` |
| `warning/subtle` | Amber/50 | Amber/900 | `--ui-warning-subtle` |
| `info/default` | Blue/500 | Blue/300 | `--ui-info-default` |
| `info/subtle` | Blue/50 | Blue/900 | `--ui-info-subtle` |

---

## 4. 확인이 필요한 사항

1. **Gray 단계 수** — 11단계가 적정한지. 부족하거나 과한지
2. **Brand와 Success** — 둘 다 초록 계열이면 구분이 어렵습니다. 분리할지, 합칠지
3. **hover / active** — Brand의 600 / 700 단계로 충분한지, 별도 색이 필요한지
4. **다크 모드 대비** — 위 표의 Dark 열 조합이 시안 의도와 맞는지
5. **확장 계열** — 차트·뱃지에 필요한 색 수

---

## 5. 전달 방식

아래 중 편한 방식이면 됩니다.

- Figma 파일 공유 (Variables 패널에서 확인)
- Variables 내보내기 (JSON)
- 표 형태 (계열 × 단계 색값 + Semantic 연결)

## 6. 체크리스트

- [ ] Primitives 컬렉션 생성 (모드 없음)
- [ ] Semantic 컬렉션 생성 (Light / Dark 2개 모드)
- [ ] Semantic 변수가 Primitive를 가리키도록 연결
- [ ] 시안 레이어에 Semantic 변수 적용 (직접 색값 입력 없음)
- [ ] Brand/500 흰 글자 대비 4.5:1 이상 확인
- [ ] 다크 모드 시안에서 본문 글자 대비 4.5:1 이상 확인
