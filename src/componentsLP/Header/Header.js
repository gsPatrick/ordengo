'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import do componente de imagem
import { useRouter } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const { scrollY } = useScroll();
  const router = useRouter();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // FUNÇÃO DE LOGIN COM ANIMAÇÃO "WIPE"
  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsNavigating(true);

    setTimeout(() => {
      router.push('/login');
    }, 800);
  };

  const navLinks = [
    { name: 'Funcionalidades', href: '#features' }, // "Funcionalidades" is same in both but "Funcionalidades" works
    { name: 'Reportes', href: '#reports' },
    { name: 'Segmentos', href: '#segments' },
    { name: 'Testimonios', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      {/* --- OVERLAY DE TRANSIÇÃO (CORTINA VERMELHA) --- */}
      <AnimatePresence>
        {isNavigating && (
          <div className={styles.transitionOverlay}>
            <motion.div
              className={styles.curtain}
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            />

            {/* Logo na Transição */}
            <motion.div
              className={styles.transitionLogo}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {/* Aqui usamos uma versão maior ou branca se necessário. 
                  Como o fundo é vermelho, idealmente a logo deve ser branca aqui.
                  Se a sua logo for preta/vermelha, podemos aplicar um filtro CSS filter: brightness(0) invert(1)
              */}
              <div className={styles.whiteLogoFilter}>
                <Image
                  src="/logocerta.png"
                  alt="OrdenGO"
                  width={180}
                  height={60}
                  className={styles.logoImage}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HEADER NORMAL --- */}
      <motion.header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.container}>

          {/* LOGO PRINCIPAL (IMAGEM) */}
          <Link href="/" className={styles.logo}>
            <Image
              src="/logocerta.png"
              alt="OrdenGO Logo"
              width={200} // Ajuste o tamanho conforme necessário
              height={80}
              className={styles.logoImage}
              priority
            />
          </Link>

          <nav className={styles.desktopNav}>
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={styles.navLink}>
                {link.name}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <a
              href="/login"
              onClick={handleLoginClick}
              className={styles.loginBtn}
            >
              Login
            </a>

            <Link href="/register" className={styles.ctaBtn}>
              Empezar Ahora <ArrowRight size={16} />
            </Link>

            <button
              className={styles.mobileToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        <motion.div
          className={styles.mobileMenu}
          initial={false}
          animate={mobileMenuOpen ? "open" : "closed"}
          variants={{
            open: { height: 'auto', opacity: 1, display: 'block' },
            closed: { height: 0, opacity: 0, transitionEnd: { display: 'none' } }
          }}
        >
          <div className={styles.mobileNavList}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="/login"
              onClick={(e) => { setMobileMenuOpen(false); handleLoginClick(e); }}
              className={styles.mobileNavLink}
              style={{ color: 'var(--lp-red)' }}
            >
              Login
            </a>
          </div>
        </motion.div>
      </motion.header>
    </>
  );
}