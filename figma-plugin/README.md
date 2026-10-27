# Figma 토큰 넣기 플러그인

`design-tokens/*.json`을 Figma 변수에 덮어씁니다.

Figma의 변수 가져오기 버튼은 **컬렉션이 비어 있을 때만** 나옵니다. 이미 변수가
들어 있는 컬렉션을 갱신할 경로가 없어서 이 플러그인을 씁니다.

## 설치 (한 번만)

1. Figma 데스크톱 앱을 엽니다. 브라우저 버전으로는 안 됩니다.
2. 메뉴 → Plugins → Development → **Import plugin from manifest…**
3. 이 폴더의 `manifest.json`을 고릅니다.

목록에 `library-test 토큰 넣기`가 생깁니다. 공개 배포가 아니라 내 계정에만
보이는 개발용 플러그인입니다.

## 쓰는 법

```bash
npm run build
```

`design-tokens/`에 json 3개가 다시 생깁니다. 그다음 Figma에서

1. 변수를 넣을 파일을 엽니다
2. Plugins → Development → `library-test 토큰 넣기`
3. `primitives.tokens.json`, `Light.tokens.json`, `Dark.tokens.json`을 **한 번에** 고릅니다
4. 덮어쓰기

순서는 신경 쓰지 않아도 됩니다. Semantic이 Primitives를 별칭으로 가리키므로
플러그인이 Primitives를 먼저 처리합니다.

## 무엇을 하고 무엇을 안 하는지

- 이름이 같은 변수 → **값만** 바꿉니다. 변수 ID가 그대로라 그 변수를 쓰던
  디자인의 연결이 끊기지 않습니다.
- JSON에만 있는 변수 → 새로 만듭니다.
- JSON에 없는 변수 → **건드리지 않습니다.** 지우는 동작은 없습니다.
- 컬렉션·모드가 없으면 만듭니다. 파일 이름이 컬렉션(`primitives…` → Primitives,
  나머지 → Semantic), 파일 안의 `com.figma.modeName`이 모드 이름이 됩니다.

## 결과 읽는 법

```
Primitives · Mode 1  갱신 65  추가 0
Semantic · Light     갱신 31  추가 1
Semantic · Dark      갱신 31  추가 1
```

`추가`가 예상보다 많으면 이름이 어긋난 것입니다. 변수 이름을 Figma에서 바꿨거나
`SEMANTIC_MAP`(scripts/export-figma-tokens.mjs)의 경로가 달라진 경우입니다.

`! 별칭 못 찾음`이 나오면 Semantic이 가리키는 Primitive가 없다는 뜻입니다. 그
변수는 별칭 대신 실제 색으로 들어갑니다.

## 손으로 해야 하는 것

`border/control`은 이번에 새로 생긴 변수입니다. 기존에 입력 박스나 체크박스를
`border/default`로 그려놨다면 그 레이어들을 `border/control`로 다시 연결해야
합니다. `border/default`는 이제 카드·구분선용이라 더 연합니다.
