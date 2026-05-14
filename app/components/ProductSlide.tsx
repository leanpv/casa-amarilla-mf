'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/api';

export default function ProductSlide({ product, imageScale = 1 }: { product: Product; imageScale?: number }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '80px 24px 100px',
        gap: '16px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 7vw, 2.4rem)',
            fontWeight: 800,
            color: 'white',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            margin: 0,
          }}>
            {product.category}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            marginTop: '8px',
            fontSize: 'clamp(0.8rem, 3.5vw, 1rem)',
            lineHeight: 1.6,
          }}>
            {product.description}
          </p>
        </div>

        <img
          src={product.image}
          alt={product.name}
          style={{
            width: `${Math.min(85, 85 * imageScale)}vw`,
            maxHeight: '45vh',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {product.variant && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: 'clamp(1.2rem, 5vw, 1.8rem)',
              fontWeight: 800,
              color: 'white',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              margin: 0,
            }}>
              {product.variant.name}
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              marginTop: '8px',
              fontSize: 'clamp(0.75rem, 3.2vw, 0.95rem)',
              lineHeight: 1.6,
            }}>
              {product.variant.description}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>

      {/* Texto a la izquierda */}
      <div style={{
        position: 'absolute',
        left: '5vw',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        maxWidth: '22vw',
      }}>
        <h2 style={{
          fontSize: 'clamp(1.4rem, 2.2vw, 2.8rem)',
          fontWeight: 800,
          color: 'white',
          textTransform: 'uppercase',
          lineHeight: 1.1,
          margin: 0,
        }}>
          {product.category}
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.75)',
          marginTop: '14px',
          fontSize: 'clamp(0.8rem, 1vw, 1rem)',
          lineHeight: 1.75,
        }}>
          {product.description}
        </p>
      </div>

      {/* Texto a la derecha */}
      {product.variant && (
        <div style={{
          position: 'absolute',
          right: '5vw',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          maxWidth: '22vw',
          textAlign: 'right',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 2.2vw, 2.8rem)',
            fontWeight: 800,
            color: 'white',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            margin: 0,
          }}>
            {product.variant.name}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            marginTop: '14px',
            fontSize: 'clamp(0.8rem, 1vw, 1rem)',
            lineHeight: 1.75,
          }}>
            {product.variant.description}
          </p>
        </div>
      )}

      {/* Imagen */}
      <img
        src={product.image}
        alt={product.name}
        style={{
          position: 'relative',
          zIndex: 1,
          width: `${50 * imageScale}vw`,
          maxWidth: `${50 * imageScale}vw`,
          height: '100vh',
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

    </div>
  );
}
