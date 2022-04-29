export const textLike =
  /\.(md|txt|license|ignore|js|ts|html|css|xml|conf|ini|toml|php|json|pag)$/i

export const langByExtension = {
  md: 'markdown',
  js: 'javascript',
  ts: 'typescript',
  php: 'php',
  xml: 'xml',
  html: 'html',
  xhtml: 'html',
  css: 'css',
  conf: 'toml',
  ini: 'toml',
  toml: 'toml',
  json: 'json',
  pag: 'pagoda',
}

/** Get a language name for monaco by extension or return 'text'. */
export function getLang(ext: string) {
  return langByExtension[ext] ?? 'text'
}
