import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  class: string;
  teacherPreference: 'Rohan' | 'Priya';
  language: string;
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
}

export interface StudySession {
  subjectId: string;
  chapterId?: string;
  startTime: number; // Timestamp when started/resumed
  accumulatedSeconds: number; // Previous session time
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

interface AppStore {
  user: User | null;
  progress: Progress;
  chatHistory: ChatMessage[];
  isAuthReady: boolean;
  activeSession: StudySession | null;
  planner: PlannerTask[];
  setAuthReady: (ready: boolean) => void;
  setUser: (user: User | null) => void;
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
}

const initialProgress: Progress = {
  points: 100,
  streak: 1,
  chaptersCompleted: 0,
  timeStudiedMins: 0,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      progress: initialProgress,
      chatHistory: [],
      isAuthReady: false,
      activeSession: null,
      planner: [],
      setAuthReady: (ready) => set({ isAuthReady: ready }),
      setUser: (user) => set({ user }),
      setProgress: (progress) => set({ progress }),
      logout: () => set({ user: null, progress: initialProgress, chatHistory: [], activeSession: null, planner: [] }),
      addProgress: (mins, chapters, points) => set((state) => {
        return {
          progress: {
            ...state.progress,
            points: state.progress.points + points,
            chaptersCompleted: state.progress.chaptersCompleted + chapters,
            timeStudiedMins: state.progress.timeStudiedMins + mins,
          }
        };
      }),
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
        // If there's an existing session, stop it properly first to save progress
        if (state.activeSession) {
          state.stopSession();
        }

        // Delay slightly to ensure state propagation if needed, though Zustand is sync
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

        // If it was already completed, we use the target seconds
        if (isFullCompletion) {
          finalElapsed = state.activeSession.targetSeconds;
        }
        
        state.updateSubjectProgress(state.activeSession.subjectId, finalElapsed);
        
        // Log to Firebase
        if (state.user?.id) {
            import('../services/analyticsService').then(service => {
                service.logStudySession(state.user!.id, state.activeSession!.subjectId, finalElapsed);
            });
        }
        
        // Award points
        // If completion bonus was already given in tickSession, we don't give it here
        // But wait, tickSession now only marks it as completed in my refined logic? 
        // No, let's keep tickSession giving the bonus, but stopSession only gives "time" points if NOT completed
        
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
           // On full completion, we award the big bonus immediately
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
        const subjectsList = ['math', 'science', 'english', 'hindi', 'social', 'computer'];
        const classLevel = parseInt(studentClass) || 9;
        
        // Define smart task generation based on class
        const schedule = [
          { time: '08:00 AM', period: 'Morning Focus', weight: 1.2 },
          { time: '11:00 AM', period: 'Midday Mastery', weight: 1.0 },
          { time: '03:00 PM', period: 'Afternoon Application', weight: 0.8 },
          { time: '06:30 PM', period: 'Evening Enrichment', weight: 0.9 },
          { time: '09:00 PM', period: 'Night Revision', weight: 0.5 },
        ];

        const getChapterForSubject = (sid: string, level: number) => {
          if (sid === 'math') return level > 8 ? 'Algebraic Expressions' : 'Basic Arithmetic';
          if (sid === 'science') return level > 8 ? 'Photosynthesis Mechanisms' : 'Plant Life';
          if (sid === 'english') return 'Grammar: Tenses & Verbs';
          if (sid === 'hindi') return 'Vyakaran Basics';
          if (sid === 'social') return level > 8 ? 'Economic Resources' : 'Our Environment';
          if (sid === 'computer') return 'AI and Digital Tools';
          return 'Foundations';
        };

        const mockTasks: PlannerTask[] = schedule.map((slot, i) => {
          const sid = subjectsList[i % subjectsList.length];
          const duration = Math.floor((classLevel >= 9 ? 60 : 45) * slot.weight);
          
          return {
            id: `task-${Date.now()}-${i}`,
            subjectId: sid,
            chapterId: getChapterForSubject(sid, classLevel),
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

        try {
          const userRef = doc(db, 'users', state.user.id);
          await updateDoc(userRef, {
             ...data,
             lastActivityAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating profile in Firestore:', error);
          // Optionally rollback state or show error
        }
      }
    }),
    {
      name: 'global-x-ai-v3-storage',
    }
  )
);
