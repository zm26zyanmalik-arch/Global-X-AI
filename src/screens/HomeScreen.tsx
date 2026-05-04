import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  PlayCircle, 
  MessageSquare, 
  Bell, 
  User as UserIcon,
  Flame,
  Clock as ClockIcon,
  Target,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TeacherAvatar } from '../components/TeacherAvatar';

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#F3F3F3] px-3 py-1.5 rounded-full border border-secondary-100 flex items-center gap-2 shadow-sm"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#F7E58D] animate-pulse shadow-[0_0_8px_rgba(247,229,141,0.8)]" />
      <span className="text-[11px] font-black text-[#111111] tracking-wider font-mono">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </motion.div>
  );
};

export default function HomeScreen({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user, progress, planner } = useAppStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: '☀️' };
    if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: '🌤️' };
    if (hour >= 17 && hour < 21) return { text: 'Good Evening', icon: '🌇' };
    return { text: 'Good Night', icon: '🌙' };
  };

  const greetingConfig = getGreeting();

  const getMotivationalQuote = () => {
    const quotes = [
      "Small progress every day leads to big success.",
      "The expert in anything was once a beginner.",
      "Focus on the step in front of you, not the whole staircase.",
      "Consistency is what transforms average into excellence.",
      "Don't stop until you're proud.",
      "Knowledge is the only treasure that increases when shared."
    ];
    return quotes[new Date().getDate() % quotes.length];
  };

  const pendingTasks = planner.filter(t => t.status === 'pending').length;

  const achievements = [
    { label: 'Studied', value: `${progress.timeStudiedMins}m`, icon: ClockIcon, color: 'text-secondary-400' },
    { label: 'Chapters', value: progress.chaptersCompleted, icon: CheckCircle2, color: 'text-secondary-400' },
    { label: 'Pending', value: pendingTasks, icon: Target, color: 'text-secondary-400' },
    { label: 'Streak', value: progress.streak, icon: Flame, color: 'text-[#F7E58D]' },
  ];

  return (
    <div className="space-y-6 md:space-y-10 h-full bg-white pb-24 md:pb-10 overflow-x-hidden pt-2 px-0 md:px-2">
      
      {/* Top Section */}
      <div className="flex items-center justify-between px-4 md:px-6">
        <div className="space-y-0.5">
          <p className="text-secondary-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.25em]">
             {greetingConfig.text} {greetingConfig.icon}
          </p>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="text-xl md:text-3xl font-black tracking-tight text-[#111111]"
          >
            {user?.name || 'Student'}
          </motion.h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
            <DigitalClock />
          </div>
          <div className="flex items-center gap-1.5 md:gap-3">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-secondary-100 flex items-center justify-center text-[#111111] shadow-sm hover:bg-[#F3F3F3] transition-all relative"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <span className="absolute top-[30%] right-[30%] w-1.5 h-1.5 bg-[#F7E58D] rounded-full border border-white" />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('profile')}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-secondary-100 flex items-center justify-center text-[#111111] shadow-sm hover:bg-[#F3F3F3] transition-all"
            >
              <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="sm:hidden px-4">
        <DigitalClock />
      </div>

      {/* Hero Experience Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ type: "spring", damping: 25 }}
        className="px-4 md:px-6"
      >
         <Card className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-[#FFF9E8] border border-[#F7E58D]/30 shadow-[0_25px_60px_-20px_rgba(247,229,141,0.4)] group">
            {/* Soft Ambient Glows */}
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.3, 0.15]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-24 -right-24 w-72 h-72 bg-[#F7E58D] rounded-full blur-[100px] pointer-events-none" 
            />
            
            <CardContent className="px-6 py-10 md:p-16 flex flex-col items-center text-center relative z-10">
               {/* LIVE Badge */}
               <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-white/70 backdrop-blur-md text-[#111111] border border-[#F7E58D]/40 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-8 md:mb-12 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-pulse" />
                  LIVE • AI TEACHER
               </div>

               {/* AI Teacher Avatar */}
               <div className="relative mb-8 md:mb-12">
                  <TeacherAvatar 
                    name={user?.teacherPreference || 'Priya'} 
                    isSpeaking={false} 
                    size="lg" 
                  />
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring" }}
                    className="absolute -bottom-1 -right-1 w-8 h-8 md:w-12 md:h-12 bg-[#F7E58D] rounded-full border-4 border-[#FFF9E8] flex items-center justify-center shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-[#111111] fill-[#111111]/10" />
                  </motion.div>
               </div>
               
               <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-2 md:mb-4 text-[#111111] leading-tight max-w-md">Ready for today's learning?</h2>
               <p className="text-secondary-500 text-[11px] md:text-sm font-bold tracking-wide mb-8 md:mb-12 opacity-70">You are progressing well. Keep going towards your goals.</p>
               
               {/* Progress indicator */}
               <div className="w-full max-w-[200px] md:max-w-[280px] mb-10 md:mb-14">
                  <div className="flex justify-between items-center mb-3 px-1">
                     <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary-500">Today's Progress</span>
                     <span className="text-[9px] md:text-[10px] font-black text-[#111111]">65%</span>
                  </div>
                  <div className="h-1.5 md:h-2.5 w-full bg-white rounded-full overflow-hidden shadow-inner p-0.5">
                     <motion.div 
                       initial={{ width: 0 }} 
                       whileInView={{ width: '65%' }} 
                       transition={{ duration: 2, ease: "easeOut" }}
                       className="h-full bg-[#F7E58D] rounded-full shadow-[0_0_15px_rgba(247,229,141,0.6)]" 
                     />
                  </div>
               </div>
               
               {/* Action Buttons */}
               <div className="grid grid-cols-1 sm:grid-cols-2 w-full max-w-md gap-3 md:gap-5">
                  <motion.button 
                    whileHover={{ scale: 1.03, boxShadow: "0 15px 30px -10px rgba(247,229,141,0.5)" }} whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate('study')}
                    className="bg-[#F7E58D] text-[#111111] font-black rounded-xl md:rounded-2xl h-14 md:h-18 flex items-center justify-center text-sm md:text-lg transition-all"
                  >
                    <PlayCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 stroke-[2.5px]" /> Continue
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.03, backgroundColor: "#FFFFFF" }} whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate('chat')}
                    className="bg-white/40 backdrop-blur-md border border-[#F7E58D]/30 text-[#111111] font-bold rounded-xl md:rounded-2xl h-14 md:h-18 flex items-center justify-center text-sm md:text-lg transition-all"
                  >
                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Ask AI
                  </motion.button>
               </div>
            </CardContent>
         </Card>
      </motion.div>

      {/* Progress Feel Section (Badge Achievements) */}
      <div className="px-4 md:px-6 space-y-4 md:space-y-6">
        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-secondary-400 px-1">Accomplishments</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
           {achievements.map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 * i }}
               whileTap={{ scale: 0.95 }}
               className="bg-[#F3F3F3] rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 flex flex-col items-center justify-center text-center gap-2 border border-transparent transition-all cursor-pointer hover:bg-white hover:border-[#F7E58D] hover:shadow-2xl hover:shadow-[#F7E58D]/10 group"
             >
                <div className={`w-10 h-10 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform ${item.label === 'Streak' ? 'bg-[#FFF9E8] text-[#F7E58D]' : 'bg-white text-secondary-300'}`}>
                  <item.icon className="w-5 h-5 md:w-8 md:h-8 stroke-[2.5px]" />
                </div>
                <div className="text-xl md:text-4xl font-black text-[#111111] tracking-tight">{item.value}</div>
                <div className="text-[8px] md:text-[10px] font-black text-secondary-400 uppercase tracking-widest">{item.label}</div>
             </motion.div>
           ))}
        </div>
      </div>

      {/* Motivational Line (The Inspiration Strip) */}
      <div className="px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative py-8 md:py-12 px-8 md:px-16 rounded-[2rem] md:rounded-[3.5rem] bg-[#F3F3F3] border border-secondary-100/50 flex flex-col items-center text-center group overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(247,229,141,0.15),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <p className="text-[11px] md:text-base font-bold text-secondary-500 italic tracking-wide leading-relaxed relative z-10 px-0 md:px-6">
            "{getMotivationalQuote()}"
          </p>
        </motion.div>
      </div>

      {/* Today Focus Section (Flow) */}
      <div className="px-4 md:px-6 space-y-4 md:space-y-6">
        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-secondary-400 px-1">Today's Focus Flow</h3>
        <Card className="bg-white border border-secondary-100 rounded-[2rem] md:rounded-[4rem] shadow-sm overflow-hidden p-6 md:p-12">
          <div className="space-y-0.5">
             {planner.length === 0 ? (
               <div className="py-10 text-center">
                 <p className="text-secondary-400 font-bold">No tasks planned for today.</p>
                 <Button variant="link" onClick={() => onNavigate('planner')} className="text-[#F7E58D] font-black uppercase text-[10px] tracking-widest mt-2 p-0 h-auto">Generate Plan Now</Button>
               </div>
             ) : (
               planner.slice(0, 3).map((task, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ x: 6, backgroundColor: "rgba(0,0,0,0.01)" }}
                   onClick={() => onNavigate('planner')}
                   className="flex items-center justify-between py-4 md:py-8 border-b border-secondary-50 last:border-0 group cursor-pointer transition-all rounded-xl px-2"
                 >
                    <div className="flex items-center gap-3 md:gap-8">
                       <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${task.status === 'completed' ? 'bg-green-400' : 'bg-[#F7E58D]'} group-hover:scale-150 transition-all shadow-[0_0_10px_rgba(247,229,141,1)]`} />
                       <div className="flex flex-col gap-0.5">
                          <span className={`text-sm md:text-2xl font-black ${task.status === 'completed' ? 'text-secondary-300 line-through' : 'text-[#111111]'} tracking-tight`}>{task.chapterId}</span>
                          <span className="text-[8px] md:text-[11px] font-black text-secondary-400 uppercase tracking-widest leading-none">{task.subjectId} • {task.scheduledTime}</span>
                       </div>
                    </div>
                    <div className="text-[9px] md:text-base font-black text-secondary-400 font-mono tracking-wider">{task.durationMins}m</div>
                 </motion.div>
               ))
             )}
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => onNavigate('planner')}
            className="mt-6 md:mt-12 pt-6 md:pt-12 border-t border-secondary-50 flex justify-center"
          >
             <button className="text-[8px] md:text-sm font-black uppercase tracking-[0.2em] text-[#111111] hover:text-secondary-600 transition-colors flex items-center gap-2">
                Expand My Planner <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-[#F7E58D]" />
             </button>
          </motion.div>
        </Card>
      </div>

    </div>
  );
}
