import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Scan, Fingerprint, Layers, ShieldAlert, Image as ImageIcon, Eye, ChevronDown, ChevronUp, Clock, Activity, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageForensics() {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/scan-image', { method: 'POST', body: formData });
      const data = await response.json();
      
      setTimeout(() => {
        setScanning(false);
        setResult(data);
      }, 1000);
    } catch (error) {
      console.error("Scan failed:", error);
      setScanning(false);
      alert("Error connecting to OSINT engine.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1a2526] flex flex-col">
      <nav className="border-b border-[#1a2526]/10 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-[#1a2526]/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif font-bold text-xl tracking-tight">DeepScan <span className="text-[#591c2e] text-xs align-top">PRO</span></h1>
        </div>
        <div className="text-xs font-mono opacity-50 hidden sm:block">v6.0 • Neural Engine Active</div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12">
        {!result && !scanning && (
          <div className="max-w-2xl mx-auto text-center">
             <div className="mb-12">
               <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Forensic Lab</h2>
               <p className="text-[#1a2526]/60 text-lg max-w-md mx-auto">
                 Advanced image authentication using 5-layer verification and Open Source Neural AI detection.
               </p>
             </div>
             
             <div 
               onDragOver={(e) => e.preventDefault()} 
               onDrop={handleDrop} 
               className="group border-2 border-dashed border-[#1a2526]/20 rounded-3xl p-12 hover:border-[#591c2e] hover:bg-[#591c2e]/5 transition-all cursor-pointer relative bg-white shadow-sm hover:shadow-xl"
             >
                <input type="file" accept="image/*" onChange={(e) => { setFile(e.target.files[0]); setResult(null); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                
                {file ? (
                  <div className="relative z-10 animate-in fade-in zoom-in duration-300">
                    <div className="relative inline-block mb-6">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="h-48 rounded-lg shadow-lg object-contain bg-[#1a2526]/5" />
                        <div className="absolute -top-2 -right-2 bg-[#1a2526] text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            Ready
                        </div>
                    </div>
                    <p className="font-bold text-lg mb-1">{file.name}</p>
                    <p className="text-xs opacity-50 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleScan(); }} 
                        className="bg-[#591c2e] text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#4a1726] hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-lg shadow-[#591c2e]/20"
                    >
                      <Scan className="w-5 h-5" /> Analyze Evidence
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 pointer-events-none">
                    <div className="w-20 h-20 bg-[#1a2526]/5 rounded-full flex items-center justify-center mx-auto text-[#1a2526]/40 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-2xl mb-2">Drop Evidence Here</h3>
                        <p className="text-sm opacity-50">Supports JPEG, PNG, WEBP</p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}

        {scanning && (
          <div className="max-w-xl mx-auto text-center pt-20">
            <div className="relative w-64 h-64 mx-auto mb-12">
               <div className="absolute inset-0 border-4 border-[#1a2526]/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
               <div className="absolute inset-0 border-t-4 border-[#591c2e] rounded-full animate-[spin_2s_linear_infinite]"></div>
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <BrainCircuitIcon className="w-16 h-16 text-[#591c2e] animate-pulse mb-4" />
                 <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#591c2e]">Neural Scan</span>
               </div>
            </div>
            <div className="space-y-2">
                <p className="text-lg font-bold">Analyzing Pixels...</p>
                <p className="text-sm text-[#1a2526]/60 font-mono">Detecting Generative AI patterns</p>
            </div>
          </div>
        )}

        {result && (
          <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Left Column: Image & Key Stats */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#1a2526] rounded-2xl p-1 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur text-white text-[10px] font-mono uppercase px-3 py-1 rounded-full border border-white/10">
                        SHA: {result.layers.provenance.details.substring(9, 17)}...
                    </div>
                    <div className="bg-[#1a2526] rounded-xl overflow-hidden relative group">
                        <img src={URL.createObjectURL(file)} className="w-full h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                        {result.score < 50 && (
                            <div className="absolute inset-0 pointer-events-none border-[6px] border-red-500/50 animate-pulse"></div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-[#1a2526]/10 p-6 rounded-2xl shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <div className="text-xs font-bold uppercase tracking-widest text-[#1a2526]/40 mb-1">Credibility Score</div>
                         <div className={`text-6xl font-black tracking-tighter ${result.score < 50 ? 'text-red-600' : result.score < 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {result.score}
                         </div>
                       </div>
                       <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest border ${result.score < 50 ? 'bg-red-100 text-red-700 border-red-200' : result.score < 80 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                         {result.verdict}
                       </div>
                     </div>
                     
                     {/* AI SUMMARY BOX */}
                     <div className="mt-6 p-5 bg-gradient-to-br from-[#1a2526]/5 to-transparent rounded-xl border border-[#1a2526]/10 relative">
                        <div className="absolute top-3 right-3">
                            <Sparkles className="w-4 h-4 text-[#591c2e] opacity-50" />
                        </div>
                        <div className="text-[#591c2e] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            Analyst Summary
                        </div>
                        <p className="text-sm text-[#1a2526]/80 leading-relaxed font-medium">
                            {result.ai_summary || "Analysis complete. Please review the detailed layers below."}
                        </p>
                     </div>
                </div>
            </div>

            {/* Right Column: 5 Layers */}
            <div className="lg:col-span-7 space-y-4">
                 <h3 className="font-serif font-bold text-xl mb-2 px-2">Verification Layers</h3>
                 
                 {/* SPECIAL AI DETECTION LAYER - HIGHLIGHTED */}
                 <LayerResult 
                   title="AI Generation Check" 
                   icon={<BrainCircuitIcon className="w-5 h-5" />} 
                   data={result.layers.ai_detection}
                   isSpecial={true}
                 />

                 <LayerResult title="1. Provenance Check" icon={<Eye className="w-4 h-4" />} data={result.layers.provenance} />
                 <LayerResult title="2. Metadata Integrity" icon={<ImageIcon className="w-4 h-4" />} data={result.layers.metadata} />
                 <LayerResult title="3. Content Forensics" icon={<Layers className="w-4 h-4" />} data={result.layers.forensics} />
                 <LayerResult title="4. Context Consistency" icon={<Clock className="w-4 h-4" />} data={result.layers.context} />
                 
                 <div className="pt-6">
                    <button onClick={() => { setResult(null); setFile(null); }} className="w-full py-4 border-2 border-[#1a2526]/10 text-[#1a2526] font-bold uppercase tracking-widest hover:bg-[#1a2526] hover:text-white transition-colors rounded-xl">
                        Start New Scan
                    </button>
                 </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

// Helper Icon Component
function BrainCircuitIcon(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.97-3.284"/><path d="M17.97 14.716A4 4 0 0 1 18 18"/></svg>
    )
}

function LayerResult({ title, icon, data, isSpecial = false }) {
  const [expanded, setExpanded] = useState(isSpecial); // Auto-expand special layer
  const status = data?.status || "neutral"; 
  const text = data?.text || "N/A";
  const details = data?.details || "No details available.";
  
  // Color Logic
  let borderColor = 'border-[#1a2526]/10';
  let bgColor = 'bg-white';
  let iconBg = 'bg-[#1a2526]/5 text-[#1a2526]';
  
  if (status === 'danger') {
      borderColor = 'border-red-200';
      bgColor = 'bg-red-50/50';
      iconBg = 'bg-red-100 text-red-700';
  } else if (status === 'success') {
      borderColor = 'border-emerald-200';
      bgColor = 'bg-emerald-50/50';
      iconBg = 'bg-emerald-100 text-emerald-700';
  } else if (status === 'warning') {
      borderColor = 'border-amber-200';
      bgColor = 'bg-amber-50/50';
      iconBg = 'bg-amber-100 text-amber-700';
  }

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} transition-all duration-300 overflow-hidden ${isSpecial ? 'shadow-md ring-1 ring-black/5' : ''}`}>
      <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className={`p-2.5 rounded-lg ${iconBg} transition-colors`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-0.5">
             <h4 className={`font-bold text-sm ${isSpecial ? 'text-base' : ''}`}>{title}</h4>
             {status === 'danger' && <span className="text-[10px] font-bold uppercase bg-red-200 text-red-800 px-2 py-0.5 rounded">Alert</span>}
          </div>
          <p className={`text-xs opacity-80 font-medium ${status === 'danger' ? 'text-red-800' : ''}`}>{text}</p>
        </div>
        <button className="opacity-40 hover:opacity-100">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-black/5">
            <div className="p-4 bg-white/60 text-xs text-[#1a2526]/80 leading-relaxed font-mono">
              <p className="font-bold mb-1 opacity-40 uppercase tracking-wider text-[10px] font-sans">Technical Findings:</p>
              {details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}