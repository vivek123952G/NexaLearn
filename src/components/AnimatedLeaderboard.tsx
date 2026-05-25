import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Search, Crown, Flame, Sparkles, Heart, Zap, Award, Star, ThumbsUp, HelpCircle
} from "lucide-react";

interface Player {
  username: string;
  avatar: string;
  league: "Bronze" | "Silver" | "Gold" | "Titan" | "Legend";
  xp: number;
  online?: boolean;
  lastSeen?: string;
  isInteractiveUser?: boolean;
}

interface AnimatedLeaderboardProps {
  profile: {
    username: string;
    avatar: string;
    league: "Bronze" | "Silver" | "Gold" | "Titan" | "Legend" | string;
    xp: number;
  };
  allUsers: any[];
}

interface MiniCheer {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export const AnimatedLeaderboard: React.FC<AnimatedLeaderboardProps> = ({ profile, allUsers }) => {
  const [selectedLeagueTab, setSelectedLeagueTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [cheers, setCheers] = useState<Record<string, MiniCheer[]>>({});

  // Setup list input
  const userCompetitorObj: Player = useMemo(() => ({
    username: profile.username || "You",
    avatar: profile.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=You",
    league: (profile.league as any) || "Bronze",
    xp: profile.xp || 0,
    isInteractiveUser: true,
    online: true
  }), [profile]);

  const mappedCompetitors: Player[] = useMemo(() => {
    return (allUsers || []).map(u => ({
      username: u.username,
      avatar: u.avatar,
      league: u.league || "Bronze",
      xp: u.xp || 0,
      online: u.online,
      lastSeen: u.lastSeen,
      isInteractiveUser: false
    }));
  }, [allUsers]);

  // Combined, filtered, & sorted list
  const filteredAndSortedList = useMemo(() => {
    const combined = [userCompetitorObj, ...mappedCompetitors]
      .filter((v, i, self) => self.findIndex(t => t.username === v.username) === i);

    return combined
      .filter(p => {
        const matchesSearch = p.username.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLeague = selectedLeagueTab === "All" || p.league.toLowerCase() === selectedLeagueTab.toLowerCase();
        return matchesSearch && matchesLeague;
      })
      .sort((a, b) => b.xp - a.xp);
  }, [userCompetitorObj, mappedCompetitors, searchQuery, selectedLeagueTab]);

  // Absolute placement in fully unfiltered global list (to retain true rankings)
  const trueRankingsMap = useMemo(() => {
    const combined = [userCompetitorObj, ...mappedCompetitors]
      .filter((v, i, self) => self.findIndex(t => t.username === v.username) === i);
    const sorted = combined.sort((a, b) => b.xp - a.xp);
    const m = new Map<string, number>();
    sorted.forEach((p, idx) => {
      m.set(p.username, idx + 1);
    });
    return m;
  }, [userCompetitorObj, mappedCompetitors]);

  // Top 3 for current filtered list or for worldwide
  const top3 = useMemo(() => {
    // We take top 3 from the filtered list to show specialized podium
    return filteredAndSortedList.slice(0, 3);
  }, [filteredAndSortedList]);

  const bottomList = useMemo(() => {
    return filteredAndSortedList.slice(3);
  }, [filteredAndSortedList]);

  // Trigger floating dynamic micro-particle cheers
  const triggerCheer = (username: string, emoji: string) => {
    const id = Date.now() + Math.random();
    const newCheer: MiniCheer = {
      id,
      emoji,
      x: (Math.random() - 0.5) * 60, // random offset placement
      y: -20 - Math.random() * 40
    };

    setCheers(prev => ({
      ...prev,
      [username]: [...(prev[username] || []), newCheer]
    }));

    // Clean up afterward
    setTimeout(() => {
      setCheers(prev => {
        const list = prev[username] || [];
        return {
          ...prev,
          [username]: list.filter(c => c.id !== id)
        };
      });
    }, 1500);
  };

  const getLeaguePillStyles = (league: string) => {
    switch (league) {
      case "Legend":
        return "bg-purple-500/10 text-[#CCFF00] border-purple-500/30";
      case "Titan":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Gold":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
      case "Silver":
        return "bg-slate-400/10 text-slate-300 border-slate-400/15";
      default:
        return "bg-amber-600/10 text-amber-500 border-amber-600/15";
    }
  };

  const tabs = ["All", "Legend", "Titan", "Gold", "Silver", "Bronze"];

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="animated-leaderboard-container">
      {/* Title block */}
      <div className="text-center relative py-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-block"
        >
          <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono font-extrabold bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-400/25 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            🌟 Season Ranks Verified
          </span>
        </motion.div>
        
        <motion.h3 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-3xl font-black text-white mt-4 tracking-tight uppercase"
        >
          Worldwide Competency Rankings
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-gray-400 mt-2 max-w-lg mx-auto leading-relaxed"
        >
          Daily dynamic updates tracking study speed, solved math/scientific logs, and active multipliers. Keep testing your mental core!
        </motion.p>
      </div>

      {/* Interactive Tabs Menu and Live Search Panel */}
      <div className="neo-glass rounded-3xl p-4 border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Custom sliding underline tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/5 self-start">
            {tabs.map((tab) => {
              const active = selectedLeagueTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedLeagueTab(tab)}
                  className={`relative px-4 py-2 text-xs font-mono font-extrabold uppercase rounded-xl transition-colors duration-300 select-none cursor-pointer ${
                    active ? "text-black" : "text-gray-400 hover:text-white"
                  }`}
                  id={`tab-btn-${tab.toLowerCase()}`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute inset-0 bg-cyan-400 rounded-xl"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] md:min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Competitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-2xl py-2 pl-10 pr-4 text-xs text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
              id="leaderboard-search-input"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Podium View */}
      {filteredAndSortedList.length > 0 && searchQuery === "" && (
        <div className="text-center mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* Second Place Podium Unit */}
            {top3[1] && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.1, damping: 15 }}
                whileHover={{ y: -5 }}
                className="neo-glass rounded-3xl p-6 border-white/5 relative bg-emerald-500/5 order-2 md:order-1 flex flex-col items-center group transition-shadow duration-300 hover:shadow-[0_4px_25px_rgba(16,185,129,0.08)]"
              >
                <div className="absolute top-3 right-3 text-emerald-400/60 font-mono text-xs font-black">#2</div>
                <div className="text-sm font-extrabold text-[#CCCCCC] font-mono tracking-wider uppercase mb-1">🥈 Silver Challenger</div>
                <div className="relative mb-3">
                  <img src={top3[1].avatar} alt="Second Avatar" className="w-16 h-16 bg-black/50 rounded-full border-2 border-slate-400/40 p-1" />
                  <span className="absolute -bottom-1 -right-1 bg-slate-400 text-black font-black text-[9px] w-5 h-5 flex items-center justify-center rounded-full">2</span>
                </div>
                <span className={`text-base font-black truncate max-w-full text-white ${top3[1].isInteractiveUser ? "text-cyan-300 underline underline-offset-4 decoration-cyan-400" : ""}`}>
                  {top3[1].username} {top3[1].isInteractiveUser && "👤"}
                </span>
                <span className="text-xs text-cyan-400 font-mono font-black mt-1 py-0.5 px-2 bg-cyan-900/10 rounded-full">
                  {top3[1].xp.toLocaleString()} XP
                </span>
                <div className="text-[10px] text-gray-400 uppercase font-mono mt-2 tracking-widest">{top3[1].league} LEAGUE</div>
                
                {/* Micro Cheer Panel */}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => triggerCheer(top3[1].username, "🔥")} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-full text-xs transition duration-200 cursor-pointer">🔥</button>
                  <button onClick={() => triggerCheer(top3[1].username, "👏")} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-full text-xs transition duration-200 cursor-pointer">👏</button>
                </div>
                {/* Floating particle animations */}
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

            {/* Supreme Champion Podium Unit */}
            {top3[0] && (
              <motion.div
                initial={{ opacity: 0, y: 70, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 80, delay: 0, damping: 12 }}
                whileHover={{ y: -8 }}
                className="neo-glass rounded-[40px] p-8 border-yellow-400/20 relative bg-yellow-500/5 order-1 md:order-2 flex flex-col items-center group shadow-[0_0_40px_rgba(234,179,8,0.12)] border"
              >
                <div className="absolute -top-3.5 right-1/2 translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[9px] font-black rounded-full font-mono uppercase px-4 py-1 tracking-widest flex items-center gap-1 shadow-lg">
                  <Crown className="w-3 h-3 fill-black text-black" /> SECURE CHAMPION
                </div>
                <div className="text-base font-black text-yellow-400 font-mono tracking-wider uppercase mb-1">🏆 #1 SUPREME</div>
                <div className="relative mb-5 mt-2">
                  <img src={top3[0].avatar} alt="First Avatar" className="w-22 h-22 bg-black/60 rounded-full border-3 border-yellow-400/90 p-1 shadow-2xl" />
                  <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-black font-black text-xs w-6 h-6 flex items-center justify-center rounded-full shadow-lg font-mono">1</span>
                </div>
                <span className={`text-lg font-black truncate max-w-full text-white tracking-wide ${top3[0].isInteractiveUser ? "text-cyan-200 underline underline-offset-4 decoration-[#CCFF00]" : ""}`}>
                  {top3[0].username} {top3[0].isInteractiveUser && "👤"}
                </span>
                <span className="text-sm text-[#CCFF00] font-mono font-extrabold mt-1.5 py-1 px-3.5 bg-[#CCFF00]/10 rounded-full shadow-inner border border-[#CCFF00]/20">
                  {top3[0].xp.toLocaleString()} XP
                </span>
                <div className="text-[10px] text-gray-300 font-bold uppercase font-mono mt-2 tracking-widest">{top3[0].league} LEAGUE</div>
                
                {/* Micro Cheer Panel */}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => triggerCheer(top3[0].username, "👑")} className="p-1 px-2.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-full text-xs transition duration-200 cursor-pointer">👑</button>
                  <button onClick={() => triggerCheer(top3[0].username, "⚡")} className="p-1 px-2.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-full text-xs transition duration-200 cursor-pointer">⚡</button>
                  <button onClick={() => triggerCheer(top3[0].username, "🚀")} className="p-1 px-2.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-full text-xs transition duration-200 cursor-pointer">🚀</button>
                </div>
                {/* Floating particle animations */}
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

            {/* Third Place Podium Unit */}
            {top3[2] && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2, damping: 15 }}
                whileHover={{ y: -5 }}
                className="neo-glass rounded-3xl p-6 border-white/5 relative bg-orange-500/5 order-3 flex flex-col items-center group transition-shadow duration-300 hover:shadow-[0_4px_25px_rgba(249,115,22,0.08)]"
              >
                <div className="absolute top-3 right-3 text-orange-400/60 font-mono text-xs font-black">#3</div>
                <div className="text-sm font-extrabold text-[#D97706] font-mono tracking-wider uppercase mb-1">🥉 Bronze Challenger</div>
                <div className="relative mb-3">
                  <img src={top3[2].avatar} alt="Third Avatar" className="w-16 h-16 bg-black/50 rounded-full border-2 border-amber-600/40 p-1" />
                  <span className="absolute -bottom-1 -right-1 bg-amber-600 text-black font-black text-[9px] w-5 h-5 flex items-center justify-center rounded-full">3</span>
                </div>
                <span className={`text-base font-black truncate max-w-full text-white ${top3[2].isInteractiveUser ? "text-cyan-300 underline underline-offset-4 decoration-cyan-400" : ""}`}>
                  {top3[2].username} {top3[2].isInteractiveUser && "👤"}
                </span>
                <span className="text-xs text-cyan-400 font-mono font-black mt-1 py-0.5 px-2 bg-cyan-900/10 rounded-full">
                  {top3[2].xp.toLocaleString()} XP
                </span>
                <div className="text-[10px] text-gray-400 uppercase font-mono mt-2 tracking-widest">{top3[2].league} LEAGUE</div>
                
                {/* Micro Cheer Panel */}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => triggerCheer(top3[2].username, "👍")} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-full text-xs transition duration-200 cursor-pointer">👍</button>
                  <button onClick={() => triggerCheer(top3[2].username, "💖")} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-full text-xs transition duration-200 cursor-pointer">💖</button>
                </div>
                {/* Floating particle animations */}
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

      {/* Roster & Complete Competitor List */}
      <div className="neo-glass rounded-[32px] p-6 border-white/5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#CCFF00]" />
            <span className="text-xs text-gray-300 uppercase tracking-widest font-mono font-bold">Roster Rankings Leaderboard</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">{filteredAndSortedList.length} Competitors Listed</span>
        </div>

        {filteredAndSortedList.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-mono text-xs">
            No student competitors match search parameters in this tier.
          </div>
        ) : (
          <motion.div 
            layout
            className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
          >
            <AnimatePresence mode="popLayout">
              {filteredAndSortedList.map((player, index) => {
                const isYou = player.isInteractiveUser;
                const absoluteRank = trueRankingsMap.get(player.username) || (index + 1);
                const isExpanded = expandedUser === player.username;

                // Calculate sub progress to next league max (approximate visual)
                const nextLeagueXpGoal = player.xp < 1000 ? 1000 : player.xp < 3000 ? 3000 : player.xp < 6000 ? 6000 : player.xp < 10000 ? 10000 : 20000;
                const progressPercentage = Math.min(100, Math.floor((player.xp / nextLeagueXpGoal) * 100));

                return (
                  <motion.div
                    key={player.username}
                    layout // dynamic layout re-ordering animation
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className={`rounded-2xl border cursor-pointer select-none overflow-hidden transition-all duration-300 ${
                      isYou 
                        ? 'bg-cyan-500/10 border-cyan-400/35 shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
                        : 'bg-black/25 border-white/5 hover:bg-black/35 hover:border-white/10'
                    }`}
                    onClick={() => setExpandedUser(isExpanded ? null : player.username)}
                  >
                    {/* Primary Row Content */}
                    <div className="flex items-center justify-between p-3 flex-wrap gap-2 md:gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Rank Pill */}
                        <div className="w-9 h-9 shrink-0 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center font-mono text-xs font-bold font-black text-gray-300">
                          #{absoluteRank}
                        </div>

                        {/* Avatar with status glow */}
                        <div className="relative shrink-0">
                          <img 
                            src={player.avatar} 
                            alt={`${player.username}'s Avatar`} 
                            className={`w-9 h-9 rounded-full bg-black/40 ${
                              isYou 
                                ? 'border-2 border-cyan-400' 
                                : 'border border-white/10'
                            }`}
                          />
                          {player.online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090b11]" />
                          )}
                        </div>

                        {/* User basic metrics */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-extrabold block truncate ${isYou ? 'text-cyan-300 text-sm' : 'text-white'}`}>
                              {player.username}
                            </span>
                            {isYou && (
                              <span className="shrink-0 bg-cyan-400 text-black font-black font-mono text-[8.5px] px-1.5 py-0.5 rounded uppercase">
                                YOU
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-[#8C8F9F] font-mono">
                            <span className={`px-1.5 py-0.5 rounded-full border text-[8px] uppercase tracking-wider font-extrabold ${getLeaguePillStyles(player.league)}`}>
                              {player.league}
                            </span>
                            {player.online ? (
                              <span className="text-emerald-400 text-[8px]">Active</span>
                            ) : (
                              <span className="text-gray-500 text-[8px]">{player.lastSeen || "Offline"}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right aligned XP display */}
                      <div className="flex items-center gap-3 self-end md:self-center">
                        <div className="text-right">
                          <span className="text-xs font-mono text-cyan-400 font-extrabold block">
                            {player.xp.toLocaleString()} XP
                          </span>
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest font-mono block">accumulated</span>
                        </div>
                        
                        {/* Compact Row Cheer buttons */}
                        <div className="flex items-center gap-1 relative z-20">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerCheer(player.username, "🔥");
                            }}
                            className="w-7 h-7 bg-white/5 hover:bg-white/10 text-[11px] rounded-lg transition flex items-center justify-center p-0 float-right cursor-pointer"
                          >
                            🔥
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Floating mini cheers animation for roster row */}
                    <div className="absolute inset-x-0 bottom-6 pointer-events-none overflow-visible">
                      <AnimatePresence>
                        {(cheers[player.username] || []).map(cheer => (
                          <motion.div
                            key={cheer.id}
                            initial={{ opacity: 1, scale: 0.5, y: 0, x: cheer.x + 80 }}
                            animate={{ opacity: 0, scale: 1.4, y: cheer.y - 20, x: cheer.x + 90 }}
                            exit={{ opacity: 0 }}
                            className="absolute text-lg font-bold select-none right-12 z-40"
                          >
                            {cheer.emoji}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Expanded Drawer Statistics details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-black/35 border-t border-white/5 overflow-hidden"
                        >
                          <div className="p-4 space-y-3.5 text-xs">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/40 rounded-xl p-3 border border-white/5">
                              <div>
                                <span className="text-[9px] text-gray-400 font-mono uppercase block">League Class</span>
                                <span className="text-xs font-black text-white font-mono">{player.league} League</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-gray-400 font-mono uppercase block">Accuracy Coefficient</span>
                                <span className="text-xs font-black text-[#CCFF00] font-mono">94.8% ACC</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-gray-400 font-mono uppercase block">Weekly Streak</span>
                                <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
                                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" /> 5 Days
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] text-gray-400 font-mono uppercase block">Calculated Tier</span>
                                <span className="text-xs font-black text-cyan-400 font-mono">ALGEBRAIC TIER 2</span>
                              </div>
                            </div>

                            {/* League goal progress bar */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[9px] font-mono">
                                <span className="text-gray-400 uppercase">Tier Acceleration to {player.league === "Legend" ? "Grandmaster" : "Next Tier"}</span>
                                <span className="text-cyan-300 font-bold">{progressPercentage}% ({player.xp} / {nextLeagueXpGoal} XP)</span>
                              </div>
                              <div className="h-2 w-full bg-black/50 overflow-hidden rounded-full border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercentage}%` }}
                                  transition={{ delay: 0.1, duration: 0.8, type: "tween" }}
                                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
                                />
                              </div>
                            </div>

                            {/* Cheers / Interactive quick greetings panel */}
                            <div className="flex items-center gap-2 flex-wrap pt-1.5">
                              <span className="text-[9px] text-gray-400 font-mono uppercase">Cheer and celebrate competitor node:</span>
                              <div className="flex gap-1.5">
                                {["🔥", "👏", "⚡", "💖", "🚀", "👍"].map(em => (
                                  <button
                                    key={em}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerCheer(player.username, em);
                                    }}
                                    className="p-1 px-2.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-xs transition duration-150 border border-white/5 cursor-pointer"
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
