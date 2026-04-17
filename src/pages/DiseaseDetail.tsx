import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Disease } from '../types';
import { analyzeSymptoms } from '../services/geminiService';
import { motion } from 'motion/react';
import { Activity, ArrowLeft, Search, ShieldAlert, Sparkles, BookOpen, Clock, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function DiseaseDetail() {
  const { id } = useParams();
  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'diseases', id));
      if (snap.exists()) {
        setDisease({ id: snap.id, ...snap.data() } as Disease);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleAIAnalysis = async () => {
    if (!disease) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptoms(`Analysis for ${disease.name}. Known symptoms: ${disease.symptoms}. Please provide a comprehensive report.`);
      setAnalysis(result || 'No analysis available.');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <div className="min-h-screen py-32 text-center text-slate-500 font-bold">Accessing Medical Records...</div>;
  if (!disease) return <div className="min-h-screen py-32 text-center text-slate-500 font-bold">Medical record not found.</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="h-[40vh] relative overflow-hidden">
        <img src={disease.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
             <Link to="/#diseases" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all font-medium">
               <ArrowLeft size={18} /> Back to Library
             </Link>
             <h1 className="text-5xl md:text-7xl font-serif font-bold text-white italic">{disease.name}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-100 p-3 rounded-2xl text-accent">
                   <BookOpen size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Disease Overview</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed mb-10">
                {disease.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                       <Activity size={16} className="text-red-500" /> Key Symptoms
                    </h3>
                    <ul className="space-y-3">
                       {disease.symptoms.split(',').map((s, i) => (
                         <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            {s.trim()}
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                       <Clock size={16} className="text-accent" /> Typical Causes
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{disease.causes}</p>
                 </div>
              </div>
            </motion.div>

            {/* AI Report Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-accent/20 border border-accent/20 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -z-0"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent p-4 rounded-2xl shadow-lg shadow-accent/40 animate-pulse">
                       <Sparkles size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">AI Clinical Analysis</h2>
                        <p className="text-slate-400 text-sm">Powered by Gemini Medical Intelligence</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing}
                    className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-accent hover:text-white active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
                  >
                    {isAnalyzing ? (
                      <>Analyzing Data...</>
                    ) : (
                      <><Search size={22} /> {analysis ? 'Refresh Analysis' : 'Generate Full Report'}</>
                    )}
                  </button>
                </div>

                {analysis ? (
                  <div className="prose prose-invert max-w-none bg-white/5 p-8 rounded-3xl border border-white/10">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                ) : (
                   <div className="bg-white/5 border border-dashed border-white/20 p-12 rounded-3xl text-center">
                      <ShieldAlert size={48} className="mx-auto text-slate-600 mb-4" />
                      <h4 className="font-bold text-slate-400 mb-2">Analysis Pending</h4>
                      <p className="text-slate-500 text-sm">Click the button above to generate a professional AI analysis based on the latest medical research.</p>
                   </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
               <h3 className="text-xl font-bold mb-6 text-slate-900">Treatment & Managed Care</h3>
               <p className="text-slate-600 leading-relaxed text-sm mb-8">
                  {disease.treatments}
               </p>
               <Link to="/doctors" className="block text-center bg-accent text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-accent/30 transition-all">
                  Book Specialist Visit
               </Link>
            </div>

            <div className="bg-slate-100/50 p-8 rounded-[2.5rem] border border-slate-200 border-dashed">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 grayscale">
                 <Heart size={20} className="text-red-500" /> Patient Support
               </h3>
               <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-accent font-black">01.</span>
                    <span>24/7 Helpline available for managed patients.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent font-black">02.</span>
                    <span>Access to private support groups.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent font-black">03.</span>
                    <span>Digital health monitoring tools included.</span>
                  </li>
               </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
