import React, { useState } from "react";
import { 
  Heart, MessageSquare, Share2, ThumbsDown, Send, Plus, Users, 
  Search, Bookmark, Shield, Compass, Sparkles, Check, Play, HelpCircle, 
  ChevronRight, RefreshCw, X, MessageCircle, Info, Smile, ChevronDown, UserPlus, Flame, Award
} from "lucide-react";
import { 
  UserProfile, FeedPost, ChatSession, StudyReel, StudyGroup, Comment, ChatMessage 
} from "../types";

interface InteractiveReelPlayerProps {
  reel: StudyReel;
}

export const InteractiveReelPlayer: React.FC<InteractiveReelPlayerProps> = ({ reel }) => {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Synchronize play/pause states
  React.useEffect(() => {
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

  // Synchronize mute coefficients
  React.useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    video.muted = isMuted;
    if (audio) {
      audio.muted = isMuted;
    }
  }, [isMuted]);

  // Synchronize volume coefficients
  React.useEffect(() => {
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

  // Track & correct drift so video and overlay audio stay exactly aligned
  React.useEffect(() => {
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
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        {/* Toggle Sound speaker button */}
        <button
          onClick={toggleMute}
          className="p-2.5 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/10 shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span className="text-[11px] font-mono tracking-wider font-extrabold uppercase select-none">
            {isMuted ? "🔇 SOUND MUTED" : "🔊 SOUND ACTIVE"}
          </span>
        </button>
      </div>

      {/* Soundtrack credential note on bottom rail */}
      {reel.audioUrl && (
        <div className="absolute top-14 right-4 z-40 flex flex-col items-end gap-1 pointer-events-none col-span-1">
          <div className="bg-pink-600/90 text-white border border-pink-400/30 font-mono text-[9px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md animate-pulse">
            <span className="text-xs">🎵</span>
            <span className="font-bold uppercase tracking-tight">{reel.audioName || "Stitched Audio"}</span>
          </div>
          {/* Double Stream status volume mixer metrics */}
          <div className="bg-black/60 border border-white/5 font-mono text-[8px] text-zinc-300 py-0.5 px-2 rounded">
            Mixer - Vid: {Math.round((reel.originalVolume !== undefined ? reel.originalVolume : 1)*100)}% | Snd: {Math.round((reel.audioVolume !== undefined ? reel.audioVolume : 0.75)*100)}%
          </div>
        </div>
      )}

      {/* Play/Pause state quick indicators */}
      {!isPlaying && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/30">
          <div className="bg-black/75 px-5 py-3 rounded-full border border-white/15 text-xs text-[#CCFF00] font-mono font-black uppercase tracking-widest animate-pulse">
            ⏸️ PAUSED
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
  initialSubTab?: 'feed' | 'reels' | 'chats' | 'friends';
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
  const [subTab, setSubTab] = useState<'feed' | 'reels' | 'chats' | 'friends'>(initialSubTab);
  
  // Interactive comment input states
  const [postCommentText, setPostCommentText] = useState<Record<string, string>>({});
  const [reelCommentText, setReelCommentText] = useState<Record<string, string>>({});

  // Premium pass, seconds update timer and custom video file states
  const [unlockedPremiumCelebration, setUnlockedPremiumCelebration] = useState<boolean>(false);
  const [liveSecondsCounter, setLiveSecondsCounter] = useState(0);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveSecondsCounter(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Organic video view incrementer to simulate viral views
  React.useEffect(() => {
    const viewInterval = setInterval(() => {
      setReels(prev => {
        let reachedThreshold = false;
        const mapped = prev.map(r => {
          if (r.creator === "You" || r.creator === profile.username) {
            const currentViews = r.views || 0;
            const inc = Math.floor(Math.random() * 1200) + 1100; // rises ~1.1k to 2.3k per 4s
            const nextViews = currentViews + inc;
            if (currentViews < 20000 && nextViews >= 20000) {
              reachedThreshold = true;
            }
            return {
              ...r,
              views: nextViews
            };
          }
          return r;
        });

        if (reachedThreshold) {
          const updatedProfile = {
            ...profile,
            premiumTier: "NEXA_PLUS" as any,
            premiumExpiry: Date.now() + 2 * 24 * 60 * 60 * 1000 // 2-day pass
          };
          setProfile(updatedProfile);
          setUnlockedPremiumCelebration(true);
          onGrantRewards(100, 200); // Give them 200 starting coins and 100 XP
          onAddNotification("Viral Success! 🚀", "Your Study Reel triggered 20k+ Views! Unlocked 2-Day Premium Pass with 200 daily coins! ✅", "success");
        }
        return mapped;
      });
    }, 4000);
    return () => clearInterval(viewInterval);
  }, [profile, setProfile, onGrantRewards, onAddNotification]);

  const handleReelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedVideoFile(file);
      const url = URL.createObjectURL(file);
      setNewReelVideoUrl(url);
      onAddNotification("Video Registered", "Your custom video file has been verified and buffered.", "success");
    }
  };


  
  // Reels view index
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [reelSearchQuery, setReelSearchQuery] = useState("");
  const [sharingUrl, setSharingUrl] = useState<string | null>(null);
  const [dailyPostsCount, setDailyPostsCount] = useState<number>(() => {
    const saved = localStorage.getItem("nexa_posts_day_count");
    return saved ? parseInt(saved, 10) : 0;
  });
  
  // DM active state inside NexaGram
  const [activeDmIdx, setActiveDmIdx] = useState(0);
  const [dmInput, setDmInput] = useState("");
  
  // Story display modal
  const [showingStory, setShowingStory] = useState<{
    username: string;
    avatar: string;
    topic: string;
    desc: string;
    streak: number;
  } | null>(null);

  // Upload/Post Modal ("+") State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'post' | 'reel'>('post');

  // Custom audio integration inside creation workflow
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string>("");
  const [selectedAudioName, setSelectedAudioName] = useState<string>("");
  const [reelAudioVolume, setReelAudioVolume] = useState<number>(0.75);
  const [reelOriginalVolume, setReelOriginalVolume] = useState<number>(0.50);
  const [audioSearchQuery, setAudioSearchQuery] = useState<string>("");
  const [showAudioLibrary, setShowAudioLibrary] = useState<boolean>(false);

  const audioLibraryTracks = [
    { name: "🎵 Study Beats Lofi Synth", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", category: "Focus Lofi" },
    { name: "🎵 Cyberpunk Synthwave Ambience", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", category: "Upbeat" },
    { name: "🎵 Deep Focus Alpha Waves", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", category: "Ambient" },
    { name: "🎵 Chill Academic Chillout", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", category: "Chill" },
    { name: "🎵 High-Speed Coding Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", category: "Programming" },
    { name: "🎵 Classical Brainpower Sonata", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", category: "Classical" },
    { name: "🎵 Galactic Derivation Wave", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", category: "Synthwave" },
  ];
  
  // Post upload inputs
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostTag, setNewPostTag] = useState("Olympiad Study Guide");
  const [newPostMedia, setNewPostMedia] = useState("");

  // Reel upload inputs
  const [newReelCaption, setNewReelCaption] = useState("");
  const [newReelTag, setNewReelTag] = useState("#mathtricks");
  const [newReelVideoUrl, setNewReelVideoUrl] = useState("https://assets.mixkit.co/videos/preview/mixkit-curious-student-writing-maths-formulas-41716-large.mp4");

  // Group Making Modal State
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [rawSquadName, setRawSquadName] = useState("");
  const [rawSquadIcon, setRawSquadIcon] = useState("📐");
  const [rawSquadDesc, setRawSquadDesc] = useState("");
  const [squadInvitedFriends, setSquadInvitedFriends] = useState<string[]>([]);

  // Add Friends list search state
  const [friendSearchQuery, setFriendSearchQuery] = useState("");

  // Share sheet state variables
  const [sharingTitle, setSharingTitle] = useState<string | null>(null);
  const [selectedShareChannel, setSelectedShareChannel] = useState<string | null>(null);
  const [hasSharedClaimed, setHasSharedClaimed] = useState<boolean>(false);

  // Stories list data
  const stories = [
    { username: "BioQueen_🌿", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Queen", topic: "CRISPR Editing", desc: "Just diagrammed eukaryotic molecular sequences in dynamic whiteboard!", streak: 12 },
    { username: "AuraCoder_⚡", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura", topic: "Rust Compiler Hacks", desc: "Superposition bitshifts working at 10x memory speeds!", streak: 24 },
    { username: "CodeGod_💻", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Coder", topic: "B-Tree Node Search", desc: "Speed solving competitive Olympiad graph algorithms.", streak: 18 },
    { username: "ForceMaster_⚛️", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Force", topic: "Friction Vectors", desc: "Calculating optimal orbital vectors for satellite escape.", streak: 6 },
    { username: "MoleculeWielder_🧪", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Molecule", topic: "Alkaline Electrons", desc: "Simulating molecular displacement with organic acid reactions.", streak: 9 }
  ];

  // Candidates for Add Friends network
  const peerCandidates = [
    { username: "QuantumSolver_🌌", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Quant", rank: "Gold IV", score: "2,450 XP", badge: "AURA_EXPERT" },
    { username: "ThermodynamicBorg_🔥", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Thermo", rank: "Titan II", score: "4,890 XP", badge: "FORMULA_GOD" },
    { username: "MicrobialHacker_🧬", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Microbe", rank: "Silver I", score: "1,120 XP", badge: "BIO_LAB_REBEL" },
    { username: "AlgebraicSniper_📐", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sniper", rank: "Legend I", score: "9,800 XP", badge: "OLYMPIAD_SQUAD" },
    { username: "NeuroVeda_🧠", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Veda", rank: "Titan I", score: "5,110 XP", badge: "CHRONOS_SOLVER" }
  ];

  // Global triggers
  const handleLikePost = (postId: string) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isCurrentlyLiked = post.liked;
        // If un-disliking on like
        const postWithDislikes = post as any;
        let newDislikes = postWithDislikes.dislikes || 0;
        let newDisliked = postWithDislikes.disliked || false;
        if (newDisliked) {
          newDisliked = false;
          newDislikes = Math.max(0, newDislikes - 1);
        }

        return {
          ...post,
          liked: !isCurrentlyLiked,
          likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
          dislikes: newDislikes,
          disliked: newDisliked
        };
      }
      return post;
    }));
  };

  const handleDislikePost = (postId: string) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const postWithDislikes = post as any;
        const isCurrentlyDisliked = postWithDislikes.disliked || false;
        const currentDislikes = postWithDislikes.dislikes || 0;

        let newLiked = post.liked;
        let newLikes = post.likes;
        if (newLiked) {
          newLiked = false;
          newLikes = Math.max(0, newLikes - 1);
        }

        return {
          ...post,
          liked: newLiked,
          likes: newLikes,
          disliked: !isCurrentlyDisliked,
          dislikes: isCurrentlyDisliked ? Math.max(0, currentDislikes - 1) : currentDislikes + 1
        } as any;
      }
      return post;
    }));
  };

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
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));

    setPostCommentText(prev => ({ ...prev, [postId]: "" }));
    onGrantRewards(5, 0);
    onAddNotification("Comment Synced", "Academic remarks indexed into thread node.", "success");
  };

  // Reels interactive functions
  const handleLikeReel = (reelId: string) => {
    setReels(prev => prev.map(r => {
      if (r.id === reelId) {
        const currentlyLiked = r.liked;
        let newDislikes = r.dislikes || 0;
        let newDisliked = r.disliked || false;
        if (newDisliked) {
          newDisliked = false;
          newDislikes = Math.max(0, newDislikes - 1);
        }

        return {
          ...r,
          liked: !currentlyLiked,
          likes: currentlyLiked ? r.likes - 1 : r.likes + 1,
          dislikes: newDislikes,
          disliked: newDisliked
        };
      }
      return r;
    }));
  };

  const handleDislikeReel = (reelId: string) => {
    setReels(prev => prev.map(r => {
      if (r.id === reelId) {
        const currentlyDisliked = r.disliked || false;
        const currentDislikes = r.dislikes || 0;

        let newLiked = r.liked;
        let newLikes = r.likes;
        if (newLiked) {
          newLiked = false;
          newLikes = Math.max(0, newLikes - 1);
        }

        return {
          ...r,
          liked: newLiked,
          likes: newLikes,
          disliked: !currentlyDisliked,
          dislikes: currentlyDisliked ? Math.max(0, currentDislikes - 1) : currentDislikes + 1
        };
      }
      return r;
    }));
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
        const existingComments = r.commentsList || [];
        return {
          ...r,
          comments: r.comments + 1,
          commentsList: [...existingComments, newComment]
        };
      }
      return r;
    }));

    setReelCommentText(prev => ({ ...prev, [reelId]: "" }));
    onGrantRewards(5, 0);
    onAddNotification("Reel Remark Loaded", "Comment synced directly to video streamer core.", "success");
  };

  const handleShareNode = (title: string, url?: string) => {
    setSharingTitle(title);
    setSharingUrl(url || `https://nexasnap.edu/post/${Math.floor(Math.random() * 10000)}`);
    setSelectedShareChannel(null);
    setHasSharedClaimed(false);
  };

  // Upload actions
  const triggerPublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (dailyPostsCount >= 10) {
      onAddNotification("Post Limit Hit", "You reached your daily cap of 10 academic posts/reels.", "warning");
      return;
    }
    if (!newPostCaption.trim()) return;

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
      mediaUrl: newPostMedia.trim() ? newPostMedia.trim() : undefined
    };

    const nextCount = dailyPostsCount + 1;
    setDailyPostsCount(nextCount);
    localStorage.setItem("nexa_posts_day_count", String(nextCount));

    setFeedPosts([uploadedPost, ...feedPosts]);
    setUploadModalOpen(false);
    setNewPostCaption("");
    setNewPostMedia("");

    onGrantRewards(50, 0, 10);
    onAddNotification("Academic Post Active", "NexaGram verified post coefficients. Claim voucher created!", "success");
  };

  const triggerPublishReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (dailyPostsCount >= 10) {
      onAddNotification("Upload Limit Hit", "You reached your daily cap of 10 academic posts/reels.", "warning");
      return;
    }
    if (!newReelCaption.trim()) return;

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

    const nextCount = dailyPostsCount + 1;
    setDailyPostsCount(nextCount);
    localStorage.setItem("nexa_posts_day_count", String(nextCount));

    setReels([uploadedReel, ...reels]);
    setUploadModalOpen(false);
    setNewReelCaption("");
    setSelectedAudioUrl("");
    setSelectedAudioName("");
    setReelAudioVolume(0.75);
    setReelOriginalVolume(0.50);
    setActiveReelIdx(0); // View the newly posted reel!
    setSubTab("reels"); // Instantly switch to the reels tab!

    onGrantRewards(100, 0, 20);
    onAddNotification("Study Reel Live", "Dispatched educational media clip packet. Claim pending rewards!", "success");
  };

  // Add friend workflow
  const triggerAddFriend = (targetName: string) => {
    if (friends.includes(targetName)) return;
    const updated = [...friends, targetName];
    setFriends(updated);

    // Save profile change persistently
    const updatedProfile = { ...profile, friends: updated };
    setProfile(updatedProfile);
    localStorage.setItem("nexasnap_user", JSON.stringify(updatedProfile));

    onGrantRewards(25, 0);
    onAddNotification(
      "Bond Established! 👥", 
      `Peer @${targetName} synchronized into your local direct nodes catalog! Granted study assets.`, 
      "success"
    );
  };

  // Create chat session with friend
  const triggerStartDirectMessage = (friendName: string) => {
    const existing = chats.findIndex(ch => ch.recipientName.includes(friendName));
    if (existing >= 0) {
      setActiveDmIdx(existing);
      setSubTab("chats");
      return;
    }

    // Spawn new empty direct session
    const spawned: ChatSession = {
      id: `ch_added_${Date.now()}`,
      recipientName: friendName,
      recipientAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${friendName.substring(0,4)}`,
      online: true,
      messages: [
        { id: `cm_spawn_${Date.now()}`, sender: friendName, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${friendName.substring(0,4)}`, text: `Awesome node synergy! Ask me anything regarding study modules.`, time: "Just now", reactions: {} }
      ]
    };

    setChats([spawned, ...chats]);
    setActiveDmIdx(0);
    setSubTab("chats");
    onAddNotification("Direct Channel Spawned", `Secure messaging session compiled with @${friendName}.`, "info");
  };

  // Send DM message inside NexaGram
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
        return {
          ...s,
          messages: updatedMessages
        };
      }
      return s;
    });

    setChats(updatedSessions);
    setDmInput("");

    // Simulate quick intelligent AI response if it's the AI Cyber-Mentor
    if (activeSession.recipientName.toLowerCase().includes("ai")) {
      setTimeout(() => {
        const responseMessage: ChatMessage = {
          ...newMessage,
          id: `m_mentor_reply_${Date.now()}`,
          sender: activeSession.recipientName,
          avatar: activeSession.recipientAvatar,
          text: `Neural logic synchronized. I've logged: "${newMessage.text}" into the Olympiad Core system. Focus on standard variables!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChats(prev => prev.map((s, idx) => {
          if (idx === activeDmIdx) {
            return { ...s, messages: [...s.messages, responseMessage] };
          }
          return s;
        }));
      }, 1000);
    }
  };

  // Group creation action
  const triggerConstructSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawSquadName.trim()) return;

    const newSquad: StudyGroup = {
      id: `g_new_${Date.now()}`,
      name: rawSquadName.trim(),
      icon: rawSquadIcon,
      description: rawSquadDesc.trim() || "Active group workspace for compiling formula and answers logs.",
      membersCount: 1 + squadInvitedFriends.length,
      leaderboard: [
        { username: profile.username || "You", xp: profile.xp },
        ...squadInvitedFriends.map(f => ({ username: f, xp: 50 }))
      ],
      sharedNotesCount: 0,
      activeVoiceRooms: 0
    };

    setStudyGroups([newSquad, ...studyGroups]);
    setGroupModalOpen(false);
    setRawSquadName("");
    setRawSquadDesc("");
    setSquadInvitedFriends([]);

    onGrantRewards(50, 0);
    onAddNotification("Squad Node Compiled", `Successfully established elite group "${rawSquadName.trim()}"! Let's study!`, "success");
  };

  // Filter peers search
  const filteredPeers = peerCandidates.filter(p => 
    p.username.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  // Real-time calculated online student sessions with dynamic timer offsets
  const loginTimestampStr = localStorage.getItem("nexa_login_time") || (Date.now() - 30000).toString();
  const loginTimestamp = parseInt(loginTimestampStr, 10);

  const getActiveSinceStr = (timestampOffsetMs: number) => {
    const elapsedSecs = Math.max(1, Math.floor((Date.now() - timestampOffsetMs) / 1000));
    if (elapsedSecs < 60) {
      return `${elapsedSecs}s ago`;
    }
    const elapsedMins = Math.floor(elapsedSecs / 60);
    const secsLeft = elapsedSecs % 60;
    return `${elapsedMins}m ${secsLeft}s ago`;
  };

  const getLoginTimeDisplay = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const activeRealtimeSessions = [
    {
      id: "session_you",
      username: profile.username || "You",
      avatar: profile.avatar,
      loginTimeDisplay: getLoginTimeDisplay(loginTimestamp),
      activeSinceStr: getActiveSinceStr(loginTimestamp),
      isYou: true
    },
    {
      id: "session_thermo",
      username: "ThermodynamicBorg_🔥",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Thermo",
      loginTimeDisplay: getLoginTimeDisplay(Date.now() - 320000), // ~5m ago
      activeSinceStr: getActiveSinceStr(Date.now() - 320000),
      isYou: false
    },
    {
      id: "session_sniper",
      username: "AlgebraicSniper_📐",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sniper",
      loginTimeDisplay: getLoginTimeDisplay(Date.now() - 110000), // ~2m ago
      activeSinceStr: getActiveSinceStr(Date.now() - 110000),
      isYou: false
    },
    {
      id: "session_quantum",
      username: "QuantumSolver_🌌",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Quant",
      loginTimeDisplay: getLoginTimeDisplay(Date.now() - 45000), // ~45s ago
      activeSinceStr: getActiveSinceStr(Date.now() - 45000),
      isYou: false
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* ─── NEXAGRAM PREMIUM INSTAGRAM HEADER ─── */}
      <div className="neo-glass rounded-[32px] p-5 border-white/5 relative bg-black/40 overflow-hidden flex flex-col gap-4">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#FF007F]/10 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#CCFF00]/5 blur-[80px] pointer-events-none rounded-full" />

        <div className="flex justify-between items-center z-10 relative">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📸</span>
            <div>
              <h3 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF307F] via-[#7B61FF] to-[#CCFF00] font-sans">
                NEXAGRAM
              </h3>
              <p className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">
                Academic Engagement Ecosystem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct "+" Create Trigger Button */}
            <button
              onClick={() => {
                setUploadType('post');
                setUploadModalOpen(true);
              }}
              id="instg_quick_upload_btn"
              className="flex items-center gap-1.5 py-2 px-4 bg-gradient-to-r from-cyan-400 to-[#7B61FF] text-black font-extrabold text-[11px] rounded-xl font-mono hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(123,97,255,0.4)] border-none cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              CREATE NODE
            </button>
          </div>
        </div>

        {/* ─── INSTAGRAM STORIES AREA ─── */}
        <div className="border-t border-b border-white/5 py-4 overflow-x-auto select-none">
          <div className="flex gap-4 items-center pl-1">
            
            {/* User own story add circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div 
                onClick={() => {
                  setUploadType('post');
                  setUploadModalOpen(true);
                }}
                className="w-16 h-16 rounded-full bg-white/5 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-white/10 transition-all relative"
              >
                <img src={profile.avatar} alt="You" className="w-12 h-12 rounded-full" />
                <div className="absolute bottom-0 right-0 bg-cyan-400 text-black rounded-full p-0.5 border border-black">
                  <Plus className="w-3 h-3 font-bold" />
                </div>
              </div>
              <span className="text-[10px] text-gray-400 mt-1.5 truncate max-w-[70px]">Your Story</span>
            </div>

            {/* Other stories */}
            {stories.map((story) => (
              <div 
                key={story.username} 
                onClick={() => setShowingStory(story)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-[#CCFF00] via-[#FF007F] to-[#7B61FF] group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#121214] p-[2px] flex items-center justify-center">
                    <img src={story.avatar} alt={story.username} className="w-12 h-12 rounded-full bg-black/60" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-300 mt-1.5 truncate max-w-[75px] group-hover:text-[#CCFF00]">
                  {story.username.replace("_", "")}
                </span>
                <span className="text-[8px] text-amber-400 font-mono flex items-center gap-0.5">
                  🔥 {story.streak}d
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── RESTEERED INSTAGRAM TABS SELECTOR ─── */}
        <div className="grid grid-cols-4 gap-1.5 bg-black/30 p-1 rounded-2xl border border-white/5 font-mono text-[10px]">
          <button
            onClick={() => setSubTab("feed")}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer ${subTab === "feed" ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-white"}`}
          >
            📱 FEED
          </button>
          <button
            onClick={() => setSubTab("reels")}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer ${subTab === "reels" ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-white"}`}
          >
            🎬 REELS
          </button>
          <button
            onClick={() => setSubTab("chats")}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer ${subTab === "chats" ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-white"}`}
          >
            💬 MESSAGES
          </button>
          <button
            onClick={() => setSubTab("friends")}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer ${subTab === "friends" ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-white"}`}
          >
            👥 DIRECTORY
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🎬 1. INSTAGRAM STORY PLAYER OVERLAY */}
      {/* ──────────────────────────────────────────────────────── */}
      {showingStory && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-[32px] overflow-hidden border border-white/10 bg-[#121216] relative flex flex-col justify-between p-6 h-[500px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF007F]/5 blur-3xl pointer-events-none rounded-full" />
            
            {/* Header top story */}
            <div>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <img src={showingStory.avatar} alt="" className="w-8 h-8 rounded-full border border-[#FF007F]" />
                  <div>
                    <span className="text-xs font-bold text-white block">@{showingStory.username}</span>
                    <span className="text-[9px] text-[#CCFF00] font-mono">Streak: {showingStory.streak} Continuous Days</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowingStory(null)}
                  className="p-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Simulation Bar */}
              <div className="w-full bg-white/5 h-1 rounded-full mb-6 overflow-hidden">
                <div className="bg-[#FF007F] h-full w-[85%] animate-[pulse_4s_infinite]" />
              </div>

              {/* Content box */}
              <div className="bg-black/60 border border-white/5 rounded-2xl p-5 space-y-4 text-center mt-6">
                <span className="px-2.5 py-0.5 bg-[#FF007F]/20 text-[#FF007F] text-[9px] font-mono rounded-full font-bold uppercase tracking-wider">
                  {showingStory.topic}
                </span>
                <p className="text-xs text-gray-200 leading-relaxed italic">
                  "{showingStory.desc}"
                </p>
              </div>
            </div>

            {/* Quick action bottom */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  triggerStartDirectMessage(showingStory.username);
                  setShowingStory(null);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-[#FF007F] to-[#7B61FF] text-white font-bold text-xs rounded-xl cursor-pointer hover:opacity-90 border-none uppercase font-mono"
              >
                ⚡ SEND DIRECT MESSAGE REACTION
              </button>
              <button
                onClick={() => {
                  triggerAddFriend(showingStory.username);
                }}
                className="w-full py-2.5 bg-white/5 text-gray-300 font-bold text-xs rounded-xl hover:bg-white/10 cursor-pointer border border-white/5 uppercase font-mono"
              >
                Add as Friend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 📱 VIEW TAB: POST FEED */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "feed" && (
        <div className="space-y-5">
          {feedPosts.map((post) => {
            const hasDisliked = (post as any).disliked || false;
            const dislikesCount = (post as any).dislikes || 0;
            const commentVal = postCommentText[post.id] || "";

            return (
              <div key={post.id} className="neo-glass rounded-[32px] p-6 border-white/5 relative bg-black/40 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
                
                {/* Header post */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <img src={post.avatar} alt="" className="w-9 h-9 rounded-full bg-black/60 border border-white/5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white">@{post.username}</h4>
                        {friends.includes(post.username) && (
                          <span className="text-[8px] bg-cyan-400/20 text-cyan-300 font-bold px-1.5 py-0.2 rounded font-mono">FRIEND</span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 block font-mono">{post.timeAgo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.tag && (
                      <span className="text-[9px] font-mono text-cyan-300 bg-cyan-400/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        #{post.tag.replace(" ", "")}
                      </span>
                    )}

                    {/* Quick Friend Addition Option if not currently bonded */}
                    {!friends.includes(post.username) && post.username !== profile.username && (
                      <button 
                        onClick={() => triggerAddFriend(post.username)}
                        className="py-1 px-2 text-[9px] bg-white/5 text-gray-300 hover:text-white border border-white/5 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-2.5 h-2.5" />
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-4">
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Optional Mock Illustration Content if exists */}
                  {post.mediaUrl && (
                    <div className="w-full rounded-2xl overflow-hidden border border-white/5 bg-black/80 aspect-video flex items-center justify-center relative">
                      <img src={post.mediaUrl} alt="Visual Pack" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white font-mono text-[8px] py-1 px-2 rounded backdrop-blur border border-white/5">
                        ATTACHED SNAPSHOT MODULE
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── DYNAMIC ACTION BUTTON BAR ─── */}
                <div className="flex items-center justify-between border-t border-b border-white/5 py-3.5 my-4 text-xs font-mono select-none">
                  <div className="flex items-center gap-5">
                    
                    {/* HEART LIKE BUTTON */}
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer border-none bg-transparent ${post.liked ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} /> 
                      <span>{post.likes}</span>
                    </button>

                    {/* DISLIKE BUTTON */}
                    <button 
                      onClick={() => handleDislikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer border-none bg-transparent ${hasDisliked ? 'text-[#FF4A4A] font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                      <ThumbsDown className={`w-4 h-4 ${hasDisliked ? "fill-current" : ""}`} /> 
                      <span>{dislikesCount}</span>
                    </button>

                    {/* COMMENT ICON LINK */}
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white cursor-pointer border-none bg-transparent">
                      <MessageSquare className="w-4 h-4" /> 
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  {/* SHARE COPY LINK */}
                  <button 
                    onClick={() => handleShareNode(post.content.substring(0, 30))}
                    className="flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>SHARE</span>
                  </button>
                </div>

                {/* ─── COMMENTS LIST ─── */}
                <div className="space-y-3.5 max-h-48 overflow-y-auto pl-2">
                  {post.comments.length === 0 ? (
                    <p className="text-[10px] text-gray-500 italic pl-1">No study logs written on this thread. Be the first to analyze!</p>
                  ) : (
                    post.comments.map(comment => (
                      <div key={comment.id} className="flex gap-2 text-xs border-b border-white/2 pb-2">
                        <img src={comment.avatar} alt="" className="w-6 h-6 rounded-full border border-white/5" />
                        <div className="flex-1">
                          <span className="font-extrabold text-white text-[10px]">@{comment.username}</span>
                          <p className="text-gray-300 text-[11px] leading-relaxed mt-0.5">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ─── COMMENT TYPING INPUT ─── */}
                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={commentVal}
                    onChange={(e) => setPostCommentText({ ...postCommentText, [post.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddPostCommentInline(post.id);
                    }}
                    placeholder="Contribute core findings to thread..."
                    className="flex-1 bg-[#121216] text-[11px] text-white py-2 px-3 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddPostCommentInline(post.id)}
                    className="py-2 px-4 bg-[#CCFF00] text-black font-extrabold text-[10px] rounded-xl hover:bg-cyan-400 transition-all font-mono border-none cursor-pointer"
                  >
                    POST
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 🎬 VIEW TAB: REELS STREAM */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "reels" && (
        <div className="space-y-5">
          {/* 🔍 SEARCH AND DISPATCH HEADER */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-3xl flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex-1 w-full relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input
                type="text"
                value={reelSearchQuery}
                onChange={(e) => setReelSearchQuery(e.target.value)}
                placeholder="Search channel or reel sender name..."
                className="w-full bg-black/60 text-xs text-white py-2 pl-10 pr-4 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-[#CCFF00] font-mono"
              />
            </div>
            <div className="text-[10px] text-gray-400 font-mono text-right flex-shrink-0">
               ACTIVE BROADCASTS: <strong className="text-[#CCFF00]">{reels.length}</strong>
            </div>
          </div>

          {/* REAL SCROLL CONTAINER OF CARDS */}
          <div className="flex flex-col gap-6 max-h-[720px] overflow-y-auto custom-scrollbar pr-1">
            {(() => {
              const filteredReels = reels.filter(r => 
                r.creator.toLowerCase().includes(reelSearchQuery.toLowerCase()) || 
                r.caption.toLowerCase().includes(reelSearchQuery.toLowerCase()) ||
                r.tags.some(t => t.toLowerCase().includes(reelSearchQuery.toLowerCase()))
              );

              if (filteredReels.length === 0) {
                return (
                  <div className="text-center py-12 bg-white/2 rounded-3xl border border-white/5">
                    <p className="text-xs text-gray-400">No matching student media broadcasts found.</p>
                  </div>
                );
              }

              return filteredReels.map((currentReel) => {
                const hasReelDisliked = currentReel.disliked || false;
                const reelDislikesCount = currentReel.dislikes || 0;
                const commentsList = currentReel.commentsList || [];
                const activeCommentVal = reelCommentText[currentReel.id] || "";

                return (
                  <div key={currentReel.id} className="max-w-[420px] w-full mx-auto bg-black rounded-[36px] overflow-hidden border border-white/10 h-[640px] relative flex flex-col justify-between p-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex-shrink-0">
                    
                     {/* ─── STAGE: REELS VIDEO PLAYER ─── */}
                    <div className="bg-[#09090b] rounded-3xl overflow-hidden h-full relative flex items-center justify-center border border-white/5">
                      <InteractiveReelPlayer reel={currentReel} />

                      {/* Top indicators */}
                      <div className="absolute top-4 inset-x-4 z-30 flex justify-between items-center pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-mono text-[#CCFF00] font-bold tracking-widest uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          👁️ {((currentReel.views || 0) >= 1000) ? `${((currentReel.views || 0)/1000).toFixed(1)}k` : currentReel.views || 0} views
                        </div>
                      </div>

                      {/* Pulsing Visual Mock Image/Video Sandbox */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40 w-full h-full flex flex-col justify-end p-5 select-none z-10 pointer-events-none">
                        <div className="space-y-3 max-w-[85%] mb-4 pointer-events-auto">
                          <div className="flex items-center gap-2">
                            <img src={currentReel.creatorAvatar} alt="" className="w-8 h-8 rounded-full border border-[#FF007F] p-[1px] bg-black" />
                            <span className="text-xs font-bold text-white">@{currentReel.creator}</span>
                            {!friends.includes(currentReel.creator) && currentReel.creator !== profile.username && (
                              <button 
                                onClick={() => triggerAddFriend(currentReel.creator)}
                                className="px-2.5 py-0.5 bg-[#CCFF00] hover:bg-cyan-400 text-black rounded-lg text-[9px] font-black tracking-wider uppercase border-none cursor-pointer"
                              >
                                Add
                              </button>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-gray-100 line-clamp-3 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,1)] font-medium">
                            {currentReel.caption}
                          </p>

                          <div className="flex gap-1 flex-wrap">
                            {currentReel.tags.map(tag => (
                              <span key={tag} className="text-[9px] text-[#CCFF00] font-mono bg-black/45 px-2 py-0.5 rounded border border-white/5">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ─── INS-STYLE FLOATING SIDEBAR ACTIONS ─── */}
                    <div className="absolute right-8 bottom-32 flex flex-col gap-5 text-center z-30 bg-black/75 p-3 rounded-2xl border border-white/15 backdrop-blur shadow-2xl">
                      
                      {/* LIKE BUTTON */}
                      <button 
                        onClick={() => handleLikeReel(currentReel.id)} 
                        className="flex flex-col items-center bg-transparent border-none cursor-pointer text-gray-300 hover:text-white"
                      >
                        <Heart className={`w-5 h-5 ${currentReel.liked ? 'text-red-500 fill-current' : 'text-gray-300'}`} />
                        <span className="text-[9px] font-mono font-bold mt-1 text-gray-300">{currentReel.likes}</span>
                      </button>

                      {/* DISLIKE BUTTON */}
                      <button 
                        onClick={() => handleDislikeReel(currentReel.id)} 
                        className="flex flex-col items-center bg-transparent border-none cursor-pointer text-gray-300 hover:text-white"
                      >
                        <ThumbsDown className={`w-5 h-5 ${hasReelDisliked ? 'text-[#FF4A4A] fill-current' : 'text-gray-300'}`} />
                        <span className="text-[9px] font-mono font-bold mt-1 text-gray-300">{reelDislikesCount}</span>
                      </button>

                      {/* SHARE BUTTON */}
                      <button 
                        onClick={() => handleShareNode(currentReel.caption.substring(0, 30), currentReel.videoUrl)} 
                        className="flex flex-col items-center bg-transparent border-none cursor-pointer text-cyan-400 hover:text-cyan-300"
                      >
                        <Share2 className="w-5 h-5 text-cyan-400" />
                        <span className="text-[9px] font-mono mt-1 font-bold">SHARE</span>
                      </button>

                      {/* SAVE ACTION */}
                      <button 
                        onClick={() => {
                          setReels(prev => prev.map(r => r.id === currentReel.id ? { ...r, saved: !r.saved } : r));
                          onAddNotification("Reel Saved", "Media saved securely to private vault.", "info");
                        }}
                        className="flex flex-col items-center bg-transparent border-none cursor-pointer text-gray-300"
                      >
                        <Bookmark className={`w-5 h-5 ${currentReel.saved ? 'text-[#CCFF00] fill-current' : 'text-gray-300'}`} />
                        <span className="text-[9px] font-mono mt-1 font-bold">{currentReel.saved ? "SAVED" : "SAVE"}</span>
                      </button>
                    </div>

                    {/* ─── REEL COMMENT INLINE DRAWER (INSTAGRAM DESIGN) ─── */}
                    <div className="bg-[#121216] border border-white/5 rounded-2xl p-3.5 mt-3 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="text-[10px] font-black text-gray-400 font-mono flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> 
                          COMMENTS ({commentsList.length})
                        </span>
                      </div>

                      {/* Message Stream */}
                      <div className="max-h-[105px] overflow-y-auto space-y-2 pr-1">
                        {commentsList.length === 0 ? (
                          <p className="text-[9px] text-gray-500 italic">No feedback registered yet. Add scientific analysis below!</p>
                        ) : (
                          commentsList.map(c => (
                            <div key={c.id} className="flex gap-2 text-[10px]">
                              <span className="font-extrabold text-cyan-400 text-[9px]">@{c.username}:</span>
                              <span className="text-gray-200 leading-normal">{c.text}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Write input inside details */}
                      <div className="flex gap-1.5 mt-1">
                        <input
                          type="text"
                          value={activeCommentVal}
                          onChange={(e) => setReelCommentText({ ...reelCommentText, [currentReel.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddReelCommentInline(currentReel.id);
                          }}
                          placeholder="Input feedback matrix..."
                          className="flex-1 bg-black text-[10px] text-white py-1.5 px-2.5 rounded-lg border border-white/5 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddReelCommentInline(currentReel.id)}
                          className="py-1.5 px-3 bg-[#CCFF00] text-black font-extrabold text-[9px] rounded-lg hover:bg-cyan-400 border-none cursor-pointer"
                        >
                          SEND
                        </button>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 💬 VIEW TAB: INSTAGRAM DIRECT MESSAGES (DMs) */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "chats" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[550px] relative">
          
          {/* Inbox Direct left rail */}
          <div className="neo-glass rounded-3xl p-4 border-white/5 overflow-y-auto flex flex-col gap-3 h-full bg-black/40">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono text-gray-400 font-extrabold uppercase tracking-widest pl-1">
                INSTA DIRECTS ({chats.length})
              </span>
              
              {/* Squad Making Button directly embedded under Chat system */}
              <button
                onClick={() => setGroupModalOpen(true)}
                className="py-1 px-2.5 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 font-bold text-[9px] rounded-lg border border-cyan-400/30 cursor-pointer transition-all uppercase font-mono"
              >
                + GROUP
              </button>
            </div>

            <div className="space-y-2">
              {chats.map((ch, idx) => (
                <div
                  key={ch.id}
                  onClick={() => setActiveDmIdx(idx)}
                  className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${activeDmIdx === idx ? 'bg-gradient-to-r from-[#7B61FF]/10 to-transparent border border-[#7B61FF]/20 text-[#7B61FF]' : 'bg-white/2 hover:bg-white/5 border border-white/2'}`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={ch.recipientAvatar} alt="" className="w-9 h-9 rounded-full bg-black/60 border border-white/5" />
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${ch.online ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white mb-0.5 truncate">@{ch.recipientName}</h5>
                    <p className="text-[9px] text-gray-400 truncate leading-none">
                      {ch.messages[ch.messages.length - 1]?.text || "No interactions log."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active DM thread simulation workspace */}
          <div className="md:col-span-2 neo-glass rounded-3xl p-4 border-white/5 flex flex-col justify-between h-full overflow-hidden bg-black/40">
            {chats[activeDmIdx] ? (() => {
              const ch = chats[activeDmIdx];
              return (
                <div className="flex flex-col justify-between h-full overflow-hidden">
                  
                  {/* Active Sender Box Header */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img src={ch.recipientAvatar} alt="" className="w-8 h-8 rounded-full bg-black/60 border border-white/5" />
                        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-black ${ch.online ? 'bg-green-500' : 'bg-gray-500'}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">@{ch.recipientName}</h4>
                        <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest block leading-none">
                          {ch.online ? "SECURE CHAT SYNCED" : "OFFLINE CORES"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-white/5 text-gray-400 font-mono px-2 py-0.5 rounded border border-white/5 uppercase">
                        Nexa Tunnel
                      </span>
                    </div>
                  </div>

                  {/* Messages Bubble Array */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 pl-1">
                    {ch.messages.map((msg) => {
                      const isMe = msg.sender === "You";
                      return (
                        <div key={msg.id} className={`flex gap-2.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                          <img src={msg.avatar} alt="" className="w-6 h-6 rounded-full bg-slate-900 border border-white/10" />
                          <div>
                            <div className={`py-2 px-3 rounded-2xl text-[11px] leading-relaxed ${isMe ? 'bg-[#CCFF00] text-black rounded-tr-none font-medium' : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'}`}>
                              {msg.text}
                            </div>
                            <span className="text-[8px] font-mono text-gray-500 block mt-0.5 px-0.5 text-right">{msg.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Send chat entry form */}
                  <form onSubmit={handleSendDmText} className="flex gap-2">
                    <input
                      type="text"
                      value={dmInput}
                      onChange={(e) => setDmInput(e.target.value)}
                      placeholder={`Direct message @${ch.recipientName}...`}
                      className="flex-1 bg-[#121216] text-[11px] text-white py-2.5 px-4 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      className="p-2.5 bg-[#CCFF00] hover:bg-cyan-400 text-black rounded-xl border-none font-bold transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              );
            })() : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-400">Select standard direct threads on left panel to initialize telemetry.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 👥 VIEW TAB: PEERS DIRECTORY & ADD FRIENDS */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "friends" && (
        <div className="space-y-6">
          
          {/* Search peers box */}
          <div className="neo-glass rounded-2xl p-4 border-white/5 bg-black/40 flex items-center gap-3">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={friendSearchQuery}
              onChange={(e) => setFriendSearchQuery(e.target.value)}
              placeholder="Filter student node directory, handle tags or academic badges..."
              className="flex-1 bg-transparent text-xs text-white border-none focus:outline-none focus:ring-0"
            />
          </div>

          {/* 🌐 LIVE CHRONOLOGICAL NETWORK LOGIN REGISTRY */}
          <div className="neo-glass rounded-[28px] p-5 border-[#CCFF00]/10 bg-black/50 space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/5 blur-2xl rounded-full pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-[10px] font-black text-[#CCFF00] font-mono flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
                Live Global Active Sessions ({activeRealtimeSessions.length} Online)
              </span>
              <span className="text-[8px] font-mono text-cyan-300 font-bold tracking-widest bg-cyan-400/10 px-1.5 py-0.5 rounded">REALTIME MULTIPLEX</span>
            </div>

            <div className="divide-y divide-white/5 space-y-2 max-h-[170px] overflow-y-auto pr-2 custom-scrollbar">
              {activeRealtimeSessions.map((session) => (
                <div key={session.id} className="flex justify-between items-center text-xs pt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={session.avatar} alt="" className="w-7 h-7 rounded-full border border-white/10 bg-black p-[1px]" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-black" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-[11px]">@{session.username}</span>
                      <span className="text-[8px] text-gray-400 font-mono">NODE STATE // SYNCED</span>
                    </div>
                    {session.isYou && (
                      <span className="text-[8px] bg-[#CCFF00] text-black px-1.5 py-0.2 rounded font-mono font-black uppercase">YOU</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-right font-mono text-[9px]">
                    <span className="text-gray-300">Logged in at {session.loginTimeDisplay}</span>
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                      Active: {session.activeSinceStr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPeers.map((peer) => {
              const isAlreadyFriend = friends.includes(peer.username);
              return (
                <div key={peer.username} className="neo-glass rounded-3xl p-5 border-white/5 bg-black/40 flex justify-between items-center">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img src={peer.avatar} alt="" className="w-11 h-11 rounded-full bg-slate-900 border border-white/5 p-0.5" />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-black animate-ping" />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-black" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white">@{peer.username}</h5>
                      <div className="flex gap-1.5 items-center mt-1">
                        <span className="text-[8px] bg-cyan-400/10 text-cyan-300 font-mono font-bold px-1.5 py-0.2 rounded">
                          {peer.rank}
                        </span>
                        <span className="text-[8px] bg-[#CCFF00]/10 text-[#CCFF00] font-mono font-bold px-1.5 py-0.2 rounded">
                          {peer.score}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 font-mono">
                    {isAlreadyFriend ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] text-[#CCFF00] text-right font-bold uppercase">CONNECTED ✓</span>
                        <button
                          onClick={() => triggerStartDirectMessage(peer.username)}
                          className="py-1 px-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-bold border border-white/5 cursor-pointer uppercase"
                        >
                          Send DM
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => triggerAddFriend(peer.username)}
                        className="py-1.5 px-4 bg-[#CCFF00] hover:bg-cyan-400 text-black font-extrabold text-[9px] rounded-xl border-none cursor-pointer uppercase font-black"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-cyan-400/5 rounded-3xl border border-cyan-400/10 text-left text-xs leading-relaxed text-cyan-300">
            💡 <strong>NETWORKING REWARDS:</strong> Expanding your peer network unlocks mutual Pomodoro study multiplayer grids, collaborative voice boards, and yields +25 XP +10 Coins per synchronized user trace.
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ➕ INSTAGRAM CONTENT CREATOR MODAL ("+") */}
      {/* ──────────────────────────────────────────────────────── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="w-full max-w-lg rounded-[36px] bg-[#0d0d10] border border-white/10 p-6 relative flex flex-col justify-between overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/15 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-center mb-6">
                <h4 className="text-lg font-black text-white uppercase tracking-widest">
                  COMPILE SOCIAL ASSET
                </h4>
                <p className="text-[10px] text-cyan-400 font-mono mt-1">Publish interactive academic logs directly into the network</p>
              </div>

              {/* Upload Type selector (Posts vs Reels) */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/30 border border-white/5 rounded-2xl mb-6 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setUploadType('post')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer border-none ${uploadType === 'post' ? "bg-[#CCFF00] text-black" : "text-gray-400 bg-transparent hover:text-white"}`}
                >
                  📱 FEED POST
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('reel')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer border-none ${uploadType === 'reel' ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white" : "text-gray-400 bg-transparent hover:text-white"}`}
                >
                  🎬 BROADCAST REEL
                </button>
              </div>

              {/* Form Posts */}
              {uploadType === 'post' ? (
                <form onSubmit={triggerPublishPost} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block uppercase mb-1.5">Caption Details</label>
                    <textarea
                      value={newPostCaption}
                      onChange={(e) => setNewPostCaption(e.target.value)}
                      placeholder="Outline formulas, share study goals, compile answers logs, or write competitive prep advice..."
                      className="w-full h-28 bg-black/40 text-xs text-white p-3 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none resize-none leading-relaxed"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block uppercase mb-1.5">Subject Tag</label>
                      <select
                        value={newPostTag}
                        onChange={(e) => setNewPostTag(e.target.value)}
                        className="w-full bg-black text-xs text-cyan-400 border border-white/10 p-2 rounded-xl focus:outline-none"
                      >
                        <option>Algebra Study</option>
                        <option>Physics Formula</option>
                        <option>Chemistry Notes</option>
                        <option>Olympiad Hack</option>
                        <option>General Study Guide</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block uppercase mb-1.5">Simulation Media Image</label>
                      <select
                        value={newPostMedia}
                        onChange={(e) => setNewPostMedia(e.target.value)}
                        className="w-full bg-black text-xs text-cyan-400 border border-white/10 p-2 rounded-xl focus:outline-none"
                      >
                        <option value="">No Media Attached</option>
                        <option value="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60">Interactive Study Desk</option>
                        <option value="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&auto=format&fit=crop&q=60">Quantum Equations Chalkboard</option>
                        <option value="https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop&q=60">Global Virtual Desk</option>
                      </select>
                    </div>
                  </div>

                  {newPostMedia && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/5 relative">
                      <img src={newPostMedia} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/60 text-cyan-400 font-mono text-[8px] py-1 px-2 rounded">
                        MEDIA PREVIEW TARGETED
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-[#CCFF00] text-black font-extrabold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all text-center border-none cursor-pointer uppercase font-mono shadow-[0_4px_16px_rgba(204,255,0,0.3)]"
                  >
                    PROCEED & INITIALLY PUBLISH POST
                  </button>
                </form>
              ) : (
                <form onSubmit={triggerPublishReel} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono block uppercase mb-1.5">Video Caption / Hack</label>
                    <textarea
                      value={newReelCaption}
                      onChange={(e) => setNewReelCaption(e.target.value)}
                      placeholder="Write short catchy math hacks, gravity vectors explanation or organic electron swaps under 2 seconds..."
                      className="w-full h-24 bg-black/40 text-xs text-white p-3 rounded-xl border border-white/5 focus:border-[#CCFF00] focus:outline-none resize-none leading-relaxed"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block uppercase mb-1.5">Action Hashtags</label>
                      <input
                        type="text"
                        value={newReelTag}
                        onChange={(e) => setNewReelTag(e.target.value)}
                        placeholder="e.g., #mathhacks #physics #tricks"
                        className="w-full bg-black text-xs text-cyan-400 border border-white/10 p-2.5 rounded-xl focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-mono block uppercase mb-1.5">Reel Video Background</label>
                      <select
                        value={newReelVideoUrl}
                        onChange={(e) => setNewReelVideoUrl(e.target.value)}
                        className="w-full bg-black text-xs text-cyan-300 border border-white/10 p-2 rounded-xl focus:outline-none"
                      >
                        <option value="https://assets.mixkit.co/videos/preview/mixkit-curious-student-writing-maths-formulas-41716-large.mp4">Mathematics Chalkboard Loop</option>
                        <option value="https://assets.mixkit.co/videos/preview/mixkit-physics-students-calculating-force-vectors-41725-large.mp4">Physics Calculations Force</option>
                        <option value="https://assets.mixkit.co/videos/preview/mixkit-chemical-process-experiments-in-clean-lab-41715-large.mp4">Acid Alkaline Electron Tubes</option>
                      </select>
                    </div>
                  </div>

                  {/* DYNAMIC AUDIO SINK / SOUNDTRACK OVERLAY SEGMENT */}
                  <div className="p-3.5 bg-pink-500/5 rounded-3xl border border-pink-500/20 space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-pink-300 font-mono uppercase font-bold tracking-wider">🎵 Soundtrack Overlay Calibration</span>
                      {selectedAudioUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAudioUrl("");
                            setSelectedAudioName("");
                          }}
                          className="text-[9px] font-mono text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer"
                        >
                          ❌ CLEAR SOUND
                        </button>
                      )}
                    </div>

                    {selectedAudioUrl ? (
                      <div className="p-2 bg-pink-950/20 rounded-xl flex items-center justify-between border border-pink-500/10">
                        <div className="flex items-center gap-2">
                          <span className="animate-bounce">🎵</span>
                          <span className="text-xs font-mono text-white text-[11px] font-black">{selectedAudioName}</span>
                        </div>
                        <span className="text-[8px] font-mono bg-pink-500/20 text-pink-300 py-0.5 px-2 rounded-full uppercase">Stitched</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAudioLibrary(true)}
                        className="w-full py-2.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 font-mono font-black text-[10px] uppercase rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 animate-pulse"
                      >
                        📂 OPEN AUDIO LIBRARY / SELECT SOUND ({audioLibraryTracks.length} CLIPS)
                      </button>
                    )}

                    {/* SEARCHABLE AUDIO CLIP SELECTION DRAWER */}
                    {showAudioLibrary && (
                      <div className="p-3 bg-black/60 rounded-2xl border border-pink-500/30 space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono font-black text-gray-400 uppercase">Search Audio Library</span>
                          <button 
                            type="button" 
                            onClick={() => setShowAudioLibrary(false)} 
                            className="text-[10px] text-gray-500 hover:text-white bg-transparent border-none cursor-pointer font-mono"
                          >
                            CLOSE [X]
                          </button>
                        </div>
                        <input
                          type="text"
                          value={audioSearchQuery}
                          onChange={(e) => setAudioSearchQuery(e.target.value)}
                          placeholder="Search electronic lofi, calm synth, sonatas..."
                          className="w-full bg-zinc-900 border border-white/10 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-pink-500"
                        />
                        <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                          {audioLibraryTracks
                            .filter(t => t.name.toLowerCase().includes(audioSearchQuery.toLowerCase()) || t.category.toLowerCase().includes(audioSearchQuery.toLowerCase()))
                            .map((track) => (
                              <div
                                key={track.url}
                                onClick={() => {
                                  setSelectedAudioUrl(track.url);
                                  setSelectedAudioName(track.name);
                                  setShowAudioLibrary(false);
                                  onAddNotification("Soundtrack Mixed", `Stitched "${track.name}" onto this reel. Ready to render!`, "success");
                                }}
                                className="p-2 hover:bg-pink-500/10 rounded-lg cursor-pointer flex justify-between items-center transition-colors border border-transparent hover:border-pink-500/20 text-left"
                              >
                                <div>
                                  <p className="text-[10px] font-extrabold text-white leading-none">{track.name}</p>
                                  <span className="text-[8px] text-gray-500 font-mono uppercase tracking-wide">{track.category}</span>
                                </div>
                                <span className="text-[8px] font-mono text-zinc-400 bg-white/5 py-0.5 px-1.5 rounded">select</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* DUAL STREAM AUDIO MIXOR (VOLUME MIXER) */}
                    <div className="space-y-2.5 pt-2 border-t border-white/5">
                      <span className="text-[9px] uppercase font-mono text-gray-400 block font-black">STITCHING VOLUME CO-EFFICIENTS</span>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 font-mono">
                          <div className="flex justify-between text-[8px] text-gray-400">
                            <span>ORIGINAL VIDEO:</span>
                            <span className="text-white font-black">{Math.round(reelOriginalVolume * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round(reelOriginalVolume * 100)}
                            onChange={(e) => setReelOriginalVolume(parseFloat(e.target.value) / 100)}
                            className="w-full accent-[#CCFF00] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1 font-mono">
                          <div className="flex justify-between text-[8px] text-gray-400">
                            <span>OVERLAY TRACK:</span>
                            <span className="text-white font-black">{Math.round(reelAudioVolume * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            disabled={!selectedAudioUrl}
                            value={selectedAudioUrl ? Math.round(reelAudioVolume * 100) : 0}
                            onChange={(e) => setReelAudioVolume(parseFloat(e.target.value) / 100)}
                            className="w-full accent-pink-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-dashed border-white/10 p-3.5 rounded-2xl flex flex-col gap-2 items-center text-center">
                    <span className="text-xl">📹</span>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white">OR UPLOAD CUSTOM VIDEO FILE</p>
                      <p className="text-[8px] text-gray-400 font-mono">Accepts mp4, webm or mov video clips</p>
                    </div>
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleReelFileChange} 
                      className="hidden" 
                      id="custom-reel-video-file-modal" 
                    />
                    <label 
                      htmlFor="custom-reel-video-file-modal"
                      className="py-1 px-3 bg-cyan-400/20 hover:bg-[#CCFF00] hover:text-black hover:scale-105 border border-cyan-400/30 font-extrabold text-[9px] cursor-pointer text-cyan-300 transition-all rounded-lg uppercase font-mono"
                    >
                      {uploadedVideoFile ? `Selected: ${uploadedVideoFile.name.substring(0, 18)}` : "Select Video File"}
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-extrabold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all text-center border-none cursor-pointer uppercase font-mono shadow-[0_4px_16px_rgba(219,39,119,0.3)]"
                  >
                    DEPLOY BROADCAST STUDY REEL
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 👥 SQUAD CONSTRUCTOR MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {groupModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-[32px] bg-[#0c0c0f] border border-white/10 p-6 relative">
            <button
              onClick={() => setGroupModalOpen(false)}
              className="absolute right-6 top-6 p-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <h4 className="text-base font-black text-white uppercase tracking-widest font-mono">
                Construct Study Squad Node
              </h4>
              <p className="text-[10px] text-gray-400 mt-1">Combine peers, share answers, and generate cooperative claim factors</p>
            </div>

            <form onSubmit={triggerConstructSquad} className="space-y-4">
              <div>
                <label className="text-[9px] text-gray-400 font-mono block uppercase mb-1">Squad Name / Channel</label>
                <input
                  type="text"
                  value={rawSquadName}
                  onChange={(e) => setRawSquadName(e.target.value)}
                  placeholder="e.g., Olympiad Algebra Speedrunners"
                  className="w-full bg-black text-xs text-white p-2.5 rounded-xl border border-white/5 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] text-gray-400 font-mono block uppercase mb-1">Group Icon</label>
                  <select
                    value={rawSquadIcon}
                    onChange={(e) => setRawSquadIcon(e.target.value)}
                    className="w-full bg-black text-xs text-[#CCFF00] border border-white/10 p-2 rounded-xl focus:outline-none"
                  >
                    <option>📐</option>
                    <option>🧬</option>
                    <option>🧪</option>
                    <option>💻</option>
                    <option>⚛️</option>
                    <option>📚</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[9px] text-gray-400 font-mono block uppercase mb-1">Active Description</label>
                  <input
                    type="text"
                    value={rawSquadDesc}
                    onChange={(e) => setRawSquadDesc(e.target.value)}
                    placeholder="Speed solving formulas..."
                    className="w-full bg-black text-xs text-white p-2 rounded-xl border border-white/5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Invited friends checklist */}
              <div>
                <label className="text-[9px] text-gray-400 font-mono block uppercase mb-1">Select Friends to Summon</label>
                {friends.length === 0 ? (
                  <p className="text-[9px] text-amber-300 italic">No bonded social nodes found. Add friends in Directory first!</p>
                ) : (
                  <div className="max-h-24 overflow-y-auto space-y-1.5 p-2 bg-black/40 rounded-xl border border-white/5">
                    {friends.map(friend => {
                      const isInvited = squadInvitedFriends.includes(friend);
                      return (
                        <div 
                          key={friend}
                          onClick={() => {
                            if (isInvited) {
                              setSquadInvitedFriends(squadInvitedFriends.filter(item => item !== friend));
                            } else {
                              setSquadInvitedFriends([...squadInvitedFriends, friend]);
                            }
                          }}
                          className={`p-1.5 rounded-lg border text-[10px] flex justify-between items-center cursor-pointer ${isInvited ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400/40 font-bold' : 'bg-transparent text-gray-400 border-white/5 hover:border-white/20'}`}
                        >
                          <span>@{friend}</span>
                          <span>{isInvited ? "SUMMONED ✓" : "+ INVITE"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-4 bg-cyan-400 text-black font-extrabold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all text-center border-none cursor-pointer uppercase font-mono shadow-[0_4px_12px_rgba(34,211,238,0.3)]"
              >
                COMPILE SQUAD MATRIX
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔮 NEXAGRAM SHARE VERIFICATION GATEWAY */}
      {sharingTitle && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[160] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0d10] border border-cyan-500/30 p-6 rounded-[32px] text-center shadow-[0_8px_32px_rgba(0,255,255,0.15)] relative overflow-hidden space-y-5">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#CCFF00]/10 blur-xl pointer-events-none rounded-full" />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] font-black text-cyan-400 font-mono tracking-widest uppercase">
                🔗 Network Share Validation Node
              </span>
              <button
                onClick={() => setSharingTitle(null)}
                className="p-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-gray-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-3xl">📤</span>
              <h4 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                Verify Post/Reel Hyperlink Dispatch
              </h4>
              <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                Choose an external educational portal channel below to share the node content. Once validated, you will receive <strong className="text-[#CCFF00]">+20 NEXA COINS</strong>.
              </p>
            </div>

            {/* SHARED VALUE INDICATOR BOX AT THE TOP */}
            <div className="bg-black/80 px-4 py-2 rounded-xl border border-white/5 text-left space-y-1">
              <span className="text-[9px] font-mono text-gray-500 block uppercase font-bold">Video/Content URL dispatch path</span>
              <div className="text-[10px] font-mono text-[#CCFF00] break-all select-all font-bold">
                {sharingUrl || "https://nexasnap.edu/post/8472"}
              </div>
            </div>

            {/* CHANNEL BUTTONS */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: "WhatsApp Portal", icon: "💬", color: "hover:bg-green-500/10 hover:border-green-500/35", link: `https://api.whatsapp.com/send?text=` },
                { name: "Twitter / X Sync", icon: "🐦", color: "hover:bg-sky-500/10 hover:border-sky-500/35", link: `https://twitter.com/intent/tweet?text=` },
                { name: "Instagram DM", icon: "📸", color: "hover:bg-pink-500/10 hover:border-pink-500/35", link: `https://www.instagram.com/` },
                { name: "LinkedIn Matrix", icon: "💼", color: "hover:bg-blue-500/10 hover:border-blue-500/35", link: `https://www.linkedin.com/sharing/share-offsite/?url=` }
              ].map(channel => (
                <button
                  key={channel.name}
                  type="button"
                  onClick={() => {
                     setSelectedShareChannel(channel.name);
                     const contentUrl = sharingUrl || "https://nexasnap.edu/post/8472";
                     const shareText = `Check this epic scientific research: "${sharingTitle}" inside NexaSnap Academic Ecosystem! URL: ${contentUrl}`;
                     navigator.clipboard.writeText(shareText).catch(() => {});
                     
                     // Trigger real deep links / url redirect in new tab
                     const targetHref = channel.link.startsWith("https") && channel.link.includes("url=") 
                       ? `${channel.link}${encodeURIComponent(contentUrl)}` 
                       : (channel.link.startsWith("https") ? `${channel.link}${encodeURIComponent(shareText)}` : channel.link);
                       
                     window.open(targetHref, "_blank", "noopener,noreferrer");

                     onGrantRewards(20, 20); // Award 20 coins!
                     setHasSharedClaimed(true);
                     onAddNotification("Share Approved! ✅", "Granted +20 Nexa Coins for verified external feed post sharing!", "success");
                  }}
                  className={`p-3 bg-black border border-white/5 rounded-xl text-left text-[11px] font-mono text-gray-300 font-bold ${channel.color} cursor-pointer transition-all flex items-center gap-2`}
                >
                  <span>{channel.icon}</span>
                  <span>{channel.name}</span>
                </button>
              ))}
            </div>

            {hasSharedClaimed && (
              <div className="p-3 bg-green-500/10 border border-green-500/25 rounded-xl space-y-1 animate-pulse">
                <span className="text-[10px] font-black text-green-400 uppercase font-mono block">
                  ✓ VERIFICATION APPROVED (+20 Coins)
                </span>
                <p className="text-[9px] text-gray-400 font-mono leading-snug">
                  Telemetry logs successfully registered and recorded via the secure external {selectedShareChannel} channel connection.
                </p>
              </div>
            )}

            <button
              onClick={() => setSharingTitle(null)}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wide border border-white/10 cursor-pointer"
            >
              Close Share Screen
            </button>
          </div>
        </div>
      )}

      {/* 🏆 PREMIUM UNLOCKED CELEBRATION MODAL */}
      {unlockedPremiumCelebration && (
        <div className="fixed inset-0 bg-[#000000]/95 backdrop-blur-2xl z-[170] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0914] border-2 border-[#CCFF00]/40 p-8 rounded-[40px] text-center shadow-[0_20px_60px_rgba(204,255,0,0.15)] relative overflow-hidden space-y-6">
            
            {/* Confetti simulation top glows */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />
            
            <div className="w-20 h-20 bg-[#CCFF00]/10 text-[#CCFF00] rounded-full flex items-center justify-center mx-auto border border-[#CCFF00]/30 animate-bounce">
              <span className="text-4xl">👑</span>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 rounded-full px-3 py-1 font-mono font-bold uppercase tracking-widest animate-pulse inline-block">
                VIRAL SENSATION DETECTED
              </span>
              <h4 className="text-2xl font-black text-white tracking-tight leading-none">
                NEXA PREMIUM MULTIPLIER UNLOCKED!
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-mono px-3">
                Your submitted study reel shattered target thresholds and surged past <strong>20,000 views</strong>! You have been granted:
              </p>
            </div>

            <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-2 text-left text-xs divide-y divide-white/5">
              <div className="flex justify-between pt-1">
                <span className="text-gray-400">⚡ 2-Day Premium Pass:</span>
                <span className="text-[#CCFF00] font-black uppercase font-mono">ACTIVE ✔</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-400">🎁 Daily Premium Coins:</span>
                <span className="text-[#CCFF00] font-black uppercase font-mono">+200 DAILY COINS</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-400">💎 Immediate Bonus Claim:</span>
                <span className="text-cyan-400 font-extrabold uppercase font-mono">+200 Coins & +100 XP</span>
              </div>
            </div>

            <button
              onClick={() => setUnlockedPremiumCelebration(false)}
              className="w-full py-3.5 bg-[#CCFF00] hover:bg-cyan-400 text-black font-extrabold text-xs rounded-xl tracking-widest uppercase transition-all shadow-[0_4px_16px_rgba(204,255,0,0.4)] cursor-pointer border-none font-mono"
            >
              ACKNOWLEDGE SUCCESS
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
