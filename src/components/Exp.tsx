/**
 * Formats the content as a small exponent factor.
 */
export default function Exp({
  children,
}: {
  children:
    | JSX.Element
    | string
    | null
    | number
    | (JSX.Element | string | null | number)[]
}) {
  return <small className="exponent">{children}</small>
}
