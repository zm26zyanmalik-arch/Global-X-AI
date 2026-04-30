import { useState, useRef, useEffect } from 'react';
import { useAppStore, ChatMessage } from '../store/useAppStore';
import { askTeacher } from '../services/geminiService';
import { Button } from '../components/ui/button';
import { Send, Camera, Mic, Volume2, StopCircle, Sparkles, ChevronLeft, Trash2, Search, Settings2, MoreVertical, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

const VirtualAvatar = ({ isSpeaking, isThinking, teacherName }: { isSpeaking: boolean, isThinking: boolean, teacherName: string }) => {
  return (
    <div className="relative w-12 h-12 md:w-24 md:h-24 shrink-0 px-1 md:px-2">
      {/* Outer Pulse */}
      <motion.div 
        animate={{ 
          scale: isSpeaking ? [1, 1.25, 1] : isThinking ? [1, 1.1, 1] : 1,
          opacity: isSpeaking ? [0.2, 0.4, 0.2] : 0.1
        }}
        transition={{ duration: isSpeaking ? 0.8 : 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-[#F7E58D] blur-xl md:blur-2xl"
      />
      
      <motion.div 
        animate={{ y: isSpeaking ? [0, -3, 0] : [0, -1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-10 h-10 md:w-20 md:h-20 bg-white rounded-full border-2 md:border-4 border-[#F7E58D]/40 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-0.5 md:p-1"
      >
         <div className="relative w-full h-full flex items-center justify-center bg-[#F9F9F9] rounded-full overflow-hidden">
            <motion.div 
               animate={{ scale: isSpeaking ? [1, 1.08, 1] : 1 }}
               className="text-2xl md:text-6xl select-none"
            >
               {teacherName === 'Rohan' ? '👨🏽‍🏫' : '👩🏽‍🏫'}
            </motion.div>
            
            {/* Lip Sync Wave Overlay */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute bottom-1 md:bottom-3 left-0 right-0 flex justify-center gap-0.5"
                >
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: [2, 8, 2] }}
                      transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                      className="w-0.5 md:w-1 bg-[#111111] rounded-full opacity-40 shadow-sm"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </motion.div>
    </div>
  )
}

export default function ChatScreen() {
  const { user, chatHistory, setChatHistory } = useAppStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory(() => [{
        id: 'welcome',
        role: 'model',
        text: `Greetings, ${user?.name}. I am ${user?.teacherPreference}, your dedicated AI mentor. How shall we proceed with your studies today?`
      }]);
    }
  }, [user, chatHistory.length, setChatHistory]);
  
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading, isSpeaking]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      if (user?.teacherPreference === 'Rohan') {
        utterance.pitch = 0.85;
      } else {
        utterance.pitch = 1.15;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    stopSpeaking();
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const reply = await askTeacher(user?.teacherPreference || 'Priya', user?.name || 'Student', user?.class || '9', userMsg.text, history);
      
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'model', text: reply }]);
      setLoading(false);
      handleSpeak(reply);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F9F9] relative overflow-hidden">
      
      {/* Premium Gradient Header */}
      <div className="relative px-4 md:px-12 py-4 md:py-10 bg-white border-b-2 border-secondary-50 flex items-center justify-between z-30 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
         <div className="flex items-center gap-3 md:gap-8">
            <VirtualAvatar isSpeaking={isSpeaking} isThinking={loading} teacherName={user?.teacherPreference || 'Priya'} />
            <div>
               <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                  <h2 className="font-black text-lg md:text-3xl text-[#111111] tracking-tight">{user?.teacherPreference}</h2>
                  <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
               </div>
               <p className="text-secondary-400 font-black text-[9px] md:text-[11px] uppercase tracking-widest leading-none">AI Professor • Active</p>
            </div>
         </div>
         
         <div className="flex items-center gap-2 md:gap-4">
            {isSpeaking && (
               <Button onClick={stopSpeaking} className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-red-50 text-red-500 hover:bg-red-100 p-0 shadow-lg shadow-red-500/10">
                  <StopCircle className="w-5 h-5 md:w-6 md:h-6" />
               </Button>
            )}
            
            <div className="hidden lg:flex flex-col gap-1 items-end mr-2">
               <span className="text-[8px] font-black uppercase text-secondary-300 tracking-widest leading-none">Voice Speed</span>
               <select 
                 className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-[#111111]"
                 value={speechRate}
                 onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
               >
                 <option value="0.5">Slow</option>
                 <option value="1.0">Normal</option>
                 <option value="1.2">Fast</option>
                 <option value="1.5">Elite</option>
               </select>
            </div>

            <Button variant="ghost" className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-[#F9F9F9] text-secondary-300 p-0 hover:text-[#111111] hover:bg-secondary-50">
               <MoreVertical className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
         </div>
      </div>

      {/* Modern Chat Stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-24 py-8 md:py-14 space-y-8 md:space-y-14 pb-48 scrollbar-none">
         <AnimatePresence initial={false}>
            {chatHistory.map((msg, i) => (
               <motion.div 
                 initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                 key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
               >
                  <div className={`relative max-w-[95%] md:max-w-[75%] ${msg.role === 'user' ? 'ml-8 md:ml-16' : 'mr-8 md:mr-16'}`}>
                     {msg.role === 'model' && (
                        <div className="absolute -left-10 bottom-0 w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center opacity-0 lg:opacity-100">
                           <Sparkles className="w-4 h-4 text-[#F7E58D]" />
                        </div>
                     )}
                     
                     <div className={`p-5 md:p-12 shadow-2xl relative transition-all ${
                        msg.role === 'user' 
                        ? 'bg-[#111111] text-white rounded-[2rem] md:rounded-[4rem] rounded-br-[0.3rem] md:rounded-br-[0.5rem] shadow-[#111111]/10' 
                        : 'bg-white text-[#111111] border-2 border-secondary-50 rounded-[2rem] md:rounded-[4rem] rounded-bl-[0.3rem] md:rounded-bl-[0.5rem]'
                     }`}>
                        <div className={`text-sm md:text-2xl font-bold leading-relaxed ${msg.role === 'model' ? 'markdown-body text-[#111111]' : 'text-white'}`}>
                           {msg.role === 'user' ? (
                                <p>{msg.text}</p>
                           ) : (
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                           )}
                        </div>
                        
                        {msg.role === 'model' && (
                           <div className="flex justify-end mt-4 md:mt-8 gap-2">
                              <button onClick={() => handleSpeak(msg.text)} className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#F9F9F9] flex items-center justify-center text-secondary-300 hover:text-[#111111] hover:bg-[#F7E58D] transition-all">
                                 <Volume2 className="w-4 h-4 md:w-7 md:h-7" />
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            ))}
         </AnimatePresence>

         {loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
               <div className="bg-white border-2 border-secondary-50 rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex gap-1.5 md:gap-3 shadow-sm">
                  {[0, 0.2, 0.4].map(delay => (
                    <motion.div 
                      key={delay}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                      className="w-2 md:w-4 h-2 md:h-4 bg-[#F7E58D] rounded-full"
                    />
                  ))}
               </div>
            </motion.div>
         )}
         <div ref={scrollRef} className="h-10" />
      </div>

      {/* Luxurious Input Console */}
      <div className="absolute bottom-6 md:bottom-12 left-4 right-4 md:left-24 md:right-24 z-40">
         <div className="bg-white rounded-[2.5rem] md:rounded-[5rem] p-2 md:p-4 flex items-center gap-2 md:gap-5 shadow-[0_40px_80px_rgba(0,0,0,0.15)] border-2 border-secondary-50">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} />
            
            <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2.5rem] bg-[#F9F9F9] flex items-center justify-center text-secondary-400 hover:bg-[#111111] hover:text-white transition-all shrink-0">
               <Paperclip className="w-5 h-5 md:w-8 md:h-8" />
            </button>

            <button className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center transition-all shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#FFF9E8] text-[#111111] hover:bg-[#F7E58D]'}`}>
               <Mic className="w-5 h-5 md:w-8 md:h-8" />
            </button>

            <div className="flex-1 min-w-0 px-2 md:px-4">
               <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full text-base md:text-2xl font-bold bg-transparent outline-none placeholder:text-secondary-200 text-[#111111] truncate"
               />
            </div>

            <AnimatePresence>
               {input.trim() && (
                  <motion.button 
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    onClick={handleSend}
                    className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2.5rem] bg-[#111111] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                     <Send className="w-5 h-5 md:w-8 md:h-8 text-[#F7E58D]" />
                  </motion.button>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  )
}
