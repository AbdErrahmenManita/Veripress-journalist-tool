import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, ShieldCheck, FileText, Database, UserCircle, LogOut, Scan, ArrowRight, FileSearch } from 'lucide-react';

export default function Dashboard() {
  const location = useLocation();
  const [highlightedTool, setHighlightedTool] = useState(null);

  useEffect(() => {
    if (location.state?.highlight) {
      setHighlightedTool(location.state.highlight);
      
      // Run for exactly 3 seconds (3 flashes of 1s each) then stop
      const timer = setTimeout(() => {
        setHighlightedTool(null);
        // Clear history state so it doesn't re-flash on refresh
        window.history.replaceState({}, document.title);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1a2526] flex">
      
      {/* CUSTOM ANIMATION STYLE */}
      <style>{`
        @keyframes flashHighlight {
          0%, 100% { 
            border-color: rgba(26, 37, 38, 0.1); 
            transform: scale(1);
            box-shadow: none;
          }
          50% { 
            border-color: #591c2e; 
            transform: scale(1.05);
            box-shadow: 0 0 40px -10px rgba(89, 28, 46, 0.5);
          }
        }
        .animate-flash-3 {
          animation: flashHighlight 1s ease-in-out 3 forwards;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="w-64 bg-[#1a2526] text-white hidden md:flex flex-col fixed h-full z-20">
        <div className="p-8 border-b border-white/10">
          <h2 className="text-2xl font-serif font-black tracking-tighter uppercase">VERIPRESS<span className="text-[#591c2e]">.</span></h2>
          <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Journalist Workspace</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">Tools</div>
          <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded bg-white/10 text-white font-medium">
            <div className="w-2 h-2 bg-[#591c2e] rounded-full"></div>
            Dashboard
          </Link>
          <Link to="/tool/fact-check" className="flex items-center gap-3 p-3 rounded hover:bg-white/5 text-white/70 hover:text-white transition-colors">
            <Search className="w-4 h-4" />
            Fact Checker
          </Link>
          <Link to="/tool/image-forensics" className="flex items-center gap-3 p-3 rounded hover:bg-white/5 text-white/70 hover:text-white transition-colors">
            <Scan className="w-4 h-4" />
            DeepScan (Image)
          </Link>
          <Link to="/tool/document-lab" className="flex items-center gap-3 p-3 rounded hover:bg-white/5 text-white/70 hover:text-white transition-colors">
            <FileSearch className="w-4 h-4" />
            Document Lab
          </Link>
          <button className="w-full flex items-center gap-3 p-3 rounded hover:bg-white/5 text-white/70 hover:text-white transition-colors text-left">
            <FileText className="w-4 h-4" />
            My Reports
          </button>
        </nav>

        <div className="p-6 border-t border-white/10">
           <Link to="/" className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity w-full">
             <LogOut className="w-4 h-4" /> Logout
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 md:p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">Welcome back.</h1>
            <p className="text-[#1a2526]/60">Ready to verify the truth today?</p>
          </div>
          <div className="w-10 h-10 bg-[#591c2e] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
            <UserCircle className="w-6 h-6" />
          </div>
        </header>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Tool 1: Fact Checker Card with FLASH Animation */}
          <Link 
            to="/tool/fact-check" 
            className={`
              group relative bg-white border p-8 rounded-xl transition-all duration-300 overflow-hidden
              ${highlightedTool === 'fact-check' 
                ? 'animate-flash-3 ring-2 ring-[#591c2e] ring-offset-4 ring-offset-[#FDFBF7]' 
                : 'border-[#1a2526]/10 hover:shadow-xl hover:border-[#591c2e]/30'
              }
            `}
          >
            <div className="absolute top-0 right-0 bg-[#591c2e] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg">
              Popular
            </div>
            
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110
              ${highlightedTool === 'fact-check' ? 'bg-[#591c2e] text-white' : 'bg-[#591c2e]/10 text-[#591c2e]'}
            `}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold font-serif mb-2">Fact Checker</h3>
            <p className="text-sm text-[#1a2526]/60 mb-6 leading-relaxed">
              Analyze live claims using AI cross-referenced with Google News.
            </p>
            <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all text-[#591c2e]">
              Launch Tool <Search className="w-4 h-4" />
            </span>
          </Link>

          {/* Tool 2: Image Forensics (DeepScan) */}
          <Link to="/tool/image-forensics" className="group bg-white border border-[#1a2526]/10 p-8 rounded-xl hover:shadow-xl hover:border-[#591c2e]/30 transition-all cursor-pointer relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-[#1a2526] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg">
              New
            </div>
            <div className="w-12 h-12 bg-[#1a2526]/5 text-[#1a2526] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#1a2526] group-hover:text-white transition-colors">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-2">DeepScan</h3>
            <p className="text-sm text-[#1a2526]/60 mb-6 leading-relaxed">
              Analyze images for AI manipulation and deepfakes using our 5-Layer Verification.
            </p>
            <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all text-[#591c2e]">
              Open Lab <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Tool 3: Document & Archive Lab */}
          <Link to="/tool/document-lab" className="group bg-white border border-[#1a2526]/10 p-8 rounded-xl hover:shadow-xl hover:border-[#591c2e]/30 transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-800 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-2">Doc & Archive</h3>
            <p className="text-sm text-[#1a2526]/60 mb-6 leading-relaxed">
              Verify PDF/DOCX metadata hidden authors and trace deleted webpages.
            </p>
            <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all text-emerald-800">
              Launch Tool <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Tool 4: Auto-Editor (Coming Soon) */}
          <div className="bg-white border border-[#1a2526]/10 p-8 rounded-xl opacity-60 cursor-not-allowed grayscale">
            <div className="w-12 h-12 bg-[#1a2526]/5 text-[#1a2526] rounded-lg flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif mb-2">Auto-Editor</h3>
            <p className="text-sm text-[#1a2526]/60 mb-6 leading-relaxed">
              Convert raw notes into factual briefs ready to publish.
            </p>
            <span className="text-[10px] font-bold uppercase bg-[#1a2526]/10 px-2 py-1 rounded">Coming Soon</span>
          </div>

        </div>
      </main>
    </div>
  );
}