'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react'; // Opcional, caso queira setas
import styles from './SectionTabletCarousel.module.css';

// Simulando as 7 imagens de tela. 
// Na prática, você substituirá pelos caminhos reais: /assets/images/screen-1.jpg, etc.
const SCREENS = [
  '/assets/images/tablet-hero.png', // Usando a do hero como placeholder temporário
  '/assets/images/tablet-hero.png',
  '/assets/images/tablet-hero.png',
  '/assets/images/tablet-hero.png',
  '/assets/images/tablet-hero.png',
  '/assets/images/tablet-hero.png',
  '/assets/images/tablet-hero.png',
];

export default function SectionTabletCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = direita, -1 = esquerda
  const timeoutRef = useRef(null);
  const AUTOPLAY_DELAY = 4000; // 4 segundos

  // Resetar timer ao mudar slide manual
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () => paginate(1),
      AUTOPLAY_DELAY
    );
    return () => resetTimeout();
  }, [currentIndex]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex >= SCREENS.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = SCREENS.length - 1;
      return nextIndex;
    });
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        {/* TÍTULO */}
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            Todo lo que necesitas en una <br/> 
            <span className="lp-text-gradient">sola plataforma</span>
          </h2>
        </div>

        {/* DEVICE FRAME (O TABLET FIXO) */}
        <div className={styles.deviceWrapper}>
          <div className={styles.tabletFrame}>
            {/* Câmera/Sensor do Tablet */}
            <div className={styles.cameraDot}></div>

            {/* Tela Interna (Carousel) */}
            <div className={styles.screenArea}>
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={{
                    enter: (direction) => ({
                      x: direction > 0 ? '100%' : '-100%',
                      opacity: 0,
                    }),
                    center: {
                      zIndex: 1,
                      x: 0,
                      opacity: 1,
                    },
                    exit: (direction) => ({
                      zIndex: 0,
                      x: direction < 0 ? '100%' : '-100%',
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className={styles.slideImageWrapper}
                >
                  {/* IMAGEM DA TELA */}
                  <Image
                    src={SCREENS[currentIndex]}
                    alt={`Screen ${currentIndex + 1}`}
                    fill
                    className={styles.screenImage}
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sombra realista abaixo do tablet */}
          <div className={styles.shadow}></div>
        </div>

        {/* PAGINAÇÃO (BOLINHAS) */}
        <div className={styles.pagination}>
          {SCREENS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* TEXTO ABAIXO */}
        <div className={styles.footerContent}>
          <h3 className={styles.subtitle}>Una experiencia visual inmersiva</h3>
          <p className={styles.description}>
            Menú digital multi-idioma con fotos HD. Tus clientes pueden personalizar pedidos 
            (como pizzas y hamburguesas), ver alérgenos y pagar la cuenta desde la mesa.
          </p>
        </div>

      </div>
    </section>
  );
}