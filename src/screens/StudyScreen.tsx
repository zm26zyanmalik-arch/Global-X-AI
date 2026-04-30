import { useState, useEffect } from 'react';
import { useAppStore, StudySession } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { 
  Calculator, 
  Microscope, 
  BookA, 
  Languages, 
  FileText, 
  Globe, 
  Play, 
  Pause, 
  CheckCircle2, 
  BookOpen, 
  RotateCcw,
  Coffee,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const subjects = [
  { 
    id: 'math', 
    name: 'Mathematics', 
    icon: Calculator, 
    chapters: [
      { id: 'm1', title: 'Addition Shortcuts', description: 'Master mental addition tricks', estimatedTime: '45m' },
      { id: 'm2', title: 'Multiplication Fast Methods', description: 'Speed up your calculations', estimatedTime: '60m' },
      { id: 'm3', title: 'Algebra Basics', description: 'Introduction to variables', estimatedTime: '90m' },
      { id: 'm4', title: 'Geometry Basics', description: 'Shapes and angles', estimatedTime: '120m' },
    ]
  },
  { 
    id: 'science', 
    name: 'Science', 
    icon: Microscope, 
    chapters: [
      { id: 's1', title: 'Photosynthesis', description: 'How plants make food', estimatedTime: '45m' },
      { id: 's2', title: 'Human Body Basics', description: 'Overview of organ systems', estimatedTime: '60m' },
      { id: 's3', title: 'Force and Motion', description: 'Newton\'s laws of physics', estimatedTime: '75m' },
      { id: 's4', title: 'Electricity Basics', description: 'Current, voltage, and circuits', estimatedTime: '90m' },
    ]
  },
  { 
    id: 'english', 
    name: 'English', 
    icon: BookA, 
    chapters: [
      { id: 'e1', title: 'Tenses', description: 'Past, Present, and Future', estimatedTime: '45m' },
      { id: 'e2', title: 'Vocabulary building', description: 'New words everyday', estimatedTime: '30m' },
      { id: 'e3', title: 'Reading Skills', description: 'Comprehension strategies', estimatedTime: '60m' },
    ]
  },
  { 
    id: 'hindi', 
    name: 'Hindi', 
    icon: Languages, 
    chapters: [
      { id: 'h1', title: 'Varnmala', description: 'The Hindi alphabet', estimatedTime: '30m' },
      { id: 'h2', title: 'Grammar Basics', description: 'Sangya and Sarvanaam', estimatedTime: '45m' },
    ]
  },
  { 
    id: 'social', 
    name: 'Social Science', 
    icon: Globe, 
    chapters: [
      { id: 'ss1', title: 'History Basics', description: 'Timeline of civilizations', estimatedTime: '60m' },
      { id: 'ss2', title: 'Geography Basics', description: 'Maps and climates', estimatedTime: '45m' },
      { id: 'ss3', title: 'Constitution', description: 'Understanding laws', estimatedTime: '90m' },
    ]
  },
  { 
    id: 'computer', 
    name: 'Computer', 
    icon: FileText, 
    chapters: [
      { id: 'c1', title: 'AI Basics', description: 'Introduction to Artificial Intelligence', estimatedTime: '45m' },
      { id: 'c2', title: 'Internet Safety', description: 'Stay safe online', estimatedTime: '30m' },
      { id: 'c3', title: 'Coding Intro', description: 'Basic programming concepts', estimatedTime: '90m' },
    ]
  },
];

const ALARM_URL = 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg';
const FALLBACK_ALARM_URL = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

export default function StudyScreen() {
  const { 
    activeSession, 
    startSession, 
    pauseSession, 
    resumeSession, 
    stopSession, 
    tickSession,
    progress
  } = useAppStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [showSwitchDialog, setShowSwitchDialog] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [lastCompletedSubject, setLastCompletedSubject] = useState<string | null>(null);
  const [studyDuration, setStudyDuration] = useState(120); // mins
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Unlock audio on first interaction
  useEffect(() => {
    const unlock = () => {
      const audio = new Audio();
      audio.play().catch(() => {});
      setAudioUnlocked(true);
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);

  // The interval for store.tickSession() is now globally managed in App.tsx
  // This reduces duplication and ensures background ticking works.

  // Completion Detection
  useEffect(() => {
    if (activeSession?.isCompleted && !showCompletionModal) {
      setShowCompletionModal(true);
      if (!isMuted) playAlarm();
      setLastCompletedSubject(activeSession.subjectId);
    }
  }, [activeSession?.isCompleted, showCompletionModal, isMuted]);

  const playAlarm = (retryCount = 0) => {
    if (alarmPlaying || isMuted) {
       console.log('Skipping alarm: ', { alarmPlaying, isMuted });
       return;
    }
    
    // Attempt playback with multiple sources if needed
    const currentUrl = retryCount === 0 ? ALARM_URL : FALLBACK_ALARM_URL;
    
    try {
      const audio = new Audio(currentUrl);
      audio.loop = true;
      audio.id = 'study-alarm-v4';
      audio.volume = volume;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Alarm started successfully from:', currentUrl);
            setAlarmPlaying(true);
            // Auto stop after 15 seconds to ensure user hears it
            setTimeout(() => {
              stopAlarm();
            }, 15000);
          })
          .catch(e => {
            console.error(`Alarm Play Error (Source: ${currentUrl}):`, e);
            // Attempt fallback on next retry
            if (retryCount < 2) {
              console.log('Retrying alarm with fallback...');
              setTimeout(() => playAlarm(retryCount + 1), 500);
            }
          });
      }
    } catch (err) {
      console.error('Fatal alarm error:', err);
    }
  };

  const stopAlarm = () => {
    const audio = document.getElementById('study-alarm-v4') as HTMLAudioElement;
    if (audio) {
      audio.pause();
      audio.remove();
    }
    setAlarmPlaying(false);
  };

  const handleChapterClick = (subjectId: string, chapterId: string) => {
    // If there is an active session in ANOTHER subject, show switch warning
    if (activeSession && activeSession.subjectId !== subjectId) {
      setShowSwitchDialog(chapterId);
    } else {
      setSelectedChapterId(chapterId);
    }
  };

  const forceStartNewSession = () => {
    if (showSwitchDialog && selectedSubjectId) {
      stopSession();
      setSelectedChapterId(showSwitchDialog);
      setShowSwitchDialog(null);
    }
  };

  const confirmStartStudy = () => {
    if (selectedSubjectId && selectedChapterId) {
      console.log('Starting study session:', selectedSubjectId, selectedChapterId);
      startSession(selectedSubjectId, selectedChapterId, studyDuration);
      setLastCompletedSubject(selectedSubjectId);
      setSelectedChapterId(null); // Clear after starting
    } else {
      console.error('Missing subject or chapter ID', { selectedSubjectId, selectedChapterId });
    }
  };

  const calculateRemaining = () => {
    if (!activeSession) return 0;
    const elapsed = (activeSession as StudySession).accumulatedSeconds + (activeSession.isPaused ? 0 : Math.floor((Date.now() - activeSession.startTime) / 1000));
    return Math.max(0, activeSession.targetSeconds - elapsed);
  };

  const [remainingTime, setRemainingTime] = useState(0);
  useEffect(() => {
    if (activeSession) {
      const update = () => setRemainingTime(calculateRemaining());
      update();
      const i = setInterval(update, 1000);
      return () => clearInterval(i);
    }
  }, [activeSession]);

  const formatTime = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const activeSubject = subjects.find(s => s.id === activeSession?.subjectId);

  return (
    <div className="space-y-6 md:space-y-10 h-full flex flex-col pb-24 px-1 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-0">
        <div>
            <motion.h1 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-4xl font-black tracking-tight text-[#111111] flex items-center gap-2 md:gap-4"
            >
              Study Center <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#F7E58D] flex items-center justify-center"><BookOpen className="w-3.5 h-3.5 md:w-5 md:h-5 text-[#111111]" /></div>
            </motion.h1>
            <p className="text-secondary-500 font-bold text-[11px] md:text-sm mt-1 md:mt-2">Focused, structured, and reliable learning.</p>
         </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 md:gap-3 bg-[#F9F9F9] p-1.5 rounded-2xl md:rounded-3xl border border-secondary-50">
            <Button 
               variant="ghost" 
               onClick={() => setIsMuted(!isMuted)}
               className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl p-0 ${isMuted ? 'text-red-500 bg-red-50' : 'text-[#111111] bg-white shadow-sm'}`}
            >
               {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
            <div className="hidden lg:flex flex-col gap-1 pr-4">
               <span className="text-[8px] font-black uppercase text-secondary-300 tracking-widest px-1">Alarm Vol</span>
               <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 accent-[#F7E58D] cursor-pointer"
               />
            </div>
         </div>
      </div>

      {/* Switch Session Dialog */}
      <AnimatePresence>
        {showSwitchDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#111111]/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 max-w-md w-full shadow-2xl border border-secondary-100 text-center"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                <RotateCcw className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#111111] mb-2 md:mb-4">Switch Subject?</h3>
              <p className="text-secondary-500 font-bold text-xs md:text-sm mb-8 md:mb-10 leading-relaxed">
                You have an active session for <b>{activeSubject?.name}</b>. Switching will stop your current progress.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={forceStartNewSession}
                  className="h-14 md:h-16 bg-red-500 text-white font-black rounded-xl md:rounded-2xl hover:bg-red-600 w-full"
                >
                  Yes, Switch Now
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowSwitchDialog(null)}
                  className="h-12 text-secondary-400 font-bold w-full"
                >
                  Keep Studying {activeSubject?.name}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Active Session Ribbon */}
      <AnimatePresence>
        {activeSession && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-2"
          >
            <div className="bg-[#FFF9E8] border border-[#F7E58D]/30 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shadow-sm mb-4">
              <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[1.5rem] bg-white flex items-center justify-center shadow-sm relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-[#F7E58D]/10 animate-pulse" />
                  {activeSubject && <activeSubject.icon className="w-6 h-6 md:w-10 md:h-10 text-[#111111]" />}
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#F7E58D] mb-0.5 md:mb-1">Studying</h4>
                   <p className="text-sm md:text-2xl font-black text-[#111111] leading-tight truncate">
                     {activeSubject?.chapters.find(c => c.id === activeSession.chapterId)?.title || activeSubject?.name}
                   </p>
                   <div className="flex items-center gap-2 mt-1.5 md:mt-3">
                     <div className="h-1 md:h-2 w-24 md:w-40 bg-white rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#F7E58D] rounded-full"
                          animate={{ width: `${((activeSession.targetSeconds - remainingTime) / activeSession.targetSeconds) * 100}%` }}
                        />
                     </div>
                     <span className="text-[9px] md:text-[11px] font-black text-secondary-400">
                        {Math.floor(((activeSession.targetSeconds - remainingTime) / activeSession.targetSeconds) * 100)}%
                     </span>
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 w-full md:w-auto border-t md:border-0 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                   <p className="text-xl md:text-4xl font-black text-[#111111] font-mono tracking-tighter">
                     {formatTime(remainingTime)}
                   </p>
                   <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-secondary-400">Time Left</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={activeSession.isPaused ? resumeSession : pauseSession}
                    className={`rounded-xl md:rounded-2xl w-10 h-10 md:w-16 md:h-16 flex items-center justify-center shadow-lg transition-transform active:scale-90 ${activeSession.isPaused ? 'bg-[#F7E58D] text-[#111111]' : 'bg-white border-2 border-[#F7E58D] text-[#111111]'}`}
                  >
                    {activeSession.isPaused ? <Play className="w-5 h-5 md:w-7 md:h-7 fill-current" /> : <Pause className="w-5 h-5 md:w-7 md:h-7 fill-current" />}
                  </Button>
                  <Button 
                    onClick={stopSession}
                    variant="ghost"
                    className="rounded-xl md:rounded-2xl w-10 h-10 md:w-16 md:h-16 bg-white/50 text-[#111111] hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5 md:w-7 md:h-7" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Flow: Subjects -> Chapters */}
      {!selectedSubjectId ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-2">
          {subjects.map((s) => (
            <motion.div 
              key={s.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSubjectId(s.id)}
              className="cursor-pointer bg-white border border-secondary-50 hover:border-[#F7E58D] rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex flex-col items-center text-center transition-all group shadow-sm hover:shadow-xl hover:shadow-[#F7E58D]/10 text-[#111111]"
            >
              <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-[#F3F3F3] text-secondary-400 group-hover:bg-[#F7E58D] group-hover:text-[#111111] flex items-center justify-center mb-3 md:mb-6 transition-all">
                <s.icon className="w-6 h-6 md:w-10 md:h-10 stroke-[2px]" />
              </div>
              <h3 className="font-black text-[11px] md:text-xl uppercase md:normal-case tracking-tight">{s.name}</h3>
              <p className="text-[9px] md:text-[11px] font-black text-secondary-400 uppercase tracking-widest mt-1.5 md:mt-3">
                {s.chapters.length} Chapters
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl md:rounded-[3.5rem] border border-secondary-100 p-5 md:p-12 shadow-sm mx-2">
           <Button 
             variant="ghost" onClick={() => setSelectedSubjectId(null)}
             className="mb-6 md:mb-10 text-secondary-400 font-bold hover:bg-secondary-50 p-2 h-auto flex items-center gap-2 text-xs md:text-sm"
           >
             <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Subjects
           </Button>
           
           <div className="flex items-center gap-3 md:gap-6 mb-8 md:mb-14">
              <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-[#FFF9E8] flex items-center justify-center shrink-0">
                 {selectedSubject && <selectedSubject.icon className="w-6 h-6 md:w-10 md:h-10 text-[#111111]" />}
              </div>
              <div>
                 <h2 className="text-xl md:text-4xl font-black text-[#111111] leading-tight">{selectedSubject?.name}</h2>
                 <p className="text-[11px] md:text-base font-bold text-secondary-400">Choose a chapter to begin Focused Mode.</p>
              </div>
           </div>

           <div className="grid gap-3 md:gap-5">
              {selectedSubject?.chapters.map((chapter, idx) => (
                <div 
                  key={chapter.id}
                  onClick={() => handleChapterClick(selectedSubject.id, chapter.id)}
                  className={`p-4 md:p-10 rounded-2xl md:rounded-[3rem] border md:border-2 cursor-pointer transition-all flex items-center justify-between group ${selectedChapterId === chapter.id ? 'bg-[#FFF9E8] border-[#F7E58D]' : 'bg-white border-secondary-50 hover:border-[#F7E58D]'}`}
                >
                  <div className="flex items-center gap-3 md:gap-8 min-w-0">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[1.25rem] bg-[#F9F9F9] text-secondary-300 font-black flex items-center justify-center text-sm md:text-2xl group-hover:bg-[#F7E58D] group-hover:text-[#111111] transition-all shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-[#111111] text-base md:text-2xl leading-none mb-1 md:mb-3 truncate">{chapter.title}</h4>
                      <p className="text-secondary-400 text-[10px] md:text-sm font-bold leading-tight truncate md:whitespace-normal">{chapter.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-8 shrink-0 ml-4">
                    <span className="text-[9px] md:text-[11px] font-black text-secondary-300 uppercase tracking-widest hidden lg:block">{chapter.estimatedTime}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startSession(selectedSubject.id, chapter.id, 120);
                        setLastCompletedSubject(selectedSubject.id);
                      }}
                      className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-[#111111] text-[#F7E58D] flex items-center justify-center shadow-lg transform active:scale-90 hover:scale-110 transition-transform shrink-0"
                    >
                      <Play className="w-4 h-4 md:w-7 md:h-7 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Chapter Detail / Start Session Dialog */}
      <AnimatePresence>
        {selectedChapterId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#111111]/40 backdrop-blur-md">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-secondary-100"
             >
                <div className="flex justify-between items-start mb-8">
                   <div className="w-16 h-16 bg-[#FFF9E8] rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-[#111111]" />
                   </div>
                   <Button variant="ghost" onClick={() => setSelectedChapterId(null)} className="rounded-full w-10 h-10 p-0 hover:bg-secondary-50">
                      <X className="w-6 h-6 text-secondary-300" />
                   </Button>
                </div>

                <h3 className="text-2xl font-black text-[#111111] mb-2 leading-none">
                   {selectedSubject?.chapters.find(c => c.id === selectedChapterId)?.title}
                </h3>
                <p className="text-secondary-500 font-bold text-sm mb-10 leading-relaxed">
                   Set your focus duration. A reliable alarm will trigger once the timer reaches zero. master this topic efficiently.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                   {[15, 30, 60, 120].map((mins) => (
                      <button 
                         key={mins}
                         onClick={() => setStudyDuration(mins)}
                         className={`h-16 rounded-[1.5rem] font-black transition-all border-2 ${studyDuration === mins ? 'bg-[#F7E58D] border-[#F7E58D] text-[#111111] shadow-xl shadow-[#F7E58D]/30' : 'bg-[#F9F9F9] border-transparent text-secondary-400 hover:border-[#F7E58D]'}`}
                      >
                         {mins === 60 ? '1 Hour' : mins === 120 ? '2 Hours' : `${mins} Mins`}
                      </button>
                   ))}
                </div>

                <Button 
                  onClick={confirmStartStudy}
                  disabled={!selectedSubjectId || !selectedChapterId}
                  className="w-full h-20 bg-[#111111] text-white font-black rounded-3xl text-xl hover:bg-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50"
                >
                   <Play className="w-6 h-6 fill-current" /> Start Focus Session
                </Button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#111111]/70 backdrop-blur-2xl">
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-[4.5rem] p-12 max-w-md w-full shadow-3xl text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#F7E58D]/5 pointer-events-none" />
              <div className="w-28 h-28 bg-[#F7E58D] rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-[#F7E58D]/40">
                <CheckCircle2 className="w-14 h-14 text-[#111111] stroke-[3.5px]" />
              </div>
              <h3 className="text-4xl font-black text-[#111111] mb-4 text-center leading-tight">Session Complete 🎉</h3>
              <p className="text-secondary-500 font-bold text-xl mb-12 leading-relaxed">
                You've completed your study time for {subjects.find(s => s.id === lastCompletedSubject)?.name}. Incredible work!
              </p>
              <div className="flex flex-col gap-4 relative z-10 font-black">
                <Button 
                  onClick={() => { setShowCompletionModal(false); stopAlarm(); stopSession(); setSelectedSubjectId(null); }}
                  className="bg-[#111111] text-white font-black rounded-[3rem] h-20 text-xl hover:bg-black w-full"
                >
                  Next Subject
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => { setShowCompletionModal(false); stopAlarm(); stopSession(); }}
                  className="text-secondary-400 font-black h-16 flex items-center justify-center gap-3 hover:bg-[#F3F3F3] rounded-[3rem]"
                >
                  <Coffee className="w-6 h-6" /> Take a Break
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
