'use client';

import { useEffect, useState } from 'react';
import FullPageScroll from './components/FullPageScroll';
import Hero from './components/Hero';
import ProductSlide from './components/ProductSlide';
import OrderForm from './components/OrderForm';
import { Product, getProducts } from '@/lib/api';

const DARK = 'radial-gradient(ellipse at center, #f7a65b 0%, #f57b18 100%)';

const PRODUCT_BACKGROUNDS = [
  'radial-gradient(ellipse at center, #f7a65b 0%, #e46e0e 100%)',
  'radial-gradient(ellipse at center, #e8c99a 0%, #7a4a1e 100%)',
  'radial-gradient(ellipse at center, #ffe07a 0%, #9e7402 100%)',
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const slides = [
    <Hero key="hero" />,
    ...products.map(p => <ProductSlide key={p._id} product={p} imageScale={p.category === 'Alfajores' ? 0.75 : 1} />),
    <OrderForm key="order" products={products} />,
  ];

  const backgrounds = [
    DARK,
    ...products.map((_, i) => PRODUCT_BACKGROUNDS[i % PRODUCT_BACKGROUNDS.length]),
    DARK,
  ];

  const navLinks = [
    { label: 'Productos', index: 1 },
    { label: 'Contacto', index: slides.length - 1 },
  ];

  return <FullPageScroll slides={slides} backgrounds={backgrounds} navLinks={navLinks} />;
}
