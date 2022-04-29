import './genAssetManifest'
import { CracoConfig } from '@craco/craco'
import path from 'path'
import webpack from 'webpack'
import fs from 'fs'
import toml from 'toml'
import RomPackerPlugin from './.craco/RomPackerPlugin'

const rd = (_: string) => fs.readdirSync(_).map(__ => path.join(_, __))

const roms = [] as {
  assets: [string, Uint8Array][]
  meta: any
  scripts: [string, string][]
}[]
function addRec(dir: string, root: string) {
  if (fs.statSync(dir).isDirectory()) {
    for (const sub of rd(dir)) {
      addRec(sub, root)
    }
  } else {
    const raw = fs.readFileSync(dir)
    const rel = path.relative(root, dir)
    if (dir.endsWith('meta.toml')) {
      return
    }
    if (dir.endsWith('.pag')) {
      roms[0].scripts.push([rel, raw.toString()])
    } else {
      roms[0].assets.push([rel, raw])
    }
  }
}
for (const dir of rd('examples')) {
  const found = rd(dir).find(s => s.endsWith('meta.toml'))
  if (found == null) continue
  roms.unshift({
    assets: [],
    scripts: [],
    meta: toml.parse(fs.readFileSync(found).toString()),
  })
  addRec(dir, dir)
}

fs.writeFileSync(
  'src/roms.ts',
  `/*
  Some builtin ROMs, generated from build script at ${new Date()}
*/
import { Rom } from './lib/storage/Rom'

${roms
  .map(rom => {
    const name = rom.meta.name.replace(/[^A-Za-z_0-9]/g, '_')
    return `export const ${name} = new Rom()
${name}.meta = ${JSON.stringify(rom.meta)}
${rom.scripts.map(
  s =>
    `${name}.scripts['${s[0].replace(/\.pag$/g, '')}'] = \`${s[1].replace(
      /`/g,
      '\\`'
    )}\``
)}
${rom.assets
  .map(
    a => `${name}.scripts['${a[0]}'] = new Uint8Array([ ${a[1].join(', ')} ])`
  )
  .join('\n')}
`
  })
  .join('\n\n')}
`
)

export default {
  webpack: {
    configure: {
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
        new RomPackerPlugin({
          sources: ['examples'],
        }),
      ],
      resolve: {
        fallback: {
          buffer: require.resolve('buffer/'),
        },
      },
      module: {
        rules: [
          {
            test: /\.peg$/i,
            type: 'javascript/auto',
            loader: path.resolve(__dirname, '.craco/peg.js'),
          },
          {
            test: /\.toml$/i,
            type: 'javascript/auto',
            loader: path.resolve(__dirname, '.craco/toml.js'),
          },
          {
            test: /\.(txt|pag)$/i,
            type: 'asset/source',
          },
        ],
      },
    },
  },
} as CracoConfig
