import toml from 'toml'

/**
 * @this {import('webpack').LoaderContext<{}>}
 * @param {string} source */
export default function (source) {
  return toml.parse(source)
}

export const raw = true
