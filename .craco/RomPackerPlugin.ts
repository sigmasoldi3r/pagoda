import webpack from 'webpack'

export interface Options {
  sources: string[]
}

/** Packages up the input ROMs of a folder into loadable ROM files. */
export default class RomPackerPlugin implements webpack.WebpackPluginInstance {
  constructor(readonly options: Options) {}
  apply(compiler: webpack.Compiler) {}
}
