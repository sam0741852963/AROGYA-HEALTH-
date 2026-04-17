import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Doctor, DEPARTMENTS } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Star, Clock, MapPin, IndianRupee, ChevronRight, Stethoscope, Sparkles, GraduationCap, MapPinned, Info, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import AppointmentModal from '../components/AppointmentModal';
import { suggestExperts } from '../services/geminiService';

export default function DoctorListing() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [suggestion, setSuggestion] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [localityQuery, setLocalityQuery] = useState('India');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'doctors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAISuggest = async () => {
    if (!filter) return alert("Please select a department first!");
    setSuggesting(true);
    try {
      const data = await suggestExperts(filter, localityQuery);
      setSuggestion(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  const filteredDoctors = doctors
    .filter(doc => {
      const matchesDept = filter ? doc.department === filter : true;
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'desc') return b.rating - a.rating;
      return a.rating - b.rating;
    });

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4 italic">Find the Perfect Specialist</h1>
            <p className="text-slate-600 max-w-xl">Consult with India's leading medical professionals. Sort by expertise, rating, and location to find your best match.</p>
          </div>
          <button 
            onClick={handleAISuggest}
            disabled={suggesting}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-accent transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
          >
            {suggesting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles className="text-yellow-400" size={20} />}
            {suggesting ? 'Finding Real Experts...' : 'Get AI Recommendations'}
          </button>
        </div>

        {/* AI Suggestions Row */}
        <AnimatePresence>
          {suggestion.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-16 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-accent/10 p-2 rounded-lg text-accent">
                    <Sparkles size={18} />
                 </div>
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Real-World Specialist Suggestions (Live Data)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {suggestion.map((doc, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-accent/20 shadow-xl shadow-accent/5 relative">
                       <div className="absolute top-4 right-4 text-accent">
                          <Info size={18} />
                       </div>
                       <h4 className="font-bold text-slate-900 text-lg mb-1">{doc.name}</h4>
                       <p className="text-accent text-xs font-black uppercase mb-3">{doc.education}</p>
                       <p className="text-slate-500 text-sm mb-4 line-clamp-2">{doc.bio}</p>
                       <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="text-sm font-bold text-slate-900">₹{doc.chargesINR}</div>
                          <div className="flex items-center gap-1 text-slate-400 text-xs">
                             <MapPin size={12} /> {doc.locality}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-accent bg-white shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-accent bg-white shadow-sm appearance-none font-medium"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
          <div className="relative">
             <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-accent bg-white shadow-sm appearance-none font-medium"
             >
                <option value="desc">Rating: High to Low</option>
                <option value="asc">Rating: Low to High</option>
             </select>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-center font-bold text-sm tracking-tight">
            {filteredDoctors.length} Specialists Found
          </div>
        </div>

        {/* Locality Input for AI */}
        <div className="mb-10 max-w-sm">
           <div className="flex items-center gap-2 mb-2">
              <MapPinned size={14} className="text-slate-400" />
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Search Locality (for AI Suggestions)</label>
           </div>
           <input 
              type="text"
              value={localityQuery}
              onChange={(e) => setLocalityQuery(e.target.value)}
              placeholder="e.g. Bangalore, South Delhi"
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-accent text-sm font-bold bg-white"
           />
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor, i) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 flex flex-col"
            >
              <div className="p-8 flex-grow">
                <div className="flex gap-6 mb-8">
                  <div className="relative shrink-0">
                    <img 
                      src={doctor.image} 
                      className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-slate-50 shadow-md group-hover:rotate-3 transition-transform" 
                      alt={doctor.name} 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2 rounded-2xl shadow-lg">
                      <Stethoscope size={16} />
                    </div>
                  </div>
                  <div className="flex-grow pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-accent transition-colors">{doctor.name}</h3>
                    </div>
                    <div className="bg-slate-50 text-slate-500 font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase mb-3 inline-block tracking-tighter">
                       {doctor.department} Specialist
                    </div>
                    {/* STAR RATING CLEARLY DISPLAYED */}
                    <div className="flex items-center gap-2">
                        <div className="flex text-yellow-500">
                           {[...Array(5)].map((_, i) => (
                             <Star 
                                key={i} 
                                size={14} 
                                fill={i < Math.floor(doctor.rating) ? "currentColor" : "none"} 
                                className={cn(i >= Math.floor(doctor.rating) && "text-slate-200")}
                             />
                           ))}
                        </div>
                        <span className="text-sm font-black text-slate-900">{doctor.rating}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400 text-xs font-medium">{doctor.experience}Yrs Exp</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8 text-sm">
                   <div className="flex items-start gap-3">
                      <GraduationCap className="text-slate-400 shrink-0 mt-0.5" size={18} />
                      <div className="text-slate-600 line-clamp-1">{doctor.education}</div>
                   </div>
                   <div className="flex items-start gap-3">
                      <MapPinned className="text-slate-400 shrink-0 mt-0.5" size={18} />
                      <div className="text-slate-600 font-medium">
                         <span className="text-slate-900 font-bold">{doctor.locality}</span>
                         <div className="text-xs text-slate-400">{doctor.hospital}</div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Consultation Fee</span>
                    <div className="flex items-center gap-1 text-2xl font-black text-slate-900">
                      <IndianRupee size={18} className="text-slate-400" />
                      {doctor.chargesINR}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Next Available</span>
                    <div className="text-accent font-bold text-sm">Mon, 9:00 AM</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50">
                <button 
                  onClick={() => setSelectedDoctor(doctor)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold group-hover:bg-accent transition-colors flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95"
                >
                  Confirm Booking <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && <div className="text-center py-40 text-slate-500 font-bold">Bringing experts to you...</div>}
      </div>

      <AppointmentModal 
        doctor={selectedDoctor} 
        onClose={() => setSelectedDoctor(null)} 
      />
    </div>
  );
}
