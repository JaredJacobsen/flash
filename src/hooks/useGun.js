import { useContext } from 'react';
import { GunContext } from '../context'

export default function useGun() {
  const context = useContext(GunContext)
  if (context === undefined) {
    throw new Error('useGun must be used within a provider')
  }
  return context
}