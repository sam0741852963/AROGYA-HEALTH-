import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Disease } from '../types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Star, Activity, ShieldCheck, Heart, Stethoscope, Droplets, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Home() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'diseases'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDiseases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Disease)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 rounded-l-full blur-3xl transform translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-500/5 rounded-full blur-3xl transform -translate-x-1/4"></div>
        </div>
        
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              <ShieldCheck size={16} />
              India's Most Trusted Digital Health Partner
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-tight mb-8">
              Compassionate <br />
              <span className="text-accent italic">Healthcare</span> For All.
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Book appointments with the best doctors in India, access AI-powered symptom analysis, and manage your health records all in one professional platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/doctors" className="bg-accent text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-accent/40 active:scale-95 transition-all text-lg inline-flex items-center gap-2">
                Book Appointment <ArrowRight size={20} />
              </Link>
              <a href="#services" className="bg-white text-slate-700 px-8 py-4 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all text-lg">
                Explore Services
              </a>
            </div>
            
            <div className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/face${i}/100/100`} className="w-12 h-12 rounded-full border-4 border-white" alt="" />
                ))}
              </div>
              <div>
                <div className="flex text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-sm font-bold text-slate-900 mt-1">Join 50,000+ Happy Patients</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="hidden lg:block "
          >
            <div className="relative">
              <div className="absolute inset-0 bg-accent rounded-[3rem] rotate-6 transform translate-y-4 -z-10 opacity-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800&h=1000" 
                className="w-full h-auto rounded-[3rem] shadow-3xl" 
                alt="Medical Professional" 
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl glass max-w-xs animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Live Health Sync</h4>
                    <p className="text-xs text-slate-500">Your vitals are up to date 1 minute ago.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Stats */}
      <section className="py-20 container mx-auto px-4" id="services">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Doctors', val: '500+', icon: Stethoscope, color: 'text-blue-500' },
            { label: 'Hospitals', val: '50+', icon: Activity, color: 'text-red-500' },
            { label: 'Saved Lives', val: '10k+', icon: Heart, color: 'text-pink-500' },
            { label: 'AI Reports', val: '1M+', icon: Search, color: 'text-purple-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm text-center group"
            >
              <div className={cn("mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors bg-slate-50 group-hover:bg-accent group-hover:text-white", stat.color)}>
                <stat.icon size={32} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.val}</h3>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Health Library (Diseases) */}
      <section className="py-24 bg-slate-900 text-white" id="diseases">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold mb-6 italic">Health Encyclopedia</h2>
            <p className="text-slate-400">Search through our verified medical database. Get insights into symptoms, causes, and state-of-the-art treatments.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diseases.map((disease, i) => (
              <motion.div
                key={disease.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-3xl bg-slate-800 border border-slate-700 hover:border-accent transition-all duration-500"
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={disease.image} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" 
                    alt={disease.name} 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                </div>
                <div className="p-8 relative -mt-32">
                  <div className="bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block mb-4">Verified Info</div>
                  <h3 className="text-2xl font-bold mb-3">{disease.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {disease.description}
                  </p>
                  <Link 
                    to={`/disease/${disease.id}`} 
                    className="inline-flex items-center gap-2 text-accent font-bold group-hover:translate-x-2 transition-transform"
                  >
                    Read Detailed Report <ChevronRight size={18} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          {loading && <div className="text-center py-20 text-slate-500">Loading your health resource...</div>}
          
          <div className="mt-16 text-center">
             <button className="bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/20 px-8 py-3 rounded-full font-bold transition-all">
               View All 500+ Conditions
             </button>
          </div>
        </div>
      </section>

      {/* Hospital Intro */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 overflow-hidden">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="relative">
                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800&h=600" className="rounded-3xl shadow-2xl relative z-10" alt="" />
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-100 rounded-3xl -z-10 rotate-12"></div>
             </div>
             <div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-8 leading-tight italic">
                  World-Class Facilities, <br />
                  <span className="text-accent underline decoration-accent/20 underline-offset-8">Indian Values.</span>
                </h2>
                <div className="space-y-6">
                   {[
                     { t: 'Advanced Robotic Surgery', d: 'State of the art robotic arms for precise surgical intervention.', i: Stethoscope },
                     { t: '24/7 Trauma Care', d: 'Immediate response unit with dedicated ambulance services.', i: Activity },
                     { t: 'Personalized Nutrition', d: 'Tailored diet charts for faster patient recovery.', i: Droplets },
                   ].map((item, idx) => (
                      <div key={idx} className="flex gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                         <div className="w-12 h-12 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <item.i size={24} />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-900 mb-1">{item.t}</h4>
                            <p className="text-sm text-slate-600">{item.d}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}
