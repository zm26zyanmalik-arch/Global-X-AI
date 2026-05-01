import { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { useAppStore } from '../store/useAppStore';
import { CheckCircle2, PlayCircle, Trophy, Target, AlertCircle, Sparkles, ChevronRight, X, Timer, Zap, BarChart3, Star, Lock, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy, where, onSnapshot } from 'firebase/firestore';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface TestTemplate {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  timeMins: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

interface TestResult {
  id: string;
  templateId: string;
  title: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: any;
  resultAvailableAt: any;
  status: 'pending' | 'ready';
}

// Intelligent Question Pool (Subset for demo, typically would be larger)
const questionPool: Record<string, Record<string, Question[]>> = {
  '9': {
    'Mathematics': [
      { id: 'm1', text: 'What is the value of (x + y)²?', options: ['x² + y²', 'x² + 2xy + y²', 'x² - 2xy + y²', 'x² + xy + y²'], correctAnswer: 1 },
      { id: 'm2', text: 'In a circle, what is the ratio of circumference to diameter?', options: ['π', '2π', 'π/2', 'r'], correctAnswer: 0 },
      { id: 'm3', text: 'Solve for x: 3x - 5 = 10', options: ['3', '5', '15', '30'], correctAnswer: 1 },
      { id: 'm4', text: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '360°', '270°'], correctAnswer: 1 },
      { id: 'm5', text: 'Which of the following is a prime number?', options: ['9', '15', '21', '23'], correctAnswer: 3 },
    ],
    'Science': [
      { id: 's1', text: 'Which organelle is known as the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi complex'], correctAnswer: 1 },
      { id: 's2', text: 'What is the chemical symbol for Gold?', options: ['Ag', 'Gd', 'Au', 'Fe'], correctAnswer: 2 },
      { id: 's3', text: 'Newton\'s first law is also known as the Law of?', options: ['Gravity', 'Inertia', 'Action', 'Motion'], correctAnswer: 1 },
      { id: 's4', text: 'What gas do plants primarily absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 2 },
      { id: 's5', text: 'What is the unit of force in the SI system?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correctAnswer: 2 },
    ]
  },
  '8': {
    'Mathematics': [
      { id: 'm4_8', text: 'What is the square root of 144?', options: ['12', '14', '16', '18'], correctAnswer: 0 },
      { id: 'm5_8', text: 'A triangle with all sides equal is called?', options: ['Isosceles', 'Scalene', 'Equilateral', 'Right'], correctAnswer: 2 },
      { id: 'm6_8', text: 'Solve 2x = 10', options: ['2', '5', '10', '20'], correctAnswer: 1 },
      { id: 'm7_8', text: 'What is 15% of 200?', options: ['15', '30', '45', '60'], correctAnswer: 1 },
      { id: 'm8_8', text: 'What is the area of a rectangle with length 5 and width 4?', options: ['9', '18', '20', '25'], correctAnswer: 2 },
    ],
    'Science': [
      { id: 's1_8', text: 'What is the boiling point of water?', options: ['50°C', '90°C', '100°C', '120°C'], correctAnswer: 2 },
      { id: 's2_8', text: 'Light year is a unit of?', options: ['Time', 'Distance', 'Speed', 'Mass'], correctAnswer: 1 },
      { id: 's3_8', text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctAnswer: 2 },
      { id: 's4_8', text: 'What is the primary source of energy for the Earth?', options: ['Moon', 'Stars', 'Sun', 'Geothermal'], correctAnswer: 2 },
      { id: 's5_8', text: 'Sound cannot travel through?', options: ['Solid', 'Liquid', 'Gas', 'Vacuum'], correctAnswer: 3 },
    ]
  }
};

const templates: TestTemplate[] = [
  { id: 'math-basic', title: 'Algebra Fundamentals', subject: 'Mathematics', questions: [], timeMins: 30, difficulty: 'Medium', points: 100 },
  { id: 'bio-basic', title: 'Cell Biology Quiz', subject: 'Science', questions: [], timeMins: 15, difficulty: 'Hard', points: 150 },
  { id: 'physics-forces', title: 'Forces & Energy', subject: 'Science', questions: [], timeMins: 20, difficulty: 'Medium', points: 120 },
];

export default function TestsScreen() {
  const { user, progress } = useAppStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [takingTest, setTakingTest] = useState<TestTemplate | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'testResults'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedResults = snapshot.docs.map(doc => {
         const data = doc.data();
         const now = new Date();
         const availableAt = data.resultAvailableAt?.toDate();
         return {
            id: doc.id,
            ...data,
            status: availableAt && availableAt > now ? 'pending' : 'ready'
         };
      }) as TestResult[];
      setResults(fetchedResults);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'testResults');
    });

    return () => unsubscribe();
  }, []);

  const [autoTest, setAutoTest] = useState<TestTemplate | null>(null);

  // Enhanced generator that picks a subject based on activity
  const generateAutoTest = (studentClass: string): TestTemplate => {
      const subjects = Object.keys(questionPool[studentClass] || {});
      const subject = subjects[Math.floor(Math.random() * subjects.length)] || 'Mathematics';
      
      const pool = questionPool[studentClass]?.[subject] || [];
      const questions = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);

      return {
         id: `auto-test-${Date.now()}`,
         title: `Your 2-Day ${subject} Review`,
         subject: subject,
         questions: questions,
         timeMins: 10,
         difficulty: 'Medium',
         points: 200
      };
  };

  useEffect(() => {
    if (results.length === 0) return;
    
    const last = results[0].submittedAt?.toDate();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    if (last < twoDaysAgo) {
      setAutoTest(generateAutoTest(user?.class || '9'));
    }
  }, [results, user]);
  const availableTemplates = useMemo(() => {
    const userClass = user?.class || '9';
    let templatesToUse = templates.map(t => {
       const pool = questionPool[userClass]?.[t.subject] || [];
       return { ...t, questions: pool };
    }).filter(t => t.questions.length > 0);
    
    if (autoTest) {
        templatesToUse = [autoTest, ...templatesToUse];
    }
    return templatesToUse;
  }, [user, autoTest]);

  const startTest = (template: TestTemplate) => {
    setTakingTest(template);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeLeft(template.timeMins * 60);
  };

  useEffect(() => {
    let timer: any;
    if (takingTest && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && takingTest) {
      submitTest();
    }
    return () => clearInterval(timer);
  }, [takingTest, timeLeft]);

  const submitTest = async () => {
    if (!takingTest || !auth.currentUser) return;

    let correct = 0;
    takingTest.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });

    const score = Math.round((correct / takingTest.questions.length) * 100);
    const now = new Date();
    const availableAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour delay

    const resultData = {
      userId: auth.currentUser.uid,
      templateId: takingTest.id,
      title: takingTest.title,
      subject: takingTest.subject,
      score,
      totalQuestions: takingTest.questions.length,
      correctAnswers: correct,
      submittedAt: serverTimestamp(),
      resultAvailableAt: availableAt,
    };

    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'testResults'), resultData);
      setLastScore(score);
      setTakingTest(null);
      setShowCelebration(true);
      setActiveTab('completed');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'testResults');
    }
  };

  const stats = useMemo(() => [
    { label: 'Rank', value: `Level ${Math.floor((progress?.points || 0) / 100) + 1}`, icon: Star, color: '#F7E58D' },
    { label: 'Avg Score', value: `${results.length ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length) : 0}%`, icon: BarChart3, color: '#111111' },
    { label: 'Solved', value: results.length.toString(), icon: CheckCircle2, color: '#111111' },
  ], [progress, results]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 md:space-y-12 h-full pb-24 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8">
         <div className="w-full">
            <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-2xl md:text-5xl font-black tracking-tight text-[#111111] flex items-center gap-3 md:gap-5">
               Test Center <div className="w-8 h-8 md:w-14 md:h-14 rounded-full bg-[#111111] flex items-center justify-center shrink-0"><Target className="w-4 h-4 md:w-7 md:h-7 text-[#F7E58D]" /></div>
            </motion.h1>
            <p className="text-secondary-500 font-bold text-[10px] md:text-base mt-1 md:mt-4 flex items-center gap-2 px-1">
               <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-[#F7E58D]" /> Official Class {user?.class || '9'} Curriculum Assessments.
            </p>
         </div>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
         {stats.map((stat, i) => (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className={`bg-white border-2 border-secondary-50 rounded-2xl md:rounded-[3rem] p-4 md:p-10 flex flex-col items-center text-center group hover:border-[#F7E58D] transition-all shadow-sm ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}>
              <div className="w-10 h-10 md:w-18 md:h-18 rounded-xl md:rounded-2xl bg-[#F9F9F9] flex items-center justify-center mb-2 md:mb-6 group-hover:bg-[#F7E58D] group-hover:text-[#111111] transition-all shrink-0">
                 <stat.icon className="w-5 h-5 md:w-8 md:h-8" />
              </div>
              <div className="text-xl md:text-4xl font-black text-[#111111] leading-none mb-1 tracking-tighter">{stat.value}</div>
              <p className="text-secondary-400 font-black text-[8px] md:text-xs uppercase tracking-widest leading-none">{stat.label}</p>
           </motion.div>
         ))}
      </div>

      {/* Tabs Menu */}
      <div className="bg-[#F9F9F9] p-1 md:p-2 rounded-xl md:rounded-[2.5rem] border-2 border-secondary-50 flex max-w-xs md:max-w-md mx-auto shadow-inner">
         <button onClick={() => setActiveTab('upcoming')} className={`flex-1 py-3 md:py-5 rounded-lg md:rounded-[2rem] text-[9px] md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'upcoming' ? 'bg-[#111111] text-white shadow-2xl' : 'text-secondary-400 hover:text-[#111111]'}`}>Upcoming</button>
         <button onClick={() => setActiveTab('completed')} className={`flex-1 py-3 md:py-5 rounded-lg md:rounded-[2rem] text-[9px] md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'completed' ? 'bg-[#111111] text-white shadow-2xl' : 'text-secondary-400 hover:text-[#111111]'}`}>Completed</button>
      </div>

      {/* Test Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
         <AnimatePresence mode="popLayout">
            {activeTab === 'upcoming' ? (
              availableTemplates.map((test, i) => (
                <motion.div key={test.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={() => startTest(test)} className="cursor-pointer group relative bg-white border-2 border-secondary-50 hover:border-[#F7E58D] rounded-[2rem] md:rounded-[4rem] p-6 md:p-14 transition-all shadow-sm hover:shadow-2xl hover:shadow-[#F7E58D]/10 overflow-hidden">
                   <div className="flex justify-between items-start mb-6 md:mb-10">
                      <div className="bg-[#F9F9F9] rounded-xl px-4 py-2 text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] border border-secondary-50 flex items-center gap-2"><Zap className="w-3 h-3 text-[#F7E58D]" /> {test.subject}</div>
                      <div className="text-[10px] font-black text-[#111111] uppercase tracking-widest bg-[#FFF9E8] px-4 py-2 rounded-full border border-[#F7E58D]/30">+{test.points} PTS</div>
                   </div>
                   <h3 className="text-xl md:text-4xl font-black text-[#111111] mb-5 md:mb-10 leading-tight">{test.title}</h3>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-secondary-400 font-black uppercase text-[10px] tracking-widest"><Timer className="w-4 h-4" /> {test.timeMins}m Duration</div>
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-[#111111] flex items-center justify-center text-[#F7E58D] shadow-xl group-hover:scale-110 transition-transform"><PlayCircle className="w-5 h-5 md:w-8 md:h-8" /></div>
                   </div>
                </motion.div>
              ))
            ) : (
              results.map((result, i) => (
                <motion.div key={result.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border-2 border-secondary-50 rounded-[2rem] md:rounded-[4rem] p-6 md:p-14 overflow-hidden relative group">
                  {result.status === 'pending' && (
                    <div className="absolute inset-0 bg-[#111111]/5 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <div className="bg-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border-2 border-[#F7E58D]">
                        <Clock className="w-6 h-6 text-[#111111] animate-pulse" />
                        <span className="font-black text-[#111111] uppercase tracking-widest text-xs">Processing Results...</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-[#F9F9F9] rounded-xl px-4 py-2 text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">{result.subject}</div>
                    {result.status === 'ready' && (
                      <div className="bg-[#111111] text-[#F7E58D] font-black px-4 py-2 rounded-full text-lg flex items-center gap-2"><Trophy className="w-4 h-4" /> {result.score}%</div>
                    )}
                  </div>
                  <h3 className="text-xl md:text-3xl font-black text-[#111111] mb-4">{result.title}</h3>
                  <div className="flex items-center gap-2 text-secondary-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Analyzed {result.correctAnswers}/{result.totalQuestions} correct.
                  </div>
                </motion.div>
              ))
            )}
            {activeTab === 'completed' && results.length === 0 && !loading && (
               <div className="col-span-full py-20 text-center opacity-50">
                  <Target className="w-20 h-20 mx-auto mb-6 text-secondary-200" />
                  <h3 className="text-2xl font-black text-[#111111]">No Assessments Found</h3>
               </div>
            )}
         </AnimatePresence>
      </div>

      {/* Test Taking Simulator */}
      <AnimatePresence>
         {takingTest && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12 bg-[#111111]/95 backdrop-blur-3xl overflow-y-auto">
               <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="bg-white rounded-none md:rounded-[3rem] lg:rounded-[5rem] w-full h-full md:h-auto max-w-5xl shadow-3xl overflow-hidden flex flex-col relative">
                  <div className="p-5 md:p-12 border-b-2 border-secondary-50 flex items-center justify-between bg-white shrink-0">
                     <div className="flex items-center gap-3 md:gap-8">
                        <Button variant="ghost" onClick={() => setTakingTest(null)} className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-secondary-50 text-secondary-400 p-0 hover:bg-red-50 hover:text-red-500 shrink-0"><X className="w-5 h-5 md:w-7 md:h-7" /></Button>
                        <div>
                           <h4 className="text-sm md:text-3xl font-black text-[#111111] leading-none mb-0.5 md:mb-1">{takingTest.title}</h4>
                           <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-[#F7E58D]">{takingTest.subject}</span>
                        </div>
                     </div>
                     <div className="bg-[#111111] text-white px-4 md:px-10 py-2 md:py-6 rounded-xl md:rounded-[2rem] flex items-center gap-2 md:gap-6 shadow-2xl shrink-0">
                        <Timer className={`w-4 h-4 md:w-8 md:h-8 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#F7E58D]'}`} />
                        <span className="font-mono text-base md:text-3xl font-black tracking-tighter">{formatTime(timeLeft)}</span>
                     </div>
                  </div>

                  <div className="p-6 md:p-16 lg:p-24 flex-1 overflow-y-auto bg-[#F9F9F9]/50">
                     <div className="max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 md:gap-6 mb-8 md:mb-16 text-secondary-400 font-black uppercase text-[8px] md:text-xs tracking-[0.3em]">
                           <span className="shrink-0">Question {currentQuestionIndex + 1} of {takingTest.questions.length}</span>
                           <div className="flex-1 h-1.5 md:h-2.5 bg-secondary-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#111111] transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / takingTest.questions.length) * 100}%` }} />
                           </div>
                        </div>

                        <h2 className="text-xl md:text-4xl font-black text-[#111111] mb-8 md:mb-16 leading-tight">
                           {takingTest.questions[currentQuestionIndex].text}
                        </h2>

                        <div className="grid gap-3 md:gap-5">
                           {takingTest.questions[currentQuestionIndex].options.map((opt, i) => (
                              <button key={i} onClick={() => { const a = [...answers]; a[currentQuestionIndex] = i; setAnswers(a); }} className={`group flex items-center gap-4 md:gap-8 p-5 md:p-10 rounded-2xl md:rounded-[3rem] border-2 transition-all text-left shadow-sm ${answers[currentQuestionIndex] === i ? 'border-[#111111] bg-[#111111] text-white' : 'border-secondary-100 bg-white hover:border-[#F7E58D]'}`}>
                                 <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-secondary-50 flex items-center justify-center font-black text-sm md:text-2xl shrink-0 ${answers[currentQuestionIndex] === i ? 'bg-white/20 text-white' : 'text-[#111111]'}`}>
                                    {String.fromCharCode(65 + i)}
                                 </div>
                                 <span className="text-sm md:text-2xl font-black">{opt}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="p-5 md:p-12 border-t-2 border-secondary-50 bg-white flex items-center justify-between shrink-0">
                     <Button variant="ghost" onClick={() => setTakingTest(null)} className="h-12 md:h-20 px-6 md:px-12 rounded-xl rounded-[2rem] font-black text-secondary-400 uppercase tracking-widest text-[9px] md:text-sm">Quit Test</Button>
                     <Button 
                        disabled={answers[currentQuestionIndex] === undefined}
                        onClick={() => { if (currentQuestionIndex < takingTest.questions.length - 1) { setCurrentQuestionIndex(p => p + 1); } else { submitTest(); } }}
                        className="h-14 md:h-24 px-8 md:px-16 rounded-2xl md:rounded-[2.5rem] bg-[#111111] text-white font-black hover:bg-black uppercase tracking-widest shadow-2xl flex items-center gap-3 md:gap-6 transition-transform active:scale-95 text-[10px] md:text-lg disabled:opacity-50"
                     >
                        {currentQuestionIndex < takingTest.questions.length - 1 ? 'Next Question' : 'Submit Final'} <ChevronRight className="w-4 h-4 md:w-8 md:h-8" />
                     </Button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Results Celebration */}
      <AnimatePresence>
         {showCelebration && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-[#111111]/95 backdrop-blur-3xl">
               <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] md:rounded-[5rem] p-8 md:p-20 max-w-lg w-full shadow-3xl text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#F7E58D]/5 pointer-events-none" />
                  <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="w-20 h-20 md:w-40 md:h-40 bg-[#F7E58D] rounded-full flex items-center justify-center mx-auto mb-8 md:mb-14 shadow-3xl shadow-[#F7E58D]/40 shrink-0">
                     <Trophy className="w-10 h-10 md:w-20 md:h-20 text-[#111111] stroke-[2.5px]" />
                  </motion.div>
                  <h3 className="text-2xl md:text-5xl font-black text-[#111111] mb-3 md:mb-6 text-center leading-tight tracking-tight">Assessment Locked! 🎉</h3>
                  <div className="text-4xl md:text-8xl font-black text-[#111111] mb-4 md:mb-10 tracking-tighter">{lastScore}%</div>
                  <p className="text-secondary-500 font-bold text-sm md:text-xl mb-10 md:mb-16 leading-relaxed opacity-80">
                     Your intelligence map has been updated. Result analysis will be available in 60 minutes for deeper review.
                  </p>
                  <Button onClick={() => setShowCelebration(false)} className="h-16 md:h-24 bg-[#111111] text-white font-black rounded-2xl md:rounded-[2.5rem] text-base md:text-2xl hover:bg-black w-full shadow-2xl">Return to Center</Button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
