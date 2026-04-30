'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SectionRelatorios.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function SectionRelatorios() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const laptopRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%', // Inicia quando o topo da seção estiver a 75% da tela
          end: 'bottom bottom',
          toggleActions: 'play none none reverse'
        }
      });

      // Animação do Texto
      tl.from(textRef.current.children, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });

      // Animação do MacBook vindo da direita
      tl.from(laptopRef.current, {
        x: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.6'); // Começa um pouco antes do texto terminar

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        
        {/* COLUNA TEXTO */}
        <div className={styles.contentColumn} ref={textRef}>
          <h2 className={styles.title}>
            Relatórios, Informes de <br />
            Consumo
          </h2>
          
          <p className={styles.description}>
            Obtenga Acceso a informes completos diarios, o semanales o mensuales, 
            así podiendo reconocer patrones y hacer ofertas que vende.
          </p>

          {/* Bolinhas decorativas (como na imagem) */}
          <div className={styles.dotsRow}>
            <span className={`${styles.dot} ${styles.activeDot}`}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>

        {/* COLUNA VISUAL (MACBOOK) */}
        <div className={styles.visualColumn}>
          <div className={styles.laptopWrapper} ref={laptopRef}>
            {/* 
               IMAGEM DO MACBOOK:
               Recomendo uma imagem PNG transparente de um MacBook Pro de frente.
               Caminho sugerido: /assets/images/macbook-analytics.png
            */}
            <Image 
              src="/notebook.png" 
              alt="Dashboard de Relatórios no MacBook"
              width={1000}
              height={600}
              className={styles.laptopImage}
            />
          </div>
        </div>

      </div>
    </section>
  );
}