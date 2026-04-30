'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  UtensilsCrossed, 
  SlidersHorizontal, 
  PhoneCall 
} from 'lucide-react';
import styles from './SectionFeatures.module.css';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: UtensilsCrossed,
    title: "Opciones Variadas",
    description: "Explora una amplia gama de platos y cocinas, asegurando que haya algo delicioso para todos."
  },
  {
    icon: SlidersHorizontal,
    title: "A tu Manera, Cada Día",
    description: "Personaliza tus pedidos con instrucciones especiales y preferencias dietéticas para una experiencia a medida."
  },
  {
    icon: PhoneCall,
    title: "Soporte Inmediato",
    description: "Cuenta con nosotros para entregas rápidas y fiables, asegurando que tu comida llegue fresca y caliente."
  }
];

export default function SectionFeatures() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      gsap.from(titleRef.current, {
        y: 20, // Distância menor
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        }
      });

      gsap.from(cardsRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 90%',
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        
        <h2 className={styles.mainTitle} ref={titleRef}>
          Lo que ofrecemos
        </h2>

        <div className={styles.grid} ref={cardsRef}>
          {FEATURES.map((feature, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.iconCircle}>
                {/* ÍCONE MAIOR AQUI (size 52) */}
                <feature.icon size={52} className={styles.icon} />
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}