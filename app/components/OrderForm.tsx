'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder } from '@/lib/api';

const QUANTITIES = [6, 12, 18, 24] as const;
type Qty = typeof QUANTITIES[number];

const CATALOG: Record<string, { flavors: string[]; pricePerSix: number }> = {
  'Empanadas': { flavors: ['Carne', 'Espinaca'], pricePerSix: 30 },
  'Alfajores': { flavors: ['Avellana', 'Ganache de maní'], pricePerSix: 20 },
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

  const [cardError, setCardError] = useState('');

  const adjustFlavor = (flavor: string, delta: number) => {
    const current = state.flavors[flavor];
    const next = Math.min(current + delta, current + remaining);
    const clamped = Math.max(next, 0);
    if (clamped === current) return;
    setCardError('');
    onChange({ ...state, flavors: { ...state.flavors, [flavor]: clamped } });
  };

  const changeQty = (qty: Qty) => {
    setCardError('');
    onChange({ ...state, qty, flavors: initFlavors(category), active: false });
  };

  const toggle = () => {
    if (!state.active && alwaysExpanded) {
      if (flavorSum === 0) {
        setCardError('Seleccioná al menos 1 unidad antes de agregar.');
        return;
      }
      if (flavorSum < state.qty) {
        setCardError(`Faltan ${state.qty - flavorSum} unidades por asignar.`);
        return;
      }
    }
    setCardError('');
    onChange({ ...state, active: !state.active });
  };

  const sub = calcSubtotal(category, state.qty);

  const btnBase: React.CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.4)',
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    fontSize: '1rem',
    lineHeight: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const btnBulk: React.CSSProperties = {
    padding: '3px 8px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.7rem',
    fontWeight: 600,
    lineHeight: 1,
    cursor: 'pointer',
    letterSpacing: '0.02em',
  };

  return (
    <div style={{
      borderRadius: '14px',
      border: `1px solid ${state.active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)'}`,
      background: state.active ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
      padding: '14px 16px',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {category}
        </span>
        <button
          type="button"
          onClick={toggle}
          style={{
            padding: '5px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.4)',
            background: state.active ? 'white' : 'transparent',
            color: state.active ? '#1a1a1a' : 'white',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            transition: 'all 0.2s ease',
          }}
        >
          {state.active ? 'Quitar' : 'Agregar'}
        </button>
      </div>

      {cardError && (
        <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '6px', marginBottom: 0 }}>
          {cardError}
        </p>
      )}

      {(state.active || alwaysExpanded) && (
        <div style={{ marginTop: '12px' }}>
          {/* Quantity selector */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {QUANTITIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => changeQty(q)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: state.qty === q ? 'white' : 'rgba(255,255,255,0.08)',
                  color: state.qty === q ? '#1a1a1a' : 'rgba(255,255,255,0.8)',
                  fontSize: '0.82rem',
                  fontWeight: state.qty === q ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {q}u
              </button>
            ))}
          </div>

          {/* Flavor steppers */}
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {flavorList.map((flavor) => (
              <div key={flavor} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>{flavor}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button type="button" onClick={() => adjustFlavor(flavor, -6)} style={btnBulk}>−6</button>
                  <button type="button" onClick={() => adjustFlavor(flavor, -1)} style={btnBase}>−</button>
                  <span style={{ color: 'white', fontWeight: 600, minWidth: '22px', textAlign: 'center', fontSize: '0.95rem' }}>
                    {state.flavors[flavor]}
                  </span>
                  <button type="button" onClick={() => adjustFlavor(flavor, +1)} style={btnBase}>+</button>
                  <button type="button" onClick={() => adjustFlavor(flavor, +6)} style={btnBulk}>+6</button>
                </div>
              </div>
            ))}
          </div>

          {/* Remaining + subtotal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: remaining > 0 ? 'rgba(255,200,100,0.9)' : 'rgba(255,255,255,0.4)' }}>
              {remaining > 0 ? `${remaining} sin asignar` : ''}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              Subtotal: ${sub}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'white',
  fontSize: '0.92rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.72rem',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

export default function OrderForm() {
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

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const total =
    (empanadas.active ? calcSubtotal('Empanadas', empanadas.qty) : 0) +
    (alfajores.active ? calcSubtotal('Alfajores', alfajores.qty) : 0);

  function validate(): string {
    if (!empanadas.active && !alfajores.active) return 'Agregá al menos un producto al pedido.';
    if (empanadas.active) {
      const sum = Object.values(empanadas.flavors).reduce((a, b) => a + b, 0);
      if (sum < empanadas.qty) return `Asigná todos los sabores de Empanadas (faltan ${empanadas.qty - sum}).`;
    }
    if (alfajores.active) {
      const sum = Object.values(alfajores.flavors).reduce((a, b) => a + b, 0);
      if (sum < alfajores.qty) return `Asigná todos los sabores de Alfajores (faltan ${alfajores.qty - sum}).`;
    }
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
      productName: 'Empanadas',
      quantity: empanadas.qty,
      price: calcSubtotal('Empanadas', empanadas.qty),
      flavors: Object.entries(empanadas.flavors).filter(([, q]) => q > 0).map(([name, quantity]) => ({ name, quantity })),
    });
    if (alfajores.active) items.push({
      productName: 'Alfajores',
      quantity: alfajores.qty,
      price: calcSubtotal('Alfajores', alfajores.qty),
      flavors: Object.entries(alfajores.flavors).filter(([, q]) => q > 0).map(([name, quantity]) => ({ name, quantity })),
    });

    try {
      await createOrder({
        customerName: contact.name,
        customerPhone: contact.phone,
        customerEmail: contact.email || undefined,
        notes: contact.notes || undefined,
        items,
        total,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const contactFields = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[
        { key: 'name', label: 'Nombre *', placeholder: 'Tu nombre' },
        { key: 'phone', label: 'Teléfono *', placeholder: 'Ej: 1123456789' },
        { key: 'email', label: 'Email (opcional)', placeholder: 'tu@email.com' },
      ].map((f) => (
        <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={labelStyle}>{f.label}</label>
          <input
            type="text"
            placeholder={f.placeholder}
            value={contact[f.key as keyof typeof contact]}
            onChange={(e) => setContact((c) => ({ ...c, [f.key]: e.target.value }))}
            style={inputStyle}
          />
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={labelStyle}>Notas (opcional)</label>
        <textarea
          rows={isWide ? 4 : 2}
          placeholder="Indicaciones especiales..."
          value={contact.notes}
          onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
          style={{ ...inputStyle, resize: 'none' }}
        />
      </div>

      {(validationError || status === 'error') && (
        <p style={{ color: '#f87171', fontSize: '0.82rem', textAlign: 'center', margin: '0' }}>
          {validationError || 'Hubo un error. Intentá de nuevo.'}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          width: '100%',
          padding: '15px',
          borderRadius: '999px',
          background: 'white',
          color: '#1a1a1a',
          fontWeight: 700,
          fontSize: '1rem',
          border: 'none',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.6 : 1,
          letterSpacing: '0.02em',
          transition: 'opacity 0.2s ease',
        }}
      >
        {status === 'loading' ? 'Enviando...' : 'Enviar pedido'}
      </button>

      <div className="flex md:hidden [@media(max-height:700px)]:hidden" style={{ alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }} />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Gracias por elegirnos
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }} />
      </div>
    </div>
  );

  return (
    <section style={{
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isWide ? '80px 5vw 40px' : '80px 24px 40px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: isWide ? '960px' : '480px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(255,255,255,0.9)' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>¡Pedido recibido!</p>
              <p style={{ marginTop: '8px', color: 'rgba(255,255,255,0.6)' }}>Te contactamos a la brevedad.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              style={isWide ? {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px',
                alignItems: 'start',
              } : {
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                overflowY: 'auto',
                paddingRight: '2px',
              }}
            >
              {/* Left column (desktop) / Top (mobile): products */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ProductCard category="Empanadas" state={empanadas} onChange={setEmpanadas} alwaysExpanded={isWide} />
                <ProductCard category="Alfajores" state={alfajores} onChange={setAlfajores} alwaysExpanded={isWide} />
                {(empanadas.active || alfajores.active) && (
                  <div style={{ textAlign: 'right', color: 'white', fontWeight: 700, fontSize: '1rem', padding: '2px 4px' }}>
                    Total: ${total}
                  </div>
                )}
              </div>

              {/* Right column (desktop) / Bottom (mobile): contact */}
              {contactFields}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
