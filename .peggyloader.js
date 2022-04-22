import peggy from 'peggy'

/**
 * @this {import('webpack').LoaderContext<{}>}
 * @param {string} source */
export default function (source) {
  const options = {
    // Path to the grammar file
    grammarSource: this.resourcePath,
    cache: false,
    dependencies: {},
    exportVar: null,
    format: 'commonjs',
    output: 'source',
    plugins: [],
    trace: false,
  }
  return peggy.generate(source.toString(), options)
}

export const raw = true
