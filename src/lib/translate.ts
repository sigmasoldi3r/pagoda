const translations: Record<string, any> = {}

type Template = { raw: readonly string[] | ArrayLike<string> }

/** Attempts to translate the string, or returns it untouched. */
export function t(template: Template, ...substitutions: any[]) {
  return String.raw(template, ...substitutions)
}
