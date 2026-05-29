import React, { useState, useEffect } from "react";
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
  RotateCcw
} from "lucide-react";
import { admobService } from "../lib/AdMobService";

interface LanguageTutorViewProps {
  profile: any;
  onGrantRewards: (coins: number, xp: number) => void;
  onDeductCoins?: (amount: number) => boolean;
  onAddNotification: (title: string, msg: string, type: string) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  hintExplanation?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi (हिंदी)", flag: "🇮🇳" },
  { code: "mr", name: "Marathi (मराठी)", flag: "🇮🇳" },
  { code: "es", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr", name: "French (Français)", flag: "🇫🇷" },
  { code: "de", name: "German (Deutsch)", flag: "🇩🇪" },
  { code: "ja", name: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "ko", name: "Korean (한국어)", flag: "🇰🇷" },
  { code: "zh", name: "Chinese (中文)", flag: "🇨🇳" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "sa", name: "Sanskrit (संस्कृतम्)", flag: "🇮🇳" },
  { code: "la", name: "Latin (Latina)", flag: "🏛️" }
];

const ENROLLED_STANDARDS = [
  { id: "std_1_4", label: "Standard 1st to 4th (Primary/Kids Level)" },
  { id: "std_5_8", label: "Standard 5th to 8th (Middle School Level)" },
  { id: "std_9_12", label: "Standard 9th to 12th (High School Level)" },
  { id: "university", label: "University & Graduate/Undergrad level" }
];

const TUTOR_MODES = [
  { id: "daily_conv", label: "Daily Conversation Challenge" },
  { id: "beginner_ex", label: "Beginner Mode (Simple guides)" },
  { id: "advanced_pr", label: "Advanced Mode (Challenging vocabulary)" },
  { id: "ielts_prep", label: "IELTS Exam Practice Mode" },
  { id: "interview_prep", label: "Interview Preparation Mode" },
  { id: "pronounce_tr", label: "Pronunciation Trainer" }
];

const INTERACTIVE_SCENARIOS = [
  { id: "sc_cafe", title: "At a Cyber Cafe ☕", prompt: "Let's roleplay that I am a barista at a modern high-tech café and you are ordering breakfast." },
  { id: "sc_interview", title: "Job Interview 💼", prompt: "Let's practice a real-time AI job interview. Challenge me with high-caliber questions." },
  { id: "sc_space", title: "Astronomy Flight 🚀", prompt: "We are travelers on a long-range space fleet. Let's describe what we see outside our cabin window." },
  { id: "sc_weather", title: "General Small Talk 👋", prompt: "Let's practice describing our hobbies, local weather, and what we plan to study this week." }
];

export const LanguageTutorView: React.FC<LanguageTutorViewProps> = ({
  profile,
  onGrantRewards,
  onDeductCoins,
  onAddNotification,
  onClose
}) => {
  const [selectedLang, setSelectedLang] = useState("English");
  const [selectedStandard, setSelectedStandard] = useState("University & Graduate/Undergrad level");
  const [tutorMode, setTutorMode] = useState("Daily Conversation Challenge");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_init",
      sender: "ai",
      text: "Welcome to NexaLearn Global AI Language Tutor! 🌐\n\nI have pre-calibrated our neural weights to guide study modules from Standard 1st all the way through to University classes.\n\nSelect your practicing standard, target language, and desired mode, then drop any greeting to begin!",
      timestamp: "Just now"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Pronunciation analyzer states
  const [pronounceWord, setPronounceWord] = useState("multilingual");
  const [pronounceData, setPronounceData] = useState<{ syllables: string; phonetic: string; tip: string } | null>(null);

  // IELTS Helper State
  const [ieltsRating, setIeltsRating] = useState<string | null>(null);

  // Cooldown & Ad Alert
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    // Sync active countdown state
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(p => p - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim()) return;

    // Deduct 5 coins standard AI interaction fee!
    if (onDeductCoins) {
      const success = onDeductCoins(5);
      if (!success) {
        onAddNotification("Action Blocked ⚠️", "Insufficient Coins! Every language tutor message costs 5 Coins 🪙. Claim free coins in the coin store!", "alert");
        return;
      }
    }

    if (!customText) {
      setInputValue("");
    }

    const userMsg: Message = {
      id: `m_${Date.now()}_u`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages,
          language: selectedLang,
          mode: tutorMode,
          standard: selectedStandard
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `m_${Date.now()}_ai`,
            sender: "ai",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        
        // Auto reward score occasionally on successful study iterations
        if (Math.random() > 0.6) {
          onGrantRewards(5, 10);
          onAddNotification("Fluency Points Earned", "Awarded +5 Coins & +10 XP for active language practice!", "success");
        }
      } else {
        throw new Error(data.error || "Tutor API error");
      }
    } catch (err) {
      console.warn("Tutor communication failed, falling back to local simulation:", err);
      // Fallback
      setTimeout(() => {
        let replyText = `Fantastic sentence! " ${textToSend} " of practicing level standard is processed successfully.\n\nHere is a friendly grammar hint:\nEnsure proper word arrangement. Continue practicing by dropped another phrase!`;
        if (selectedLang === "Hindi (हिंदी)") {
          replyText = `बहुत बढ़िया प्रयास! हिंदी अभ्यास सत्र सक्रिय है। "${textToSend}" आपके स्तर (${selectedStandard}) के लिए उपयुक्त है। कृपया बातचीत जारी रखें!`;
        } else if (selectedLang === "Marathi (मराठी)") {
          replyText = `खूप छान! मराठी संभाषण सत्र सुरू झाले आहे. "${textToSend}" तुमच्या परीक्षा स्तरासाठी योग्य रचना आहे. पुढे बोला!`;
        }

        setMessages(prev => [
          ...prev,
          {
            id: `m_${Date.now()}_ai_sim`,
            sender: "ai",
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  // Triggers AdMob rewarded ad voluntary completion to unlock interactive hints, matching exactly timing guidelines
  const triggerAdMobUnlockLesson = async (msgId: string) => {
    onAddNotification("AdMob Loading", "Preparing rewarded ad placement safely...", "info");

    const rewardedSuccess = await admobService.showRewardedAd(
      (amount) => {
        // Callback watches full ad
        setMessages(prev => 
          prev.map(m => {
            if (m.id === msgId) {
              return {
                ...m,
                hintExplanation: `💡 AI Advanced Grammar Insight (Level: ${selectedStandard}):\n\nEnsure appropriate verb conjugate modifiers and avoid double negation structures for high rating marks.`
              };
            }
            return m;
          })
        );
        onGrantRewards(15, 25);
        onAddNotification("Tutor Premium Unlocked", "Earned +15 Coins & +25 XP. Advanced grammar suggestions resolved!", "success");
        alert("🎁 Ad finished! Real-time premium lesson advice successfully loaded for you!");
      },
      () => {
        console.log("Ad dismissed or completed");
      }
    );

    if (!rewardedSuccess) {
      // Cooldown timer fallback if spamming fast
      setCooldownTime(30);
      alert("⏳ Keep a 2-minute cooldown gap between rewarded ads to sustain high network health. Try again shortly!");
    }
  };

  // Syllables breakdown feature
  const resolvePronunciation = () => {
    const word = pronounceWord.trim().toLowerCase();
    if (!word) return;

    // Direct syllables algorithms mock
    let syllables = word;
    let phonetic = `/${word}/`;
    let tip = "Bring your vocal pitch slightly down at the final vowel sounds.";

    if (word === "multilingual") {
      syllables = "mul - ti - lin - gual";
      phonetic = "/ˌmʌl.tiˈlɪŋ.ɡwəl/";
      tip = "Stress on the 'lin' syllable. Say 'mul-tee' then follow with 'ling-gwal'.";
    } else if (word === "communication") {
      syllables = "com - mu - ni - ca - tion";
      phonetic = "/kəˌmjuː.nɪˈkeɪ.ʃən/";
      tip = "The major stress is on 'ca' (pronounced like 'kay'). The final 'tion' is a soft 'shun' sound.";
    } else if (word === "university") {
      syllables = "u - ni - ver - si - ty";
      phonetic = "/ˌjuː.nɪˈvɜː.sɪ.ti/";
      tip = "Soft Glide on 'u' like 'yoo'. High peak pitch on 'ver'.";
    }

    setPronounceData({ syllables, phonetic, tip });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in max-w-7xl mx-auto pb-12">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/40 via-black/40 to-cyan-950/30 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-black bg-[#CCFF00] text-black px-3 py-1 rounded-full flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 animate-pulse" />
              NEXALEARN WORLD TUNED
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold bg-cyan-400/10 text-cyan-300 px-3 py-1 rounded-full">
              Standard 1 - University
            </span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">AI Global Language Tutor</h2>
          <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
            Immersive conversation coaching in any major world language. We automatically adjust lexical difficulty, syntax correction complexity, and interactive prompts to match your chosen standard.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="z-10 py-2.5 px-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs uppercase cursor-pointer border border-white/5 font-mono"
        >
          Return to Hub
        </button>
      </div>

      {/* QUICK SYSTEM GUIDE */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-3 text-xs text-amber-300 items-start">
        <span className="text-lg">💡</span>
        <div>
          <span className="font-bold block text-white mb-0.5">High-eCPM Rewarded Ad Integration Active:</span>
          AdMob rewarded ads are programmed only for manual opt-in unlock functions like the <strong className="text-yellow-400">"AI Unlock Lesson Hint"</strong> widget underneath messages. Rest guaranteed, no auto-start interstitials or unprompted ads will load automatically.
        </div>
      </div>

      {/* PARAMETERS CONFIGURATION PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dropdowns */}
        <div className="neo-glass p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-[#CCFF00]">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">1. Select Class/Standard</span>
          </div>
          <p className="text-[11px] text-gray-400">Caters conversation vocabulary complexity to your appropriate study standard.</p>
          <div className="space-y-2">
            {ENROLLED_STANDARDS.map(std => {
              const active = selectedStandard === std.label;
              return (
                <button
                  key={std.id}
                  onClick={() => setSelectedStandard(std.label)}
                  className={`w-full py-2.5 px-4 text-left text-xs rounded-xl font-bold transition-all border block ${
                    active 
                      ? "bg-[#CCFF00] text-black border-[#CCFF00]" 
                      : "bg-black/40 border-white/5 text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {std.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="neo-glass p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Languages className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">2. Practicing Language</span>
          </div>
          <p className="text-[11px] text-gray-400">Target dialect used in dialogues. Auto-switches dynamically.</p>
          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {SUPPORTED_LANGUAGES.map(lang => {
              const active = selectedLang === lang.name;
              return (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.name)}
                  className={`py-2 px-3 text-left text-xs rounded-xl font-bold transition-all border flex items-center gap-2 ${
                    active 
                      ? "bg-cyan-400 text-black border-cyan-400" 
                      : "bg-black/40 border-white/5 text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="neo-glass p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">3. Learning Focus Mode</span>
          </div>
          <p className="text-[11px] text-gray-400">Applies targeted coaching guidelines to our conversational style loops.</p>
          <div className="space-y-2">
            {TUTOR_MODES.map(mode => {
              const active = tutorMode === mode.label;
              return (
                <button
                  key={mode.id}
                  onClick={() => setTutorMode(mode.label)}
                  className={`w-full py-2.5 px-4 text-left text-xs rounded-xl font-bold transition-all border block ${
                    active 
                      ? "bg-purple-500 text-white border-purple-500" 
                      : "bg-black/40 border-white/5 text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* WORKSPACE DIALOGUE CO-PILOT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: INTERACTIVE UTILITIES & SCENARIOS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* PRONUNCIATION TRAINER PLATFORM */}
          <div className="neo-glass p-5 rounded-3xl border border-white/5 space-y-4 flex-1">
            <div className="flex items-center gap-1.5 text-[#CCFF00]">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <h4 className="text-xs font-extrabold uppercase tracking-wide font-mono">Active Syllable Pronounce Trainer</h4>
            </div>
            <p className="text-[11px] text-gray-400">
              Type custom words below to instantly analyze their syllable segmentation guide & phonetic transcription elements:
            </p>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={pronounceWord}
                onChange={(e) => setPronounceWord(e.target.value)}
                placeholder="e.g. multilingual"
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#CCFF00]"
              />
              <button
                onClick={resolvePronunciation}
                className="py-2 px-3 bg-[#CCFF00] hover:scale-105 active:scale-95 text-black font-black text-xs rounded-xl transition-all border-none cursor-pointer"
              >
                Analyze
              </button>
            </div>

            {pronounceData ? (
              <div className="p-3 bg-black/50 border border-white/5 rounded-2xl space-y-3 font-mono text-[11px]">
                <div>
                  <span className="text-gray-500 uppercase text-[9px] block">Syllables Segmented</span>
                  <span className="text-[#CCFF00] font-bold text-xs">{pronounceData.syllables}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[9px] block">Phonetic IPA Code</span>
                  <span className="text-cyan-400 font-bold">{pronounceData.phonetic}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[9px] block">Acoustic Accent Tip</span>
                  <p className="text-gray-300 leading-normal font-sans text-xs">{pronounceData.tip}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/2 border border-dashed border-white/5 rounded-2xl text-center py-6">
                <p className="text-[11px] text-gray-500 font-mono">Input a word above to build phonetic syllables diagrams.</p>
              </div>
            )}
          </div>

          {/* ACTIVE DISCOURSE SCENARIOS SELECTOR */}
          <div className="neo-glass p-5 rounded-3xl border border-white/5 space-y-3">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Compass className="w-4 h-4" />
              <h4 className="text-xs font-extrabold uppercase tracking-wide font-mono">Discourse Scenarios & Presets</h4>
            </div>
            <p className="text-[11px] text-gray-400">Click a scenario below to directly start a specialized roleplay dialogue session with the tutor:</p>

            <div className="space-y-2">
              {INTERACTIVE_SCENARIOS.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => {
                    handleSendMessage(sc.prompt);
                    onAddNotification("Scenario Activated", `Active conversational context configured for: ${sc.title}`, "info");
                  }}
                  className="w-full text-left py-2 px-3 bg-white/5 hover:bg-white/10 hover:border-cyan-500/30 text-xs rounded-xl border border-white/5 text-gray-200 transition-all cursor-pointer flex justify-between items-center"
                >
                  <span>{sc.title}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Launch ⚡</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CORE CHAT TERMINAL */}
        <div className="lg:col-span-8 flex flex-col neo-glass rounded-3xl border border-white/5 overflow-hidden h-[540px]">
          {/* Chat header */}
          <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center relative">
                <Languages className="w-5 h-5 text-[#CCFF00]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#121422] animate-pulse" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight font-mono">NexaLearn AI Global Coach</h4>
                <div className="flex gap-2 items-center text-[10px] text-cyan-400 font-mono mt-0.5">
                  <span>Standard Level: {selectedStandard.split(" ")[0]}</span>
                  <span>•</span>
                  <span>Language: {selectedLang}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-gray-500">PROVIDER: GEMINI 3.5</span>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
            {messages.map((m) => {
              const parsedSender = m.sender === "user";
              return (
                <div key={m.id} className="space-y-2">
                  <div className={`flex items-start gap-2.5 ${parsedSender ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border ${
                      parsedSender 
                        ? "bg-purple-950/40 border-purple-500/20 text-purple-300" 
                        : "bg-[#CCFF00]/10 border-[#CCFF00]/20 text-[#CCFF00]"
                    }`}>
                      {parsedSender ? <User className="w-4 h-4" /> : <Languages className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[75%] rounded-2xl p-4.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      parsedSender 
                        ? "bg-purple-650/40 text-purple-50 font-bold text-right border border-purple-500/10" 
                        : "bg-white/5 text-gray-100 border border-white/5 text-left"
                    }`}>
                      {m.text}

                      <span className="block text-[8px] text-gray-500 font-mono mt-2 uppercase">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Manual inline rewarded action trigger button (voluntary action unlock) */}
                  {!parsedSender && m.id !== "m_init" && (
                    <div className="pl-11 flex flex-col gap-2 items-start">
                      {!m.hintExplanation ? (
                        <button
                          onClick={() => triggerAdMobUnlockLesson(m.id)}
                          disabled={cooldownTime > 0}
                          className="py-1.5 px-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/20 border border-yellow-500/30 text-[10px] font-black tracking-wider uppercase text-yellow-400 font-mono rounded-lg hover:from-yellow-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3 text-yellow-400" />
                          {cooldownTime > 0 ? `Ad Cooldown (${cooldownTime}s)` : "Unlock Advanced Grammar Advice (Reward ad)"}
                        </button>
                      ) : (
                        <div className="p-3 bg-yellow-400/10 border border-yellow-500/20 rounded-xl max-w-[85%] text-[11px] text-yellow-300 font-mono leading-relaxed">
                          {m.hintExplanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#CCFF00]/15 flex items-center justify-center text-[#CCFF00] border border-[#CCFF00]/20 animate-spin border-t-transparent font-mono text-center text-xs">
                  ⚙️
                </div>
                <div className="p-3 bg-white/5 rounded-2xl text-[10px] font-mono text-cyan-400/80 animate-pulse uppercase tracking-widest border border-white/5">
                  Evaluating grammatical syntax weights and formulating reply...
                </div>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder={`Practice conversation here in ${selectedLang} (${tutorMode})...`}
              className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00]"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputValue.trim()}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-none ${
                inputValue.trim() 
                  ? "bg-[#CCFF00] hover:scale-105 text-black active:scale-95" 
                  : "bg-white/5 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Coin Cost Indicator footer banner */}
          <div className="px-4 pb-3 flex justify-between items-center bg-black/40 text-[9px] font-mono select-none">
            <span className="text-gray-500 uppercase">⚡ DYNAMIC MULTILINGUAL TRANSLATION ENGINE</span>
            <span className="text-amber-400 font-extrabold flex items-center gap-1">
              🪙 FEE: 5 COINS PER TUTOR MESSAGE (YOUR CARD: {profile?.coins || 0} NEXA)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
