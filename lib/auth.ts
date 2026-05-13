import { Manager } from './types'

export function getManagers(): (Manager & { password: string })[] {
  try {
    return JSON.parse(process.env.MANAGERS || '[]')
  } catch {
    return []
  }
}

export function verifyLogin(id: string, password: string): Manager | null {
  const managers = getManagers()
  const manager = managers.find(m => m.id === id && m.password === password)
  if (!manager) return null
  return { id: manager.id, name: manager.name, color: manager.color }
}
