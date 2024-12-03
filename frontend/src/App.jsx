import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import Overview from './pages/Overview'
import ControlPanel from './pages/ControlPanel'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { SocketProvider } from './context/SocketContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider> 
        <SocketProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/control" element={<ControlPanel />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
