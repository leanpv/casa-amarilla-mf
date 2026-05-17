'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const LOAD_MS = 2400;

export default function Hero({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let pct = 0;
    const TICK = 16;
    const step = 100 / (LOAD_MS / TICK);
    const id = setInterval(() => {
      pct = Math.min(100, pct + step);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(id);
        setTimeout(() => onComplete?.(), 450);
      }
    }, TICK);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center px-6"
        style={{ width: '100%', maxWidth: '860px' }}
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight"
          style={{ color: 'white', margin: 0 }}>
          Casa Amarilla
        </h1>
        <p className="mt-6 text-xl md:text-2xl" style={{ color: 'white' }}>
          <span className="font-bold">Productos Argentinos.</span> Hacé tu pedido y lo coordinamos.
        </p>
      </motion.div>

      {/* Percentage counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{
          position: 'absolute', bottom: '48px', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '13px', letterSpacing: '0.22em',
          color: 'white',
        }}>
          {Math.round(progress)}%
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'white',
        }}>
          Cargando
        </div>
      </motion.div>

    </section>
  );
}
