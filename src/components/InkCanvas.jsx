import { useEffect, useRef } from 'react';
import { InkLandscape } from '../lib/inkBackground.js';

export default function InkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const landscape = new InkLandscape(canvasRef.current);

    return () => {
      landscape.dispose();
    };
  }, []);

  return <canvas id="ink-canvas" ref={canvasRef} />;
}
