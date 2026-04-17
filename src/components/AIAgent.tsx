import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Mic, MicOff, Send, X, Globe, Sparkles, User, Loader2, Stethoscope, ChevronRight, Languages } from 'lucide-react';
import { consultAgent } from '../services/geminiService';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = [
  { code: 'English', flag: '🇬🇧' },
  { code: 'Hindi', flag: '🇮🇳' },
  { code: 'Bengali', flag: '🇮🇳' },
  { code: 'Tamil', flag: '🇮🇳' },
  { code: 'Telugu', flag: '🇮🇳' },
  { code: 'Marathi', flag: '🇮🇳' },
];

export default function AIAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: any }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await consultAgent(text, language);
      setMessages(prev => [...prev, { role: 'bot', content: result }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: { analysis: "I apologize, but I'm unable to analyze that right now. Please try again." } }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-white rounded-[3rem] shadow-2xl shadow-slate-900/20 border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Aarogya AI Agent</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-accent font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Online & Listening
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Language Selector */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-4 overflow-x-auto no-scrollbar">
               <Languages size={14} className="text-slate-400 shrink-0" />
               {LANGUAGES.map(lang => (
                 <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all",
                      language === lang.code ? "bg-accent text-white shadow-md shadow-accent/10" : "bg-white text-slate-500 border border-slate-200"
                    )}
                 >
                   {lang.flag} {lang.code}
                 </button>
               ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {messages.length === 0 && (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-white rounded-3xl shadow-sm mx-auto flex items-center justify-center mb-4 border border-slate-100">
                      <Sparkles className="text-accent" size={32} />
                   </div>
                   <h4 className="font-bold text-slate-900 mb-2">How are you feeling?</h4>
                   <p className="text-slate-500 text-xs px-8">"I have a sharp pain in my chest and high fever"</p>
                   <p className="text-slate-500 text-xs px-8 mt-2">"मुझे सिरदर्द और बुखार है"</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-[2rem] p-5 shadow-sm",
                    msg.role === 'user' ? "bg-accent text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                  )}>
                    {msg.role === 'user' ? (
                      <p className="text-sm font-medium">{msg.content}</p>
                    ) : (
                      <div className="space-y-4">
                        {msg.content.identifiedDisease && (
                          <div className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full text-accent text-[10px] font-black uppercase tracking-wider mb-2">
                             Condition Identified
                          </div>
                        )}
                        <h4 className="font-bold text-lg text-slate-900">{msg.content.identifiedDisease}</h4>
                        <p className="text-sm leading-relaxed text-slate-600">{msg.content.analysis}</p>
                        
                        {msg.content.specialization && (
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <div className="text-[10px] font-black uppercase text-slate-400 mb-2">Recommended Specialist</div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="bg-white p-2 rounded-lg text-accent shadow-sm border border-slate-100">
                                      <Stethoscope size={20} />
                                   </div>
                                    <span className="font-bold text-slate-900">{msg.content.specialization}</span>
                                </div>
                                <button 
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate('/doctors');
                                  }}
                                  className="text-accent text-xs font-bold flex items-center gap-1 hover:underline"
                                >
                                  Find Doctors <ChevronRight size={14} />
                                </button>
                             </div>
                          </div>
                        )}

                        {msg.content.nextSteps && (
                          <div className="space-y-2">
                             <div className="text-[10px] font-black uppercase text-slate-400">Next Steps</div>
                             {msg.content.nextSteps.map((step: string, j: number) => (
                               <div key={j} className="flex gap-2 text-xs text-slate-600">
                                  <span className="text-accent font-bold">{j+1}.</span>
                                  <span>{step}</span>
                               </div>
                             ))}
                          </div>
                        )}
                        <div className="pt-2 text-[10px] text-slate-400 italic">Disclaimers: AI analysis is for informational purposes. Consult a doctor.</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3 shadow-sm">
                    <Loader2 className="animate-spin text-accent" size={18} />
                    <span className="text-xs font-bold text-slate-400">Analyzing symptoms...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex-grow relative">
                  <input
                    type="text"
                    placeholder={`Describe your concern in ${language}...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="w-full pl-5 pr-12 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-accent bg-slate-50 shadow-inner"
                  />
                  <button 
                    onClick={toggleListening}
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                      isListening ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20" : "text-slate-400 hover:text-accent"
                    )}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-accent disabled:opacity-50 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all z-[101]",
          isOpen ? "bg-slate-900 text-white rotate-90" : "bg-accent text-white"
        )}
      >
        {isOpen ? <X size={32} /> : <Bot size={32} />}
      </motion.button>
    </div>
  );
}
