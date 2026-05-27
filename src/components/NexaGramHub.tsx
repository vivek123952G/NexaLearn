import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Heart, MessageSquare, Share2, ThumbsDown, Send, Plus, Users, 
  Search, Bookmark, Shield, Compass, Sparkles, Check, Play, HelpCircle, 
  ChevronRight, RefreshCw, X, MessageCircle, Info, Smile, ChevronDown, UserPlus, Flame, Award,
  BookOpen, Star, Clock, Activity, Sword, Brain, ShieldAlert, MonitorCheck, RefreshCcw, Music, Pause
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserProfile, FeedPost, ChatSession, StudyReel, StudyGroup, Comment, ChatMessage 
} from "../types";
import { syncReelToFirestore, syncPostToFirestore } from "../lib/firebase";
import { NativeAd } from "./NativeAds";

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
  onAddNotification: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
  initialSubTab?: 'feed' | 'reels' | 'chats' | 'friends' | 'explore' | 'profile';
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
  onAddNotification,
  initialSubTab = "feed"
}) => {
  const [subTab, setSubTab] = useState<'feed' | 'reels' | 'explore' | 'profile' | 'chats' | 'friends'>(initialSubTab as any);
  
  // Local Media file selection uploaders
  const handleReelVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        onAddNotification("INVALID FORMAT ⚠️", "Please select a valid video file node.", "alert");
        alert("⚠️ Please select a valid video file.");
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
          setNewPostMedia(reader.result);
          onAddNotification("Media Asset Cached 📷", `${file.name} loaded in memory base64 snapshot!`, "success");
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

    const key = `nexa_last_report_time_${profile.username.toLowerCase()}`;
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

      const { db } = await import("../lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "reports", reportId), newReportData);

      localStorage.setItem(`nexa_last_report_time_${profile.username.toLowerCase()}`, Date.now().toString());

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
    const matchesQuery = p.username.toLowerCase().includes(exploreSearchQuery.toLowerCase()) || 
                         p.school.toLowerCase().includes(exploreSearchQuery.toLowerCase()) ||
                         p.badge.toLowerCase().includes(exploreSearchQuery.toLowerCase());
    return matchesQuery;
  });

  const filteredTrendingNotes = trendingNotesData.filter(note => {
    const matchesSubject = exploreSubjectFilter === "All" || note.subject === exploreSubjectFilter;
    const matchesQuery = note.title.toLowerCase().includes(exploreSearchQuery.toLowerCase()) || 
                         note.author.toLowerCase().includes(exploreSearchQuery.toLowerCase());
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

    if (activeSession.recipientName.toLowerCase().includes("ai")) {
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

        {/* Sleek Cybersecurity Cyber-Tabs Grid (6 Tabs Setup!) */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1 bg-black/45 p-1 rounded-2xl border border-white/5 font-mono text-[9px] font-black tracking-tighter">
          <button
            onClick={() => setSubTab("feed")}
            className={`py-2 px-2.5 rounded-xl text-center select-none cursor-pointer border-none transition-all ${subTab === "feed" ? "bg-cyan-500/15 text-cyan-300 shadow" : "text-gray-400 hover:text-white bg-transparent"}`}
          >
            📱 FEED
          </button>
          <button
            onClick={() => setSubTab("reels")}
            className={`py-2 px-2.5 rounded-xl text-center select-none cursor-pointer border-none transition-all ${subTab === "reels" ? "bg-pink-500/15 text-pink-300 shadow" : "text-gray-400 hover:text-white bg-transparent"}`}
          >
            🎬 SNAPS/REELS
          </button>
          <button
            onClick={() => setSubTab("explore")}
            className={`py-2 px-2.5 rounded-xl text-center select-none cursor-pointer border-none transition-all ${subTab === "explore" ? "bg-[#CCFF00]/10 text-[#CCFF00] shadow" : "text-gray-400 hover:text-white bg-transparent"}`}
          >
            🔍 EXPLORE
          </button>
          <button
            onClick={() => setSubTab("profile")}
            className={`py-2 px-2.5 rounded-xl text-center select-none cursor-pointer border-none transition-all ${subTab === "profile" ? "bg-purple-500/15 text-purple-300 shadow" : "text-gray-400 hover:text-white bg-transparent"}`}
          >
            👤 MY PROFILE
          </button>
          <button
            onClick={() => setSubTab("chats")}
            className={`py-2 px-2.5 rounded-xl text-center select-none cursor-pointer border-none transition-all ${subTab === "chats" ? "bg-emerald-500/15 text-emerald-300 shadow" : "text-gray-400 hover:text-white bg-transparent"}`}
          >
            💬 CHATS ({chats.length})
          </button>
          <button
            onClick={() => setSubTab("friends")}
            className={`py-2 px-2.5 rounded-xl text-center select-none cursor-pointer border-none transition-all ${subTab === "friends" ? "bg-blue-500/15 text-blue-300 shadow" : "text-gray-400 hover:text-white bg-transparent"}`}
          >
            👥 DIRECTORY
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
        <div className="space-y-5">
          {feedPosts.map((post, index) => {
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
                        {friends.includes(post.username) && (
                          <span className="text-[8px] bg-cyan-400/10 text-cyan-300 font-bold px-1.5 py-0.5 rounded font-mono">FOLLOWING</span>
                        )}
                        <span className="text-[8px] bg-purple-500/15 text-purple-400 font-bold px-1.5 py-0.5 rounded font-mono uppercase">VERIFIED</span>
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
                  
                  {post.mediaUrl && (
                    <div className="w-full rounded-2xl overflow-hidden border border-white/5 bg-black/80 aspect-video flex items-center justify-center relative">
                      <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
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
                    <span className="text-[8.5px] font-mono text-gray-400 tracking-wider">FUEL ACADEMIC FEEDBACK:</span>
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
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2">
                  <span className="flex items-center gap-1.5 font-bold uppercase"><MessageSquare className="w-3.5 h-3.5 text-gray-500" /> {post.comments.length} Comments Threaded</span>
                  <button 
                    onClick={() => handleTriggerReport(post.id, "feed_post")}
                    className="text-rose-400 hover:text-rose-300 bg-transparent border-none cursor-pointer uppercase font-black tracking-widest scale-95"
                  >
                    🚩 REPORT
                  </button>
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
      {subTab === "reels" && reels.length > 0 && (() => {
        const currentReel = reels[activeReelIdx] || reels[0];
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
                  onClick={() => setActiveReelIdx(prev => (prev > 0 ? prev - 1 : reels.length -1))}
                  className="p-2 border border-white/10 bg-black/80 hover:bg-black text-white hover:text-[#CCFF00] transition rounded-xl cursor-pointer"
                  title="Previous Snap"
                >
                  ▲
                </button>
                <div className="text-[9px] text-[#CCFF00] bg-black/90 py-1.5 px-2 rounded-lg font-mono border border-white/5 tracking-widest text-center select-none font-bold">
                  {activeReelIdx + 1}/{reels.length}
                </div>
                <button
                  onClick={() => setActiveReelIdx(prev => (prev < reels.length - 1 ? prev + 1 : 0))}
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
              <div className="w-24 h-24 rounded-full bg-black/60 p-[4px] border-3 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] relative">
                <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="absolute -bottom-1 right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg font-mono">
                👑
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-white">@{profile.username}</h4>
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
                        {ch.recipientName.includes("AI") ? "🧠 Cloud Cyber-Mentor" : "Peer Student"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Body panel */}
            <div className="md:col-span-2 neo-glass rounded-[32px] p-5 border-white/5 bg-black/45 h-full flex flex-col justify-between h-[400px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <img src={activeSession.recipientAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-bold text-white">@{activeSession.recipientName}</span>
                </div>
                <span className="text-[8.5px] font-mono text-[#CCFF00] uppercase tracking-wider">Channel Synchronized</span>
              </div>

              {/* Chat lines stream */}
              <div className="flex-1 overflow-y-auto space-y-3.5 my-4 p-2.5 custom-scrollbar">
                {activeSession.messages.map(msg => {
                  const isYou = msg.sender === "You";
                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${isYou ? "flex-row-reverse text-right" : ""}`}>
                      <img src={msg.avatar} alt="" className="w-5.5 h-5.5 rounded-full object-cover" />
                      <div className={`p-3 rounded-2xl text-xs font-mono max-w-[80%] leading-relaxed ${
                        isYou 
                          ? "bg-gradient-to-br from-cyan-400/20 to-purple-600/10 border border-cyan-500/20 text-white" 
                          : "bg-black/55 border border-white/5 text-gray-200"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <span className="text-[8px] text-gray-500 block mt-1.5 uppercase font-black">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input direct reply field */}
              <form onSubmit={handleSendDmText} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Transmit communication packet..."
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl py-2 px-3.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50 font-mono"
                />
                <button
                  type="submit"
                  className="py-2 px-4.5 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-mono text-[10px] font-extrabold rounded-xl cursor-pointer"
                >
                  TRANSMIT
                </button>
              </form>
            </div>
          </div>
        );
      })()}

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
      {feedAudioUrl && (
        <audio ref={feedAudioInstRef} src={feedAudioUrl} loop />
      )}
    </div>
  );
};
