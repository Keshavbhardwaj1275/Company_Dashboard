import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const AnimatedMeshBackground: React.FC = () => {
  // Smooth mouse follower with spring physics for subtle interactive spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 90 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 60;
      const y = (e.clientY / innerHeight - 0.5) * 60;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#f4f6f9] dark:bg-[#070a13] transition-colors duration-700">
      {/*
        FlowSphere Liquid Organic Ambient Background
        Inspired by Orbix Studio OpsPulse SaaS Dashboard Design
      */}

      {/* SVG Noise Texture for ultra-clean filmic grain */}
      <svg className="hidden">
        <filter id="grain-filter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.05 0" />
        </filter>
      </svg>

      {/* Interactive Floating Mouse Ambient Glow */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-amber-400/25 via-cyan-400/20 to-purple-400/20 blur-[130px] opacity-70 dark:opacity-30 pointer-events-none will-change-transform"
      />

      {/* BLOB 1: Sunlit Amber & Radiant Tangerine (Top Right / Center Flow) */}
      <div className="absolute -top-[15%] right-[10%] w-[820px] h-[820px] animate-blob-morph-1 will-change-transform opacity-85 dark:opacity-40">
        <div className="w-full h-full rounded-[42%_58%_70%_30%/45%_45%_55%_55%] bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#ea580c] blur-[110px] filter" />
      </div>

      {/* BLOB 2: Fresh Mint & Emerald Aura (Upper Left / Mid Flow) */}
      <div className="absolute top-[8%] -left-[14%] w-[880px] h-[880px] animate-blob-morph-2 will-change-transform opacity-80 dark:opacity-35">
        <div className="w-full h-full rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-gradient-to-tr from-[#10b981] via-[#34d399] to-[#06b6d4] blur-[120px] filter" />
      </div>

      {/* BLOB 3: Deep Azure & Electric Sapphire (Bottom Right Flow) */}
      <div className="absolute -bottom-[20%] right-[4%] w-[940px] h-[940px] animate-blob-morph-3 will-change-transform opacity-75 dark:opacity-35">
        <div className="w-full h-full rounded-[35%_65%_60%_40%/50%_40%_60%_50%] bg-gradient-to-tl from-[#2563eb] via-[#38bdf8] to-[#06b6d4] blur-[130px] filter" />
      </div>

      {/* BLOB 4: Radiant Lavender, Violet & Coral Peach (Bottom Left / Center Accent) */}
      <div className="absolute bottom-[2%] left-[10%] w-[760px] h-[760px] animate-blob-morph-1 will-change-transform opacity-70 dark:opacity-30">
        <div className="w-full h-full rounded-[50%_50%_30%_70%/40%_60%_40%_60%] bg-gradient-to-tr from-[#8b5cf6] via-[#ec4899] to-[#f97316] blur-[115px] filter" />
      </div>

      {/* BLOB 5: Core Warm Peach / Rose Floating Node (Center Ambient Drift) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 0.95, 1.08, 1],
          opacity: [0.45, 0.65, 0.4, 0.6, 0.45],
          rotate: [0, 45, 90, 180, 360],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[35%] left-[42%] w-[580px] h-[580px] rounded-full bg-gradient-to-r from-amber-300/40 via-rose-300/35 to-violet-300/30 blur-[105px] will-change-transform dark:opacity-20"
      />

      {/* Ambient Top Light Reflection Sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-white/20 dark:from-transparent dark:to-transparent pointer-events-none" />

      {/* Subtle Micro-Noise Overlay Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.85) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
