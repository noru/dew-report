// @flow

type Transform = (Object, string[], Function) => Object | void

function treeMap(node: Object, cursor: string[], transform: Function) {
  const keys = Object.keys(node)
  return keys.reduce((prev, cur) => {
    prev[cur] = transform(node[cur], cursor.concat([cur]))
    return prev
  }, {})
}

function treeMap(node, cursor, transform) {
  const keys = Object.keys(node)
  return keys.reduce((prev, cur) => {
    prev[cur] = transform(node[cur], cursor.concat([cur]))
    return prev
  }, {})
}

function transform(node, cursor) {
  if (cursor[cursor.length - 1] === 'f') return undefined
  if (typeof node !== 'object') return node
  return treeMap(node, cursor, transform)
}

treeMap({
  a: 1,
  b: 2,
  c: 3,
  d: {
    e: 4,
    f: 5,
    g: {
      h: 6,
      i: 7,
      j: {
        k: 8,
        l: 9
      }
    }
  }
}, [], transform)
