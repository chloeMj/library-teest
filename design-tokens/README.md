# Figma 가져오기용 토큰 JSON

`npm run build:tokens`으로 생성됩니다. 손으로 고치지 마세요 — 원본은
[src/styles/palette.scss](../src/styles/palette.scss)와
[src/styles/tokens.scss](../src/styles/tokens.scss)입니다.

| 파일 | Figma 컬렉션 | 모드 |
|---|---|---|
| `primitives.tokens.json` | Primitives | Mode 1 |
| `Light.tokens.json` | Semantic | Light |
| `Dark.tokens.json` | Semantic | Dark |

형식은 **Figma가 변수를 Export할 때 내보내는 것과 같습니다.** 파일 하나가
"컬렉션의 모드 하나"에 대응하고, 가져올 때 파일 이름이 그대로 모드 이름이
됩니다. 그래서 파일 이름을 바꾸지 마세요.

색은 `$value: { colorSpace, components, alpha, hex }`로, 별칭은
`$extensions."com.figma.aliasData"`에 대상 변수 이름으로 들어갑니다.

## 가져오는 순서

**반드시 Primitives를 먼저 가져옵니다.** Semantic이 Primitive를 별칭으로
참조하기 때문에, 대상 변수가 없으면 연결이 끊긴 채로 들어옵니다.

1. `primitives.tokens.json` → Primitives 컬렉션
2. `Light.tokens.json` → Semantic 컬렉션의 Light 모드
3. `Dark.tokens.json` → Semantic 컬렉션의 Dark 모드

이미 컬렉션이 있으면 같은 순서로 다시 가져오면 됩니다. 이름이 같은 변수는
값이 덮어써지고, 새 변수(예: `border/control`)는 추가됩니다. Figma에서
지운 적이 없다면 기존 변수를 쓰던 디자인은 그대로 따라옵니다.

## 확인

가져온 뒤 아래가 맞는지 보면 됩니다.

- Primitives의 값이 모두 실제 색값인지
- Semantic의 값이 색값이 아니라 **Primitive를 가리키는 별칭**인지
- Semantic에 Light / Dark 두 모드가 있는지

토큰 목록은 [docs/COLOR-TOKENS.md](../docs/COLOR-TOKENS.md)를 참고하세요.
