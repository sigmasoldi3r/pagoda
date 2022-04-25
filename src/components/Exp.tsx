/**
 * Formats the content as a small exponent factor.
 */
export default function Exp({
  children,
}: {
  children: JSX.Element | string | null
}) {
  return <small className="exponent">{children}</small>
}
