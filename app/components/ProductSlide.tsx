'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NextImage from 'next/image';
import { Product } from '@/lib/api';

const H_DURATION = 0.42;

interface SubProduct {
  image: string;
  name: string;
  description?: string;
}

const SUB_PRODUCTS: Record<string, SubProduct[]> = {
  'Empanadas': [
    { image: 'https://casa-amarilla-mf.vercel.app/espinaca.png', name: 'Espinaca', description: 'Relleno de espinaca y ricota, una clásica empanada argentina.' },
  ],
  'Alfajores': [
    { image: 'https://casa-amarilla-mf.vercel.app/avellana.png', name: 'Avellana', description: 'Alfajor relleno de suave crema de avellanas, bañado en chocolate. Una combinación irresistible.' },
  ],
};

interface Panel { name: string; description: string; }

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%' }),
};

const RING_TEXT: Record<string, string> = {
  'Empanadas': '◆ Repulgue a mano · Masa de hojaldre · Lote semanal · ◆ Repulgue a mano · Masa de hojaldre · Lote semanal · ',
  'Alfajores': '◆ Chocolate templado · Receta de autor · Envuelto a mano · ◆ Chocolate templado · Receta de autor · Envuelto a mano · ',
};

export default function ProductSlide({ product, imageScale = 1, index = 1 }: { product: Product; imageScale?: number; index?: number }) {
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

  const slideLabels = [
    product.variant?.name ?? product.category,
    ...subProducts.map(s => s.name),
  ];

  const rightPanel = rightPanels[rightIndex];
  const ringText = RING_TEXT[product.category ?? ''] ?? '';

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Preload oculto de todas las imágenes del carrusel */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        {images.map((src, i) => (
          <div key={`pre-${i}`} style={{ position: 'relative', width: isMobile ? `${Math.min(85, 85 * imageScale)}vw` : `${50 * imageScale}vw`, height: isMobile ? '45vh' : '100vh' }}>
            <NextImage src={src} alt="" fill priority sizes={isMobile ? `${Math.min(85, 85 * imageScale)}vw` : `${50 * imageScale}vw`} style={{ objectFit: 'contain' }} />
          </div>
        ))}
      </div>

      {/* Ring de texto giratorio — detrás de la imagen */}
      {!isMobile && ringText && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '54vmin', height: '54vmin',
          animation: 'spin-ring 90s linear infinite',
          pointerEvents: 'none', zIndex: 1, opacity: 0.5,
        }}>
          <svg viewBox="-200 -200 400 400" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <path id={`ring-${product.name}`} d="M 0 0 m -170 0 a 170 170 0 1 1 340 0 a 170 170 0 1 1 -340 0" />
            </defs>
            <text fontFamily="var(--font-geist-mono), monospace" fontSize="14" letterSpacing="8" fill="white" stroke="white" strokeWidth="0.4">
              <textPath href={`#ring-${product.name}`}>{ringText}</textPath>
            </text>
          </svg>
        </div>
      )}

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
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
        >
          {isMobile ? (
            <div style={{ position: 'relative', width: `${Math.min(85, 85 * imageScale)}vw`, height: '45vh' }}>
              <NextImage src={images[hIndex]} alt="" fill sizes={`${Math.min(85, 85 * imageScale)}vw`} style={{ objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' }} />
            </div>
          ) : (
            <div style={{ position: 'relative', width: `${50 * imageScale}vw`, height: '100vh' }}>
              <NextImage src={images[hIndex]} alt="" fill sizes={`${50 * imageScale}vw`} style={{ objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' }} priority />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Texto izquierdo — siempre visible */}
      <div style={{
        position: 'absolute',
        zIndex: 3,
        ...(isMobile
          ? { top: '170px', left: 0, right: 0, textAlign: 'center', padding: '0 28px' }
          : { left: '5vw', top: '50%', transform: 'translateY(-50%)', maxWidth: '24vw', display: 'flex', flexDirection: 'column', gap: '20px' }
        ),
      }}>
        {/* Title */}
        <h2 style={{
          fontSize: isMobile ? 'clamp(36px, 10vw, 56px)' : 'clamp(46px, 6vw, 96px)',
          fontWeight: 800, color: 'white', textTransform: 'uppercase',
          lineHeight: 0.88, letterSpacing: '-0.045em', margin: 0,
        }}>
          {product.category}
        </h2>
        {/* Description */}
        <p style={{
          color: 'rgba(245,240,232,0.7)',
          marginTop: isMobile ? '10px' : '0',
          fontSize: isMobile ? '14px' : '15px',
          lineHeight: 1.55, maxWidth: isMobile ? undefined : '300px',
        }}>
          {product.description}
        </p>
      </div>

      {/* Texto derecho — fade al cambiar slide */}
      {rightPanel && (
        <div style={{
          position: 'absolute',
          zIndex: 3,
          opacity: rightVisible ? 1 : 0,
          transition: rightVisible ? 'opacity 0.3s ease' : 'opacity 0.15s ease',
          ...(isMobile
            ? { bottom: '120px', left: 0, right: 0, textAlign: 'center', padding: '0 28px' }
            : { right: '5vw', top: '50%', transform: 'translateY(-50%)', maxWidth: '24vw', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-end' }
          ),
        }}>
          {/* Gold eyebrow */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            flexDirection: isMobile ? 'row-reverse' : 'row',
            justifyContent: isMobile ? 'center' : 'flex-end',
          }}>
            <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)' }}>
              Variedad
            </span>
            <div style={{ width: '28px', height: '1px', background: 'var(--accent)' }} />
          </div>
          {/* Variant name */}
          <h2 style={{
            fontSize: isMobile ? 'clamp(28px, 8vw, 44px)' : 'clamp(36px, 4.2vw, 64px)',
            fontWeight: 800, color: 'white', textTransform: 'uppercase',
            lineHeight: 0.95, letterSpacing: '-0.035em', margin: 0,
          }}>
            {rightPanel.name}
          </h2>
          {/* Variant description */}
          <p style={{
            color: 'rgba(245,240,232,0.75)',
            marginTop: isMobile ? '8px' : '0',
            fontSize: isMobile ? '13px' : '14px',
            lineHeight: 1.55, maxWidth: isMobile ? undefined : '280px',
          }}>
            {rightPanel.description}
          </p>
          {/* Price */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.6)' }}>
              <span>Desde</span>
              <b style={{ fontFamily: 'var(--font-geist-sans), sans-serif', color: 'white', fontWeight: 700, fontSize: '22px', letterSpacing: '-0.01em' }}>${product.price}</b>
              <span>/ unidad</span>
            </div>
          )}
        </div>
      )}

      {/* Sub-carousel */}
      {totalSlides > 1 && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '24px' : '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 5,
          background: 'rgba(10,10,10,0.55)',
          border: '1px solid rgba(245,240,232,0.12)',
          padding: '10px 14px',
          borderRadius: '999px',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <button className="sub-arrow" onClick={() => navigate(-1)}>‹</button>
          {slideLabels.map((label, i) => (
            <button
              key={i}
              className={`sub-chip${i === hIndex ? ' active' : ''}`}
              onClick={() => { if (i !== hIndex) navigate(i > hIndex ? 1 : -1); }}
            >
              <span className="sub-dot" />
              {label}
            </button>
          ))}
          <button className="sub-arrow" onClick={() => navigate(1)}>›</button>
        </div>
      )}

    </div>
  );
}
