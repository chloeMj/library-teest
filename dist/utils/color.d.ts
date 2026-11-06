type Rgb = [number, number, number];
/** #rgb, #rrggbb, #rrggbbaa, rgb()/rgba()만 읽습니다. 그 밖의 형식(red, hsl() 등)은 null */
export declare function parseColor(value: string): Rgb | null;
/** 두 색의 명암비 (1 ~ 21) */
export declare function contrastRatio(a: Rgb, b: Rgb): number;
/**
 * 배경색 위에 올릴 글자색. 흰색과 진한 회색 중 명암비가 더 큰 쪽을 고릅니다.
 * 읽을 수 없는 형식이면 null (CSS 기본값인 흰색이 쓰입니다).
 */
export declare function readableTextColor(background: string): string | null;
export {};
