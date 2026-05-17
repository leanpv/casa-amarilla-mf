'use client';

import { useState } from 'react';
import FullPageScroll from './components/FullPageScroll';
import Hero from './components/Hero';
import ProductSlide from './components/ProductSlide';
import OrderForm from './components/OrderForm';
import { Product } from '@/lib/api';

const DARK = 'radial-gradient(ellipse at center, #f7a65b 0%, #f57b18 100%)';
const ORDER_BG = 'radial-gradient(70% 60% at 20% 30%, rgba(232,184,75,0.06), transparent), radial-gradient(60% 60% at 80% 80%, rgba(245,123,24,0.05), transparent), #0a0a0a';

const PRODUCT_BACKGROUNDS = [
  'radial-gradient(ellipse at center, #f7a65b 0%, #e46e0e 100%)',
  'radial-gradient(ellipse at center, #e8c99a 0%, #7a4a1e 100%)',
  'radial-gradient(ellipse at center, #ffe07a 0%, #9e7402 100%)',
];

const PRODUCTS: Product[] = [
  {
    _id: '',
    name: 'Empanadas x12',
    description: 'Docena de empanadas caseras. Rellenos a elección: carne, pollo o jamón y queso.',
    price: 10,
    image: 'https://casa-amarilla-mf.vercel.app/empanada2.png',
    category: 'Empanadas',
    available: true,
    variant: {
      name: 'Carne',
      description: 'Relleno de carne cortada a cuchillo con cebolla, morrón rojo, huevo duro y aceitunas verdes. Condimentada con comino, pimentón dulce y ají molido.',
    },
  },
  {
    _id: '',
    name: 'Alfajor de ganache',
    description: 'Alfajor artesanal relleno de ganache de maní. Cobertura de chocolate semiamargo.',
    price: 8,
    image: 'https://casa-amarilla-mf.vercel.app/alfajor.png',
    category: 'Alfajores',
    available: true,
    variant: {
      name: 'Ganache de Maní',
      description: 'Relleno cremoso de ganache de maní tostado, entre dos tapas de masa sablée. Bañado en chocolate semiamargo artesanal.',
    },
  },
];

export default function Home() {
  const [orderActive, setOrderActive] = useState(false);
  const [orderNavCount, setOrderNavCount] = useState(0);
  const [autoNavigate, setAutoNavigate] = useState<number | undefined>();
  const [heroLocked, setHeroLocked] = useState(false);

  const slides = [
    <Hero key="hero" onComplete={() => { setAutoNavigate(1); setHeroLocked(true); }} />,
    ...PRODUCTS.map((p, i) => <ProductSlide key={p.name} product={p} index={i + 1} imageScale={p.category === 'Alfajores' ? 0.75 : 1} />),
    <OrderForm key="order" isActive={orderActive} navCount={orderNavCount} />,
  ];

  const backgrounds = [
    DARK,
    ...PRODUCTS.map((_, i) => PRODUCT_BACKGROUNDS[i % PRODUCT_BACKGROUNDS.length]),
    ORDER_BG,
  ];

  const navLinks = [
    { label: 'Productos', index: 1 },
    { label: 'Contacto', index: slides.length - 1 },
  ];

  return <FullPageScroll slides={slides} backgrounds={backgrounds} navLinks={navLinks} autoNavigateTo={autoNavigate} minSlideIndex={heroLocked ? 1 : 0} onSlideChange={(i) => {
    const isOrder = i === slides.length - 1;
    setOrderActive(isOrder);
    if (isOrder) setOrderNavCount(c => c + 1);
  }} />;
}
