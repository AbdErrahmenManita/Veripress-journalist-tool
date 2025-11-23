import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Globe, Upload, AlertTriangle, CheckCircle, Database, FileSearch } from 'lucide-react';

export default function DocumentLab() {
  const [activeTab, setActiveTab] = useState('doc');

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1a2526] flex flex-col">
      <nav className="border-b border-[#1a2526]/10 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-[#1a2526]/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif font-bold text-xl tracking-tight">
            Veripress <span className="text-[#591c2e]">LAB</span>
          </h1>
        </div>
        <div className="text-xs font-mono opacity-50">Forensics Module v2.0</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-serif mb-2">Document & Archive Analysis</h2>
          <p className="opacity-60 max-w-xl mx-auto">
            Analyze <strong>PDF/DOCX metadata</strong> or trace <strong>deleted websites</strong>.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('doc')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all border ${activeTab === 'doc' ? 'bg-[#1a2526] text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            <FileText className="w-4 h-4" /> Document Metadata
          </button>
          <button 
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all border ${activeTab === 'archive' ? 'bg-[#591c2e] text-white' : 'bg-white hover:bg-gray-50'}`}
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
      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Error: Could not scan document. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {!result ? (
        <div className="text-center py-8">
            <div className="border-2 border-dashed border-[#1a2526]/20 rounded-2xl p-12 hover:bg-[#1a2526]/5 transition-all cursor-pointer relative group">
                <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <Upload className="w-12 h-12 mx-auto mb-4 text-[#1a2526]/30" />
                <h3 className="text-xl font-bold mb-2">{file ? file.name : "Upload PDF or DOCX"}</h3>
                <p className="text-sm opacity-50">Drag & drop or click to upload</p>
            </div>
            {file && (
                <button onClick={handleScan} disabled={loading} className="mt-6 w-full bg-[#1a2526] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-colors">
                  {loading ? "Processing..." : "Start Forensic Scan"}
                </button>
            )}
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex justify-between items-center pb-4 border-b">
              <h3 className="font-bold text-xl">Scan Results</h3>
              <button onClick={() => {setResult(null); setFile(null)}} className="text-xs underline">Scan New</button>
           </div>
           <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-xs font-bold uppercase opacity-60">Integrity Score</div>
                  <div className="text-4xl font-black text-emerald-700">{result.integrity_score}</div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                 <div className="text-xs font-bold uppercase opacity-60 mb-2">Risk Flags</div>
                 {result.risk_flags.length > 0 ? result.risk_flags.map((f, i) => <div key={i} className="text-red-600 text-xs font-bold flex gap-2"><AlertTriangle className="w-3 h-3"/>{f}</div>) : <div className="text-emerald-600 text-sm font-bold flex gap-2"><CheckCircle className="w-4 h-4"/> None</div>}
              </div>
           </div>
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm">
              {Object.entries(result.metadata).map(([k,v]) => <div key={k} className="flex justify-between border-b border-slate-200 last:border-0 py-2"><span className="font-bold opacity-50">{k}</span><span>{String(v)}</span></div>)}
           </div>
           <div className="bg-[#1a2526] text-white p-6 rounded-xl">
              <h4 className="text-[#591c2e] font-bold text-xs uppercase mb-2">AI Analysis</h4>
              <p className="opacity-90">"{result.ai_analysis}"</p>
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
      setData(await res.json());
    } catch (e) { alert("API Error"); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto pt-10">
       <div className="flex gap-2 mb-8">
         <input type="text" placeholder="https://example.com" className="flex-1 p-4 border rounded-xl" value={url} onChange={(e) => setUrl(e.target.value)} />
         <button onClick={handleTrace} disabled={loading} className="bg-[#591c2e] text-white px-8 rounded-xl font-bold uppercase hover:bg-[#4a1726]">{loading ? "..." : "Trace"}</button>
       </div>
       {data && (
         <div className="bg-white p-6 rounded-xl border shadow-lg">
            {data.archive.found ? (
                <div className="text-emerald-800 font-bold flex justify-between items-center">
                   <span>✅ Snapshot Found ({data.archive.timestamp})</span>
                   <a href={data.archive.url} target="_blank" className="underline">View</a>
                </div>
            ) : <div className="text-amber-800 font-bold">❌ No public snapshots found.</div>}
         </div>
       )}
    </div>
  );
}