import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getAllData, exportCSV, getUsers, getHistory } from '../utils/storage'
import { TIERS } from '../data/recommendations'
import { PageShell, SectionHeader, Avatar } from './UI'

export function AdminPage() {
  const [tab,    setTab]    = useState('overview')
  const [search, setSearch] = useState('')

  const allData = useMemo(() => getAllData(), [])
  const users   = useMemo(() => {
    return Object.values(getUsers()).map(u => {
      const h = getHistory(u.email)
      return {
        ...u, history: h,
        avgScore:    h.length ? Math.round(h.reduce((s, e) => s + (e.score ?? e.wellness ?? 0), 0) / h.length) : null,
        lastCheckin: h.length ? h[h.length - 1].date : null,
        lastTier:    h.length ? h[h.length - 1].tier : null,
      }
    })
  }, [])

  const tierDist = useMemo(() => {
    const counts = {}
    Object.keys(TIERS).forEach(k => { counts[k] = 0 })
    allData.forEach(d => { if (counts[d.tier] !== undefined) counts[d.tier]++ })
    return Object.entries(counts).map(([tier, count]) => ({ name: TIERS[tier]?.label || tier, count, color: TIERS[tier]?.color || '#888' }))
  }, [allData])

  const daily7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = d.toISOString().split('T')[0]
    const dayData = allData.filter(e => e.date === ds)
    return { label: d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric' }), checkins: dayData.length, avgScore: dayData.length ? Math.round(dayData.reduce((s, e) => s + (e.score ?? e.wellness ?? 0), 0) / dayData.length) : 0 }
  }), [allData])

  const filteredUsers = useMemo(() => !search ? users : users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())), [users, search])

  return (
    <PageShell>
      <SectionHeader icon="⚙️" title="Admin Dashboard" subtitle={`${users.length} users · ${allData.length} total check-ins`} />

      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--cream2)', padding:4, borderRadius:10, width:'fit-content' }}>
        {['overview','users','export'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'7px 18px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .2s', background: tab===t ? 'var(--white)' : 'transparent', color: tab===t ? 'var(--green)' : 'var(--muted)', boxShadow: tab===t ? 'var(--shadow-sm)' : 'none', textTransform:'capitalize' }}>
            {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : '📥 Export'}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab allData={allData} users={users} tierDist={tierDist} daily7={daily7} />}
      {tab === 'users'    && <UsersTab users={filteredUsers} search={search} setSearch={setSearch} />}
      {tab === 'export'   && <ExportTab allData={allData} users={users} />}
    </PageShell>
  )
}

function OverviewTab({ allData, users, tierDist, daily7 }) {
  const avg       = allData.length ? Math.round(allData.reduce((s, e) => s + (e.score ?? e.wellness ?? 0), 0) / allData.length) : 0
  const todayCount = allData.filter(e => e.date === new Date().toISOString().split('T')[0]).length

  return (
    <>
      <div className="grid-3" style={{ marginBottom:20 }}>
        {[
          { icon:'👥', label:'Total Users',       value: users.length },
          { icon:'📊', label:'Total Check-ins',   value: allData.length },
          { icon:'📅', label:"Today's Check-ins", value: todayCount },
          { icon:'📈', label:'Overall Avg Score', value: avg ? `${avg}/100` : '—' },
          { icon:'🌿', label:'Healthy (≥85)',      value: allData.filter(e => (e.score ?? e.wellness) >= 85).length },
          { icon:'🆘', label:'Severe (<33)',       value: allData.filter(e => (e.score ?? e.wellness) < 33).length },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center', padding:'14px 10px' }}>
            <p style={{ fontSize:18, marginBottom:4 }}>{s.icon}</p>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5 }}>{s.label}</p>
            <p style={{ fontSize:20, fontWeight:700, color:'var(--green)', fontFamily:"'Lora',serif", marginTop:4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <SectionHeader icon="📅" title="7-Day Activity" subtitle="Daily check-ins this week" />
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={daily7} margin={{ top:5, right:5, left:-20, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EE" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize:11, fill:'#6B8069' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#6B8069' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background:'#fff', border:'1px solid #DCE8DC', borderRadius:10, fontSize:12, fontFamily:'Nunito,sans-serif' }} />
            <Bar dataKey="checkins" fill="#1B5E3B" radius={[6,6,0,0]} name="Check-ins" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <SectionHeader icon="🎯" title="Tier Distribution" subtitle="All-time across all users" />
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {tierDist.map(t => {
            const pct = allData.length ? Math.round((t.count / allData.length) * 100) : 0
            return (
              <div key={t.name} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', minWidth:110 }}>{t.name}</span>
                <div style={{ flex:1, height:8, background:'var(--cream2)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:t.color, borderRadius:4, transition:'width .5s ease' }} />
                </div>
                <span style={{ fontSize:12, color:'var(--muted)', minWidth:60, textAlign:'right' }}>{t.count} ({pct}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function UsersTab({ users, search, setSearch }) {
  return (
    <>
      <div style={{ marginBottom:16 }}>
        <input type="search" placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        {users.length === 0
          ? <p style={{ textAlign:'center', padding:20, color:'var(--muted)', fontSize:14 }}>No users found</p>
          : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {users.map((u, i) => {
                const t = u.lastTier ? TIERS[u.lastTier] : null
                return (
                  <div key={u.email} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderTop: i===0 ? 'none' : '1px solid var(--border)' }}>
                    <Avatar initials={u.name.slice(0,2).toUpperCase()} size={40} />
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{u.name}</p>
                      <p style={{ fontSize:12, color:'var(--muted)' }}>{u.email}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      {u.avgScore && <p style={{ fontSize:14, fontWeight:700, color:'var(--green)' }}>{u.avgScore}/100 avg</p>}
                      <p style={{ fontSize:11, color:'var(--muted)' }}>{u.history.length} check-ins</p>
                      {u.lastCheckin && <p style={{ fontSize:11, color:'var(--muted)' }}>Last: {u.lastCheckin}</p>}
                    </div>
                    {t && <span className="badge" style={{ background:t.bg, color:t.color, fontSize:10 }}>{t.label}</span>}
                    <button className="btn-ghost" onClick={() => exportCSV(u.email)} style={{ fontSize:12 }}>CSV ↓</button>
                  </div>
                )
              })}
            </div>
        }
      </div>
    </>
  )
}

function ExportTab({ allData, users }) {
  const [done, setDone] = useState(false)
  const doExport = () => { exportCSV(); setDone(true); setTimeout(() => setDone(false), 2500) }
  const preview  = allData.slice(0, 5)

  return (
    <>
      <div className="card" style={{ marginBottom:16 }}>
        <SectionHeader icon="📥" title="Export All Data" subtitle="Download as CSV for analysis" />
        <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7, marginBottom:16 }}>
          Exports all check-in records including: date, name, email, wellness score, raw PHQ/GAD scores, tier, summary, and timestamp.
        </p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
          {[{ label:'Users', value:users.length }, { label:'Records', value:allData.length }].map(s => (
            <div key={s.label} className="card" style={{ flex:1, textAlign:'center', padding:'12px', minWidth:120, background:'var(--cream)' }}>
              <p style={{ fontSize:22, fontWeight:700, color:'var(--green)', fontFamily:"'Lora',serif" }}>{s.value}</p>
              <p style={{ fontSize:11, color:'var(--muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={doExport} style={{ width:'100%', justifyContent:'center', padding:'13px' }}>
          {done ? '✅ Downloaded!' : '📥 Export All Data as CSV'}
        </button>
      </div>

      {preview.length > 0 && (
        <div className="card">
          <SectionHeader icon="👁" title="Data Preview" subtitle="First 5 records" />
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr>
                  {['Date','Name','Score','Depression','Anxiety','Tier'].map(h => (
                    <th key={h} style={{ padding:'8px 10px', textAlign:'left', background:'var(--cream)', color:'var(--muted)', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:.5, borderBottom:'1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'8px 10px', color:'var(--text)' }}>{row.date}</td>
                    <td style={{ padding:'8px 10px', color:'var(--text)' }}>{row.name}</td>
                    <td style={{ padding:'8px 10px', fontWeight:700, color:'var(--green)' }}>{row.score ?? row.wellness}</td>
                    <td style={{ padding:'8px 10px', color:'var(--text)' }}>{row.depression ?? '—'}</td>
                    <td style={{ padding:'8px 10px', color:'var(--text)' }}>{row.anxiety ?? '—'}</td>
                    <td style={{ padding:'8px 10px' }}>
                      <span className="badge" style={{ background:TIERS[row.tier]?.bg, color:TIERS[row.tier]?.color, fontSize:10 }}>
                        {TIERS[row.tier]?.label || row.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
