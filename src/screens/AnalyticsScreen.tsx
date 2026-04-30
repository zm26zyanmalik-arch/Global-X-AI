import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { useAppStore } from '../store/useAppStore';
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Clock, Award, Brain, Flame, Target, Sparkles, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { getStudySessions, StudySessionLog } from '../services/analyticsService';

interface TestResult {
  id: string;
  subject: string;
  score: number;
  submittedAt: any;
}

const subjectNames: Record<string, { label: string, color: string }> = {
  Maths: { label: 'Mathematics', color: '#F7E58D' },
  Science: { label: 'Science', color: '#111111' },
  English: { label: 'English', color: '#EAEAEA' },
  Hindi: { label: 'Hindi', color: '#F7E58D' },
  Social: { label: 'Social Science', color: '#111111' },
  Computer: { label: 'Computer', color: '#EAEAEA' },
};

const ProgressRing = ({ progress, size = 180, strokeWidth = 16, color = "#F7E58D", label }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative group select-none">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle stroke="#F3F3F3" fill="transparent" strokeWidth={strokeWidth} r={radius} cx={size / 2} cy={size / 2} />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "circOut" }}
          stroke={color} fill="transparent" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference}
          r={radius} cx={size / 2} cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="text-4xl font-black text-[#111111] tracking-tighter leading-none">{label}</span>
        <span className="font-black text-[#F7E58D] text-[10px] uppercase tracking-[0.2em] mt-1">Growth</span>
      </div>
    </div>
  );
};

export default function AnalyticsScreen() {
  const { user, progress } = useAppStore();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!auth.currentUser) return;
      
      const resultsRef = collection(db, 'users', auth.currentUser.uid, 'testResults');
      const q = query(resultsRef, orderBy('submittedAt', 'desc'), limit(10));
      
      try {
        const [querySnapshot, sessions] = await Promise.all([
            getDocs(q),
            getStudySessions(auth.currentUser.uid)
        ]);

        const results = querySnapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data()
        })) as TestResult[];
        setTestResults(results);

        // Compute actual activity data from sessions
        const activityMap: Record<string, number> = {};
        sessions.forEach(s => {
            const date = new Date(s.createdAt.toDate());
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            activityMap[dayName] = (activityMap[dayName] || 0) + Math.floor(s.durationSeconds / 60);
        });

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyData = days.map(day => ({
           name: day,
           mins: activityMap[day] || 0
        }));
        setAnalyticsData(weeklyData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    }

    fetchAnalytics();
  }, [user]);

  const smartFeedback = useMemo(() => {
    if (!user) return "Authenticating brain profile...";
    
    const messages = [];
    if (progress.streak >= 5) messages.push("Outstanding consistency! Flame is roaring. Keep this daily momentum.");
    else if (progress.streak === 0) messages.push("Your consistency is low. Try to study at least 20 mins daily to rebuild your streak.");
    
    if (testResults.length > 0) {
      const avgScore = testResults.reduce((acc, curr) => acc + curr.score, 0) / testResults.length;
      if (avgScore >= 80) messages.push("Your assessment scores are elite. Focus on tougher topics to keep scaling.");
      else if (avgScore < 50) messages.push("Assessment scores show room for growth. Re-read the weak chapters before retrying tests.");
    } else {
      messages.push("No tests attempted yet. Take a quick quiz to map your progress!");
    }

    if (progress.timeStudiedMins < 60) messages.push("Beginner's pace. Aim for 2 hours this week to unlock Silver badge.");

    return messages[Math.floor(Math.random() * messages.length)];
  }, [user, progress, testResults]);

  const subjectMastery = useMemo(() => {
     // Aggregate scores by subject
     const stats: Record<string, { total: number, count: number }> = {};
     testResults.forEach(r => {
        if (!stats[r.subject]) stats[r.subject] = { total: 0, count: 0 };
        stats[r.subject].total += r.score;
        stats[r.subject].count += 1;
     });

     return Object.entries(subjectNames).map(([id, meta]) => {
        const s = stats[id];
        return {
           subject: meta.label,
           mastery: s ? Math.round(s.total / s.count) : 0,
           color: meta.color
        };
     }).sort((a, b) => b.mastery - a.mastery);
  }, [testResults]);

  const totalEfficiency = Math.min(100, Math.round((progress?.timeStudiedMins || 0) / 10)); // Scaled for target 1000 mins

  return (
    <div className="space-y-6 md:space-y-12 h-full pb-24 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8">
         <div className="w-full">
            <motion.h1 
               initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
               className="text-2xl md:text-5xl font-black tracking-tight text-[#111111] flex items-center gap-3 md:gap-5"
            >
               Performance Hub <div className="w-8 h-8 md:w-14 md:h-14 rounded-full bg-[#111111] flex items-center justify-center shrink-0"><TrendingUp className="w-4 h-4 md:w-7 md:h-7 text-[#F7E58D]" /></div>
            </motion.h1>
            <p className="text-secondary-500 font-bold text-[10px] md:text-base mt-1 md:mt-3 tracking-wide px-1">Real-time metrics and brain-mapping analytics.</p>
         </div>
      </div>

      {/* Smart Feedback Banner */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-[#111111] text-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl relative overflow-hidden group"
      >
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7E58D]/20 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
         <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-[#F7E58D] flex items-center justify-center shrink-0 shadow-3xl">
               <Sparkles className="w-10 md:w-16 h-10 md:h-16 text-[#111111]" />
            </div>
            <div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#F7E58D] text-[#111111] px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl">AI Feedback</div>
                  <span className="text-secondary-400 font-bold text-xs">Updated just now</span>
               </div>
               <p className="text-xl md:text-3xl font-black leading-tight max-w-2xl">{smartFeedback}</p>
            </div>
         </div>
      </motion.div>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-8">
        {/* Total Progress Card */}
        <div className="md:col-span-1 lg:col-span-4 bg-white border-2 border-secondary-50 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
           <h3 className="text-[9px] md:text-xs font-black text-[#111111] uppercase tracking-[0.4em] mb-8 md:mb-14 relative z-10">Study Velocity</h3>
           <div className="relative z-10 scale-75 md:scale-100">
              <ProgressRing 
                 progress={totalEfficiency} 
                 label={`${totalEfficiency}%`} 
                 color="#111111" 
              />
           </div>
           <p className="text-secondary-400 font-bold text-center mt-8 md:mt-14 max-w-[140px] md:max-w-[200px] text-[10px] md:text-lg leading-relaxed relative z-10">
              Current learning pace is <span className="text-[#111111]">{totalEfficiency > 50 ? 'High' : 'Steady'}</span>.
           </p>
        </div>

        {/* Consistency Graph */}
        <div className="md:col-span-1 lg:col-span-8 bg-white border-2 border-secondary-50 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-14 flex flex-col hover:border-[#F7E58D]/30 transition-all shadow-sm">
           <div className="flex items-center justify-between mb-6 md:mb-12">
              <div>
                 <h4 className="font-black text-xl md:text-3xl text-[#111111]">Daily Activity</h4>
                 <p className="text-secondary-400 font-black text-[8px] md:text-xs uppercase tracking-widest mt-1">Study minutes pattern</p>
              </div>
           </div>
           
           <div className="flex-1 min-h-[220px] md:min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F7E58D" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#F7E58D" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#EAEAEA" />
                    <Tooltip 
                       contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: '#111111', color: '#FFF', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="mins" stroke="#111111" strokeWidth={4} fillOpacity={1} fill="url(#colorMins)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Streak Stats */}
        <div className="md:col-span-1 lg:col-span-6 bg-[#EAEAEA]/30 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 flex items-center gap-8 group">
           <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform shrink-0">
              <Flame className="w-8 md:w-12 h-8 md:h-12 text-[#111111] fill-current" />
           </div>
           <div>
              <div className="text-4xl md:text-7xl font-black text-[#111111] leading-none mb-2">{progress?.streak || 0}</div>
              <p className="text-secondary-400 font-black text-[10px] md:text-xs uppercase tracking-widest">Active Study Streak</p>
           </div>
        </div>

        <div className="md:col-span-1 lg:col-span-6 bg-[#F9F9F9] rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 flex items-center gap-8 group border-2 border-secondary-50">
           <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform shrink-0">
              <Award className="w-8 md:w-12 h-8 md:h-12 text-[#111111]" />
           </div>
           <div>
              <div className="text-4xl md:text-7xl font-black text-[#111111] leading-none mb-2">{Math.round((progress?.points || 0) / 100)}</div>
              <p className="text-secondary-400 font-black text-[10px] md:text-xs uppercase tracking-widest">Current Rank Level</p>
           </div>
        </div>

        {/* Subject Mastery List */}
        <div className="md:col-span-2 lg:col-span-12 bg-white border-2 border-secondary-50 rounded-[3rem] md:rounded-[4rem] p-8 md:p-16">
           <div className="flex items-center justify-between mb-12">
              <h4 className="font-black text-2xl md:text-4xl text-[#111111]">Skill Distribution</h4>
              <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-secondary-400">Based on Test Results</div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              {subjectMastery.map((s, i) => (
                <div key={i} className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="font-black text-[#111111] text-sm md:text-base uppercase tracking-widest">{s.subject}</span>
                      <span className="font-black text-[#111111] text-lg md:text-3xl">{s.mastery}%</span>
                   </div>
                   <div className="h-3 md:h-6 w-full bg-[#F3F3F3] rounded-full overflow-hidden p-1 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${s.mastery || 1}%` }} transition={{ duration: 1.5, delay: i*0.1 }}
                        className="h-full rounded-full shadow-lg" style={{ backgroundColor: s.color }} 
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
