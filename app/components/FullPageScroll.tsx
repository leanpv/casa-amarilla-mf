'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

const DURATION = 650;
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION = `transform ${DURATION}ms ${EASE}, opacity ${DURATION}ms ease`;

interface NavLink {
  label: string;
  index: number;
}

interface Props {
  slides: ReactNode[];
  backgrounds?: string[];
  navLinks?: NavLink[];
}

export default function FullPageScroll({ slides, backgrounds, navLinks }: Props) {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef(0);
  const animatingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [footerVisible, setFooterVisible] = useState(true);
  const [footerText, setFooterText] = useState('Elegí tu sabor');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    slideRefs.current.forEach((slide, i) => {
      if (!slide) return;
      slide.style.transition = 'none';
      slide.style.transform = i === 0 ? 'translateY(0) scale(1)' : 'translateY(100%) scale(0.8)';
      slide.style.opacity = i === 0 ? '1' : '0';
    });
    indexRef.current = 0;
    setActiveIndex(0);
  }, [slides.length]);

  const navigateTo = (target: number) => {
    if (animatingRef.current) return;
    const current = indexRef.current;
    if (current === target || target < 0 || target >= slides.length) return;

    const currentSlide = slideRefs.current[current];
    const nextSlide = slideRefs.current[target];
    if (!currentSlide || !nextSlide) return;

    const dir = target > current ? 1 : -1;
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

    indexRef.current = target;
    setActiveIndex(target);
    setFooterVisible(false);
    setTimeout(() => { setFooterText(target === slides.length - 1 ? 'Gracias por elegirnos' : 'Elegí tu sabor'); setFooterVisible(true); }, DURATION - 100);
    setTimeout(() => { animatingRef.current = false; }, DURATION + 50);
  };

  useEffect(() => {
    const navigate = (dir: 1 | -1) => navigateTo(indexRef.current + dir);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      navigate(e.deltaY > 0 ? 1 : -1);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') navigate(1);
      if (e.key === 'ArrowUp') navigate(-1);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 40) navigate(delta > 0 ? 1 : -1);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [slides.length]);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>

      {/* Fondos con crossfade */}
      {backgrounds?.map((bg, i) => (
        <div key={i} style={{
          position: 'absolute',
          inset: 0,
          background: bg,
          opacity: i === activeIndex ? 1 : 0,
          transition: `opacity ${DURATION}ms ease`,
          zIndex: 0,
        }} />
      ))}

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          ref={el => { slideRefs.current[i] = el; }}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden auto', zIndex: 1 }}
        >
          {slide}
        </div>
      ))}

      {/* Navbar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5vw',
        zIndex: 100,
        opacity: activeIndex > 0 ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: activeIndex > 0 ? 'auto' : 'none',
      }}>
        <img
          src="/logoCA.png"
          alt="Casa Amarilla"
          onClick={() => navigateTo(0)}
          style={{ height: 'clamp(40px, 8vw, 70px)', cursor: 'pointer', userSelect: 'none' }}
        />

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Instagram */}
          <a href="https://www.instagram.com/casaamarilla.mex/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'white', display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          {/* Facebook */}
          <a href="https://www.instagram.com/casaamarilla.mex/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: 'white', display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          {/* WhatsApp */}
          <a href="https://www.instagram.com/casaamarilla.mex/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ color: 'white', display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Nav superior */}
      {navLinks && (
        <div style={{
          position: 'fixed',
          top: '130px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex: 100,
          opacity: activeIndex > 0 ? 1 : 0,
          transition: activeIndex > 0 ? 'opacity 1.2s ease' : 'opacity 0.2s ease',
          pointerEvents: activeIndex > 0 ? 'auto' : 'none',
        }}>
          {navLinks.map(({ label, index }) => {
            const isLast = index === slides.length - 1;
            const active = isLast
              ? activeIndex === slides.length - 1
              : activeIndex >= index && activeIndex < slides.length - 1;
            return (
              <button
                key={label}
                onClick={() => navigateTo(index)}
                style={{
                  background: active ? 'white' : 'rgba(255,255,255,0.18)',
                  color: active ? '#0a0a0a' : 'white',
                  border: 'none',
                  padding: 'clamp(6px, 1.5vw, 10px) clamp(14px, 3vw, 28px)',
                  borderRadius: '999px',
                  fontWeight: 600,
                  fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  transition: 'background 0.3s ease, color 0.3s ease',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '24px',
        right: '24px',
        justifyContent: 'center',
        zIndex: 100,
        opacity: activeIndex > 0 && footerVisible ? 1 : 0,
        transition: footerVisible ? 'opacity 0.4s ease' : 'opacity 0.15s ease',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{ width: '100px', height: '1px', background: 'white' }} />
        <span style={{ color: 'white', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {footerText}
        </span>
        <div style={{ width: '100px', height: '1px', background: 'white' }} />
      </div>

      {/* Indicadores laterales */}
      <div className="hidden md:flex" style={{
        position: 'fixed',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        zIndex: 100,
      }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: '16px',
            borderRadius: '4px',
            background: 'white',
            opacity: i === activeIndex ? 1 : 0.3,
            height: i === activeIndex ? '48px' : '16px',
            transition: 'height 0.3s ease, opacity 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  );
}
