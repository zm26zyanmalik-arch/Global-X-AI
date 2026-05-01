import { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Camera, Upload, Sparkles, X, History, Calculator, BookOpen, Search, Zap, CheckCircle2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ai } from '../lib/gemini';
import { GenerateContentResponse } from '@google/genai';

import ReactMarkdown from 'react-markdown';

export default function ScannerScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedImage, setScannedImage] = useState<{url: string, base64: string} | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
       setIsScanning(false);
       // Mock for now directly
       setScannedImage({
         url: 'https://images.unsplash.com/photo-1454165833767-027eeef1596e?q=80&w=800&auto=format&fit=crop',
         base64: '' // Real scan would populate this
       });
    }, 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       const url = URL.createObjectURL(file);
       
       const reader = new FileReader();
       reader.onloadend = () => {
         const base64String = (reader.result as string).split(',')[1];
         setScannedImage({url, base64: base64String});
       };
       reader.readAsDataURL(file);
     }
  };

  const performAIAction = async (actionLabel: string) => {
    if (!scannedImage) return;

    setSelectedAction(actionLabel);
    setIsProcessing(true);
    setAnalysisResult(null);
    
    try {
      const prompt = `You are a top-tier AI tutor. Analyze this educational image.
      Action: ${actionLabel}.
      Task: Provide a highly accurate, structured, concise, and helpful response.
      For math, show step-by-step logic.
      For science/theory, provide a short, clear, easy to understand explanation.
      If the image quality is poor, politely ask for a clearer image.
      If you are unsure of the answer, state that, do not hallucinate.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { 
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: scannedImage.base64 } },
            { text: prompt }
          ] 
        },
      });

      setAnalysisResult(response.text || "I couldn't analyze the content. Please try a clearer image.");
    } catch (e) {
      console.error(e);
      setAnalysisResult("An error occurred during AI analysis. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const quickActions = [
    { label: 'Solve Math', icon: Calculator, color: '#111111', bg: 'bg-[#F9F9F9]' },
    { label: 'Explain Concept', icon: BookOpen, color: '#111111', bg: 'bg-[#F9F9F9]' },
    { label: 'Summarize Notes', icon: Search, color: '#111111', bg: 'bg-[#F9F9F9]' },
  ];

  return (
    <div className="space-y-6 md:space-y-12 h-full pb-24 px-2 md:px-0">
      <div>
         <motion.h1 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-5xl font-black tracking-tight text-[#111111] flex items-center gap-3 md:gap-5"
         >
            Smart Scanner <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#F7E58D] flex items-center justify-center"><Camera className="w-4 h-4 md:w-6 md:h-6 text-[#111111]" /></div>
         </motion.h1>
         <p className="text-secondary-500 font-bold text-xs md:text-base mt-2 md:mt-4">Upload or scan any educational content for instant AI mastery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-14">
        {/* Scanner Viewport */}
        <div className="relative aspect-[4/5] md:aspect-[3/4] bg-[#111111] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 md:border-[8px] border-[#F3F3F3]">
           <AnimatePresence mode="wait">
             {!scannedImage ? (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-16 text-center"
                >
                   <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(247,229,141,0.12)_0%,rgba(17,17,17,0)_70%)]" />
                   </div>
                   
                   <motion.div 
                     animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} 
                     transition={{ repeat: Infinity, duration: 4 }}
                     className="relative z-10 w-20 h-20 md:w-32 md:h-32 bg-[#F7E58D]/10 rounded-full flex items-center justify-center text-[#F7E58D] mb-8 md:mb-14 border border-[#F7E58D]/20 backdrop-blur-xl"
                   >
                      <Zap className="w-9 h-9 md:w-16 md:h-16" />
                   </motion.div>
                   
                   <h3 className="text-white font-black text-xl md:text-3xl mb-3 md:mb-5 relative z-10">Visual AI Ready</h3>
                   <p className="text-secondary-400 text-xs md:text-lg font-bold mb-10 md:mb-16 max-w-[200px] md:max-w-[300px] relative z-10 leading-relaxed px-4">Position your study material in center.</p>
                   
                   <div className="flex gap-3 md:gap-5 relative z-10 w-full justify-center px-4">
                     <Button 
                        onClick={handleScan} 
                        className="flex-1 max-w-[200px] bg-[#F7E58D] text-[#111111] hover:bg-[#ffe875] rounded-2xl md:rounded-[2.5rem] h-14 md:h-24 px-6 md:px-12 font-black shadow-2xl transition-all flex items-center justify-center gap-2 md:gap-4 text-base md:text-2xl"
                     >
                        {isScanning ? 'Detecting...' : 'Scan Now'}
                     </Button>
                     <Button 
                        variant="ghost" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-2xl md:rounded-[2.5rem] h-14 md:h-24 w-14 md:w-24 flex items-center justify-center p-0 transition-all shrink-0"
                     >
                        <Upload className="w-5 h-5 md:w-8 md:h-8" />
                     </Button>
                     <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                   </div>
                </motion.div>
             ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-[#111111]"
                >
                   <img src={scannedImage.url} alt="Scanned material" className="w-full h-full object-cover opacity-60" />
                   
                   {/* HUD Overlays */}
                   <div className="absolute inset-0 border-[15px] md:border-[40px] border-[#111111]/20 pointer-events-none" />
                   <div className="absolute top-6 left-6 md:top-14 md:left-14 w-8 md:w-16 h-8 md:h-16 border-t-2 md:border-t-4 border-l-2 md:border-l-4 border-[#F7E58D]" />
                   <div className="absolute top-6 right-6 md:top-14 md:right-14 w-8 md:w-16 h-8 md:h-16 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-[#F7E58D]" />
                   <div className="absolute bottom-6 left-6 md:bottom-14 md:left-14 w-8 md:w-16 h-8 md:h-16 border-b-2 md:border-b-4 border-l-2 md:border-l-4 border-[#F7E58D]" />
                   <div className="absolute bottom-6 right-6 md:bottom-14 md:right-14 w-8 md:w-16 h-8 md:h-16 border-b-2 md:border-b-4 border-r-2 md:border-r-4 border-[#F7E58D]" />

                   <div className="absolute top-6 right-6 md:top-14 md:right-14">
                     <Button 
                       onClick={() => { setScannedImage(null); setAnalysisResult(null); setSelectedAction(null); }} 
                       className="rounded-full w-10 h-10 md:w-18 md:h-18 bg-black/40 text-white hover:bg-black/80 backdrop-blur-xl border border-white/20 p-0"
                     >
                        <X className="w-5 h-5 md:w-8 md:h-8" />
                     </Button>
                   </div>
                   
                   {isProcessing && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <div className="text-center">
                           <motion.div 
                             animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                             className="w-12 h-12 md:w-20 md:h-20 border-4 border-[#F7E58D] border-t-transparent rounded-full mx-auto mb-4 md:mb-8"
                           />
                           <p className="text-[#F7E58D] font-black tracking-widest uppercase text-[10px] md:text-sm">AI Analyzing...</p>
                        </div>
                     </div>
                   )}
                </motion.div>
             )}
           </AnimatePresence>

           {/* Scanning Line Animation */}
           <AnimatePresence>
              {isScanning && (
                 <motion.div 
                   initial={{ top: '-10%' }} animate={{ top: '110%' }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="absolute left-0 right-0 h-32 md:h-48 bg-gradient-to-b from-transparent via-[#F7E58D]/40 to-transparent z-20 pointer-events-none"
                 >
                    <div className="absolute bottom-1/2 left-0 right-0 h-0.5 md:h-1 bg-[#F7E58D] shadow-[0_0_30px_rgba(247,229,141,1)]" />
                 </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Interaction Panel */}
        <div className="flex flex-col gap-6 md:gap-10">
           <div className={`p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border-2 transition-all h-full flex flex-col ${scannedImage ? 'bg-white border-[#F7E58D] shadow-xl shadow-[#F7E58D]/10' : 'bg-[#F9F9F9] border-transparent opacity-60 pointer-events-none'}`}>
              {!analysisResult ? (
                <>
                  <div className="flex items-center gap-3 md:gap-5 mb-6 md:mb-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#FFF9E8] flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#111111]" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg md:text-3xl text-[#111111]">Detection Complete</h4>
                      <p className="text-secondary-400 font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em]">Select AI Workflow</p>
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-5 flex-1">
                    {quickActions.map((action, i) => (
                      <motion.button 
                        key={i} 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => performAIAction(action.label)}
                        className={`w-full flex items-center gap-4 md:gap-6 p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border md:border-2 transition-all text-left ${selectedAction === action.label ? 'border-[#F7E58D] bg-[#FFF9E8]' : 'border-secondary-50 bg-white hover:border-[#F7E58D]/50'}`}
                      >
                         <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#F9F9F9] flex items-center justify-center text-[#111111] shrink-0">
                            <action.icon className="w-5 h-5 md:w-7 md:h-7" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <span className="font-black text-base md:text-2xl text-[#111111] block mb-0.5">{action.label}</span>
                            <span className="text-secondary-400 font-bold text-[8px] md:text-[11px] uppercase tracking-widest truncate block">Instant AI Resolution</span>
                         </div>
                         <ChevronRight className="w-5 h-5 md:w-7 md:h-7 text-secondary-200" />
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full">
                   <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-10">
                      <div className="w-10 h-10 md:w-18 md:h-18 rounded-full bg-[#111111] flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-5 h-5 md:w-9 md:h-9 text-[#F7E58D]" />
                      </div>
                      <div>
                         <h4 className="font-black text-lg md:text-3xl text-[#111111]">{selectedAction} Result</h4>
                         <p className="text-secondary-400 font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em]">High Confidence Match</p>
                      </div>
                   </div>

                   <div className="bg-[#F9F9F9] rounded-2xl md:rounded-[3rem] p-6 md:p-10 flex-1 mb-6 md:mb-10 overflow-y-auto max-h-[300px] border border-secondary-100">
                      <div className="text-[#111111] leading-relaxed font-bold text-sm md:text-lg markdown-body">
                         <ReactMarkdown>{analysisResult || ''}</ReactMarkdown>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 md:gap-5">
                      <Button className="h-14 md:h-20 rounded-xl md:rounded-2xl bg-[#111111] text-white font-black text-xs md:text-lg uppercase tracking-widest">Save Session</Button>
                      <Button variant="ghost" onClick={() => { setAnalysisResult(null); setSelectedAction(null); }} className="h-14 md:h-20 rounded-xl md:rounded-2xl border-2 border-secondary-50 font-black text-secondary-400 text-xs md:text-lg">Retry Scan</Button>
                   </div>
                </motion.div>
              )}
           </div>

           {/* History Bar */}
           <div className="bg-[#111111] rounded-3xl md:rounded-[3.5rem] p-6 md:p-12 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6 md:mb-10">
                 <h4 className="font-black text-base md:text-2xl flex items-center gap-2 md:gap-4">
                   <History className="w-4 h-4 md:w-7 md:h-7 text-[#F7E58D]" /> Recent AI Scans
                 </h4>
                 <Button variant="ghost" className="text-[#F7E58D] font-black text-[10px] md:text-sm uppercase p-0 h-auto">Clear All</Button>
              </div>
              <div className="flex gap-3 md:gap-5 overflow-x-auto pb-4 scrollbar-none">
                 {[1, 2, 3, 4].map((i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="shrink-0 w-16 md:w-28 group cursor-pointer text-center">
                       <div className="aspect-square bg-white/5 rounded-xl md:rounded-2xl border border-white/10 overflow-hidden mb-2 md:mb-4 relative">
                          <div className="absolute inset-0 bg-[#F7E58D]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <ImageIcon className="w-5 h-5 md:w-8 md:h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" />
                       </div>
                       <span className="text-[8px] md:text-[10px] font-black text-secondary-400 uppercase tracking-widest truncate block">Scan_0{i}.jpg</span>
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
