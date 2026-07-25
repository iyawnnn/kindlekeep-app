import { SiGithub, SiGoogle, SiGitlab } from 'react-icons/si';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../lib/axios';

export const Signup = () => {
  const shouldReduceMotion = useReducedMotion();

  const handleSignup = (provider: string) => {
    window.location.href = `${api.defaults.baseURL}/api/auth/login/${provider}`;
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 h-16 w-full">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="size-7 rounded-md" />
            <span className="text-xl font-semibold text-black tracking-tight lowercase">
              kindlekeep
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto text-center gap-10">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center text-center"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-black mb-2 tracking-tight">
            Create your account
          </h1>
          <p className="text-zinc-500 mb-8">
            Free uptime and security monitoring, no card required.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => handleSignup('github')}
              className="flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 hover:border-primary text-zinc-900 py-3 px-6 rounded-lg transition-colors border border-zinc-300 focus:border-primary cursor-pointer"
            >
              <SiGithub size={18} />
              <span className="font-medium text-sm">Continue with GitHub</span>
            </button>

            <button
              onClick={() => handleSignup('google')}
              className="flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 hover:border-primary text-zinc-900 py-3 px-6 rounded-lg transition-colors border border-zinc-300 focus:border-primary cursor-pointer"
            >
              <SiGoogle size={18} />
              <span className="font-medium text-sm">Continue with Google</span>
            </button>

            <button
              onClick={() => handleSignup('gitlab')}
              className="flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 hover:border-primary text-zinc-900 py-3 px-6 rounded-lg transition-colors border border-zinc-300 focus:border-primary cursor-pointer"
            >
              <SiGitlab size={18} />
              <span className="font-medium text-sm">Continue with GitLab</span>
            </button>
          </div>

          <p className="text-sm text-zinc-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-accent-foreground">
              Sign in
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};
