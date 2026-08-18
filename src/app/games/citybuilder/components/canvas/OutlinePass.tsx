'use client';

import { forwardRef, useMemo } from 'react';
import { Effect } from 'postprocessing';
import { PixelOutlineEffect } from '../../core/PixelOutlineEffect';

const OutlinePass = forwardRef<Effect>((_props, ref) => {
  const effect = useMemo(() => new PixelOutlineEffect(), []);
  return <primitive ref={ref} object={effect} dispose={null} />;
});

OutlinePass.displayName = 'OutlinePass';
export default OutlinePass;