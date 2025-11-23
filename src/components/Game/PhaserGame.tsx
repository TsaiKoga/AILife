import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { GameScene } from './GameScene';
import { UIScene } from './UIScene';

interface PhaserGameProps {
  character: any;
  apiToken: string;
}

export default function PhaserGame({ character, apiToken }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parentEl.current) return;
    
    if (gameRef.current) {
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: parentEl.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 }, // Top down
          debug: false
        }
      },
      scene: [GameScene, UIScene], // Add UIScene here
      backgroundColor: '#2d2d2d',
      audio: {
        noAudio: true
      }
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    
    // Pass data to the scene
    game.registry.set('playerData', character);
    game.registry.set('apiToken', apiToken);

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []); // Run once on mount

  return <div ref={parentEl} className="w-full h-full" />;
}
