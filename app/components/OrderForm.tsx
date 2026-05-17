'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder } from '@/lib/api';

const QUANTITIES = [6, 12, 18, 24] as const;
type Qty = typeof QUANTITIES[number];

const CATALOG: Record<string, { flavors: string[]; pricePerSix: number }> = {
  'Empanadas': { flavors: ['Carne', 'Espinaca'], pricePerSix: 60 },
  'Alfajores': { flavors: ['Avellana', 'Ganache de maní'], pricePerSix: 48 },
};

const SWATCHES: Record<string, string> = {
  'Carne': '#a04518',
  'Espinaca': '#4a7a3a',
  'Avellana': '#7a4a1e',
  'Ganache de maní': '#5a3015',
};

interface ProductState {
  active: boolean;
  qty: Qty;
  flavors: Record<string, number>;
}

function initFlavors(category: string): Record<string, number> {
  return Object.fromEntries(CATALOG[category].flavors.map((f) => [f, 0]));
}

function calcSubtotal(category: string, qty: Qty): number {
  return (qty / 6) * CATALOG[category].pricePerSix;
}

const EmpanadaMini = () => (
  <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
    <path d="M5 20 Q 5 9 16 9 Q 27 9 27 20 Q 27 22 25 22 Q 16 24 7 22 Q 5 22 5 20 Z" fill="#f5f0e8" opacity="0.95" />
    {Array.from({ length: 8 }).map((_, i) => {
      const t = i / 7;
      const a = Math.PI - t * Math.PI;
      const cx = 16 + Math.cos(a) * 11;
      const cy = 20 - Math.sin(a) * 10.5;
      return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a + 0.1) * 2.5} y2={cy - Math.sin(a + 0.1) * 2.5} stroke="#0a0a0a" strokeWidth="0.8" opacity="0.5" />;
    })}
  </svg>
);

const AlfajorMini = () => (
  <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
    <ellipse cx="16" cy="22" rx="11" ry="3" fill="#f5f0e8" />
    <ellipse cx="16" cy="18" rx="10.5" ry="1.6" fill="#c98448" />
    <ellipse cx="16" cy="14" rx="11" ry="3.5" fill="#f5f0e8" />
  </svg>
);

function ProductCard({
  category,
  state,
  onChange,
  alwaysExpanded = false,
}: {
  category: string;
  state: ProductState;
  onChange: (s: ProductState) => void;
  alwaysExpanded?: boolean;
}) {
  const { flavors: flavorList } = CATALOG[category];
  const flavorSum = Object.values(state.flavors).reduce((a, b) => a + b, 0);
  const remaining = state.qty - flavorSum;
  const sub = calcSubtotal(category, state.qty);
  const isEmp = category === 'Empanadas';

  const adjustFlavor = (flavor: string, delta: number) => {
    const current = state.flavors[flavor];
    const next = Math.min(current + delta, current + remaining);
    const clamped = Math.max(next, 0);
    if (clamped === current) return;
    const newFlavors = { ...state.flavors, [flavor]: clamped };
    const newSum = Object.values(newFlavors).reduce((a, b) => a + b, 0);
    onChange({ ...state, flavors: newFlavors, active: newSum === state.qty });
  };

  const changeQty = (qty: Qty) => {
    onChange({ ...state, qty, flavors: initFlavors(category), active: false });
  };

  return (
    <div style={{
      borderRadius: '12px',
      border: state.active ? '1px solid rgba(232,184,75,0.55)' : '1px solid var(--line)',
      background: state.active ? 'rgba(232,184,75,0.04)' : 'rgba(245,240,232,0.025)',
      boxShadow: state.active ? '0 0 0 1px rgba(232,184,75,0.12), 0 4px 28px rgba(232,184,75,0.1)' : 'none',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
    }}>
      {/* pc-head */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        alignItems: 'center', gap: '12px',
        padding: '10px 16px',
        borderBottom: state.active ? '1px solid rgba(232,184,75,0.2)' : '1px solid var(--line)',
        background: state.active ? 'rgba(232,184,75,0.06)' : 'transparent',
        transition: 'background 0.25s, border-color 0.25s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {state.active && (
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1, color: 'var(--foreground)' }}>
              {category}
            </div>
            <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.55)', marginTop: '2px' }}>
              {isEmp ? 'Hojaldre · a mano' : 'Relleno artesanal'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.45)' }}>
            Subtotal
          </div>
          <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--accent)' }}>
            ${state.active ? sub : 0}
          </div>
        </div>
      </div>

      {/* pc-body */}
      <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Qty tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
          {QUANTITIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => changeQty(q)}
              className={`qty-tab${state.qty === q ? ' active' : ''}`}
            >
              <span className="n">{q}</span>
              <span className="l">uds</span>
            </button>
          ))}
        </div>

        {/* Flavors */}
        <div style={{ display: 'grid', gap: '5px' }}>
          {flavorList.map((flavor) => {
            const count = state.flavors[flavor];
            return (
              <div key={flavor} className={`flavor-row${count > 0 ? ' has' : ''}`}>
                <span style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '-0.01em' }}>{flavor}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button className="step-btn" type="button" onClick={() => adjustFlavor(flavor, -1)} disabled={count === 0}>−</button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '13px', color: count > 0 ? 'var(--accent)' : 'var(--foreground)', fontWeight: 500 }}>
                    {count}
                  </span>
                  <button className="step-btn" type="button" onClick={() => adjustFlavor(flavor, 1)} disabled={remaining === 0}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* pc-foot */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '7px 16px',
        borderTop: '1px solid var(--line)',
        background: 'rgba(10,10,10,0.25)',
        fontFamily: 'var(--font-geist-mono), monospace', fontSize: '9px',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(245,240,232,0.55)',
      }}>
        {flavorSum === 0
          ? <span>Asigná sabores para activar</span>
          : remaining === 0
            ? <span>✓ {state.qty} unidades listas</span>
            : <span style={{ color: 'var(--accent)' }}>Faltan {remaining}</span>}
        <span style={{ opacity: 0.5 }}>{flavorSum}/{state.qty}</span>
      </div>
    </div>
  );
}

export default function OrderForm({ isActive = true, navCount = 0 }: { isActive?: boolean; navCount?: number }) {
  const [empanadas, setEmpanadas] = useState<ProductState>({
    active: false, qty: 6, flavors: initFlavors('Empanadas'),
  });
  const [alfajores, setAlfajores] = useState<ProductState>({
    active: false, qty: 6, flavors: initFlavors('Alfajores'),
  });
  const [contact, setContact] = useState({ name: '', phone: '', email: '', notes: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState('');
  const [isWide, setIsWide] = useState(false);
  const prevNavCount = useRef(navCount);

  const resetForm = () => {
    setStatus('idle');
    setEmpanadas({ active: false, qty: 6, flavors: initFlavors('Empanadas') });
    setAlfajores({ active: false, qty: 6, flavors: initFlavors('Alfajores') });
    setContact({ name: '', phone: '', email: '', notes: '' });
    setValidationError('');
  };

  useEffect(() => {
    if (!isActive && status === 'success') resetForm();
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (navCount !== prevNavCount.current && status === 'success') resetForm();
    prevNavCount.current = navCount;
  }, [navCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const empSum = Object.values(empanadas.flavors).reduce((a, b) => a + b, 0);
  const alfSum = Object.values(alfajores.flavors).reduce((a, b) => a + b, 0);
  const empSubtotal = empanadas.active ? calcSubtotal('Empanadas', empanadas.qty) : 0;
  const alfSubtotal = alfajores.active ? calcSubtotal('Alfajores', alfajores.qty) : 0;
  const total = empSubtotal + alfSubtotal;

  function validate(): string {
    if (!empanadas.active && !alfajores.active) return 'Agregá al menos un producto al pedido.';
    if (empanadas.active && empSum < empanadas.qty) return `Asigná todos los sabores de Empanadas (faltan ${empanadas.qty - empSum}).`;
    if (alfajores.active && alfSum < alfajores.qty) return `Asigná todos los sabores de Alfajores (faltan ${alfajores.qty - alfSum}).`;
    if (!contact.name.trim()) return 'El nombre es obligatorio.';
    if (!contact.phone.trim()) return 'El teléfono es obligatorio.';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setValidationError(err); return; }
    setValidationError('');
    setStatus('loading');

    type Item = { productName: string; quantity: number; price: number; flavors: { name: string; quantity: number }[] };
    const items: Item[] = [];
    if (empanadas.active) items.push({
      productName: 'Empanadas', quantity: empanadas.qty,
      price: calcSubtotal('Empanadas', empanadas.qty),
      flavors: Object.entries(empanadas.flavors).filter(([, q]) => q > 0).map(([name, quantity]) => ({ name, quantity })),
    });
    if (alfajores.active) items.push({
      productName: 'Alfajores', quantity: alfajores.qty,
      price: calcSubtotal('Alfajores', alfajores.qty),
      flavors: Object.entries(alfajores.flavors).filter(([, q]) => q > 0).map(([name, quantity]) => ({ name, quantity })),
    });

    try {
      await createOrder({
        customerName: contact.name, customerPhone: contact.phone,
        customerEmail: contact.email || undefined, notes: contact.notes || undefined,
        items, total,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section style={{
      height: '100%', overflow: 'hidden auto', display: 'flex', flexDirection: 'column',
      alignItems: 'stretch', justifyContent: isWide ? 'center' : 'flex-start',
      padding: isWide ? '80px 5vw 32px' : '124px 20px 32px',
    }}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--foreground)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--accent)' }}>✓</div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>¡Pedido recibido!</p>
            <p style={{ marginTop: '10px', color: 'rgba(245,240,232,0.6)', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Te contactamos a la brevedad.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {/* Header */}
            <div style={{
              flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              borderBottom: '1px solid var(--line)', paddingBottom: '14px',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '6px' }}>
                  Hacé tu pedido
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 'clamp(28px, 4vw, 52px)', lineHeight: 0.92, letterSpacing: '-0.045em', textTransform: 'uppercase' }}>
                  Armá tu caja
                </h2>
              </div>
              {isWide && (
                <div style={{ display: 'flex', gap: '18px', alignItems: 'center', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.55)', paddingBottom: '4px' }}>
                  <span><b style={{ color: 'var(--foreground)', fontWeight: 500 }}>1.</b> Cantidad</span>
                  <span>→</span>
                  <span><b style={{ color: 'var(--foreground)', fontWeight: 500 }}>2.</b> Sabores</span>
                  <span>→</span>
                  <span><b style={{ color: 'var(--foreground)', fontWeight: 500 }}>3.</b> Tus datos</span>
                </div>
              )}
            </div>

            {/* Body grid */}
            <div style={{
              display: isWide ? 'grid' : 'flex',
              ...(isWide
                ? { gridTemplateColumns: '1.45fr 1fr', gap: '20px' }
                : { flexDirection: 'column', gap: '12px' }
              ),
            }}>
              {/* Left: position:relative sin hijos en flujo → altura 0 para el grid.
                  align-self:stretch lo iguala a la columna derecha. El inner absolute llena ese espacio. */}
              {isWide ? (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <ProductCard category="Empanadas" state={empanadas} onChange={setEmpanadas} />
                    <ProductCard category="Alfajores" state={alfajores} onChange={setAlfajores} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <ProductCard category="Empanadas" state={empanadas} onChange={setEmpanadas} />
                  <ProductCard category="Alfajores" state={alfajores} onChange={setAlfajores} />
                </div>
              )}

              {/* Right: contact + summary — su altura natural define la del grid row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Contact card */}
                <div style={{ borderRadius: '14px', border: '1px solid var(--line)', background: 'rgba(245,240,232,0.025)', padding: '18px 20px', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.55)', marginBottom: '14px' }}>
                    Tus datos
                  </div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {[
                      { key: 'name', label: 'Nombre completo', placeholder: 'Tu nombre', type: 'text' },
                      { key: 'phone', label: 'Teléfono / WhatsApp', placeholder: '+52 55 1234 5678', type: 'tel' },
                      { key: 'email', label: 'Email (opcional)', placeholder: 'vos@correo.com', type: 'email' },
                    ].map((f) => (
                      <div key={f.key} className="ca-field">
                        <label>{f.label}</label>
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          value={contact[f.key as keyof typeof contact]}
                          onChange={(e) => setContact((c) => ({ ...c, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <div className="ca-field">
                      <label>Notas (opcional)</label>
                      <textarea
                        rows={2}
                        placeholder="Indicaciones, zona de entrega..."
                        value={contact.notes}
                        onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div style={{
                  borderRadius: '14px', border: '1px solid rgba(232,184,75,0.25)',
                  background: 'linear-gradient(180deg, rgba(232,184,75,0.05), transparent)',
                  padding: '18px 20px', flexShrink: 0,
                }}>
                  <div style={{ display: 'grid', gap: '7px', marginBottom: '14px' }}>
                    {empanadas.active && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(245,240,232,0.7)' }}>
                        <motion.span
                          initial={{ y: -18, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 340, damping: 14 }}
                        >
                          Empanadas × {empanadas.qty}
                        </motion.span>
                        <span>${empSubtotal}</span>
                      </div>
                    )}
                    {alfajores.active && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(245,240,232,0.7)' }}>
                        <motion.span
                          initial={{ y: -18, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 340, damping: 14 }}
                        >
                          Alfajores × {alfajores.qty}
                        </motion.span>
                        <span>${alfSubtotal}</span>
                      </div>
                    )}
                    {!empanadas.active && !alfajores.active && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(245,240,232,0.35)' }}>
                        <span>Elegí al menos un producto</span>
                        <span>—</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--foreground)', fontWeight: 500, paddingTop: '10px', borderTop: '1px dashed var(--line)', marginTop: '4px' }}>
                      <span>Total estimado</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>${total}</span>
                    </div>
                  </div>

                  {validationError && (
                    <p style={{ color: '#f87171', marginBottom: '10px', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '10px', letterSpacing: '0.1em' }}>
                      {validationError}
                    </p>
                  )}
                  {status === 'error' && (
                    <p style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: '10px' }}>
                      Hubo un error. Intentá de nuevo.
                    </p>
                  )}

                  <button type="submit" disabled={status === 'loading'} className="submit-btn">
                    {status === 'loading' ? 'Enviando...' : 'Enviar pedido'}
                    {status !== 'loading' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                  <div style={{ textAlign: 'center', marginTop: '10px', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.45)' }}>
                    Coordinamos día y zona con vos
                  </div>
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
