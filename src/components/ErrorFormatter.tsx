function InnerError({
  err,
  source,
  text,
}: {
  err: any
  source: string
  text: string
}) {
  if (err.format == null) {
    return err.message
  }
  return err.format([{ source, text }])
}

export default function ErrorFormatter({
  err,
  source,
  text,
}: {
  source: string
  text: string
  err: any
}) {
  return (
    <div style={{ color: 'red' }}>
      <h2>Fatal Error</h2>
      <pre>
        <InnerError err={err} source={source} text={text} />
      </pre>
    </div>
  )
}
