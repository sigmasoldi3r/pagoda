export interface MetricProps {
  value: number
  base: string
  symbol?: string
  spaced?: boolean
}

export function times10PowerTo(value: number) {
  return Math.pow(10, value)
}

const symbols = [null, 'K', 'M', 'G', 'T', 'P', 'H', 'Z'] as const

/**
 * Formats the given value as a fraction of the metric system.
 * For instance if you input _"meters"_, at value of `100000`
 * it will render `100km`
 *
 * @example
 *   <Metric value={100000} base="meters" symbol="m" />
 *
 */
export default function Metric({ value, base, symbol, spaced }: MetricProps) {
  const space = spaced ? ' ' : ''
  const [sing, plur = sing] = base.split(',').map(s => s.trim())
  let e: number
  function getSymbolAt(outValue: number, e: number) {
    const basic = outValue === 1 ? sing : plur
    if (symbol == null) {
      return `${symbols[e]}${basic}`
    } else if (symbols[e] == null) {
      return `${symbols[e]}${basic}`
    }
    return `${symbols[e]}${symbol}`
  }
  for (e = 0; e < 7; e++) {
    const exponent = times10PowerTo(e * 3)
    const fraction = value / exponent
    const outValue = Math.floor(fraction)
    if (Math.trunc(fraction) < 1000) {
      return (
        <>
          {outValue}
          {space}
          {e === 0 ? (outValue === 1 ? sing : plur) : getSymbolAt(outValue, e)}
        </>
      )
    }
  }
  return <>Error</>
}
