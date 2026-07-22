import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Flex, Text, Box } from '@radix-ui/themes';
import { Settings as SettingsIcon, ShieldAlert, Lock } from 'lucide-react';
import { useEffect } from 'react';

import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { MonitorDetail } from './pages/MonitorDetail';
import { Incidents } from './pages/Incidents';
import { Vault } from './pages/Vault';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { PublicStatus } from './pages/PublicStatus';

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

const Layout = ({ children }: { children: React.ReactNode }) => (
  <Box className="min-h-screen bg-white font-onest text-zinc-900">
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <Flex align="center" justify="between" className="max-w-7xl mx-auto px-6 h-16">
        <Link to="/dashboard">
          <Text className="font-wordmark text-xl text-black tracking-tight lowercase">
            kindlekeep
          </Text>
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink
            to="/vault"
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 border-b-2 transition-colors ${
                isActive ? 'text-blue-600 border-blue-500' : 'text-zinc-500 border-transparent hover:text-black'
              }`
            }
          >
            <Lock size={18} strokeWidth={1} />
            <span className="text-sm font-medium font-onest">Vault</span>
          </NavLink>
          <NavLink
            to="/incidents"
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 border-b-2 transition-colors ${
                isActive ? 'text-blue-600 border-blue-500' : 'text-zinc-500 border-transparent hover:text-black'
              }`
            }
          >
            <ShieldAlert size={18} strokeWidth={1} />
            <span className="text-sm font-medium font-onest">Incidents</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 border-b-2 transition-colors ${
                isActive ? 'text-blue-600 border-blue-500' : 'text-zinc-500 border-transparent hover:text-black'
              }`
            }
          >
            <SettingsIcon size={18} strokeWidth={1} />
            <span className="text-sm font-medium font-onest">Settings</span>
          </NavLink>
        </nav>
      </Flex>
    </header>
    <main>
      {children}
    </main>
  </Box>
);

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/status/:slug" element={<PublicStatus />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/monitor/:id" element={<ProtectedRoute><Layout><MonitorDetail /></Layout></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute><Layout><Incidents /></Layout></ProtectedRoute>} />
        <Route path="/vault" element={<ProtectedRoute><Layout><Vault /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/auth-callback" element={<AuthCallbackRoute />} />
        {/* Fallback for old route if needed */}
        <Route path="/auth/callback/:provider" element={<AuthCallbackRoute />} />
      </Routes>
    </Router>
  );
};