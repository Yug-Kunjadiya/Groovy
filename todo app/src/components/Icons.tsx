type IconProps = {
  className?: string
}

function BaseIcon({ className, children }: React.PropsWithChildren<IconProps>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}

export function IconSpark({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path
        d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"
        fill="currentColor"
      />
    </BaseIcon>
  )
}

export function IconPlus({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </BaseIcon>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  )
}

export function IconList({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M8 7h12M8 12h12M8 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy="7" r="1.2" fill="currentColor" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" />
      <circle cx="4" cy="17" r="1.2" fill="currentColor" />
    </BaseIcon>
  )
}

export function IconFilter({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path
        d="M4 6h16l-6.5 7v4.2l-3 1.8V13L4 6Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
    </BaseIcon>
  )
}

export function IconTrash({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 7V5.8c0-.9.7-1.6 1.6-1.6h2.8c.9 0 1.6.7 1.6 1.6V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 7l1 12h8l1-12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </BaseIcon>
  )
}
