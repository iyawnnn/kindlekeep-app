import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { MonitorDetail } from './pages/MonitorDetail';
import { Incidents } from './pages/Incidents';
import { Vault } from './pages/Vault';
import { Badges } from './pages/Badges';
import { Identity } from './pages/Identity';
import { DevApi } from './pages/DevApi';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { PublicStatus } from './pages/PublicStatus';
import { PublicStatusHub } from './pages/PublicStatusHub';
import { StatusPages } from './pages/StatusPages';
import { StatusPageEditor } from './pages/StatusPageEditor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AuthCallbackRoute = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('jwt_token', token);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
};

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/status/:slug" element={<PublicStatus />} />
        <Route path="/hub/:slug" element={<PublicStatusHub />} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/monitor/:id" element={<MonitorDetail />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/status-pages" element={<StatusPages />} />
          <Route path="/status-pages/:id" element={<StatusPageEditor />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account" element={<Identity />} />
          <Route path="/dev" element={<DevApi />} />
        </Route>
        <Route path="/auth-callback" element={<AuthCallbackRoute />} />
        {/* Fallback for old route if needed */}
        <Route path="/auth/callback/:provider" element={<AuthCallbackRoute />} />
      </Routes>
    </Router>
  );
};