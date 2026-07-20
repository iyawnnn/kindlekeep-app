import { Box, Flex, Text } from '@radix-ui/themes';
import { SiGithub, SiGoogle, SiGitlab } from 'react-icons/si';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Signup = () => {
  const shouldReduceMotion = useReducedMotion();

  const handleSignup = (provider: string) => {
    window.location.href = `http://localhost:5247/api/auth/login/${provider}`;
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
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-start text-left border-l border-black pl-6 py-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
            </span>
            <Text className="font-mono text-blue-600 text-sm tracking-widest">
              [STATUS: STANDBY]
            </Text>
          </div>
          <Text className="font-unbounded font-bold text-xl md:text-3xl text-black mb-2 tracking-tight uppercase">
            ACCOUNT: PROVISION
          </Text>
          <Text className="text-zinc-600 font-onest mb-6">
            Registering your industrial footprint. Select a provider to continue.
          </Text>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => handleSignup('github')}
              className="flex-1 flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 text-zinc-900 py-4 px-6 rounded-none transition-all border border-zinc-300 hover:border-black hover:-translate-y-0.5 focus:border-blue-500"
            >
              <SiGithub size={18} />
              <span className="font-onest font-medium tracking-wide uppercase text-sm">GitHub</span>
            </button>

            <button
              onClick={() => handleSignup('google')}
              className="flex-1 flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 text-zinc-900 py-4 px-6 rounded-none transition-all border border-zinc-300 hover:border-black hover:-translate-y-0.5 focus:border-blue-500"
            >
              <SiGoogle size={18} />
              <span className="font-onest font-medium tracking-wide uppercase text-sm">Google</span>
            </button>

            <button
              onClick={() => handleSignup('gitlab')}
              className="flex-1 flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 text-zinc-900 py-4 px-6 rounded-none transition-all border border-zinc-300 hover:border-black hover:-translate-y-0.5 focus:border-blue-500"
            >
              <SiGitlab size={18} />
              <span className="font-onest font-medium tracking-wide uppercase text-sm">GitLab</span>
            </button>
          </div>
        </motion.div>
      </main>
    </Box>
  );
};
