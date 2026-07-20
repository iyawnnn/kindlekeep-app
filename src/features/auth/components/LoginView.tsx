// src/features/auth/components/LoginView.tsx
import { Button } from '@radix-ui/themes';
import { SiGithub, SiGoogle, SiGitlab } from 'react-icons/si';
import { KindleCard } from '../../../components/ui/KindleCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5247';

export const LoginView = () => {
  const handleLogin = (provider: 'github' | 'google' | 'gitlab') => {
    window.location.href = `${API_BASE_URL}/api/auth/login/${provider}`;
  };

  // Optical scaling and wireframe conversion for SimpleIcons to match the 
  // 1px stroke weight of the surrounding Lucide React ecosystem.
  const iconWireframeStyle = {
    fill: 'transparent',
    stroke: 'currentColor',
    strokeWidth: '1px'
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans text-zinc-900">
      <div className="w-full max-w-sm">
        <KindleCard isActive={true} className="p-8">
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="font-wordmark text-4xl tracking-wide text-black mb-2 lowercase">
              kindlekeep
            </h1>
            <h2 className="text-zinc-500 font-heading font-black text-sm uppercase tracking-widest">
              Identity Hub
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              size="3"
              variant="outline"
              color="gray"
              highContrast
              className="w-full cursor-pointer justify-start px-6 font-mono group"
              onClick={() => handleLogin('github')}
            >
              <SiGithub
                className="mr-3 w-4 h-4 text-zinc-500 group-hover:text-black transition-colors"
                style={iconWireframeStyle}
              />
              Authenticate via GitHub
            </Button>

            <Button
              size="3"
              variant="outline"
              color="gray"
              highContrast
              className="w-full cursor-pointer justify-start px-6 font-mono group"
              onClick={() => handleLogin('google')}
            >
              <SiGoogle
                className="mr-3 w-4 h-4 text-zinc-500 group-hover:text-black transition-colors"
                style={iconWireframeStyle}
              />
              Authenticate via Google
            </Button>

            <Button
              size="3"
              variant="outline"
              color="gray"
              highContrast
              className="w-full cursor-pointer justify-start px-6 font-mono group"
              onClick={() => handleLogin('gitlab')}
            >
              <SiGitlab
                className="mr-3 w-4 h-4 text-zinc-500 group-hover:text-black transition-colors"
                style={iconWireframeStyle}
              />
              Authenticate via GitLab
            </Button>
          </div>
        </KindleCard>
      </div>
    </div>
  );
};