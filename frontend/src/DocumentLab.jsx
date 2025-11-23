import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Globe, Search, FileSearch, AlertTriangle, CheckCircle, Database, Upload } from 'lucide-react';

export default function DocumentLab() {
  const [activeTab, setActiveTab] = useState('doc'); // 'doc' or 'archive'

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1a2526] flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-[#1a2526]/10 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-[#1a2526]/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif font-bold text-xl tracking-tight">Veripress <span className="text-[#591c2e]">DOC LAB</span></h1>
        </div>
        <div className="text-xs font-mono opacity-50">v1.0 • Metadata & Archive</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-serif mb-3">Document & Archive Forensics</h2>
          <p className="opacity-60">Switch between Metadata Analysis and Digital Archiving.</p>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-4 mb-10">
          <button 
            onClick={() => setActiveTab('doc')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all border ${activeTab === 'doc' ? 'bg-[#1a2526] text-white border-[#1a2526]' : 'bg-white text-[#1a2526]/60 border-[#1a2526]/10 hover:border-[#1a2526]/30'}`}
          >
            <FileText className="w-4 h-4" /> Document Scan
          </button>
          <button 
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all border ${activeTab === 'archive' ? 'bg-[#591c2e] text-white border-[#591c2e]' : 'bg-white text-[#1a2526]/60 border-[#1a2526]/10 hover:border-[#1a2526]/30'}`}
          >
            <Globe className="w-4 h-4" /> Archive Tracer
          </button>
        </div>

        <div className="bg-white border border-[#1a2526]/10 rounded-2xl p-8 shadow-sm min-h-[400px]">
            {activeTab === 'doc' ? <DocumentScanner /> : <ArchiveTracer />}
        </div>

      </main>
    </div>
  );
}

function DocumentScanner() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/scan-document', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Scan failed. Ensure Backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto">
      {!result ? (
        <div className="text-center py-10">
            <div className="border-2 border-dashed border-[#1a2526]/20 rounded-2xl p-12 hover:bg-[#1a2526]/5 transition-all cursor-pointer relative">
                <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-16 h-16 bg-[#1a2526]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1a2526]">
                    <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">{file ? file.name : "Drop PDF or DOCX here"}</h3>
                <p className="text-sm opacity-50">Analyzes Metadata, Authorship, and Hidden Revisions.</p>
            </div>
            
            {file && (
                <button onClick={handleScan} disabled={loading} className="mt-6 w-full bg-[#1a2526] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-lg">
                {loading ? "Scanning..." : "Run Metadata Analysis"}
                </button>
            )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#1a2526]/10">
              <h3 className="font-bold text-xl">Scan Results</h3>
              <button onClick={() => {setResult(null); setFile(null)}} className="text-xs underline opacity-50 hover:opacity-100">Scan New File</button>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-50">Metadata Extracted</h3>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${result.score > 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                Integrity Score: {result.score}/100
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm font-mono">
              {Object.entries(result.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-200 pb-1 last:border-0">
                  <span className="opacity-50 font-bold">{k}</span>
                  <span className="text-right truncate max-w-[200px]" title={v}>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {result.risk_flags.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
               <h4 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                 <AlertTriangle className="w-5 h-5" /> Security Risks
               </h4>
               <ul className="list-disc list-inside text-red-700 text-sm">
                 {result.risk_flags.map((flag, i) => <li key={i}>{flag}</li>)}
               </ul>
            </div>
          )}

          <div className="bg-[#1a2526] text-white p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><FileSearch className="w-24 h-24" /></div>
            <h4 className="font-bold text-[#591c2e] uppercase tracking-widest text-xs mb-3 relative z-10">AI Analyst Verdict</h4>
            <p className="leading-relaxed opacity-90 relative z-10 font-light text-lg">"{result.ai_analysis}"</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ArchiveTracer() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrace = async () => {
    if (!url) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('url', url);
    
    try {
      const res = await fetch('http://127.0.0.1:8000/trace-archive', { method: 'POST', body: formData });
      const d = await res.json();
      setData(d);
    } catch (e) { alert("Error connecting to Archive API"); }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto pt-8">
       <div className="flex gap-3 mb-8">
         <input 
           type="text" 
           placeholder="Paste deleted URL (e.g. https://site.com/deleted-news)" 
           className="flex-1 p-4 bg-[#FDFBF7] border border-[#1a2526]/10 rounded-xl font-mono text-sm focus:outline-none focus:border-[#591c2e] focus:ring-1 focus:ring-[#591c2e]"
           value={url}
           onChange={(e) => setUrl(e.target.value)}
         />
         <button onClick={handleTrace} disabled={loading} className="bg-[#591c2e] text-white px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-[#4a1726] shadow-lg">
           {loading ? "..." : "Trace"}
         </button>
       </div>

       {data && (
         <div className="space-y-6 animate-in zoom-in duration-300">
           <div className="bg-white p-6 rounded-xl border border-[#1a2526]/10 shadow-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-[#1a2526]/5 pb-4">
                <Database className="w-6 h-6 text-[#591c2e]" />
                <div>
                    <h3 className="font-bold text-lg">Wayback Machine Results</h3>
                    <p className="text-xs opacity-50">Archive.org Database Query</p>
                </div>
              </div>
              
              {data.archive_status.available ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-emerald-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold mb-1">✅ Snapshot Found</p>
                    <p className="text-xs font-mono opacity-70">{data.archive_status.timestamp}</p>
                  </div>
                  <a href={data.archive_status.url} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700">
                    Open Archive
                  </a>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <p className="font-bold">No snapshots found.</p>
                    <p className="text-xs opacity-80">Page might be too recent or excluded from indexing.</p>
                  </div>
                </div>
              )}
           </div>

           {data.ai_credibility_check && (
             <div className="bg-[#1a2526] p-6 rounded-xl border border-[#1a2526]/10 text-white">
               <h4 className="font-bold text-xs uppercase tracking-widest mb-2 text-[#591c2e]">Domain Credibility (AI Opinion)</h4>
               <p className="italic font-medium leading-relaxed">"{data.ai_credibility_check}"</p>
             </div>
           )}
         </div>
       )}
    </div>
  );
}