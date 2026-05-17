import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'

// Layouts
import MainLayout from './components/layout/MainLayout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DatabaseExplorer from './pages/DatabaseExplorer'
import TableManager from './pages/TableManager'
import SqlEditor from './pages/SqlEditor'
import FileUpload from './pages/FileUpload'
import McqUpload from './pages/McqUpload'

function App() {
  const { session, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession, setLoading])

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
      
      <Route element={session ? <MainLayout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/explorer/:tableName?" element={<DatabaseExplorer />} />
        <Route path="/schema" element={<TableManager />} />
        <Route path="/sql" element={<SqlEditor />} />
        <Route path="/upload" element={<FileUpload />} />
        <Route path="/mcq-upload" element={<McqUpload />} />
      </Route>
    </Routes>
  )
}

export default App
