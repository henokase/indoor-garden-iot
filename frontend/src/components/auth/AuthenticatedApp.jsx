import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Layout from "../layout/Layout";
import Dashboard from "../../pages/Dashboard";
import ControlPanel from '../../pages/ControlPanel'
import Settings from '../../pages/Settings'
import Reports from '../../pages/Reports'

const AuthenticatedApp = () => {
    const navigate = useNavigate();
    const location = useLocation();
  
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated')
        const isLoginPage = location.pathname === '/login'
    
        if (isAuthenticated && isLoginPage) {
          navigate('/')
        } else if (!isAuthenticated && !isLoginPage) {
          navigate('/login')
        }
      }, [location.pathname, navigate])
  
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/control" element={<ControlPanel />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    );
  }

  export default AuthenticatedApp