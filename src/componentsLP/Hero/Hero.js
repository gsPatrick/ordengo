'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero() {
  const containerRef = useRef(null);
  const tabletRef = useRef(null);
  const textRef = useRef(null);
  const shapeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Configuração Inicial (Esconder elementos)
      gsap.set([textRef.current.children], { y: 50, opacity: 0 });
      gsap.set(tabletRef.current, { x: 100, opacity: 0, rotateY: 15 });
      gsap.set(shapeRef.current, { scaleX: 0, transformOrigin: 'right center' });

      // 2. Timeline de Entrada
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animação do Shape Vermelho (Fundo)
      tl.to(shapeRef.current, { 
        duration: 1.2, 
        scaleX: 1, 
        ease: 'expo.inOut' 
      })
      // Animação do Tablet entrando
      .to(tabletRef.current, { 
        duration: 1.5, 
        x: 0, 
        opacity: 1, 
        rotateY: 0,
        ease: 'power4.out'
      }, '-=0.8')
      // Animação dos Textos (Stagger)
      .to(textRef.current.children, { 
        duration: 0.8, 
        y: 0, 
        opacity: 1, 
        stagger: 0.1 
      }, '-=1.0');

      // 3. Efeito Parallax no Mouse (Cinematográfico)
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20; // Movimento horizontal
        const yPos = (clientY / window.innerHeight - 0.5) * 20; // Movimento vertical

        gsap.to(tabletRef.current, {
          x: xPos,
          y: yPos,
          rotationY: xPos * 0.5,
          rotationX: -yPos * 0.5,
          duration: 1,
          ease: 'power2.out'
        });
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.heroSection} ref={containerRef}>
      <div className={styles.container}>
        
        {/* COLUNA ESQUERDA: TEXTO */}
        <div className={styles.textColumn} ref={textRef}>
          <h4 className={styles.preHeading}>OrdenGO</h4>
          
          <h1 className={styles.title}>
            Menú digital en <br/>
            <span className="lp-text-gradient">tableta</span>
          </h1>
          
          <p className={styles.description}>
            La plataforma de autoatendimento en mesa que revoluciona la hostelería. 
            No cambiamos tu TPV, potenciamos tu servicio.
          </p>
          
          <button className={styles.ctaButton}>
            Solicitar una Demostración
          </button>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>+20%</span>
              <span className={styles.statLabel}>Aumento del Ticket Medio</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>0%</span>
              <span className={styles.statLabel}>Comisiones</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>+15</span>
              <span className={styles.statLabel}>Empresas asociadas</span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: VISUAL */}
        <div className={styles.visualColumn}>
          {/* Fundo Vermelho Geométrico */}
          <div className={styles.redShape} ref={shapeRef}></div>
          
          {/* Tablet (Substitua o src pela sua imagem real) */}
          <div className={styles.tabletWrapper} ref={tabletRef}>
            <div className={styles.glowEffect}></div>
            {/* USE SUA IMAGEM AQUI - Deve ser transparente (PNG) */}
            <Image 
              src="/tablet-hero.png" 
              alt="OrdenGO Tablet Menu"
              width={800} 
              height={600}
              className={styles.tabletImage}
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}