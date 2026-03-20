import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
  id?: string
}

export function Container({ children, className, id }: ContainerProps) {
  return (
    <section id={id} className={cn('mx-auto max-w-6xl px-4', className)}>
      {children}
    </section>
  )
}
