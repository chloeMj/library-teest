// 빌드된 CSS에서 Figma Variables로 가져갈 JSON을 생성합니다.
//
//   npm run build:tokens
//
// 출력 (design-tokens/) — 파일 하나가 "컬렉션의 모드 하나"에 대응하고,
// 가져올 때 파일 이름이 모드 이름이 됩니다.
//   primitives.tokens.json   Primitives 컬렉션
//   Light.tokens.json        Semantic 컬렉션 · Light 모드
//   Dark.tokens.json         Semantic 컬렉션 · Dark 모드
//
// 형식은 Figma가 Export하는 것과 동일합니다.
//   색    $value: { colorSpace, components, alpha, hex }
//   별칭  $extensions."com.figma.aliasData"에 대상 변수/컬렉션 이름
//         ($value에는 별칭이 가리키는 실제 색을 함께 넣습니다)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const CORE = 'dist/library-test.css'
const PALETTE = 'dist/palette.css'
const OUT_DIR = 'design-tokens'
const PRIMITIVE_SET = 'Primitives'
const SEMANTIC_SET = 'Semantic'

// CSS 변수 → Figma 변수 경로. docs/COLOR-TOKENS.md의 표와 동일합니다.
const SEMANTIC_MAP = {
  '--ui-surface-default': 'surface/default',
  '--ui-surface-subtle': 'surface/subtle',
  '--ui-surface-hover': 'surface/hover',
  '--ui-surface-selected': 'surface/selected',
  '--ui-surface-disabled': 'surface/disabled',
  '--ui-surface-raised': 'surface/raised',
  '--ui-surface-backdrop': 'surface/backdrop',
  '--ui-border-default': 'border/default',
  '--ui-border-strong': 'border/strong',
  '--ui-border-focus': 'border/focus',
  '--ui-border-hover': 'border/hover',
  '--ui-border-disabled': 'border/disabled',
  '--ui-border-focus-ring': 'border/focus-ring',
  '--ui-text-default': 'text/default',
  '--ui-text-muted': 'text/muted',
  '--ui-text-placeholder': 'text/placeholder',
  '--ui-text-disabled': 'text/disabled',
  '--ui-text-inverse': 'text/inverse',
  '--ui-primary-default': 'primary/default',
  '--ui-primary-hover': 'primary/hover',
  '--ui-primary-active': 'primary/active',
  '--ui-primary-subtle': 'primary/subtle',
  '--ui-primary-on': 'primary/on',
  '--ui-danger-default': 'danger/default',
  '--ui-danger-subtle': 'danger/subtle',
  '--ui-success-default': 'success/default',
  '--ui-success-subtle': 'success/subtle',
  '--ui-warning-default': 'warning/default',
  '--ui-warning-subtle': 'warning/subtle',
  '--ui-info-default': 'info/default',
  '--ui-info-subtle': 'info/subtle',
}

const capitalize = (s) => s[0].toUpperCase() + s.slice(1)

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

const rootBlock = (css) => {
  const out = {}
  for (const m of css.matchAll(/(?:^|})\s*:root\s*\{([^}]*)\}/g)) Object.assign(out, declarations(m[1]))
  return out
}

const darkBlock = (css) => {
  const out = {}
  const re = /(?::root:not\(\[data-theme=light\]\)|:root\[data-theme=dark\],body\.body--dark)\s*\{([^}]*)\}/g
  for (const m of css.matchAll(re)) Object.assign(out, declarations(m[1]))
  return out
}

// #0006 같은 축약 HEX를 #00000066으로 펼칩니다
const expandHex = (value) => {
  const m = value.match(/^#([0-9a-fA-F]{3,4})$/)
  return m ? '#' + [...m[1]].map((c) => c + c).join('') : value
}

const rgbaToHex = (value) => {
  const m = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/)
  if (!m) return value
  const hex = (n) => Math.round(Number(n)).toString(16).padStart(2, '0')
  const alpha = m[4] === undefined ? '' : Math.round(Number(m[4]) * 255).toString(16).padStart(2, '0')
  return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}${alpha}`
}

const toFigmaColor = (raw) => {
  const h = expandHex(rgbaToHex(raw)).replace('#', '')
  const n = (i) => parseInt(h.slice(i, i + 2), 16)
  return {
    colorSpace: 'srgb',
    components: [n(0) / 255, n(2) / 255, n(4) / 255].map((v) => Math.round(v * 1e4) / 1e4),
    alpha: h.length === 8 ? Math.round((n(6) / 255) * 1e4) / 1e4 : 1,
    hex: '#' + h.slice(0, 6).toUpperCase(),
  }
}

const core = readFileSync(CORE, 'utf8')
const palette = readFileSync(PALETTE, 'utf8')

const paletteVars = rootBlock(palette)
const light = rootBlock(core)
const dark = { ...light, ...darkBlock(core) }

// var(--ui-gray-0, #ffffff) 에서 참조 변수명만 떼어냅니다
const refOf = (value) => value.match(/^var\(\s*(--[\w-]+)\s*(?:,.*)?\)$/)?.[1] ?? null

// 변수 체인을 따라가 최종 색(HEX 문자열)을 구합니다
const resolveColor = (value, vars, depth = 0) => {
  if (depth > 20) return '#000000'
  const ref = refOf(value)
  if (!ref) return value
  const next = paletteVars[ref] ?? vars[ref]
  if (next !== undefined) return resolveColor(next, vars, depth + 1)
  const fallback = value.match(/^var\([^,]+,\s*(.*)\)$/)?.[1]
  return fallback ? resolveColor(fallback.trim(), vars, depth + 1) : '#000000'
}

// 이 값이 어떤 Figma 변수를 가리키는지 (없으면 null)
//
// Semantic -> Semantic 참조(예: border/focus -> primary/default)는 가져오는 시점에
// 대상 변수가 아직 없어 실패합니다. 그래서 체인을 끝까지 따라가 Primitive를
// 직접 가리키게 합니다.
const aliasOf = (value, vars, depth = 0) => {
  if (depth > 20) return null
  const ref = refOf(value)
  if (!ref) return null
  const m = ref.match(/^--ui-([a-z]+)-(\d+)$/)
  if (m) return { name: `${capitalize(m[1])}/${m[2]}`, set: PRIMITIVE_SET }
  if (SEMANTIC_MAP[ref] && vars[ref] !== undefined) return aliasOf(vars[ref], vars, depth + 1)
  return null
}

const nest = (entries) => {
  const tree = {}
  for (const { path, token } of entries) {
    const parts = path.split('/')
    let node = tree
    for (const p of parts.slice(0, -1)) node = node[p] ??= {}
    node[parts.at(-1)] = token
  }
  return tree
}

const colorToken = (raw) => ({ $type: 'color', $value: toFigmaColor(raw) })

const aliasToken = (raw, alias, vars) => ({
  $type: 'color',
  $value: toFigmaColor(resolveColor(raw, vars)),
  $extensions: {
    'com.figma.aliasData': {
      targetVariableName: alias.name,
      targetVariableSetName: alias.set,
    },
  },
})

const primitives = nest(
  Object.entries(paletteVars)
    .filter(([name]) => /^--ui-[a-z]+-\d+$/.test(name))
    .map(([name, value]) => {
      const [, family, step] = name.match(/^--ui-([a-z]+)-(\d+)$/)
      return { path: `${capitalize(family)}/${step}`, token: colorToken(value) }
    }),
)

const semantic = (vars) =>
  nest(
    Object.entries(SEMANTIC_MAP)
      .filter(([cssVar]) => vars[cssVar] !== undefined)
      .map(([cssVar, path]) => {
        const raw = vars[cssVar]
        const alias = aliasOf(raw, vars)
        return { path, token: alias ? aliasToken(raw, alias, vars) : colorToken(raw) }
      }),
  )

mkdirSync(OUT_DIR, { recursive: true })

const write = (file, data, modeName) => {
  const payload = { ...data, $extensions: { 'com.figma.modeName': modeName } }
  writeFileSync(`${OUT_DIR}/${file}`, JSON.stringify(payload, null, 2) + '\n')
  const json = JSON.stringify(data)
  console.log(
    `  ${OUT_DIR}/${file}` +
      `  변수 ${json.match(/"\$value"/g)?.length ?? 0}개` +
      `  (별칭 ${json.match(/aliasData/g)?.length ?? 0}개)`,
  )
}

console.log('Figma 토큰 JSON 생성')
write('primitives.tokens.json', primitives, 'Mode 1')
write('Light.tokens.json', semantic(light), 'Light')
write('Dark.tokens.json', semantic(dark), 'Dark')
