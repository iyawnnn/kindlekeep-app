import { useState } from 'react';
import { Box, Flex, Text } from '@radix-ui/themes';
import { Search } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

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
    <Box className="min-h-screen bg-white font-onest text-zinc-900 flex flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <Flex align="center" justify="between" className="max-w-7xl mx-auto px-6 h-16 w-full">
          <Link to="/">
            <Text className="font-wordmark text-xl text-black tracking-tight lowercase">
              kindlekeep
            </Text>
          </Link>
        </Flex>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto text-center gap-10">

        {/* Kindle Scan Section */}
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <Text className="text-blue-600 text-xs font-bold uppercase tracking-widest font-mono">
              Sentinel Engine Online
            </Text>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <Text className="font-unbounded text-4xl md:text-6xl font-bold mb-4 tracking-tight text-black block">
              Precision Scavenger
            </Text>
            <Text className="text-zinc-600 text-lg md:text-xl mb-10 font-onest block">
              Enter a Kindle ID to begin monitoring telemetric data.
            </Text>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <Box className="w-full relative">
              <form onSubmit={handleScan} className="flex items-stretch border border-zinc-300 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all rounded-none">
                <div className="flex items-center pl-4 pr-2">
                  <Search className="text-zinc-400 w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  placeholder="Kindle Scan..."
                  className="flex-1 bg-transparent border-none outline-none text-zinc-900 py-4 px-2 rounded-none placeholder:text-zinc-400 font-onest"
                />
                <button
                  type="submit"
                  className="bg-black text-white hover:bg-zinc-800 font-bold px-8 transition-colors rounded-none font-onest"
                >
                  SCAN
                </button>
              </form>
            </Box>
          </motion.div>
        </motion.div>

        {/* Portal Links */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: shouldReduceMotion ? 0 : 0.3, delay: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/login"
            className="flex-1 py-4 px-6 bg-white hover:bg-zinc-50 text-zinc-900 font-onest font-medium tracking-wide uppercase text-sm transition-all border border-zinc-300 hover:border-blue-500 hover:-translate-y-0.5 rounded-none text-center"
          >
            Enter Command Center
          </Link>
          <Link
            to="/signup"
            className="flex-1 py-4 px-6 bg-black hover:bg-zinc-800 text-white font-onest font-medium tracking-wide uppercase text-sm transition-all border border-black hover:-translate-y-0.5 rounded-none text-center"
          >
            Deploy New Account
          </Link>
        </motion.div>

      </main>
    </Box>
  );
};

