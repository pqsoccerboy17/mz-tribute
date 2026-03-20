import { useContext } from 'react'
import { AdminContext } from '../contexts/AdminContext'

export function useAdmin() {
  return useContext(AdminContext)
}
