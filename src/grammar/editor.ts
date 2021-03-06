import * as monaco from 'monaco-editor'

monaco.languages.register({
  id: 'pagoda',
  extensions: ['pag'],
})
monaco.languages.setMonarchTokensProvider('pagoda', {
  keywords: [
    'section',
    'call',
    'if',
    'character',
    'wait',
    'end',
    'return',
    'with',
    'true',
    'false',
    'clear',
    'set',
    'to',
    'as',
    'add',
    'increment',
    'choice',
    'else',
    'and',
    'or',
    'is',
    "'s",
  ],
  operators: [
    '=',
    '>',
    '<',
    '!',
    '~',
    '?',
    ':',
    '<=',
    '>=',
    '<>',
    '+',
    '-',
    '*',
    '/',
  ],

  // we include these common regular expressions
  symbols: /[=><!~?&|+\-*\/\^%]+/,

  // String escapes
  escapes:
    /\\(?:[abfnrtv\\"]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  tokenizer: {
    root: [
      { include: '@sectionDec' },
      { include: '@builtins' },
      { include: '@keywordsAndIdentifiers' },
      { include: '@identifier' }, // to show class names nicely

      // whitespace
      { include: '@whitespace' },

      { include: '@operators' },
      { include: '@numbers' },
      { include: '@stringOpen' },
    ],

    builtins: [[/one[ \t\n\r]+of/, 'regexp']],
    identifier: [[/[A-Z][\w\$]*/, 'type.identifier']],

    sectionDec: [[/(section|call)/, { token: 'keyword', next: '@sectName' }]],

    sectName: [[/[ \t\n\r]+[A-Za-z0-9_]+/, { token: 'regexp', next: '@pop' }]],

    stringOpen: [
      // strings
      [/:[^ \t\]\)]+/, { token: 'string.quote' }],
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
    ],

    keywordsAndIdentifiers: [
      [
        /[a-z_'][\w$]*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        },
      ],
    ],

    operators: [
      // delimiters and operators
      // [/[{}()\[\]]/, '@brackets'],
      // [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],
    ],

    numbers: [
      // numbers
      [/[0-9]+(st|nd|rd|th)/, 'number'],
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],
    ],

    expression: [
      { include: '@stringOpen' },
      { include: '@whitespace' },
      { include: '@numbers' },
      { include: '@sectionDec' },
      { include: '@operators' },
      { include: '@builtins' },
      { include: '@identifier' },
      { include: '@keywordsAndIdentifiers' },
      [/\)/, { token: 'variable', bracket: '@close', next: '@pop' }],
    ],

    string: [
      [/\$[A-Za-z_][A-Za-z0-9_]*/, 'variable'],
      [/\$\(/, { token: 'variable', bracket: '@open', next: '@expression' }],
      [/@escapes/, 'string.escape'],
      [/(\\.|\$.)/, 'invalid'],
      [/[^\\"$]+/, 'string'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/#.*$/, 'comment'],
    ],
  },
})
