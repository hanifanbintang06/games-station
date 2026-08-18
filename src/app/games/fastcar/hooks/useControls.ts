// hooks/useControls.ts
import { useEffect, useRef } from 'react';

export const useControls = () => {
  // Tambahkan q dan e pada inisialisasi awal
  const controls = useRef({ w: false, s: false, a: false, d: false, q: false, e: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') controls.current.w = true;
      if (e.key.toLowerCase() === 's') controls.current.s = true;
      if (e.key.toLowerCase() === 'a') controls.current.a = true;
      if (e.key.toLowerCase() === 'd') controls.current.d = true;
      if (e.key.toLowerCase() === 'q') controls.current.q = true;
      if (e.key.toLowerCase() === 'e') controls.current.e = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') controls.current.w = false;
      if (e.key.toLowerCase() === 's') controls.current.s = false;
      if (e.key.toLowerCase() === 'a') controls.current.a = false;
      if (e.key.toLowerCase() === 'd') controls.current.d = false;
      if (e.key.toLowerCase() === 'q') controls.current.q = false;
      if (e.key.toLowerCase() === 'e') controls.current.e = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
};