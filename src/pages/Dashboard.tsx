import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment, UserProfile } from '../types';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { Calendar, Clock, User, Trash2, CheckCircle, XCircle, ChevronRight, Activity, ShieldCheck, CreditCard } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // If admin, show all. If patient, show only theirs.
    const q = user.role === 'admin' 
      ? query(collection(db, 'appointments'))
      : query(collection(db, 'appointments'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'appointments', id), { status });
  };

  const cancelAppointment = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
    }
  };

  if (authLoading) return <div className="p-20 text-center font-bold">Authenticating...</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full text-accent text-[10px] font-black tracking-widest uppercase mb-4">
                 {user.role} Portal
              </div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 italic">Welcome, {user.displayName}</h1>
              <p className="text-slate-500 mt-2">Manage your clinical engagements and medical history.</p>
           </div>
           <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
              <img src={user.photoURL} className="w-12 h-12 rounded-2xl" alt="" referrerPolicy="no-referrer" />
              <div>
                 <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account Active</div>
                 <div className="font-bold text-slate-900">{user.email}</div>
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="text-accent" size={24} /> 
                    {user.role === 'admin' ? 'Global Schedule' : 'Your Appointments'}
                  </h2>
                  <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">{appointments.length} Total</span>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="text-left bg-slate-50/50">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider / Patient</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {appointments.map((apt) => (
                         <motion.tr key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-accent">
                                     <User size={20} />
                                  </div>
                                  <div>
                                     <div className="font-bold text-slate-900">{apt.doctorName}</div>
                                     <div className="text-xs text-slate-500">Patient: {apt.patientName}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="text-sm font-bold text-slate-700">{formatDate(apt.date)}</div>
                               <div className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock size={12} /> {apt.timeSlot}
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={cn(
                                 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                 apt.status === 'confirmed' ? "bg-green-100 text-green-600" :
                                 apt.status === 'cancelled' ? "bg-red-100 text-red-600" :
                                 "bg-blue-100 text-blue-600"
                               )}>
                                 {apt.status}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex justify-end gap-2">
                                  {user.role === 'admin' ? (
                                    <>
                                      <button onClick={() => updateStatus(apt.id, 'confirmed')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Confirm">
                                         <CheckCircle size={20} />
                                      </button>
                                      <button onClick={() => updateStatus(apt.id, 'cancelled')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                                         <XCircle size={20} />
                                      </button>
                                    </>
                                  ) : (
                                    apt.status === 'pending' && (
                                      <button onClick={() => cancelAppointment(apt.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                         <Trash2 size={20} />
                                      </button>
                                    )
                                  )}
                               </div>
                            </td>
                         </motion.tr>
                       ))}
                       {appointments.length === 0 && (
                         <tr>
                            <td colSpan={4} className="py-20 text-center text-slate-400 italic">No appointments found.</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-accent p-8 rounded-[2.5rem] text-white shadow-2xl shadow-accent/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <CreditCard className="mb-6 opacity-30" size={48} />
                <h3 className="text-xl font-bold mb-2">Billing & Insurance</h3>
                <p className="text-white/70 text-sm mb-6 leading-relaxed italic animate-pulse">Your next renewal for Aarogya Plus is in 12 days.</p>
                <div className="space-y-4">
                   <div className="bg-white/10 p-4 rounded-2xl flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest">Policy No</span>
                      <span className="font-mono text-xs">AA-9981-XX</span>
                   </div>
                   <button className="w-full bg-white text-accent py-4 rounded-xl font-bold text-sm">Download E-Card</button>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                   <Activity size={20} className="text-accent" /> Health Metrics
                </h3>
                <div className="space-y-6">
                   {[
                     { l: 'Blood Pressure', v: '120/80', s: 'Normal' },
                     { l: 'Oxygen Saturation', v: '98%', s: 'Perfect' },
                     { l: 'Average HR', v: '72 BPM', s: 'Steady' },
                   ].map((m, i) => (
                     <div key={i}>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                           <span>{m.l}</span>
                           <span className="text-green-500">{m.s}</span>
                        </div>
                        <div className="text-xl font-bold text-slate-900">{m.v}</div>
                        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-accent w-2/3"></div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
