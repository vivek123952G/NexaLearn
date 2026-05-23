import { Question, FeedPost, ChatSession, ShopItem, StudyReel, StudyGroup } from "./types";

export function generateQuestions(): Question[] {
  const categories = ["Algebra", "Geometry", "Physics", "Chemistry", "Biology", "Olympiad"];
  const difficulties: ("Easy" | "Medium" | "Hard" | "Extreme")[] = ["Easy", "Medium", "Hard", "Extreme"];
  
  const subjectsData: Record<string, { qText: string; options: string[]; answer: string; hint: string }[]> = {
    Algebra: [
      {
        qText: "Solve for x: $3x^2 - 12x + 9 = 0$",
        options: ["x = 1, 3", "x = -1, 3", "x = 2, 4", "x = 1, -3"],
        answer: "x = 1, 3",
        hint: "Divide the entire quadratic equation by 3 and factor as (x-1)(x-3) = 0."
      },
      {
        qText: "If $\\log_2(x) + \\log_2(x-2) = 3$, what is x?",
        options: ["x = 4", "x = -2", "x = 8", "x = 6"],
        answer: "x = 4",
        hint: "Combine logs to get log_2(x^2 - 2x) = 3, which translates to x^2 - 2x = 8."
      },
      {
        qText: "What is the sum of infinite geometric series $1 + 1/3 + 1/9 + 1/27 + \\dots$?",
        options: ["1.5", "2.0", "1.33", "1.75"],
        answer: "1.5",
        hint: "Use infinite sum formula S = a / (1 - r) with a = 1, r = 1/3."
      }
    ],
    Geometry: [
      {
        qText: "Calculate the volume of a sphere with radius $R = 3$ cm.",
        options: ["$36\\pi$ cm³", "$18\\pi$ cm³", "$12\\pi$ cm³", "$24\\pi$ cm³"],
        answer: "$36\\pi$ cm³",
        hint: "Use universal formula V = (4/3) * pi * R³."
      },
      {
        qText: "In a right-angled triangle, if base = 8 and height = 15, what is the hypotenuse?",
        options: ["17", "16", "19", "23"],
        answer: "17",
        hint: "Apply Pythagoras theorem: 8² + 15² = 64 + 225 = 289 = 17²."
      }
    ],
    Physics: [
      {
        qText: "A car accelerates from rest at $4 \\text{ m/s}^2$ for $5 \\text{ seconds}$. How far does it travel?",
        options: ["50 m", "100 m", "25 m", "75 m"],
        answer: "50 m",
        hint: "Use kinematic equation: d = v_i*t + 0.5 * a * t²."
      },
      {
        qText: "What is the escape velocity index of Earth approx?",
        options: ["11.2 km/s", "8.2 km/s", "15.4 km/s", "5.6 km/s"],
        answer: "11.2 km/s",
        hint: "Escape velocity V_e = \\sqrt{2GM/R} which yields ~11.2 km/s."
      }
    ],
    Chemistry: [
      {
        qText: "What is the pH level of a $1.0 \\times 10^{-3} \\text{ M}$ solution of HCl?",
        options: ["3.0", "4.0", "2.0", "7.0"],
        answer: "3.0",
        hint: "pH is calculating by taking the negative logarithm of hydrogen ion concentration: -log[H+]."
      },
      {
        qText: "Which quantum number specifies the actual orientation of an orbital in 3D space?",
        options: ["Magnetic quantum number ($m_l$)", "Principal quantum number ($n$)", "Azimuthal quantum number ($l$)", "Spin quantum number ($m_s$)"],
        answer: "Magnetic quantum number ($m_l$)",
        hint: "m_l lists the specific spatial states within a subshell node."
      }
    ],
    Biology: [
      {
        qText: "Which organelle is universally referred to as the power house of eukaryotic cells?",
        options: ["Mitochondria", "Ribosome", "Golgi Apparatus", "Lysosome"],
        answer: "Mitochondria",
        hint: "This organelle regulates aerobic respiration, producing ATP molecules."
      },
      {
        qText: "What are the nucleotide base pairings found inside DNA strands?",
        options: ["A-T, G-C", "A-U, G-C", "A-G, C-T", "T-U, G-A"],
        answer: "A-T, G-C",
        hint: "Adenine binds with Thymine, and Guanine associates with Cytosine."
      }
    ],
    Olympiad: [
      {
        qText: "If $f(x) + 2f(1/x) = 3x$, find $f(2)$ limits.",
        options: ["-1", "0", "1", "-2"],
        answer: "-1",
        hint: "Establish system of linear functional equations by substituting 1/x for x."
      },
      {
        qText: "How many positive integer factors does the number 360 have in total?",
        options: ["24", "18", "12", "36"],
        answer: "24",
        hint: "360 prime factorization is 2³ * 3² * 5¹. Formula: (3+1)*(2+1)*(1+1)."
      }
    ]
  };

  const list: Question[] = [];
  let counter = 1;

  for (const cat of categories) {
    const questionsForCat = subjectsData[cat] || [];
    for (const q of questionsForCat) {
      list.push({
        id: `q_${counter++}`,
        category: cat,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        questionText: q.qText,
        options: q.options,
        correctAnswer: q.answer,
        hint: q.hint,
        xpReward: Math.floor(Math.random() * 40) + 40,
        coinReward: Math.floor(Math.random() * 20) + 15
      });
    }
  }

  return list;
}

export function getInitialFeed(): FeedPost[] {
  return [
    {
      id: "p_1",
      username: "AuraCoder_⚡",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura",
      timeAgo: "12 mins ago",
      content: "Just summarized my full 20-page notes on Quantum Electro-Dynamics using the NexaSnap AI Notes Engine. Saved me at least 4 hours! 🚀 Here is a quick snapshot structure.",
      likes: 142,
      liked: false,
      tag: "Olympiad Study Guide",
      comments: [
        { id: "c_1", username: "BioHacker_99", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Bio", text: "Can you share the PDF export link in the Marketplace? I will buy it instantly!", timeAgo: "10m ago" },
        { id: "c_2", username: "QuantumSolver", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Quant", text: "This is pure gold, the formulas are formatted nicely.", timeAgo: "5m ago" }
      ]
    },
    {
      id: "p_2",
      username: "HyperPhysicist_⚛️",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Physics",
      timeAgo: "2 hours ago",
      content: "Beat the daily speed physics record in the Battle Arena on friction coefficients! Who is up next for a 500 Coin wager study duel? ⚔️",
      likes: 89,
      liked: false,
      tag: "Battle Arena",
      comments: []
    },
    {
      id: "p_3",
      username: "ChemWitch_🧪",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Chem",
      timeAgo: "4 hours ago",
      content: "Stuck on organic reactions mechanisms? Try our voice tutor inside Live Room #02. We've got a live collaborative whiteboard going! Join in student hackers.",
      likes: 211,
      liked: true,
      tag: "Live Classroom",
      comments: [
        { id: "c_3", username: "NerdGamer", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Nerd", text: "On my way! Setting Pomodoro timer.", timeAgo: "2h ago" }
      ]
    }
  ];
}

export function getInitialChats(): ChatSession[] {
  return [
    {
      id: "ch_2",
      recipientName: "BioQueen_🌿",
      recipientAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Queen",
      online: true,
      messages: [
        { id: "cm_4", sender: "BioQueen_🌿", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Queen", text: "Did you finish the biology diagrams for mitochondria respiration?", time: "14:20", reactions: {} },
        { id: "cm_5", sender: "You", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=You", text: "Yes! Uploaded the snapshot in the Study Group whiteboard, check it.", time: "14:22", reactions: { "👍": 1 } }
      ]
    },
    {
      id: "ch_3",
      recipientName: "CodeGod_💻",
      recipientAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Coder",
      online: false,
      lastSeen: "30 mins ago",
      messages: [
        { id: "cm_6", sender: "CodeGod_💻", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Coder", text: "Hey! Join our live coding room, we are testing a graph search solver.", time: "12:00", reactions: {} }
      ]
    }
  ];
}

export function getShopItems(): ShopItem[] {
  return [
    {
      id: "sh_theme_cyber",
      name: "Cyberpunk Volt Skin",
      description: "Unlock full neon electric borders and pulsing cyber energy wallpapers across the ecosystem.",
      price: 250,
      type: "theme",
      rarity: "Epic",
      unlockedContent: "cyber-volt"
    },
    {
      id: "sh_theme_cosmic",
      name: "Cosmic Sunset",
      description: "Applies beautiful ambient nebula gas elements and moving crimson neon overlays.",
      price: 500,
      type: "theme",
      rarity: "Legendary",
      unlockedContent: "cosmic-violet"
    },
    {
      id: "sh_theme_matrix",
      name: "Code Green Terminal",
      description: "Immersive dark command prompt UI styling with vertical falling letters effect.",
      price: 150,
      type: "theme",
      rarity: "Common",
      unlockedContent: "matrix-terminal"
    },
    {
      id: "sh_theme_burgundy",
      name: "Imperial Ruby Glow",
      description: "A luxury design style emphasizing rich burgundy glass finish and elegant golden highlights.",
      price: 400,
      type: "theme",
      rarity: "Epic",
      unlockedContent: "royal-burgundy"
    },
    {
      id: "sh_frame_holo",
      name: "Holographic Visor Aura",
      description: "Get a shifting cyan lasers orbital circle inside your profile photo placeholder.",
      price: 100,
      type: "avatar_frame",
      rarity: "Rare",
      unlockedContent: "border-cyan"
    },
    {
      id: "sh_frame_crown",
      name: "Golden Crown Beacon",
      description: "Displays an animated medieval crown emitting sparks on top of your avatar profile.",
      price: 1000,
      type: "avatar_frame",
      rarity: "Mythic",
      unlockedContent: "crown-sparkles"
    }
  ];
}

export function getInitialReels(): StudyReel[] {
  return [
    {
      id: "r_1",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-curious-student-writing-maths-formulas-41716-large.mp4",
      creator: "FormulaHacker_📐",
      creatorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Hacker",
      caption: "Instant Math Cheat: Multiplying double digit integers ending with 5 under 2 seconds! Save and share! 🤯 #mathhacks #examtricks",
      likes: 1240,
      comments: 341,
      liked: false,
      saved: false,
      tags: ["#mathhacks", "#examtricks"],
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      audioName: "Lo-Fi Focus Beats",
      audioVolume: 0.70,
      originalVolume: 0.30
    },
    {
      id: "r_2",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-physics-students-calculating-force-vectors-41725-large.mp4",
      creator: "ForceMaster_⚛️",
      creatorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Force",
      caption: "Easiest way to master Newton's Inertia laws using physical gravity spins. Master this for the Battle Arena duels! ⚔️",
      likes: 954,
      comments: 112,
      liked: true,
      saved: true,
      tags: ["#physics", "#battlearena"],
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      audioName: "Study Wave Synth",
      audioVolume: 0.65,
      originalVolume: 0.40
    },
    {
      id: "r_3",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-chemical-process-experiments-in-clean-lab-41715-large.mp4",
      creator: "MoleculeWielder_🧪",
      creatorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Molecule",
      caption: "Why acids react violently with alkaline solutions - tracking electrons in sub-atomic paths. Epic animation insight! 🔬",
      likes: 2198,
      comments: 489,
      liked: false,
      saved: false,
      tags: ["#chemistry", "#science"],
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      audioName: "Alpha Deep Mindset",
      audioVolume: 0.80,
      originalVolume: 0.20
    }
  ];
}

export function getInitialGroups(): StudyGroup[] {
  return [
    {
      id: "g_1",
      name: "Olympiad Mathematics Core",
      icon: "📐",
      description: "High velocity preparation lobby for complex proof methods, graphs, topology & number fields.",
      membersCount: 1420,
      leaderboard: [
        { username: "AuraCoder_⚡", xp: 12500 },
        { username: "HyperPhysicist_⚛️", xp: 11000 },
        { username: "You", xp: 0 }
      ],
      sharedNotesCount: 45,
      activeVoiceRooms: 3
    },
    {
      id: "g_2",
      name: "Bio-Engineers Syndicate",
      icon: "🧬",
      description: "Discussions regarding CRISPR technologies, molecular models, and eukaryotic genetics.",
      membersCount: 890,
      leaderboard: [
        { username: "BioQueen_🌿", xp: 9400 },
        { username: "AuraCoder_⚡", xp: 8100 }
      ],
      sharedNotesCount: 22,
      activeVoiceRooms: 1
    },
    {
      id: "g_3",
      name: "Quantum Computing Pioneers",
      icon: "💻",
      description: "Focusing on qbit state superposition computations, Quantum Fourier Transforms, and high-speed compiler designs.",
      membersCount: 560,
      leaderboard: [
        { username: "CodeGod_💻", xp: 15400 },
        { username: "PhysicsLord_⚛️", xp: 13200 }
      ],
      sharedNotesCount: 19,
      activeVoiceRooms: 2
    }
  ];
}
