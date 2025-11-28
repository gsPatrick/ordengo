import Header from '@/componentsLP/Header/Header';
import Hero from '@/componentsLP/Hero/Hero';
import SectionMockup from '@/componentsLP/SectionMockup/SectionMockup';
import SectionTabletCarousel from '@/componentsLP/SectionTabletCarousel/SectionTabletCarousel';
import SectionRelatorios from '@/componentsLP/SectionRelatorios/SectionRelatorios';
import SectionSegmentos from '@/componentsLP/SectionSegmentos/SectionSegmentos';
import SectionFeatures from '@/componentsLP/SectionFeatures/SectionFeatures';
import SectionDepoimentos from '@/componentsLP/SectionDepoimentos/SectionDepoimentos';
import FAQ from '../componentsLP/teste/faq';
import CTA from '@/componentsLP/CTA/CTA';       // <--- IMPORT
import Footer from '@/componentsLP/Footer/Footer'; // <--- IMPORT

export const metadata = {
  title: 'OrdenGO - Menú digital en tableta',
  description: 'La plataforma de autoatendimento en mesa que revoluciona la hostelería.',
};

export default function LandingPage() {
  return (
    <div className="lp-wrapper min-h-screen flex flex-col relative selection:bg-[#E01928] selection:text-white overflow-x-hidden">
      
      <div id="webgl-canvas"></div>

      <Header />

      <main className="flex-1">
        
        <Hero />
        <SectionMockup />
        <SectionTabletCarousel />
        <SectionRelatorios />
        <SectionSegmentos />
        <SectionFeatures />
        <SectionDepoimentos />
        <FAQ />
        
        {/* 9. CTA FINAL (Vermelho) */}
        <CTA />

      </main>

      {/* 10. FOOTER DEFINITIVO (Preto) */}
      <Footer />

    </div>
  );
}