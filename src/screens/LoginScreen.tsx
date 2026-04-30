import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Mail, Lock, User, Globe, Loader2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { loginWithGoogle, checkUserProfile, createUserProfile } from '../lib/authService';

export default function LoginScreen() {
  const { setUser, setProgress, isAuthReady } = useAppStore();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'onboarding'>('login');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Onboarding Form State
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('10');
  const [teacherPref, setTeacherPref] = useState<'Rohan' | 'Priya'>('Rohan');
  const [language, setLanguage] = useState('English');

  // If auth is ready and user is logged in, this happens automatically via AuthProvider
  // However, if AuthProvider sees user but NO profile, it leaves `user` null so we stay here
  // We should detect if `auth.currentUser` exists but we are here -> means we need onboarding

  useEffect(() => {
    if (isAuthReady && auth.currentUser && !loading) {
      // Check if they need onboarding
      checkUserProfile(auth.currentUser.uid).then(profile => {
        if (!profile) {
          setFirebaseUser(auth.currentUser);
          setMode('onboarding');
        }
      });
    }
  }, [isAuthReady]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        setFirebaseUser(res.user);
        setMode('onboarding');
      } else if (mode === 'login') {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const profile = await checkUserProfile(res.user.uid);
        if (!profile) {
          setFirebaseUser(res.user);
          setMode('onboarding');
        } else {
           // AuthProvider will handle updating appStore. We just wait.
        }
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setError('Password reset email sent.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const fbUser = await loginWithGoogle();
      const profile = await checkUserProfile(fbUser.uid);
      if (!profile) {
        setFirebaseUser(fbUser);
        setMode('onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Google Auth error');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !firebaseUser) return;
    setError('');
    setLoading(true);
    try {
      await createUserProfile(firebaseUser.uid, {
        name,
        email: firebaseUser.email || '',
        class: studentClass,
        teacherChoice: teacherPref,
        language
      });
      // Once created, we should push this to store so we enter the app
      setUser({
        id: firebaseUser.uid,
        name,
        email: firebaseUser.email || '',
        class: studentClass,
        language,
        teacherPreference: teacherPref
      });
      setProgress({
        chaptersCompleted: 0,
        timeStudiedMins: 0,
        points: 0,
        streak: 0
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthReady) {
    return <div className="min-h-screen bg-secondary-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary-100/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-secondary-200/40 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-sm z-10"
      >
        <div className="bg-white/80 border border-secondary-200/50 shadow-sm rounded-[2rem] overflow-hidden backdrop-blur-xl">
          <div className="space-y-3 text-center pt-8 pb-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-primary-50 rounded-[1.2rem] mx-auto flex items-center justify-center text-primary-600 text-2xl font-black shadow-sm border border-primary-200 mb-2 rotate-3"
            >
              GX
            </motion.div>
            <h1 className="text-2xl font-black tracking-tight text-secondary-900 flex items-center justify-center gap-2">
              Global X <Sparkles className="w-5 h-5 text-primary-500 fill-primary-400" />
            </h1>
            <p className="text-secondary-500 font-bold text-xs uppercase tracking-wider px-4">
              {mode === 'onboarding' ? "Let's personalize your experience" : 'Your next-generation AI educator.'}
            </p>
          </div>
          
          <div className="px-6 pb-8 pt-2">
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium text-center">{error}</div>}

            <AnimatePresence mode="wait">
              {mode === 'onboarding' ? (
                <motion.form key="onboarding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleOnboardingSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-500 ml-1">What's your name?</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                      <Input placeholder="e.g. Aryan" value={name} onChange={e => setName(e.target.value)} required 
                        className="bg-white border-secondary-200/60 h-12 rounded-xl pl-10 text-sm focus:bg-white shadow-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-500 ml-1">Class</label>
                      <select className="flex h-12 w-full rounded-xl border border-secondary-200/60 bg-white px-3 text-sm outline-none focus:bg-white font-medium text-secondary-900 shadow-none"
                        value={studentClass} onChange={e => setStudentClass(e.target.value)}>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1)}>Class {i+1}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-500 ml-1">Language</label>
                      <select className="flex h-12 w-full rounded-xl border border-secondary-200/60 bg-white px-3 text-sm outline-none focus:bg-white font-medium text-secondary-900 shadow-none"
                        value={language} onChange={e => setLanguage(e.target.value)}>
                        <option>English</option><option>Hindi</option><option>Urdu</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-500 ml-1">Select AI Teacher</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div onClick={() => setTeacherPref('Rohan')} className={`cursor-pointer rounded-xl p-3 flex flex-col items-center justify-center gap-1 border-2 transition-all ${teacherPref === 'Rohan' ? 'border-primary-400 bg-primary-50 shadow-sm' : 'border-secondary-100 bg-white hover:bg-secondary-50'}`}>
                         <span className="text-2xl">👨🏽‍🏫</span>
                         <span className="font-bold text-xs text-secondary-900">Rohan</span>
                      </div>
                      <div onClick={() => setTeacherPref('Priya')} className={`cursor-pointer rounded-xl p-3 flex flex-col items-center justify-center gap-1 border-2 transition-all ${teacherPref === 'Priya' ? 'border-primary-400 bg-primary-50 shadow-sm' : 'border-secondary-100 bg-white hover:bg-secondary-50'}`}>
                         <span className="text-2xl">👩🏽‍🏫</span>
                         <span className="font-bold text-xs text-secondary-900">Priya</span>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={!name.trim() || loading} className="w-full bg-secondary-900 hover:bg-secondary-800 text-white font-bold h-12 rounded-xl mt-2 text-base shadow-sm">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Start Learning <ArrowRight className="w-4 h-4 ml-2" /></>}
                  </Button>
                </motion.form>
              ) : (
                <motion.form key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                      <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required 
                        className="bg-white border-secondary-200/60 h-12 rounded-xl pl-10 text-sm focus:bg-white shadow-none" />
                    </div>
                    {mode !== 'forgot' && (
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required 
                          className="bg-white border-secondary-200/60 h-12 rounded-xl pl-10 text-sm focus:bg-white shadow-none" />
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={!email || (mode !== 'forgot' && !password) || loading} className="w-full bg-primary-400 hover:bg-primary-500 text-secondary-900 font-bold h-12 rounded-xl text-base shadow-sm">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  </Button>

                  {mode !== 'forgot' && (
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-secondary-200/60"></div>
                        <span className="flex-shrink-0 mx-4 text-secondary-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
                        <div className="flex-grow border-t border-secondary-200/60"></div>
                    </div>
                  )}

                  {mode !== 'forgot' && (
                    <Button type="button" onClick={handleGoogleAuth} disabled={loading} variant="outline" className="w-full bg-white hover:bg-secondary-50 text-secondary-900 font-bold h-12 rounded-xl text-sm border border-secondary-200 shadow-sm">
                      <Globe className="w-4 h-4 mr-2 text-secondary-600" /> Continue with Google
                    </Button>
                  )}

                  <div className="text-center pt-2 text-xs font-bold text-secondary-500 flex flex-col gap-1.5 uppercase tracking-wide">
                    {mode === 'login' ? (
                      <>
                        <p>New here? <button type="button" onClick={() => setMode('signup')} className="text-primary-600 font-black hover:underline ml-1">Sign up</button></p>
                        <button type="button" onClick={() => setMode('forgot')} className="text-secondary-400 hover:text-secondary-600">Forgot password?</button>
                      </>
                    ) : mode === 'signup' ? (
                      <p>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-primary-600 font-black hover:underline ml-1">Log in</button></p>
                    ) : (
                      <p>Remembered? <button type="button" onClick={() => setMode('login')} className="text-primary-600 font-black hover:underline ml-1">Back to login</button></p>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
