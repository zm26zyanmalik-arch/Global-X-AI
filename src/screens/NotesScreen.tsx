import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FileText, Search, Plus, Sparkles, Download, Trash2, ChevronRight, X, Clock, Eye, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';
import { jsPDF } from 'jspdf';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  createdAt: any;
  updatedAt: any;
  userId: string;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeSubject, setActiveSubject] = useState('All');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isReading, setIsReading] = useState(false);
  
  // Form states
  const [newNote, setNewNote] = useState({ title: '', content: '', subject: 'Science' });
  const [editNote, setEditNote] = useState<Partial<Note> | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const notesRef = collection(db, 'users', auth.currentUser.uid, 'notes');
    const q = query(notesRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(notesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${auth.currentUser?.uid}/notes`);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateNote = async () => {
    if (!auth.currentUser || !newNote.title || !newNote.content) return;
    
    const path = `users/${auth.currentUser.uid}/notes`;
    try {
      await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        title: newNote.title,
        content: newNote.content,
        subject: newNote.subject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsCreating(false);
      setNewNote({ title: '', content: '', subject: 'Science' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleUpdateNote = async () => {
    if (!auth.currentUser || !selectedNote || !editNote) return;

    const path = `users/${auth.currentUser.uid}/notes/${selectedNote.id}`;
    try {
      await updateDoc(doc(db, path), {
        ...editNote,
        updatedAt: serverTimestamp()
      });
      setSelectedNote(prev => prev ? { ...prev, ...editNote } : null);
      setEditNote(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!auth.currentUser || !window.confirm('Delete this note permanently?')) return;

    const path = `users/${auth.currentUser.uid}/notes/${id}`;
    try {
      await deleteDoc(doc(db, path));
      setSelectedNote(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const downloadPDF = (note: Note) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text(note.title, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Subject: ${note.subject} | Created: ${note.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}`, 20, 30);
    
    doc.setDrawColor(247, 229, 141);
    doc.setLineWidth(1);
    doc.line(20, 35, 190, 35);
    
    // Content
    doc.setFontSize(12);
    doc.setTextColor(17);
    const splitText = doc.splitTextToSize(note.content, 170);
    doc.text(splitText, 20, 45);
    
    doc.save(`${note.title.replace(/\s+/g, '_')}.pdf`);
  };

  const filteredNotes = notes.filter(n => 
    (activeSubject === 'All' || n.subject === activeSubject) &&
    (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-10 h-full pb-24 max-w-6xl mx-auto px-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <motion.h1 
               initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
               className="text-3xl md:text-5xl font-black tracking-tight text-[#111111] flex items-center gap-4"
            >
               My Repository <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#F7E58D] flex items-center justify-center shrink-0"><FileText className="w-5 h-5 md:w-7 md:h-7 text-[#111111]" /></div>
            </motion.h1>
            <p className="text-secondary-500 font-bold text-sm mt-3 tracking-wide italic">Your personalized AI-synced learning archive.</p>
         </div>
         <Button 
            onClick={() => setIsCreating(true)}
            className="bg-[#111111] text-white font-black rounded-3xl h-16 w-full md:w-auto px-10 hover:bg-black shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-95"
         >
            <Plus className="w-6 h-6 text-[#F7E58D]" />
            <span className="text-lg">New Note</span>
         </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-6">
         <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-secondary-300" />
            <Input 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search by title, subject, or content..." 
               className="pl-16 bg-[#F9F9F9] border-transparent rounded-3xl h-16 text-lg shadow-inner focus-visible:ring-[#F7E58D] font-bold"
            />
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x lg:w-auto">
            {['All', 'Science', 'Mathematics', 'English', 'Social', 'Computer'].map(sub => (
               <button 
                  key={sub}
                  onClick={() => setActiveSubject(sub)}
                  className={`snap-start whitespace-nowrap px-8 py-4 rounded-3xl text-sm font-black uppercase tracking-widest transition-all border-2 ${activeSubject === sub ? 'bg-[#111111] border-[#111111] text-white shadow-xl' : 'bg-white border-secondary-50 text-secondary-400 hover:border-[#F7E58D] hover:text-[#111111]'}`}
               >
                  {sub}
               </button>
            ))}
         </div>
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && !searchQuery && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
           <div className="w-24 h-24 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-secondary-200" />
           </div>
           <h3 className="text-2xl font-black text-[#111111] mb-2">No Notes Found</h3>
           <p className="text-secondary-400 font-bold">Start by creating your first study note.</p>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <AnimatePresence mode="popLayout">
            {filteredNotes.map((note, i) => (
               <motion.div 
                 layout
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ delay: i * 0.05 }} 
                 key={note.id}
                 onClick={() => { setSelectedNote(note); setIsReading(true); }}
                 className="cursor-pointer group flex flex-col h-full"
               >
                  <div className="bg-white border-2 border-secondary-50 group-hover:border-[#F7E58D] rounded-[3rem] p-8 shadow-sm group-hover:shadow-2xl transition-all flex flex-col h-full relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF9E8] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                     
                     <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="bg-[#F9F9F9] rounded-xl px-4 py-1.5 text-[10px] font-black text-[#111111] uppercase tracking-widest border border-secondary-50">
                           {note.subject}
                        </div>
                        <div className="text-[10px] font-black text-secondary-300 uppercase tracking-widest flex items-center gap-1.5">
                           <Clock className="w-3 h-3" /> {note.updatedAt?.toDate()?.toLocaleDateString() || 'Just now'}
                        </div>
                     </div>

                     <h3 className="font-black text-xl text-[#111111] mb-4 leading-tight relative z-10 line-clamp-2">{note.title}</h3>
                     <p className="text-secondary-400 text-sm font-bold line-clamp-3 mb-6 relative z-10">{note.content}</p>
                     
                     <div className="mt-auto flex items-center justify-between relative z-10">
                        <div className="flex gap-2">
                          <Button variant="ghost" className="h-10 w-10 p-0 rounded-full bg-secondary-50" onClick={(e) => { e.stopPropagation(); downloadPDF(note); }}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#111111] text-[#F7E58D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Note Detail Modal (Read/Edit) */}
      <AnimatePresence>
         {selectedNote && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-[#111111]/80 backdrop-blur-xl overflow-y-auto">
               <motion.div 
                 initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                 className="bg-white rounded-[2.5rem] md:rounded-[4rem] w-full max-w-4xl shadow-3xl overflow-hidden flex flex-col relative"
               >
                  <div className={`p-8 md:p-12 flex items-start justify-between ${isReading ? 'bg-[#F9F9F9]' : 'bg-[#FFF9E8]'}`}>
                     <div className="flex gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                           <FileText className="w-8 h-8 text-[#111111]" />
                        </div>
                        <div className="pt-1">
                           <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest block mb-1">{isReading ? 'Reading Mode' : 'Editing Mode'}</span>
                           {isReading ? (
                             <h2 className="text-2xl md:text-3xl font-black text-[#111111] leading-none">{selectedNote.title}</h2>
                           ) : (
                             <input 
                               className="text-2xl md:text-3xl font-black text-[#111111] bg-transparent border-b-2 border-[#111111]/10 focus:border-[#F7E58D] focus:outline-none"
                               value={editNote?.title ?? selectedNote.title}
                               onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                             />
                           )}
                        </div>
                     </div>
                     <Button 
                        variant="ghost" onClick={() => { setSelectedNote(null); setEditNote(null); }}
                        className="w-12 h-12 rounded-full bg-white/50 hover:bg-white text-[#111111] p-0"
                     >
                        <X className="w-6 h-6" />
                     </Button>
                  </div>

                  <div className="p-8 md:p-16 flex-1 overflow-y-auto min-h-[400px]">
                     <div className="max-w-3xl mx-auto space-y-8">
                        <div className="flex items-center gap-4 text-secondary-400 font-black uppercase text-[10px] tracking-widest">
                           <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Updated: {selectedNote.updatedAt?.toDate()?.toLocaleString()}</div>
                           <div className="bg-secondary-50 px-3 py-1 rounded-full">{selectedNote.subject}</div>
                        </div>

                        {isReading ? (
                          <p className="text-[#111111] font-bold text-xl leading-relaxed whitespace-pre-wrap opacity-90">{selectedNote.content}</p>
                        ) : (
                          <textarea 
                             className="w-full min-h-[300px] bg-transparent text-[#111111] font-bold text-xl leading-relaxed border-none focus:outline-none resize-none"
                             value={editNote?.content ?? selectedNote.content}
                             onChange={(e) => setEditNote(prev => ({ ...prev, content: e.target.value }))}
                             placeholder="Note content..."
                          />
                        )}
                     </div>
                  </div>

                  <div className="p-8 md:p-12 border-t-2 border-secondary-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-white shrink-0">
                     <div className="flex gap-3">
                        {isReading ? (
                          <Button onClick={() => setIsReading(false)} className="h-14 px-8 rounded-2xl bg-[#111111] text-white font-black hover:bg-black uppercase tracking-widest flex items-center gap-2">
                            <Edit3 className="w-5 h-5" /> Edit Note
                          </Button>
                        ) : (
                          <Button onClick={handleUpdateNote} className="h-14 px-8 rounded-2xl bg-[#111111] text-white font-black hover:bg-black uppercase tracking-widest flex items-center gap-2">
                            <Save className="w-5 h-5" /> Save Changes
                          </Button>
                        )}
                        <Button variant="ghost" onClick={() => handleDeleteNote(selectedNote.id)} className="h-14 px-8 rounded-2xl border-2 border-secondary-50 font-black text-secondary-400 hover:text-red-500 hover:border-red-50 transition-colors uppercase tracking-widest flex items-center gap-2">
                           <Trash2 className="w-5 h-5" /> Delete
                        </Button>
                     </div>
                     <div className="flex gap-3">
                        {isReading && (
                          <Button 
                            onClick={() => downloadPDF(selectedNote)}
                            className="h-14 px-8 rounded-2xl bg-[#FFF9E8] text-[#111111] border border-[#F7E58D] font-black hover:bg-[#F7E58D] uppercase tracking-widest flex items-center gap-2"
                          >
                            <Download className="w-5 h-5" /> PDF
                          </Button>
                        )}
                        {!isReading && (
                          <Button variant="ghost" onClick={() => setIsReading(true)} className="h-14 px-8 rounded-2xl border-2 border-secondary-50 font-black text-secondary-400 uppercase tracking-widest">
                            Cancel
                          </Button>
                        )}
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
         {isCreating && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#111111]/90 backdrop-blur-2xl overflow-y-auto">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white rounded-[3rem] w-full max-w-2xl shadow-3xl p-10 flex flex-col gap-8"
               >
                  <div className="flex items-center justify-between">
                     <h3 className="text-3xl font-black text-[#111111] flex items-center gap-4">
                        <Plus className="w-8 h-8 text-[#F7E58D]" /> New Note
                     </h3>
                     <Button variant="ghost" onClick={() => setIsCreating(false)} className="rounded-full w-12 h-12 p-0"><X className="w-6 h-6" /></Button>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-secondary-400 tracking-widest">Subject</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                           {['Science', 'Mathematics', 'English', 'Social', 'Computer'].map(sub => (
                              <button 
                                 key={sub}
                                 onClick={() => setNewNote(prev => ({ ...prev, subject: sub }))}
                                 className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${newNote.subject === sub ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-secondary-400 border-secondary-50'}`}
                              >
                                 {sub}
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-secondary-400 tracking-widest">Title</label>
                        <Input 
                           value={newNote.title}
                           onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                           placeholder="Exploring Quantum Physics..." 
                           className="bg-[#F9F9F9] border-transparent rounded-2xl h-14 font-bold text-lg"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-secondary-400 tracking-widest">Content</label>
                        <textarea 
                           value={newNote.content}
                           onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                           className="w-full min-h-[200px] p-6 bg-[#F9F9F9] rounded-3xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#F7E58D] border-none resize-none"
                           placeholder="Type your notes here..."
                        />
                     </div>
                  </div>

                  <Button 
                    onClick={handleCreateNote}
                    disabled={!newNote.title || !newNote.content}
                    className="w-full h-16 bg-[#111111] text-white font-black rounded-3xl text-lg hover:bg-black uppercase tracking-widest shadow-2xl disabled:opacity-50"
                  >
                     Save to Repository
                  </Button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

const Edit3 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
);
