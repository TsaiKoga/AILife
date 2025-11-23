import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'AI Life Web3',
  projectId: 'YOUR_PROJECT_ID', // User should replace this or I can put a placeholder
  chains: [base, baseSepolia],
  ssr: true,
});

