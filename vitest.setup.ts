// 모든 테스트 전에 한 번 실행됩니다 (vite.config.ts의 test.setupFiles).
//
// 테스트용 가짜 브라우저(jsdom)에는 window.matchMedia가 없습니다.
// Select의 모바일 판별(useIsMobile)이 이걸 써서, 항상 "데스크톱"으로 답하는 가짜를 넣어 둡니다.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
