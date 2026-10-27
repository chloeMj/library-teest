// 색상 토큰의 명암비(contrast ratio)가 WCAG 2.2 기준을 넘는지 검사합니다.
//
//   npm run check:contrast
//
// src/styles의 SCSS를 직접 컴파일해서 보므로 빌드 결과물이 없어도 돌아갑니다.
// 라이트·다크 모드를 각각 검사하고, 하나라도 미달이면 종료 코드 1로 끝납니다.
//
// 검사 대상은 "라이브러리가 기본으로 주는 팔레트"뿐입니다. 설치한 프로젝트가
// --ui-gray-600 등을 재정의하면 그때부터는 그 프로젝트 책임입니다 (README 참고).

import { compile } from 'sass-embedded'

// [앞색, 뒤색, 최소 명암비, 설명]
//
// 4.5:1  본문 글자 (WCAG 1.4.3 AA)
// 3:1    테두리·아이콘 등 글자가 아닌 UI 경계 (WCAG 1.4.11)
//
// --ui-text-disabled는 1.4.3의 "비활성 요소" 예외라 검사하지 않습니다.
const CHECKS = [
  ['--ui-text-default', '--ui-surface-default', 4.5, '본문 글자'],
  ['--ui-text-default', '--ui-surface-subtle', 4.5, '본문 글자 (옅은 배경)'],
  ['--ui-text-muted', '--ui-surface-default', 4.5, '보조 글자'],
  ['--ui-text-muted', '--ui-surface-subtle', 4.5, '보조 글자 (옅은 배경)'],
  ['--ui-text-placeholder', '--ui-surface-default', 4.5, '입력 안내 글자'],
  ['--ui-text-inverse', '--ui-text-default', 4.5, '반전 글자 (Toast)'],
  ['--ui-primary-on', '--ui-primary-default', 4.5, 'primary 버튼 글자'],
  ['--ui-primary-default', '--ui-surface-default', 4.5, 'primary 링크·아이콘'],
  ['--ui-danger-default', '--ui-surface-default', 4.5, '에러 글자'],
  // --ui-border-default(구분선·카드)는 장식이라 1.4.11 대상이 아니므로 검사하지 않습니다.
  ['--ui-border-control', '--ui-surface-default', 3, '입력 박스 테두리'],
  ['--ui-border-focus', '--ui-surface-default', 3, '포커스 테두리'],
]

const declarations = (body) => {
  const out = {}
  for (const d of body.split(';')) {
    const i = d.indexOf(':')
    if (i < 0) continue
    const name = d.slice(0, i).trim()
    if (name.startsWith('--')) out[name] = d.slice(i + 1).trim()
  }
  return out
}

// :root 블록 — 라이트 기본값
const rootBlock = (css) => {
  const out = {}
  for (const m of css.matchAll(/(?:^|})\s*:root\s*\{([^}]*)\}/g)) Object.assign(out, declarations(m[1]))
  return out
}

// 다크 모드 블록 — 선택자는 mixins/_theme.scss와 짝을 이룹니다
const darkBlock = (css) => {
  const out = {}
  const re = /(?::root:not\(\[data-theme=light\]\)|:root\[data-theme=dark\],body\.body--dark)\s*\{([^}]*)\}/g
  for (const m of css.matchAll(re)) Object.assign(out, declarations(m[1]))
  return out
}

const refOf = (value) => value.match(/^var\(\s*(--[\w-]+)\s*(?:,.*)?\)$/)?.[1] ?? null

// var() 체인을 끝까지 따라가 실제 색 문자열을 구합니다
const resolve = (value, vars, depth = 0) => {
  if (value === undefined || depth > 20) return null
  const ref = refOf(value)
  if (!ref) return value
  if (vars[ref] !== undefined) return resolve(vars[ref], vars, depth + 1)
  const fallback = value.match(/^var\([^,]+,\s*(.*)\)$/)?.[1]
  return fallback ? resolve(fallback.trim(), vars, depth + 1) : null
}

const toRgb = (raw) => {
  if (!raw) return null
  const rgba = raw.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
  if (rgba) return [1, 2, 3].map((i) => Number(rgba[i]))
  let h = raw.replace('#', '')
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6,8}$/.test(h)) return null
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

// WCAG 2.x 상대 휘도
const luminance = ([r, g, b]) => {
  const ch = (v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const sass = (file) => compile(file, { loadPaths: ['src/styles'], style: 'compressed' }).css

const tokensCss = sass('src/styles/tokens.scss')
const paletteCss = sass('src/styles/palette.scss')

const light = { ...rootBlock(paletteCss), ...rootBlock(tokensCss) }
const dark = { ...light, ...darkBlock(paletteCss), ...darkBlock(tokensCss) }

let failed = 0

const run = (label, vars) => {
  console.log(`\n  ${label}`)
  for (const [fgVar, bgVar, min, desc] of CHECKS) {
    const fg = toRgb(resolve(vars[fgVar], vars))
    const bg = toRgb(resolve(vars[bgVar], vars))
    if (!fg || !bg) {
      console.log(`  ?   ${desc} — ${fgVar} 또는 ${bgVar}의 색을 구하지 못했습니다`)
      failed++
      continue
    }
    const r = ratio(fg, bg)
    const ok = r >= min
    if (!ok) failed++
    console.log(
      `  ${ok ? 'OK' : '!!'}  ${desc.padEnd(22, ' ')} ${r.toFixed(2).padStart(5, ' ')}:1  (기준 ${min}:1)` +
        (ok ? '' : `  ${fgVar} on ${bgVar}`),
    )
  }
}

console.log('색상 토큰 명암비 검사')
run('Light', light)
run('Dark', dark)

if (failed > 0) {
  console.error(`\n  ${failed}개 미달. 팔레트 값을 조정하세요 (docs/COLOR-TOKENS.md).\n`)
  process.exit(1)
}
console.log('\n  모두 통과\n')
