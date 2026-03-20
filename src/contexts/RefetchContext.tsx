import { createContext, useContext } from 'react'

/** Context for sharing the memories refetch function with admin actions */
const RefetchContext = createContext<(() => void) | null>(null)

export const RefetchProvider = RefetchContext.Provider

export function useRefetch(): () => void {
  const refetch = useContext(RefetchContext)
  return refetch || (() => {})
}
