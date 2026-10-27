// design-tokens/*.json을 Figma 변수에 덮어씁니다.
//
// Figma의 가져오기 버튼은 컬렉션이 비어 있을 때만 나오기 때문에, 이미 채워진
// 컬렉션을 갱신할 방법이 없습니다. 이 플러그인이 그 자리를 대신합니다.
//
// 지우지 않습니다. 이름이 같은 변수는 값만 바꾸고(ID 유지 → 기존 디자인의
// 연결이 그대로 따라옵니다), 없는 변수만 새로 만듭니다. JSON에 없는 변수는
// 건드리지 않습니다.

const PRIMITIVES = 'Primitives'
const SEMANTIC = 'Semantic'

// 파일 이름으로 어느 컬렉션인지 정합니다 (primitives.tokens.json / Light.tokens.json)
const collectionNameOf = (fileName) => (/primitives/i.test(fileName) ? PRIMITIVES : SEMANTIC)

const toRgba = (value) => ({
  r: value.components[0],
  g: value.components[1],
  b: value.components[2],
  a: value.alpha === undefined ? 1 : value.alpha,
})

// { surface: { default: {...} } } → [{ path: 'surface/default', token }]
const flatten = (node, prefix) => {
  const out = []
  for (const key of Object.keys(node)) {
    if (key.indexOf('$') === 0) continue
    const value = node[key]
    if (!value || typeof value !== 'object') continue
    const path = prefix ? prefix + '/' + key : key
    if (value.$type === 'color') out.push({ path: path, token: value })
    else out.push.apply(out, flatten(value, path))
  }
  return out
}

const findOrCreateCollection = async (name) => {
  const all = await figma.variables.getLocalVariableCollectionsAsync()
  const found = all.find((c) => c.name === name)
  return found || figma.variables.createVariableCollection(name)
}

const variablesOf = async (collection) => {
  const map = new Map()
  for (const id of collection.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id)
    if (v) map.set(v.name, v)
  }
  return map
}

const modeIdFor = (collection, modeName) => {
  const found = collection.modes.find((m) => m.name === modeName)
  if (found) return found.modeId
  // 새로 만든 컬렉션의 첫 모드는 "Mode 1"이라는 빈 자리라서, 추가하지 않고 이름만 바꿉니다
  if (collection.modes.length === 1 && collection.variableIds.length === 0) {
    collection.renameMode(collection.modes[0].modeId, modeName)
    return collection.modes[0].modeId
  }
  return collection.addMode(modeName)
}

// 컬렉션 이름 → 변수 맵. 별칭이 다른 컬렉션을 가리키므로 한 번 읽은 건 재사용합니다.
const cache = new Map()
const lookup = async (collectionName) => {
  if (!cache.has(collectionName)) {
    const collection = await findOrCreateCollection(collectionName)
    cache.set(collectionName, { collection: collection, vars: await variablesOf(collection) })
  }
  return cache.get(collectionName)
}

const applyFile = async (file) => {
  const data = JSON.parse(file.text)
  const collectionName = collectionNameOf(file.name)
  const entry = await lookup(collectionName)
  const collection = entry.collection
  const vars = entry.vars

  const ext = data.$extensions || {}
  const modeName = ext['com.figma.modeName'] || file.name.replace(/\.tokens\.json$/, '')
  const modeId = modeIdFor(collection, modeName)

  let updated = 0
  let created = 0
  const brokenAlias = []

  for (const item of flatten(data, '')) {
    let variable = vars.get(item.path)
    if (variable) {
      updated++
    } else {
      variable = figma.variables.createVariable(item.path, collection, 'COLOR')
      vars.set(item.path, variable)
      created++
    }

    const alias = (item.token.$extensions || {})['com.figma.aliasData']
    if (alias) {
      const target = (await lookup(alias.targetVariableSetName)).vars.get(alias.targetVariableName)
      if (target) {
        variable.setValueForMode(modeId, figma.variables.createVariableAlias(target))
        continue
      }
      // 가리킬 변수가 아직 없으면 실제 색으로 넣고 끝에 알려줍니다
      brokenAlias.push(item.path + ' → ' + alias.targetVariableName)
    }
    variable.setValueForMode(modeId, toRgba(item.token.$value))
  }

  return {
    collection: collectionName,
    mode: modeName,
    updated: updated,
    created: created,
    brokenAlias: brokenAlias,
  }
}

figma.showUI(__html__, { width: 420, height: 340 })

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin()
    return
  }
  if (msg.type !== 'import') return
  try {
    // Semantic이 Primitives를 별칭으로 가리키므로 Primitives를 먼저 넣습니다
    const ordered = msg.files.slice().sort((a, b) => {
      const rank = (f) => (collectionNameOf(f.name) === PRIMITIVES ? 0 : 1)
      return rank(a) - rank(b)
    })
    const report = []
    for (const file of ordered) report.push(await applyFile(file))
    cache.clear()
    const total = report.reduce((sum, r) => sum + r.updated + r.created, 0)
    figma.notify('변수 ' + total + '개를 넣었습니다')
    figma.ui.postMessage({ type: 'done', report: report })
  } catch (e) {
    cache.clear()
    figma.ui.postMessage({ type: 'error', message: String((e && e.message) || e) })
  }
}
