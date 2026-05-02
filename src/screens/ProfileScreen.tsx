import { Button } from '../components/ui/button';
import { useAppStore } from '../store/useAppStore';
import { UserCircle2, BookOpen, Settings, LogOut, ArrowRight, ShieldCheck, Mail, CreditCard, Bell, Globe2, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAppStore();
  
  const [showTeacherSelect, setShowTeacherSelect] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
     name: user?.name || '',
     class: user?.class || '9'
  });

  const teacherOptions: { name: 'Rohan' | 'Priya', icon: string, desc: string }[] = [
    { name: 'Rohan', icon: '👨🏽‍🏫', desc: 'Expert in Logic & Sciences' },
    { name: 'Priya', icon: '👩🏽‍🏫', desc: 'Linguistics & Creative Arts' }
  ];

  const handleSaveProfile = () => {
     updateUser({ name: editForm.name, class: editForm.class });
     setIsEditing(false);
  };

  return (
    <div className="space-y-10 h-full pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <motion.h1 
               initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
               className="text-4xl font-black tracking-tight text-[#111111]"
            >
               My Profile
            </motion.h1>
            <p className="text-secondary-500 font-bold text-sm mt-2 tracking-wide uppercase tracking-[0.2em]">{user?.email || 'student@globalx.ai'}</p>
         </div>
         <div className="flex items-center gap-4">
            {isEditing ? (
               <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-2xl px-6 h-14 font-black text-secondary-400">Cancel</Button>
                  <Button onClick={handleSaveProfile} className="rounded-2xl px-8 h-14 bg-[#111111] text-white font-black shadow-xl">Save Changes</Button>
               </div>
            ) : (
               <Button onClick={() => setIsEditing(true)} variant="ghost" className="rounded-2xl px-6 h-14 font-black text-[#111111] bg-[#F9F9F9] border-2 border-transparent hover:border-[#111111]">Edit Profile</Button>
            )}
         </div>
      </div>

      {/* Main Profile Info Card */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
         <div className="bg-white rounded-[3.5rem] border-2 border-secondary-50 p-12 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFF9E8] rounded-full -mr-40 -mt-40 transition-transform duration-700 group-hover:scale-110" />
            
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
               <div className="w-32 h-32 rounded-[2.5rem] bg-[#111111] flex items-center justify-center border-8 border-white shadow-2xl shrink-0">
                  <UserCircle2 className="w-16 h-16 text-[#F7E58D]" />
               </div>
               
               <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                     <div className="space-y-4">
                        <input 
                           type="text" 
                           value={editForm.name} 
                           onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                           className="text-4xl font-black text-[#111111] bg-white border-b-4 border-[#F7E58D] outline-none w-full"
                           placeholder="Enter Name"
                        />
                        <select 
                           value={editForm.class}
                           onChange={(e) => setEditForm(prev => ({ ...prev, class: e.target.value }))}
                           className="bg-[#111111] text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] outline-none cursor-pointer"
                        >
                           {['1','2','3','4','5','6','7','8','9','10'].map(c => (
                              <option key={c} value={c}>Class {c}</option>
                           ))}
                        </select>
                     </div>
                  ) : (
                     <>
                        <h2 className="text-4xl font-black text-[#111111] leading-none mb-4">{user?.name || 'Global Student'}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                           <div className="bg-[#111111] text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em]">Class {user?.class}</div>
                           <div className="bg-white border-2 border-secondary-50 text-secondary-500 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
                              <Globe2 className="w-3.5 h-3.5" /> Global Access
                           </div>
                        </div>
                     </>
                  )}
               </div>

               {!isEditing && (
                  <Button 
                     onClick={() => setShowTeacherSelect(true)}
                     className="bg-[#F7E58D] text-[#111111] hover:bg-black hover:text-white rounded-3xl h-16 px-8 font-black shadow-xl transition-all flex items-center gap-3 shrink-0"
                  >
                     <BookOpen className="w-5 h-5" /> Change Teacher
                  </Button>
               )}
            </div>
         </div>
      </motion.div>

      {/* Menu Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-4">
            <h3 className="font-black text-[#111111] text-xl ml-2 mb-6">Learning Settings</h3>
            
            {/* Notifications Toggle */}
            <motion.div whileTap={{ scale: 0.98 }} onClick={() => updateUser({ notificationsEnabled: !user?.notificationsEnabled })} className="bg-[#F9F9F9] border-2 border-transparent hover:border-[#111111] rounded-[2rem] p-6 flex items-center justify-between cursor-pointer transition-all group">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#111111] shadow-sm transform group-hover:rotate-6 transition-transform">
                     <Bell className="w-6 h-6" />
                  </div>
                  <span className="font-black text-[#111111] text-lg">Notifications</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className={`text-xs font-black uppercase tracking-widest ${user?.notificationsEnabled !== false ? 'text-green-500' : 'text-secondary-300'}`}>
                     {user?.notificationsEnabled !== false ? 'Enabled' : 'Disabled'}
                  </span>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${user?.notificationsEnabled !== false ? 'bg-green-500' : 'bg-gray-300'}`}>
                     <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user?.notificationsEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
               </div>
            </motion.div>

            {/* Sound Toggle */}
            <motion.div whileTap={{ scale: 0.98 }} onClick={() => updateUser({ soundEnabled: !user?.soundEnabled })} className="bg-[#F9F9F9] border-2 border-transparent hover:border-[#111111] rounded-[2rem] p-6 flex items-center justify-between cursor-pointer transition-all group">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#111111] shadow-sm transform group-hover:rotate-6 transition-transform">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="font-black text-[#111111] text-lg">App Sound</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className={`text-xs font-black uppercase tracking-widest ${user?.soundEnabled !== false ? 'text-green-500' : 'text-secondary-300'}`}>
                     {user?.soundEnabled !== false ? 'Enabled' : 'Disabled'}
                  </span>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${user?.soundEnabled !== false ? 'bg-green-500' : 'bg-gray-300'}`}>
                     <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user?.soundEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
               </div>
            </motion.div>

            {/* Language Selection */}
            <motion.div whileTap={{ scale: 0.98 }} className="bg-[#F9F9F9] border-2 border-transparent hover:border-[#111111] rounded-[2rem] p-6 flex items-center justify-between cursor-pointer transition-all group">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#111111] shadow-sm transform group-hover:rotate-6 transition-transform">
                     <Globe2 className="w-6 h-6" />
                  </div>
                  <span className="font-black text-[#111111] text-lg">App Language</span>
               </div>
               <div className="flex items-center gap-3">
                  <select 
                     value={user?.language || 'English'}
                     onChange={(e) => updateUser({ language: e.target.value })}
                     className="bg-transparent text-xs font-black text-secondary-500 uppercase tracking-widest outline-none cursor-pointer text-right appearance-none"
                  >
                     <option value="English">English</option>
                     <option value="Hindi">Hindi</option>
                     <option value="Urdu">Urdu</option>
                  </select>
                  <ChevronRight className="w-5 h-5 text-secondary-200" />
               </div>
            </motion.div>
         </div>

         <div className="space-y-4">
            <h3 className="font-black text-[#111111] text-xl ml-2 mb-6">Subscription & Account</h3>
            {[
               { icon: CreditCard, label: 'Premium Plan', value: 'Elite Explorer', active: true },
               { icon: Mail, label: 'Email Center', value: 'Verified', active: false },
            ].map((item, i) => (
               <motion.div key={i} whileTap={{ scale: 0.98 }} className="bg-[#F9F9F9] border-2 border-transparent hover:border-[#111111] rounded-[2rem] p-6 flex items-center justify-between cursor-pointer transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#111111] shadow-sm transform group-hover:rotate-6 transition-transform">
                        <item.icon className="w-6 h-6" />
                     </div>
                     <span className="font-black text-[#111111] text-lg">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {item.value && <span className={`text-xs font-black uppercase tracking-widest ${item.active ? 'text-[#F7E58D]' : 'text-secondary-300'}`}>
                        {item.value}
                     </span>}
                  </div>
               </motion.div>
            ))}

            {/* Data Reset Options */}
            <motion.div whileTap={{ scale: 0.98 }} onClick={logout} className="bg-red-50 border-2 border-transparent hover:border-red-500 rounded-[2rem] p-6 flex items-center justify-between cursor-pointer transition-all group mt-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm transform group-hover:rotate-6 transition-transform">
                     <LogOut className="w-6 h-6" />
                  </div>
                  <span className="font-black text-red-500 text-lg">Reset Data</span>
               </div>
            </motion.div>
         </div>
      </div>

      {/* Teacher Selection Modal */}
      <AnimatePresence>
         {showTeacherSelect && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#111111]/80 backdrop-blur-3xl overflow-y-auto">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white rounded-[4.5rem] w-full max-w-xl shadow-3xl p-12 overflow-hidden flex flex-col relative"
               >
                  <div className="flex justify-between items-center mb-10">
                     <div>
                        <h2 className="text-3xl font-black text-[#111111] leading-none mb-2">Select Your AI Teacher</h2>
                        <p className="text-secondary-400 font-bold text-sm">Choose a personality that fits your learning style.</p>
                     </div>
                     <Button variant="ghost" onClick={() => setShowTeacherSelect(false)} className="w-14 h-14 rounded-full bg-secondary-50 text-secondary-400 p-0">
                        <X className="w-8 h-8" />
                     </Button>
                  </div>

                  <div className="space-y-4 mb-10">
                     {teacherOptions.map((teacher) => (
                        <motion.button 
                           key={teacher.name}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => {
                              updateUser({ teacherPreference: teacher.name });
                              setShowTeacherSelect(false);
                           }}
                           className={`w-full flex items-center gap-6 p-8 rounded-[3rem] border-2 transition-all text-left ${user?.teacherPreference === teacher.name ? 'bg-[#FFF9E8] border-[#F7E58D]' : 'bg-[#F9F9F9] border-transparent hover:border-[#F7E58D]/30'}`}
                        >
                           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl transition-transform group-hover:scale-110">
                              {teacher.icon}
                           </div>
                           <div className="flex-1">
                              <h4 className="text-2xl font-black text-[#111111] leading-none mb-1">{teacher.name}</h4>
                              <p className="text-secondary-400 font-bold text-sm">{teacher.desc}</p>
                           </div>
                           {user?.teacherPreference === teacher.name && (
                              <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center text-[#F7E58D]">
                                 <Check className="w-6 h-6" />
                              </div>
                           )}
                        </motion.button>
                     ))}
                  </div>

                  <Button 
                    onClick={() => setShowTeacherSelect(false)}
                    className="h-20 w-full bg-[#111111] text-white font-black rounded-3xl"
                  >
                     Confirm Selection
                  </Button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
