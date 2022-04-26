import * as monaco from 'monaco-editor'
import * as lang from './syntaxHighlight'

monaco.languages.register({
  id: 'pagoda',
  extensions: ['pag'],
})
monaco.languages.setMonarchTokensProvider('pagoda', lang)
