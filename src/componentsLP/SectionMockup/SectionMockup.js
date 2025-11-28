'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SectionMockup.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function SectionMockup() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Efeito Cinematográfico:
      // A imagem começa com Zoom (scale 1.2) e vai para o tamanho normal (scale 1.0)
      // enquanto rola. Isso cria profundidade sem criar bordas brancas.
      
      gsap.fromTo(
        imageRef.current,
        { scale: 1.2, y: -20 }, // Começa maior e levemente deslocada
        {
          scale: 1.0,
          y: 0,
          ease: 'none', // Linear para acompanhar o scroll perfeitamente
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom', // Quando o topo da imagem entra na parte de baixo da tela
            end: 'bottom top',   // Quando o fundo da imagem sai da tela
            scrub: true,         // Vincula ao movimento do scroll
          },
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} ref={containerRef}>
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          <Image
            ref={imageRef}
            src="/restaurant-banner.jpg" 
            alt="OrdenGO em uso no restaurante"
            fill
            className={styles.image}
            priority
            quality={90}
          />
          <div className={styles.overlay}></div>
        </div>
      </div>
    </section>
  );
}