import { useState } from 'react'
import { AppProvider, useApp }             from './context/AppContext'
import { AuthScreen }                      from './components/AuthScreen'
import { TopNav }                          from './components/TopNav'
import { Dashboard }                       from './components/Dashboard'
import { QuestionnaireIntro,
         CheckinQuestionnaire }            from './components/CheckinQuestionnaire'
import { ResultsScreen }                   from './components/ResultsScreen'
import { CommunityPage }                   from './components/CommunityPage'
import { TherapistDirectory }              from './components/TherapistDirectory'
import { StreaksPage }                     from './components/StreaksPage'
import { AdminPage }                       from './components/AdminPage'
import { Spinner }                         from './components/UI'

function AppInner() {
  const { user, loading, saveCheckin } = useApp()
  const [page,       setPage]       = useState('dashboard')
  const [subPage,    setSubPage]    = useState(null)   // 'intro' | 'quiz' | null
  const [lastResult, setLastResult] = useState(null)

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)' }}>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:52, marginBottom:16 }}>🧠</p>
          <Spinner green size={28} />
          <p style={{ fontFamily:"'Lora',serif", color:'var(--green)', fontSize:16, marginTop:14 }}>Loading Countor…</p>
        </div>
      </div>
    )
  }

  if (!user) return <AuthScreen />

  // ── Check-in flow (full-screen, no nav) ─────────────────────────────────────
  if (page === 'checkin' && subPage === 'intro') {
    return (
      <QuestionnaireIntro
        onStart={() => setSubPage('quiz')}
        onBack={() => { setPage('dashboard'); setSubPage(null) }}
      />
    )
  }

  if (page === 'checkin' && subPage === 'quiz') {
    return (
      <CheckinQuestionnaire
        onComplete={(result, rawAnswers) => {
          const entry = { ...result, score: result.wellness, answers: rawAnswers }
          saveCheckin(entry)
          setLastResult(entry)
          setPage('results')
          setSubPage(null)
        }}
        onBack={() => setSubPage('intro')}
      />
    )
  }

  // ── Navigate to check-in ────────────────────────────────────────────────────
  const startCheckin = () => { setPage('checkin'); setSubPage('intro') }

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <TopNav currentPage={page} onNavigate={(p) => { setPage(p); setSubPage(null); if (p === 'checkin') setSubPage('intro') }} />

      <main style={{ maxWidth:760, margin:'0 auto' }}>
        {page === 'dashboard'  && <Dashboard onStartCheckin={startCheckin} />}
        {page === 'community'  && <CommunityPage />}
        {page === 'therapists' && <TherapistDirectory />}
        {page === 'streaks'    && <StreaksPage onStartCheckin={startCheckin} />}
        {page === 'admin'      && <AdminPage />}
        {page === 'results' && lastResult && (
          <ResultsScreen
            result={lastResult}
            onDashboard={() => setPage('dashboard')}
            onRetake={startCheckin}
          />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
