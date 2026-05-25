import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Tv, Play, Coins, Sparkles, Clock, Calendar, CheckCircle, Volume2, VolumeX, 
  Info, X, Lock, Unlock, Zap, Shield, Flame, RotateCw, Trophy
} from "lucide-react";
import { UserProfile } from "../types";
import { syncAdSessionToFirestore, getAdSessionsFromFirestore } from "../lib/firebase";

// Types for Watch & Earn State
interface WatchAndEarnProps {
  profile: UserProfile;
  saveProfileWithParams: (newProf: UserProfile, ...args: any[]) => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
}

// Creative mock academic-cyberpunk advertisements with real looping MP4 streams
interface MockAd {
  id: string;
  client: string;
  headline: string;
  description: string;
  gradient: string;
  accentText: string;
  interactiveChallenge: string;
  videoUrl: string;
}

const MOCK_ADS: MockAd[] = [
  {
    id: "nexa_neural_sync",
    client: "✨ NEXAMIND NEURAL LABS",
    headline: "AI Cybernetic Study Injector v4.9",
    description: "Tired of studying? Stream algebraic equations into your prefrontal cortex via direct neuro-quantum sync logs. Boost retention coefficient up to 450%!",
    gradient: "from-[#2E5BFF] via-[#1E114D] to-black",
    accentText: "text-blue-400",
    interactiveChallenge: "Connecting neuro-receivers...",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    id: "quantum_algebra_booster",
    client: "📐 QUANTUM CHEAT ENGINE",
    headline: "NexaSnap Premium Exam Predictor Node",
    description: "Leverage advanced matrix-tensor calculus vectors to foretell complex academic grading vectors up to 90 days in advance. Fully approved by local virtual nodes.",
    gradient: "from-[#7B61FF] via-[#350259] to-black",
    accentText: "text-purple-400",
    interactiveChallenge: "Initializing neural grade predictor...",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    id: "solar_study_recharge",
    client: "⚡ GIGA-PLUGS CORP",
    headline: "Solar Proton Energy Booster Drink",
    description: "The official academic energy drink with standard radioactive glucose formula. Specially calibrated for late-night compiler refactoring sessions.",
    gradient: "from-orange-600/30 via-red-950 to-black",
    accentText: "text-orange-400",
    interactiveChallenge: "Uncapping atomic energy fuel core...",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
  },
  {
    id: "meta_validator_nodes",
    client: "💎 NEXACHAIN FINANCE",
    headline: "Run Nexa Nodes & Secure the Grid",
    description: "Earn passive digital gas tokens by signing off academic achievement blocks. Connect your learning profile as a dynamic academic validator node today.",
    gradient: "from-emerald-600/30 via-teal-950 to-black",
    accentText: "text-emerald-400",
    interactiveChallenge: "Syncing verified academic blocks...",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
  }
];

export const WatchAndEarnConsole: React.FC<WatchAndEarnProps> = ({
  profile,
  saveProfileWithParams,
  addNotification
}) => {
  // Cooldown countdown state
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [activeAd, setActiveAd] = useState<MockAd | null>(null);
  const [adTimer, setAdTimer] = useState<number>(15);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Mutex defaulted for robust auto-play compatibility
  const [adFinished, setAdFinished] = useState<boolean>(false);
  
  // Real or interactive video playback loaders
  const [videoLoading, setVideoLoading] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Daily cap state tracking
  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(0);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [earnedCoinsAnimList, setEarnedCoinsAnimList] = useState<{ id: number; left: number; delay: number }[]>([]);

  // Earnings History State
  const [adSessions, setAdSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);

  // Simulation parameters
  const AD_DURATION = 15; // 15 seconds ad countdown
  const COOLDOWN_DURATION = 15; // 15 seconds wait timer
  const DAILY_MAX_ADS = 4; // Limit to 4 ads watchable per node daily (yielding 40.0 NEXA daily)
  const REWARD_RATE = 10; // Earn 10 NEXA coins per watched ad

  // Hybrid telemetry visual rendering thread
  useEffect(() => {
    if (!activeAd || !videoError) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = canvas.width = canvas.parentElement?.clientWidth || 400;
    let height = canvas.height = canvas.parentElement?.clientHeight || 230;

    const particles: Array<{ x: number; y: number; speedY: number; radius: number; color: string }> = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: 0.6 + Math.random() * 1.4,
        radius: 1 + Math.random() * 2.5,
        color: i % 2 === 0 ? "rgba(204, 255, 0, 0.4)" : "rgba(34, 211, 238, 0.4)"
      });
    }

    const draw = () => {
      ctx.fillStyle = "rgba(7, 10, 20, 0.12)";
      ctx.fillRect(0, 0, width, height);

      // Cyber scan grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.y -= p.speedY;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
      });

      // Scanline bar
      ctx.fillStyle = "rgba(34, 211, 238, 0.04)";
      ctx.fillRect(0, (Math.sin(Date.now() / 250) * 0.5 + 0.5) * height, width, 5);

      // Pulsing telemetry circles
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 40 + Math.sin(Date.now() / 120) * 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(204, 255, 0, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 10]);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 20 + Math.cos(Date.now() / 100) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.restore();

      // UI Text Metrics
      ctx.fillStyle = "#CCFF00";
      ctx.font = "bold 10px monospace";
      ctx.fillText("NEXA DIGITAL TELEMETRY CORE", 20, 30);
      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText("VIDEO STREAM DEVIATION DETECTED", 20, 45);
      ctx.fillText("ENGAGING INTERACTIVE GRID GENERATOR", 20, 58);
      
      ctx.fillStyle = "#06b6d4";
      ctx.fillText(`MEM: ${(Math.sin(Date.now() / 1000) * 10 + 80).toFixed(2)} MB`, 20, height - 25);
      ctx.fillText("LINK: 1.48 GHz SECURE_ACTIVE", 20, height - 12);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeAd, videoError]);

  // Sync isMuted state with actual video element muted attribute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, activeAd]);

  // Fetch ad viewing history
  const fetchSessions = async () => {
    if (!profile.username) return;
    setLoadingSessions(true);
    try {
      const data = await getAdSessionsFromFirestore(profile.username);
      setAdSessions(data);
    } catch (e) {
      console.error("Error loading ad sessions:", e);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Persistent local cache loads for Daily Trackers
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const watchedKey = `watch_earn_ads_count_${profile.username}_${todayStr}`;
    const storedCount = localStorage.getItem(watchedKey);
    if (storedCount) {
      setAdsWatchedToday(parseInt(storedCount, 10));
    }

    // Load active cooldown timestamp fallback
    const cooldownEnd = localStorage.getItem(`watch_earn_cooldown_${profile.username}`);
    if (cooldownEnd) {
      const remaining = Math.ceil((parseInt(cooldownEnd, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldownRemaining(remaining);
      }
    }

    // Async reload ad reward logs ledger
    fetchSessions();
  }, [profile.username]);

  // Timers thread
  useEffect(() => {
    let watchTimerId: NodeJS.Timeout | null = null;
    let cooldownTimerId: NodeJS.Timeout | null = null;

    if (activeAd && adTimer > 0) {
      watchTimerId = setTimeout(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            setAdFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (cooldownRemaining > 0) {
      cooldownTimerId = setTimeout(() => {
        setCooldownRemaining((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (watchTimerId) clearTimeout(watchTimerId);
      if (cooldownTimerId) clearTimeout(cooldownTimerId);
    };
  }, [activeAd, adTimer, cooldownRemaining]);

  // Triggers visual coins rain waterfall helper
  const triggerCelebration = () => {
    setShowCelebration(true);
    setEarnedCoinsAnimList(
      Array.from({ length: 18 }).map((_, i) => ({
        id: Date.now() + i,
        left: 10 + Math.random() * 80, // percentage offset
        delay: Math.random() * 0.8
      }))
    );
    
    setTimeout(() => {
      setShowCelebration(false);
      setEarnedCoinsAnimList([]);
    }, 4000);
  };

  // Launch simulated full-screen ad
  const handleWatchAd = () => {
    if (cooldownRemaining > 0) {
      addNotification(
        "COOLDOWN ACTIVE 🛰️",
        `Ad network links are recalibrating. Please wait ${cooldownRemaining}s before watching the next module.`,
        "alert"
      );
      return;
    }

    if (adsWatchedToday >= DAILY_MAX_ADS) {
      addNotification(
        "DAILY AD LIMIT REACHED 🛑",
        "Your student node has synchronized the maximum allowed daily digital advertisement segments.",
        "alert"
      );
      return;
    }

    // Select random ad script to rotate
    const randAd = MOCK_ADS[Math.floor(Math.random() * MOCK_ADS.length)];
    setActiveAd(randAd);
    setAdTimer(AD_DURATION);
    setAdFinished(false);
    setVideoLoading(true);
    setVideoError(false);
  };

  // Complete ad flow rewards processor
  const handleCloseAd = () => {
    if (!adFinished) return; // Prevent skipping logic

    const todayStr = new Date().toISOString().split("T")[0];
    const rawNextCoins = (profile.coins || 0) + REWARD_RATE;

    // Increment daily local tracked records
    const nextCount = adsWatchedToday + 1;
    setAdsWatchedToday(nextCount);
    
    const watchedKey = `watch_earn_ads_count_${profile.username}_${todayStr}`;
    localStorage.setItem(watchedKey, nextCount.toString());

    // Write update back globally via main state
    const nextProfile: UserProfile = {
      ...profile,
      coins: rawNextCoins
    };

    // Trigger local state updates to Firestore & localStorage
    saveProfileWithParams(nextProfile);

    // Write session transaction log
    if (activeAd) {
      const sessionId = `ad_view_${Date.now()}`;
      const sessionData = {
        timestamp: new Date().toISOString(),
        coinsEarned: REWARD_RATE,
        adId: activeAd.id,
        headline: activeAd.headline,
        client: activeAd.client
      };
      // Optimistic state update
      setAdSessions(prev => [ { id: sessionId, ...sessionData }, ...prev ].slice(0, 10));
      
      syncAdSessionToFirestore(profile.username, sessionId, sessionData).then(() => {
        fetchSessions();
      }).catch(err => {
        console.error("Error storing ad session:", err);
      });
    }

    // Trigger cool 30-seconds cooldown
    const cooldownEndTime = Date.now() + COOLDOWN_DURATION * 1000;
    localStorage.setItem(`watch_earn_cooldown_${profile.username}`, cooldownEndTime.toString());
    setCooldownRemaining(COOLDOWN_DURATION);

    // Terminate ad screen
    setActiveAd(null);

    // Visual balance refreshing animation and coins rain
    setIsRefreshingBalance(true);
    triggerCelebration();

    setTimeout(() => {
      setIsRefreshingBalance(false);
    }, 1500);

    addNotification(
      "NEXA CREDITED! 💎",
      `Successfully watched standard educational sponsor ad! Received +${REWARD_RATE} NEXA.`,
      "success"
    );
  };

  const forceRefresh = () => {
    setIsRefreshingBalance(true);
    setTimeout(() => setIsRefreshingBalance(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-cyan-500/10 via-[#2E5BFF]/10 to-transparent p-6 md:p-8 rounded-[32px] border border-cyan-500/20 shadow-inner">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest font-black">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Nexa Ad Reward Portal
          </div>
          <h2 className="text-3xl font-black text-white mt-2 tracking-tight uppercase">
            Watch Video Ads & <span className="text-[#CCFF00]">Earn Nexa (NEXA)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
            Claim free token rewards instantly. Earn +10.0 NEXA coins per 15s sponsored video ad (Max 40.0 NEXA daily).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl py-2 px-4 flex items-center gap-2 font-mono text-xs">
            <Calendar className="w-4 h-4 text-[#CCFF00]" />
            <span className="text-gray-400">Limit: </span>
            <span className="font-bold text-white">{DAILY_MAX_ADS} Ads/Day (40.0 NEXA Max)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
        {/* MAIN CONSOLE PANEL - Left 7 columns */}
        <div className="md:col-span-7 space-y-6">
          <div className="neo-glass rounded-[35px] p-6 sm:p-8 border-white/5 space-y-6 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
            {/* Background cyber ambient rings */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#CCFF00] font-mono whitespace-nowrap">
                    Active Node Protocol
                  </span>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">Watch Channel 01</p>
                </div>
                <button 
                  onClick={forceRefresh}
                  className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Check Network Ping"
                >
                  <RotateCw className={`w-4 h-4 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Big Interactive Balance Ring Card */}
              <div className="bg-black/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono flex items-center justify-center sm:justify-start gap-1">
                    <Coins className="w-3.5 h-3.5 text-[#CCFF00]" /> CURRENT NEXA BALANCE
                  </span>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                    <motion.span 
                      key={profile.coins}
                      initial={{ scale: 0.8, color: "#CCFF00" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      className="text-4xl sm:text-5xl font-black text-white tracking-tighter"
                    >
                      {profile.coins.toFixed(1)}
                    </motion.span>
                    <span className="text-xs font-black text-[#CCFF00] font-mono tracking-widest">NEXA</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto bg-white/5 px-4 py-3 rounded-2xl border border-white/5 justify-center">
                  <div className="text-center">
                    <span className="text-[9px] text-gray-400 uppercase font-mono block">Node Link Rating</span>
                    <span className="text-sm font-extrabold text-[#CCFF00] font-mono">1.48 GHz PING</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BUTTON CONTROL MATRIX */}
            <div className="space-y-4 pt-4 relative z-10">
              <div className="text-center space-y-1">
                <p className="text-xs font-black text-white/90">
                  ⚡ Watch 1 clip limit to claim reward
                </p>
                <p className="text-[11px] text-[#CCFF00] font-mono uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Earn +10.0 NEXA per watched video
                </p>
              </div>

              {cooldownRemaining > 0 ? (
                <button
                  disabled
                  className="w-full py-4.5 rounded-2xl bg-white/5 text-gray-400/80 font-mono text-sm uppercase tracking-widest font-black border border-white/10 flex items-center justify-center gap-3 select-none"
                >
                  <Clock className="w-4 h-4 animate-spin text-[#CCFF00]" />
                  Recalibrating Node: {cooldownRemaining}s
                </button>
              ) : adsWatchedToday >= DAILY_MAX_ADS ? (
                <button
                  disabled
                  className="w-full py-4.5 rounded-2xl bg-red-950/20 border border-red-500/20 text-red-400 font-mono text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  Max Daily Ad-Token Yield Reached
                </button>
              ) : (
                <button
                  onClick={handleWatchAd}
                  className="w-full py-4.5 font-bold rounded-2xl bg-gradient-to-r from-[#2E5BFF] via-[#7B61FF] to-[#CCFF00] hover:scale-[1.01] active:scale-[0.99] text-white text-sm tracking-wider font-mono uppercase flex items-center justify-center gap-3 transition-all cursor-pointer shadow-[0_10px_30px_rgba(46,91,255,0.3)] border-none"
                >
                  <Tv className="w-5 h-5 text-[#CCFF00] animate-bounce" />
                  🖥️ Watch Ad & Earn Nexa
                </button>
              )}

              {/* Progress Bar inside Main Console */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-mono uppercase">Daily Tracker Node:</span>
                  <span className="font-extrabold text-[#CCFF00] font-mono">{adsWatchedToday} / {DAILY_MAX_ADS} watch yields</span>
                </div>
                <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-[#CCFF00] rounded-full transition-all duration-500"
                    style={{ width: `${(adsWatchedToday / DAILY_MAX_ADS) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight italic">
                  Reset occurs everyday at UTC 00:00:00 (Local Time active). Optimize your watch yields daily!
                </p>
              </div>
            </div>
          </div>

          {/* EARNINGS HISTORY LEDGER */}
          <div className="neo-glass rounded-[35px] p-6 border-white/5 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#CCFF00]" />
                <div>
                  <h4 className="text-xs uppercase font-mono font-black text-white tracking-widest">
                    Ad Earnings Ledger
                  </h4>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Verified blockchain transaction receipts (Last 10 sessions)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchSessions}
                disabled={loadingSessions}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-[#CCFF00] active:scale-[0.98] transition-all disabled:opacity-50"
                title="Sync Receipts Ledger"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingSessions ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingSessions && adSessions.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Syncing node receipts ledger...</p>
              </div>
            ) : adSessions.length === 0 ? (
              <div className="py-8 text-center space-y-1 bg-black/20 rounded-2xl border border-white/5">
                <p className="text-xs font-bold text-gray-400 uppercase font-mono">No receipts verified</p>
                <p className="text-[10px] text-gray-500 font-mono leading-relaxed mt-1">
                  Claim your first ad to register cryptographic tokens on Firebase.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {adSessions.slice(0, 10).map((session, idx) => (
                  <div
                    key={session.id || idx}
                    className="p-3 bg-black/30 hover:bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[11px] font-extrabold text-white truncate uppercase tracking-tight block">
                          {session.client || "Sponsor Ad"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-gray-400 font-mono leading-none mt-1">
                        <span>ID: {String(session.id || "").replace("ad_view_", "").slice(0, 10)}</span>
                        <span>•</span>
                        <span>
                          {(() => {
                            try {
                              const d = new Date(session.timestamp);
                              return d.toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit"
                              });
                            } catch (_) {
                              return session.timestamp || "just now";
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-[#CCFF00] font-mono whitespace-nowrap bg-[#CCFF00]/10 border border-[#CCFF00]/20 py-1 px-2.5 rounded-xl block">
                        +{session.coinsEarned || 10}.0 NEXA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[9px] font-mono text-gray-500 italic text-center">
              🔒 Safe cryptographic logs linked directly to Firestore index bounds.
            </p>
          </div>
        </div>

        {/* SIDE BAR ACHIEVEMENTS & AD NETWORK SPEC - Right 5 columns */}
        <div className="md:col-span-5 space-y-6">
          {/* ACADEMIC BONUS BOOSTERS */}
          <div className="neo-glass rounded-[35px] p-6 border-white/5 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Sponsor Multiplier Buffs</h4>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#2E5BFF]/10 text-[#2E5BFF] flex items-center justify-center text-xs font-black">
                    N+
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Nexa Plus Nodes</h5>
                    <p className="text-[10px] text-gray-400 font-mono">1.5x Premium Yield Mult</p>
                  </div>
                </div>
                <span className="text-gray-500 text-xs font-bold">LOCKED</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <Flame className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Streak Bonus Active</h5>
                    <p className="text-[10px] text-gray-400 font-mono">Streak &gt; 5 active node</p>
                  </div>
                </div>
                <span className="text-[#CCFF00] text-[10px] font-mono font-bold">+10% XP BOOS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN VIDEO AD PLAYER OVERLAY MODAL */}
      <AnimatePresence>
        {activeAd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#00050c]/98 z-[200] overflow-hidden flex flex-col justify-between p-6 md:p-10 select-none cursor-default"
          >
            {/* Top Grid Status Indicators */}
            <div className="flex justify-between items-center relative z-20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#CCFF00] font-mono bg-[#CCFF00]/10 px-2 py-1 rounded border border-[#CCFF00]/20">
                  🔴 Google AdMob Live Feed
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Audio sound toggler */}
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Secure count-down status indicator */}
                <div className="px-4 py-2 bg-black/60 text-white font-mono font-bold text-xs rounded-full border border-white/10 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>{adTimer > 0 ? `Ad finishes in ${adTimer}s` : "Reward Ready"}</span>
                </div>

                {/* CLOSE AD BUTTON */}
                {adFinished ? (
                  <motion.button 
                    initial={{ scale: 0.8, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    onClick={handleCloseAd}
                    className="py-2.5 px-5 bg-[#CCFF00] text-black font-black text-xs rounded-full flex items-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.4)] border-none select-none transition-transform hover:scale-105 active:scale-95 cursor-pointer uppercase font-mono tracking-wider animate-pulse"
                  >
                    <span>Claim Reward</span> <X className="w-4 h-4 stroke-[3px]" />
                  </motion.button>
                ) : (
                  <button 
                    disabled 
                    className="py-2.5 px-5 bg-white/5 border border-white/10 text-gray-400 font-mono text-xs rounded-full flex items-center gap-1.5 cursor-not-allowed select-none opacity-80"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Locked ({adTimer}s)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Middle Main Mock Advert Container Block */}
            <div className="w-full max-w-6xl mx-auto my-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
              
              {/* VIDEO AD PLAYER FRAME COMPONENT - Left 7 columns */}
              <div className="lg:col-span-7 bg-black/90 rounded-[32px] border border-white/10 relative overflow-hidden flex flex-col justify-center min-h-[240px] sm:min-h-[380px] shadow-2xl">
                
                {/* Visual scan overlay bar */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400/30 shadow-[0_0_8px_rgba(34,211,238,0.8)] z-10 pointer-events-none animate-pulse" />
                
                {/* HTML5 video element source or Canvas telemetry stream layout */}
                {videoError ? (
                  <div className="w-full h-full min-h-[240px] sm:min-h-[380px] relative flex items-center justify-center bg-slate-950">
                    <canvas ref={canvasRef} className="w-full h-full absolute inset-0 opacity-80" />
                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 p-3 rounded-xl border border-white/10 flex items-center gap-2.5 font-mono text-[10px] text-cyan-400">
                      <Shield className="w-4 h-4 text-[#CCFF00] animate-bounce" />
                      <span>OFFLINE STREAM ACTIVE: Cyber telemetry rendering</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[240px] sm:min-h-[380px] bg-black relative flex items-center justify-center">
                    {videoLoading && (
                      <div className="absolute inset-0 bg-slate-950 flex flex-col justify-center items-center gap-3 font-mono z-10">
                        <div className="w-8 h-8 rounded-full border-2 border-[#CCFF00] border-t-transparent animate-spin" />
                        <span className="text-[10px] text-cyan-400 tracking-widest uppercase">Buffering sponsor stream...</span>
                      </div>
                    )}
                    
                    <video 
                      ref={videoRef}
                      src={activeAd.videoUrl}
                      autoPlay
                      playsInline
                      muted={isMuted}
                      loop
                      onCanPlay={() => setVideoLoading(false)}
                      onError={() => {
                        console.warn("Video failed to play, launching cyberpunk graphics ad stream fallback.");
                        setVideoError(true);
                        setVideoLoading(false);
                      }}
                      className="w-full h-full max-h-[380px] object-cover rounded-[30px]"
                    />

                    {/* Muted indicator overlay badges */}
                    <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 rounded-full text-[10px] text-white font-mono border border-white/10 flex items-center gap-1.5">
                      <Play className="w-3 h-3 text-[#CCFF00]" />
                      <span>HD Live Video ad</span>
                    </div>

                    {!isMuted && (
                      <div className="absolute bottom-4 right-4 bg-[#CCFF00] text-black px-3 py-1 rounded-full text-[10px] font-black font-mono flex items-center gap-1 animate-bounce">
                        <Volume2 className="w-3 h-3" /> AUDIO ACTIVE
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SPONSOR DEETS PANEL - Right 5 columns */}
              <div className="lg:col-span-5 neo-glass p-6 sm:p-8 rounded-[35px] border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden flex flex-col justify-between space-y-6">
                
                {/* Sponsor background radial highlights */}
                <div className={`absolute inset-0 bg-gradient-to-tr ${activeAd.gradient} duration-1000 transition-all opacity-20 pointer-events-none z-0`} />
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#CCFF00]/5 blur-[100px] pointer-events-none rounded-full" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#CCFF00] font-mono">
                      {activeAd.client}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight uppercase">
                    {activeAd.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans font-light">
                    {activeAd.description}
                  </p>

                  {/* Operational Ad verification specs */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl font-mono text-[10px] text-cyan-300 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Security:</span>
                      <span className="text-emerald-400 font-bold">STATUS_SECURE_AD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Validation:</span>
                      <span>{activeAd.interactiveChallenge}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-[#CCFF00] rounded-full transition-all duration-1000" 
                        style={{ width: `${((AD_DURATION - adTimer) / AD_DURATION) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Subcard holding reward tokens values info */}
                <div className="relative z-10 bg-white/5 px-4 py-3 rounded-xl border border-[#CCFF00]/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#CCFF00]" />
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase font-mono">AD-TOKEN BOOSTER</p>
                      <p className="text-[9px] text-gray-400 font-mono">Locked payout: {REWARD_RATE}.0 NEXA</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 rounded-lg text-[9px] font-bold font-mono">
                    +{REWARD_RATE}.0 NEXA
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Footer Ad Warnings specifications */}
            <div className="text-center relative z-20 space-y-1">
              <p className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">
                This academic node ad is securely authenticated. No personal metrics cookies are gathered.
              </p>
              <div className="flex justify-center gap-4 text-[10px] text-gray-400 font-mono">
                <span>VERIFIED SPONSOR: GOOGLE ADMOB SDK</span>
                <span>•</span>
                <span>SECURE PAYOUT: FIREBASE ACTIVE INSTANCE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RAIN OF EARNED COINS PARTICLES CELEBRATION FLOATING CHANNELS OVERLAY */}
      {showCelebration && (
        <div className="fixed inset-0 z-[250] pointer-events-none overflow-hidden">
          {earnedCoinsAnimList.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ y: "100vh", opacity: 1, scale: 0.5, rotate: 0 }}
              animate={{ 
                y: "-15vh", 
                opacity: [1, 1, 0.8, 0], 
                scale: [0.6, 1.2, 1, 0.5],
                rotate: 360 * (index % 2 === 0 ? 1 : -1)
              }}
              transition={{ 
                duration: 2.5 + Math.random() * 1.5,
                delay: c.delay,
                ease: "easeOut"
              }}
              className="absolute text-3xl select-none"
              style={{ left: `${c.left}%` }}
            >
              💰
            </motion.div>
          ))}
          
          {/* Central celebrating text notification */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="absolute inset-x-0 bottom-48 flex justify-center"
          >
            <div className="bg-[#030712] border-2 border-[#CCFF00] rounded-3xl p-6 shadow-2xl space-y-1 max-w-sm text-center relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />
              <div className="flex justify-center text-3xl">🎉</div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Reward Yield Complete</h4>
              <p className="text-xs text-[#CCFF00] font-mono uppercase font-black tracking-widest">
                Credited +{REWARD_RATE}.0 NEXA Coins
              </p>
              <p className="text-[10px] text-gray-400 font-mono pt-1">
                Your profile tokens have been successfully updated on Firebase Firestore.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
