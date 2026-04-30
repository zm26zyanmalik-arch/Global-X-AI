import { Button } from '../components/ui/button';
import { useAppStore } from '../store/useAppStore';
import { Trophy, Star, Lock, Gamepad2, Gift, Sparkles, ChevronRight, X, Play, Brain, Palette, Puzzle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function RewardScreen() {
  const { progress } = useAppStore();
  const [playingGame, setPlayingGame] = useState<string | null>(null);

  const rewards = [
    { id: 'math', title: 'Math Speed Puzzle', cost: 50, icon: Brain, desc: 'Calculate as fast as you can to earn bonus stars.' },
    { id: 'memory', title: 'Memory Mindscape', cost: 100, icon: Puzzle, desc: 'Challenge your short-term memory thresholds.' },
    { id: 'logic', title: 'Logic Builder', cost: 200, icon: Gamepad2, desc: 'Assemble complex architectural patterns.' },
    { id: 'mystery', title: 'Legendary Mystery Box', cost: 500, icon: Gift, desc: 'Exclusive avatar themes and premium sound packs.' },
  ];

  return (
    <div className="space-y-10 h-full pb-24 max-w-5xl mx-auto">
      {/* Header Profile Summary */}
      <motion.div 
         initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
         className="relative p-12 md:p-16 rounded-[4rem] overflow-hidden text-[#111111] shadow-3xl border-2 border-secondary-50 bg-white group"
      >
         <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFF9E8] rounded-full blur-[120px] opacity-100 -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000" />
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
             <div className="text-center md:text-left">
                <p className="text-[#F7E58D] font-black text-xs uppercase tracking-[0.4em] mb-4">Elite Scholar Rewards</p>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center md:justify-start gap-4">
                   Reward Zone <Sparkles className="w-8 h-8 text-[#111111]" />
                </h1>
                <p className="text-secondary-400 mt-4 font-bold text-sm max-w-[340px] leading-relaxed">Redeem your hard-earned knowledge stars for exclusive brain games and digital assets.</p>
             </div>
             
             <div className="flex flex-col items-center justify-center bg-[#111111] p-10 md:px-12 rounded-[3rem] shadow-3xl relative">
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#F7E58D] flex items-center justify-center text-[#111111] shadow-xl">
                   <Star className="w-6 h-6 fill-current" />
                </div>
                <span className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-1">{progress.points}</span>
                <span className="text-[10px] font-black text-[#F7E58D] uppercase tracking-[0.3em]">Vault Balance</span>
             </div>
         </div>
      </motion.div>

      {/* Rewards Grid */}
      <div className="space-y-6">
         <motion.h3 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="font-black text-[#111111] text-2xl flex items-center gap-4 ml-2"
         >
            Available Unlocks <div className="h-1 w-20 bg-[#F7E58D] rounded-full" />
         </motion.h3 >
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {rewards.map((reward, i) => {
               const isUnlocked = progress.points >= reward.cost;
               return (
                  <motion.div 
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                      className="group"
                  >
                     <div className={`h-full bg-white rounded-[3.5rem] border-2 shadow-sm p-10 transition-all flex flex-col relative overflow-hidden ${isUnlocked ? 'border-secondary-50 hover:border-[#111111] hover:shadow-2xl cursor-pointer' : 'opacity-60 border-transparent bg-[#F9F9F9] grayscale'}`}>
                        <div className="flex items-center justify-between mb-10">
                           <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 ${isUnlocked ? 'bg-[#111111] text-[#F7E58D]' : 'bg-secondary-200 text-secondary-400'}`}>
                              <reward.icon className="w-8 h-8" />
                           </div>
                           <div className={`px-5 py-2 rounded-2xl border-2 font-black text-xs uppercase tracking-widest ${isUnlocked ? 'bg-[#FFF9E8] border-[#F7E58D] text-[#111111]' : 'bg-secondary-50 border-secondary-100 text-secondary-400'}`}>
                              {reward.cost} Stars
                           </div>
                        </div>

                        <div className="flex-1 mb-10">
                           <h4 className="font-black text-2xl text-[#111111] mb-2">{reward.title}</h4>
                           <p className="text-secondary-400 font-bold text-sm leading-relaxed">{reward.desc}</p>
                        </div>

                        {isUnlocked ? (
                           <Button 
                             onClick={() => setPlayingGame(reward.title)}
                             className="w-full h-16 bg-[#111111] text-white hover:bg-black font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-95"
                           >
                              <Play className="w-5 h-5 text-[#F7E58D]" /> Play Session
                           </Button>
                        ) : (
                           <div className="flex items-center justify-between mt-auto">
                              <span className="text-[10px] font-black text-secondary-300 uppercase tracking-widest">Locked Content</span>
                              <Lock className="w-6 h-6 text-secondary-200" />
                           </div>
                        )}
                     </div>
                  </motion.div>
               );
            })}
         </div>
      </div>

      {/* Game Modal Mock */}
      <AnimatePresence>
         {playingGame && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-12 bg-[#111111]/95 backdrop-blur-3xl">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white w-full h-full md:h-auto max-w-4xl rounded-none md:rounded-[4rem] overflow-hidden flex flex-col relative shadow-3xl border-4 border-[#F7E58D]/30"
               >
                  {/* Game Header */}
                  <div className="p-10 border-b-2 border-secondary-50 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#111111] rounded-2xl flex items-center justify-center">
                           <Gamepad2 className="w-8 h-8 text-[#F7E58D]" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-[#111111] leading-none mb-1">{playingGame}</h2>
                           <span className="text-[10px] font-black uppercase text-[#F7E58D] tracking-[0.3em]">Game Session Active</span>
                        </div>
                     </div>
                     <Button variant="ghost" onClick={() => setPlayingGame(null)} className="w-16 h-16 rounded-full bg-secondary-50 text-secondary-400 p-0">
                        <X className="w-8 h-8" />
                     </Button>
                  </div>

                  {/* Game Container (Mock) */}
                  <div className="flex-1 p-12 md:p-24 flex items-center justify-center bg-[#F9F9F9]">
                     <div className="text-center max-w-md">
                        <motion.div 
                           animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                           className="w-40 h-40 border-8 border-dashed border-[#F7E58D]/30 rounded-full mx-auto mb-12 flex items-center justify-center"
                        >
                           <Palette className="w-16 h-16 text-[#111111] opacity-20" />
                        </motion.div>
                        <h3 className="text-3xl font-black text-[#111111] mb-6 tracking-tight italic">Coming Soon to Global X AI</h3>
                        <p className="text-secondary-400 font-bold mb-10 text-lg leading-relaxed">
                           We are currently polishing the interactive game engine to ensure a world-class educational experience.
                        </p>
                        <Button onClick={() => setPlayingGame(null)} className="h-16 px-12 bg-[#111111] text-white font-black rounded-2xl hover:bg-black uppercase tracking-widest transition-transform active:scale-95 shadow-2xl">
                           Back to Rewards
                        </Button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
