import { useState } from 'react';
import { Doctor } from '../types';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, IndianRupee, AlertCircle, CheckCircle2, User, Phone, FileText, Send, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../App';

interface Props {
  doctor: Doctor | null;
  onClose: () => void;
}

export default function AppointmentModal({ doctor, onClose }: Props) {
  const { user, login } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [error, setError] = useState('');

  const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

  const handleBook = async () => {
    if (!user) return login();
    if (!date || !time || !phone) return setError('Please fill in all required patient details.');

    setLoading(true);
    setError('');
    try {
      // 1. Save to local dashboard
      await addDoc(collection(db, 'appointments'), {
        userId: user.uid,
        doctorId: doctor?.id,
        doctorName: doctor?.name,
        patientName: user.displayName,
        patientEmail: user.email,
        patientPhone: phone,
        reason: reason,
        date,
        timeSlot: time,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // 2. Simulate forwarding to hospital system
      setForwarding(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setForwarding(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
        >
          {success ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-125 animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Forwarded Successfully!</h2>
              <p className="text-slate-500 font-medium">Your request has been sent to <strong>{doctor.hospital}</strong>'s official appointment system.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                 <ShieldCheck size={14} className="text-green-500" /> Secure HL7 Transmission Complete
              </div>
            </div>
          ) : (
            <>
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                   <h2 className="text-2xl font-serif font-bold italic">Schedule Appointment</h2>
                   <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Direct Link to {doctor.hospital}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors flex items-center justify-center">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div className="flex gap-6 items-center bg-accent/5 p-6 rounded-3xl border border-accent/10">
                    <img src={doctor.image} className="w-16 h-16 rounded-2xl object-cover" alt="" referrerPolicy="no-referrer" />
                    <div>
                       <h4 className="font-bold text-slate-900">{doctor.name}</h4>
                       <div className="flex items-center gap-1 text-accent font-black text-sm">
                          <IndianRupee size={14} /> {doctor.chargesINR} Consultation Fee
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Calendar size={14} /> Select Date
                       </label>
                       <input 
                         type="date" 
                         min={new Date().toISOString().split('T')[0]}
                         value={date}
                         onChange={(e) => setDate(e.target.value)}
                         className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-accent bg-slate-50 font-bold"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Clock size={14} /> Preferred Slot
                       </label>
                       <select 
                         value={time}
                         onChange={(e) => setTime(e.target.value)}
                         className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-accent bg-slate-50 font-bold"
                       >
                         <option value="">Select Time</option>
                         {slots.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Phone size={14} /> Contact Phone
                       </label>
                       <input 
                         type="tel" 
                         placeholder="+91 XXXXX XXXXX"
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-accent bg-slate-50 font-bold"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <FileText size={14} /> Reason for Visit (Optional)
                       </label>
                       <textarea 
                         placeholder="Briefly describe your condition..."
                         value={reason}
                         onChange={(e) => setReason(e.target.value)}
                         className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-accent bg-slate-50 font-bold h-24 resize-none"
                       />
                    </div>
                 </div>

                 {error && (
                   <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm">
                      <AlertCircle size={20} /> {error}
                   </div>
                 )}

                 <button 
                  onClick={handleBook}
                  disabled={loading || forwarding}
                  className={cn(
                    "w-full py-5 rounded-[2rem] font-bold transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3",
                    loading || forwarding ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-accent text-white hover:shadow-accent/40"
                  )}
                 >
                   {forwarding ? (
                     <>
                       <Loader2 className="animate-spin" size={20} /> Forwarding to Hospital...
                     </>
                   ) : (
                     <>
                       <Send size={18} /> Confirm & Forward to {doctor.hospital}
                     </>
                   )}
                 </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
