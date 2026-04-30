import { useAppStore, PlannerTask } from '../store/useAppStore';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit3,
  Calculator,
  Microscope,
  BookA,
  Globe,
  Languages,
  FileText,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const subjectsMap = {
  math: { name: 'Mathematics', icon: Calculator, color: '#F7E58D' },
  science: { name: 'Science', icon: Microscope, color: '#F7E58D' },
  english: { name: 'English', icon: BookA, color: '#F7E58D' },
  hindi: { name: 'Hindi', icon: Languages, color: '#F7E58D' },
  social: { name: 'Social Science', icon: Globe, color: '#F7E58D' },
  computer: { name: 'ComputerScience', icon: FileText, color: '#F7E58D' },
};

export default function PlannerScreen({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user, planner, generatePlanner, updatePlanner, completeTask, startSession } = useAppStore();

  const handleStartTask = (task: PlannerTask) => {
    if (task.status === 'completed') return;
    startSession(task.subjectId, task.chapterId, task.durationMins);
    onNavigate('study');
  };

  const handleGenerate = () => {
    generatePlanner(user?.class || '9');
  };

  const removeTask = (id: string) => {
    updatePlanner(planner.filter(t => t.id !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      } as any
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 24 
      } as any
    }
  };

  const activeTasks = planner.filter(t => t.status === 'pending');
  const completedTasksCount = planner.filter(t => t.status === 'completed').length;
  const progressPct = planner.length > 0 ? (completedTasksCount / planner.length) * 100 : 0;

  return (
    <div className="space-y-6 md:space-y-10 pb-24 h-full flex flex-col px-2 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 px-2 md:px-0">
        <div>
           <motion.h1 
             initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
             className="text-2xl md:text-5xl font-black tracking-tight text-[#111111]"
           >
             Focus Planner
           </motion.h1>
           <p className="text-secondary-500 font-bold text-xs md:text-base mt-1 md:mt-2">Personalized strategy for your Daily Goals.</p>
        </div>
        
        {planner.length > 0 && (
          <Button 
            onClick={handleGenerate}
            className="bg-[#FFF9E8] text-[#111111] border border-[#F7E58D] font-black rounded-xl md:rounded-2xl h-12 md:h-16 px-6 md:px-10 hover:bg-[#F7E58D] flex items-center gap-2 md:gap-3 transition-all text-xs md:text-sm"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#F7E58D]" /> Refresh Plan
          </Button>
        )}
      </div>

      {planner.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto p-4">
          <div className="w-24 h-24 md:w-36 md:h-36 bg-[#FFF9E8] rounded-full flex items-center justify-center mb-6 md:mb-10 relative">
            <div className="absolute inset-x-0 bottom-0 h-4 bg-white/50 blur-xl" />
            <Calendar className="w-12 h-12 md:w-16 md:h-16 text-[#F7E58D]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#111111] mb-2 md:mb-4 leading-tight">Your Custom Study Plan is Ready.</h2>
          <p className="text-secondary-500 font-bold text-sm md:text-lg mb-8 md:mb-12 leading-relaxed">
            Let AI build your focused daily schedule based on Class {user?.class || '9'} curriculum.
          </p>
          <Button 
            onClick={handleGenerate}
            className="bg-[#111111] text-white font-black rounded-2xl md:rounded-[2.5rem] h-16 md:h-24 px-8 md:px-16 text-lg md:text-2xl hover:bg-black shadow-2xl flex items-center gap-3 md:gap-5 group transition-transform active:scale-95 w-full md:w-auto"
          >
            <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-[#F7E58D] group-hover:rotate-12 transition-transform shrink-0" /> 
            Build My Daily Plan
          </Button>
        </div>
      ) : (
        <div className="space-y-8 md:space-y-12">
          {/* Progress Overview Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <Card className="bg-[#111111] rounded-[2rem] md:rounded-[4rem] p-6 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 md:w-80 h-48 md:h-80 bg-[#F7E58D]/10 blur-[60px] md:blur-[100px] rounded-full -mr-16 -mt-16 md:-mr-24 md:-mt-24" />
                <div className="relative z-10 text-center md:text-left w-full md:w-auto">
                   <h3 className="text-[9px] md:text-xs font-black text-[#F7E58D] uppercase tracking-[0.3em] mb-3 md:mb-5">Today's Progress</h3>
                   <p className="text-2xl md:text-5xl font-black mb-1 md:mb-3">{completedTasksCount} / {planner.length} Tasks Done</p>
                   <p className="text-secondary-400 font-bold text-xs md:text-lg">You're making great progress! Keep it up.</p>
                </div>
                <div className="relative z-10 w-24 h-24 md:w-40 md:h-40 flex items-center justify-center shrink-0">
                   <svg viewBox="0 0 128 128" className="w-full h-full transform -rotate-90">
                      <circle stroke="rgba(255,255,255,0.05)" fill="transparent" strokeWidth="12" r="54" cx="64" cy="64" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 339.29 }} 
                        animate={{ strokeDashoffset: 339.29 - (progressPct / 100) * 339.29 }} 
                        transition={{ duration: 1, ease: 'easeOut' }}
                        stroke="#F7E58D" fill="transparent" strokeWidth="12" strokeLinecap="round" strokeDasharray="339.29" r="54" cx="64" cy="64" 
                      />
                   </svg>
                   <div className="absolute font-black text-lg md:text-3xl text-[#F7E58D]">{Math.round(progressPct)}%</div>
                </div>
             </Card>
          </motion.div>

          <div className="space-y-4 md:space-y-8">
            <div className="flex items-center justify-between px-3 md:px-2">
               <h3 className="text-xl md:text-3xl font-black text-[#111111]">Daily Timeline</h3>
               <span className="text-[10px] md:text-xs font-black text-secondary-400 uppercase tracking-widest">{activeTasks.length} active sessions</span>
            </div>

            <motion.div 
              variants={containerVariants} initial="hidden" animate="show"
              className="space-y-3 md:space-y-5"
            >
              {planner.map((task) => {
                const subj = subjectsMap[task.subjectId as keyof typeof subjectsMap] || subjectsMap.math;
                return (
                  <motion.div key={task.id} variants={itemVariants}>
                    <Card className={`bg-white border md:border-2 rounded-2xl md:rounded-[3rem] shadow-sm transition-all group overflow-hidden ${task.status === 'completed' ? 'border-secondary-50 opacity-60' : 'border-secondary-100 hover:border-[#F7E58D] hover:shadow-xl hover:shadow-[#F7E58D]/5'}`}>
                      <CardContent className="p-0">
                        <div className="p-4 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-8">
                          <div className="flex items-center gap-3 md:gap-8 w-full">
                            <div className={`w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[1.75rem] flex items-center justify-center transition-all shrink-0 ${task.status === 'completed' ? 'bg-secondary-50 text-secondary-300' : 'bg-[#F9F9F9] text-secondary-300 group-hover:bg-[#FFF9E8] group-hover:text-[#111111]'}`}>
                              <subj.icon className="w-6 h-6 md:w-10 md:h-10" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-0.5 md:mb-3">
                                 <span className={`text-[8px] md:text-[11px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'text-secondary-300' : 'text-[#F7E58D]'}`}>{subj.name}</span>
                                 <span className="w-0.5 h-0.5 rounded-full bg-secondary-200" />
                                 <span className="flex items-center gap-1 text-[8px] md:text-[11px] font-black text-secondary-400 uppercase tracking-widest">
                                   <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> {task.scheduledTime}
                                 </span>
                              </div>
                              <h4 className={`text-base md:text-2xl font-black leading-tight mb-1 truncate ${task.status === 'completed' ? 'text-secondary-400 line-through' : 'text-[#111111]'}`}>
                                Master {subj.name} Focus Session
                              </h4>
                              <p className="text-secondary-400 text-[9px] md:text-xs font-black uppercase tracking-wide">Duration: {task.durationMins} Mins</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between lg:justify-end gap-3 md:gap-6 w-full lg:w-auto border-t lg:border-0 pt-3 lg:pt-0">
                            <div className="flex gap-1 md:gap-3">
                               <Button variant="ghost" size="icon" className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl hover:bg-secondary-50 text-secondary-300 hover:text-secondary-600 transition-colors shrink-0">
                                 <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
                               </Button>
                               <Button 
                                 variant="ghost" size="icon" 
                                 onClick={() => removeTask(task.id)}
                                 className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl hover:bg-red-50 text-secondary-300 hover:text-red-500 transition-colors shrink-0"
                               >
                                 <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                               </Button>
                            </div>
                            <Button 
                              onClick={() => handleStartTask(task)}
                              className={`h-10 md:h-16 px-4 md:px-10 rounded-xl md:rounded-[2rem] font-black flex items-center gap-2 md:gap-4 transition-all text-xs md:text-base shrink-0 ${task.status === 'completed' ? 'bg-[#F7E58D] text-[#111111]' : 'bg-[#111111] text-white hover:bg-black'}`}
                            >
                              {task.status === 'completed' ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 md:w-7 md:h-7" /> <span className="hidden sm:inline">Done</span>
                                </>
                              ) : (
                                <>
                                  Start Task <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
          
          <div className="py-6 md:py-10 flex flex-col items-center">
             <div onClick={() => console.log('Add Manual')} className="w-14 h-14 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-dashed border-secondary-100 flex items-center justify-center text-secondary-200 hover:border-[#F7E58D] hover:text-[#F7E58D] transition-all cursor-pointer group mb-3 md:mb-5">
                <Plus className="w-6 h-6 md:w-12 md:h-12 group-hover:scale-110 transition-transform" />
             </div>
             <p className="text-secondary-400 font-black uppercase tracking-widest text-[9px] md:text-[11px]">Add Custom Session</p>
          </div>
        </div>
      )}
    </div>
  );
}
