interface ResultType {
  success(): this is Success
}

export class Success<A = any> implements ResultType {
  constructor(readonly value: A) {}
  success(): this is Success<any> {
    return true
  }
}

export class Failure implements ResultType {
  constructor(readonly error: Error) {}
  success(): this is Success<any> {
    return false
  }
}

export function trying<A>(what: () => A): Result<A> {
  try {
    return new Success<A>(what())
  } catch (err) {
    return new Failure(err)
  }
}

export type Result<A> = Success<A> | Failure
