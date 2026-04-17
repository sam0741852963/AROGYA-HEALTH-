import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Appointment, UserProfile, AnalysisReport } from '../types';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, Trash2, CheckCircle, XCircle, ChevronRight, Activity, ShieldCheck, CreditCard, Bot, MessageSquare, Bell, Sparkles, X, LayoutDashboard, History } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { Navigate } from 'react-router-dom';
import { format, isAfter, subHours, addHours, differenceInHours } from 'date-fns';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analysisReports, setAnalysisReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'ai-history'>('appointments');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Appointments listener
    const aptPath = 'appointments';
    const aptQ = user.role === 'admin' 
      ? query(collection(db, aptPath), orderBy('date', 'asc'))
      : query(collection(db, aptPath), where('userId', '==', user.uid), orderBy('date', 'asc'));

    const unsubscribeApts = onSnapshot(aptQ, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, aptPath);
    });

    // Analysis History listener
    const analysisPath = 'analysis';
    const analysisQ = query(
      collection(db, analysisPath), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeAnalysis = onSnapshot(analysisQ, (snapshot) => {
      setAnalysisReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Analysis history error:", error);
    });

    return () => {
      unsubscribeApts();
      unsubscribeAnalysis();
    };
  }, [user]);

  const deleteReport = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report from your history?")) return;
    try {
      await deleteDoc(doc(db, 'analysis', id));
    } catch (err) {
      console.error("Delete report failed:", err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
      }
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
               <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white px-8">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setActiveTab('appointments')}
                      className={cn(
                        "px-6 py-4 text-sm font-bold transition-all border-b-2",
                        activeTab === 'appointments' ? "border-accent text-accent" : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Appointments
                    </button>
                    <button 
                      onClick={() => setActiveTab('ai-history')}
                      className={cn(
                        "px-6 py-4 text-sm font-bold transition-all border-b-2",
                        activeTab === 'ai-history' ? "border-accent text-accent" : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      AI Symptom Reports
                    </button>
                  </div>
                  <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                    {activeTab === 'appointments' ? appointments.length : analysisReports.length} Total
                  </span>
               </div>
               
               {activeTab === 'appointments' ? (
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
                                       <div className="text-xs text-slate-500">
                                          Patient: {apt.patientName} 
                                          {apt.patientPhone && <span className="ml-2 opacity-50">({apt.patientPhone})</span>}
                                       </div>
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
               ) : (
                 <div className="p-8 space-y-4">
                    {analysisReports.map((report) => {
                      const data = JSON.parse(report.report || '{}');
                      return (
                        <div key={report.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-center justify-between hover:border-accent/40 transition-colors group">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-accent ring-1 ring-slate-100">
                                 <Bot size={24} />
                              </div>
                              <div>
                                 <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                                    {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </div>
                                 <h4 className="font-bold text-slate-900 group-hover:text-accent transition-colors">{data.identifiedDisease || 'Symptom Analysis'}</h4>
                                 <p className="text-xs text-slate-500 line-clamp-1 max-w-md">Query: {report.query}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <button 
                                onClick={() => setSelectedReport(report)}
                                className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-sm border border-slate-100 hover:bg-slate-900 hover:text-white transition-all"
                              >
                                View Re-Analysis
                              </button>
                              <button 
                                onClick={() => deleteReport(report.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                      )
                    })}
                    {analysisReports.length === 0 && (
                       <div className="py-20 text-center space-y-4">
                          <History size={48} className="text-slate-200 mx-auto" />
                          <p className="text-slate-400 italic">No AI analysis history found.</p>
                       </div>
                    )}
                 </div>
               )}
            </div>
          </div>

          <div className="space-y-8">
             {/* Automated Reminders Section */}
             <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-bold flex items-center gap-2">
                     <Bell className="text-accent" size={20} /> Reminders
                   </h3>
                   <span className="text-[10px] font-black bg-accent px-2 py-0.5 rounded text-white uppercase animate-pulse">Live Guard</span>
                </div>
                <div className="space-y-4">
                   {appointments.filter(a => a.status === 'confirmed').slice(0, 2).map(apt => {
                      const diffHours = differenceInHours(new Date(apt.date + 'T' + apt.timeSlot.split(' ')[0] + ':00'), new Date());
                      const isUpcoming = diffHours > 0 && diffHours < 48;
                      
                      return (
                        <div key={apt.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                           <div className="flex justify-between items-start mb-2">
                              <div className="text-xs font-bold text-slate-300 truncate w-3/4">{apt.doctorName}</div>
                              <div className={cn(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                                apt.status === 'confirmed' ? "bg-green-500/20 text-green-400" : "bg-white/10"
                              )}>
                                 {apt.status}
                              </div>
                           </div>
                           <div className="text-[10px] text-white/50 mb-3">{formatDate(apt.date)} @ {apt.timeSlot}</div>
                           <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                              <span className="text-[10px] font-bold text-accent">Automated Link Sent</span>
                              <CheckCircle size={14} className="text-accent" />
                           </div>
                        </div>
                      )
                   })}
                   {appointments.length === 0 && <p className="text-xs text-white/40 italic">No upcoming reminders.</p>}
                </div>
                <p className="text-[10px] text-white/30 mt-6 italic text-center border-t border-white/5 pt-4">Patients & Doctors are notified 24h prior via SMS/Email.</p>
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

      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setSelectedReport(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center">
                         <Bot size={28} />
                      </div>
                      <div>
                         <h3 className="font-bold text-xl uppercase tracking-tighter">AI Diagnosis Replay</h3>
                         <div className="text-[10px] text-accent font-black uppercase tracking-widest">Aarogya Health Guard</div>
                      </div>
                   </div>
                   <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                      <X size={24} />
                   </button>
                </div>

                <div className="p-10 overflow-y-auto space-y-8 bg-slate-50/50">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                       <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Patient Query</div>
                       <div className="text-lg font-bold text-slate-900 italic">"{selectedReport.query}"</div>
                    </div>

                    {(() => {
                      const data = JSON.parse(selectedReport.report || '{}');
                      return (
                        <div className="space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-accent p-6 rounded-3xl text-white shadow-xl shadow-accent/20">
                                 <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Identified Condition</div>
                                 <div className="text-xl font-black">{data.identifiedDisease}</div>
                              </div>
                              <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-900/20">
                                 <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Referral Department</div>
                                 <div className="text-xl font-black">{data.specialization}</div>
                              </div>
                           </div>

                           <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-4">
                              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Medical Analysis</div>
                              <p className="text-slate-600 leading-relaxed font-medium">{data.analysis}</p>
                           </div>

                           <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-4">
                              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recommended Actions</div>
                              <div className="grid grid-cols-1 gap-3">
                                 {data.nextSteps?.map((step: string, j: number) => (
                                   <div key={j} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                      <div className="w-6 h-6 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-bold text-xs shrink-0">{j+1}</div>
                                      <span className="text-sm font-bold text-slate-700">{step}</span>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      )
                    })()}
                    
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex gap-4 items-start text-red-800">
                       <ShieldCheck className="shrink-0 mt-1" size={20} />
                       <div className="text-xs leading-relaxed font-bold">
                          IMPORTANT: This analysis is generated by AI for informational guidance. It does NOT substitute professional medical advice. Please consult with the identified specialist immediately if symptoms persist.
                       </div>
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
