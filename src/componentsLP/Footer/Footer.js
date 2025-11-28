'use client';

import Link from 'next/link';
import Image from 'next/image'; // Import do Image
import { Instagram, Linkedin, Youtube, Facebook, Twitter } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.floatingFooter}>
        
        {/* SEÇÃO SUPERIOR: GRID DE LINKS */}
        <div className={styles.topSection}>
          
          {/* Coluna 1: Identidade */}
          <div className={styles.brandCol}>
            {/* LOGO COM IMAGEM */}
            <div className={styles.logo}>
              <Image 
                src="/logocerta1.png"
                alt="OrdenGO Logo"
                width={300}
                height={80}
                className={styles.footerLogoImage} 
              />
            </div>
            
            <p className={styles.tagline}>
              Revolucionando la hostelería con tecnología de punta. 
              Menús digitales, gestión eficiente y experiencias inolvidables.
            </p>
          </div>

          {/* Coluna 2: Producto */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Producto</h4>
            <Link href="#" className={styles.link}>Características</Link>
            <Link href="#" className={styles.link}>Integraciones</Link>
            <Link href="#" className={styles.link}>Precios</Link>
            <Link href="#" className={styles.link}>Casos de Éxito</Link>
          </div>

          {/* Coluna 3: Compañía */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Compañía</h4>
            <Link href="#" className={styles.link}>Sobre Nosotros</Link>
            <Link href="#" className={styles.link}>Carreras</Link>
            <Link href="#" className={styles.link}>Blog</Link>
            <Link href="#" className={styles.link}>Contacto</Link>
          </div>

          {/* Coluna 4: Soporte */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Soporte</h4>
            <Link href="#" className={styles.link}>Centro de Ayuda</Link>
            <Link href="#" className={styles.link}>Estado del Servicio</Link>
            <Link href="#" className={styles.link}>Términos de Uso</Link>
            <Link href="#" className={styles.link}>Política de Privacidad</Link>
          </div>

        </div>

        {/* DIVISOR */}
        <div className={styles.separator}></div>

        {/* SEÇÃO INFERIOR: COPYRIGHT E SOCIAL */}
        <div className={styles.bottomSection}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} OrdenGo Inc. Todos los derechos reservados.
          </p>
          
          <div className={styles.socials}>
            <a href="#" className={styles.socialBtn} aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" className={styles.socialBtn} aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" className={styles.socialBtn} aria-label="LinkedIn"><Linkedin size={20} /></a>
            <a href="#" className={styles.socialBtn} aria-label="YouTube"><Youtube size={20} /></a>
          </div>
        </div>

      </div>
    </footer>
  );
}