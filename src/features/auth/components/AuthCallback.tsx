// src/features/auth/components/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Complex logic: Extracts the JWT token from the query parameters following the OAuth redirect
    // and persists it to local storage to maintain stateless session authorization.
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('jwt_token', token);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-zinc-500 font-mono">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" strokeWidth={1} />
      <p className="uppercase tracking-widest text-sm">Verifying Session State...</p>
    </div>
  );
};