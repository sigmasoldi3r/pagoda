/// <reference types="react-scripts" />

declare module '*.txt' {
  const value: string
  export default value
}

declare module '*.pag' {
  const value: string
  export default value
}

declare module '*.toml' {
  const value: Record<string, any>
  export default value
}

declare module '*.peg' {
  export function parse<A>(
    input: string,
    options?: import('peggy').ParserOptions
  ): A
  export type SyntaxError = import('peggy').parser.SyntaxError
}
