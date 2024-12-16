import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import { DarkModeToggle } from './components/ui/DarkModeToggle'
import { NotificationProvider } from './contexts/NotificationContext'
import AuthenticatedApp from './components/auth/AuthenticatedApp'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<AuthenticatedApp />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
        <DarkModeToggle />
        <Toaster position="top-right" />
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App
