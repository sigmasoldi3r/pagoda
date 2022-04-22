const fs = require('fs')
const { posix: path } = require('path')

function collect(at, excl, files = []) {
  const stats = fs.statSync(at)
  if (stats.isFile()) {
    return files.push(at) - 1
  }
  const o = {}
  for (const entry of fs.readdirSync(at)) {
    if (excl && entry.match(excl)) {
      continue
    }
    let ext = path.extname(entry)
    const name = path
      .basename(entry, ext)
      .replace(/[-\.%&!?](.)/g, (_, s) => s.toUpperCase())
      .replace(/[-\.%&!?]/g, '')
    o[name] = collect(path.join(at, entry), excl, files)
  }
  return o
}

const root = './src/game/assets'
const files = []
const tree = collect(root, /\.ts$/, files)

function nice(name) {
  return name
    .replace(/\.\w*$/, '')
    .replace(/[-\.%&!?](.)/g, (_, s) => s.toUpperCase())
    .replace(/[-\.%&!?]/g, '')
    .replace(/\//g, '_')
}

function serialize(tree, level = 0) {
  const _ = '  '.repeat(level)
  const __ = '  '.repeat(level + 1)
  return `{
${Object.entries(tree)
  .map(([k, v]) => {
    if (typeof v === 'object') {
      return `${__}${k}: ${serialize(v, level + 1)},`
    }
    return `${__}${k}: ${nice(path.relative(root, files[v]))},`
  })
  .join('\n')}
${_}}`
}

fs.writeFileSync(
  './src/game/assets/index.ts',
  `${files
    .map(f => {
      const rel = path.relative(root, f)
      return `import ${nice(rel)} from './${rel}'`
    })
    .join('\n')}

export default ${serialize(tree)}
`
)
