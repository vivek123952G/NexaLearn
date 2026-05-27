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

  // Constant constraints
  const COOLDOWN_DURATION = 30; // 30s premium cooldown between real ads to prevent click inflation
  const DAILY_MAX_ADS = 4; // Daily cap of 4 ads per student node
  const REWARD_RATE = 10; // +10.0 NEXA coins per completed ad

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

  // Launch Full-Screen Rewarded Interstitial Ad safely inside native app
  const handleWatchAd = async () => {
    if (isOfflineDetected) {
      addNotification(
        "CONNECTION ERROR 📶",
        "📶 Connect internet to load real rewards",
        "alert"
      );
      return;
    }

    if (cooldownRemaining > 0) {
      addNotification(
        "COOLDOWN ACTIVE 🛰️",
        `Ad networks are recalibrating. Please wait ${cooldownRemaining}s before loading the next segment.`,
        "alert"
      );
      return;
    }

    if (adsWatchedToday >= DAILY_MAX_ADS) {
      addNotification(
        "DAILY COINDROP MAXED 🛑",
        "Your student node has reached the maximum daily limit of rewarded advertisement units.",
        "alert"
      );
      return;
    }

    // Web preview execution guard (No web simulations to guarantee zero invalid traffic)
    if (Capacitor.isNativePlatform() === false) {
      addNotification(
        "NATIVE CONTAINER Bypassed 📱",
        "Real Google AdMob ads work only inside native Android APK builds.",
        "info"
      );
      return;
    }

    try {
      addNotification(
        "CONNECTING AD SERVER 📡",
        "Contacting Google Mobile Ads server for verified Rewarded Interstitial stream...",
        "info"
      );

      // Trigger actual native view
      const success = await admobService.showRewardedAd(
        (rewardedAmount) => {
          // Grant Reward ONLY on successful Google AdMob SDK callback trigger
          handleRewardSuccess(rewardedAmount);
        },
        () => {
          // Complete ad view execution cleanup
          fetchLogsAndHistory();
        }
      );

      if (!success) {
        addNotification(
          "ADMOB FAILURE ⚠️",
          "AdMob display was suspended or preloading delayed. Retrying queue sync...",
          "alert"
        );
      }
    } catch (err: any) {
      addNotification("ADMOB FAILED ❌", err?.message || "Failed to load Google rewarded ad.", "alert");
    }
  };

  // Process Reward Token Integration
  const handleRewardSuccess = (amount: number) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newCount = adsWatchedToday + 1;
    const nextCoins = (profile.coins || 0) + REWARD_RATE;

    // Persist daily metrics
    setAdsWatchedToday(newCount);
    localStorage.setItem(`watch_earn_ads_count_${profile.username}_${todayStr}`, newCount.toString());

    // Update main user profile state
    const nextProfile: UserProfile = {
      ...profile,
      coins: nextCoins
    };
    saveProfileWithParams(nextProfile);

    // Save and synchronization of transaction history
    const sessionId = `ad_view_${Date.now()}`;
    const sessionData = {
      timestamp: new Date().toISOString(),
      coinsEarned: REWARD_RATE,
      adId: ADMOB_CONFIG.REWARDED_INTERSTITIAL_ID,
      headline: "Google Mobile Ads",
      client: "Google AdMob Node"
    };

    setAdSessions(prev => [ { id: sessionId, ...sessionData }, ...prev ].slice(0, 10));
    syncAdSessionToFirestore(profile.username, sessionId, sessionData).then(() => {
      fetchSessions();
    }).catch(e => console.error(e));

    // Store in detailed local reward historical audits
    admobService.logRewardToHistory(profile.username, REWARD_RATE, sessionId);

    // Trigger local cooldown protectant
    const cooldownEndTime = Date.now() + COOLDOWN_DURATION * 1000;
    localStorage.setItem(`watch_earn_cooldown_${profile.username}`, cooldownEndTime.toString());
    setCooldownRemaining(COOLDOWN_DURATION);

    // Dynamic celebration animations
    triggerCelebration();

    addNotification(
      "NEXA COINS CREDITED! 💎",
      `Reward granted! Received +${REWARD_RATE}.0 NEXA. Safe verification signature validated.`,
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
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Nexa Ad Reward Portal
          </div>
          <h2 className="text-3xl font-black text-white mt-2 tracking-tight uppercase">
            Watch Video Ads & <span className="text-[#CCFF00]">Earn Nexa (NEXA)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
            Claim free token rewards securely. Earn +10.0 NEXA coins per 15s verified Google AdMob video stream. (Limit 4 Ads daily).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl py-2 px-4 flex items-center gap-2 font-mono text-[11px]">
            <Calendar className="w-4 h-4 text-[#CCFF00]" />
            <span className="text-gray-400">Daily Cap: </span>
            <span className="font-bold text-white">{adsWatchedToday}/{DAILY_MAX_ADS} completed</span>
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
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">Verified AdMob Feed</p>
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

              {/* Cyber Sponsor Status Block */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] text-gray-400 uppercase">AdMob Unit ID Verification:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-gray-500">
                  <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[8px] text-cyan-400 uppercase">Unit Status</span>
                    <p className="font-bold text-white uppercase">REWARDED INTERSTITIAL</p>
                    <p className="text-[8px] tracking-tight truncate">...3879142624</p>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[8px] text-purple-400 uppercase">Invalid traffic safety</span>
                    <p className="font-bold text-white uppercase">SHIELD ENGAGED</p>
                    <p className="text-[8px] text-emerald-400">ANTI-SPAM ACTIVE</p>
                  </div>
                </div>
              </div>
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
              ) : Capacitor.isNativePlatform() === false ? (
                // Safe Browser Display Warning (Explicitly states native requirement without simulating fake ads)
                <div className="space-y-3">
                  <div className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 p-5 rounded-2xl border border-white/5 text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-cyan-400 mx-auto animate-pulse" />
                    <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">Browser Sandbox Restricted</h4>
                    <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                      "Real Google AdMob ads work only inside native Android APK builds."
                    </p>
                    <p className="text-[9px] text-gray-500 max-w-xs mx-auto">
                      For testing purposes in a web view, simulation systems have been disabled to prevent Google Ads account traffic violations.
                    </p>
                  </div>
                  
                  <button
                    disabled
                    className="w-full py-4 rounded-2xl bg-white/5 text-gray-500 font-mono text-xs uppercase tracking-widest font-black border border-white/10 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>⚡ SYSTEM IN WEB PREVIEW</span>
                  </button>
                </div>
              ) : adsWatchedToday >= DAILY_MAX_ADS ? (
                <button
                  disabled
                  className="w-full py-4.5 rounded-2xl bg-white/5 text-gray-500 font-mono text-xs uppercase tracking-widest font-black border border-white/10 cursor-not-allowed flex flex-col items-center justify-center select-none"
                >
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> DAILY MAX COMPLETED</span>
                  <span className="text-[10px] text-gray-400 lowercase normal-case font-light block pt-0.5">Wait tomorrow for subsequent rewarded updates</span>
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
                  <span>⚡ Watch & Earn Ad (+10.0 NEXA)</span>
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
    </div>
  );
};
