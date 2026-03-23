import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthContainer from '../components/Auth/AuthContainer';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect for the background orbs based on mouse movement
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

  if (loading) {
    return (
      <div className="login-loading-screen">
        <div className="spinner-core" />
        <div className="spinner-ring" />
        <p>INITIALIZING SECURE UPLINK...</p>
        <style>{`
          .login-loading-screen { min-height: 100vh; background: #03050a; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; font-family: 'Inter', sans-serif; position: relative; overflow: hidden; }
          .spinner-core { width: 12px; height: 12px; background: #6366f1; border-radius: 50%; box-shadow: 0 0 20px #6366f1; animation: corePulse 1s ease-in-out infinite alternate; }
          .spinner-ring { position: absolute; width: 60px; height: 60px; border: 2px solid transparent; border-top-color: rgba(99,102,241,0.5); border-bottom-color: rgba(139,92,246,0.5); border-radius: 50%; animation: spin 1.5s linear infinite; }
          .login-loading-screen p { color: rgba(255,255,255,0.4); font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.3em; font-weight: 600; animation: pulseOpacity 2s infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes corePulse { 0% { transform: scale(0.8); box-shadow: 0 0 10px #6366f1; } 100% { transform: scale(1.2); box-shadow: 0 0 30px #8b5cf6; } }
          @keyframes pulseOpacity { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
        `}</style>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="premium-login-page">
      {/* ─── Immersive Animated Background ─── */}
      <div className="login-bg-layer">
        {/* Animated grid texture */}
        <div className="bg-grid"></div>
        
        {/* Dynamic floating orbs with parallax */}
        <div 
          className="bg-orb orb-primary" 
          style={{ transform: `translate(${mousePosition.x * -1.5}px, ${mousePosition.y * -1.5}px)` }}
        />
        <div 
          className="bg-orb orb-secondary"
          style={{ transform: `translate(${mousePosition.x * 1.5}px, ${mousePosition.y * 1.5}px)` }}
        />
        <div 
          className="bg-orb orb-accent"
          style={{ transform: `translate(${mousePosition.x * -0.5}px, ${mousePosition.y * 2}px)` }}
        />
        
        {/* Ambient overlay to smooth the gradients */}
        <div className="bg-ambient-overlay"></div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="login-content-wrapper">
        
        {/* ─── Brand identity ─── */}
        <div className="login-brand-header">
          <div className="brand-icon-wrapper">
            <div className="brand-icon-glow"></div>
            <img src="/ktt01_logo_square.png" alt="KTT01" className="brand-icon-img" onError={(e) => e.target.style.display='none'} />
            <div className="brand-scan-line"></div>
          </div>
          
          <h1 className="brand-title">KTT01</h1>
          <div className="brand-separator">
            <div className="sep-line"></div>
            <div className="sep-diamond"></div>
            <div className="sep-line"></div>
          </div>
          <p className="brand-subtitle">CYBERSECURE ENTERPRISE PLATFORM</p>
        </div>

        {/* ─── Auth Form ─── */}
        <div className="auth-container-wrapper">
          <AuthContainer />
        </div>

        {/* ─── Tech Footer ─── */}
        <div className="login-tech-footer">
          <div className="footer-copyright">
            © {new Date().getFullYear()} KTT01 GLOBAL OPERATIONS
          </div>
          <div className="footer-metrics">
            <div className="metric-item">
              <span className="metric-label">SYS_STATE</span>
              <span className="metric-value status-online">OPTIMIZED</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-label">ENCRYPTION</span>
              <span className="metric-value">AES-256-GCM</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-label">CONNECTION</span>
              <span className="metric-value">SECURE TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .premium-login-page {
          min-height: 100vh;
          background: #02040a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #fff;
        }

        /* Background Layers */
        .login-bg-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: radial-gradient(circle at 50% 0%, #0a0d17 0%, #02040a 100%);
        }

        .bg-grid {
          position: absolute;
          inset: -50%;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          background-position: center center;
          transform: perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px);
          animation: gridMove 20s linear infinite;
          opacity: 0.6;
        }

        @keyframes gridMove {
          0% { transform: perspective(1000px) rotateX(60deg) translateY(0) translateZ(-200px); }
          100% { transform: perspective(1000px) rotateX(60deg) translateY(60px) translateZ(-200px); }
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: floatOrb 15s ease-in-out infinite alternate;
          transition: transform 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
        }

        .orb-primary {
          top: -10%; left: -10%;
          width: 50vw; height: 50vw;
          background: radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0) 70%);
          animation-delay: -2s;
        }

        .orb-secondary {
          bottom: -20%; right: -10%;
          width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0) 70%);
          animation-duration: 20s;
        }

        .orb-accent {
          top: 30%; left: 40%;
          width: 30vw; height: 30vw;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0) 70%);
          animation-duration: 25s;
          animation-delay: -5s;
        }

        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 5%) scale(1.1); }
          100% { transform: translate(-5%, -5%) scale(0.9); }
        }

        .bg-ambient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(2,4,10,0.8) 100%);
          pointer-events: none;
        }

        /* Content Wrapper */
        .login-content-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          padding: 24px;
        }

        /* Brand Header */
        .login-brand-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
          animation: fadeSlideDown 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand-icon-wrapper {
          width: 80px; height: 80px;
          position: relative;
          margin-bottom: 24px;
          border-radius: 20px;
          background: rgba(13, 17, 23, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 0 40px rgba(99,102,241,0.2), inset 0 0 20px rgba(99,102,241,0.1);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }

        .brand-icon-glow {
          position: absolute;
          inset: -50%;
          background: conic-gradient(from 0deg, transparent 0%, rgba(99,102,241,0.3) 25%, transparent 50%);
          animation: spin 4s linear infinite;
        }

        .brand-icon-img {
          width: 48px; height: 48px;
          border-radius: 12px;
          position: relative; z-index: 2;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        .brand-scan-line {
          position: absolute;
          left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #fff, transparent);
          box-shadow: 0 0 10px #fff, 0 0 20px #6366f1;
          opacity: 0.8;
          z-index: 3;
          animation: scanLine 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes scanLine {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }

        .brand-title {
          font-size: 56px;
          font-weight: 900;
          letter-spacing: 0.15em;
          margin: 0;
          line-height: 1;
          background: linear-gradient(to bottom, #ffffff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 30px rgba(99,102,241,0.4));
          font-style: italic;
          padding-right: -0.15em; /* Fix letter spacing offset */
        }

        .brand-separator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
          width: 100%;
          max-width: 280px;
        }

        .sep-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent);
        }

        .sep-diamond {
          width: 6px; height: 6px;
          background: #6366f1;
          transform: rotate(45deg);
          box-shadow: 0 0 10px #6366f1;
        }

        .brand-subtitle {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.35em;
          color: #818cf8;
          text-transform: uppercase;
          margin: 0;
          text-shadow: 0 0 20px rgba(99,102,241,0.5);
        }

        /* Auth Container Animation Wrapper */
        .auth-container-wrapper {
          opacity: 0;
          animation: fadeZoomIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
          width: 100%;
          display: flex;
          justify-content: center;
          perspective: 1000px;
        }

        @keyframes fadeZoomIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px) rotateX(5deg); }
          to { opacity: 1; transform: scale(1) translateY(0) rotateX(0deg); }
        }

        /* Tech Footer */
        .login-tech-footer {
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          opacity: 0;
          animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .footer-copyright {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
        }

        .footer-metrics {
          display: flex;
          align-items: center;
          gap: 20px;
          background: rgba(255,255,255,0.02);
          padding: 8px 24px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
        }

        .metric-item {
          display: flex;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
        }

        .metric-label {
          color: rgba(99,102,241,0.6);
          font-weight: 600;
        }

        .metric-value {
          color: rgba(255,255,255,0.6);
          font-weight: 500;
        }

        .metric-value.status-online {
          color: #10b981;
          text-shadow: 0 0 10px rgba(16,185,129,0.5);
        }

        .metric-divider {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}
