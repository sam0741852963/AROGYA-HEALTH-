import { Navigate } from 'react-router-dom';
import { useAuth } from '../App';
import { User, Activity, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthPage() {
  const { user, login, loading } = useAuth();

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 w-full max-w-md text-center"
      >
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-8">
           <Activity size={40} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4 italic">Welcome to Aarogya</h1>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">Join India's most advanced healthcare network. Your health journey starts here.</p>
        
        <button 
          onClick={login}
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-slate-900/20 hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <User size={20} /> Continue with Google
        </button>
        
        <div className="mt-8 p-4 bg-blue-50 text-blue-600 rounded-2xl flex gap-3 text-xs text-left font-medium">
           <AlertCircle className="shrink-0" size={16} />
           <span>We currently support secure Google login to ensure verified patient profiles and data privacy.</span>
        </div>

        <p className="mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-4">
          By continuing, you agree to our electronic health records (EHR) policy and patient consent agreement.
        </p>
      </motion.div>
    </div>
  );
}
