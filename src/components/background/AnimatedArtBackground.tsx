import React, { useState, useEffect } from 'react';

export const AnimatedArtBackground: React.FC = () => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Gentle, subtle parallax damping (max 8px shift)
      const x = ((e.clientX / window.innerWidth) - 0.5) * 12;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 12;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#F4F7F6] dark:bg-[#070B18] transition-colors duration-700 select-none"
      style={{
        transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      {/* 1. Base Soft Atmospheric Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/20 dark:from-white/5 pointer-events-none" />

      {/* 2. Shape 1: Large Luminous Warm Gold & Amber Flowing Wave (Left-Center to Right) */}
      <div className="absolute top-[-5%] -left-[10%] w-[58vw] max-w-[860px] aspect-[4/3] rounded-[48%_52%_68%_32%/42%_58%_42%_58%] animate-fluid-1 will-change-transform opacity-75 dark:opacity-30">
        <div 
          className="w-full h-full rounded-full blur-[32px] sm:blur-[44px]"
          style={{
            background: 'radial-gradient(circle at 35% 40%, #FEF08A 0%, #FDE047 30%, #F59E0B 70%, #D97706 100%)',
          }}
        />
      </div>

      {/* 3. Shape 2: Signature Dark Navy & Cyan Organic Contour Ribbon (Center & Upper Arc) */}
      <svg
        className="absolute top-[2%] left-[10%] w-[780px] h-[780px] animate-ribbon will-change-transform opacity-60 dark:opacity-40"
        viewBox="0 0 780 780"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="navyRibbonGrad" x1="10%" y1="20%" x2="90%" y2="80%">
            <stop offset="0%" stopColor="#0B1E36" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#0369A1" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </linearGradient>
          <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Deep Navy/Cyan Fluid Sweep */}
        <path
          d="M 120,480 C 220,180 440,120 620,240 C 720,310 680,560 520,620 C 360,680 180,620 120,480 Z"
          stroke="url(#navyRibbonGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="450 650"
          filter="url(#ribbonGlow)"
          className="will-change-transform"
        />

        {/* Secondary Delicate Accent Curve */}
        <path
          d="M 180,380 C 260,160 520,160 640,320"
          stroke="#0F2D54"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="280 400"
          className="filter blur-[3px]"
        />
      </svg>

      {/* 4. Shape 3: Soft Emerald & Mint Green Organic Swell (Upper-Right to Center) */}
      <div className="absolute top-[8%] -right-[8%] w-[50vw] max-w-[760px] aspect-[5/4] rounded-[55%_45%_42%_58%/58%_42%_58%_42%] animate-fluid-3 will-change-transform opacity-70 dark:opacity-25">
        <div 
          className="w-full h-full rounded-full blur-[36px] sm:blur-[48px]"
          style={{
            background: 'radial-gradient(circle at 60% 35%, #86EFAC 0%, #34D399 35%, #10B981 70%, #047857 100%)',
          }}
        />
      </div>

      {/* 5. Shape 4: Sky Blue & Pale Cyan Translucent Sea (Lower-Right) */}
      <div className="absolute -bottom-[12%] right-[4%] w-[48vw] max-w-[720px] aspect-square rounded-[62%_38%_54%_46%/48%_62%_38%_52%] animate-fluid-4 will-change-transform opacity-65 dark:opacity-25">
        <div 
          className="w-full h-full rounded-full blur-[40px] sm:blur-[52px]"
          style={{
            background: 'radial-gradient(circle at 45% 55%, #BAE6FD 0%, #38BDF8 40%, #0284C7 75%, #0369A1 100%)',
          }}
        />
      </div>

      {/* 6. Shape 5: Soft Amber & Warm Peach Undercurrent (Bottom-Left) */}
      <div className="absolute -bottom-[10%] left-[8%] w-[42vw] max-w-[620px] aspect-[4/3] rounded-[45%_55%_60%_40%/50%_45%_55%_50%] animate-fluid-5 will-change-transform opacity-55 dark:opacity-20">
        <div 
          className="w-full h-full rounded-full blur-[38px] sm:blur-[48px]"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #FED7AA 0%, #FDBA74 40%, #FB923C 80%, #EA580C 100%)',
          }}
        />
      </div>

      {/* 7. Shape 6: Subtle Lavender & Soft Violet Ambient Whisper (Center Floating) */}
      <div className="absolute top-[35%] left-[30%] w-[32vw] max-w-[480px] aspect-square rounded-full animate-fluid-2 will-change-transform opacity-35 dark:opacity-15">
        <div 
          className="w-full h-full rounded-full blur-[50px]"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #E9D5FF 0%, #C084FC 50%, #818CF8 100%)',
          }}
        />
      </div>

      {/* 8. Fine Specular Micro-Texture (Eliminates color banding on 4K/retina screens) */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.85) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
