import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Tv, Play, Coins, Sparkles, Clock, Calendar, CheckCircle, 
  Info, Shield, Flame, RotateCw, Trophy, AlertCircle, WifiOff, Terminal
} from "lucide-react";
import { UserProfile } from "../types";
import { syncAdSessionToFirestore, getAdSessionsFromFirestore } from "../lib/firebase";
import { Capacitor } from "@capacitor/core";
import { admobService, AdLogEntry, ADMOB_CONFIG } from "../lib/AdMobService";
import { playGachaFanfare, playInterfaceClick } from "../lib/audioEffects";

interface WatchAndEarnProps {
  profile: UserProfile;
  saveProfileWithParams: (newProf: UserProfile, ...args: any[]) => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
  isOfflineMode?: boolean;
}

export const WatchAndEarnConsole: React.FC<WatchAndEarnProps> = ({
  profile,
  saveProfileWithParams,
  addNotification,
  isOfflineMode = false
}) => {
  // Check online status
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof window !== "undefined" ? window.navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isLocalStorageOffline = localStorage.getItem("nexa_offline_mode") === "true";
  const isOfflineDetected = !isOnline || isLocalStorageOffline || isOfflineMode;

  // AdMob states
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [earnedCoinsAnimList, setEarnedCoinsAnimList] = useState<{ id: number; left: number; delay: number }[]>([]);
  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(0);
  const [adSessions, setAdSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [admobLogs, setAdmobLogs] = useState<AdLogEntry[]>([]);
  
  const isTestMode = typeof window !== "undefined" ? !Capacitor.isNativePlatform() : true;
  
  // Custom Gacha reward reveal modal state
  const [gachaReward, setGachaReward] = useState<{ name: string; emoji: string; desc: string } | null>(null);

  // Constant constraints
  const COOLDOWN_DURATION = 30; // 30s premium cooldown between real ads to prevent click inflation
  const DAILY_MAX_ADS = 3; // Daily cap of 3 ads per student node (Limit 3 gifts per day)
  const REWARD_RATE = 10; // Base rate placeholder

  // Reload history logs and AdMob status audit
  const fetchLogsAndHistory = () => {
    setAdmobLogs(admobService.getLogs());
    fetchSessions();
  };

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

  // Initialize service on mount
  useEffect(() => {
    admobService.initialize().then(() => {
      fetchLogsAndHistory();
    });

    const interval = setInterval(() => {
      setAdmobLogs(admobService.getLogs());
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Daily tracker loading
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

    fetchSessions();
  }, [profile.username]);

  // Cooldown countdown timer thread
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setTimeout(() => {
      setCooldownRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldownRemaining]);

  // Triggers visual coins rain waterfall helper
  const triggerCelebration = () => {
    setShowCelebration(true);
    setEarnedCoinsAnimList(
      Array.from({ length: 18 }).map((_, i) => ({
        id: Date.now() + i,
        left: 10 + Math.random() * 80,
        delay: Math.random() * 0.8
      }))
    );
    
    setTimeout(() => {
      setShowCelebration(false);
      setEarnedCoinsAnimList([]);
    }, 4000);
  };

  // Launch Gacha Chest directly without ads
  const handleWatchAd = async () => {
    if (adsWatchedToday >= DAILY_MAX_ADS) {
      addNotification(
        "DAILY COINDROP MAXED 🛑",
        "Your student node has reached the maximum daily limit of claimable Nexa mystery gift chests.",
        "alert"
      );
      return;
    }

    addNotification(
      "UNBOXING CHEST 📦",
      "Opening your standard daily Nexa mystery chest...",
      "success"
    );

    // Directly claim reward, no ads
    handleRewardSuccess(REWARD_RATE);
  };

  // Process Reward Token Integration with Random Gacha Gift Boxes
  const handleRewardSuccess = (amount: number) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newCount = adsWatchedToday + 1;

    // Determine drawn gift
    const rand = Math.random();
    let drawnGift: { 
      id: string; 
      name: string; 
      emoji: string; 
      desc: string; 
      applyEffect: (prof: UserProfile) => { nextCoins: number; nextXp: number; nextTier?: string; nextAvatar?: string } 
    };

    if (newCount === DAILY_MAX_ADS) {
      // Guaranteed ULTIMATE LAST ONE GIFT Milestone (10,000 Coins + 1-Day Premium GOLD Pass)
      drawnGift = {
        id: "last_one_gift",
        name: "Premium Season Pass: LAST ONE GIFT! 🎁",
        emoji: "👑🎁",
        desc: "CONGRATULATIONS! You completed today's mystery chest series and claimed the incredible 'LAST ONE GIFT'! You have been credited +10,000 Premium Coins and a 1-Day VIP Premium Pass!",
        applyEffect: (p) => ({
          nextCoins: (p.coins || 0) + 10000,
          nextXp: (p.xp || 0) + 2000,
          nextTier: "GOLD"
        })
      };
    } else if (rand < 0.01) {
      // 1. Free Monthly Pass (1% probability)
      drawnGift = {
        id: "monthly_pass",
        name: "Free Monthly Pass",
        emoji: "🎟️",
        desc: "Unlocks the full Premium Monthly Pass status (LEGEND level) for unlimited access to solvers, predictor databases, and ad-free nodes!",
        applyEffect: (p) => ({
          nextCoins: p.coins || 0,
          nextXp: (p.xp || 0) + 1000,
          nextTier: "LEGEND"
        })
      };
    } else if (rand < 0.03) {
      // 2. 1000 Coins gift (2% probability)
      drawnGift = {
        id: "coins_1000",
        name: "1000 Coins Jackpot",
        emoji: "🪙",
        desc: "Spectacular luck! Dispatched massive jackpot of 1000 Nexa coins directly into your wallet nodes!",
        applyEffect: (p) => ({
          nextCoins: (p.coins || 0) + 1000,
          nextXp: p.xp || 0
        })
      };
    } else if (rand < 0.05) {
      // 3. Legend Avatar status (2% probability)
      drawnGift = {
        id: "legend_avatar",
        name: "Legend Avatar",
        emoji: "👑",
        desc: "Unlocks the extremely rare and glistening Legend Iron-Core Cybernetic Avatar skin!",
        applyEffect: (p) => ({
          nextCoins: p.coins || 0,
          nextXp: (p.xp || 0) + 500,
          nextAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=LegendQueen"
        })
      };
    } else if (rand < 0.08) {
      // 4. One Day Premium Pass (3% probability)
      drawnGift = {
        id: "one_day_pass",
        name: "One Day Premium Pass",
        emoji: "🎖️",
        desc: "Grants 24-Hour Gold VIP Pass status with turbo-speed solver nodes and high priority predictor pipelines!",
        applyEffect: (p) => ({
          nextCoins: p.coins || 0,
          nextXp: (p.xp || 0) + 200,
          nextTier: "GOLD"
        })
      };
    } else if (rand < 0.40) {
      // 5. 250 Coins gift (32% probability)
      drawnGift = {
        id: "coins_250",
        name: "250 Coins Voucher",
        emoji: "💰",
        desc: "Acquired mid-tier premium coin chest of 250 Nexa coins for high power solvers!",
        applyEffect: (p) => ({
          nextCoins: (p.coins || 0) + 250,
          nextXp: p.xp || 0
        })
      };
    } else if (rand < 0.75) {
      // 6. 150 Coins gift (35% probability)
      drawnGift = {
        id: "coins_150",
        name: "150 Coins Bundle",
        emoji: "🪙",
        desc: "Acquired standard student research grant bundle containing 150 Nexa coins!",
        applyEffect: (p) => ({
          nextCoins: (p.coins || 0) + 150,
          nextXp: p.xp || 0
        })
      };
    } else {
      // 7. Academic XP Matrix + 50 Coins (25% probability)
      drawnGift = {
        id: "xp_xp",
        name: "500 XP Point Matrix",
        emoji: "🧬",
        desc: "Acquired massive +500 XP matrix booster to rocket through global leaderboards, plus a bonus of 50 coins!",
        applyEffect: (p) => ({
          nextCoins: (p.coins || 0) + 50,
          nextXp: (p.xp || 0) + 500
        })
      };
    }

    // Apply the draw to user profiles
    const effects = drawnGift.applyEffect(profile);
    const nextProfile: UserProfile = {
      ...profile,
      coins: effects.nextCoins,
      xp: effects.nextXp
    };
    if (effects.nextTier) {
      nextProfile.premiumTier = effects.nextTier as any;
    }
    if (effects.nextAvatar) {
      nextProfile.avatar = effects.nextAvatar;
    }

    // Persist daily metrics
    setAdsWatchedToday(newCount);
    localStorage.setItem(`watch_earn_ads_count_${profile.username}_${todayStr}`, newCount.toString());

    // Update main user profile state
    saveProfileWithParams(nextProfile);

    // Save and synchronization of transaction history
    const sessionId = `ad_view_${Date.now()}`;
    const coinsEarned = effects.nextCoins - (profile.coins || 0);
    const sessionData = {
      timestamp: new Date().toISOString(),
      coinsEarned: coinsEarned > 0 ? coinsEarned : 0,
      adId: ADMOB_CONFIG.REWARDED_INTERSTITIAL_ID,
      headline: `Gacha Chest: ${drawnGift.name}`,
      client: "Google AdMob Node"
    };

    setAdSessions(prev => [ { id: sessionId, ...sessionData }, ...prev ].slice(0, 10));
    syncAdSessionToFirestore(profile.username, sessionId, sessionData).then(() => {
      fetchSessions();
    }).catch(e => console.error(e));

    // Store in detailed local reward historical audits
    admobService.logRewardToHistory(profile.username, coinsEarned > 0 ? coinsEarned : 10, sessionId);

    // Trigger local cooldown protectant
    const cooldownEndTime = Date.now() + COOLDOWN_DURATION * 1000;
    localStorage.setItem(`watch_earn_cooldown_${profile.username}`, cooldownEndTime.toString());
    setCooldownRemaining(COOLDOWN_DURATION);

    // Open gacha reveal modal
    setGachaReward({
      name: drawnGift.name,
      emoji: drawnGift.emoji,
      desc: drawnGift.desc
    });

    // Play immersive legendary level Web Audio synthesizer fanfare
    try {
      playGachaFanfare();
    } catch (e) {}

    // Dynamic celebration animations
    triggerCelebration();

    addNotification(
      "GIFT CHEST UNLOCKED! 🎁",
      `Ad finished successfully. Unboxed: ${drawnGift.emoji} ${drawnGift.name}!`,
      "success"
    );
  };

  const forceLogsRefresh = () => {
    setIsRefreshing(true);
    fetchLogsAndHistory();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER CARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-cyan-500/10 via-[#2E5BFF]/10 to-transparent p-6 md:p-8 rounded-[32px] border border-cyan-500/20 shadow-inner">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest font-black">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            Nexa Mystery Reward Portal
          </div>
          <h2 className="text-3xl font-black text-white mt-2 tracking-tight uppercase">
            Open Mystery Gift Chests & <span className="text-[#CCFF00]">Earn Nexa (NEXA)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
            Claim free token rewards and exclusive items securely! Receive +10.0 NEXA coins directly from the global server node.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl py-2 px-4 flex items-center gap-2 font-mono text-[11px]">
            <Calendar className="w-4 h-4 text-[#CCFF00]" />
            <span className="text-gray-400">Daily Chests: </span>
            <span className="font-bold text-white">{adsWatchedToday}/{DAILY_MAX_ADS} opened</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
        {/* MAIN CONSOLE PANEL - Left 7 columns */}
        <div className="md:col-span-7 space-y-6">
          <div className="neo-glass rounded-[35px] p-6 sm:p-8 border-white/5 space-y-6 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
            {/* Background cyan accents */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#CCFF00] font-mono whitespace-nowrap">
                    Active Node Protocol
                  </span>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">Verified Nexa Coindrop</p>
                </div>
                <button 
                  onClick={forceLogsRefresh}
                  className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Force Audit Refresh"
                >
                  <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Interactive Balance Card */}
              <div className="bg-black/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[9px] text-gray-400 font-mono uppercase block tracking-wider">Available Nexa Balance</span>
                  <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                    <span className="text-4xl font-black text-white font-mono tracking-tight">{(profile.coins || 0).toFixed(1)}</span>
                    <span className="text-xs font-black text-[#CCFF00] font-mono uppercase">NEXA</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-2xl border border-white/5 justify-center">
                  <div className="text-center">
                    <span className="text-[9px] text-gray-400 uppercase font-mono block">Node Status</span>
                    {isOfflineDetected ? (
                      <span className="text-sm font-extrabold text-red-500 font-mono">DISCONNECTED</span>
                    ) : (
                      <span className="text-sm font-extrabold text-[#CCFF00] font-mono">1.48 GHz PING</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Progress to Last One Gift Tracker */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-5 space-y-3 relative overflow-hidden leading-snug">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎁</span>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">LAST ONE GIFT Progress</h4>
                    <p className="text-[9.5px] text-[#CCFF00] font-mono">Unlock 10,000 Coins + 1 Day Premium Pass on 3rd chest!</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-white bg-black/45 px-2 py-1 rounded-md border border-white/5">{adsWatchedToday} / {DAILY_MAX_ADS}</span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-[#CCFF00] to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (adsWatchedToday / DAILY_MAX_ADS) * 100)}%` }}
                />
              </div>
              {adsWatchedToday >= DAILY_MAX_ADS && (
                <p className="text-[10px] text-emerald-400 font-extrabold text-center uppercase tracking-wider bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20 animate-pulse">
                  🎉 Ultimate LAST ONE GIFT milestone secured! Premium node activated.
                </p>
              )}
            </div>

             {/* WATCH OR LOCK TRIGGER BUTTONS */}
            <div className="space-y-4 pt-4 z-10">
              {isOfflineDetected ? (
                <button
                  disabled
                  className="w-full py-4.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500/70 font-mono text-xs uppercase tracking-widest font-black flex flex-col items-center justify-center gap-1 cursor-not-allowed select-none"
                >
                  <span className="flex items-center gap-2 text-sm text-amber-500">
                    <WifiOff className="w-4 h-4 animate-bounce" />
                    📶 Connect internet to load real rewards
                  </span>
                </button>
              ) : adsWatchedToday >= DAILY_MAX_ADS ? (
                <button
                  disabled
                  className="w-full py-4.5 rounded-2xl bg-white/5 text-gray-500 font-mono text-xs uppercase tracking-widest font-black border border-white/10 cursor-not-allowed flex flex-col items-center justify-center select-none"
                >
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> DAILY MAX COMPLETED</span>
                  <span className="text-[10px] text-gray-400 lowercase normal-case font-light block pt-0.5">Wait tomorrow for subsequent gift updates</span>
                </button>
              ) : cooldownRemaining > 0 ? (
                <button
                  disabled
                  className="w-full py-4.5 rounded-2xl bg-white/5 text-gray-400/80 font-mono text-sm uppercase tracking-widest font-black border border-white/10 flex items-center justify-center gap-3 select-none"
                >
                  <Clock className="w-4 h-4 text-[#CCFF00] animate-spin" />
                  <span>COOLDOWN ACTIVE ({cooldownRemaining}s)</span>
                </button>
              ) : (
                <button
                  onClick={handleWatchAd}
                  className="w-full py-4.5 rounded-2xl bg-[#CCFF00] text-black font-mono text-sm uppercase tracking-widest font-black flex items-center justify-center gap-2 cursor-pointer hover:bg-lime-400 hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all border-none"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>🎁 Open Daily Mystery Chest (+10 NEXA)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LOG SYSTEM AND AUDIT RECORDS PANEL - Right 5 columns */}
        <div className="md:col-span-5 space-y-6">
          <div className="neo-glass rounded-[35px] p-6 sm:p-8 border-white/5 space-y-4 flex flex-col justify-between min-h-[420px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">AdMob System Logs</h4>
                </div>
                <button 
                  onClick={() => admobService.clearLogs()}
                  className="text-[9px] font-mono text-red-400 hover:text-red-300 font-extrabold uppercase bg-white/5 px-2.5 py-1 rounded border border-white/5 cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              {/* Dynamic scrollable AdMob logs */}
              <div className="bg-black/60 rounded-2xl border border-white/5 p-4.5 h-[280px] overflow-y-auto font-mono text-[9px] space-y-2.5 scrollbar-thin">
                {admobLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-1">
                    <Info className="w-4 h-4" />
                    <span>No active AdMob event logs.</span>
                  </div>
                ) : (
                  admobLogs.map((log) => (
                    <div key={log.id} className="border-b border-white/[0.03] pb-2 space-y-0.5">
                      <div className="flex justify-between items-center text-[8px]">
                        <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                          log.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400" :
                          log.status === "FAILED" ? "bg-red-500/10 text-red-500" :
                          log.status === "COOLDOWN" ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-gray-400"
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-gray-200 font-bold uppercase">{log.event}</p>
                      <p className="text-gray-400 leading-normal font-sans text-[8.5px] font-light">{log.details}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sub-block showing multipliers */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Trophy className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Nexa Plus Nodes</h5>
                    <p className="text-[10px] text-gray-400 font-mono">1.5x Premium Yield Mult</p>
                  </div>
                </div>
                <span className="text-gray-500 text-xs font-bold">LOCKED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REWARD EARNED CELEBRATION COINS CASCADE OVERLAY */}
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

      {/* DYNAMIC GACHA REWARD GENTLE REVEAL DIALOG PANEL */}
      {gachaReward && (
        <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="neo-glass rounded-3xl p-8 max-w-sm text-center border-2 border-yellow-400 space-y-5 animate-fade-in relative overflow-hidden bg-[#0a0a0c]">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600" />
            
            <div className="text-64px flex justify-center py-2 relative">
              <span className="text-6xl animate-bounce leading-none">{gachaReward.emoji}</span>
              <span className="absolute inset-0 bg-yellow-400/10 rounded-full blur-2xl -z-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] bg-yellow-400/15 text-yellow-300 font-mono font-black py-0.5 px-3 rounded-full uppercase border border-yellow-400/30">
                ADMOB SECURED REWARD COMPILER
              </span>
              <h3 className="text-xl font-black text-white tracking-tight uppercase mt-2.5">
                {gachaReward.name}
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-mono">
              {gachaReward.desc}
            </p>

            <button
              onClick={() => setGachaReward(null)}
              className="w-full py-3 bg-[#CCFF00] hover:bg-lime-400 text-black font-mono font-black text-xs rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all border-none"
            >
              DEPLOY TRANSITION TO PROFILE 🤝
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
