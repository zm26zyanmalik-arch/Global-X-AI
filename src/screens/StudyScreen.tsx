import { useState, useEffect } from 'react';
import { useAppStore, StudySession, Subject, Chapter } from '../store/useAppStore';
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
  Edit3,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const iconMap = {
  Calculator,
  Microscope,
  BookA,
  Languages,
  Globe,
  FileText
};

const ALARM_URL = 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg';
const FALLBACK_ALARM_URL = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

export default function StudyScreen() {
  const { 
    activeSession, 
    startSession, 
    pauseSession, 
    resumeSession, 
    stopSession, 
    subjects,
    addChapter,
    removeChapter,
    updateChapter
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
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Completion Detection
  useEffect(() => {
    if (activeSession?.isCompleted && !showCompletionModal) {
      setShowCompletionModal(true);
      if (!isMuted) playAlarm();
      setLastCompletedSubject(activeSession.subjectId);
    }
  }, [activeSession?.isCompleted, showCompletionModal, isMuted]);

  const playAlarm = (retryCount = 0) => {
    if (alarmPlaying || isMuted) return;
    
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
            setAlarmPlaying(true);
            setTimeout(() => stopAlarm(), 30000); // 30s limit
          })
          .catch(e => {
            console.error('Alarm Error:', e);
            if (retryCount < 2) {
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
    if (isEditing) return;
    if (activeSession && activeSession.subjectId !== subjectId) {
      setShowSwitchDialog(chapterId);
    } else {
      setSelectedChapterId(chapterId);
    }
  };

  const confirmStartStudy = () => {
    if (selectedSubjectId && selectedChapterId) {
      startSession(selectedSubjectId, selectedChapterId, studyDuration);
      setSelectedChapterId(null);
    }
  };

  const calculateRemaining = () => {
    if (!activeSession) return 0;
    const elapsed = activeSession.accumulatedSeconds + (activeSession.isPaused ? 0 : Math.floor((Date.now() - activeSession.startTime) / 1000));
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

  const handleUpdateChapter = (chapterId: string) => {
    if (selectedSubjectId && editValue.trim()) {
      updateChapter(selectedSubjectId, chapterId, editValue);
      setEditingChapterId(null);
      setEditValue('');
    }
  };

  const handleAddChapter = () => {
    if (selectedSubjectId && newChapterTitle.trim()) {
      addChapter(selectedSubjectId, newChapterTitle);
      setNewChapterTitle('');
      setIsAddingChapter(false);
    }
  };

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

        <div className="flex items-center gap-2 md:gap-3 bg-[#F9F9F9] p-1.5 rounded-2xl md:rounded-3xl border border-secondary-50">
            {selectedSubjectId && (
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(!isEditing)}
                className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl p-0 ${isEditing ? 'bg-[#111111] text-[#F7E58D]' : 'bg-white text-[#111111]'}`}
              >
                <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            )}
            <Button 
               variant="ghost" 
               onClick={() => setIsMuted(!isMuted)}
               className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl p-0 ${isMuted ? 'text-red-500 bg-red-50' : 'text-[#111111] bg-white shadow-sm'}`}
            >
               {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
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
              <RotateCcw className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h3 className="text-xl md:text-2xl font-black text-[#111111] mb-2 md:mb-4">Switch Subject?</h3>
              <p className="text-secondary-500 font-bold text-xs md:text-sm mb-8 md:mb-10 leading-relaxed">
                You have an active session for <b>{activeSubject?.name}</b>. Switching will stop your current progress.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => { stopSession(); setSelectedChapterId(showSwitchDialog); setShowSwitchDialog(null); }}
                  className="h-14 md:h-16 bg-red-500 text-white font-black rounded-xl md:rounded-2xl w-full"
                >
                  Yes, Switch Now
                </Button>
                <Button variant="ghost" onClick={() => setShowSwitchDialog(null)} className="h-12 text-secondary-400 font-bold w-full">
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
            <div className={`bg-[#FFF9E8] border border-[#F7E58D]/30 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shadow-sm mb-4 ${alarmPlaying ? 'animate-pulse bg-red-50 border-red-200' : ''}`}>
              <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[1.5rem] bg-white flex items-center justify-center shadow-sm shrink-0">
                  {activeSubject && (() => {
                    const Icon = iconMap[activeSubject.iconName as keyof typeof iconMap] || Calculator;
                    return <Icon className="w-6 h-6 md:w-10 md:h-10 text-[#111111]" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#F7E58D] mb-0.5 md:mb-1">Studying</h4>
                   <p className="text-sm md:text-2xl font-black text-[#111111] leading-tight truncate">
                     {activeSubject?.chapters.find(c => c.id === activeSession.chapterId)?.title || activeSubject?.name}
                   </p>
                   {alarmPlaying && <p className="text-red-500 font-black text-[10px] uppercase animate-bounce mt-1">SESSION COMPLETE! STOP ALARM</p>}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 w-full md:w-auto border-t md:border-0 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                   <p className={`text-xl md:text-4xl font-black font-mono tracking-tighter ${alarmPlaying ? 'text-red-600' : 'text-[#111111]'}`}>
                     {formatTime(remainingTime)}
                   </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={activeSession.isPaused ? resumeSession : pauseSession}
                    disabled={activeSession.isCompleted}
                    className={`rounded-xl md:rounded-2xl w-10 h-10 md:w-16 md:h-16 flex items-center justify-center shadow-lg transition-transform active:scale-90 ${activeSession.isPaused ? 'bg-[#F7E58D] text-[#111111]' : 'bg-white border-2 border-[#F7E58D] text-[#111111]'}`}
                  >
                    {activeSession.isPaused ? <Play className="w-5 h-5 md:w-7 md:h-7 fill-current" /> : <Pause className="w-5 h-5 md:w-7 md:h-7 fill-current" />}
                  </Button>
                  <Button 
                    onClick={() => { stopAlarm(); stopSession(); }}
                    variant="ghost"
                    className="rounded-xl md:rounded-2xl w-10 h-10 md:w-16 md:h-16 bg-white/50 text-[#111111] hover:bg-red-50 hover:text-red-600 shadow-sm"
                  >
                    <X className="w-5 h-5 md:w-7 md:h-7" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedSubjectId ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-2">
          {subjects.map((s) => {
            const Icon = iconMap[s.iconName as keyof typeof iconMap] || Calculator;
            return (
              <motion.div 
                key={s.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSubjectId(s.id)}
                className="cursor-pointer bg-white border border-secondary-50 hover:border-[#F7E58D] rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex flex-col items-center text-center transition-all group shadow-sm hover:shadow-xl hover:shadow-[#F7E58D]/10 text-[#111111]"
              >
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-[#F3F3F3] text-secondary-400 group-hover:bg-[#F7E58D] group-hover:text-[#111111] flex items-center justify-center mb-3 md:mb-6 transition-all">
                  <Icon className="w-6 h-6 md:w-10 md:h-10 stroke-[2px]" />
                </div>
                <h3 className="font-black text-[11px] md:text-xl uppercase md:normal-case tracking-tight">{s.name}</h3>
                <p className="text-[9px] md:text-[11px] font-black text-secondary-400 mt-1.5 md:mt-3">
                  {s.chapters.length} Chapters
                </p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl md:rounded-[3.5rem] border border-secondary-100 p-5 md:p-12 shadow-sm mx-2">
           <div className="flex items-center justify-between mb-8 md:mb-14">
              <Button 
                variant="ghost" onClick={() => { setSelectedSubjectId(null); setIsEditing(false); }}
                className="text-secondary-400 font-bold hover:bg-secondary-50 p-2 h-auto flex items-center gap-2 text-xs md:text-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back
              </Button>
              {isEditing && (
                <Button 
                   onClick={() => setIsAddingChapter(true)}
                   className="bg-[#111111] text-[#F7E58D] font-black rounded-lg md:rounded-xl h-10 md:h-12 px-4 md:px-6 flex items-center gap-2 text-xs md:text-sm"
                >
                   <Plus className="w-4 h-4" /> Add Chapter
                </Button>
              )}
           </div>
           
           <div className="flex items-center gap-3 md:gap-6 mb-8 md:mb-14">
              <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-[#FFF9E8] flex items-center justify-center shrink-0">
                 {selectedSubject && (() => {
                    const Icon = iconMap[selectedSubject.iconName as keyof typeof iconMap] || Calculator;
                    return <Icon className="w-6 h-6 md:w-10 md:h-10 text-[#111111]" />;
                 })()}
              </div>
              <div>
                 <h2 className="text-xl md:text-4xl font-black text-[#111111] leading-tight">{selectedSubject?.name}</h2>
                 <p className="text-[11px] md:text-base font-bold text-secondary-400">
                    {isEditing ? 'Manage your syllabus flexibly.' : 'Choose a chapter to begin Focused Mode.'}
                 </p>
              </div>
           </div>

           <div className="grid gap-3 md:gap-5">
              {selectedSubject?.chapters.map((chapter, idx) => (
                <div 
                  key={chapter.id}
                  onClick={() => handleChapterClick(selectedSubject.id, chapter.id)}
                  className={`p-4 md:p-10 rounded-2xl md:rounded-[3rem] border md:border-2 transition-all flex items-center justify-between group ${selectedChapterId === chapter.id ? 'bg-[#FFF9E8] border-[#F7E58D]' : 'bg-white border-secondary-50 hover:border-[#F7E58D]'} ${!isEditing ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-3 md:gap-8 min-w-0 flex-1">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[1.25rem] bg-[#F9F9F9] text-secondary-300 font-black flex items-center justify-center text-sm md:text-2xl group-hover:bg-[#F7E58D] group-hover:text-[#111111] transition-all shrink-0">
                      {idx + 1}
                    </div>
                    {editingChapterId === chapter.id ? (
                      <div className="flex-1 flex gap-2">
                        <input 
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-white border border-[#F7E58D] rounded-lg px-3 py-2 w-full font-bold"
                        />
                        <Button onClick={() => handleUpdateChapter(chapter.id)} size="sm" className="bg-[#111111] text-white"><Save className="w-4 h-4" /></Button>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <h4 className="font-black text-[#111111] text-base md:text-2xl leading-none mb-1 md:mb-3 truncate">{chapter.title}</h4>
                        <p className="text-secondary-400 text-[10px] md:text-sm font-bold leading-tight truncate">{chapter.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-6 ml-4">
                    {isEditing ? (
                       <div className="flex gap-2">
                          <Button 
                            variant="ghost" onClick={() => { setEditingChapterId(chapter.id); setEditValue(chapter.title); }}
                            className="text-secondary-300 hover:text-[#111111]"
                          >
                             <Edit3 className="w-4 h-4 md:w-6 md:h-6" />
                          </Button>
                          <Button 
                             variant="ghost" onClick={() => removeChapter(selectedSubject.id, chapter.id)}
                             className="text-secondary-100 hover:text-red-500"
                          >
                             <Trash2 className="w-4 h-4 md:w-6 md:h-6" />
                          </Button>
                       </div>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          startSession(selectedSubject.id, chapter.id, 120);
                        }}
                        className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-[#111111] text-[#F7E58D] flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        <Play className="w-4 h-4 md:w-7 md:h-7 fill-current ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isAddingChapter && (
                <div className="p-4 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-dashed border-[#F7E58D] bg-[#FFF9E8]/30 flex flex-col md:flex-row gap-4 items-center">
                   <input 
                      placeholder="Enter new chapter title..."
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      className="flex-1 bg-white border border-[#F7E58D] rounded-xl px-4 py-3 md:py-4 font-black w-full"
                   />
                   <div className="flex gap-2 w-full md:w-auto">
                      <Button onClick={handleAddChapter} className="flex-1 md:flex-none h-12 md:h-14 bg-[#111111] text-white px-8 rounded-xl font-black">Add</Button>
                      <Button variant="ghost" onClick={() => setIsAddingChapter(false)} className="h-12 md:h-14 text-secondary-400">Cancel</Button>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Chapter Interaction Dialogs */}
      <AnimatePresence>
        {selectedChapterId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#111111]/40 backdrop-blur-md">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
               className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl"
             >
                <div className="flex justify-between items-start mb-8">
                   <div className="w-16 h-16 bg-[#FFF9E8] rounded-2xl flex items-center justify-center text-[#111111]">
                      <BookOpen className="w-8 h-8" />
                   </div>
                   <Button variant="ghost" onClick={() => setSelectedChapterId(null)} className="rounded-full w-10 h-10 p-0 text-secondary-300">
                      <X className="w-6 h-6" />
                   </Button>
                </div>
                <h3 className="text-2xl font-black text-[#111111] mb-2">
                   {selectedSubject?.chapters.find(c => c.id === selectedChapterId)?.title}
                </h3>
                <p className="text-secondary-500 font-bold text-sm mb-10 leading-relaxed">
                   Set your focus duration. A reliable alarm will trigger once the timer reaches zero.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-10">
                   {[15, 30, 60, 120].map((mins) => (
                      <button 
                         key={mins}
                         onClick={() => setStudyDuration(mins)}
                         className={`h-16 rounded-[1.5rem] font-black transition-all border-2 ${studyDuration === mins ? 'bg-[#F7E58D] border-[#F7E58D] text-[#111111] shadow-xl shadow-[#F7E58D]/20' : 'bg-[#F9F9F9] border-transparent text-secondary-400 hover:border-[#F7E58D]'}`}
                      >
                         {mins >= 60 ? `${Math.floor(mins/60)} Hour${mins > 60 ? 's' : ''}` : `${mins} Mins`}
                      </button>
                   ))}
                </div>
                <Button onClick={confirmStartStudy} className="w-full h-20 bg-[#111111] text-white font-black rounded-3xl text-xl hover:bg-black uppercase shadow-2xl flex items-center justify-center gap-3 active:scale-95">
                   <Play className="w-6 h-6 fill-current" /> Start Session
                </Button>
             </motion.div>
          </div>
        )}

        {showCompletionModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#111111]/70 backdrop-blur-2xl">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[4.5rem] p-12 max-w-md w-full shadow-3xl text-center">
              <CheckCircle2 className="w-20 h-20 text-[#F7E58D] mx-auto mb-10" />
              <h3 className="text-4xl font-black text-[#111111] mb-4">Session Complete 🎉</h3>
              <p className="text-secondary-500 font-bold text-xl mb-12">
                Incredible work! You've mastered {subjects.find(s => s.id === lastCompletedSubject)?.name}.
              </p>
              <div className="flex flex-col gap-4">
                <Button onClick={() => { setShowCompletionModal(false); stopAlarm(); stopSession(); setSelectedSubjectId(null); }} className="bg-[#111111] text-white font-black rounded-[3rem] h-20 text-xl hover:bg-black w-full">Next Subject</Button>
                <Button variant="ghost" onClick={() => { setShowCompletionModal(false); stopAlarm(); stopSession(); }} className="text-secondary-400 font-black h-16 flex items-center justify-center gap-3 hover:bg-[#F3F3F3] rounded-[3rem]"><Coffee className="w-6 h-6" /> Take a Break</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
