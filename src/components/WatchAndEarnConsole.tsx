import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Tv, Play, Coins, Sparkles, Clock, Calendar, CheckCircle, Volume2, VolumeX, 
  Info, X, Lock, Unlock, Zap, Shield, Flame, RotateCw, Trophy
} from "lucide-react";
import { UserProfile } from "../types";

// Types for Watch & Earn State
interface WatchAndEarnProps {
  profile: UserProfile;
  saveProfileWithParams: (newProf: UserProfile, ...args: any[]) => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
}

// Creative mock academic-cyberpunk advertisements
interface MockAd {
  id: string;
  client: string;
  headline: string;
  description: string;
  gradient: string;
  accentText: string;
  interactiveChallenge: string;
}

const MOCK_ADS: MockAd[] = [
  {
    id: "nexa_neural_sync",
    client: "✨ NEXAMIND NEURAL LABS",
    headline: "AI Cybernetic Study Injector v4.9",
    description: "Tired of studying? Stream algebraic equations into your prefrontal cortex via direct neuro-quantum sync logs. Boost retention coefficient up to 450%!",
    gradient: "from-[#2E5BFF] via-[#1E114D] to-black",
    accentText: "text-blue-400",
    interactiveChallenge: "Connecting neuro-receivers..."
  },
  {
    id: "quantum_algebra_booster",
    client: "📐 QUANTUM CHEAT ENGINE",
    headline: "NexaSnap Premium Exam Predictor Node",
    description: "Leverage advanced matrix-tensor calculus vectors to foretell complex academic grading vectors up to 90 days in advance. Fully approved by local virtual nodes.",
    gradient: "from-[#7B61FF] via-[#350259] to-black",
    accentText: "text-purple-400",
    interactiveChallenge: "Initializing neural grade predictor..."
  },
  {
    id: "solar_study_recharge",
    client: "⚡ GIGA-PLUGS CORP",
    headline: "Solar Proton Energy Booster Drink",
    description: "The official academic energy drink with standard radioactive glucose formula. Specially calibrated for late-night compiler refactoring sessions.",
    gradient: "from-orange-600/30 via-red-950 to-black",
    accentText: "text-orange-400",
    interactiveChallenge: "Uncapping atomic energy fuel core..."
  },
  {
    id: "meta_validator_nodes",
    client: "💎 NEXACHAIN FINANCE",
    headline: "Run Nexa Nodes & Secure the Grid",
    description: "Earn passive digital gas tokens by signing off academic achievement blocks. Connect your learning profile as a dynamic academic validator node today.",
    gradient: "from-emerald-600/30 via-teal-950 to-black",
    accentText: "text-emerald-400",
    interactiveChallenge: "Syncing verified academic blocks..."
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
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [adFinished, setAdFinished] = useState<boolean>(false);
  
  // Daily cap state tracking
  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(0);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [earnedCoinsAnimList, setEarnedCoinsAnimList] = useState<{ id: number; left: number; delay: number }[]>([]);

  // Simulation parameters
  const AD_DURATION = 15; // 15 seconds ad countdown
  const COOLDOWN_DURATION = 30; // 30 seconds wait timer
  const DAILY_MAX_ADS = 10; // Limit to 10 ads watchable per node daily
  const REWARD_RATE = 40; // Earn 40 NEXA coins per watched ad

  // Google Mobile Ads SDK Integration Keys (Strict Compliance Specifications)
  // App ID Config: NexaLearnca-app-pub-2996487725106736~5645483039
  // Rewarded Ad Unit ID: nexaca-app-pub-2996487725106736/7042696313

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
            Watch Ads & <span className="text-[#CCFF00]">Earn NEXA</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
            Support the academic ecosystem non-monetarily. Watch micro-instructional sponsor videos, claim real block rewards, and build your digital college coin reserve.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl py-2 px-4 flex items-center gap-2 font-mono text-xs">
            <Calendar className="w-4 h-4 text-[#CCFF00]" />
            <span className="text-gray-400">Limit: </span>
            <span className="font-bold text-white">{DAILY_MAX_ADS} Ads/Day</span>
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
                  <Sparkles className="w-3.5 h-3.5" /> Earn {REWARD_RATE} NEXA per watched video
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
        </div>

        {/* SIDE BAR ACHIEVEMENTS & AD NETWORK SPEC - Right 5 columns */}
        <div className="md:col-span-5 space-y-6">
          {/* Ad Engine developer specifications mock summary (Requested by user prompt) */}
          <div className="bg-[#090b11] rounded-[35px] p-6 border border-white/5 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">GOOGLE ADMOB SDK</h4>
                <p className="text-[10px] text-gray-400">Security & Mobile Sync anchor points</p>
              </div>
            </div>

            <div className="space-y-4 text-[11px] leading-relaxed font-mono text-gray-300">
              <div className="p-3 bg-black/40 border-l-2 border-[#7B61FF] rounded-r-xl space-y-1">
                <p className="text-[#CCFF00] font-black uppercase text-[10px]">1. AdMob App ID Setup</p>
                <code className="text-[10px] text-gray-300 select-all block break-all font-mono py-1 px-1.5 bg-white/5 rounded mt-1 border border-white/5">
                  NexaLearnca-app-pub-2996487725106736~5645483039
                </code>
                <p className="text-gray-400 text-[10px] leading-normal pt-1">
                  Registered secure platform identifier for student nodes validation.
                </p>
              </div>

              <div className="p-3 bg-black/40 border-l-2 border-[#CCFF00] rounded-r-xl space-y-1">
                <p className="text-cyan-400 font-black uppercase text-[10px]">2. Rewarded Ad Unit ID</p>
                <code className="text-[10px] text-gray-300 select-all block break-all font-mono py-1 px-1.5 bg-white/5 rounded mt-1 border border-white/5">
                  nexaca-app-pub-2996487725106736/7042696313
                </code>
                <p className="text-gray-400 text-[10px] leading-normal pt-1">
                  Secure rewarded ad placement mapping for 40 NEXA daily yields.
                </p>
              </div>

              <div className="p-3 bg-black/40 border-l-2 border-emerald-500 rounded-r-xl space-y-1">
                <p className="text-emerald-400 font-black uppercase text-[10px]">3. Reward Callback Payload</p>
                <code className="text-[10px] text-gray-400 select-all block mt-1">
                  onUserEarnedReward(RewardItem reward {"{ amount: 40 }"})
                </code>
                <p className="text-gray-400 text-[10px] leading-normal pt-1">
                  Fires strict cryptographic token validation to credit the Nexa balance state securely.
                </p>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-500 italic mt-2 text-center">
              ⚠️ In active sandbox debug mode, ad network rewards are securely handled via mock overlay simulation.
            </p>
          </div>

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
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500 font-mono bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                  🔴 Live Broadcast Simulator
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
            <div className="w-full max-w-4xl mx-auto my-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-12 neo-glass p-8 sm:p-12 rounded-[50px] border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden space-y-6">
                
                {/* Creative Sponsor gradients decoration */}
                <div className={`absolute inset-0 bg-gradient-to-tr ${activeAd.gradient} duration-1000 transition-all opacity-40 pointer-events-none z-0`} />
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#CCFF00]/5 blur-[120px] pointer-events-none rounded-full" />

                {/* Mock Video Scanning Vector Lines overlay simulation */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.5)] z-20 pointer-events-none animate-bounce" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Tv className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs uppercase font-extrabold tracking-widest text-[#CCFF00] font-mono">
                      {activeAd.client}
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight uppercase">
                    {activeAd.headline}
                  </h3>

                  <p className="text-sm sm:text-lg text-gray-300 leading-relaxed max-w-2xl font-sans font-light">
                    {activeAd.description}
                  </p>

                  {/* High Quality animated Ad Simulation Core widget inside the player */}
                  <div className="bg-black/60 border border-white/10 p-5 rounded-2xl font-mono text-xs text-cyan-400 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 uppercase text-[10px]">Security Hash Verification:</span>
                      <span className="text-emerald-400">STATUS_SECURE_AD_NODE</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400 rounded-full transition-all duration-1000" 
                        style={{ width: `${((AD_DURATION - adTimer) / AD_DURATION) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>{activeAd.interactiveChallenge}</span>
                      <span>PING RES_NODE_OK</span>
                    </div>
                  </div>
                </div>

                {/* Sub-card presenting reward token value */}
                <div className="relative z-10 bg-white/5 px-6 py-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#CCFF00]/10 flex items-center justify-center border border-[#CCFF00]/20">
                      <Coins className="w-5 h-5 text-[#CCFF00]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Academic Blockchain Token Reserve</p>
                      <p className="text-[10px] text-gray-400 font-mono">Locked payout value: {REWARD_RATE}.0 NEXA coins</p>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 rounded-xl text-xs font-bold font-mono uppercase">
                    🥇 Dynamic Yield +{REWARD_RATE}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Ad Warnings specifications */}
            <div className="text-center relative z-20 space-y-1">
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">
                This academic node ad simulation is fully client-validated. No personal metrics cookies are gathered.
              </p>
              <div className="flex justify-center gap-4 text-[10px] text-gray-400 font-mono">
                <span>VERIFIED SPONSOR: GOOGLE WEB-SANDBOX</span>
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
