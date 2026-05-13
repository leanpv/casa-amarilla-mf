'use client';

import Hero from './components/Hero';
import OrderForm from './components/OrderForm';

export default function Home() {
  return (
    <main>
      <Hero />
      <OrderForm selectedProducts={[]} onClear={() => {}} />
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-gray-800">
        Casa Amarilla © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
