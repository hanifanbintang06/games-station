import { create } from 'zustand'

type LapStatus = 'EXPLORATION' | 'ARMED' | 'HOT_LAP' | 'FINISHED'

interface FastLapState {
  status: LapStatus
  currentSector: number // 1, 2, atau 3
  startTime: number
  split1Time: number
  split2Time: number
  lastLapTime: number
  bestLapTime: number
  setStatus: (status: LapStatus) => void
  setSector: (sector: number) => void
  recordStartTime: (time: number) => void
  recordSplit1: (time: number) => void
  recordSplit2: (time: number) => void
  recordLap: (time: number) => void
}

export const useFastLapStore = create<FastLapState>((set) => ({
  status: 'EXPLORATION',
  currentSector: 1,
  startTime: 0,
  split1Time: 0,
  split2Time: 0,
  lastLapTime: 0,
  bestLapTime: Infinity,

  setStatus: (status) => set({ status }),
  setSector: (sector) => set({ currentSector: sector }),
  recordStartTime: (time) => set({ startTime: time }),
  recordSplit1: (time) => set({ split1Time: time }),
  recordSplit2: (time) => set({ split2Time: time }),
  
  recordLap: (time) => set((state) => {
    const lapTime = time - state.startTime
    return {
      lastLapTime: lapTime,
      bestLapTime: lapTime < state.bestLapTime ? lapTime : state.bestLapTime
    }
  }),
}))