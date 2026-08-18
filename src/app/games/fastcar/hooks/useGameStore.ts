// src/app/games/fastcar/hooks/useGameStore.ts
import { create } from 'zustand'

type GameState = 'MENU' | 'PLAYING' | 'SETTINGS'

interface GameStore {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  musicVolume: number;
  setMusicVolume: (volume: number) => void;

  // Penambahan Status Jeda
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'MENU', 
  setGameState: (state) => set({ gameState: state }),
  
  musicVolume: 0.4,
  setMusicVolume: (volume) => set({ musicVolume: volume }),

  // Status awal tidak dijeda
  isPaused: false,
  setPaused: (paused) => set({ isPaused: paused }),
}))