# Figma 가져오기용 토큰 JSON

`npm run build:tokens`으로 생성됩니다. 손으로 고치지 마세요 — 원본은
[src/styles/palette.scss](../src/styles/palette.scss)와
[src/styles/tokens.scss](../src/styles/tokens.scss)입니다.

| 파일 | Figma 컬렉션 | 모드 |
|---|---|---|
| `primitives.json` | Primitives | 없음 |
| `semantic.light.json` | Semantic | Light |
| `semantic.dark.json` | Semantic | Dark |

형식은 W3C Design Tokens(DTCG)입니다. `{gray.0}` 형태의 값은 Primitive를 가리키는
별칭이라, 가져오면 Figma 변수끼리 연결된 상태가 됩니다.

## 가져오는 순서

**반드시 Primitives를 먼저 가져옵니다.** Semantic이 Primitive를 참조하기 때문입니다.

### Tokens Studio 플러그인

1. 플러그인 실행 → Tokens → Import
2. `primitives.json` 가져오기 → 토큰 세트 이름을 `primitives`로
3. `semantic.light.json`, `semantic.dark.json` 가져오기
4. Themes에서 Light 테마 = primitives + semantic.light,
   Dark 테마 = primitives + semantic.dark로 구성
5. Export to Figma → Variables로 내보내면 컬렉션과 모드가 생성됩니다

### 변수 가져오기 계열 플러그인 (Variables Import/Export 등)

1. Primitives 컬렉션을 만들고 `primitives.json` 가져오기
2. Semantic 컬렉션을 만들고 모드 2개(Light, Dark)를 추가
3. 각 모드에 `semantic.light.json` / `semantic.dark.json` 가져오기

## 확인

가져온 뒤 아래가 맞는지 보면 됩니다.

- Primitives에 모드가 없고, 값이 모두 실제 색값인지
- Semantic의 값이 색값이 아니라 **Primitive를 가리키는 별칭**인지
- Semantic에 Light / Dark 두 모드가 있는지

명세와 규칙은 [docs/COLOR-TOKENS.md](../docs/COLOR-TOKENS.md)를 참고하세요.
