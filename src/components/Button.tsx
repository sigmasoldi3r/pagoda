import { ReactNode } from 'react'

export type InheritedProps = React.HTMLAttributes<HTMLButtonElement>

export interface ButtonProps {
  disabled?: boolean
  children?: InheritedProps['children']
  onClick?: InheritedProps['onClick']
  className?: InheritedProps['className']
  id?: InheritedProps['id']
  variant?:
    | 'light'
    | 'thin'
    | 'alert'
    | 'dark'
    | 'warning'
    | 'success'
    | 'normal'
}

export function nothing() {
  return void 0
}

export const classVariants = {
  alert: 'btn-alert',
  dark: 'btn-dark',
  light: 'btn-light',
  success: 'btn-success',
  thin: 'btn-thin',
  warning: 'btn-warning',
  normal: 'btn-normal',
} as { [K in Exclude<ButtonProps['variant'], undefined>]: string }

export const baseClassNames = 'btn'

// Custom button component for the engine's UI
export default function Button({
  className,
  disabled,
  children,
  onClick,
  variant = 'normal',
}: ButtonProps) {
  return (
    <button
      className={[
        className,
        baseClassNames,
        disabled ? 'btn-disabled' : '',
        classVariants[variant],
      ].join(' ')}
      onClick={disabled ? nothing : onClick}
      children={children}
    />
  )
}
