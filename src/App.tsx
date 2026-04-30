/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Home, MessageSquare, BookOpen, Camera, UserCircle2, BarChart, FileText, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import StudyScreen from './screens/StudyScreen';
import PlannerScreen from './screens/PlannerScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import RewardScreen from './screens/RewardScreen';
import NotesScreen from './screens/NotesScreen';
import ScannerScreen from './screens/ScannerScreen';
import TestsScreen from './screens/TestsScreen';
import ProfileScreen from './screens/ProfileScreen';

export default function App() {
  const { user, tickSession, activeSession } = useAppStore();
  const [currentTab, setCurrentTab] = useState('home');

  // Global Session Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSession && !activeSession.isPaused && !activeSession.isCompleted) {
        tickSession();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, tickSession]);

  if (!user) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'home': return <HomeScreen onNavigate={setCurrentTab} />;
      case 'chat': return <ChatScreen />;
      case 'scanner': return <ScannerScreen />;
      case 'study': return <StudyScreen />;
      case 'planner': return <PlannerScreen onNavigate={setCurrentTab} />;
      case 'analytics': return <AnalyticsScreen />;
      case 'notes': return <NotesScreen />;
      case 'tests': return <TestsScreen />;
      case 'profile': return <ProfileScreen />;
      case 'rewards': return <RewardScreen />;
      default: return <HomeScreen onNavigate={setCurrentTab} />;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'study', icon: BookOpen, label: 'Study' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'scanner', icon: Camera, label: 'Scan' },
    { id: 'analytics', icon: BarChart, label: 'Stats' },
    { id: 'notes', icon: FileText, label: 'Notes' },
    { id: 'tests', icon: Target, label: 'Tests' },
    { id: 'profile', icon: UserCircle2, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-secondary-50 text-foreground overflow-hidden font-sans">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
         <div className="max-w-7xl mx-auto w-full h-full pb-[100px] md:pb-6 md:pt-6 md:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
         </div>
      </main>

      {/* Slim Premium Bottom Navigation */}
      <div className="fixed bottom-4 md:bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          className="pointer-events-auto max-w-full overflow-hidden"
        >
          <nav className="bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full p-1.5 flex items-center gap-1 border border-secondary-200 overflow-x-auto scrollbar-none snap-x touch-pan-x max-w-full">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`snap-start shrink-0 relative px-4 py-2.5 md:px-5 md:py-2.5 rounded-full flex flex-col md:flex-row items-center justify-center transition-colors ${
                    isActive ? 'text-secondary-900' : 'text-secondary-400 hover:text-secondary-900 hover:bg-secondary-50/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-primary-100 border border-primary-200/50 rounded-full shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={`relative z-10 w-[18px] h-[18px] md:w-5 md:h-5 ${isActive ? 'stroke-[2.5px] text-primary-700' : 'stroke-[2px]'}`} />
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative z-10 text-[10px] md:text-sm font-black tracking-tight mt-0.5 md:mt-0 md:ml-1.5 uppercase text-secondary-900"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </nav>
        </motion.div>
      </div>
    </div>
  );
}

