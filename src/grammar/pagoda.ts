/*
  This module contains the API definitions for
  pagoda, at runtime. Inject them into the parser.
*/

export class Interpreter {
  constructor(readonly listener: () => Promise<void>) {}

  async start(program: any) {}
}

// export interface Node<type extends string> {
//   type: type
// }

// export interface Program extends Node<'program'> {
//   statements: Statement[]
// }

// export type Statement = ''

export class RoutineStep {}

export class Value<A = unknown> {
  constructor(readonly value: A) {}
  /** Unsafe cast function. */
  as<B>(): Value<B> {
    return this as unknown as Value<B>
  }
}

export class Action {}

export class Character {
  constructor(readonly name: string, readonly color?: string) {}
}

export class Narration extends Action {
  constructor(readonly text: string, readonly actor?: Character) {
    super()
  }
}

export class Program extends RoutineStep {
  constructor(
    readonly statements: Action[],
    readonly locals: Record<string, string | number | Character>
  ) {
    super()
  }
  *start() {
    yield* this.statements
  }
}

export async function run(
  program: Program,
  consumer: (action: Action) => Promise<void>
) {
  for (const action of program.start()) {
    await consumer(action)
  }
}
