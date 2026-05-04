import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  createdAt: number;
  updatedAt: number;
}

interface NotesStore {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  restoreData: (notes: Note[]) => void;
  clearData: () => void;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (note) => set((state) => ({
        notes: [{ ...note, id: Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() }, ...state.notes]
      })),
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      })),
      restoreData: (notes) => set({ notes }),
      clearData: () => set({ notes: [] })
    }),
    {
      name: 'global-notes-isolation',
      storage: createJSONStorage(() => ({
        getItem: () => {
          const raw = localStorage.getItem('global_x_data_isolation');
          if (!raw) return null;
          try {
             const isolated = JSON.parse(raw);
             return JSON.stringify({
                state: { notes: isolated.notes?.items || [] },
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
                notes: { items: state.notes }
             };
             localStorage.setItem('global_x_data_isolation', JSON.stringify(finalSave));
          } catch (e) {}
        },
        removeItem: () => {}
      })),
    }
  )
);
