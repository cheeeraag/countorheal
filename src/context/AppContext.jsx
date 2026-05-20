import { createContext, useContext, useState, useEffect } from 'react'
import { getSession, setSession, clearSession, getHistory, addEntry } from '../utils/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession()
    if (s) { setUser(s); setHistory(getHistory(s.email)) }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setSession(userData); setUser(userData); setHistory(getHistory(userData.email))
  }

  const logout = () => {
    clearSession(); setUser(null); setHistory([])
  }

  const saveCheckin = (result) => {
    const updated = addEntry(user.email, result)
    setHistory(updated)
    return updated
  }

  return (
    <AppContext.Provider value={{ user, history, loading, login, logout, saveCheckin }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
