import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  class: string;
  teacherPreference: 'Rohan' | 'Priya';
  language: string;
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
  speechRate?: number;
}

export interface SubjectProgress {
  subjectId: string;
  timeStudiedSeconds: number;
  targetSeconds: number;
  lastStudyDate: string;
}

export interface Progress {
  points: number;
  streak: number;
  chaptersCompleted: number;
  timeStudiedMins: number;
  subjectProgress?: Record<string, SubjectProgress>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

export interface StudySession {
  subjectId: string;
  chapterId: string;
  startTime: number;
  accumulatedSeconds: number;
  isPaused: boolean;
  targetSeconds: number;
  isCompleted?: boolean;
}

export interface PlannerTask {
  id: string;
  subjectId: string;
  chapterId: string;
  scheduledTime: string;
  durationMins: number;
  status: 'pending' | 'completed';
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
}

export interface Subject {
  id: string;
  name: string;
  iconName: string;
  chapters: Chapter[];
}

export interface RankEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  class: string;
  isUser?: boolean;
}

interface AppStore {
  user: User;
  progress: Progress;
  chatHistory: ChatMessage[];
  isAuthReady: boolean;
  activeSession: StudySession | null;
  planner: PlannerTask[];
  subjects: Subject[];
  rankings: RankEntry[];
  setAuthReady: (ready: boolean) => void;
  setUser: (user: User) => void;
  setProgress: (progress: Progress) => void;
  logout: () => void;
  addProgress: (mins: number, chapters: number, points: number) => void;
  updateSubjectProgress: (subjectId: string, elapsedSeconds: number) => void;
  setChatHistory: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  clearChatHistory: () => void;
  startSession: (subjectId: string, chapterId?: string, durationMins?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  tickSession: () => void;
  updatePlanner: (tasks: PlannerTask[]) => void;
  generatePlanner: (studentClass: string) => void;
  completeTask: (taskId: string) => void;
  updateUser: (data: Partial<User>) => void;
  restoreData: (progress: Progress, chatHistory: ChatMessage[], planner: PlannerTask[]) => void;
  // Subject/Chapter methods
  addChapter: (subjectId: string, title: string) => void;
  removeChapter: (subjectId: string, chapterId: string) => void;
  updateChapter: (subjectId: string, chapterId: string, title: string) => void;
  updateRankings: () => void;
}

const defaultSubjects: Subject[] = [
  { 
    id: 'math', 
    name: 'Mathematics', 
    iconName: 'Calculator', 
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
    iconName: 'Microscope', 
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
    iconName: 'BookA', 
    chapters: [
      { id: 'e1', title: 'Tenses', description: 'Past, Present, and Future', estimatedTime: '45m' },
      { id: 'e2', title: 'Vocabulary building', description: 'New words everyday', estimatedTime: '30m' },
      { id: 'e3', title: 'Reading Skills', description: 'Comprehension strategies', estimatedTime: '60m' },
    ]
  },
  { 
    id: 'hindi', 
    name: 'Hindi', 
    iconName: 'Languages', 
    chapters: [
      { id: 'h1', title: 'Varnmala', description: 'The Hindi alphabet', estimatedTime: '30m' },
      { id: 'h2', title: 'Grammar Basics', description: 'Sangya and Sarvanaam', estimatedTime: '45m' },
    ]
  },
  { 
    id: 'social', 
    name: 'Social Science', 
    iconName: 'Globe', 
    chapters: [
      { id: 'ss1', title: 'History Basics', description: 'Timeline of civilizations', estimatedTime: '60m' },
      { id: 'ss2', title: 'Geography Basics', description: 'Maps and climates', estimatedTime: '45m' },
      { id: 'ss3', title: 'Constitution', description: 'Understanding laws', estimatedTime: '90m' },
    ]
  },
  { 
    id: 'computer', 
    name: 'Computer', 
    iconName: 'FileText', 
    chapters: [
      { id: 'c1', title: 'AI Basics', description: 'Introduction to Artificial Intelligence', estimatedTime: '45m' },
      { id: 'c2', title: 'Internet Safety', description: 'Stay safe online', estimatedTime: '30m' },
      { id: 'c3', title: 'Coding Intro', description: 'Basic programming concepts', estimatedTime: '90m' },
    ]
  },
];

const initialProgress: Progress = {
  points: 100,
  streak: 1,
  chaptersCompleted: 0,
  timeStudiedMins: 0,
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const defaultUser: User = {
  id: generateUUID(),
  name: 'Student',
  email: 'student@example.com',
  class: '9',
  teacherPreference: 'Priya',
  language: 'English',
  soundEnabled: true,
  notificationsEnabled: true,
  speechRate: 1.0,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      progress: initialProgress,
      chatHistory: [],
      isAuthReady: true,
      activeSession: null,
      planner: [],
      subjects: defaultSubjects,
      rankings: [],
      setAuthReady: (ready) => set({ isAuthReady: ready }),
      setUser: (user) => set({ user }),
      setProgress: (progress) => set({ progress }),
      logout: () => {
         localStorage.clear();
         window.location.reload();
      },
      restoreData: (progress, chatHistory, planner) => set({ progress, chatHistory, planner }),
      addProgress: (mins, chapters, points) => {
        set((state) => {
          const newProgress = {
            ...state.progress,
            points: state.progress.points + points,
            chaptersCompleted: state.progress.chaptersCompleted + chapters,
            timeStudiedMins: state.progress.timeStudiedMins + mins,
          };
          return { progress: newProgress };
        });
        get().updateRankings();
      },
      updateSubjectProgress: (subjectId, elapsedSeconds) => set((state) => {
        const today = new Date().toDateString();
        const existing = state.progress.subjectProgress?.[subjectId];
        let totalTime = elapsedSeconds;
        if (existing && existing.lastStudyDate === today) {
           totalTime = existing.timeStudiedSeconds + elapsedSeconds;
        }
        return {
          progress: {
            ...state.progress,
            subjectProgress: {
              ...(state.progress.subjectProgress || {}),
              [subjectId]: {
                subjectId,
                timeStudiedSeconds: totalTime,
                targetSeconds: existing?.targetSeconds || 2 * 60 * 60,
                lastStudyDate: today,
              }
            }
          }
        };
      }),
      setChatHistory: (updater) => set((state) => ({ chatHistory: updater(state.chatHistory) })),
      clearChatHistory: () => set({ chatHistory: [] }),
      
      startSession: (subjectId, chapterId, durationMins = 120) => {
        const state = get();
        if (state.activeSession) {
          state.stopSession();
        }

        set({
          activeSession: {
            subjectId,
            chapterId,
            startTime: Date.now(),
            accumulatedSeconds: 0,
            isPaused: false,
            targetSeconds: durationMins * 60,
          }
        });
      },
      
      pauseSession: () => {
        const state = get();
        if (!state.activeSession || state.activeSession.isPaused || state.activeSession.isCompleted) return;
        const now = Date.now();
        const elapsedSinceStart = Math.floor((now - state.activeSession.startTime) / 1000);
        set({
          activeSession: {
            ...state.activeSession,
            isPaused: true,
            accumulatedSeconds: state.activeSession.accumulatedSeconds + elapsedSinceStart,
          }
        });
      },
      
      resumeSession: () => {
        const state = get();
        if (!state.activeSession || !state.activeSession.isPaused || state.activeSession.isCompleted) return;
        set({
          activeSession: {
            ...state.activeSession,
            isPaused: false,
            startTime: Date.now(),
          }
        });
      },
      
      stopSession: () => {
        const state = get();
        if (!state.activeSession) return;
        
        const isFullCompletion = state.activeSession.isCompleted;
        let finalElapsed = state.activeSession.accumulatedSeconds;
        
        if (!state.activeSession.isPaused && !isFullCompletion) {
           finalElapsed += Math.floor((Date.now() - state.activeSession.startTime) / 1000);
        }

        if (isFullCompletion) {
          finalElapsed = state.activeSession.targetSeconds;
        }
        
        state.updateSubjectProgress(state.activeSession.subjectId, finalElapsed);
        
        if (!isFullCompletion) {
          const partialPoints = Math.floor(finalElapsed / 300);
          if (partialPoints > 0) {
            state.addProgress(Math.floor(finalElapsed / 60), 0, partialPoints);
          }
        }

        set({ activeSession: null });
      },
      
      tickSession: () => {
        const state = get();
        if (!state.activeSession || state.activeSession.isPaused || state.activeSession.isCompleted) return;
        
        const now = Date.now();
        const elapsedSinceStart = Math.floor((now - state.activeSession.startTime) / 1000);
        const totalElapsed = state.activeSession.accumulatedSeconds + elapsedSinceStart;
        
        if (totalElapsed >= state.activeSession.targetSeconds) {
           state.addProgress(Math.floor(state.activeSession.targetSeconds / 60), 1, 50); 
           
           set({
             activeSession: {
               ...state.activeSession,
               isCompleted: true
             }
           });
        }
      },

      updatePlanner: (tasks) => set({ planner: tasks }),

      generatePlanner: (studentClass) => {
        const state = get();
        const subjectsList = state.subjects.length > 0 ? state.subjects.map(s => s.id) : ['math', 'science', 'english', 'hindi', 'social', 'computer'];
        const classLevel = parseInt(studentClass) || 9;
        
        const schedule = [
          { time: '08:00 AM', period: 'Morning Focus', weight: 1.2 },
          { time: '11:00 AM', period: 'Midday Mastery', weight: 1.0 },
          { time: '03:00 PM', period: 'Afternoon Application', weight: 0.8 },
          { time: '06:30 PM', period: 'Evening Enrichment', weight: 0.9 },
          { time: '09:00 PM', period: 'Night Revision', weight: 0.5 },
        ];

        const getChapterForSubject = (sid: string) => {
          const subject = state.subjects.find(s => s.id === sid);
          if (subject && subject.chapters.length > 0) {
             const randomChapter = subject.chapters[Math.floor(Math.random() * subject.chapters.length)];
             return randomChapter.title;
          }
          return 'Foundations';
        };

        const mockTasks: PlannerTask[] = schedule.map((slot, i) => {
          const sid = subjectsList[i % subjectsList.length];
          const duration = Math.floor((classLevel >= 9 ? 60 : 45) * slot.weight);
          
          return {
            id: `task-${Date.now()}-${i}`,
            subjectId: sid,
            chapterId: getChapterForSubject(sid),
            scheduledTime: slot.time,
            durationMins: duration,
            status: 'pending'
          };
        });

        set({ planner: mockTasks });
      },

      completeTask: (taskId) => set((state) => ({
        planner: state.planner.map(t => t.id === taskId ? { ...t, status: 'completed' } : t)
      })),

      updateUser: async (data) => {
        const state = get();
        if (!state.user) return;
        const updatedUser = { ...state.user, ...data };
        set({ user: updatedUser });
      },

      addChapter: (subjectId, title) => set((state) => ({
        subjects: state.subjects.map(s => s.id === subjectId ? {
          ...s,
          chapters: [...s.chapters, {
            id: `ch-${Date.now()}`,
            title,
            description: 'Custom added chapter',
            estimatedTime: '60m'
          }]
        } : s)
      })),

      removeChapter: (subjectId, chapterId) => set((state) => ({
        subjects: state.subjects.map(s => s.id === subjectId ? {
          ...s,
          chapters: s.chapters.filter(c => c.id !== chapterId)
        } : s)
      })),

      updateChapter: (subjectId, chapterId, title) => set((state) => ({
        subjects: state.subjects.map(s => s.id === subjectId ? {
          ...s,
          chapters: s.chapters.map(c => c.id === chapterId ? { ...c, title } : c)
        } : s)
      })),

      updateRankings: () => {
        const state = get();
        const userPoints = state.progress.points;
        const staticNames = ['Rahul Sharma', 'Aisha Khan', 'Sneha Patel', 'Vikram Singh', 'Priya Das', 'Ananya Roy', 'Arjun Verma', 'Zara Malik'];
        const staticRankings = staticNames.map((name, i) => ({
          id: `static-${i}`,
          name,
          points: 5000 - (i * 400) + Math.floor(Math.random() * 100),
          rank: 0,
          class: (Math.floor(Math.random() * 3) + 8).toString(),
          isUser: false
        }));
        
        const userEntry = { 
          id: state.user.id, 
          name: state.user.name + ' (You)', 
          points: userPoints, 
          rank: 0,
          class: state.user.class,
          isUser: true 
        };
        const combined = [...staticRankings, userEntry].sort((a, b) => b.points - a.points);
        const finalRankings = combined.map((entry, i) => ({ ...entry, rank: i + 1 }));
        set({ rankings: finalRankings });
      }
    }),
    {
      name: 'global-x-ai-data-isolation',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const raw = localStorage.getItem('global_x_data_isolation');
          if (!raw) return null;
          try {
             const isolated = JSON.parse(raw);
             return JSON.stringify({
                state: {
                   user: { ...isolated.profile, id: isolated.user_id },
                   progress: isolated.study?.progress,
                   activeSession: isolated.study?.activeSession,
                   planner: isolated.study?.planner,
                   chatHistory: isolated.chat,
                   subjects: isolated.study?.subjects || defaultSubjects,
                },
                version: 0
             });
          } catch(e) { return null; }
        },
        setItem: (name, value) => {
          try {
             const { state } = JSON.parse(value);
             const isolatedRaw = localStorage.getItem('global_x_data_isolation');
             const isolated = isolatedRaw ? JSON.parse(isolatedRaw) : {};
             const finalSave = {
                user_id: state.user.id,
                profile: state.user,
                study: {
                   progress: state.progress,
                   activeSession: state.activeSession,
                   planner: state.planner,
                   subjects: state.subjects,
                },
                analytics: isolated.analytics || {},
                tests: isolated.tests || {},
                notes: isolated.notes || {},
                settings: {
                   teacherPreference: state.user.teacherPreference,
                   language: state.user.language,
                   soundEnabled: state.user.soundEnabled,
                   notificationsEnabled: state.user.notificationsEnabled,
                   speechRate: state.user.speechRate
                },
                chat: state.chatHistory,
             };
             localStorage.setItem('global_x_data_isolation', JSON.stringify(finalSave));
          } catch (e) {}
        },
        removeItem: () => {
           localStorage.removeItem('global_x_data_isolation');
        }
      })),
    }
  )
);
