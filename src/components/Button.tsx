import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type InheritedProps = React.HTMLAttributes<HTMLButtonElement>

export interface ButtonProps {
  disabled?: boolean
  children?: InheritedProps['children']
  onClick?: InheritedProps['onClick']
  link?: string
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
  size?: 'huge' | 'big' | 'normal' | 'small' | 'micro'
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

export const classSizes = {
  huge: 'btn-huge',
  big: 'btn-big',
  normal: 'btn-normal',
  small: 'btn-small',
  micro: 'btn-micro',
} as { [K in Exclude<ButtonProps['size'], undefined>]: string }

export const baseClassNames = 'btn'

// Custom button component for the engine's UI
export default function Button({
  className,
  disabled,
  children,
  onClick,
  link,
  size = 'normal',
  variant = 'normal',
}: ButtonProps) {
  if (link != null) {
    return (
      <Link
        to={link}
        className={[
          className,
          baseClassNames,
          disabled ? 'btn-disabled' : '',
          classVariants[variant],
          classSizes[size],
        ].join(' ')}
        children={children}
      />
    )
  }
  return (
    <button
      className={[
        className,
        baseClassNames,
        disabled ? 'btn-disabled' : '',
        classVariants[variant],
        classSizes[size],
      ].join(' ')}
      onClick={disabled ? nothing : onClick}
      children={children}
    />
  )
}
