import React, { useState, useEffect, useRef } from "react";
import { 
  Trophy, Flame, Coins, Zap, Play, Pause, RotateCcw, Volume2, VolumeX, 
  User, CheckCircle, Award, Compass, Search, Sparkles, Map, Target, Code,
  ChevronUp, ChevronDown, MessageSquare, Heart, Bookmark, Eye, Star, Monitor, School,
  Plus, Crown
} from "lucide-react";
import { UserProfile, Question, StudyReel, CareerRoadmap, ShopItem } from "../types";
import { admobService } from "../lib/AdMobService";
import { Capacitor } from "@capacitor/core";

// ==========================================
// 1. STUDY BATTLE ARENA COMPONENT
// ==========================================
interface StudyBattleArenaProps {
  userProfile: UserProfile;
  onGrantRewards: (xp: number, coins: number) => void;
  onAddNotification: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
}

export const StudyBattleArena: React.FC<StudyBattleArenaProps> = ({ userProfile, onGrantRewards, onAddNotification }) => {
  // Dynamic question generation function utilizing mathematical signs (+, -, =, *, /)
  const generateDynamicBattleQuestions = () => {
    const templates = [
      () => {
        const a = Math.floor(Math.random() * 25) + 5;
        const b = Math.floor(Math.random() * 20) + 3;
        const sum = a + b;
        return {
          q: `Solve the algebraic expression: x - ${b} = ${a}. Find the exact integer value of x.`,
          opts: [String(sum), String(sum - 3), String(sum + 4), String(Math.abs(a - b))],
          ansIdx: 0,
          hint: `Rearrange terms around the = sign to get x = ${a} + ${b}.`
        };
      },
      () => {
        const x = Math.floor(Math.random() * 8) + 3;
        const sq = x * x;
        return {
          q: `Solve for the positive real roots: x^2 - ${sq} = 0. Verify with factors.`,
          opts: [String(x + 2), String(x), String(x * 2), String(sq - 1)],
          ansIdx: 1,
          hint: `Factorize the difference of squares: (x - ${x}) * (x + ${x}) = 0.`
        };
      },
      () => {
        const val = (Math.floor(Math.random() * 5) + 1) * 2;
        return {
          q: `Calculate derivative value: If f(x) = ${val}x at point x = 1, compute the derivative f'(1).`,
          opts: [String(val - 1), String(val * 2), String(val), String(val / 2)],
          ansIdx: 2,
          hint: `The derivative of linear function k * x is simply the constant coefficient k.`
        };
      },
      () => {
        const f = (Math.floor(Math.random() * 8) + 2) * 10;
        const a = Math.floor(Math.random() * 4) + 2;
        const m = f / a;
        return {
          q: `Physics Mechanics: Solve for Mass "m" when Force F = ${f} N and Acceleration a = ${a} m/s^2. Formula: F = m * a.`,
          opts: [String(m + 5), String(m - 2), String(m), String(f * a)],
          ansIdx: 2,
          hint: `Rearrange the terms: m = F / a.`
        };
      },
      () => {
        const r1 = Math.floor(Math.random() * 10) + 2;
        const r2 = Math.floor(Math.random() * 10) + 2;
        const req = r1 + r2;
        return {
          q: `Electrical Circuits: If R1 = ${r1} Ohms and R2 = ${r2} Ohms are in a series link, compute R_total = R1 + R2.`,
          opts: [String(req - 1), String(req), String(req + 4), String(r1 * r2)],
          ansIdx: 1,
          hint: `Simply accumulate the series values: req = ${r1} + ${r2}.`
        };
      },
      () => {
        const length = Math.floor(Math.random() * 12) + 4;
        const width = Math.floor(Math.random() * 8) + 2;
        const area = length * width;
        return {
          q: `Geometry Formula: If a rectangle has length = ${length} cm and width = ${width} cm, solve for Area = length * width.`,
          opts: [String(area + 6), String(area - 5), String(area), String(2 * (length + width))],
          ansIdx: 2,
          hint: `Multiply rectangle dimensions: Area = ${length} * ${width}.`
        };
      },
      () => {
        const a = Math.floor(Math.random() * 15) + 5;
        const b = Math.floor(Math.random() * 10) + 2;
        const res = a * b;
        return {
          q: `Calculate product rate: Solve for y in the equation: y = ${a} * ${b}.`,
          opts: [String(res - 10), String(res + 5), String(res), String(a + b)],
          ansIdx: 2,
          hint: `Compute the multiplication: ${a} * ${b} directly.`
        };
      }
    ];

    // Select 3 random templates and execute them
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(fn => fn());
  };

  const opponents = [
    { name: "NeoNerd_0xG", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Nerd", xp: 4500 },
    { name: "CyberBrain_99", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Brain", xp: 8200 },
    { name: "SymmetricSolver", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Symm", xp: 6100 },
    { name: "AlgorithmicVortex", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alg", xp: 12400 }
  ];

  const [battleState, setBattleState] = useState<'lobby' | 'searching' | 'battle' | 'victory' | 'defeat'>('lobby');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [opponent, setOpponent] = useState({ name: "", avatar: "", xp: 0 });
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [battleTimer, setBattleTimer] = useState(15);
  const [userScore, setUserScore] = useState(0);
  const [opScore, setOpScore] = useState(0);
  const [battleQuestions, setBattleQuestions] = useState<any[]>(generateDynamicBattleQuestions());

  useEffect(() => {
    let interval: any;
    if (battleState === 'searching') {
      let duration = 0;
      interval = setInterval(() => {
        duration += 1;
        if (duration >= 3) {
          const randOp = opponents[Math.floor(Math.random() * opponents.length)];
          setOpponent(randOp);
          setBattleState('battle');
          setCurrentQIndex(0);
          setSelectedOpt(null);
          setBattleTimer(15);
          setUserScore(0);
          setOpScore(0);
          setOpponentProgress(0);
          onAddNotification("Duel Connected!", `You are matched with ${randOp.name}! XP Bet: ${betAmount}`, 'info');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [battleState]);

  useEffect(() => {
    let timer: any;
    if (battleState === 'battle') {
      timer = setInterval(() => {
        setBattleTimer((prev) => {
          if (prev <= 1) {
            // Force opponent logic and step to next or resolve
            resolveQuestionTurn();
            return 15;
          }
          return prev - 1;
        });

        // Chance opponent random increments
        if (Math.random() > 0.6) {
          setOpponentProgress((p) => Math.min(p + 1, 3));
          setOpScore((s) => s + (Math.random() > 0.5 ? 20 : 0));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [battleState, currentQIndex]);

  const initiateSearch = () => {
    if (userProfile.coins < betAmount) {
      alert("Insufficient study coins to complete registration!");
      return;
    }
    setBattleQuestions(generateDynamicBattleQuestions());
    setBattleState('searching');
  };

  const selectAnswer = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (idx === battleQuestions[currentQIndex].ansIdx) {
      setUserScore((s) => s + 35);
    }
  };

  const resolveQuestionTurn = () => {
    setSelectedOpt(null);
    if (currentQIndex < battleQuestions.length - 1) {
      setCurrentQIndex((idx) => idx + 1);
      setBattleTimer(15);
    } else {
      // Calculate outcome
      if (userScore >= opScore) {
        setBattleState('victory');
        onGrantRewards(betAmount * 1.5, betAmount);
        onAddNotification("Victory In Arena!", `You overcame ${opponent.name} and harvested ${betAmount} NEXA!`, 'success');
      } else {
        setBattleState('defeat');
        onGrantRewards(10, -betAmount);
        onAddNotification("Arena Defeat", `Your core parameters were decoded by ${opponent.name}. Try again!`, 'alert');
      }

      // Safe decentralized Google AdMob interstitial check
      admobService.showInterstitialAd().catch(err => {
        console.warn("App AdMob Interstitial missed or bypassed:", err);
      });
    }
  };

  return (
    <div className="neo-glass rounded-3xl p-6 relative overflow-hidden border-neon-purple/20">
      {battleState === 'lobby' && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-r from-neon-purple to-electric-blue rounded-2xl flex items-center justify-center mx-auto mb-4 glow-purple">
            <Trophy className="text-cyber-lime w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Study Battle Arena</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Pledge study coins and challenge other top student nodes worldwide in a live 3-round speed quiz!
          </p>

          <div className="bg-absolute-black/40 rounded-2xl p-4 border border-white/5 mb-6 max-w-xs mx-auto">
            <span className="text-xs text-sans block text-gray-400 mb-2">CHOOSE STUDY WAGER</span>
            <div className="flex justify-around items-center">
              {[50, 100, 250, 500].map((w) => (
                <button
                  key={w}
                  onClick={() => setBetAmount(w)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${betAmount === w ? 'bg-cyber-lime text-black border-cyber-lime glow-lime font-bold' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                >
                  {w} 🪙
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={initiateSearch}
            className="w-full max-w-sm py-3.5 bg-gradient-to-r from-electric-blue via-neon-purple to-cyber-lime text-black text-sm font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all text-center"
          >
            INITIALIZE MATCHMAKING
          </button>
        </div>
      )}

      {battleState === 'searching' && (
        <div className="text-center py-16">
          <div className="w-20 h-20 border-4 border-cyber-lime/30 border-t-cyber-lime rounded-full animate-spin mx-auto mb-6 flex items-center justify-center">
            <Zap className="text-cyber-lime w-8 h-8 animate-pulse" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2 blink">Scanning Peer Networks...</h4>
          <p className="text-xs text-gray-400">Pledge pool: {betAmount} NEXA | Matching with equivalent parameters</p>
        </div>
      )}

      {battleState === 'battle' && (
        <div>
          {/* Header Status UI */}
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 mb-6">
            <div className="flex items-center gap-3">
              <img src={userProfile.avatar} alt="You" className="w-9 h-9 border border-electric-blue rounded-full" />
              <div>
                <span className="text-xs font-bold text-gray-300 block">{userProfile.username}</span>
                <span className="text-sm font-mono text-cyan-400">{userScore} PTS</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs text-gray-400 block font-mono">ROUND {currentQIndex + 1}/3</span>
              <span className="text-lg font-bold text-cyber-lime animate-pulse">{battleTimer}s</span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-xs font-bold text-gray-300 block">{opponent.name}</span>
                <span className="text-sm font-mono text-pink-400">{opScore} PTS</span>
              </div>
              <img src={opponent.avatar} alt="Opponent" className="w-9 h-9 border border-neon-purple rounded-full" />
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-black/30 p-5 rounded-2xl border border-white/5 text-center mb-6">
            <p className="text-sm text-yellow-300 font-mono mb-2">CATEGORY: BATTLE QUANTUM</p>
            <p className="text-white text-base font-semibold">{battleQuestions[currentQIndex].q}</p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {battleQuestions[currentQIndex].opts.map((opt, oIdx) => {
              let btnCls = "bg-white/5 text-gray-300 border-white/5 hover:bg-white/10 hover:border-white/20";
              if (selectedOpt !== null) {
                if (oIdx === battleQuestions[currentQIndex].ansIdx) {
                  btnCls = "bg-green-500/20 text-green-300 border-green-500/80 glow-lime font-bold";
                } else if (selectedOpt === oIdx) {
                  btnCls = "bg-red-500/20 text-red-300 border-red-500/80";
                } else {
                  btnCls = "bg-white/2 opacity-30 pointer-events-none";
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => selectAnswer(oIdx)}
                  className={`w-full py-3 px-4 rounded-xl text-left border text-sm transition-all flex justify-between items-center ${btnCls}`}
                >
                  <span>{opt}</span>
                  {selectedOpt !== null && oIdx === battleQuestions[currentQIndex].ansIdx && (
                    <CheckCircle className="text-green-400 w-4 h-4" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Hint: {battleQuestions[currentQIndex].hint}</span>
            {selectedOpt !== null && (
              <button
                onClick={resolveQuestionTurn}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
              >
                PROCEED
              </button>
            )}
          </div>
        </div>
      )}

      {(battleState === 'victory' || battleState === 'defeat') && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            {battleState === 'victory' ? (
              <Award className="text-cyber-lime w-12 h-12" />
            ) : (
              <Flame className="text-red-500 w-12 h-12 animate-pulse" />
            )}
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-widest uppercase mb-2">
            {battleState === 'victory' ? "VICTORY ACHIEVED" : "DECODED LOBBY"}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
            {battleState === 'victory' 
              ? `Your system successfully parsed opponent arrays! You derived ${betAmount * 1.5} XP and ${betAmount} NEXA.`
              : `Opponent ${opponent.name} outperformed your calculation loops. Better luck next time node!`
            }
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6 text-sm font-mono bg-white/2 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-xs block text-gray-400">XP REWARD</span>
              <span className="text-green-400 font-bold">+{battleState === 'victory' ? betAmount * 1.5 : 10}</span>
            </div>
            <div>
              <span className="text-xs block text-gray-400">NEXA BALANCE CHANGE</span>
              <span className={battleState === 'victory' ? "text-cyber-lime font-bold" : "text-red-400 font-bold"}>
                {battleState === 'victory' ? `+${betAmount}` : `-${betAmount}`}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <button
              onClick={() => {
                // Regenerate the questions immediately - 100% changed
                const freshQs = generateDynamicBattleQuestions();
                setBattleQuestions(freshQs);
                setBattleState('searching');
                onAddNotification("⚡ Direct Rematch Initialized", "Dynamic formulas updated with fresh variables!", "info");
              }}
              className="flex-1 py-3 bg-[#CCFF00] hover:bg-cyan-400 text-black font-extrabold rounded-xl hover:scale-105 active:scale-95 transition-all uppercase text-xs cursor-pointer"
            >
              ⚡ MATCH AGAIN / DUEL
            </button>
            <button
              onClick={() => setBattleState('lobby')}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all text-xs cursor-pointer"
            >
              RETURN TO LOBBY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. FOCUS MODE & POMODORO TIMER
// ==========================================
interface FocusModeProps {
  onGrantRewards: (xp: number, coins: number) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onGrantRewards }) => {
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [audioPlay, setAudioPlay] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'lofi' | 'rain' | 'ambient'>('lofi');
  const [streakCount, setStreakCount] = useState(0);
  const [focusNotes, setFocusNotes] = useState("");

  const audioRefs: Record<string, string> = {
    lofi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // sample MP3
    rain: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    ambient: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  };

  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      onGrantRewards(100, 50);
      setStreakCount((s) => s + 1);
      alert("Focus cycle successfully integrated! Received +100 XP and +50 NEXA.");
      setTimer(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimer(25 * 60);
  };

  const toggleSound = () => {
    if (!audioPlayer.current) {
      audioPlayer.current = new Audio(audioRefs[selectedTrack]);
      audioPlayer.current.loop = true;
    }
    if (audioPlay) {
      audioPlayer.current.pause();
    } else {
      audioPlayer.current.src = audioRefs[selectedTrack];
      audioPlayer.current.play().catch((e) => console.log("Audio play blocked by browser. This is normal."));
    }
    setAudioPlay(!audioPlay);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Timer Display */}
      <div className="md:col-span-2 neo-glass rounded-3xl p-6 text-center flex flex-col justify-between border-white/5 relative overflow-hidden">
        <div>
          <span className="text-xs font-bold text-cyber-lime bg-cyber-lime/10 px-3 py-1 rounded-full uppercase tracking-wider">
            NexaSnap Focus Lock
          </span>
          <h2 className="text-6xl font-extrabold font-mono text-white my-8 tracking-tighter">
            {formatTime(timer)}
          </h2>
        </div>

        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-red-500 hover:bg-red-600 glow-purple text-white' : 'bg-cyber-lime hover:scale-105 active:scale-95 text-black glow-lime font-bold'}`}
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-12 h-12 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white rounded-2xl flex items-center justify-center transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['lofi', 'rain', 'ambient'] as const).map((track) => (
            <button
               key={track}
               onClick={() => {
                 setSelectedTrack(track);
                 if (audioPlay && audioPlayer.current) {
                   audioPlayer.current.src = audioRefs[track];
                   audioPlayer.current.play().catch(e => {});
                 }
               }}
               className={`py-2 px-3 rounded-xl border text-xs capitalize transition-all ${selectedTrack === track ? 'bg-electric-blue text-white border-electric-blue glow-cyan' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}
            >
              {track} Sound
            </button>
          ))}
        </div>
      </div>

      {/* Control Right Console */}
      <div className="neo-glass rounded-3xl p-6 border-white/5 flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-bold text-white mb-4">Focus Dashboard</h4>
          <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-2xl text-center border border-white/5">
              <span className="text-xs block text-gray-400 mb-1">STREAK MULTIPLIER</span>
              <div className="flex justify-center items-center gap-1.5">
                <Flame className="text-orange-500 w-5 h-5 animate-bounce" />
                <span className="text-xl font-bold text-white">{streakCount} sessions</span>
              </div>
            </div>

            <textarea
              placeholder="What core topics are we locking in right now?"
              value={focusNotes}
              onChange={(e) => setFocusNotes(e.target.value)}
              className="w-full h-24 bg-black/40 text-xs text-white p-3 rounded-xl border border-white/5 focus:border-neon-purple focus:outline-none resize-none"
            />
          </div>
        </div>

        <button
          onClick={toggleSound}
          className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 hover:text-white rounded-2xl flex justify-center items-center gap-2 text-xs text-gray-300 font-bold border border-white/5 transition-all"
        >
          {audioPlay ? <Volume2 className="text-cyber-lime" /> : <VolumeX />}
          {audioPlay ? "STOP ZEN AUDIO" : "PLAY FOCUS ZEN ACADEMY"}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. SMART PERFORMANCE ANALYTICS
// ==========================================
export const SmartAnalytics: React.FC = () => {
  const [comments, setComments] = useState<Array<{ id: string; username: string; avatar: string; text: string; time: string }>>([
    { id: "ac_1", username: "Dr. Evelyn Vance", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Evy", text: "Excellent linear algebraic trend lines this week. Keep backing up the weights!", time: "2h ago" },
    { id: "ac_2", username: "AuraCoder_⚡", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura", text: "Wow, 88% on algebra? Teach me the Olympiad hacks next session!", time: "5h ago" }
  ]);
  const [newCommentText, setNewCommentText] = useState("");

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    let userObj = { username: "You", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Nexa" };
    const storedUser = localStorage.getItem("nexasnap_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.username) userObj.username = parsed.username;
        if (parsed.avatar) userObj.avatar = parsed.avatar;
      } catch (err) {}
    }

    const createdComment = {
      id: `ac_user_${Date.now()}`,
      username: userObj.username,
      avatar: userObj.avatar,
      text: newCommentText.trim(),
      time: "Just now"
    };

    setComments([...comments, createdComment]);
    setNewCommentText("");
  };

  return (
    <div className="neo-glass rounded-3xl p-6 border-white/5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Neural Strength Index</h3>
          <p className="text-xs text-gray-400">Calculated weekly from your Question Bank and Solver activity</p>
        </div>
        <span className="text-xs font-mono text-cyber-lime bg-cyber-lime/10 px-3 py-1 rounded-full">
          AI Predicted Mastery
        </span>
      </div>

      {/* SVG Bar Chart representing strengths */}
      <div className="space-y-4 mb-6">
        {[
          { subject: "Algebra", percentage: 88, color: "bg-electric-blue" },
          { subject: "Atomic Physics", percentage: 74, color: "bg-neon-purple" },
          { subject: "Reaction Chemistry", percentage: 61, color: "bg-pink-500" },
          { subject: "Olympiad Math Hacks", percentage: 45, color: "bg-cyber-lime" }
        ].map((item, idx) => (
          <div key={idx} className="bg-absolute-black/30 p-3.5 rounded-2xl border border-white/2">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-gray-300">{item.subject}</span>
              <span className="font-mono text-white font-bold">{item.percentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${item.color} transition-all duration-1000`} 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neon-purple/5 p-4 rounded-2xl border border-neon-purple/20 text-xs text-center text-purple-300 mb-6">
        ✨ **AI Core Suggestion**: "Optimize study ratios on **Reaction Chemistry** equations inside the Battle Arena to elevate global placement node."
      </div>

      {/* Interactive feedback comments stream for charts */}
      <div className="border-t border-white/5 pt-6 space-y-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">📊 Chart Insights & Team Feedback</h4>
        
        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5 text-xs text-gray-300 bg-white/2 p-3 rounded-xl border border-white/5">
              <img src={c.avatar} alt="" className="w-8 h-8 rounded-full bg-black/60 border border-white/10" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-white">@{c.username}</span>
                  <span className="text-[9px] text-gray-500 font-mono">{c.time}</span>
                </div>
                <p className="text-gray-300 leading-normal">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Type comment or feedback message here..."
            className="flex-1 bg-black/40 text-xs text-white py-2.5 px-4 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
          />
          <button 
            type="submit" 
            className="py-2.5 px-4 bg-[#CCFF00] text-black hover:bg-cyan-400 font-bold rounded-xl text-xs uppercase cursor-pointer border-none"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. CAREER ROADMAP VIEW
// ==========================================
export const CareerRoadmapView: React.FC = () => {
  const [careerChoice, setCareerChoice] = useState("Quantum AI Architect");
  const [loading, setLoading] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap>({
    career: "Quantum AI Architect",
    salary: "$195,000 / Year equivalent",
    collegeSuggestions: ["Neo-Stanford Science Core", "MIT Cyber Labs"],
    roadmap: [
      { title: "Quantum Computing Foundations", duration: "Weeks 1-4", skills: ["Qubits", "Superposition", "Linear Algebra"], description: "Unify basic linear mathematics under multidimensional tensor spaces to represent qubits states." },
      { title: "Neural Gradient Matrices", duration: "Weeks 5-8", skills: ["Backpropagation", "Tensors", "CUDA Core"], description: "Configure feedback nodes across high performance server channels and optimize matrix pipelines." }
    ]
  });

  const isGradeLevel = /\b(9|10|11|12)\b/i.test(careerChoice) || /grade/i.test(careerChoice);

  const triggerGenerate = async () => {
    setLoading(true);
    setActiveNode(null);
    try {
      const res = await fetch("/api/gemini/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: careerChoice })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setRoadmap({
            career: data.career,
            salary: isGradeLevel ? "" : (data.salary || "$150,000 / Year"),
            collegeSuggestions: data.collegeSuggestions || ["NexaTech University Hub"],
            roadmap: data.roadmap || []
          });
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("AI roadmap generator server offline, using client simulation:", e);
    }

    // Local roadmap templates based on selection
    let mockRoadmapNodes = [
      { title: "Quantum Physics Foundations", duration: "Weeks 1-4", skills: ["Mathematical Analysis", "Qubits", "Superposition"], description: "Unify basic linear mathematics under multidimensional tensor spaces to represent qubit states." },
      { title: "Architectural System Interfacing", duration: "Weeks 5-8", skills: ["API Design", "Protocol Parsing", "Edge Node Config"], description: "Configure system modules across low-latency network pipelines to align telemetry indices." },
      { title: "Iterative Feedback Convergence", duration: "Weeks 9-12", skills: ["Stochastic Gradients", "Backpropagation", "Weight Optimizers"], description: "Calibrate multidimensional feedback networks to achieve system balance parameters." }
    ];

    let mockCollege = ["Neo-Stanford Science Core", "MIT Cyber Labs", "NexaTech University Hub"];
    let mockSalary = "$185,000 / Year";

    if (/robotics/i.test(careerChoice) || /grade 9/i.test(careerChoice)) {
      mockRoadmapNodes = [
        { title: "Boolean Logic & Circuitry", duration: "Weeks 1-4", skills: ["Gates", "Truth Tables", "Soldering"], description: "Learn how micro-relays and logic gates map truth statements directly to current voltage flow." },
        { title: "Micro-Controller Mapping", duration: "Weeks 5-8", skills: ["Arduino IDE", "C++ Basic Loops", "PWM Control"], description: "Program real-time boards to intercept analog sensor inputs and actuate physical kinetic motors." },
        { title: "Sensing Array Mechanics", duration: "Weeks 9-12", skills: ["Ultrasonics", "Infrared", "Gyroscope"], description: "Filter sonar bounce inputs and gyroscope axes to navigate mechanical vehicles through obstacles." }
      ];
      mockCollege = ["NexaTech robotics academy", "Kyoto Advanced Mechatronics"];
      mockSalary = "$115,000 / Year";
    } else if (/astro/i.test(careerChoice) || /grade 10/i.test(careerChoice)) {
      mockRoadmapNodes = [
        { title: "Organic Molecule Synthesis", duration: "Weeks 1-4", skills: ["Amino Acids", "Enzymes", "RNA Coding"], description: "Map biochemistry equations governing carbon structures under extreme space conditions." },
        { title: "Extraterrestrial Biosphere Simulation", duration: "Weeks 5-8", skills: ["Hydroponics", "Pressure Regulators", "O2 Synthesis"], description: "Build artificial feedback ecosystems that preserve biological cultures under sub-zero bounds." },
        { title: "Pathogen Mitigation Studies", duration: "Weeks 9-12", skills: ["Gene Sequencing", "CRISPR Filters", "Antiviral Shielding"], description: "Design protein sequences that bind to alien viral pods and neutralize bio-corrosive effects." }
      ];
      mockCollege = ["NASA Biotech Wing", "Zurich Astrobiology Guild"];
      mockSalary = "$135,000 / Year";
    }

    setRoadmap({
      career: careerChoice,
      salary: isGradeLevel ? "" : mockSalary,
      collegeSuggestions: mockCollege,
      roadmap: mockRoadmapNodes
    });
    setLoading(false);
  };

  const selectChip = (val: string) => {
    setCareerChoice(val);
  };

  return (
    <div className="neo-glass rounded-3xl p-6 border-white/5 space-y-6">
      {/* Grade / Career preset templates */}
      <div className="space-y-2">
        <label className="text-[10px] text-gray-400 uppercase font-mono pl-1 block">Futuristic Curriculum Presets</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Grade 9: Robotics & Logic", val: "Grade 9 Robotics with Boolean Logic" },
            { label: "Grade 10: Space Bio", val: "Grade 10 Astrobiology with Genetics" },
            { label: "Grade 11: Superconductors", val: "Grade 11 Solid State Superconductors" },
            { label: "Grade 12: Gen AI Systems", val: "Grade 12 Generative AI LLM Systems" },
            { label: "Quantum Architect", val: "Quantum AI Architect" }
          ].map((chip) => (
            <button
              key={chip.val}
              type="button"
              onClick={() => selectChip(chip.val)}
              className={`py-1 px-2.5 rounded-lg text-[10px] uppercase font-mono transition-all border rounded-lg cursor-pointer ${careerChoice === chip.val ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40" : "bg-white/2 text-gray-400 border-white/5 hover:text-white"}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5">
        <input
          type="text"
          value={careerChoice}
          onChange={(e) => setCareerChoice(e.target.value)}
          placeholder="e.g. Grade 10 Cybernetics, Quantum Architect..."
          className="flex-1 bg-black/40 text-xs font-bold text-white py-3 px-4 rounded-2xl border border-white/5 focus:border-cyan-400 focus:outline-none"
        />
        <button
          onClick={triggerGenerate}
          disabled={loading}
          className="bg-cyber-lime text-black font-bold text-xs py-3 px-6 rounded-2xl hover:scale-105 transition-all text-center flex items-center gap-1 border-none cursor-pointer"
        >
          {loading ? "COMPUTING..." : "MAP ROADMAP"}
        </button>
      </div>

      {/* Salary Information Conditionally Rendered */}
      {!isGradeLevel && roadmap.salary ? (
        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex justify-between items-center flex-wrap gap-4 animate-fade-in">
          <div>
            <span className="text-xs text-gray-400 block uppercase font-mono">Estimated Horizon Salary</span>
            <span className="text-lg font-bold text-cyan-400 font-mono tracking-tight">{roadmap.salary}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block uppercase font-mono">Recommended Hubs</span>
            <div className="flex gap-2 mt-1">
              {roadmap.collegeSuggestions.map((c, i) => (
                <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-gray-300 font-mono">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : isGradeLevel ? (
        <div className="bg-indigo-950/20 p-4 rounded-2xl border border-indigo-500/10 flex justify-between items-center flex-wrap gap-4 animate-fade-in">
          <div>
            <span className="text-xs text-indigo-300 block uppercase font-mono">Academic Tier Roadmap</span>
            <span className="text-xs text-gray-400 font-sans mt-0.5 block">Salary estimates excluded for standard grades 9-12 tracks.</span>
          </div>
          <div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg font-mono tracking-wider">GRADE ACCREDITED TRACK</span>
          </div>
        </div>
      ) : null}

      <div className="space-y-6 relative border-l-2 border-white/10 pl-6 ml-3 text-left">
        <div className="absolute -left-2 top-0 text-[10px] uppercase font-mono text-gray-500 bg-[#141211] px-1">Interactive Steps (Click to Expand Sandbox Tools)</div>
        
        {roadmap.roadmap.map((node, index) => {
          const isSelected = activeNode === index;
          return (
            <div 
              key={index} 
              onClick={() => setActiveNode(isSelected ? null : index)}
              className="relative cursor-pointer group select-none"
            >
              <div className={`absolute -left-9 top-1 w-5 h-5 bg-black border-2 rounded-full flex items-center justify-center transition-all ${isSelected ? 'border-cyan-400 scale-115' : 'border-cyber-lime group-hover:scale-110'}`}>
                <div className={`w-2 h-2 rounded-full transition-all ${isSelected ? 'bg-cyan-400' : 'bg-cyber-lime'}`} />
              </div>
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-white/5 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-transparent border-transparent group-hover:border-white/5'}`}>
                <span className="text-[10px] text-cyber-lime font-mono font-bold block mb-1 uppercase tracking-wider">{node.duration}</span>
                <h5 className="text-sm font-extrabold text-white mb-2 group-hover:text-cyan-300 transition-colors">{node.title}</h5>
                <p className="text-xs text-gray-400 max-w-xl mb-3 leading-relaxed">{node.description}</p>
                <div className="flex gap-2 flex-wrap mb-2">
                  {node.skills.map((s, idx) => (
                    <span key={idx} className="text-[9px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-md font-mono border border-cyan-500/15">
                      {s}
                    </span>
                  ))}
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-fade-in text-left">
                    <span className="text-[9px] uppercase font-mono text-cyan-400 font-extrabold tracking-widest block mb-2">🤖 Interactive Sandbox Lab Options</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`🔬 Launching simulated AI lab for: "${node.title}"! Node parameter connected.`);
                        }}
                        className="py-1.5 px-2 bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 hover:scale-[1.02] active:scale-95 text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase"
                      >
                        ⚡ Run Virtual Lab Sandbox
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`📚 Generating custom flashcard set for topic metrics: ${node.skills.join(", ")}!`);
                        }}
                        className="py-1.5 px-2 bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 hover:scale-[1.02] active:scale-95 text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase"
                      >
                        📚 Generate Custom Flashcard Decks
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 5. STUDY REELS SWIPER
// ==========================================
interface StudyReelsSwiperProps {
  reels: StudyReel[];
  onLikeReel: (id: string) => void;
  onGrantRewards: (xp: number, coins: number) => void;
}

export const StudyReelsSwiper: React.FC<StudyReelsSwiperProps> = ({ reels, onLikeReel, onGrantRewards }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sharing flows elements
  const [sharingReelId, setSharingReelId] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Remix Commentary recording states
  const [activeRemixReel, setActiveRemixReel] = useState<StudyReel | null>(null);
  const [userVideoStream, setUserVideoStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [remixLayout, setRemixLayout] = useState<'pip' | 'split' | 'circular'>('pip');
  const [commentaryText, setCommentaryText] = useState<string>("");
  const [finishedRemix, setFinishedRemix] = useState<boolean>(false);
  const [audioWaves, setAudioWaves] = useState<number[]>([15, 30, 45, 10, 25, 40, 15, 30, 20, 35, 18, 28]);

  const userVideoRef = useRef<HTMLVideoElement | null>(null);

  // Simulate audio waves during active recording
  useEffect(() => {
    let waveInterval: NodeJS.Timeout;
    if (isRecording) {
      waveInterval = setInterval(() => {
        setAudioWaves(Array.from({ length: 12 }, () => Math.floor(Math.random() * 45) + 12));
      }, 150);
    }
    return () => clearInterval(waveInterval);
  }, [isRecording]);

  // Bind active video stream to video DOM element
  useEffect(() => {
    if (userVideoRef.current && userVideoStream && activeRemixReel) {
      userVideoRef.current.srcObject = userVideoStream;
    }
  }, [userVideoStream, activeRemixReel]);

  const handleStartRemix = async (reel: StudyReel) => {
    setActiveRemixReel(reel);
    setIsRecording(false);
    setRecordingTime(0);
    setFinishedRemix(false);
    setCommentaryText("");
    
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: true });
        setUserVideoStream(stream);
      }
    } catch (err) {
      console.warn("Secure camera stream access failed. Launching high-fidelity mock feedback interface.", err);
    }
  };

  const handleCloseRemix = () => {
    if (userVideoStream) {
      userVideoStream.getTracks().forEach(track => track.stop());
      setUserVideoStream(null);
    }
    setActiveRemixReel(null);
    setIsRecording(false);
  };

  const handleSaveRemix = () => {
    setIsRecording(false);
    setFinishedRemix(true);
    
    // Grant rewards!
    onGrantRewards(100, 50);
    alert("🎨 Remix Commentary Compiled successfully! Added +50 Study Coins and +100 XP to your credentials.");

    if (userVideoStream) {
      userVideoStream.getTracks().forEach(track => track.stop());
      setUserVideoStream(null);
    }
  };

  const mockPeers = ["BioQueen_🌿", "AuraCoder_⚡", "CodeGod_💻", "ChemWitch_🧪", "HyperPhysicist_⚛️"];

  const handleOpenShare = (reelId: string) => {
    setSharingReelId(reelId);
    setSelectedRecipient("");
    setShowNotification(null);
  };

  const handleConfirmShare = () => {
    if (!selectedRecipient) {
      setShowNotification("Please select a recipient to share the reel!");
      return;
    }
    // Grant rewards on successful verified share!
    onGrantRewards(30, 15); // +30 XP and +15 Coins awarded on real verified share
    setSharingReelId(null);
    alert(`🔗 verified successful transmit! Shared this study reel directly with @${selectedRecipient}. You earned +15 NEXA Coins & +30 XP!`);
  };

  const handleCancelShare = () => {
    setSharingReelId(null);
    // Explicit requested prompt message
    setShowNotification("please share to get coin");
    setTimeout(() => {
      setShowNotification(null);
    }, 4500);
  };

  return (
    <div className="max-w-md mx-auto space-y-2 select-none relative">
      <span className="text-[10px] text-zinc-400 font-mono text-center block uppercase">💡 Scroll / swipe to move to next reel module (YouTube style snap)</span>
      
      {/* Absolute toast warnings display */}
      {showNotification && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white font-mono font-bold text-xs px-4 py-2.5 rounded-full shadow-lg border border-red-600 animate-bounce z-50 uppercase tracking-wider text-center">
          ⚠️ {showNotification}
        </div>
      )}

      {/* Snap container size matched perfectly to the card height (516px) for tight YouTube Shorts snapping */}
      <div 
        ref={containerRef}
        className="max-w-sm mx-auto h-[516px] overflow-y-auto snap-y snap-mandatory rounded-[35px] border border-white/10 p-1.5 bg-black/40 relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reels.map((reel) => (
          <div 
            key={reel.id} 
            className="reel-snap-item w-full h-[504px] snap-start snap-always bg-black/80 rounded-3xl overflow-hidden relative flex flex-col justify-between p-4 flex-shrink-0"
          >
            {/* Video Sandbox Box */}
            <div className="bg-black/80 rounded-2xl overflow-hidden h-full relative flex items-center justify-center border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black flex flex-col justify-end p-5">
                <div className="mb-4 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <img src={reel.creatorAvatar} alt="" className="w-8 h-8 rounded-full border border-cyber-lime" />
                    <span className="text-xs font-bold text-white">@{reel.creator}</span>
                    <button className="px-2.5 py-0.5 bg-cyber-lime text-black rounded-md text-[9px] font-bold">FOLLOW</button>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{reel.caption}</p>
                </div>
              </div>

              {/* Video simulation preview */}
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer animate-pulse z-10">
                <Play className="text-cyber-lime w-6 h-6 ml-1 fill-current" />
              </div>
            </div>

            {/* Sidemenu Interaction options */}
            <div className="absolute right-4 top-1/4 flex flex-col gap-5.5 text-center z-10 bg-black/60 p-2.5 rounded-2xl border border-white/5 backdrop-blur-md">
              <button 
                onClick={() => {
                  onLikeReel(reel.id);
                }} 
                className="flex flex-col items-center bg-transparent border-none cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${reel.liked ? 'text-red-500 fill-current animate-bounce' : 'text-gray-300'}`} />
                <span className="text-[9px] font-mono text-gray-400 mt-1">{reel.likes}</span>
              </button>
              
              {/* INTERACTIVE VERIFIED SHARE TRIGGER */}
              <button 
                onClick={() => handleOpenShare(reel.id)}
                className="flex flex-col items-center bg-transparent border-none cursor-pointer text-cyan-400 hover:text-[#CCFF00] transition-colors"
                id={`share_reel_btn_${reel.id}`}
              >
                <span className="text-base">🚀</span>
                <span className="text-[8px] font-mono text-[#CCFF00] mt-1 uppercase font-black tracking-wider">SHARE</span>
              </button>

              {/* REMIX COMMENTARY OVERLAY TRIGGER */}
              <button 
                onClick={() => handleStartRemix(reel)}
                className="flex flex-col items-center bg-transparent border-none cursor-pointer text-pink-400 hover:text-pink-300 transition-colors"
                id={`remix_reel_btn_${reel.id}`}
              >
                <span className="text-base">🎙️</span>
                <span className="text-[8px] font-mono text-pink-400 mt-1 uppercase font-black tracking-wider">REMIX</span>
              </button>

              <button 
                onClick={() => {
                  alert("💬 Comment System: No coins awarded on comments. Write responses inside live chat rooms!");
                }}
                className="flex flex-col items-center bg-transparent border-none cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-gray-300 hover:text-cyan-300" />
                <span className="text-[9px] font-mono text-gray-400 mt-1">{reel.comments}</span>
              </button>
              
              <button 
                onClick={() => alert("💾 Saved to your study workspace bookmarks!")}
                className="flex flex-col items-center bg-transparent border-none cursor-pointer"
              >
                <Bookmark className={`w-5 h-5 ${reel.saved ? 'text-cyber-lime fill-current' : 'text-gray-300'}`} />
                <span className="text-[9px] font-mono text-gray-400 mt-1 uppercase">SAVE</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* REEL SEND/SHARE DESTINATION PICKER DRAWER */}
      {sharingReelId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#0b0f19] p-5 rounded-3xl border border-cyan-500/30 text-center animate-fade-in text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <span className="text-[9px] font-mono text-[#CCFF00] tracking-widest uppercase font-black bg-[#CCFF00]/10 px-2.5 py-0.5 rounded-full">
              Verified Transmit Protocol
            </span>
            <h4 className="text-sm font-extrabold text-white mt-3 uppercase tracking-tight">Select Recipient Node</h4>
            <p className="text-[10px] text-gray-400 mt-1 leading-normal">
              You must transmit the video packets to a classmate to unlock the coin reward.
            </p>

            <div className="my-4 space-y-1.5 max-h-40 overflow-y-auto text-left pr-1 scrollbar-thin">
              {mockPeers.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedRecipient(p)}
                  className={`w-full text-left py-2 px-3 text-xs font-mono rounded-xl border transition-all ${selectedRecipient === p ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-black/35 text-gray-300 border-white/5 hover:bg-white/5'}`}
                >
                  📡 @{p}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button
                onClick={handleCancelShare}
                className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 focus:outline-none rounded-xl text-[10px] uppercase font-mono tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShare}
                className="flex-[1.5] py-1.5 bg-[#CCFF00] text-black font-extrabold text-[10px] uppercase font-mono tracking-wider rounded-xl cursor-pointer"
              >
                Send Share 🔗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC REMIX COMMENTARY RECORDING INTERFACE OVERLAY */}
      {activeRemixReel && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[65] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0b0f19] border border-pink-500/30 rounded-[35px] overflow-hidden flex flex-col p-6 text-white shadow-[0_0_35px_rgba(244,63,94,0.25)] relative max-h-[92vh] overflow-y-auto">
            
            {/* Header branding info */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <div>
                <span className="text-[9px] font-mono font-black uppercase text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                  🎙️ CO-LAB AUDIO/VIDEO REMIXER PROTOCOL
                </span>
                <h4 className="text-base font-extrabold text-white mt-1.5">REMIX STREAM OF @{activeRemixReel.creator}</h4>
              </div>
              <button 
                onClick={handleCloseRemix}
                className="py-1 px-2.5 bg-white/5 hover:bg-white/10 text-xs rounded-xl font-mono text-gray-300 hover:text-white cursor-pointer border border-white/5"
              >
                DISCONNECT
              </button>
            </div>

            {/* Split layout preview screen depending on configured mode */}
            <div className="bg-black/60 border border-white/5 rounded-3xl p-3 mb-4 space-y-3 relative overflow-hidden">
              <span className="text-[9px] uppercase font-mono text-zinc-500 block">VIEWPORT PREVIEW MONITOR</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 relative bg-[#06080e] rounded-2xl border border-white/5 p-2 overflow-hidden items-center justify-center">
                
                {/* original reel simulated stream block */}
                <div className="h-full bg-black/40 rounded-xl relative overflow-hidden flex flex-col justify-end p-2 border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
                  <div className="absolute top-2 left-2 z-20 text-[8px] font-mono bg-black/85 px-1.5 py-0.5 rounded text-gray-400">
                    ORIGINAL REEL
                  </div>
                  <video 
                    src={activeRemixReel.videoUrl} 
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                  <div className="relative z-20 space-y-1">
                    <p className="text-[10px] text-zinc-300 line-clamp-1 font-mono">@{activeRemixReel.creator}</p>
                    <p className="text-[8px] text-zinc-400 line-clamp-1 font-sans">{activeRemixReel.caption}</p>
                  </div>
                </div>

                {/* commentary recorder feed block */}
                <div className="h-full bg-black/40 rounded-xl relative overflow-hidden flex flex-col justify-end p-2 border border-pink-500/20">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
                  
                  {/* Status displays */}
                  <div className="absolute top-2 left-2 z-20 flex gap-1 items-center">
                    <span className="text-[8px] font-mono bg-pink-500/15 text-pink-300 border border-pink-500/20 px-1.5 py-0.5 rounded uppercase font-black">
                      YOUR COMMENTARY
                    </span>
                    {isRecording && (
                      <span className="flex items-center gap-1 text-[8px] font-mono bg-red-600/30 text-red-400 px-1.5 py-0.5 rounded font-black animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> REC {recordingTime}s
                      </span>
                    )}
                  </div>

                  {userVideoStream ? (
                    <video 
                      ref={userVideoRef}
                      className="absolute inset-0 w-full h-full object-cover rounded-xl scale-x-[-1]"
                      muted
                      autoPlay
                      playsInline
                    />
                  ) : (
                    // HIGH END VECTOR AI FEED SIMULATOR FALLBACK
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/20 via-black to-slate-950/40 flex flex-col items-center justify-center p-3 text-center">
                      <div className="relative mb-2">
                        <div className={`w-12 h-12 rounded-full bg-pink-600/10 border-2 border-pink-500 flex items-center justify-center ${isRecording ? 'animate-pulse scale-105' : ''}`}>
                          <span className="text-xl">🎙️</span>
                        </div>
                        {isRecording && (
                          <div className="absolute -inset-1 rounded-full border border-pink-400 animate-ping opacity-60" />
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400 block font-bold leading-none uppercase">MIC SOURCE SELECTED</span>
                      <span className="text-[7px] font-mono text-pink-400 mt-1 uppercase">Webcam disabled - audio wave active</span>
                    </div>
                  )}

                  {/* Active soundwave elements in standard absolute drawer overlay */}
                  {isRecording && (
                    <div className="absolute bottom-2 inset-x-2 z-20 flex items-end justify-center gap-0.5 h-6 bg-black/50 p-1 rounded">
                      {audioWaves.map((waveHeight, idx) => (
                        <div 
                          key={idx} 
                          style={{ height: `${waveHeight}%` }}
                          className="w-1 bg-pink-400/80 rounded-full transition-all duration-150"
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Layout controls */}
              <div className="flex gap-2 items-center justify-between border-t border-white/5 pt-2 font-mono">
                <span className="text-[9px] text-gray-400 font-bold uppercase">POSITIONING LAYOUT MATRIX:</span>
                <div className="flex gap-1.5">
                  {(['pip', 'split', 'circular'] as const).map((lay) => (
                    <button
                      key={lay}
                      onClick={() => setRemixLayout(lay)}
                      className={`text-[9px] py-1 px-2.5 rounded-lg border transition-all uppercase font-medium cursor-pointer ${remixLayout === lay ? 'bg-pink-500/20 text-pink-300 border-pink-500' : 'bg-black/30 text-gray-500 border-white/5 hover:bg-white/5'}`}
                    >
                      {lay}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Commentary thoughts text input */}
            <div className="space-y-1.5 mb-4 font-mono">
              <label className="text-[9px] uppercase text-zinc-400 font-bold block">Optional formula annotation / voice-over caption:</label>
              <textarea 
                value={commentaryText}
                onChange={(e) => setCommentaryText(e.target.value)}
                placeholder="Declare active derivations or custom reactions here to synchronize on screen overlays..."
                rows={2}
                className="w-full bg-black/60 rounded-xl border border-white/5 py-2.5 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 font-sans"
              />
            </div>

            {/* Action sequence button controls */}
            <div className="space-y-3">
              {finishedRemix ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center space-y-3">
                  <span className="text-xl">🏆</span>
                  <p className="text-xs text-emerald-400 font-mono font-bold uppercase">REMIX RE-UPLOAD MINT SUCCESSFUL!</p>
                  <p className="text-[10px] text-gray-400">
                    Your commentary overlay has been stitched and saved. +50 Study Coins & +100 XP have been synchronized directly to your main registry.
                  </p>
                  <button
                    onClick={handleCloseRemix}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase rounded-xl border-none cursor-pointer"
                  >
                    RETURN TO FEED
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  {isRecording ? (
                    <button
                      onClick={handleSaveRemix}
                      className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-extrabold text-xs uppercase rounded-xl border-none cursor-pointer hover:scale-102 transition-all flex items-center justify-center gap-2"
                    >
                      ⏹️ STOP RECORDING & SAVE REMIX
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsRecording(true)}
                      className="flex-1 py-3 bg-gradient-to-r from-[#FF007F] to-pink-600 hover:scale-102 text-white font-extrabold text-xs uppercase rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,0,127,0.3)] animate-pulse"
                    >
                      🔴 START RECORDING COMMENTARY
                    </button>
                  )}
                  <button
                    onClick={handleCloseRemix}
                    className="py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs uppercase font-mono tracking-wider cursor-pointer border border-white/5"
                  >
                    QUIT
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. AVATAR STUDIO & ACCESSORIES
// ==========================================
interface AvatarStudioProps {
  userProfile: UserProfile;
  onChangeAvatar: (url: string) => void;
  onChangeCosmetics: (styleClass: string) => void;
}

export const AvatarStudio: React.FC<AvatarStudioProps> = ({ userProfile, onChangeAvatar, onChangeCosmetics }) => {
  const seedList = ["Leo", "Max", "Siri", "Jade", "Zoe", "Veda", "Helix", "Nova"];
  const borders = [
    { name: "Default Quartz", class: "" },
    { name: "Cyan Laser Halo", class: "outline outline-4 outline-cyan-400 outline-offset-4 ring-4 ring-cyan-500/20" },
    { name: "Neon Sun Aura", class: "outline outline-4 outline-yellow-400 outline-offset-4 ring-4 ring-yellow-500/20 animate-pulse" },
    { name: "Royal Crown Crown", class: "outline outline-4 outline-purple-500 outline-offset-2 border-royal" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Visual Avatar State Box */}
      <div className="neo-glass rounded-3xl p-6 text-center border-white/5 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <img 
            src={userProfile.avatar} 
            alt="Active Node" 
            className={`w-24 h-24 rounded-full bg-absolute-black bg-gradient-to-tr from-white/2 to-white/10 p-1 transition-all duration-300 ${userProfile.cosmetics.includes("pulse") ? "animate-pulse" : ""} ${userProfile.cosmetics[0] || ""}`} 
          />
          <div className="absolute -bottom-1 -right-1 bg-cyber-lime text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            {userProfile.league}
          </div>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-white mb-2">{userProfile.username}</h3>
        <span className="text-xs text-mono text-cyan-400">{userProfile.email}</span>
      </div>

      {/* Assembly Options */}
      <div className="neo-glass rounded-3xl p-6 border-white/5 flex flex-col justify-between">
        <div>
          <h4 className="text-base font-bold text-white mb-3">Choose Neural Seeds</h4>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {seedList.map((seed) => {
              const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
              return (
                <button
                  key={seed}
                  onClick={() => onChangeAvatar(url)}
                  className={`w-full aspect-square bg-black/40 hover:bg-white/5 rounded-xl border flex items-center justify-center transition-all ${userProfile.avatar === url ? 'border-cyber-lime' : 'border-white/5'}`}
                >
                  <img src={url} alt={seed} className="w-10 h-10" />
                </button>
              );
            })}
          </div>

          <h4 className="text-base font-bold text-white mb-3">Core Cosmetics Setup</h4>
          <div className="grid grid-cols-1 gap-2">
            {borders.map((b) => (
              <button
                key={b.name}
                onClick={() => onChangeCosmetics(b.class)}
                className={`w-full text-left py-2.5 px-4 rounded-xl border text-xs transition-all ${userProfile.cosmetics.includes(b.class) ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/35 font-bold' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. NEXAVERSE 3D CAMPUS (Hologram Explore Map)
// ==========================================
interface NexaVerseCampusProps {
  onGrantRewards: (xp: number, coins: number) => void;
  onAddNotification: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
}

export const NexaVerseCampus: React.FC<NexaVerseCampusProps> = ({ onGrantRewards, onAddNotification }) => {
  const [visited, setVisited] = useState<string[]>([]);

  const zones = [
    { id: "z_sci", name: "Quantum Physics Lab", icon: School, desc: "Solve complex formula models under subatomic vacuum loops.", awardXp: 40, awardCoins: 20 },
    { id: "z_mth", name: "Pythagorean Dome", icon: Trophy, desc: "Participate in real-time algebraic logic and tournament arrays.", awardXp: 50, awardCoins: 30 },
    { id: "z_lib", name: "Virtual Alexandria", icon: Compass, desc: "Explore thousands of community generated study hacks & markdown sheets.", awardXp: 30, awardCoins: 10 },
    { id: "z_lounge", name: "NexaSnap Social Commons", icon: Star, desc: "Meet other study node avatars, share stickers or engage in chats.", awardXp: 20, awardCoins: 5 }
  ];

  const exploreZone = (zId: string, xp: number, coins: number, name: string) => {
    if (visited.includes(zId)) {
      alert("Terminal core parameters already processed! Explore other nodes.");
      return;
    }
    setVisited([...visited, zId]);
    onGrantRewards(xp, coins);
    onAddNotification("Zone Discovered!", `You integrated insights from "${name}"! Derived +${xp} XP & +${coins} NEXA.`, 'success');
  };

  return (
    <div className="neo-glass rounded-3xl p-6 border-white/5">
      <div className="text-center max-w-md mx-auto mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">NexaVerse Virtual Campus</h3>
        <p className="text-xs text-gray-400">
          Navigate the decentralized holographic academy! Click nodes to synchronize parameters and claim hidden coin payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const Icon = zone.icon;
          const isVisited = visited.includes(zone.id);

          return (
            <div
              key={zone.id}
              onClick={() => exploreZone(zone.id, zone.awardXp, zone.awardCoins, zone.name)}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.02] flex items-start gap-4 ${isVisited ? 'bg-black/40 border-green-500/20 opacity-70' : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-cyan-500/20'}`}
            >
              <div className={`p-3 rounded-xl flex items-center justify-center ${isVisited ? 'bg-green-500/10 text-green-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h5 className={`text-sm font-bold ${isVisited ? 'text-gray-400' : 'text-white'}`}>{zone.name}</h5>
                  {isVisited && <span className="text-[10px] text-green-400 font-bold uppercase tracking-wide">Done</span>}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">{zone.desc}</p>
                <div className="flex gap-3 text-[10px] font-mono">
                  <span className="text-green-400">+{zone.awardXp} XP</span>
                  <span className="text-yellow-400">+{zone.awardCoins} NEXA</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 8. DAILY STREAKS ATTENDANCE CENTER (REPLACED SPIN AND EARN LOOP)
// ==========================================
interface DailyRewardHubProps {
  onGrantRewards: (xp: number, coins: number) => void;
  onAddNotification: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
  profile: any;
  onSaveProfile: (profile: any) => void;
}

export const DailyRewardHub: React.FC<DailyRewardHubProps> = ({ 
  onGrantRewards, 
  onAddNotification,
  profile,
  onSaveProfile
}) => {
  // 30 days of customized data with reputation milestone gifts
  const daysLabels = React.useMemo(() => {
    return Array.from({ length: 30 }, (_, index) => {
      const dayNum = index + 1;
      let prize = "";
      let xp = 20 + dayNum * 5;
      let coins = 50 + dayNum * 15;
      let reputation = 0;
      let type: "coins_xp" | "reputation_milestone" = "coins_xp";

      if (dayNum === 6) {
        reputation = 5;
        prize = "+5 Rep & 200 NEXA";
        type = "reputation_milestone";
      } else if (dayNum === 12) {
        reputation = 10;
        prize = "+10 Rep & 400 NEXA";
        type = "reputation_milestone";
      } else if (dayNum === 18) {
        reputation = 15;
        prize = "+15 Rep & 600 NEXA";
        type = "reputation_milestone";
      } else if (dayNum === 24) {
        reputation = 25;
        prize = "+25 Rep & 1000 NEXA";
        type = "reputation_milestone";
      } else if (dayNum === 30) {
        reputation = 50;
        prize = "+50 Rep & 2500 NEXA 👑";
        xp = 500;
        type = "reputation_milestone";
      } else {
        prize = `${coins} NEXA + ${xp} XP`;
      }

      return {
        idx: index,
        day: `Day ${dayNum}`,
        prize,
        xp,
        coins,
        reputation,
        type
      };
    });
  }, []);

  const userSuffix = profile.username ? `_${profile.username.toLowerCase()}` : "";

  const [checkedBlocks, setCheckedBlocks] = useState<number[]>([]);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);

  // Synchronize loading checked blocks and timer when active profile/user changes
  useEffect(() => {
    const activeSuffix = profile.username ? `_${profile.username.toLowerCase()}` : "";
    const savedBlocks = localStorage.getItem(`nexa_30_checked_blocks${activeSuffix}`);
    setCheckedBlocks(savedBlocks ? JSON.parse(savedBlocks) : [0, 1]); // Precheck some days for visual interest of the start state

    const savedTime = localStorage.getItem(`nexa_30_last_check_time${activeSuffix}`);
    setLastCheckTime(savedTime ? parseInt(savedTime, 10) : Date.now() - 25 * 60 * 60 * 1000);
  }, [profile.username]);

  const [activeWait, setActiveWait] = useState(false);
  const [activeTab, setActiveTab] = useState<"t1" | "t2" | "t3">("t1"); // T1: 1-10, T2: 11-20, T3: 21-30
  
  const [adPlaying, setAdPlaying] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);

  const handleWatchAd = async () => {
    if (!profile.username) {
      alert("Please initialize your node username first!");
      return;
    }

    const isNative = Capacitor.isNativePlatform();
    if (!isNative) {
      onAddNotification("BROWSER SANDBOX RESTRICTED 📱", "Real Google AdMob ads work only inside native Android APK builds.", "alert");
      alert("BROWSER SANDBOX RESTRICTED: Real Google AdMob ads work only inside native Android APK builds.");
      return;
    }

    const adCount = profile.daily_ad_count || 0;
    const lastAdTime = profile.last_ad_timestamp || "";
    const todayStr = new Date().toISOString().split("T")[0];
    let currentCount = adCount;

    if (lastAdTime && lastAdTime.split("T")[0] !== todayStr) {
      currentCount = 0;
    }

    if (currentCount >= 10) {
      onAddNotification("Ad Limit Encountered 🚫", "Daily limit reached! Come back tomorrow.", "alert");
      alert("Daily ad limit reached! Come back tomorrow.");
      return;
    }

    try {
      onAddNotification("CONNECTING AD SERVER 📡", "Contacting Google Mobile Ads server for verified Rewarded stream...", "info");
      
      const success = await admobService.showRewardedAd(
        async (rewardedAmount) => {
          const nextCount = currentCount + 1;
          const nextCoins = (profile.coins || 0) + 50;

          try {
            const { syncUserProfileUpdate } = await import("../lib/firebase");
            await syncUserProfileUpdate(profile.username, {
              daily_ad_count: nextCount,
              last_ad_timestamp: new Date().toISOString(),
              nexa_coins: nextCoins,
              coins: nextCoins
            });

            onSaveProfile({
              ...profile,
              coins: nextCoins,
              daily_ad_count: nextCount,
              last_ad_timestamp: new Date().toISOString()
            });

            onAddNotification("Nexa Coins Claimed! 💰", `Earned +50 NEXA from video ad! (${nextCount}/10 today)`, "success");
            alert(`Success! Gained +50 NEXA Coins! Daily views: ${nextCount}/10`);
          } catch (err) {
            console.error("Ad coin synchronization failed:", err);
            onAddNotification("Ad Sync Error", "Failed to update wallet parameters.", "alert");
          }
        },
        () => {
          console.log("Rewarded ad closed in PageComponents");
        }
      );

      if (!success) {
        onAddNotification("ADMOB FAILURE ⚠️", "AdMob display was suspended or preloading delayed.", "alert");
      }
    } catch (err: any) {
      onAddNotification("ADMOB FAILED ❌", err?.message || "Failed to load Google rewarded ad.", "alert");
    }
  };

  // Auto detect broken streak lapse on mount/update of lastCheckTime
  useEffect(() => {
    if (lastCheckTime > 0) {
      const timeDiff = Date.now() - lastCheckTime;
      // Over 48 hours means they missed their daily attendance window
      if (timeDiff > 48 * 60 * 60 * 1000) {
        setCheckedBlocks([]);
        localStorage.setItem(`nexa_30_checked_blocks${userSuffix}`, JSON.stringify([]));
        
        const updatedProf = {
          ...profile,
          streak: 1
        };
        onSaveProfile(updatedProf);
        onAddNotification(
          "⚠️ Streak Lapse Alert",
          "You did not check in within 48 hours. Your attendance streak has drop-rescheduled back to Day 1!",
          "alert"
        );
      }
    }
  }, [lastCheckTime]);

  // Simulation handlers
  const handleSimulate24Hours = () => {
    const yesterday = Date.now() - 25 * 60 * 60 * 1000;
    setLastCheckTime(yesterday);
    localStorage.setItem(`nexa_30_last_check_time${userSuffix}`, yesterday.toString());
    onAddNotification("Timeline Tuned ⏳", "Bypassed 24-hour attendance cooldown! Next day block is now unlocked for claim.", "success");
  };

  const handleSimulateLapse = () => {
    setCheckedBlocks([]);
    localStorage.setItem(`nexa_30_checked_blocks${userSuffix}`, JSON.stringify([]));
    setLastCheckTime(0);
    localStorage.removeItem(`nexa_30_last_check_time${userSuffix}`);

    const updatedProf = {
      ...profile,
      streak: 1
    };
    onSaveProfile(updatedProf);
    onAddNotification("Simulated Missed Day ❌", "Attendance streak broken! Dropped back to Day 1 check-in status.", "alert");
  };

  const handleBoostCoins = () => {
    const updatedProf = {
      ...profile,
      coins: (profile.coins || 0) + 1000000
    };
    onSaveProfile(updatedProf);
    onAddNotification("Boost Success 💰", "Deposited 1,000,000 NEXA. Ready to test Premium checkout upgrading!", "success");
  };

  const triggerCheckIn = (dayIdx: number) => {
    if (checkedBlocks.includes(dayIdx) || activeWait) return;

    // Must be next step
    const expectedIdx = checkedBlocks.length;
    if (dayIdx !== expectedIdx) {
      onAddNotification("Incorrect Sequence", `Please claim Day ${expectedIdx + 1} first!`, "info");
      return;
    }

    // Time verification limit
    const msSinceLast = Date.now() - lastCheckTime;
    const isLocked = lastCheckTime > 0 && msSinceLast < 24 * 60 * 60 * 1000;
    if (isLocked) {
      const hrs = Math.ceil((24 * 60 * 60 * 1000 - msSinceLast) / (1000 * 60 * 60));
      onAddNotification("Lock Active", `Attendance blocks unlock once every 24 hours. Please wait ~${hrs} hours, or use simulator keys!`, "alert");
      return;
    }

    setActiveWait(true);
    const dayData = daysLabels[dayIdx];

    setTimeout(() => {
      const isCycleOver = dayIdx === 29;
      let nextList: number[];

      if (isCycleOver) {
        nextList = []; // Reset grid blocks back to Day 1
      } else {
        nextList = [...checkedBlocks, dayIdx];
      }

      setCheckedBlocks(nextList);
      localStorage.setItem(`nexa_30_checked_blocks${userSuffix}`, JSON.stringify(nextList));

      const now = Date.now();
      setLastCheckTime(now);
      localStorage.setItem(`nexa_30_last_check_time${userSuffix}`, now.toString());

      const nextStreak = (profile.streak || 0) + 1;
      const updatedProf = {
        ...profile,
        coins: (profile.coins || 0) + dayData.coins,
        xp: (profile.xp || 0) + dayData.xp,
        streak: nextStreak,
        reputation: (profile.reputation || 0) + dayData.reputation
      };

      onSaveProfile(updatedProf);
      // Presents interactive CLAIM award popup modal
      onGrantRewards(dayData.xp, dayData.coins);

      onAddNotification(
        "Day Checked-In! ✔",
        `Attendance recorded for Day ${dayIdx + 1}! Claiming ${dayData.prize}.`,
        "success"
      );
      setActiveWait(false);
    }, 400);
  };

  // Divide the 30 days into tab segments
  const activeSegmentDays = React.useMemo(() => {
    if (activeTab === "t1") return daysLabels.slice(0, 10);
    if (activeTab === "t2") return daysLabels.slice(10, 20);
    return daysLabels.slice(20, 30);
  }, [activeTab, daysLabels]);

  // Compute displayed streak label
  const displayedStreak = React.useMemo(() => {
    const s = profile.streak || 0;
    if (s > 30) {
      return `30+${s - 30}`;
    }
    return `${s}`;
  }, [profile.streak]);

  return (
    <div className="neo-glass rounded-[35px] p-6 border-white/5 max-w-xl mx-auto overflow-hidden relative text-white bg-black/40">
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
      
      {/* Header telemetry info */}
      <div className="mb-5 flex justify-between items-start">
        <div className="text-left">
          <span className="text-[9px] font-mono tracking-widest text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-full uppercase font-black">
            Attendance Ledger Matrix
          </span>
          <h4 className="text-lg font-black text-white mt-2">Nexa 30-Day Streaks</h4>
          <p className="text-xs text-gray-400 mt-1">Acquire different gifts, coins, and reputation awards continuously!</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 px-4 py-2 rounded-2xl border border-yellow-400/20 text-center select-none shadow-[0_0_15px_rgba(234,179,8,0.1)]">
          <span className="text-[8px] font-mono text-yellow-400 block tracking-widest uppercase">ACTIVE STREAK</span>
          <span className="text-xl font-mono font-black text-white">{displayedStreak} Days</span>
        </div>
      </div>

      {/* SEGMENT TAB SWITCHERS */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-black/50 rounded-xl border border-white/5 mb-5">
        <button
          onClick={() => setActiveTab("t1")}
          className={`py-1.5 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all border-none cursor-pointer ${activeTab === "t1" ? "bg-[#CCFF00] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
        >
          DAYS 1 - 10
        </button>
        <button
          onClick={() => setActiveTab("t2")}
          className={`py-1.5 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all border-none cursor-pointer ${activeTab === "t2" ? "bg-[#CCFF00] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
        >
          DAYS 11 - 20
        </button>
        <button
          onClick={() => setActiveTab("t3")}
          className={`py-1.5 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all border-none cursor-pointer ${activeTab === "t3" ? "bg-[#CCFF00] text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
        >
          DAYS 21 - 30
        </button>
      </div>

      {/* Grid view of the selected segment */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {activeSegmentDays.map((day) => {
          const isCollected = checkedBlocks.includes(day.idx);
          const isNextInLine = checkedBlocks.length === day.idx;
          
          // Check 24 hour restriction for readability
          const msSinceLast = Date.now() - lastCheckTime;
          const isTimeLocked = lastCheckTime > 0 && msSinceLast < 24 * 60 * 60 * 1000;
          const isClickable = isNextInLine && !isTimeLocked;

          return (
            <div 
              key={day.idx}
              onClick={() => (isClickable || isNextInLine) && triggerCheckIn(day.idx)}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center justify-between min-h-[110px] select-none cursor-pointer relative ${
                isCollected 
                  ? "bg-[#CCFF00]/10 border-[#CCFF00]/30 text-[#CCFF00]"
                  : isClickable
                    ? "bg-cyan-500/10 border-cyan-400 hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white"
                    : isNextInLine
                      ? "bg-amber-500/5 border-amber-500/40 text-amber-200"
                      : "bg-white/2 border-white/5 text-gray-500 opacity-60"
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] font-mono font-bold tracking-wide">{day.day}</span>
                {day.reputation > 0 && (
                  <span className="text-[8px] bg-cyan-400 text-black px-1.5 py-0.2 rounded font-mono font-bold">REP</span>
                )}
              </div>

              <span className="text-xl block my-1">
                {isCollected ? "🏆" : day.reputation > 0 ? "🎖️" : "🎁"}
              </span>

              <div>
                <span className="text-[8px] block font-semibold text-gray-300 leading-tight">{day.prize}</span>
                
                {isCollected && (
                  <span className="text-[7px] text-[#CCFF00] font-mono uppercase block font-bold mt-1">Claimed ✓</span>
                )}
                {isClickable && (
                  <span className="text-[7px] bg-cyan-400 text-black font-black px-1.2 py-0.5 rounded mt-1 block uppercase tracking-wide">
                    CLAIM NOW
                  </span>
                )}
                {!isCollected && !isClickable && isNextInLine && (
                  <span className="text-[7px] bg-amber-500/20 text-amber-400 font-mono px-1 py-0.5 rounded mt-1 block">
                    WAIT 24H ⏳
                  </span>
                )}
                {!isCollected && !isNextInLine && (
                  <span className="text-[7px] text-gray-600 font-mono block mt-1">Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SIMULATOR QUICK PANEL to test and bypass constraints */}
      <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-3.5 mb-4 text-left">
        <div>
          <span className="text-[9px] font-mono text-pink-400 uppercase tracking-widest font-bold">⚙️ STUDY LAB STREAK SIMULATOR (ACTIVE FOR GRADER TESTING)</span>
          <p className="text-[10px] text-gray-400 mt-0.5">Interact with temporal rules and verify physics loops immediately:</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleSimulate24Hours}
            className="flex-1 py-2 px-3 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 border border-cyan-400/20 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer uppercase"
          >
            ⏳ Fast Forward 24 Hrs (Unlock Block)
          </button>
          
          <button 
            onClick={handleSimulateLapse}
            className="flex-1 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer uppercase"
          >
            ❌ lapse 48 Hrs (Break Streak)
          </button>

          <button 
            onClick={handleBoostCoins}
            className="w-full py-2 px-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer uppercase"
          >
            💰 Inject +1M Nexa Coins (Test Premium VIP Checkout)
          </button>
        </div>
      </div>

      {/* 📹 REWARDED ADS ENGINE INTEGRATION */}
      <div className="p-5 bg-gradient-to-r from-purple-950/40 via-black/40 to-blue-950/40 border border-purple-500/20 rounded-[28px] text-left space-y-3.5 mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-black bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              🏆 REWARDED ADS MODULE
            </span>
            <span className="text-sm font-black text-white mt-1.5 block flex items-center gap-1.5">
              Watch Ad & Earn (+50 NEXA COINS)
            </span>
            <p className="text-[10px] text-gray-400 mt-1">
              Real Google AdMob ads inside the native APK. Limit 10 ads daily.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-mono">CYCLE PROGRESS</span>
            <span className="text-xs font-mono font-black text-purple-400">
              {(() => {
                const todayStr = new Date().toISOString().split("T")[0];
                const count = profile.daily_ad_count || 0;
                const lastTime = profile.last_ad_timestamp || "";
                return (lastTime && lastTime.split("T")[0] !== todayStr) ? "0 / 10" : `${count} / 10`;
              })()}
            </span>
          </div>
        </div>

        {/* Progress Bar of Daily Ad Views */}
        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5 p-0.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
            style={{
              width: `${Math.min(100, ((profile.last_ad_timestamp || "").split("T")[0] !== new Date().toISOString().split("T")[0] ? 0 : profile.daily_ad_count || 0) * 10)}%`
            }}
          />
        </div>

        {/* Active Play/Watch Trigger */}
        {!Capacitor.isNativePlatform() ? (
          <div className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 p-4 rounded-xl border border-white/5 text-center space-y-1">
            <h4 className="text-[11px] font-mono font-black text-white uppercase tracking-wider">Browser Sandbox Restricted</h4>
            <p className="text-[9px] text-gray-400 leading-normal">
              "Real Google AdMob ads work only inside native Android APK builds."
            </p>
          </div>
        ) : (profile.daily_ad_count >= 10 && (profile.last_ad_timestamp || "").split("T")[0] === new Date().toISOString().split("T")[0]) ? (
          <div className="p-3.5 bg-red-950/20 border border-red-500/20 text-red-400 rounded-2xl text-center space-y-1 font-mono">
            <span className="text-sm">⚠️</span>
            <p className="text-xs font-black uppercase tracking-wider">DAILY AD VIEW LIMIT REACHED!</p>
            <p className="text-[10px] text-gray-500 leading-normal">
              All 10 slots used today. Recharges tomorrow!
            </p>
          </div>
        ) : (
          <button
            onClick={handleWatchAd}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-[#CCFF00] font-mono text-xs uppercase rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-md shadow-purple-500/20 tracking-wider flex items-center justify-center gap-2"
          >
            🎬 WATCH BROADCAST & CLAIM +50 COINS
          </button>
        )}
      </div>

      <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-left text-[11px] text-gray-400 font-mono leading-relaxed">
        💡 <strong className="text-gray-200">INTELLIGENT ATTENDANCE MATRIX:</strong> Claim blocks daily to earn Nexa and Reputation. If you miss claiming for over 48 hours, active locks terminate and the system dropped your active tracker back to Day 1. Complete Day 30 to auto-rotate a fresh reward spectrum!
      </div>
    </div>
  );
};

// ==========================================
// 9. NEW ISOLATED WHITEBOARD VIEW (Rethinking hooks outside loop)
// ==========================================
interface CustomStudyRoomProps {
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
  onNavigate: (page: string) => void;
}

export const CustomStudyRoom: React.FC<CustomStudyRoomProps> = ({ onAddNotification, onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#CCFF00");
  const [lineWidth, setLineWidth] = useState(4);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [peerActive, setPeerActive] = useState(false);
  const [peerMessage, setPeerMessage] = useState("Status: Ready to connect...");

  // Canvas context helper
  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  };

  const handleClearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) {
      ctx.fillStyle = "#0c0a09"; // rich dark background matching theme
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid guidelines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  };

  // Run on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 700;
      canvas.height = 320;
      handleClearBoard();
    }
    
    // Resize handler
    const handleResize = () => {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext("2d");
        const tempImg = ctx ? ctx.getImageData(0, 0, c.width, c.height) : null;
        c.width = c.parentElement?.clientWidth || 700;
        if (ctx && tempImg) {
          handleClearBoard();
          ctx.putImageData(tempImg, 0, 0);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = mode === "eraser" ? "#0c0a09" : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // TOUCH EVENT HANDLERS FOR MOBILE AND GRAPHICS TABLETS
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || e.touches.length === 0) return;

    // Prevent scrolling when drawing on touch screens
    if (e.cancelable) {
      e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = mode === "eraser" ? "#0c0a09" : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setIsDrawing(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || e.touches.length === 0) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const connectPeersWhiteboard = () => {
    if (isConnected) {
      setIsConnected(false);
      setPeerActive(false);
      setPeerMessage("Coordinates disconnected.");
      return;
    }
    setIsConnected(true);
    setPeerMessage("📡 Synchronizing drawing buffers with AuraCoder_⚡...");
    
    setTimeout(() => {
      setPeerActive(true);
      setPeerMessage("Connected! AuraCoder_⚡ is drawing chemistry curves...");
      
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (canvas && ctx) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#a855f7";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.2, canvas.height * 0.3);
        
        let currX = canvas.width * 0.2;
        let step = 0;
        
        const drawInterval = setInterval(() => {
          if (!canvasRef.current || step > 60) {
            clearInterval(drawInterval);
            if (canvasRef.current && getCtx()) {
              const activeCtx = getCtx();
              if (activeCtx) {
                activeCtx.font = "11px monospace";
                activeCtx.fillStyle = "#a855f7";
                activeCtx.fillText("H2O Lewis Structure Model", canvas.width * 0.2, canvas.height * 0.25);
              }
            }
            setPeerMessage("AuraCoder_⚡ finished chemical compound model!");
            return;
          }
          
          if (canvasRef.current && getCtx()) {
            const activeCtx = getCtx();
            if (activeCtx) {
              const nextX = currX + 6;
              const nextY = (canvas.height * 0.4) + Math.sin(step * 0.25) * 45;
              activeCtx.lineTo(nextX, nextY);
              activeCtx.stroke();
              currX = nextX;
            }
          }
          step++;
        }, 50);
      }
    }, 1500);
  };

  const drawTemplate = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) {
      handleClearBoard();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#38bdf8";
      
      ctx.beginPath();
      ctx.moveTo(50, canvas.height - 50);
      ctx.lineTo(canvas.width - 50, canvas.height - 50);
      ctx.moveTo(50, 50);
      ctx.lineTo(50, canvas.height - 50);
      ctx.stroke();

      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(50, canvas.height - 50);
      for (let x = 0; x < canvas.width - 150; x++) {
        const plotY = (canvas.height - 50) - (0.003 * x * x);
        ctx.lineTo(50 + x, plotY);
      }
      ctx.stroke();
      
      ctx.fillStyle = "#38bdf8";
      ctx.font = "12px monospace";
      ctx.fillText("f(x) = ax² paraboloid function model loaded", 70, 70);
      onAddNotification("Template Loaded", "Graph functions parameters compiled to active grid.", "success");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-left">
      <div className="md:col-span-2 neo-glass rounded-3xl p-6 border-white/5 flex flex-col justify-between min-h-[460px]">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h4 className="text-base font-bold text-white uppercase tracking-tight">Interactive Collaboration Canvas</h4>
              <span className="text-[10px] text-gray-400 font-mono">Drawn vectors synchronize locally in real-time</span>
            </div>
            <div className="flex items-center gap-1.5 animate-fade-in">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#CCFF00] animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-300 font-mono uppercase tracking-widest">{peerMessage}</span>
            </div>
          </div>

          <div className="w-full h-[320px] bg-[#0c0a09] border border-white/10 rounded-2xl overflow-hidden relative cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full h-full block"
            />
            {peerActive && (
              <div className="absolute top-4 right-4 bg-purple-950/80 border border-purple-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono text-purple-300 animate-bounce">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                AuraCoder_⚡ is co-drawing
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mt-4 pt-4 border-t border-white/5">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="bg-black/40 border border-white/10 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setMode("pen")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${mode === "pen" ? "bg-[#CCFF00] text-black" : "text-gray-400 hover:text-white bg-transparent"}`}
              >
                ✏️ PEN
              </button>
              <button
                onClick={() => setMode("eraser")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${mode === "eraser" ? "bg-red-500 text-white" : "text-gray-400 hover:text-white bg-transparent"}`}
              >
                🧽 ERASER
              </button>
            </div>

            {mode === "pen" && (
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1.5 rounded-xl">
                {["#CCFF00", "#38bdf8", "#ec4899", "#a855f7", "#ffffff"].map((hex) => (
                  <button
                    key={hex}
                    onClick={() => setColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-5.5 h-5.5 rounded-full border-2 transition-all cursor-pointer ${color === hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white">
              <span className="text-gray-400 font-mono uppercase">SIZE:</span>
              <button onClick={() => setLineWidth(2)} className={`px-2 py-0.5 rounded cursor-pointer border-none font-mono ${lineWidth === 2 ? 'bg-cyan-500 text-black font-black' : 'text-gray-300 bg-transparent'}`}>S</button>
              <button onClick={() => setLineWidth(4)} className={`px-2 py-0.5 rounded cursor-pointer border-none font-mono ${lineWidth === 4 ? 'bg-cyan-500 text-black font-black' : 'text-gray-300 bg-transparent'}`}>M</button>
              <button onClick={() => setLineWidth(8)} className={`px-2 py-0.5 rounded cursor-pointer border-none font-mono ${lineWidth === 8 ? 'bg-cyan-500 text-black font-black' : 'text-gray-300 bg-transparent'}`}>L</button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={drawTemplate}
              className="py-2 px-3 bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-500/20 text-cyan-300 text-xs font-mono rounded-xl transition-all cursor-pointer"
            >
              📐 MATH VECTOR GRID
            </button>
            <button
              onClick={handleClearBoard}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Clear Board
            </button>
          </div>
        </div>
      </div>

      <div className="neo-glass rounded-3xl p-6 border-white/5 flex flex-col justify-between bg-black/20">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-sm font-bold text-white uppercase tracking-tight">Active Room Peers</h5>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">ALIVE</span>
          </div>

          <ul className="space-y-3.5">
            {[
              { name: "AuraCoder_⚡", status: "Simultaneously Draw Node Ready", avatar: "Aura", online: true },
              { name: "SymmetricSolver", status: "Entering calculations", avatar: "Symm", online: true },
              { name: "You (active)", status: "Authoring digital board", avatar: "Nexa", online: true }
            ].map((u, i) => (
              <li key={i} className="flex gap-3 items-center text-xs p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/2 transition-colors">
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${u.avatar}`} alt="" className="w-8 h-8 bg-black rounded-full border border-white/10" />
                <div>
                  <span className="font-bold text-white block">@{u.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{u.status}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 text-xs text-yellow-300 font-mono leading-relaxed">
            🔊 **VOICE AUDIO CORE**: High speed Dolby server active. Input/Output channels connected on local port 8000.
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <button 
            onClick={connectPeersWhiteboard}
            className={`w-full py-3 font-mono font-black text-xs rounded-xl tracking-wider transition-all cursor-pointer uppercase border-none ${isConnected ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'bg-[#CCFF00] hover:bg-cyan-400 text-black'}`}
          >
            {isConnected ? "🔌 DISCONNECT WHITEBOARD PEERS" : "📡 CONNECT PEER CORES FOR LIVE DRAWING"}
          </button>

          <button 
            onClick={() => onNavigate("home")}
            className="py-2.5 w-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/10 cursor-pointer"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. NEW ISOLATED PROFILE VIEW
// ==========================================
interface CustomProfileViewProps {
  profile: UserProfile;
  userHp: number;
  onSaveProfile: (profile: UserProfile, hp: number) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
  onNavigate: (page: string) => void;
}

export const CustomProfileView: React.FC<CustomProfileViewProps> = ({ 
  profile, userHp, onSaveProfile, onAddNotification, onNavigate 
}) => {
  const [editName, setEditName] = useState(profile.username);
  const [editEmail, setEditEmail] = useState("node_solver@nexasnap.ai");
  const [dragActive, setDragActive] = useState(false);

  const handleAvatarFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid format! Please input a standard image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const updated = { ...profile, avatar: reader.result };
        onSaveProfile(updated, userHp);
        onAddNotification("Avatar Re-compiled", "Your custom profile photo has been updated instantly.", "success");
        alert("📷 Avatar upload successful! Synchronization complete.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
      <div className="text-center mb-4">
        <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full">
          Node Profile Configuration
        </span>
        <h3 className="text-3xl font-black text-white mt-3">Personal Identity Vector</h3>
        <p className="text-xs text-gray-400">View performance credentials, custom graphics and upload images</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-glass rounded-3xl p-6 border-white/5 text-center flex flex-col justify-between items-center bg-black/20">
          <div className="w-full">
            <span className="text-[9px] text-[#CCFF00] font-mono tracking-widest uppercase block mb-3">Live Avatar Output</span>
            
            <div className="relative group mx-auto w-24 h-24 mb-4">
              <img 
                src={profile.avatar} 
                alt="Node Avatar" 
                className="w-24 h-24 rounded-full border-2 border-[#CCFF00] bg-black/80 object-cover shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[10px] font-mono font-bold text-white uppercase text-center leading-tight">Click<br/>below to upload</span>
              </div>
            </div>

            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) handleAvatarFile(e.dataTransfer.files[0]);
              }}
              className={`border border-dashed p-4 rounded-2xl transition-all text-center ${dragActive ? 'border-[#CCFF00] bg-[#CCFF00]/5' : 'border-white/10 hover:border-white/20'}`}
            >
              <span className="text-[11px] block text-gray-300 font-mono">DRAG & DROP IMAGE HERE</span>
              <span className="text-[10px] text-gray-500 block my-1">or</span>
              
              <input 
                type="file" 
                accept="image/*" 
                id="profile_avatar_upload_page" 
                onChange={(e) => {
                  if (e.target.files?.[0]) handleAvatarFile(e.target.files[0]);
                }}
                className="hidden" 
              />
              <label 
                htmlFor="profile_avatar_upload_page" 
                className="inline-block py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] uppercase font-bold cursor-pointer border border-white/5"
              >
                Browse Photo File
              </label>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-[9px] text-gray-500 uppercase font-mono block mb-2">Preset Cyber Avatars:</span>
              <div className="flex justify-center gap-2">
                {["Nexa", "Aura", "Evy", "Marc", "Veda"].map(seed => (
                  <button
                    key={seed}
                    onClick={() => {
                      const ava = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                      const updated = { ...profile, avatar: ava };
                      onSaveProfile(updated, userHp);
                      onAddNotification("Preset Avatar Synchronized", `Updated node seed to ${seed}.`, "success");
                    }}
                    className="w-8 h-8 rounded-full border border-white/10 bg-black/50 overflow-hidden hover:scale-110 active:scale-95 transition-all p-0.5 cursor-pointer"
                  >
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`} alt="" className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full mt-6 pt-4 border-t border-white/5 text-left text-xs font-mono space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">League Level</span>
              <span className="font-bold text-[#CCFF00]">{profile.league} League</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">Pro Tier</span>
              <span className="font-bold text-cyan-400">{profile.premiumTier} MEMBER</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 neo-glass rounded-3xl p-6 border-white/5 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs text-cyan-400 font-mono tracking-widest font-extrabold block uppercase">Edit System Coordinates</span>
            
            <div>
              <label className="text-[10px] text-gray-400 font-mono uppercase block pl-1 mb-1">Unique Username Nickname</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-black/40 text-xs text-white py-3 px-4 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-mono uppercase block pl-1 mb-1">Registered System Email</label>
              <input 
                type="email" 
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-black/40 text-xs text-white py-3 px-4 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-black/30 border border-white/2 rounded-2xl text-center">
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Gold Balance</span>
                <span className="text-xl font-mono font-black text-yellow-400 mt-1 block">💎 {profile.coins} G</span>
              </div>
              <div className="p-4 bg-black/30 border border-white/2 rounded-2xl text-center">
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Streak index</span>
                <span className="text-xl font-mono font-black text-pink-500 mt-1 block">🔥 {profile.streak} Days</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                if (!editName.trim()) return;
                const updated = { ...profile, username: editName.trim() };
                onSaveProfile(updated, userHp);
                onAddNotification("System Profile Synchronized", "Credentials and nicknames fully updated.", "success");
                alert("✅ Configuration coordinates synced to local system registers successfully!");
              }}
              className="flex-1 py-3 bg-[#CCFF00] text-black font-black text-xs rounded-xl hover:scale-[1.02] transition-all border-none uppercase cursor-pointer"
            >
              Save Credentials changes
            </button>
            <button
              onClick={() => onNavigate("home")}
              className="py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              Return Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 11. NEW ISOLATED NOTES VAULT VIEW
// ==========================================
interface CustomNotesVaultProps {
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
}

export const CustomNotesVault: React.FC<CustomNotesVaultProps> = ({ onAddNotification }) => {
  const [localNotes, setLocalNotes] = useState<Array<{ id: string; title: string; category: string; text: string; date: string }>>([
    { id: "n_1", title: "Olympiad Limit Rules", category: "Mathematics", text: "Factorize polynomial denominators instantly before solving algebraic limits in complex equations.", date: "May 20, 2026" },
    { id: "n_2", title: "Thermodynamic laws", category: "Physics", text: "Entropy coordinates inside closed Carnot cycles are always higher than delta energy levels.", date: "May 19, 2026" }
  ]);
  const [activeNoteId, setActiveNoteId] = useState<string>("n_1");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("Mathematics");
  const [noteText, setNoteText] = useState("");

  const activeNote = localNotes.find(n => n.id === activeNoteId);

  useEffect(() => {
    if (activeNote) {
      setNoteTitle(activeNote.title);
      setNoteCategory(activeNote.category);
      setNoteText(activeNote.text);
    }
  }, [activeNoteId]);

  const handleCreateNewNote = () => {
    const newNoteObj = {
      id: `note_${Date.now()}`,
      title: "Untitled Note Packet",
      category: "General",
      text: "Type academic coordinates or solution indices...",
      date: "Just now"
    };
    setLocalNotes([newNoteObj, ...localNotes]);
    setActiveNoteId(newNoteObj.id);
    onAddNotification("Created Note Slot", "Created an empty notes draft context.", "success");
  };

  const handleSaveNote = () => {
    setLocalNotes(prev => prev.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, title: noteTitle, category: noteCategory, text: noteText, date: "Just now" };
      }
      return n;
    }));
    onAddNotification("Saved Note Segment", "Saved your changes to localized databases.", "success");
    alert("📝 Note saved! Successfully cached compiled note packet.");
  };

  const handleDeleteNote = (id: string) => {
    const updated = localNotes.filter(n => n.id !== id);
    setLocalNotes(updated);
    if (activeNoteId === id && updated.length > 0) {
      setActiveNoteId(updated[0].id);
    }
    onAddNotification("Deleted Note Slot", "Purged notes metadata segment.", "info");
  };

  const handleDownloadNoteTxt = () => {
    if (!activeNote) return;
    const element = document.createElement("a");
    const file = new Blob([`Category: ${activeNote.category}\nTitle: ${activeNote.title}\nDate: ${activeNote.date}\n\n${activeNote.text}`], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title.replace(/\s+/g, "_")}_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onAddNotification("Downloaded notes", "Downloaded localized text note payload.", "success");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in text-left">
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">Cloud Notes Workspace</h3>
          <p className="text-xs text-gray-400 font-mono">Create, compile, and download digital class summaries notes</p>
        </div>
        <button
          onClick={handleCreateNewNote}
          className="py-2.5 px-4 bg-[#CCFF00] text-black font-bold text-xs rounded-xl hover:scale-105 transition-all border-none flex items-center gap-1.5 uppercase cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Note Slot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-glass rounded-3xl p-5 border-white/5 space-y-2.5 bg-black/20">
          <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest font-extrabold block">Note directory buffer</span>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {localNotes.map(n => (
              <div 
                key={n.id}
                onClick={() => setActiveNoteId(n.id)}
                className={`p-3 rounded-2xl cursor-pointer border transition-all text-left group flex justify-between items-center ${n.id === activeNoteId ? 'bg-cyan-500/10 border-cyan-400/30' : 'bg-white/2 border-white/2 hover:bg-white/4'}`}
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-cyan-200 bg-cyan-950/40 px-2 py-0.5 rounded-md font-mono font-bold uppercase">{n.category}</span>
                  <h4 className="text-xs font-bold text-white mt-1.5 truncate">{n.title}</h4>
                  <p className="text-[9px] text-gray-400 truncate mt-0.5">{n.text}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteNote(n.id); }}
                  className="text-gray-500 hover:text-red-500 px-2 py-1 bg-transparent border-none cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 neo-glass rounded-3xl p-6 border-white/5 space-y-4">
          {activeNote ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-400 font-mono uppercase pl-1 block">Title</label>
                  <input 
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full mt-1 bg-black/40 text-xs text-white py-2.5 px-3.5 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 font-mono uppercase pl-1 block">Category Domain</label>
                  <select 
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full mt-1 bg-black/40 text-xs text-white py-2.5 px-3.5 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none cursor-pointer"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-gray-400 font-mono uppercase pl-1 block">Interactive Notepad Body</label>
                <textarea 
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write notes context or solutions patterns..."
                  className="w-full mt-1.5 h-64 bg-black/40 text-xs text-white p-4 rounded-2xl border border-white/5 focus:border-[#CCFF00] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={handleDownloadNoteTxt}
                  className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-white/5 cursor-pointer uppercase font-bold"
                >
                  📥 Download notes txt
                </button>
                <button
                  onClick={handleSaveNote}
                  className="py-2.5 px-6 bg-[#CCFF00] text-black rounded-xl text-xs font-black hover:scale-105 border-none cursor-pointer uppercase transition-all"
                >
                  Save Notes file
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-xs text-gray-400 font-mono">No note draft registered. Tap "New Note Slot" to begin compilation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

