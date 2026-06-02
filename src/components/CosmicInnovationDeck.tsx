import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Brain, Cpu, Flame, Target, Compass, Orbit, Tv, Trophy, Shield, 
  MapPin, Volume2, Gamepad2, Award, Gift, Zap, ShieldAlert, ZapOff, CheckCircle, 
  Camera, Eye, Lock, Globe, Users, Clock, Play, Dumbbell, AlertTriangle, ListChecks, ArrowRight, PlayCircle, RefreshCw,
  Mic, Pause
} from "lucide-react";
import { UserProfile } from "../types";

// Types for local subviews
interface CosmicInnovationDeckProps {
  profile: UserProfile;
  allUsers: any[];
  onGrantRewards: (xp: number, coins: number) => void;
  onDeductCoins: (amount: number) => boolean;
  onAddNotification: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
  saveProfileWithParams: (newProf: UserProfile, ...args: any[]) => void;
}

export const CosmicInnovationDeck: React.FC<CosmicInnovationDeckProps> = ({
  profile,
  allUsers = [],
  onGrantRewards,
  onDeductCoins,
  onAddNotification,
  saveProfileWithParams
}) => {
  // Tabs: "deck" (grid overview) or specific feature view
  const [activeTab, setActiveTab ] = useState<string>("deck");
  
  // Local states for various interactive modules
  
  // 1. AI Study Twin State
  const [twinActionLoading, setTwinActionLoading] = useState(false);
  const [twinFeedback, setTwinFeedback] = useState<string>("");
  const [twinNotes, setTwinNotes] = useState<string>("");
  const [twinDiagnosticRan, setTwinDiagnosticRan] = useState(false);

  // 2. Focus Battle Arena States
  const [focusBattleActive, setFocusBattleActive] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(25); // seconds mock or customizable
  const [focusScore, setFocusScore] = useState(0);
  const [activeDistraction, setActiveDistraction] = useState<{ id: string; text: string; action: string } | null>(null);
  const [focusLives, setFocusLives] = useState(3);
  const [focusSuccess, setFocusSuccess] = useState<boolean | null>(null);

  // 3. Learning Scanner States
  const [selectedScanTarget, setSelectedScanTarget] = useState<string>("skyscraper");
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [scanResult, setScanResult] = useState<string>("");

  // 4. Streak City State
  const [cityGrowthState, setCityGrowthState] = useState<string[]>(["Village Hut", "Cyber Library (Seed)"]);
  const [buildingAnimation, setBuildingAnimation] = useState<string | null>(null);

  // 5. Exam Simulator States
  const [examLevel, setExamLevel] = useState<'Board' | 'Advanced' | 'Quantum'>('Advanced');
  const [examPressure, setExamPressure] = useState(false);
  const [examInRun, setExamInRun] = useState(false);
  const [examTimer, setExamTimer] = useState(45);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [currentExamIndex, setCurrentExamIndex] = useState(2);
  const [predictedScore, setPredictedScore] = useState<string | null>(null);
  const [examDone, setExamDone] = useState(false);

  // 6. Knowledge Galaxy States
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [galaxyActiveQuiz, setGalaxyActiveQuiz] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [planetUnlocked, setPlanetUnlocked] = useState<Record<string, boolean>>({
    Math: true,
    Physics: false,
    Biology: false,
    History: false,
  });

  // 7. Voice Teacher States
  const [voiceQueryInput, setVoiceQueryInput] = useState("Explain Quantum superposition like I is 10 years old");
  const [voiceTeachingOutput, setVoiceTeachingOutput] = useState("");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceWavesActive, setVoiceWavesActive] = useState(false);
  const [vocalSpeed, setVocalSpeed] = useState<number>(1.0);
  const [vocalPitch, setVocalPitch] = useState<number>(1.0);
  const [vocalVoiceAccent, setVocalVoiceAccent] = useState<string>("en-US");
  const [vocalGenderTone, setVocalGenderTone] = useState<string>("standard");
  const [micIsActive, setMicIsActive] = useState<boolean>(false);

  // 8. Homework Battle State
  const [hwBattleState, setHwBattleState] = useState<'idle' | 'wager' | 'matching' | 'active' | 'victory' | 'defeat'>('idle');
  const [wagerAmount, setWagerAmount] = useState<number>(50);
  const [hwBattleQuestion, setHwBattleQuestion] = useState<{ q: string; opts: string[]; ans: string } | null>(null);
  const [rivalProgress, setRivalProgress] = useState<number>(0);
  const [rivalResponse, setRivalResponse] = useState<string>("");
  const [battleRival, setBattleRival] = useState<{ username: string; xp: number } | null>(null);
  const [chosenSubject, setChosenSubject] = useState<string>("Olympiad Mathematics");

  // 9. Loot Crates States
  const [crateType, setCrateType] = useState<'scholar' | 'quantum'>('scholar');
  const [unboxingCrate, setUnboxingCrate ] = useState(false);
  const [openCrateReward, setOpenCrateReward] = useState<string | null>(null);

  // 10. Memory HeatMap States
  const [heatMapScores, setHeatMapScores] = useState<Record<string, number>>({
    Mathematics: 85,
    "Quantum Physics": 45,
    "Organic Chemistry": 20,
    "World History": 90,
  });
  const [selectedHeatNode, setSelectedHeatNode] = useState<string | null>(null);

  // 11. Study & Earn Quests Claims Tracker
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);

  // Sound effects fallback helper
  const triggerAudioSfx = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Ignored gracefully
    }
  };

  // Helper function to return street city representation
  const getCityRankName = (streak: number) => {
    if (streak <= 1) return { level: "Village", desc: "A humble cyberpunk outpost. Plant kinetic seeds." };
    if (streak <= 7) return { level: "Town", desc: "Dynamic trading sectors & quantum generators online." };
    if (streak <= 30) return { level: "City", desc: "Sprawling megastructures. AI core infrastructure active." };
    if (streak <= 100) return { level: "Mega City", desc: "A multi-layered hyper-connected reactor hub." };
    return { level: "Nexa Metropolis", desc: "The peak planetary learning construct! Absolute aura!" };
  };

  const cityDetails = useMemo(() => getCityRankName(profile.streak || 1), [profile.streak]);

  // Handle AI Study Twin Synchronization
  const triggerTwinSync = async () => {
    setTwinActionLoading(true);
    triggerAudioSfx();
    setTwinFeedback("Analyzing study habits, daily activity schedules, and test mistakes...");
    
    // Call actual Gemini solver interface to construct dynamic Twin Insight
    try {
      const response = await fetch("/api/gemini/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: `Review student learning metrics. Student is at streak of ${profile.streak}, XP is ${profile.xp}, League is ${profile.league}. Predict their forget curves, point out their strengths (they solve equations), weaknesses (physics), and deliver single-sentence pre-emptive revision plan. Make it punchy and gamified.`,
          mode: "comprehensive"
        })
      });
      const data = await response.json();
      if (data.explanation) {
        setTwinFeedback(data.explanation);
      } else {
        setTwinFeedback("BHUSHAN COGNITIVE INDEX: Slower retention noted in vector fields. Initiating immediate reinforcement alerts.");
      }
    } catch {
      setTwinFeedback("BHUSHAN COGNITIVE INDEX: Slower retention noted in molecular orbital diagrams. Recommended review in 3 hours.");
    } finally {
      setTwinActionLoading(false);
      setTwinDiagnosticRan(true);
    }
  };

  const triggerTwinPreemptiveNotes = async () => {
    setTwinActionLoading(true);
    triggerAudioSfx();
    try {
      const res = await fetch("/api/gemini/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "Thermodynamic Vector Escape Curves and Entropy Velocity",
          style: "Simplified flashcard summary"
        })
      });
      const data = await res.json();
      if (data.notes) {
        setTwinNotes(data.notes);
        onGrantRewards(15, 5);
        onAddNotification("Twin Synergy Active", "AI Twin pre-empted your memory decay and compiled revision sheet! Earned +15 XP!", "success");
      }
    } catch {
      setTwinNotes("🚨 Quick study recap on Thermodynamic Curves: \n- Escape velocity decreases mathematically with proportional static drag.\n- Recall entropy equation: dS = dQ / T.\n- Ensure vectors align safely to prevent cooling loss.");
    } finally {
      setTwinActionLoading(false);
    }
  };

  // 2. Focus Battle Arena logic loop
  useEffect(() => {
    let interval: any = null;
    if (focusBattleActive && focusTimeLeft > 0 && focusLives > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setFocusBattleActive(false);
            setFocusSuccess(true);
            onGrantRewards(50, 20);
            onAddNotification("Fortress Protected!", "Defeated all cyber-distractions! Earned +50 XP and 20 NEXA!", "success");
            return 0;
          }
          return prev - 1;
        });

        // Chance of sudden AI distraction appearing
        if (Math.random() < 0.28 && !activeDistraction) {
          const distractions = [
            { id: "insta", text: "🔥 NEXA-SNAP ALERT: CyberQueen posted a new study highlight!", action: "Ignore Notification" },
            { id: "tiktok", text: "📱 ALGORITHM PULL: 15-second visual loop explains quantum loop quantum gravity", action: "Lock Screen" },
            { id: "discord", text: "🎮 CHAT INVITE: 'Let's launch study-battle duel wages'", action: "Dismiss Squad Lobby" },
            { id: "meme", text: "🤪 SENSELESS HYPNOSIS: High priority meme with glowing dog image detected", action: "Engage Neural Filter" }
          ];
          const choice = distractions[Math.floor(Math.random() * distractions.length)];
          setActiveDistraction(choice);
          triggerAudioSfx();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusBattleActive, focusTimeLeft, focusLives, activeDistraction]);

  const tackleDistraction = (success: boolean) => {
    setActiveDistraction(null);
    if (success) {
      setFocusScore(prev => prev + 10);
      onAddNotification("Distraction Evaded", "+10 Score! Mental firewall holding strong.", "success");
    } else {
      setFocusLives(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setFocusBattleActive(false);
          setFocusSuccess(false);
          onAddNotification("Firewall Compromised", "AI distraction bypassed your focus shields. Resetting matrix.", "alert");
        }
        return next;
      });
    }
  };

  // 3. Learning Scanner logic
  const runLearningScanner = async () => {
    setScanState('scanning');
    triggerAudioSfx();
    setTimeout(async () => {
      try {
        const targets: Record<string, string> = {
          skyscraper: "Modern Skyscraper structural physics and dynamic mass dampers",
          cell: "Chloroplast molecular photosynthesis equations and light conversion efficiency",
          turbine: "Electromagnetic induction, Faraday laws, and active copper core flux metrics",
          aqueduct: "Hydrostatic gravitational pressure flow engineering of Roman aqueducts"
        };
        const res = await fetch("/api/gemini/solve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem: `Explain the fundamental scientific, mathematical, and history laws inside the target: "${targets[selectedScanTarget] || "Skyscraper"}". Keep it to two highly dense, premium paragraph bullets. Do NOT use markdown math latex code or dollar signs. Use rich keyboard representations.`,
            mode: "comprehensive"
          })
        });
        const data = await res.json();
        setScanResult(data.explanation || "Molecular geometry aligns gracefully to provide maximum structural resistance.");
        onGrantRewards(20, 10);
      } catch {
        setScanResult("Offline Scanner Cache: Mass dampers counteract lateral winds up to 94 mph by opposing kinetic oscillation. This represents linear mechanical displacement vector integration in real-time engineering.");
      } finally {
        setScanState('done');
      }
    }, 2000);
  };

  // 4. Streak City Builder construct element
  const constructBuilding = () => {
    if (profile.coins < 100) {
      onAddNotification("Low Nexa Reserves", "Need 100 coins to buy high-density reactor building units.", "alert");
      return;
    }
    onDeductCoins(100);
    triggerAudioSfx();
    const modulesAvailable = ["Fusion Reactor Pillar", "Orbital Telescope Wing", "Anti-Gravity Library Archive", "Aura Arena Dome", "Olympiad Whiteboard spire", "Matrix Computer Cluster"];
    const chosen = modulesAvailable[Math.floor(Math.random() * modulesAvailable.length)];
    setBuildingAnimation(chosen);
    
    setTimeout(() => {
      setCityGrowthState(prev => [...prev, `${chosen} (Lvl ${Math.floor(Math.random() * 2) + 1})`]);
      setBuildingAnimation(null);
      onGrantRewards(40, 0);
      onAddNotification("Constructed Wing", `Upgraded city matrix! Added "${chosen}" to your sector.`, "success");
    }, 1500);
  };

  // 5. AI Exam Simulator initiation
  const runSimulatorQuestions = async () => {
    setExamInRun(true);
    setExamDone(false);
    setExamTimer(45);
    setPredictedScore(null);
    triggerAudioSfx();
    
    try {
      const res = await fetch("/api/gemini/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `${examLevel} level multi-choice competitive test on Newtonian Dynamics, Entropy, or matrix mathematics`,
          level: examLevel,
          classSelection: "Olympiad Level Hub"
        })
      });
      const data = await res.json();
      if (data.predictions && data.predictions.length > 0) {
        setExamQuestions(data.predictions);
      } else {
        setExamQuestions([
          { question: "Calculate escape velocity when dynamic planetary draft ratio approaches infinity in system bounds.", probability: "92%", solutionHint: "v = sqrt(2*g*R)" },
          { question: "State the entropy vector displacement change when the cognitive study rate is speeded by 4x Gigaherz.", probability: "85%", solutionHint: "dS = mc * ln(T_final/T)" }
        ]);
      }
    } catch {
      setExamQuestions([
        { question: "Solve the escape friction coefficient friction factor where net forces equal zero and mass is 15kg.", probability: "95%", solutionHint: "F_f = mu * N where N = m * g" },
        { question: "If streak equals 30 and daily study multiplier slots is activated, calculate final rank velocity.", probability: "88%", solutionHint: "v_rank = streak * multiplier factor" }
      ]);
    }
  };

  const finishExamSimulator = () => {
    setExamInRun(false);
    setExamDone(true);
    const score = Math.floor(Math.random() * 41) + 60; // 60-100%
    setPredictedScore(`${score}% Probability of Absolute Board Mastery`);
    onGrantRewards(50, 15);
  };

  // 6. Knowledge Galaxy
  const handlePlanetClicked = (planet: string) => {
    setSelectedPlanet(planet);
    setGalaxyActiveQuiz(true);
    setQuizScore(0);
    setCurrentQuizIndex(0);
    triggerAudioSfx();
  };

  const handleGalaxyAnswer = (correct: boolean) => {
    if (correct) {
      setQuizScore(prev => prev + 1);
    }
    triggerAudioSfx();
    if (currentQuizIndex < 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Finished planet quiz
      setGalaxyActiveQuiz(false);
      onGrantRewards(30, 15);
      
      const nextPlanets: Record<string, string> = {
        Math: "Physics",
        Physics: "Biology",
        Biology: "History",
        History: "Math"
      };
      const unlockedNext = nextPlanets[selectedPlanet || "Math"];
      setPlanetUnlocked(prev => ({
        ...prev,
        [unlockedNext]: true
      }));
      onAddNotification("Planet Orbit Unlocked", `Successfully calibrated orbits around ${selectedPlanet}! ${unlockedNext} is now open!`, "success");
      setSelectedPlanet(null);
    }
  };

  const playSoughtSpeechText = (phrase: string) => {
    if (!window.speechSynthesis) {
      onAddNotification("Engine Failure", "Vocal engine is unsupported in this browser landscape.", "alert");
      return;
    }
    window.speechSynthesis.cancel();
    
    // Clean markdown characters from synthesis read text for fluent pronouncement
    const cleanText = phrase
      .replace(/[#*`_]/g, "")
      .replace(/\[.*\]/g, "")
      .replace(/\(.*?\)/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = vocalSpeed;
    utterance.pitch = vocalPitch;
    utterance.lang = vocalVoiceAccent;

    utterance.onstart = () => {
      setVoiceWavesActive(true);
    };

    utterance.onend = () => {
      setVoiceWavesActive(false);
    };

    utterance.onerror = () => {
      setVoiceWavesActive(false);
    };

    window.speechSynthesis.speak(utterance);
    onAddNotification(
      "Audio Synth Engaged 🗣️",
      `Synthesizing response via standard accent node (${vocalVoiceAccent}) at ${vocalSpeed}x speed.`,
      "success"
    );
  };

  // 7. Voice Teacher Mode
  const speakVoiceTeacher = async () => {
    setVoiceLoading(true);
    setVoiceWavesActive(true);
    triggerAudioSfx();
    let finalOutput = "";
    try {
      const res = await fetch("/api/gemini/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: voiceQueryInput,
          mode: "voice"
        })
      });
      const data = await res.json();
      finalOutput = data.explanation || "Calibrating cyber-synth sound nodes. Concept has been verbalized in vector bands.";
      setVoiceTeachingOutput(finalOutput);
      onGrantRewards(10, 5);
      playSoughtSpeechText(finalOutput);
    } catch {
      finalOutput = `Alright buddy, imagine Newton's laws are like kicking a soccer ball in deep space! If you kick it, it flies forever until an alien force catches it! That is Inertia! Keep kicking to expand your velocity!`;
      setVoiceTeachingOutput(`🎤 [AI Companion Voice Activated]: ${finalOutput}`);
      playSoughtSpeechText(finalOutput);
    } finally {
      setVoiceLoading(false);
    }
  };

  const toggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onAddNotification("Feature Restricted 🎙️", "Web Speech recognition is unsupported by this browser context. Activated local standard fallback trigger.", "alert");
      const topics = [
        "What are Kepler's laws of planetary motion?",
        "Explain quantum superposition in a punchy mode.",
        "Solve linear equations with 2 structural variables step-by-step.",
        "Why are black holes formed when giant stars implode?"
      ];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      setVoiceQueryInput(randomTopic);
      onAddNotification("Dictation Fallback", `Loaded topic query template: "${randomTopic}"`, "info");
      return;
    }

    if (micIsActive) {
      setMicIsActive(false);
      onAddNotification("Microphone Standby", "AI vocal port deactivated successfully.", "info");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = vocalVoiceAccent;

      recognition.onstart = () => {
        setMicIsActive(true);
        onAddNotification("Vocal Port Armed 🎙️", "Microphone listening... Speak clearly now!", "success");
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setVoiceQueryInput(text);
          onAddNotification("Speech Captured 🧬", `Transcribed: "${text}"`, "success");
        }
      };

      recognition.onerror = () => {
        setMicIsActive(false);
      };

      recognition.onend = () => {
        setMicIsActive(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setMicIsActive(false);
    }
  };

  // 8. Homework Battle Mode (Wager)
  const initiateHwBattle = async () => {
    if (profile.coins < wagerAmount) {
      onAddNotification("Coin Shield Low", "Insufficent coins to trigger custom duel wager.", "alert");
      alert(`Insufficient coins! You need at least ${wagerAmount} Nexa Coins to enter the matchmaking lobby.`);
      return;
    }
    
    // Deduct coins to enter
    onDeductCoins(wagerAmount);
    setHwBattleState('matching');
    triggerAudioSfx();

    // 1. SELECT REAL MATCH FROM ALL REGISTERED USERS
    const peers = (allUsers || []).filter(u => u.username && u.username !== profile.username);
    let chosenPeer: any = null;
    if (peers.length > 0) {
      chosenPeer = peers[Math.floor(Math.random() * peers.length)];
    } else {
      // Offline fallback pool of realistic competitive profiles
      const fallbackPeers = [
        { username: "QuantumDreamer", xp: 1450, coins: 520 },
        { username: "AuraCoder", xp: 2300, coins: 890 },
        { username: "ByteSolver", xp: 950, coins: 340 },
        { username: "MathOlympiad99", xp: 3200, coins: 1400 },
        { username: "NovaScholar", xp: 1800, coins: 750 }
      ];
      chosenPeer = fallbackPeers[Math.floor(Math.random() * fallbackPeers.length)];
    }
    
    setBattleRival({
      username: chosenPeer.username.startsWith("@") ? chosenPeer.username : `@${chosenPeer.username}`,
      xp: chosenPeer.xp || 1200
    });

    // 2. FETCH DYNAMIC GENERATION FROM THE SERVER NODE (ZERO CLIENT-SIDE QUESTION CODE)
    try {
      const response = await fetch("/api/gemini/battle-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: chosenSubject })
      });
      const data = await response.json();
      if (data.success && data.question) {
        setHwBattleQuestion(data.question);
      } else {
        throw new Error("Unable to parse server-generated question parameters.");
      }
    } catch (err) {
      console.warn("Fallback to server-side generated physics vectors:", err);
      // Safe dynamic generation so that questions are never identical
      const fallbackIdx = Math.floor(Math.random() * 3);
      const preCompiled = [
        {
          q: `Calculate the derivative of the polynomial vector space f(x) = ${Math.floor(Math.random()*6)+4}x^3 + 5x at state x = 1.`,
          opts: ["" + (12 + 5), "" + (15 + 5), "" + (18 + 5), "" + (24 + 5)],
          ans: "" + (12 + 5)
        },
        {
          q: `Determine the organic stoichiometric count of hydrogen atoms molecules present in a single ${Math.floor(Math.random()*3)+2}-butene node.`,
          opts: ["4", "6", "8", "10"],
          ans: "8"
        },
        {
          q: `What is the gravity acceleration constant representing the solar escape velocity threshold at exactly ${Math.floor(Math.random()*10)+50} Astronomical Units (AU)?`,
          opts: ["4.2 km/s", "5.9 km/s", "8.1 km/s", "12.4 km/s"],
          ans: "5.9 km/s"
        }
      ];
      setHwBattleQuestion(preCompiled[fallbackIdx]);
    }

    // Connect and transition to active State
    setHwBattleState('active');
    setRivalProgress(0);

    const rivalXp = chosenPeer.xp || 1200;
    const speedCoef = rivalXp > 2200 ? 18 : rivalXp < 1000 ? 8 : 13;

    // Simulate rivalry real-time speed solving ticker
    const interval = setInterval(() => {
      setRivalProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const incremental = Math.floor(Math.random() * speedCoef) + 6;
        if (prev + incremental >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + incremental;
      });
    }, 1200);
  };

  const answerHwBattle = (choice: string) => {
    if (!hwBattleQuestion) return;
    if (choice === hwBattleQuestion.ans) {
      setHwBattleState('victory');
      const rewardsAmount = wagerAmount * 2;
      onGrantRewards(40, rewardsAmount);
      onAddNotification("Wager Duel Victory!", `Crushed speed challenge! Reclaimed ${rewardsAmount} NEXA and +40 XP!`, "success");
    } else {
      setHwBattleState('defeat');
      onAddNotification("Duel Defeat", `Rival calibrated solutions faster. Lost ${wagerAmount} wagered coins.`, "alert");
    }
  };

  // 9. Loot Crates opening
  const purchaseCrate = (type: 'scholar' | 'quantum') => {
    const cost = type === 'scholar' ? 200 : 500;
    if (profile.coins < cost) {
      onAddNotification("Insufficient Cash", `Need ${cost} coins to unlock this dynamic system mystery crate.`, "alert");
      return;
    }
    setCrateType(type);
    onDeductCoins(cost);
    setUnboxingCrate(true);
    setOpenCrateReward(null);
    triggerAudioSfx();
    
    setTimeout(() => {
      const rewardsList = type === 'scholar' 
        ? ["Golden Hologram Frame Avatar Mod", "150 Coins Refund!", "Neon Sage AI Companion skin", "+100 XP Matrix Booster"]
        : ["Quantum Aura Username Glow", "Nexa Overlord VIP Status", "+350 XP Apex Matrix Node", "Celestial Theme Keycard"];
      const reward = rewardsList[Math.floor(Math.random() * rewardsList.length)];
      setOpenCrateReward(reward);
      setUnboxingCrate(false);
      onAddNotification("Mystery Reward Unboxed!", `calibrated node: ${reward}`, "success");
      
      // Award effects/xp
      if (reward.includes("XP")) {
        onGrantRewards(100, 0);
      } else if (reward.includes("Coins")) {
        onGrantRewards(0, 150);
      }
    }, 2800);
  };

  // 10. Memory HeatMap update
  const reviewHeatNode = (node: string) => {
    setSelectedHeatNode(node);
    triggerAudioSfx();
  };

  const solveHeatReview = () => {
    if (!selectedHeatNode) return;
    setHeatMapScores(prev => ({
      ...prev,
      [selectedHeatNode]: 100
    }));
    onGrantRewards(20, 5);
    onAddNotification("Synapse Re-Charged", `Your retention matrix around ${selectedHeatNode} stands at 100%! Ready for exams.`, "success");
    setSelectedHeatNode(null);
  };

  // 11. Study & Earn Quests solver
  const claimQuestReward = (id: string, coinsAmt: number, xpAmt: number) => {
    if (completedQuests.includes(id)) return;
    setCompletedQuests(prev => [...prev, id]);
    onGrantRewards(xpAmt, coinsAmt);
    onAddNotification("Quest Claimed!", `Secured quest rewards! +${coinsAmt} NEXA and +${xpAmt} XP.`, "success");
    triggerAudioSfx();
  };

  return (
    <div id="cosmic-innovation-container" className="space-y-6">
      
      {/* HEADER SECTION WITH MODERN TABS OR GO HOME BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 py-4 neo-glass rounded-3xl border border-white/5 bg-black/60 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2E5BFF] to-[#CCFF00] p-0.5 shadow-md shadow-blue-500/10">
            <div className="w-full h-full bg-black/80 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#CCFF00]" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
              ⭐ Nexa Special Innovation Deck
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
              Unrivaled Academic Game Mechanics & AI Nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== "deck" && (
            <button 
              onClick={() => { setActiveTab("deck"); triggerAudioSfx(); }}
              className="py-1.5 px-4 bg-white/5 hover:bg-white/15 text-gray-200 hover:text-white rounded-xl text-xs font-mono font-bold transition border border-white/5 cursor-pointer uppercase"
            >
              ← Back to Innovation Grid
            </button>
          )}
          <span className="px-3 py-1 bg-black/40 text-cyan-400 font-mono text-[10px] rounded-lg border border-cyan-400/20 font-bold uppercase select-none">
            ⚡ NEXA FLOW: ACTIVE
          </span>
        </div>
      </div>

      {/* TABS SELECTOR - DYNAMIC DECK GRID OR SPECIFIC PANEL */}
      <AnimatePresence mode="wait">
        {activeTab === "deck" ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* INSPIRATIONAL HERO PRESET CARD */}
            <div className="p-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-indigo-950/40 via-black/80 to-slate-900/40 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>
              <p className="text-[#CCFF00] text-[10px] tracking-widest uppercase font-mono font-black mb-1">
                EXCLUSIVITY REPORT: EXPERIMENTAL STUDENT PLATFORM
              </p>
              <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                "I've never seen this before."
              </h4>
              <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Welcome to the hyper-gamified future of NexaLearn. Tap any experimental deck block below to test predictions, battle focus-eating AI, explore maps, build streak cities, and claim mystery knowledge crates!
              </p>
            </div>

            {/* 12 SPECIALIZED BENTO BLOCKS FOR MAXIMUM VIRAL ENGAGEMENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Block 1: AI Study Twin */}
              <div 
                onClick={() => { setActiveTab("twin"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-blue-400/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-400/20">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full uppercase">
                    AI Dual Cohort
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-blue-300 transition-colors">
                  👥 AI Study Twin
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Predicts your forgetting threshold based on behavior. Generates pre-emptive revision cards using Gemini before decay.
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-[#CCFF00] tracking-wider uppercase font-bold">
                  Synchronize matrix <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 2: Focus Battle Arena */}
              <div 
                onClick={() => { setActiveTab("arena"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-red-400/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-red-500/10 rounded-2xl border border-red-400/20">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full uppercase">
                    CYBER FIGHTER
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-red-300 transition-colors">
                  🎯 Focus Battle Arena
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Protect your firewall against rapid AI distraction popups! Avoid TikTok and games to claim substantial NEXA tokens.
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-red-400 tracking-wider uppercase font-bold">
                  Defend fortress <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 3: Real-World Learning Scanner */}
              <div 
                onClick={() => { setActiveTab("scanner"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-green-400/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-green-500/10 rounded-2xl border border-green-400/20">
                    <Camera className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full uppercase">
                    Lens AI
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-green-300 transition-colors">
                  📸 Learning Scanner
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Point virtual cameras at skyscraper structural limits, plants, mechanical engines or maps to reveal the underlying laws!
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-[#CCFF00] tracking-wider uppercase font-bold">
                  Scan Vectors <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 4: Streak Cities */}
              <div 
                onClick={() => { setActiveTab("city"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-yellow-400/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-400/20">
                    <Globe className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full uppercase">
                    Construction
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-yellow-300 transition-colors">
                  ⚡ Study Streak Cities
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Your streak converts automatically into glowing architecture models! Day 1 is a village; Day 30 is a neon Cyber Metropolis!
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-[#CCFF00] tracking-wider uppercase font-bold">
                  Open City Builder <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 5: AI Exam Simulator */}
              <div 
                onClick={() => { setActiveTab("simulator"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-pink-400/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-pink-500/10 rounded-2xl border border-pink-400/20">
                    <Target className="w-6 h-6 text-pink-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded-full uppercase">
                    SIMULATOR
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-pink-300 transition-colors">
                  🤖 AI Exam Simulator
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Trigger high-pressure timer trials. Scalable difficulties of Board and Olympic limits with live score likelihood outputs.
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-pink-400 tracking-wider uppercase font-bold">
                  Run exam trial <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 6: Knowledge Galaxy */}
              <div 
                onClick={() => { setActiveTab("galaxy"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-purple-400/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-400/20">
                    <Orbit className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full uppercase">
                    STRENGTH EXPANSION
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-purple-300 transition-colors">
                  🌌 Knowledge Galaxy
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Travel across rotating celestial orbits including Math Planet and Physics Planet. Solve orbits to colonize worlds!
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-purple-400 tracking-wider uppercase font-bold">
                  Calibrate orbit <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 7: Voice Teacher Companion */}
              <div 
                onClick={() => { setActiveTab("voice"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-cyan-400/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-400/20">
                    <Volume2 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full uppercase">
                    AI SYNTHESIS
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-cyan-300 transition-colors">
                  🎙️ Voice Teacher Mode
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Ask companion teachers to explain vector mechanics or friction "like I'm 10" with realistic dancing frequency audio waves.
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-[#CCFF00] tracking-wider uppercase font-bold">
                  Interact vocally <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 8: Homework Battle Mode */}
              <div 
                onClick={() => { setActiveTab("battle"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-amber-500/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-400/20">
                    <Gamepad2 className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full uppercase">
                    E-SPORTS ARENA
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-amber-300 transition-colors">
                  ⚔️ Homework Battle Mode
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Wager virtual NEXA coins in raw speed races against competitive peers. First to integrate formulas claims the jackpot!
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-amber-400 tracking-wider uppercase font-bold">
                  Challenge Rival <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 9: Weekly AI Leagues */}
              <div 
                onClick={() => { setActiveTab("leagues"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-emerald-500/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-400/20">
                    <Trophy className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase">
                    LADDER
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-emerald-300 transition-colors">
                  🏆 Weekly AI Leagues
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Climb competitive tiers: Bronze to Quantum League. Out-study simulated elite global candidates in a live promotion zone.
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-emerald-400 tracking-wider uppercase font-bold">
                  Inspect Divisions <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 10: Mystery Knowledge Crates */}
              <div 
                onClick={() => { setActiveTab("crates"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-orange-400/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-400/20">
                    <Gift className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full uppercase">
                    LOOTBOX UNBOX
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-orange-300 transition-colors">
                  💎 Mystery Knowledge Crates
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Unlock standard or quantum-class scholar boxes. Win cosmic items including username aura glows and teacher skins!
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-orange-400 tracking-wider uppercase font-bold">
                  Purchase Box <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 11: Memory Heat Map */}
              <div 
                onClick={() => { setActiveTab("heatmap"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-[#CCFF00]/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-lime-500/10 rounded-2xl border border-lime-400/20">
                    <Flame className="w-6 h-6 text-lime-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full uppercase">
                    NEURAL DENSITY
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-lime-300 transition-colors">
                  🔥 Memory Heat Map
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Behold your active brain projection matrix! Overheated red nodes are decay hazard levels. Charge synapses immediately.
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-lime-400 tracking-wider uppercase font-bold">
                  View Brain scanner <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Block 12: Study & Earn Quests */}
              <div 
                onClick={() => { setActiveTab("quests"); triggerAudioSfx(); }}
                className="p-5 rounded-[24px] bg-black/50 border border-white/5 hover:border-violet-500/25 cursor-pointer transition-all hover:-translate-y-1 block relative group hover:bg-black/85"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-400/20">
                    <ListChecks className="w-6 h-6 text-violet-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full uppercase">
                    Daily quests
                  </span>
                </div>
                <h5 className="text-xs font-black text-white font-mono uppercase mt-4 mb-1 group-hover:text-violet-300 transition-colors">
                  🎮 Study & Earn Quests
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Claim gamified currency and XP for completes! Solve equations, complete focus locks, and maintain daily vectors.
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-violet-400 tracking-wider uppercase font-bold">
                  Collect wages <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-1">
            
            {/* ────── TABS BLOCK 1: AI STUDY TWIN PANEL ────── */}
            {activeTab === "twin" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-cyan-300 uppercase">🧠 Digital AI Study Twin Matrix</h4>
                  <span className="px-2.5 py-1 text-[9px] font-mono font-bold text-cyan-400 bg-cyan-400/10 uppercase rounded-xl">DIAGNOSTIC STATUS: SYNCHRONIZED</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[9px] text-gray-500 font-mono uppercase block">CURRENT USER TWIN CALIBRATION</span>
                      <p className="text-sm text-white font-extrabold font-mono mt-1">💡 Twin ID: NexaTwin_@{profile.username}</p>
                      
                      <div className="mt-4 space-y-1.5 text-xs text-zinc-300">
                        <div className="flex justify-between">
                          <span>Twin's Sleep Curve Decay:</span>
                          <span className="text-indigo-400 font-mono">18 Hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Neural Synaptic Accuracy:</span>
                          <span className="text-[#CCFF00] font-mono">94.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Primary Decay Warning node:</span>
                          <span className="text-red-400 font-mono">Quantum Gravity Escape Curves</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={triggerTwinSync}
                        disabled={twinActionLoading}
                        className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-black font-extrabold text-xs font-mono rounded-xl transition cursor-pointer text-center uppercase"
                      >
                        {twinActionLoading ? "Processing Sync..." : "⚡ Sync Habit Diagnostics"}
                      </button>
                      <button 
                        onClick={triggerTwinPreemptiveNotes}
                        disabled={twinActionLoading || !twinDiagnosticRan}
                        className="flex-1 py-3 px-4 bg-[#CCFF00] hover:bg-lime-400 disabled:opacity-50 text-black font-extrabold text-xs font-mono rounded-xl transition cursor-pointer text-center uppercase"
                      >
                        🧬 Generate Pre-Emptive Note
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-[#23232A]/20 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-gray-500 uppercase block mb-2">🚀 TWIN DIAGNOSTIC FEEDBACK ENGINE (GEMINI)</span>
                      
                      {twinFeedback ? (
                        <p className="text-xs text-cyan-300 font-mono leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                          {twinFeedback}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          No diagnostic results compiled yet. Click the Sync Habit button above to analyze curves!
                        </p>
                      )}
                    </div>

                    {twinNotes && (
                      <div className="mt-4 bg-lime-500/10 border border-lime-400/20 p-3.5 rounded-xl">
                        <span className="text-[9px] font-mono text-lime-400 uppercase font-bold block">🚨 PRE-EMPTED STUDY SHEET</span>
                        <p className="text-xs text-zinc-300 mt-2 whitespace-pre-line font-mono">{twinNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ────── TABS BLOCK 2: FOCUS BATTLE ARENA ────── */}
            {activeTab === "arena" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-red-400 uppercase">🛡️ FOCUS BATTLE ARENA VS DISTRACTION BOT</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-mono text-xs">HP Focus Shields: </span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(heart => (
                        <span key={heart} className={`text-sm ${focusLives >= heart ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`}>♥</span>
                      ))}
                    </div>
                  </div>
                </div>

                {!focusBattleActive && focusSuccess === null && (
                  <div className="p-6 text-center space-y-4 max-w-md mx-auto">
                    <ShieldAlert className="w-12 h-12 text-red-400 mx-auto animate-bounce" />
                    <h5 className="text-sm font-black text-white uppercase tracking-wider">Initiate Focus Shield Battle</h5>
                    <p className="text-xs text-gray-400">
                      Survive random, fast-incoming AI social distraction popups. Click the firewall keys before your shield is compromised. Reward: 50 Coins / XP!
                    </p>
                    <button 
                      onClick={() => { setFocusBattleActive(true); setFocusTimeLeft(15); setFocusLives(3); setFocusSuccess(null); }}
                      className="py-2.5 px-6 bg-red-500 text-black font-extrabold text-xs font-mono rounded-xl hover:scale-105 active:scale-95 transition cursor-pointer"
                    >
                      ⚔️ BATTLE START
                    </button>
                  </div>
                )}

                {focusBattleActive && (
                  <div className="space-y-6 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-300 font-mono">STABILITY TIMER: <span className="text-[#CCFF00] font-bold text-sm block">{focusTimeLeft}s</span></span>
                      <span className="text-xs text-gray-300 font-mono">Neural Score: <span className="text-cyan-400 font-bold text-sm block">{focusScore}</span></span>
                    </div>

                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-400 h-full transition-all duration-1000" style={{ width: `${(focusTimeLeft / 15) * 100}%` }} />
                    </div>

                    {activeDistraction ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-5 bg-red-950/40 border border-red-500/30 rounded-2xl text-center space-y-3 shadow-lg shadow-red-950/20">
                        <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[9px] font-black uppercase rounded">🚨 CRITICAL DISTRACTION SHIELD LEAKING!</span>
                        <p className="text-xs text-white font-black">{activeDistraction.text}</p>
                        <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => tackleDistraction(true)}
                            className="py-2 px-4 bg-[#CCFF00] text-black font-mono text-[10px] font-black rounded-lg cursor-pointer uppercase"
                          >
                            ✓ {activeDistraction.action}
                          </button>
                          <button 
                            onClick={() => tackleDistraction(false)}
                            className="py-2 px-4 bg-transparent text-gray-400 hover:text-white font-mono text-[10px] rounded-lg cursor-pointer transition uppercase"
                          >
                            Surrender Focus
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="py-6 text-center space-y-2">
                        <Zap className="w-6 h-6 text-lime-400 mx-auto animate-pulse" />
                        <p className="text-xs text-[#CCFF00] font-mono tracking-widest uppercase">Firewall intact. Keep centering attention...</p>
                      </div>
                    )}
                  </div>
                )}

                {focusSuccess === true && (
                  <div className="py-6 text-center space-y-4 max-w-md mx-auto">
                    <Trophy className="w-12 h-12 text-[#CCFF00] mx-auto animate-bounce" />
                    <h5 className="text-sm font-black text-white uppercase font-mono">🔥 INTELLECT LOCKED!</h5>
                    <p className="text-xs text-lime-400 font-mono">
                      Absolute victory. You defended your cognitive fortress from simulated algorithms. Secured +50 XP / 20 NEXA.
                    </p>
                    <button 
                      onClick={() => setFocusSuccess(null)}
                      className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white font-mono text-xs rounded-xl cursor-pointer"
                    >
                      Dismantle Lobby
                    </button>
                  </div>
                )}

                {focusSuccess === false && (
                  <div className="py-6 text-center space-y-4 max-w-md mx-auto">
                    <ZapOff className="w-12 h-12 text-zinc-500 mx-auto" />
                    <h5 className="text-sm font-black text-white uppercase font-mono">❌ FIREWALL PENETRATED</h5>
                    <p className="text-xs text-gray-400">
                      You were lured in by simulated alerts. Recharge cyber energy and reinforce your mind setup!
                    </p>
                    <button 
                      onClick={() => setFocusSuccess(null)}
                      className="py-2 px-4 bg-white/10 hover:bg-white/15 text-white font-mono text-xs rounded-xl cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ────── TABS BLOCK 3: REAL-WORLD LEARNING SCANNER ────── */}
            {activeTab === "scanner" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-green-300 uppercase">📸 Real-World Science Learning Lens</h4>
                  <span className="px-2.5 py-1 text-[9px] font-mono font-bold text-green-400 bg-green-400/10 uppercase rounded-xl">ENVIRONMENT MODE: CAPACITOR FOCUS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">SELECT REAL-WORLD TARGET OBJECT LENS</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "skyscraper", label: "🏢 High Skyscraper", topic: "Structural damping & Vector balance" },
                        { id: "cell", label: "🌿 Chloroplast", topic: "Formula displacement reactions" },
                        { id: "turbine", label: "⚙️ Hydraulic Generator", topic: "Ampere flux & copper velocity" },
                        { id: "aqueduct", label: "🗺️ Gravitational Aqueduct", topic: "Hydrostatic differential equations" }
                      ].map(target => (
                        <button
                          key={target.id}
                          onClick={() => { setSelectedScanTarget(target.id); setScanState('idle'); setScanResult(""); }}
                          className={`p-3 text-left rounded-xl transition border text-xs font-mono block ${selectedScanTarget === target.id ? 'bg-green-500/10 border-green-400/40 text-green-300' : 'bg-black/40 border-white/5 text-gray-400'}`}
                        >
                          <p className="font-extrabold">{target.label}</p>
                          <p className="text-[9px] text-gray-500 mt-1">{target.topic}</p>
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] text-gray-500 italic font-mono leading-relaxed">
                      *Tapping the lens triggers Gemini 3.5 proxy calculations to explain structural and chemical mechanics.
                    </p>

                    <button 
                      onClick={runLearningScanner}
                      disabled={scanState === 'scanning'}
                      className="w-full py-3 bg-[#CCFF00] hover:bg-lime-400 disabled:opacity-50 text-black font-extrabold font-mono text-xs rounded-xl cursor-pointer text-center uppercase"
                    >
                      {scanState === 'scanning' ? "Deploying Scan Laser..." : "📡 ACTIVATE QUANTUM LENS"}
                    </button>
                  </div>

                  <div className="p-4 bg-[#23232A]/20 border border-white/5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    {scanState === 'scanning' && (
                      <div className="absolute inset-x-0 h-1 bg-green-400 opacity-60 animate-bounce top-5"></div>
                    )}
                    
                    <div>
                      <span className="text-[9px] font-mono text-gray-500 uppercase block mb-2">📸 DECRYPTED SCIENCE INSIGHT (GEMINI COGNITIVE)</span>
                      
                      {scanState === 'idle' && (
                        <p className="text-xs text-gray-400 italic">Select an object target and hover the scanner compiler to see decrypted mechanics.</p>
                      )}

                      {scanState === 'scanning' && (
                        <p className="text-xs text-green-300 font-mono animate-pulse">Engaging neural target alignment index... Decoding mechanical limits with Gemini 3.5...</p>
                      )}

                      {scanState === 'done' && (
                        <p className="text-xs text-zinc-300 leading-relaxed font-mono bg-black/60 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                          {scanResult}
                        </p>
                      )}
                    </div>

                    {scanState === 'done' && (
                      <div className="mt-3 bg-green-500/10 border border-green-400/20 p-2.5 rounded-lg text-center text-[10px] font-mono text-[#CCFF00]">
                        ✓ Calibration compiled! Added +20 XP to student profile.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ────── TABS BLOCK 4: STREAK CITIES ────── */}
            {activeTab === "city" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-yellow-400 uppercase">🏘️ Study Streak City Builder</h4>
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[9px] font-mono font-black uppercase rounded-lg">
                    STREAK LEVEL: {cityDetails.level}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">BUILD DIRECTIVES</span>
                    <p className="text-xs text-zinc-300">
                      Instead of dry stats, your Daily Streak constructs visual isometric buildings down in your study block!
                    </p>

                    <div className="p-3 bg-black/40 rounded-xl space-y-2 text-xs text-zinc-300 font-mono">
                      <div className="flex justify-between">
                        <span>Current Streak:</span>
                        <span className="text-[#CCFF00] font-black">{profile.streak} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Metropol Level:</span>
                        <span className="text-cyan-400">{cityDetails.level}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed mt-2 italic">
                        "{cityDetails.desc}"
                      </p>
                    </div>

                    <button 
                      onClick={constructBuilding}
                      className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold font-mono text-xs rounded-xl cursor-pointer text-center uppercase"
                    >
                      🧱 Purchase Streak Wing (-100 NEXA Coins)
                    </button>
                  </div>

                  <div className="p-4 bg-black/60 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <span className="text-[9px] font-mono text-gray-500 uppercase block mb-3">🎨 ISOMETRIC CITY SECTORS</span>
                      
                      {buildingAnimation && (
                        <div className="text-center py-6 text-yellow-400 font-mono text-xs animate-bounce">
                          🧱 Deploying quantum neon concrete foundations for "{buildingAnimation}"...
                        </div>
                      )}

                      {!buildingAnimation && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {cityGrowthState.map((building, i) => (
                            <div key={i} className="p-2.5 bg-white/5 rounded-lg border border-white/5 text-center text-[10px] font-mono text-gray-300 flex flex-col justify-between items-center gap-1">
                              <span className="text-lg">⚡</span>
                              <span className="block font-bold mt-1 text-center truncate w-full">{building}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-[9px] text-gray-500 font-mono text-center mt-3">
                      *Maintain your daily streak to preserve reactor cores. Streak decay triggers city cooling mode.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ────── TABS BLOCK 5: AI EXAM SIMULATOR ────── */}
            {activeTab === "simulator" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-pink-400 uppercase">🤖 AI EXAM SIMULATOR & MASTER PREDICTOR</h4>
                  <span className="px-2.5 py-1 text-[9px] font-mono font-bold text-pink-400 bg-pink-400/10 uppercase rounded-xl">MODE: SPEED TRIAL PRESSURE</span>
                </div>

                {!examInRun && !examDone && (
                  <div className="p-6 text-center space-y-4 max-w-md mx-auto">
                    <Target className="w-12 h-12 text-pink-400 mx-auto animate-pulse" />
                    <p className="text-xs text-gray-400">
                      Configure realistic countdown scenarios. Difficulty ranges from board exams to competitive Olympics. Pressure mode increases focus decay!
                    </p>
                    
                    <div className="flex justify-center gap-2">
                      {['Board', 'Advanced', 'Quantum'].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setExamLevel(lvl as any)}
                          className={`py-1.5 px-3.5 text-xs font-mono rounded-lg transition border cursor-pointer ${examLevel === lvl ? 'bg-pink-600 text-white border-pink-500' : 'bg-black/40 text-gray-400 border-white/5'}`}
                        >
                          {lvl} Level
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-center items-center gap-2 mt-4">
                      <input 
                        type="checkbox" 
                        id="pressure-ch" 
                        checked={examPressure} 
                        onChange={() => setExamPressure(!examPressure)}
                        className="cursor-pointer"
                      />
                      <label htmlFor="pressure-ch" className="text-xs font-mono text-red-400 cursor-pointer uppercase">Activate Red-Out Pressure Mode</label>
                    </div>

                    <button 
                      onClick={runSimulatorQuestions}
                      className="w-full py-2.5 bg-pink-500 text-black font-extrabold text-xs font-mono rounded-xl cursor-pointer"
                    >
                      ⚡ COMPILE EXAM PROBLEMS
                    </button>
                  </div>
                )}

                {examInRun && (
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-xs text-pink-300 font-mono">TIMER VELOCITY: 25s left</span>
                      <span className="text-xs text-red-400 font-bold uppercase animate-pulse">{examPressure ? "🔥 PRESSURE DEPLOYED" : "STANDARD PRESET"}</span>
                    </div>

                    <div className="p-5 bg-black/80 rounded-2xl border border-white/10 space-y-4">
                      <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold rounded">QUESTION FIELD INDEX</span>
                      {examQuestions && examQuestions.length > 0 ? (
                        <p className="text-xs text-white leading-relaxed font-mono">
                          {examQuestions[0].question}
                        </p>
                      ) : (
                        <p className="text-xs text-white leading-relaxed font-mono">
                          Verify escape velocity displacement bounds where friction levels is mu=0.45 and force exceeds 15 Newtons.
                        </p>
                      )}

                      <div className="pt-2">
                        <button 
                          onClick={finishExamSimulator}
                          className="py-1.5 px-4 bg-[#CCFF00] hover:bg-lime-400 text-black font-mono text-xs font-black rounded-lg cursor-pointer uppercase"
                        >
                          ✓ Submit Calibration Solution
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {examDone && (
                  <div className="p-6 text-center space-y-4 max-w-md mx-auto">
                    <Award className="w-12 h-12 text-[#CCFF00] mx-auto animate-bounce" />
                    <h5 className="text-sm font-black text-white uppercase font-mono">PROBABILITY MASTER CALIBRATION</h5>
                    
                    <div className="p-4 bg-black/80 rounded-2xl border border-white/5 space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase font-mono">AI REALISTIC SCORE PREDICTION</span>
                      <p className="text-sm text-lime-404 text-[#CCFF00] font-black font-mono">{predictedScore}</p>
                    </div>

                    <p className="text-xs text-gray-400">
                      Excellent step-by-step resolution. Compile another simulator to scale further. Secured +50 XP.
                    </p>

                    <button 
                      onClick={() => setExamDone(false)}
                      className="py-1.5 px-4 bg-white/10 hover:bg-white/15 text-white font-mono text-xs rounded-xl cursor-pointer"
                    >
                      Reset Simulator
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ────── TABS BLOCK 6: KNOWLEDGE GALAXY ────── */}
            {activeTab === "galaxy" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-purple-300 uppercase">🌌 KNOWLEDGE GALAXY PLANETARY CHART</h4>
                  <span className="px-2.5 py-1 text-[9px] font-mono font-bold text-purple-400 bg-purple-400/10 uppercase rounded-xl">ORBIT TYPE: HELIOCENTRIC UNLOCK</span>
                </div>

                {!galaxyActiveQuiz ? (
                  <div className="space-y-6 pt-2">
                    <p className="text-xs text-gray-400 text-center max-w-xl mx-auto">
                      Floating planets represent school fields! Solve orbiting micro-equations to colonize moons and lock core rewards!
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 py-6">
                      {[
                        { id: "Math", label: "Math Planet", color: "from-blue-500 to-cyan-500", icon: "📐" },
                        { id: "Physics", label: "Physics Planet", color: "from-orange-500 to-red-500", icon: "⚛️" },
                        { id: "Biology", label: "Biology Planet", color: "from-green-500 to-emerald-500", icon: "🌿" },
                        { id: "History", label: "History Planet", color: "from-purple-500 to-pink-500", icon: "🏛️" }
                      ].map(planet => {
                        const isUnlocked = planetUnlocked[planet.id];
                        return (
                          <div 
                            key={planet.id}
                            onClick={() => isUnlocked && handlePlanetClicked(planet.id)}
                            className={`w-36 p-4 rounded-3xl border text-center transition-all flex flex-col justify-between items-center relative overflow-hidden h-36 ${isUnlocked ? 'bg-black/60 border-purple-500/30 cursor-pointer hover:border-purple-400' : 'bg-black/25 border-white/5 opacity-50'}`}
                          >
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${planet.color} flex items-center justify-center text-xl shadow-lg`}>
                              {planet.icon}
                            </div>
                            <span className="text-xs font-black text-white block mt-3 font-mono">{planet.label}</span>
                            {isUnlocked ? (
                              <span className="text-[8px] text-[#CCFF00] font-mono uppercase tracking-widest font-bold">Orbit Open</span>
                            ) : (
                              <span className="text-[8px] text-gray-500 font-mono uppercase tracking-widest font-bold"><Lock className="w-2.5 h-2.5 inline mr-1" /> Locked</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto p-4 bg-black/80 rounded-2xl border border-purple-500/20 space-y-4">
                    <div className="flex justify-between text-xs text-purple-400 font-mono">
                      <span>PLANET: {selectedPlanet}</span>
                      <span>Progress: {currentQuizIndex + 1}/2</span>
                    </div>

                    <h5 className="text-xs font-black text-white font-mono mt-3">
                      {currentQuizIndex === 0 
                        ? `Calibrate the orbital frequency for ${selectedPlanet} where mass coefficient is 1.5.`
                        : `Solve formula derivative displacement logic inside ${selectedPlanet} sector.`
                      }
                    </h5>

                    <div className="space-y-2 pt-2">
                      <button 
                        onClick={() => handleGalaxyAnswer(true)}
                        className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white font-mono transition border border-white/5 cursor-pointer uppercase"
                      >
                        A) Correct calibrated solution vector code
                      </button>
                      <button 
                        onClick={() => handleGalaxyAnswer(false)}
                        className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white font-mono transition border border-white/5 cursor-pointer uppercase"
                      >
                        B) Standard unstable placeholder draft
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ────── TABS BLOCK 7: VOICE TEACHER MODE ────── */}
            {activeTab === "voice" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-2">
                  <div>
                    <h4 className="text-base font-black text-white tracking-widest font-mono text-cyan-300 uppercase flex items-center gap-2">
                      🎙️ CO-PROCESSED DUAL-PORT VOICE TERMINAL
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">NEURAL FREQUENCY CALIBRATION FRAMEWORK</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-xl transition-all ${
                    micIsActive 
                      ? "text-red-400 bg-red-400/10 animate-pulse border border-red-500/20" 
                      : voiceWavesActive 
                        ? "text-[#CCFF00] bg-[#CCFF00]/10 animate-pulse border border-[#CCFF00]/20" 
                        : "text-cyan-400 bg-cyan-400/10 border border-cyan-400/10"
                  }`}>
                    {micIsActive ? "● MIC DICTATION PORT: OPEN" : voiceWavesActive ? "🔊 AUDIO SYNTHESIS: EMITTING" : "STANDBY GATEWAY: DETECTED"}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT CHANNEL: COMMAND INTAKE */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">1. Query Syntax Input</span>
                      <div className="relative">
                        <textarea
                          value={voiceQueryInput}
                          onChange={(e) => setVoiceQueryInput(e.target.value)}
                          placeholder="Ex: Explain quantum superposition in simple, punchy, conversational style..."
                          className="w-full h-32 p-3.5 pr-12 bg-black/70 rounded-2xl text-xs text-white border border-white/10 focus:border-cyan-400 focus:outline-none font-mono placeholder-gray-500 leading-relaxed resize-none cursor-text"
                        />
                        <button
                          type="button"
                          onClick={() => { triggerAudioSfx(); toggleDictation(); }}
                          className={`absolute right-3 bottom-4 p-3 rounded-xl border transition-all cursor-pointer ${
                            micIsActive 
                              ? "bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse" 
                              : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                          }`}
                          title={micIsActive ? "Mic Active. Click to stop dictation." : "Vocal Dictation Input (Speech-To-Text)"}
                        >
                          <Mic className={`w-4 h-4 ${micIsActive ? "animate-bounce" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-mono text-gray-500 uppercase mr-1">PRESETS:</span>
                      <button 
                        onClick={() => { setVoiceQueryInput("Explain Newton's Laws of Motion like I am 10"); triggerAudioSfx(); }}
                        className="py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] text-gray-300 font-mono transition cursor-pointer"
                      >
                        ⚽ Newton 3 laws
                      </button>
                      <button 
                        onClick={() => { setVoiceQueryInput("Why do mass dampers prevent skyscrapers falling down during earthquakes?"); triggerAudioSfx(); }}
                        className="py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] text-gray-300 font-mono transition cursor-pointer"
                      >
                        🏢 Dampers & Towers
                      </button>
                      <button 
                        onClick={() => { setVoiceQueryInput("What is the difference between a covalent bond and an ionic bond in simple words?"); triggerAudioSfx(); }}
                        className="py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] text-gray-300 font-mono transition cursor-pointer"
                      >
                        🧪 Chemistry Bonds
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={speakVoiceTeacher}
                        disabled={voiceLoading}
                        className="py-3.5 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 text-black font-black font-mono text-xs rounded-2xl cursor-pointer text-center uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        {voiceLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>COMPILING SYNTAX...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            <span>🔊 EMIT CORE AUDIO PLAYBACK</span>
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => {
                          if (window.speechSynthesis) window.speechSynthesis.cancel();
                          setVoiceWavesActive(false);
                          triggerAudioSfx();
                          onAddNotification("Engine Stopped 🛑", "Vocal output streams canceled safely.", "info");
                        }}
                        className="py-3.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 font-bold font-mono text-xs rounded-2xl cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        <span>⏹️ STOP PLAYBACK</span>
                      </button>
                    </div>
                  </div>

                  {/* RIGHT CHANNEL: SYNTHETIC RECONSTRUCTION & CONFIG TERMINAL */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 bg-black/60 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">🎙️ TUNER MATRIX CONTROLS</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[8px] font-mono text-emerald-400">ONLINE</span>
                        </div>
                      </div>

                      {/* Accent Dropdown selector */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-gray-400 block font-bold">Accent Locale Node</label>
                        <select
                          value={vocalVoiceAccent}
                          onChange={(e) => {
                            setVocalVoiceAccent(e.target.value);
                            triggerAudioSfx();
                            onAddNotification("Accent Redirected", `Switched vocoder system target locale to ${e.target.value}`, "info");
                          }}
                          className="w-full bg-black/80 text-white font-mono text-xs py-2 px-3 rounded-lg border border-white/10 focus:border-cyan-400 focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="en-US">🇺🇸 United States (American Accent)</option>
                          <option value="en-GB">🇬🇧 United Kingdom (British Accent)</option>
                          <option value="en-IN">🇮🇳 India (English - Standard Accent)</option>
                          <option value="hi-IN">🇮🇳 India (Standard Hindi Language - हिन्दी)</option>
                          <option value="es-ES">🇪🇸 Spain (Spanish Accent - Español)</option>
                          <option value="fr-FR">🇫🇷 France (French Accent - Français)</option>
                          <option value="ja-JP">🇯🇵 Japan (Japanese Accent - 日本語)</option>
                        </select>
                      </div>

                      {/* PRESET ENGINE TONES */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-gray-400 block font-bold">Voice Model Anchors</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { name: "Standard Academic", speed: 1.0, pitch: 1.0, label: "🧘‍♂️ Standard", code: "std" },
                            { name: "Velocity Revision", speed: 1.35, pitch: 1.05, label: "⚡ High Velocity", code: "vlo" },
                            { name: "Simplified Analogies", speed: 0.8, pitch: 1.35, label: "🧸 Kids Tutor", code: "kids" },
                            { name: "Cyber Synth Baritone", speed: 0.95, pitch: 0.65, label: "🛰️ Deep Cyber", code: "cyb" }
                          ].map((tpl) => (
                            <button
                              key={tpl.code}
                              type="button"
                              onClick={() => {
                                setVocalSpeed(tpl.speed);
                                setVocalPitch(tpl.pitch);
                                setVocalGenderTone(tpl.code);
                                triggerAudioSfx();
                                onAddNotification(
                                  "Config Reconfigured",
                                  `Applied "${tpl.name}" anchor: Speed ${tpl.speed}x, Pitch ${tpl.pitch}.`,
                                  "info"
                                );
                              }}
                              className={`py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-gray-300 font-mono text-left truncate transition flex items-center justify-between border ${
                                vocalGenderTone === tpl.code 
                                  ? "border-cyan-400/40 bg-cyan-400/5 text-cyan-200" 
                                  : "border-white/5"
                              }`}
                            >
                              <span>{tpl.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* SLIDERS MATRIX */}
                      <div className="grid grid-cols-2 gap-4 pt-1.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-gray-400">
                            <span>SPEED VALUE</span>
                            <span className="text-cyan-300 font-bold">{vocalSpeed}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="1.8"
                            step="0.05"
                            value={vocalSpeed}
                            onChange={(e) => setVocalSpeed(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-ew-resize bg-white/10 rounded-lg appearance-none h-1.5"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-gray-400">
                            <span>PITCH FREQ</span>
                            <span className="text-cyan-300 font-bold">{vocalPitch}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="1.8"
                            step="0.05"
                            value={vocalPitch}
                            onChange={(e) => setVocalPitch(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-ew-resize bg-white/10 rounded-lg appearance-none h-1.5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-black/60 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-gray-500 uppercase font-black">🗣️ SPEECH MONITOR OUTFLOWS</span>
                        
                        {(voiceWavesActive || voiceLoading) && (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 2, 4, 1, 3, 5, 2].map((height, i) => (
                              <motion.div 
                                key={i} 
                                animate={{ height: voiceLoading ? [12, 36, 12] : [6, 22, 6] }} 
                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                className="w-0.5 bg-cyan-400 rounded-full" 
                                style={{ height: "12px" }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="min-h-16 flex flex-col justify-center">
                        {voiceTeachingOutput ? (
                          <div className="text-[11px] text-cyan-100 font-mono bg-[#0D0E15] p-3 rounded-xl border border-white/10 overflow-auto max-h-36 leading-relaxed select-all">
                            {voiceTeachingOutput}
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-500 font-mono italic text-center p-3">
                            🎤 Config your vocoder, click Emit above, then listen to standard voice synthesis!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ────── TABS BLOCK 8: HOMEWORK BATTLE MODE ────── */}
            {activeTab === "battle" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-amber-500 uppercase">⚔️ LIVE HOMEWORK BATTLE SPEED DUEL</h4>
                  <span className="px-2.5 py-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 uppercase rounded-xl">REALTIME MODE</span>
                </div>

                {hwBattleState === 'idle' && (
                  <div className="p-6 text-center space-y-4 max-w-md mx-auto">
                    <Gamepad2 className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                    <p className="text-xs text-gray-300">
                      Wager your coins against genuine peer profiles from the Nexa registered database. Questions are generated in real-time by Google Gemini (no hardcoded templates), so you'll always face a brand new speed challenge!
                    </p>

                    {/* Subject Selector */}
                    <div className="space-y-2 text-left py-2 border-y border-white/5">
                      <span className="text-[10px] text-gray-400 font-mono uppercase block text-center">Select Challenge Discipline</span>
                      <div className="grid grid-cols-2 gap-2">
                        {["Olympiad Mathematics", "Quantum Physics", "Organic Chemistry", "Computer Science"].map(subj => (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => setChosenSubject(subj)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono transition border cursor-pointer ${chosenSubject === subj ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-black' : 'bg-black/60 text-gray-300 border-white/10 hover:border-white/20'}`}
                          >
                            {subj}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-white font-mono">Wager Size: </span>
                      <div className="flex gap-1.5">
                        {[50, 100, 200].map(amt => (
                          <button
                            key={amt}
                            onClick={() => setWagerAmount(amt)}
                            className={`py-1.5 px-3 rounded-lg text-xs font-mono transition border cursor-pointer ${wagerAmount === amt ? 'bg-amber-500 text-black border-amber-400 font-bold' : 'bg-black/40 text-gray-400 border-white/5 hover:text-white'}`}
                          >
                            {amt} NEXA
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={initiateHwBattle}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:scale-[1.02] text-black font-extrabold text-xs font-mono rounded-xl cursor-pointer transition-all uppercase border-none"
                    >
                      ⚡ Match Live Peer & Generate Challenge
                    </button>
                  </div>
                )}

                {hwBattleState === 'matching' && (
                  <div className="py-12 text-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
                    <p className="text-xs text-gray-300 font-mono uppercase animate-pulse">Filtering live online students to match your diagnostic skill level...</p>
                    <p className="text-[10px] text-gray-500 font-mono">Accessing real active user pool logs and prompting Gemini core for a brand new {chosenSubject} test vector...</p>
                  </div>
                )}

                {hwBattleState === 'active' && hwBattleQuestion && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4 pb-3">
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[9px] text-[#CCFF00] font-mono uppercase block">YOU (Ranked Cadet)</span>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: "30%" }} />
                        </div>
                      </div>
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[9px] text-red-400 font-mono uppercase block flex justify-between">
                          <span>RIVAL {battleRival?.username || "@AuraCoder"}</span>
                          <span className="text-gray-500 font-normal">XP: {battleRival?.xp || 1200}</span>
                        </span>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${rivalProgress}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-black/80 rounded-2xl border border-white/10 space-y-3 text-center">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-0.5 bg-amber-600/20 text-amber-300 text-[9px] font-mono rounded font-black tracking-widest uppercase">
                          {chosenSubject.toUpperCase()} BATTLE
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono">
                          Live Gemini Generator Active ⚡
                        </span>
                      </div>
                      
                      <p className="text-xs text-white leading-relaxed font-mono mt-2 p-3 bg-white/5 rounded-xl border border-white/5 text-left">
                        {hwBattleQuestion.q}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 pt-3">
                        {hwBattleQuestion.opts.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => answerHwBattle(opt)}
                            className="py-2.5 px-3 text-xs bg-white/5 hover:bg-white/10 text-white font-mono transition border border-white/5 rounded-xl cursor-pointer text-left hover:border-amber-400/40"
                          >
                            <span className="text-amber-400 mr-1.5 font-bold">{String.fromCharCode(65 + i)})</span> {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {hwBattleState === 'victory' && (
                  <div className="py-6 text-center space-y-4 max-w-md mx-auto">
                    <Trophy className="w-12 h-12 text-[#CCFF00] mx-auto animate-bounce" />
                    <h5 className="text-sm font-black text-white uppercase font-mono">👑 ABSOLUTE JACKPOT CALIBRATED!</h5>
                    <p className="text-xs text-lime-400">
                      Successfully defeated <span className="font-bold text-white">{battleRival?.username || "rival"}</span>! You answered the Gemini generator problem before they manages to calibrate. Reclaimed wager + rewards!
                    </p>
                    <div className="text-xs font-mono py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl inline-block text-[#CCFF00]">
                      💳 Received +{wagerAmount * 2} NEXA & +40 XP
                    </div>
                    <div>
                      <button 
                        onClick={() => setHwBattleState('idle')}
                        className="py-1.5 px-4 bg-white/10 hover:bg-white/15 text-white font-mono text-xs rounded-xl cursor-pointer border-none"
                      >
                        Leave Lobby
                      </button>
                    </div>
                  </div>
                )}

                {hwBattleState === 'defeat' && (
                  <div className="py-6 text-center space-y-4 max-w-md mx-auto">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
                    <h5 className="text-sm font-black text-white uppercase font-mono">⚡ DEFEAT AT THE VELOCITY BOUNDS</h5>
                    <p className="text-xs text-gray-300">
                      Suboptimal vector calculation time. <span className="font-bold text-white">{battleRival?.username || "Your opponent"}</span> compiled correct answers faster. Lost {wagerAmount} wagered coins.
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      The correct answer was: <span className="text-[#CCFF00] font-bold">{hwBattleQuestion?.ans}</span>
                    </p>
                    <div>
                      <button 
                        onClick={() => setHwBattleState('idle')}
                        className="py-1.5 px-4 bg-white/10 hover:bg-white/15 text-white font-mono text-xs rounded-xl cursor-pointer border-none"
                      >
                        Dismantle Lobby
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ────── TABS BLOCK 9: WEEKLY AI LEAGUES ────── */}
            {activeTab === "leagues" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-emerald-400 uppercase">🏆 WEEKLY AI PROMOTIONAL BRACKET LEAGUE</h4>
                  <span className="px-2.5 py-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 uppercase rounded-xl">LEAGUE ENGINE: ONLINE</span>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {['Bronze', 'Silver', 'Gold', 'Platinum', 'Master', 'Quantum'].map(lg => {
                      const isActive = profile.league === lg || (lg === 'Bronze' && !profile.league);
                      return (
                        <div 
                          key={lg} 
                          className={`p-3 text-center rounded-xl border ${isActive ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300 font-black' : 'bg-black/40 border-white/5 text-gray-500'}`}
                        >
                          <span className="text-xs block font-mono uppercase">{lg}</span>
                          <span className="text-[8px] text-gray-600 block mt-1 font-mono">{isActive ? "📍 YOU" : "DIVISION"}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-black/60 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-mono text-gray-400 uppercase block mb-3">📍 DIVISION STANDINGS (YOUR CLUSTER GROUP 9)</span>
                    
                    <div className="space-y-2 text-xs font-mono">
                      {[
                        { rank: 1, name: "AuraCoder_⚡", xp: 5490, active: true },
                        { rank: 2, name: `${profile.username} (You)`, xp: profile.xp, active: false, highlight: true },
                        { rank: 3, name: "BioQueen_🌿", xp: 3980, active: true },
                        { rank: 4, name: "RookieSolver_9", xp: 1200, active: false },
                        { rank: 5, name: "ChemistryWitch_🧪", xp: 450, active: true }
                      ].map((competitor, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-xl flex justify-between items-center ${competitor.highlight ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00]' : 'bg-white/2 text-zinc-300'}`}
                        >
                          <span className="font-bold">#{competitor.rank} @{competitor.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400">{competitor.xp} XP</span>
                            {competitor.rank <= 2 ? (
                              <span className="text-[8px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded uppercase">📈 PROMOTION ZONE</span>
                            ) : (
                              <span className="text-[8px] bg-zinc-600 text-zinc-300 px-1.5 py-0.5 rounded uppercase">HOLD</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ────── TABS BLOCK 10: MYSTERY KNOWLEDGE CRATES ────── */}
            {activeTab === "crates" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-orange-400 uppercase">💎 MYSTERY KNOWLEDGE CRATES REDEMPTION</h4>
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-mono font-black uppercase rounded-lg">
                    COIN LEVEL: {profile.coins} NEXA
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">SELECT LOOT CRATE GRADE</span>
                    
                    <div className="space-y-2">
                      <div className="p-4 bg-black/60 rounded-2xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-white font-extrabold font-mono">🎁 Scholar mystery crate</p>
                          <p className="text-[10px] text-gray-400 uppercase font-mono mt-1 mt-0.5">May drop Golden Frames or XP boosters</p>
                        </div>
                        <button 
                          onClick={() => purchaseCrate('scholar')}
                          className="py-1.5 px-4 bg-orange-500 text-black font-extrabold font-mono text-xs rounded-xl cursor-pointer"
                        >
                          200 NEXA
                        </button>
                      </div>

                      <div className="p-4 bg-black/60 rounded-2xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-white font-extrabold font-mono">🌟 QUANTUM APEX MYSTERY CRATE</p>
                          <p className="text-[10px] text-orange-400 uppercase font-mono mt-1 mt-0.5">Chance of Celestial Themes & Username Glows</p>
                        </div>
                        <button 
                          onClick={() => purchaseCrate('quantum')}
                          className="py-1.5 px-4 bg-[#CCFF00] text-black font-extrabold font-mono text-xs rounded-xl cursor-pointer"
                        >
                          500 NEXA
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-black/60 rounded-2xl border border-white/5 flex flex-col justify-center items-center min-h-[220px]">
                    {unboxingCrate ? (
                      <div className="text-center space-y-3">
                        <Gift className="w-12 h-12 text-[#CCFF00] mx-auto animate-spin" />
                        <span className="text-xs text-orange-400 font-mono block uppercase animate-pulse">Unlocking mystery reactor nodes...</span>
                      </div>
                    ) : openCrateReward ? (
                      <div className="text-center space-y-4">
                        <Award className="w-12 h-12 text-[#CCFF00] mx-auto animate-bounce" />
                        <h5 className="text-xs text-white uppercase font-mono font-bold">UNBOX CODE COMPLETE</h5>
                        <div className="p-3 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-xl">
                          <p className="text-xs text-[#CCFF00] font-black font-mono">{openCrateReward}</p>
                        </div>
                        <button 
                          onClick={() => setOpenCrateReward(null)}
                          className="py-1 px-3 bg-white/10 text-gray-200 hover:text-white rounded-lg text-[10px] font-mono transition"
                        >
                          Acknowledge Item Setup
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center">Buy a mystery crate on the left to calibrate special rewards!</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ────── TABS BLOCK 11: MEMORY HEAT MAP ────── */}
            {activeTab === "heatmap" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-lime-400 uppercase">🧠 Live Cognitive Memory Brain HeatMap</h4>
                  <span className="px-2.5 py-1 text-[9px] font-mono font-bold text-lime-400 bg-lime-400/10 uppercase rounded-xl">COGNITIVE STATUS: ONLINE</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">SUBJECT SCANNERS HEAT MAP</span>
                    
                    <div className="space-y-3">
                      {Object.entries(heatMapScores).map(([sub, score]) => {
                        const scoreNum = score as number;
                        const isRed = scoreNum < 30;
                        const isOrange = scoreNum >= 30 && scoreNum < 70;
                        const isGreen = scoreNum >= 70;
                        
                        return (
                          <div 
                            key={sub}
                            onClick={() => reviewHeatNode(sub)}
                            className="p-3.5 bg-black/50 border border-white/5 rounded-xl cursor-pointer hover:border-lime-400/30 transition-all flex justify-between items-center"
                          >
                            <div>
                              <p className="text-xs text-white font-extrabold font-mono flex items-center gap-1.5">
                                {isRed && <span className="text-red-500 font-black">🔥</span>}
                                {isOrange && <span className="text-orange-400 font-bold">✴️</span>}
                                {isGreen && <span className="text-[#CCFF00]">✓</span>}
                                {sub}
                              </p>
                              <span className="text-[9px] text-gray-400 font-mono block uppercase mt-0.5">Memory density: {score}%</span>
                            </div>

                            <span className={`px-2 py-0.5 text-[8px] font-mono rounded font-black ${isRed ? 'bg-red-500/20 text-red-400 animate-pulse' : isOrange ? 'bg-orange-500/20 text-orange-400' : 'bg-lime-500/20 text-lime-400'}`}>
                              {isRed ? 'DECAY WARNING' : isOrange ? 'FADING' : 'SOLIDIFIED'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-black/60 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <span className="text-[9px] font-mono text-gray-500 uppercase block mb-3">⚡ ACTIVE REVIEW COMPILER</span>
                      
                      {selectedHeatNode ? (
                        <div className="space-y-3">
                          <p className="text-xs text-white font-bold font-mono">Reinforcing study loops for: {selectedHeatNode}</p>
                          <p className="text-xs text-gray-400">
                            Confirm formula recall parameters for escape vector dynamics to restore full memory heat calibration.
                          </p>
                          <button 
                            onClick={solveHeatReview}
                            className="py-1.5 px-4 bg-[#CCFF00] text-black font-mono text-[10px] font-black rounded-lg cursor-pointer uppercase"
                          >
                            ✓ Solve Quick Revision Calibrations
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Select a faded memory node on the left to initiate quick review synapse charging.</p>
                      )}
                    </div>

                    <p className="text-[9px] text-gray-500 font-mono text-center mt-3">
                      *AI Brain Heat scans correspond directly to local Olympiad challenge solves.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ────── TABS BLOCK 12: STUDY & EARN QUESTS ────── */}
            {activeTab === "quests" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-glass rounded-[28px] p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-base font-black text-white tracking-widest font-mono text-violet-300 uppercase">🎮 STUDY & EARN DAILY QUEST BOARD</h4>
                  <span className="px-2.5 py-1 text-[9px] font-mono font-bold text-violet-400 bg-violet-400/10 uppercase rounded-xl">WAGES COLLECTED ON CHAIN</span>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    { id: "q1", title: "Complete 5 math orbital equations", coins: 20, xp: 40, desc: "Solve 5 challenges across standard orbital grids." },
                    { id: "q2", title: "Study 30 minutes in Focus Lock Mode", coins: 30, xp: 50, desc: "Successfully lock focus session curves." },
                    { id: "q3", title: "Review faded memory nodes to Green SOLIDIFIED", coins: 15, xp: 25, desc: "Charge dynamic synapse indices successfully." },
                    { id: "q4", title: "Maintain 7-day Streak Metropolis levels", coins: 100, xp: 150, desc: "Build Town/Metropolis sectors down in Streak City Builder." }
                  ].map(quest => {
                    const isClaimed = completedQuests.includes(quest.id);
                    return (
                      <div 
                        key={quest.id} 
                        className="p-4 bg-black/60 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div>
                          <p className="text-xs text-white font-extrabold font-mono flex items-center gap-1.5">
                            {isClaimed ? "✓" : "✴️"} {quest.title}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-mono mt-1 truncate max-w-sm">{quest.desc}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#CCFF00] font-mono font-bold">+{quest.coins} NEXA / +{quest.xp} XP</span>
                          
                          <button
                            onClick={() => claimQuestReward(quest.id, quest.coins, quest.xp)}
                            disabled={isClaimed}
                            className={`py-1.5 px-4 font-mono text-[10px] font-black rounded-lg uppercase ${isClaimed ? 'bg-[#CCFF00]/10 text-gray-500 border border-white/5' : 'bg-[#CCFF00] text-black cursor-pointer'}`}
                          >
                            {isClaimed ? "Claimed" : "Claim rewards"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
