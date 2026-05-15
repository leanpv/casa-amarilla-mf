'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/api';

const H_DURATION = 0.42;

interface SubProduct {
  image: string;
  name: string;
  description?: string;
}

const SUB_PRODUCTS: Record<string, SubProduct[]> = {
  'Empanadas': [
    { image: '/espinaca.png', name: 'Espinaca', description: 'Relleno de espinaca y ricota, una clásica empanada argentina.' },
  ],
  'Alfajores': [
    { image: '/avellana.png', name: 'Avellana', description: 'Alfajor relleno de suave crema de avellanas, bañado en chocolate. Una combinación irresistible.' },
  ],
};

interface Panel { name: string; description: string; }

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%' }),
};

export default function ProductSlide({ product, imageScale = 1 }: { product: Product; imageScale?: number }) {
  const [isMobile, setIsMobile] = useState(false);
  const [hIndex, setHIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [rightIndex, setRightIndex] = useState(0);
  const [rightVisible, setRightVisible] = useState(true);
  const hAnimating = useRef(false);

  const subProducts = SUB_PRODUCTS[product.category ?? ''] ?? [];
  const totalSlides = 1 + subProducts.length;
  const images = [product.image, ...subProducts.map(s => s.image)];

  const rightPanels: (Panel | null)[] = [
    product.variant ? { name: product.variant.name, description: product.variant.description } : null,
    ...subProducts.map(s => ({ name: s.name, description: s.description ?? '' })),
  ];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setHIndex(0);
    setRightIndex(0);
    setRightVisible(true);
  }, [product.name]);

  const navigate = (dir: 1 | -1) => {
    if (hAnimating.current) return;
    const target = (hIndex + dir + totalSlides) % totalSlides;
    hAnimating.current = true;
    setDirection(dir);
    setRightVisible(false);
    setHIndex(target);
    setTimeout(() => {
      setRightIndex(target);
      setRightVisible(true);
    }, (H_DURATION * 1000) / 2);
    setTimeout(() => { hAnimating.current = false; }, H_DURATION * 1000 + 50);
  };

  const arrowStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    [side]: isMobile ? '16px' : '27vw',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    fontSize: '18px',
    transition: 'background 0.2s ease',
  });

  const rightPanel = rightPanels[rightIndex];
  const imgStyleMobile: React.CSSProperties = { width: `${Math.min(85, 85 * imageScale)}vw`, maxHeight: '45vh', objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' };
  const imgStyleDesktop: React.CSSProperties = { width: `${50 * imageScale}vw`, maxWidth: `${50 * imageScale}vw`, height: '100vh', objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' };

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Track de imágenes con dirección */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={hIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: H_DURATION, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img
            src={images[hIndex]}
            alt=""
            style={isMobile ? imgStyleMobile : imgStyleDesktop}
          />
        </motion.div>
      </AnimatePresence>

      {/* Texto izquierdo — siempre visible */}
      <div style={{
        position: 'absolute',
        zIndex: 2,
        ...(isMobile
          ? { top: '185px', left: 0, right: 0, textAlign: 'center', padding: '0 24px' }
          : { left: '5vw', top: '50%', transform: 'translateY(-50%)', maxWidth: '22vw' }
        ),
      }}>
        <h2 style={{ fontSize: isMobile ? 'clamp(1.6rem, 7vw, 2.4rem)' : 'clamp(1.4rem, 2.2vw, 2.8rem)', fontWeight: 800, color: 'white', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>
          {product.category}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: isMobile ? '8px' : '14px', fontSize: isMobile ? 'clamp(0.8rem, 3.5vw, 1rem)' : 'clamp(0.8rem, 1vw, 1rem)', lineHeight: isMobile ? 1.6 : 1.75 }}>
          {product.description}
        </p>
      </div>

      {/* Texto derecho — fade al cambiar slide */}
      {rightPanel && (
        <div style={{
          position: 'absolute',
          zIndex: 2,
          opacity: rightVisible ? 1 : 0,
          transition: rightVisible ? 'opacity 0.3s ease' : 'opacity 0.15s ease',
          ...(isMobile
            ? { bottom: '130px', left: 0, right: 0, textAlign: 'center', padding: '0 24px' }
            : { right: '5vw', top: '50%', transform: 'translateY(-50%)', maxWidth: '22vw', textAlign: 'right' }
          ),
        }}>
          <h2 style={{ fontSize: isMobile ? 'clamp(1.2rem, 5vw, 1.8rem)' : 'clamp(1.4rem, 2.2vw, 2.8rem)', fontWeight: 800, color: 'white', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>
            {rightPanel.name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: isMobile ? '8px' : '14px', fontSize: isMobile ? 'clamp(0.75rem, 3.2vw, 0.95rem)' : 'clamp(0.8rem, 1vw, 1rem)', lineHeight: isMobile ? 1.6 : 1.75 }}>
            {rightPanel.description}
          </p>
        </div>
      )}

      {/* Flechas */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={() => navigate(-1)}
            style={arrowStyle('left')}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >‹</button>
          <button
            onClick={() => navigate(1)}
            style={arrowStyle('right')}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >›</button>
        </>
      )}

      {/* Dots */}
      {totalSlides > 1 && (
        <div style={{ position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', pointerEvents: 'none', zIndex: 2 }}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', opacity: i === hIndex ? 1 : 0.35, transition: 'opacity 0.3s ease' }} />
          ))}
        </div>
      )}

    </div>
  );
}
