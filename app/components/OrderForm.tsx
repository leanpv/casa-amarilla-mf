'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    await new Promise(r => setTimeout(r, 800));
    setStatus('success');
  }

  return (
    <section style={{
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '155px 24px 56px',
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <AnimatePresence>
          {status === 'success' ? (
            <motion.div
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {[
                { name: 'name', label: 'Nombre *', placeholder: 'Tu nombre', required: true },
                { name: 'phone', label: 'Teléfono *', placeholder: 'Ej: 1123456789', required: true },
                { name: 'email', label: 'Email (opcional)', placeholder: 'tu@email.com', required: false },
              ].map((field) => (
                <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    required={field.required}
                    value={form[field.name as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.22)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      color: 'white',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Notas (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Indicaciones especiales..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.22)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {status === 'error' && (
                <p style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center' }}>
                  Hubo un error. Intentá de nuevo.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '16px',
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

              <div className="flex md:hidden [@media(max-height:700px)]:hidden" style={{ alignItems: 'center', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
                <div style={{ flex: 1, height: '1px', background: 'white' }} />
                <span style={{ color: 'white', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Gracias por elegirnos
                </span>
                <div style={{ flex: 1, height: '1px', background: 'white' }} />
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
