interface IconProps {
  name: string
  className?: string
  fill?: boolean
}

export function Icon({ name, className = '', fill = false }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${fill ? 'fill' : ''} ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
