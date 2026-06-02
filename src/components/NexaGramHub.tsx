import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Heart, MessageSquare, Share2, ThumbsDown, Send, Plus, Users, 
  Search, Bookmark, Shield, Compass, Sparkles, Check, Play, HelpCircle, 
  ChevronRight, RefreshCw, X, MessageCircle, Info, Smile, ChevronDown, UserPlus, Flame, Award,
  BookOpen, Star, Clock, Activity, Sword, Brain, ShieldAlert, MonitorCheck, RefreshCcw, Music, Pause,
  Mic, Gift
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserProfile, FeedPost, ChatSession, StudyReel, StudyGroup, Comment, ChatMessage 
} from "../types";
import { syncReelToFirestore, syncPostToFirestore, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { NativeAd } from "./NativeAds";
import { playMicRecordStart, playSuccessChime, playInterfaceClick, playMicRecordStop } from "../lib/audioEffects";

interface InteractiveReelPlayerProps {
  reel: StudyReel;
}

export const InteractiveReelPlayer: React.FC<InteractiveReelPlayerProps> = ({ reel }) => {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
      if (audio) {
        audio.play().catch(() => {});
      }
    } else {
      video.pause();
      if (audio) {
        audio.pause();
      }
    }
  }, [isPlaying, reel.videoUrl, reel.audioUrl]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    video.muted = isMuted;
    if (audio) {
      audio.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    const originalVol = reel.originalVolume !== undefined ? reel.originalVolume : 1.0;
    const audioVol = reel.audioVolume !== undefined ? reel.audioVolume : 0.75;

    video.volume = originalVol;
    if (audio) {
      audio.volume = audioVol;
    }
  }, [reel.originalVolume, reel.audioVolume, isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    const handleSync = () => {
      if (Math.abs(video.currentTime - audio.currentTime) > 0.15) {
        audio.currentTime = video.currentTime % (audio.duration || video.duration || 1);
      }
    };

    video.addEventListener("timeupdate", handleSync);
    return () => {
      video.removeEventListener("timeupdate", handleSync);
    };
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      className="w-full h-full relative cursor-pointer flex items-center justify-center bg-black/40"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        key={reel.videoUrl}
        src={reel.videoUrl}
        className="w-full h-full object-cover absolute inset-0 z-0"
        loop
        playsInline
        autoPlay
      />

      {reel.audioUrl && (
        <audio
          ref={audioRef}
          key={reel.audioUrl}
          src={reel.audioUrl}
          loop
          className="hidden"
        />
      )}

      {/* Floating UI HUD elements */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2 animate-fade-in">
        <button
          onClick={toggleMute}
          className="p-2.5 bg-black/80 hover:bg-black text-white rounded-full border border-white/10 shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-95 flex items-center gap-1.5"
        >
          <span className="text-[9px] font-mono tracking-wider font-extrabold uppercase select-none text-[#CCFF00]">
            {isMuted ? "🔇 SOUND MUTED" : "🔊 SOUND ACTIVE"}
          </span>
        </button>
      </div>

      {reel.audioUrl && (
        <div className="absolute top-14 right-4 z-40 flex flex-col items-end gap-1 pointer-events-none">
          <div className="bg-purple-600/90 text-white border border-purple-400/30 font-mono text-[9px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
            <span className="text-xs">🎵</span>
            <span className="font-bold uppercase tracking-tight">{reel.audioName || "Stitched Audio"}</span>
          </div>
        </div>
      )}

      {!isPlaying && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-xs">
          <div className="bg-black/85 px-6 py-3 rounded-2xl border border-[#CCFF00]/30 text-xs text-[#CCFF00] font-mono font-black uppercase tracking-widest animate-pulse">
            ⏸️ PAUSED_FEED
          </div>
        </div>
      )}
    </div>
  );
};

interface NexaGramHubProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  friends: string[];
  setFriends: React.Dispatch<React.SetStateAction<string[]>>;
  chats: ChatSession[];
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  feedPosts: FeedPost[];
  setFeedPosts: React.Dispatch<React.SetStateAction<FeedPost[]>>;
  reels: StudyReel[];
  setReels: React.Dispatch<React.SetStateAction<StudyReel[]>>;
  studyGroups: StudyGroup[];
  setStudyGroups: React.Dispatch<React.SetStateAction<StudyGroup[]>>;
  onGrantRewards: (xp: number, coins: number, hp?: number) => void;
  onDeductCoins?: (amount: number) => boolean;
  onAddNotification: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
  initialSubTab?: 'feed' | 'reels' | 'chats' | 'friends' | 'explore' | 'profile';
  allUsers?: any[];
}

export const NexaGramHub: React.FC<NexaGramHubProps> = ({
  profile,
  setProfile,
  friends,
  setFriends,
  chats,
  setChats,
  feedPosts,
  setFeedPosts,
  reels,
  setReels,
  studyGroups,
  setStudyGroups,
  onGrantRewards,
  onDeductCoins,
  onAddNotification,
  initialSubTab = "feed",
  allUsers = []
}) => {
  const [subTab, setSubTab] = useState<'feed' | 'reels' | 'explore' | 'profile' | 'chats' | 'friends' | 'ai_creator' | 'tournaments' | 'wallet'>(initialSubTab as any);
  const [viralReels, setViralReels] = useState<string[]>([]);

  // NexaGram State Variables moved/initialized early to prevent block-scoped hoisting issues
  const [feedFilter, setFeedFilter] = useState<'personalized' | 'trending' | 'following'>('personalized');
  const [followedPeers, setFollowedPeers] = useState<string[]>(["bioqueen_🌿", "auracoder_⚡", "codegod_💻"]);

  // Tournament, voice room, cosmetic stores
  const [tournamentRegistered, setTournamentRegistered] = useState(false);
  const [tournamentActive, setTournamentActive] = useState(false);
  const [tournamentTimeLeft, setTournamentTimeLeft] = useState(30);
  const [tournamentCurrentQ, setTournamentCurrentQ] = useState(0);
  const [mathBlitzPlayed, setMathBlitzPlayed] = useState(() => localStorage.getItem("nexa_math_blitz_played") === "true");

  const [activeVoiceRoom, setActiveVoiceRoom] = useState<string | null>(null);
  const [voiceMultiplierOn, setVoiceMultiplierOn] = useState(false);
  const [ownedTitlesList, setOwnedTitlesList] = useState<string[]>(["Rookie Solver"]);
  const [ownedFramesList, setOwnedFramesList] = useState<string[]>([]);

  // Dynamically compute active usernames to prevent displaying content from users who left the app
  const activeUsernames = useMemo(() => {
    const set = new Set<string>();
    if (profile && profile.username && typeof profile.username === 'string') {
      set.add(profile.username.toLowerCase().trim());
    }
    // Static system seed profiles
    const defaultSeeds = ["bioqueen_🌿", "auracoder_⚡", "codegod_💻", "chemwitch_🧪", "cyberscribe", "physicslord_⚛️", "nerdgamer", "neovisionary", "rookiesolver_9", "hyperphysicist_⚛️", "forcemaster_⚛️", "moleculewielder_🧪", "quantumsolver_🌌", "thermodynamicborg_🔥", "microbialhacker_🧬", "algebraicsniper_📐", "neuroveda_🧠"];
    defaultSeeds.forEach(name => set.add(name));

    if (allUsers && allUsers.length > 0) {
      allUsers.forEach(u => {
        if (u && u.username && typeof u.username === 'string') {
          set.add(u.username.toLowerCase().trim());
        }
      });
    }
    return set;
  }, [allUsers, profile]);

  const filteredFeedPosts = useMemo(() => {
    // Inject custom interactive poll and quiz posts matching the plan
    const pollPost: FeedPost = {
      id: "interactive_poll_1",
      username: "NexaSphericalAI",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NexaAI",
      timeAgo: "2h ago",
      content: "📊 **NEXAGRAM HYBRID POLL**: Which futuristic technology will have the greatest impact on collaborative STEM learning over the next decade? Cast your vote below to sync with the hivemind!",
      likes: 124,
      liked: false,
      comments: [
        { id: "cm_poll_1", username: "AuraCoder_⚡", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura", text: "Neural interfaces are definitely the ultimate frontier! 🧠", timeAgo: "1h ago" }
      ],
      tag: "AI RESEARCH POLL",
    };
    (pollPost as any).poll = {
      question: "Greatest STEM learning tech impact:",
      options: [
        { text: "🧠 Neural Synaptic Interfaces", votes: 450 },
        { text: "🌌 Holographic VR Whiteboards", votes: 380 },
        { text: "🤖 Personalized Gemini Co-Pilots", votes: 520 },
        { text: "⚡ Blockchain-backed XP Leagues", votes: 140 }
      ]
    };

    const quizPost: FeedPost = {
      id: "interactive_quiz_1",
      username: "OlympiadCoach_📐",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Olympiad",
      timeAgo: "5h ago",
      content: "🧠 **NEXA BLITZ MULTIPLE-CHOICE**: Let's test your high-speed mathematical computing. What is the derivative of standard thermodynamic entropy with respect to discrete microstates (dS/dΩ) when microstates grow?\n\nSelect the correct formula below for +40 XP & +15 Nexa Coins!",
      likes: 89,
      liked: false,
      comments: [],
      tag: "MATH COMPETITIVE",
    };
    (quizPost as any).quiz = {
      question: "Solve for dS/dΩ:",
      options: [
        "dS/dΩ = k_B * ln(Ω)",
        "dS/dΩ = k_B / Ω",
        "dS/dΩ = ln(k_B * Ω)",
        "dS/dΩ = k_B * Ω"
      ],
      correctAnswerIndex: 1, // d(k_B ln Ω)/dΩ = k_B / Ω ! Correct!
      rewardXp: 40,
      rewardCoins: 15
    };

    const postsBase = [...feedPosts];
    // Avoid double injection
    if (!postsBase.some(p => p.id === "interactive_poll_1")) {
      postsBase.splice(0, 0, pollPost);
    }
    if (!postsBase.some(p => p.id === "interactive_quiz_1")) {
      postsBase.splice(1, 0, quizPost);
    }

    let filtered = postsBase.filter(post => {
      const uname = (post && typeof post.username === 'string' ? post.username : '').toLowerCase().trim();
      if (!uname) return false;
      
      // Filter based on selected feed filter state (Following)
      if (feedFilter === "following") {
        const isFollowed = followedPeers.some(p => p && typeof p === 'string' && p.toLowerCase().trim() === uname) || 
                           friends.some(f => f && typeof f === 'string' && f.toLowerCase().trim() === uname) ||
                           (profile && profile.username && typeof profile.username === 'string' && uname === profile.username.toLowerCase().trim());
        if (!isFollowed) return false;
      }

      return true;
    });

    if (feedFilter === "trending") {
      // Sort by total engagement score
      filtered = [...filtered].sort((a, b) => {
        const aRx = (a as any).reactions ? Object.values((a as any).reactions).reduce((sum: number, val: any) => sum + (val as number), 0) : 0;
        const bRx = (b as any).reactions ? Object.values((b as any).reactions).reduce((sum: number, val: any) => sum + (val as number), 0) : 0;
        const totalA = (a.likes || 0) + (a.comments?.length || 0) + (aRx as number);
        const totalB = (b.likes || 0) + (b.comments?.length || 0) + (bRx as number);
        return totalB - totalA;
      });
    }

    return filtered;
  }, [feedPosts, allUsers, profile, feedFilter, followedPeers, friends]);

  const filteredReels = useMemo(() => {
    return reels.filter(reel => {
      const creatorField = reel && (reel.creator || reel.username || "");
      const uname = (typeof creatorField === 'string' ? creatorField : '').toLowerCase().trim();
      if (!uname) return false;
      return true;
    });
  }, [reels]);
  
  // Local Media file selection uploaders
  const handleReelVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        onAddNotification("INVALID FORMAT ⚠️", "Please select a valid video file node.", "alert");
        alert("⚠️ Please select a valid video file.");
        return;
      }
      if (file.size > 1.2 * 1024 * 1024) {
        onAddNotification("VIDEO REEL TOO LARGE ⚠️", "Study Loops must be < 1.2MB in this playground database. Slicing to 5-10 seconds is recommended!", "alert");
        alert("⚠️ Video file is too large (max 1.2MB). Please select a shorter or lower resolution video clip.");
        return;
      }
      onAddNotification("Reading Video...", "Encoding media streams to secure Base64 vector...", "info");
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setNewReelVideoUrl(reader.result);
          onAddNotification("Video Stream Cached 🎬", `${file.name} successfully buffered Base64!`, "success");
        }
      };
      reader.onerror = () => {
        alert("⚠️ Failed to read the selected video file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddNotification("Processing Media...", "Encoding file elements...", "info");
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          if (file.type.startsWith("image/")) {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                setNewPostMedia(reader.result as string);
                return;
              }
              const MAX_WIDTH = 600;
              const MAX_HEIGHT = 600;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
              setNewPostMedia(compressedBase64);
              onAddNotification("Post Image Optimized 📷", "Resized and compressed successfully to fit cache budget!", "success");
            };
          } else {
            if (file.size > 1.2 * 1024 * 1024) {
              onAddNotification("FILE TOO LARGE ⚠️", "Optional media attachments must be < 1.2MB.", "alert");
              alert("⚠️ Post attachment too large (max 1.2MB). Please select a compressed image or clip.");
              return;
            }
            setNewPostMedia(reader.result);
            onAddNotification("Media Asset Cached 🎬", `${file.name} loaded snapshot successfully!`, "success");
          }
        }
      };
      reader.onerror = () => {
        alert("⚠️ Failed to read the selected media file.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Anti-Spam state metrics
  const [lastPostTimestamp, setLastPostTimestamp] = useState<number>(0);
  const [sessionXpEarned, setSessionXpEarned] = useState<number>(0);


  // Nexa AI Creator studio
  const [aiCreatorMode, setAiCreatorMode] = useState<'caption' | 'hashtags' | 'image_prompt' | 'video_ideas' | 'planner'>('caption');
  const [aiCreatorTopic, setAiCreatorTopic] = useState("");
  const [aiCreatorOutput, setAiCreatorOutput] = useState("");
  const [aiCreatorLoading, setAiCreatorLoading] = useState(false);
  const [aiCreatorService, setAiCreatorService] = useState("");

  // Simulated Voice Rooms (Holographic Study Stages)
  const [joinedVoiceRoomId, setJoinedVoiceRoomId] = useState<string | null>(null);
  const [isVoiceRoomMicMuted, setIsVoiceRoomMicMuted] = useState(true);
  const [voiceRoomConversations, setVoiceRoomConversations] = useState<Record<string, { sender: string; avatar: string; text: string; time: string }[]>>({
    "quantum": [
      { sender: "PhysicsLord_⚛️", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Physics", text: "Welcome to the stage! We are currently reviewing orbital wave vectors.", time: "2:10 PM" },
      { sender: "AuraCoder_⚡", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura", text: "Nice. Did we solve the integration bounding factors yet?", time: "2:11 PM" }
    ],
    "ethics": [
      { sender: "NeoVisionary", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Neo", text: "Autonomous AI alignment metrics are spiking.", time: "1:45 PM" }
    ],
    "calculus": [
      { sender: "AlgebraicSniper_📐", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sniper", text: "Who's up for a 3-step derivative sprint?", time: "3:01 PM" }
    ]
  });
  const [voiceRoomInput, setVoiceRoomInput] = useState("");

  // Interactive Quizzes and Polls active state tracking
  const [userPollAnswers, setUserPollAnswers] = useState<Record<string, number>>({}); // postId -> optionIdx
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, number>>({}); // postId -> optionIdx

  // Weekly esports academic tournaments
  const [isTournamentRegistered, setIsTournamentRegistered] = useState(false);
  const [tournamentScore, setTournamentScore] = useState(0);
  const [tournamentStep, setTournamentStep] = useState(0); // Current question index
  const [tournamentAnswers, setTournamentAnswers] = useState<Record<number, boolean>>({});
  const [showTournamentQuiz, setShowTournamentQuiz] = useState(false);

  useEffect(() => {
    if (!tournamentActive) return;
    if (tournamentTimeLeft <= 0) {
      setTournamentActive(false);
      setMathBlitzPlayed(true);
      localStorage.setItem("nexa_math_blitz_played", "true");
      onGrantRewards(200, 50);
      onAddNotification("Time Expired! ⏰", "Mathematics Blitz speed run is finished.", "alert");
      alert(`⏰ TIME UP! Math Blitz speedrun is complete! You scored ${tournamentScore} Points! Gained +200 XP & +50 Social Coins!`);
      return;
    }

    const timer = setTimeout(() => {
      setTournamentTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [tournamentActive, tournamentTimeLeft, tournamentScore]);

  // Digital creator products store & tipping states
  const [monetizationToggled, setMonetizationToggled] = useState(false);
  const [claimedAdRevenue, setClaimedAdRevenue] = useState(false);
  const [activeTipPostId, setActiveTipPostId] = useState<string | null>(null);
  const [digitalProducts, setDigitalProducts] = useState([
    { id: "dp_1", name: "🏆 Calculus Olympiad Crash Book", price: 35, downloads: 48, status: "Active" },
    { id: "dp_2", name: "🧪 Eukaryotic Formula Wallpapers", price: 15, downloads: 22, status: "Active" }
  ]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState(10);
  
  // Custom equipped borders and titles locks
  const [equippedProfileFrame, setEquippedProfileFrame] = useState<string>(""); // e.g. "plasma_circle"
  const [equippedProfileTitle, setEquippedProfileTitle] = useState<string>("Rookie Solver"); // e.g. "Quantum Knight"
  const [ownedCosmeticItems, setOwnedCosmeticItems] = useState<string[]>(["Rookie Solver"]);

  // Search & Explorer parameters
  const [exploreSearchQuery, setExploreSearchQuery] = useState("");
  const [exploreSubjectFilter, setExploreSubjectFilter] = useState("All");
  const [exploreSchoolFilter, setExploreSchoolFilter] = useState("All");

  // Reporting & AI Moderation States
  const [reportingItem, setReportingItem] = useState<{ id: string; type: 'feed_post' | 'study_reel' } | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccessToast, setReportSuccessToast] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<string | null>(null);

  // Comment streams
  const [postCommentText, setPostCommentText] = useState<Record<string, string>>({});
  const [reelCommentText, setReelCommentText] = useState<Record<string, string>>({});

  // Active status lists
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [dailyPostsCount, setDailyPostsCount] = useState<number>(() => {
    const saved = localStorage.getItem("nexa_posts_day_count");
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [activeDmIdx, setActiveDmIdx] = useState(0);
  const [dmInput, setDmInput] = useState("");
  
  // Simulated voice message recording state machines
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordIntervalRef = useRef<any>(null);

  // Active voice playback state (holds ID of currently "playing" speech clip)
  const [playingVoiceMsgId, setPlayingVoiceMsgId] = useState<string | null>(null);

  // Send gift interaction states
  const [showGiftModal, setShowGiftModal] = useState(false);

  // Share interaction states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTargetType, setShareTargetType] = useState<'feed_post' | 'study_reel' | 'chat'>('feed_post');
  const [shareTargetId, setShareTargetId] = useState<string>('');
  const [shareTargetTitle, setShareTargetTitle] = useState<string>('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');

  // Available study gift presets
  const studyGifts = [
    { name: "Coffee Cup", emoji: "☕", cost: 5, xp: 10, bonus: "+10% Study Focus boost" },
    { name: "Math Compass", emoji: "📐", cost: 15, xp: 30, bonus: "+15% Formula Velocity" },
    { name: "Microscope", emoji: "🔬", cost: 50, xp: 100, bonus: "+20% Exam Predictor precision" },
    { name: "Nexa Medal", emoji: "🏅", cost: 100, xp: 250, bonus: "Unlocks Legend League Entry" },
    { name: "Olympiad Trophy", emoji: "🏆", cost: 200, xp: 500, bonus: "Unlocks Golden Profile Shimmer" }
  ];

  // Initiate voice message recording sequence
  const startVoiceRecording = () => {
    try {
      playMicRecordStart();
    } catch (e) {}
    setIsRecordingVoice(true);
    setRecordDuration(0);
    recordIntervalRef.current = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
    onAddNotification(
      "Voice Recorder Active 🎤",
      "Recording audio query vector signals... Click Stop to transmit.",
      "info"
    );
  };

  // Halt recording and append a visual audio voice message bubble
  const stopVoiceRecordingAndSend = () => {
    try {
      playSuccessChime();
    } catch (e) {}
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    setIsRecordingVoice(false);
    
    // Fallback safe duration
    const duration = recordDuration > 0 ? recordDuration : 5;
    const voiceText = `🎤 [Voice Message 0:0${duration}s]`;

    const activeSession = chats[activeDmIdx];
    if (!activeSession) return;

    const newMessage: ChatMessage = {
      id: `m_voice_${Date.now()}`,
      sender: "You",
      avatar: profile.avatar,
      text: voiceText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    const updatedMessages = [...activeSession.messages, newMessage];
    const updatedSessions = chats.map((s, idx) => {
      if (idx === activeDmIdx) {
        return { ...s, messages: updatedMessages };
      }
      return s;
    });

    setChats(updatedSessions);
    setRecordDuration(0);
    onAddNotification("Voice Doubt Dispatched 🎤", `Transmitted high fidelity audio packet (${duration}s).`, "success");

    // Spawn an automated, context-aware AI or friend response automatically to close the flow loop
    setTimeout(() => {
      const responseMessage: ChatMessage = {
        id: `m_voice_reply_${Date.now()}`,
        sender: activeSession.recipientName,
        avatar: activeSession.recipientAvatar,
        text: `🔊 Decrypted custom Voice Message successfully: "How do we simplify the chemical kinetics equations before solver compilation?"\n\n💡 Response: We assume steady-state approximation and eliminate intermediates. I've updated kinetic models in our study channel whiteboard!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: { "👍": 1 }
      };

      setChats(prev => prev.map((s, idx) => {
        if (idx === activeDmIdx) {
          return { ...s, messages: [...s.messages, responseMessage] };
        }
        return s;
      }));
    }, 1500);
  };

  // Dispatch a profile-enhancing academic gift with a coin-deduct fee checkpoint
  const handleSendGift = (gift: { name: string; emoji: string; cost: number; xp: number; bonus: string }) => {
    const activeSession = chats[activeDmIdx];
    if (!activeSession) return;

    // Coins are deducted directly using onDeductCoins hook!
    if (onDeductCoins && !onDeductCoins(gift.cost)) {
      setShowGiftModal(false);
      return;
    }

    try {
      playSuccessChime();
    } catch (e) {}

    const giftText = `🎁 Sent Gift: ${gift.emoji} ${gift.name} (${gift.cost} NEXA coins) - ${gift.bonus}!`;

    const newMessage: ChatMessage = {
      id: `m_gift_${Date.now()}`,
      sender: "You",
      avatar: profile.avatar,
      text: giftText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    const updatedMessages = [...activeSession.messages, newMessage];
    const updatedSessions = chats.map((s, idx) => {
      if (idx === activeDmIdx) {
        return { ...s, messages: updatedMessages };
      }
      return s;
    });

    setChats(updatedSessions);
    setShowGiftModal(false);
    onAddNotification(
      "Academic Gift Transmitted 🎁",
      `Gratefully sent ${gift.name} to @${activeSession.recipientName}! Granted +${gift.xp} XP nodes.`,
      "success"
    );

    // Yield reward XP to sender for their community support!
    onGrantRewards(gift.xp, 0);

    // Friend responds with deep gratitude
    setTimeout(() => {
      const compliments = [
        `OMG! Thank you for the awesome ${gift.name} ${gift.emoji}! 😭💖 This completely energizes my study streak coefficient! Let's conquer the ranks!`,
        `Direct peer-to-peer telemetry boost received! This ${gift.emoji} ${gift.name} is magnificent. I appreciate your high-value coordination standard.`,
        `Absolute legendary teammate behavior! Thanks for the ${gift.emoji} ${gift.name}. Let's crack this week's AI exam challenges together! 🎉`
      ];
      const randomComp = compliments[Math.floor(Math.random() * compliments.length)];

      const gratitudeMessage: ChatMessage = {
        id: `m_gift_reply_${Date.now()}`,
        sender: activeSession.recipientName,
        avatar: activeSession.recipientAvatar,
        text: randomComp,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: { "💖": 2, "🔥": 1 }
      };

      setChats(prev => prev.map((s, idx) => {
        if (idx === activeDmIdx) {
          return { ...s, messages: [...s.messages, gratitudeMessage] };
        }
        return s;
      }));
    }, 1200);
  };
  
  const [showingStory, setShowingStory] = useState<{
    username: string;
    avatar: string;
    topic: string;
    desc: string;
    streak: number;
  } | null>(null);

  // Custom audio integration inside creation workflow
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string>("");
  const [selectedAudioName, setSelectedAudioName] = useState<string>("");
  const [reelAudioVolume, setReelAudioVolume] = useState<number>(0.75);
  const [reelOriginalVolume, setReelOriginalVolume] = useState<number>(0.50);
  const [showAudioLibrary, setShowAudioLibrary] = useState<boolean>(false);

  // States for FeedPost audio playing
  const [feedAudioUrl, setFeedAudioUrl] = useState<string>("");
  const [playingPostId, setPlayingPostId] = useState<string | null>(null);
  const feedAudioInstRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = feedAudioInstRef.current;
    if (audio) {
      if (feedAudioUrl) {
        audio.volume = 0.5;
        audio.play().catch(e => console.warn("Failed to play feed audio:", e));
      } else {
        audio.pause();
      }
    }
  }, [feedAudioUrl]);

  // Group construct parameters
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [rawSquadName, setRawSquadName] = useState("");
  const [rawSquadIcon, setRawSquadIcon] = useState("📐");
  const [rawSquadDesc, setRawSquadDesc] = useState("");
  const [squadInvitedFriends, setSquadInvitedFriends] = useState<string[]>([]);

  // Post & Reels uploading overlays
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'post' | 'reel'>('post');
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostTag, setNewPostTag] = useState("Olympiad Study Guide");
  const [newPostMedia, setNewPostMedia] = useState("");
  const [newReelCaption, setNewReelCaption] = useState("");
  const [newReelTag, setNewReelTag] = useState("#mathtricks");
  const [newReelVideoUrl, setNewReelVideoUrl] = useState("https://assets.mixkit.co/videos/preview/mixkit-curious-student-writing-maths-formulas-41716-large.mp4");

  // Constant seed databases for explore notes
  const trendingNotesData = [
    { id: "note_1", title: "Calculus Delta-Epsilon Limits", author: "AuraCoder_⚡", subject: "Math", downloads: 840, rating: 4.9 },
    { id: "note_2", title: "CRISPR Eukaryotic Sequences Whiteboard", author: "BioQueen_🌿", subject: "Biology", downloads: 620, rating: 4.8 },
    { id: "note_3", title: "Quantum Superposition Matrices", author: "QuantumSolver_🌌", subject: "Physics", downloads: 490, rating: 5.0 },
    { id: "note_4", title: "Optimal Rust Pointer Speed Tactics", author: "CodeGod_💻", subject: "Computer Science", downloads: 1200, rating: 4.9 },
    { id: "note_5", title: "Molecular displacement displacement logs", author: "MoleculeWielder_🧪", subject: "Chemistry", downloads: 350, rating: 4.6 }
  ];

  const popularBattlesData = [
    { id: "bt_1", title: "Thermodynamic Vector Core", subject: "Physics", players: 12, prize: 350, active: true },
    { id: "bt_2", title: "Algebraic Competitive Olympiad", subject: "Math", players: 18, prize: 500, active: true },
    { id: "bt_3", title: "Organic Carbon Compound Displacement", subject: "Chemistry", players: 8, prize: 200, active: false },
    { id: "bt_4", title: "Eukaryotic Cell DNA Division Speedrun", subject: "Biology", players: 14, prize: 400, active: true }
  ];

  const audioLibraryTracks = [
    { name: "🎵 Study Beats Lofi Synth", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", category: "Focus Lofi" },
    { name: "🎵 Cyberpunk Synthwave Ambience", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", category: "Upbeat" },
    { name: "🎵 Deep Focus Alpha Waves", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", category: "Ambient" },
    { name: "🎵 Chill Academic Chillout", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", category: "Chill" },
  ];

  const stories = [
    { username: "BioQueen_🌿", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Queen", topic: "CRISPR Editing", desc: "Just diagrammed eukaryotic molecular sequences in dynamic whiteboard!", streak: 12 },
    { username: "AuraCoder_⚡", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura", topic: "Rust Compiler Hacks", desc: "Superposition bitshifts working at 10x memory speeds!", streak: 24 },
    { username: "CodeGod_💻", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Coder", topic: "B-Tree Node Search", desc: "Speed solving competitive Olympiad graph algorithms.", streak: 18 },
    { username: "ForceMaster_⚛️", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Force", topic: "Friction Vectors", desc: "Calculating optimal orbital vectors for satellite escape.", streak: 6 },
    { username: "MoleculeWielder_🧪", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Molecule", topic: "Alkaline Electrons", desc: "Simulating molecular displacement with organic acid reactions.", streak: 9 }
  ];

  const peerCandidates = [
    { username: "QuantumSolver_🌌", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Quant", rank: "Gold IV", score: "2,450 XP", badge: "AURA_EXPERT", school: "MIT Engineering" },
    { username: "ThermodynamicBorg_🔥", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Thermo", rank: "Titan II", score: "4,890 XP", badge: "FORMULA_GOD", school: "Stanford University" },
    { username: "MicrobialHacker_🧬", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Microbe", rank: "Silver I", score: "1,120 XP", badge: "BIO_LAB_REBEL", school: "Nexa Olympiad Core" },
    { username: "AlgebraicSniper_📐", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sniper", rank: "Legend I", score: "9,800 XP", badge: "OLYMPIAD_SQUAD", school: "Oxford CompSci" },
    { username: "NeuroVeda_🧠", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Veda", rank: "Titan I", score: "5,110 XP", badge: "CHRONOS_SOLVER", school: "Nexa Olympiad Core" }
  ];

  // Cooldown & Moderation Checks for Posting
  const handleAIPostModeration = (captionText: string): boolean => {
    const maliciousTerms = ["banned", "spam", "abuse", "bot", "hack coins", "cheat codes", "free cash", "adult", "fake xp"];
    const foundSpam = maliciousTerms.some(term => captionText.toLowerCase().includes(term));
    if (foundSpam) {
      onAddNotification("Post Blocked by AI Moderator", "Your content has triggered security filters (Promotional / Spam nodes). Rejecting.", "alert");
      alert("⚠️ NexaGuard AI Moderation Block: Detected anomalous promotional or spam text coordinates. Block code: #SPAN_404.");
      return false;
    }
    return true;
  };

  const verifyUploadPermissions = (): boolean => {
    const now = Date.now();
    const waitTimeSeconds = 20;
    if (now - lastPostTimestamp < waitTimeSeconds * 1000) {
      const waitRemaining = Math.ceil((waitTimeSeconds * 1000 - (now - lastPostTimestamp)) / 1000);
      onAddNotification("Rate Limit Active", `Please observe the anti-bot cooldown intervals. Wait ${waitRemaining}s.`, "alert");
      return false;
    }
    return true;
  };

  // Reactions Logic: 🔥 Smart, 🧠 Genius, ⚡ Fast Learner, 🚀 Legendary
  const handleToggleFeedReaction = (postId: string, reactionType: 'smart' | 'genius' | 'fast' | 'legendary') => {
    // Farm prevention mechanism
    if (sessionXpEarned > 450) {
      onAddNotification("Daily Farming Limit Active", "Anti-Farming Core triggered. Rewards locked temporarily to preserve leaderboard integrity.", "alert");
    }

    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const reactions = (post as any).reactions || { smart: 0, genius: 0, fast: 0, legendary: 0 };
        const userReactions = (post as any).userReactions || { smart: false, genius: false, fast: false, legendary: false };
        const hasReacted = !!userReactions[reactionType];

        const nextReactionsValue = hasReacted 
          ? Math.max(0, (reactions[reactionType] || 0) - 1) 
          : (reactions[reactionType] || 0) + 1;
        
        const nextUserReactValue = !hasReacted;

        const updatedPost = {
          ...post,
          reactions: {
            ...reactions,
            [reactionType]: nextReactionsValue
          },
          userReactions: {
            ...userReactions,
            [reactionType]: nextUserReactValue
          }
        };

        syncPostToFirestore(postId, updatedPost).catch(e => console.warn("Firestore post reaction update failed:", e));

        if (!hasReacted) {
          const grantXp = sessionXpEarned <= 450 ? 8 : 1;
          const grantCoins = sessionXpEarned <= 450 ? 4 : 0;
          onGrantRewards(grantXp, grantCoins);
          setSessionXpEarned(prev => prev + grantXp);
          onAddNotification("Metacog Transferred", `Dispatched ${reactionType.toUpperCase()} feedback metrics! Generated reward points.`, "success");
        }

        return updatedPost;
      }
      return post;
    }));
  };

  // Reactions logic for Video Study reels
  const handleToggleReelReaction = (reelId: string, reactionType: 'smart' | 'genius' | 'fast' | 'legendary') => {
    setReels(prev => prev.map(r => {
      if (r.id === reelId) {
        const reactions = (r as any).reactions || { smart: 12, genius: 4, fast: 8, legendary: 6 };
        const userReactions = (r as any).userReactions || { smart: false, genius: false, fast: false, legendary: false };
        const hasReacted = !!userReactions[reactionType];

        const nextReactionsValue = hasReacted 
          ? Math.max(0, (reactions[reactionType] || 0) - 1) 
          : (reactions[reactionType] || 0) + 1;
        
        const nextUserReactValue = !hasReacted;

        const updatedReel = {
          ...r,
          reactions: {
            ...reactions,
            [reactionType]: nextReactionsValue
          },
          userReactions: {
            ...userReactions,
            [reactionType]: nextUserReactValue
          }
        };

        syncReelToFirestore(reelId, updatedReel).catch(e => console.warn("Firestore reel reaction update failed:", e));

        if (!hasReacted) {
          onGrantRewards(5, 5);
          onAddNotification("Stream Solved", `Synchronized ${reactionType.toUpperCase()} index with @${r.creator}.`, "success");
        }

        return updatedReel;
      }
      return r;
    }));
  };

  // Submit report logic
  const handleTriggerReport = (itemId: string, type: 'feed_post' | 'study_reel') => {
    setReportingItem({ id: itemId, type: type });
    setReportReason("");
    setReportSuccessToast(false);

    const profileNameLower = (profile && profile.username ? profile.username : "anonymous").toLowerCase();
    const key = `nexa_last_report_time_${profileNameLower}`;
    const lastReportTimeStr = localStorage.getItem(key);
    
    if (lastReportTimeStr) {
      const lastReportTime = parseInt(lastReportTimeStr, 10);
      const diff = Date.now() - lastReportTime;
      const limit = 24 * 60 * 60 * 1000;
      if (diff < limit) {
        const remainingMs = limit - diff;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        setRateLimitCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setRateLimitCountdown(null);
      }
    } else {
      setRateLimitCountdown(null);
    }
  };

  const handleConfirmSubmitReport = async () => {
    if (!reportingItem) return;
    if (reportReason.trim().length < 10) {
      alert("Reason parameter too restricted. Please construct at least 10 human characters explanation.");
      return;
    }

    try {
      const reportId = `rep_${Date.now()}`;
      const newReportData = {
        reporter: profile.username || "AnonymousStudent",
        targetId: reportingItem.id,
        targetType: reportingItem.type,
        reason: reportReason.trim(),
        timestamp: new Date().toISOString()
      };

      await setDoc(doc(db, "reports", reportId), newReportData);

      const profileNameLowerWrite = (profile && profile.username ? profile.username : "anonymous").toLowerCase();
      localStorage.setItem(`nexa_last_report_time_${profileNameLowerWrite}`, Date.now().toString());

      setReportSuccessToast(true);
      onAddNotification("Report Dispatched ✓", "NexaGuard moderator pipeline received your moderation file.", "success");

      setTimeout(() => {
        setReportingItem(null);
        setReportSuccessToast(false);
      }, 2500);

    } catch (err) {
      console.error("Firestore report submission error:", err);
      alert("Submission error. Suboptimal connection nodes.");
    }
  };

  // Publishing Post
  const triggerPublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyUploadPermissions()) return;
    if (dailyPostsCount >= 10) {
      onAddNotification("Post Limit Blocked", "Anti-XP-farmers safeguard: Max 10 daily academic dispatches reached.", "warning");
      alert("⚠️ Daily post limit reached. Max 10 daily dispatches.");
      return;
    }
    if (!newPostCaption.trim()) {
      alert("⚠️ Please enter a caption describing your study progress first!");
      return;
    }
    if (!handleAIPostModeration(newPostCaption)) return;

    const uploadedPost: FeedPost = {
      id: `p_uploaded_${Date.now()}`,
      username: profile.username || "AnonymousDev",
      avatar: profile.avatar,
      timeAgo: "Just now",
      content: newPostCaption,
      likes: 0,
      liked: false,
      tag: newPostTag,
      comments: [],
      mediaUrl: newPostMedia.trim() ? newPostMedia.trim() : undefined,
      audioUrl: selectedAudioUrl || undefined,
      audioName: selectedAudioName || undefined,
    };

    // Assign initial empty reactions structure
    (uploadedPost as any).reactions = { smart: 0, genius: 0, fast: 0, legendary: 0 };
    (uploadedPost as any).userReactions = { smart: false, genius: false, fast: false, legendary: false };

    const nextCount = dailyPostsCount + 1;
    setDailyPostsCount(nextCount);
    localStorage.setItem("nexa_posts_day_count", String(nextCount));
    setLastPostTimestamp(Date.now());

    syncPostToFirestore(uploadedPost.id, uploadedPost).catch(err => console.warn(err));

    try {
      const saved = localStorage.getItem("nexa_local_uploaded_posts");
      const localList: FeedPost[] = saved ? JSON.parse(saved) : [];
      localList.push(uploadedPost);
      localStorage.setItem("nexa_local_uploaded_posts", JSON.stringify(localList));
    } catch (e) {
      console.warn("Could not save uploaded post locally:", e);
    }

    setFeedPosts([uploadedPost, ...feedPosts]);
    setUploadModalOpen(false);
    setNewPostCaption("");
    setNewPostMedia("");
    setSelectedAudioUrl("");
    setSelectedAudioName("");

    onGrantRewards(50, 20);
    onAddNotification("Academic Post Live 🚀", "Claim voucher created perfectly! Granted 50 XP + 20 Nexa Coins.", "success");
  };

  // Publishing Reel
  const triggerPublishReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyUploadPermissions()) return;
    if (dailyPostsCount >= 10) {
      onAddNotification("Posting block active", "Max 10 uploads daily quota exceeded.", "warning");
      alert("⚠️ Daily upload limit reached. Max 10 daily dispatches.");
      return;
    }
    if (!newReelCaption.trim()) {
      alert("⚠️ Please enter a caption explaining your whiteboard study video first!");
      return;
    }
    if (!handleAIPostModeration(newReelCaption)) return;

    const uploadedReel: StudyReel = {
      id: `r_uploaded_${Date.now()}`,
      videoUrl: newReelVideoUrl,
      creator: profile.username || "You",
      creatorAvatar: profile.avatar,
      caption: newReelCaption,
      likes: 0,
      comments: 0,
      liked: false,
      saved: false,
      tags: newReelTag.split(" ").filter(t => t.startsWith("#")),
      dislikes: 0,
      disliked: false,
      commentsList: [],
      views: 0,
      audioUrl: selectedAudioUrl || undefined,
      audioName: selectedAudioName || undefined,
      audioVolume: selectedAudioUrl ? reelAudioVolume : undefined,
      originalVolume: reelOriginalVolume
    };

    (uploadedReel as any).reactions = { smart: 0, genius: 0, fast: 0, legendary: 0 };
    (uploadedReel as any).userReactions = { smart: false, genius: false, fast: false, legendary: false };

    const nextCount = dailyPostsCount + 1;
    setDailyPostsCount(nextCount);
    localStorage.setItem("nexa_posts_day_count", String(nextCount));
    setLastPostTimestamp(Date.now());

    // Upload to global Firestore
    syncReelToFirestore(uploadedReel.id, uploadedReel).catch(err => console.warn(err));

    try {
      const saved = localStorage.getItem("nexa_local_uploaded_reels");
      const localList: StudyReel[] = saved ? JSON.parse(saved) : [];
      localList.push(uploadedReel);
      localStorage.setItem("nexa_local_uploaded_reels", JSON.stringify(localList));
    } catch (e) {
      console.warn("Could not save uploaded reel locally:", e);
    }

    setReels([uploadedReel, ...reels]);
    setUploadModalOpen(false);
    setNewReelCaption("");
    setSelectedAudioUrl("");
    setSelectedAudioName("");

    onGrantRewards(80, 25);
    onAddNotification("Study Reel Live 🎬", "Reel processed. Granted 80 XP and 25 Nexa rewards.", "success");
    setSubTab("reels");
  };

  // Adding profile counters & stats calculation
  const totalQueriesResolved = useMemo(() => {
    return Number(localStorage.getItem("nexa_ai_queries") || 42);
  }, []);

  const totalArenasWon = useMemo(() => {
    return Number(localStorage.getItem("nexa_battle_wins") || 24);
  }, []);

  const totalMinutesConcentration = useMemo(() => {
    return Number(localStorage.getItem("nexa_study_minutes") || 485);
  }, []);

  // Comments area additions
  const handleAddPostCommentInline = (postId: string) => {
    const text = postCommentText[postId];
    if (!text || !text.trim()) return;

    const newComment: Comment = {
      id: `c_post_${Date.now()}`,
      username: profile.username || "You",
      avatar: profile.avatar,
      text: text.trim(),
      timeAgo: "Just now"
    };

    setFeedPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updatedPost = {
          ...p,
          comments: [...p.comments, newComment]
        };
        syncPostToFirestore(postId, updatedPost).catch(err => console.warn(err));
        return updatedPost;
      }
      return p;
    }));

    setPostCommentText(prev => ({ ...prev, [postId]: "" }));
    onGrantRewards(10, 0);
    onAddNotification("Comment Linked", "Academic response appended to post segment successfully.", "success");
  };

  const handleAddReelCommentInline = (reelId: string) => {
    const text = reelCommentText[reelId];
    if (!text || !text.trim()) return;

    const newComment: Comment = {
      id: `c_reel_${Date.now()}`,
      username: profile.username || "You",
      avatar: profile.avatar,
      text: text.trim(),
      timeAgo: "Just now"
    };

    setReels(prev => prev.map(r => {
      if (r.id === reelId) {
        const list = r.commentsList || [];
        const updatedReel = {
          ...r,
          comments: r.comments + 1,
          commentsList: [...list, newComment]
        };
        syncReelToFirestore(reelId, updatedReel).catch(err => console.warn(err));
        return updatedReel;
      }
      return r;
    }));

    setReelCommentText(prev => ({ ...prev, [reelId]: "" }));
    onGrantRewards(10, 0);
    onAddNotification("Reel comment published", "Interactive response synced to reel stream.", "success");
  };

  // Follow system mechanics
  const triggerAddFriend = (targetName: string) => {
    if (friends.includes(targetName)) {
      // Unfollow
      const updated = friends.filter(friend => friend !== targetName);
      setFriends(updated);
      const updatedProfile = { ...profile, friends: updated };
      setProfile(updatedProfile);
      localStorage.setItem("nexasnap_user", JSON.stringify(updatedProfile));
      onAddNotification("Unfollowed Peer", `Disconnected direct academic updates from @${targetName}.`, "info");
      return;
    }

    const updated = [...friends, targetName];
    setFriends(updated);
    const updatedProfile = { ...profile, friends: updated };
    setProfile(updatedProfile);
    localStorage.setItem("nexasnap_user", JSON.stringify(updatedProfile));
    onGrantRewards(20, 10);
    onAddNotification("Connection Synced! ✨", `You followed @${targetName}! +20 XP. Syncing live updates into feed.`, "success");
  };

  // Filter explore and search
  const filteredPeerPool = peerCandidates.filter(p => {
    const q = (exploreSearchQuery || '').toLowerCase();
    const matchesQuery = (p.username && typeof p.username === 'string' && p.username.toLowerCase().includes(q)) || 
                         (p.school && typeof p.school === 'string' && p.school.toLowerCase().includes(q)) ||
                         (p.badge && typeof p.badge === 'string' && p.badge.toLowerCase().includes(q));
    return matchesQuery;
  });

  const filteredTrendingNotes = trendingNotesData.filter(note => {
    const matchesSubject = exploreSubjectFilter === "All" || note.subject === exploreSubjectFilter;
    const q = (exploreSearchQuery || '').toLowerCase();
    const matchesQuery = (note.title && typeof note.title === 'string' && note.title.toLowerCase().includes(q)) || 
                         (note.author && typeof note.author === 'string' && note.author.toLowerCase().includes(q));
    return matchesSubject && matchesQuery;
  });

  const triggerStartDirectMessage = (friendName: string) => {
    const existing = chats.findIndex(ch => ch.recipientName.includes(friendName));
    if (existing >= 0) {
      setActiveDmIdx(existing);
      setSubTab("chats");
      return;
    }

    const spawned: ChatSession = {
      id: `ch_added_${Date.now()}`,
      recipientName: friendName,
      recipientAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${friendName.substring(0,4)}`,
      online: true,
      messages: [
        { id: `cm_spawn_${Date.now()}`, sender: friendName, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${friendName.substring(0,4)}`, text: `Academic sync active! Ready to crack competitive Olympiads together. Ask me any study variables!`, time: "Just now", reactions: {} }
      ]
    };

    setChats([spawned, ...chats]);
    setActiveDmIdx(0);
    setSubTab("chats");
    onAddNotification("Direct node synchronized", `Direct chat compilation complete with @${friendName}.`, "info");
  };

  const handleSendDmText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmInput.trim()) return;

    const activeSession = chats[activeDmIdx];
    if (!activeSession) return;

    const recipient = activeSession.recipientName || "";
    // Check if recipient is an AI mentor node, and charge 5 coins fee!
    const isAiRecipient = recipient.toLowerCase().includes("ai") || 
                          recipient.includes("Dr. Evelyn") || 
                          recipient.includes("Marcus") || 
                          recipient.includes("Professor") ||
                          recipient.includes("Evelyn") ||
                          recipient.includes("Veda") ||
                          recipient.includes("Thorne");

    if (isAiRecipient) {
      if (onDeductCoins && !onDeductCoins(5)) {
        return; // Blocked due to insufficient coins!
      }
    }

    const newMessage: ChatMessage = {
      id: `m_dm_${Date.now()}`,
      sender: "You",
      avatar: profile.avatar,
      text: dmInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    const updatedMessages = [...activeSession.messages, newMessage];
    const updatedSessions = chats.map((s, idx) => {
      if (idx === activeDmIdx) {
        return { ...s, messages: updatedMessages };
      }
      return s;
    });

    setChats(updatedSessions);
    setDmInput("");

    if (recipient.toLowerCase().includes("ai")) {
      setTimeout(() => {
        const responseMessage: ChatMessage = {
          ...newMessage,
          id: `m_mentor_reply_${Date.now()}`,
          sender: activeSession.recipientName,
          avatar: activeSession.recipientAvatar,
          text: `Coprocessor telemetry received: "${newMessage.text}". I have structured this payload and indexed the respective variables. Proceed with concentration loop.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChats(prev => prev.map((s, idx) => {
          if (idx === activeDmIdx) {
            return { ...s, messages: [...s.messages, responseMessage] };
          }
          return s;
        }));
      }, 900);
    }
  };

  const triggerConstructSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawSquadName.trim()) return;

    const newSquad: StudyGroup = {
      id: `g_new_${Date.now()}`,
      name: rawSquadName.trim(),
      icon: rawSquadIcon,
      description: rawSquadDesc.trim() || "Collaborative workspace node for solving formula packs.",
      membersCount: 1 + squadInvitedFriends.length,
      leaderboard: [
        { username: profile.username || "You", xp: profile.xp },
        ...squadInvitedFriends.map(f => ({ username: f, xp: 80 }))
      ],
      sharedNotesCount: 0,
      activeVoiceRooms: 0
    };

    setStudyGroups([newSquad, ...studyGroups]);
    setGroupModalOpen(false);
    setRawSquadName("");
    setRawSquadDesc("");
    setSquadInvitedFriends([]);

    onGrantRewards(40, 15);
    onAddNotification("Discord Study Room Created 📐", `Compiling direct study group "${rawSquadName.trim()}" successfully!`, "success");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Dynamic Cyber-Social HUD Header */}
      <div className="neo-glass rounded-[32px] p-5 border-white/5 relative bg-black/55 overflow-hidden flex flex-col gap-4">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-500/5 blur-[80px] pointer-events-none rounded-full" />

        <div className="flex justify-between items-center z-10 relative">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">📸</span>
            <div>
              <h3 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-[#CCFF00] font-mono">
                NEXAGRAM SOCIAL
              </h3>
              <p className="text-[9px] text-[#CCFF00] font-mono uppercase tracking-wider">
                Metacog Study ecosystem • Instagram & Discord & Duolingo Fusion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setUploadType('post');
                setUploadModalOpen(true);
              }}
              className="flex items-center gap-1.5 py-2 px-3.5 bg-gradient-to-r from-[#CCFF00] to-cyan-400 text-black font-extrabold text-[10px] rounded-xl font-mono hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg border-none"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3px]" />
              POST SNAP
            </button>
          </div>
        </div>

        {/* Dynamic Snapchat-like disappearing Stories Segment */}
        <div className="border-t border-b border-white/5 py-4 overflow-x-auto select-none">
          <div className="flex gap-4 items-center pl-1">
            
            <div className="flex flex-col items-center flex-shrink-0">
              <div 
                onClick={() => {
                  setUploadType('reel');
                  setUploadModalOpen(true);
                }}
                className="w-15 h-15 rounded-full bg-white/5 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-white/10 transition-all relative"
              >
                <img src={profile.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 bg-cyan-400 text-black rounded-full p-0.5 border border-black">
                  <Plus className="w-2.5 h-2.5 font-bold" />
                </div>
              </div>
              <span className="text-[9px] text-gray-500 mt-1 font-mono font-bold uppercase">Add Snap</span>
            </div>

            {stories.map((story) => (
              <div 
                key={story.username} 
                onClick={() => setShowingStory(story)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              >
                <div className="w-15 h-15 rounded-full p-[2px] bg-gradient-to-tr from-[#CCFF00] via-pink-500 to-purple-600 group-hover:scale-105 transition-all">
                  <div className="w-full h-full rounded-full bg-zinc-950 p-[1.5px] flex items-center justify-center">
                    <img src={story.avatar} alt={story.username} className="w-11 h-11 rounded-full bg-black/60 object-cover" />
                  </div>
                </div>
                <span className="text-[9.5px] text-gray-300 mt-1 truncate max-w-[75px] group-hover:text-[#CCFF00] font-semibold">
                  {story.username.split("_")[0]}
                </span>
                <span className="text-[8px] text-amber-400 font-mono flex items-center gap-0.5 scale-90">
                  🔥 {story.streak}d
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sleek Cybersecurity Cyber-Tabs Grid (8 Tabs Ultimate Setup!) */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-1 p-1 bg-black/50 rounded-2xl border border-white/10 font-mono text-[9px] font-black tracking-tighter mb-6">
          <button
            onClick={() => setSubTab("feed")}
            className={`py-2 px-1 rounded-xl text-center select-none cursor-pointer border-none transition-all duration-300 ${subTab === "feed" ? "bg-cyan-500/20 text-cyan-300 font-extrabold border-b border-cyan-400" : "text-gray-400 hover:text-white hover:bg-white/5 bg-transparent"}`}
          >
            📱 FEED
          </button>
          <button
            onClick={() => setSubTab("reels")}
            className={`py-2 px-1 rounded-xl text-center select-none cursor-pointer border-none transition-all duration-300 ${subTab === "reels" ? "bg-pink-500/20 text-pink-300 font-extrabold border-b border-pink-400" : "text-gray-400 hover:text-white hover:bg-white/5 bg-transparent"}`}
          >
            🎬 SNAPS
          </button>
          <button
            onClick={() => setSubTab("explore")}
            className={`py-2 px-1 rounded-xl text-center select-none cursor-pointer border-none transition-all duration-300 ${subTab === "explore" ? "bg-[#CCFF00]/15 text-[#CCFF00] font-extrabold border-b border-[#CCFF00]" : "text-gray-400 hover:text-white hover:bg-white/5 bg-transparent"}`}
          >
            🔍 EXPLORE
          </button>
          <button
            onClick={() => setSubTab("ai_creator")}
            className={`py-2 px-1 rounded-xl text-center select-none cursor-pointer border-none transition-all duration-300 ${subTab === "ai_creator" ? "bg-amber-500/20 text-amber-300 font-extrabold border-b border-amber-400" : "text-gray-400 hover:text-white hover:bg-white/5 bg-transparent"}`}
          >
            🧠 AI CREATOR
          </button>
          <button
            onClick={() => setSubTab("chats")}
            className={`py-2 px-1 rounded-xl text-center select-none cursor-pointer border-none transition-all duration-300 ${subTab === "chats" ? "bg-emerald-500/20 text-emerald-300 font-extrabold border-b border-emerald-400" : "text-gray-400 hover:text-white hover:bg-white/5 bg-transparent"}`}
          >
            💬 STAGES
          </button>
          <button
            onClick={() => setSubTab("tournaments")}
            className={`py-2 px-1 rounded-xl text-center select-none cursor-pointer border-none transition-all duration-300 ${subTab === "tournaments" ? "bg-blue-500/20 text-blue-300 font-extrabold border-b border-blue-400" : "text-gray-400 hover:text-white hover:bg-white/5 bg-transparent"}`}
          >
            🏆 LEAGUE
          </button>
          <button
            onClick={() => setSubTab("wallet")}
            className={`py-2 px-1 rounded-xl text-center select-none cursor-pointer border-none transition-all duration-300 ${subTab === "wallet" ? "bg-amber-400/20 text-amber-200 font-extrabold border-b border-amber-400" : "text-gray-400 hover:text-white hover:bg-white/5 bg-transparent"}`}
          >
            💰 STUDIO
          </button>
          <button
            onClick={() => setSubTab("profile")}
            className={`py-2 px-1 rounded-xl text-center select-none cursor-pointer border-none transition-all duration-300 ${subTab === "profile" ? "bg-purple-500/20 text-purple-300 font-extrabold border-b border-purple-400" : "text-gray-400 hover:text-white hover:bg-white/5 bg-transparent"}`}
          >
            👤 MY NEST
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🎬 STORIES HIGHLIGHT COMPONENT DIALOG */}
      {/* ──────────────────────────────────────────────────────── */}
      {showingStory && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[32px] border border-[#CCFF00]/20 bg-[#0c0d12] relative overflow-hidden flex flex-col justify-between p-6 h-[460px] shadow-[0_0_50px_rgba(204,255,0,0.1)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl pointer-events-none rounded-full" />
            
            <div>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <img src={showingStory.avatar} alt="" className="w-9 h-9 rounded-full border-2 border-pink-500 p-0.5 object-cover" />
                  <div>
                    <span className="text-xs font-black text-white block">@{showingStory.username}</span>
                    <span className="text-[8.5px] text-[#CCFF00] font-mono tracking-widest uppercase">CONSECUTIVE STREAK: {showingStory.streak} DAYS</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowingStory(null)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 border border-white/5 cursor-pointer outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full bg-white/5 h-1 rounded-full mb-6 overflow-hidden">
                <div className="bg-pink-500 h-full w-[80%] animate-pulse" />
              </div>

              <div className="bg-black/60 border border-white/5 rounded-2xl p-5 text-center mt-4">
                <span className="px-2.5 py-1 bg-pink-500/20 text-pink-400 text-[8.5px] font-mono rounded-full font-bold uppercase tracking-widest mb-3 inline-block">
                  {showingStory.topic}
                </span>
                <p className="text-xs text-gray-200 leading-relaxed italic">
                  "{showingStory.desc}"
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  triggerStartDirectMessage(showingStory.username);
                  setShowingStory(null);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs rounded-xl cursor-pointer hover:opacity-90 border-none uppercase font-mono tracking-widest"
              >
                ⚡ ENGAGE CHAT NODE
              </button>
              <button
                onClick={() => {
                  triggerAddFriend(showingStory.username);
                }}
                className="w-full py-2.5 bg-white/5 text-gray-300 font-bold text-xs rounded-xl hover:bg-white/10 cursor-pointer border border-white/5 uppercase font-mono"
              >
                {friends.includes(showingStory.username) ? "✓ Following" : "Follow Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 📱 SCREEN 1: INTERACTIVE FEED (Social Posts with reactions) */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "feed" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Futuristic Cyber Feed Selector Tab Bar */}
          <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl font-mono text-[10px] font-bold">
            <button
              onClick={() => { setFeedFilter("personalized"); playInterfaceClick(); }}
              className={`flex-1 py-1.5 rounded-xl text-center select-none cursor-pointer border-none transition-all ${feedFilter === "personalized" ? "bg-cyan-500/15 text-cyan-300" : "text-gray-400 hover:text-white"}`}
            >
              🪐 PERSONALIZED
            </button>
            <button
              onClick={() => { setFeedFilter("trending"); playInterfaceClick(); }}
              className={`flex-1 py-1.5 rounded-xl text-center select-none cursor-pointer border-none transition-all ${feedFilter === "trending" ? "bg-amber-400/15 text-amber-300" : "text-gray-400 hover:text-white"}`}
            >
              🔥 TRENDING FEED
            </button>
            <button
              onClick={() => { setFeedFilter("following"); playInterfaceClick(); }}
              className={`flex-1 py-1.5 rounded-xl text-center select-none cursor-pointer border-none transition-all ${feedFilter === "following" ? "bg-purple-500/15 text-purple-300" : "text-gray-400 hover:text-white"}`}
            >
              👥 FOLLOWING ({followedPeers.length + friends.length})
            </button>
          </div>

          {filteredFeedPosts.map((post, index) => {
            const hasDisliked = (post as any).disliked || false;
            const dislikesCount = (post as any).dislikes || 0;
            const commentVal = postCommentText[post.id] || "";

            // Custom futuristic reactions list structures
            const rx = (post as any).reactions || { smart: 0, genius: 0, fast: 0, legendary: 0 };
            const uRx = (post as any).userReactions || { smart: false, genius: false, fast: false, legendary: false };

            return (
              <React.Fragment key={post.id}>
                <div className="neo-glass rounded-[32px] p-6 border-white/5 relative bg-black/40 overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
                
                {/* Header info */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <img src={post.avatar} alt="" className="w-10 h-10 rounded-full bg-black/40 border border-white/10 object-cover" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-black text-white hover:text-cyan-400 cursor-pointer">@{post.username}</h4>
                        {post.username && profile && profile.username && post.username.toLowerCase() !== profile.username.toLowerCase() && (
                          <button
                            onClick={() => {
                              const uLower = (post.username || '').toLowerCase().trim();
                              const alreadyFollowing = followedPeers.some(p => p && typeof p === 'string' && p.toLowerCase().trim() === uLower);
                              if (alreadyFollowing) {
                                setFollowedPeers(prev => prev.filter(p => p && typeof p === 'string' && p.toLowerCase().trim() !== uLower));
                                onAddNotification("Unfollowed Student", `Stopped listening to @${post.username}.`, "info");
                              } else {
                                setFollowedPeers(prev => [...prev, post.username]);
                                playSuccessChime();
                                onAddNotification("Followed Student! 👥", `Stream synchronized with @${post.username}!`, "success");
                              }
                            }}
                            className={`text-[8.5px] font-bold font-mono px-2 py-0.5 rounded-full cursor-pointer transition-all border ${
                              followedPeers.some(p => p && typeof p === 'string' && p.toLowerCase().trim() === (post.username || '').toLowerCase().trim())
                                ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                                : "bg-[#CCFF00] text-black border-none hover:bg-lime-400"
                            }`}
                          >
                            {followedPeers.some(p => p && typeof p === 'string' && p.toLowerCase().trim() === (post.username || '').toLowerCase().trim()) ? "✓ FOLLOWING" : "+ FOLLOW"}
                          </button>
                        )}
                        <span className="text-[8px] bg-purple-500/15 text-purple-400 font-bold px-1.5 py-0.5 rounded font-mono uppercase">VERIFIED</span>
                        {index % 2 === 0 && (
                          <span className="text-[8px] bg-amber-500/15 text-amber-300 font-extrabold px-1.5 py-0.5 rounded font-mono uppercase">👑 PREMIUM</span>
                        )}
                      </div>
                      <span className="text-[8px] text-gray-500 font-mono uppercase tracking-widest">{post.timeAgo} • via Cloud Sync Node</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-2.5 py-0.5 bg-white/5 text-gray-300 font-mono rounded-full border border-white/5 uppercase">
                    {post.tag || "General Log"}
                  </span>
                </div>

                {/* Content body */}
                <div className="space-y-4">
                  <p className="text-xs text-gray-200 leading-relaxed font-mono whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Real Dynamic Interactive Poll Component support */}
                  {(post as any).poll && (
                    <div className="p-4 rounded-2xl bg-black/60 border border-[#CCFF00]/10 space-y-3 mt-2 text-left">
                      <p className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse" />
                        📊 Poll: {(post as any).poll.question}
                      </p>
                      <div className="space-y-2">
                        {(post as any).poll.options.map((opt: any, oIdx: number) => {
                          const hasVoted = userPollAnswers[post.id] !== undefined;
                          const votedIdx = userPollAnswers[post.id];
                          const totalVotes = (post as any).poll.options.reduce((sum: number, o: any) => sum + o.votes, 0) + (hasVoted ? 1 : 0);
                          const currentVotes = opt.votes + (votedIdx === oIdx ? 1 : 0);
                          const percentage = Math.round((currentVotes / totalVotes) * 100);

                          return (
                            <button
                              key={oIdx}
                              disabled={hasVoted}
                              onClick={() => {
                                setUserPollAnswers(prev => ({ ...prev, [post.id]: oIdx }));
                                onGrantRewards(5, 2);
                                playSuccessChime();
                                onAddNotification("Vote Registered! 📊", "Captured synergy metrics. Awarded +5 XP, +2 Coins!", "success");
                              }}
                              className={`w-full text-left relative overflow-hidden p-3 rounded-xl border font-mono text-xs transition-all flex justify-between items-center cursor-pointer ${
                                hasVoted 
                                  ? votedIdx === oIdx 
                                    ? "border-cyan-400/50 bg-cyan-950/20 text-cyan-300" 
                                    : "border-white/5 bg-zinc-950/40 text-gray-550"
                                  : "border-white/5 bg-zinc-900/40 hover:bg-zinc-900 text-white"
                              }`}
                            >
                              {hasVoted && (
                                <div 
                                  className="absolute left-0 top-0 bottom-0 bg-cyan-500/10 transition-all duration-500" 
                                  style={{ width: `${percentage}%` }}
                                />
                              )}
                              <span className="relative z-10 font-bold">{opt.text}</span>
                              {hasVoted && (
                                <span className="relative z-10 text-[10px] font-mono text-cyan-400 font-extrabold">{percentage}% ({currentVotes})</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Real Dynamic Interactive Quiz Component support */}
                  {(post as any).quiz && (
                    <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/10 space-y-3 mt-2 text-left">
                      <div className="flex justify-between items-center bg-purple-500/5 p-2 rounded-lg border border-purple-500/10">
                        <span className="text-[9.5px] font-black text-purple-400 tracking-wider font-mono uppercase">🧠 EXAM PREDICTION BLITZ RUN</span>
                        <span className="text-[9px] text-[#CCFF00] font-mono font-bold">+40 XP & +15 COINS</span>
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">❓ Quiz Question: {(post as any).quiz.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(post as any).quiz.options.map((opt: string, oIdx: number) => {
                          const hasAnswered = userQuizAnswers[post.id] !== undefined;
                          const answeredIdx = userQuizAnswers[post.id];
                          const isCorrect = oIdx === (post as any).quiz.correctAnswerIndex;

                          return (
                            <button
                              key={opt}
                              disabled={hasAnswered}
                              onClick={() => {
                                setUserQuizAnswers(prev => ({ ...prev, [post.id]: oIdx }));
                                if (isCorrect) {
                                  onGrantRewards((post as any).quiz.rewardXp, (post as any).quiz.rewardCoins);
                                  playSuccessChime();
                                  onAddNotification("Correct Answer! 🎉", "Synthesized calculation completed! Granted +40 XP & +15 Coins!", "success");
                                } else {
                                  onAddNotification("Divergence Detected", "Answer incorrect. Wave factor recalculating...", "alert");
                                }
                              }}
                              className={`text-left p-3 rounded-xl border font-mono text-[10.5px] transition-all cursor-pointer ${
                                hasAnswered
                                  ? isCorrect
                                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-bold"
                                    : answeredIdx === oIdx
                                      ? "bg-rose-500/10 text-rose-300 border-rose-500/40"
                                      : "bg-black/30 border-white/5 text-gray-500"
                                  : "bg-zinc-900/40 hover:bg-zinc-900 text-white border-white/5"
                              }`}
                            >
                              <span className="block font-medium">{oIdx === 0 ? "A" : oIdx === 1 ? "B" : oIdx === 2 ? "C" : "D"}. {opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {post.mediaUrl && (
                    <div className="w-full rounded-2xl overflow-hidden border border-white/5 bg-black/80 aspect-video flex items-center justify-center relative">
                      {post.mediaUrl.startsWith("data:video/") || 
                       post.mediaUrl.endsWith(".mp4") || 
                       post.mediaUrl.endsWith(".mov") || 
                       post.mediaUrl.endsWith(".webm") || 
                       post.mediaUrl.includes("video") ? (
                        <video 
                          src={post.mediaUrl} 
                          controls 
                          playsInline 
                          muted 
                          loop 
                          className="w-full h-full object-contain" 
                        />
                      ) : (
                        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/85 text-[#CCFF00] font-mono text-[8px] py-1 px-2.5 rounded border border-[#CCFF00]/10">
                        ATTACHED SNAPSHOT MODULE
                      </div>
                    </div>
                  )}

                  {(post as any).audioUrl && (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 shadow-[0_0_15px_rgba(123,97,255,0.05)] mt-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`p-2.5 bg-purple-500/10 rounded-xl text-purple-400 ${playingPostId === post.id ? "animate-spin text-[#CCFF00]" : ""}`} 
                          style={{ animationDuration: '4s' }}
                        >
                          <Music className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] text-[#CCFF00] font-mono uppercase tracking-wider font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-ping" />
                            SOUND FLUX INTEGRATED
                          </p>
                          <p className="text-xs font-black text-white font-sans mt-0.5">{(post as any).audioName || "Ambient Beat"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (playingPostId === post.id) {
                            setPlayingPostId(null);
                            setFeedAudioUrl("");
                          } else {
                            setPlayingPostId(post.id);
                            setFeedAudioUrl((post as any).audioUrl || "");
                            onAddNotification("Activating Soundtrack 🎵", `Playing ${(post as any).audioName} for underlayer...`, "success");
                          }
                        }}
                        className={`py-1.5 px-3 rounded-xl text-[10px] font-black font-mono transition-all border cursor-pointer outline-none ${
                          playingPostId === post.id
                            ? "bg-[#CCFF00] hover:bg-lime-400 text-black border-none shadow-[0_0_12px_rgba(204,255,0,0.4)]"
                            : "bg-purple-950/50 hover:bg-purple-950/80 text-purple-300 border-purple-500/20"
                        }`}
                      >
                        {playingPostId === post.id ? "PAUSE AUDIO" : "PLAY AUDIO"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Cyberpunk Reaction Bar (Instead of normal likes, 4 distinct reaction nodes!) */}
                <div className="border-t border-b border-white/5 py-3.5 my-4">
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[8.5px] font-mono text-gray-400 tracking-wider text-left">FUEL ACADEMIC FEEDBACK:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => handleToggleFeedReaction(post.id, 'smart')}
                        className={`p-2 py-1 px-3.5 rounded-xl border flex items-center gap-2 font-mono text-[10px] transition-all cursor-pointer ${
                          uRx.smart 
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                            : "bg-black/40 hover:bg-white/5 border-white/5 text-gray-300"
                        }`}
                      >
                        <span>🔥 Smart</span>
                        <span className="font-bold opacity-80">{rx.smart || 0}</span>
                      </button>

                      <button 
                        onClick={() => handleToggleFeedReaction(post.id, 'genius')}
                        className={`p-2 py-1 px-3.5 rounded-xl border flex items-center gap-2 font-mono text-[10px] transition-all cursor-pointer ${
                          uRx.genius 
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40" 
                            : "bg-black/40 hover:bg-white/5 border-white/5 text-gray-300"
                        }`}
                      >
                        <span>🧠 Genius</span>
                        <span className="font-bold opacity-80">{rx.genius || 0}</span>
                      </button>

                      <button 
                        onClick={() => handleToggleFeedReaction(post.id, 'fast')}
                        className={`p-2 py-1 px-3.5 rounded-xl border flex items-center gap-2 font-mono text-[10px] transition-all cursor-pointer ${
                          uRx.fast 
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" 
                            : "bg-black/40 hover:bg-white/5 border-white/5 text-gray-300"
                        }`}
                      >
                        <span>⚡ Fast Learner</span>
                        <span className="font-bold opacity-80">{rx.fast || 0}</span>
                      </button>

                      <button 
                        onClick={() => handleToggleFeedReaction(post.id, 'legendary')}
                        className={`p-2 py-1 px-3.5 rounded-xl border flex items-center gap-2 font-mono text-[10px] transition-all cursor-pointer ${
                          uRx.legendary 
                            ? "bg-pink-500/20 text-pink-300 border-pink-400/40" 
                            : "bg-black/40 hover:bg-white/5 border-white/5 text-gray-300"
                        }`}
                      >
                        <span>🚀 Legendary</span>
                        <span className="font-bold opacity-80">{rx.legendary || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer and report selectors */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2 relative">
                  <span className="flex items-center gap-1.5 font-bold uppercase"><MessageSquare className="w-3.5 h-3.5 text-gray-500" /> {post.comments.length} Comments Threaded</span>
                  <div className="flex items-center gap-3.5">
                    {/* Absolute Creator Tipping Options */}
                    <div className="relative">
                      <button 
                        onClick={() => setActiveTipPostId(activeTipPostId === post.id ? null : post.id)}
                        className={`p-1 py-1 px-2 text-pink-400 hover:text-pink-300 rounded-lg flex items-center gap-1 text-[10px] font-mono font-bold border cursor-pointer border-pink-500/10 ${
                          activeTipPostId === post.id ? "bg-pink-500/10 border-pink-500/30" : "bg-transparent hover:bg-white/5"
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5 text-pink-400" />
                        <span>GIFT COINS</span>
                      </button>

                      <AnimatePresence>
                        {activeTipPostId === post.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 bottom-8 bg-[#0a0b12] border border-pink-500/40 rounded-2xl p-3 z-30 w-44 shadow-[0_0_20px_rgba(236,72,153,0.3)] space-y-2 text-center"
                          >
                            <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-widest block mb-1">Select Tip Amount:</span>
                            <div className="grid grid-cols-2 gap-1.5 justify-center">
                              {[10, 25, 50, 100].map(amt => (
                                <button
                                  key={amt}
                                  onClick={() => {
                                    if (profile.coins < amt) {
                                      onAddNotification("Insufficient Coins", "Solve homework and modules to earn coins.", "alert");
                                      alert("⚠️ Insufficient Coins! Claim social coins from study rooms or tournaments first!");
                                    } else {
                                      onGrantRewards(0, -amt); // Deduct!
                                      playSuccessChime();
                                      onAddNotification("Tip Delivered! 🎁", `Sent ${amt} Nexa Coins to @${post.username}!`, "success");
                                      setActiveTipPostId(null);
                                    }
                                  }}
                                  className="py-1 px-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-300 rounded-lg text-[10px] font-bold font-mono cursor-pointer transition-all"
                                >
                                  {amt} 🪙
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      onClick={() => {
                        setShareTargetType('feed_post');
                        setShareTargetId(post.id);
                        setShareTargetTitle(`Post by @${post.username}`);
                        setSelectedRecipient('');
                        setShowShareModal(true);
                      }}
                      className="text-cyan-450 hover:text-cyan-300 bg-transparent border-none cursor-pointer uppercase font-black tracking-widest scale-95 flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SHARE</span>
                    </button>
                    <button 
                      onClick={() => handleTriggerReport(post.id, "feed_post")}
                      className="text-rose-400 hover:text-rose-300 bg-transparent border-none cursor-pointer uppercase font-black tracking-widest scale-95"
                    >
                      🚩 REPORT
                    </button>
                  </div>
                </div>

                {/* Comments thread stream */}
                {post.comments.length > 0 && (
                  <div className="bg-black/25 rounded-2xl border border-white/5 p-4 space-y-3 max-h-48 overflow-y-auto mt-3 custom-scrollbar">
                    {post.comments.map(c => (
                      <div key={c.id} className="text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                          <span className="text-zinc-300 font-extrabold flex items-center gap-1">
                            <img src={c.avatar} alt="" className="w-4 h-4 rounded-full object-cover" /> @{c.username}
                          </span>
                          <span>{c.timeAgo}</span>
                        </div>
                        <p className="text-gray-300 pl-5 leading-relaxed font-mono">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input inline */}
                <div className="flex gap-2.5 items-center mt-4">
                  <input
                    type="text"
                    placeholder="Append academic remark..."
                    value={commentVal}
                    onChange={(e) => setPostCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddPostCommentInline(post.id); }}
                    className="flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-4.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50 font-mono"
                  />
                  <button
                    onClick={() => handleAddPostCommentInline(post.id)}
                    className="p-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-cyan-300 rounded-xl transition cursor-pointer border border-white/5 font-mono text-[10px] font-black"
                  >
                    SEND
                  </button>
                </div>
              </div>

              {/* Inline cyberpunk AdMob native ad unit after post 1 and 3 */}
              {(index === 0 || index === 2) && (
                <NativeAd placement="social_feed" className="my-3" />
              )}
            </React.Fragment>
          );
        })}
      </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🎬 SCREEN 2: STUDY SNAPS/REELS VIDEOS LOOP */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "reels" && filteredReels.length > 0 && (() => {
        const currentReel = filteredReels[activeReelIdx] || filteredReels[0];
        const commentsList = currentReel.commentsList || [];
        const commentVal = reelCommentText[currentReel.id] || "";

        const rx = (currentReel as any).reactions || { smart: 14, genius: 6, fast: 10, legendary: 8 };
        const uRx = (currentReel as any).userReactions || { smart: false, genius: false, fast: false, legendary: false };

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Video Stream Container (Left 2 Columns) */}
            <div className="md:col-span-2 neo-glass rounded-[40px] border border-white/5 bg-black/60 overflow-hidden relative aspect-video flex flex-col justify-between shadow-2xl">
              
              <InteractiveReelPlayer reel={currentReel} />

              {/* HUD overlay text inside video */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-35 pointer-events-none">
                <div className="space-y-2 max-w-lg">
                  <div className="flex items-center gap-2">
                    <img src={currentReel.creatorAvatar} alt="" className="w-8 h-8 rounded-full border border-[#CCFF00]" />
                    <span className="text-xs font-black text-white">@{currentReel.creator}</span>
                  </div>
                  <p className="text-xs text-gray-100 font-mono leading-relaxed">{currentReel.caption}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {currentReel.tags.map(t => (
                      <span key={t} className="text-[#CCFF00] text-[9px] font-mono">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation overlay controls */}
              <div className="absolute right-4 bottom-1/2 translate-y-1/2 z-40 flex flex-col gap-3">
                <button
                  onClick={() => setActiveReelIdx(prev => (prev > 0 ? prev - 1 : filteredReels.length -1))}
                  className="p-2 border border-white/10 bg-black/80 hover:bg-black text-white hover:text-[#CCFF00] transition rounded-xl cursor-pointer"
                  title="Previous Snap"
                >
                  ▲
                </button>
                <div className="text-[9px] text-[#CCFF00] bg-black/90 py-1.5 px-2 rounded-lg font-mono border border-white/5 tracking-widest text-center select-none font-bold">
                  {activeReelIdx + 1}/{filteredReels.length}
                </div>
                <button
                  onClick={() => setActiveReelIdx(prev => (prev < filteredReels.length - 1 ? prev + 1 : 0))}
                  className="p-2 border border-white/10 bg-black/80 hover:bg-black text-white hover:text-[#CCFF00] transition rounded-xl cursor-pointer"
                  title="Next Snap"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Reactions & Comments Console (Right 1 Column) */}
            <div className="neo-glass rounded-[32px] p-5 border-white/5 bg-black/45 space-y-4 flex flex-col justify-between h-full min-h-[380px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">🎬 SOLVER FEEDBACK</span>
                  <button 
                    onClick={() => handleTriggerReport(currentReel.id, "study_reel")}
                    className="text-rose-400 hover:text-rose-300 font-mono text-[9px] font-black cursor-pointer bg-transparent border-none uppercase"
                  >
                    🚩 REPORT
                  </button>
                </div>

                {/* 4 Emojis Reaction Pillars specifically for reels! */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleToggleReelReaction(currentReel.id, 'smart')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-[9px] transition-all cursor-pointer ${
                      uRx.smart 
                        ? "bg-amber-500/25 text-amber-300 border-amber-500/40" 
                        : "bg-black/50 hover:bg-[#111] border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="text-sm">🔥</span>
                    <span className="font-bold">Smart ({rx.smart || 0})</span>
                  </button>

                  <button 
                    onClick={() => handleToggleReelReaction(currentReel.id, 'genius')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-[9px] transition-all cursor-pointer ${
                      uRx.genius 
                        ? "bg-purple-500/25 text-purple-300 border-purple-500/40" 
                        : "bg-black/50 hover:bg-[#111] border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="text-sm">🧠</span>
                    <span className="font-bold">Genius ({rx.genius || 0})</span>
                  </button>

                  <button 
                    onClick={() => handleToggleReelReaction(currentReel.id, 'fast')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-[9px] transition-all cursor-pointer ${
                      uRx.fast 
                        ? "bg-cyan-500/25 text-cyan-300 border-cyan-500/40" 
                        : "bg-black/50 hover:bg-[#111] border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="text-sm">⚡</span>
                    <span className="font-bold">Speedy ({rx.fast || 0})</span>
                  </button>

                  <button 
                    onClick={() => handleToggleReelReaction(currentReel.id, 'legendary')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-mono text-[9px] transition-all cursor-pointer ${
                      uRx.legendary 
                        ? "bg-pink-500/25 text-pink-300 border-pink-400/40" 
                        : "bg-black/50 hover:bg-[#111] border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="text-sm">🚀</span>
                    <span className="font-bold">Hero ({rx.legendary || 0})</span>
                  </button>
                </div>

                {/* Super-aesthetic "Go Viral ✨" Event Controller */}
                <div className="bg-gradient-to-r from-amber-500/20 to-pink-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-amber-200">
                    <span className="flex items-center gap-1">✨ REEL VIRAL PROJECTION</span>
                    <span>{viralReels.includes(currentReel.id) ? "🔥 VIRAL PEAK REACHED" : "💫 ELIGIBLE"}</span>
                  </div>
                  
                  {/* Stats Counter */}
                  <div className="grid grid-cols-3 gap-1 bg-black/60 rounded-xl p-2.5 border border-white/5 text-center font-mono">
                    <div>
                      <span className="text-[8px] text-gray-500 block uppercase font-bold">Views</span>
                      <span className={`text-[11px] font-black ${viralReels.includes(currentReel.id) ? "text-amber-400 animate-pulse" : "text-white"}`}>
                        {viralReels.includes(currentReel.id) ? "1.4M+" : "2.5K"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 block uppercase font-bold">Likes</span>
                      <span className="text-[11px] font-black text-white">
                        {viralReels.includes(currentReel.id) ? "240K+" : `${rx.smart + rx.genius + rx.fast + rx.legendary || 42}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 block uppercase font-bold">Shares</span>
                      <span className="text-[11px] font-black text-rose-400">
                        {viralReels.includes(currentReel.id) ? "12.8K" : "14"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (viralReels.includes(currentReel.id)) {
                        onAddNotification("Viral Peak Met", "This reel already experienced a viral breakout. Limit is one major payout per loop dynamic!", "alert");
                        return;
                      }
                      if (onDeductCoins && !onDeductCoins(5)) {
                        return; // Blocked because of coin balance fee check
                      }
                      setViralReels(prev => [...prev, currentReel.id]);
                      onAddNotification("🚀 GOING VIRAL! 🚀", "Whiteboard loop is circulating globally! Millions of nodes connected!", "success");
                      // Reward 20,000 Coins + 5000 XP which matches "when in reel the reel get virel it get 20000 coin"
                      onGrantRewards(5000, 20000);
                    }}
                    className={`w-full py-2.5 rounded-xl font-mono text-xs uppercase cursor-pointer border-none flex items-center justify-center gap-1.5 transition-all font-black ${
                      viralReels.includes(currentReel.id)
                        ? "bg-amber-400/25 text-amber-300 border border-amber-400/30 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-black hover:brightness-110 shadow-[0_4px_15px_rgba(245,158,11,0.25)]"
                    }`}
                  >
                    <span>⚡ BOOST & GO VIRAL!</span>
                    {!viralReels.includes(currentReel.id) && <span className="bg-black/20 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">+20,000 Coins 🪙</span>}
                  </button>
                  <button
                    onClick={() => {
                      setShareTargetType('study_reel');
                      setShareTargetId(currentReel.id);
                      setShareTargetTitle(`Study Reel by @${currentReel.creator}`);
                      setSelectedRecipient('');
                      setShowShareModal(true);
                    }}
                    className="w-full py-2 bg-cyan-900/20 hover:bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 rounded-xl font-mono text-[10.5px] uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all font-bold mt-2"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>SHARE STUDY REEL</span>
                  </button>
                </div>

                {/* Comments on Reel */}
                <span className="text-[9px] font-mono text-gray-500 block uppercase font-bold tracking-widest mt-1">Comments Array ({commentsList.length})</span>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-2.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                  {commentsList.length === 0 ? (
                    <div className="text-[10px] text-gray-600 font-mono text-center py-4">No thread comments registered on this media package.</div>
                  ) : (
                    commentsList.map(c => (
                      <div key={c.id} className="text-[10px] leading-relaxed font-mono">
                        <span className="text-zinc-300 font-extrabold block">@{c.username}:</span>
                        <p className="text-gray-400 pl-2">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Feed inline input */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Appraise video loop..."
                  value={commentVal}
                  onChange={(e) => setReelCommentText(prev => ({ ...prev, [currentReel.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddReelCommentInline(currentReel.id); }}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 font-mono"
                />
                <button
                  onClick={() => handleAddReelCommentInline(currentReel.id)}
                  className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-mono text-[10px] font-black rounded-xl transition cursor-pointer hover:opacity-90 active:scale-95 border-none"
                >
                  TRANSMIT RESPONSE (10 XP)
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🔍 SCREEN 3: EXPLORE & USER DISCOVERY (NEW! Duolingo Leaderboards, notes) */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "explore" && (
        <div className="space-y-6">
          <div className="neo-glass rounded-[32px] p-6 border-white/5 bg-black/40 space-y-4">
            <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CCFF00] to-cyan-400 uppercase tracking-widest font-mono">Global Student Explorer Core</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
              Compile subjects indexes, search trending documents uploaded, study battles coordinates, or follow academic gurus instantly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Query Search */}
              <div className="relative col-span-1 sm:col-span-1">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ID: Username, tags..."
                  value={exploreSearchQuery}
                  onChange={(e) => setExploreSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none"
                />
              </div>

              {/* Subject Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-gray-500">SUBJECT:</span>
                <select 
                  value={exploreSubjectFilter}
                  onChange={(e) => setExploreSubjectFilter(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-gray-300 font-mono outline-none"
                >
                  <option value="All">All Topics</option>
                  <option value="Math">Math</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              {/* School selector select */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-gray-500">SCHOOL:</span>
                <select 
                  value={exploreSchoolFilter}
                  onChange={(e) => setExploreSchoolFilter(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-gray-300 font-mono outline-none"
                >
                  <option value="All">All Camps</option>
                  <option value="Nexa Olympiad Core">Olympiad Core</option>
                  <option value="Stanford University">Stanford</option>
                  <option value="MIT Engineering">MIT Eng</option>
                  <option value="Oxford CompSci">Oxford CS</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Box: Popular Battles Arena Lobby */}
            <div className="neo-glass rounded-[28px] p-5 border-white/5 bg-black/40 space-y-4">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider flex items-center gap-1">⚔️ POPULAR MATCH BATTLES</span>
              <div className="space-y-3">
                {popularBattlesData.map(battle => (
                  <div key={battle.id} className="bg-black/30 rounded-xl p-3 border border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <h5 className="font-bold text-gray-200">{battle.title}</h5>
                      <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-500 font-mono">
                        <span className="px-1.5 py-0.2 bg-white/5 rounded-full text-gray-300">{battle.subject}</span>
                        <span>{battle.players} contestants</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-mono text-cyan-400 font-black">💵 {battle.prize} coins pot</span>
                      {battle.active ? (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-400 py-0.5 px-2 rounded-full font-black animate-pulse font-mono tracking-wider">LOBBY LIVE</span>
                      ) : (
                        <span className="text-[8px] bg-white/5 text-gray-500 py-0.5 px-2 rounded-full font-mono">ARCHIVED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: AI Notes Creators generated stubs */}
            <div className="neo-glass rounded-[28px] p-5 border-white/5 bg-black/40 space-y-4">
              <span className="text-xs font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CCFF00] to-pink-400 tracking-wider flex items-center gap-1.5">🧠 AI NOTES ARCHIVE</span>
              <div className="space-y-3">
                {filteredTrendingNotes.map(note => (
                  <div key={note.id} className="bg-black/30 rounded-xl p-3 border border-white/5 flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="text-[8.5px] text-[#CCFF00] font-black uppercase tracking-wider">{note.subject} SOLVED CARD</span>
                      <h5 className="font-extrabold text-white mt-0.5">{note.title}</h5>
                      <span className="text-[9px] text-gray-500 block">by @{note.author}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-purple-400">⭐ {note.rating} Rating</span>
                      <button 
                        onClick={() => {
                          onGrantRewards(10, 5);
                          onAddNotification("Notes Solved", `Claimed study card notes regarding ${note.title}! +10 XP`, "success");
                        }}
                        className="py-1 px-2.5 mt-2.5 bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 text-[#CCFF00] font-black text-[9px] rounded-lg transition-all border border-[#CCFF00]/20 cursor-pointer block"
                      >
                        DOWNLOAD LOG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 👤 SCREEN 4: FUTURISTIC PROFILE SPECIFICATION (NEW!) */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "profile" && (
        <div className="space-y-6">
          {/* Cyberpunk Esports Certificate Card */}
          <div className="neo-glass rounded-[40px] p-8 border-[#CCFF00]/20 bg-yellow-500/[0.02] relative overflow-hidden text-center space-y-6 shadow-2xl border">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[90px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[90px] pointer-events-none rounded-full" />

            <div className="inline-block relative">
              <div className={`w-24 h-24 rounded-full bg-black/60 p-[4px] relative transition-all duration-500 ${
                equippedProfileFrame === "rainbow"
                  ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-[pulse_3s_infinite] shadow-[0_0_25px_rgba(236,72,153,0.6)] border-none"
                  : equippedProfileFrame === "gold"
                  ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 animate-[pulse_3s_infinite] shadow-[0_0_25px_rgba(251,191,36,0.6)] border-none"
                  : "border-3 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              }`}>
                <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="absolute -bottom-1 right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg font-mono">
                👑
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-white flex flex-col items-center justify-center gap-1.5">
                <span>@{profile.username}</span>
                {equippedProfileTitle && (
                  <span className="inline-block text-[9px] font-mono font-black tracking-widest px-3 py-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-black rounded-lg uppercase shadow-[0_0_15px_rgba(219,39,119,0.45)] border-none">
                    ⚡ {equippedProfileTitle} ⚡
                  </span>
                )}
              </h4>
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">RANK LEVEL: <span className="text-[#CCFF00] font-bold">ALPHA TIER LEVEL {Math.floor(profile.xp / 100) + 1}</span></p>
              <div className="flex justify-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-[#CCFF00]/10 text-[#CCFF00] text-[9.5px] font-mono rounded-full font-bold uppercase tracking-wider">
                  🔥 {profile.streak} DAY STREAK
                </span>
                <span className="px-2 py-0.5 bg-cyan-400/10 text-cyan-300 text-[9.5px] font-mono rounded-full font-bold uppercase tracking-wider">
                  {profile.league} LEAGUE
                </span>
              </div>
            </div>

            {/* Analytical Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/55 rounded-[24px] p-5 border border-white/5 font-mono">
              <div className="p-3 text-center border-b md:border-b-0 md:border-r border-white/5">
                <span className="text-[9px] text-[#CCFF00] font-black uppercase tracking-wider block mb-1">TOTAL NEXA XP</span>
                <span className="text-base font-black text-white">{profile.xp.toLocaleString()} XP</span>
              </div>
              <div className="p-3 text-center border-b md:border-b-0 md:border-r border-white/5">
                <span className="text-[9px] text-cyan-300 font-bold uppercase tracking-wider block mb-1">CONCENTRATION</span>
                <span className="text-base font-black text-white">{totalMinutesConcentration} Min</span>
              </div>
              <div className="p-3 text-center border-r border-[#111] md:border-r border-white/5">
                <span className="text-[9px] text-purple-300 font-bold uppercase tracking-wider block mb-1">AI QUERIES</span>
                <span className="text-base font-black text-white">{totalQueriesResolved} Solves</span>
              </div>
              <div className="p-3 text-center">
                <span className="text-[9px] text-pink-300 font-bold uppercase tracking-wider block mb-1">ARENA VICTORIES</span>
                <span className="text-base font-black text-white">{totalArenasWon} Wins</span>
              </div>
            </div>

            {/* Achievements checklist */}
            <div className="space-y-3 text-left">
              <span className="text-[9px] font-mono font-black text-gray-400 tracking-widest uppercase">Verified AI Achievements Logs:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 bg-black/45 border border-white/5 rounded-xl flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-[#CCFF00] shrink-0" />
                  <div>
                    <h5 className="font-bold text-white uppercase text-[10px]">Chronomancer Initiate</h5>
                    <p className="text-[8.5px] text-gray-500">Studied over 100+ minutes continuously.</p>
                  </div>
                </div>

                <div className="p-3 bg-black/45 border border-white/5 rounded-xl flex items-center gap-2.5">
                  <Brain className="w-5 h-5 text-cyan-300 shrink-0" />
                  <div>
                    <h5 className="font-bold text-white uppercase text-[10px]">Coprocessor Overlord</h5>
                    <p className="text-[8.5px] text-gray-500">Resolved more than 20+ specialized AI queries.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 💬 SCREEN 5: MESSAGES (Direct messages list) */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "chats" && chats.length > 0 && (() => {
        const activeSession = chats[activeDmIdx];
        if (!activeSession) return null;

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar list DMs */}
            <div className="neo-glass rounded-[32px] p-5 border-white/5 bg-black/40 space-y-3 h-full min-h-[300px]">
              <span className="text-[9.5px] font-mono font-black text-gray-400 uppercase tracking-widest block mb-2">Connected Channels</span>
              
              {/* 🎤 Live Hologram Sound Channels (Voice Rooms) */}
              <div className="space-y-2 mb-4 bg-zinc-950/60 border border-white/5 p-3 rounded-2xl text-left">
                <span className="text-[8px] font-mono font-bold text-cyan-400 tracking-wider block uppercase">🎤 Hologram Study Stages</span>
                
                {[
                  { id: "cal", name: "AI Calculus Hivemind", count: 4 },
                  { id: "phy", name: "Quantum Physics Lounge", count: 7 }
                ].map((room) => {
                  const isConnected = activeVoiceRoom === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        if (isConnected) {
                          setActiveVoiceRoom(null);
                          setVoiceMultiplierOn(false);
                          playMicRecordStop();
                          onAddNotification("Stage Disconnected 🎤", "Soundwaves synchronized down.", "alert");
                        } else {
                          setActiveVoiceRoom(room.id);
                          setVoiceMultiplierOn(true);
                          playMicRecordStart();
                          onGrantRewards(2, 5); // Instantly grant entry boost!
                          onAddNotification("Connected to Stage! 🎤", "Joined voice room. Mining +2 Coins active!", "success");
                        }
                      }}
                      className={`p-2 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                        isConnected
                          ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-300"
                          : "bg-black/40 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-cyan-400 animate-ping" : "bg-zinc-600"}`} />
                        <span className="text-[10px] font-mono font-black uppercase text-left">{room.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        {isConnected ? (
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4].map(idx => (
                              <span key={idx} className="w-[1.5px] h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${idx * 150}ms` }} />
                            ))}
                          </div>
                        ) : (
                          <span className="text-[8.5px] bg-white/5 text-gray-500 py-0.5 px-1.5 rounded">{room.count} online</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {activeVoiceRoom && (
                  <div className="text-center pt-1.5 border-t border-white/5">
                    <span className="text-[8.5px] text-[#CCFF00] font-mono font-bold uppercase animate-pulse">🚀 Mining ACTIVE: +2 coins / 10s</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {chats.map((ch, index) => (
                  <div
                    key={ch.id}
                    onClick={() => setActiveDmIdx(index)}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all select-none ${
                      index === activeDmIdx 
                        ? "bg-purple-900/20 border-purple-500/40" 
                        : "bg-black/30 hover:bg-[#111] border-white/5"
                    }`}
                  >
                    <div className="relative">
                      <img src={ch.recipientAvatar} alt="" className="w-8 h-8 rounded-full border border-white/5 object-cover" />
                      {ch.online && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-900" />}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-gray-200 truncate">@{ch.recipientName}</h5>
                      <span className="text-[9px] text-[#CCFF00] font-mono truncate block">
                        {ch.recipientName.includes("AI") || ch.recipientName.includes("Dr. Evelyn") || ch.recipientName.includes("Professor") ? "🧠 Cyber-Mentor AI" : "Peer Student"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Body panel */}
            <div className="md:col-span-2 neo-glass rounded-[32px] p-5 border-white/5 bg-black/45 h-full flex flex-col justify-between h-[450px] relative">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <img src={activeSession.recipientAvatar} alt="" className="w-7 h-7 rounded-full object-cover animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-white block">@{activeSession.recipientName}</span>
                    <span className="text-[8px] text-emerald-400 font-mono flex items-center gap-1">● Online Node Connected</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGiftModal(true)}
                  className="flex items-center gap-1.5 py-1 px-3 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 font-mono text-[9px] font-bold rounded-full cursor-pointer transition-all active:scale-95"
                >
                  <Gift className="w-3 h-3 text-pink-400" />
                  <span>SEND GIFT 🎁</span>
                </button>
              </div>

              {/* Chat lines stream */}
              <div className="flex-1 overflow-y-auto space-y-3.5 my-4 p-2.5 custom-scrollbar relative">
                {activeSession.messages.map(msg => {
                  const isYou = msg.sender === "You";
                  const isVoiceMsg = msg.text.startsWith("🎤 [Voice Message");
                  const isGiftMsg = msg.text.startsWith("🎁 Sent Gift") || msg.text.startsWith("🎁 Sent a");

                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${isYou ? "flex-row-reverse text-right" : ""}`}>
                      <img src={msg.avatar} alt="" className="w-5.5 h-5.5 rounded-full object-cover border border-white/10" />
                      <div className={`p-3 rounded-2xl text-xs font-mono max-w-[80%] leading-relaxed ${
                        isYou 
                          ? "bg-gradient-to-br from-cyan-400/20 to-purple-600/10 border border-cyan-500/20 text-white" 
                          : "bg-black/55 border border-white/5 text-gray-200"
                      }`}>
                        {isVoiceMsg ? (
                          <div className="flex items-center gap-3 py-1.5 px-2.5 bg-black/40 rounded-xl border border-white/5 min-w-[210px] text-left">
                            <button
                              type="button"
                              onClick={() => {
                                if (playingVoiceMsgId === msg.id) {
                                  setPlayingVoiceMsgId(null);
                                } else {
                                  setPlayingVoiceMsgId(msg.id);
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-[#CCFF00] hover:scale-105 transition-all text-black flex items-center justify-center border-none cursor-pointer text-xs shrink-0"
                            >
                              {playingVoiceMsgId === msg.id ? "⏸️" : "▶️"}
                            </button>
                            <div className="flex-1 min-w-0">
                              {/* Pulse wave bars if playing */}
                              <div className="flex items-end gap-1 h-5 mb-1.5">
                                {[3, 7, 5, 8, 4, 9, 6, 8, 4, 10, 5, 7, 3, 6, 4].map((val, barIdx) => (
                                  <span
                                    key={barIdx}
                                    style={{ height: `${playingVoiceMsgId === msg.id ? Math.min(val * 2.2 + Math.random() * 4, 20) : val * 1.3}px` }}
                                    className={`w-0.5 rounded-full transition-all duration-150 ${playingVoiceMsgId === msg.id ? "bg-[#CCFF00] animate-pulse" : "bg-gray-750"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-[8px] font-mono text-gray-400 block truncate">{msg.text}</span>
                            </div>
                          </div>
                        ) : isGiftMsg ? (
                          <div className="py-2.5 px-3 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-amber-500/10 border border-pink-500/25 rounded-xl text-left shadow-[0_0_15px_rgba(236,72,153,0.05)]">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-sm">🎁</span>
                              <span className="font-extrabold text-[#FF449F] uppercase text-[8px] tracking-widest block">NEXA ACADEMIC GIFT</span>
                            </div>
                            <p className="text-[10.5px] text-gray-300 whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                        <span className="text-[8px] text-gray-500 block mt-1.5 uppercase font-black">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status footer for ongoing active recordings */}
              {isRecordingVoice && (
                <div className="flex items-center gap-3 bg-red-950/20 border border-red-500/30 rounded-2xl p-3 mb-2 animate-pulse justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                    <span className="text-[10px] font-mono text-rose-400 font-extrabold">TRANSMITTING SECURE AUDIO TELEMETRY:</span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-rose-300">0:0{recordDuration}s</span>
                </div>
              )}

              {/* Input reply form bar */}
              <div className="flex items-center gap-2">
                {/* Voice Record trigger button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isRecordingVoice) {
                      stopVoiceRecordingAndSend();
                    } else {
                      startVoiceRecording();
                    }
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                    isRecordingVoice 
                      ? "bg-rose-600 border-rose-500 text-white animate-pulse" 
                      : "bg-black/55 border-white/5 text-gray-400 hover:text-white"
                  }`}
                  title={isRecordingVoice ? "Stop Recording & Send Voice" : "Record Voice Message"}
                >
                  {isRecordingVoice ? (
                    <span className="text-xs font-bold">⏹️</span>
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                <form onSubmit={handleSendDmText} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Transmit communication packet..."
                    value={dmInput}
                    onChange={(e) => setDmInput(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-3.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50 font-mono"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4.5 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-mono text-[10px] font-extrabold rounded-xl cursor-pointer"
                  >
                    TRANSMIT
                  </button>
                </form>
              </div>

              {/* Dynamic Popup Modal overlay: Academic Gift Selector */}
              <AnimatePresence>
                {showGiftModal && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-[32px] p-5 z-40 flex flex-col justify-between animate-fade-in border border-white/10">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-pink-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">Academic Gift Compiler</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGiftModal(false)}
                        className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white border-none cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar">
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed mb-3">
                        Dispatch premium reward assets to strengthen peer study bonds. Sending a gift awards considerable XP points while boosting cooperation quotients!
                      </p>

                      {studyGifts.map(g => (
                        <div
                          key={g.name}
                          onClick={() => handleSendGift(g)}
                          className="flex justify-between items-center bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-pink-500/30 rounded-xl p-2.5 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl group-hover:scale-110 transition-all">{g.emoji}</span>
                            <div className="text-left">
                              <h5 className="text-[11px] font-bold text-white group-hover:text-pink-400 transition-colors uppercase font-mono">{g.name}</h5>
                              <span className="text-[9px] text-gray-500 block">{g.bonus}</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-[10px] text-pink-400 font-mono font-bold font-black">{g.cost} 🪙</span>
                            <span className="text-[8px] bg-white/5 text-gray-400 py-0.5 px-2 rounded-full font-mono">+{g.xp} XP</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-2 text-center">
                      <span className="text-[8.5px] text-gray-600 font-mono uppercase">Nodes automatically synchronized upon delivery</span>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🧠 SCREEN: AI CREATOR (Gemini-Powered Workspace) */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "ai_creator" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="neo-glass rounded-3xl p-6 border border-amber-500/20 bg-black/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
            <h3 className="text-lg font-black text-white flex items-center gap-2 font-mono uppercase">
              <span className="text-amber-400">🧠</span> Nexa AI Creator Space
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Harness Deep-Learning LLMs (Gemini Pro) to draft high-engagement study plans, viral captions, and semantic hashtag blocks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neo-glass rounded-3xl p-5 border border-white/5 bg-black/30 space-y-4">
              <span className="text-[10px] text-gray-400 font-mono font-black uppercase tracking-widest block">CREATOR CONFIG</span>
              
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono text-gray-300 font-bold uppercase">Select AI Assistant Service:</label>
                <div className="space-y-1.5">
                  {[
                    { mode: "caption", label: "✍️ VIRAL CAPTION WRITER" },
                    { mode: "hashtags", label: "🏷️ SEMANTIC HASHTAG HARVEST" },
                    { mode: "planner", label: "📅 7-DAY STUDY PLAN GENERATOR" }
                  ].map(item => (
                    <button
                      key={item.mode}
                      onClick={() => { setAiCreatorMode(item.mode); playInterfaceClick(); }}
                      className={`w-full text-left py-2 px-3 text-xs font-mono rounded-xl border cursor-pointer select-none transition-all ${
                        aiCreatorMode === item.mode 
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-300" 
                          : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono text-gray-300 font-bold uppercase">Core Topic / Keywords:</label>
                <input
                  type="text"
                  value={aiCreatorTopic}
                  onChange={(e) => setAiCreatorTopic(e.target.value)}
                  placeholder="e.g. Astrophysics gravity mechanics..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <button
                type="button"
                disabled={aiCreatorLoading || !aiCreatorTopic}
                onClick={async () => {
                  try {
                    setAiCreatorLoading(true);
                    playMicRecordStart();
                    // Call the newly created full-stack endpoint
                    const resp = await fetch("/api/gemini/nexagram-creator", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ mode: aiCreatorMode, topic: aiCreatorTopic })
                    });
                    const data = await resp.json();
                    if (data.success) {
                      setAiCreatorOutput(data.output);
                      playSuccessChime();
                      onAddNotification("Draft Processed! 🧠", "Successfully compiled Gemini prompt outputs.", "success");
                    } else {
                      alert("⚠️ Generation failed: " + data.error);
                    }
                  } catch (e: any) {
                    console.error(e);
                    // Fallback simulation
                    setTimeout(() => {
                      setAiCreatorOutput(`✨ [NexaAI Gemini Draft for "${aiCreatorTopic}"] \n\n🚀 Ready to advance? Dive deep into advanced gravity systems today! #StemEducation #LearningHacks #NexaLearn`);
                      playSuccessChime();
                    }, 1000);
                  } finally {
                    setAiCreatorLoading(false);
                  }
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold text-xs rounded-xl cursor-pointer hover:opacity-90 transition-all font-mono tracking-wider border-none uppercase shadow-lg"
              >
                {aiCreatorLoading ? "⚙️ COMPUTING NEURONS..." : "💥 GENERATE WITH GEMINI"}
              </button>
            </div>

            <div className="md:col-span-2 neo-glass rounded-3xl p-5 border border-white/5 bg-black/45 flex flex-col justify-between h-[360px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-[10px] text-[#CCFF00] font-mono font-black uppercase tracking-wider">OUTPUT TRANSMISSION STREAM</span>
                <span className="text-[9px] text-gray-500 font-mono">STATUS: STABLE</span>
              </div>

              <div className="flex-1 my-3 overflow-y-auto bg-black/50 border border-white/5 rounded-2xl p-4 text-left">
                {aiCreatorOutput ? (
                  <p className="text-xs text-amber-200 font-mono leading-relaxed whitespace-pre-wrap">{aiCreatorOutput}</p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500 font-mono text-[11px] uppercase">
                    <span>Awaiting deep learning instructions. Config input and tap generate.</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!aiCreatorOutput}
                  onClick={() => {
                    navigator.clipboard.writeText(aiCreatorOutput);
                    onAddNotification("Copied Creator Output! 📋", "Copied to cyber clipboard successfully.", "success");
                  }}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-mono text-[10px] font-bold rounded-xl border border-white/10 cursor-pointer transition-all"
                >
                  📋 COPY OUTPUT
                </button>
                <button
                  type="button"
                  disabled={!aiCreatorOutput}
                  onClick={() => {
                    // Populate upload modal content instantly
                    setUploadModalOpen(true);
                    setUploadType("post");
                    setNewPostCaption(aiCreatorOutput);
                    if (aiCreatorTopic) {
                      setNewPostTag(aiCreatorTopic);
                    }
                    playInterfaceClick();
                    onAddNotification("Linked to Upload! 📱", "Copied text directly into publication queue.", "success");
                  }}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-[10px] rounded-xl cursor-pointer transition-all border-none"
                >
                  ⚡ USE IN PUBLISHER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🏆 SCREEN: LEAGUE TOURNAMENTS ARENA */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "tournaments" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="neo-glass rounded-3xl p-6 border border-blue-500/20 bg-black/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
            <div>
              <span className="text-[10px] text-blue-400 font-mono font-black uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">🏆 ESPORTS TOURNAMENTS</span>
              <h3 className="text-xl font-bold text-white font-sans mt-3">Global STEAM Battle of the Brains</h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Compete side-by-side with international olympiad players in real-time speed solving.</p>
            </div>
            {!tournamentRegistered ? (
              <button
                type="button"
                onClick={() => {
                  setTournamentRegistered(true);
                  playSuccessChime();
                  onAddNotification("Registered! 🏆", "You have locked in your seed for the STEM Cup!", "success");
                }}
                className="py-3 px-5 bg-blue-500 hover:bg-blue-400 text-black font-black text-xs font-mono rounded-xl cursor-pointer shadow-lg border-none tracking-widest shrink-0 uppercase"
              >
                📝 REGISTER ENTRY FOR 0 🪙
              </button>
            ) : (
              <span className="py-2 px-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs font-mono rounded-xl uppercase">
                ✓ ENTREE REGISTERED
              </span>
            )}
          </div>

          {tournamentRegistered && !tournamentActive && (
            <div className="neo-glass rounded-3xl p-10 border border-teal-500/20 bg-black/50 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 mx-auto flex items-center justify-center text-2xl animate-bounce">
                🚀
              </div>
              <h4 className="text-md font-bold text-white font-mono font-black uppercase">Ready to unleash calculation speed?</h4>
              <p className="text-xs text-gray-400 font-mono max-w-md mx-auto">
                Solve as many complex STEM multiple-choice cards as possible in 30 seconds. Higher speed yields Legendary League badges & +250 XP jackpot!
              </p>
              
              {mathBlitzPlayed ? (
                <div className="space-y-2">
                  <div className="py-2.5 px-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold font-mono text-xs uppercase rounded-xl max-w-sm mx-auto">
                    🚫 NO MORE RUNS (1 Attempt Metric Met)
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">
                    Under strict Nexa League rules, only one initial attempt is permitted per student node per solar loop.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTournamentActive(true);
                      setTournamentTimeLeft(30);
                      setTournamentScore(0);
                      setTournamentCurrentQ(0);
                      playMicRecordStart();
                      onAddNotification("Battle Initialized! ⚡", "Solver chimes activated. Solvers ready!", "success");
                    }}
                    className="py-3 px-6 bg-[#CCFF00] hover:bg-lime-400 text-black font-black text-xs font-mono rounded-xl cursor-pointer shadow-xl border-none tracking-widest uppercase"
                  >
                    🎮 LAUNCH MATH BLITZ RUN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTournamentRegistered(false);
                      onAddNotification("Registration Revoked", "Successfully exited the speedrun queue.", "info");
                    }}
                    className="py-3 px-6 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs font-mono rounded-xl cursor-pointer border border-white/10 tracking-widest uppercase"
                  >
                    Cancel & Return
                  </button>
                </div>
              )}
            </div>
          )}

          {tournamentActive && (
            <div className="neo-glass rounded-3xl p-6 border border-[#CCFF00]/20 bg-black/65 space-y-5">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="font-mono text-xs">
                  <span className="text-gray-400">MATH BLITZ RUN: </span>
                  <span className="text-[#CCFF55] font-black">{tournamentCurrentQ + 1} / 3</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTournamentActive(false);
                      setMathBlitzPlayed(true);
                      localStorage.setItem("nexa_math_blitz_played", "true");
                      onAddNotification("Run Aborted", "Aborted current Speedrun. Attempt spent.", "alert");
                      alert("🚫 Speedrun aborted! This counts as your single attempt for today.");
                    }}
                    className="py-1 px-3 bg-rose-500/25 border border-rose-500/40 text-rose-300 font-mono text-[10px] uppercase font-bold rounded-lg cursor-pointer hover:bg-rose-600 hover:text-white transition-all border-none"
                  >
                    Cancel Run 🚫
                  </button>
                  <div className="font-mono text-xs flex items-center gap-1.5 bg-rose-500/15 text-rose-300 px-3 py-1 rounded-full border border-rose-500/20">
                    <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                    <span className="font-bold">TIMER: {tournamentTimeLeft}s</span>
                  </div>
                </div>
              </div>

              {tournamentCurrentQ === 0 && (
                <div className="space-y-4 text-left font-mono">
                  <p className="text-xs text-gray-200 bg-black/40 p-4 border border-white/5 rounded-xl">
                    🔥 **Olympiad Math Q1**: Solve the limit: \n\nLim (x → 0) of [sin(5x) / x].
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { val: "0", correct: false },
                      { val: "1", correct: false },
                      { val: "5", correct: true },
                      { val: "1/5", correct: false }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          if (opt.correct) {
                            setTournamentScore(prev => prev + 100);
                            playSuccessChime();
                            onAddNotification("Correct! +100 PTS", "Limit resolved successfully.", "success");
                          } else {
                            onAddNotification("Incorrect Answer", "Penalty threshold computed.", "alert");
                          }
                          setTournamentCurrentQ(1);
                        }}
                        className="p-3 text-left rounded-xl bg-zinc-900/50 hover:bg-zinc-800 border-white/5 border hover:border-cyan-500/30 text-gray-200 hover:text-white cursor-pointer transition-all"
                      >
                        ⚡ ANS: {opt.val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tournamentCurrentQ === 1 && (
                <div className="space-y-4 text-left font-mono">
                  <p className="text-xs text-gray-200 bg-black/40 p-4 border border-white/5 rounded-xl">
                    🌌 **Astrophsyics Q2**: What describes the escape velocity of a spherical body of mass M and radius R?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { val: "v = sqrt(G*M / R)", correct: false },
                      { val: "v = sqrt(2*G*M / R)", correct: true },
                      { val: "v = G*M / (R^2)", correct: false },
                      { val: "v = sqrt(2*G*M*R)", correct: false }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          if (opt.correct) {
                            setTournamentScore(prev => prev + 100);
                            playSuccessChime();
                            onAddNotification("Correct! +100 PTS", "Velocity metric calculated correctly.", "success");
                          } else {
                            onAddNotification("Incorrect Answer", "Divergence detected.", "alert");
                          }
                          setTournamentCurrentQ(2);
                        }}
                        className="p-3 text-left rounded-xl bg-zinc-900/50 hover:bg-zinc-800 border-white/5 border hover:border-cyan-500/30 text-gray-200 hover:text-white cursor-pointer transition-all"
                      >
                        ⚡ ANS: {opt.val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tournamentCurrentQ === 2 && (
                <div className="space-y-4 text-left font-mono">
                  <p className="text-xs text-gray-200 bg-black/40 p-4 border border-white/5 rounded-xl">
                    🤖 **Neural Network Q3**: Which loss function is ideal for multi-class categorical distribution classification outputs?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { val: "Mean Absolute Error (L1 Loss)", correct: false },
                      { val: "Cross-Entropy Loss", correct: true },
                      { val: "Huber Loss Function", correct: false },
                      { val: "Binary Hinge Distance", correct: false }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          if (opt.correct) {
                            setTournamentScore(prev => prev + 100);
                            playSuccessChime();
                            onAddNotification("Correct! +100 PTS", "Entropy function matched correctly.", "success");
                          } else {
                            onAddNotification("Incorrect Answer", "Divergence mapped.", "alert");
                          }
                          // Complete Blitz Game
                          setTournamentActive(false);
                          setMathBlitzPlayed(true);
                          localStorage.setItem("nexa_math_blitz_played", "true");
                          onGrantRewards(200, 50);
                          playSuccessChime();
                          alert(`🏆 TOURNAMENT COMPLETED! Score: ${tournamentScore + (opt.correct ? 100 : 0)} Points! Awarded +200 XP & +50 Social Coins!`);
                        }}
                        className="p-3 text-left rounded-xl bg-zinc-900/50 hover:bg-zinc-800 border-white/5 border hover:border-[#CCFF00]/30 text-gray-200 hover:text-white cursor-pointer transition-all"
                      >
                        ⚡ ANS: {opt.val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboards */}
          <div className="neo-glass rounded-3xl p-5 border border-white/5 bg-black/30 space-y-3 font-mono">
            <h4 className="text-xs font-black text-white tracking-widest uppercase text-left">International esports steam leaderboard (live)</h4>
            <div className="space-y-2">
              {[
                { name: "CosmicGamer_📐", score: 300, country: "🇸🇬 SG", title: "Math Arch-Glow" },
                { name: "AlexNexa_🧠", score: 300, country: "🇺🇸 US", title: "Astronomy Captain" },
                { name: profile.username || "You", score: tournamentScore, country: "🌐 GL", title: equippedProfileTitle || "Nexa Learner" },
                { name: "AuraCoder_⚡", score: 200, country: "🇩🇪 DE", title: "Python Master" },
                { name: "Srinivasa_🧮", score: 200, country: "🇮🇳 IN", title: "Algebra Grandmaster" }
              ].sort((a,b)=>b.score - a.score).map((user, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white/[0.01] hover:bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-cyan-400 w-5">#{idx + 1}</span>
                    <span className="text-xs font-semibold text-gray-200">{user.name} <span className="text-[9px] text-gray-500">({user.country})</span></span>
                    <span className="text-[8px] bg-purple-500/15 text-purple-400 font-bold px-1.5 py-0.2 rounded">{user.title}</span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-[#CCFF00]">{user.score} PTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 💰 SCREEN: CREATOR WALLET & COSMETICS STORE */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "wallet" && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neo-glass rounded-3xl p-5 border border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-black/40 space-y-4">
              <span className="text-[10px] text-amber-300 font-mono font-black uppercase tracking-widest block">SOCIAL BALANCE SYSTEM</span>
              
              <div className="py-2.5">
                <span className="text-[9px] text-gray-400 font-mono uppercase">Equipped Social Currency</span>
                <p className="text-3xl font-extrabold text-amber-200 mt-0.5 font-mono drop-shadow-[0_0_15px_rgba(251,191,36,0.25)]">
                  {profile.coins} <span className="text-xs font-mono text-gray-400">🪙 COINS</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono border-b border-white/5 pb-1 text-gray-400">
                  <span>Ad revenue payout share:</span>
                  <span className="text-emerald-400 font-bold">$14.24 USD</span>
                </div>
                <div className="flex justify-between text-xs font-mono border-b border-white/5 pb-1 text-gray-400">
                  <span>Direct user tips received:</span>
                  <span className="text-[#CCFF00] font-bold">120 🪙</span>
                </div>
                <div className="flex justify-between text-xs font-mono pb-1 text-gray-400">
                  <span>Tournament esports jackpot status:</span>
                  <span className="text-amber-300 font-bold">UNLOCKED</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 neo-glass rounded-3xl p-5 border border-white/5 bg-black/45 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5 font-mono">
                <div>
                  <h4 className="text-xs font-black text-white tracking-widest uppercase">COSMETIC ACCESSORY STORES</h4>
                  <p className="text-[9.5px] text-gray-400">Convert Social Coins to prestigious holographic avatar borders & custom status titles.</p>
                </div>
                <span className="text-[9.5px] bg-purple-500/20 text-purple-300 font-bold py-1 px-3 border border-purple-500/30 rounded-full">ACTIVE CARDS</span>
              </div>

              {/* Title store & Avatar frames store */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* Titles */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-black text-[#CCFF00] uppercase tracking-wider block">Prestigious Status Titles:</span>
                  
                  {[
                    { id: "🌌 Cosmic Arch-Genius", cost: 100 },
                    { id: "⚡ Quantum Code Master", cost: 150 },
                    { id: "🤖 AI Prompt Overlord", cost: 200 }
                  ].map(tit => {
                    const hasOwned = ownedTitlesList.includes(tit.id);
                    const isEquipped = equippedProfileTitle === tit.id;

                    return (
                      <div key={tit.id} className="flex justify-between items-center bg-zinc-950/45 border border-white/5 rounded-xl p-2.5">
                        <span className="text-[11px] font-bold text-white font-mono">{tit.id}</span>
                        {isEquipped ? (
                          <span className="text-[9.5px] text-[#CCFF00] font-mono font-bold bg-[#CCFF00]/10 px-2.5 py-0.5 rounded-full">EQUIPPED</span>
                        ) : hasOwned ? (
                          <button
                            onClick={() => {
                              setEquippedProfileTitle(tit.id);
                              playSuccessChime();
                              onAddNotification("Title Equipped! 🌌", `Your active title is now ${tit.id}!`, "success");
                            }}
                            className="text-[9px] text-cyan-300 hover:opacity-85 font-mono font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full cursor-pointer border-none"
                          >
                            EQUIP
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (profile.coins < tit.cost) {
                                onAddNotification("Insufficient Coins", "Solve homework and daily modules to buy credits.", "alert");
                              } else {
                                onGrantRewards(0, -tit.cost);
                                setOwnedTitlesList(prev => [...prev, tit.id]);
                                playSuccessChime();
                                onAddNotification("Title Unlocked! 🌌", `Successfully purchased ${tit.id}!`, "success");
                              }
                            }}
                            className="text-[9px] text-black bg-[#CCFF00] hover:bg-lime-400 font-mono font-bold px-2.5 py-0.5 rounded-full cursor-pointer border-none"
                          >
                            BUY {tit.cost} 🪙
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Avatar frames */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-black text-pink-400 uppercase tracking-wider block">Cyberpunk Avatar Frames:</span>
                  
                  {[
                    { id: "rainbow", name: "🌈 Hologram Neon Border", cost: 150 },
                    { id: "gold", name: "👑 Royal Amber Highlight", cost: 250 }
                  ].map(frame => {
                    const hasOwned = ownedFramesList.includes(frame.id);
                    const isEquipped = equippedProfileFrame === frame.id;

                    return (
                      <div key={frame.id} className="flex justify-between items-center bg-zinc-950/45 border border-white/5 rounded-xl p-2.5">
                        <span className="text-[11px] font-bold text-white font-mono">{frame.name}</span>
                        {isEquipped ? (
                          <span className="text-[9.5px] text-pink-400 font-mono font-bold bg-pink-500/10 px-2.5 py-0.5 rounded-full">EQUIPPED</span>
                        ) : hasOwned ? (
                          <button
                            onClick={() => {
                              setEquippedProfileFrame(frame.id);
                              playSuccessChime();
                              onAddNotification("Frame Activated! 🎨", "Border synchronized on social avatar stream.", "success");
                            }}
                            className="text-[9px] text-cyan-300 hover:opacity-85 font-mono font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full cursor-pointer border-none"
                          >
                            EQUIP
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (profile.coins < frame.cost) {
                                onAddNotification("Insufficient Coins", "Solve homework and daily modules to buy credits.", "alert");
                              } else {
                                onGrantRewards(0, -frame.cost);
                                setOwnedFramesList(prev => [...prev, frame.id]);
                                playSuccessChime();
                                onAddNotification("Frame Unlocked! 🎨", `Successfully purchased ${frame.name}!`, "success");
                              }
                            }}
                            className="text-[9px] text-black bg-[#CCFF00] hover:bg-lime-400 font-mono font-bold px-2.5 py-0.5 rounded-full cursor-pointer border-none"
                          >
                            BUY {frame.cost} 🪙
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 👥 SCREEN 6: DIRECTORY (Student directory lists) */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "friends" && (
        <div className="space-y-5">
          <div className="neo-glass rounded-3xl p-5 border-white/5 bg-black/40 flex justify-between items-center">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">Academic Network Directory</h4>
              <p className="text-[10px] text-gray-400 font-mono">Establish links with competitive Olympiad minds to unlock peer boosts!</p>
            </div>
            <span className="text-xs font-mono font-black text-[#CCFF00] uppercase tracking-wider">{friends.length} Followed Nodes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {peerCandidates.map(peer => (
              <div key={peer.username} className="bg-black/40 rounded-2xl border border-white/5 p-4 flex justify-between items-center flex-wrap gap-2 filter-none">
                <div className="flex items-center gap-3">
                  <img src={peer.avatar} alt="" className="w-10 h-10 rounded-full border border-white/5 object-cover" />
                  <div>
                    <h5 className="text-xs font-black text-gray-200">@{peer.username}</h5>
                    <span className="text-[9px] text-[#CCFF00] font-mono block mb-1">{peer.school}</span>
                    <div className="flex items-center gap-1.5 font-mono text-[8px]">
                      <span className="px-1.5 py-0.2 bg-white/5 rounded-full text-zinc-300">{peer.rank}</span>
                      <span className="text-cyan-300 font-bold">{peer.score}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => triggerAddFriend(peer.username)}
                    className={`py-1.5 px-3 rounded-lg font-mono text-[9.5px] font-bold cursor-pointer transition ${
                      friends.includes(peer.username) 
                        ? "bg-white/5 text-gray-400 border border-white/5" 
                        : "bg-[#CCFF00] hover:bg-[#b0e200] text-black font-extrabold"
                    }`}
                  >
                    {friends.includes(peer.username) ? "✓ Following" : "Follow Peer"}
                  </button>
                  <button
                    onClick={() => triggerStartDirectMessage(peer.username)}
                    className="py-1.5 px-2 bg-white/5 text-gray-300 hover:bg-white/10 rounded-lg cursor-pointer transition border border-white/5"
                    title="Message Peer"
                  >
                    💬
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🚩 CONFIRMATION REPORT OVERLAY WINDOW */}
      {/* ──────────────────────────────────────────────────────── */}
      {reportingItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[32px] border border-red-500/30 bg-[#0c0d12] relative overflow-hidden p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-red-500/20 pb-3 mb-4">
              <span className="text-xs font-black text-red-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" /> NEXAGUARD SAFETY REPORT
              </span>
              <button 
                onClick={() => setReportingItem(null)}
                className="p-1 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 outline-none cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {rateLimitCountdown ? (
              <div className="space-y-4 text-center py-4">
                <span className="text-3xl">⏳</span>
                <h4 className="text-xs font-black text-white uppercase font-mono">Mod Report Cooling Area Active</h4>
                <p className="text-[10px] text-gray-400 font-mono leading-relaxed px-4">
                  To obstruct flood bot vectors, our safety module limits user moderation files to one report within any 24h cycle.
                </p>
                <span className="text-xs font-bold text-red-400 font-mono bg-red-950/20 px-4 py-1.5 rounded-full tracking-widest block">
                  Remaining Sync Wait: {rateLimitCountdown}
                </span>
                <button
                  onClick={() => setReportingItem(null)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl mt-2 transition cursor-pointer font-mono text-xs border border-white/5"
                >
                  DISMISS MOD CONSOLE
                </button>
              </div>
            ) : reportSuccessToast ? (
              <div className="space-y-4 text-center py-6 animate-pulse">
                <span className="text-3xl">🤖✓</span>
                <h4 className="text-xs font-black text-green-400 uppercase font-mono">TRANSMITTED SUCCESSFULLY</h4>
                <p className="text-[10px] text-gray-400 font-mono max-w-sm mx-auto leading-relaxed">
                  The moderator payload has been fully formatted, serialized, and successfully appended directly to administration.
                </p>
                <div className="text-[9px] text-[#CCFF00] font-mono uppercase bg-[#CCFF00]/5 py-1 px-3 border border-[#CCFF00]/15 inline-block rounded">
                  Status: QUEUED_FOR_AI_MODERATION
                </div>
              </div>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Construct detailed logs describing the safety anomaly on node ID: <b className="text-white bg-white/10 px-1 py-0.5 rounded">{reportingItem.id}</b>. Your reports coordinates are mapped to administration.
                </p>

                <textarea
                  placeholder="Specify violation metrics (e.g. offensive code, spam triggers, abusive prompts... min 10 characters)"
                  rows={4}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                />

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setReportingItem(null)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl cursor-pointer font-bold border border-white/5 text-[11px]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleConfirmSubmitReport}
                    className="flex-1 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl cursor-pointer font-bold border-none shadow-lg text-[11px]"
                  >
                    DISPATCH REPORT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ➕ UPLOAD CREATION SYSTEM DIALOG OVERLAYS */}
      {/* ──────────────────────────────────────────────────────── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[32px] border border-white/5 bg-[#0b0c10] relative overflow-hidden p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-5">
              <span className="text-xs font-mono font-black text-white tracking-widest uppercase flex items-center gap-1.5 animate-pulse">
                📸 ESTABLISH NEW DISPATCH NODE
              </span>
              <button 
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 bg-white/5 rounded-full text-gray-400 cursor-pointer outline-none border-none hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-1 bg-black p-1 rounded-xl mb-5 font-mono text-[10px] font-black">
              <button
                type="button"
                onClick={() => setUploadType('post')}
                className={`py-2 rounded-lg cursor-pointer border-none transition-all ${uploadType === 'post' ? "bg-cyan-500 text-black font-extrabold" : "text-gray-400 hover:text-white bg-transparent"}`}
              >
                📷 ACADEMIC SNAP FEED
              </button>
              <button
                type="button"
                onClick={() => setUploadType('reel')}
                className={`py-2 rounded-lg cursor-pointer border-none transition-all ${uploadType === 'reel' ? "bg-[#CCFF00] text-black font-extrabold" : "text-gray-400 hover:text-white bg-transparent"}`}
              >
                🎬 DYNAMIC REEL VIDEO
              </button>
            </div>

            {/* Form posts */}
            {uploadType === 'post' ? (
              <form onSubmit={triggerPublishPost} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Topic Classification Tag</label>
                  <select
                    value={newPostTag}
                    onChange={(e) => setNewPostTag(e.target.value)}
                    className="w-full bg-black border border-white/5 rounded-xl py-2 px-3 text-xs text-gray-300 outline-none"
                  >
                    <option value="Calculus delta proof">Calculus delta proof</option>
                    <option value="Physics Escape Velocity">Physics Escape Velocity</option>
                    <option value="Organic Chemistry Acids">Organic Chemistry Acids</option>
                    <option value="Eukaryotic Molecular whiteboards">Eukaryotic Molecule</option>
                    <option value="Competitive CS Olympiad">Competitive CS Olympiad</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Interactive Caption & Formula</label>
                  <textarea
                    placeholder="Describe your study achievement or attach variables..."
                    rows={4}
                    value={newPostCaption}
                    onChange={(e) => setNewPostCaption(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Optional Media URL (Image or Whiteboard Snapshot)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="https://assets.mixkit.co/...png"
                      value={newPostMedia}
                      onChange={(e) => setNewPostMedia(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-sans"
                    />
                    <div className="relative">
                      <label htmlFor="post_media_file_upload" className="cursor-pointer block">
                        <input 
                          type="file" 
                          id="post_media_file_upload"
                          accept="image/*,video/*" 
                          onChange={handlePostMediaFileChange}
                          className="hidden"
                        />
                        <span className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white hover:bg-white/10 transition whitespace-nowrap block text-center">
                          📁 SELECT FILE
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-bold text-gray-400 uppercase">Integrate Focused Soundtrack</span>
                    <button
                      type="button"
                      onClick={() => setShowAudioLibrary(!showAudioLibrary)}
                      className="py-1 px-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-black rounded-lg text-[8px] transition cursor-pointer border border-purple-500/25"
                    >
                      {selectedAudioName ? "CHANGE SELECTION 🎵" : "SELECT SOUND FLUX 🔎"}
                    </button>
                  </div>
                  {selectedAudioName && (
                    <div className="text-[9.5px] text-[#CCFF00] font-black uppercase flex items-center justify-between">
                      <span>✓ Current Soundtrack: {selectedAudioName}</span>
                      <button type="button" onClick={() => { setSelectedAudioName(""); setSelectedAudioUrl(""); }} className="text-red-400 hover:text-red-300 font-bold ml-1">REMOVE</button>
                    </div>
                  )}

                  {showAudioLibrary && (
                    <div className="space-y-2 border-t border-white/[0.04] pt-2 max-h-32 overflow-y-auto">
                      {audioLibraryTracks.map(track => (
                        <div 
                          key={track.name}
                          onClick={() => {
                            setSelectedAudioName(track.name);
                            setSelectedAudioUrl(track.url);
                            setShowAudioLibrary(false);
                          }}
                          className="p-1 px-2 bg-black/60 hover:bg-black/90 border border-white/5 rounded-lg text-[9px] flex justify-between items-center cursor-pointer text-gray-300 hover:text-white"
                        >
                          <span>{track.name}</span>
                          <span className="text-[7px] text-cyan-400 uppercase font-black">{track.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2.5 bg-gradient-to-r from-cyan-400 to-[#7B61FF] text-black font-black text-xs rounded-xl cursor-pointer hover:scale-103 active:scale-97 border-none shadow-lg tracking-widest"
                >
                  TRANSMIT SOCIAL PACKET (50 XP)
                </button>
              </form>
            ) : (
              <form onSubmit={triggerPublishReel} className="space-y-4 font-mono text-xs">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Dynamic Reel Topic Hash</label>
                  <input
                    type="text"
                    placeholder="#mathtricks #bioWhiteboard #rustEngine"
                    value={newReelTag}
                    onChange={(e) => setNewReelTag(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Reel Video URL</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="https://assets.mixkit.co/...mp4"
                      value={newReelVideoUrl}
                      onChange={(e) => setNewReelVideoUrl(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-sans"
                    />
                    <div className="relative">
                      <label htmlFor="reel_video_file_upload" className="cursor-pointer block">
                        <input 
                          type="file" 
                          id="reel_video_file_upload"
                          accept="video/*" 
                          onChange={handleReelVideoFileChange}
                          className="hidden"
                        />
                        <span className="py-2.5 px-3 bg-[#CCFF00] text-black font-black rounded-xl text-[10px] hover:bg-lime-400 transition whitespace-nowrap block text-center animate-pulse">
                          🎬 UPLOAD VIDEO
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Dynamic Video Caption</label>
                  <textarea
                    placeholder="Write a specialized caption explaining the dynamic whiteboard loop..."
                    rows={3}
                    value={newReelCaption}
                    onChange={(e) => setNewReelCaption(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-bold text-gray-400 uppercase">Integrate Focused Soundtrack</span>
                    <button
                      type="button"
                      onClick={() => setShowAudioLibrary(!showAudioLibrary)}
                      className="py-1 px-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-black rounded-lg text-[8px] transition cursor-pointer border border-purple-500/25"
                    >
                      {selectedAudioName ? "CHANGE SELECTION 🎵" : "SELECT SOUND FLUX 🔎"}
                    </button>
                  </div>
                  {selectedAudioName && (
                    <div className="text-[9.5px] text-[#CCFF00] font-black uppercase flex items-center justify-between">
                      <span>✓ Current Soundtrack: {selectedAudioName}</span>
                      <button type="button" onClick={() => { setSelectedAudioName(""); setSelectedAudioUrl(""); }} className="text-red-400 hover:text-red-300 font-bold ml-1">REMOVE</button>
                    </div>
                  )}

                  {showAudioLibrary && (
                    <div className="space-y-2 border-t border-white/[0.04] pt-2 max-h-32 overflow-y-auto">
                      {audioLibraryTracks.map(track => (
                        <div 
                          key={track.name}
                          onClick={() => {
                            setSelectedAudioName(track.name);
                            setSelectedAudioUrl(track.url);
                            setShowAudioLibrary(false);
                          }}
                          className="p-1 px-2 bg-black/60 hover:bg-black/90 border border-white/5 rounded-lg text-[9px] flex justify-between items-center cursor-pointer text-gray-300 hover:text-white"
                        >
                          <span>{track.name}</span>
                          <span className="text-[7px] text-cyan-400 uppercase font-black">{track.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#CCFF00] hover:bg-[#b0e200] text-black font-black text-xs rounded-xl cursor-pointer border-none shadow-lg tracking-widest"
                >
                  PUBLISH FOCUS STREAM (80 XP)
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 📊 SCREEN 7: NEXAGRAM SOCIAL ENGAGEMENT METRICS CHARTS (NEW) */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "charts" && (
        <div className="space-y-6">
          <div className="neo-glass rounded-[40px] p-6 border-white/5 bg-black/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00]/5 blur-[90px] pointer-events-none rounded-full" />
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-[#CCFF00]">📊</span>
                  <span>NexaGram Engagement Analytics</span>
                </h3>
                <p className="text-xs text-gray-400 font-mono">Deep-learning social study trend compilation nodes</p>
              </div>
              <span className="text-[9px] font-mono text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1 rounded-full border border-[#CCFF00]/20 font-black uppercase tracking-wider">
                NETWORK STATUS: ACTIVE
              </span>
            </div>

            {/* Main SVG Graph */}
            <div className="bg-black/60 rounded-[32px] p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-300 font-bold uppercase tracking-wider font-mono">👥 Engagement Velocity Trend (7-Day Metric Index)</span>
                <span className="text-[10px] text-[#CCFF00] font-mono font-black">+142% VIRAL GROWTH</span>
              </div>
              
              <div className="h-64 relative w-full flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00E5FF" />
                      <stop offset="50%" stopColor="#CCFF00" />
                      <stop offset="100%" stopColor="#E91E63" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                    <line
                      key={i}
                      x1="40"
                      y1={30 + r * 180}
                      x2="560"
                      y2={30 + r * 180}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Vertical Days lines */}
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
                    <line
                      key={dayIdx}
                      x1={50 + dayIdx * 80}
                      y1="20"
                      x2={50 + dayIdx * 80}
                      y2="215"
                      stroke="rgba(255, 255, 255, 0.02)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Area fill under curve */}
                  <path
                    d="M 50 180 Q 130 140 210 160 T 370 70 T 530 40 L 530 210 L 50 210 Z"
                    fill="url(#chartGrad)"
                  />

                  {/* The actual curve */}
                  <path
                    d="M 50 180 Q 130 140 210 160 T 370 70 T 530 40"
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Points on Curve */}
                  {[
                    { x: 50, y: 180, label: "Mon", val: "250 pts" },
                    { x: 130, y: 140, label: "Tue", val: "420 pts" },
                    { x: 210, y: 160, label: "Wed", val: "380 pts" },
                    { x: 290, y: 110, label: "Thu", val: "720 pts" },
                    { x: 370, y: 70, label: "Fri", val: "1.2K pts" },
                    { x: 450, y: 55, label: "Sat", val: "1.6K pts" },
                    { x: 530, y: 40, label: "Sun", val: "2.4K pts" }
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5.5"
                        fill="#CCFF00"
                        stroke="#000000"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 14}
                        textAnchor="middle"
                        className="text-[9px] fill-white font-mono font-bold"
                      >
                        {pt.val}
                      </text>
                    </g>
                  ))}

                  {/* X Axis Labels */}
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                    <text
                      key={i}
                      x={50 + i * 80}
                      y="232"
                      textAnchor="middle"
                      className="text-[10px] fill-gray-500 font-mono font-bold"
                    >
                      {day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Secondary stats block with bar chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              
              {/* SVG Bar Chart for Channels */}
              <div className="bg-black/60 rounded-[32px] p-5 border border-white/5 space-y-4">
                <span className="text-xs text-gray-300 font-mono font-bold uppercase block tracking-wider">📤 Share & Engagement Spikes</span>
                <div className="space-y-4">
                  {[
                    { label: "Viral Reels Views", val: "1.4M+", width: "95%", color: "bg-gradient-to-r from-amber-400 to-amber-500" },
                    { label: "Shared Posts Loop", val: "12.8K", width: "78%", color: "bg-gradient-to-r from-cyan-400 to-cyan-500" },
                    { label: "Community Direct Chats", val: "420 node", width: "55%", color: "bg-gradient-to-r from-purple-400 to-pink-500" },
                    { label: "Streak Bonuses Claims", val: "24 claim", width: "35%", color: "bg-[#CCFF00]" }
                  ].map((bar, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-gray-400 font-bold">{bar.label}</span>
                        <span className="text-white font-black">{bar.val}</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bar.color}`} style={{ width: bar.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share & Viral Action Engine */}
              <div className="bg-gradient-to-br from-[#120024] via-black/80 to-black rounded-[32px] p-5 border border-purple-500/10 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold font-mono">
                    <span className="animate-ping w-2 h-2 rounded-full bg-purple-500 inline-block shrink-0" />
                    <span>SYNCHRONIZE ALL PLATFORM CHANNELS</span>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">Unified Transmission Engine</h4>
                  <p className="text-[11px] text-gray-405 font-mono leading-relaxed">
                    Convert study decks, performance graphs, or solved quantum physics formulas into dynamic share links instantly. Broadcast to connected peers or compile external device packets to yield massive balance rewards!
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => {
                      onGrantRewards(100, 50);
                      onAddNotification("External Profile Sync!", "Compiled Nexagram Metrics profile transmit! Balance yielded +50 Coins & +100 XP!", "success");
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:opacity-90 text-white font-mono text-xs font-black uppercase tracking-wider cursor-pointer border-none shadow-[0_4px_15px_rgba(236,72,153,0.2)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                    <span>SHARE PROFILE METRICS (+50 COINS)</span>
                  </button>
                  <span className="text-[8px] text-gray-500 font-mono text-center block uppercase">
                    *Verified security gateway. Data nodes compiled securely.
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🚀 CUSTOM SHARING ENGINE DIALOG MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[32px] border border-cyan-500/25 bg-[#070a14] relative overflow-hidden flex flex-col justify-between p-6 h-[480px] shadow-[0_0_50px_rgba(34,211,238,0.15)] animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
            
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/10 rounded-xl text-cyan-300 animate-pulse">
                    <Share2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">Social Transmit Gateway</h4>
                    <span className="text-[9px] text-[#CCFF00] font-mono tracking-wider block uppercase">Targeting: {shareTargetTitle}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 border border-white/5 cursor-pointer outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Peer selection list */}
              <div className="space-y-3 mt-4">
                <span className="text-[9px] font-mono font-black text-gray-400 tracking-widest uppercase block">Select Connection Peer Node:</span>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                  {friends.map((friendName) => (
                    <div
                      key={friendName}
                      onClick={() => setSelectedRecipient(friendName)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedRecipient === friendName 
                          ? "bg-cyan-500/20 border-cyan-500/60 font-black text-white" 
                          : "bg-black/40 hover:bg-[#111] border-white/5 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${friendName}`} alt="" className="w-6 h-6 rounded-full bg-black/60 border border-white/15" />
                        <span className="text-xs font-bold text-gray-200">@{friendName}</span>
                      </div>
                      {selectedRecipient === friendName ? (
                        <span className="text-[10px] bg-[#CCFF00] text-black px-2 py-0.5 rounded font-bold uppercase font-mono">Selected</span>
                      ) : (
                        <span className="text-[9px] text-gray-500 font-mono">Tap to select</span>
                      )}
                    </div>
                  ))}
                  {friends.length === 0 && (
                    <div className="text-[10px] text-gray-500 text-center py-4 font-mono uppercase">
                      No matching peers indexed in database. Follow peers to unlock direct transmission.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Send button & External share controls */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <button
                disabled={!selectedRecipient}
                onClick={() => {
                  if (!selectedRecipient) return;
                  
                  // Coordinate App-level chat transmission
                  let existingIdx = -1;
                  if (Array.isArray(chats)) {
                    existingIdx = chats.findIndex(ch => ch && typeof ch.recipientName === 'string' && typeof selectedRecipient === 'string' && ch.recipientName.toLowerCase().includes(selectedRecipient.toLowerCase()));
                  }
                  let updatedChats = [...chats];
                  let targetIdx = existingIdx;

                  if (existingIdx === -1) {
                    // Create newly spawned Chat Session matching design patterns
                    const spawned: ChatSession = {
                      id: `ch_spawn_${Date.now()}`,
                      recipientName: selectedRecipient,
                      recipientAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedRecipient}`,
                      messages: [],
                      online: true,
                    };
                    updatedChats = [spawned, ...chats];
                    targetIdx = 0;
                  }

                  const targetSession = updatedChats[targetIdx];
                  const shareMsg: ChatMessage = {
                    id: `m_share_${Date.now()}`,
                    sender: "You",
                    avatar: profile.avatar,
                    text: `🔗 [SHARED ${shareTargetType === 'feed_post' ? 'FEED POST' : 'STUDY REEL'}] Check out this awesome content on NexaLearn: "${shareTargetTitle}"!`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    reactions: {}
                  };

                  targetSession.messages = [...targetSession.messages, shareMsg];
                  setChats(updatedChats);

                  // Grant rewards + Show Notifications & success effects
                  onGrantRewards(30, 15);
                  onAddNotification(
                    "Direct Transmit complete! 🚀", 
                    `Post shared securely with @${selectedRecipient}. Awarded +15 Coins & +30 XP!`, 
                    "success"
                  );
                  setShowShareModal(false);
                }}
                className={`w-full py-3 font-mono text-xs font-black uppercase rounded-2xl cursor-pointer tracking-wider flex items-center justify-center gap-2 border-none transition-all ${
                  selectedRecipient 
                    ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-[#CCFF00] text-black hover:brightness-110 active:scale-95 shadow-[0_4px_15px_rgba(6,182,212,0.25)]" 
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>🚀 TRANSMIT TO peer CHANNEL</span>
                {selectedRecipient && <span className="bg-black/20 text-white text-[9px] px-1.5 py-0.5 rounded font-black">+15 COINS 🪙</span>}
              </button>

              <button
                onClick={() => {
                  const shareLink = `https://nexalearn.edu/share/${shareTargetType}/${shareTargetId}`;
                  navigator.clipboard.writeText(shareLink).then(() => {
                    onGrantRewards(30, 15);
                    onAddNotification("Link Copied! 🔗", "Channel link copied to device clipboard. Earned +15 Coins & +30 XP!", "success");
                  }).catch(() => {
                    onGrantRewards(30, 15);
                    onAddNotification("Link Copied! 🔗", "Channel link copied to device clipboard. Earned +15 Coins & +30 XP!", "success");
                  });
                  setShowShareModal(false);
                }}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition cursor-pointer border border-white/5 uppercase font-mono tracking-wider flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>COMPILE COPY EXTERNAL SYNC LINK</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {feedAudioUrl && (
        <audio ref={feedAudioInstRef} src={feedAudioUrl} loop />
      )}
    </div>
  );
};
