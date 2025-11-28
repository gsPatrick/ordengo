'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Utensils,     // Restaurantes
  Flame,        // Asadores
  Beer,         // Bares
  Coffee,       // Cafeterías
  IceCream,     // Heladerías
  Hotel,        // Hoteles
  Pizza,        // Pizzerías
  CirclePlus    // Y más...
} from 'lucide-react';
import styles from './SectionSegmentos.module.css';

gsap.registerPlugin(ScrollTrigger);

const SEGMENTS = [
  { label: 'Restaurantes', icon: Utensils },
  { label: 'Asadores', icon: Flame },
  { label: 'Bares', icon: Beer },
  { label: 'Cafeterías', icon: Coffee },
  { label: 'Heladerías', icon: IceCream },
  { label: 'Hoteles', icon: Hotel },
  { label: 'Pizzerías', icon: Pizza },
  { label: 'y más...', icon: CirclePlus },
];

export default function SectionSegmentos() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Animação do Cabeçalho (Título e Subtítulo)
      gsap.from(headerRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      });

      // Animação da Grid (Ícones entrando um por um)
      gsap.from(gridRef.current.children, {
        y: 40,
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        
        {/* HEADER CENTRALIZADO */}
        <div className={styles.header} ref={headerRef}>
          <h2 className={styles.title}>Va bien con cualquier negocio.</h2>
          <p className={styles.subtitle}>
            OrdenGo fue diseñado y desarrollado para todo tipo de negocio.
          </p>
        </div>

        {/* GRID PERFEITAMENTE ALINHADO */}
        <div className={styles.grid} ref={gridRef}>
          {SEGMENTS.map((item, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.iconContainer}>
                <item.icon 
                  strokeWidth={1.5} // Traço refinado
                  className={styles.icon} 
                />
              </div>
              <h3 className={styles.label}>{item.label}</h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}