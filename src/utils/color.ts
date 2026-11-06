// 색 계산 도우미.
// Button의 color에 직접 준 색(예: "#1e3a8a")의 글자색을 자동으로 고를 때 씁니다.

type Rgb = [number, number, number]

/** #rgb, #rrggbb, #rrggbbaa, rgb()/rgba()만 읽습니다. 그 밖의 형식(red, hsl() 등)은 null */
export function parseColor(value: string): Rgb | null {
  const v = value.trim()
  const hex = v.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length <= 4) h = [...h].map((c) => c + c).join('')
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb
  }
  const rgb = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  return null
}

/** WCAG 상대 휘도 (0 = 검정, 1 = 흰색) */
function luminance([r, g, b]: Rgb): number {
  const ch = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

/** 두 색의 명암비 (1 ~ 21) */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const WHITE: Rgb = [255, 255, 255]
const DARK: Rgb = [26, 29, 35] // gray-900

/**
 * 배경색 위에 올릴 글자색. 흰색과 진한 회색 중 명암비가 더 큰 쪽을 고릅니다.
 * 읽을 수 없는 형식이면 null (CSS 기본값인 흰색이 쓰입니다).
 */
export function readableTextColor(background: string): string | null {
  const bg = parseColor(background)
  if (!bg) return null
  return contrastRatio(WHITE, bg) >= contrastRatio(DARK, bg) ? '#ffffff' : '#1a1d23'
}
