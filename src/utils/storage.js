const NS = 'countor_'

export const storage = {
  get(key)        { try { const r = localStorage.getItem(NS + key); return r ? JSON.parse(r) : null } catch { return null } },
  set(key, value) { try { localStorage.setItem(NS + key, JSON.stringify(value)); return true } catch { return false } },
  remove(key)     { try { localStorage.removeItem(NS + key) } catch {} },
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const getSession  = ()      => storage.get('session')
export const setSession  = (user)  => storage.set('session', user)
export const clearSession= ()      => storage.remove('session')
export const getUsers    = ()      => storage.get('users') || {}
export const saveUser    = (email, data) => { const u = getUsers(); u[email] = data; storage.set('users', u) }

// ─── Score history ────────────────────────────────────────────────────────────
const hKey = (email) => `history_${email.replace(/[@.]/g, '_')}`

export function getHistory(email) { return storage.get(hKey(email)) || [] }

export function addEntry(email, entry) {
  const today   = new Date().toISOString().split('T')[0]
  let history   = getHistory(email).filter(h => h.date !== today)
  history.push({ ...entry, date: today, ts: Date.now() })
  history.sort((a, b) => new Date(a.date) - new Date(b.date))
  if (history.length > 365) history = history.slice(-365)
  storage.set(hKey(email), history)
  return history
}

// ─── CSV export ───────────────────────────────────────────────────────────────
export function getAllData() {
  const users = getUsers()
  return Object.keys(users).flatMap(email =>
    getHistory(email).map(h => ({ email, name: users[email]?.name || '', ...h }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function exportCSV(email = null) {
  const data    = email
    ? getHistory(email).map(h => ({ email, name: getUsers()[email]?.name || '', ...h }))
    : getAllData()
  const headers = ['Date','Name','Email','Wellness Score','Raw Score','Depression','Anxiety','Tier','Summary','Timestamp']
  const rows    = data.map(d => [
    d.date, d.name || '', d.email,
    d.score ?? d.wellness ?? '',
    d.raw ?? '',
    d.depression ?? '',
    d.anxiety ?? '',
    d.tier || '',
    `"${(d.summary || '').replace(/"/g,"'")}"`,
    d.ts ? new Date(d.ts).toISOString() : '',
  ])
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = email ? `countor_${email}.csv` : `countor_all_users.csv`
  a.click()
  URL.revokeObjectURL(url)
}
