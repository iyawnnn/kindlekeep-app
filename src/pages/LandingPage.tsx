import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LandingPage = () => {
  const [scanValue, setScanValue] = useState('');
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = scanValue.trim();
    if (!trimmed) return;
    navigate(`/signup?url=${encodeURIComponent(trimmed)}`);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: { opacity: 1, y: 0 },
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
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto text-center gap-10">
        <motion.div
          className="w-full"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: shouldReduceMotion ? 0 : 0.08 }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-2 mb-5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-primary text-xs font-semibold uppercase tracking-widest">
              Live monitoring
            </span>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-4xl md:text-6xl font-semibold mb-4 tracking-tight text-black text-balance">
              Uptime monitoring with real security auditing
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl mb-10">
              Enter a URL to run a free header, TLS, and uptime scan.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <form onSubmit={handleScan} className="flex items-stretch rounded-xl border border-zinc-300 bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
              <div className="flex items-center pl-4 pr-2">
                <Search className="text-zinc-400 w-5 h-5" />
              </div>
              <input
                type="text"
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                placeholder="https://yourproject.com"
                className="flex-1 bg-transparent border-none outline-none text-zinc-900 py-4 px-2 placeholder:text-zinc-400"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 transition-colors"
              >
                Scan
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};
