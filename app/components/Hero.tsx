'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

      {/* Título y subtítulo — centrados */}
      <div className="text-center px-6 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-6xl md:text-8xl font-bold tracking-tight"
          style={{ color: 'white' }}
        >
          Casa Amarilla
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="mt-6 text-xl md:text-2xl text-white"
        >
          <span className="font-bold">Productos Argentinos.</span> Hacé tu pedido y lo coordinamos.
        </motion.p>
      </div>

      {/* Scroll indicator — posición absoluta independiente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ position: 'absolute', bottom: '80px', left: 0, right: 0 }}
        className="text-white text-sm flex flex-col items-center gap-2"
      >
        <span>Scroll para ver productos</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{ width: '2px', height: '32px', background: 'white' }}
        />
      </motion.div>

    </section>
  );
}
