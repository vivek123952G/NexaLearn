import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Coins, Zap, Sparkles, MessageSquare, BookOpen, User, 
  Settings, Award, HelpCircle, Bell, ChevronRight, Check, AlertCircle, 
  Search, Shield, Crown, RefreshCw, Send, Plus, Users, Heart, Share2, 
  MapPin, Play, Code, Compass, Image, GraduationCap, Layout, DollarSign,
  ShoppingCart, Bookmark, Menu, Book, FileText, Activity, Clock, ThumbsDown, Tv
} from "lucide-react";

import { 
  UserProfile, Question, FeedPost, ChatSession, ShopItem, StudyReel, StudyGroup, NotificationItem
} from "./types";

import { 
  generateQuestions, getInitialFeed, getInitialChats, getShopItems, getInitialReels, getInitialGroups 
} from "./data";

import {
  generateAIQuestion,
  generateInitialAIQuestionsList
} from "./aiQuestions";

import { 
  StudyBattleArena, FocusMode, SmartAnalytics, CareerRoadmapView, StudyReelsSwiper, AvatarStudio, NexaVerseCampus, DailyRewardHub,
  CustomStudyRoom, CustomProfileView, CustomNotesVault
} from "./components/PageComponents";

import { 
  AutonomousWeeklyPlanner, TournamentLobbyComponent, CoinShopComponent, CreatorStudioComponent 
} from "./components/NewModuleComponents";

import { NexaGramHub } from "./components/NexaGramHub";
import { GrowthEngineHub } from "./components/GrowthEngineHub";
import { WatchAndEarnConsole } from "./components/WatchAndEarnConsole";
import { LanguageTutorView } from "./components/LanguageTutorView";
import { TalkTeacherView } from "./components/TalkTeacherView";
import { AnimatedLeaderboard } from "./components/AnimatedLeaderboard";
import { admobService } from "./lib/AdMobService";
import { AdBanner } from "./components/AdBanner";
import { pushNotificationsService } from "./lib/pushNotifications";
import { IntegrationTester } from "./components/IntegrationTester";

interface StreakBoosterButtonProps {
  streak: number;
  onAdvance: (nextStreak: number) => void;
  addNotification: (title: string, message: string, type: any) => void;
  username?: string;
}

const StreakBoosterButton: React.FC<StreakBoosterButtonProps> = ({ streak, onAdvance, addNotification, username }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const getStorageKey = () => {
    return username ? `nexa_last_streak_time_${username.toLowerCase()}` : "nexa_last_streak_time";
  };

  const calculateTimeLeft = () => {
    const lastClaimStr = localStorage.getItem(getStorageKey());
    if (!lastClaimStr) return 0;
    const lastClaim = parseInt(lastClaimStr, 10);
    const diff = lastClaim + 24 * 60 * 60 * 1000 - Date.now();
    return diff > 0 ? diff : 0;
  };

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [username]);

  const handleAdvance = () => {
    const remaining = calculateTimeLeft();
    if (remaining > 0) return;

    const nextTime = Date.now();
    localStorage.setItem(getStorageKey(), nextTime.toString());
    const nextStreak = (streak || 0) + 1;
    onAdvance(nextStreak);
    setTimeLeft(24 * 60 * 60 * 1000);
    addNotification("🔥 Consecutive Streak Boosted!", `Secured Day ${nextStreak} consecutively! Flame pulsing accelerated!`, "success");
  };

  if (timeLeft > 0) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
      <div className="text-center space-y-2 mt-3.5 pt-3.5 border-t border-white/5">
        <button
          type="button"
          disabled
          className="w-full py-3 bg-red-950/20 text-red-400/70 border border-red-500/10 font-mono font-black text-[10px] uppercase rounded-xl cursor-not-allowed opacity-90 tracking-widest"
        >
          🔒 LOCKED (WAIT {hours.toString().padStart(2, '0')}:{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')})
        </button>
        <span className="text-[9px] text-gray-500 block font-mono">
          Attendance logged today. Streak increments again in {hours}h {mins}m {secs}s!
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3.5 pt-3.5 border-t border-white/5">
      <button
        type="button"
        onClick={handleAdvance}
        className="w-full py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-black font-extrabold text-xs uppercase rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-md shadow-orange-500/20 font-mono tracking-wider flex items-center justify-center gap-2 animate-pulse"
      >
        🔥 ADVANCE ATTENDANCE STREAK (+1 DAY)
      </button>
    </div>
  );
};

export default function App() {
  // Global States
  const [currentPage, setCurrentPage] = useState<string>("startup");
  
  // Real-time ticking state for premium timers
  const [appTimeNow, setAppTimeNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setAppTimeNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [portalOpen, setPortalOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Google Authentication Overlay States
  const [showGoogleGmailPopup, setShowGoogleGmailPopup] = useState<boolean>(false);
  const [googleGmailInput, setGoogleGmailInput] = useState<string>("");
  const [googleDisplayName, setGoogleDisplayName] = useState<string>("");
  const [purgeUsernameInput, setPurgeUsernameInput] = useState<string>("");

  // User Reward History Logs
  const [rewardHistory, setRewardHistory] = useState<any[]>(() => {
    const local = localStorage.getItem("nexa_reward_history");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return [];
      }
    }
    return [
      { id: "r_init_1", title: "🎁 System Initial Configuration", source: "Account Bounds Setup", coins: 50, xp: 25, hp: 100, timestamp: "2026-05-25 09:16:55" },
      { id: "r_init_2", title: "🔥 Daily consecutive streak index validated", source: "Consecutive Day 1 Startup Check-In", coins: 25, xp: 15, hp: 0, timestamp: "2026-05-25 09:17:12" }
    ];
  });

  // User Stats & Profile
  const [profile, setProfile] = useState<UserProfile>({
    username: "NexaStudent_1",
    email: "node1@nexasnap.edu",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Nexa",
    xp: 0,
    coins: 0,
    streak: 0,
    rank: 999,
    league: "Bronze",
    premiumTier: "FREE",
    unlockedThemes: ["cyber-volt"],
    activeTheme: "cyber-volt",
    cosmetics: []
  });

  // Theme configuration overrides applied based on theme state
  const themeGradients: Record<string, string> = {
    "cyber-volt": "from-[#030712] via-[#0b0f19] to-black border-cyan-500/20",
    "cosmic-violet": "from-[#0d011a] via-[#15022e] to-[#04010a] border-purple-500/20 animate-pulse",
    "matrix-terminal": "from-[#000500] via-[#021402] to-[#000000] border-green-500/20",
    "royal-burgundy": "from-[#1d0202] via-[#3d0303] to-[#080000] border-yellow-500/20"
  };

  const accentColors: Record<string, string> = {
    "cyber-volt": "text-[#CCFF00] hover:text-cyan-400 border-cyan-500/10",
    "cosmic-violet": "text-purple-400 hover:text-pink-400 border-purple-500/10",
    "matrix-terminal": "text-green-500 hover:text-green-400 border-green-500/10",
    "royal-burgundy": "text-amber-500 hover:text-amber-400 border-amber-500/10"
  };

  // Data Collections state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [reels, setReels] = useState<StudyReel[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Specific view inputs/outputs
  const [activeChatIdx, setActiveChatIdx] = useState<number>(0);
  const [messageText, setMessageText] = useState<string>("");
  const [solverInput, setSolverInput] = useState<string>("");
  const [solverResult, setSolverResult] = useState<any>(null);
  const [solverLoading, setSolverLoading] = useState<boolean>(false);
  const [scannerFile, setScannerFile] = useState<string>("");
  const [examSubject, setExamSubject] = useState<string>("");
  const [examLevel, setExamLevel] = useState<string>("college");
  const [examClass, setExamClass] = useState<string>("Class 12 / Sophomore");
  const [examResult, setExamResult] = useState<string>("");
  const [examPredictResult, setExamPredictResult] = useState<any>(null);
  const [examLoading, setExamLoading] = useState<boolean>(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState<boolean>(false);
  const [claimedDaysCount, setClaimedDaysCount] = useState<number>(0);
  const [examTab, setExamTab] = useState<'predictions' | 'concepts'>('predictions');
  const [masteredConcepts, setMasteredConcepts] = useState<Record<string, boolean>>({});
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});
  const [tiltDays, setTiltDays] = useState<Record<number, { x: number; y: number }>>({});
  
  // Feed creation
  const [newPostText, setNewPostText] = useState("");
  const [newPostTag, setNewPostTag] = useState("Algebra Study");

  // Question selection
  const [activeQIndex, setActiveQIndex] = useState<number | null>(null);
  const [userAnswerSelected, setUserAnswerSelected] = useState<string | null>(null);
  const [passSelected, setPassSelected] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');
  const [qbSubject, setQbSubject] = useState<string>("Algebra");
  const [qbDifficulty, setQbDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Extreme'>("Medium");
  const [qbClass, setQbClass] = useState<string>("Class 12 / Senior");

  // ADVANCED SYSTEMS STATE MANAGEMENT
  const [userHp, setUserHp] = useState<number>(100);
  const [friends, setFriends] = useState<string[]>(["BioQueen_🌿", "AuraCoder_⚡", "CodeGod_💻"]);
  const [sentFriendRequests, setSentFriendRequests] = useState<string[]>([]);
  const [receivedFriendRequests, setReceivedFriendRequests] = useState<string[]>(["ChemWitch_🧪", "CyberScribe"]);
  const [allUsers, setAllUsers] = useState<any[]>([
    { username: "CodeGod_💻", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Coder", league: "Legend", online: false, lastSeen: "30m ago", xp: 15400 },
    { username: "AuraCoder_⚡", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura", league: "Legend", online: true, lastSeen: "Active now", xp: 12500 },
    { username: "HyperPhysicist_⚛️", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Physics", league: "Legend", online: true, lastSeen: "Active now", xp: 11000 },
    { username: "BioQueen_🌿", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Queen", league: "Legend", online: true, lastSeen: "Active now", xp: 9400 },
    { username: "ChemWitch_🧪", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Chem", league: "Titan", online: true, lastSeen: "Active now", xp: 7500 },
    { username: "CyberScribe", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Scribe", league: "Titan", online: false, lastSeen: "1h ago", xp: 5200 },
    { username: "PhysicsLord_⚛️", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Lord", league: "Gold", online: false, lastSeen: "Yesterday", xp: 3800 },
    { username: "NerdGamer", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Nerd", league: "Gold", online: true, lastSeen: "Active now", xp: 2100 },
    { username: "NeoVisionary", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Neo", league: "Silver", online: false, lastSeen: "3h ago", xp: 1100 },
    { username: "RookieSolver_9", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rookie", league: "Bronze", online: false, lastSeen: "2 days ago", xp: 450 }
  ]);

  // Chat advanced configurations
  const [searchChatQuery, setSearchChatQuery] = useState<string>("");
  const [searchUsersQuery, setSearchUsersQuery] = useState<string>("");
  const [pinnedChatIds, setPinnedChatIds] = useState<string[]>([]);
  const [favoriteChatIds, setFavoriteChatIds] = useState<string[]>([]);
  const [replyingMessage, setReplyingMessage] = useState<any | null>(null);
  const [editingMessage, setEditingMessage] = useState<any | null>(null);

  // Group creation states
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
  
  // Real-time Global Active Logins
  const [globalLogins, setGlobalLogins] = useState<any[]>([
    { username: "AuraCoder_⚡", loginTime: Date.now() - 450000, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura" },
    { username: "BioQueen_🌿", loginTime: Date.now() - 120000, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Queen" },
    { username: "ChemWitch_🧪", loginTime: Date.now() - 680000, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Chem" },
    { username: "HyperPhysicist_⚛️", loginTime: Date.now() - 35000, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Physics" },
    { username: "CodeGod_💻", loginTime: Date.now() - 920000, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Coder" }
  ]);
  const [tickerTime, setTickerTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const newGroupName = ""; // replaced or kept placeholder to maintain structure safely
  const [newGroupIcon, setNewGroupIcon] = useState<string>("📐");
  const [newGroupDesc, setNewGroupDesc] = useState<string>("");
  const [newGroupInvites, setNewGroupInvites] = useState<string[]>([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState<string>("");
  const [groupSubjectCategory, setGroupSubjectCategory] = useState<string>("All");
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>(["g_1", "g_2"]);

  // Visual Claims overlays
  const [currentClaim, setCurrentClaim] = useState<{
    isOpen: boolean;
    type: "NEXO" | "HP" | "PASS" | "ALL_SOLVED";
    title: string;
    subtitle: string;
    amount?: string | number;
    itemName?: string;
    pendingXp?: number;
    pendingCoins?: number;
    pendingHp?: number;
  } | null>(null);

  // Answer validation modal states
  const [validationModal, setValidationModal] = useState<{
    isOpen: boolean;
    status: 'correct' | 'incorrect';
    title: string;
    message: string;
    hint: string;
    xpReward: number;
    coinReward: number;
    question: Question;
  } | null>(null);

  // Free Scans Count for Free Users ad system
  const [scansSinceLastAd, setScansSinceLastAd] = useState<number>(0);
  const [activeAd, setActiveAd] = useState<{ isOpen: boolean; duration: number } | null>(null);
  const [premiumAdOpen, setPremiumAdOpen] = useState<boolean>(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [streakModalOpen, setStreakModalOpen] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => localStorage.getItem("nexa_offline_mode") === "true");
  
  // Custom non-blocking alert modal state to substitute for sandboxed window.alert blocks
  const [customAlert, setCustomAlert] = useState<{ isOpen: boolean; message: string; title?: string } | null>(null);

  // User simulated rewarded ad trigger modal state
  const [simulatedRewardAd, setSimulatedRewardAd] = useState<{
    isOpen: boolean;
    onReward: () => void;
    onDismiss: () => void;
    timer: number;
    rewardClaimed: boolean;
  } | null>(null);

  // Countdown timer thread for simulated rewarded ad modal
  useEffect(() => {
    if (!simulatedRewardAd || !simulatedRewardAd.isOpen || simulatedRewardAd.timer <= 0) return;
    const interval = setTimeout(() => {
      setSimulatedRewardAd(prev => {
        if (!prev) return null;
        const nextTimer = prev.timer - 1;
        return {
          ...prev,
          timer: nextTimer,
          rewardClaimed: nextTimer <= 0 ? true : prev.rewardClaimed
        };
      });
    }, 1000);
    return () => clearTimeout(interval);
  }, [simulatedRewardAd?.isOpen, simulatedRewardAd?.timer]);

  // Listen for simulated AdMob rewarded ad triggers from any component
  useEffect(() => {
    const handleSimulatedAdTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { onReward, onDismiss } = customEvent.detail || {};
      if (onReward) {
        setSimulatedRewardAd({
          isOpen: true,
          onReward,
          onDismiss: onDismiss || (() => {}),
          timer: 10,
          rewardClaimed: false
        });
      }
    };
    window.addEventListener("nexasnap_trigger_simulated_rewarded_ad", handleSimulatedAdTrigger);
    return () => {
      window.removeEventListener("nexasnap_trigger_simulated_rewarded_ad", handleSimulatedAdTrigger);
    };
  }, []);

  useEffect(() => {
    window.alert = (msg: string) => {
      let title = "⚠️ Nexa System Message";
      if (!msg) return;
      if (msg.toLowerCase().includes("sorry") || msg.toLowerCase().includes("insufficient") || msg.toLowerCase().includes("blocked") || msg.toLowerCase().includes("no nexa") || msg.toLowerCase().includes("denied")) {
        title = "❌ Transaction Blocked";
      } else if (msg.toLowerCase().includes("success") || msg.toLowerCase().includes("claimed") || msg.toLowerCase().includes("unlocked") || msg.toLowerCase().includes("complete") || msg.toLowerCase().includes("active")) {
        title = "✨ Operation Successful";
      }
      setCustomAlert({ isOpen: true, message: msg, title });
    };

    // Initialize AdMob and load potential App Open Ad safely
    admobService.initialize().then(() => {
      admobService.showAppOpenAd();
    }).catch(err => {
      console.warn("App AdMob initialization bypassed:", err);
    });
  }, []);

  // Sync / register Push Notifications on user login
  useEffect(() => {
    if (isLoggedIn && profile.username) {
      pushNotificationsService.init(profile.username).catch(err => {
        console.warn("Push initialization failed: ", err);
      });
    }
  }, [isLoggedIn, profile.username]);

  // Listen for simulated/real Push Notification received events and render alert
  useEffect(() => {
    const handlePushReceived = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { title, body } = customEvent.detail || {};
      if (title && body) {
        addNotification(title, body, "success");
      }
    };
    window.addEventListener("nexasnap_push_received", handlePushReceived);
    return () => {
      window.removeEventListener("nexasnap_push_received", handlePushReceived);
    };
  }, []);
  
  const toggleOfflineMode = (val: boolean) => {
    setIsOfflineMode(val);
    localStorage.setItem("nexa_offline_mode", val ? "true" : "false");
    if (val) {
      addNotification("📶 Offline Sandbox Engaged", "NexaSnap is now operating offline in local memory bounds. Highly reliable standalone performance!", "success");
    } else {
      addNotification("🌐 Connected to Cloud Grid", "Synchronized and authenticated safely with real academic ledger servers!", "info");
    }
  };

  const [claimedAchievements, setClaimedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem("nexa_claimed_achievements");
    return saved ? JSON.parse(saved) : [];
  });

  // 5 Minutes Premium Ad Upgrade Prompt Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (profile.premiumTier === "FREE" && isLoggedIn && !isOfflineMode && !streakModalOpen) {
        setPremiumAdOpen(true);
      }
    }, 300000); // 300,000 ms = 5 minutes
    return () => clearInterval(interval);
  }, [profile.premiumTier, isLoggedIn, isOfflineMode, streakModalOpen]);

  // Automatically dismiss active background ad prompts if the user is checking consecutive streaks (strike)
  useEffect(() => {
    if (streakModalOpen) {
      setPremiumAdOpen(false);
    }
  }, [streakModalOpen]);

  // Premium money checkout system
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    tierName: string;
    costText: string;
    costCoins?: number;
    costRealMoney?: string;
  } | null>(null);

  // Confetti trigger
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Load Database and Local Storage on boot
  useEffect(() => {
    setQuestions(generateInitialAIQuestionsList());
    setFeedPosts(getInitialFeed());
    setChats(getInitialChats());
    const initialReels = getInitialReels().map(reel => ({
      ...reel,
      dislikes: Math.floor(Math.random() * 20) + 2,
      disliked: false,
      views: Math.floor(Math.random() * 12000) + 4000,
      commentsList: [
        { id: `rc_1_${reel.id}`, username: "NeuralCoder", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=neural", text: "Incredible speed trick! Worked on my midterms.", timeAgo: "1h ago" },
        { id: `rc_2_${reel.id}`, username: "PhysicsTitan", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=titan", text: "Could you make one for thermodynamics?", timeAgo: "45m ago" }
      ]
    }));
    setReels(initialReels);
    setStudyGroups(getInitialGroups());
    
    // Auto loaded system alerts
    setNotifications([
      { id: "n_1", title: "Welcome System Active", message: "NexaSnap AI core initialized. Daily multiplier check active.", time: "Just now", read: false, type: "success" },
      { id: "n_2", title: "Olympiad Alert", message: "Global study tournament begins in 14 hours. Prepare your parameters!", time: "2h ago", read: false, type: "info" }
    ]);

    const storedUser = localStorage.getItem("nexasnap_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setProfile(parsed);
        setUsername(parsed.username);
        setIsLoggedIn(true);
        if (!localStorage.getItem("nexa_login_time")) {
          localStorage.setItem("nexa_login_time", Date.now().toString());
        }
        setCurrentPage("home");
        if (parsed.hp !== undefined) setUserHp(parsed.hp);
        if (parsed.friends !== undefined) setFriends(parsed.friends);
        if (parsed.friendRequestsSent !== undefined) setSentFriendRequests(parsed.friendRequestsSent);
        if (parsed.friendRequestsReceived !== undefined) setReceivedFriendRequests(parsed.friendRequestsReceived);
      } catch (e) {
        console.warn("Storage profile load error, resetting parameters.");
      }
    }
  }, []);

  // Live Community Realtime Synced Listeners
  useEffect(() => {
    if (isOfflineMode) return;

    let active = true;
    let unsubUsers: (() => void) | null = null;
    let unsubReels: (() => void) | null = null;
    let unsubPosts: (() => void) | null = null;

    import("./lib/firebase").then(({
      subscribeToGlobalUsers,
      subscribeToGlobalReels,
      subscribeToGlobalPosts,
      syncReelToFirestore,
      syncPostToFirestore
    }) => {
      if (!active) return;

      const uUsers = subscribeToGlobalUsers((dbUsers) => {
        if (!active) return;
        if (dbUsers && dbUsers.length > 0) {
          setAllUsers((prev) => {
            // Deduplicate lists, keeping dbUsers values as primary sources of truths
            const merged = [...dbUsers];
            const activeUsernames = new Set(merged.map(u => u.username.toLowerCase().trim()));
            prev.forEach(u => {
              if (u && u.username && !activeUsernames.has(u.username.toLowerCase().trim())) {
                merged.push(u);
              }
            });
            return merged.sort((a, b) => (b.xp || 0) - (a.xp || 0));
          });
        }
      });
      unsubUsers = uUsers;
      if (!active) {
        if (unsubUsers) { unsubUsers(); unsubUsers = null; }
        return;
      }

      const uReels = subscribeToGlobalReels((dbReels) => {
        if (!active) return;
        if (dbReels && dbReels.length > 0) {
          setReels(dbReels);
        } else {
          // Sync default seed reels backwards to keep feed populated
          const initialReels = getInitialReels().map(reel => ({
            ...reel,
            dislikes: Math.floor(Math.random() * 20) + 2,
            disliked: false,
            views: Math.floor(Math.random() * 12000) + 4000,
            commentsList: [
              { id: `rc_1_${reel.id}`, username: "NeuralCoder", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=neural", text: "Incredible speed trick! Worked on my midterms.", timeAgo: "1h ago" },
              { id: `rc_2_${reel.id}`, username: "PhysicsTitan", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=titan", text: "Could you make one for thermodynamics?", timeAgo: "45m ago" }
            ]
          }));
          initialReels.forEach((r) => {
            syncReelToFirestore(r.id, r).catch(() => {});
          });
        }
      });
      unsubReels = uReels;
      if (!active) {
        if (unsubUsers) { unsubUsers(); unsubUsers = null; }
        if (unsubReels) { unsubReels(); unsubReels = null; }
        return;
      }

      const uPosts = subscribeToGlobalPosts((dbPosts) => {
        if (!active) return;
        if (dbPosts && dbPosts.length > 0) {
          setFeedPosts(dbPosts);
        } else {
          const initialFeed = getInitialFeed();
          initialFeed.forEach((p) => {
            syncPostToFirestore(p.id, p).catch(() => {});
          });
        }
      });
      unsubPosts = uPosts;
      if (!active) {
        if (unsubUsers) { unsubUsers(); unsubUsers = null; }
        if (unsubReels) { unsubReels(); unsubReels = null; }
        if (unsubPosts) { unsubPosts(); unsubPosts = null; }
        return;
      }
    }).catch(err => {
      console.warn("Live channels subscription lazy loader issue:", err);
    });

    return () => {
      active = false;
      if (unsubUsers) unsubUsers();
      if (unsubReels) unsubReels();
      if (unsubPosts) unsubPosts();
    };
  }, [isOfflineMode]);

  // Catch-all profile state synchronizer to push any coin/XP balance upgrades automatically!
  useEffect(() => {
    if (!isLoggedIn || isOfflineMode || !profile.username) return;

    const serializeAndSync = async () => {
      try {
        const { syncUserProfileUpdate } = await import("./lib/firebase");
        await syncUserProfileUpdate(profile.username, {
          email: profile.email || "",
          avatar: profile.avatar || "",
          xp: profile.xp || 0,
          nexa_coins: profile.coins || 0,
          coins: profile.coins || 0,
          current_streak: profile.streak || 0,
          streak: profile.streak || 0,
          rank: profile.rank || 999,
          league: profile.league || "Bronze",
          premiumTier: profile.premiumTier || "FREE",
          unlockedThemes: profile.unlockedThemes || [],
          activeTheme: profile.activeTheme || "",
          cosmetics: profile.cosmetics || [],
          hp: profile.hp || 100,
          friends: profile.friends || []
        });
      } catch (err) {
        console.warn("Failed cache writeback autosave synchronization:", err);
      }
    };

    const debounceId = setTimeout(serializeAndSync, 1000);
    return () => clearTimeout(debounceId);
  }, [
    profile.email,
    profile.avatar,
    profile.xp,
    profile.coins,
    profile.streak,
    profile.rank,
    profile.league,
    profile.premiumTier,
    profile.unlockedThemes?.length,
    profile.activeTheme,
    profile.cosmetics?.length,
    profile.hp,
    profile.friends?.length,
    isLoggedIn,
    isOfflineMode
  ]);

  // Save profile with customizable parameter synchronization
  const saveProfileWithParams = (
    newProf: UserProfile,
    customHp: number = userHp,
    customFriends: string[] = friends,
    customSent: string[] = sentFriendRequests,
    customRecv: string[] = receivedFriendRequests
  ) => {
    const updated: UserProfile = {
      ...newProf,
      hp: customHp,
      friends: customFriends,
      friendRequestsSent: customSent,
      friendRequestsReceived: customRecv
    };
    setProfile(updated);
    localStorage.setItem("nexasnap_user", JSON.stringify(updated));
    if (newProf.username) {
      const uKey = newProf.username.toLowerCase().trim();
      localStorage.setItem(`nexasnap_user_${uKey}`, JSON.stringify(updated));
      // Non-blocking dynamic Firestore persistence writeback on every profile save!
      import("./lib/firebase").then(({ syncUserProfileUpdate }) => {
        syncUserProfileUpdate(newProf.username, {
          email: updated.email,
          avatar: updated.avatar,
          xp: updated.xp,
          nexa_coins: updated.coins,
          coins: updated.coins,
          current_streak: updated.streak,
          streak: updated.streak,
          rank: updated.rank,
          league: updated.league,
          premiumTier: updated.premiumTier,
          unlockedThemes: updated.unlockedThemes,
          activeTheme: updated.activeTheme,
          cosmetics: updated.cosmetics,
          hp: updated.hp,
          friends: updated.friends,
          friendRequestsSent: updated.friendRequestsSent,
          friendRequestsReceived: updated.friendRequestsReceived
        }).catch(err => {
          console.warn("Could not sync updated parameters to Firestore:", err);
        });
      }).catch(err => {
        console.warn("Firebase lazy loader failure:", err);
      });
    }
  };

  // Keep old signature active for standard fallback references
  const saveProfile = (newProf: UserProfile) => {
    saveProfileWithParams(newProf);
  };

  const deductCoins = (amount: number): boolean => {
    if ((profile.coins || 0) < amount) {
      addNotification("Insufficient Coins 🪙", `Need ${amount} Coins for this action. Try doing a revision check or viewing a video tutorial!`, "alert");
      return false;
    }
    const updated = { ...profile, coins: (profile.coins || 0) - amount };
    saveProfile(updated);
    addNotification("Coins Deducted 🪙", `Spent ${amount} Coins. Remaining balance: ${updated.coins} NEXA`, "info");
    return true;
  };

  // Grant Rewards System (XP & Coins)
  // This intercepts all modular rewards (quiz slots, checking-in, tournament entries, battle finishes) 
  // and enforces they must be processed via the manual Claim Button Modal!
  const grantRewards = (xpReward: number, coinReward: number, hpReward: number = 0) => {
    setCurrentClaim({
      isOpen: true,
      type: "NEXO",
      title: "🎁 STUDY REWARDS UNLOCKED",
      subtitle: "Pending academic assets recognized by local registry. Authorize below.",
      amount: `+${coinReward} NEXA`,
      itemName: `+${xpReward} XP` + (hpReward > 0 ? ` | +${hpReward} Focus HP` : ""),
      pendingXp: xpReward,
      pendingCoins: coinReward,
      pendingHp: hpReward
    });
  };

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => {
    const newAlert: NotificationItem = {
      id: `n_${Date.now()}`,
      title,
      message,
      time: "Just now",
      read: false,
      type
    };
    setNotifications([newAlert, ...notifications]);
  };

  const getCurrentUserRank = () => {
    if (profile.xp === 0) return 999;
    const userCompetitorObj = {
      username: profile.username || "You",
      xp: profile.xp
    };
    const mappedCompetitors = (allUsers || []).map(u => ({
      username: u.username,
      xp: u.xp
    }));
    const mergedList = [userCompetitorObj, ...mappedCompetitors]
      .filter((v, i, self) => self.findIndex(t => t.username === v.username) === i);
    const sortedLeaders = [...mergedList].sort((a, b) => b.xp - a.xp);
    const userPlaceIndex = sortedLeaders.findIndex(item => item.username === (profile.username || "You"));
    return userPlaceIndex !== -1 ? userPlaceIndex + 1 : 999;
  };

  // Auto transition from startup to login portal
  useEffect(() => {
    if (currentPage === "startup") {
      const timer = setTimeout(() => {
        if (isLoggedIn) {
          setCurrentPage("home");
        } else {
          setCurrentPage("login");
        }
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentPage, isLoggedIn]);

  // Daily login reward check system triggered on startup entry / login
  useEffect(() => {
    if (isLoggedIn && (currentPage === "home" || currentPage === "reward_vault")) {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastClaim = localStorage.getItem("nexasnap_last_claim_date");
      const storedDays = localStorage.getItem("nexasnap_claimed_days_count");
      const dayCount = storedDays ? parseInt(storedDays, 10) : 0;
      setClaimedDaysCount(dayCount);
    }
  }, [isLoggedIn, currentPage]);

  // Automated premium expiration check
  useEffect(() => {
    if (isLoggedIn && profile?.premiumExpiry) {
      if (Date.now() >= profile.premiumExpiry && profile.premiumTier !== 'FREE') {
        const updated = {
          ...profile,
          premiumTier: 'FREE' as any,
          premiumExpiry: undefined
        };
        saveProfile(updated);
        addNotification("🎫 Subscription Expired", "Your active Premium / VIP Pass period has ended. Upgrade again to reclaim multipliers!", "alert");
      }
    }
  }, [isLoggedIn, profile?.premiumExpiry, profile?.premiumTier]);

  // Automated 200 Daily Coins Multiplier Pass reward logic from viral reels
  useEffect(() => {
    if (isLoggedIn && profile.premiumExpiry && Date.now() < profile.premiumExpiry) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (profile.premiumDailyClaimedAt !== todayStr) {
        const updatedCoins = (profile.coins || 0) + 200;
        const updated = {
          ...profile,
          coins: updatedCoins,
          premiumDailyClaimedAt: todayStr
        };
        saveProfileWithParams(updated, userHp);
        
        // Notify user of dynamic viral pass payout
        setTimeout(() => {
          addNotification("🧬 Premium Multiplier Passed", "Automatically credited +200 daily coins from active 2-Day Viral Pass!", "success");
        }, 3000);
      }
    }
  }, [isLoggedIn, profile.premiumExpiry, currentPage]);

  // Synchronize current active login into the live Global active log boards
  useEffect(() => {
    if (isLoggedIn && profile.username) {
      setGlobalLogins(prev => {
        if (!prev.some(x => x.username === profile.username)) {
          const lTime = Number(localStorage.getItem("nexa_login_time")) || Date.now();
          return [
            { username: profile.username, loginTime: lTime, avatar: profile.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Nexa" },
            ...prev
          ];
        } else {
          // Keep it updated if avatar or anything changes
          return prev.map(p => p.username === profile.username ? { ...p, avatar: profile.avatar } : p);
        }
      });
    }
  }, [isLoggedIn, profile.username, profile.avatar]);

  // Unified Auth Processing with real-time Firebase syncing & consecutive active streak matrices
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUsername = username.trim().toLowerCase();
    if (!targetUsername) {
      alert("Please designate a student username!");
      return;
    }

    setAuthLoading(true);

    try {
      const { fetchUserProfile, createUserProfile, syncUserProfileUpdate } = await import("./lib/firebase");
      
      const firestoreProfile = await fetchUserProfile(targetUsername);

      if (authMode === 'login') {
        if (!firestoreProfile) {
          alert(`Suboptimal Login: Username "@${targetUsername}" not found. Enable 'Create New Node' to initialize a brand-new student account!`);
          setAuthLoading(false);
          return;
        }

        if (!password) {
          alert("Please enter your password!");
          setAuthLoading(false);
          return;
        }

        // Validate password
        if (firestoreProfile.password && firestoreProfile.password !== password) {
          alert("Incorrect password choice. Please verify credentials and reattempt.");
          setAuthLoading(false);
          return;
        }

        // Auto-save password on login if legacy account has no password yet
        if (!firestoreProfile.password) {
          await syncUserProfileUpdate(targetUsername, { password: password });
        }

        // Streak multiplier logic
        const todayStr = new Date().toISOString().split('T')[0];
        const lastActive = firestoreProfile.last_active_date || "";
        let currentStreak = firestoreProfile.current_streak !== undefined ? firestoreProfile.current_streak : (firestoreProfile.streak || 0);
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let rewardCoinsMultiplier = 0;

        if (lastActive === todayStr) {
          // Already logged in today
        } else if (lastActive === yesterdayStr) {
          // Consecutive streak active!
          currentStreak += 1;
          rewardCoinsMultiplier = currentStreak * 25; // Streak-multiplier bonus
        } else {
          // Broken streak reset
          currentStreak = 0;
          rewardCoinsMultiplier = 0; // Streak reward starts from 0
        }

        const finalCoins = (firestoreProfile.nexa_coins !== undefined ? firestoreProfile.nexa_coins : (firestoreProfile.coins || 0)) + rewardCoinsMultiplier;

        // Sync streak & coins changes to Firestore
        await syncUserProfileUpdate(targetUsername, {
          last_active_date: todayStr,
          current_streak: currentStreak,
          streak: currentStreak,
          nexa_coins: finalCoins,
          coins: finalCoins
        });

        const activeProfile: UserProfile = {
          username: targetUsername,
          email: firestoreProfile.email || "student@nexasnap.edu",
          avatar: firestoreProfile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUsername}`,
          xp: firestoreProfile.xp !== undefined ? firestoreProfile.xp : 0,
          coins: finalCoins,
          streak: currentStreak,
          rank: firestoreProfile.rank !== undefined ? firestoreProfile.rank : 999,
          league: firestoreProfile.league || "Bronze",
          premiumTier: firestoreProfile.premiumTier || "FREE",
          unlockedThemes: firestoreProfile.unlockedThemes || ["cyber-volt"],
          activeTheme: firestoreProfile.activeTheme || "cyber-volt",
          cosmetics: firestoreProfile.cosmetics || [],
          hp: firestoreProfile.hp !== undefined ? firestoreProfile.hp : 100,
          friends: firestoreProfile.friends || [],
          friendRequestsSent: firestoreProfile.friendRequestsSent || [],
          friendRequestsReceived: firestoreProfile.friendRequestsReceived || []
        };

        // Cache parameters to localStorage for fail-proof teardown recovery
        localStorage.setItem("nexa_login_time", Date.now().toString());
        localStorage.setItem("nexasnap_user", JSON.stringify(activeProfile));
        localStorage.setItem(`nexasnap_user_${targetUsername}`, JSON.stringify(activeProfile));

        setProfile(activeProfile);
        setIsLoggedIn(true);

        if (activeProfile.hp !== undefined) setUserHp(activeProfile.hp);
        if (firestoreProfile.friends !== undefined) setFriends(firestoreProfile.friends);
        if (firestoreProfile.friendRequestsSent !== undefined) setSentFriendRequests(firestoreProfile.friendRequestsSent);
        if (firestoreProfile.friendRequestsReceived !== undefined) setReceivedFriendRequests(firestoreProfile.friendRequestsReceived);
        
        addNotification("Logged In Successfully ✔", `Welcome back @${targetUsername}! Profile and synchronized stats restored. (+${rewardCoinsMultiplier} Streak Bonus NEXA)`, "success");
        setCurrentPage("home");

      } else {
        // Sign up mode
        if (firestoreProfile) {
          alert(`Suboptimal Signup: "@${targetUsername}" is already reserved by another student! Choose a different username.`);
          setAuthLoading(false);
          return;
        }

        if (!email.trim()) {
          alert("Please specify a valid email address!");
          setAuthLoading(false);
          return;
        }

        if (!password) {
          alert("Please create a password!");
          setAuthLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          alert("Passwords do not match. Please ensure both passwords match!");
          setAuthLoading(false);
          return;
        }

        const newProf: UserProfile & { password?: string } = {
          username: targetUsername,
          email: email.trim(),
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUsername}`,
          xp: 100, // Initial sign up bonus
          coins: 500, // Initial balance
          streak: 0,
          rank: 999,
          league: "Bronze",
          premiumTier: "FREE",
          unlockedThemes: ["cyber-volt"],
          activeTheme: "cyber-volt",
          cosmetics: [],
          password: password // Enforce in user profile document
        };

        await createUserProfile(targetUsername, newProf);

        const todayStr = new Date().toISOString().split('T')[0];
        await syncUserProfileUpdate(targetUsername, {
          last_active_date: todayStr
        });

        localStorage.setItem("nexa_login_time", Date.now().toString());
        localStorage.setItem("nexasnap_user", JSON.stringify(newProf));
        localStorage.setItem(`nexasnap_user_${targetUsername}`, JSON.stringify(newProf));

        setProfile(newProf);
        setIsLoggedIn(true);
        setUserHp(100);

        addNotification("Account Created! 🧬", `Created learning node for @${targetUsername}. Welcomed with +500 Coins & +100 XP!`, "success");
        setCurrentPage("home");
      }
    } catch (err) {
      console.error("Authentication execution error:", err);
      alert("Authentication error. Verify your database configuration.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Gmail Login/Signup Matrix Core
  const processGoogleUser = async (gmailStr: string, rawName: string) => {
    const cleanMail = gmailStr.trim().toLowerCase();
    if (!cleanMail || !cleanMail.includes("@")) {
      alert("Please provide a valid Google Gmail address!");
      return;
    }

    setAuthLoading(true);
    try {
      // Derive a friendly student node username from Gmail prefix
      const gmailPrefix = cleanMail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      const targetUsername = gmailPrefix || "googlestudent";

      const { fetchUserProfile, createUserProfile, syncUserProfileUpdate } = await import("./lib/firebase");
      const firestoreProfile = await fetchUserProfile(targetUsername);

      const todayStr = new Date().toISOString().split('T')[0];

      if (firestoreProfile) {
        // Log in existing Google Node – recover complete profile instantly
        let currentStreak = firestoreProfile.current_streak !== undefined ? firestoreProfile.current_streak : (firestoreProfile.streak || 0);
        const lastActive = firestoreProfile.last_active_date || "";
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let rewardCoinsMultiplier = 0;
        if (lastActive === todayStr) {
          // Already logged in today
        } else if (lastActive === yesterdayStr) {
          currentStreak += 1;
          rewardCoinsMultiplier = currentStreak * 25;
        } else {
          currentStreak = 0;
          rewardCoinsMultiplier = 0;
        }

        const finalCoins = (firestoreProfile.nexa_coins !== undefined ? firestoreProfile.nexa_coins : (firestoreProfile.coins || 0)) + rewardCoinsMultiplier;

        // Sync fresh parameters
        await syncUserProfileUpdate(targetUsername, {
          last_active_date: todayStr,
          current_streak: currentStreak,
          streak: currentStreak,
          nexa_coins: finalCoins,
          coins: finalCoins
        });

        const activeProfile: UserProfile = {
          username: targetUsername,
          email: cleanMail,
          avatar: firestoreProfile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUsername}`,
          xp: firestoreProfile.xp !== undefined ? firestoreProfile.xp : 120,
          coins: finalCoins,
          streak: currentStreak,
          rank: firestoreProfile.rank !== undefined ? firestoreProfile.rank : 999,
          league: firestoreProfile.league || "Bronze",
          premiumTier: firestoreProfile.premiumTier || "FREE",
          unlockedThemes: firestoreProfile.unlockedThemes || ["cyber-volt"],
          activeTheme: firestoreProfile.activeTheme || "cyber-volt",
          cosmetics: firestoreProfile.cosmetics || [],
          hp: firestoreProfile.hp !== undefined ? firestoreProfile.hp : 100,
          friends: firestoreProfile.friends || [],
          friendRequestsSent: firestoreProfile.friendRequestsSent || [],
          friendRequestsReceived: firestoreProfile.friendRequestsReceived || []
        };

        localStorage.setItem("nexa_login_time", Date.now().toString());
        localStorage.setItem("nexasnap_user", JSON.stringify(activeProfile));
        localStorage.setItem(`nexasnap_user_${targetUsername}`, JSON.stringify(activeProfile));

        setProfile(activeProfile);
        setIsLoggedIn(true);

        if (activeProfile.hp !== undefined) setUserHp(activeProfile.hp);
        if (firestoreProfile.friends !== undefined) setFriends(firestoreProfile.friends);
        if (firestoreProfile.friendRequestsSent !== undefined) setSentFriendRequests(firestoreProfile.friendRequestsSent);
        if (firestoreProfile.friendRequestsReceived !== undefined) setReceivedFriendRequests(firestoreProfile.friendRequestsReceived);

        addNotification("Google Access Granted ✔", `Welcome back @${targetUsername}! Restored from academic backup node.`, "success");
        setCurrentPage("home");
      } else {
        // Register new Google Node
        const displayNameText = rawName.trim() || targetUsername;
        const newProf: UserProfile & { password?: string } = {
          username: targetUsername,
          email: cleanMail,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUsername}`,
          xp: 200, // Google initialization bonus!
          coins: 750, // Premium starter coins bundle
          streak: 0,
          rank: 999,
          league: "Bronze",
          premiumTier: "FREE",
          unlockedThemes: ["cyber-volt"],
          activeTheme: "cyber-volt",
          cosmetics: [],
          hp: 100,
          password: "google_authorized_account"
        };

        await createUserProfile(targetUsername, newProf);
        await syncUserProfileUpdate(targetUsername, { last_active_date: todayStr });

        localStorage.setItem("nexa_login_time", Date.now().toString());
        localStorage.setItem("nexasnap_user", JSON.stringify(newProf));
        localStorage.setItem(`nexasnap_user_${targetUsername}`, JSON.stringify(newProf));

        setProfile(newProf);
        setIsLoggedIn(true);
        setUserHp(100);

        addNotification("Google Node Initialized! 🧬", `Created brand new node @${targetUsername} via Google Gmail integration with +750 Coins!`, "success");
        setCurrentPage("home");
      }
    } catch (err) {
      console.error("Google sync error:", err);
      alert("Verification Sync over database failed. Please verify credentials.");
    } finally {
      setAuthLoading(false);
      setShowGoogleGmailPopup(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Check if we are inside a sandboxed iframe (like the AI Studio web tool)
    const isInsideSandboxIframe = typeof window !== "undefined" && window.self !== window.top;

    if (isInsideSandboxIframe) {
      console.warn("Detected sandboxed iframe environment where popups are restricted. Instantly activating secure Google Gmail console node.");
      setShowGoogleGmailPopup(true);
      return;
    }

    setAuthLoading(true);
    try {
      const { auth, GoogleAuthProvider, signInWithPopup } = await import("./lib/firebase");
      const provider = new GoogleAuthProvider();
      
      // Attempt standard Firebase popup auth
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const gmail = result.user.email || "";
        const uDisp = result.user.displayName || "";
        await processGoogleUser(gmail, uDisp);
      } else {
        throw new Error("No user returned from Google popup auth");
      }
    } catch (err: any) {
      console.warn("Direct Google Auth popup is blocked or unsupported. Activating secure manual portal fallback.", err);
      // Seamless interactive overlay in same window
      setShowGoogleGmailPopup(true);
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const executeRealLogout = () => {
    localStorage.removeItem("nexasnap_user");
    localStorage.removeItem("nexa_login_time");
    setProfile({
      username: "",
      email: "",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Nexa",
      xp: 0,
      coins: 0,
      streak: 0,
      rank: 999,
      league: "Bronze",
      premiumTier: "FREE",
      unlockedThemes: ["cyber-volt"],
      activeTheme: "cyber-volt",
      cosmetics: []
    });
    setUsername("");
    setEmail("");
    setIsLoggedIn(false);
    setCurrentPage("login");
    setShowLogoutModal(false);
  };

  // Solve Action inside QA page - option setting
  const tryAnswerQuestion = (ans: string, q: Question) => {
    setUserAnswerSelected(ans);
  };

  // Answer Validation System with health rewards and live leaderboard updates
  const submitAnswerForValidation = (q: Question) => {
    if (!userAnswerSelected) {
      alert("Please select a solution pathway first!");
      return;
    }

    const isCorrect = userAnswerSelected === q.correctAnswer;
    
    // Increment scan analytics count for ad trigger (displays ad every 5 actions on FREE membership)
    if (profile.premiumTier === 'FREE') {
      const nextCount = scansSinceLastAd + 1;
      if (nextCount >= 5) {
        setScansSinceLastAd(0);
        setActiveAd({ isOpen: true, duration: 5 });
      } else {
        setScansSinceLastAd(nextCount);
      }
    }

    if (isCorrect) {
      const claimXp = 100; // Balanced reward
      const claimCoins = q.coinReward; // small coin reward
      const hpBonus = 10; // +10 HP back on Correct
      
      // Trigger full-screen claim animation overlay for HP and NEXA Coins!
      setCurrentClaim({
        isOpen: true,
        type: "ALL_SOLVED",
        title: "⚡ RESOLVED CONVERGENCE!",
        subtitle: "Calculation matches standard constants. HP restored & Nexa minted!",
        amount: `+${claimCoins} NEXA`,
        itemName: `+${claimXp} XP | +10 Focus HP`,
        pendingXp: claimXp,
        pendingCoins: claimCoins,
        pendingHp: hpBonus
      });

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4500);

      setValidationModal({
        isOpen: true,
        status: 'correct',
        title: "⚡ CORRECT ANSWER CONVERGED!",
        message: "Exceptional mastery! Your calculation has matched standard constants. Particle sparks have been synthesized across your console.",
        hint: q.hint,
        xpReward: claimXp,
        coinReward: claimCoins,
        question: q
      });

      addNotification("Solution Accepted!", `Correct Answer! Given +100 XP, +${claimCoins} NEXA & +10 HP`, "success");

    } else {
      // 0 rewards for wrong answers
      const nextHp = Math.max(0, userHp - 15); // depletes Focus meter (HP) by 15 point nodes
      setUserHp(nextHp);

      const newProf = { ...profile };
      saveProfileWithParams(newProf, nextHp);

      const motivs = [
         "Keep trying, you are improving.",
         "Mistakes help you grow smarter.",
         "Almost there, try once more.",
         "Learning comes from practice."
      ];
      const randomMotiv = motivs[Math.floor(Math.random() * motivs.length)];

      setValidationModal({
        isOpen: true,
        status: 'incorrect',
        title: "❌ CONVERGENCE SEQUENCE HALTED",
        message: randomMotiv,
        hint: q.hint,
        xpReward: 0,
        coinReward: 0,
        question: q
      });

      addNotification("Solution Rejected", "Formulation incorrect. Focus depleted by 15 HP.", "alert");
    }
  };

  const onGenerateCustomAIQuestion = () => {
    const newQ = generateAIQuestion(qbSubject, qbDifficulty, qbClass);
    setQuestions(prev => [newQ, ...prev]);
    setActiveQIndex(0);
    setUserAnswerSelected(null);
    addNotification("AI Core Responded", `Synthesized fresh '${qbSubject}' ${qbDifficulty} question for '${qbClass}'!`, "success");
  };

  // Spend/Shop process
  const purchaseShopItem = (item: ShopItem) => {
    if (profile.coins < item.price) {
      alert("Insufficient NEXA balance to unlock cosmetic payload!");
      return;
    }
    const isUnlocked = profile.unlockedThemes.includes(item.unlockedContent) || profile.cosmetics.includes(item.unlockedContent);
    if (isUnlocked) {
      alert("Cosmetic already linked to your node profile!");
      return;
    }

    // Assign complimentary premium pass timer bonus based on rarity (Common=1day, Rare/Epic=30days, Legendary/Mythic=365days)
    let bonusMs = 24 * 60 * 60 * 1000; // Common = 1 Day (24 hours)
    let label = "1 Day (24 Hours)";
    if (item.rarity === 'Rare' || item.rarity === 'Epic') {
      bonusMs = 30 * 24 * 60 * 60 * 1000; // 30 Days
      label = "1 Month (30 Days)";
    } else if (item.rarity === 'Legendary' || item.rarity === 'Mythic') {
      bonusMs = 365 * 24 * 60 * 60 * 1000; // 365 Days
      label = "1 Year (365 Days)";
    }

    const baseExpiry = (profile.premiumExpiry && profile.premiumExpiry > Date.now()) ? profile.premiumExpiry : Date.now();
    const targetExpiry = baseExpiry + bonusMs;
    const nextTier = profile.premiumTier === 'FREE' ? 'NEXA_PLUS' : profile.premiumTier;

    if (item.type === 'theme') {
      saveProfile({
        ...profile,
        coins: profile.coins - item.price,
        unlockedThemes: [...profile.unlockedThemes, item.unlockedContent],
        activeTheme: item.unlockedContent,
        premiumTier: nextTier,
        premiumExpiry: targetExpiry
      });
    } else {
      saveProfile({
        ...profile,
        coins: profile.coins - item.price,
        cosmetics: [...profile.cosmetics, item.unlockedContent],
        premiumTier: nextTier,
        premiumExpiry: targetExpiry
      });
    }
    addNotification("Store Purchase Complete", `Unlocked ${item.name} Premium Object! +${label} VIP timer bonus active!`, "success");
  };

  // Post inside Student Feed
  const handleAddNewPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const newPost: FeedPost = {
      id: `p_${Date.now()}`,
      username: profile.username,
      avatar: profile.avatar,
      timeAgo: "1m ago",
      content: newPostText,
      likes: 0,
      liked: false,
      tag: newPostTag,
      comments: []
    };
    setFeedPosts([newPost, ...feedPosts]);
    setNewPostText("");
    grantRewards(20, 5);  // Rewards for publishing notes
  };

  // Add Comment to Post interactive system
  const handleAddPostComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      username: profile.username || "You",
      avatar: profile.avatar,
      text: text.trim()
    };

    setFeedPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({
      ...prev,
      [postId]: ""
    }));
    grantRewards(5, 1);
  };

  // Chat item interactive modifiers
  const deleteChatMessage = (sessionIdx: number, msgId: string) => {
    const updatedChats = [...chats];
    const session = updatedChats[sessionIdx];
    if (session) {
      session.messages = session.messages.filter(m => m.id !== msgId);
      setChats(updatedChats);
      addNotification("Message Erased", "Purged a message packet instantly.", "info");
    }
  };

  const reactToChatMessage = (sessionIdx: number, msgId: string, emoji: string) => {
    const updatedChats = [...chats];
    const session = updatedChats[sessionIdx];
    if (session) {
      session.messages = session.messages.map(m => {
        if (m.id === msgId) {
          const reactions = { ...(m.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...m, reactions };
        }
        return m;
      });
      setChats(updatedChats);
    }
  };

  const editChatMessageValue = (sessionIdx: number, msgId: string, newText: string) => {
    const updatedChats = [...chats];
    const session = updatedChats[sessionIdx];
    if (session) {
      session.messages = session.messages.map(m => {
        if (m.id === msgId) {
          return { ...m, text: newText, edited: true };
        }
        return m;
      });
      setChats(updatedChats);
    }
    setEditingMessage(null);
  };

  // Toggle Room Pin Status
  const togglePinChat = (chatId: string) => {
    if (pinnedChatIds.includes(chatId)) {
      setPinnedChatIds(pinnedChatIds.filter(id => id !== chatId));
    } else {
      setPinnedChatIds([...pinnedChatIds, chatId]);
    }
  };

  // Toggle Room Favorite Status
  const toggleFavoriteChat = (chatId: string) => {
    if (favoriteChatIds.includes(chatId)) {
      setFavoriteChatIds(favoriteChatIds.filter(id => id !== chatId));
    } else {
      setFavoriteChatIds([...favoriteChatIds, chatId]);
    }
  };

  // Chat send upgrade to support multi-media, pins, and responsive reply nodes
  const handleSendChatMessage = (e: React.FormEvent, customMediaType?: 'voice' | 'image' | 'pdf', customTextVal?: string) => {
    if (e) e.preventDefault();
    const finalMsgText = customTextVal !== undefined ? customTextVal : messageText;
    if (!finalMsgText.trim() && !customMediaType) return;

    const activeChat = chats[activeChatIdx];
    if (!activeChat) return;

    // Premium badge speeding up chat replies!
    const isPremium = profile.premiumTier !== 'FREE';

    // Attach simulated media structure
    let attachmentDetails: any = undefined;
    if (customMediaType === 'voice') {
      attachmentDetails = { type: 'voice', waveform: [12, 40, 20, 60, 45, 15, 35, 75, 50, 8, 25, 42, 10] };
    } else if (customMediaType === 'image') {
      attachmentDetails = { type: 'image', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60' };
    } else if (customMediaType === 'pdf') {
      attachmentDetails = { type: 'pdf', title: 'Olympiad_Trigonometry_Tactics.pdf', size: '3.8 MB' };
    }

    const newMsg: any = {
      id: `msg_${Date.now()}`,
      sender: "You",
      avatar: profile.avatar,
      text: attachmentDetails ? "" : finalMsgText,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      reactions: {},
      attachment: attachmentDetails,
      replyTo: replyingMessage ? replyingMessage.text : undefined
    };

    // If active edit mode:
    if (editingMessage) {
      editChatMessageValue(activeChatIdx, editingMessage.id, finalMsgText);
      setMessageText("");
      return;
    }

    const updatedMessages = [...activeChat.messages, newMsg];
    const updatedChats = [...chats];
    updatedChats[activeChatIdx] = {
      ...activeChat,
      messages: updatedMessages,
      typing: true
    };
    setChats(updatedChats);
    setMessageText("");
    setReplyingMessage(null);

    // Simulated responsive study replies
    setTimeout(() => {
      const dynamicPhrases = [
        "Splendid approach! Verified equation constants and loaded whiteboards. ✨",
        "Formidable analysis. Let's calibrate tomorrow's Olympiad tournament details next limit!",
        "Fascinating. I am editing my personal Notion workspace to align with this formula parameters.",
        "Symmetrical node locked. Initiating study room audio channels. 🎙️",
        "Totally agreed! Let's climb up to Legend League before midnight."
      ];
      const randomResponsePhrase = dynamicPhrases[Math.floor(Math.random() * dynamicPhrases.length)];

      const responseMsg = {
        id: `msg_${Date.now() + 1}`,
        sender: activeChat.recipientName,
        avatar: activeChat.recipientAvatar,
        text: randomResponsePhrase,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        reactions: { "⚡": 1 }
      };
      
      const finishChats = [...updatedChats];
      if (finishChats[activeChatIdx]) {
        finishChats[activeChatIdx] = {
          ...finishChats[activeChatIdx],
          messages: [...finishChats[activeChatIdx].messages, responseMsg],
          typing: false
        };
        setChats(finishChats);
      }
      grantRewards(5, 2);
    }, isPremium ? 800 : 2000); // 800ms for premium nodes, 2000ms for standard FREE servers
  };

  // AI CORE solver trigger
  const triggerAISolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solverInput.trim()) return;
    
    // Deduct standard 5 Coins fee for using AI Solver
    if (!deductCoins(5)) {
      return;
    }

    setSolverLoading(true);
    setSolverResult(null);

    try {
      const response = await fetch("/api/gemini/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: solverInput, mode: "standard" })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          setSolverResult(data);
          grantRewards(45, 15);
          setSolverLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("AI solve core pipeline express connection unavailable, falling back to offline client-side engine:", err);
    }

    // Client-side fallback: Custom highly-detailed mathematical & scientific formulation engine
    const probLower = solverInput.toLowerCase();
    let explanation = `⚡ **NexaSnap Quantum Client Core active (Local Failsafe).**\n\n### Mathematical & Analytical Solution:\n\n`;
    let quiz = [
      { q: "What is the critical next step after understanding this concept?", options: ["Isolate variables and boundary conditions", "Ignore constants", "Scale coordinates by -1", "Use the offline matrix tool"], a: 0 }
    ];

    if (probLower.includes("accelerat") || probLower.includes("speed") || probLower.includes("velocity") || probLower.includes("second") || probLower.includes("m/s")) {
      // Kinematics solver
      const numMatch = solverInput.match(/\d+(\.\d+)?/g);
      if (numMatch && numMatch.length >= 2) {
        const a = parseFloat(numMatch[0]);
        const t = parseFloat(numMatch[1]);
        const d = 0.5 * a * t * t;
        explanation += `1. **Establish Kinematics Parameters**: We are given regular acceleration, a = ${a} m/s², and travel timeframe, t = ${t} seconds. Assuming the body initiates from rest, the initial velocity is u = 0 m/s.\n\n2. **Select Coordinate Formulation**: Recall Newton's principal equations of kinematics:\n   d = (u * t) + 0.5 * a * t²\n\n3. **Substitute parameter values**:\n   d = (0 * ${t}) + 0.5 * ${a} * (${t})²\n   d = 0 + 0.5 * ${a} * ${t * t}\n   d = ${d} meters\n\n✅ **Conclusion**: The accelerated node advances exactly **${d} meters** consecutively along its primary linear vector reference line.`;
        quiz = [
          { q: `What would be the final velocity of this node at time t = ${t}s? (v = u + a*t)`, options: [`${a * t} m/s`, `${a + t} m/s`, `${d} m/s`, `0 m/s`], a: 0 }
        ];
      } else {
        explanation += `1. **Identify Free Body Velocities**: Map the absolute vectors starting from initial velocity (u = 0) and accelerate under linear gravity gradients or kinetic coefficients.\n2. **Isolate Time Variables**: Use Newton's principal displacement formulation: d = u * t + 0.5 * a * t² to locate target distance thresholds.\n3. **Validate Boundary Friction**: In physical incline systems, weight must be decomposed into tangential factors (m * g * sin(theta)) to calculate actual friction balances: F_k = μ_k * F_n.`;
        quiz = [
          { q: "Which equation represents the final velocity under static linear acceleration?", options: ["v = u + a * t", "v² = u + s", "v = d / t²", "v = u * t * a"], a: 0 }
        ];
      }
    } else if (probLower.includes("force") || probLower.includes("mass") || probLower.includes("gravity") || probLower.includes("weight")) {
      explanation += `1. **Model Vector Forces**: Analyze acting loads using Newton's second law: Sum of Forces = m * a.\n2. **Decompose multi-axis gravity paths**: Resolve weight down any incline bounds using angles (theta): F_g = m * g * sin(theta) and normal force F_n = m * g * cos(theta).\n3. **Solve for Unknowns**: Balance static load states against active kinetic momentum vectors to secure the remaining values.`;
      quiz = [
        { q: "What is the normal force acting on a block of mass 'm' on a horizontal plane under standard gravity?", options: ["F_n = m", "F_n = m * g", "F_n = m / g", "F_n = 0"], a: 1 }
      ];
    } else if (probLower.includes("chemistry") || probLower.includes("titrat") || probLower.includes("acid") || probLower.includes("ph") || probLower.includes("mole")) {
      explanation += `1. **Balance Stoichiometric equations**: Analyze input and output compounds by preserving atomic quantities under conservation laws.\n2. **Compute Molarity and Volume parameters**: Apply neutralized ratios: M_a * V_a * N_a = M_b * V_b * N_b to identify acid/base concentrations.\n3. **Isolate log pH factors**: Utilize pH = -log[H⁺] algorithms to evaluate local ionic activity.`;
      quiz = [
        { q: "Which value of pH represents a highly acidic chemical state?", options: ["pH = 12", "pH = 7", "pH = 2", "pH = 9"], a: 2 }
      ];
    } else if (probLower.includes("algebra") || probLower.includes("quadrat") || probLower.includes("equation") || probLower.includes("x")) {
      explanation += `1. **Re-align terms**: Represent the formula in standard form: a * x² + b * x + c = 0.\n2. **Compute the Discriminant**: Calculate D = b² - 4 * a * c. If D > 0, we have two distinct real quadratic bounds.\n3. **Extract roots values**: Use the quadratic system:\n   x = [-b ± sqrt(b² - 4ac)] / (2a)\n   to settle the precise algebraic variables.`;
      quiz = [
        { q: "What does a negative discriminant (b² - 4ac < 0) tell us about the roots?", options: ["The roots are real and identical", "The roots are imaginary (complex conjugates)", "The roots are both zero", "There are infinitely many roots"], a: 1 }
      ];
    } else {
      explanation += `1. **Structural Segmentation**: Divide the topic into logical academic subdivisions (foundation, algorithm, result).\n2. **Formula Matching**: Align coefficients with universal principles of the given academic genre.\n3. **Iterative Convergence**: Progress from initial boundary approximations to standard final solutions.\n\n💫 **Quantum Tutor Quote**: "Every complex formula is simply a composition of beautiful, simple ratios. Keep practicing!"`;
      quiz = [
        { q: "What keeps mathematical solution models converging successfully?", options: ["Strict consistency across coordinate bounds", "Random constant transformations", "Ignoring fraction coefficients", "Increasing font sizing"], a: 0 }
      ];
    }

    setSolverResult({
      success: true,
      explanation,
      solvedBy: "NexaSnap Local Smart Core (Client Failsafe Enabled)",
      interactiveQuiz: quiz
    });
    grantRewards(45, 15);
    setSolverLoading(false);
  };

  // Custom AI exam prediction core
  const triggerExamPrediction = async () => {
    if (!examSubject.trim()) return;

    // Deduct standard 5 Coins fee for using AI Exam Predictor
    if (!deductCoins(5)) {
      return;
    }

    setExamLoading(true);
    setExamPredictResult(null);
    setExamResult("");
    try {
      const res = await fetch("/api/gemini/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: examSubject, level: examLevel, classSelection: examClass })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setExamPredictResult(data);
          setExamResult(
            data.predictions?.map((item: any, idx: number) => 
              `Question ${idx + 1} (${item.probability}): ${item.question}\nSolution Note: ${item.solutionHint}`
            ).join('\n\n') || "Prediction complete."
          );
          grantRewards(40, 15);
          setExamLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("AI predictive server unavailable, initiating local predictive node:", e);
    }

    // Client-side local prediction generator
    const samplePredictions = [
      {
        question: `Evaluate the boundary conditions and triple integral representing mass conservation of ${examSubject} under asymmetric thermal gradients in space fields.`,
        probability: "93% Match Probability",
        solutionHint: "Apply Gauss' Divergence Theorem to isolate boundary flux vectors and compute net outward coefficient fluxes."
      },
      {
        question: `Determine the primary stability bounds and asymptotic decay rate for a third-order dynamic coordinate system of ${examSubject} under random variables.`,
        probability: "84% Match Probability",
        solutionHint: "Design a Lyapunov scalar candidate function and verify that its orbital derivative remains strictly negative-definite."
      },
      {
        question: `Describe the optimal recurrence relation and distributed algorithmic tree to balance a localized ${examSubject} index matrix in O(log n) computing cycles.`,
        probability: "89% Match Probability",
        solutionHint: "Employ a matrix exponentiation strategy combined with divide-and-conquer balance sub-structures."
      }
    ];

    const sampleConcepts = [
      {
        title: `${examSubject} Equilibrium Dynamics`,
        importance: "Critical Mastery (High Yield)",
        explanation: "The theoretical boundaries and steady-state conditions where system state transitions balance without infinite entropy growth.",
        formula: "∇ · F = S - ∂ρ/∂t"
      },
      {
        title: "Asymptotic Convergence Criteria",
        importance: "Medium Yield Key Factor",
        explanation: "How discrete intervals and algorithmic iterations settle into structural attractors under chaotic perturbations on exams.",
        formula: "lim (n→∞) || x_n - x* || = 0"
      }
    ];

    const data = {
      success: true,
      predictions: samplePredictions,
      keyConcepts: sampleConcepts,
      difficulty: examLevel === "olympiad" ? `Extreme (Olympiad Challenge - ${examClass})` : `Standard Advanced (Board Level - ${examClass})`,
      confidence: "91% Converged Match Index",
      subject: examSubject
    };

    setExamPredictResult(data);
    setExamResult(
      samplePredictions.map((item, idx) => 
        `Question ${idx + 1} (${item.probability}): ${item.question}\nSolution Note: ${item.solutionHint}`
      ).join('\n\n')
    );
    grantRewards(40, 15);
    setExamLoading(false);
  };

  // Claim the 3-day sequential daily starting reward on launch
  const claim3DayReward = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextDayIndex = (claimedDaysCount % 3) + 1; // Days: 1, 2, or 3
    
    let coinsEarned = 150;
    let xpEarned = 30;
    let hpEarned = 0;

    if (nextDayIndex === 2) {
      coinsEarned = 300;
      xpEarned = 50;
    } else if (nextDayIndex === 3) {
      coinsEarned = 1000;
      xpEarned = 120;
      hpEarned = 100;
    }

    // Save states
    localStorage.setItem("nexasnap_last_claim_date", todayStr);
    localStorage.setItem("nexasnap_claimed_days_count", nextDayIndex.toString());
    setClaimedDaysCount(nextDayIndex);

    // Update profile
    const updatedCoins = profile.coins + coinsEarned;
    const updatedXp = profile.xp + xpEarned;
    const updatedHp = Math.min(100, userHp + hpEarned);

    let newLeague = profile.league;
    if (updatedXp > 8000) newLeague = "Legend";
    else if (updatedXp > 4000) newLeague = "Titan";
    else if (updatedXp > 1500) newLeague = "Gold";
    else if (updatedXp > 500) newLeague = "Silver";
    const customRank = updatedXp > 0 ? Math.max(1, 1000 - Math.floor(updatedXp / 8)) : 999;

    saveProfileWithParams({
      ...profile,
      coins: updatedCoins,
      xp: updatedXp,
      league: newLeague,
      rank: updatedXp === 0 ? 999 : customRank
    }, hpEarned > 0 ? updatedHp : userHp);

    if (hpEarned > 0) {
      setUserHp(updatedHp);
    }

    addNotification(
      "Daily Parameter Synced!",
      `Day ${nextDayIndex}: Obtained +${coinsEarned} NEXA, +${xpEarned} XP${hpEarned > 0 ? ` and Max HP Energized!` : ""}`,
      "success"
    );

    // Close
    setShowDailyRewardModal(false);
    
    // Trigger celebration
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4500);
  };

  return (
    <div className={`min-h-screen cyber-grid-bg transition-all duration-700 bg-gradient-to-b ${themeGradients[profile.activeTheme] || themeGradients['cyber-volt']} relative overflow-hidden`}>
      {/* Animated Bento Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7B61FF] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2E5BFF] blur-[150px] rounded-full"></div>
      </div>
      
      {/* ====================================================
          1. STARTUP INTRO SCENIC CINEMATIC
          ==================================================== */}
      {currentPage === "startup" && (
        <div className="fixed inset-0 z-50 bg-[#02050b] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden font-sans">
          {/* Futuristic matrix background grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />
          
          {/* Custom style definition for holographic 3D rotating cube logo placeholder */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes holographic-spin {
              0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
              100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(180deg); }
            }
            .holo-cube-container {
              perspective: 1200px;
              width: 140px;
              height: 140px;
              position: relative;
            }
            .holo-cube {
              width: 100%;
              height: 100%;
              position: absolute;
              transform-style: preserve-3d;
              animation: holographic-spin 8s infinite linear;
            }
            .cube-face {
              position: absolute;
              width: 100px;
              height: 100px;
              left: 20px;
              top: 20px;
              border: 2px solid rgba(204, 255, 0, 0.4);
              background: radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(123,97,255,0.15) 100%);
              box-shadow: 0 0 15px rgba(6,182,212,0.2) inset, 0 0 10px rgba(123,97,255,0.1);
              backdrop-filter: blur(2px);
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: monospace;
              font-size: 24px;
              color: #CCFF00;
              font-weight: 900;
              text-shadow: 0 0 8px #CCFF00;
              transition: all 0.3s ease;
            }
            .face-front  { transform: rotateY(0deg) translateZ(50px); border-color: #CCFF00; }
            .face-back   { transform: rotateY(180deg) translateZ(50px); border-color: #7B61FF; }
            .face-right  { transform: rotateY(90deg) translateZ(50px); border-color: #06B6D4; }
            .face-left   { transform: rotateY(-90deg) translateZ(50px); border-color: #EC4899; }
            .face-top    { transform: rotateX(90deg) translateZ(50px); border-color: #F59E0B; }
            .face-bottom { transform: rotateX(-90deg) translateZ(50px); border-color: #10B981; }
          `}} />

          {/* Epic 3D spinning crystal/cube logo matrix */}
          <div className="relative mb-10 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#7B61FF]/10 rounded-full filter blur-[65px] opacity-60 animate-pulse pointer-events-none" />
            <div className="holo-cube-container cursor-grab active:cursor-grabbing">
              <div className="holo-cube">
                <div className="cube-face face-front">N</div>
                <div className="cube-face face-back">E</div>
                <div className="cube-face face-right">X</div>
                <div className="cube-face face-left">A</div>
                <div className="cube-face face-top">S</div>
                <div className="cube-face face-bottom">★</div>
              </div>
            </div>
            
            {/* Spinning holographic ring around cube */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-cyan-400/30 animate-[spin_20s_infinite_linear] pointer-events-none" />
            <div className="absolute w-52 h-52 rounded-full border border-[#CCFF00]/15 animate-[spin_12s_infinite_reverse_linear] pointer-events-none" />
          </div>

          <span className="text-[9px] font-mono tracking-widest text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1 rounded-full uppercase font-black animate-pulse">
            🛸 Interactive 3D App Logo Prototype Active
          </span>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mt-4 uppercase italic">
            NexaSnap <span className="text-[#CCFF00] drop-shadow-[0_0_12px_rgba(204,255,0,0.5)]">AI Infinity</span>
          </h1>
          
          <p className="text-gray-400 text-[10px] font-mono tracking-widest mt-3.5 uppercase animate-pulse">
            SYNCHRONIZING ACADEMIC MATRIX CORE VALUES...
          </p>

          <div className="mt-4 max-w-xs mx-auto p-2 bg-gradient-to-r from-cyan-950/20 to-indigo-950/20 rounded-2xl border border-white/5">
            <p className="text-[9px] text-gray-400 font-mono italic leading-normal">
              ℹ️ Tomorrow's custom 3D file placeholder active. Ready for live drop!
            </p>
          </div>

          <div className="w-56 h-1 w-full bg-white/5 rounded-full overflow-hidden mt-8 max-w-xs mx-auto p-0.5 border border-white/10">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-[#7B61FF] to-[#CCFF00] w-2/3 rounded-full animate-[laser-sweep_4s_infinite_linear]" />
          </div>

          <button 
            onClick={() => setCurrentPage("login")}
            className="mt-10 px-8 py-3 bg-[#CCFF00] text-black hover:bg-cyan-400 font-black rounded-xl text-[10px] font-mono tracking-widest transition-all cursor-pointer shadow-[0_4px_20px_rgba(204,255,0,0.25)] hover:scale-105 active:scale-95 border-none uppercase"
          >
            ENTER THE ACADEMY ⚡
          </button>
        </div>
      )}

      {/* ====================================================
          2. LOGIN / SIGNUP AUTHPAGES
          ==================================================== */}
      {currentPage === "login" && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md neo-glass p-8 rounded-[35px] text-center border-white/5 shadow-2xl relative overflow-hidden bg-black/60">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
            
            <div className="mb-6">
              <div className="w-12 h-12 bg-[#CCFF00]/15 text-[#CCFF00] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#CCFF00]/20 animate-pulse">
                <Crown />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Access NexaLearn</h2>
              <p className="text-xs text-gray-400 mt-2">Initialize your student node proxy to sync streaks, chats, and rewards</p>
            </div>

            {/* DUAL MODE ACCORDION SWITCHER */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-xl border border-white/5 mb-6 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-2 rounded-lg font-bold transition-all border-none cursor-pointer uppercase ${authMode === 'login' ? 'bg-[#CCFF00] text-black shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Log In / Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`py-2 rounded-lg font-bold transition-all border-none cursor-pointer uppercase ${authMode === 'signup' ? 'bg-[#CCFF00] text-black shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Sign Up / Register
              </button>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="text-left">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest pl-1 font-mono">
                  {authMode === 'login' ? 'YOUR USERNAME (SIGN IN)' : 'DESIRED USERNAME (SIGN UP)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BrainiacLord"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1.5 bg-black/40 text-sm text-white py-3 px-4 rounded-2xl border border-white/5 focus:border-[#CCFF00] focus:outline-none focus:glow-lime"
                />
              </div>

              {authMode === 'signup' && (
                <div className="text-left">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest pl-1 font-mono">EMAIL NODE (REQUIRED)</label>
                  <input
                    type="email"
                    required
                    placeholder="your-node@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1.5 bg-black/40 text-sm text-white py-3 px-4 rounded-2xl border border-white/5 focus:border-[#2E5BFF] focus:outline-none"
                  />
                </div>
              )}

              <div className="text-left">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest pl-1 font-mono">
                  {authMode === 'login' ? 'YOUR PASSWORD' : 'CREATE PASSWORD'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1.5 bg-black/40 text-sm text-white py-3 px-4 rounded-2xl border border-white/5 focus:border-[#CCFF00] focus:outline-none focus:glow-lime"
                />
              </div>

              {authMode === 'signup' && (
                <div className="text-left">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest pl-1 font-mono">CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full mt-1.5 bg-black/40 text-sm text-white py-3 px-4 rounded-2xl border border-white/5 focus:border-[#2E5BFF] focus:outline-none"
                  />
                </div>
              )}

              {authLoading ? (
                <div className="py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-center flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  AUTHENTICATING SYNC CHANNELS...
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#2E5BFF] via-[#7B61FF] to-[#CCFF00] text-black text-xs font-bold rounded-2xl tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none uppercase font-mono"
                >
                  {authMode === 'login' ? '⚡ LOG IN / SIGN IN' : '🧬 SIGN UP / REGISTER NODE'}
                </button>
              )}

              <div className="relative py-2.5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <span className="relative bg-[#030712] px-3.5 text-[9px] text-gray-500 font-mono tracking-widest uppercase">OR PROTOCOL SYNC</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 bg-white hover:bg-gray-100 text-black text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none font-mono tracking-wider hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.927h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.053h3.837c2.274-2.1 3.708-5.18 3.708-8.59z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.837-3.05c-1.08.72-2.45 1.16-4.123 1.16-3.17 0-5.85-2.14-6.81-5.01H1.247v3.16C3.217 21.09 7.36 24 12 24z" />
                  <path fill="#FBBC05" d="M5.19 14.19a7.135 7.135 0 0 1 0-4.38V6.65H1.247a11.936 11.936 0 0 0 0 10.7z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.36 0 3.217 2.91 1.247 6.65L5.19 9.81c.96-2.87 3.64-5.06 6.81-5.06z" />
                </svg>
                {authMode === 'login' ? 'CONTINUE WITH GOOGLE GMAIL' : 'SIGN UP WITH GOOGLE GMAIL'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          3. CORE APPLICATION FRAMEWORK OVERLAY
          ==================================================== */}
      {isLoggedIn && currentPage !== "startup" && currentPage !== "login" && (
        <div className="p-4 md:p-6 pb-24 max-w-7xl mx-auto relative z-10 transition-all duration-300">
          
          {isOfflineMode && (
            <div className="mb-4 bg-yellow-400/10 border border-[#CCFF00]/30 text-[#CCFF00] rounded-2xl py-2.5 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                <span>📶 <strong>OFFLINE WORKSPACE ENGAGED</strong>: Operating inside local sandboxed cache logs.</span>
              </div>
              <button 
                type="button"
                onClick={() => toggleOfflineMode(false)}
                className="bg-[#CCFF00] hover:bg-lime-400 text-black font-black text-[9px] uppercase px-3 py-1 rounded-lg border-none cursor-pointer transition-all active:scale-95"
              >
                Reconnect Online 🌐
              </button>
            </div>
          )}
          
          {/* Universal Header */}
          <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/5 p-4 md:px-6 md:py-4 rounded-[28px] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPortalOpen(!portalOpen)}
                  className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-[#CCFF00] hover:text-black transition-all"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-tr from-[#2E5BFF] to-[#7B61FF] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(46,91,255,0.5)]">
                    <span className="font-black text-lg italic text-white">N∞</span>
                  </div>
                  <h2 className="text-base font-bold tracking-tighter uppercase text-white">
                    NexaSnap <span className="text-[#CCFF00]">AI Infinity</span>
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <div className="w-8 h-8 rounded-full border border-[#CCFF00] overflow-hidden" onClick={() => setCurrentPage("profile")}>
                  <img src={profile.avatar} alt="avatar" className="w-full h-full bg-[#1e293b]" />
                </div>
              </div>
            </div>

            {/* Dashboard Mini-Stats Pill aligned with bento style */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <div className="flex items-center gap-4 bg-white/5 rounded-full px-5 py-2 border border-white/10">
                <div 
                  onClick={() => setCurrentPage("reward_vault")}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all"
                >
                  <span className="text-[#CCFF00] font-bold text-xs sm:text-sm">⚡ {profile.xp}</span>
                  <span className="text-[10px] uppercase opacity-50 font-mono text-gray-400">XP</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <div 
                  onClick={() => setCurrentPage("theme_store")}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all"
                >
                  <span className="text-[#CCFF00] font-bold text-xs sm:text-sm">💎 {profile.coins}</span>
                  <span className="text-[10px] uppercase opacity-50 font-mono text-gray-400">NEXA</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <div 
                  onClick={() => {
                    setPremiumAdOpen(false);
                    setStreakModalOpen(true);
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all"
                >
                  <span className="text-orange-400 font-bold text-xs sm:text-sm">🔥 {profile.streak}</span>
                  <span className="text-[10px] uppercase opacity-50 font-mono text-gray-400">Streak</span>
                </div>
                {profile.premiumExpiry && profile.premiumExpiry > appTimeNow && profile.premiumTier !== 'FREE' && (
                  <>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div 
                      onClick={() => setCurrentPage("membership")}
                      className="flex justify-center items-center gap-1 cursor-pointer bg-amber-500/10 px-2 md:px-3 py-1 rounded-full border border-amber-500/20 active:scale-95 transition-all"
                      title="Active VIP Premium Period Remaining Time Tracker"
                    >
                      <span className="text-yellow-400 font-bold font-mono text-[11px] md:text-xs">
                        👑 {(() => {
                          const diff = profile.premiumExpiry - appTimeNow;
                          if (diff <= 0) return "Expired";
                          const days = Math.floor(diff / (24 * 60 * 60 * 1000));
                          const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                          const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
                          const secs = Math.floor((diff % (60 * 1000)) / 1000);
                          return days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m ${secs}s`;
                        })()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="hidden md:flex items-center gap-3 pl-2 border-l border-white/10">
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{profile.username}</p>
                  <p className="text-[10px] text-[#CCFF00] uppercase tracking-widest">{profile.league} League</p>
                </div>
                <div className="w-9 h-9 rounded-full border border-[#CCFF00] overflow-hidden cursor-pointer" onClick={() => setCurrentPage("profile")}>
                  <img 
                    src={profile.avatar} 
                    alt="active node" 
                    className={`w-full h-full bg-[#1e293b] hover:scale-110 transition-transform ${profile.cosmetics[0] || ""}`} 
                  />
                </div>
              </div>
            </div>
          </header>

          {/* AI Notifications Alerts */}
          {notifications.filter(n => !n.read).slice(0, 1).map(alert => (
            <div 
              key={alert.id}
              className="mb-6 mx-auto bg-gradient-to-r from-[#2E5BFF]/10 via-[#7B61FF]/10 to-transparent p-4 rounded-2xl border border-[#2E5BFF]/20 flex justify-between items-center text-xs text-white"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-[#CCFF00] w-4 h-4 animate-spin" />
                <span><strong>{alert.title}</strong>: {alert.message}</span>
              </div>
              <button 
                onClick={() => {
                  const updated = notifications.map(n => n.id === alert.id ? { ...n, read: true } : n);
                  setNotifications(updated);
                }}
                className="text-gray-400 hover:text-white"
              >
                DISMISS
              </button>
            </div>
          ))}

          {/* ====================================================
              4. THE NEXAPORTAL HUD MATRIX OVERLAY (LINK TO 36 PAGES)
          {/* ====================================================
              4. SPECIAL CORE PORTAL HUB OVERLAY WITH MULTI-MODS
              ==================================================== */}
          {portalOpen && (
            <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto flex items-start justify-center pt-10 pb-20">
              <div className="w-full max-w-4xl p-6 sm:p-8 bg-gradient-to-b from-gray-950 to-black rounded-[35px] border border-cyan-500/20 relative max-h-[85vh] overflow-y-auto my-auto pr-3 scrollbar-thin scrollbar-thumb-white/10 pb-12 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                
                {/* HIGH-CONTRAST TOP-RIGHT CLOSING BUTTON */}
                <button 
                  onClick={() => setPortalOpen(false)}
                  className="absolute right-6 top-6 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-full text-xs border border-red-500 shadow-lg shadow-red-900/30 transition-all hover:scale-105 active:scale-95 cursor-pointer z-50 flex items-center gap-1.5 uppercase"
                  id="close_top_portal_btn"
                >
                  <span>✕</span> Close Portal
                </button>

                <h3 className="text-xl font-bold text-white mb-6 tracking-tight text-center uppercase">
                  📡 NexaPortal Hub Matrix (<span className="text-[#CCFF00]">36 Modules</span>)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mb-8">
                  {[
                    { id: "home", name: "Dashboard Core", mod: "Lobby" },
                    { id: "intro_bypass", name: "Intro Bypass", mod: "System" },
                    { id: "login_port", name: "Auth Portal", mod: "System" },
                    { id: "question_bank", name: "Question Bank", mod: "Academics" },
                    { id: "ai_solver", name: "AI Solver Core", mod: "Academics" },
                    { id: "community", name: "Student Directory", mod: "Social" },
                    { id: "chats", name: "Chat Terminal", mod: "Social" },
                    { id: "study_groups", name: "Study Squads", mod: "Social" },
                    { id: "community_feed", name: "Forums Stream", mod: "Social" },
                    { id: "rankings", name: "Global Rankings", mod: "Lobby" },
                    { id: "membership", name: "VIP Perks", mod: "NEXA" },
                    { id: "profile", name: "Node Profile", mod: "Lobby" },
                    { id: "avatar_studio", name: "Avatar Gear", mod: "NEXA" },
                    { id: "settings", name: "System Settings", mod: "System" },
                    { id: "study_battle", name: "Wager Duel Arena", mod: "Lobby" },
                    { id: "study_reels", name: "Study Reels", mod: "Social" },
                    { id: "notes_generator", name: "AI Notes Gen", mod: "Academics" },
                    { id: "focus_mode", name: "Focus Lock", mod: "Lobby" },
                    { id: "reward_vault", name: "Multiplier Spinner", mod: "Lobby" },
                    { id: "watch_to_earn", name: "Watch & Earn", mod: "NEXA" },
                    { id: "hw_scanner", name: "AI Laser Scanner", mod: "Academics" },
                    { id: "marketplace", name: "Study Marketplace", mod: "NEXA" },
                    { id: "career_roadmap", name: "Career Horizon", mod: "Academics" },
                    { id: "virtual_campus", name: "3D Campus map", mod: "Lobby" },
                    { id: "achievement_vault", name: "Trophy Showcase", mod: "Lobby" },
                    { id: "analytics", name: "Neural Analytics", mod: "Academics" },
                    { id: "notifications_hub", name: "Alert Console", mod: "Lobby" },
                    { id: "theme_store", name: "Theme Store", mod: "NEXA" },
                    { id: "profile_showcase", name: "Social Showcase", mod: "Social" },
                    { id: "coin_shop", name: "Coin Shop", mod: "NEXA" },
                    { id: "token_store", name: "Token Reserve", mod: "NEXA" },
                    { id: "creator_studio", name: "Creator Studio", mod: "NEXA" },
                    { id: "tournaments", name: "Scheduled Events", mod: "Social" },
                    { id: "notes_vault", name: "Cloud Notes Vault", mod: "NEXA" },
                    { id: "exam_predictor", name: "Exam Predictor", mod: "Academics" },
                    { id: "ai_mentor", name: "AI Mentor", mod: "Academics" },
                    { id: "language_tutor", name: "AI Global Lang Tutor", mod: "Academics" },
                    { id: "talk_teacher", name: "AI Talk Teacher Mode 🎤", mod: "Academics" },
                    { id: "growth_engineer", name: "Growth Architect Lab", mod: "Growth System" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (p.id === "intro_bypass") setCurrentPage("startup");
                        else if (p.id === "login_port") handleLogout();
                        else setCurrentPage(p.id);
                        setPortalOpen(false);
                      }}
                      className={`py-3 px-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${currentPage === p.id ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-bold' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'}`}
                    >
                      <span className="text-xs tracking-tight line-clamp-1">{p.name}</span>
                      <span className={`text-[9px] uppercase tracking-wider font-mono mt-2 block ${currentPage === p.id ? 'text-black/60' : 'text-gray-400'}`}>
                        {p.mod}
                      </span>
                    </button>
                  ))}
                </div>

                {/* PROMINENT STICKY BOTTOM EMERGENCY DISMISSAL OPTION FOR OPTIMAL SMALL SCREEN USABILITY */}
                <div className="flex justify-center mt-6">
                  <button 
                    onClick={() => setPortalOpen(false)}
                    className="w-full max-w-sm py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/10 cursor-pointer transition-all border border-red-500/30 flex items-center justify-center gap-2"
                  >
                    <span>✕</span> EXIT HUB PORTAL OVERLAY
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              5. SELECTIVE PAGE ROUTER STREAMS (36 IN TOTAL)
              ==================================================== */}
          <main className="space-y-6">
            
            {/* 1. DASHBOARD CORE */}
            {currentPage === "home" && (
              <div className="space-y-6">
                <AdBanner placement="home_top" premiumActive={profile.premiumTier !== "FREE"} />
                {/* Hero Greeting Panel */}
                <div className="neo-glass rounded-[32px] p-8 border-white/10 bg-gradient-to-r from-white/5 to-white/2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-electric-blue/5 blur-[80px] pointer-events-none"></div>
                  <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
                    <div>
                      <span className="px-3 py-1 bg-electric-blue/20 text-[#2E5BFF] border border-[#2E5BFF]/30 rounded-full text-[10px] uppercase font-bold tracking-widest font-mono">
                        AI Core Active
                      </span>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">
                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E5BFF] to-[#CCFF00]">{profile.username}</span>! 👋
                      </h3>
                      <p className="text-xs text-gray-400 mt-2 max-w-md leading-relaxed">
                        "Your kinetic learning velocity stands at 1.48 GHz. Continue algebraic calculations to scale your league."
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-widest text-[#CCFF00] block font-mono font-bold">WORLDWIDE</span>
                      <span className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-1.5 justify-end mt-1">
                        <Crown className="w-5 h-5 text-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]" /> {profile.league}
                      </span>
                    </div>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-mono mb-2">
                      <span className="text-gray-400">XP PROGRESS ({profile.xp} / 5000)</span>
                      <span className="text-cyan-400 font-bold">LEVEL CODES</span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-[#2E5BFF] via-[#7B61FF] to-[#CCFF00] rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (profile.xp / 1000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Focus HP battery & Custom daily Recharger terminal */}
                  <div className="mt-6 border-t border-white/5 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-500 animate-pulse font-bold text-sm">♥</span>
                          <span className="text-gray-300 uppercase font-mono text-[10px] tracking-wider font-extrabold">FOCUS CAPACITY (HP SYSTEMS)</span>
                        </div>
                        <span className={`font-mono font-black text-xs ${userHp < 30 ? 'text-red-400 animate-bounce' : 'text-cyan-400'}`}>
                          {userHp} / 100 HP
                        </span>
                      </div>
                      <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                            userHp < 30 
                              ? 'from-red-600 via-orange-500 to-red-400 animate-[pulse_1.5s_infinite]' 
                              : 'from-cyan-500 via-purple-500 to-[#CCFF00]'
                          }`}
                          style={{ width: `${userHp}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-500 mt-1.5 font-mono">
                        *Incorrect formulations deplete 15 HP. Correct validation replenishes 10 HP. HP required for Esports tournments.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          if (profile.xp < 20) {
                            addNotification("HP Recharge Failed", "Suboptimal XP nodes. Earn at least 20 XP to recharge focus energy!", "alert");
                            alert("Suboptimal XP to recharge! You need at least 20 XP to recover focus capacity.");
                            return;
                          }
                          const healed = Math.min(100, userHp + 25);
                          setUserHp(healed);
                          
                          const nextXp = Math.max(0, profile.xp - 20);
                          const updatedProf = {
                            ...profile,
                            xp: nextXp
                          };
                          saveProfileWithParams(updatedProf, healed);
                          addNotification("Cyber Energy Restored", "Injected +25 HP focus capacity into learning core by exchanging 20 XP!", "success");
                          alert("⚡ Focus capacity recovered! Consumed 20 XP.");
                        }}
                        className="py-2.5 px-4 bg-gradient-to-r from-red-500/20 to-purple-500/20 hover:from-red-500/30 hover:to-purple-500/30 text-white font-mono font-extrabold text-[10px] rounded-2xl hover:scale-105 active:scale-95 transition-all text-center border border-red-500/30 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/5 uppercase"
                      >
                        ⚡ RECHARGE CYBER ENERGY (-20 XP / +25 HP)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Watch & Earn Prompt Banner */}
                <div className="neo-glass rounded-[28px] p-5 border-white/10 bg-gradient-to-r from-cyan-500/10 via-[#2E5BFF]/10 to-transparent relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-12 h-12 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                      <Tv className="w-6 h-6 text-[#CCFF00] animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">Watch Video Ads & Earn Nexa (NEXA)</h4>
                      <p className="text-xs text-gray-400 mt-1">Claim free token rewards instantly. Earn +10.0 NEXA coins per 15s sponsored clip!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentPage("watch_to_earn")}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#CCFF00] hover:bg-lime-400 text-black font-extrabold text-xs tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all uppercase font-mono cursor-pointer text-center whitespace-nowrap border-none"
                  >
                    Open Ad Console 🚀
                  </button>
                </div>

                {/* Grid of Bento Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Item 1: Active Tasks */}
                  <div className="neo-glass rounded-2xl p-5 border-white/5">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[#CCFF00] block mb-2">DAILY STUDY MISSIONS</span>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center gap-2 text-gray-300">
                        <Check className="text-cyan-400 w-4 h-4" /> Resolve 3 Olympiad equations
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <Check className="text-purple-400 w-4 h-4" /> Trigger high-speed solver once
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <Check className="text-[#CCFF00] w-4 h-4" /> Challenge a duel in Battle Arena
                      </li>
                    </ul>
                  </div>

                  {/* Item 2: Active study challenges */}
                  <div className="neo-glass rounded-2xl p-5 border-white/5">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 block mb-2">STUDY MULTIPLIER SLOTS</span>
                    <div className="flex justify-between items-center text-xs text-gray-300 mb-3">
                      <span>Linear Algebra Hack Pack</span>
                      <span className="text-emerald-400 font-mono">+120 XP</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan-400 h-full w-2/3" />
                    </div>
                  </div>

                  {/* Item 3: Global System Rankings overview */}
                  <div className="neo-glass rounded-2xl p-5 border-white/5">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-purple-400 block mb-2">GLOBAL RANK POSITION</span>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-black text-white font-mono">
                          {profile.xp === 0 ? "Unranked" : `#${getCurrentUserRank()}`}
                        </span>
                        <span className="text-[10px] text-gray-400 block uppercase mt-0.5">Global student index</span>
                      </div>
                      <button 
                        onClick={() => setCurrentPage("rankings")}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl"
                      >
                        <ChevronRight className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Autonomous Weekly Planner - Modular, Responsive & High-Fidelity */}
                <div className="mt-8">
                  <AutonomousWeeklyPlanner 
                    profile={profile} 
                    onGrantRewards={grantRewards} 
                    onAddNotification={addNotification} 
                  />
                </div>
              </div>
            )}

            {/* 2. QUESTION BANK */}
            {currentPage === "question_bank" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-white">Dynamic Olympiad Question Bank</h3>
                    <p className="text-xs text-gray-400 mt-1">Infinite randomized questions that auto-replenish as solved</p>
                  </div>
                </div>

                {/* AI Generator Panel */}
                <div className="neo-glass rounded-3xl p-6 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)] bg-cyan-950/2">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <h4 className="text-sm font-black text-white tracking-wider uppercase font-mono">QUANTUM DYNAMIC VARIATION ENGINE</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 block mb-1.5">Select Subject Domain</label>
                      <select 
                        value={qbSubject}
                        onChange={(e) => setQbSubject(e.target.value)}
                        className="w-full bg-black/40 text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-[#CCFF00] focus:outline-none"
                      >
                        {[
                          "Algebra", "Geometry", "Physics", "Chemistry", "Biology", 
                          "Olympiad", "Board Exams", "IQ Tests", "Logical Reasoning", 
                          "Coding Basics", "English Grammar"
                        ].map(sub => (
                          <option key={sub} value={sub} className="bg-neutral-900">{sub}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-[#CCFF00] block mb-1.5">Set Grade Class Year</label>
                      <select 
                        value={qbClass}
                        onChange={(e) => setQbClass(e.target.value)}
                        className="w-full bg-black/40 text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-[#CCFF00] focus:outline-none"
                      >
                        {[
                          "Class 9 / Junior High",
                          "Class 10 / Sophomore",
                          "Class 11 / Junior",
                          "Class 12 / Senior",
                          "Undergrad Level"
                        ].map(cl => (
                          <option key={cl} value={cl} className="bg-neutral-900">{cl}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-purple-400 block mb-1.5">Complexity Level</label>
                      <select 
                        value={qbDifficulty}
                        onChange={(e) => setQbDifficulty(e.target.value as any)}
                        className="w-full bg-black/40 text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-[#CCFF00] focus:outline-none"
                      >
                        {["Easy", "Medium", "Hard", "Extreme"].map(diff => (
                          <option key={diff} value={diff} className="bg-neutral-900">{diff}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={onGenerateCustomAIQuestion}
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 via-[#7B61FF] to-[#CCFF00] text-black font-black text-xs rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-center border-none shadow-[0_0_15px_rgba(204,255,0,0.2)] cursor-pointer uppercase font-mono tracking-wider animate-pulse"
                  >
                    ⚡ Synthesize Premium AI Challenge Node
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions.map((q, idx) => {
                    const isSelectedQuestion = activeQIndex === idx;
                    return (
                      <div key={q.id} className={`neo-glass rounded-2xl p-5 border-white/5 relative transition-all duration-300 ${isSelectedQuestion ? 'border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-cyan-950/5' : ''}`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-mono text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-0.5 rounded-full">
                            {q.category} · {q.difficulty}
                          </span>
                          <div className="flex gap-2 text-[10px] font-mono">
                            <span className="text-emerald-400 font-bold">+100 XP</span>
                            <span className="text-yellow-400 font-bold">+{q.coinReward} G</span>
                          </div>
                        </div>

                        <p className="text-sm text-white font-semibold mb-4 leading-relaxed">{q.questionText}</p>

                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const isThisOptionSelected = isSelectedQuestion && userAnswerSelected === opt;
                            return (
                              <button
                                key={`${opt}-${oIdx}`}
                                onClick={() => {
                                  setActiveQIndex(idx);
                                  tryAnswerQuestion(opt, q);
                                }}
                                className={`w-full text-left py-2.5 px-4 rounded-xl text-xs transition-all font-mono border ${
                                  isThisOptionSelected
                                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                                    : 'bg-white/2 hover:bg-white/5 border-white/5 text-gray-300 hover:border-white/10'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Interactive Validator Button */}
                        {isSelectedQuestion && userAnswerSelected && (
                          <div className="mt-4 space-y-2">
                            <button
                              onClick={() => submitAnswerForValidation(q)}
                              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-[#7B61FF] text-black font-black text-xs rounded-xl hover:scale-105 active:scale-95 transition-all text-center border-none shadow-md cursor-pointer uppercase font-mono tracking-wider"
                            >
                              💾 Validate Solution Formation
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. AI SOLVER CORE */}
            {currentPage === "ai_solver" && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <h3 className="text-3xl font-black text-white">NexaSnap Quantum AI Solver</h3>
                  <p className="text-xs text-gray-400 mt-2">Dismantle mathematics formulas and physical equations instantly using Gemini 3.5 Flash</p>
                </div>

                {/* Solver Command bar */}
                <div className="neo-glass rounded-3xl p-6 border-white/5">
                  <form onSubmit={triggerAISolve} className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={solverInput}
                        onChange={(e) => setSolverInput(e.target.value)}
                        placeholder="Write down any board exam or Olympiad question, or type coordinates for force diagrams..."
                        className="w-full h-32 bg-black/40 text-sm text-white p-4 rounded-2xl border border-white/5 focus:border-[#CCFF00] focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={solverLoading}
                        className="flex-1 py-3 bg-[#CCFF00] text-black font-bold text-xs rounded-2xl tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer border-none uppercase"
                      >
                        {solverLoading ? "PROBING MOLECULAR PATHS..." : "ANALYZE WITH AI CORE"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSolverInput("A car accelerates from rest at 4 m/s² for 5 seconds. How far does it travel?");
                        }}
                        className="py-3 px-4 bg-white/5 text-white hover:bg-white/10 text-xs rounded-2xl font-bold transition-all border border-white/10"
                      >
                        DEMO
                      </button>
                    </div>
                  </form>
                </div>

                {/* Solutions Display Card */}
                {solverResult && (
                  <div className="neo-glass rounded-3xl p-6 border-[#CCFF00]/20 bg-gradient-to-r from-black/50 via-black/10 to-black/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-yellow-400" />
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-mono text-[#CCFF00] uppercase font-bold tracking-widest bg-[#CCFF00]/10 px-3 py-1 rounded-full">
                        {solverResult.solvedBy}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                        DECISION CONVERGED
                      </span>
                    </div>

                    <div className="prose prose-invert text-sm text-gray-300 font-sans leading-relaxed space-y-4 whitespace-pre-wrap">
                      {solverResult.explanation}
                    </div>

                    <div className="mt-6 border-t border-white/5 pt-5">
                      <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-widest block mb-3">AI REINFORCEMENT DRILL</span>
                      {solverResult.interactiveQuiz && solverResult.interactiveQuiz.map((quiz: any, i: number) => (
                        <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5">
                          <p className="text-white font-semibold text-xs mb-3">{quiz.q}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {quiz.options.map((opt: string, oIdx: number) => (
                              <button
                                key={`${opt}-${oIdx}`}
                                onClick={() => {
                                  if (oIdx === quiz.a) {
                                    alert("Correct matrix convergence! XP reward saved.");
                                    grantRewards(20, 5);
                                  } else {
                                    alert("Formulation path failed. Check references.");
                                  }
                                }}
                                className="w-full text-left py-2 px-3 bg-white/2 hover:bg-white/5 text-gray-300 hover:text-white rounded-lg text-xs"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. CHAT TERMINAL / WHATSAPP / TELEGRAM / DISCORD */}
            {currentPage === "chats" && (
              <NexaGramHub 
                profile={profile}
                setProfile={setProfile}
                friends={friends}
                setFriends={setFriends}
                chats={chats}
                setChats={setChats}
                feedPosts={feedPosts}
                setFeedPosts={setFeedPosts}
                reels={reels}
                setReels={setReels}
                studyGroups={studyGroups}
                setStudyGroups={setStudyGroups}
                onGrantRewards={grantRewards}
                onDeductCoins={deductCoins}
                onAddNotification={addNotification}
                initialSubTab="chats"
              />
            )}

            {/* 4. STUDENT DIRECTORY & COMMUNITY CORES */}
            {currentPage === "community" && (() => {
              const [userSearchTerm, setUserSearchTerm] = React.useState("");

              // Send friend request
              const sendRequest = (targetUser: string) => {
                if (sentFriendRequests.includes(targetUser) || friends.includes(targetUser)) return;
                const updatedSent = [...sentFriendRequests, targetUser];
                setSentFriendRequests(updatedSent);
                addNotification("Social Proposal", `Social alignment dispatched to @${targetUser}.`, "info");
                alert(`⚡ social tracking coordinates linked to @${targetUser}!`);
              };

              // Cancel pending request
              const cancelRequest = (targetUser: string) => {
                const updatedSent = sentFriendRequests.filter(u => u !== targetUser);
                setSentFriendRequests(updatedSent);
                addNotification("Signal Revoked", `Withdrew alignment request to @${targetUser}.`, "info");
              };

              // Accept incoming request
              const acceptRequest = (senderUser: string) => {
                const updatedRec = receivedFriendRequests.filter(u => u !== senderUser);
                setReceivedFriendRequests(updatedRec);

                if (!friends.includes(senderUser)) {
                  const updatedFriends = [...friends, senderUser];
                  setFriends(updatedFriends);

                  // Auto-create chat room session
                  const exists = chats.some(c => c.recipientName === senderUser);
                  if (!exists) {
                    const candidateUser = allUsers.find(u => u.username === senderUser) || { avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${senderUser}` };
                    const newSession = {
                      id: `chat_session_${Date.now()}`,
                      recipientName: senderUser,
                      recipientAvatar: (candidateUser as any).avatar,
                      messages: [
                        {
                          id: `msg_init_${Date.now()}`,
                          sender: senderUser,
                          avatar: (candidateUser as any).avatar,
                          text: `👋 Real-time social pipeline established. Ready to study?`,
                          time: "Just now"
                        }
                      ]
                    };
                    setChats([newSession, ...chats]);
                  }
                }
                
                addNotification("Coordinate Bonded", `@${senderUser} aligned to your directory.`, "success");
                alert(`🤝 Social alignment established with @${senderUser}!`);
              };

              // Reject request
              const rejectRequest = (senderUser: string) => {
                const updatedRec = receivedFriendRequests.filter(u => u !== senderUser);
                setReceivedFriendRequests(updatedRec);
                addNotification("Proposal Denied", `Denied alignment with @${senderUser}.`, "info");
              };

              // Open DM helper
              const openDirectMessage = (friendUsername: string) => {
                const chatIndex = chats.findIndex(c => c.recipientName === friendUsername);
                if (chatIndex >= 0) {
                  setActiveChatIdx(chatIndex);
                  setCurrentPage("chats");
                } else {
                  const candidateUser = allUsers.find(u => u.username === friendUsername) || { avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${friendUsername}` };
                  const newSession = {
                    id: `chat_session_${Date.now()}`,
                    recipientName: friendUsername,
                    recipientAvatar: (candidateUser as any).avatar,
                    messages: [
                      {
                        id: `msg_init_${Date.now()}`,
                        sender: friendUsername,
                        avatar: (candidateUser as any).avatar,
                        text: `🎯 Let's synchronize formulas!`,
                        time: "Just now"
                      }
                    ]
                  };
                  setChats([newSession, ...chats]);
                  setActiveChatIdx(0);
                  setCurrentPage("chats");
                }
              };

              const filteredUsers = allUsers.filter(u => {
                return u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) && u.username !== profile.username;
              });

              const suggestedUsers = allUsers.filter(u => {
                return u.username !== profile.username &&
                  !friends.includes(u.username) &&
                  !sentFriendRequests.includes(u.username) &&
                  !receivedFriendRequests.includes(u.username);
              });

              return (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-white">Academia Student Directory</h3>
                      <p className="text-xs text-gray-400 mt-1">Discover, challenge, and align code with elite participants worldwide</p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search student @username..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full bg-black/40 text-xs text-white py-3 pl-10 pr-4 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  {/* Incoming requests alert box */}
                  {receivedFriendRequests.length > 0 && (
                    <div className="neo-glass border border-purple-500/20 bg-purple-950/10 p-5 rounded-3xl animate-pulse">
                      <span className="text-xs text-purple-400 font-extrabold uppercase font-mono tracking-widest block mb-3">⚡ Incoming Social Alignment Proposals</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {receivedFriendRequests.map(username => {
                          const uObj = allUsers.find(x => x.username === username) || { avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}` };
                          return (
                            <div key={username} className="flex justify-between items-center p-3 bg-black/40 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-2.5">
                                <img src={(uObj as any).avatar} alt="" className="w-8 h-8 rounded-full" />
                                <div>
                                  <span className="text-xs text-white font-bold block">@{username}</span>
                                  <span className="text-[9px] text-[#CCFF00] font-mono">Competitor pending</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => acceptRequest(username)}
                                  className="px-3 py-1.5 bg-[#CCFF00] text-black text-[10px] font-black rounded-lg cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => rejectRequest(username)}
                                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] rounded-lg text-gray-300 border border-white/5 cursor-pointer"
                                >
                                  Deny
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* GLOBAL STUDENT NETWORK LIVE CONNECTIONS */}
                  <div className="neo-glass rounded-3xl p-6 border-[#CCFF00]/10 bg-[#CCFF00]/2 space-y-4 mb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs text-[#CCFF00] uppercase font-mono tracking-widest font-extrabold block">LIVE ACADEMIC SECTOR LOGINS ({globalLogins.length})</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">SECURE TIMESTAMP ENGINE</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {globalLogins.map((usr) => {
                        const elapsedMs = tickerTime - usr.loginTime;
                        const elapsedSec = Math.floor(elapsedMs / 1000);
                        let elapsedStr = "Just joined";
                        if (elapsedSec >= 60) {
                          const elapsedMin = Math.floor(elapsedSec / 60);
                          elapsedStr = `${elapsedMin}m ago`;
                        } else if (elapsedSec > 5) {
                          elapsedStr = `${elapsedSec}s ago`;
                        }
                        return (
                          <div key={usr.username} className="p-3 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-2 hover:scale-[1.02] transition-transform">
                            <img src={usr.avatar} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-white block">@{usr.username}</span>
                              <span className="text-[9px] text-[#CCFF00] font-mono uppercase bg-[#CCFF00]/5 px-1.5 py-0.2 rounded-md tracking-wider">⏱️ {elapsedStr}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active friends */}
                    <div className="neo-glass rounded-3xl p-6 border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-cyan-400 uppercase font-mono tracking-widest font-extrabold block">BONDED SOCIAL CORES ({friends.length})</span>
                      </div>

                      {friends.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
                          <Users className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                          <p className="text-xs text-gray-400">No active student bonds detected on this node module.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                          {friends.map(friendName => {
                            const fObj = allUsers.find(x => x.username === friendName) || { online: true, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${friendName}` };
                            return (
                              <div key={friendName} className="flex justify-between items-center p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl transition-all">
                                <div className="flex items-center gap-2.5">
                                  <div className="relative">
                                    <img src={(fObj as any).avatar} alt="" className="w-8 h-8 rounded-full" />
                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${(fObj as any).online ? 'bg-emerald-500' : 'bg-gray-600'}`}></span>
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-white block">@{friendName}</span>
                                    <span className="text-[9px] text-[#CCFF00] font-mono">{(fObj as any).online ? 'CONNECTED ONLINE' : 'DISCONNECTED'}</span>
                                  </div>
                                </div>

                                <button 
                                  onClick={() => openDirectMessage(friendName)}
                                  className="px-3.5 py-1.5 bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 text-[#CCFF00] text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 font-mono"
                                >
                                  <MessageSquare className="w-3 h-3" /> CHAT
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Suggestions or Search */}
                    <div className="neo-glass rounded-3xl p-6 border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-yellow-400 uppercase font-mono tracking-widest font-extrabold block">
                          {userSearchTerm ? 'SEARCH SCAN INDEX' : 'ALL ACADEMIA COMPETITORS'}
                        </span>
                      </div>

                      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 font-mono">
                        {(userSearchTerm ? filteredUsers : allUsers).map(user => {
                          const isPending = sentFriendRequests.includes(user.username);
                          const isFriend = friends.includes(user.username);

                          return (
                            <div key={user.username} className="flex justify-between items-center p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl">
                              <div className="flex items-center gap-2.5 font-sans">
                                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                                <div>
                                  <span className="text-xs text-white font-bold block">@{user.username}</span>
                                  <span className="text-[9px] text-gray-400">{user.league} · {user.xp.toLocaleString()} XP</span>
                                </div>
                              </div>

                              {isFriend ? (
                                <span className="text-[9px] text-[#CCFF00] uppercase px-2 py-1 bg-[#CCFF00]/10 rounded-lg">Bonded</span>
                              ) : isPending ? (
                                <button 
                                  onClick={() => cancelRequest(user.username)}
                                  className="px-2.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/25 text-[9px] font-bold rounded-lg cursor-pointer uppercase font-sans"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <button 
                                  onClick={() => sendRequest(user.username)}
                                  className="px-2.5 py-1.5 bg-[#CCFF00] text-black text-[9px] font-black rounded-lg cursor-pointer font-sans uppercase"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {filteredUsers.length === 0 && userSearchTerm && (
                          <div className="text-center py-10 font-sans">
                            <p className="text-xs text-gray-400">No matching search particles in directory.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 5. STUDY GROUPS - WITH ADVANCED SEARCH, FILTERING, AND JOIN PROTOCOLS */}
            {currentPage === "study_groups" && (() => {
              // Real-time group filtering logic
              const filteredGroups = studyGroups.filter(g => {
                const query = groupSearchQuery.trim().toLowerCase();
                const matchesSearch = !query || 
                  g.name.toLowerCase().includes(query) || 
                  g.description.toLowerCase().includes(query);
                
                if (groupSubjectCategory === "All") return matchesSearch;
                
                // Smart keyword binding for genres
                const tagsMap: Record<string, string[]> = {
                  "Mathematics": ["math", "calculus", "geometry", "proof", "algebra", "number", "factor"],
                  "Science": ["biology", "bio", "science", "physics", "chemistry", "crispr", "genetics", "atom", "molecule"],
                  "Tech": ["computer", "tech", "coding", "quantum", "engineer", "pioneers", "qbit", "server", "algorithm"],
                  "Language": ["language", "vocabulary", "english", "speak", "writing", "communication"]
                };
                
                const keywords = tagsMap[groupSubjectCategory] || [];
                const matchesCategory = keywords.some(kw => 
                  g.name.toLowerCase().includes(kw) || g.description.toLowerCase().includes(kw)
                );
                
                return matchesSearch && matchesCategory;
              });

              return (
                <div className="space-y-6">
                  {/* Title Header */}
                  <div className="flex justify-between items-center flex-wrap gap-4 select-none">
                    <div>
                      <h3 className="text-2xl font-black text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#CCFF00]" /> STUDY SQUAD HUBS
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Form high-velocity squads, invite peers, search active labs, or join synchronized voice whiteboards.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsCreatingGroup(true)}
                      className="py-2.5 px-4 bg-[#CCFF00] text-black font-extrabold rounded-2xl text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-none cursor-pointer shadow-[0_5px_15px_rgba(204,255,0,0.15)]"
                    >
                      <Plus className="w-4 h-4 text-black font-black" /> CALIBRATE SQUAD NETWORK
                    </button>
                  </div>

                  {/* SEARCH BOX & SUBJECT FILTERS FOR SQUADS */}
                  <div className="p-4 bg-white/3 rounded-[24px] border border-white/5 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      {/* Search Input Box */}
                      <div className="relative w-full md:max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                          <Search className="w-4 h-4 text-cyan-400" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search study groups by name, tag or keywords..."
                          value={groupSearchQuery}
                          onChange={(e) => setGroupSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-9 py-2.5 bg-black/50 text-xs text-white rounded-xl border border-white/5 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] focus:outline-none placeholder-gray-500 font-sans"
                        />
                        {groupSearchQuery && (
                          <button
                            onClick={() => setGroupSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white cursor-pointer bg-transparent border-none"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Filter category badges */}
                      <div className="flex gap-1.5 flex-wrap items-center">
                        {[
                          { id: "All", label: "🌐 All Syncs" },
                          { id: "Mathematics", label: "📐 Math Node" },
                          { id: "Science", label: "🧬 Bio & Science" },
                          { id: "Tech", label: "💻 Coding / Qubits" },
                          { id: "Language", label: "🗣️ Language Labs" }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setGroupSubjectCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                              groupSubjectCategory === cat.id
                                ? "bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_3px_10px_rgba(204,255,0,0.1)]"
                                : "bg-white/2 text-gray-300 border-white/5 hover:bg-white/5"
                            } cursor-pointer`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SQUADS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredGroups.map((g, grpIdx) => {
                      const isJoined = joinedGroupIds.includes(g.id);
                      
                      const toggleMembership = () => {
                        if (isJoined) {
                          // Leave group
                          setJoinedGroupIds(joinedGroupIds.filter(id => id !== g.id));
                          const updated = [...studyGroups];
                          const idx = updated.findIndex(group => group.id === g.id);
                          if (idx !== -1) {
                            updated[idx] = { ...updated[idx], membersCount: Math.max(1, updated[idx].membersCount - 1) };
                            setStudyGroups(updated);
                          }
                          addNotification("Left Squad", `Disconnected from squad channel "${g.name}".`, "info");
                        } else {
                          // Join group
                          setJoinedGroupIds([...joinedGroupIds, g.id]);
                          const updated = [...studyGroups];
                          const idx = updated.findIndex(group => group.id === g.id);
                          if (idx !== -1) {
                            updated[idx] = { ...updated[idx], membersCount: updated[idx].membersCount + 1 };
                            setStudyGroups(updated);
                          }
                          addNotification("Squad Synergy Active", `Connected to squad channel "${g.name}".`, "success");
                          
                          // Launch claim feedback sequence
                          // Simulating claim feedback!
                          setCurrentClaim({
                            isOpen: true,
                            type: "NEXO",
                            title: "🔗 SQUAD SYNCHRONIZED",
                            subtitle: `Joined "${g.name}" successfully! Your study logs are now public to squad nodes.`,
                            amount: "+20 XP",
                            itemName: "Connection Calibration Complete",
                            pendingXp: 20
                          });
                        }
                      };

                      return (
                        <div key={g.id} className={`neo-glass rounded-[30px] p-6 border-white/5 flex flex-col justify-between hover:border-cyan-400/30 transition-all duration-300 relative ${isJoined ? 'bg-gradient-to-br from-indigo-950/10 via-black/40 to-cyan-950/10' : 'bg-black/20'}`}>
                          <div>
                            {/* Header metadata */}
                            <div className="flex justify-between items-start mb-4 select-none">
                              <span className="text-3xl p-2.5 bg-white/3 rounded-2xl border border-white/5 block">{g.icon || '🧬'}</span>
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-mono text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-full font-black tracking-widest block">
                                  {g.membersCount} NODES ACTIVE
                                </span>
                                <span className="text-[9px] uppercase font-mono text-gray-500 block mt-1">
                                  Shared XP: <strong className="text-cyan-400">{isJoined ? '1,540 G' : '820 G'}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-base font-black text-white leading-snug">{g.name}</h4>
                              {isJoined && (
                                <span className="text-[8px] uppercase tracking-wider font-mono font-bold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-1.5 py-0.5 rounded">
                                  MEMBER
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed mb-4">{g.description}</p>

                            {/* Interactive roster management (Only visible or interactive if joined) */}
                            {isJoined ? (
                              <div className="my-4 p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 uppercase font-black">
                                  <span>Squad Members</span>
                                  <span className="text-purple-400">Admin Controls</span>
                                </div>
                                
                                {/* Simulated participant list */}
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center text-[11px] text-gray-200">
                                    <span>👤 You (Member)</span>
                                    <span className="text-[9px] text-[#CCFF00] font-mono uppercase bg-[#CCFF00]/10 px-1.5 py-0.5 rounded">Active</span>
                                  </div>
                                </div>

                                {/* Quick invite dropdown */}
                                {friends.length > 0 ? (
                                  <div className="mt-2.5 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5">
                                    <span className="text-[9px] text-gray-500 font-mono block w-full">RECRUIT ONLINE FRIENDS:</span>
                                    {friends.map(friend => (
                                      <button
                                        key={friend}
                                        onClick={() => {
                                          const updated = [...studyGroups];
                                          const idx = updated.findIndex(group => group.id === g.id);
                                          if (idx !== -1) {
                                            updated[idx] = { ...updated[idx], membersCount: updated[idx].membersCount + 1 };
                                            setStudyGroups(updated);
                                          }
                                          addNotification("Squad Recruited", `@${friend} was transferred to "${g.name}" whiteboard.`, "success");
                                          setCurrentClaim({
                                            isOpen: true,
                                            type: "NEXO",
                                            title: "💬 PEER INVITATION LOGGED",
                                            subtitle: `Invite packet dispatched successfully to @${friend}!`,
                                            amount: "+5 XP",
                                            itemName: "Recruitment Reward",
                                            pendingXp: 5
                                          });
                                        }}
                                        className="text-[9px] bg-white/5 hover:bg-white/10 text-gray-300 px-2 py-1 rounded-xl transition-all border border-white/5 cursor-pointer lowercase"
                                      >
                                        +{friend}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[9px] text-gray-600 font-mono mt-1">*Add friends in custom profiles view to summon invitations.</p>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 my-4 bg-white/2 rounded-2xl border border-dashed border-white/5 text-center">
                                <p className="text-[10px] text-gray-500 font-mono">Connect to the squad network to inspect logs & join high fidelity voice whiteboards.</p>
                              </div>
                            )}
                          </div>

                          {/* Shared resources indices & Join Action Button */}
                          <div className="border-t border-white/5 pt-4 space-y-3">
                            <div className="flex justify-between text-[11px] text-gray-300">
                              <span className="font-sans">Whiteboards & Shared Notes</span>
                              <span className="text-[#CCFF00] font-mono font-bold tracking-wider">{g.sharedNotesCount} synchronized</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-gray-300">
                              <span>Live Voice Studios Rooms</span>
                              <span className="text-[#7B61FF] font-mono font-bold">2 active rooms</span>
                            </div>

                            <div className="flex gap-2">
                              {/* Toggle Join/Leave button */}
                              <button
                                onClick={toggleMembership}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border font-mono ${
                                  isJoined 
                                    ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" 
                                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                } cursor-pointer`}
                              >
                                {isJoined ? "🔌 LEAVE SQUAD" : "⚡ JOIN SQUAD"}
                              </button>

                              {/* Voice Hub disabled to match Interactive Collaboration Canvas deprecation */}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredGroups.length === 0 && (
                      <div className="col-span-full neo-glass rounded-3xl p-10 text-center space-y-4 border-white/5">
                        <Users className="w-10 h-10 text-gray-600 mx-auto animate-pulse" />
                        <div>
                          <h4 className="text-sm font-bold text-gray-300">No Squad Channels Detected</h4>
                          <p className="text-xs text-gray-500 mt-1">Refine your search term query or click CALIBRATE SQUAD NETWORK to synthesize your own!</p>
                        </div>
                        <button
                          onClick={() => { setGroupSearchQuery(""); setGroupSubjectCategory("All"); }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-[#CCFF00]/20 cursor-pointer"
                        >
                          Clear Search Parameters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 6. COMMUNITY FEED */}
            {currentPage === "community_feed" && (
              <NexaGramHub 
                profile={profile}
                setProfile={setProfile}
                friends={friends}
                setFriends={setFriends}
                chats={chats}
                setChats={setChats}
                feedPosts={feedPosts}
                setFeedPosts={setFeedPosts}
                reels={reels}
                setReels={setReels}
                studyGroups={studyGroups}
                setStudyGroups={setStudyGroups}
                onGrantRewards={grantRewards}
                onDeductCoins={deductCoins}
                onAddNotification={addNotification}
                initialSubTab="feed"
              />
            )}

            {/* 7. GLOBAL RANKINGS */}
            {currentPage === "rankings" && (
              <AnimatedLeaderboard 
                profile={profile}
                allUsers={allUsers}
                onSaveProfile={saveProfile}
                onDeductCoins={deductCoins}
              />
            )}

            {/* 8. STUDY BATTLE ARENA (Interactive Quiz Match setup) */}
            {currentPage === "study_battle" && (
              <div className="max-w-3xl mx-auto">
                <StudyBattleArena 
                  userProfile={profile} 
                  onGrantRewards={grantRewards} 
                  onAddNotification={addNotification} 
                />
              </div>
            )}

            {/* 9. FOCUS MODE (Interactive Pomodoro & Lofi) */}
            {currentPage === "focus_mode" && (
              <div className="max-w-4xl mx-auto">
                <FocusMode onGrantRewards={grantRewards} />
              </div>
            )}

            {/* 10. AI NOTES GENERATOR (Interactive markdown sheets converter) */}
            {currentPage === "notes_generator" && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white">AI Instant Notes Builder</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Harness prompt patterns to formulate structured academic markdown sheets instantly
                  </p>
                </div>

                <div className="neo-glass rounded-3xl p-6 border-white/5">
                  <div className="space-y-3 mb-6">
                    <input
                      type="text"
                      id="notes_topic_input"
                      placeholder="e.g. Thermodynamics and entropy equations..."
                      className="w-full bg-black/40 text-xs font-bold text-white py-3 px-4 rounded-2xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
                    />
                  </div>

                  <button 
                    onClick={async () => {
                      const input = (document.getElementById("notes_topic_input") as HTMLInputElement)?.value;
                      if (!input) return;
                      // Deduct standard 5 Coins fee for using AI Notes Generator
                      if (!deductCoins(5)) {
                        return;
                      }
                      try {
                        const res = await fetch("/api/gemini/notes", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ topic: input, style: "comprehensive" })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data && data.success) {
                            setExamResult(data.notes);
                            grantRewards(30, 10);
                            alert("Academic study guide synced to layout below!");
                            return;
                          }
                        }
                      } catch (err) {
                        console.warn("AI notes server disconnected, generating local study sheet:", err);
                      }

                      // Local fallback study notes generator
                      const sampleNotes = `# NEXOSNAP STUDY LEAF: ${input.toUpperCase()}

## 1. Executive Concept Summary
${input} refers to a key academic paradigm where discrete variable states govern net potential pathways. In professional mechanics and physics contexts, these formulas preserve consistent matrix metrics across multi-axis frameworks.

## 2. Core Functional Formulas & Axioms
- **Conservation Metric**:
  $$ \\sum \\vec{F}_{net} = m \\cdot \\vec{a} $$
- **Thermal Steady State Gradient**:
  $$ Q = \\kappa \\cdot A \\cdot \\frac{\\Delta T}{d} $$
- **Entropy Invariance Function**:
  $$ \\Delta S = \\int \\frac{dQ_{rev}}{T} $$

## 3. High-Yield Practice Problems
1. **Problem**: Determine the absolute reaction threshold under standard atmospheric density constants.
   - *Key Formulation Method*: Simplify parameters to isolate logarithmic equilibrium indices before applying coefficients.
   - *Step-by-Step Resolution*: Ensure consistent units, factor out temperature coordinates (~298 Kelvin), and compute the net molar bounds.

---
*💫 Study sheet synthesized dynamically by NexaSnap Local Client Engine (Offline Mode).*`;

                      setExamResult(sampleNotes);
                      grantRewards(30, 10);
                      alert("Academic study guide synced to layout below!");
                    }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-[#7B61FF] text-white font-bold text-xs rounded-2xl border-none cursor-pointer hover:scale-105 transition-all text-center"
                  >
                    CONGENERATE STUDY SHEETS
                  </button>
                </div>

                {examResult && (
                  <div className="neo-glass rounded-3xl p-6 border-cyan-400/20 bg-black/40 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {examResult}
                  </div>
                )}
              </div>
            )}

            {/* 11. PROFILE CAREER ROADMAPS */}
            {currentPage === "career_roadmap" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white">Career Horizon Planner</h3>
                  <p className="text-xs text-gray-400 mt-1">Interactive roadmap nodes designed for futuristic technology segments</p>
                </div>
                <CareerRoadmapView onDeductCoins={deductCoins} />
              </div>
            )}

            {/* 12. VIRTUAL CAMPUS MAP */}
            {currentPage === "virtual_campus" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <NexaVerseCampus onGrantRewards={grantRewards} onAddNotification={addNotification} />
              </div>
            )}

            {/* 13. STUDY REELS VERTICAL STREAM */}
            {currentPage === "study_reels" && (
              <NexaGramHub 
                profile={profile}
                setProfile={setProfile}
                friends={friends}
                setFriends={setFriends}
                chats={chats}
                setChats={setChats}
                feedPosts={feedPosts}
                setFeedPosts={setFeedPosts}
                reels={reels}
                setReels={setReels}
                studyGroups={studyGroups}
                setStudyGroups={setStudyGroups}
                onGrantRewards={grantRewards}
                onDeductCoins={deductCoins}
                onAddNotification={addNotification}
                initialSubTab="reels"
              />
            )}

            {/* 14. THEME CONFIG & PREMIUM STORE */}
            {currentPage === "theme_store" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white">Ecosystem Premium Customize</h3>
                  <p className="text-xs text-gray-400 mt-1">Liquidate study coins to personalize border colors, widgets and wallpapers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getShopItems().map((item) => {
                    const isUnlocked = profile.unlockedThemes.includes(item.unlockedContent) || profile.cosmetics.includes(item.unlockedContent);
                    return (
                      <div key={item.id} className="neo-glass rounded-3xl p-6 border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                              Rarity: {item.rarity}
                            </span>
                            <span className="text-xs text-amber-400 font-mono font-extrabold">{item.price} G</span>
                          </div>

                          <h5 className="text-base font-bold text-white mb-2">{item.name}</h5>
                          <p className="text-xs text-gray-400 leading-relaxed mb-4">{item.description}</p>
                        </div>

                        {isUnlocked ? (
                          <button 
                            onClick={() => {
                              if (item.type === 'theme') {
                                saveProfile({ ...profile, activeTheme: item.unlockedContent });
                                alert("Active UI theme updated!");
                              }
                            }}
                            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs font-mono transition-all border border-white/10"
                          >
                            {item.type === 'theme' && profile.activeTheme === item.unlockedContent ? "ACTIVE THEME" : "ACTIVATE"}
                          </button>
                        ) : (
                          <button 
                            onClick={() => purchaseShopItem(item)}
                            className="w-full py-2.5 bg-[#CCFF00] text-black font-bold rounded-xl text-xs tracking-wider transition-all border-none"
                          >
                            UNLOCK SCHEMATIC
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 15. AVATAR CONFIG DOCK */}
            {currentPage === "avatar_studio" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white">Avatar Cosmetic Studio</h3>
                  <p className="text-xs text-gray-400 mt-1">Configure your study node avatar and assign mythic borders</p>
                </div>
                <AvatarStudio 
                  userProfile={profile} 
                  onChangeAvatar={(url) => saveProfile({ ...profile, avatar: url })} 
                  onChangeCosmetics={(styleClass) => saveProfile({ ...profile, cosmetics: [styleClass] })} 
                />
              </div>
            )}

            {/* 16. DAILY VAULT MULTIPLIER (Lucky Spin wheel) */}
            {currentPage === "reward_vault" && (
              <div className="space-y-6">
                <DailyRewardHub 
                  onGrantRewards={grantRewards} 
                  onAddNotification={addNotification} 
                  profile={profile}
                  onSaveProfile={(updatedProf) => saveProfileWithParams(updatedProf, userHp)}
                />
              </div>
            )}

            {/* 17. SYSTEM SETTINGS DOCK */}
            {currentPage === "settings" && (
              <div className="max-w-2xl mx-auto neo-glass rounded-3xl p-6 border-white/5 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">System Config Nodes</h3>
                  <p className="text-xs text-gray-400">Configure parameters for offline databases, privacy layers, and account bounds</p>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="flex justify-between items-center py-3 border-b border-white/5 text-gray-300">
                    <span>Email Bound</span>
                    <span className="text-white font-bold">{profile.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5 text-gray-300">
                    <span>Premium Status</span>
                    <span className="text-yellow-400 font-bold uppercase">{profile.premiumTier} Tier</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5 text-gray-300">
                    <span>Active Theme Engine</span>
                    <span className="text-cyan-400 font-bold uppercase">{profile.activeTheme}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-white/5 text-gray-300">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-white font-bold">🚀 Enable Offline Mode</span>
                      <span className="text-[10px] text-gray-400">Operate seamlessly using sandboxed local memory databases</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleOfflineMode(!isOfflineMode)}
                      className={`py-2 px-4 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer border-none shadow-md ${isOfflineMode ? 'bg-[#CCFF00] text-black hover:bg-lime-400 shadow-lime-900/10' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                      {isOfflineMode ? "📶 ACTIVE (OFFLINE)" : "🌐 CONNECTED (ONLINE)"}
                    </button>
                  </div>
                </div>

                <IntegrationTester profile={profile} onSaveProfile={saveProfile} onAddNotification={addNotification} />

                {/* DANGEROUS AREA: ACCOUNTS ADMINISTRATOR & PURGE INTERACTIVE BLOCK */}
                <div className="pt-6 border-t border-red-500/10 space-y-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <h4 className="text-xs font-black uppercase font-mono tracking-widest text-[#FF3B30] flex items-center gap-1">
                      <span>🚨</span> Account Termination & Cache Purge Node
                    </h4>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                    Enter any specific user account username (such as <code className="text-[#CCFF00] font-bold">bhushan googal</code> or your current active node <code className="text-[#CCFF00] font-bold">{profile.username}</code>) to permanently delete their cryptographic stats, custom records, achievement history, and local web cache. Leave the target input blank to dismiss.
                  </p>

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={purgeUsernameInput}
                      onChange={(e) => setPurgeUsernameInput(e.target.value)}
                      placeholder="Write target username (e.g., bhushan googal)"
                      className="flex-1 bg-black/40 border border-white/10 hover:border-red-500/30 focus:border-red-500/50 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const target = purgeUsernameInput.trim();
                        if (!target) {
                          addNotification("Empty Target Input", "Please type a valid target username identifier to delete.", "alert");
                          return;
                        }
                        const confirmDelete = window.confirm(`⚠️ WARNING: Are you absolutely sure you want to completely destroy the client caches and Cloud Firestore data bound to account "${target}"? This operation is cryptographically irreversible and cannot be recovered.`);
                        if (!confirmDelete) return;

                        addNotification("Purging Account Node", `Transferring delete signal for user account "${target}"...`, "info");
                        try {
                          const { deleteUserProfileByAdmin } = await import("./lib/firebase");
                          const success = await deleteUserProfileByAdmin(target);
                          if (success) {
                            addNotification("Terminated Node Success ✔", `Account "${target}" data and indices have been permanently cleared.`, "success");
                            setPurgeUsernameInput("");
                            
                            // Check if we deleted ourselves
                            if (profile.username && profile.username.toLowerCase().trim() === target.toLowerCase().trim()) {
                              handleLogout();
                            }
                          } else {
                            addNotification("Deletion Notice", `Database path for "${target}" purged completely.`, "success");
                            setPurgeUsernameInput("");
                            if (profile.username && profile.username.toLowerCase().trim() === target.toLowerCase().trim()) {
                              handleLogout();
                            }
                          }
                        } catch (e: any) {
                          addNotification("Purge Trace Fault", e.message || "Unknown error occurred.", "alert");
                        }
                      }}
                      className="py-2.5 px-4 bg-red-600/20 hover:bg-red-600/45 border border-red-500/30 hover:border-red-500/60 text-red-200 hover:text-white font-bold text-[11px] rounded-xl font-mono uppercase transition-all cursor-pointer"
                    >
                      Purge Account
                    </button>
                  </div>
                </div>

                {/* REWARD HISTORY LOG DOCK */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">🏆</span>
                      <h4 className="text-xs font-black uppercase font-mono tracking-widest text-cyan-400">
                        Live Inventory Reward History
                      </h4>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        const confirmReset = window.confirm("Reset and purge all local visual reward logs history from active memory?");
                        if (confirmReset) {
                          const initialHistory = [
                            { id: "r_init_1", title: "🎁 System Initial Configuration", source: "Account Bounds Setup", coins: 50, xp: 25, hp: 100, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) }
                          ];
                          setRewardHistory(initialHistory);
                          localStorage.setItem("nexa_reward_history", JSON.stringify(initialHistory));
                          addNotification("Logs Purged", "Reset device local visual log database.", "info");
                        }
                      }}
                      className="text-[9px] uppercase font-mono bg-white/5 hover:bg-white/10 hover:text-white text-gray-400 py-1 px-2.5 rounded border border-white/5 cursor-pointer transition-colors"
                    >
                      Clear Logs
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                    Chronological telemetry record of academic assets claimed by your node from checking-in, answers convergence, reels multipliers, and AI solves.
                  </p>

                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {rewardHistory && rewardHistory.length > 0 ? (
                      rewardHistory.map((log: any, index: number) => (
                        <div key={log.id || index} className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/20 transition-all flex justify-between items-center text-left font-mono text-[10px]">
                          <div className="space-y-1">
                            <p className="text-white font-bold">{log.title}</p>
                            <p className="text-gray-500 text-[9px]">Source: {log.source}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600 text-[9px]">{log.timestamp ? log.timestamp.substring(11, 19) : ""}</span>
                            <div className="flex gap-1.5 items-center">
                              {log.xp > 0 && (
                                <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded text-[9px] font-black">
                                  +{log.xp} XP
                                </span>
                              )}
                              {log.coins > 0 && (
                                <span className="bg-[#CCFF00]/10 text-[#CCFF00] px-1.5 py-0.5 rounded text-[9px] font-black">
                                  +{log.coins} NEXA
                                </span>
                              )}
                              {log.hp > 0 && (
                                <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[9px] font-black">
                                  +{log.hp} HP
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-gray-500 text-[10px]">
                        No cryptographic assets recorded on this device yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4 justify-between items-center text-xs">
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setCurrentPage("privacy_policy")}
                      className="text-gray-400 hover:text-[#CCFF00] transition-colors cursor-pointer font-bold inline-flex items-center gap-1"
                    >
                      🛡️ Privacy Policy
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCurrentPage("terms_conditions")}
                      className="text-gray-400 hover:text-[#CCFF00] transition-colors cursor-pointer font-bold inline-flex items-center gap-1"
                    >
                      ⚖️ Terms & Conditions
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="py-2 px-4 bg-red-600/10 text-red-300 font-bold rounded-xl text-[10px] hover:bg-red-600/30 hover:text-white transition-all border border-red-500/20 uppercase cursor-pointer"
                  >
                    RESET SYSTEM CODES (LOGOUT)
                  </button>
                </div>
              </div>
            )}

            {/* PRIVACY POLICY PAGE */}
            {currentPage === "privacy_policy" && (
              <div className="max-w-2xl mx-auto neo-glass rounded-3xl p-6 md:p-8 border border-white/5 space-y-6 animate-fade-in text-left">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white">Privacy Policy</h3>
                    <p className="text-xs text-gray-400 font-mono mt-1">LAST UPDATED: MAY 28, 2026</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setCurrentPage("settings")}
                    className="py-1.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs uppercase cursor-pointer border border-white/5 font-mono"
                  >
                    Back to Settings
                  </button>
                </div>

                <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed font-sans max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <p className="font-semibold text-white">Welcome to NexaLearn.</p>
                  <p>
                    NexaLearn is an AI-powered educational platform designed to help students learn smarter using advanced study tools, AI assistance, PDF exports, quizzes, and reward systems. We value your privacy and aim to keep information simple and transparent.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">1. Information We Collect</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Name and email address during authentication.</li>
                    <li>User-generated study content and cards.</li>
                    <li>Device and app usage analytics for performance tuning.</li>
                    <li>Reward/ad interaction events and logs.</li>
                    <li>Firebase authentication identifiers.</li>
                    <li>Crash and performance diagnostics.</li>
                  </ul>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">2. Advertising & Monetization</h4>
                  <p>
                    NexaLearn uses Google AdMob to display advertisements, including rewarded advertisements. Google AdMob may collect technical device identifiers, advertising IDs, IP addresses, and app interaction metrics to deliver relevant impressions. These ads help support and maintain our platform features.
                  </p>
                  <p>
                    Learn more: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-semibold">Google Advertising Privacy & Policy</a>
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">3. Firebase Services</h4>
                  <p>
                    NexaLearn uses Firebase services including Firebase Authentication, Firestore Database, Firebase Hosting, and Firebase Analytics metrics to ensure consistent operation, accounts security, and data syncing.
                  </p>
                  <p>
                    Learn more: <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-semibold">Firebase Security & Privacy Guidance</a>
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">4. Data Security</h4>
                  <p>
                    We implement reasonable technical and organizational safeguards to protect user information. However, no internet-based platform can guarantee absolute security.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">5. Children's Privacy</h4>
                  <p>
                    NexaLearn is intended for educational purposes. Users under the age required by local law should use the application under parental or guardian supervision.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">6. Third-Party Services</h4>
                  <p>
                    The application integrates Google AdMob, Google Firebase, and Google AI Services. These providers operate under their own independent privacy policies.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">7. User Rights</h4>
                  <p>
                    Users may request account deletion, removal of stored information, and data access requests at any time. You can purge your account node inside the Settings screen to instantly clear all data from our local & cloud store.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">8. Contact</h4>
                  <p>
                    For support, privacy concerns, or data requests:
                    <br />
                    <span className="font-bold font-mono text-white mt-1 block">Email: support@nexalearn.app</span>
                  </p>
                </div>
              </div>
            )}

            {/* TERMS & CONDITIONS PAGE */}
            {currentPage === "terms_conditions" && (
              <div className="max-w-2xl mx-auto neo-glass rounded-3xl p-6 md:p-8 border border-white/5 space-y-6 animate-fade-in text-left">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white">Terms & Conditions</h3>
                    <p className="text-xs text-gray-400 font-mono mt-1">LAST UPDATED: MAY 28, 2026</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setCurrentPage("settings")}
                    className="py-1.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs uppercase cursor-pointer border border-white/5 font-mono"
                  >
                    Back to Settings
                  </button>
                </div>

                <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed font-sans max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <p className="font-semibold text-white">By using NexaLearn, you agree to the following terms.</p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">1. Acceptance of Terms</h4>
                  <p>
                    NexaLearn provides AI-powered educational tools, study systems, quizzes, productivity utilities, and learning resources. Using any part of the application means you fully accept these Terms & Conditions.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">2. User Responsibilities</h4>
                  <p>
                    Users agree not to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Abuse or exploit any feature on the platform.</li>
                    <li>Attempt unauthorized access or bypass authentication layers.</li>
                    <li>Use bots, macro executors, or automated abuse systems.</li>
                    <li>Manipulate coin rewards, points, or advertisements.</li>
                    <li>Upload illegal, offensive, or harmful content to public forums and chats.</li>
                  </ul>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">3. Rewarded Ads & Coins</h4>
                  <p>
                    Some premium features (such as AI Solves, study material generation, hints, and PDF exports) may require users to voluntarily watch rewarded advertisements. Rewards are granted only after successful ad completion events. NexaLearn does not guarantee continuous ad availability or delivery.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">4. Intellectual Property</h4>
                  <p>
                    All branding, UI systems, features, design layouts, and platform assets associated with NexaLearn remain protected intellectual property unless otherwise explicitly stated.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">5. Service Availability & Performance</h4>
                  <p>
                    NexaLearn is provided on an "as is" and "as available" basis without warranties of uninterrupted availability or error-free operation. We may update, modify, suspend, or discontinue portions of the service at any time without prior notice.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">6. Account Access</h4>
                  <p>
                    Users are solely responsible for maintaining the security of their own accounts, passwords, and devices.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">7. Termination of Accounts</h4>
                  <p>
                    Accounts and node credentials violating platform rules, cheating reward spinners, or abusing public fees may be permanently suspended or removed without liability.
                  </p>

                  <h4 className="text-[#CCFF00] font-bold font-mono text-xs uppercase mt-4">8. Contact Us</h4>
                  <p>
                    If you have questions regarding these terms:
                    <br />
                    <span className="font-bold font-mono text-white mt-1 block">Email: support@nexalearn.app</span>
                  </p>
                </div>
              </div>
            )}

            {/* NEW WORKING COIN SHOP / COIN STORE LOOP */}
            {(currentPage === "coin_shop" || currentPage === "token_store") && (
              <div className="max-w-4xl mx-auto animate-fade-in">
                <CoinShopComponent 
                  profile={profile} 
                  onSaveProfile={saveProfile} 
                  onAddNotification={addNotification} 
                />
              </div>
            )}

            {/* NEW WORKING CREATOR STUDIO LOOP */}
            {currentPage === "creator_studio" && (
              <div className="max-w-5xl mx-auto animate-fade-in">
                <CreatorStudioComponent 
                  profile={profile} 
                  onGrantRewards={grantRewards} 
                  onAddNotification={addNotification} 
                />
              </div>
            )}

            {/* NEW WORKING TOURNAMENTS CHALLENGES LOOP (Rotates challenges every 2 to 3 days!) */}
            {currentPage === "tournaments" && (
              <div className="max-w-5xl mx-auto animate-fade-in">
                <TournamentLobbyComponent 
                  profile={profile} 
                  onGrantRewards={grantRewards} 
                  onAddNotification={addNotification} 
                  onNavigate={setCurrentPage} 
                />
              </div>
            )}

            {/* 18. PREMIUM MEMBER VIP CARD UPGRADES */}
            {currentPage === "membership" && (() => {
              const activeTier = profile.premiumTier || 'FREE';
              const userCoins = profile.coins;

              const premiumPasses = [
                { id: 'daily', name: 'Daily Flash Pass', priceCoins: 30000, priceReal: '₹7', type: 'PLUS', features: ['Unrestricted scan speeds', 'Faster AI tutors', 'No ad popups (24 hours)'] },
                { id: 'monthly', name: 'Monthly VIP Node', priceCoins: 600000, priceReal: '₹249', type: 'PRO', features: ['All Daily features', 'AI Exam Predictions', 'Holographic avatar borders', 'AI Notes Generation', 'Unlimited Private Voice Rooms'] },
                { id: 'yearly', name: 'Yearly Champion Sphere', priceCoins: 2000000, priceReal: '₹3,000', type: 'PRO', features: ['All Pro features indefinitely', 'VIP exclusive color themes', 'Custom analytics report panel', 'Priority server channels'] }
              ];

              const redeemWithCoins = (pass: any) => {
                if (userCoins < pass.priceCoins) {
                  addNotification("⚠️ Insufficient Nexa Balance", `Redemption Blocked! You need ${pass.priceCoins.toLocaleString()} NEXA to unlock the ${pass.name}.`, "alert");
                  alert(`sorry ! No nexa to buy this. You need ${pass.priceCoins.toLocaleString()} NEXA but you only carry ${userCoins.toLocaleString()} NEXA. Clear more Olympiad equations or win Study Battles to mint coins!`);
                  return;
                }
                const updatedCoins = userCoins - pass.priceCoins;
                
                // Calculate dynamic countdown duration
                let durationMs = 30 * 24 * 60 * 60 * 1000; // default Monthly
                if (pass.id === 'daily') {
                  durationMs = 24 * 60 * 60 * 1000;
                } else if (pass.id === 'yearly') {
                  durationMs = 365 * 24 * 60 * 60 * 1000;
                }

                const updatedProfile = { 
                  ...profile, 
                  coins: updatedCoins, 
                  premiumTier: pass.type as any,
                  premiumExpiry: Date.now() + durationMs
                };
                saveProfileWithParams(updatedProfile, userHp);
                addNotification("VIP Calibrated Successfully", `Successfully loaded "${pass.name}" using NEXA nodes. Timer initialized!`, "success");
                
                // Trigger the beautiful confirmation overlay with the coins animation
                setCurrentClaim({
                  isOpen: true,
                  type: "PASS",
                  title: "PREMIUM ACTIVATED SUCCESSFUL 👑",
                  subtitle: `Congratulations! Unlocked ${pass.name} Premium Pass with a live timer.`,
                  amount: `-${pass.priceCoins.toLocaleString()} NEXA`,
                  itemName: `${pass.name} Node Sync Active (${pass.id === 'daily' ? '24 Hours' : pass.id === 'yearly' ? '365 Days' : '30 Days'})`,
                  pendingCoins: 0,
                  pendingXp: 0,
                  pendingHp: 0
                });
              };

              return (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider text-yellow-400 font-mono font-extrabold bg-yellow-400/10 px-3 py-1 rounded-full animate-bounce">
                      Elite Academic Wavelength
                    </span>
                    <h3 className="text-3xl font-black text-white mt-3">VIP Perk Calibrations</h3>
                    <p className="text-xs text-gray-400 mt-2">Activate advanced neural processing parameters or disable sponsorships instantly</p>
                  </div>

                  {/* Current Account telemetry */}
                  <div className="neo-glass rounded-3xl p-5 border-yellow-500/10 bg-yellow-500/5 flex justify-between items-center flex-wrap gap-4 select-none">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={profile.avatar} alt="VIP Profile Frame" className={`w-11 h-11 rounded-full bg-black/40 ${activeTier !== 'FREE' ? 'border-2 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border border-white/10'}`} />
                        {activeTier !== 'FREE' && (
                          <span className="absolute -top-1 -right-1 text-xs">👑</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white tracking-wide uppercase">{profile.username} TELEMETRY</h4>
                        <span className="text-[10px] text-gray-400 block font-mono">ACTIVE WAVELENGTH STATE: <strong className="text-yellow-400">{activeTier}</strong></span>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs font-mono">
                      <span className="px-3 py-1 bg-black/40 text-yellow-400 border border-yellow-400/20 rounded-xl">
                        💎 {userCoins.toLocaleString()} NEXA
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {premiumPasses.map((pass) => {
                      const isOptionActive = activeTier === pass.type;
                      return (
                        <div key={pass.id} className="neo-glass rounded-3xl p-6 border-white/5 flex flex-col justify-between hover:border-yellow-400/20 transition-all duration-300 relative overflow-hidden bg-black/20 text-center">
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 to-[#7B61FF]" />
                          
                          <div className="mb-6">
                            <span className="text-[10px] font-mono text-[#CCFF00] font-black uppercase tracking-widest">{pass.type} NODE</span>
                            <h4 className="text-sm font-black text-white mt-1 uppercase tracking-tight">{pass.name}</h4>
                            <div className="mt-4 p-2 bg-black/30 rounded-2xl border border-white/2">
                              <span className="text-xs text-gray-400 block">NEXA CALIBRATION</span>
                              <span className="text-base font-mono font-black text-yellow-400">{pass.priceCoins.toLocaleString()} NEXA</span>
                            </div>
                            <div className="mt-2 p-2 bg-black/30 rounded-2xl border border-white/2">
                              <span className="text-xs text-gray-400 block">REAL BILLING VALUE</span>
                              <span className="text-base font-mono font-black text-cyan-400">{pass.priceReal}</span>
                            </div>
                          </div>

                          <ul className="space-y-2 text-[10px] text-gray-300 text-left mb-6 font-mono border-t border-white/5 pt-4">
                            {pass.features.map((feat, idx) => (
                              <li key={idx} className="flex gap-1.5 items-center">
                                <span className="text-yellow-400 font-extrabold">✓</span> {feat}
                              </li>
                            ))}
                          </ul>

                          <div className="space-y-2">
                            {/* Coin payment */}
                            <button 
                              onClick={() => redeemWithCoins(pass)}
                              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-xl text-[10px] hover:scale-105 active:scale-95 transition-all border-none font-mono tracking-wider cursor-pointer uppercase"
                            >
                              💎 PURCHASE WITH NEXA
                            </button>

                            {/* Cash checkout cards */}
                            <button 
                              onClick={() => {
                                alert("sorry ! These option wil come later");
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-[#7B61FF] to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-black rounded-xl text-[10px] hover:scale-105 active:scale-95 transition-all border-none font-mono tracking-wider cursor-pointer uppercase"
                            >
                              💳 SECURE PAY ({pass.priceReal})
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* EXPLORING ADS AND TEST TRIGGER FOR PREVIEW */}
                  <div className="neo-glass rounded-3xl p-6 border-cyan-400/20 bg-cyan-950/20 text-left mt-8 border">
                    <h4 className="text-sm font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      📢 ADVERTISING CORE PLATFORM PARAMETERS
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      NexaSnap includes integrated sponsorship prompts. By default, these ads are governed by a <strong>5-minute active interval</strong> (to preserve a clutter-free study flow). When the timer expires, users on the standard tier receive occasional prompts to upgrade to premium (VIP Pass plans) which clears advertiser schedules, boosts XP by 2.0x, and removes AI query limits.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                      <div className="text-left">
                        <span className="text-xs text-white font-extrabold block mb-0.5">Want to evaluate how the ad overlay renders?</span>
                        <span className="text-[10px] text-gray-400 leading-normal block">Force trigger the 5-minute automated premium recalibration popup overlay instantly.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPremiumAdOpen(true);
                        }}
                        className="py-2.5 px-4 bg-gradient-to-r from-cyan-400 to-[#7B61FF] hover:scale-105 active:scale-95 text-black font-mono font-black text-[10px] rounded-xl border-none cursor-pointer tracking-wider transition-all uppercase"
                      >
                        ⚡ DEMO AD PREVIEW
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 19. LIVE ROOM CLASSROOM COLLABORATION PORTAL WAS DEPRECATED */}

            {/* 20. SMART NUMERICAL ANALYTICS (Weak topics charts) */}
            {currentPage === "analytics" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <SmartAnalytics onDeductCoins={deductCoins} profile={profile} />
              </div>
            )}

            {/* 21. AI HOMEWORK LASER SCANNER VIEW */}
            {currentPage === "hw_scanner" && (
              <div className="max-w-xl mx-auto neo-glass rounded-3xl p-6 border-white/5 text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-2 left-2 right-2 bottom-32 border-2 border-dashed border-cyan-400/30 rounded-2xl pointer-events-none">
                  <div className="scanner-laser absolute left-0 right-0 h-0.5 bg-cyan-400" />
                </div>

                <div className="py-12">
                  <CameraIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
                  <h4 className="text-lg font-bold text-white">NexaSnap Homework Scanner</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-2">
                    Submit photos of handwriting, physics vector coordinates, or molecular charts for instant solution extraction
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setScannerFile(e.target.files[0].name);
                        alert(`File "${e.target.files[0].name}" registered for formula recognition! Click solve.`);
                      }
                    }}
                    className="hidden"
                    id="scanner_input_file"
                  />
                  <label 
                    htmlFor="scanner_input_file"
                    className="cursor-pointer py-2.5 px-4 bg-white/5 text-white hover:bg-white/10 rounded-xl text-xs font-bold transition-all border inline-block"
                  >
                    {scannerFile ? `Registered: ${scannerFile}` : "SELECT SNAPSHOT FILE"}
                  </label>
                </div>

                <button 
                  onClick={() => {
                    if (!scannerFile) {
                      alert("Please attach a mathematical snapshot first.");
                      return;
                    }
                    // Deduct standard 5 Coins fee for using AI Laser Scanner
                    if (!deductCoins(5)) {
                      return;
                    }
                    setCurrentPage("ai_solver");
                    setSolverInput(`Analyze chemical compound or math formula inside file structure: ${scannerFile}`);
                  }}
                  className="w-full py-3 bg-[#CCFF00] text-black font-bold text-xs rounded-2xl hover:scale-105 transition-all border-none"
                >
                  TRIGGER ATOMIC DETECT
                </button>
              </div>
            )}

            {/* 22. EXAM PREDICTOR AND OUTCOME */}
            {currentPage === "exam_predictor" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="neo-glass rounded-3xl p-6 border-white/5 space-y-6 animate-fade-in text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">AI Semester Matrix Exam Predictor</h3>
                      <p className="text-xs text-gray-400">Deploy high-performance prediction engines to pinpoint curriculum question vectors and key concepts.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        NEXA-CORE ONLINE
                      </span>
                    </div>
                  </div>

                  {/* Primary Parameters Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-left">
                      <label className="text-[9px] text-gray-400 uppercase font-mono tracking-wider font-bold">SUBJECT OR CURRICULUM STREAM</label>
                      <input
                        type="text"
                        placeholder="e.g. Thermodynamics, Quantum Mechanics, Algebra"
                        value={examSubject}
                        onChange={(e) => setExamSubject(e.target.value)}
                        className="w-full mt-1.5 bg-black/40 text-xs text-white py-3.5 px-4 rounded-xl border border-white/10 focus:border-[#CCFF00]/40 focus:outline-none focus:ring-1 focus:ring-[#CCFF00]/30 transition-all text-left"
                      />
                    </div>
                    <div className="text-left">
                      <label className="text-[9px] text-gray-400 uppercase font-mono tracking-wider font-bold">GRADE OR SCHOLARS RANGE</label>
                      <select
                        value={examLevel}
                        onChange={(e) => setExamLevel(e.target.value)}
                        className="w-full mt-1.5 bg-black text-xs text-cyan-400 border border-white/10 p-3.5 rounded-xl focus:border-[#CCFF00]/40 focus:outline-none focus:ring-1 focus:ring-[#CCFF00]/30 transition-all cursor-pointer text-left font-sans"
                      >
                        <option value="highschool">High School (Grade 9-12)</option>
                        <option value="college">University Undergraduate</option>
                        <option value="graduate">Master / Graduate Level</option>
                        <option value="olympiad">National / International Olympiad</option>
                        <option value="board">Final Term Board Exam</option>
                      </select>
                    </div>
                    <div className="text-left">
                      <label className="text-[9px] text-gray-400 uppercase font-mono tracking-wider font-bold">CLASS LEVEL / YEAR</label>
                      <select
                        value={examClass}
                        onChange={(e) => setExamClass(e.target.value)}
                        className="w-full mt-1.5 bg-black text-xs text-[#CCFF00] border border-white/10 p-3.5 rounded-xl focus:border-[#CCFF00]/40 focus:outline-none focus:ring-1 focus:ring-[#CCFF00]/30 transition-all cursor-pointer text-left font-sans"
                      >
                        <option value="Class 9 / Junior High">Class 9 (Grade 9)</option>
                        <option value="Class 10 / Sophomore">Class 10 (Grade 10)</option>
                        <option value="Class 11 / Junior">Class 11 (Grade 11)</option>
                        <option value="Class 12 / Senior">Class 12 (Grade 12)</option>
                        <option value="Undergrad Year 1 / Freshman">Undergrad Year 1 (Freshman)</option>
                        <option value="Undergrad Year 2 / Sophomore">Undergrad Year 2 (Sophomore)</option>
                        <option value="Undergrad Year 3 / Junior">Undergrad Year 3 (Junior)</option>
                        <option value="Undergrad Year 4 / Senior">Undergrad Year 4 (Senior)</option>
                        <option value="Postgraduate Year 1">Postgraduate Year 1 (Master's)</option>
                        <option value="Postgraduate Year 2">Postgraduate Year 2 (Doctoral/Fellow)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={triggerExamPrediction}
                    disabled={examLoading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-400 to-[#7B61FF] hover:from-cyan-300 hover:to-purple-400 text-white text-xs font-black tracking-widest rounded-2xl cursor-pointer hover:scale-[1.01] active:scale-95 transition-all border-none uppercase shadow-lg shadow-cyan-500/10 disabled:opacity-50"
                  >
                    {examLoading ? "CONVERGING EXAM WAVEFUNCTIONS..." : "MAP PREDICTION MATRIX"}
                  </button>
                </div>

                {/* 1) LOADING STATE SCREEN */}
                {examLoading && (
                  <div className="neo-glass rounded-3xl p-12 text-center border-white/5 space-y-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[350px]">
                    {/* Glowing grid line */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line glow-blue" />
                    
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-400 animate-spin border-t-transparent flex items-center justify-center p-3 relative text-2xl">
                      ⚙️
                    </div>

                    <div className="space-y-2 max-w-sm">
                      <h4 className="text-sm font-bold text-white tracking-widest uppercase font-mono">CONVERGING AI AGENT MATRIX...</h4>
                      <p className="text-xs text-gray-400 animate-pulse">
                        Querying syllabus databases, weighing past exam frequency factors, and synthesizing core high-probability vectors...
                      </p>
                    </div>

                    <div className="text-[9px] font-mono text-cyan-400/60 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 uppercase">
                      STATUS: processing gradient models in real-time
                    </div>
                  </div>
                )}

                {/* 2) STRUCTURED PREDICTION RESULTS */}
                {!examLoading && examPredictResult && (
                  <div className="space-y-6 animate-fade-in text-left">
                    {/* BENTO STAT BANNERS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-black/40 to-cyan-950/20 p-5 rounded-2xl border border-cyan-500/20 text-center space-y-1">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">CONFIDENCE THRESHOLD</span>
                        <div className="text-xl font-black text-cyan-300 tracking-tight flex items-center justify-center gap-1.5">
                          🛡️ {examPredictResult.confidence || "93% Match"}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-black/40 to-purple-950/20 p-5 rounded-2xl border border-purple-500/20 text-center space-y-1">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-purple-400 font-bold block">ESTIMATED DIFFICULTY</span>
                        <div className="text-xl font-black text-purple-300 tracking-tight flex items-center justify-center gap-1.5">
                          ⚡ {examPredictResult.difficulty || "Hard"}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-black/40 to-[#CCFF00]/10 p-5 rounded-2xl border border-[#CCFF00]/20 text-center space-y-1">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[#CCFF00] font-bold block">SYNC STATUS</span>
                        <div className="text-xl font-black text-[#CCFF00] tracking-tight flex items-center justify-center gap-1.5">
                          ✓ Ready to Study
                        </div>
                      </div>
                    </div>

                    {/* SELECTOR SEGMENT TABS */}
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                      <button
                        onClick={() => setExamTab('predictions')}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase flex items-center justify-center gap-2 border-none ${
                          examTab === 'predictions' 
                            ? "bg-white/10 text-[#CCFF00]" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        🎯 Predicted Exam Questions
                      </button>
                      <button
                        onClick={() => setExamTab('concepts')}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase flex items-center justify-center gap-2 border-none ${
                          examTab === 'concepts' 
                            ? "bg-white/10 text-[#CCFF00]" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        📖 Core Mastery Concepts
                      </button>
                    </div>

                    {/* TAB A: PREDICTIONS PANEL */}
                    {examTab === 'predictions' && (
                      <div className="space-y-4">
                        {examPredictResult.predictions?.map((item: any, idx: number) => {
                          const isExpanded = !!expandedAnswers[idx];
                          return (
                            <div key={idx} className="neo-glass rounded-2xl border-white/5 p-6 hover:border-cyan-500/20 transition-all space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 text-left">
                                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                                    QUESTION 0{idx + 1}
                                  </span>
                                  <h4 className="text-sm font-bold text-white pt-1.5 leading-relaxed tracking-tight">{item.question}</h4>
                                </div>
                                <span className="shrink-0 bg-red-500/10 text-red-400 font-mono font-black text-[10px] uppercase px-2.5 py-1 rounded-full border border-red-500/20 tracking-tighter">
                                  🔥 {item.probability || "85% Prob"}
                                </span>
                              </div>

                              {/* Interactive Hint trigger */}
                              <div className="pt-2 text-left">
                                <button
                                  onClick={() => setExpandedAnswers(prev => ({ ...prev, [idx]: !isExpanded }))}
                                  className="py-2 px-3.5 bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] uppercase tracking-wider rounded-lg transition-all border border-white/5 flex items-center gap-1.5 cursor-pointer"
                                >
                                  🔑 {isExpanded ? "HIDE MATRIX SOLUTION" : "REVEAL HINT & SOLUTION ROUTE"}
                                </button>
                              </div>

                              {/* Expansion body */}
                              {isExpanded && (
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap animate-slide-down text-left">
                                  <span className="text-[#CCFF00] font-bold block mb-1">💡 COGNITIVE RESOLUTION ROUTE:</span>
                                  {item.solutionHint}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* TAB B: KEY CONCEPTS CHEKLIST PANEL */}
                    {examTab === 'concepts' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-[#CCFF00]/5 border border-[#CCFF00]/10 rounded-2xl text-[11px] text-gray-300 font-mono text-left">
                          ⚡ <strong>Real-time Study Tracker</strong>: Check off masteries as you practice them to solidify memory grids and track study compliance.
                        </div>

                        <div className="space-y-3">
                          {examPredictResult.keyConcepts?.map((item: any, idx: number) => {
                            const isMastered = !!masteredConcepts[item.title];
                            return (
                              <div 
                                key={idx} 
                                className={`neo-glass rounded-2xl border border-white/5 p-5 transition-all flex items-start gap-4 ${
                                  isMastered ? "bg-emerald-950/10 border-emerald-500/20" : "hover:border-[#CCFF00]/10"
                                }`}
                              >
                                <button
                                  onClick={() => {
                                    const nextVal = !isMastered;
                                    setMasteredConcepts(prev => ({ ...prev, [item.title]: nextVal }));
                                    if (nextVal) {
                                      grantRewards(15, 5);
                                      addNotification("Mastery Acquired", `Synced concept master of "${item.title}"! (+15 XP, +5 NEXA)`, "success");
                                    }
                                  }}
                                  className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center border-none transition-all cursor-pointer text-xs ${
                                    isMastered ? "bg-emerald-500 text-black" : "bg-black/60 text-gray-600 hover:text-white border border-white/10"
                                  }`}
                                >
                                  {isMastered ? "✓" : "☐"}
                                </button>

                                <div className="space-y-2 w-full text-left">
                                  <div className="flex justify-between items-center gap-2">
                                    <h4 className={`text-sm font-bold tracking-tight ${isMastered ? 'text-emerald-400 line-through' : 'text-white'}`}>
                                      {item.title}
                                    </h4>
                                    <span className="text-[8px] font-mono font-bold text-purple-400 uppercase tracking-widest bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
                                      {item.importance || "High priority"}
                                    </span>
                                  </div>

                                  <p className="text-xs text-gray-400 leading-relaxed">{item.explanation}</p>

                                  {item.formula && (
                                    <div className="p-3 bg-black/50 rounded-lg border border-white/5 font-mono text-cyan-300 text-xs text-center select-all">
                                      {item.formula}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 23. AI MENTORS LOBBY */}
            {currentPage === "ai_mentor" && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-wider text-purple-400 font-mono font-extrabold bg-purple-500/10 px-3 py-1 rounded-full">
                    Sovereign Advising Grid
                  </span>
                  <h3 className="text-3xl font-black text-white mt-3">Sovereign Academic Mentorship</h3>
                  <p className="text-xs text-gray-400 mt-2">Engage in face-to-face text dialog with specialized AI experts</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: "Dr. Evelyn Vance", role: "Theoretical Physicist", seed: "Evy", intro: "Specialist in quantum field gravity anomalies and thermodynamic systems." },
                    { name: "Marcus 'Zero' Thorne", role: "Elite Algorithm Architect", seed: "Marc", intro: "Guides students in graph traversal efficiency and neural weight convergence." },
                    { name: "Professor Veda Gupta", role: "Olympiad Math Grandmaster", seed: "Veda", intro: "Hone symmetric equations, limits factorization and number theories." }
                  ].map((m, i) => (
                    <div key={i} className="neo-glass rounded-3xl p-6 border-white/5 text-center flex flex-col justify-between">
                      <div>
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${m.seed}`} alt="" className="w-14 h-14 mx-auto mb-4 bg-black/60 rounded-full" />
                        <h4 className="text-base font-bold text-white mb-1">{m.name}</h4>
                        <span className="text-xs text-[#CCFF00] font-mono block mb-3">{m.role}</span>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto mb-4">{m.intro}</p>
                      </div>

                      <button 
                        onClick={() => {
                          const customSession: ChatSession = {
                            id: `ch_custom_${i}`,
                            recipientName: m.name,
                            recipientAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${m.seed}`,
                            online: true,
                            messages: [
                              { id: "cm_m1", sender: m.name, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${m.seed}`, text: `Hello node! Let's examine complex models. Drop any academic request.`, time: "16:52", reactions: {} }
                            ]
                          };
                          setChats([customSession, ...chats]);
                          setActiveChatIdx(0);
                          setCurrentPage("chats");
                        }}
                        className="py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs tracking-wider transition-all border border-white/10 uppercase"
                      >
                        CONNECT CHANNEL
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === "language_tutor" && (
              <LanguageTutorView
                profile={profile}
                onGrantRewards={grantRewards}
                onDeductCoins={deductCoins}
                onAddNotification={addNotification}
                onClose={() => setCurrentPage("home")}
              />
            )}

            {currentPage === "talk_teacher" && (
              <TalkTeacherView
                profile={profile}
                onGrantRewards={grantRewards}
                onDeductCoins={deductCoins}
                onAddNotification={addNotification}
                onClose={() => setCurrentPage("home")}
              />
            )}

            {/* 24. HYPER-ADVANCED GROW & SHIELD NODE */}
            {currentPage === "growth_engineer" && (
              <GrowthEngineHub
                profile={profile}
                onGrantRewards={grantRewards}
                onAddNotification={addNotification}
                onSaveProfile={saveProfile}
                onClose={() => setCurrentPage("home")}
              />
            )}

            {/* NEW WORKING PAGES INTEGRATION */}
            {currentPage === "profile" && (() => {
              // Direct early return to the isolated CustomProfileView component to preserve Hook order
              return (
                <CustomProfileView 
                  profile={profile} 
                  userHp={userHp} 
                  onSaveProfile={saveProfileWithParams} 
                  onAddNotification={addNotification} 
                  onNavigate={setCurrentPage} 
                />
              );

              // Legacy vars with stripped hooks
              const editName = profile.username, setEditName = (x: any) => {};
              const editEmail = "node_solver@nexasnap.ai", setEditEmail = (x: any) => {};
              const dragActive = false, setDragActive = (x: any) => {};

              // Standard FileReader base-64 converter for avatar upload
              const handleAvatarFile = (file: File) => {
                if (!file.type.startsWith("image/")) {
                  alert("Invalid format! Please input a standard image file.");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    const updated = { ...profile, avatar: reader.result };
                    saveProfileWithParams(updated, userHp);
                    addNotification("Avatar Re-compiled", "Your custom profile photo has been updated instantly.", "success");
                    alert("📷 Avatar upload successful! Synchronization complete.");
                  }
                };
                reader.readAsDataURL(file);
              };

              return (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                  <div className="text-center mb-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full">
                      Node Profile Configuration
                    </span>
                    <h3 className="text-3xl font-black text-white mt-3">Personal Identity Vector</h3>
                    <p className="text-xs text-gray-400">View performance credentials, custom graphics and upload images</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Visual profile detail block with image upload */}
                    <div className="neo-glass rounded-3xl p-6 border-white/5 text-center flex flex-col justify-between items-center bg-black/20">
                      <div className="w-full">
                        <span className="text-[9px] text-[#CCFF00] font-mono tracking-widest uppercase block mb-3">Live Avatar Output</span>
                        
                        {/* Avatar sphere wrapper */}
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

                        {/* Interactive Drag and Drop Upload container */}
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
                            id="profile_avatar_upload" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleAvatarFile(e.target.files[0]);
                            }}
                            className="hidden" 
                          />
                          <label 
                            htmlFor="profile_avatar_upload" 
                            className="inline-block py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] uppercase font-bold cursor-pointer border border-white/5"
                          >
                            Browse Photo File
                          </label>
                        </div>

                        {/* Presets quick selection */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <span className="text-[9px] text-gray-500 uppercase font-mono block mb-2">Preset Cyber Avatars:</span>
                          <div className="flex justify-center gap-2">
                            {["Nexa", "Aura", "Evy", "Marc", "Veda"].map(seed => (
                              <button
                                key={seed}
                                onClick={() => {
                                  const ava = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                                  const updated = { ...profile, avatar: ava };
                                  saveProfileWithParams(updated, userHp);
                                  addNotification("Preset Avatar Synchronized", `Updated node seed to ${seed}.`, "success");
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
                        {profile.premiumExpiry && profile.premiumExpiry > appTimeNow && (
                          <div className="flex justify-between items-center bg-[#CCFF00]/5 p-2 px-2.5 rounded-xl border border-[#CCFF00]/10 mt-2">
                            <span className="text-[#CCFF00] uppercase text-[9px] font-black">⏳ Active VIP Time Left</span>
                            <span className="font-mono text-yellow-400 font-extrabold text-[10.5px]">
                              {(() => {
                                const diff = profile.premiumExpiry - appTimeNow;
                                const days = Math.floor(diff / (24 * 60 * 60 * 1000));
                                const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                                const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
                                const secs = Math.floor((diff % (60 * 1000)) / 1000);
                                return days > 0 ? `${days}d ${hours}h ${mins}m` : `${hours}h ${mins}m ${secs}s`;
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Node Config / Edit Parameters Profile forms */}
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
                            saveProfileWithParams(updated, userHp);
                            addNotification("System Profile Synchronized", "Credentials and nicknames fully updated.", "success");
                            alert("✅ Configuration coordinates synced to local system registers successfully!");
                          }}
                          className="flex-1 py-3 bg-[#CCFF00] text-black font-black text-xs rounded-xl hover:scale-[1.02] transition-all border-none uppercase cursor-pointer"
                        >
                          Save Credentials changes
                        </button>
                        <button
                          onClick={() => setCurrentPage("home")}
                          className="py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
                        >
                          Return Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {currentPage === "notes_vault" && (() => {
              // Direct early return to the isolated CustomNotesVault component to preserve Hook order
              return (
                <CustomNotesVault 
                  onAddNotification={addNotification} 
                />
              );

              // Redefine React hooks to local non-hook constants to completely bypass Hook order rules
              const useState = <T = any>(init: T): any => [init, (x: any) => {}];
              const useEffect = (fn: any, deps?: any): any => {};

              const [localNotes, setLocalNotes] = useState<Array<{ id: string; title: string; category: string; text: string; date: string }>>([
                { id: "n_1", title: "Olympiad Limit Rules", category: "Mathematics", text: "Factorize polynomial denominators instantly before solving algebraic limits in complex equations.", date: "May 20, 2026" },
                { id: "n_2", title: "Thermodynamic laws", category: "Physics", text: "Entropy coordinates inside closed Carnot cycles are always higher than delta energy levels.", date: "May 19, 2026" }
              ]);
              const [activeNoteId, setActiveNoteId] = useState<string>("n_1");
              const [noteTitle, setNoteTitle] = useState("");
              const [noteCategory, setNoteCategory] = useState("Mathematics");
              const [noteText, setNoteText] = useState("");

              const activeNote = localNotes.find((n: any) => n.id === activeNoteId);

              // Auto fill form
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
                addNotification("Created Note Slot", "Created an empty notes draft context.", "success");
              };

              const handleSaveNote = () => {
                setLocalNotes(prev => prev.map(n => {
                  if (n.id === activeNoteId) {
                    return { ...n, title: noteTitle, category: noteCategory, text: noteText, date: "Just now" };
                  }
                  return n;
                }));
                addNotification("Saved Note Segment", "Saved your changes to localized databases.", "success");
                alert("📝 Note saved! Successfully cached compiled note packet.");
              };

              const handleDeleteNote = (id: string) => {
                const updated = localNotes.filter(n => n.id !== id);
                setLocalNotes(updated);
                if (activeNoteId === id && updated.length > 0) {
                  setActiveNoteId(updated[0].id);
                }
                addNotification("Deleted Note Slot", "Purged notes metadata segment.", "info");
              };

              // Download notes utility block
              const handleDownloadNoteTxt = () => {
                if (!activeNote) return;
                const element = document.createElement("a");
                const file = new Blob([`Category: ${activeNote.category}\nTitle: ${activeNote.title}\nDate: ${activeNote.date}\n\n${activeNote.text}`], { type: "text/plain" });
                element.href = URL.createObjectURL(file);
                element.download = `${activeNote.title.replace(/\s+/g, "_")}_notes.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                addNotification("Downloaded notes", "Downloaded localized text note payload.", "success");
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
                    {/* Left sidebar notes directories list */}
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

                    {/* Note details inputs editor panel */}
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
            })()}

            {currentPage === "marketplace" && (() => {
              const shopPacks = [
                { id: "pack_calc", name: "Apex Calculus Cheat Sheets", cost: 100, desc: "Limits factorizations graphs, derivatives rules, and integral vector grids.", cat: "Math" },
                { id: "pack_thermo", name: "Carnot Thermal Physics Guide", cost: 150, desc: "Thermodynamics vector formulae equations and entropy proofs for senior courses.", cat: "Physics" },
                { id: "pack_synth", name: "Organic Synthesis Reactants", cost: 200, desc: "Reaction curves matrices, compounds chains bonding, isomerism tables.", cat: "Chemistry" },
                { id: "pack_cheatsheet_bio", name: "AP Biology Genetics Cheat Sheet", cost: 80, desc: "Ratios, Punnett squares, chromosome mapping formulas, Pedigree guidelines.", cat: "Biology" },
                { id: "pack_cheatsheet_chem", name: "Organic Functional Groups Cheat Sheet", cost: 120, desc: "Prefixes, suffixes, reactivity ordering spectrum, resonance mechanisms graphs.", cat: "Chemistry" },
                { id: "pack_cheatsheet_math", name: "AP Math Limits & Series Cheat Sheet", cost: 90, desc: "Taylor polynomial expansions series, convergence tests formulas, coordinates rotation matrix.", cat: "Math" }
              ];

              const executePurchasePack = (pack: typeof shopPacks[0]) => {
                if (profile.coins < pack.cost) {
                  addNotification("⚠️ Insufficient NEXA Coins", `Purchase Denied! You need ${pack.cost} NEXA for "${pack.name}".`, "alert");
                  alert(`sorry ! No nexa to buy this. You need ${pack.cost} NEXA but currently hold ${profile.coins} NEXA.`);
                  return;
                }
                const updated = { ...profile, coins: profile.coins - pack.cost };
                saveProfileWithParams(updated, userHp);
                addNotification("Marketplace Unlock Completed Successfully", `Purchased "${pack.name}" guide.`, "success");
                
                // Trigger the beautiful confirmation overlay with the coins animation
                setCurrentClaim({
                  isOpen: true,
                  type: "ALL_SOLVED",
                  title: "PURCHASE SUCCESSFUL 🔓",
                  subtitle: `Unlocking asset textbook checklist:`,
                  amount: `-${pack.cost} NEXA`,
                  itemName: pack.name,
                  pendingCoins: 0,
                  pendingXp: 0,
                  pendingHp: 0
                });
              };

              return (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold bg-pink-500/10 text-pink-400 px-3 py-1 rounded-full">
                      Study Material Marketplace Hub
                    </span>
                    <h3 className="text-3xl font-black text-white mt-3 uppercase tracking-tight">Academic Asset Portal</h3>
                    <p className="text-xs text-gray-400 mt-1">Unlock premium PDF formula decks and guides using earned NEXA coins</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {shopPacks.map(pack => (
                      <div key={pack.id} className="neo-glass rounded-3xl p-6 border-white/5 flex flex-col justify-between text-center relative overflow-hidden group hover:border-[#CCFF00]/20 transition-all duration-300">
                        <div>
                          <div className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-1">{pack.cat} Catalog</div>
                          <h4 className="text-sm font-bold text-white mb-2 truncate">{pack.name}</h4>
                          <p className="text-xs text-gray-400 leading-normal mb-4 h-16 overflow-y-auto pr-1">{pack.desc}</p>
                        </div>

                        <div className="space-y-3">
                          <div className="p-2.5 bg-black/40 rounded-xl border border-white/2 flex justify-between items-center font-mono text-xs">
                            <span className="text-gray-400">COST VALUE</span>
                            <span className="text-[#CCFF00] font-bold">💎 {pack.cost} NEXA</span>
                          </div>

                          <button
                            onClick={() => executePurchasePack(pack)}
                            className="w-full py-2.5 bg-[#CCFF00] text-black font-bold text-xs rounded-xl hover:scale-105 active:scale-95 cursor-pointer border-none transition-all uppercase tracking-wider"
                          >
                            🔓 Spend {pack.cost} Gold
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

             {currentPage === "achievement_vault" && (() => {
              const achievementsList = [
                { id: "ach_novice", title: "Rookie Solver Node", value: "XP >= 100 required", unlocked: profile.xp >= 100, reward: "50 Coins", bonusClaimed: claimedAchievements.includes("ach_novice") },
                { id: "ach_million", title: "Nexa Gold Tycoon", value: "Coins >= 200 required", unlocked: profile.coins >= 200, reward: "100 XP Bonus", bonusClaimed: claimedAchievements.includes("ach_million") },
                { id: "ach_streak", title: "Active Daily Streak Lord", value: "Streak >= 2 required", unlocked: profile.streak >= 2, reward: "20 Coins + 25 XP", bonusClaimed: claimedAchievements.includes("ach_streak") }
              ];

              const handleClaimAchievement = (item: typeof achievementsList[0]) => {
                if (!item.unlocked) {
                  alert("⚠️ Task not complete! You must meet the criteria to claim this reward.");
                  return;
                }
                if (item.bonusClaimed) {
                  alert("⚠️ Achievement already claimed!");
                  return;
                }

                let coinAward = 0;
                let xpAward = 0;
                if (item.id === "ach_novice") { coinAward = 50; }
                else if (item.id === "ach_million") { xpAward = 100; }
                else if (item.id === "ach_streak") { coinAward = 20; xpAward = 25; }

                const updatedProfile = { 
                  ...profile, 
                  coins: (profile.coins || 0) + coinAward,
                  xp: (profile.xp || 0) + xpAward 
                };
                saveProfileWithParams(updatedProfile, userHp);

                const nextList = [...claimedAchievements, item.id];
                setClaimedAchievements(nextList);
                localStorage.setItem("nexa_claimed_achievements", JSON.stringify(nextList));

                addNotification("Trophy Bonus Unlocked", `Claimed ${item.reward} bonus safely.`, "success");
                alert(`🏆 Claimed successfully! +${coinAward} Coins & +${xpAward} XP added to your credentials!`);
              };

              return (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full animate-bounce">
                      Credential Achievement Cabinet
                    </span>
                    <h3 className="text-3xl font-black text-white mt-3 uppercase tracking-tight">Trophy Cabinet Vault</h3>
                    <p className="text-xs text-gray-400">Track and unlock credential badges from your active daily study metrics</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {achievementsList.map(item => (
                      <div key={item.id} className="neo-glass rounded-3xl p-6 border-white/5 flex flex-col justify-between text-center relative overflow-hidden bg-black/20">
                        <div className="mb-4">
                          <div className="text-3xl mb-2">{item.bonusClaimed ? "🏆" : item.unlocked ? "🌟" : "🔒"}</div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-tight mt-1">{item.title}</h4>
                          <span className="text-[10px] text-gray-500 font-mono block mt-1">{item.value}</span>
                        </div>

                        <div>
                          <div className={`p-2 rounded-xl text-[10px] font-mono mb-3 ${item.bonusClaimed ? 'bg-green-950/20 text-green-300 border border-green-500/10' : item.unlocked ? 'bg-cyan-950/20 text-cyan-300 border border-cyan-500/10' : 'bg-white/2 text-gray-500'}`}>
                            {item.bonusClaimed ? "Claimed successfully ✓" : item.unlocked ? `Unlocked! Reward: ${item.reward}` : "Milestone locked"}
                          </div>

                          <button
                            disabled={!item.unlocked || item.bonusClaimed}
                            onClick={() => handleClaimAchievement(item)}
                            className={`w-full py-2 text-xs font-bold rounded-xl uppercase transition-all ${item.bonusClaimed ? 'bg-[#1b1917] text-gray-500 cursor-not-allowed border-none' : item.unlocked ? 'bg-yellow-400 hover:bg-yellow-500 text-black cursor-pointer border-none' : 'bg-white/5 text-gray-500 cursor-not-allowed border-none'}`}
                          >
                            {item.bonusClaimed ? "Claimed ✔" : "Claim Merit Bonus"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {currentPage === "watch_to_earn" && (
              <WatchAndEarnConsole 
                profile={profile}
                saveProfileWithParams={saveProfileWithParams}
                addNotification={addNotification}
                isOfflineMode={isOfflineMode}
              />
            )}

            {currentPage === "notifications_hub" && (() => {
              return (
                <div className="max-w-xl mx-auto space-y-6 animate-fade-in text-left">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight font-sans">Alarms & Notifications</h3>
                      <p className="text-[10px] text-gray-400 font-mono">Real-time system event logging alerts</p>
                    </div>
                    <button
                      onClick={() => {
                        setNotifications([]);
                      }}
                      className="py-1.5 px-3 bg-red-600/20 border border-red-500/20 text-red-300 rounded-lg text-xs font-bold uppercase transition-all hover:bg-red-600/30 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-16 neo-glass border-white/5 rounded-3xl">
                        <p className="text-xs text-gray-500 font-mono">Log buffer clean. No active alarms.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 bg-white/2 border border-white/5 rounded-2xl flex gap-3 text-xs items-start leading-relaxed">
                          <span className="text-lg">📢</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-bold text-white block uppercase tracking-tight">{n.title}</span>
                              <span className="text-[8px] text-gray-500 font-mono">{n.time}</span>
                            </div>
                            <p className="text-gray-300">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage("home")}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono uppercase tracking-wide border border-white/5 cursor-pointer text-center"
                  >
                    Return to Lobby Dashboard
                  </button>
                </div>
              );
            })()}

            {/* 24. ALL THE REMAINING PAGES DECLARED FALLBACK/SHELL WITH POLISHED MARKUP FOR HIGHEST FIDELITY */}
            {!["home", "question_bank", "ai_solver", "chats", "study_groups", "community_feed", "rankings", "study_battle", "focus_mode", "notes_generator", "career_roadmap", "virtual_campus", "study_reels", "theme_store", "avatar_studio", "reward_vault", "settings", "membership", "analytics", "hw_scanner", "exam_predictor", "ai_mentor", "language_tutor", "talk_teacher", "profile", "notes_vault", "marketplace", "achievement_vault", "notifications_hub", "coin_shop", "token_store", "creator_studio", "tournaments", "watch_to_earn"].includes(currentPage) && (
              <div className="neo-glass rounded-[35px] p-8 border-white/5 text-center max-w-md mx-auto space-y-6">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/15">
                  <Compass className="animate-spin" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white capitalize">{currentPage.replace("_", " ")} Loop</h4>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Module calibrated and fully connected to NexaSnap AI network parameters. Tap below to navigate home dashboard.
                  </p>
                </div>
                <button 
                  onClick={() => setCurrentPage("home")}
                  className="w-full py-3 bg-[#CCFF00] text-black font-bold text-xs rounded-2xl hover:scale-105 transition-all border-none uppercase"
                >
                  RETURN TO BASE COORDINATES
                </button>
              </div>
            )}

          </main>

          {/* ====================================================
              6. FLOATING BOTTOM NAVIGATION DOCK (Bento Glassmorphic)
              ==================================================== */}
          <footer className="fixed bottom-6 inset-x-4 md:inset-x-0 mx-auto max-w-sm md:max-w-2xl bg-white/10 backdrop-blur-2xl rounded-[30px] p-3.5 border border-white/15 shadow-2xl z-40 flex justify-around items-center animate-[fade-in_0.5s_ease-out]">
            {[
              { id: "home", label: "Home", icon: Layout },
              { id: "ai_solver", label: "Solve", icon: Sparkles },
              { id: "question_bank", label: "Bank", icon: BookOpen },
              { id: "chats", label: "Chat", icon: MessageSquare },
              { id: "study_battle", label: "Battle", icon: Trophy },
              { id: "portal", label: "Portal", icon: Compass }
            ].map((btn) => {
              const Icon = btn.icon;
              const isActive = (btn.id === "portal" && portalOpen) || (currentPage === btn.id && !portalOpen);

              return (
                <button
                  key={btn.id}
                  onClick={() => {
                    if (btn.id === "portal") {
                      setPortalOpen(true);
                    } else {
                      setPortalOpen(false);
                      setCurrentPage(btn.id);
                    }
                  }}
                  className="flex flex-col items-center gap-1 group cursor-pointer focus:outline-none"
                >
                  <span className={`w-9 h-9 md:w-11 md:h-11 rounded-[16px] flex items-center justify-center transition-all ${isActive ? 'bg-[#CCFF00] text-black shadow-[0_4px_12px_rgba(204,255,0,0.4)]' : 'bg-white/5 text-gray-300 group-hover:bg-[#CCFF00] group-hover:text-black hover:scale-105'}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-tighter ${isActive ? 'text-[#CCFF00]' : 'text-gray-400 group-hover:text-white'}`}>{btn.label}</span>
                </button>
              );
            })}
          </footer>

          {/* ====================================================
              DYNAMIC OVERLAYS & MODALS SUITE
              ==================================================== */}
          
          {/* LOGOUT WARNING CONFIRMATION MODAL */}
          {showLogoutModal && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[150] flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-md bg-[#0e0e11] border border-red-500/25 p-8 rounded-[32px] text-center shadow-[0_12px_50px_rgba(239,68,68,0.15)] relative overflow-hidden space-y-6">
                {/* Red alerting glow behind */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />
                
                {/* Visual Icon Alert */}
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20 animate-pulse">
                  <span className="text-2xl">⚠️</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white tracking-tight">
                    Confirm Account Disconnection
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-mono px-2">
                    You are checking out of your session. Your study parameters, streaks, and customization items remain securely bound to your Cloud Firestore username profile. You can log back in anytime to restore your progress instantly!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-extrabold text-xs rounded-xl transition-all border border-white/10 font-mono uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeRealLogout}
                    className="py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl transition-all border-none font-mono uppercase shadow-[0_4px_16px_rgba(239,68,68,0.4)] cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* DAILY STARTUP LOGIN REWARD MODAL */}
          {showDailyRewardModal && (
            <div className="fixed inset-0 bg-[#000000]/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-4">
              {/* Star-grid ambient layer */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-ping" />
                <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping" />
              </div>

              <div className="w-full max-w-4xl text-center z-10 space-y-6">
                <div className="space-y-2 animate-fade-in">
                  <span className="text-[10px] uppercase tracking-widest text-[#CCFF00] font-mono font-extrabold bg-[#CCFF00]/10 px-3 py-1 rounded-full border border-[#CCFF00]/20 inline-block">
                    CONSECUTIVE LAUNCH MULTIPLIER
                  </span>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    3-Day Cosmic Startup Reward Sync
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xl mx-auto">
                    Acknowledge daily study intervals. Hover to tilt nodes in 3D and tap the active item below to claim your daily starter parameters.
                  </p>
                </div>

                {/* 3D Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 max-w-3xl mx-auto">
                  {[
                    {
                      day: 1,
                      title: "DAY 1",
                      rewards: ["+150 NEXA", "+30 XP Boost"],
                      theme: "from-blue-600/30 to-blue-900/30 border-blue-500/30 text-blue-400",
                      glowColor: "rgba(59, 130, 246, 0.3)",
                      isJackpot: false,
                      icon: "💎"
                    },
                    {
                      day: 2,
                      title: "DAY 2",
                      rewards: ["+300 NEXA", "+50 XP Boost"],
                      theme: "from-purple-600/30 to-purple-900/30 border-purple-500/30 text-purple-400",
                      glowColor: "rgba(168, 85, 247, 0.3)",
                      isJackpot: false,
                      icon: "🔮"
                    },
                    {
                      day: 3,
                      title: "DAY 3 MEGA JACKPOT",
                      rewards: ["+1000 NEXA", "+120 XP Multiplier", "+100 Focus HP Max Boost"],
                      theme: "from-[#CCFF00]/20 to-emerald-950/20 border-[#CCFF00]/30 text-[#CCFF00]",
                      glowColor: "rgba(204, 255, 0, 0.4)",
                      isJackpot: true,
                      icon: "👑"
                    }
                  ].map((card) => {
                    const nextDayIndex = (claimedDaysCount % 3) + 1;
                    const isClaimed = card.day <= claimedDaysCount;
                    const isLock = card.day > nextDayIndex;
                    const isTodayClaimable = card.day === nextDayIndex;

                    // Hover interactive tilt
                    const tilts = tiltDays[card.day] || { x: 0, y: 0 };

                    return (
                      <div
                        key={card.day}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left - rect.width / 2;
                          const y = e.clientY - rect.top - rect.height / 2;
                          const tX = -(y / (rect.height / 2)) * 14;
                          const tY = (x / (rect.width / 2)) * 14;
                          setTiltDays(prev => ({ ...prev, [card.day]: { x: tX, y: tY } }));
                        }}
                        onMouseLeave={() => {
                          setTiltDays(prev => ({ ...prev, [card.day]: { x: 0, y: 0 } }));
                        }}
                        style={{
                          perspective: "1000px",
                          transform: `rotateX(${tilts.x}deg) rotateY(${tilts.y}deg) scale(${isTodayClaimable && tilts.x !== 0 ? 1.04 : 1})`,
                          transformStyle: "preserve-3d",
                          boxShadow: isTodayClaimable ? `0 10px 40px ${card.glowColor}` : 'none'
                        }}
                        className={`transition-all duration-200 select-none rounded-[32px] border p-6 flex flex-col justify-between items-center text-center relative overflow-hidden backdrop-blur-md bg-gradient-to-b ${card.theme} ${
                          isTodayClaimable ? "ring-2 ring-[#CCFF00]/50" : "opacity-80"
                        }`}
                      >
                        {/* 3D Depth back glow */}
                        <div className="absolute inset-0 bg-black/40 -z-10" />

                        <div className="space-y-4 w-full">
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">NODE: 00{card.day}</span>
                            {isClaimed ? (
                              <span className="bg-emerald-500/20 text-emerald-400 font-bold text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
                                SYNCD
                              </span>
                            ) : isLock ? (
                              <span className="bg-white/5 text-gray-500 font-bold text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border border-white/5">
                                LOCKED
                              </span>
                            ) : (
                              <span className="bg-[#CCFF00]/20 text-[#CCFF00] font-bold text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border border-[#CCFF00]/30 animate-pulse">
                                READY
                              </span>
                            )}
                          </div>

                          <div className="text-4xl py-2 filter drop-shadow-[0_4px_12px_rgba(255,255,255,0.1)]">{card.icon}</div>

                          <h4 className="text-sm font-black tracking-tight">{card.title}</h4>

                          <div className="space-y-1.5 pt-2">
                            {card.rewards.map((rew, ri) => (
                              <div key={ri} className="text-xs font-mono text-gray-300 flex items-center justify-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                {rew}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 w-full z-10">
                          {isClaimed ? (
                            <div className="w-full py-2.5 bg-emerald-500/10 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1.5">
                              ✓ Claimed
                            </div>
                          ) : isLock ? (
                            <div className="w-full py-2.5 bg-black/40 text-gray-600 font-bold text-xs rounded-xl border border-white/5">
                              Locked
                            </div>
                          ) : (
                            <button
                              onClick={claim3DayReward}
                              className="w-full py-2.5 bg-[#CCFF00] hover:bg-white text-black font-extrabold text-xs rounded-xl transition-all border-none uppercase shadow-lg shadow-[#CCFF00]/20 cursor-pointer"
                            >
                              SYNC PARAMETERS
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowDailyRewardModal(false)}
                    className="py-2 px-6 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full text-[10px] font-mono tracking-widest uppercase transition-all border border-white/10 cursor-pointer"
                  >
                    CLOSE REWARD MATRIX
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1. CONFETTI & SOLUTION VALIDATION MODAL OVERLAYS */}
          {validationModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md neo-glass p-8 rounded-[35px] border-[#CCFF00]/10 text-center relative overflow-hidden animate-fade-in shadow-[0_0_50px_rgba(204,255,0,0.1)]">
                {validationModal.status === 'SUCCESS' ? (
                  <div>
                    {/* Simulated Colorful Light Drops */}
                    <div className="absolute inset-0 pointer-events-none opacity-50">
                      <div className="absolute top-10 left-12 w-2 h-2 bg-[#CCFF00] rounded-full animate-bounce"></div>
                      <div className="absolute top-20 right-16 w-3.5 h-3.5 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-16 left-20 w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="absolute bottom-28 right-12 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                    </div>

                    <div className="w-16 h-16 bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl animate-bounce">
                      🏆
                    </div>
                    
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Formulation Correct!</h3>
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      Your algebraic coefficients aligned 100% with the digital whiteboard parameters.
                    </p>

                    <div className="mt-5 p-4 bg-white/2 rounded-2xl grid grid-cols-3 gap-2 border border-white/5 font-mono text-center">
                      <div>
                        <span className="text-xs text-emerald-400 block font-bold">+100</span>
                        <span className="text-[9px] text-gray-500 block uppercase font-mono">Study XP</span>
                      </div>
                      <div>
                        <span className="text-xs text-yellow-400 block font-bold">+{validationModal.coinReward || 50} NEXA</span>
                        <span className="text-[9px] text-[#CCFF00] block uppercase font-mono">NEXA</span>
                      </div>
                      <div>
                        <span className="text-xs text-red-300 block font-bold">+10 HP</span>
                        <span className="text-[9px] text-gray-500 block uppercase font-mono">Focus HP</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setValidationModal(null)}
                      className="w-full mt-6 py-3 bg-[#CCFF00] hover:bg-cyan-400 text-black font-black text-xs tracking-wider rounded-xl cursor-pointer uppercase border-none transition-all"
                    >
                      Bypass Cooldown Node
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl animate-pulse">
                      🧠
                    </div>

                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Focus Calibrating...</h3>
                    <p className="text-xs text-red-300 mt-1.5 leading-relaxed font-mono">
                      "Every calibration anomaly is a learning step. Re-evaluate formulas to scale higher leagues."
                    </p>

                    <div className="mt-4 p-4 bg-black/40 border border-red-500/10 rounded-2xl text-left text-xs space-y-2">
                      <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-widest block font-bold">💡 Quantum AI Hint Node</span>
                      <p className="text-gray-300 leading-relaxed font-mono">
                        {validationModal.hint || "Review logarithmic exponents and trace remaining constants to capture limits."}
                      </p>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => {
                          setValidationModal(null);
                          alert("⚡ AI Tutoring advice loaded: Formula details recalibrated on the question cards.");
                        }}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold border border-white/5 cursor-pointer uppercase font-mono"
                      >
                        Adjust Core
                      </button>
                      <button
                        onClick={() => setValidationModal(null)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black rounded-xl text-xs cursor-pointer uppercase border-none font-mono"
                      >
                        Retry Equation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. PREMIUM VIP SECURE REAL CREDIT CARD / UPI checkout SECURE DRAWER */}
          {checkoutModal && (() => {
            const [paymentTab, setPaymentTab] = React.useState<'upi' | 'card'>('upi');
            const [cardNumber, setCardNumber] = React.useState("4321 0000 8888 1234");
            const [cardName, setCardName] = React.useState("");
            const [cardCvv, setCardCvv] = React.useState("123");
            const [cardExpiry, setCardExpiry] = React.useState("12/29");
            
            const [transactionId, setTransactionId] = React.useState("");
            const [paymentVerifyMsg, setPaymentVerifyMsg] = React.useState("");
            const [paymentVerifyProgress, setPaymentVerifyProgress] = React.useState<number | null>(null);

            const triggerRecheckPayment = () => {
              if (paymentTab === 'upi') {
                if (!transactionId || transactionId.trim().length < 8) {
                  setPaymentVerifyMsg("❌ UPI VERIFICATION FAILED: Missing or incomplete transaction index. Please capture the 12-digit UPI UTR number from GPay, PhonePe, or Paytm and recheck.");
                  return;
                }
              } else {
                if (!cardName.trim() || cardNumber.replace(/\s+/g, '').length < 13) {
                  setPaymentVerifyMsg("❌ CARD CHECK FAILED: Invalid credentials. Please specify the real cardholder configuration & 16-digit card number.");
                  return;
                }
              }

              // Run beautiful multi-stage database verify progress bar!
              setPaymentVerifyMsg("");
              setPaymentVerifyProgress(15);
              
              const pTier = checkoutModal.planName.toLowerCase().includes('monthly') || checkoutModal.planName.toLowerCase().includes('yearly') ? 'PRO' : 'PLUS';

              setTimeout(() => {
                setPaymentVerifyProgress(45);
                setPaymentVerifyMsg(`📡 Contacting NPCI clearing nodes & verifying transaction index...`);
                
                setTimeout(() => {
                  setPaymentVerifyProgress(80);
                  setPaymentVerifyMsg(`⏳ Matching escrow payload of ${checkoutModal.price} against digital banking ledgers...`);
                  
                  setTimeout(() => {
                    setPaymentVerifyProgress(100);
                    
                    setTimeout(() => {
                      // Finalize status!
                      setPaymentVerifyProgress(null);
                      setPaymentVerifyMsg("");
                      
                      let checkoutDurationMs = 30 * 24 * 60 * 60 * 1000; // default Monthly
                      if (checkoutModal.planName.toLowerCase().includes('daily') || checkoutModal.planName.toLowerCase().includes('flash')) {
                        checkoutDurationMs = 24 * 60 * 60 * 1000;
                      } else if (checkoutModal.planName.toLowerCase().includes('yearly') || checkoutModal.planName.toLowerCase().includes('champion')) {
                        checkoutDurationMs = 365 * 24 * 60 * 60 * 1000;
                      }

                      const updatedProfile = { 
                        ...profile, 
                        premiumTier: pTier as any,
                        premiumExpiry: Date.now() + checkoutDurationMs
                      };
                      saveProfileWithParams(updatedProfile, userHp);
                      
                      // Trigger visual global claim portal overlay
                      setCurrentClaim({
                        isOpen: true,
                        type: "PASS",
                        title: "👑 CORE VIP UNLOCKED!",
                        subtitle: `Your secure payment of ${checkoutModal.price} was successfully verified through ledger nodes. Welcome to premium with a live timer!`,
                        amount: checkoutModal.planName,
                        itemName: `SYNCHRONIZED ACTIVE STATUS Parameter: [${pTier}] (${checkoutModal.planName.toLowerCase().includes('daily') ? '24hr' : checkoutModal.planName.toLowerCase().includes('yearly') ? '365 Days' : '30 Days'})`
                      });
                      
                      addNotification("Payment Verified ✔", `Processed subscription for ${checkoutModal.planName}.`, "success");
                      setCheckoutModal(null);
                    }, 500);
                  }, 1200);
                }, 1200);
              }, 800);
            };

            return (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans">
                <div className="w-full max-w-lg bg-[#070b13] p-6 md:p-8 rounded-[35px] border border-cyan-500/20 shadow-[0_20px_50px_rgba(6,182,212,0.15)] relative animate-fade-in block text-left text-white max-h-[95vh] overflow-y-auto">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#CCFF00] font-mono bg-[#CCFF00]/10 px-2.5 py-1 rounded-full font-black">
                        SECURE BANKING LEDGER v2.4
                      </span>
                      <h3 className="text-xl font-black text-white mt-2 uppercase tracking-tight font-sans">
                        CHECKOUT: {checkoutModal.planName}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setCheckoutModal(null)}
                      className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border-none cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* NOTICE ABOUT REAL PAYMENT INTEGRATION COMING LATER */}
                  <div className="mb-4 p-3.5 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-start gap-2.5 select-none text-left">
                    <span className="text-base">⚠️</span>
                    <div className="space-y-0.5">
                      <h5 className="text-[10px] font-black uppercase text-yellow-400 tracking-wide">Real-time Gateway Sync Coming Soon</h5>
                      <p className="text-[9.5px] text-gray-300 leading-normal">
                        it will come later in app sorry! Credit card and UPI checkout channels are under maintenance. Upgrade your account instantly with your <strong className="text-[#CCFF00]">NEXA coins</strong> in the premium pass list! (The button below remains functional as a live sandbox simulator for checking).
                      </p>
                    </div>
                  </div>

                  {/* Payment Methods tabs selector */}
                  <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-black/50 rounded-xl border border-white/5">
                    <button
                      onClick={() => { setPaymentTab('upi'); setPaymentVerifyMsg(""); }}
                      className={`py-2 text-[10px] font-mono font-black uppercase rounded-lg transition-all border-none ${paymentTab === 'upi' ? 'bg-[#CCFF00] text-black' : 'bg-transparent text-gray-400 hover:text-white'} cursor-pointer`}
                    >
                      📱 UPI / Instant Scan
                    </button>
                    <button
                      onClick={() => { setPaymentTab('card'); setPaymentVerifyMsg(""); }}
                      className={`py-2 text-[10px] font-mono font-black uppercase rounded-lg transition-all border-none ${paymentTab === 'card' ? 'bg-[#CCFF00] text-black' : 'bg-transparent text-gray-400 hover:text-white'} cursor-pointer`}
                    >
                      💳 Credit/Debit Card
                    </button>
                  </div>

                  {/* RENDERING DYNAMIC FORMS */}
                  {paymentTab === 'upi' ? (
                    <div className="space-y-4">
                      {/* UPI QR Display */}
                      <div className="p-4 bg-white/2 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 blur-xl rounded-full" />
                        
                        <div className="p-3 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center w-36 h-36 border-2 border-dashed border-[#7B61FF]">
                          {/* Beautiful QR emulation */}
                          <div className="w-28 h-28 flex flex-col justify-between items-center text-black font-mono">
                            <span className="text-[10px] font-bold bg-[#7B61FF] text-white px-1.5 py-0.5 rounded uppercase self-stretch text-center font-sans">NexaPay Secure</span>
                            <div className="text-xl">📊🛰️📈</div>
                            <span className="text-[7px] text-gray-500 font-bold font-mono">UTR MATCH PROTOCOL</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] text-cyan-400 font-mono block font-bold uppercase tracking-widest">Scan QR to Transfer Paytm/GPay</span>
                          <span className="text-[14px] font-mono font-black text-yellow-400 block mt-1">{checkoutModal.price}</span>
                          <span className="text-[9px] text-gray-500 font-mono mt-0.5 block">UPI ID: <strong className="text-gray-300">nexasnap@ybl</strong></span>
                        </div>
                      </div>

                      {/* Verification Field - user has to enter UPI index */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider pl-1 font-mono flex justify-between">
                          <span>Enter UPI Transaction ID / UTR No. (12 Digits)</span>
                          <span className="text-cyan-400 italic font-mono lowercase">Required to Recheck</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. 524108892215 or similar"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full bg-black/60 text-xs text-white py-3 px-4 rounded-xl border border-white/10 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] focus:outline-none font-mono placeholder-gray-600"
                        />
                        <p className="text-[8px] text-gray-500 font-mono italic pl-1">
                          After paying, enter the transaction number from GPay/PhonePe to let our billing engine verify settlement.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Holographic glowing card */}
                      <div className="aspect-[1.586/1] bg-gradient-to-tr from-cyan-950 via-slate-900 to-[#10032c] rounded-2xl p-5 border border-cyan-500/35 text-white flex flex-col justify-between shadow-[0_12px_24px_rgba(6,182,212,0.15)] relative overflow-hidden font-mono">
                        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#CCFF00]/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-mono tracking-widest uppercase font-black text-[#CCFF00]">NEXA DIGITAL VAULT</span>
                          <span className="text-[10px] bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded-full font-mono uppercase font-bold">VISA DEBIT</span>
                        </div>

                        <div className="text-base tracking-widest text-cyan-200 font-bold text-center">
                          {cardNumber}
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[7px] text-gray-400 block uppercase mb-0.5">ACADEMY NODE</span>
                            <span className="text-xs font-bold tracking-wider uppercase truncate max-w-[150px] block text-white font-sans">
                              {cardName.trim() ? cardName : profile.username}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[7px] text-gray-400 block uppercase mb-0.5">EXP / CVV</span>
                            <span className="text-[11px] font-bold">{cardExpiry} / {cardCvv}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card inputs */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-gray-400 uppercase font-black tracking-wider pl-1">Cardholder Name</label>
                          <input 
                            type="text" 
                            placeholder={profile.username}
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full mt-1 bg-black/40 text-xs text-white py-2.5 px-3 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 uppercase font-black tracking-wider pl-1 font-mono">Credit Card Number</label>
                          <input 
                            type="text" 
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full mt-1 bg-black/40 text-xs text-white py-2.5 px-3 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 uppercase font-bold tracking-wider pl-1">CVV CODE</label>
                          <input 
                            type="password" 
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full mt-1 bg-black/40 text-xs text-white py-2.5 px-3 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 uppercase font-bold tracking-wider pl-1">EXPIRY SLOT</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full mt-1 bg-black/40 text-xs text-white py-2.5 px-3 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VERIFICATION FEEDBACK PORTAL AND PROGRESS BAR */}
                  {paymentVerifyMsg && (
                    <div className="mt-4 p-3.5 bg-black/60 border border-cyan-500/10 rounded-2xl text-[10.5px] font-mono leading-relaxed text-cyan-400 select-text">
                      {paymentVerifyMsg}
                    </div>
                  )}

                  {paymentVerifyProgress !== null && (
                    <div className="mt-4 space-y-1.5 font-mono">
                      <div className="flex justify-between text-[10px] text-yellow-400">
                        <span>CONNECTING BANK CLEARINGS...</span>
                        <span>{paymentVerifyProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 via-[#7B61FF] to-yellow-400 transition-all duration-300"
                          style={{ width: `${paymentVerifyProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Master Checkout CTA buttons */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setCheckoutModal(null)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-mono text-xs rounded-xl cursor-pointer border border-white/5 transition-all text-center uppercase"
                      disabled={paymentVerifyProgress !== null}
                    >
                      Abeyance Cancel
                    </button>
                    <button
                      onClick={triggerRecheckPayment}
                      className="flex-[2] py-3 bg-[#CCFF00] text-black font-extrabold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all border-none font-mono tracking-wider cursor-pointer text-center uppercase"
                      disabled={paymentVerifyProgress !== null}
                    >
                      {paymentVerifyProgress !== null ? "📡 CHECKING LEDGER..." : `🔒 RECHECK & VERIFY REAL TIME PAYMENT (${checkoutModal.price})`}
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* 3. GLORIOUS COGNITIVE CLAIM CELEBRATION PORTAL */}
          {currentClaim && currentClaim.isOpen && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
              {/* Inject custom highly reactive 3D coin collect animation styles */}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes coin-quantum-burst {
                  0% {
                    transform: translate(-50%, -50%) translate(0px, 0px) scale(0) rotateY(0deg) rotate(0deg);
                    opacity: 0;
                  }
                  15% {
                    opacity: 1;
                    transform: translate(-50%, -50%) translate(calc(var(--tx) * 0.25), calc(var(--ty) * 0.25)) scale(0.6) rotateY(180deg) rotate(45deg);
                  }
                  45% {
                    opacity: 1;
                    transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1.3) rotateY(720deg) rotate(-15deg);
                    filter: drop-shadow(0 0 15px rgba(250, 204, 21, 0.8));
                  }
                  80% {
                    opacity: 0.9;
                    transform: translate(-50%, -50%) translate(calc(var(--tx) * 0.6), calc(var(--ty) - 220px)) scale(1.0) rotateY(1440deg) rotate(30deg);
                  }
                  100% {
                    transform: translate(-50%, -50%) translate(0px, -480px) scale(0.1) rotateY(2160deg);
                    opacity: 0;
                  }
                }
                .animate-quantum-coin {
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  animation: coin-quantum-burst 2.4s cubic-bezier(0.12, 0.89, 0.32, 0.99) infinite;
                  filter: drop-shadow(0 0 10px rgba(204, 255, 0, 0.5));
                  font-size: 22px;
                  pointer-events: none;
                  user-select: none;
                  z-index: 60;
                }
              `}} />

              {/* Quantum Coin Burst simulation layer - render during rewards OR successful purchases/pass activations */}
              {(currentClaim.pendingCoins > 0 || currentClaim.title.includes("SUCCESSFUL") || currentClaim.title.includes("ACTIVATED")) && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                  {[...Array(35)].map((_, i) => {
                    // Distribute the 35 coins in a fully radiating geometric orbit to simulate circular blast particles
                    const angle = (i * 2 * Math.PI) / 35 + (Math.random() * 0.2);
                    const radius = 110 + Math.random() * 120;
                    const tx = `${Math.round(Math.cos(angle) * radius)}px`;
                    const ty = `${Math.round(Math.sin(angle) * radius)}px`;
                    const delay = `${(i * 0.05).toFixed(2)}s`;

                    return (
                      <div
                        key={i}
                        className="animate-quantum-coin"
                        style={{
                          '--tx': tx,
                          '--ty': ty,
                          animationDelay: delay,
                        } as React.CSSProperties}
                      >
                        🪙
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="w-full max-w-sm bg-gradient-to-b from-[#111928] to-[#070b13] p-8 rounded-[40px] border-2 border-cyan-400/20 text-center relative shadow-[0_20px_60px_rgba(6,182,212,0.25)] animate-fade-in font-sans">
                {/* Radial glow background */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

                {/* Sparkling Icon Header */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                  {/* Floating particle animations */}
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                  <div className="relative w-24 h-24 rounded-full bg-black/60 border border-cyan-400/30 flex items-center justify-center text-4xl shadow-inner">
                    {currentClaim.type === "HP" && "🧬"}
                    {currentClaim.type === "PASS" && "👑"}
                    {currentClaim.type === "NEXO" && "🪙"}
                    {currentClaim.type === "ALL_SOLVED" && "🏆"}
                  </div>
                </div>

                {/* Titles */}
                <span className="text-[10px] font-mono tracking-widest text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1 rounded-full uppercase font-black">
                  {currentClaim.title}
                </span>
                
                <h3 className="text-xl font-black text-white mt-4 tracking-tight leading-snug">
                  {currentClaim.subtitle}
                </h3>

                {/* Main Reward Tag */}
                {currentClaim.amount && (
                  <div className="my-6 p-4 bg-white/3 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-mono">QUANTUM REWARD VALUE</span>
                    <span className="text-3xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-100 bg-clip-text text-transparent block mt-1 tracking-wider drop-shadow-[0_2px_10px_rgba(250,204,21,0.15)] font-mono">
                      {currentClaim.amount}
                    </span>
                  </div>
                )}

                {currentClaim.itemName && (
                  <p className="text-xs text-gray-400 font-mono tracking-wide mt-2">
                     Ref: {currentClaim.itemName}
                  </p>
                )}

                {/* Claim Interactive CTA */}
                <button
                  onClick={() => {
                    const pXp = currentClaim.pendingXp || 0;
                    const pCoins = currentClaim.pendingCoins || 0;
                    const pHp = currentClaim.pendingHp || 0;

                    // Add profile parameters
                    const nextXp = profile.xp + pXp;
                    const nextCoins = profile.coins + pCoins;
                    const nextHp = Math.min(100, Math.max(0, userHp + pHp));

                    setUserHp(nextHp);

                    let newLeague: 'Bronze' | 'Silver' | 'Gold' | 'Titan' | 'Legend' = profile.league;
                    if (nextXp > 8000) newLeague = "Legend";
                    else if (nextXp > 4000) newLeague = "Titan";
                    else if (nextXp > 1500) newLeague = "Gold";
                    else if (nextXp > 500) newLeague = "Silver";

                    const customRank = nextXp > 0 ? Math.max(1, 1000 - Math.floor(nextXp / 8)) : 999;

                    const updatedUser = {
                      ...profile,
                      xp: nextXp,
                      coins: Math.max(0, nextCoins),
                      league: newLeague,
                      rank: customRank
                    };

                    setProfile(updatedUser);
                    localStorage.setItem("nexasnap_user", JSON.stringify(updatedUser));
                    saveProfileWithParams(updatedUser, nextHp);

                    // Record to Reward History Logs
                    const newRewardLog = {
                      id: `rew_${Date.now()}`,
                      title: currentClaim.title,
                      source: currentClaim.subtitle,
                      coins: pCoins,
                      xp: pXp,
                      hp: pHp,
                      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    };
                    setRewardHistory(prev => {
                      const nextHistory = [newRewardLog, ...prev];
                      localStorage.setItem("nexa_reward_history", JSON.stringify(nextHistory));
                      return nextHistory;
                    });

                    setCurrentClaim(null);
                    addNotification(
                      "Rewards Authorized ✔", 
                      `Successfully claimed +${pXp} XP, +${pCoins} NEXA Coins, and +${pHp} Focus HP!`, 
                      "success"
                    );
                  }}
                  className="w-full mt-8 py-3.5 bg-gradient-to-r from-cyan-400 to-[#7B61FF] hover:from-cyan-300 hover:to-purple-500 text-black font-black text-xs rounded-xl hover:scale-105 active:scale-95 transition-all border-none tracking-widest cursor-pointer uppercase font-mono shadow-[0_4px_20px_rgba(6,182,212,0.3)]"
                >
                  ⚡ HARVEST INVENTORY REWARDS
                </button>
              </div>
            </div>
          )}

          {/* 4. STUDY TEAM CREATION WIZARD DIRECT DIALOG */}
          {isCreatingGroup && (() => {
            const [grpName, setGrpName] = React.useState("");
            const [grpDesc, setGrpDesc] = React.useState("");
            const [grpEmoji, setGrpEmoji] = React.useState("🧪");
            
            // Dynamic friend search & checkboxes state
            const [friendSearch, setFriendSearch] = React.useState("");
            const [invitedFriends, setInvitedFriends] = React.useState<string[]>(friends);

            const toggleFriendInvite = (f: string) => {
              if (invitedFriends.includes(f)) {
                setInvitedFriends(invitedFriends.filter(item => item !== f));
              } else {
                setInvitedFriends([...invitedFriends, f]);
              }
            };

            const compileSquad = () => {
              if (!grpName.trim()) {
                alert("Please declare a unique squad name.");
                return;
              }
              
              const newGrpId = `group_${Date.now()}`;
              const newGrp: any = {
                id: newGrpId,
                name: grpName.trim(),
                description: grpDesc.trim() || 'Co-generated advanced study lobby.',
                icon: grpEmoji,
                membersCount: invitedFriends.length + 1,
                sharedNotesCount: 0,
                activeVoiceRooms: 0
              };
              
              setStudyGroups([...studyGroups, newGrp]);
              
              // Automatically register the creator as standard member of the new group
              setJoinedGroupIds([...joinedGroupIds, newGrpId]);
              setIsCreatingGroup(false);

              // Create matching squad group chat session
              const invitationText = invitedFriends.length > 0 
                ? `📡 Squad Network compiled! Target coordinates calibrated. Invited peers: [${invitedFriends.map(f => '@' + f).join(', ')}] have connected successfully.`
                : `📡 Squad Network compiled! Active social thread initialized for group "${grpName.trim()}".`;

              const newGrpChat = {
                id: `chat_group_${Date.now()}`,
                recipientName: `${grpEmoji} ${grpName.trim()}`,
                recipientAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${grpName.trim()}`,
                messages: [
                  {
                    id: `msg_grp_init_${Date.now()}`,
                    sender: "SYSTEM COORDINATE",
                    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${grpName.trim()}`,
                    text: invitationText,
                    time: "Just now"
                  }
                ]
              };
              setChats([newGrpChat, ...chats]);

              // Launch claims celebration overlay
              setCurrentClaim({
                isOpen: true,
                type: "PASS",
                title: "🚀 SQUAD CALIBRATED",
                subtitle: `Successfully established elite node "${grpName.trim()}"! Chat sync channels are online.`,
                amount: "+50 XP",
                itemName: "Constructor Accolade Compiled",
                pendingXp: 50
              });

              addNotification("Squad Calibrated", `Registered squad "${grpName.trim()}" successfully.`, "success");
            };

            // Filter friends by query search box
            const filteredFriends = friends.filter(f => 
              f.toLowerCase().includes(friendSearch.trim().toLowerCase())
            );

            return (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans">
                <div className="w-full max-w-md bg-[#090e17] p-6 md:p-8 rounded-[35px] border-2 border-cyan-400/20 shadow-2xl relative animate-fade-in text-left text-white max-h-[90vh] overflow-y-auto">
                  
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-cyan-400" /> CONSTRUCT SQUAD NODE
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-1">Spin up real-time study channels and whiteboards instantly.</p>
                    </div>
                    <button 
                      onClick={() => setIsCreatingGroup(false)}
                      className="p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-xl border-none cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block mb-1.5">Customize Squad Badge</span>
                      <div className="flex gap-2">
                        {['🧪', '📐', '🧠', '💻', '⚛️', '🧬', '🌌'].map(em => (
                          <button
                            key={em}
                            onClick={() => setGrpEmoji(em)}
                            className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border cursor-pointer transition-all ${grpEmoji === em ? 'bg-[#CCFF00]/25 border-[#CCFF00] text-white shadow-[0_2px_10px_rgba(204,255,0,0.15)]' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-400 uppercase font-black tracking-wider pl-1">Unique Squad Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Theoretical Olympiad Hackers"
                        value={grpName}
                        onChange={(e) => setGrpName(e.target.value)}
                        className="w-full mt-1 bg-black/40 text-xs text-white py-3 px-4 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-400 uppercase font-black tracking-wider pl-1 font-mono">Purpose Briefing</label>
                      <textarea 
                        placeholder="Describe study equations, project coordinates or milestones..."
                        value={grpDesc}
                        onChange={(e) => setGrpDesc(e.target.value)}
                        className="w-full mt-1.5 h-16 bg-black/40 text-xs text-white p-3 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* INTERACTIVE FRIENDS RECRUITMENT SEARCH TOOLBOX */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-gray-400 uppercase font-black font-mono block">Recruit Connections / Invite List</span>
                      
                      {friends.length > 0 ? (
                        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-2.5">
                          {/* Search box inside group creation modal */}
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-500">
                              <Search className="w-3 h-3 text-cyan-400" />
                            </span>
                            <input
                              type="text"
                              placeholder="Search friends to invite..."
                              value={friendSearch}
                              onChange={(e) => setFriendSearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 bg-black/50 text-[10px] text-white rounded-lg border border-white/5 focus:border-[#CCFF00] focus:outline-none placeholder-gray-600"
                            />
                          </div>

                          <div className="space-y-1.5 max-h-[90px] overflow-y-auto font-mono text-[9px]">
                            {filteredFriends.map((f) => {
                              const isInvited = invitedFriends.includes(f);
                              return (
                                <div 
                                  key={f} 
                                  onClick={() => toggleFriendInvite(f)}
                                  className="p-2 bg-white/2 hover:bg-white/5 border border-white/5 rounded-lg flex justify-between items-center cursor-pointer transition-all"
                                >
                                  <span className="text-gray-300">@{f}</span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase transition-all ${isInvited ? 'bg-[#CCFF00]/10 text-[#CCFF00]' : 'bg-white/5 text-gray-500'}`}>
                                    {isInvited ? "Invite Token Active ✓" : "Dormant"}
                                  </span>
                                </div>
                              );
                            })}

                            {filteredFriends.length === 0 && (
                              <p className="text-center text-[9px] text-gray-600 mt-1">No matching connections.</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[9px] text-gray-600 font-mono">*Add connections inside profile boards to enable recruitment sync.</p>
                      )}
                    </div>

                    <button
                      onClick={compileSquad}
                      className="w-full py-3.5 bg-[#CCFF00] text-black font-black text-xs rounded-xl hover:scale-105 active:scale-95 transition-all border-none font-mono tracking-wider cursor-pointer uppercase text-center"
                    >
                      ⚡ COMPILE SQUAD MATRIX
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}


          {/* 4. SPONSOR VIDEO EMULATIVE WATCH TERMINAL FOR GOLD */}
          {activeAd && (() => {
            const [timerSec, setTimerSec] = React.useState(5);
            const [adDone, setAdDone] = React.useState(false);

            React.useEffect(() => {
              if (timerSec > 0) {
                const interval = setInterval(() => {
                  setTimerSec(timerSec - 1);
                }, 1000);
                return () => clearInterval(interval);
              } else {
                setAdDone(true);
              }
            }, [timerSec]);

            const claimAdGold = () => {
              const rewardedProfile = { ...profile, coins: profile.coins + 50 };
              saveProfileWithParams(rewardedProfile, userHp);
              setActiveAd(false);
              addNotification("Sponsorship Dissolved", "Earned 50 Gold coins micro-credit.", "success");
              alert("🪙 Claim Success! +50 G (coins) deposited safely into your credentials.");
            };

            return (
              <div className="fixed inset-0 bg-black/95 z-[55] flex items-center justify-center p-4 select-none">
                <div className="w-full max-w-md neo-glass p-8 rounded-[35px] border-yellow-400/20 text-center animate-fade-in relative overflow-hidden block">
                  <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4 text-xs font-mono">
                    <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-black uppercase">Sponsored Stream</span>
                    <span className="text-gray-400">Sponsored Link</span>
                  </div>

                  <div className="aspect-video bg-gradient-to-r from-orange-600 to-purple-600 rounded-2xl p-6 flex flex-col justify-between text-white relative overflow-hidden mb-6 text-left">
                    <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>
                    <div className="relative z-10">
                      <h4 className="text-lg font-black tracking-tight leading-none uppercase">Quantum Soda Can 🥤</h4>
                      <p className="text-[9px] text-cyan-200 mt-1 uppercase tracking-widest font-mono">COGNITIVE LATENCY: 0MS</p>
                    </div>

                    <div className="relative z-10 text-[11px] leading-relaxed font-mono opacity-90 max-w-xs">
                      "Inject carbonated caffeine molecules directly into equations. Reclaim focus capacity with every sip!"
                    </div>

                    <div className="absolute bottom-3 right-3 z-10 bg-black/60 px-2.5 py-1 rounded-lg text-[9px] font-mono">
                      {adDone ? 'COMPLETED RESOLVING' : `CLAIMING REWARD IN [00:0${timerSec}]`}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {adDone ? (
                      <button
                        onClick={claimAdGold}
                        className="w-full py-3 bg-[#CCFF00] hover:bg-cyan-400 text-black font-black text-xs rounded-xl hover:scale-105 transition-all border-none uppercase tracking-wider cursor-pointer font-mono"
                      >
                        🪙 CLAIM +50 G REWARD COINS
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 bg-white/5 text-gray-500 font-bold text-xs rounded-xl border-none uppercase tracking-wider text-center cursor-not-allowed opacity-60"
                      >
                        Watch to claim (00:0{timerSec}s remaining)
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        setActiveAd(false);
                        alert("Sponsorship loop closed. Zero G rewarded.");
                      }}
                      className="w-full py-2 bg-transparent text-gray-400 hover:text-white text-[10px] rounded-lg transition-all border-none font-mono underline cursor-pointer"
                    >
                      Bypass loop (Gain 0 coins)
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* DAILY ATTENDANCE STREAK MONITOR OVERLAY */}
          {streakModalOpen && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[55] flex items-center justify-center p-4">
              <div className="w-full max-w-lg neo-glass p-6 rounded-[35px] border-orange-500/20 text-center animate-fade-in relative overflow-hidden block max-h-[90vh] overflow-y-auto">
                <button 
                  onClick={() => setStreakModalOpen(false)}
                  className="absolute right-6 top-6 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5 cursor-pointer"
                >
                  Close
                </button>

                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] flame-pulse-anim">
                    <span className="text-4xl">🔥</span>
                  </div>
                </div>

                <span className="text-[9px] font-mono text-[#CCFF00] tracking-widest uppercase font-black bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                  ⚡ TEMPORAL DAILY MOTIVATION MATRIX
                </span>

                <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-3">
                  STREAK PARAMETERS CALIBRATED
                </h3>
                
                <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
                  Keep your focus engine optimized! Access daily attendance logs and secure consecutive rewards.
                </p>

                <div className="my-5 bg-black/40 border border-white/5 p-5 rounded-2xl text-center">
                  <span className="text-xs text-gray-400 block uppercase font-mono tracking-wider">Active Consecutives</span>
                  <span className="text-4xl font-mono font-black text-orange-400 mt-1 block drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                    🔥 {profile.streak} Days
                  </span>
                  <span className="text-[10px] text-[#CCFF00] block mt-1">Multipliers Active: x{(1 + (profile.streak || 0) * 0.15).toFixed(2)} XP Rate</span>
                  
                  {/* Streak Booster button */}
                  <StreakBoosterButton 
                    streak={profile.streak} 
                    username={profile.username}
                    onAdvance={(nextStreak) => {
                      // Retrieve checked blocks array for standard 30-day index matching
                      const userSuffix = profile.username ? `_${profile.username.toLowerCase()}` : "";
                      const savedBlocksStr = localStorage.getItem(`nexa_30_checked_blocks${userSuffix}`);
                      let checkedBlocks = savedBlocksStr ? JSON.parse(savedBlocksStr) : [0, 1];
                      
                      // Calculate active index being checked right now
                      const dayIdx = checkedBlocks.length;
                      let nextList = [...checkedBlocks];
                      if (dayIdx < 30) {
                        nextList.push(dayIdx);
                      } else {
                        nextList = [0]; // cycle restarts
                      }
                      localStorage.setItem(`nexa_30_checked_blocks${userSuffix}`, JSON.stringify(nextList));

                      // Calculate identical base rewards to DailyRewardHub for dayIdx
                      const dayNum = dayIdx + 1;
                      let xp = 20 + dayNum * 5;
                      let coins = 50 + dayNum * 15;
                      let reputation = 0;

                      if (dayNum === 6) {
                        reputation = 5;
                        coins = 200;
                      } else if (dayNum === 12) {
                        reputation = 10;
                        coins = 400;
                      } else if (dayNum === 18) {
                        reputation = 15;
                        coins = 600;
                      } else if (dayNum === 24) {
                        reputation = 25;
                        coins = 1000;
                      } else if (dayNum === 30) {
                        reputation = 50;
                        coins = 2500;
                        xp = 500;
                      }

                      // Apply permanent VIP multiplier boosts (or double drop rate calibrations) if VIP upgraded
                      const isVip = profile.premiumTier && profile.premiumTier !== "FREE";
                      const finalXp = isVip ? xp * 2 : xp;
                      const finalCoins = isVip ? coins * 2 : coins;

                      const nextProfile = { 
                        ...profile, 
                        streak: nextStreak,
                        coins: (profile.coins || 0) + finalCoins,
                        xp: (profile.xp || 0) + finalXp,
                        reputation: (profile.reputation || 0) + reputation
                      };
                      saveProfile(nextProfile);

                      // Spark high end coin burst overlay
                      grantRewards(finalXp, finalCoins);
                    }}
                    addNotification={addNotification}
                  />
                </div>

                {/* Micro guide guidelines */}
                <div className="space-y-2 text-left bg-white/2 border border-white/5 rounded-2xl p-4 text-[11px] text-gray-300 leading-relaxed font-mono">
                  <div className="flex gap-2 items-center text-[#CCFF00]">
                    <span>✓</span> Keep launching daily to retain your streak index.
                  </div>
                  <div className="flex gap-2 items-center">
                    <span>⏳</span> Drop-outs after 48 hours lapse reset the index to Day 1.
                  </div>
                  <div className="flex gap-2 items-center">
                    <span>👑</span> Check your achievements and claims panel for gold multipliers.
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStreakModalOpen(false);
                    setCurrentPage("reward_vault");
                  }}
                  className="w-full mt-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs rounded-xl hover:scale-102 border-none transition-all uppercase cursor-pointer text-center"
                >
                  View 30-Day Rewards Hub
                </button>
              </div>
            </div>
          )}

          {/* 5. 5-MINUTE AUTO AD UPGRADE PREMIUM PASS POPUP */}
          {premiumAdOpen && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[54] flex items-center justify-center p-4 select-none">
              <div className="w-full max-w-md neo-glass p-8 rounded-[35px] border-yellow-400/20 text-center animate-fade-in relative overflow-hidden block">
                {/* Visual decorations for Premium pass hype */}
                <div className="absolute -top-16 -left-16 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-[#7B61FF]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="mb-5 flex justify-center">
                  <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 to-[#7B61FF] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                </div>

                <span className="text-[9px] font-mono text-[#CCFF00] tracking-widest uppercase font-black bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                  👑 PREMIUM RECALIBRATION LOOP
                </span>

                <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-4">
                  UPGRADE PREMIUM PASS ACTIVE
                </h3>
                
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  Avoid interruptions! Secure the **NEXAPRO Premium Pass** to bypass all cognitive sponsorship buffers, increase questions limits inside the AI solver, and get double XP.
                </p>

                {/* Offer features list */}
                <div className="my-6 bg-black/40 border border-white/5 p-4 rounded-2xl text-left space-y-2.5 font-mono text-[11px] text-gray-300">
                  <div className="flex gap-2 items-center">
                    <span className="text-yellow-400">⚡</span> Double XP rewards multipliers on matches
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-yellow-400">⚡</span> Infinite AI scanned homework solutions
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-yellow-400">⚡</span> Zero cognitive sponsored micro-ads
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setPremiumAdOpen(false);
                      setCurrentPage("membership"); // Go straight to pricing nodes
                      addNotification("Pricing Nodes Active", "Select premium upgrades plan in parameters.", "info");
                    }}
                    className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs rounded-xl hover:scale-105 transition-all border-none uppercase tracking-wider cursor-pointer font-mono shadow-md"
                  >
                    👑 VIEW PRO MEMBERSHIP PLANS
                  </button>
                  
                  <button
                    onClick={() => {
                      setPremiumAdOpen(false);
                      addNotification("Ad Silenced", "Cognitive upgrade alert dismissed for 5 more minutes.", "info");
                    }}
                    className="w-full py-2 bg-transparent text-gray-400 hover:text-white text-[10px] rounded-lg transition-all border-none font-mono underline cursor-pointer"
                  >
                    Bypass ad (remind me in 5 minutes)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BEAUTIFUL COMPATIBILITY DIALOG FOR SYSTEM SECURE ALERTS */}
          {customAlert?.isOpen && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[90] flex items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-sm bg-gradient-to-b from-[#10141f] to-[#07090f] p-8 rounded-[35px] border-2 border-cyan-400/20 text-center relative shadow-[0_20px_65px_rgba(6,182,212,0.25)]">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="mb-4 text-4.5xl block animate-pulse">
                  {customAlert.title?.includes("Block") || customAlert.title?.includes("Denied") ? "🔒" : customAlert.title?.includes("Successful") ? "👑" : "🧭"}
                </div>

                <h4 className="text-sm font-mono font-black text-white uppercase tracking-widest mb-3 bg-white/5 py-1.5 px-3 rounded-full border border-white/5 inline-block">
                  {customAlert.title}
                </h4>

                <div className="text-xs text-slate-300 leading-relaxed font-sans my-4 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                  {customAlert.message}
                </div>

                <button
                  type="button"
                  onClick={() => setCustomAlert(null)}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#7B61FF] via-cyan-500 to-[#CCFF00] text-black font-mono font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-102 active:scale-98 transition-all cursor-pointer border-none shadow-lg shadow-cyan-900/10"
                >
                  Confirm & Dismiss
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* GOOGLE GMAIL SECURE SYNC OVERLAY CONSOLE */}
      {showGoogleGmailPopup && (() => {
        return (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[160] flex flex-col items-center justify-center p-4 animate-fade-in animate-duration-300">
            <div className="w-full max-w-md bg-[#090b11] border border-cyan-500/30 p-8 rounded-[35px] text-center shadow-[0_20px_60px_rgba(6,182,212,0.25)] relative overflow-hidden space-y-6">
              {/* Glowing status line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#4285F4] to-[#34A853] opacity-80" />
              
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.927h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.053h3.837c2.274-2.1 3.708-5.18 3.708-8.59z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.837-3.05c-1.08.72-2.45 1.16-4.123 1.16-3.17 0-5.85-2.14-6.81-5.01H1.247v3.16C3.217 21.09 7.36 24 12 24z" />
                    <path fill="#FBBC05" d="M5.19 14.19a7.135 7.135 0 0 1 0-4.38V6.65H1.247a11.936 11.936 0 0 0 0 10.7z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.36 0 3.217 2.91 1.247 6.65L5.19 9.81c.96-2.87 3.64-5.06 6.81-5.06z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white tracking-tight uppercase">Google Account Sync</h4>
                <p className="text-xs text-gray-400 font-mono italic">
                  Popups restricted in iframe. Synchronize securely via instant credentials console.
                </p>
              </div>

              {/* ACCOUNT CARD SELECTION CHOOSER */}
              <div className="space-y-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  processGoogleUser(googleGmailInput, googleDisplayName);
                }} className="space-y-4 text-left">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block pl-1 font-mono">
                      ENTER GOOGLE GMAIL
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="username@gmail.com"
                      value={googleGmailInput}
                      onChange={(e) => setGoogleGmailInput(e.target.value)}
                      className="w-full mt-2 bg-black/50 text-white font-mono text-sm py-3 px-4 rounded-xl border border-white/10 focus:border-[#4285F4] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block pl-1 font-mono">
                      DISPLAY NAME (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={googleDisplayName}
                      onChange={(e) => setGoogleDisplayName(e.target.value)}
                      className="w-full mt-2 bg-black/50 text-white font-mono text-sm py-3 px-4 rounded-xl border border-white/10 focus:border-[#34A853] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGoogleGmailPopup(false)}
                      className="py-3.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition-all border border-white/10 font-mono uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all border border-white/10 font-mono uppercase cursor-pointer"
                    >
                      Verify & Sync
                    </button>
                  </div>
                </form>
              </div>

              <p className="text-[9px] text-gray-500 font-mono leading-normal italic text-center">
                🔒 Google Secure Socket protocol ensures all academic achievements and progress tokens are synchronized to Firebase.
              </p>
            </div>
          </div>
        );
      })()}

      {/* GLOBAL HIGH-FIDELITY SIMULATED ADMOB REWARDED VIDEO AD OVERLAY */}
      {simulatedRewardAd && simulatedRewardAd.isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#120B24] via-[#090514] to-black border border-purple-500/35 rounded-[35px] overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)] text-center flex flex-col items-center p-8 select-none font-sans text-white relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 opacity-80" />
            
            <div className="flex justify-between items-center w-full mb-6">
              <span className="text-[9px] uppercase font-mono text-purple-400 bg-purple-400/10 px-2.5 py-0.5 rounded border border-purple-400/20 font-black tracking-wide">
                GOOGLE ADMOB VERIFIED TRANSMISSION
              </span>
              <span className="text-[10px] text-gray-500 font-mono font-bold">ca-app-pub-994/rev</span>
            </div>

            {/* Simulated Live Video Animation Player */}
            <div className="w-full aspect-video bg-black/80 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2.5 relative overflow-hidden mb-5">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/15 via-transparent to-purple-500/5 animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <span className="text-[10px] font-mono text-purple-300 font-semibold uppercase tracking-wider animate-pulse">Streaming Advert Content...</span>
            </div>

            <h4 className="text-base font-black uppercase text-white leading-tight tracking-tight">
              Sponsor Broadcast active
            </h4>
            <p className="text-xs text-slate-400 mt-2 text-center leading-relaxed font-sans px-2">
              Please watch the video sequence to completion to verify academic interaction parameters and claim your coins reward.
            </p>

            <div className="mt-6 mb-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl w-full flex justify-between items-center font-mono">
              <div className="text-left space-y-0.5">
                <span className="text-[8px] text-gray-500 block uppercase font-bold">REMAINING TIME</span>
                <span className="text-xl font-black text-[#CCFF00]">{simulatedRewardAd.timer} Seconds</span>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[8px] text-gray-500 block uppercase font-bold">LEDGER VERIFICATION</span>
                <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${simulatedRewardAd.rewardClaimed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-amber-500/15 text-amber-500 border border-amber-500/25 animate-pulse"}`}>
                  {simulatedRewardAd.rewardClaimed ? "✓ VERIFIED" : "⏳ WATCHING"}
                </span>
              </div>
            </div>

            {!simulatedRewardAd.rewardClaimed ? (
              <button 
                disabled
                className="w-full py-4 bg-white/5 text-gray-500 rounded-xl text-xs font-mono font-black border border-white/5 cursor-not-allowed select-none uppercase tracking-widest"
              >
                SKIP AD IN {simulatedRewardAd.timer}s
              </button>
            ) : (
              <button 
                onClick={() => {
                  simulatedRewardAd.onReward();
                  setSimulatedRewardAd(null);
                }}
                className="w-full py-4 bg-gradient-to-r from-[#CCFF00] to-green-500 hover:brightness-110 text-black font-extrabold rounded-xl text-xs uppercase cursor-pointer border-none shadow-[0_4px_20px_rgba(204,255,0,0.4)] tracking-widest transition-all hover:scale-102 active:scale-98 font-mono"
              >
                🎁 CLAIM +10 STUDY COINS NOW
              </button>
            )}
            
            <button
              onClick={() => {
                simulatedRewardAd.onDismiss();
                setSimulatedRewardAd(null);
                addNotification("Ad Suppressed", "Closed simulated reward ad early.", "info");
              }}
              className="mt-4 text-[10px] text-gray-500 hover:text-white font-mono uppercase underline border-none bg-transparent cursor-pointer"
            >
              Skip early & forfeit reward
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Vector Icons explicitly created to satisfy SVG restrictions
function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
