import type { ReactNode } from 'react'

export const Card = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div className={`rounded-2xl border border-line bg-card p-5 shadow-[0_1px_0_rgba(18,24,20,0.04)] ${className}`}>
      {children}
    </div>
  )
}
