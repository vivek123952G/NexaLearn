import React, { useState, useEffect, useRef } from "react";
import { 
  Trophy, Flame, Coins, Zap, Sparkles, BookOpen, User, 
  Trash2, Plus, CheckCircle, ChevronRight, Play, Award, 
  Timer, Calendar, BarChart2, ShieldAlert, Sparkle, Download, 
  ThumbsUp, Share2, Upload, ShoppingBag, Gift, Ticket, RefreshCw 
} from "lucide-react";
import { UserProfile } from "../types";
import { WeeklyTask, getRandomWeeklyTasks, generateTasksForWeekSeed, TASK_POOL } from "../models/WeeklyTaskModel";

// ==========================================
// 1. INTERACTIVE AUTONOMOUS WEEKLY PLANNER (Separate Model Integration)
// ==========================================
interface WeeklyPlannerProps {
  profile: UserProfile;
  onGrantRewards: (xp: number, coins: number) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
}

export const AutonomousWeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ 
  profile, 
  onGrantRewards, 
  onAddNotification 
}) => {
  const [tasks, setTasks] = useState<WeeklyTask[]>(() => {
    const saved = localStorage.getItem(`nexa_weekly_planner_${profile.username?.toLowerCase() || ''}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return generateTasksForWeekSeed(Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7)), 5);
  });

  // Load tasks dynamically from Cloud Firestore
  useEffect(() => {
    if (profile.username) {
      import("../lib/firebase").then(({ getSyncTasksFromFirestore }) => {
        getSyncTasksFromFirestore(profile.username).then((remoteTasks) => {
          if (remoteTasks && remoteTasks.length > 0) {
            const mapped: WeeklyTask[] = remoteTasks.map((t: any) => ({
              id: t.id,
              day: t.day || "Monday",
              task: t.task_title || t.task || "Untitled study mission",
              completed: t.is_completed || t.completed || false,
              priority: t.priority || "medium",
              category: t.category || "Mathematics",
              rewardXp: t.rewardXp || 25,
              rewardCoins: t.rewardCoins || 20
            }));
            setTasks(mapped);
          }
        });
      });
    }
  }, [profile.username]);

  const [activeDay, setActiveDay] = useState<string>("All");
  const [taskText, setTaskText] = useState("");
  const [taskDay, setTaskDay] = useState("Monday");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskCategory, setTaskCategory] = useState<"Mathematics" | "Science" | "Tech" | "Language">("Mathematics");

  const [lastRotateTime, setLastRotateTime] = useState<number>(() => {
    const saved = localStorage.getItem(`nexa_weekly_rotate_last_${profile.username?.toLowerCase() || ''}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [cooldownRemainingStr, setCooldownRemainingStr] = useState<string>("");

  useEffect(() => {
    if (!lastRotateTime) {
      setCooldownRemainingStr("");
      return;
    }

    const checkCooldown = () => {
      const elapsed = Date.now() - lastRotateTime;
      const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
      const remaining = cooldownMs - elapsed;

      if (remaining <= 0) {
        setCooldownRemainingStr("");
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setCooldownRemainingStr(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastRotateTime]);

  const saveTasks = (newTasks: WeeklyTask[]) => {
    setTasks(newTasks);
    const suffix = profile.username ? `_${profile.username.toLowerCase()}` : "";
    localStorage.setItem(`nexa_weekly_planner${suffix}`, JSON.stringify(newTasks));

    // Sync individual document attributes securely to Cloud Firestore
    if (profile.username) {
      import("../lib/firebase").then(({ syncTaskToFirestore }) => {
        newTasks.forEach((t) => {
          syncTaskToFirestore(profile.username, t.id, {
            task_title: t.task,
            is_completed: t.completed,
            day: t.day,
            priority: t.priority,
            category: t.category,
            rewardXp: t.rewardXp,
            rewardCoins: t.rewardCoins,
            timestamp: new Date().toISOString()
          });
        });
      });
    }
  };

  const handleRotateWeeklyTasks = () => {
    if (cooldownRemainingStr) {
      onAddNotification("Rotation Cooldown Active", `Please wait ${cooldownRemainingStr} before rotating weekly curriculum models.`, "alert");
      return;
    }
    // Force rotative changes using high variety selection to change tasks completely
    const regenerated = getRandomWeeklyTasks(5);
    saveTasks(regenerated);

    const now = Date.now();
    setLastRotateTime(now);
    localStorage.setItem(`nexa_weekly_rotate_last_${profile.username?.toLowerCase() || ''}`, now.toString());

    onAddNotification("Weekly Agenda Rotated", "Acquired brand new set of rotating tasks from WeeklyTaskModel!", "success");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const newTask: WeeklyTask = {
      id: `task_${Date.now()}`,
      day: taskDay,
      task: taskText.trim(),
      completed: false,
      priority: taskPriority,
      category: taskCategory,
      rewardXp: taskPriority === "high" ? 40 : taskPriority === "medium" ? 25 : 15,
      rewardCoins: taskPriority === "high" ? 30 : taskPriority === "medium" ? 20 : 10
    };

    const updated = [...tasks, newTask];
    saveTasks(updated);
    setTaskText("");
    onAddNotification("Custom Task Scheduled", `Scheduled "${newTask.task}" for ${newTask.day}!`, "success");
  };

  const toggleTask = (id: string) => {
    let checkedTaskAwarded = false;
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextStatus = !t.completed;
        if (nextStatus) {
          checkedTaskAwarded = true;
          // Trigger the beautiful interactive claim modal indirectly by requesting grant rewards.
          onGrantRewards(t.rewardXp, t.rewardCoins);
          onAddNotification("Sync Completed Node", `Completed weekly agenda assignment! Prepared claims for +${t.rewardXp} XP & +${t.rewardCoins} NEXA.`, "success");
        }
        return { ...t, completed: nextStatus };
      }
      return t;
    });
    
    saveTasks(updated);

    // If all tasks are completed, automatically rotate a fresh set of tasks! 
    const isAllDone = updated.length > 0 && updated.every(t => t.completed);
    if (isAllDone && checkedTaskAwarded) {
      onAddNotification(
        "🏆 Weekly Strength Core Calibrated!",
        "Stellar! You completed 100% of your weekly calendar targets. The system is automatically rotating a brand-new set of tasks for you now!",
        "success"
      );
      setTimeout(() => {
        const regenerated = getRandomWeeklyTasks(5);
        saveTasks(regenerated);
        onAddNotification("Fresh Agenda Calibrated", "A new rotating curriculum of study tasks is now active!", "success");
      }, 2500);
    }
  };

  const handleDeleteTask = (id: string, name: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
    onAddNotification("Task Cleared", `Task "${name}" has been cleared from weekly schedule parameters.`, "info");
  };

  const handleAISmartReschedule = () => {
    // Generate randomized task subset from separate model pool
    const extraSample = getRandomWeeklyTasks(2);
    const added: string[] = [];
    const newTasks = [...tasks];

    extraSample.forEach(rec => {
      if (!newTasks.some(t => t.task.toLowerCase() === rec.task.toLowerCase())) {
        newTasks.push(rec);
        added.push(rec.day);
      }
    });

    if (added.length > 0) {
      saveTasks(newTasks);
      onAddNotification("Aura Scheduled Slots", `Aura Smart-AI compiled extra-curricular study vectors from master model for ${added.join(", ")}! Check pending lists.`, "success");
    } else {
      onAddNotification("Curriculum Synced", "All smart-curriculum recommendations are already active in your planner slots.", "info");
    }
  };

  const daysList = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const filteredTasks = activeDay === "All" ? tasks : tasks.filter(t => t.day === activeDay);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;


  return (
    <div id="weekly_planner_module" className="space-y-6">
      {/* Overview Tracker */}
      <div className="neo-glass rounded-3xl p-6 border-white/5 bg-gradient-to-br from-white/2 to-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-400/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h4 className="text-lg font-black text-white">Nexa Intelligent Study Planner</h4>
            </div>
            <p className="text-xs text-gray-400 mt-1">Plan, toggle and claim real-time rewards as nodes are solved.</p>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleRotateWeeklyTasks}
              disabled={!!cooldownRemainingStr}
              className={`flex items-center gap-1.5 py-2 px-3 font-bold text-xs rounded-xl border transition-all font-mono ${cooldownRemainingStr ? 'bg-gray-500/10 text-gray-400 border-gray-500/10 cursor-not-allowed opacity-70' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20 cursor-pointer'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cooldownRemainingStr ? '' : 'animate-[spin_10s_linear_infinite]'}`} />
              {cooldownRemainingStr ? `ROTATE COOLDOWN: ${cooldownRemainingStr}` : 'ROTATE WEEKLY MODEL'}
            </button>
          </div>
        </div>

        {/* Progress Gauge */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-gray-400 uppercase tracking-wider block">Weekly Sync Calibration</span>
            <span className="text-[#CCFF00] font-black">{percentage}% Completed ({completedCount}/{totalCount})</span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              style={{ width: `${percentage}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 to-[#CCFF00] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(204,255,0,0.3)]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Days filters & list */}
        <div className="lg:col-span-8 space-y-4">
          {/* Day Selection Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {daysList.map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeDay === day ? 'bg-[#CCFF00] text-black shadow-[0_4px_12px_rgba(204,255,0,0.3)]' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Core Tasks Panel */}
          <div className="neo-glass rounded-3xl p-5 border-white/5 space-y-3.5 min-h-[250px]">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-10 h-10 bg-white/5 text-gray-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-400">Empty calendar nodes. No lectures or tasks scheduled.</p>
                <p className="text-[10px] text-gray-500 uppercase font-mono">Use scheduler engine below to compile slots</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all ${task.completed ? 'bg-black/40 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:border-cyan-400/30'}`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all mt-0.5 cursor-pointer ${task.completed ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'border-white/20 text-transparent hover:border-cyan-400'}`}
                    >
                      ✓
                    </button>
                    <div>
                      <span className={`text-xs block leading-relaxed ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {task.task}
                      </span>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-[9px] uppercase font-mono bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded-md font-bold">
                          {task.day}
                        </span>
                        <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-md font-bold ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-400' : task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-500/10 text-gray-400'}`}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id, task.task)}
                    className="p-2 text-gray-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer border-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task registration form */}
        <div className="lg:col-span-4 rounded-3xl neo-glass p-5 border-white/5 h-fit space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Plus className="w-4 h-4 text-[#CCFF00]" />
            <h5 className="text-sm font-bold text-white uppercase tracking-tight">Schedule Study Node</h5>
          </div>

          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-mono pl-1 block mb-1">Lecture Topic / Goal</label>
              <textarea
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Enter lecture name, problem domain or study task..."
                className="w-full text-xs text-white bg-black/40 focus:bg-black/60 p-3 rounded-xl border border-white/10 focus:border-[#CCFF00] focus:outline-none resize-none h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono pl-1 block mb-1">Calendar Day</label>
                <select
                  value={taskDay}
                  onChange={(e) => setTaskDay(e.target.value)}
                  className="w-full bg-black/40 text-xs text-white py-2 px-3 rounded-xl border border-white/10 cursor-pointer focus:border-[#CCFF00] focus:outline-none"
                >
                  {daysList.filter(d => d !== "All").map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono pl-1 block mb-1">Core Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full bg-black/40 text-xs text-white py-2 px-3 rounded-xl border border-white/10 cursor-pointer focus:border-[#CCFF00] focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#CCFF00] hover:bg-[#b0db00] text-black font-black text-xs rounded-xl cursor-pointer border-none uppercase transition-all"
            >
              Compile Planner Slot
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 2. CYBER TOURNAMENTS & CHALLENGES (With 2-3 Day rotation)
// ==========================================
interface TournamentChallenge {
  id: string;
  name: string;
  desc: string;
  category: "Mathematics" | "Physics" | "Chemistry" | "Informatics";
  rewardCoins: number;
  rewardXp: number;
  timeLimit?: string;
  participants: number;
  question: string;
  options: string[];
  correctIdx: number;
  hint: string;
  solved?: boolean;
}

interface TournamentLobbyProps {
  profile: UserProfile;
  onGrantRewards: (xp: number, coins: number) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
  onNavigate: (page: string) => void;
}

export const TournamentLobbyComponent: React.FC<TournamentLobbyProps> = ({
  profile,
  onGrantRewards,
  onAddNotification,
  onNavigate
}) => {
  // Store the timestamp when tournaments were generated.
  // We want to force automatic generation if more than 2-3 days pass, 
  // and show a countdown live timer!
  const [generationTime, setGenerationTime] = useState<number>(() => {
    const saved = localStorage.getItem("nexa_tournament_time");
    if (saved) return parseInt(saved, 10);
    const now = Date.now();
    localStorage.setItem("nexa_tournament_time", now.toString());
    return now;
  });

  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [checkedAnswer, setCheckedAnswer] = useState(false);
  const [answerSuccess, setAnswerSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Simulated tournament standings list
  const [competitors, setCompetitors] = useState(() => [
    { name: "Node_Symmetry_9", score: 850, active: true, country: "🇮🇳" },
    { name: "Euler_Mesh_01", score: 720, active: true, country: "🇩🇪" },
    { name: "Quant_Striker_z", score: 680, active: false, country: "🇸🇬" },
    { name: "VectorBuster", score: 550, active: true, country: "🇺🇸" },
    { name: "Bhushan_Node_🚀", score: profile.xp, active: true, country: "🚀" } // dynamic player rank!
  ]);

  const [challenges, setChallenges] = useState<TournamentChallenge[]>(() => {
    const saved = localStorage.getItem("nexa_tournament_challenges");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return getModernTournamentChallenges();
  });

  // Calculate rotation clock. Tournament cycle is 2-3 days. Let's make it 2.5 Days = 60 Hours.
  const CYCLE_MS = 60 * 60 * 1000 * 2.5; // 60 Hours
  const [timeLeftStr, setTimeLeftStr] = useState("Loading clock...");

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - generationTime;
      const remaining = CYCLE_MS - elapsed;

      if (remaining <= 0) {
        // ROTATION TIME ACCESSED! Automatic change is triggered!
        const nextTime = Date.now();
        setGenerationTime(nextTime);
        localStorage.setItem("nexa_tournament_time", nextTime.toString());
        
        const fresh = getModernTournamentChallenges();
        setChallenges(fresh);
        localStorage.setItem("nexa_tournament_challenges", JSON.stringify(fresh));
        
        onAddNotification("Challenges Rotated!", "Tournament rotation timer expired! 3 brand new challenges have been synthesized.", "alert");
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [generationTime]);

  function getModernTournamentChallenges(): TournamentChallenge[] {
    const sets = [
      [
        {
          id: "t_ch_1",
          name: "The Quantum Kinetic Limit",
          desc: "Calculate final thermodynamic vectors inside closed isobaric systems under friction multipliers.",
          category: "Physics" as const,
          rewardCoins: 400,
          rewardXp: 300,
          participants: 842,
          question: "Under isobaric coordinates, a gas cell expands by 40 liters under exactly 2 atm constant pressure. Solve system work conversion in Joules.",
          options: ["8,104 Joules", "1,248 Joules", "3,420 Joules", "6,000 Joules"],
          correctIdx: 0,
          hint: "Work under constant pressure is W = P * delta(V). Note that 1 L*atm is approximately equal to 101.325 Joules."
        },
        {
          id: "t_ch_2",
          name: "Olympiad Modular Symmetry",
          desc: "A modular division of power coefficients. Determine structural residue bounds under prime factors.",
          category: "Mathematics" as const,
          rewardCoins: 500,
          rewardXp: 350,
          participants: 1250,
          question: "Find the structural modular evaluation of residue: 3^401 mod 17.",
          options: ["Residue 1", "Residue 3", "Residue 9", "Residue 12"],
          correctIdx: 1,
          hint: "Apply Fermat's Little Theorem. 3^16 congruent to 1 mod 17. Expand to nearest divisible power."
        },
        {
          id: "t_ch_3",
          name: "Carbon Resonance Resonance Matrix",
          desc: "Calculate dynamic hybridization pathways for aromatic hydrocarbons inside microwave reactors.",
          category: "Chemistry" as const,
          rewardCoins: 450,
          rewardXp: 250,
          participants: 618,
          question: "Which hydrocarbon structure exhibits a theoretical planar geometry with zero dipole moments under carbon configurations?",
          options: ["Trans-1,2-dichloroethene", "Methane coordinates", "Water covalent molecules", "Cis-butadiene"],
          correctIdx: 0,
          hint: "Evaluate symmetrical structural groups whose vector additions cancel out dipole orientations entirely."
        }
      ],
      [
        {
          id: "t_ch_1",
          name: "Euler Graph Connectivity Nodes",
          desc: "Determine if standard decentralized node structures possess Hamiltonian coordinates or bypass paths.",
          category: "Informatics" as const,
          rewardCoins: 400,
          rewardXp: 300,
          participants: 914,
          question: "For a complete planar graph with 8 vertices and 12 logical edges, solve the quantity of bounded faces using Euler Formula.",
          options: ["6 Bounded Faces", "4 Bounded Faces", "8 Bounded Faces", "10 Bounded Faces"],
          correctIdx: 0,
          hint: "Use Euler's Formula for planar graphs: V - E + F = 2. Solve for Face elements."
        },
        {
          id: "t_ch_2",
          name: "Raman Scattering Wave Vectors",
          desc: "Resolve standard vibrational offsets inside carbon nanofilm grids when triggered by laser beams.",
          category: "Physics" as const,
          rewardCoins: 500,
          rewardXp: 350,
          participants: 780,
          question: "When photon levels shift under inelastic scattering pathways to a longer wavelength, the observed radiation line carries which signature?",
          options: ["Stokes Line", "Anti-Stokes Array", "Rayleigh Resonance", "Prism Refraction"],
          correctIdx: 0,
          hint: "Scattering to lower frequency (longer wavelength) shifts energy to the atom, yielding high-fringe Stokes Lines."
        },
        {
          id: "t_ch_3",
          name: "Matrix Logarithm Formulations",
          desc: "Map coordinate determinants when linear exponential matrices are multiplied.",
          category: "Mathematics" as const,
          rewardCoins: 600,
          rewardXp: 400,
          participants: 1391,
          question: "For an upper triangular 2x2 matrix with unit values on diagonal lines, what is the value of its trace of exponential matrix squaring?",
          options: ["Trace output = 2", "Trace output = 4", "Trace output = 8", "Trace output = 0"],
          correctIdx: 0,
          hint: "The eigenvalues of logarithmic transitions remain unchanged, meaning trace results aggregate the units on the main grid."
        }
      ]
    ];

    // Pick set dynamically based on generation time stamp to achieve actual rotation variation
    const index = Math.floor(generationTime / 5000) % sets.length;
    return sets[index];
  }

  const handleForceRotate = () => {
    const nextTime = Date.now();
    setGenerationTime(nextTime);
    localStorage.setItem("nexa_tournament_time", nextTime.toString());
    
    // Pick alternative challenges
    const fresh = getModernTournamentChallenges();
    // make sure they are randomized slightly
    fresh.forEach(c => {
      c.participants += Math.floor(Math.random() * 100);
    });

    setChallenges(fresh);
    localStorage.setItem("nexa_tournament_challenges", JSON.stringify(fresh));
    
    onAddNotification("Dev Cycle Rotation", "Simulating tournament challenge rotate! 3 new challenges generated successfully.", "success");
  };

  const handleOpenChallenge = (ch: TournamentChallenge) => {
    if (ch.solved) {
      onAddNotification("Already Checked", "You have already claimed victory for this competition block!", "info");
      return;
    }
    setActiveChallengeId(ch.id);
    setSelectedIdx(null);
    setCheckedAnswer(false);
    setAnswerSuccess(false);
    setShowHint(false);
  };

  const handleSubmitSolve = () => {
    if (selectedIdx === null) return;
    
    const activeCh = challenges.find(c => c.id === activeChallengeId);
    if (!activeCh) return;

    setCheckedAnswer(true);
    if (selectedIdx === activeCh.correctIdx) {
      setAnswerSuccess(true);
      
      const isVip = profile.premiumTier && profile.premiumTier !== "FREE";
      const finalXp = isVip ? activeCh.rewardXp * 2 : activeCh.rewardXp;
      const finalCoins = isVip ? activeCh.rewardCoins * 2 : activeCh.rewardCoins;

      // Update standing score
      setCompetitors(prev => prev.map(c => {
        if (c.name.includes("Bhushan")) {
          return { ...c, score: c.score + finalXp };
        }
        return c;
      }));

      // Grant rewards
      onGrantRewards(finalXp, finalCoins);
      onAddNotification("Tournament Point Decoded", `Correct Answer! ${isVip ? "👑 VIP 2.0x Boost calibrated! " : ""}+${finalXp} XP & +${finalCoins} Study Coins synchronize safely.`, "success");

      // Mark challenge as solved which persists
      const updatedChallenges = challenges.map(c => {
        if (c.id === activeChallengeId) return { ...c, solved: true };
        return c;
      });
      setChallenges(updatedChallenges);
      localStorage.setItem("nexa_tournament_challenges", JSON.stringify(updatedChallenges));
    } else {
      setAnswerSuccess(false);
      onAddNotification("Validation Error", "Suboptimal vector alignment. Adjust coefficients and recalculate theorem parameters.", "alert");
    }
  };

  const activeChallenge = challenges.find(c => c.id === activeChallengeId);

  return (
    <div className="space-y-6" id="tournament_lobby_component">
      {/* Timer banner info block */}
      <div className="neo-glass rounded-3xl p-6 border-pink-500/10 bg-gradient-to-r from-pink-950/20 to-purple-950/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            <span className="text-[10px] uppercase font-mono text-rose-400 tracking-widest font-black">OLYMPIAD ACTIVE TOURNAMENT BRACKET</span>
          </div>
          <h3 className="text-xl font-black text-white">NEXA STUDY RIVALRY CONTESTS</h3>
          <p className="text-xs text-gray-400">Solve daily computational hurdles. Challenges rotate automatically every 2-3 days.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Dynamic timer box */}
          <div className="bg-black/50 border border-white/10 rounded-2xl py-2 px-4 flex items-center gap-3 font-mono">
            <Timer className="w-4 h-4 text-rose-500 animate-[spin_4s_linear_infinite]" />
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-mono">CYCLE EXPIRES IN</span>
              <span className="text-rose-400 font-bold text-xs">{timeLeftStr}</span>
            </div>
          </div>
          {/* Developer cycle rotate to satisfy the user criteria */}
          <button
            onClick={handleForceRotate}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-rose-400 font-bold font-mono text-[10px] uppercase py-2 px-3 border border-pink-500/20 rounded-xl cursor-pointer transition-all"
            title="Force rotation transition and regenerate active challenge cards immediately"
          >
            <RefreshCw className="w-3.5 h-3.5 hover:rotate-45 transition-all" />
            FORCE ROTATE CYCLE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Challenge list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pl-1 gap-2 border-b border-white/5 pb-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Available Olympiads Lobbies Schedulers</h4>
            {profile.premiumTier && profile.premiumTier !== "FREE" ? (
              <span className="text-[10px] font-mono font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 flex items-center gap-1.5 rounded-full select-none animate-pulse">
                👑 VIP 2.0x BOOST PERMANENTLY CALIBRATED!
              </span>
            ) : (
              <button 
                onClick={() => onNavigate("membership")}
                className="text-[10px] font-mono font-bold text-gray-400 hover:text-yellow-400 bg-white/2 hover:bg-white/5 border border-white/5 px-3 py-1 rounded-full cursor-pointer transition-all uppercase border-none"
              >
                ✨ UNLOCK 2.0x WITH VIP PASS
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {challenges.map(ch => {
              const isVip = profile.premiumTier && profile.premiumTier !== "FREE";
              const displayCoins = isVip ? ch.rewardCoins * 2 : ch.rewardCoins;
              const displayXp = isVip ? ch.rewardXp * 2 : ch.rewardXp;

              return (
                <div 
                  key={ch.id} 
                  className={`neo-glass rounded-3xl p-5 border transition-all ${ch.solved ? 'border-[#CCFF00]/20 bg-[#CCFF00]/2 shadow-sm' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-mono font-black uppercase text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md">
                          {ch.category}
                        </span>
                        <span className="text-[10px] opacity-60 text-gray-400 font-mono flex items-center gap-1">
                          👥 {ch.participants} Nodes Joined
                        </span>
                      </div>
                      <h5 className="text-base font-bold text-white mt-1.5">{ch.name}</h5>
                      <p className="text-xs text-gray-400 max-w-lg leading-relaxed">{ch.desc}</p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                      <div className="flex gap-2 font-mono text-center">
                        <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1 text-center relative overflow-hidden">
                          {isVip && <span className="absolute -top-1 -right-1 text-[7px] text-yellow-400 font-black animate-pulse">2x</span>}
                          <span className="text-[8px] text-gray-500 uppercase block font-mono">REWARD</span>
                          <span className="text-yellow-400 font-bold text-xs">💎{displayCoins}</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1 text-center relative overflow-hidden">
                          {isVip && <span className="absolute -top-1 -right-1 text-[7px] text-[#CCFF00] font-black animate-pulse">2x</span>}
                          <span className="text-[8px] text-gray-500 uppercase block font-mono">EXPERIENCE</span>
                          <span className="text-[#CCFF00] font-bold text-xs">+{displayXp} XP</span>
                        </div>
                      </div>

                      {ch.solved ? (
                        <span className="text-xs font-mono font-black text-[#CCFF00] flex items-center gap-1.5 uppercase bg-[#CCFF00]/10 px-3.5 py-1.5 rounded-xl border border-[#CCFF00]/20">
                          🏆 VICTORY SYNCED
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenChallenge(ch)}
                          className="py-2.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-black rounded-xl border-none cursor-pointer hover:scale-105 active:scale-95 transition-all w-full sm:w-auto text-center"
                        >
                          DECODE FORMULATION
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global leader standings list sidebar */}
        <div className="lg:col-span-4 rounded-3xl neo-glass p-5 border-white/5 space-y-4 h-fit">
          <div className="flex gap-2 items-center pb-2.5 border-b border-white/5">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h5 className="text-xs uppercase font-mono font-black text-white">Live Segment Standings</h5>
          </div>

          <div className="space-y-2.5">
            {competitors.sort((a,b) => b.score - a.score).map((node, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center p-2.5 rounded-xl text-xs ${node.name.includes("Bhushan") ? "bg-cyan-500/10 border border-cyan-400/20" : "bg-black/30"}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-md font-mono font-bold flex items-center justify-center text-[11px] ${index === 0 ? 'bg-yellow-400 text-black' : index === 1 ? 'bg-gray-300 text-black' : index === 2 ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-white font-bold block">{node.name}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-mono flex items-center gap-1 mt-0.5">
                      {node.country} {node.active ? "● ONLINE" : "■ SLEEP"}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-cyan-400 font-bold">{node.score} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solving micro panel modal for active dynamic challenge */}
      {activeChallengeId && activeChallenge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-zinc-950 border border-white/10 rounded-[35px] max-w-xl w-full p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setActiveChallengeId(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full cursor-pointer transition-all border-none"
            >
              ✕
            </button>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-md font-black">
                {activeChallenge.category} Tournament Challenge
              </span>
              <h4 className="text-xl font-bold text-white mt-1.5">{activeChallenge.name}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-mono">
                Solve the algorithm block parameters correctly to secure validation coin rewards.
              </p>
            </div>

            {/* Problem card */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
              <p className="text-xs text-gray-200 font-medium leading-relaxed">
                {activeChallenge.question}
              </p>
            </div>

            {/* Hint toggler */}
            <div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono uppercase cursor-pointer flex items-center gap-1 border-none bg-transparent"
              >
                💡 {showHint ? "Conceal solver hint parameters" : "Decipher formula guidelines"}
              </button>
              {showHint && (
                <p className="p-3 bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 rounded-xl text-[11px] font-mono mt-2 leading-relaxed">
                  {activeChallenge.hint}
                </p>
              )}
            </div>

            {/* Choices list */}
            <div className="space-y-2.5 text-xs">
              {activeChallenge.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => !checkedAnswer && setSelectedIdx(idx)}
                  className={`w-full py-3.5 px-4 rounded-xl border text-left font-sans cursor-pointer transition-all flex justify-between items-center ${selectedIdx === idx ? 'bg-cyan-500/10 border-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-white/2 border-white/5 text-gray-300 hover:bg-white/5'}`}
                  disabled={checkedAnswer}
                >
                  <span>{opt}</span>
                  {selectedIdx === idx && <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Verification Response messages */}
            {checkedAnswer && (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-mono ${answerSuccess ? 'bg-[#CCFF00]/10 border-[#CCFF00]/20 text-[#CCFF00]' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {answerSuccess ? (
                  <p>✓ THEOREM CALIBRATION ACCEPTED! Bounded vectors compiled properly. Total XP +{activeChallenge.rewardXp} and NEXA Coins +{activeChallenge.rewardCoins} applied.</p>
                ) : (
                  <p>✗ HARMONIC VECTOR COLLIDED! Suboptimal coordinates detected. Recompute thermodynamic or modular variables and verify values again.</p>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-3 border-t border-white/5 justify-end">
              <button
                onClick={() => setActiveChallengeId(null)}
                className="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-xl font-bold font-mono cursor-pointer transition-all border-none"
              >
                ABANDON CODES
              </button>
              
              {!checkedAnswer ? (
                <button
                  onClick={handleSubmitSolve}
                  disabled={selectedIdx === null}
                  className="py-2.5 px-6 bg-[#CCFF00] disabled:opacity-40 text-black text-xs font-black rounded-xl cursor-pointer hover:scale-105 active:scale-95 border-none transition-all uppercase"
                >
                  VALIDATE CALIBRATION
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (answerSuccess) {
                      setActiveChallengeId(null);
                    } else {
                      setCheckedAnswer(false);
                      setSelectedIdx(null);
                    }
                  }}
                  className="py-2.5 px-6 bg-[#CCFF00] text-black text-xs font-black rounded-xl cursor-pointer border-none transition-all uppercase"
                >
                  {answerSuccess ? "CONTINUE LOBBY" : "REATTEMPT CALIBRATOR"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 3. COIN SHOP & TOKEN SHOP RECOORDINATE
// ==========================================
interface StoreProduct {
  id: string;
  name: string;
  price: number;
  type: "cosmetic" | "booster" | "pdf";
  desc: string;
  icon: any;
  purchased?: boolean;
}

interface CoinShopProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
}

export const CoinShopComponent: React.FC<CoinShopProps> = ({
  profile,
  onSaveProfile,
  onAddNotification
}) => {
  const [coupon, setCoupon] = useState("");
  const [couponLog, setCouponLog] = useState<string[]>([]);
  const [scratchNum, setScratchNum] = useState<number | null>(null);
  const [scratching, setScratching] = useState(false);
  const [scratchCount, setScratchCount] = useState<number>(() => {
    const savedDate = localStorage.getItem("nexa_scratch_date");
    const count = localStorage.getItem("nexa_scratch_count");
    const today = new Date().toDateString();
    if (savedDate === today) {
      return count ? parseInt(count, 10) : 0;
    }
    return 0;
  });
  const [activePdfViewer, setActivePdfViewer] = useState<StoreProduct | null>(null);

  // Synchronized store products
  const [products, setProducts] = useState<StoreProduct[]>([
    { id: "skin_hologram", name: "Holographic Cyber Avatar Border", price: 500, type: "cosmetic", desc: "Equip a glowing neon ring around your node avatar inside the duels arena.", icon: Sparkle },
    { id: "boost_2x", name: "Double XP Catalyst Overdrive (24 hours)", price: 1000, type: "booster", desc: "Gain 200% standard learning experience multiplier for all scan formulations.", icon: Zap },
    { id: "pdf_calculus", name: "Calculus Formula Masters Deck PDF", price: 300, type: "pdf", desc: "Download the complete premium interactive math cheatsheet directly into vault.", icon: BookOpen },
    { id: "pdf_organic", name: "Organic Chemistry Synthesis Chart", price: 250, type: "pdf", desc: "Fully high contrast structural models mapping common aldehydes reactions.", icon: Download },
    { id: "skin_retro", name: "90s Terminal Retro Style Border Color", price: 400, type: "cosmetic", desc: "Classic pixelated green amber scan frame detailing for rankings list.", icon: User }
  ]);

  const handleBuyProduct = (product: StoreProduct) => {
    // Check if player has already unlocked the item
    const isUnlocked = profile.cosmetics.includes(product.id) || (product.type === 'pdf' && false);
    if (isUnlocked) {
      onAddNotification("Already Owned", `"${product.name}" has already been synthesized in your profile.`, "info");
      return;
    }

    if (profile.coins < product.price) {
      onAddNotification("Currency Shortage", `Suboptimal Gold coins. Solve question bank arrays to secure +${product.price - profile.coins} NEXA.`, "alert");
      alert(`sorry ! No nexa to buy this. You need ${product.price} NEXA but currently hold ${profile.coins} NEXA.`);
      return;
    }

    const updatedCoins = profile.coins - product.price;
    // Add cosmetic items to cosmetics list
    const updatedCosmetics = [...profile.cosmetics];
    if (product.type === "cosmetic" && !updatedCosmetics.includes(product.id)) {
      updatedCosmetics.push(product.id);
    }

    onSaveProfile({
      ...profile,
      coins: updatedCoins,
      cosmetics: updatedCosmetics
    });

    onAddNotification("Purchase Confirmed Successfully!", `Successfully redeemed "${product.name}"! Spent ${product.price} NEXA.`, "success");
    alert(`Success! Successfully purchased "${product.name}". Spent ${product.price} NEXA.`);

    // If it's a PDF, launch the premium PDF download & verification confirmation view!
    if (product.type === "pdf") {
      setActivePdfViewer(product);
    }
  };

  const redeemCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon.trim()) return;

    const code = coupon.trim().toUpperCase();
    if (couponLog.includes(code)) {
      onAddNotification("Code Exhausted", "This voucher index has already been redeemed on this session parameters.", "alert");
      return;
    }

    let value = 0;
    if (code === "NEXA_LOVER") {
      value = 350;
    } else if (code === "BUILD_OP_NODE") {
      value = 500;
    } else if (code === "WHITEBOARD_STRIKER") {
      value = 250;
    } else {
      onAddNotification("Decryption Failed", "Voucher signatures do not coordinate with active store registers. Query error.", "alert");
      return;
    }

    const updatedCoins = profile.coins + value;
    onSaveProfile({
      ...profile,
      coins: updatedCoins
    });

    setCouponLog([...couponLog, code]);
    onAddNotification("Voucher Decoded", `Applied voucher "${code}"! Added +${value} Study Coins instantly to registry.`, "success");
    setCoupon("");
  };

  const handleTriggerScratch = () => {
    if (scratching) return;

    const todayStr = new Date().toDateString();
    const savedDate = localStorage.getItem("nexa_scratch_date");
    let currentDayCount = 0;
    if (savedDate === todayStr) {
      const savedCount = localStorage.getItem("nexa_scratch_count");
      currentDayCount = savedCount ? parseInt(savedCount, 10) : 0;
    }

    if (currentDayCount >= 2) {
      onAddNotification("🔒 Daily Limit Reached", "You are allowed only 2 Daily Multiplier Capsule scratches per day!", "alert");
      alert("🔒 Daily Limit Reached: You are only allowed 2 Daily Multiplier Capsule scratches per day. Please return tomorrow!");
      return;
    }

    setScratching(true);
    setScratchNum(null);

    setTimeout(() => {
      const generated = Math.floor(Math.random() * 8) + 1; // 1 to 8 multiplier
      const luckyCoins = generated * 50;
      setScratchNum(luckyCoins);
      setScratching(false);

      const updatedCoins = profile.coins + luckyCoins;
      onSaveProfile({
        ...profile,
        coins: updatedCoins
      });

      const nextCount = currentDayCount + 1;
      setScratchCount(nextCount);
      localStorage.setItem("nexa_scratch_date", todayStr);
      localStorage.setItem("nexa_scratch_count", nextCount.toString());

      onAddNotification("Multiplier Scratch Win!", `Scratch capsule revealed! Deposited +${luckyCoins} NEXA coins! (${nextCount}/2 scratches filled today)`, "success");
    }, 1200);
  };

  return (
    <div id="coin_shop_component" className="space-y-6">
      {/* Top Banner */}
      <div className="neo-glass rounded-3xl p-6 border-yellow-500/15 bg-gradient-to-br from-yellow-950/20 to-black/35 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-yellow-400/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-yellow-500" />
              <h4 className="text-lg font-black text-white">Nexa Study Currency Store</h4>
            </div>
            <p className="text-xs text-gray-400">Redeem study coins earned in live sandboxes to purchase avatar borders, templates and PDF guides.</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-2.5 px-5 rounded-2xl flex items-center gap-2 shadow-lg shadow-yellow-500/10">
            <Coins className="w-5 h-5" />
            <div className="font-mono">
              <span className="text-[9px] uppercase tracking-wider block font-bold text-black/60">CREDENTIALS BALANCE</span>
              <span className="text-base font-black">{profile.coins.toLocaleString()} NEXA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Merchandise catalogs */}
        <div className="lg:col-span-8 space-y-4">
          <h5 className="text-xs font-mono font-black uppercase text-gray-400 pl-1 tracking-wider">Premium Study Commodities</h5>

          <div className="space-y-4">
            {products.map(p => {
              const hasSkin = profile.cosmetics.includes(p.id);
              const ProductIcon = p.icon;
              return (
                <div 
                  key={p.id} 
                  className={`neo-glass rounded-3xl p-4 sm:p-5 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${hasSkin ? 'border-[#CCFF00]/10 bg-white/1' : 'border-white/5 hover:bg-white/2'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center text-yellow-500 border border-white/5 mt-0.5">
                      <ProductIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono uppercase font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-md">
                        {p.type}
                      </span>
                      <h6 className="text-[14px] font-bold text-white mt-1.5">{p.name}</h6>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-md">{p.desc}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-none border-white/5">
                    <div className="font-mono text-right">
                      <span className="text-[9px] text-gray-500 uppercase block font-mono">SYNTHESIS COST</span>
                      <span className="text-yellow-400 font-bold text-sm">💎 {p.price} NEXA</span>
                    </div>

                    {hasSkin ? (
                      <span className="text-[10px] font-mono font-black text-[#CCFF00] bg-[#CCFF00]/10 px-3.5 py-1.5 rounded-xl border border-[#CCFF00]/20 flex items-center gap-1">
                        ✓ INSTALLED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyProduct(p)}
                        className="py-2 px-4 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl border-none cursor-pointer transition-all uppercase"
                      >
                        PURCHASE SKIN
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar refills */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon redeem block */}
          <div className="rounded-3xl neo-glass p-5 border-white/5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Gift className="w-4 h-4 text-cyan-400" />
              <h6 className="text-xs uppercase font-mono font-black text-white">Redeem Gift Vouchers</h6>
            </div>
            
            <p className="text-xs text-gray-400">Unlock complimentary Nexa coin payloads by compiling unique cipher identifiers.</p>

            <form onSubmit={redeemCoupon} className="space-y-3">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="PROMO CODE: (e.g. NEXA_LOVER)"
                className="w-full text-xs text-white uppercase font-mono bg-black/40 p-3 rounded-xl border border-white/10 focus:border-yellow-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs rounded-xl cursor-pointer border-none uppercase transition-all"
              >
                COMPILE STUDY CODE
              </button>
            </form>

            <div className="text-[10px] text-gray-500 font-mono space-y-1.5 pl-1">
              <span>ACTIVE KEYS FOR USER:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["NEXA_LOVER", "BUILD_OP_NODE", "WHITEBOARD_STRIKER"].map(k => (
                  <span 
                    key={k} 
                    className={`px-2 py-0.5 rounded-md border ${couponLog.includes(k) ? 'border-white/5 text-gray-600 bg-white/2' : 'border-[#CCFF00]/10 text-[#CCFF00] bg-[#CCFF00]/2'}`}
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Lucky capsule scratch card */}
          <div className="rounded-3xl neo-glass p-5 border-white/5 space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Ticket className="w-5 h-5 text-yellow-500" />
              <h6 className="text-xs uppercase font-mono font-black text-white">Daily Multiplier Capsule</h6>
            </div>

            <p className="text-xs text-gray-400">Solder components to scratch and reveal standard rewards multiplier arrays up to 400 NEXA coins!</p>

            <div className="border border-white/10 p-5 rounded-2xl bg-black/40 text-center space-y-4 relative">
              <div className="text-[10px] uppercase font-mono font-black text-gray-400 bg-white/5 py-1 px-3.5 rounded-full inline-block border border-white/5">
                📅 Daily Scratch Limit: <span className={scratchCount >= 2 ? "text-red-400 font-bold" : "text-[#CCFF00] font-bold"}>{scratchCount}/2 Used</span>
              </div>

              {scratchNum ? (
                <div className="space-y-2 animate-bounce">
                  <span className="text-[9px] uppercase font-mono text-cyan-400 block font-bold">REVEALED VALUE</span>
                  <span className="text-2xl font-black text-yellow-400 font-mono">💎 +{scratchNum} COINS</span>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-mono">Credited safely. Scratch limit: {scratchCount}/2 filled.</p>
                  {scratchCount < 2 && (
                    <button
                      onClick={() => setScratchNum(null)}
                      className="mt-2 py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-mono border border-white/10 cursor-pointer uppercase transition-all"
                    >
                      🔄 Scratch Another
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-2.5">
                  <span className="text-xs text-gray-300 block font-bold mb-3">
                    {scratchCount >= 2 ? "🔒 ALL DAILY SLOTS COMPLETED" : "CYBER CAPSULE NOT SOLVER"}
                  </span>
                  <button
                    onClick={handleTriggerScratch}
                    disabled={scratching || scratchCount >= 2}
                    className={`py-2.5 px-6 transition-all border-none font-black text-xs uppercase rounded-xl ${scratchCount >= 2 ? 'bg-red-500/20 text-red-400/70 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-400 to-[#CCFF00] hover:scale-105 cursor-pointer text-black'}`}
                  >
                    {scratching ? "SCRATCHING CODES..." : scratchCount >= 2 ? "🔒 LIMIT REACHED" : "MINT COIN ENTRUP"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE PDF VIEWER AND SECURED CERTIFICATE OVERLAY */}
      {activePdfViewer && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0b0f19] p-6 sm:p-8 rounded-[35px] border-2 border-[#CCFF00]/30 text-center animate-fade-in text-white shadow-[0_0_50px_rgba(204,255,0,0.15)] max-h-[90vh] overflow-y-auto pr-3 scrollbar-thin">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono text-[#CCFF00] tracking-widest uppercase font-black bg-[#CCFF00]/10 px-3.5 py-1.5 rounded-full">
                📄 SECURE PDF FORMULA DECK DETAILED
              </span>
              <button 
                onClick={() => setActivePdfViewer(null)}
                className="py-1 px-2.5 bg-red-600/10 border border-red-500/20 text-red-200 rounded-lg text-xs hover:bg-red-600/20 font-mono focus:outline-none cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            <div className="w-16 h-16 bg-gradient-to-tr from-[#CCFF00] to-cyan-400 text-black rounded-2xl flex items-center justify-center shadow-lg shadow-[#CCFF00]/10 mx-auto mb-4 font-sans">
              <span className="text-3.5xl font-black">📄</span>
            </div>

            <h4 className="text-xl font-bold text-white uppercase tracking-tight">{activePdfViewer.name}</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">{activePdfViewer.desc}</p>

            {/* Simulated Verified Digital Certificate watermark signature block */}
            <div className="bg-black/45 border border-white/5 p-4 rounded-2xl text-left my-5 font-mono text-xs text-slate-400 space-y-1.5 leading-normal">
              <div className="flex justify-between border-b border-white/5 pb-2 text-white font-extrabold uppercase">
                <span>Verification Keys</span>
                <span className="text-[#CCFF00]">✓ AUTHENTICATED</span>
              </div>
              <div><span className="text-gray-500">Document Hash:</span> <span className="text-[#CCFF00]">SHA-256/f7b9c1d0...</span></div>
              <div><span className="text-gray-500">Security Signature:</span> NXA-SECURE-VAULT</div>
              <div><span className="text-gray-500">Account Bound To:</span> {profile.username ? `@${profile.username}` : "Anonymous Gamer"}</div>
            </div>

            {/* Interactive Formula Cheat Table mockup content */}
            <div className="bg-gray-950 border border-white/10 rounded-2xl text-left p-4.5 space-y-3.5">
              <span className="text-[10px] uppercase font-mono font-black text-cyan-400 tracking-wider">Interactive Content Preview (Unlocked Content)</span>
              
              {activePdfViewer.id === "pdf_calculus" ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-white/5 py-1 text-gray-300">
                    <span>Power Rule</span>
                    <span className="text-[#CCFF00]">d/dx(x^n) = n*x^(n-1)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1 text-gray-300">
                    <span>Product Rule</span>
                    <span className="text-[#CCFF00]">(u*v)' = u'*v + u*v'</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1 text-gray-300">
                    <span>Integration Constant</span>
                    <span className="text-[#CCFF00]">∫ f(x)dx = F(x) + C</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-300">
                    <span>Euler Identifier</span>
                    <span className="text-[#CCFF00]">e^(i*π) + 1 = 0</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-white/5 py-1 text-gray-300">
                    <span>Aldehyde Attack</span>
                    <span className="text-[#CCFF00]">R-CHO + Nu- ➜ R-CH(OH)-Nu</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1 text-gray-300">
                    <span>Benzene Ring</span>
                    <span className="text-[#CCFF00]">C6H6 (Symmetric 120° bonds)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1 text-gray-300">
                    <span>Esterification</span>
                    <span className="text-[#CCFF00]">Acid + Alcohol ➜ Ester + H2O</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-300">
                    <span>SN2 Kinetics</span>
                    <span className="text-[#CCFF00]">Rate = k*[Substrate]*[Nu]</span>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated PDF print/save document handlers */}
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => alert("💾 Offline Save Successful! PDF downloaded into device memory vault.")}
                className="flex-1 py-3 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
              >
                💾 Device Download
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer border border-white/10"
              >
                🖨️ Local Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 4. CREATOR STUDIO MODULE (Study Resources Compiler)
// ==========================================
interface CreatorResource {
  id: string;
  title: string;
  type: "quizzes" | "flashcards" | "diagrams";
  downloads: number;
  likes: number;
  rating: number;
  date: string;
}

interface CreatorStudioProps {
  profile: UserProfile;
  onGrantRewards: (xp: number, coins: number) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
}

export const CreatorStudioComponent: React.FC<CreatorStudioProps> = ({
  profile,
  onGrantRewards,
  onAddNotification
}) => {
  const [resources, setResources] = useState<CreatorResource[]>([
    { id: "res_1", title: "Olympiad Limit Rules Trigonometric Cheatsheet", type: "diagrams", downloads: 247, likes: 39, rating: 4.9, date: "May 20, 2026" },
    { id: "res_2", title: "Organic Carbon Aldehydes Reactions Masterlist", type: "flashcards", downloads: 180, likes: 25, rating: 4.8, date: "May 19, 2026" }
  ]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"quizzes" | "flashcards" | "diagrams">("quizzes");
  const [submitting, setSubmitting] = useState(false);
  const [pdfName, setPdfName] = useState("");

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);

    setTimeout(() => {
      const newRes: CreatorResource = {
        id: `res_${Date.now()}`,
        title: pdfName ? `${title.trim()} [📄 ${pdfName}]` : title.trim(),
        type: type,
        downloads: 0,
        likes: 0,
        rating: 5.0,
        date: "Just now"
      };

      setResources([newRes, ...resources]);
      setTitle("");
      setPdfName("");
      setSubmitting(false);

      // Award creator bonus!
      onGrantRewards(100, 50);
      onAddNotification("Resource Published!", `Successfully synthesized study asset "${newRes.title}" onto decentralize database! Added +100 XP & +50 NEXA.`, "success");
    }, 1200);
  };

  const simulateDownload = (id: string, name: string) => {
    setResources(prev => prev.map(r => {
      if (r.id === id) {
        // Trigger small micro credentials rewards
        onGrantRewards(20, 10);
        onAddNotification("Creator Fee Dispatched", `A node downloaded "${name}"! Dispatched dynamic +20 XP & +10 NEXA royalties coin.`, "success");
        return { ...r, downloads: r.downloads + 1, likes: r.likes + 1 };
      }
      return r;
    }));
  };

  return (
    <div id="creator_studio_page" className="space-y-6">
      <div className="neo-glass rounded-3xl p-6 border-indigo-500/15 bg-gradient-to-br from-indigo-950/20 to-black/35 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400 animate-bounce" />
              <h4 className="text-lg font-black text-white">Nexa Study Creator Studio</h4>
            </div>
            <p className="text-xs text-gray-400">Compile formulas sheets, checklists or quizzes deck parameters. Distribute onto community and collect high-volume royalty payloads.</p>
          </div>

          <div className="bg-black/40 border border-white/5 py-2 px-4 rounded-2xl flex items-center gap-3">
            <Award className="w-5 h-5 text-indigo-400 animate-[spin_4s_linear_infinite]" />
            <div className="font-mono">
              <span className="text-[9px] text-gray-500 block uppercase font-mono">ROYALTY XP STATUS</span>
              <span className="text-indigo-400 font-bold text-xs">Level 4 Creator</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resource publisher input box */}
        <div className="lg:col-span-4 rounded-3xl neo-glass p-5 border-white/5 h-fit space-y-4">
          <div className="flex gap-2 items-center pb-2.5 border-b border-white/5">
            <Plus className="w-4 h-4 text-indigo-400" />
            <h5 className="text-xs uppercase font-mono font-black text-white">Publish Study Materials</h5>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-mono pl-1 block mb-1">Resource Title Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wave Particle Duality Summary Cheat"
                className="w-full text-xs text-white bg-black/40 focus:bg-black/60 p-3 rounded-xl border border-white/10 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase font-mono pl-1 block mb-1">Asset Category Structure</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-black/40 text-xs text-white py-2.5 px-3 rounded-xl border border-white/10 cursor-pointer focus:border-indigo-400 focus:outline-none"
              >
                <option value="quizzes">Interactive Quizzes Block</option>
                <option value="flashcards">Tactical Flashcards Deck</option>
                <option value="diagrams">High Contrast Cheatsheet Diagram</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase font-mono pl-1 block mb-1">Attach Source PDF (Optional)</label>
              <div className="border border-dashed border-white/10 hover:border-indigo-400 bg-black/40 rounded-xl p-3 transition-all text-center relative cursor-pointer">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPdfName(file.name);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-1 select-none pointer-events-none">
                  <span className="text-lg block">📄</span>
                  <span className="text-[10px] text-gray-300 font-mono block truncate max-w-[200px] mx-auto">
                    {pdfName ? `Attached: ${pdfName}` : "Click or drag to attach PDF"}
                  </span>
                  <span className="text-[8px] text-gray-500 block uppercase font-mono">Max size 25MB</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl cursor-pointer border-none transition-all uppercase disabled:opacity-40"
            >
              {submitting ? "UPLOADING PARAMETERS..." : "PUBLISH ONTO NEXANET"}
            </button>
          </form>
        </div>

        {/* Existing shared resources */}
        <div className="lg:col-span-8 space-y-4">
          <h5 className="text-xs font-mono font-black uppercase text-gray-400 pl-1 tracking-wider">Your Decentralized Catalog</h5>

          <div className="space-y-3.5">
            {resources.map(res => (
              <div key={res.id} className="neo-glass rounded-3xl p-5 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex gap-2 items-center">
                      <span className="text-[8px] font-mono font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {res.type}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">
                        📅 {res.date}
                      </span>
                    </div>
                    <h6 className="text-[14px] font-bold text-white mt-1">{res.title}</h6>
                    
                    <div className="flex gap-4 text-[10px] font-mono text-gray-400 pt-1">
                      <span>📥 {res.downloads} downloads</span>
                      <span>👍 {res.likes} likes</span>
                      <span className="text-yellow-400">⭐ {res.rating} rating</span>
                    </div>
                  </div>

                  <button
                    onClick={() => simulateDownload(res.id, res.title)}
                    className="py-2 px-3.5 bg-white/5 hover:bg-indigo-500 hover:text-white transition-all text-indigo-400 text-xs font-bold rounded-xl cursor-pointer border border-indigo-400/20"
                    title="Simulate network node download query to yield royalty payloads"
                  >
                    Simulate Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
