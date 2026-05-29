import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Search, Crown, Flame, Sparkles, Heart, Zap, Award, Star, ThumbsUp, HelpCircle,
  Play, Calendar, Clock, Sword, Brain, Activity, Compass, ChevronRight, UserPlus
} from "lucide-react";
import { NativeAd } from "./NativeAds";

interface Player {
  username: string;
  avatar: string;
  league: "Bronze" | "Silver" | "Gold" | "Titan" | "Legend";
  xp: number;
  online?: boolean;
  lastSeen?: string;
  isInteractiveUser?: boolean;
  country: string;
  weeklyXp: number;
  studyTime: number; // minutes
  battleWins: number;
  aiUsage: number;
  streak: number;
  status?: "online" | "offline" | "left";
}

interface AnimatedLeaderboardProps {
  profile: any;
  allUsers: any[];
  onSaveProfile?: (updated: any) => void;
  onDeductCoins?: (amount: number) => boolean;
}

interface MiniCheer {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

// Country badge listing helper
const countries = [
  { flag: "🇺🇸", code: "US" },
  { flag: "🇮🇳", code: "IN" },
  { flag: "🇬🇧", code: "GB" },
  { flag: "🇧🇷", code: "BR" },
  { flag: "🇨🇦", code: "CA" },
  { flag: "🇩🇪", code: "DE" },
  { flag: "🇯🇵", code: "JP" },
  { flag: "🇸🇬", code: "SG" },
  { flag: "🇦🇺", code: "AU" },
  { flag: "🇫🇷", code: "FR" },
  { flag: "🇪🇸", code: "ES" },
  { flag: "🇳🇱", code: "NL" },
  { flag: "🇮🇹", code: "IT" },
];

export const AnimatedLeaderboard: React.FC<AnimatedLeaderboardProps> = ({ 
  profile, 
  allUsers, 
  onSaveProfile, 
  onDeductCoins 
}) => {
  const [selectedLeagueTab, setSelectedLeagueTab] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<"global" | "weekly" | "study" | "battle" | "ai" | "streak">("global");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | "online" | "offline" | "left">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [cheers, setCheers] = useState<Record<string, MiniCheer[]>>({});
  
  // Real-time ticking state for premium timers
  const [timeNow, setTimeNow] = useState<number>(Date.now());
  const [selectedLBDuration, setSelectedLBDuration] = useState<"1day" | "1month" | "1year">("1month");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic state dictionary storing statuses for each student
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, { online: boolean; status: "online" | "offline" | "left"; lastSeenLabel: string }>>({});

  useEffect(() => {
    const statuses: Record<string, { online: boolean; status: "online" | "offline" | "left"; lastSeenLabel: string }> = {};
    const possibleLastSeens = ["Left 2m ago", "Left 5m ago", "Left 15m ago", "Left 1h ago", "Offline", "Left 30s ago"];
    
    // Seed initial values
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach((u, i) => {
        const username = u.username || `User_${i}`;
        // Distribute: ~40% online, ~30% offline, ~30% left the app
        const rand = i % 3;
        if (rand === 0) {
          statuses[username] = { online: true, status: "online", lastSeenLabel: "Online Now" };
        } else if (rand === 1) {
          statuses[username] = { online: false, status: "offline", lastSeenLabel: possibleLastSeens[i % possibleLastSeens.length] };
        } else {
          statuses[username] = { online: false, status: "left", lastSeenLabel: "Left the app" };
        }
      });
    }
    setSessionStatuses(statuses);

    // Dynamic state simulator mimicking live connections
    const timer = setInterval(() => {
      setSessionStatuses(prev => {
        const copy = { ...prev };
        const keys = Object.keys(copy);
        if (keys.length === 0) return prev;
        
        // Randomly choose a user node to update status
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const nextRand = Math.random();
        if (nextRand < 0.35) {
          copy[randomKey] = { online: true, status: "online", lastSeenLabel: "Online Now" };
        } else if (nextRand < 0.7) {
          copy[randomKey] = { online: false, status: "left", lastSeenLabel: "Just left the app" };
        } else {
          copy[randomKey] = { online: false, status: "offline", lastSeenLabel: "Offline" };
        }
        return copy;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [allUsers]);

  // Persistent user scores from localStorage with safety defaults
  const userMetrics = useMemo(() => {
    const cachedStudyStr = localStorage.getItem("nexa_study_minutes");
    const cachedBattleStr = localStorage.getItem("nexa_battle_wins");
    const cachedAiStr = localStorage.getItem("nexa_ai_queries");

    const study = cachedStudyStr ? parseInt(cachedStudyStr, 10) : 485;
    const battle = cachedBattleStr ? parseInt(cachedBattleStr, 10) : 24;
    const ai = cachedAiStr ? parseInt(cachedAiStr, 10) : 42;
    const weekly = Math.floor((profile.xp || 0) * 0.42) + 80;

    return { study, battle, ai, weekly };
  }, [profile.xp]);

  // Generate deterministic attributes for users to simulate high-fidelity competitor pools
  const getPlayerWithDerivedMetrics = (u: any, idx: number, isYou: boolean): Player => {
    const name = u.username || "Competitor";
    
    // Deterministic country selection based on username characters
    const charCodeSum = name.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const countryObj = countries[charCodeSum % countries.length];

    // Derived realistic, deterministic study scores bound consistently to user XP density
    const baseMultiplier = (charCodeSum % 15) / 10 + 0.5; // keeps it natural (0.5x to 2x)
    const derivedWeeklyXp = isYou 
      ? userMetrics.weekly 
      : Math.floor((u.xp || 0) * 0.35 * baseMultiplier) + 20;
    
    const derivedStudyTime = isYou 
      ? userMetrics.study 
      : Math.floor((u.xp || 0) * 0.48 * baseMultiplier) + 40;
    
    const derivedBattleWins = isYou 
      ? userMetrics.battle 
      : Math.floor(((u.xp || 0) / 110) * baseMultiplier) + 3;
    
    const derivedAiUsage = isYou 
      ? userMetrics.ai 
      : Math.floor(((u.xp || 0) / 75) * baseMultiplier) + 6;
    
    const derivedStreak = isYou 
      ? (profile.streak || 0) 
      : (charCodeSum % 14) + 1;

    const statusData = sessionStatuses[name] || {
      online: isYou ? true : idx % 3 === 0,
      status: isYou ? "online" : (idx % 3 === 1 ? "offline" : "left" as const),
      lastSeenLabel: isYou ? "Online Now" : "Offline"
    };

    return {
      username: name,
      avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      league: u.league || "Bronze",
      xp: u.xp || 0,
      online: isYou ? true : statusData.status === "online",
      lastSeen: isYou ? "Online Now" : statusData.lastSeenLabel,
      isInteractiveUser: isYou,
      country: countryObj.flag,
      weeklyXp: derivedWeeklyXp,
      studyTime: derivedStudyTime,
      battleWins: derivedBattleWins,
      aiUsage: derivedAiUsage,
      streak: derivedStreak,
      status: isYou ? "online" : statusData.status
    };
  };

  // Build the unified current user object with derived indices
  const userCompetitorObj = useMemo(() => {
    return getPlayerWithDerivedMetrics({ 
      username: profile.username || "You", 
      avatar: profile.avatar, 
      league: profile.league || "Bronze", 
      xp: profile.xp || 0 
    }, 0, true);
  }, [profile, userMetrics]);

  // Map other users in the global database
  const mappedCompetitors = useMemo(() => {
    return (allUsers || []).map((u, i) => getPlayerWithDerivedMetrics(u, i + 1, false));
  }, [allUsers, userMetrics]);

  // Combined, filtered, & dynamically sorted lists based on active category state
  const sortedAndFilteredPool = useMemo(() => {
    // Unique union by username to dodge replication loops
    const uniquePool = [userCompetitorObj, ...mappedCompetitors]
      .filter((v, i, self) => self.findIndex(t => t.username === v.username) === i);

    return uniquePool
      .filter(p => {
        const matchesSearch = p.username.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLeague = selectedLeagueTab === "All" || p.league.toLowerCase() === selectedLeagueTab.toLowerCase();
        const matchesStatus = selectedStatusFilter === "All" || p.status === selectedStatusFilter;
        return matchesSearch && matchesLeague && matchesStatus;
      })
      .sort((a, b) => {
        // Dynamically sort based on the chosen leaderboard metric
        if (selectedCategory === "weekly") return b.weeklyXp - a.weeklyXp;
        if (selectedCategory === "study") return b.studyTime - a.studyTime;
        if (selectedCategory === "battle") return b.battleWins - a.battleWins;
        if (selectedCategory === "ai") return b.aiUsage - a.aiUsage;
        if (selectedCategory === "streak") return b.streak - a.streak;
        return b.xp - a.xp; // 'global'
      });
  }, [userCompetitorObj, mappedCompetitors, searchQuery, selectedLeagueTab, selectedCategory, selectedStatusFilter]);

  // Find true ranks in unfiltered global pool of users to preserve objective worldwide stats
  const trueWorldwideRanks = useMemo(() => {
    const rawPool = [userCompetitorObj, ...mappedCompetitors]
      .filter((v, i, self) => self.findIndex(t => t.username === v.username) === i);

    const sortedByMetric = rawPool.sort((a, b) => {
      if (selectedCategory === "weekly") return b.weeklyXp - a.weeklyXp;
      if (selectedCategory === "study") return b.studyTime - a.studyTime;
      if (selectedCategory === "battle") return b.battleWins - a.battleWins;
      if (selectedCategory === "ai") return b.aiUsage - a.aiUsage;
      if (selectedCategory === "streak") return b.streak - a.streak;
      return b.xp - a.xp;
    });

    const m = new Map<string, number>();
    sortedByMetric.forEach((p, idx) => m.set(p.username, idx + 1));
    return m;
  }, [userCompetitorObj, mappedCompetitors, selectedCategory]);

  // Split sorted pool into Esports Podium (Top 3) and standard roster
  const top3 = useMemo(() => sortedAndFilteredPool.slice(0, 3), [sortedAndFilteredPool]);
  const rosterItems = useMemo(() => sortedAndFilteredPool.slice(3), [sortedAndFilteredPool]);

  // Emit float micro-cheers particle actions
  const triggerCheer = (username: string, emoji: string) => {
    const id = Date.now() + Math.random();
    const newCheer: MiniCheer = {
      id,
      emoji,
      x: (Math.random() - 0.5) * 70, 
      y: -25 - Math.random() * 50
    };

    setCheers(prev => ({
      ...prev,
      [username]: [...(prev[username] || []), newCheer]
    }));

    setTimeout(() => {
      setCheers(prev => {
        const list = prev[username] || [];
        return {
          ...prev,
          [username]: list.filter(c => c.id !== id)
        };
      });
    }, 1200);
  };

  const getLeagueBadgeStyles = (league: string) => {
    switch (league) {
      case "Legend":
        return "bg-purple-500/15 text-[#CCFF00] border-purple-400/30";
      case "Titan":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-400/30";
      case "Gold":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-400/30";
      case "Silver":
        return "bg-slate-400/15 text-slate-300 border-slate-400/20";
      default:
        return "bg-amber-600/15 text-orange-400 border-orange-500/20";
    }
  };

  const leaderboardCategories = [
    { id: "global", label: "Global", desc: "Lifetime Total Nexa XP", icon: <Trophy className="w-3.5 h-3.5" />, unit: "XP" },
    { id: "weekly", label: "Weekly", desc: "This Week's Activity XP", icon: <Calendar className="w-3.5 h-3.5" />, unit: "XP" },
    { id: "study", label: "Study Time", desc: "Minutes Concentration Count", icon: <Clock className="w-3.5 h-3.5" />, unit: "Min" },
    { id: "battle", label: "Battle Wins", desc: "Elite Quiz Arena Victories", icon: <Sword className="w-3.5 h-3.5" />, unit: "Wins" },
    { id: "ai", label: "AI Master", desc: "Coprocessor Prompts Resolved", icon: <Brain className="w-3.5 h-3.5" />, unit: "Queries" },
    { id: "streak", label: "Streak", desc: "Daily Continuous Active Sync", icon: <Flame className="w-3.5 h-3.5" />, unit: "Days" },
  ];

  const getMetricValue = (player: Player, categoryId: string) => {
    switch (categoryId) {
      case "weekly": return `${player.weeklyXp.toLocaleString()} XP`;
      case "study": return `${player.studyTime.toLocaleString()} Min`;
      case "battle": return `${player.battleWins.toLocaleString()} Wins`;
      case "ai": return `${player.aiUsage.toLocaleString()} Queries`;
      case "streak": return `${player.streak.toLocaleString()} Days`;
      default: return `${player.xp.toLocaleString()} XP`;
    }
  };

  const currentCategoryObj = useMemo(() => {
    return leaderboardCategories.find(c => c.id === selectedCategory) || leaderboardCategories[0];
  }, [selectedCategory]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="animated-leaderboard-container">
      
      {/* Cybersecurity Cyber-Esports Header */}
      <div className="text-center relative py-4 bg-black/30 rounded-[32px] border border-white/5 p-6 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/5 blur-[80px] pointer-events-none rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-block"
        >
          <span className="text-[10px] uppercase tracking-widest text-[#CCFF00] font-mono font-extrabold bg-[#CCFF00]/10 px-4 py-1.5 rounded-full border border-[#CCFF00]/20 shadow-[0_0_15px_rgba(204,255,0,0.15)]">
            🌟 NEXALEARN esports CHAMPIONSHIP
          </span>
        </motion.div>
        
        <motion.h3 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-3xl font-black text-white mt-4 tracking-tighter uppercase font-sans bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400"
        >
          Cyberpunk Leaderboard System
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-gray-400 mt-2 max-w-xl mx-auto leading-relaxed font-mono"
        >
          Real-time tournament tables measuring academic speed metrics, compiler query solves, and active battle streaks! Complete actions to claim rank!
        </motion.p>
      </div>

      {/* Modern Premium Battle Pass & Seasonal Esports Rewards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-br from-purple-900/40 via-black/50 to-cyan-950/20 p-5 rounded-[32px] border border-white/5 shadow-2xl">
        {/* Pass Status Console */}
        <div className="space-y-3.5 bg-black/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎫</span>
              <h4 className="text-xs font-mono font-black text-purple-300 uppercase tracking-widest">NexaLearn Premium Season Pass</h4>
            </div>
            
            {profile?.premiumTier !== "FREE" ? (
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-black uppercase tracking-wider">
                  👑 PREMIUM SEASON ACTIVE (VIP PRESTIGE)
                </div>
                
                {profile?.premiumExpiry && profile.premiumExpiry > timeNow && (
                  <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/20 shadow-md flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-300 uppercase font-bold">⏱️ Time Remaining:</span>
                    <span className="text-xs font-mono font-bold text-yellow-400 font-bold animate-pulse">
                      {(() => {
                        const diff = profile.premiumExpiry - timeNow;
                        if (diff <= 0) return "Expired";
                        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
                        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                        const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
                        const secs = Math.floor((diff % (60 * 1000)) / 1000);
                        return days > 0 ? `${days}d ${hours}h ${mins}m ${secs}s` : `${hours}h ${mins}m ${secs}s`;
                      })()}
                    </span>
                  </div>
                )}

                <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                  Excellent! You are an active VIP Premium Season Pass holder. Experience full visual bonuses across the cybercampus!
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[9px] font-mono text-cyan-300 uppercase">
                  <div>🟢 2x Battle XP Multiplier</div>
                  <div>🟢 Golden Glow Border</div>
                  <div>🟢 Solver Micro-Indicators</div>
                  <div>🟢 Custom Crown Avatar</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 text-[10px] font-mono font-black uppercase tracking-wider">
                  👥 FREE STANDARD MEMBERSHIP
                </div>
                <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                  Standard account verified. Upgrade to Premium Pass to claim 2x XP, golden cyberframes, custom avatar labels, and infinite solver access.
                </p>
              </div>
            )}
          </div>

          {profile?.premiumTier === "FREE" && (
            <div className="pt-2 space-y-3">
              {/* Duration picker selection container */}
              <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedLBDuration("1day")}
                  className={`py-1.5 px-1 text-[9px] uppercase font-mono font-bold rounded-lg cursor-pointer border-none transition-all ${
                    selectedLBDuration === "1day" ? "bg-purple-500 text-white font-black" : "bg-white/5 hover:bg-white/10 text-gray-400"
                  }`}
                >
                  ⚡ 1 Day (2.5K)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLBDuration("1month")}
                  className={`py-1.5 px-1 text-[9px] uppercase font-mono font-bold rounded-lg cursor-pointer border-none transition-all ${
                    selectedLBDuration === "1month" ? "bg-purple-500 text-white font-black" : "bg-white/5 hover:bg-white/10 text-gray-400"
                  }`}
                >
                  📅 1 Month (25K)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLBDuration("1year")}
                  className={`py-1.5 px-1 text-[9px] uppercase font-mono font-bold rounded-lg cursor-pointer border-none transition-all ${
                    selectedLBDuration === "1year" ? "bg-purple-500 text-white font-black" : "bg-white/5 hover:bg-white/10 text-gray-400"
                  }`}
                >
                  👑 1 Year (100K)
                </button>
              </div>

              <button
                onClick={() => {
                  const passCosts = {
                    "1day": 2500,
                    "1month": 25000,
                    "1year": 100000
                  };
                  const passDurations = {
                    "1day": 24 * 60 * 60 * 1000,
                    "1month": 30 * 24 * 60 * 60 * 1000,
                    "1year": 365 * 24 * 60 * 60 * 1000
                  };

                  const passCost = passCosts[selectedLBDuration];
                  const durationMs = passDurations[selectedLBDuration];

                  if (onDeductCoins) {
                    const ok = onDeductCoins(passCost);
                    if (ok) {
                      if (onSaveProfile) {
                        onSaveProfile({ 
                          ...profile, 
                          premiumTier: "PREMIUM",
                          premiumExpiry: Date.now() + durationMs
                        });
                        alert(`🎉 CONGRATULATIONS! You have successfully purchased the Premium Season Pass for ${selectedLBDuration}! Enjoy 2x XP and all VIP active features!`);
                      }
                    } else {
                      alert(`⚠️ Insufficient Balance! Premium Pass for ${selectedLBDuration} costs ${passCost.toLocaleString()} Coins 🪙. Watch study reels, earn high course grades, or watch rewarded ads to earn the needed coins!`);
                    }
                  } else {
                    alert("⚠️ Integration sync loading... try again shortly.");
                  }
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 active:scale-98 text-white font-extrabold text-[11px] rounded-xl font-mono uppercase cursor-pointer flex items-center justify-center gap-1 border-none shadow-[0_4px_15px_rgba(168,85,247,0.3)] transition-all"
              >
                <span>🔥 UPGRADE TO PREMIUM SEASON PASS</span>
                <span className="bg-black/25 text-[#CCFF00] text-[9.5px] px-1.5 py-0.5 rounded-md font-black">
                  {((selectedLBDuration === "1day" ? 2500 : selectedLBDuration === "1month" ? 25000 : 100000)).toLocaleString()} COINS 🪙
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Tournament Prize Pool Overview */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-3 font-mono">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1">🏆 CHAMPIONSHIP REWARDS</span>
            <span className="text-[9px] text-gray-500 uppercase font-black">SEASON 1</span>
          </div>
          
          <div className="space-y-2.5 text-[10px] leading-relaxed">
            <div className="flex justify-between items-start bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              <span className="text-amber-200 font-bold">🥇 RANK 1 (LEGEND LEAGUE CHIEF)</span>
              <div className="text-right">
                <span className="text-white block font-black">Premium Season Pass 🎫</span>
                <span className="text-amber-300 font-bold">+50,000 Coins 🪙</span>
              </div>
            </div>

            <div className="flex justify-between items-start bg-purple-500/10 p-2 rounded-xl border border-purple-500/15">
              <span className="text-purple-300 font-bold">🥈 RANKS 2 - 5 (TITAN ELITES)</span>
              <div className="text-right">
                <span className="text-white block font-black">Premium Season Pass 🎫</span>
                <span className="text-purple-300 font-bold">+15,000 Coins 🪙</span>
              </div>
            </div>

            <div className="flex justify-between items-start bg-cyan-500/5 p-2 rounded-xl border border-white/5">
              <span className="text-cyan-400 font-bold">🥉 RANKS 6 - 20 (GOLD VETERANS)</span>
              <div className="text-right">
                <span className="text-white block font-black">Championship Cosmic Star ⭐</span>
                <span className="text-cyan-400 font-bold">+5,000 Coins 🪙</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Six-Leaderboard Categories Grid Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-black/40 p-2 rounded-[24px] border border-white/5">
        {leaderboardCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id as any);
                setExpandedUser(null);
              }}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all outline-none cursor-pointer text-center select-none ${
                isActive 
                  ? "bg-gradient-to-br from-cyan-400/20 to-purple-600/10 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]" 
                  : "bg-[#111] hover:bg-white/5 border-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <span className={`p-1.5 rounded-lg ${isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-black/40 text-gray-500"}`}>
                {cat.icon}
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-tight uppercase font-mono">{cat.label}</span>
                <span className="text-[8px] opacity-65 font-mono">by {cat.unit}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* League Selection, Status Filters, and Search Drawer */}
      <div className="neo-glass rounded-3xl p-4 border-white/5 space-y-3 bg-black/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Filtered League Rank Match</span>
            {/* League Filter row */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/5">
              {["All", "Legend", "Titan", "Gold", "Silver", "Bronze"].map((tab) => {
                const active = selectedLeagueTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedLeagueTab(tab)}
                    className={`relative px-3.5 py-1.5 text-[10px] font-mono font-extrabold uppercase rounded-xl transition-colors duration-200 select-none cursor-pointer border-none ${
                      active ? "text-cyan-900 bg-cyan-400 font-black" : "text-gray-400 hover:text-white bg-transparent"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time search */}
          <div className="relative min-w-[200px] md:min-w-[260px] self-end">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Competitor Nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050505] border border-white/5 rounded-2xl py-2 pl-10 pr-4 text-[11px] text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all focus:bg-black/60"
            />
          </div>
        </div>

        {/* Live Networking Peer online/offline/left filters row */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.03]">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live Student Network Status:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "All", label: "All Members" },
              { id: "online", label: "🟢 Online Now" },
              { id: "offline", label: "⚪ Offline / Standby" },
              { id: "left", label: "🔴 Left App" }
            ].map(pill => {
              const active = selectedStatusFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedStatusFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono tracking-tight font-extrabold flex items-center gap-1.5 cursor-pointer border transition-all ${
                    active 
                      ? "bg-gradient-to-r from-cyan-400/20 to-purple-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.15)]"
                      : "bg-[#111] border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <NativeAd placement="leaderboard" className="mt-2" />

      {/* Cyber-Gaming Championship Podium Display */}
      {sortedAndFilteredPool.length > 0 && searchQuery === "" && (
        <div className="py-6 relative overflow-hidden bg-black/25 rounded-[40px] border border-white/5 p-6 shadow-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/[0.02] blur-3xl pointer-events-none rounded-full" />
          
          <div className="text-center mb-6">
            <span className="text-[9px] uppercase tracking-widest text-[#CCFF00] font-mono font-black py-1 px-3 bg-[#CCFF00]/10 border border-[#CCFF00]/15 rounded-lg">
              🔮 Current Category: <b className="text-white">{currentCategoryObj.label} ({currentCategoryObj.desc})</b>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end relative z-10">
            
            {/* Podium Rank #2 (Silver Champion) */}
            {top3[1] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                whileHover={{ y: -4 }}
                className="neo-glass rounded-3xl p-6 border-white/5 bg-slate-400/[0.03] order-2 md:order-1 flex flex-col items-center relative border group transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <div className="absolute top-3.5 right-4 text-slate-400 font-mono text-xs font-black">RANK #2</div>
                <div className="text-[10px] font-extrabold text-[#94A3B8] font-mono uppercase tracking-wider mb-2 flex items-center gap-1">
                  🥈 Silver Podium
                </div>

                {/* Avatar container */}
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-full bg-black/60 p-[3px] border-2 border-slate-400/70 shadow-lg relative glow-effect">
                    <img src={top3[1].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  {/* Country Flag badge overlay */}
                  <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700/50 text-base w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                    {top3[1].country}
                  </span>
                </div>

                <span className={`text-sm font-black truncate max-w-full text-white ${top3[1].isInteractiveUser ? "text-cyan-300 underline underline-offset-4 decoration-cyan-400" : ""}`}>
                  {top3[1].username} {top3[1].isInteractiveUser && "👤"}
                </span>
                
                <span className="text-xs text-white/90 font-mono font-black mt-2 py-0.5 px-3 bg-white/5 rounded-full border border-white/5 min-w-[100px] text-center">
                  {getMetricValue(top3[1], selectedCategory)}
                </span>

                <div className="text-[9px] text-gray-400 uppercase font-mono mt-2 tracking-widest">
                  {top3[1].league} LEAGUE • #{trueWorldwideRanks.get(top3[1].username)} WORLD
                </div>
                
                {/* Micro Reactions */}
                <div className="mt-4 flex gap-1.5">
                  <button onClick={() => triggerCheer(top3[1].username, "🔥")} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-full text-xs transition duration-200 cursor-pointer border border-white/5">🔥</button>
                  <button onClick={() => triggerCheer(top3[1].username, "👏")} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-full text-xs transition duration-200 cursor-pointer border border-white/5">👏</button>
                </div>

                {/* Particle cheer emitter */}
                <div className="absolute inset-x-0 bottom-16 pointer-events-none overflow-visible">
                  <AnimatePresence>
                    {(cheers[top3[1].username] || []).map(cheer => (
                      <motion.div
                        key={cheer.id}
                        initial={{ opacity: 1, scale: 0.5, y: 0, x: cheer.x }}
                        animate={{ opacity: 0, scale: 1.5, y: cheer.y, rotate: cheer.x * 2 }}
                        exit={{ opacity: 0 }}
                        className="absolute text-xl font-bold select-none"
                      >
                        {cheer.emoji}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Podium Rank #1 (Supreme Master Champion) */}
            {top3[0] && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 85, delay: 0 }}
                whileHover={{ y: -6 }}
                className="neo-glass rounded-[40px] p-8 border-yellow-400/20 bg-yellow-500/[0.04] order-1 md:order-2 flex flex-col items-center relative border shadow-[0_0_40px_rgba(234,179,8,0.12)]"
              >
                <div className="absolute -top-3.5 right-1/2 translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[9px] font-black rounded-full font-mono uppercase px-4.5 py-1 tracking-widest flex items-center gap-1 shadow-2xl">
                  <Crown className="w-3.5 h-3.5 fill-black text-black" /> SECURED SUPREME
                </div>
                <div className="text-xs font-black text-yellow-400 font-mono tracking-wider uppercase mb-2 flex items-center gap-1">
                  🥇 GOLD CHAMPION 👑
                </div>

                {/* Glorious Avatar */}
                <div className="relative mb-4 mt-2">
                  <div className="w-22 h-22 rounded-full bg-black/60 p-[4px] border-3 border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.4)] relative glow-effect scale-105">
                    <img src={top3[0].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  {/* Country flag overlay */}
                  <span className="absolute bottom-0 right-0 bg-slate-900 border border-yellow-500 text-lg w-7 h-7 flex items-center justify-center rounded-full shadow-lg">
                    {top3[0].country}
                  </span>
                </div>

                <span className={`text-base font-black truncate max-w-full text-white tracking-wide ${top3[0].isInteractiveUser ? "text-cyan-200 underline underline-offset-4 decoration-[#CCFF00]" : ""}`}>
                  {top3[0].username} {top3[0].isInteractiveUser && "👤"}
                </span>
                
                <span className="text-sm text-[#CCFF00] font-mono font-extrabold mt-2 py-1.5 px-4 bg-[#CCFF00]/10 rounded-full shadow-inner border border-[#CCFF00]/25 min-w-[120px] text-center">
                  {getMetricValue(top3[0], selectedCategory)}
                </span>

                <div className="text-[10px] text-gray-300 font-bold uppercase font-mono mt-2 tracking-widest">
                  {top3[0].league} LEAGUE • #{trueWorldwideRanks.get(top3[0].username)} WORLD
                </div>
                
                {/* Micro Reactions */}
                <div className="mt-4 flex gap-1.5">
                  <button onClick={() => triggerCheer(top3[0].username, "👑")} className="p-1 px-3 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-full text-xs transition duration-200 cursor-pointer border border-yellow-500/20">👑</button>
                  <button onClick={() => triggerCheer(top3[0].username, "⚡")} className="p-1 px-3 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-full text-xs transition duration-200 cursor-pointer border border-yellow-500/20">⚡</button>
                  <button onClick={() => triggerCheer(top3[0].username, "🚀")} className="p-1 px-3 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-full text-xs transition duration-200 cursor-pointer border border-yellow-500/20">🚀</button>
                </div>

                {/* Render cheers particles */}
                <div className="absolute inset-x-0 bottom-24 pointer-events-none overflow-visible">
                  <AnimatePresence>
                    {(cheers[top3[0].username] || []).map(cheer => (
                      <motion.div
                        key={cheer.id}
                        initial={{ opacity: 1, scale: 0.5, y: 0, x: cheer.x }}
                        animate={{ opacity: 0, scale: 1.6, y: cheer.y, rotate: cheer.x * 2.5 }}
                        exit={{ opacity: 0 }}
                        className="absolute text-2xl font-bold select-none"
                      >
                        {cheer.emoji}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Podium Rank #3 (Bronze Challenger) */}
            {top3[2] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                whileHover={{ y: -4 }}
                className="neo-glass rounded-3xl p-6 border-white/5 bg-orange-600/[0.03] order-3 flex flex-col items-center relative border group transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <div className="absolute top-3.5 right-4 text-orange-400 font-mono text-xs font-black">RANK #3</div>
                <div className="text-[10px] font-extrabold text-[#D97706] font-mono uppercase tracking-wider mb-2 flex items-center gap-1">
                  🥉 Bronze Podium
                </div>

                {/* Avatar Frame */}
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-full bg-black/60 p-[3px] border-2 border-orange-500/60 shadow-lg relative glow-effect">
                    <img src={top3[2].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  {/* flag badge */}
                  <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-orange-700/50 text-base w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                    {top3[2].country}
                  </span>
                </div>

                <span className={`text-sm font-black truncate max-w-full text-white ${top3[2].isInteractiveUser ? "text-cyan-300 underline underline-offset-4 decoration-cyan-400" : ""}`}>
                  {top3[2].username} {top3[2].isInteractiveUser && "👤"}
                </span>
                
                <span className="text-xs text-white/90 font-mono font-black mt-2 py-0.5 px-3 bg-white/5 rounded-full border border-white/5 min-w-[100px] text-center">
                  {getMetricValue(top3[2], selectedCategory)}
                </span>

                <div className="text-[9px] text-gray-400 uppercase font-mono mt-2 tracking-widest">
                  {top3[2].league} LEAGUE • #{trueWorldwideRanks.get(top3[2].username)} WORLD
                </div>
                
                {/* Micro Reactions */}
                <div className="mt-4 flex gap-1.5">
                  <button onClick={() => triggerCheer(top3[2].username, "👍")} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-full text-xs transition duration-200 cursor-pointer border border-white/5">👍</button>
                  <button onClick={() => triggerCheer(top3[2].username, "💖")} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-full text-xs transition duration-200 cursor-pointer border border-white/5">💖</button>
                </div>

                {/* cheer float */}
                <div className="absolute inset-x-0 bottom-16 pointer-events-none overflow-visible">
                  <AnimatePresence>
                    {(cheers[top3[2].username] || []).map(cheer => (
                      <motion.div
                        key={cheer.id}
                        initial={{ opacity: 1, scale: 0.5, y: 0, x: cheer.x }}
                        animate={{ opacity: 0, scale: 1.5, y: cheer.y, rotate: cheer.x * 2 }}
                        exit={{ opacity: 0 }}
                        className="absolute text-xl font-bold select-none"
                      >
                        {cheer.emoji}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      )}

      {/* Leaderboard Competitor List Roster Section */}
      <div className="neo-glass rounded-[32px] p-6 border-white/5 space-y-4 bg-black/40">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-300 uppercase tracking-widest font-mono font-bold">Championship Roster Competitors</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{sortedAndFilteredPool.length} verified nodes loaded</span>
        </div>

        {sortedAndFilteredPool.length === 0 ? (
          <div className="py-16 text-center text-gray-500 font-mono text-xs border border-dashed border-white/5 rounded-2xl">
            No competitor nodes found matching query boundaries.
          </div>
        ) : (
          <motion.div 
            layout
            className="space-y-3 max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar"
          >
            <AnimatePresence mode="popLayout">
              {sortedAndFilteredPool.map((player, index) => {
                const isYou = player.isInteractiveUser;
                const absoluteRank = trueWorldwideRanks.get(player.username) || (index + 1);
                const isExpanded = expandedUser === player.username;

                // Level up XP/progress boundary bar calculation
                const nextGoalXp = player.xp < 1000 ? 1000 : player.xp < 3500 ? 3500 : player.xp < 7500 ? 7500 : player.xp < 12000 ? 12000 : 25000;
                const progressPct = Math.min(100, Math.floor((player.xp / nextGoalXp) * 100));

                return (
                  <motion.div
                    key={player.username}
                    layout 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className={`rounded-2xl border cursor-pointer select-none overflow-hidden transition-all duration-300 ${
                      isYou 
                        ? 'bg-gradient-to-r from-cyan-950/40 to-black border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                        : 'bg-black/35 border-white/5 hover:bg-black/55 hover:border-white/10'
                    }`}
                    onClick={() => setExpandedUser(isExpanded ? null : player.username)}
                  >
                    {/* Primary row */}
                    <div className="flex items-center justify-between p-3 flex-wrap gap-2 md:gap-4">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        
                        {/* Dynamic Esports Rank Badge */}
                        <div className={`w-9 h-9 shrink-0 rounded-xl bg-black/60 border flex items-center justify-center font-mono text-[11px] font-black ${
                          absoluteRank === 1 ? 'border-yellow-400 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.2)]' :
                          absoluteRank === 2 ? 'border-zinc-400 text-zinc-300' :
                          absoluteRank === 3 ? 'border-orange-500 text-orange-400' :
                          'border-white/5 text-gray-400'
                        }`}>
                          #{absoluteRank}
                        </div>

                        {/* Avatar with country flag side placement */}
                        <div className="relative shrink-0">
                          <img 
                            src={player.avatar} 
                            alt="" 
                            className={`w-9 h-9 rounded-full bg-black/40 ${
                              isYou 
                                ? 'border-2 border-cyan-400' 
                                : 'border border-white/10'
                            }`}
                          />
                          {player.status === "online" ? (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090b11]" title="Online Active" />
                          ) : player.status === "left" ? (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#090b11]" title="Left Application" />
                          ) : (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-zinc-400 rounded-full border-2 border-[#090b11]" title="Offline" />
                          )}
                        </div>

                        {/* User Identifiers and country badge */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                              {player.username}
                              <span className="text-sm" title="Country Badge">{player.country}</span>
                            </span>
                            {isYou && (
                              <span className="shrink-0 bg-cyan-400 text-black font-black font-mono text-[8px] px-1.5 py-0.5 rounded">
                                YOU
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5 text-[9px] text-[#8C8F9F] font-mono flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full border text-[8px] uppercase tracking-wider font-extrabold ${getLeagueBadgeStyles(player.league)}`}>
                              {player.league}
                            </span>
                            {player.status === "online" ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded-md text-[8px] font-bold flex items-center gap-1 shrink-0">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online Node
                              </span>
                            ) : player.status === "left" ? (
                              <span className="bg-red-500/10 text-red-400 border border-red-500/15 px-1.5 py-0.5 rounded-md text-[8px] font-bold flex items-center gap-1 shrink-0">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Left App
                              </span>
                            ) : (
                              <span className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/15 px-1.5 py-0.5 rounded-md text-[8px] font-bold flex items-center gap-1 shrink-0">
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full" /> Offline ({player.lastSeen})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right aligned category value */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-mono text-cyan-400 font-black block">
                            {getMetricValue(player, selectedCategory)}
                          </span>
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest font-mono block">
                            {currentCategoryObj.label} Score
                          </span>
                        </div>
                        
                        {/* Quick rows reaction cheers */}
                        <div className="flex items-center gap-1 relative z-20">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerCheer(player.username, "🔥");
                            }}
                            className="w-7 h-7 bg-white/5 hover:bg-white/10 text-[11px] rounded-lg transition flex items-center justify-center p-0 cursor-pointer border border-white/5"
                          >
                            🔥
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress slider layout at bottom border */}
                    <div className="px-3 pb-1 border-t border-white/[0.02]">
                      <div className="flex justify-between items-center text-[7.5px] text-gray-500 font-mono mt-0.5">
                        <span>XP ACCUMULATION PROGRESS</span>
                        <span>{player.xp}/{nextGoalXp} XP ({progressPct}%)</span>
                      </div>
                      <div className="h-1 bg-black/60 rounded-full overflow-hidden mt-1 mb-1 border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-[#7B61FF]" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Render floats cheers */}
                    <div className="absolute inset-x-0 bottom-6 pointer-events-none overflow-visible">
                      <AnimatePresence>
                        {(cheers[player.username] || []).map(cheer => (
                          <motion.div
                            key={cheer.id}
                            initial={{ opacity: 1, scale: 0.5, y: 0, x: cheer.x + 80 }}
                            animate={{ opacity: 0, scale: 1.4, y: cheer.y - 15, x: cheer.x + 95 }}
                            exit={{ opacity: 0 }}
                            className="absolute text-lg font-bold select-none right-12 z-40"
                          >
                            {cheer.emoji}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Expandable details card */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="bg-black/30 border-t border-white/5 overflow-hidden"
                        >
                          <div className="p-4 space-y-4 text-xs font-mono">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/50 rounded-xl p-3 border border-white/5">
                              <div>
                                <span className="text-[8.5px] text-gray-400 uppercase block mb-0.5">Weekly XP Target</span>
                                <span className="text-xs font-bold text-white">{player.weeklyXp.toLocaleString()} XP</span>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-gray-400 uppercase block mb-0.5">Focus Minutes</span>
                                <span className="text-xs font-bold text-cyan-300">{player.studyTime.toLocaleString()} Min studied</span>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-gray-400 uppercase block mb-0.5">AI Query Logs</span>
                                <span className="text-xs font-bold text-purple-300">{player.aiUsage.toLocaleString()} solves</span>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-gray-400 uppercase block mb-0.5">Active Streak</span>
                                <span className="text-xs font-bold text-[#CCFF00] flex items-center gap-1">
                                  🔥 {player.streak} continuous days
                                </span>
                              </div>
                            </div>

                            {/* Additional Cheer Controls */}
                            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/[0.04]">
                              <span className="text-[8.5px] text-gray-400">SEND SECURE CHEER SIGNAL:</span>
                              <div className="flex gap-1.5">
                                {["🔥", "👏", "👑", "💖", "🚀", "👍"].map(em => (
                                  <button
                                    key={em}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerCheer(player.username, em);
                                    }}
                                    className="p-1 px-2.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-xs transition border border-white/5 cursor-pointer"
                                  >
                                    {em}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
