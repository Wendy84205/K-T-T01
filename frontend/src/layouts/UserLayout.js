import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MfaSetupBanner from '../components/MfaSetupBanner';
import E2EESecurityGate from '../components/Auth/E2EESecurityGate';

export default function UserLayout() {
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="premium-app-layout">
      {/* Immersive Animated Background */}
      <div className="layout-bg-layer">
        <div className="bg-grid"></div>
        <div 
          className="bg-orb orb-primary" 
          style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}
        />
        <div 
          className="bg-orb orb-secondary"
          style={{ transform: `translate(${mousePosition.x * 1}px, ${mousePosition.y * 1}px)` }}
        />
        <div className="bg-ambient-overlay"></div>
      </div>

      {/* Main App Container */}
      <div className="layout-content-wrapper">
        <E2EESecurityGate>
          <MfaSetupBanner user={user} />
          <main className="layout-main-panel">
             <Outlet />
          </main>
        </E2EESecurityGate>
      </div>

      <style>{`
        .premium-app-layout {
          min-height: 100vh;
          background: #02040a;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          color: #fff;
        }

        /* Background Layers */
        .layout-bg-layer {
          position: fixed; /* Fixed so it persists during scroll */
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: radial-gradient(circle at 50% 0%, #0a0d17 0%, #02040a 100%);
        }

        .bg-grid {
          position: absolute;
          inset: -50%;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          background-position: center center;
          transform: perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px);
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: perspective(1000px) rotateX(60deg) translateY(0) translateZ(-200px); }
          100% { transform: perspective(1000px) rotateX(60deg) translateY(60px) translateZ(-200px); }
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.35;
          animation: floatOrb 20s ease-in-out infinite alternate;
          transition: transform 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
        }

        .orb-primary {
          top: -20%; left: -10%;
          width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0) 70%);
        }

        .orb-secondary {
          bottom: -30%; right: -20%;
          width: 70vw; height: 70vw;
          background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0) 70%);
          animation-delay: -5s;
        }

        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, 3%) scale(1.05); }
          100% { transform: translate(-3%, -3%) scale(0.95); }
        }

        .bg-ambient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(2,4,10,0.9) 100%);
          pointer-events: none;
        }

        /* Content Wrappers */
        .layout-content-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        .layout-main-panel {
          flex: 1;
          height: 100%;
          background: padding-box transparent; /* Make background transparent to see orbs */
        }

        /* Global overrides for User pages to enable glassmorphism */
        /* Since User pages heavily use bg-[var(--bg-main)] etc, we override them globally when inside this layout */
        .layout-main-panel .bg-\\[var\\(--bg-main\\)\\] {
           background: rgba(13, 17, 26, 0.45) !important;
           backdrop-filter: blur(24px) saturate(150%);
           -webkit-backdrop-filter: blur(24px) saturate(150%);
           border-color: rgba(255,255,255,0.08) !important;
        }
        
        .layout-main-panel .bg-\\[var\\(--bg-light\\)\\] {
           background: rgba(255, 255, 255, 0.03) !important;
        }

        .layout-main-panel .bg-\\[var\\(--bg-app\\)\\] {
           background: transparent !important;
        }
      `}</style>
    </div>
  );
}
