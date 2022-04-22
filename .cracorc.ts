import './genAssetManifest'
import { CracoConfig } from '@craco/craco'
import path from 'path'

export default {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.peg$/i,
            type: 'javascript/auto',
            loader: path.resolve(__dirname, '.peggyloader.js'),
          },
          {
            test: /\.txt$/i,
            type: 'asset/source',
          },
        ],
      },
    },
  },
} as CracoConfig
