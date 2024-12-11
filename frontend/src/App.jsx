import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ControlPanel from './pages/ControlPanel'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import Login from './pages/Login'
import { DarkModeToggle } from './components/ui/DarkModeToggle'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/control" element={<ControlPanel />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path='/login' element={<Login />} />
          </Routes>
          <DarkModeToggle />
        </Layout>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App
