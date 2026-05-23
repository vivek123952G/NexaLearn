export interface WeeklyTask {
  id: string;
  day: string;
  task: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: "Mathematics" | "Science" | "Tech" | "Language";
  rewardXp: number;
  rewardCoins: number;
}

// Extensive pool of educational, elite tasks across STEM subjects
export const TASK_POOL: Omit<WeeklyTask, "completed">[] = [
  // Mathematics
  { id: "pool_m_1", day: "Monday", task: "Derive Euler's Polyhedral Formula (V - E + F = 2) for planar spheres", priority: "high", category: "Mathematics", rewardXp: 40, rewardCoins: 30 },
  { id: "pool_m_2", day: "Tuesday", task: "Complete 5 speed-algebra battles in the Battle Lobby", priority: "medium", category: "Mathematics", rewardXp: 30, rewardCoins: 20 },
  { id: "pool_m_3", day: "Wednesday", task: "Resolve limit convergence of complex infinite series using Taylor series expansion", priority: "high", category: "Mathematics", rewardXp: 50, rewardCoins: 40 },
  { id: "pool_m_4", day: "Thursday", task: "Determine modulo invariants for 2^1000 mod 13 using Fermat's Little Theorem", priority: "high", category: "Mathematics", rewardXp: 45, rewardCoins: 35 },
  { id: "pool_m_5", day: "Friday", task: "Map Gaussian integer factorization limits inside Cartesian grids", priority: "low", category: "Mathematics", rewardXp: 25, rewardCoins: 15 },
  
  // Science / Biology / Chemistry
  { id: "pool_s_1", day: "Monday", task: "Model DNA transcription pathways during polymerase synthesis loops", priority: "high", category: "Science", rewardXp: 45, rewardCoins: 30 },
  { id: "pool_s_2", day: "Tuesday", task: "Simulate CRISPR-Cas9 genome splicing variables for targeted gene editing", priority: "high", category: "Science", rewardXp: 50, rewardCoins: 40 },
  { id: "pool_s_3", day: "Wednesday", task: "Review organic ester synthesis reactions and name standard output formulas", priority: "medium", category: "Science", rewardXp: 35, rewardCoins: 25 },
  { id: "pool_s_4", day: "Thursday", task: "Draw stereochemistry isomers of cyclic chair conformation hexanes", priority: "medium", category: "Science", rewardXp: 30, rewardCoins: 20 },
  { id: "pool_s_5", day: "Friday", task: "Formulate equilibrium vectors for Haber process ammonia production under pressure", priority: "high", category: "Science", rewardXp: 40, rewardCoins: 30 },

  // Tech / Informatics
  { id: "pool_t_1", day: "Monday", task: "Design a decentralized ledger protocol using SHA-256 verification nodes", priority: "high", category: "Tech", rewardXp: 60, rewardCoins: 50 },
  { id: "pool_t_2", day: "Wednesday", task: "Audit quicksort algorithm bounds and calculate average-case complexity O(n log n)", priority: "medium", category: "Tech", rewardXp: 35, rewardCoins: 25 },
  { id: "pool_t_3", day: "Thursday", task: "Construct quantum bracket logic circuits evaluating qubits superposed states", priority: "high", category: "Tech", rewardXp: 55, rewardCoins: 45 },
  { id: "pool_t_4", day: "Friday", task: "Optimize binary search tree heights using AVL rotation constraints", priority: "medium", category: "Tech", rewardXp: 40, rewardCoins: 30 },

  // Language / Communication
  { id: "pool_l_1", day: "Tuesday", task: "Calibrate bilingual grammar parameters for complex scientific write-ups", priority: "low", category: "Language", rewardXp: 20, rewardCoins: 15 },
  { id: "pool_l_2", day: "Thursday", task: "Draft a technical abstract for the upcoming Olympiad battle results", priority: "medium", category: "Language", rewardXp: 30, rewardCoins: 20 },
  { id: "pool_l_3", day: "Saturday", task: "Compare linguistic structures of high-level pseudo-code against English prose", priority: "low", category: "Language", rewardXp: 25, rewardCoins: 15 }
];

// Returns a fresh subset of tasks that rotates / changes every week (or on manual rotation trigger)
export function getRandomWeeklyTasks(count: number = 5): WeeklyTask[] {
  const shuffled = [...TASK_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((t, idx) => ({
    ...t,
    id: `wk_active_${t.id}_${Date.now()}_${idx}`,
    completed: false
  }));
}

// Weekly generation based on seed timestamp so it rotates automatically or on command
export function generateTasksForWeekSeed(seed: number, count: number = 5): WeeklyTask[] {
  let currentSeed = seed;
  const nextRandom = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  const poolCopy = [...TASK_POOL];
  const selected: WeeklyTask[] = [];
  
  for (let i = 0; i < count; i++) {
    if (poolCopy.length === 0) break;
    const r = nextRandom();
    const index = Math.floor(r * poolCopy.length);
    const item = poolCopy.splice(index, 1)[0];
    selected.push({
      ...item,
      id: `wk_task_${item.id}_${seed}`,
      completed: false
    });
  }
  
  return selected;
}
