import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50',
  outline:
    'bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low',
  danger:
    'bg-error-container text-on-error-container hover:opacity-80',
  ghost: 'text-secondary hover:text-on-surface',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-label-md font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
