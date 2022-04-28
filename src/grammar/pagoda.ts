/*
  This module contains the API definitions for
  pagoda, at runtime. Inject them into the parser.
*/

export class Character {
  constructor(readonly name: string, readonly color = 0xffffff) {}
}

const nothing = new (class Nothing {
  toString() {
    return '<nothing>'
  }
})()

export type Value = any

/**
 * The state machine representing the narrative script runtime.
 */
export class Runtime {
  private parent: Runtime | null = null
  locals: Record<string, Value> = {}
  constructor(
    readonly listener: (this: Runtime, input: Statement) => Promise<Statement>
  ) {}

  /**
   * Spawns a children runtime that has visibility of
   * the parent scope.
   */
  child() {
    const rt = new Runtime(this.listener)
    rt.parent = this
    return rt
  }

  private propagateVar(target: string, value: any) {
    if (target in this.locals) {
      this.locals[target] = value
      return true
    }
    if (this.parent != null) {
      return this.parent.propagateVar(target, value)
    }
    return false
  }

  private async assignment(assign: Assign) {
    const target = assign.target
    const value = await this.solve(assign.value)
    if (!this.propagateVar(target, value)) {
      this.locals[target] = value
    }
  }

  private async solveBinary(expr: Expression): Promise<Value> {
    if (expr.type === 'binary') {
      const left = await this.solve(expr.left)
      const right = await this.solve(expr.right)
      switch (expr.operator) {
        case 'and':
          return left && right
        case 'or':
          return left || right
        case '+':
          return left + right
        case '-':
          return left - right
        case '*':
          return left * right
        case '/':
          return left / right
        case '>':
          return left > right
        case '<':
          return left < right
        case '>=':
          return left >= right
        case '<=':
          return left <= right
        case '<>':
          return left !== right
        case '=':
          return left === right
        case '**':
          return Math.pow(left, right)
      }
    }
    return nothing
  }

  // Solve unary expressions
  private async solveUnary(expr: Expression) {
    if (expr.type === 'unary') {
      const term = await this.solve(expr.term)
      switch (expr.operator) {
        case 'exists':
          return term != null
        case 'not':
        case '!':
          return !term
        case '-':
          return -term
        case '+':
          return +term
      }
    }
    return nothing
  }

  // Solve the call procedure to a function (AKA a "section")
  private async solveCall(expr: Call): Promise<Value> {
    const fn = await this.solve(expr.target)
    if (fn == null) {
      throw new Error(
        `Attempting to call unknown function "${expr.target.value}"`
      )
    }
    if (typeof fn !== 'function') {
      throw new Error(
        `Attempting to call a non-function value "${expr.target.value}"`
      )
    }
    return await fn(...expr.params)
  }

  // Attempts to retrieve a local expression or a parent one.
  private async solveReference(expr: Name): Promise<Value> {
    if (expr.value in this.locals) {
      return this.locals[expr.value]
    }
    if (this.parent != null) {
      return await this.parent.solveReference(expr)
    }
    return null
  }

  /** Solves the tuple-expression. */
  async solveTuple(tuple: Tuple): Promise<Value> {
    const result = [] as any[]
    for (const expr of tuple.elements) {
      result.push(await this.solve(expr))
    }
    return result
  }

  /**
   * Resolve asynchronously any expression.
   */
  async solve(expr: Expression): Promise<Value> {
    switch (expr.type) {
      case 'binary':
        return await this.solveBinary(expr)
      case 'unary':
        return await this.solveUnary(expr)
      case 'call':
        return await this.solveCall(expr)
      case 'name':
        return await this.solveReference(expr)
      case 'string':
        return await this.getText(expr)
      case 'number':
        return expr.value
      case 'tuple':
        return await this.solveTuple(expr)
    }
    return nothing
  }

  /**
   * Resolve the dialogue's actor either a new anonymous
   * character reference or as the character reference it
   * points to, in case that is valid.
   * Throws if pointing to something other than a character.
   */
  async getActor(target: Dialogue): Promise<Character> {
    if (target.actor.type === 'string') {
      const value = await this.getText(target.actor)
      return new Character(value)
    }
    const char = await this.solve(target.actor)
    if (!(char instanceof Character)) {
      throw new Error(
        `Target actor "${target.actor.value}" is not a character.`
      )
    }
    return char
  }

  private async collect(text: (string | Expression)[]): Promise<string> {
    const chunks: string[] = []
    for (const chunk of text) {
      if (typeof chunk === 'string') {
        chunks.push(chunk)
      } else {
        chunks.push(await this.solve(chunk))
      }
    }
    return chunks.join('')
  }

  /** Resolves the text of the given string-like expression. */
  async getText(target: Narration | Dialogue | Str): Promise<string> {
    switch (target.type) {
      case 'dialogue':
      case 'narration':
        return await this.getText(target.text)
      case 'string':
        return await this.collect(target.text)
    }
  }

  // "if" type, control flow statement.
  private async branching(stmt: If): Promise<any> {
    const test = await this.solve(stmt.expr)
    if (test) {
      return await this.start(stmt.block)
    }
  }

  // A character declaration, which assigns and creates the character.
  private async declareCharacter(char: CharacterDeclaration): Promise<void> {
    this.locals[char.target] = new Character(await this.solve(char.name))
  }

  // Declares a new section and stores it as a local.
  private async declareSection(sect: Section): Promise<void> {
    this.locals[sect.target] = async (...args) => {
      // Create a local runtime.
      const local = this.child()
      // Store arguments as top-level locals.
      for (let i = 0; i < args.length; i++) {
        local.locals[`_${i}`] = await local.solve(args[i])
      }
      return await local.start(sect.block)
    }
  }

  private scopes() {
    return {
      scope: this.locals,
      _parent: this.parent?.scopes(),
    }
  }

  /** Starts walking the program tree. */
  async start(block: Program | Block): Promise<any> {
    for (const stmt of block.statements) {
      const result = await this.listener(stmt)
      switch (result.type) {
        case 'return':
          console.log('Breaking context.')
          return this.solve(result.value)
        case 'assignment':
          await this.assignment(result)
          break
        case 'character':
          await this.declareCharacter(result)
          break
        case 'if': {
          const rb = await this.branching(result)
          if (rb != null) {
            return rb
          }
          break
        }
        case 'section':
          await this.declareSection(result)
          break
        case 'call':
          await this.solve(result)
          break
      }
    }
  }
}

export interface Node<type extends string> {
  type: type
}

export interface Program extends Node<'program'> {
  statements: Statement[]
  trueBooleanSet: Record<string, true>
}

export type Statement =
  | Section
  | If
  | Return
  | Assign
  | Call
  | Choice
  | Dialogue
  | Narration
  | CharacterDeclaration
  | Monoid

export interface CharacterDeclaration extends Node<'character'> {
  target: IDENTIFIER
  name: Str
}

export interface If extends Node<'if'> {
  expr: Expression
  block: Block
}

export interface Section extends Node<'section'> {
  target: IDENTIFIER
  block: Block
}

export interface Call extends Node<'call'> {
  target: Name
  params: Expression[]
}

export interface Assign extends Node<'assignment'> {
  target: IDENTIFIER
  value: Expression
}

export interface Choice extends Node<'choice'> {
  options: ChoiceCase[]
  title: Str | Name
}

export interface Narration extends Node<'narration'> {
  text: Str
}

export interface Dialogue extends Node<'dialogue'> {
  actor: Name | Str
  text: Str
}

export interface Return extends Node<'return'> {
  value: Expression
}

export type Monoid = Node<'clear' | 'end' | 'wait'>

export interface ChoiceCase extends Node<'case'> {
  match: Str | Name
  then: Block
}

export type Expression =
  | ({ left: Expression; operator: string; right: Expression } & Node<'binary'>)
  | ({
      mode: 'postfix' | 'prefix'
      operator: string
      term: Atom
    } & Node<'unary'>)
  | Atom

export type Atom = Call | Choice | Str | Num | Name | Unit | Tuple

export interface Block extends Node<'block'> {
  statements: Statement[]
}

// Simple types

export interface Str extends Node<'string'> {
  text: (Expression | string)[]
}

export interface Num extends Node<'number'> {
  value: number
}

export interface Name extends Node<'name'> {
  value: IDENTIFIER
}

export interface Tuple extends Node<'tuple'> {
  elements: Expression[]
}

export type Unit = Node<'unit'>

// Primitives
export type IDENTIFIER = string
