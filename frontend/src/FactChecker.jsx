import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Loader2, Newspaper, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FactChecker() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    if (!claim) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_text: claim }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-serif text-[#1a2526] bg-[#FDFBF7] flex flex-col">
      {/* Navigation Back */}
      <div className="p-4 border-b border-[#1a2526]/10">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm font-sans font-bold uppercase hover:text-[#591c2e] transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour au Tableau de bord
        </Link>
      </div>

      {/* Top "Edition" Bar */}
      <div className="w-full bg-[#1a2526] text-[#FDFBF7] text-[10px] uppercase tracking-widest py-1 text-center font-sans">
        Module de Vérification • IA Llama 3.3 • Accès Journaliste
      </div>

      {/* Navbar / Masthead */}
      <nav className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center mb-12">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#1a2526] uppercase leading-none mb-2 font-serif">
          VERI<span className="text-[#591c2e]">CHECK</span>
        </h1>
        <div className="w-24 h-1 bg-[#591c2e] mt-2"></div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pb-20 flex-1 w-full">
        {/* Search Input - Editorial Style */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <div className="flex flex-col md:flex-row border-2 border-[#1a2526] bg-white p-1 shadow-[4px_4px_0px_0px_rgba(26,37,38,1)]">
            <input 
              type="text"
              className="flex-1 bg-transparent text-lg px-4 py-3 outline-none placeholder:text-[#1a2526]/40 font-serif"
              placeholder="Collez une information à vérifier..."
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button 
              onClick={handleVerify}
              disabled={loading || !claim}
              className="bg-[#1a2526] text-white px-8 py-3 font-sans font-bold uppercase tracking-wider hover:bg-[#591c2e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyser'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-[#1a2526] pt-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                  <span className="font-sans text-xs font-bold uppercase bg-[#1a2526] text-white px-2 py-1">
                    Rapport
                  </span>
                  <h3 className="text-5xl font-serif font-bold mt-3 leading-none">
                    {result.verdict}
                  </h3>
                </div>
                <div className="text-right font-sans">
                  <div className="text-xs text-[#1a2526]/60 uppercase tracking-wider">Indice de Confiance</div>
                  <div className="text-4xl font-black text-[#591c2e]">{result.credibility_score}%</div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="flex-1 font-serif text-lg leading-relaxed text-[#1a2526] text-justify">
                  <span className="float-left text-5xl font-bold mr-2 mt-[-10px] text-[#591c2e]">
                    {result.explanation.charAt(0)}
                  </span>
                  {result.explanation.slice(1)}
                </div>
              </div>

              <div className="border-t-4 border-double border-[#1a2526] pt-6">
                <h4 className="font-sans font-bold uppercase text-sm mb-4 flex items-center gap-2">
                  <Newspaper className="w-4 h-4" /> Sources Citées
                </h4>
                
                <div className="grid gap-4">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between border-b border-[#1a2526]/20 pb-4 hover:bg-[#1a2526]/5 transition-colors p-2"
                    >
                      <div className="pr-4">
                        <div className="font-sans font-bold text-sm mb-1 group-hover:text-[#591c2e] transition-colors">
                          {source.name.replace('✅', '').replace('Live:', '').trim()}
                          {source.name.includes('✅') && <span className="ml-2 text-[10px] text-[#591c2e] border border-[#591c2e] px-1">OFFICIEL</span>}
                        </div>
                        <div className="font-serif text-sm text-[#1a2526]/70 line-clamp-2">
                          {source.snippet}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity self-center text-[#591c2e]" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* IMAGE 3: CAMERA - ADDED AT BOTTOM */}
      <div className="w-full flex justify-center mt-auto overflow-hidden pointer-events-none">
         <img 
           src="/camera.png"   // <--- CHANGE THIS from "/team.png" to "/camera.png"
           alt="Forensic Camera" 
           className="w-full max-w-4xl object-cover opacity-80 translate-y-12"
         />
      </div>

    </div>
  );
}