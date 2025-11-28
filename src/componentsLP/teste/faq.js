'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus } from 'lucide-react';
import styles from './FAQ.module.css';

gsap.registerPlugin(ScrollTrigger);

const FAQ_ITEMS = [
  {
    question: "¿Cómo funciona OrdenGO en mi restaurante?",
    answer: "OrdenGO es una plataforma integral que digitaliza la gestión de pedidos. Tus clientes pueden pedir desde tabletas en la mesa o desde sus móviles vía QR. Los pedidos llegan directamente a cocina y barra, eliminando errores y agilizando el servicio."
  },
  {
    question: "¿Necesito reemplazar mi sistema POS actual?",
    answer: "No necesariamente. OrdenGO está diseñado para integrarse con los sistemas de TPV/POS más populares del mercado. Si no tienes uno, nuestra plataforma también funciona como un sistema de gestión completo e independiente."
  },
  {
    question: "¿Qué pasa si se corta el internet?",
    answer: "Nuestra tecnología cuenta con un modo 'Offline-First'. El sistema guarda los pedidos localmente y los sincroniza automáticamente en cuanto se restablece la conexión, garantizando que la operación nunca se detenga."
  },
  {
    question: "¿Puedo personalizar el diseño del menú?",
    answer: "¡Absolutamente! Puedes subir fotos en alta definición, cambiar descripciones, ajustar precios al instante y destacar productos. La interfaz se adapta a la identidad visual de tu marca."
  },
  {
    question: "¿Ofrecen soporte técnico?",
    answer: "Sí, ofrecemos soporte prioritario 24/7 para nuestros planes Premium. Nuestro equipo de éxito del cliente te ayudará desde la configuración inicial hasta el día a día de tu operación."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const listRef = useRef(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animação do Título
      gsap.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      });

      // Animação da Lista (Cascata)
      gsap.from(listRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: listRef.current,
          start: 'top 85%',
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        
        <div className={styles.header} ref={titleRef}>
          <h2 className={styles.title}>Preguntas Frecuentes</h2>
          <p className={styles.subtitle}>
            Resolvemos tus dudas sobre la transformación digital de tu negocio.
          </p>
        </div>

        <div className={styles.list} ref={listRef}>
          {FAQ_ITEMS.map((item, idx) => (
            <div 
              key={idx} 
              className={`${styles.item} ${openIndex === idx ? styles.open : ''}`}
              onClick={() => toggleFAQ(idx)}
            >
              <button className={styles.questionBtn}>
                <span className={styles.questionText}>{item.question}</span>
                <span className={styles.iconWrapper}>
                  {openIndex === idx ? (
                    <Minus size={20} className={styles.icon} />
                  ) : (
                    <Plus size={20} className={styles.icon} />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className={styles.answerWrapper}
                  >
                    <p className={styles.answer}>{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}