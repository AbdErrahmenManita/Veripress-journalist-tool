import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert, BrainCircuit, Database, Newspaper, MousePointer2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Section from './Section'; 
import Typewriter from './Typewriter';

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  const y1 = useTransform(scrollYProgress, [0, 0.2], [0, 200]); 
  const opacityText = useTransform(scrollYProgress, [0, 0.1], [1, 0]); 

  // CUSTOM SCROLL HANDLER FOR KEYBOARD (Smooth Slide Transition)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const sectionHeight = container.clientHeight;
      const currentScroll = container.scrollTop;
      
      // Determine which slide we are currently on (0, 1, 2...)
      const currentSlideIndex = Math.round(currentScroll / sectionHeight);

      if (e.key === 'ArrowDown') {
        e.preventDefault(); // Stop the "jumpy" default scroll
        // Smoothly glide to the next slide
        container.scrollTo({
          top: (currentSlideIndex + 1) * sectionHeight,
          behavior: 'smooth'
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); // Stop the "jumpy" default scroll
        // Smoothly glide to the previous slide
        container.scrollTo({
          top: (currentSlideIndex - 1) * sectionHeight,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-screen bg-[#FDFBF7] font-serif text-[#1a2526] overflow-y-scroll snap-y snap-mandatory scroll-smooth selection:bg-[#591c2e] selection:text-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
    >
      
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 left-0 w-full bg-[#FDFBF7]/80 backdrop-blur-lg z-50 border-b border-[#1a2526]/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* LOGO + BRAND NAME */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <img 
              src="/logo.png" 
              alt="Veripress Logo" 
              className="w-12 h-12 object-contain drop-shadow-sm transition-transform group-hover:scale-105" 
            />
            <div className="text-2xl font-black tracking-tighter uppercase font-sans">
              VERIPRESS<span className="text-[#591c2e] group-hover:text-[#1a2526] transition-colors">.</span>
            </div>
          </div>

          <Link to="/dashboard" className="px-6 py-2 border border-[#1a2526] text-[#1a2526] font-sans font-bold uppercase text-xs tracking-widest hover:bg-[#1a2526] hover:text-white transition-all duration-300">
            Member Area
          </Link>
        </div>
      </motion.nav>

      {/* 1. HERO SECTION */}
      <header className="relative min-h-screen snap-start flex flex-col justify-center items-center text-center px-6 pt-20">
        <motion.div 
          style={{ y: y1, opacity: 0.03 }} 
          className="absolute top-20 text-[20vw] font-black leading-none select-none pointer-events-none"
        >
          TRUTH
        </motion.div>

        <motion.div style={{ opacity: opacityText }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="inline-block mb-8 px-6 py-2 border border-[#591c2e]/30 bg-[#591c2e]/5 text-[#591c2e] font-sans text-xs font-bold uppercase tracking-[0.2em] rounded-full"
          >
            Journalism Intelligence Unit
          </motion.div>
          
          <h1 className="text-6xl md:text-9xl font-black text-[#1a2526] mb-8 leading-[0.9] tracking-tight">
            Don't just report. <br/>
            <span className="text-[#591c2e] italic font-serif">Verify.</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-sans text-[#1a2526]/60 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            The first firewall against disinformation. <br className="hidden md:block"/>
            Designed for journalists who refuse to be manipulated.
          </p>

          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="opacity-30 flex flex-col items-center gap-2"
          >
            <span className="text-xs font-sans uppercase tracking-widest">Discover</span>
            <div className="w-px h-12 bg-[#1a2526]"></div>
          </motion.div>
        </motion.div>
      </header>

      {/* 2. THE PROBLEM SECTION (With Typewriter) */}
      <div className="min-h-screen snap-start flex items-center bg-[#1a2526]">
        <Section className="w-full text-[#FDFBF7] py-32 px-6 relative overflow-hidden">
           <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#591c2e] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center relative z-10">
            <div>
              <h2 className="text-5xl font-bold mb-8 leading-tight">Journalism has become a battlefield.</h2>
              <p className="font-sans opacity-70 text-lg leading-relaxed mb-8 font-light">
                Your editor wants the scoop "right now". Twitter is on fire. Your sources contradict each other. 
                Publishing too fast risks your reputation. Verifying too slow means missing the story.
              </p>
              <div className="inline-flex items-center gap-4 border border-[#591c2e] px-6 py-3 rounded-lg bg-[#591c2e]/10 text-[#591c2e] font-bold font-sans uppercase text-sm">
                <ShieldAlert className="w-5 h-5" />
                Disinformation Threat: Critical
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-[#591c2e] blur-3xl opacity-20"></div>
              <div className="relative border border-white/10 bg-white/5 p-8 backdrop-blur-sm rounded-2xl shadow-2xl min-h-[200px]">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                
                {/* THE ANIMATED TERMINAL */}
                <Typewriter 
                  lines={[
                    "> Analyzing viral claim...",
                    "> Cross-referencing Reuters...",
                    "> Checking Deepfake signatures...",
                    "> ALERT: Source discrepancy found."
                  ]} 
                />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* 3. THE SOLUTION SECTION */}
      <div className="min-h-screen snap-start flex items-center">
        <section className="w-full py-32 px-6 max-w-7xl mx-auto">
          <Section className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-6 text-[#1a2526]">Your Newsroom 2.0</h2>
            <p className="font-sans text-[#1a2526]/50 text-lg">A suite of tactical tools to take back control.</p>
          </Section>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tool 1: Fact Check AI */}
            <Section delay={0.1} className="group relative bg-white p-10 border border-[#1a2526]/10 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#591c2e] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-14 h-14 bg-[#FDFBF7] border border-[#1a2526]/10 text-[#591c2e] flex items-center justify-center rounded-full mb-8 group-hover:bg-[#591c2e] group-hover:text-white transition-colors">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-sans">Fact Check AI</h3>
              <p className="font-sans text-[#1a2526]/60 mb-8 leading-relaxed">
                Real-time cross-referencing: Google Fact Check + Live Web + Llama 3.3 Analysis.
              </p>
              
              {/* Link with State for Highlighting */}
              <Link 
                to="/dashboard" 
                state={{ highlight: 'fact-check' }}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#591c2e] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all cursor-pointer w-fit"
              >
                Try Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Section>

            {/* Tool 2: Source Vault (Coming Soon) */}
            <Section delay={0.2} className="relative bg-[#FDFBF7] p-10 border border-[#1a2526]/10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               <div className="absolute top-4 right-4 text-[10px] font-bold uppercase bg-[#1a2526]/10 px-2 py-1">Coming Soon</div>
              <div className="w-14 h-14 bg-white border border-[#1a2526]/10 text-[#1a2526] flex items-center justify-center rounded-full mb-8">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-sans">Source Vault</h3>
              <p className="font-sans text-[#1a2526]/60 mb-8 leading-relaxed">
                Encrypted digital vault for your sensitive contacts. Secured, anonymized.
              </p>
            </Section>

            {/* Tool 3: Auto-Editor (Coming Soon) */}
            <Section delay={0.3} className="relative bg-[#FDFBF7] p-10 border border-[#1a2526]/10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <div className="absolute top-4 right-4 text-[10px] font-bold uppercase bg-[#1a2526]/10 px-2 py-1">Coming Soon</div>
              <div className="w-14 h-14 bg-white border border-[#1a2526]/10 text-[#1a2526] flex items-center justify-center rounded-full mb-8">
                <Newspaper className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-sans">Auto-Editor</h3>
              <p className="font-sans text-[#1a2526]/60 mb-8 leading-relaxed">
                Automatic conversion of raw field notes into factual articles ready to publish.
              </p>
            </Section>
          </div>
        </section>
      </div>

      {/* 4. CTA SECTION */}
      <div className="min-h-screen snap-start flex items-center">
        <Section className="w-full bg-[#FDFBF7] py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-[#1a2526]/20"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-12 tracking-tight text-[#1a2526]">
              The truth doesn't wait. <br/> 
              <span className="text-[#591c2e]">Neither should you.</span>
            </h2>
            
            <Link to="/dashboard" className="group relative inline-block">
              <div className="absolute inset-0 bg-[#591c2e] translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
              <div className="relative border-2 border-[#1a2526] bg-white px-10 py-8 text-xl md:text-2xl font-bold font-sans uppercase tracking-widest hover:-translate-y-1 transition-transform duration-300 flex items-center gap-6">
                Let the real story begin
                <MousePointer2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </div>
            </Link>
            
            <p className="mt-8 text-sm font-sans text-[#1a2526]/40 italic">
              *No robot will replace your instinct. We just make it sharper.
            </p>
          </div>
        </Section>
      </div>

    </div>
  );
}