import { motion, AnimatePresence } from 'motion/react';

interface TeacherAvatarProps {
  name: string;
  isSpeaking: boolean;
  isThinking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TeacherAvatar = ({ name, isSpeaking, isThinking, size = 'md' }: TeacherAvatarProps) => {
  const isPriya = name === 'Priya';
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-24 h-24 text-5xl',
    lg: 'w-40 h-40 text-7xl',
    xl: 'w-56 h-56 text-9xl'
  };

  return (
    <div className={`relative ${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} shrink-0 group`}>
      {/* Outer Pulse Glow */}
      <AnimatePresence>
        {(isSpeaking || isThinking) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              scale: isSpeaking ? [1, 1.2, 1] : [1, 1.05, 1],
              opacity: isSpeaking ? [0.2, 0.5, 0.2] : [0.1, 0.2, 0.1]
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: isSpeaking ? 0.6 : 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-[#F7E58D] blur-2xl md:blur-3xl"
          />
        )}
      </AnimatePresence>

      {/* Main Avatar Container */}
      <motion.div 
        animate={{ 
          y: isSpeaking ? [0, -4, 0] : [0, -2, 0],
          rotate: isSpeaking ? [0, 1, -1, 0] : [0, 0.5, -0.5, 0]
        }}
        transition={{ duration: isSpeaking ? 2 : 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full bg-white rounded-full border-4 border-[#F7E58D]/40 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-1"
      >
        <div className="relative w-full h-full flex items-center justify-center bg-[#F9F9F9] rounded-full overflow-hidden">
          {/* Subtle Background Particles for 'Premium' feel */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#F7E58D] rounded-full blur-[1px]" />
            <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-[#F7E58D] rounded-full blur-[1px]" />
          </div>

          {/* Face Elements Simulation */}
          <div className="relative flex flex-col items-center gap-1 md:gap-2">
            {/* Eyes */}
            <div className="flex gap-3 md:gap-5 mb-1">
              <motion.div 
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
                className="w-1.5 h-1.5 md:w-3 md:h-3 bg-[#111111] rounded-full" 
              />
              <motion.div 
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
                className="w-1.5 h-1.5 md:w-3 md:h-3 bg-[#111111] rounded-full" 
              />
            </div>

            {/* Mouth / Lip Sync */}
            <motion.div 
              animate={{ 
                height: isSpeaking ? [4, 12, 6, 10, 4] : 4,
                width: isSpeaking ? [12, 16, 14, 18, 12] : 12,
                borderRadius: isSpeaking ? "40%" : "50%"
              }}
              transition={{ duration: 0.2, repeat: isSpeaking ? Infinity : 0 }}
              className="bg-[#111111] opacity-60 rounded-full"
              style={{ width: size === 'sm' ? 8 : 24, height: size === 'sm' ? 2 : 6 }}
            />
          </div>

          {/* Character Emoji (Backup/Main Visual) */}
          <motion.div 
            animate={{ 
              scale: isSpeaking ? [1, 1.05, 1] : 1,
            }}
            className={`absolute flex items-center justify-center select-none ${sizeClasses[size].split(' ')[2]} pointer-events-none opacity-20`}
          >
            {isPriya ? '👩🏽‍🏫' : '👨🏽‍🏫'}
          </motion.div>
          
          {/* Animated Waveform Overlay for speaking */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: [10, 30, 10], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-[#F7E58D] rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Thinking Indicator */}
      <AnimatePresence>
        {isThinking && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 w-6 h-6 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-secondary-50"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 md:w-5 md:h-5 border-2 border-[#F7E58D] border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
