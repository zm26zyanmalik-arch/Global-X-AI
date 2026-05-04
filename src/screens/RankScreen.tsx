import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Crown, TrendingUp, Users, Star, Award, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function RankScreen() {
  const { user, rankings, progress } = useAppStore();

  const userRank = rankings.find(r => r.isUser);
  const topUsers = rankings.slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 md:w-8 md:h-8 text-[#F7E58D] drop-shadow-[0_0_8px_rgba(247,229,141,0.5)]" />;
      case 2: return <Medal className="w-6 h-6 md:w-8 md:h-8 text-secondary-300" />;
      case 3: return <Trophy className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />;
      default: return <span className="font-black text-secondary-300 text-sm md:text-xl">{rank}</span>;
    }
  };

  return (
    <div className="space-y-6 md:space-y-12 pb-24 h-full flex flex-col px-2 md:px-0">
      {/* Header Section */}
      <div className="px-2 md:px-0">
         <motion.h1 
           initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
           className="text-2xl md:text-5xl font-black tracking-tight text-[#111111] flex items-center gap-3"
         >
           Global Rankings <TrendingUp className="w-6 h-6 md:w-10 md:h-10 text-[#F7E58D]" />
         </motion.h1>
         <p className="text-secondary-500 font-bold text-xs md:text-base mt-2">Competing with {rankings.length}+ active students worldwide.</p>
      </div>

      {/* User Status Card */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="bg-[#111111] rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-14 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 shadow-2xl">
           <div className="absolute top-0 right-0 w-80 h-80 bg-[#F7E58D]/10 blur-[100px] rounded-full -mr-24 -mt-24" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -ml-32 -mb-32" />
           
           <div className="relative z-10 flex items-center gap-4 md:gap-8 w-full md:w-auto">
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-3xl md:rounded-[2.5rem] bg-[#F7E58D] flex items-center justify-center shadow-2xl shadow-[#F7E58D]/20 shrink-0 transform -rotate-3 transition-transform hover:rotate-0">
                 <Trophy className="w-10 h-10 md:w-16 md:h-16 text-[#111111]" />
              </div>
              <div>
                 <h2 className="text-3xl md:text-5xl font-black mb-1 md:mb-3">#{userRank?.rank}</h2>
                 <p className="text-[#F7E58D] font-black text-[10px] md:text-xs uppercase tracking-[0.3em]">Your Global Rank</p>
              </div>
           </div>

           <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-14 w-full md:w-auto">
              <div className="text-center md:text-left">
                 <p className="text-xl md:text-3xl font-black text-white">{userRank?.points.toLocaleString()}</p>
                 <p className="text-secondary-400 font-black text-[9px] md:text-xs uppercase tracking-widest mt-1">Study Points</p>
              </div>
              <div className="text-center md:text-left">
                 <p className="text-xl md:text-3xl font-black text-white">{progress.chaptersCompleted}</p>
                 <p className="text-secondary-400 font-black text-[9px] md:text-xs uppercase tracking-widest mt-1">Chapters Done</p>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Leaderboard Table */}
      <div className="space-y-4 md:space-y-8">
        <div className="flex items-center justify-between px-3 md:px-2">
           <h3 className="text-xl md:text-3xl font-black text-[#111111] flex items-center gap-3">
             <Crown className="w-5 h-5 md:w-8 md:h-8 text-[#F7E58D]" /> Top Performers
           </h3>
           <div className="flex items-center gap-2 text-secondary-400 font-black text-[9px] md:text-xs uppercase tracking-widest">
             <Users className="w-3.5 h-3.5 md:w-4 md:h-4" /> Live Lobby
           </div>
        </div>

        <div className="space-y-2 md:space-y-4">
           {topUsers.map((entry, idx) => (
             <motion.div 
               key={entry.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.05 }}
               className={`relative overflow-hidden rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 flex items-center justify-between border-2 transition-all ${entry.isUser ? 'bg-[#FFF9E8] border-[#F7E58D] shadow-xl shadow-[#F7E58D]/10 z-10' : 'bg-white border-secondary-50 hover:border-secondary-100 shadow-sm'}`}
             >
                {entry.isUser && (
                   <div className="absolute top-0 right-0 py-1.5 md:py-2 px-4 md:px-6 bg-[#F7E58D] text-[#111111] font-black text-[8px] md:text-[10px] uppercase tracking-widest rounded-bl-2xl">
                     You
                   </div>
                )}
                
                <div className="flex items-center gap-4 md:gap-8">
                   <div className="w-8 h-8 md:w-16 md:h-16 flex items-center justify-center shrink-0">
                      {getRankIcon(entry.rank)}
                   </div>
                   <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-secondary-50 flex items-center justify-center shrink-0 overflow-hidden">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name}&backgroundColor=fff9e8`} 
                        alt={entry.name}
                        className="w-full h-full object-cover"
                      />
                   </div>
                   <div className="min-w-0">
                      <h4 className="text-sm md:text-2xl font-black text-[#111111] truncate">{entry.name}</h4>
                      <div className="flex items-center gap-2 md:gap-4 mt-0.5 md:mt-2">
                         <span className="text-[10px] md:text-sm font-black text-secondary-400 capitalize flex items-center gap-1">
                           <Award className="w-3 h-3 md:w-4 md:h-4" /> Class {entry.class}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-secondary-200" />
                         <span className="text-secondary-300 font-bold text-[10px] md:text-sm">{entry.isUser ? 'Current' : '2 min ago'}</span>
                      </div>
                   </div>
                </div>

                <div className="text-right">
                   <div className="flex items-center justify-end gap-1.5 md:gap-2 mb-1">
                      <Zap className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#F7E58D] fill-current" />
                      <span className="text-base md:text-3xl font-black text-[#111111]">{entry.points.toLocaleString()}</span>
                   </div>
                   <p className="text-secondary-400 font-black text-[8px] md:text-[10px] uppercase tracking-widest">Points earned</p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>

      <div className="px-3">
         <Button className="w-full h-16 md:h-24 bg-[#F9F9F9] border-2 border-secondary-50 text-secondary-400 font-black rounded-2xl md:rounded-[2.5rem] hover:bg-[#F3F3F3] transition-all flex flex-col items-center justify-center gap-1">
            <span className="text-xs md:text-xl">View Complete Leaderboard</span>
            <span className="text-[10px] md:text-xs">Scroll to see 500+ more ranked students</span>
         </Button>
      </div>
    </div>
  );
}
