'use client';

import FullPageScroll from './components/FullPageScroll';
import Hero from './components/Hero';
import ProductSlide from './components/ProductSlide';
import OrderForm from './components/OrderForm';
import { Product } from '@/lib/api';

const DARK = 'radial-gradient(ellipse at center, #f7a65b 0%, #f57b18 100%)';

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
    price: 4800,
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
    price: 1200,
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
  const slides = [
    <Hero key="hero" />,
    ...PRODUCTS.map(p => <ProductSlide key={p.name} product={p} imageScale={p.category === 'Alfajores' ? 0.75 : 1} />),
    <OrderForm key="order" />,
  ];

  const backgrounds = [
    DARK,
    ...PRODUCTS.map((_, i) => PRODUCT_BACKGROUNDS[i % PRODUCT_BACKGROUNDS.length]),
    DARK,
  ];

  const navLinks = [
    { label: 'Productos', index: 1 },
    { label: 'Contacto', index: slides.length - 1 },
  ];

  return <FullPageScroll slides={slides} backgrounds={backgrounds} navLinks={navLinks} />;
}
