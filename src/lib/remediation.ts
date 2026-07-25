// src/lib/remediation.ts
const REMEDIATION_FILENAMES: Record<string, string> = {
  Vercel: 'vercel.json',
  Netlify: '_headers',
  Nginx: 'nginx.conf',
  Apache: '.htaccess',
  Express: 'security-headers.js',
};

export const remediationFilename = (platform: string | null) =>
  (platform && REMEDIATION_FILENAMES[platform]) || 'remediation.txt';
