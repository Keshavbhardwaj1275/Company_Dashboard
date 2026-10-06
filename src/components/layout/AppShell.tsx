import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TopNavigation } from './TopNavigation';
import { WorkSessionBar } from './WorkSessionBar';
import { BottomNavigation } from './BottomNavigation';
import { AnimatedArtBackground } from '../background/AnimatedArtBackground';
import { ToastContainer } from '../common/Toast';
import { CommandPalette } from '../common/CommandPalette';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-2 sm:p-3 md:p-5 lg:p-6 font-sans overflow-x-hidden bg-[#EDEDED] dark:bg-[#070A13] selection:bg-[#FFE956] selection:text-[#111827]">
      {/* Outer Canvas Subtle Specular Light Streaks */}
      <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-white via-white/50 to-transparent" />
        <div className="absolute top-0 right-1/3 w-[1px] h-full bg-gradient-to-b from-white via-white/30 to-transparent" />
      </div>

      {/* Main Floating Application Shell (Radius 32px, Double Ring Border, Transparent Fill) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[1580px] rounded-[24px] sm:rounded-[28px] md:rounded-[32px] overflow-hidden flex flex-col app-frame-shell"
      >
        {/* Animated Art rendered INSIDE the frame, full-bleed */}
        <AnimatedArtBackground />

        {/* Slim Single-Row Top Navigation Bar (64px) */}
        <div className="relative z-40">
          <TopNavigation />
        </div>

        {/* Live Work Session & Activity Bar */}
        <div className="relative z-20">
          <WorkSessionBar />
        </div>

        {/* Dynamic Page Content View with calibrated padding and zero horizontal overflow */}
        <main className="relative z-10 flex-1 p-3 sm:p-4 md:p-5 pb-8 md:pb-6 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Visible on screens < md) */}
        <BottomNavigation />
      </motion.div>

      {/* Global Modals, Palettes & Notifications */}
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};
