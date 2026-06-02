import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Languages, 
  Sparkles, 
  Volume2, 
  HelpCircle, 
  Compass, 
  BookOpen, 
  User, 
  Send, 
  Star, 
  Activity, 
  Award,
  Lock,
  RotateCcw,
  Heart,
  Trophy,
  Flag,
  ArrowRight,
  Smile,
  CheckCircle2,
  XCircle,
  Coins,
  Flame,
  VolumeX,
  Play,
  Zap,
  Book,
  Compass as MapIcon
} from "lucide-react";
import { admobService } from "../lib/AdMobService";

interface LanguageTutorViewProps {
  profile: any;
  onGrantRewards: (coins: number, xp: number) => void;
  onDeductCoins?: (amount: number) => boolean;
  onAddNotification: (title: string, msg: string, type: string) => void;
  onClose: () => void;
}

// Dynamic Available Languages List
export const AVAILABLE_LANGUAGES = [
  "Spanish", "French", "German", "Japanese", "English", "Sanskrit", "Latin", "Hindi", "Marathi", "Arabic", "Chinese", "Tamil", "Telugu"
];

// Procedural 110 Levels Generator spanning basic to Ultra Genius difficulty registers
export const generate100PlusLevels = (language: string) => {
  const PHASES = [
    { 
      title: "Foundation & Primary Greetings", 
      difficulty: "Beginner",
      desc: "Say hello, introduce yourself, master pronunciation and basic pronoun roots.",
      topics: ["Alphabet & Vocal Sounds", "Early Pronouns", "Primary Hello & Greetings", "Politeness registers", "Easy Intros", "Self-Description", "Countable Numbers (1-10)", "Color Identifiers", "Yes/No Affirmations", "Simple Helping Verbs", "Primary Phase Milestone Test"]
    },
    { 
      title: "Conversational Cafe & Everyday Interactions", 
      difficulty: "Beginner",
      desc: "Order cafe item sets, ask for the bill, and discuss family updates or pet animals.",
      topics: ["Cafe Salut registers", "Food Ordering Mechanics", "Dessert requests", "Family Tree Relationships", "Living Space tools", "Weather descriptions", "Expressing time & hour", "Pet Animal builders", "Polite farewell registers", "Simple Negations", "Cafe Phase Milestone Test"]
    },
    { 
      title: "Sentence Construction & Travel Navigation", 
      difficulty: "Intermediate",
      desc: "Arrange words to ask for locations, describe directions, and plan local hotel reservations.",
      topics: ["Asking for directions", "Left, Right, Straight vectors", "Hotel Booking dialog", "Transport vocab (Train, Uber)", "Road sign deciphering", "Schedules & Calendars", "Lost in the City recovery", "Expressing spatial relations", "Prepositions introduction", "Map navigation phrases", "Travel Milestone Test"]
    },
    { 
      title: "Social Networking & Lifestyles", 
      difficulty: "Intermediate",
      desc: "Discuss personal hobbies, favorite sports, daily habits, and plan weekend meetups.",
      topics: ["Weekend plan assembly", "Active Hobbies discussion", "Music & Instrument vocab", "Sports & Athletic terms", "Healthy living guidelines", "Fashion & Clothing purchases", "Social media dialogues", "Describing weather seasonal peaks", "Expressing likes/dislikes", "Comparing objects cleanly", "Lifestyle Milestone Test"]
    },
    { 
      title: "Global Careers & Technical Blueprints", 
      difficulty: "Advanced",
      desc: "Prepare professional job pitch descriptions, engineering reviews, and digital media summaries.",
      topics: ["Digital Resume pitch", "Interview Q&A registers", "SaaS workplace vocab", "Team agreement drafting", "Presentation connectors", "Technical Blueprint reviews", "Data metrics presentation", "Software project delivery", "Leadership terms", "Formal Client emails", "Career Milestone Test"]
    },
    { 
      title: "Science, Tech & Artificial Intelligence Nodes", 
      difficulty: "Advanced",
      desc: "Argue database optimization logic, systems latency parameters, and machine learning models.",
      topics: ["AI Training guidelines", "Machine Learning models", "Database query sequences", "Server Node troubleshooting", "Holographic UX definitions", "Encryption & Cryptography", "Quantum computing parameters", "Data warehouse blueprints", "Network security structures", "System latency terms", "Engineering Milestone Test"]
    },
    { 
      title: "Proverbs, Folklore & Historical Metaphors", 
      difficulty: "Expert",
      desc: "Deconstruct traditional cultural proverbs, idioms, local folklore, and historic timeline prose.",
      topics: ["Traditional Proverb deconstruction", "Ancient Idioms mastery", "Historic poetry lines", "Folklore fairy tales", "Superstitions & Customs", "Literary descriptive prose", "Archaic helping verbs", "Regional accent variables", "Mythological terminology", "Comparative historic timelines", "Cultural Milestone Test"]
    },
    { 
      title: "High Academic Debate & Orbital Physics", 
      difficulty: "Grandmaster",
      desc: "Deliver complex scientific arguments, discuss biological hypotheses, and state laws or policies.",
      topics: ["Orbital physics arguments", "Thermodynamics dialogue", "Cell biology definitions", "Astrophysical variables", "Scientific hypothesis writing", "Intellectual property laws", "Macroeconomics parameters", "Geopolitical speech analysis", "Public health policy debate", "Statistical anomaly tracking", "Academic Milestone Test"]
    },
    { 
      title: "Philosophical Synthesis & Deep Wisdom Flow", 
      difficulty: "Ultra Genius",
      desc: "Articulate existential concepts, ethical paradoxes, human cognitive models, and deep theory.",
      topics: ["Existentialism debates", "Ethical decision models", "Mind-Body dualism theories", "Socratic questioning", "Cognitive memory index", "Subconscious state analysis", "Stoicism core principles", "Aesthetic value parameters", "Philosophical truth criteria", "Synthesizing viewpoints", "Wisdom Milestone Test"]
    },
    { 
      title: "Multiverse Quantum Translations & Advanced AI Mentor Speed", 
      difficulty: "Ultra Genius",
      desc: "Explore futuristic speed-debating, multi-dimensional metaphors, and galactic translation.",
      topics: ["Galactic diplomat dialogue", "Multi-dimensional metaphors", "Quantum telemetry sync", "Time-dilation explanation", "AI sentience boundaries", "Simulation theory review", "Nanoreceptor interaction", "Interstellar trade protocols", "Futuristic slang syntax", "Neural link connectivity", "Grand Master Ultra Genius Graduation"]
    }
  ];

  const units = [];
  for (let i = 0; i < 10; i++) {
    const phase = PHASES[i];
    const unitNo = i + 1;
    const levelsInUnit = [];
    
    // Each unit has exactly 11 levels = 110 levels overall (more than 100 level requirement!)
    for (let l = 1; l <= 11; l++) {
      const globalLevelNo = (i * 11) + l;
      const topicName = phase.topics[l - 1] || `Expert Module ${l}`;
      levelsInUnit.push(`Lvl ${globalLevelNo}: ${topicName}`);
    }

    units.push({
      unit: `Unit ${unitNo}`,
      title: phase.title,
      desc: `Difficulty Register: ${phase.difficulty}. ${phase.desc}`,
      levels: levelsInUnit,
      difficulty: phase.difficulty
    });
  }
  return units;
};

// Types and dynamic question generators for Placement Test onboarding
export interface PlacementQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Master";
}

export function getPlacementQuestions(language: string): PlacementQuestion[] {
  const pools: Record<string, PlacementQuestion[]> = {
    Spanish: [
      {
        id: 1,
        question: "How do you say 'Good morning' in Spanish?",
        options: ["Adiós", "Buenos días", "Buenas noches", "Gracias"],
        correctAnswer: "Buenos días",
        explanation: "'Buenos días' is standard morning greetings, whereas 'Buenas noches' is for night and 'Adiós' is goodbye.",
        difficulty: "Beginner"
      },
      {
        id: 2,
        question: "Select the correct verb ending to complete: 'Nosotros _______ español en la escuela.'",
        options: ["hablan", "hablas", "hablamos", "hablo"],
        correctAnswer: "hablamos",
        explanation: "The pronoun 'Nosotros' (We) requires the AR verb conjugation ending in '-amos' in Spanish.",
        difficulty: "Intermediate"
      },
      {
        id: 3,
        question: "Translate this sentence accurately: 'I hope that you succeed in your exams.'",
        options: [
          "Espero que tengas éxito en tus exámenes.",
          "Espero que tienes éxito en tus exámenes.",
          "Espero tener éxito en tus exámenes.",
          "Espero que tuviste éxito en tus exámenes."
        ],
        correctAnswer: "Espero que tengas éxito en tus exámenes.",
        explanation: "The verb 'esperar' followed by a change of subject requires the subjunctive mood ('tengas' instead of 'tienes').",
        difficulty: "Advanced"
      },
      {
        id: 4,
        question: "What is the meaning of the common Spanish idiom 'Dar gato por liebre'?",
        options: [
          "To feed a pet cat properly",
          "To deceive or scam someone by giving an inferior item",
          "To achieve a goal with double speed",
          "To act with high-fidelity bravery"
        ],
        correctAnswer: "To deceive or scam someone by giving an inferior item",
        explanation: "Literally meaning 'to give a cat instead of a hare', this idiom denotes deceiving someone by substitution of lower grade.",
        difficulty: "Expert"
      },
      {
        id: 5,
        question: "Under advanced grammar, which form completes the hypothesis: 'Si yo _________ rico, compraría un cohete.'",
        options: ["fui", "fuera", "seré", "sea"],
        correctAnswer: "fuera",
        explanation: "Imaginative conditional hypothethical clauses use 'si' followed by the imperfect subjunctive ('fuera') + conditional 'compraría'.",
        difficulty: "Master"
      }
    ],
    French: [
      {
        id: 1,
        question: "How do you say 'Thank you very much' in French?",
        options: ["Bonjour", "S'il vous plaît", "Merci beaucoup", "Au revoir"],
        correctAnswer: "Merci beaucoup",
        explanation: "'Merci beaucoup' is 'thank you very much', 'Au revoir' is 'goodbye'.",
        difficulty: "Beginner"
      },
      {
        id: 2,
        question: "Complete the sentence with the correct verb: 'Ils _______ un magnifique château.'",
        options: ["avez", "ont", "avons", "sont"],
        correctAnswer: "ont",
        explanation: "For the pronoun 'Ils' (They), the verb 'avoir' (to have) conjugates to 'ont'.",
        difficulty: "Intermediate"
      },
      {
        id: 3,
        question: "Choose the correct relative pronoun: 'La voiture ______ mon père a achetée est rouge.'",
        options: ["qui", "que", "dont", "où"],
        correctAnswer: "que",
        explanation: "'La voiture que mon père a achetée' - 'que' is used as the direct object of the relative clause.",
        difficulty: "Advanced"
      },
      {
        id: 4,
        question: "What does the French idiom 'Avoir le cafard' mean?",
        options: [
          "To feel very lucky",
          "To feel depressed, blue, or gloomy",
          "To run with high speed",
          "To eat a sweet apple"
        ],
        correctAnswer: "To feel depressed, blue, or gloomy",
        explanation: "'Avoir le cafard' is a common idiom meaning to feel down or depressed.",
        difficulty: "Expert"
      },
      {
        id: 5,
        question: "Choose correct passive structure equivalent for: 'On m'a dit de venir.'",
        options: [
          "Je fus dit de venir.",
          "Il m'a été dit de venir.",
          "J'ai été dit de venir.",
          "On fut dit de venir."
        ],
        correctAnswer: "Il m'a été dit de venir.",
        explanation: "The passive voice equivalent of indirect transitive clauses uses the impersonal structure 'Il m'a été dit...'.",
        difficulty: "Master"
      }
    ]
  };

  const defaultList: PlacementQuestion[] = [
    {
      id: 1,
      question: `How do you express a basic greeting or 'Hello' in ${language}?`,
      options: ["Hello / Greeting", "Goodbye", "Not tonight", "Where is the library"],
      correctAnswer: "Hello / Greeting",
      explanation: "Basic foundational unit starts with welcoming greetings of respect.",
      difficulty: "Beginner"
    },
    {
      id: 2,
      question: `Choose the correct pronoun connection for plural 'We' inside active ${language} conversations:`,
      options: ["Standard Plural suffix structure", "Singular formal option", "Inflected past tense", "Future hypothetical marker"],
      correctAnswer: "Standard Plural suffix structure",
      explanation: "Verb agreements require modifying word stems to denote community plural actions.",
      difficulty: "Intermediate"
    },
    {
      id: 3,
      question: `In conditional or hypothetical sentences in ${language}, which verb form is correct?`,
      options: ["The subjunctive condition form", "Present direct active form", "Preterite immediate form", "Infinitive baseline"],
      correctAnswer: "The subjunctive condition form",
      explanation: "Contingent desires are routed via subjunctive markers in modern language structures.",
      difficulty: "Advanced"
    },
    {
      id: 4,
      question: `Translate this phrase accurately from ${language} grammar rules: 'The lesson is difficult but highly rewarding.'`,
      options: [
        "Accurate native rendering with adversative conjunction",
        "Direct literal word-for-word translation error",
        "Passive tense with missing parameters",
        "Syntactically incomplete phrase block"
      ],
      correctAnswer: "Accurate native rendering with adversative conjunction",
      explanation: "Complex compounds combine main clauses with contrast markers properly inflected.",
      difficulty: "Expert"
    },
    {
      id: 5,
      question: `Which advanced syntactic marker resolves classical verb displacement clauses in ${language}?`,
      options: [
        "The correct syntactic discourse marker",
        "Bare lexical infinitive roots",
        "Weak pronominal enclitics",
        "Prepositional accusative particles"
      ],
      correctAnswer: "The correct syntactic discourse marker",
      explanation: "Discourse parsing anchors formal subordinate structures without dangling markers.",
      difficulty: "Master"
    }
  ];

  return pools[language] || defaultList;
}

// High-Fidelity programmatical exercise builder for 100% offline fallback compatibility
export const getLocalFallbackDrill = (language: string, levelName: string, previousQuestions?: string[]) => {
  const match = levelName.match(/Lvl\s+(\d+)/i);
  const lvlNo = match ? parseInt(match[1], 10) : Math.floor(Math.random() * 110) + 1;

  let difficulty = "Beginner";
  if (lvlNo > 88) difficulty = "Ultra Genius";
  else if (lvlNo > 77) difficulty = "Grandmaster";
  else if (lvlNo > 55) difficulty = "Advanced";
  else if (lvlNo > 33) difficulty = "Intermediate";

  // Dynamic noun, verb, adjective pools for full high-fidelity infinite randomization
  const poolSubjects: Record<string, string[]> = {
    Spanish: ["Carlos", "Sofía", "Juan", "Elena", "El estudiante", "El tutor", "Mateo", "Valentina", "Diego", "Ana"],
    French: ["Pierre", "Amélie", "Jean", "Chloé", "L'étudiant", "Le tuteur", "Lucas", "Manon", "Thomas", "Camille"],
    German: ["Hans", "Anna", "Lukas", "Mia", "Der Student", "Der Lehrer", "Maximilian", "Clara", "Finn", "Emma"],
    Japanese: ["ケンジ (Kenji)", "ユキ (Yuki)", "サクラ (Sakura)", "タカシ (Takashi)", "学生 (Gakusei)", "先生 (Sensei)", "ハルト (Haruto)", "アオイ (Aoi)", "レン (Ren)", "メイ (Mei)"],
    English: ["Alex", "Sophia", "Daniel", "Olivia", "The student", "The tutor", "Ethan", "Emma", "William", "Ava"],
    Sanskrit: ["रामः (Ramah)", "सीता (Sita)", "छात्रः (Chhaatra)", "गुरुः (Guruh)", "बालकः (Baalakah)", "अहम् (Aham)", "कृष्णः (Krishnah)", "राधा (Radha)"],
    Latin: ["Marcus", "Julia", "Discipulus", "Magister", "Caesar", "Amicus", "Lucius", "Diana", "Augustus", "Aemilia"],
    Hindi: ["राहुल (Rahul)", "प्रिया (Priya)", "छात्र (Chhaatra)", "शिक्षक (Shikshak)", "मित्र (Mitra)", "अमित (Amit)", "रोहन (Rohan)", "अंजलि (Anjali)", "विक्रम (Vikram)", "कवि (Kavi)"],
    Marathi: ["अमित (Amit)", "स्नेहा (Sneha)", "विद्यार्थी (Vidyarthi)", "शिक्षक (Shikshak)", "मित्र (Mitra)", "राहुल (Rahul)", "अनिल (Anil)", "आरती (Aarti)", "सुहास (Suhas)", "प्रज्ञा (Pragya)"],
    Arabic: ["أحمد (Ahmad)", "فاطمة (Fatima)", "الطالب (Al-talib)", "المعلم (Al-muallim)", "صديقي (Sadiqi)", "يوسف (Yousef)", "عمر (Omar)", "ليلى (Layla)", "خالد (Khaled)", "سارة (Sara)"],
    Chinese: ["张伟 (Zhang Wei)", "王芳 (Wang Fang)", "学生 (Xuesheng)", "老师 (Laoshi)", "朋友 (Pengyou)", "小明 (Xiao Ming)", "李娜 (Li Na)", "刘洋 (Liu Yang)", "杰克 (Jieke)", "露西 (Luxi)"],
    Tamil: ["கார்த்திக் (Karthik)", "பிரியா (Priya)", "மாணவன் (Maanavan)", "ஆசிரியர் (Aasiriyar)", "நண்பன் (Nanban)", "அன்பு (Anbu)", "விஜய் (Vijay)", "திவ்யா (Divya)", "செல்வம் (Selvam)", "கவிதா (Kavitha)"],
    Telugu: ["రవి (Ravi)", "లక్ష్మి (Lakshmi)", "विद्यार्थी (Vidyarthi)", "గురువు (Guruvu)", "మిత్రుడు (Mitrudu)", "కిరణ్ (Kiran)", "సాయి (Sai)", "స్వప్న (Swapna)", "శ్రీను (Srinu)", "కావ్య (Kavya)"]
  };

  const poolActions: Record<string, string[]> = {
    Spanish: ["quiere", "compra", "bebe", "come", "necesita", "aprende", "estudia", "busca", "escribe", "lee"],
    French: ["veut", "achète", "boit", "mange", "a besoin de", "apprend", "étudie", "cherche", "écrit", "lit"],
    German: ["will", "kauft", "trinkt", "isst", "braucht", "lernt", "studiert", "sucht", "schreibt", "liest"],
    Japanese: ["が欲しい (ga hoshii)", "を買う (wo kau)", "を飲む (wo nomu)", "を食べる (wo taberu)", "が必要 (ga hitsuyou)", "を学ぶ (wo manabu)", "を勉強する (wo benkyou suru)", "を探す (wo sagasu)", "を書く (wo kaku)", "を読む (wo yomu)"],
    English: ["wants", "buys", "drinks", "eats", "needs", "learns", "studies", "seeks", "writes", "reads"],
    Sanskrit: ["इच्छति (Ichhati)", "क्रीणाति (Kreenaati)", "पिबति (Pibati)", "खादति (Khaadati)", "आवश्यकता अस्ति", "शिक्षते (Shikshate)", "पठति (Pathati)", "अन्वेषयति", "लिखति (Likhati)", "पठति (Pathati)"],
    Latin: ["vult", "emit", "bibit", "edit", "eget", "discit", "studet", "quaerit", "scribit", "legit"],
    Hindi: ["चाहता है (chaahata hai)", "खरीदता है (khareedata hai)", "पीता है (peeta hai)", "खाता है (khaata hai)", "चाहिए (chaahiye)", "सीखता है (seekhata hai)", "पढ़ता है (padhata hai)", "खोजता है (khojata hai)", "लिखता है (likhata hai)", "पढ़ता है (padhata hai)"],
    Marathi: ["पाहिजे (pahije)", "खरेदी करतो (kharedi karto)", "पितो (pito)", "खातो (khato)", "आवश्यक आहे", "शिकतो (shikto)", "अभ्यास करतो (abhyas karto)", "शोधतो (shodhto)", "लिहितो (lihito)", "वाचतो (vachto)"],
    Arabic: ["يريد (yurid)", "يشتري (yashtari)", "يشرب (yashrab)", "يأكل (ya'kul)", "يحتاج كوانتم", "يتعلم (yata'allam)", "يدرس (yadrus)", "يبحث عن", "يكتب (yaktub)", "يقرأ (yaqra')"],
    Chinese: ["想要 (xiang yao)", "买 (mai)", "喝 (he)", "吃 (chi)", "需要 (xu yao)", "学习 (xue xi)", "研究 (yan jiu)", "寻找 (xun zhao)", "写 (xie)", "读 (du)"],
    Tamil: ["விரும்புகிறான் (virumbugiraan)", "வாங்குகிறான் (vaangugiraan)", "குடிக்கிறான் (kudikkiraan)", "சாப்பிடுகிறான் (saappidugiraan)", "தேவைப்படுகிறது", "கற்கிறான் (karkiraan)", "படிக்கிறான் (padikkiraan)", "தேடுகிறான் (thedugiraan)", "எழுதுகிறான் (ezhudhugiraan)", "வாசிக்கிறான் (vaasikkiraan)"],
    Telugu: ["కోరుకుంటున్నాడు (korukuntunnadu)", "కొంటున్నాడు (kontunnadu)", "తాगुతున్నాడు (tagutunnadu)", "తింటున్నాడు (tintunnadu)", "కావాలి", "నేర్చుకుంటున్నాడు (nerchukuntunnadu)", "చదువుతున్నాడు (chaduvutunnadu)", "వెతుకుతున్నాడు (vethukutunnadu)", "రాస్తున్నాడు (rastunnadu)", "చదువుతున్నాడు (chaduvutunnadu)"]
  };

  const poolObjects: Record<string, string[]> = {
    Spanish: ["un café delicioso", "un té caliente", "pan fresco", "un libro cuántico", "agua fría", "una fruta dulce", "una manzana roja", "un cuaderno nuevo", "un mapa estelar", "chocolate belga"],
    French: ["un café délicieux", "un thé chaud", "du pain frais", "un livre quantique", "de l'eau fraîche", "un fruit sucré", "une pomme rouge", "un nouveau cahier", "une carte stellaire", "du chocolat belge"],
    German: ["einen leckeren Kaffee", "einen heißen Tee", "frisches Brot", "ein Quantenbuch", "kaltes Wasser", "eine süße Frucht", "einen roten Apfel", "ein neues Notizbuch", "eine Sternenkarte", "belgische Schokolade"],
    Japanese: ["美味しいコーヒー (oishii koohii)", "温かいお茶 (atakai ocha)", "新鮮なパン (shinsen na pan)", "量子本 (ryoushi hon)", "冷たい水 (tsumetai mizu)", "甘い果物 (amai kudamono)", "赤いリンゴ (akai ringo)", "新しいノート (atarashii nooto)", "星図 (seizu)", "ベルギーチョコレート (berugii chokoreeto)"],
    English: ["a delicious coffee", "a hot tea", "fresh bread", "a quantum book", "cold water", "a sweet fruit", "a red apple", "a new notebook", "a star map", "Belgian chocolate"],
    Sanskrit: ["स्वादिष्टं दुग्धम् (swaadishtam dugdham)", "उष्णं जलम् (ushnam jalam)", "मधुरं फलम् (madhuram phalam)", "ज्ञानपुस्तकम् (gyaanapustakam)", "शीतलं जलम् (sheetalam jalam)", "अन्नम् (annam)", "रक्तफलं (raktaphalam)", "नवलेखनपुस्तिका", "तारामानचित्रम्", "मधुरान्नम् (madhuraannam)"],
    Latin: ["poculum aquae", "theam calidam", "panem expresses", "librum cosmicum", "aquam frigidam", "fructum dulcem", "malum rubrum", "novum codicem", "astrorum tabulam", "socolatam optimam"],
    Hindi: ["स्वादिष्ट कॉफ़ी (delicious coffee)", "गर्म चाय (hot tea)", "ताज़ा ब्रेड (fresh bread)", "एक क्वांटम पुस्तक (quantum book)", "ठंडा पानी (cold water)", "एक मीठा फल (sweet fruit)", "एक लाल सेब (red apple)", "एक नई नोटबुक (new notebook)", "एक तारा मानचित्र (star map)", "बेल्जियम चॉकलेट (Belgian chocolate)"],
    Marathi: ["चवदार कॉफी (delicious coffee)", "गरम चहा (hot tea)", "ताजा ब्रेड (fresh bread)", "क्वांटम पुस्तक (quantum book)", "थंड पाणी (cold water)", "गोड फळ (sweet fruit)", "लाल सफरचंद (red apple)", "नवीन वही (new notebook)", "तारा नकाशा (star map)", "बेल्जियम चॉकलेट (Belgian chocolate)"],
    Arabic: ["قهوة لذيذة", "شاي ساخن", "خبز طازج", "كتاب الكم", "ماء بارد", "فاكهة حلوة", "تفاحة حمراء", "دفتر جديد", "خريطة النجوم", "شوكولاتة بلجيكية"],
    Chinese: ["一杯美味的咖啡", "一杯热茶", "新鲜的面包", "一本量子学书籍", "冷水", "甜水果", "红苹果", "新笔记本", "星图", "比利时巧克力"],
    Tamil: ["சுவையான காபி", "சூடான தேநீர்", "புதிய ரொட்டி", "குவாண்டம் புத்தகம்", "குளிர்ந்த நீர்", "இனிப்பு பழம்", "சிவப்பு ஆப்பிள்", "புதிய குறிப்பேடு", "நட்சத்திர வரைபடம்", "பெல்ஜிய சாக்லேட்"],
    Telugu: ["రుచికరమైన కాఫీ", "వేడి టీ", "తాజా రొట్టె", "క్వాంటం పుస్తకం", "చల్లని నీరు", "తీపి పండు", "ఎర్రటి ఆపిల్", "కొత్త నోట్‌బుక్", "నక్షత్రాల పటం", "బెల్జియం చాక్లెట్"]
  };

  const poolGreetings: Record<string, string[]> = {
    Spanish: ["¡Hola!", "Buenos días", "Muchas gracias", "Por favor", "¡Excelente!", "¡Adiós!", "Buenas tardes", "¡Fabuloso!", "Muchas felicidades", "Perfecto"],
    French: ["Bonjour !", "Bonsoir", "Merci beaucoup", "S'il vous plaît", "Excellent !", "Au revoir !", "Bon après-midi", "Merveilleux !", "Félicitations", "Parfait"],
    German: ["Hallo !", "Guten Morgen", "Vielen Dank", "Bitte sehr", "Ausgezeichnet !", "Tschüss !", "Guten Tag", "Wunderbar !", "Herzlichen Glückwunsch", "Perfekt"],
    Japanese: ["こんにちは！", "おはようございます", "ありがとうございます", "どうぞ", "素晴らしい！", "さようなら！", "お元気ですか", "見事です！", "おめでとうございます", "完璧です"],
    English: ["Hello !", "Good morning", "Thank you very much", "Please", "Excellent !", "Goodbye !", "Good afternoon", "Wonderful !", "Congratulations", "Perfect"],
    Sanskrit: ["नमो नमः।", "सुप्रभातम्", "धन्यवादाः", "कृपया", "उत्तमम् !", "पुनर्मिलामः।", "शुभमध्याह्नम्", "अद्भुतम् !", "अभिनन्दनानि", "पूर्णमस्ति"],
    Latin: ["Salve !", "Bonum mane", "Gratias tibi", "Quaeso", "Optime !", "Vale !", "Post meridiem", "Mirabile !", "Gratulor", "Perfectum"],
    Hindi: ["नमस्ते !", "सुप्रभात", "आपका बहुत धन्यवाद", "कृपया", "बहुत बढ़िया !", "फिर मिलेंगे !", "नमस्कार", "अद्भुत !", "बधाई हो", "उत्कृष्ट"],
    Marathi: ["नमस्कार !", "सुप्रभात", "खूप खूप धन्यवाद", "कृपया", "उत्कृष्ट !", "पुन्हा भेटू !", "शुभ दुपार", "सुंदर !", "अभिनंदन", "परफेक्ट"],
    Arabic: ["مرحباً !", "صباح الخير", "شكراً جزيلأ", "من فضلك", "ممتاز !", "إلى اللقاء !", "مساء الخير", "رائع !", "تهانينا", "مكتمل"],
    Chinese: ["你好！", "早上好", "非常感谢", "请", "太棒了！", "再见！", "下午好！", "精彩！", "恭喜恭喜", "完美"],
    Tamil: ["வணக்கம் !", "காலை வணக்கம்", "மிக்க நன்றி", "தயவுசெய்து", "அருமை !", "சென்று வருகிறேன் !", "மதிய வணக்கம்", "அற்புதம் !", "வாழ்த்துகள்", "அகிலம்"],
    Telugu: ["నమస్కారం !", "శుభోదయం", "చాలా ధన్యవాదాలు", "దయచేసి", "అద్భుతం !", "సెలవు !", "మధ్యాహ్న వందనాలు", "అమోఘం !", "అభినందనలు", "సంపూర్ణం"]
  };

  const lang = (language || "Spanish") as string;
  const targetPoolSubject = poolSubjects[lang] || poolSubjects["Spanish"];
  const targetPoolAction = poolActions[lang] || poolActions["Spanish"];
  const targetPoolObject = poolObjects[lang] || poolObjects["Spanish"];
  const targetPoolGreeting = poolGreetings[lang] || poolGreetings["Spanish"];

  // Completely dynamic selection based on local random and level formula to enforce unique instances
  const salt = Math.floor(Math.random() * 1000);
  const subIdx = (lvlNo * 17 + salt) % targetPoolSubject.length;
  const actIdx = (lvlNo * 23 + salt * 2) % targetPoolAction.length;
  const objIdx = (lvlNo * 29 + salt * 3) % targetPoolObject.length;
  const grtIdx = (lvlNo * 31 + salt * 4) % targetPoolGreeting.length;

  const sub = targetPoolSubject[subIdx];
  const act = targetPoolAction[actIdx];
  const obj = targetPoolObject[objIdx];
  const grt = targetPoolGreeting[grtIdx];

  let phrase = "";
  let englishGoal = "";
  let type: "multichoice" | "scramble" = "multichoice";
  let explanation = "";

  if (difficulty === "Ultra Genius" || difficulty === "Grandmaster") {
    phrase = `${grt} ${sub} ${act} ${obj} [Quantum Lvl ${lvlNo}].`;
    englishGoal = `Translate: "${grt} (${sub}) performs action (${act}) on (${obj}) precisely at Level ${lvlNo}!"`;
    explanation = `Tested advanced philosophical registers of ${lang} under Master Level ${lvlNo}. This unlocks VIP academic progress tracking!`;
  } else if (difficulty === "Advanced") {
    type = "scramble";
    phrase = `${sub} ${act} ${obj}`.trim();
    englishGoal = `Assemble the active syntax statement: "${sub} performs action with ${obj}."`;
    explanation = `Advanced scrambled particle challenge. Placing noun (${sub}) first and verb (${act}) maintains professional posture in ${lang}.`;
  } else if (difficulty === "Intermediate") {
    phrase = `${act} ${obj}`.trim();
    englishGoal = `Translate action sequence: "Performing ${act} with ${obj}."`;
    explanation = `Intermediate level ${lvlNo} constructs high priority request patterns suitable for academic tournaments.`;
  } else {
    // Beginner
    phrase = `${grt} ${sub}`.trim();
    englishGoal = `Identify the polite greeting for: "${grt} ${sub}."`;
    explanation = `"Beginner foundations: greetings are essential when communicating in ${lang} on Level ${lvlNo}."`;
  }

  const shuffleArray = (arr: string[]) => {
    return [...arr].sort(() => 0.5 - Math.random());
  };

  const rawWords = phrase.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¡!]/g,"").split(/\s+/).filter(Boolean);

  if (type === "scramble") {
    return {
      question: `Assemble this phrase in ${lang} for ${levelName}: "${englishGoal}"`,
      type: "scramble",
      options: [phrase],
      correctAnswer: phrase.toLowerCase(),
      shuffledWords: shuffleArray(rawWords),
      speakPhrase: phrase,
      explanation: explanation
    };
  } else {
    const decoy1 = `${targetPoolGreeting[(grtIdx + 11) % targetPoolGreeting.length]} ${targetPoolSubject[(subIdx + 7) % targetPoolSubject.length]}`;
    const decoy2 = `${targetPoolSubject[(subIdx + 3) % targetPoolSubject.length]} ${targetPoolAction[(actIdx + 9) % targetPoolAction.length]} level error`;
    const decoy3 = `Colloquial playground dialogue term at level ${lvlNo + 4}`;

    const opts = shuffleArray([
      phrase,
      decoy1,
      decoy2,
      decoy3
    ]);

    return {
      question: `Choose the correct translation for ${levelName} (${difficulty}): "${englishGoal}"`,
      type: "multichoice",
      options: opts,
      correctAnswer: phrase,
      shuffledWords: [],
      speakPhrase: phrase,
      explanation: explanation
    };
  }
};

export const getPlacementQuestionsForLanguage = (lang: string) => {
  if (lang === "French") {
    return [
      { q: "Translate the common greeting 'Good morning, friend':", opts: ["Bonjour mon ami", "Bonsoir docteur", "Au revoir", "Merci beaucoup"], ans: "Bonjour mon ami", diff: "Beginner" },
      { q: "Choose correct directions syntax for 'Where is the hotel?':", opts: ["Où est l'hôtel ?", "J'aime le pain frais", "La table de cuisine est verte", "C'est de l'eau pure"], ans: "Où est l'hôtel ?", diff: "Intermediate" },
      { q: "Translate: 'I am researching machine learning and databases':", opts: ["Je recherche l'apprentissage automatique et les bases de données.", "Je bois de l'eau glacée.", "Le train est en retard ce soir.", "Une petite pomme rouge."], ans: "Je recherche l'apprentissage automatique et les bases de données.", diff: "Advanced" },
      { q: "Identify the translation for 'Action speaks louder than words':", opts: ["Les actions parlent plus fort que les mots.", "Mieux vaut tard que jamais.", "Chaque chose en son temps.", "C'est la routine de la vie."], ans: "Les actions parlent plus fort que les mots.", diff: "Expert" },
      { q: "Select the literal sentence: 'Ethical decisions define human reality':", opts: ["Les décisions éthiques définissent la réalité humaine.", "Le grand ciel est bleu clair.", "La physique quantique est complexe.", "Le repas gastronomique est délicieux."], ans: "Les décisions éthiques définissent la réalité humaine.", diff: "Ultra Genius" }
    ];
  } else if (lang === "German") {
    return [
      { q: "Translate the common greeting 'Good morning, friend':", opts: ["Guten Morgen, Freund", "Gute Nacht, Doktor", "Tschüss auf Wiedersehen", "Danke sehr"], ans: "Guten Morgen, Freund", diff: "Beginner" },
      { q: "Choose correct directions syntax for 'Where is the hotel?':", opts: ["Wo ist das Hotel?", "Ich mag frisches Brot", "Der Esstisch ist grün", "Das Wasser ist eiskalt"], ans: "Wo ist das Hotel?", diff: "Intermediate" },
      { q: "Translate: 'I am researching machine learning and databases':", opts: ["Ich erforsche maschinelles Lernen und Datenbanken.", "Ich trinke kaltes Wasser.", "Der Zug hat heute Verspätung.", "Ein leckerer roter Apfel."], ans: "Ich erforsche maschinelles Lernen und Datenbanken.", diff: "Advanced" },
      { q: "Identify the translation for 'Action speaks louder than words':", opts: ["Taten sagen mehr als Worte.", "Besser spät als nie.", "Alles hat seine eigene Zeit.", "Das ist das echte Leben."], ans: "Taten sagen mehr als Worte.", diff: "Expert" },
      { q: "Select the literal sentence: 'Ethical decisions define human reality':", opts: ["Ethische Entscheidungen definieren die menschliche Realität.", "Der weite Himmel ist blau.", "Die Quantenphysik ist absolut faszinierend.", "Das zubereitete Essen ist lecker."], ans: "Ethische Entscheidungen definieren die menschliche Realität.", diff: "Ultra Genius" }
    ];
  } else if (lang === "Japanese") {
    return [
      { q: "Translate 'Good morning, friend':", opts: ["おはよう、友よ (Ohayou, tomo yo)", "おやすみ、医者 (Oyasumi, isha)", "さようなら (Sayounara)", "ありがとう (Arigatou)"], ans: "おはよう、友よ (Ohayou, tomo yo)", diff: "Beginner" },
      { q: "Choose correct directions syntax for 'Where is the hotel?':", opts: ["ホテルはどこですか？ (Hoteru wa doko desu ka?)", "パンが好きです (Pan ga suki desu)", "テーブルは緑です (Teeburu wa midori desu)", "これは水です (Kore wa mizu desu)"], ans: "ホテルはどこですか？ (Hoteru wa doko desu ka?)", diff: "Intermediate" },
      { q: "Translate: 'I am researching machine learning and databases':", opts: ["私は機械学習とデータベースを研究しています。 (Watashi wa kikai gakushuu to deetabeesu wo kenkyuu shiteimasu.)", "冷たい水を飲みます。 (Tsumetai mizu wo nomimasu.)", "電車がかなり遅れています。 (Densha ga kanari okureteimasu.)", "美味しい赤いリンゴ。 (Oishii akai ringo.)"], ans: "私は機械学習とデータベースを研究しています。 (Watashi wa kikai gakushuu to deetabeesu wo kenkyuu shiteimasu.)", diff: "Advanced" },
      { q: "Identify the translation for 'Action speaks louder than words':", opts: ["行動は言葉よりも雄弁に語る。 (Koudou wa kotoba yori mo yuuben ni kataru.)", "習うより慣れろ。 (Narau yori narero.)", "時の流れがすべて。 (Toki no nagare ga subete.)", "それが人生だ。 (Sore ga jinsei da.)"], ans: "行動は言葉よりも雄弁に語る。 (Koudou wa kotoba yori mo yuuben ni kataru.)", diff: "Expert" },
      { q: "Select the literal sentence: 'Ethical decisions define human reality':", opts: ["倫理的な決定が人間の現実を定義する。 (Rinriteki na kettei ga ningen no genjitsu wo teigi suru.)", "青空が綺麗です。 (Aozora ga kirei desu.)", "量子力学は非常に面白い。 (Ryoushi riki gaku wa hijou ni omoshiroi.)", "温かいご飯は美味しいです。 (Atatakai gohan wa oishii desu.)"], ans: "倫理的な決定が人間の現実を定義する。 (Rinriteki na kettei ga ningen no genjitsu wo teigi suru.)", diff: "Ultra Genius" }
    ];
  } else {
    // Default Spanish / general English representation
    return [
      { q: "Translate the common greeting 'Good morning, friend':", opts: ["Buenos días amigo", "Buenas noches doctor", "Adiós hasta luego", "Muchas gracias por todo"], ans: "Buenos días amigo", diff: "Beginner" },
      { q: "Choose correct directions syntax for 'Where is the hotel?':", opts: ["¿Dónde está el hotel?", "Me gusta comer pan blanco", "La mesa de madera es verde", "Tengo un libro interesante"], ans: "¿Dónde está el hotel?", diff: "Intermediate" },
      { q: "Translate: 'I am researching machine learning and databases':", opts: ["Estoy investigando aprendizaje automático y bases de datos.", "Yo bebo agua fresca del grifo.", "Mi hija tiene un gato negro.", "El tren rápido está retrasado."], ans: "Estoy investigando aprendizaje automático y bases de datos.", diff: "Advanced" },
      { q: "Identify translation for 'Action speaks louder than words':", opts: ["Las acciones hablan más fuerte que las palabras.", "Más vale tarde que nunca.", "A buen entendedor pocas palabras bastan.", "De tal palo tal astilla como dicen."], ans: "Las actions hablan más fuerte que las palabras.", diff: "Expert" },
      { q: "Select the literal sentence: 'Ethical decisions define human reality':", opts: ["Las decisiones éticas definen la realidad humana.", "La física cuántica racional es compleja.", "El gran sol brilla en el cielo.", "El universo tiene múltiples galaxias."], ans: "Las decisiones éticas definen la realidad humana.", diff: "Ultra Genius" }
    ];
  }
};

export const LanguageTutorView: React.FC<LanguageTutorViewProps> = ({
  profile,
  onGrantRewards,
  onDeductCoins,
  onAddNotification,
  onClose
}) => {
  // Global States
  const [selectedLang, setSelectedLang] = useState<string>("Spanish");
  const [hearts, setHearts] = useState<number>(5);
  const [activeUnit, setActiveUnit] = useState<number>(0);
  const [exploreView, setExploreView] = useState<"learn" | "solve" | "practice" | "shop" | "syllabus">("learn");

  // 1. Placement Test States
  const [placementTestCompleted, setPlacementTestCompleted] = useState<boolean>(() => {
    return localStorage.getItem("duo_placement_took") === "true";
  });
  const [placementLevel, setPlacementLevel] = useState<string>(() => {
    return localStorage.getItem("duo_placement_level") || "Beginner";
  });
  const [takingPlacement, setTakingPlacement] = useState<boolean>(false);
  const [placementStep, setPlacementStep] = useState<number>(0);
  const [placementScore, setPlacementScore] = useState<number>(0);
  const [selectedPlacementOpt, setSelectedPlacementOpt] = useState<string>("");
  const [placementAnswered, setPlacementAnswered] = useState<boolean>(false);
  const [placementFeedback, setPlacementFeedback] = useState<string>("");
  const [placementIsCorrect, setPlacementIsCorrect] = useState<boolean>(false);

  // 2. Smart Vocabulary Bank
  const [vocabBank, setVocabBank] = useState<Array<{word: string, translation: string, language: string, strength: number, attempts: number}>>(() => {
    const cached = localStorage.getItem("duo_v2_vocab_bank");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { word: "Hola", translation: "Hello", language: "Spanish", strength: 100, attempts: 2 },
      { word: "Gracias", translation: "Thank you", language: "Spanish", strength: 90, attempts: 3 },
      { word: "Maître", translation: "Master", language: "French", strength: 40, attempts: 1 },
      { word: "Bonjour", translation: "Good Morning", language: "French", strength: 80, attempts: 2 },
      { word: "Wasser", translation: "Water", language: "German", strength: 50, attempts: 2 },
      { word: "Arigatou", translation: "Thank you", language: "Japanese", strength: 100, attempts: 4 },
      { word: "Gakusei", translation: "Student", language: "Japanese", strength: 30, attempts: 1 },
      { word: "Scribere", translation: "To write", language: "Latin", strength: 60, attempts: 2 },
      { word: "Guru", translation: "Teacher", language: "Sanskrit", strength: 100, attempts: 3 }
    ];
  });

  // Save Vocab Bank to LocalStorage
  useEffect(() => {
    localStorage.setItem("duo_v2_vocab_bank", JSON.stringify(vocabBank));
  }, [vocabBank]);

  // 3. League State
  const [leagueLevel, setLeagueLevel] = useState<string>(() => {
    return localStorage.getItem("duo_league_level") || "Bronze League";
  });

  // 4. Streak Stats & protection
  const [streakDays, setStreakDays] = useState<number>(() => {
    return Number(localStorage.getItem("duo_streak_days") || "7");
  });
  const [hasStreakFreeze, setHasStreakFreeze] = useState<boolean>(() => {
    return localStorage.getItem("duo_streak_freeze") === "true";
  });
  const [unlimitedHearts, setUnlimitedHearts] = useState<boolean>(() => {
    return localStorage.getItem("duo_unlimited_hearts") === "true";
  });

  // 5. Daily Challenges state
  const [dailyQuests, setDailyQuests] = useState(() => {
    const cached = localStorage.getItem("duo_daily_quests_v1");
    if (cached) {
      try { return JSON.parse(cached); } catch(e){}
    }
    return [
      { id: "quest_1", label: "Complete 3 Daily Lessons", current: 0, target: 3, xp: 50, completed: false },
      { id: "quest_2", label: "Gain 100 Translation XP Points", current: 15, target: 100, xp: 40, completed: false },
      { id: "quest_3", label: "Consult AI Accent Voice Coach Session", current: 0, target: 1, xp: 30, completed: false },
      { id: "quest_4", label: "Revise 3 Vocabulary Weak Words", current: 0, target: 3, xp: 45, completed: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem("duo_daily_quests_v1", JSON.stringify(dailyQuests));
  }, [dailyQuests]);

  const tickQuest = (id: string, amount: number) => {
    setDailyQuests(prev => prev.map(q => {
      if (q.id === id) {
        if (q.completed) return q;
        const nextVal = q.current + amount;
        const isNowCompleted = nextVal >= q.target;
        if (isNowCompleted) {
          onGrantRewards(10, q.xp);
          onAddNotification("⚔️ DAILY QUEST COMPLETE: " + q.label, `Earned +10 coins and +${q.xp} XP!`, "success");
        }
        return { ...q, current: Math.min(q.target, nextVal), completed: isNowCompleted };
      }
      return q;
    }));
  };
  
  // Custom interactive tutor variables
  const [messages, setMessages] = useState<any[]>([
    {
      sender: "ai",
      text: "Duo here! 🦉 Welcome to your Duolingo Academy. Select a target language above, explore our global syllabus nodes, or launch the voice practice matrix to earn coins & XP!",
      time: "Now"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Vocabulary matching game & tracking states
  const [vocabQuery, setVocabQuery] = useState("");
  const [newWordText, setNewWordText] = useState("");
  const [newTransText, setNewTransText] = useState("");
  
  const [vocabGameActive, setVocabGameActive] = useState(false);
  const [vocabGameCards, setVocabGameCards] = useState<any[]>([]);
  const [selectedVocabCardIdx, setSelectedVocabCardIdx] = useState<number | null>(null);
  const [vocabMatches, setVocabMatches] = useState<number[]>([]);

  // Active quiz session states
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [sessionQuestionHistory, setSessionQuestionHistory] = useState<string[]>([]);
  const [challengerMode, setChallengerMode] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const [quizSelectionIdx, setQuizSelectionIdx] = useState<number>(0);
  const [completedQuizzesCount, setCompletedQuizzesCount] = useState<number>(0);
  const [selectedScrambleWords, setSelectedScrambleWords] = useState<string[]>([]);
  const [availableScrambleWords, setAvailableScrambleWords] = useState<string[]>([]);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [muting, setMuting] = useState<boolean>(false);
  const [drillLoading, setDrillLoading] = useState<boolean>(false);

  // Custom audio playback using native browser Speech Synthesis
  const playSpeechText = (text: string) => {
    if (muting) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Pick language matching codes to improve accents
        if (selectedLang === "Spanish") utterance.lang = "es-ES";
        else if (selectedLang === "French") utterance.lang = "fr-FR";
        else if (selectedLang === "German") utterance.lang = "de-DE";
        else if (selectedLang === "Japanese") utterance.lang = "ja-JP";
        else if (selectedLang === "Chinese") utterance.lang = "zh-CN";
        else if (selectedLang === "Arabic") utterance.lang = "ar-SA";
        else utterance.lang = "en-US";
        
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech synthesis bypass:", e);
    }
  };

  // Sound cues simulations
  const playToneSound = (type: "correct" | "incorrect" | "click") => {
    if (muting) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "correct") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "incorrect") {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15); // low buz
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (err) {
      console.log("Audio contexts offline:", err);
    }
  };

  // Placement Test session managers
  const startPlacementSession = () => {
    playToneSound("click");
    setTakingPlacement(true);
    setPlacementStep(0);
    setPlacementScore(0);
    setSelectedPlacementOpt("");
    setPlacementAnswered(false);
    setPlacementFeedback("");
    onAddNotification("Placement Test Initiated 🦉", `AI Placement Test for ${selectedLang} loaded!`, "success");
    playSpeechText(`Let's start the ${selectedLang} skill assessment!`);
  };

  const skipPlacementSessionState = () => {
    playToneSound("click");
    setPlacementTestCompleted(true);
    setPlacementLevel("Beginner");
    localStorage.setItem("duo_placement_took", "true");
    localStorage.setItem("duo_placement_level", "Beginner");
    onAddNotification("Duo Journey Started 🌱", "Beginning at Unit 1 primary registers.", "info");
  };

  const submitPlacementAnswer = (selectedOpt: string, correctAns: string, explanation: string) => {
    if (placementAnswered) return;
    setSelectedPlacementOpt(selectedOpt);
    setPlacementAnswered(true);

    const isCorrect = selectedOpt === correctAns;
    setPlacementIsCorrect(isCorrect);
    if (isCorrect) {
      playToneSound("correct");
      setPlacementScore(prev => prev + 1);
      setPlacementFeedback(`Correct! ✨ ${explanation}`);
    } else {
      playToneSound("incorrect");
      setPlacementFeedback(`Incorrect. The correct answer was "${correctAns}". ${explanation}`);
    }
  };

  const continuePlacementTest = () => {
    playToneSound("click");
    setPlacementAnswered(false);
    setSelectedPlacementOpt("");
    setPlacementFeedback("");

    if (placementStep < 4) {
      setPlacementStep(prev => prev + 1);
      const questionsList = getPlacementQuestions(selectedLang);
      setTimeout(() => {
        playSpeechText(questionsList[placementStep + 1]?.question || "");
      }, 300);
    } else {
      let determinedLevel = "Beginner";
      let unlockedLevelsCount = 0;
      let bonusXp = 100;
      let bonusCoins = 30;

      if (placementScore === 5) {
        determinedLevel = "Master";
        unlockedLevelsCount = 44;
        bonusXp = 500;
        bonusCoins = 150;
      } else if (placementScore === 4) {
        determinedLevel = "Expert";
        unlockedLevelsCount = 33;
        bonusXp = 400;
        bonusCoins = 120;
      } else if (placementScore === 3) {
        determinedLevel = "Advanced";
        unlockedLevelsCount = 22;
        bonusXp = 300;
        bonusCoins = 90;
      } else if (placementScore === 2) {
        determinedLevel = "Intermediate";
        unlockedLevelsCount = 11;
        bonusXp = 200;
        bonusCoins = 60;
      }

      setPlacementLevel(determinedLevel);
      setCompletedQuizzesCount(unlockedLevelsCount);
      onGrantRewards(bonusCoins, bonusXp);

      localStorage.setItem("duo_placement_took", "true");
      localStorage.setItem("duo_placement_level", determinedLevel);
      setPlacementTestCompleted(true);
      setTakingPlacement(false);

      onAddNotification("Placement Matrix Complete 🏆", `Skill verified as ${determinedLevel}! Unlocked ${unlockedLevelsCount} focus tiers and awarded ${bonusXp} XP + ${bonusCoins} Coins!`, "success");
      playSpeechText(`Congratulations! You placed directly into the ${determinedLevel} pathway!`);
    }
  };

  // Launch a new Duolingo practice drill session
  const startPracticeQuiz = async (levelName: string, forceHistory?: string[]) => {
    playToneSound("click");
    setDrillLoading(true);

    const activeHistory = forceHistory || sessionQuestionHistory || [];

    // Find difficulty based on level number
    let difficulty = "Beginner";
    const levelMatch = levelName.match(/Lvl\s+(\d+)/i);
    const lvlNo = levelMatch ? parseInt(levelMatch[1], 10) : 1;
    if (lvlNo > 88) difficulty = "Ultra Genius";
    else if (lvlNo > 77) difficulty = "Grandmaster";
    else if (lvlNo > 55) difficulty = "Advanced";
    else if (lvlNo > 33) difficulty = "Intermediate";

    try {
      const response = await fetch("/api/gemini/duo-drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLang,
          levelName: levelName,
          difficulty: difficulty,
          previousQuestions: activeHistory
        })
      });

      const data = await response.json();
      if (data.success && data.drill) {
        const item = data.drill;
        setActiveQuiz({
          question: item.question,
          type: item.type || "multichoice",
          options: item.options && item.options.length > 0 ? item.options : [item.correctAnswer, "Incorrect Option A", "Incorrect Option B"],
          correctAnswer: item.correctAnswer,
          shuffledWords: item.shuffledWords || [],
          speakPhrase: item.speakPhrase || item.correctAnswer,
          explanation: item.explanation || "",
          level: levelName,
          language: selectedLang
        });

        // Add to history so it doesn't get repeated
        setSessionQuestionHistory(prev => {
          const updated = [...prev];
          if (item.question && !updated.includes(item.question)) {
            updated.push(item.question);
          }
          if (item.correctAnswer && !updated.includes(item.correctAnswer)) {
            updated.push(item.correctAnswer);
          }
          return updated;
        });

        if (item.type === "scramble") {
          const words = item.shuffledWords && item.shuffledWords.length > 0
            ? [...item.shuffledWords]
            : (item.correctAnswer || "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(" ");
          setAvailableScrambleWords([...words].sort(() => Math.random() - 0.5));
          setSelectedScrambleWords([]);
        }
        
        setQuizAnswered(false);
        setQuizFeedback("");
        onAddNotification("Duo Lesson Loaded 🦉", `Lesson "${levelName}" (${difficulty}) initiated!`, "info");
        
        setTimeout(() => {
          playSpeechText(item.speakPhrase || item.correctAnswer || "");
        }, 550);
      } else {
        throw new Error("Remote API response marked failed");
      }
    } catch (e) {
      console.warn("Gemini drill API offline, utilizing high-fidelity local generator:", e);
      const generatedDrill = getLocalFallbackDrill(selectedLang, levelName, activeHistory);
      
      setActiveQuiz({
        ...generatedDrill,
        level: levelName,
        language: selectedLang
      });

      setSessionQuestionHistory(prev => {
        const updated = [...prev];
        if (generatedDrill.question && !updated.includes(generatedDrill.question)) {
          updated.push(generatedDrill.question);
        }
        if (generatedDrill.correctAnswer && !updated.includes(generatedDrill.correctAnswer)) {
          updated.push(generatedDrill.correctAnswer);
        }
        return updated;
      });

      if (generatedDrill.type === "scramble") {
        setAvailableScrambleWords([...generatedDrill.shuffledWords].sort(() => Math.random() - 0.5));
        setSelectedScrambleWords([]);
      }
      setQuizAnswered(false);
      setQuizFeedback("");

      onAddNotification("Duo Lesson Loaded 🦉", `Milestone Lesson "${levelName}" offline.`, "info");
      
      setTimeout(() => {
        playSpeechText(generatedDrill.speakPhrase || "");
      }, 550);
    } finally {
      setDrillLoading(false);
    }
  };

  // Check the student's answer
  const submitQuizAnswer = (userAns: string) => {
    if (quizAnswered) return;
    setSelectedOpt(userAns);
    
    let isCorrect = false;
    let feedback = "";
    
    if (activeQuiz.type === "multichoice") {
      isCorrect = userAns === activeQuiz.correctAnswer;
      feedback = isCorrect 
        ? "Amazing work! Your translation is flawless. Keep it up! ✨" 
        : `Whoops! The correct answer was "${activeQuiz.correctAnswer}". Remember to observe the accent variables!`;
    } else if (activeQuiz.type === "scramble") {
      const compiled = userAns.trim().toLowerCase();
      const goal = activeQuiz.correctAnswer.trim().toLowerCase();
      isCorrect = compiled === goal;
      feedback = isCorrect 
        ? "Excellent sentence syntax construction! You assembled the path perfectly! Double XP points granted!" 
        : `Ah, that sequence wasn't quite right. The expected layout is: "${activeQuiz.correctAnswer}"`;
    }
    
    setQuizIsCorrect(isCorrect);
    setQuizAnswered(true);
    setQuizFeedback(feedback);
    
    if (isCorrect) {
      playToneSound("correct");
      const multiplierCoins = challengerMode ? 16 : 8;
      const multiplierXp = challengerMode ? 40 : 20;
      if (onGrantRewards) {
        onGrantRewards(multiplierCoins, multiplierXp); // Give Coins & XP
      }
      setCompletedQuizzesCount(prev => prev + 1);
      
      // Update Daily Quests
      tickQuest("quest_1", 1);
      tickQuest("quest_2", multiplierXp);

      // Save to Vocab Bank
      if (activeQuiz.correctAnswer && activeQuiz.correctAnswer.length < 50) {
        setVocabBank(prev => {
          const cleanW = activeQuiz.correctAnswer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¡!]/g,"").trim();
          if (prev.some(v => v.word.toLowerCase() === cleanW.toLowerCase())) {
            return prev.map(v => v.word.toLowerCase() === cleanW.toLowerCase() 
              ? { ...v, strength: Math.min(100, v.strength + 10), attempts: v.attempts + 1 } 
              : v);
          }
          return [...prev, {
            word: cleanW,
            translation: activeQuiz.question ? activeQuiz.question.replace(/^Choose the correct translation for.*:\s*/i, "").replace(/"/g, "") : "New Phrase",
            language: selectedLang,
            strength: 85,
            attempts: 1
          }];
        });
      }

      onAddNotification("Correct! 🌟", `Earned ${multiplierCoins} Coins & ${multiplierXp} XP. Your learning streak is fortified!`, "success");
    } else {
      playToneSound("incorrect");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      
      const deductAmount = challengerMode ? 2 : 1;
      const updatedHearts = unlimitedHearts ? 5 : Math.max(0, hearts - deductAmount);
      setHearts(updatedHearts);
      
      if (!unlimitedHearts) {
        onAddNotification("Incorrect Answer ⚠️", `Lost ${deductAmount} Heart${deductAmount > 1 ? "s" : ""}! Keep reviewing your vocabulary guidelines.`, "alert");
        if (updatedHearts === 0) {
          onAddNotification("No Hearts Left! 🛑", "Your health index hit 0. Refill with 10 Coins, or practice on earlier modules!", "alert");
        }
      } else {
        onAddNotification("Incorrect, but Hearts Unlimited!", "Your Premium Unlimited Hearts shield protected you from health deduction!", "info");
      }
    }
  };

  // Scramble interactives helper
  const handleWordClick = (word: string, isFromAvailable: boolean) => {
    playToneSound("click");
    if (isFromAvailable) {
      setSelectedScrambleWords(prev => [...prev, word]);
      setAvailableScrambleWords(prev => prev.filter(w => w !== word));
    } else {
      setAvailableScrambleWords(prev => [...prev, word]);
      setSelectedScrambleWords(prev => prev.filter(w => w !== word));
    }
  };

  // Vocab Match Game setup
  const startVocabularyMatchGame = () => {
    playToneSound("click");
    // Pick words in the selected language
    const langW = vocabBank.filter(v => v.language.toLowerCase() === selectedLang.toLowerCase());
    const pool = langW.length >= 4 ? langW : vocabBank;
    const finalWords = pool.slice(0, 4);

    const cardsList: any[] = [];
    finalWords.forEach((item, index) => {
      cardsList.push({
        id: index * 2,
        val: item.word,
        pairId: index,
        type: "word"
      });
      cardsList.push({
        id: index * 2 + 1,
        val: item.translation,
        pairId: index,
        type: "translation"
      });
    });

    setVocabGameCards(cardsList.sort(() => Math.random() - 0.5));
    setVocabGameActive(true);
    setSelectedVocabCardIdx(null);
    setVocabMatches([]);
    onAddNotification("Vocab Match Begun! 🧩", "Quickly align the translations on the board!", "info");
  };

  const handleSelectVocabularyCard = (clickedIdx: number) => {
    playToneSound("click");
    if (vocabMatches.includes(clickedIdx)) return;

    if (selectedVocabCardIdx === null) {
      setSelectedVocabCardIdx(clickedIdx);
      return;
    }

    if (selectedVocabCardIdx === clickedIdx) {
      setSelectedVocabCardIdx(null);
      return;
    }

    const firstCard = vocabGameCards[selectedVocabCardIdx];
    const secondCard = vocabGameCards[clickedIdx];

    if (firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
      const nextMatches = [...vocabMatches, selectedVocabCardIdx, clickedIdx];
      setVocabMatches(nextMatches);
      setSelectedVocabCardIdx(null);
      playToneSound("correct");

      const wordStr = firstCard.type === "word" ? firstCard.val : secondCard.val;
      setVocabBank(prev => prev.map(v => {
        if (v.word.toLowerCase() === wordStr.toLowerCase()) {
          return { ...v, strength: Math.min(100, v.strength + 20), attempts: v.attempts + 1 };
        }
        return v;
      }));

      if (nextMatches.length === vocabGameCards.length) {
        if (onGrantRewards) {
          onGrantRewards(15, 30);
        }
        onAddNotification("Match Complete! 🎉", "Fabulous! You matched all options! Earned +15 Coins & +30 XP.", "success");
        setVocabGameActive(false);
        tickQuest("quest_4", 3);
      }
    } else {
      playToneSound("incorrect");
      setSelectedVocabCardIdx(null);
      onAddNotification("Match Failed", "The cards didn't pair up. Try another combination!", "alert");
    }
  };

  // Help refill hearts using Duolingo coins system
  const refillHeartsWithCoins = () => {
    if (hearts >= 5) {
      alert("Your hearts list is already maximum! Keep studying to maintain high focus levels.");
      return;
    }
    
    if (onDeductCoins && onDeductCoins(10)) {
      setHearts(5);
      playToneSound("correct");
      onAddNotification("Hearts Restored! ❤️", "Subscribed 10 local Coins. Full 5/5 lives reloaded successfully!", "success");
    } else {
      onAddNotification("Insufficient Coins 🪙", "You need 10 Coins to buy a standard hearts refill. Study mock drills to earn more!", "alert");
    }
  };

  // Refill hearts with 10 Nexa Coins instead of ads
  const triggerRewardedAdHearts = () => {
    if (hearts >= 5) {
      alert("Your hearts list is already maximum! Keep studying to maintain high focus levels.");
      return;
    }
    if (onDeductCoins && onDeductCoins(10)) {
      setHearts(5);
      playToneSound("correct");
      onAddNotification("Hearts Refilled! ❤️", "Spent 10 Nexa Coins. Full 5/5 lives reloaded successfully!", "success");
      alert("🎁 Hearts refilled successfully! You have received a full Hearts refill (5/5 lives).");
    } else {
      onAddNotification("Insufficient Coins 🪙", "You need 10 Nexa Coins to buy a standard hearts refill. Study mock drills to earn more!", "alert");
      alert("Insufficient Coins! You need 10 Nexa Coins to buy a hearts refill.");
    }
  };

  // Chat/tutor interaction mechanics
  const handleChatWithTutor = async () => {
    const text = chatInput.trim();
    if (!text) return;
    
    setChatInput("");
    setMessages(prev => [...prev, { sender: "student", text, time: "Now" }]);
    setAiLoading(true);

    try {
      if (onDeductCoins) {
        const hasCoins = onDeductCoins(3);
        if (!hasCoins) {
          onAddNotification("Insufficient Coins 🪙", "Custom chat costs 3 coins per message, please train in Duo practice nodes instead!", "alert");
          setAiLoading(false);
          return;
        }
      }

      const response = await fetch("/api/gemini/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          chatHistory: messages.slice(-5),
          language: selectedLang,
          mode: "Duolingo Direct Conversational Tutor",
          standard: "Standard Primary / Kids / High School Level"
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { sender: "ai", text: data.reply, time: "Now" }]);
        playSpeechText(data.reply);
        // Random study reward
        if (Math.random() > 0.6) {
          onGrantRewards(3, 5);
        }
      } else {
        throw new Error();
      }
    } catch {
      // simulated response
      setTimeout(() => {
        const mockResponses = [
          `Fabulous! "${text}" is written wonderfully. Keep speaking in ${selectedLang} to increase your daily fluency multiplier!`,
          `Great grammar assembly under the syllabus module! Let's practice active verb conjugation now. Try typing the word for "hello" again!`,
          `Your sentence flow is looking highly polished. That earns +5 extra XP index points!`
        ];
        const randomReply = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        setMessages(prev => [...prev, { sender: "ai", text: randomReply, time: "Now" }]);
        playSpeechText(randomReply);
      }, 750);
    } finally {
      setAiLoading(false);
    }
  };

  const activeSyllabusData = generate100PlusLevels(selectedLang);

  return (
    <div id="duolingo_companion_root" className="space-y-6 text-left animate-fade-in max-w-7xl mx-auto pb-24 text-white font-sans">
      
      {/* BRAND DUOLINGO APPRECIATION HEADER */}
      <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#22C55E]/20 via-[#00E5FF]/10 to-transparent border border-[#22C55E]/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#22C55E]/15 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#58CC02] rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg animate-bounce select-none border border-[#84D814]">
            Duo
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black text-[#58CC02] tracking-widest bg-[#58CC02]/10 border border-[#58CC02]/20 px-3 py-0.5 rounded-full uppercase inline-block">
              🦉 Duolingo World Copy Mode
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white font-display">
              NexaLearn Language Paths
            </h2>
            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
              Experience a complete gamified copy of Duolingo featuring continuous step-by-step game maps, interactive translation drills, the whole world curriculum syllabus, and active Heart Lifelines!
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="py-2 px-4 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-mono font-black text-gray-200 border border-white/10 rounded-xl uppercase tracking-wider cursor-pointer"
        >
          Return to Hub
        </button>
      </div>

      {/* RECEPTIVE UPPER STATS CONTROL BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1: Main Target Language Selector */}
        <div className="bg-[#10141f] border border-white/5 rounded-[22px] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider block">Target Language</span>
            <select 
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                setMessages([{ sender: "ai", text: `Welcome to the ${e.target.value} academy! Grab your 5 hearts lifelines and advance!`, time: "Now" }]);
                playSpeechText(`Welcome to ${e.target.value} academy`);
              }}
              className="bg-black/60 border border-white/10 font-black text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#58CC02] cursor-pointer"
            >
              {AVAILABLE_LANGUAGES.map(langName => (
                <option key={langName} value={langName} className="bg-[#090b11] text-white">
                  {langName}
                </option>
              ))}
            </select>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Languages className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: Active Hearts Lives */}
        <div className="bg-[#10141f] border border-white/5 rounded-[22px] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider block">Life Hearts</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white">{hearts} / 5</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <Heart 
                    key={idx} 
                    className={`w-3.5 h-3.5 ${idx <= hearts ? "fill-[#FF4B4B] text-[#FF4B4B]" : "text-gray-600"}`} 
                  />
                ))}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={refillHeartsWithCoins}
            title="Refill 5 hearts for 10 coins"
            className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-[#FF4B4B] rounded-xl flex items-center justify-center border border-red-400/20 cursor-pointer transition-all"
          >
            <PlusCircleIcon className="w-5 h-5 animate-pulse" />
          </button>
        </div>

        {/* Stat 3: Coins Counter */}
        <div className="bg-[#10141f] border border-white/5 rounded-[22px] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider block">Coins Reward</span>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-black text-amber-400">{profile?.coins || 0} NEXA</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 text-amber-300 rounded-xl flex items-center justify-center border border-amber-500/20">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4: Learning Streak */}
        <div className="bg-[#10141f] border border-white/5 rounded-[22px] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider block">Consecutive Vectors</span>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-sm font-black text-orange-400">12 Days Streak</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center border border-orange-500/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* INTERACTIVE NAVIGATION CONTROL PILLS */}
      <div className="flex flex-wrap gap-2.5 border-b border-white/5 pb-3">
        <button
          onClick={() => { setExploreView("learn"); playToneSound("click"); }}
          className={`px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
            exploreView === "learn"
              ? "bg-[#58CC02] text-black border-[#58CC02]"
              : "bg-black/30 border-white/5 text-gray-300 hover:text-white"
          }`}
        >
          <MapIcon className="w-4 h-4" />
          1. Learn (Lesson Map)
        </button>

        <button
          onClick={() => { setExploreView("solve"); playToneSound("click"); }}
          className={`px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
            exploreView === "solve"
              ? "bg-[#00E5FF] text-black border-[#00E5FF]"
              : "bg-black/30 border-white/5 text-gray-300 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          2. Solve (Drills)
        </button>

        <button
          onClick={() => { setExploreView("practice"); playToneSound("click"); }}
          className={`px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
            exploreView === "practice"
              ? "bg-[#7B61FF] text-white border-[#7B61FF]"
              : "bg-black/30 border-white/5 text-gray-300 hover:text-white"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          3. Practice (Talk Agent)
        </button>

        <button
          onClick={() => { setExploreView("shop"); playToneSound("click"); }}
          className={`px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
            exploreView === "shop"
              ? "bg-[#FFC000] text-black border-[#FFC000]"
              : "bg-black/30 border-white/5 text-gray-300 hover:text-white"
          }`}
        >
          <Trophy className="w-4 h-4" />
          4. Duo League & Shop
        </button>

        <button
          onClick={() => { setExploreView("syllabus"); playToneSound("click"); }}
          className={`px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
            exploreView === "syllabus"
              ? "bg-slate-700 text-white border-slate-600"
              : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Book className="w-4 h-4" />
          Syllabus
        </button>

        <button
          onClick={() => { setExploreView("vocab"); playToneSound("click"); }}
          className={`px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
            exploreView === "vocab"
              ? "bg-[#CCFF00] text-black border-[#CCFF00]"
              : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Vocab Bank
        </button>

        <button
          onClick={() => { setExploreView("leagues"); playToneSound("click"); }}
          className={`px-4.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
            exploreView === "leagues"
              ? "bg-[#00E5FF] text-black border-[#00E5FF]"
              : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Trophy className="w-4 h-4" />
          🏆 Leagues & Quests
        </button>

        <button
          onClick={() => { setChallengerMode(!challengerMode); playToneSound("click"); }}
          className={`px-4.5 py-2.5 rounded-2xl text-xs font-mono font-black uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-2 ${
            challengerMode
              ? "bg-[#FF4B4B] text-white border-[#FF4B4B] shadow-[0_0_15px_rgba(255,75,75,0.4)] animate-pulse"
              : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
          }`}
          title="Enable Duolingo Hard Mode Bonus: 2x Rewards but double HP deduction!"
        >
          <Zap className={`w-4 h-4 ${challengerMode ? "fill-white text-white" : ""}`} />
          🔥 HARD MODE: {challengerMode ? "ACTIVE (2x XP)" : "OFF"}
        </button>

        <button
          onClick={() => setMuting(!muting)}
          className={`ml-auto px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider border cursor-pointer bg-black/30 border-white/5 text-gray-400`}
        >
          {muting ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#58CC02]" />}
        </button>
      </div>

      {/* MAIN VIEWPORT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN A: LEFT BLOCK WITH PATHWAYS, SYLLABUSES OR CUSTOM CHAT */}
        <div className="lg:col-span-8 space-y-6">

          {/* VIEW Option 1: DUOLINGO LEARN (CONTINUOUS SNAKE PATHWAYS MAP) */}
          {exploreView === "learn" && (
            <div className="space-y-6">
              
              {/* ADAPTIVE PLACEMENT ENGINE */}
              {takingPlacement ? (
                <div className="bg-[#111625] border-2 border-[#CCFF00] rounded-[32px] p-6 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/10 blur-2xl pointer-events-none rounded-full" />
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl animate-pulse">🦉</span>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase font-mono tracking-wider">Duo Adaptive Diagnostic Test</h4>
                        <span className="text-[10px] text-gray-400 font-mono block">Custom-tailored question {placementStep + 1} of 5</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setTakingPlacement(false); playToneSound("click"); }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-gray-400 hover:text-white border border-white/5 cursor-pointer transition-all uppercase font-mono font-bold"
                    >
                      Quit Test
                    </button>
                  </div>

                  {(() => {
                    const qList = getPlacementQuestionsForLanguage(selectedLang);
                    const currentQ = qList[placementStep];
                    if (!currentQ) return null;

                    return (
                      <div className="space-y-6 text-left">
                        <div className="p-5 bg-[#CCFF00]/5 rounded-[22px] border border-[#CCFF00]/15 relative">
                          <span className="text-[9px] font-mono text-[#CCFF00] block uppercase tracking-widest font-black mb-1">
                            MODULE SKILL METRICS: {currentQ.diff}
                          </span>
                          <p className="text-sm font-sans font-black text-white leading-relaxed">
                            {currentQ.q}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {currentQ.opts.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                playToneSound("click");
                                const isCorrect = opt === currentQ.ans;
                                const nextScore = placementScore + (isCorrect ? 1 : 0);
                                if (isCorrect) {
                                  setPlacementScore(nextScore);
                                }

                                if (placementStep < 4) {
                                  setPlacementStep(prev => prev + 1);
                                } else {
                                  // Finished placement test
                                  let assignedLvl = "Beginner";
                                  let resolvedUnit = 0;
                                  if (nextScore >= 5) { assignedLvl = "Master / Expert"; resolvedUnit = 3; }
                                  else if (nextScore >= 4) { assignedLvl = "Advanced"; resolvedUnit = 2; }
                                  else if (nextScore >= 2) { assignedLvl = "Intermediate"; resolvedUnit = 1; }

                                  setPlacementLevel(assignedLvl);
                                  setActiveUnit(resolvedUnit);
                                  setPlacementTestCompleted(true);
                                  setTakingPlacement(false);
                                  localStorage.setItem("duo_placement_took", "true");
                                  localStorage.setItem("duo_placement_level", assignedLvl);

                                  if (onGrantRewards) {
                                    onGrantRewards(50, 200);
                                  }
                                  onAddNotification("Placement Matrix Complete! ✨", `Skill evaluated: ${assignedLvl}! Unlocked corresponding chapters. Recieved +50 coins and +200 XP!`, "success");
                                  playToneSound("correct");
                                }
                              }}
                              className="p-4 bg-black/50 hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/70 border border-white/5 rounded-2xl text-left text-xs text-gray-300 hover:text-white cursor-pointer transition-all active:scale-[0.99] font-mono flex items-center justify-between"
                            >
                              <span>{opt}</span>
                              <span className="text-[9px] text-[#CCFF00] uppercase font-bold tracking-widest opacity-0 hover:opacity-100 font-mono">Select Option →</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : !placementTestCompleted ? (
                <div className="bg-gradient-to-r from-indigo-950/45 to-purple-900/40 border border-purple-500/30 rounded-[32px] p-6 text-left relative overflow-hidden space-y-4 shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />
                  <div className="flex items-center gap-3">
                    <div className="text-4xl animate-bounce select-none">🦉</div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest font-black block">INTELLIGENT DIAGNOSTIC LEVEL</span>
                      <h4 className="text-md font-black text-white">Unlock Adaptive Syllabus Map Faster</h4>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 leading-normal max-w-xl">
                    Not sure what your active fluency rank is? Skip standard repetitive Beginner drills! Complete Duo's 5-minute diagnostic placement test to set your custom roadmap (Beginner, Intermediate, Advanced, Grandmaster) and earn a bonus reward pool of <b>+50 Gold Coins</b> and <b>+200 XP</b>!
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => {
                        setTakingPlacement(true);
                        setPlacementStep(0);
                        setPlacementScore(0);
                        playToneSound("click");
                      }}
                      className="px-5 py-2.5 bg-[#58CC02] hover:bg-[#84D814] text-black font-mono font-black text-xs uppercase rounded-xl border-none cursor-pointer tracking-wider transition-all"
                    >
                      🚀 Take Placement Test
                    </button>
                    <button
                      onClick={() => {
                        setPlacementTestCompleted(true);
                        onAddNotification("Path Initialized", "Curriculum started manually at Chapter 1 (Beginner).", "info");
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs uppercase rounded-xl border border-white/5 cursor-pointer transition-all"
                    >
                      Skip as Beginner
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-left flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-black">Syllabus Placement Determined</span>
                      <p className="text-xs text-gray-200">
                        You have successfully placed into the <b className="text-emerald-400">{placementLevel}</b> curriculum node. Let's conquer the course!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPlacementTestCompleted(false);
                      setTakingPlacement(true);
                      setPlacementStep(0);
                      setPlacementScore(0);
                      playToneSound("click");
                    }}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase rounded-lg border border-emerald-500/25 cursor-pointer transition-all"
                  >
                    Retake Test
                  </button>
                </div>
              )}

              {!takingPlacement && activeSyllabusData.map((unitObj, unitIndex) => (
                <div key={unitObj.unit} className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 relative overflow-hidden space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#58CC02] uppercase tracking-widest font-black block">
                        {unitObj.unit}: {selectedLang} Language Course
                      </span>
                      <h3 className="text-lg font-black text-white">{unitObj.title}</h3>
                      <p className="text-xs text-gray-400 max-w-lg">{unitObj.desc}</p>
                    </div>
                    <span className="text-[10px] uppercase font-mono font-black text-[#58CC02] px-3 py-1 bg-[#58CC02]/5 border border-[#58CC02]/10 rounded-full">
                      Unit Score: {completedQuizzesCount * 10} XP
                    </span>
                  </div>

                  {/* DUOLINGO STEP SNAKE MAP PATH */}
                  <div className="py-8 flex flex-col items-center relative min-h-[300px]">
                    {/* SVG Connector Line behind steps to feel like duolingo */}
                    <div className="absolute inset-y-0 w-2.5 bg-[#424d62]/50 left-1/2 -translate-x-1/2 rounded-full" />

                    <div className="flex flex-col gap-10 items-center w-full max-w-sm relative z-10">
                      {unitObj.levels.map((lvl, levelIdx) => {
                        // Zig Zag positioning variables
                        const alignmentClass = levelIdx % 3 === 0 
                          ? "translate-x-0" 
                          : levelIdx % 3 === 1 
                            ? "translate-x-12" 
                            : "-translate-x-12";
                        
                        const completed = levelIdx < completedQuizzesCount || unitIndex < activeUnit;
                        const isNextActive = levelIdx === completedQuizzesCount && unitIndex === activeUnit;
                        const locked = !completed && !isNextActive;

                        return (
                          <div key={lvl} className={`flex flex-col items-center text-center transition-all ${alignmentClass}`}>
                            <button
                              disabled={locked || hearts <= 0}
                              onClick={() => startPracticeQuiz(lvl)}
                              className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer font-black text-xl transition-all relative group shadow-md ${
                                completed
                                  ? "bg-[#58CC02] text-white border-2 border-[#58CC02]"
                                  : isNextActive
                                    ? "bg-[#FFC000] text-black border-4 border-yellow-300 animate-scale-up-down"
                                    : "bg-[#202f3c] text-gray-500 border-2 border-slate-700 cursor-not-allowed"
                              }`}
                            >
                              {completed ? "✓" : isNextActive ? "⭐" : <Lock className="w-4 h-4 text-gray-500" />}

                              {/* Hover active speech bubble */}
                              {!locked && (
                                <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-[#58CC02] text-black text-[9px] font-mono font-black py-1 px-2.5 rounded-xl uppercase transition-all whitespace-nowrap z-50">
                                  {completed ? "Review Level" : "START DRILL!"}
                                </div>
                              )}
                            </button>
                            
                            <span className={`text-[10px] mt-2 font-black tracking-tight ${locked ? "text-gray-500" : "text-white"}`}>
                              {lvl}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW Option 2: DUOLINGO SOLVE (INTERACTIVE DRILLS / PUZZLES) */}
          {exploreView === "solve" && (
            <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 space-y-6">
              <div className="border-b border-white/5 pb-4 space-y-1">
                <span className="text-[10px] uppercase font-black text-[#00E5FF] font-mono tracking-widest block">
                  Interactive Exercise Suite
                </span>
                <h3 className="text-xl font-black text-white">
                  Duo Solve & Practice Board
                </h3>
                <p className="text-xs text-gray-400">
                  Select any category to test your language skills! Solve multiple-choice sentence builders, accent checkers, or word scrambles based on your current level.
                </p>
              </div>

              {/* Grid of Interactive Drills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: "basic_salut",
                    title: "👋 Greetings & Intros Drill",
                    desc: "Perfect your greetings register. Focus on standard hello/goodbye translations.",
                    difficulty: "Beginner",
                    xp: "+20 XP",
                    badge: "Essential"
                  },
                  {
                    id: "cafeteria_drills",
                    title: "🍔 Restaurant & Food Ordering",
                    desc: "Order cafe item sets, settle receipts, and request dessert builders.",
                    difficulty: "Intermediate",
                    xp: "+20 XP",
                    badge: "Situational"
                  },
                  {
                    id: "directions_unscrambler",
                    title: "🗺️ Travel & Map Unscrambler",
                    desc: "Arrange words to ask for locations. Focus on correct sentence syntax.",
                    difficulty: "Beginner",
                    xp: "+20 XP",
                    badge: "Structure"
                  },
                  {
                    id: "grammar_master",
                    title: "📜 Core Grammar Block Quiz",
                    desc: "Conjugate vital helping verbs, negation traps, and personal pronouns correctly.",
                    difficulty: "Advanced",
                    xp: "+20 XP",
                    badge: "Theory"
                  },
                  {
                    id: "business_pitch",
                    title: "💼 Workplace & Career Pitch",
                    desc: "Advance standard business terms, developer registers, and client emails.",
                    difficulty: "High Grade",
                    xp: "+20 XP",
                    badge: "Professional"
                  }
                ].map((drill) => (
                  <div key={drill.id} className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-[#00E5FF]/30 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-black text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {drill.badge}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">{drill.difficulty}</span>
                      </div>
                      <h4 className="text-sm font-black text-white">{drill.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{drill.desc}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-xs font-mono font-bold text-emerald-400">{drill.xp} Rewards</span>
                      <button
                        onClick={() => {
                          if (hearts <= 0) {
                            alert("You have no hearts left! Please reload hearts under the Shop tab first.");
                            return;
                          }
                          startPracticeQuiz(drill.title);
                        }}
                        className="py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 active:scale-95 text-white font-black text-xs font-mono uppercase rounded-xl border-none transition-all cursor-pointer"
                      >
                        Solve Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fast Infinite Drill Box */}
              <div className="bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-2xl p-5 text-center space-y-3">
                <span className="text-[15px] block">🦉</span>
                <h4 className="text-xs font-mono uppercase font-black text-[#00E5FF] tracking-wider">Duo Random Solver Mode</h4>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  Feeling confident? Let Duo pitch a completely random surprise puzzle from our active language database directly to you!
                </p>
                <button
                  onClick={() => {
                    if (hearts <= 0) {
                      alert("You have no hearts left! Please buy a refill.");
                      return;
                    }
                    startPracticeQuiz("Surprise Random Drill");
                  }}
                  className="py-2.5 px-6 bg-[#00E5FF] hover:bg-cyan-400 text-black font-black text-xs uppercase font-mono rounded-xl border-none transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  🚀 Launch Surprise Drill
                </button>
              </div>
            </div>
          )}

          {/* VIEW Option 3: WHOLE WORLD SYLLABUS CURRICULUM EXPLORER */}
          {exploreView === "syllabus" && (
            <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 space-y-6">
              <div className="border-b border-white/5 pb-4 space-y-1">
                <span className="text-[10px] uppercase font-black text-cyan-400 font-mono tracking-widest block">
                  Interactive Global Syllabus Node
                </span>
                <h3 className="text-xl font-black text-white">
                  Whole World Syllabus Grid
                </h3>
                <p className="text-xs text-gray-400">
                  Select a language below or scroll through to preview the fully structured curriculum covering kids, intermediate, and university level fluency:
                </p>
              </div>

              {/* Language syllabus tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVAILABLE_LANGUAGES.map(langName => {
                  const active = selectedLang === langName;
                  return (
                    <button
                      key={langName}
                      onClick={() => {
                        setSelectedLang(langName);
                        playToneSound("click");
                        onAddNotification("Syllabus Switched", `Reviewing full global pathways for: ${langName}`, "info");
                      }}
                      className={`py-3 px-4 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between cursor-pointer ${
                        active
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500"
                          : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span>{langName}</span>
                      <span className="text-[10px] text-gray-500">View →</span>
                    </button>
                  );
                })}
              </div>

              {/* Curriculums detailed breakdown cards */}
              <div className="space-y-4 pt-1">
                <h4 className="text-xs font-black uppercase text-gray-400 font-mono tracking-wider">
                  Active {selectedLang} Path Curriculum:
                </h4>

                <div className="space-y-4">
                  {activeSyllabusData.map((unitItem, uIdx) => (
                    <div key={unitItem.unit} className="bg-black/40 border border-white/7 rounded-2xl p-4.5 space-y-3.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-400/5 border border-cyan-400/10 px-2 py-0.5 rounded-full uppercase">
                          {unitItem.unit}
                        </span>
                        <span className="text-[9px] text-[#22C55E] uppercase font-mono tracking-widest font-black">
                          {uIdx === 0 ? "Standard 1st to 4th (Primary)" : uIdx === 1 ? "Standard 5th to 8th (Middle)" : uIdx === 2 ? "Standard 9th to 12th (High)" : "University & Pro Grade"}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-black text-white">{unitItem.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">{unitItem.desc}</p>

                      <div className="pt-2 border-t border-white/2 flex flex-wrap gap-2">
                        {unitItem.levels.map(l => (
                          <span key={l} className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                            🟢 {l} Focus Block
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW Option 4: DUO SHOP & DIAMOND LEAGUE LEADERBOARD */}
          {exploreView === "shop" && (
            <div className="space-y-6">
              {/* Powerups store section */}
              <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 space-y-6">
                <div className="border-b border-white/5 pb-4 space-y-1">
                  <span className="text-[10px] uppercase font-black text-amber-400 font-mono tracking-widest block">
                    Duolingo Official Item Store
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Power-ups & Hearts Refills
                  </h3>
                  <p className="text-xs text-gray-400">
                    Trade your hard-earned Nexa Coins with Owl Duo to unlock premium tools, live hearts, or booster multipliers!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Hearts Refill */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4.5 text-center flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="text-2xl">❤️</div>
                      <h4 className="text-sm font-mono font-black text-white">Hearts Full Refill</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Instantly restores your full 5/5 lives index so you can make more mistakes without halts.
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-amber-400 font-mono font-bold mb-2">Cost: 10 Coins</div>
                      <button
                        onClick={triggerRewardedAdHearts}
                        className="w-full py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 text-white font-mono font-black text-xs uppercase rounded-xl border-none transition-all cursor-pointer"
                      >
                        Refill Hearts
                      </button>
                    </div>
                  </div>

                  {/* Double XP Pot */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4.5 text-center flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="text-2xl">🧪</div>
                      <h4 className="text-sm font-mono font-black text-white">Double XP Potion</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Earn double XP on all correctly solved multiple choice items for the next 4 hours!
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-amber-400 font-mono font-bold mb-2">Cost: 15 Coins</div>
                      <button
                        onClick={() => {
                          if (onDeductCoins && onDeductCoins(15)) {
                            playToneSound("correct");
                            onAddNotification("Double XP Active! 🧪", "Duo granted a 2x modifier. Study more to maximize rewards!", "success");
                            alert("🧪 Double XP potion bought successfully! Multiplier is now active for 4 hours!");
                          } else {
                            onAddNotification("Insufficient Coins", "Solve more quiz items to gain gold coins first!", "alert");
                            alert("Oops! Insufficient coins to buy the Double XP potion.");
                          }
                        }}
                        className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white font-mono font-black text-xs uppercase rounded-xl border-none transition-all cursor-pointer"
                      >
                        Buy Booster
                      </button>
                    </div>
                  </div>

                  {/* Streak Freeze */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4.5 text-center flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="text-2xl">❄️</div>
                      <h4 className="text-sm font-mono font-black text-white">Streak Freeze</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Keeps your consecutive daily learning streak intact even if you skip a study day tomorrow.
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-amber-400 font-mono font-bold mb-2">Cost: 8 Coins</div>
                      <button
                        onClick={() => {
                          if (onDeductCoins && onDeductCoins(8)) {
                            playToneSound("correct");
                            onAddNotification("Streak Frozen! ❄️", "Your learning streak is safely locked using Duo's freeze potion.", "success");
                            alert("❄️ Streak Freeze equipped successfully! Your 12-day streak is secure.");
                          } else {
                            onAddNotification("Insufficient Coins", "Study more questions to gain coins first!", "alert");
                            alert("Oops! Insufficient coins to buy the Streak Freeze.");
                          }
                        }}
                        className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-white font-mono font-black text-xs uppercase rounded-xl border-none transition-all cursor-pointer"
                      >
                        Buy Freeze
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diamond League Leaderboard section */}
              <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#00E5FF] font-black uppercase tracking-widest block">💎 DUOLINGO WORLD STAGE</span>
                    <h4 className="text-base font-black text-white">The Diamond League Standings</h4>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2.5 py-1 rounded">Promotion Zone active</span>
                </div>

                <div className="space-y-2.5 font-sans">
                  {[
                    { rank: 1, name: "🏆 Student Leader", xp: 2840, isUser: false, avatar: "🥇" },
                    { rank: 2, name: "QuantumScholar", xp: 2450, isUser: false, avatar: "🥈" },
                    { rank: 3, name: "ActiveNode_99", xp: 1980, isUser: false, avatar: "🥉" },
                    { rank: 4, name: "You", xp: (completedQuizzesCount * 20) + 120, isUser: true, avatar: "🦉" },
                    { rank: 5, name: "AuraFluency", xp: 140, isUser: false, avatar: "🤠" }
                  ]
                    .sort((a, b) => b.xp - a.xp)
                    .map((runner, index) => (
                      <div
                        key={runner.name}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          runner.isUser 
                            ? "bg-[#58CC02]/10 border-[#58CC02] text-white font-extrabold" 
                            : "bg-black/30 border-white/5 text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-black text-gray-500 w-5">#{index + 1}</span>
                          <span className="text-sm">{runner.avatar}</span>
                          <span className="text-xs font-bold font-mono">{runner.name} {runner.isUser && "(Current Session)"}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-amber-400">{runner.xp} XP</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW Option: SMART VOCAB BANK */}
          {exploreView === "vocab" && (
            <div className="space-y-6">
              
              {/* Matching game element */}
              {vocabGameActive ? (
                <div className="bg-[#111625] border-2 border-[#CCFF00] rounded-[32px] p-6 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#CCFF00] uppercase font-black tracking-widest block">Nexa Vocab Matrix</span>
                      <h4 className="text-base font-black text-white">Active Speed-Matching Trial</h4>
                    </div>
                    <button 
                      onClick={() => setVocabGameActive(false)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs text-gray-300 rounded-lg border-none cursor-pointer font-mono"
                    >
                      Quit Match
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-400">Match the native spelling to the corresponding english meaning! Pair them up correctly to boost retention score.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {vocabGameCards.map((card, idx) => {
                      const matched = vocabMatches.includes(idx);
                      const selected = selectedVocabCardIdx === idx;
                      return (
                        <button
                          key={card.id}
                          disabled={matched}
                          onClick={() => handleSelectVocabularyCard(idx)}
                          className={`p-4 h-20 rounded-2xl border text-center flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                            matched 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400/40 opacity-40 cursor-not-allowed" 
                              : selected
                                ? "bg-amber-400 text-black border-amber-400 scale-[1.02] shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                                : "bg-black/40 border-white/5 text-white hover:border-[#CCFF00] hover:bg-[#CCFF00]/5"
                          }`}
                        >
                          <span>{card.val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 space-y-6">
                  
                  {/* Title Bar */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-[#CCFF00] font-mono tracking-widest block">PERSONAL KNOWLEDGE RETENTION</span>
                      <h3 className="text-xl font-black text-white">Your Smart Vocabulary Bank</h3>
                      <p className="text-xs text-gray-400 font-sans">Words saved dynamically from correct lessons on the pathways. Duo tracks muscle-memory retention strength!</p>
                    </div>
                    <button
                      onClick={startVocabularyMatchGame}
                      className="px-4.5 py-2.5 bg-gradient-to-r from-amber-500 to-[#CCFF00] hover:brightness-110 text-black font-mono font-black text-xs uppercase rounded-xl border border-white/5 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Vocab Match Game
                    </button>
                  </div>

                  {/* Manual entry bar card to add custom terms */}
                  <div className="bg-[#1a2133]/50 border border-white/5 rounded-2xl p-4.5 space-y-3">
                    <span className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-extrabold block text-left">Record custom vocabulary item manually</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        value={newWordText}
                        onChange={(e) => setNewWordText(e.target.value)}
                        placeholder={`e.g. Hablar (in ${selectedLang})`}
                        className="bg-black/50 border border-white/10 px-3 py-2 text-xs text-white rounded-xl focus:border-[#CCFF00] focus:outline-none focus:ring-0"
                      />
                      <input 
                        type="text" 
                        value={newTransText}
                        onChange={(e) => setNewTransText(e.target.value)}
                        placeholder="e.g. To Speak (English meaning)"
                        className="bg-black/50 border border-[#CCFF00] px-3 py-2 text-xs text-white rounded-xl focus:border-[#CCFF00] focus:outline-none focus:ring-0"
                      />
                      <button
                        onClick={() => {
                          const w = newWordText.trim();
                          const t = newTransText.trim();
                          if (!w || !t) {
                            alert("Please compile both terms to append properly.");
                            return;
                          }
                          setVocabBank(prev => [
                            ...prev,
                            { word: w, translation: t, language: selectedLang, strength: 100, attempts: 1 }
                          ]);
                          setNewWordText("");
                          setNewTransText("");
                          playToneSound("correct");
                          onAddNotification("Vocabulary Appended! 📖", `Term "${w}" is now logged in your smart repository ledger.`, "success");
                        }}
                        className="bg-[#58CC02] hover:bg-[#84D814] text-black font-mono font-black text-xs uppercase py-2 px-4 rounded-xl cursor-pointer border-none transition-all flex items-center justify-center gap-1.5 w-full md:w-auto"
                      >
                        <PlusCircleIcon className="w-4 h-4" />
                        Log Term
                      </button>
                    </div>
                  </div>

                  {/* Words Search Filter bar */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={vocabQuery}
                      onChange={(e) => setVocabQuery(e.target.value)}
                      placeholder={`Filter through ${selectedLang} words...`}
                      className="w-full bg-black/40 border border-white/5 py-2 px-3 text-xs text-gray-300 rounded-xl focus:border-[#CCFF00] focus:outline-none text-left"
                    />
                  </div>

                  {/* List grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {(() => {
                      const list = vocabBank.filter(v => v.language.toLowerCase() === selectedLang.toLowerCase() && (v.word.toLowerCase().includes(vocabQuery.toLowerCase()) || v.translation.toLowerCase().includes(vocabQuery.toLowerCase())));
                      if (list.length === 0) {
                        return (
                          <div className="col-span-2 text-center py-10 bg-black/20 border border-white/5 rounded-2xl font-mono text-xs text-gray-500">
                             Duo hasn't logged any verified pathways translations for {selectedLang} in this viewport yet. Pass correct dynamic drills above or manually log phrases to build your database ledger! 🦉
                          </div>
                        );
                      }
                      return list.map((item, idx) => (
                        <div key={item.word + idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 text-left hover:border-white/15 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="text-left">
                              <h4 className="text-sm font-black text-white">{item.word}</h4>
                              <p className="text-xs text-gray-400 font-mono italic">{item.translation}</p>
                            </div>
                            <button
                              onClick={() => {
                                playToneSound("click");
                                playSpeechText(item.word);
                              }}
                              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#CCFF00] flex items-center justify-center border-none cursor-pointer transition-all active:scale-[0.88]"
                              title="Listen Native Pronunciation Check"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1 text-left">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-gray-500">Retention Matrix:</span>
                              <span className={item.strength < 50 ? "text-amber-400" : "text-green-400"}>
                                {item.strength}% {item.strength < 50 ? "(Review needed)" : "(Secure)"}
                              </span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${item.strength < 50 ? "bg-amber-400" : "bg-[#58CC02]"}`} 
                                style={{ width: `${item.strength}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW Option: DUO CHAMPIONS LEAGUES & QUESTS */}
          {exploreView === "leagues" && (
            <div className="space-y-6">
              
              {/* League Step Slider badges */}
              <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 space-y-4">
                <div className="border-b border-white/5 pb-3 text-left">
                  <span className="text-[10px] uppercase font-black font-mono text-[#00E5FF] tracking-widest block font-sans">TOURNAMENT STEP HIERARCHY</span>
                  <h3 className="text-lg font-black text-white">Active Competitive Leagues Progression</h3>
                </div>

                <div className="flex flex-wrap gap-2.5 justify-around py-2">
                  {["Bronze League", "Silver League", "Gold League", "Platinum League", "Diamond League", "Master League", "Champion League", "Legendary League"].map((lg, i) => {
                    const activeLg = lg === leagueLevel;
                    return (
                      <button
                        key={lg}
                        onClick={() => {
                          setLeagueLevel(lg);
                          localStorage.setItem("duo_league_level", lg);
                          playToneSound("click");
                          onAddNotification("League Level Selected", `Compete in ${lg} this week!`, "info");
                        }}
                        className={`px-3 py-1.5 font-mono text-[9px] uppercase font-black rounded-lg border transition-all cursor-pointer ${
                          activeLg 
                            ? "bg-gradient-to-r from-[#00E5FF] to-cyan-500 text-black border-cyan-400 shadow-md scale-105" 
                            : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        {lg.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid with Leaderboard & Daily Quests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Board */}
                <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 space-y-4 text-left">
                  <div className="border-b border-white/5 pb-2 text-left">
                    <span className="text-[9px] font-mono text-[#00E5FF] font-black uppercase tracking-widest block">Live Leaderboard stats</span>
                    <h4 className="text-sm font-black text-white uppercase">{leagueLevel} Leaderboard</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { name: "👑 @kenji_tokyo", xp: 340, isUser: false, avatar: "🦊" },
                      { name: "⚡ @sofia_madrid", xp: 220, isUser: false, avatar: "🐼" },
                      { name: "🔥 @pierre_paris", xp: 190, isUser: false, avatar: "🦁" },
                      { name: "🦉 @you (Your Session)", xp: (completedQuizzesCount * 20), isUser: true, avatar: "🦉" },
                      { name: "✨ @clara_berlin", xp: 90, isUser: false, avatar: "🦄" },
                      { name: "📖 @student_life", xp: 40, isUser: false, avatar: "🐹" }
                    ]
                    .sort((a,b) => b.xp - a.xp)
                    .map((item, index) => {
                      const crownColor = index === 0 ? "text-yellow-400" : index === 1 ? "text-slate-300" : index === 2 ? "text-amber-600" : "text-gray-500";
                      return (
                        <div 
                          key={item.name} 
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            item.isUser 
                              ? "bg-indigo-500/10 border-indigo-500/40 font-extrabold text-[#00E5FF]" 
                              : "bg-black/30 border-white/5 text-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-black ${crownColor} w-4`}>#{index + 1}</span>
                            <span className="text-sm">{item.avatar}</span>
                            <span className="text-xs font-mono">{item.name}</span>
                          </div>
                          <span className="text-xs font-mono font-black text-amber-400">{(item.isUser ? (completedQuizzesCount * 20) + 120 : item.xp)} XP</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal italic font-mono text-center">Top 3 rank participants promote to next division level in 48h! 🔥</p>
                </div>

                {/* Quests Checklist */}
                <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 space-y-4 text-left">
                  <div className="border-b border-white/5 pb-2 text-left">
                    <span className="text-[9px] font-mono text-amber-400 font-black uppercase tracking-widest block">DAILY GOALS CHANNELS</span>
                    <h4 className="text-sm font-black text-white uppercase font-sans">Active Tasks Checklist</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {dailyQuests.map((quest) => {
                      const pct = Math.floor((quest.current / quest.target) * 100);
                      return (
                        <div key={quest.id} className="p-3 bg-black/40 border border-white/5 rounded-2xl relative space-y-2 text-left">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-left">
                              {quest.completed ? (
                                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase text-[8px]">Completed</span>
                              ) : (
                                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-bold uppercase text-[8px]">In Progress</span>
                              )}
                              <span className="text-xs font-black text-white leading-tight">{quest.label}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#58CC02] font-black">+{quest.xp} XP</span>
                          </div>

                          <div className="space-y-1 text-left">
                            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                              <span>Metric status:</span>
                              <span>{quest.current} / {quest.target}</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${quest.completed ? "bg-green-500" : "bg-amber-400"}`} 
                                style={{ width: `${Math.min(100, pct)}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW Option 5: CUSTOM TALK TEACHER CHAT */}
          {exploreView === "practice" && (
            <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-6 flex flex-col justify-between h-[520px]">
              
              {/* Voice Chat Area Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Talk Teacher AI Chat</h4>
                    <p className="text-[10px] text-gray-500">Interact in {selectedLang} to unlock situational conversational points.</p>
                  </div>
                </div>
                <div className="text-[9px] font-mono bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/5">
                  GEMINI 3.5 IMAGING STREAM
                </div>
              </div>

              {/* Messages Terminal Scroll */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
                {messages.map((m, idx) => {
                  const isAi = m.sender === "ai";
                  return (
                    <div key={idx} className={`flex ${isAi ? "justify-start" : "justify-end"} items-start gap-2.5`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border ${
                        isAi ? "bg-[#58CC02]/10 border-[#58CC02]/20 text-[#58CC02]" : "bg-[#7B61FF]/10 border-[#7B61FF]/20 text-[#7B61FF]"
                      }`}>
                        {isAi ? "🦉" : "👨‍🎓"}
                      </div>
                      <div className={`max-w-[75%] rounded-2xl p-4.5 text-xs leading-relaxed ${
                        isAi 
                          ? "bg-white/5 border border-white/7 text-gray-100" 
                          : "bg-gradient-to-br from-[#7B61FF]/20 to-black text-white border border-[#7B61FF]/30 font-bold"
                      }`}>
                        <p>{m.text}</p>
                        
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="text-[8px] text-gray-500 font-mono block uppercase">
                            {m.time}
                          </span>
                          {isAi && (
                            <button
                              type="button"
                              onClick={() => playSpeechText(m.text)}
                              className="w-4 h-4 bg-white/5 hover:bg-white/15 rounded flex items-center justify-center border-none cursor-pointer"
                              title="Listen voice synthesis"
                            >
                              🔊
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {aiLoading && (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-[#58CC02] border-t-transparent animate-spin inline-block" />
                    <span className="text-[10px] font-mono text-[#58CC02] uppercase tracking-wider animate-pulse">
                      Duo is forming phonetic response matrix...
                    </span>
                  </div>
                )}
              </div>

              {/* Input formulation block */}
              <div className="flex gap-2.5 pt-3.5 border-t border-white/5 items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleChatWithTutor(); }}
                  placeholder={`Speak or write a greeting in ${selectedLang} here...`}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#7B61FF]"
                />
                <button
                  type="button"
                  onClick={handleChatWithTutor}
                  className="w-11 h-11 rounded-xl bg-[#7B61FF] hover:bg-indigo-600 transition-all flex items-center justify-center border-none cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="text-[10px] text-gray-500 font-mono pt-1 text-center">
                🪙 FEE: 3 COINS PER MESSAGE CONVERSATION FEEDBACK LOOP SESSIONS
              </div>
            </div>
          )}

        </div>

        {/* COLUMN B: RIGHT PANEL COMPANION & SPONSORS ADS */}
        <div className="lg:col-span-4 space-y-6">

          {/* BLOCK B1: DUO THE OWL MASCOT TIPS */}
          <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-[#58CC02] border-b border-white/5 pb-2">
              <Smile className="w-5 h-5 animate-pulse" />
              <h4 className="text-xs font-black uppercase font-mono tracking-wider">
                Owl Duo Mascot Guidelines
              </h4>
            </div>

            <div className="flex gap-3 bg-black/40 border border-[#58CC02]/20 p-4 rounded-2xl relative">
              <div className="text-3xl select-none">🦉</div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[#58CC02] uppercase tracking-widest font-black block">DUORITHMIC TIP:</span>
                <p className="text-[11px] text-gray-300 leading-normal italic font-sans">
                  {hearts >= 4 
                    ? '"Streak multiplier is active! Answer correct drills in series. Duo is extremely pleased with you."' 
                    : hearts === 1 
                      ? '"Warning! Only 1 Heart left! Avoid reckless mistakes or spend 10 coins so Duo doesn\'t cry."'
                      : '"Keep going! Practice regular syllabus translations to gain extra gold bags."'
                  }
                </p>
              </div>
            </div>

            {/* INSTANT COIN HEARTS REFILL */}
            <div className="bg-black/60 border border-white/5 p-4 rounded-2xl space-y-3 font-mono text-[11px]">
              <span className="text-amber-400 uppercase text-[9px] block">NEXA COINS HEART REFILL INSTANT</span>
              <p className="text-gray-300 leading-normal font-sans">
                Exchange 10 standard Nexa Coins to instantly reload your full 5/5 Hearts energy status!
              </p>
              <button
                onClick={triggerRewardedAdHearts}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-[#CCFF00] hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase rounded-xl border-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 animate-bounce" />
                Refill with Nexa Coins (10 🪙)
              </button>
            </div>
          </div>

          {/* BLOCK B2: COMPLETED DRILLS STATUS */}
          <div className="bg-[#10141f]/70 border border-white/10 rounded-[32px] p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-[#00E5FF]">
              <Trophy className="w-4 h-4" />
              <h4 className="text-xs font-black uppercase font-mono tracking-wider">
                Your Duolingo Stats
              </h4>
            </div>

            <div className="space-y-3 font-mono text-[11px] bg-black/40 p-4 rounded-xl space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase">Levels Conquered:</span>
                <span className="text-white font-bold">{completedQuizzesCount} / 24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase">Interactive XP:</span>
                <span className="text-[#22C55E] font-bold">+{completedQuizzesCount * 20} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase">Golden Crowns:</span>
                <span className="text-yellow-400 font-bold">{Math.floor(completedQuizzesCount / 2)} 👑</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase">Hearts State:</span>
                <span className={hearts > 1 ? "text-green-400 font-bold" : "text-red-400 animate-pulse font-bold"}>
                  {hearts} ❤️ ACTIVE
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* GEMINI AI DRILL LOADER OVERLAY */}
      {drillLoading && (
        <div id="duo_drill_loader_overlay" className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-4">
          <div className="bg-[#121624] border border-[#22C55E]/30 rounded-[32px] p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-[#58CC02] rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg animate-bounce select-none border border-[#84D814] mx-auto">
              🦉
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Duo is Thinking...</h3>
              <p className="text-xs text-gray-400">
                Generating custom conversational language drill via Gemini for <b>{selectedLang}</b>...
              </p>
            </div>
            <div className="flex justify-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#58CC02] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* BLOCK B3: DUO ACTIVE DRILL INTERACTIVE LESSON MODAL OVERLAY */}
      {activeQuiz && (
        <div id="duo-active-lesson-overlay" className="fixed inset-0 bg-[#0A0D18] z-[150] flex flex-col justify-between font-sans text-white select-none overflow-hidden">
          
          {/* Header Bar */}
          <div className="w-full max-w-4xl mx-auto px-6 pt-6 flex items-center justify-between gap-6">
            {/* Close / Quit button */}
            <button
              onClick={() => {
                setActiveQuiz(null);
                setQuizAnswered(false);
                setSelectedOpt("");
                setSelectedScrambleWords([]);
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all rounded-full cursor-pointer border-none bg-transparent"
              title="Quit Lesson"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Real Progress Bar */}
            <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#58CC02] to-[#84D814] rounded-full transition-all duration-500 relative"
                style={{ width: `${quizAnswered ? (quizIsCorrect ? "100%" : "60%") : "30%"}` }}
              >
                {/* Shiny reflex */}
                <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/20 rounded-full" />
              </div>
            </div>

            {/* Life Hearts Counter with animation */}
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-2xl shrink-0">
              <span className="font-black text-sm text-[#FF4B4B]">{hearts}</span>
              <Heart className={`w-5 h-5 fill-[#FF4B4B] text-[#FF4B4B] ${isShaking ? "animate-bounce" : "animate-pulse"}`} />
            </div>
          </div>

          {/* Core Applet Content Body */}
          <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-6 py-8 flex flex-col justify-center items-center">
            <div className={`w-full max-w-2xl space-y-8 ${isShaking ? "animate-shake" : ""}`}>
              
              {/* Cute Dancing Duo Owl & Speech Bubble */}
              <div className="flex gap-4 md:gap-6 items-start md:items-center">
                
                {/* 3D-feeling Mascot box */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <div className={`w-24 h-24 bg-[#58CC02] rounded-3xl flex flex-col items-center justify-center relative shadow-2xl border-4 border-[#84D814] transition-all duration-300 ${
                    quizAnswered
                      ? quizIsCorrect
                        ? "animate-bounce scale-110 rotate-3"
                        : "scale-95 rotate-[-6deg]"
                      : "hover:scale-105"
                  }`}>
                    {/* Gloss highlight */}
                    <div className="absolute top-1 left-2 w-20 h-4 bg-white/15 rounded-full" />
                    
                    {/* Big intelligent owl eyes */}
                    <div className="flex gap-2.5 mt-4">
                      {/* Left Eye */}
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center relative shadow-inner">
                        <div className={`w-3.5 h-3.5 bg-black rounded-full absolute transition-all duration-300 ${
                          quizAnswered
                            ? quizIsCorrect
                              ? "scale-x-125 scale-y-75 translate-y-0.5"
                              : "scale-y-25"
                            : "top-1"
                        }`} />
                      </div>
                      {/* Right Eye */}
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center relative shadow-inner">
                        <div className={`w-3.5 h-3.5 bg-black rounded-full absolute transition-all duration-300 ${
                          quizAnswered
                            ? quizIsCorrect
                              ? "scale-x-125 scale-y-75 translate-y-0.5"
                              : "scale-y-25"
                            : "top-1"
                        }`} />
                      </div>
                    </div>
                    
                    {/* Beak */}
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-orange-400 mt-1 shadow-md" />
                    
                    {/* Cute white belly shell */}
                    <div className="w-10 h-4 bg-white/25 rounded-b-full mt-1 border-t border-white/15" />
                    
                    {/* Interactive left/right wings */}
                    <div className={`w-4 h-10 bg-[#58CC02] border-2 border-[#84D814] rounded-full absolute -left-2.5 top-8 transition-all ${
                      quizAnswered && quizIsCorrect ? "-rotate-45 -translate-y-2" : "rotate-12"
                    }`} />
                    <div className={`w-4 h-10 bg-[#58CC02] border-2 border-[#84D814] rounded-full absolute -right-2.5 top-8 transition-all ${
                      quizAnswered && quizIsCorrect ? "rotate-45 -translate-y-2" : "-rotate-12"
                    }`} />
                  </div>
                  
                  {/* Mascot Badge tag */}
                  <span className="text-[9px] font-mono font-black text-black mt-2.5 bg-[#CCFF00] border-2 border-black max-w-max px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                     DUO ACADEMY
                  </span>
                </div>

                {/* Speech Bubble holding the question */}
                <div className="flex-1 bg-[#161D30] border-2 border-white/10 rounded-[28px] p-5.5 relative shadow-lg">
                  {/* Balloon pointer tail */}
                  <div className="absolute left-0 top-10 -translate-x-2.5 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-[#161D30]" />
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-[#58CC02] font-black uppercase font-mono tracking-wider block">
                      {challengerMode ? "🔥 CHALLENGER HARD MODE PROMPT (2x XP)" : "💬 TRANSLATE THIS PHRASE"}
                    </span>
                    <h3 className="text-base font-black text-white tracking-wide leading-relaxed">
                      {activeQuiz.question}
                    </h3>
                    <div className="flex gap-2.5 pt-3">
                      <button
                        type="button"
                        onClick={() => playSpeechText(activeQuiz.speakPhrase || "")}
                        className="py-1.5 px-4 bg-[#58CC02] hover:bg-[#84D814] active:scale-95 text-black font-black text-[10px] rounded-xl border-b-4 border-[#3c8c02] hover:border-b-2 active:border-b-0 cursor-pointer flex items-center gap-1.5 uppercase font-mono transition-all"
                      >
                        🔊 Hear Pronunciation
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaction Arena */}
              <div className="pt-2">
                {/* Type A: MULTIPLE CHOICE OPTION CARDS */}
                {activeQuiz.type === "multichoice" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {activeQuiz.options.map((opt: string, idx: number) => {
                      const isPicked = selectedOpt === opt;
                      const isCorrectChoice = opt === activeQuiz.correctAnswer;
                      
                      let cardStyle = "bg-[#161E32] border-white/10 text-gray-200 border-b-[6px] hover:border-[#58CC02] hover:bg-[#1C263E]";
                      if (quizAnswered) {
                        if (isCorrectChoice) {
                          cardStyle = "bg-green-500/15 border-[#13D44D] text-[#CCFF00] border-b-[6px]";
                        } else if (isPicked) {
                          cardStyle = "bg-red-500/15 border-red-500 text-red-300 border-b-[6px]";
                        } else {
                          cardStyle = "bg-[#0B0D18]/40 border-white/5 text-gray-600 border-b-[2px]";
                        }
                      } else if (isPicked) {
                        cardStyle = "bg-[#58CC02]/10 border-[#58CC02] text-white border-b-[6px] shadow-lg shadow-[#58cc02]/10";
                      }

                      return (
                        <button
                          key={opt}
                          disabled={quizAnswered}
                          onClick={() => {
                            setSelectedOpt(opt);
                            playToneSound("click");
                          }}
                          className={`w-full py-4.5 px-6 text-left rounded-2xl transition-all border-2 text-xs font-black uppercase outline-none cursor-pointer flex items-center justify-between gap-4 select-none ${cardStyle}`}
                        >
                          <div className="flex items-center gap-3.5">
                            {/* Prefix index marker */}
                            <span className="w-6 h-6 rounded-lg bg-black/45 border border-white/10 flex items-center justify-center font-mono text-[10px] text-gray-400 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="tracking-wide leading-relaxed">{opt}</span>
                          </div>
                          {quizAnswered && isCorrectChoice && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Type B: SCRAMBLE WORD ARRANGEMENTS */}
                {activeQuiz.type === "scramble" && (
                  <div className="space-y-6">
                    
                    {/* Solved Assembler Workspace */}
                    <div className="min-h-[75px] p-5 bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-wrap gap-2 items-center justify-center transition-colors">
                      {selectedScrambleWords.length === 0 && (
                        <span className="text-xs text-gray-500 font-mono text-center tracking-wide">
                          Select the vocabulary tokens below in the exact syntax sequence...
                        </span>
                      )}
                      {selectedScrambleWords.map(word => (
                        <button
                          key={word}
                          disabled={quizAnswered}
                          onClick={() => handleWordClick(word, false)}
                          className="py-2.5 px-4 bg-[#58CC02]/15 border-2 border-[#58CC02]/30 hover:border-red-400 text-[#CCFF00] hover:text-red-400 font-black text-xs rounded-xl cursor-pointer transition-all border-b-4 hover:border-b-2"
                        >
                          {word}
                        </button>
                      ))}
                    </div>

                    {/* Available Vocabulary Bank */}
                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center py-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                      {availableScrambleWords.map(word => {
                        const isPlaced = selectedScrambleWords.includes(word);
                        return (
                          <button
                            key={word}
                            disabled={quizAnswered || isPlaced}
                            onClick={() => handleWordClick(word, true)}
                            className={`py-2.5 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all border-2 border-b-4 ${
                              isPlaced
                                ? "bg-white/[0.02] border-white/5 text-transparent border-b-2 cursor-not-allowed scale-95"
                                : "bg-[#161D30] border-white/10 hover:border-[#58CC02] text-white active:scale-95"
                            }`}
                          >
                            {word}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BRIGHT SLIDE-UP DRAWER FOOTER (Duolingo Style Matching Panel) */}
          <div className={`w-full py-6 px-6 md:px-12 border-t-2 transition-all duration-300 ${
            quizAnswered
              ? quizIsCorrect
                ? "bg-[#13D44D] border-green-500 text-black shadow-2xl"
                : "bg-[#EA2B2B] border-red-500 text-white shadow-2xl"
              : "bg-[#111625] border-white/10"
          }`}>
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
              
              {/* Left explanation block */}
              <div className="flex items-start gap-4 flex-1">
                {quizAnswered ? (
                  quizIsCorrect ? (
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#13D44D] shadow-lg shrink-0 mt-0.5 animate-bounce">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#EA2B2B] shadow-lg shrink-0 mt-0.5">
                      <XCircle className="w-7 h-7" />
                    </div>
                  )
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
                    <HelpCircle className="w-6 h-6 animate-pulse" />
                  </div>
                )}

                <div className="space-y-1 text-left">
                  {!quizAnswered ? (
                    <>
                      <h4 className="text-xs font-black tracking-widest uppercase text-gray-400">Lesson Progress</h4>
                      <p className="text-xs text-gray-500">Pick an option to verify your answer matrix.</p>
                    </>
                  ) : quizIsCorrect ? (
                    <>
                      <h4 className="text-sm font-black tracking-wide text-white">Amazing Job! You got it right! 🎉</h4>
                      <p className="text-xs text-green-100 max-w-xl leading-relaxed">{quizFeedback}</p>
                      <span className="text-[10px] font-mono font-black text-[#ffffff]/90 uppercase bg-black/20 px-2 py-0.5 rounded-full inline-block mt-1">
                        +{challengerMode ? "16" : "8"} NEXA Coins & +{challengerMode ? "40" : "20"} XP Awarded!
                      </span>
                    </>
                  ) : (
                    <>
                      <h4 className="text-sm font-black tracking-wide text-white">Correct Translation:</h4>
                      <p className="text-xs text-red-100 font-extrabold bg-black/10 px-3 py-2 rounded-xl mt-1.5 border border-white/5 uppercase font-mono max-w-xl leading-relaxed">{activeQuiz.correctAnswer}</p>
                      <p className="text-xs text-red-400 font-black bg-white px-2 py-0.5 rounded-full inline-block mt-2">
                        {challengerMode ? "Extreme Penalty: -2 Hearts!" : "Hearts Index Checked: -1 Life"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Right response action button */}
              <div className="flex gap-3 shrink-0 flex-col sm:flex-row">
                
                {/* CHECK/SUBMIT ACTION BUTTONS WHEN NOT ANSWERED */}
                {!quizAnswered && (
                  <>
                    <button
                      type="button"
                      disabled={activeQuiz.type === "multichoice" ? !selectedOpt : selectedScrambleWords.length === 0}
                      onClick={() => {
                        const ans = activeQuiz.type === "multichoice" ? selectedOpt : selectedScrambleWords.join(" ");
                        submitQuizAnswer(ans);
                      }}
                      className={`py-4 px-10 rounded-2xl font-black text-xs uppercase font-mono tracking-widest border-b-[5px] transition-all cursor-pointer ${
                        (activeQuiz.type === "multichoice" ? selectedOpt : selectedScrambleWords.length > 0)
                          ? "bg-[#58CC02] hover:bg-[#84D814] text-black border-[#3a8c02] hover:border-b-[3px] active:border-b-0 active:translate-y-[4px]"
                          : "bg-white/10 hover:bg-white/10 text-gray-500 border-white/5 cursor-not-allowed border-b-2"
                      }`}
                    >
                      ✓ Check Answer
                    </button>
                    
                    <button
                      type="button"
                      disabled={drillLoading}
                      onClick={() => {
                        const currentLvl = activeQuiz.level;
                        startPracticeQuiz(currentLvl);
                        onAddNotification("Question Changed 🔄", "AI syllabus generated a fresh alternative drill!", "info");
                      }}
                      className="py-4 px-5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-xs uppercase font-mono rounded-2xl cursor-pointer border border-blue-500/20 transition-all active:scale-95 flex items-center gap-1"
                    >
                      🔄 Change Question
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuiz(null);
                        setQuizAnswered(false);
                        setSelectedOpt("");
                        setSelectedScrambleWords([]);
                      }}
                      className="py-4 px-6 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase font-mono rounded-2xl cursor-pointer border border-white/15"
                    >
                      Exit Lesson
                    </button>
                  </>
                )}

                {/* CONTINUE ACTION BUTTON */}
                {quizAnswered && (
                  <>
                    <button
                      type="button"
                      disabled={drillLoading}
                      onClick={() => {
                        const currentLvl = activeQuiz.level;
                        const nextHistory = [...sessionQuestionHistory];
                        startPracticeQuiz(currentLvl, nextHistory);
                        setSelectedOpt("");
                        setSelectedScrambleWords([]);
                        setQuizAnswered(false);
                      }}
                      className="py-4 px-6 bg-gradient-to-r from-[#58CC02] to-teal-400 hover:brightness-110 text-black font-black text-xs uppercase font-mono rounded-2xl cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                    >
                      🔥 Practice Next (Always New)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuiz(null);
                        setQuizAnswered(false);
                        setSelectedOpt("");
                        setSelectedScrambleWords([]);
                        playSpeechText("Ready for next lesson!");
                      }}
                      className={`py-4 px-8 rounded-2xl font-black text-xs uppercase font-mono tracking-widest border-b-[5px] active:border-b-0 active:translate-y-[4px] transition-all cursor-pointer ${
                        quizIsCorrect 
                          ? "bg-white hover:brightness-110 text-[#13D44D] border-gray-200 shadow-lg"
                          : "bg-white hover:brightness-110 text-[#EA2B2B] border-red-200 shadow-lg"
                      }`}
                    >
                      Continue Journey →
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Simple inline component fallback to prevent undefined references
const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);
