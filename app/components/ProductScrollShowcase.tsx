'use client';

import { useEffect, useRef, useState } from 'react';
import { Product } from '@/lib/api';

const DURATION = 650;
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION = `transform ${DURATION}ms ${EASE}, opacity ${DURATION}ms ease`;

export default function ProductScrollShowcase({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef(0);
  const animatingRef = useRef(false);
  const isVisible = useRef(false);
  const hasEnteredRef = useRef(false);
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    slidesRef.current.forEach((slide) => {
      if (!slide) return;
      slide.style.transition = 'none';
      slide.style.transform = 'translateY(100%) scale(0.8)';
      slide.style.opacity = '0';
    });
    hasEnteredRef.current = false;
    indexRef.current = 0;
    setDotIndex(0);
  }, [products]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting; },
      { threshold: 0.8 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [products.length]);

  useEffect(() => {
    const enterFirstProduct = () => {
      if (hasEnteredRef.current) return;
      hasEnteredRef.current = true;
      animatingRef.current = true;
      isVisible.current = true;

      // Snap la sección al tope del viewport
      if (sectionRef.current) {
        window.scrollTo(0, sectionRef.current.offsetTop);
      }

      const firstSlide = slidesRef.current[0];
      if (firstSlide) {
        firstSlide.style.transition = TRANSITION;
        firstSlide.style.transform = 'translateY(0) scale(1)';
        firstSlide.style.opacity = '1';
      }
      setTimeout(() => { animatingRef.current = false; }, DURATION + 50);
    };

    const navigate = (dir: 1 | -1) => {
      if (animatingRef.current) return;
      const current = indexRef.current;
      const next = current + dir;
      if (next < 0 || next >= products.length) return;
      const currentSlide = slidesRef.current[current];
      const nextSlide = slidesRef.current[next];
      if (!currentSlide || !nextSlide) return;

      animatingRef.current = true;
      nextSlide.style.transition = 'none';
      nextSlide.style.transform = dir > 0 ? 'translateY(100%) scale(0.8)' : 'translateY(-100%) scale(0.8)';
      nextSlide.style.opacity = '0';
      nextSlide.getBoundingClientRect();
      currentSlide.style.transition = TRANSITION;
      nextSlide.style.transition = TRANSITION;
      currentSlide.style.transform = dir > 0 ? 'translateY(-100%) scale(1)' : 'translateY(100%) scale(1)';
      currentSlide.style.opacity = '0';
      nextSlide.style.transform = 'translateY(0) scale(1)';
      nextSlide.style.opacity = '1';
      indexRef.current = next;
      setDotIndex(next);
      setTimeout(() => { animatingRef.current = false; }, DURATION + 50);
    };

    const handleWheel = (e: WheelEvent) => {
      const dir = e.deltaY > 0 ? 1 : -1;

      // Entrada del primer producto: sección visible en viewport y primer scroll hacia abajo
      if (!hasEnteredRef.current && dir > 0 && sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          e.preventDefault();
          enterFirstProduct();
          return;
        }
      }

      if (!isVisible.current) return;
      const next = indexRef.current + dir;
      if (next < 0 || next >= products.length) return;
      e.preventDefault();
      navigate(dir);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        if (!hasEnteredRef.current && sectionRef.current) {
          const rect = sectionRef.current.getBoundingClientRect();
          if (rect.top < window.innerHeight) { enterFirstProduct(); return; }
        }
        if (isVisible.current) navigate(1);
      }
      if (e.key === 'ArrowUp' && isVisible.current) navigate(-1);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [products.length]);

  if (products.length === 0) return null;

  return (
    <section ref={sectionRef} style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {products.map((product, i) => (
        <div
          key={product._id}
          ref={el => { slidesRef.current[i] = el; }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            gap: '24px',
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: 'min(70vw, 560px)',
              height: 'min(60vh, 480px)',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            {product.category && (
              <p style={{
                fontSize: '0.75rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                fontWeight: 700,
                marginBottom: '10px',
              }}>
                {product.category}
              </p>
            )}
            <h3 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
            }}>
              {product.name}
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              marginTop: '10px',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}>
              {product.description}
            </p>
            <p style={{
              color: 'var(--accent)',
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              fontWeight: 700,
              marginTop: '16px',
            }}>
              ${product.price.toLocaleString()}
            </p>
          </div>
        </div>
      ))}

      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}>
        {products.map((_, i) => (
          <div
            key={i}
            style={{
              height: '8px',
              borderRadius: '4px',
              background: 'var(--accent)',
              opacity: i === dotIndex ? 1 : 0.35,
              width: i === dotIndex ? '24px' : '8px',
              transition: 'width 0.3s ease, opacity 0.3s ease',
            }}
          />
        ))}
      </div>
    </section>
  );
}
