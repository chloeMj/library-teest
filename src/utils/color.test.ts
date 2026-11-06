import { describe, it, expect } from 'vitest'
import { contrastRatio, parseColor, readableTextColor } from './color'

describe('color', () => {
  it('#rgb, #rrggbb, rgb()를 읽는다', () => {
    expect(parseColor('#fff')).toEqual([255, 255, 255])
    expect(parseColor('#1e3a8a')).toEqual([30, 58, 138])
    expect(parseColor('rgb(10, 20, 30)')).toEqual([10, 20, 30])
    expect(parseColor('red')).toBeNull()
  })

  it('흰색과 검정의 명암비는 21:1', () => {
    expect(contrastRatio([255, 255, 255], [0, 0, 0])).toBeCloseTo(21, 0)
  })

  it('배경에 따라 읽기 쉬운 글자색을 고른다', () => {
    expect(readableTextColor('#1e3a8a')).toBe('#ffffff') // 남색
    expect(readableTextColor('#facc15')).toBe('#1a1d23') // 노랑
    expect(readableTextColor('hsl(0 0% 50%)')).toBeNull() // 못 읽는 형식
  })
})
