'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote } from 'lucide-react';
import styles from './SectionDepoimentos.module.css';

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    name: "Carlos Méndez",
    role: "Dueño, La Parrilla Argentina",
    text: "Desde que implementamos OrdenGO, la rotación de mesas aumentó un 20%. Los clientes adoran ver las fotos de los cortes antes de pedir.",
    stars: 5
  },
  {
    name: "Ana Sofía Ruiz",
    role: "Gerente, Café Viena",
    text: "La interfaz es increíblemente intuitiva. Nuestro personal ya no pierde tiempo tomando notas y se enfoca en la hospitalidad.",
    stars: 5
  },
  {
    name: "Javier Costa",
    role: "Chef Ejecutivo, Ocean Blue",
    text: "Poder actualizar el menú en tiempo real cuando se acaba un ingrediente ha sido un salvavidas. Totalmente recomendado.",
    stars: 5
  },
  {
    name: "Marta Gomez",
    role: "Franquiciada, Burger King",
    text: "La integración con cocina es perfecta. Los errores en los pedidos desaparecieron y el ticket promedio subió gracias a las sugerencias automáticas.",
    stars: 4
  },
  {
    name: "Ricardo Silva",
    role: "Dueño, Pizzería Napoli",
    text: "Lo mejor es el soporte. Cualquier duda que tenemos nos la resuelven en minutos. La tecnología es robusta y no falla.",
    stars: 5
  }
];

// Duplicamos a lista para criar o efeito de "Loop Infinito" sem cortes
const SLIDER_ITEMS = [...TESTIMONIALS, ...TESTIMONIALS];

export default function SectionDepoimentos() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animação de Entrada do Header
      gsap.from(headerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      });
      
      // Animação de entrada do carrossel (Fade In geral)
      gsap.from(carouselRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: carouselRef.current,
          start: 'top 90%',
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        
        {/* CABEÇALHO */}
        <div className={styles.header} ref={headerRef}>
          <h2 className={styles.title}>
            Lo que dicen nuestros <span className="lp-text-gradient">socios</span>
          </h2>
          <p className={styles.subtitle}>
            Restaurantes de todo el mundo confían en OrdenGO.
          </p>
        </div>

        {/* CARROSSEL INFINITO (MARQUEE) */}
        <div className={styles.carouselWrapper} ref={carouselRef}>
          {/* A classe 'track' faz a animação via CSS */}
          <div className={styles.track}>
            {SLIDER_ITEMS.map((item, idx) => (
              <div 
                key={idx} 
                className={styles.card}
              >
                <Quote className={styles.quoteIcon} size={32} />
                
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < item.stars ? "#FFB800" : "#E5E7EB"} 
                      strokeWidth={0}
                    />
                  ))}
                </div>

<p className={styles.text}>&quot;{item.text}&quot;</p>

                <div className={styles.author}>
                  <div className={styles.avatar}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className={styles.authorName}>{item.name}</h4>
                    <p className={styles.authorRole}>{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
}