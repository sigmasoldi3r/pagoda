/*
  This module contains the API definitions for
  pagoda, at runtime. Inject them into the parser.
*/

export class Character {
  constructor(readonly name: string, readonly color = 0xffffff) {}
}

export type Value = any

/**
 * The state machine representing the narrative script runtime.
 */
export class Runtime {
  private parent: Runtime | null = null
  locals: Record<string, Value> = {}
  constructor(readonly listener: (input: Statement) => Promise<Statement>) {}

  /**
   * Spawns a children runtime that has visibility of
   * the parent scope.
   */
  child() {
    const rt = new Runtime(this.listener)
    rt.parent = this
    return rt
  }

  private async assignment(assign: Assign) {}

  private async solveBinary(expr: Expression): Promise<Value> {
    if (expr.type === 'binary') {
      switch (expr.operator) {
        case '+':
          return (await this.solve(expr.left)) + (await this.solve(expr.right))
        case '-':
          return (await this.solve(expr.left)) - (await this.solve(expr.right))
        case '*':
          return (await this.solve(expr.left)) * (await this.solve(expr.right))
        case '/':
          return (await this.solve(expr.left)) / (await this.solve(expr.right))
        case '>':
          return (await this.solve(expr.left)) > (await this.solve(expr.right))
        case '<':
          return (await this.solve(expr.left)) < (await this.solve(expr.right))
        case '>=':
          return (await this.solve(expr.left)) >= (await this.solve(expr.right))
        case '<=':
          return (await this.solve(expr.left)) <= (await this.solve(expr.right))
        case '<>':
          return (
            (await this.solve(expr.left)) !== (await this.solve(expr.right))
          )
        case '=':
          return (
            (await this.solve(expr.left)) === (await this.solve(expr.right))
          )
        case '**':
          return Math.pow(
            await this.solve(expr.left),
            await this.solve(expr.right)
          )
      }
    }
    return null
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
    const args = expr.params.map(p => this.solve(p))
    return await fn(...args)
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

  /**
   * Resolve asynchronously any expression.
   */
  async solve(expr: Expression): Promise<Value> {
    switch (expr.type) {
      case 'binary':
        return await this.solveBinary(expr)
      case 'call':
        return await this.solveCall(expr)
      case 'name':
        return await this.solveReference(expr)
    }
    return null
  }

  /**
   * Resolve the dialogue's actor either a new anonymous
   * character reference or as the character reference it
   * points to, in case that is valid.
   * Throws if pointing to something other than a character.
   */
  getActor(target: Dialogue): Character {
    if (target.actor.type === 'string') {
      const value = this.getText(target.actor)
      return new Character(value)
    }
    const char = this.solve(target.actor)
    if (!(char instanceof Character)) {
      throw new Error(
        `Target actor "${target.actor.value}" is not a character.`
      )
    }
    return char
  }

  /** Resolves the text of the given string-like expression. */
  getText(target: Narration | Dialogue | Str): string {
    switch (target.type) {
      case 'dialogue':
      case 'narration':
        return this.getText(target.text)
      case 'string':
        return target.text
          .map(s => {
            if (typeof s === 'string') {
              return s
            } else {
              return String(this.solve(s))
            }
          })
          .join('')
    }
  }

  // Consume many statements, awaits and emits events.
  private async consumeStatements(statements: Statement[]) {
    for (const stmt of statements) {
      const result = await this.listener(stmt)
      switch (result.type) {
        case 'assignment':
          await this.assignment(result)
      }
    }
  }

  /** Starts walking the program tree. */
  async start(program: Program) {
    return await this.consumeStatements(program.statements)
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

export type Atom = Call | Choice | Str | Num | Name | Unit

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

export type Unit = Node<'unit'>

// Primitives
export type IDENTIFIER = string
