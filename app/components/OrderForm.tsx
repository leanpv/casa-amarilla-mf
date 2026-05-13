'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, createOrder } from '@/lib/api';

interface Props {
  selectedProducts: Product[];
  onClear: () => void;
}

export default function OrderForm({ selectedProducts, onClear }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const getQty = (id: string) => quantities[id] ?? 1;

  const total = selectedProducts.reduce(
    (sum, p) => sum + p.price * getQty(p._id),
    0,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedProducts.length === 0) return;

    setStatus('loading');
    try {
      await createOrder({
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email || undefined,
        notes: form.notes || undefined,
        total,
        items: selectedProducts.map((p) => ({
          product: p._id,
          productName: p.name,
          quantity: getQty(p._id),
          price: p.price,
        })),
      });
      setStatus('success');
      onClear();
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="order" className="py-24 px-6 w-full flex flex-col items-center">
      <div className="w-full max-w-2xl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl font-bold mb-12 text-center"
        style={{ color: 'var(--accent)' }}
      >
        Hacer pedido
      </motion.h2>

      <AnimatePresence>
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 text-green-400"
          >
            <div className="text-5xl mb-4">✓</div>
            <p className="text-xl font-semibold">¡Pedido recibido!</p>
            <p className="mt-2 text-gray-400">Te contactamos a la brevedad.</p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {selectedProducts.length > 0 && (
              <div className="rounded-xl p-4 space-y-3" style={{ background: '#1a1a1a' }}>
                <p className="text-sm text-gray-400 font-medium">Productos seleccionados</p>
                {selectedProducts.map((p) => (
                  <div key={p._id} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-white">{p.name}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantities((q) => ({ ...q, [p._id]: Math.max(1, getQty(p._id) - 1) }))}
                        className="w-7 h-7 rounded-full bg-gray-700 text-white text-sm hover:bg-gray-600"
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-white">{getQty(p._id)}</span>
                      <button
                        type="button"
                        onClick={() => setQuantities((q) => ({ ...q, [p._id]: getQty(p._id) + 1 }))}
                        className="w-7 h-7 rounded-full bg-gray-700 text-white text-sm hover:bg-gray-600"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-400 w-20 text-right">
                        ${(p.price * getQty(p._id)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-3 flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold" style={{ color: 'var(--accent)' }}>
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {[
              { name: 'name', label: 'Nombre *', placeholder: 'Tu nombre', required: true },
              { name: 'phone', label: 'Teléfono *', placeholder: 'Ej: 1123456789', required: true },
              { name: 'email', label: 'Email (opcional)', placeholder: 'tu@email.com', required: false },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm text-gray-400 mb-2">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  required={field.required}
                  value={form[field.name as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Notas (opcional)</label>
              <textarea
                rows={3}
                placeholder="Indicaciones especiales..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm text-center">
                Hubo un error. Intentá de nuevo.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || selectedProducts.length === 0}
              className="w-full py-4 rounded-full font-semibold text-black text-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar pedido'}
            </button>

            {selectedProducts.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                Seleccioná al menos un producto para hacer el pedido.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
      </div>
    </section>
  );
}
