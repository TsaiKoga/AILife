import { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useReadContract, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import dynamic from 'next/dynamic';
import { CHARACTER_REGISTRY_ABI, CHARACTER_REGISTRY_ADDRESS } from '@/config/contracts';

const PhaserGame = dynamic(() => import('@/components/Game/PhaserGame'), { ssr: false });

export default function Home() {
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();
  
  const [apiToken, setApiToken] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [character, setCharacter] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Read Character from Contract
  const { data: contractChar, isError: isReadError } = useReadContract({
    address: CHARACTER_REGISTRY_ADDRESS,
    abi: CHARACTER_REGISTRY_ABI,
    functionName: 'getCharacter',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && (CHARACTER_REGISTRY_ADDRESS as string) !== "0x0000000000000000000000000000000000000000"
    }
  });

  useEffect(() => {
    if (contractChar && (contractChar as any).exists) {
      const charData = contractChar as any;
      // Load character from chain
      setCharacter({
        id: address,
        name: charData.name,
        hairColor: charData.hairColor,
        hasGlasses: charData.hasGlasses,
        personality: charData.personality,
        health: Number(charData.health),
        hunger: Number(charData.hunger),
        x: 400, // Spawn point
        y: 300
      });
    }
  }, [contractChar, address]);

  // Generate random character attributes
  const generateCharacter = async () => {
    if (!apiToken) {
      alert('Please enter an AI API Token first!');
      return;
    }
    if (!characterName.trim()) {
        alert('Please enter a Character Name!');
        return;
    }
    
    try {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF'];
      const personalities = ['Friendly', 'Grumpy', 'Curious', 'Lazy', 'Energetic'];
      
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomGlasses = Math.random() > 0.5;
      const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];

      // 1. Try to Write to Contract (If configured)
      if ((CHARACTER_REGISTRY_ADDRESS as string) !== "0x0000000000000000000000000000000000000000") {
          try {
            await writeContractAsync({
                address: CHARACTER_REGISTRY_ADDRESS,
                abi: CHARACTER_REGISTRY_ABI,
                functionName: 'createCharacter',
                args: [characterName, randomColor, randomGlasses, randomPersonality],
            });
            console.log("Character created on chain!");
          } catch (e) {
              console.error("Contract write failed, falling back to local:", e);
              // Fallback to signature if contract fails (e.g. user rejects or no gas)
              await signMessageAsync({ message: `Generate My AI Life Character: ${characterName}` });
          }
      } else {
          // 2. Fallback: Signature only (Local mode)
          await signMessageAsync({ message: `Generate My AI Life Character: ${characterName}` });
      }
      
      const newChar = {
        id: address,
        name: characterName,
        hairColor: randomColor,
        hasGlasses: randomGlasses,
        personality: randomPersonality,
        health: 100,
        hunger: 0, 
        x: 400, 
        y: 300
      };
      
      setCharacter(newChar);
    } catch (error) {
      console.error('Failed to generate character:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-4xl mb-8 font-bold pixel-font">AI Life: Web3 Town</h1>
        <ConnectButton />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4">
        <h1 className="text-2xl font-bold">Welcome, Traveler</h1>
        
        <div className="flex flex-col gap-2 w-64">
          <label>Character Name:</label>
          <input 
            type="text" 
            className="p-2 text-black rounded"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter Name..."
          />
        </div>

        <div className="flex flex-col gap-2 w-64">
          <label>OpenAI/AI API Token:</label>
          <input 
            type="password" 
            className="p-2 text-black rounded"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="sk-..."
          />
        </div>
        
        <button 
          onClick={generateCharacter}
          className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500 transition mt-4"
        >
          Sign & Generate Character
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="absolute top-0 left-0 p-4 z-10 flex justify-between w-full pointer-events-none">
        <div className="bg-black/50 p-2 rounded text-white pointer-events-auto min-w-[200px]">
          <h2 className="font-bold text-xl text-yellow-400">{character.name}</h2>
          <div className="text-sm space-y-1 mt-1">
            <p>Personality: <span className="text-blue-300">{character.personality}</span></p>
            <p>Health: <span className="text-green-400">{character.health}/100</span></p>
            <p>Hunger: <span className="text-orange-400">{character.hunger}/100</span></p>
            <p className="text-xs text-gray-400 mt-1">Glasses: {character.hasGlasses ? 'Yes' : 'No'}</p>
            <p className="text-xs text-gray-400">Wallet: {address?.slice(0,6)}...</p>
          </div>
        </div>
        <div className="pointer-events-auto">
           <ConnectButton />
        </div>
      </div>
      
      {/* Game Area */}
      <PhaserGame 
        character={character} 
        apiToken={apiToken} 
      />
    </div>
  );
}
