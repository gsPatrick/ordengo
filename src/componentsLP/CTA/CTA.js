'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Rocket } from 'lucide-react';
import styles from './CTA.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        }
      });

      // 1. Eyebrow (Pílula pequena)
      tl.fromTo('.cta-eyebrow', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );

      // 2. Título Gigante
      tl.fromTo(textRef.current, 
        { y: 50, opacity: 0, rotateX: -10 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.8, ease: 'back.out(1.2)' },
        "-=0.3"
      );

      // 3. Botão
      tl.fromTo(btnRef.current, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' },
        "-=0.4"
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      
      {/* Background Animado */}
      <div className={styles.backgroundEffects}>
        <div className={`${styles.circle} ${styles.circle1}`}></div>
        <div className={`${styles.circle} ${styles.circle2}`}></div>
      </div>

      <div className={styles.container}>
        
        <span className={`${styles.eyebrow} cta-eyebrow`}>
          Únete a la revolución
        </span>

        <h2 className={styles.title} ref={textRef}>
          ¿Listo para transformar <br /> tu restaurante?
        </h2>

        <div className={styles.buttonWrapper} ref={btnRef}>
          <button className={styles.button}>
            Solicitar Demo Ahora
            <Rocket size={24} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </section>
  );
}