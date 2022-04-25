export interface InputProps {
  title: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  value?: string
}

export default function Input({ title, value, onChange }: InputProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '1rem',
      }}
    >
      <small>{title}</small>
      <input type="text" value={value} onChange={onChange} />
    </div>
  )
}
