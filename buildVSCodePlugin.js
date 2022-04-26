/*
  This script will extract the syntax highlight JSON
  from the javascript source code provided to the
  monaco editor.
*/
const fs = require('fs')
const struct = require('./src/grammar/syntaxHighlight')
const path = require('path')

function Node(root = '.') {
  return () => loc => {
    loc = path.join(root, loc)
    return {
      make: () => {
        fs.mkdirSync(loc, { recursive: true })
        return Node(loc)
      },
      stat: () => fs.statSync(loc),
      read: () => fs.readFileSync(loc),
      write: content => fs.writeFileSync(loc, content),
      list: () => fs.readdirSync(loc),
      json: content => fs.writeFileSync(loc, JSON.stringify(content, null, 2)),
    }
  }
}

const root = Node()
const plugin = root`/`('vscode-plugin').make()
plugin`/`('readme.md').write(
  `# Pagoda Script

A simple syntax highlighter for Pagoda script.
`
)
plugin`/`('language-configuration.json').json({
  comments: {
    // symbol used for single line comment. Remove this entry if your language does not support line comments
    lineComment: '//',
    // symbols used for start and end a block comment. Remove this entry if your language does not support block comments
    blockComment: ['/*', '*/'],
  },
  // symbols used as brackets
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  // symbols that are auto closed when typing
  autoClosingPairs: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['"', '"'],
    ["'", "'"],
  ],
  // symbols that that can be used to surround a selection
  surroundingPairs: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['"', '"'],
    ["'", "'"],
  ],
})
plugin`/`('package.json').json({
  name: 'pagoda',
  displayName: 'pagoda',
  description: '',
  version: '0.0.1',
  engines: {
    vscode: '^1.36.0',
  },
  categories: ['Programming Languages'],
  contributes: {
    languages: [
      {
        id: 'pagoda',
        aliases: ['Pagoda Script', 'pagoda'],
        extensions: ['pag'],
        configuration: './language-configuration.json',
      },
    ],
    grammars: [
      {
        language: 'pagoda',
        scopeName: 'pagoda',
        path: './syntaxes/pagoda.tmLanguage.json',
      },
    ],
  },
})

function pairs(obj, map) {
  return Object.entries(obj).reduce((o, [k, v]) => {
    o[k] = map(v, k, o)
    return o
  }, {})
}

function escapeRegex(obj) {
  if (obj instanceof RegExp) {
    const str = String(obj)
    return str.substring(1, str.length - 1)
  } else if (obj instanceof Array) {
    return obj.map(escapeRegex)
  } else if (typeof obj === 'object') {
    return pairs(obj, escapeRegex)
  } else if (typeof obj === 'string') {
    return obj.replace(/^@/, '#')
  }
  return obj
}

const {
  tokenizer: { root: patterns, ...rest },
  ...repo
} = escapeRegex(struct)

console.log(rest)

const synt = plugin`/`('syntaxes').make()
synt`/`('pagoda.tmLanguage.json').json({
  $schema:
    'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
  name: 'Pagoda',
  patterns: patterns
    .filter(v => v[0] !== '[a-z_$][\\w$]*')
    .map(v =>
      v instanceof Array
        ? {
            patterns: [{ match: v[0], name: v[1] }],
          }
        : v
    )
    .concat([...Object.keys(repo)].map(k => ({ include: `#${k}` }))),
  repository: {
    ...pairs(repo, (v, k) => ({
      patterns: [
        {
          name: `${k}.pagoda`,
          match: v instanceof Array ? `\\b(${v.join('|')})\\b` : v,
        },
      ],
    })),
    ...pairs(rest, (v, k) => ({
      patterns: v.map(entry => {
        if (entry instanceof Array) {
          return { match: entry[0], name: entry[1] }
        } else {
          return entry
        }
      }),
    })),
  },
  scopeName: 'pagoda',
})
