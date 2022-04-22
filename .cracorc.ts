import './genAssetManifest'
import { CracoConfig } from '@craco/craco'
import path from 'path'
import webpack from 'webpack'

export default {
  webpack: {
    configure: {
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
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
