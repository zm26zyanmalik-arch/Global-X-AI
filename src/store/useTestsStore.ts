import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TestResult {
  id: string;
  templateId: string;
  title: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: number;
  resultAvailableAt: number;
  status: 'pending' | 'ready';
}

interface TestsStore {
  results: TestResult[];
  addResult: (result: Omit<TestResult, 'id' | 'status'>) => void;
  updateStatuses: () => void;
  restoreData: (results: TestResult[]) => void;
  clearData: () => void;
}

export const useTestsStore = create<TestsStore>()(
  persist(
    (set, get) => ({
      results: [],
      addResult: (result) => set((state) => {
        const newResult: TestResult = {
          ...result,
          id: Date.now().toString(),
          status: result.resultAvailableAt > Date.now() ? 'pending' : 'ready'
        };
        return { results: [newResult, ...state.results] };
      }),
      updateStatuses: () => set((state) => {
        const now = Date.now();
        const updated = state.results.map(r => 
          r.status === 'pending' && r.resultAvailableAt <= now 
            ? { ...r, status: 'ready' as const } 
            : r
        );
        return { results: updated };
      }),
      restoreData: (results) => set({ results }),
      clearData: () => set({ results: [] })
    }),
    {
      name: 'global-tests-isolation',
      storage: createJSONStorage(() => ({
        getItem: () => {
          const raw = localStorage.getItem('global_x_data_isolation');
          if (!raw) return null;
          try {
             const isolated = JSON.parse(raw);
             return JSON.stringify({
                state: { results: isolated.tests?.results || [] },
                version: 0
             });
          } catch(e) { return null; }
        },
        setItem: (_, value) => {
          try {
             const { state } = JSON.parse(value);
             const isolatedRaw = localStorage.getItem('global_x_data_isolation');
             const isolated = isolatedRaw ? JSON.parse(isolatedRaw) : {};
             const finalSave = {
                ...isolated,
                tests: { results: state.results }
             };
             localStorage.setItem('global_x_data_isolation', JSON.stringify(finalSave));
          } catch (e) {}
        },
        removeItem: () => {}
      })),
    }
  )
);
