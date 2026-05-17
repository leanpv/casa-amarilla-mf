'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

const DURATION = 650;
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION = `transform ${DURATION}ms ${EASE}, opacity ${DURATION}ms ease`;


const IconInstagram = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5h1.65V4.6c-.3-.04-1.3-.13-2.45-.13-2.43 0-4.1 1.48-4.1 4.2v2.34H7.5V14h2.65v8h3.35z" />
  </svg>
);

const IconWhatsApp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.02A9.83 9.83 0 0 0 12.04 2zm5.6 14.04c-.24.67-1.4 1.28-1.94 1.36-.49.07-1.12.1-1.81-.11-.42-.13-.96-.31-1.65-.6-2.91-1.26-4.81-4.18-4.96-4.38-.14-.2-1.19-1.58-1.19-3.02 0-1.43.75-2.14 1.02-2.43.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.66.5.24.59.83 2.04.9 2.18.07.15.12.32.02.51-.1.2-.15.32-.29.49-.14.17-.31.39-.44.52-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.14.46.12.63-.07.17-.2.72-.84.92-1.13.2-.29.39-.24.66-.15.27.1 1.72.81 2.01.96.29.15.49.22.56.34.07.12.07.71-.17 1.39z" />
  </svg>
);

const SLIDE_LABELS = ['Inicio', 'Empanadas', 'Alfajores', 'Pedido'];

interface NavLink { label: string; index: number; }
interface Props { slides: ReactNode[]; backgrounds?: string[]; navLinks?: NavLink[]; onSlideChange?: (index: number) => void; autoNavigateTo?: number; minSlideIndex?: number; }

export default function FullPageScroll({ slides, backgrounds, navLinks, onSlideChange, autoNavigateTo, minSlideIndex = 0 }: Props) {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef(0);
  const animatingRef = useRef(false);
  const minSlideIndexRef = useRef(minSlideIndex);
  useEffect(() => { minSlideIndexRef.current = minSlideIndex; }, [minSlideIndex]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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

  useEffect(() => {
    if (autoNavigateTo !== undefined) navigateTo(autoNavigateTo);
  }, [autoNavigateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateTo = (target: number) => {
    if (animatingRef.current) return;
    if (target < minSlideIndexRef.current || target >= slides.length) return;
    onSlideChange?.(target);
    const current = indexRef.current;
    if (current === target) return;

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
    setTimeout(() => { animatingRef.current = false; }, DURATION + 50);
  };

  useEffect(() => {
    const navigate = (dir: 1 | -1) => navigateTo(indexRef.current + dir);
    const handleWheel = (e: WheelEvent) => { e.preventDefault(); navigate(e.deltaY > 0 ? 1 : -1); };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') navigate(1);
      if (e.key === 'ArrowUp') navigate(-1);
    };
    let touchStartX = 0, touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 40) navigate(dy > 0 ? 1 : -1);
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

  const navVisible = activeIndex > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>

      {/* Backgrounds */}
      {backgrounds?.map((bg, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0, background: bg,
          opacity: i === activeIndex ? 1 : 0,
          transition: `opacity ${DURATION}ms ease`, zIndex: 0,
        }} />
      ))}

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          ref={el => { slideRefs.current[i] = el; }}
          style={{
            position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1,
            transform: i === 0 ? 'translateY(0) scale(1)' : 'translateY(100%) scale(0.8)',
            opacity: i === 0 ? 1 : 0,
          }}
        >
          {slide}
        </div>
      ))}

      {/* Navbar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
        display: 'grid', gridTemplateColumns: isWide ? '1fr auto 1fr' : '1fr auto', alignItems: 'center',
        padding: '0 28px', zIndex: 100,
        background: 'linear-gradient(180deg, rgba(10,10,10,0.92), rgba(10,10,10,0.4) 70%, transparent)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        opacity: navVisible ? 1 : 0,
        transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        pointerEvents: navVisible ? 'auto' : 'none',
      }}>
        <button
          onClick={() => navigateTo(0)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img src="/logoCA.png" alt="Casa Amarilla" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--foreground)' }}>
            Casa Amarilla
          </span>
        </button>

        {isWide && (
          <span style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
            Productos Argentinos · CDMX
          </span>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <a href="https://www.instagram.com/casaamarilla.mex/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="nav-social-link">
            <IconInstagram />
          </a>
          <a href="https://www.instagram.com/casaamarilla.mex/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="nav-social-link">
            <IconFacebook />
          </a>
          <a href="https://www.instagram.com/casaamarilla.mex/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="nav-social-link">
            <IconWhatsApp />
          </a>
        </div>
      </div>

      {/* Nav pills */}
      {navLinks && (
        <div style={{
          position: 'fixed', top: '78px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '8px', zIndex: 100,
          opacity: navVisible ? 1 : 0,
          transition: navVisible ? 'opacity 1.2s ease' : 'opacity 0.2s ease',
          pointerEvents: navVisible ? 'auto' : 'none',
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
                  background: active ? 'var(--accent)' : 'rgba(245,240,232,0.06)',
                  color: active ? '#0a0a0a' : 'var(--foreground)',
                  border: `1px solid ${active ? 'var(--accent)' : 'rgba(245,240,232,0.12)'}`,
                  padding: '8px 16px', borderRadius: '999px',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* By lean */}
      <div style={{
        position: 'fixed', bottom: isWide ? '28px' : '5px', right: '5vw', zIndex: 100,
        opacity: activeIndex > 0 ? 1 : 0, transition: 'opacity 0.4s ease',
        pointerEvents: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', letterSpacing: '0.08em',
      }}>
        by lean
      </div>

      {/* Side dots — desktop only */}
      <div className="hidden md:flex" style={{
        position: 'fixed', right: '28px', top: '50%', transform: 'translateY(-50%)',
        flexDirection: 'column', gap: '10px', alignItems: 'flex-end', zIndex: 100,
      }}>
        {slides.map((_, i) => {
          const label = SLIDE_LABELS[i] ?? String(i + 1);
          const active = i === activeIndex;
          return (
            <button
              key={i}
              onClick={() => navigateTo(i)}
              className="side-dot-btn"
              style={{
                position: 'relative',
                width: active ? '44px' : '28px', height: '8px', borderRadius: '999px',
                border: `1px solid ${active ? 'var(--accent)' : 'rgba(245,240,232,0.18)'}`,
                background: active ? 'var(--accent)' : 'transparent',
                cursor: 'pointer', padding: 0, transition: 'all 0.3s',
              }}
            >
              <span className="side-dot-label" style={{
                position: 'absolute', right: '36px', top: '50%', transform: 'translateY(-50%)',
                fontFamily: 'var(--font-geist-mono), monospace', fontSize: '10px',
                letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--foreground)',
                background: 'rgba(10,10,10,0.85)', padding: '4px 8px', borderRadius: '4px',
                whiteSpace: 'nowrap', border: '1px solid rgba(245,240,232,0.12)',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
