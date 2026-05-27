import React, { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Shield, Sparkles, AlertCircle } from "lucide-react";
import { ADMOB_CONFIG } from "../lib/AdMobService";

interface NativeAdProps {
  placement: "study_cards" | "ai_answers" | "leaderboard" | "social_feed";
  className?: string;
}

export const NativeAd: React.FC<NativeAdProps> = ({ placement, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNative, setIsNative] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [dimensions, setDimensions] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    setIsOnline(navigator.onLine);

    // Online/offline tracking listeners
    const checkOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", checkOnline);
    window.addEventListener("offline", checkOnline);

    if (!containerRef.current) return;

    // Track coordinates of the container for native overlay mapping
    const updateCoordinates = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      
      setDimensions({
        top: rect.top + scrollY,
        left: rect.left + scrollX,
        width: rect.width,
        height: rect.height
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCoordinates();
    });
    
    resizeObserver.observe(containerRef.current);
    updateCoordinates();

    // Re-check coordinates on scroll
    window.addEventListener("scroll", updateCoordinates, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("online", checkOnline);
      window.removeEventListener("offline", checkOnline);
      window.removeEventListener("scroll", updateCoordinates);
    };
  }, []);

  // 1. OFFLINE COMPONENT VIEW
  if (!isOnline) {
    return (
      <div 
        id={`native-ad-offline-${placement}`}
        className={`neo-glass rounded-3xl p-5 border border-amber-500/20 bg-amber-950/10 flex flex-col items-center text-center gap-2 ${className}`}
      >
        <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />
        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">Ad Block Offline Node</h4>
        <p className="text-[10px] text-gray-400 max-w-sm">
          Please connect to the internet to load real-time Google Native Ads.
        </p>
      </div>
    );
  }

  // 2. WEB BROWSER MODE VIEW (Saves invalid clicks & implements clean glassmorphic placeholder)
  if (!isNative) {
    return (
      <div 
        ref={containerRef}
        id={`native-ad-placeholder-${placement}`}
        className={`neo-glass rounded-[28px] border border-white/5 bg-black/40 p-6 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/20 shadow-xl ${className}`}
      >
        {/* Futury matrix overlay accents */}
        <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex gap-3.5 items-start sm:items-center">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[8px] bg-cyan-400/10 text-cyan-400 font-mono font-black py-0.5 px-2 rounded-full uppercase border border-cyan-400/20">
                  Google AdMob
                </span>
                <span className="text-gray-500 font-mono text-[9px]">ID: .../2904587862</span>
              </div>
              <h4 className="text-[13px] font-black font-sans text-white uppercase tracking-tight">
                NexaLearn Premium Sponsor Segment
              </h4>
              <p className="text-[10px] text-gray-400 max-w-lg leading-relaxed">
                Real Native ad rendering is bound coordinates-wise to this view grid frame inside the final Android APK build.
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col gap-1 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-xl font-mono text-[8px] text-gray-500 text-center uppercase">
            <span className="text-[#CCFF00] font-black">NATIVE BOX</span>
            <span>{placement.replace("_", " ")}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. NATIVE APK OVERLAY ANCHOR (Transparent bounding box mapped by Java overlay controller)
  return (
    <div 
      ref={containerRef}
      id={`native-ad-anchor-${placement}`}
      className={`relative bg-transparent select-none w-full min-h-[100px] border border-dashed border-[#CCFF00]/10 rounded-2xl ${className}`}
      data-admob-id={ADMOB_CONFIG.NATIVE_AD_ID}
      data-admob-placement={placement}
    >
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded border border-white/10 text-[8px] font-mono text-gray-400 uppercase pointer-events-none">
        <Sparkles className="w-2.5 h-2.5 text-[#CCFF00]" />
        <span>Native Sponsor Space Running</span>
      </div>
    </div>
  );
};
