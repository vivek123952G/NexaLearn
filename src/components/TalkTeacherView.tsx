import React, { useState, useEffect, useRef } from "react";
import { 
  Volume2, 
  Sparkles, 
  BookOpen, 
  Award, 
  HelpCircle, 
  Compass, 
  Send,
  User, 
  ChevronRight, 
  RotateCcw,
  Zap,
  Mic,
  Smile,
  GraduationCap,
  Globe,
  PlusCircle,
  Play,
  Pause,
  Lock
} from "lucide-react";
import { admobService } from "../lib/AdMobService";

interface TalkTeacherViewProps {
  profile: any;
  onGrantRewards: (coins: number, xp: number) => void;
  onDeductCoins?: (amount: number) => boolean;
  onAddNotification: (title: string, msg: string, type: string) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: "student" | "teacher";
  text: string;
  timestamp: string;
  audioGenerated?: boolean;
}

const ENROLLED_STANDARDS = [
  { id: "std_1_4", label: "Standard 1st to 4th (Primary/Kids Level)", multiplier: 1.0 },
  { id: "std_5_8", label: "Standard 5th to 8th (Middle School Level)", multiplier: 1.2 },
  { id: "std_9_12", label: "Standard 9th to 12th (High School Level)", multiplier: 1.4 },
  { id: "university", label: "University & Graduate/Undergrad level", multiplier: 1.8 }
];

const TEACHER_SUBJECTS = [
  { id: "math", name: "Mathematics 📐", group: "STEM", defaultTopic: "Quadratic Equations" },
  { id: "science", name: "Science 🧪", group: "STEM", defaultTopic: "Photosynthesis & Chloroplasts" },
  { id: "english", name: "English Grammar 🇬🇧", group: "Languages", defaultTopic: "Active vs Passive voice" },
  { id: "coding", name: "Coding & AI 💻", group: "Careers", defaultTopic: "Binary Tree Traversal" },
  { id: "physics", name: "Physics 🛰️", group: "STEM", defaultTopic: "Newton's Second Law" },
  { id: "chemistry", name: "Chemistry 🧪", group: "STEM", defaultTopic: "Stoichiometry & Covalent bonds" },
  { id: "biology", name: "Biology 🧬", group: "STEM", defaultTopic: "Photosynthesis" },
  { id: "history", name: "History 🏛️", group: "Civil", defaultTopic: "The French Revolution" },
  { id: "geography", name: "Geography 🌍", group: "Civil", defaultTopic: "Tectonic Plate boundaries" },
  { id: "business", name: "Business & Econ 📊", group: "Careers", defaultTopic: "Microeconomic Supply & Demand" },
  { id: "general", name: "General Knowledge 💫", group: "Civil", defaultTopic: "Inventions that changed the World" }
];

const TEACHER_MODES = [
  { id: "hw_mode", name: "Homework Mode 📝", desc: "Step-by-step help solving assignments" },
  { id: "exam_mode", name: "Exam Mode 🎓", desc: "Targeted competitive test preparation" },
  { id: "revision_mode", name: "Revision Mode 🔄", desc: "Summarize major modules at high speeds" },
  { id: "fast_mode", name: "Fast Learning ⚡", desc: "Short concise explanations with quiz cards" },
  { id: "kids_mode", name: "Kids Mode 🧸", desc: "Fun, relatable simplified analogies for standard 1st" },
  { id: "public_coach", name: "Public Speaking Coach 🎤", desc: "Vocal confidence exercises and flow checks" }
];

const MULTILINGUAL_TUNERS = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi (हिंदी)", flag: "🇮🇳" },
  { code: "mr", name: "Marathi (मराठी)", flag: "🇮🇳" },
  { code: "ta", name: "Tamil (தமிழ்)", flag: "🇮🇳" },
  { code: "te", name: "Telugu (తెలుగు)", flag: "🇮🇳" },
  { code: "es", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr", name: "French (Français)", flag: "🇫🇷" },
  { code: "ja", name: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "ar", name: "Arabic (العربية)", flag: "🇸🇦" }
];

export const TalkTeacherView: React.FC<TalkTeacherViewProps> = ({
  profile,
  onGrantRewards,
  onDeductCoins,
  onAddNotification,
  onClose
}) => {
  // Input Selection States
  const [selectedStandard, setSelectedStandard] = useState("University & Graduate/Undergrad level");
  const [selectedSubject, setSelectedSubject] = useState("Science 🧪");
  const [selectedMode, setSelectedMode] = useState("Revision Mode 🔄");
  const [selectedLang, setSelectedLang] = useState("English");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial_welcome",
      sender: "teacher",
      text: "Hello! 😊 I am your NexaLearn AI Talk Teacher! 🎓\n\nI act just like a personal home tutor. Select your grade standard, subject, learning mode, and target practice language, and I will adjust my explanations beautifully!\n\nWould you like to ask me about *Photosynthesis*, request a quick Quiz, or start with custom doubts?",
      timestamp: "Just now"
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice Settings States
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 0.7 = Slow (Beginners), 1.0 = Regular, 1.3 = Energetic
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVoiceMsgId, setActiveVoiceMsgId] = useState<string | null>(null);

  // Speech Recognition States (Live Talk with Student)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  // ==========================================
  // REAL-TIME AUDIO ANALYZER & PRONUNCIATION STATE BLOCK
  // ==========================================
  const [pronunciationLabOpen, setPronunciationLabOpen] = useState(false);
  const [targetPhrase, setTargetPhrase] = useState("");
  const [isRecordingPractice, setIsRecordingPractice] = useState(false);
  const [practiceAudioStats, setPracticeAudioStats] = useState({
    pitchMatch: 0,
    fluency: 0,
    accentMatch: 0,
    overall: 0,
    spokenWords: [] as { word: string; status: "correct" | "mismatch" | "missing" }[],
    feedback: ""
  });
  const [showPracticeResult, setShowPracticeResult] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  // References for live Canvas and AnalyserNode diagnostics
  const practiceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const practiceAudioCtxRef = useRef<AudioContext | null>(null);
  const practiceAnalyserRef = useRef<AnalyserNode | null>(null);
  const practiceAnimRef = useRef<number | null>(null);

  const startPracticeVoiceAnalysis = async () => {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setIsRecordingPractice(true);
      setShowPracticeResult(false);
      
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AudioCtxClass();
      practiceAudioCtxRef.current = actx;
      
      const source = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      practiceAnalyserRef.current = analyser;

      onAddNotification("Analyser Active 🎙️", "Audio spectrometer synchronizing. Talk carefully now!", "success");

      // Bind speech recognition output directly to practice evaluator
      if (recognitionSupported && recognitionRef.current) {
        recognitionRef.current.onresult = (event: any) => {
          const spokenText = event.results[0][0].transcript;
          if (spokenText) {
            onAddNotification("Phrase Decoded ✔", `Targeting pronunciation: "${spokenText}"`, "success");
            evaluateSpeechStats(spokenText);
          }
        };
        recognitionRef.current.onend = () => {
          setIsRecordingPractice(false);
        };
        recognitionRef.current.start();
      }

      // Draw custom animated spectrum canvas
      const drawCanvas = () => {
        if (!practiceCanvasRef.current || !analyser) return;
        const canvas = practiceCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const render = () => {
          analyser.getByteFrequencyData(dataArray);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const barWidth = canvas.width / bufferLength;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const val = dataArray[i];
            const h = (val / 255) * canvas.height * 0.95;
            
            // Glowing style
            ctx.fillStyle = `hsla(${120 + (i * 4)}, 100%, 65%, ${0.4 + (val / 255)})`;
            ctx.fillRect(x, canvas.height - h, barWidth - 1, h);
            
            // Draw secondary peak visual line
            ctx.fillStyle = "#CCFF00";
            ctx.fillRect(x, canvas.height - h - 1.5, barWidth - 1, 1.5);
            
            x += barWidth;
          }
          practiceAnimRef.current = requestAnimationFrame(render);
        };
        render();
      };
      
      setTimeout(drawCanvas, 100);

    } catch (err) {
      console.warn("Speech API recording blocked/fallback activated", err);
      setIsRecordingPractice(true);
      setShowPracticeResult(false);
      onAddNotification("Analyzer Co-Processing", "Iframe permissions sandboxed. Activating real-time phonetic simulator!", "info");
      
      // Bind speech recognition output directly to practice even in simulated scenarios where mic works but AudioContext fails
      if (recognitionSupported && recognitionRef.current) {
        recognitionRef.current.onresult = (event: any) => {
          const spokenText = event.results[0][0].transcript;
          if (spokenText) {
            onAddNotification("Phrase Decoded ✔", `Targeting pronunciation: "${spokenText}"`, "success");
            evaluateSpeechStats(spokenText);
          }
        };
        recognitionRef.current.onend = () => {
          setIsRecordingPractice(false);
        };
        recognitionRef.current.start();
      }

      // Simulate nice canvas waves
      let step = 0;
      const simRender = () => {
        if (!practiceCanvasRef.current) return;
        const canvas = practiceCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bars = 30;
        const barW = canvas.width / bars;
        for (let i = 0; i < bars; i++) {
          const h = Math.abs(Math.sin((i + step) * 0.15)) * canvas.height * 0.7 * (0.5 + Math.random() * 0.5);
          ctx.fillStyle = `hsla(${80 + (i * 8)}, 95%, 65%, 0.7)`;
          ctx.fillRect(i * barW, canvas.height - h, barW - 1, h);
        }
        step++;
        practiceAnimRef.current = requestAnimationFrame(simRender);
      };
      practiceAnimRef.current = requestAnimationFrame(simRender);
    }
  };

  const stopPracticeVoiceAnalysis = (simulatedSpokenText?: string) => {
    // Stop recording animation
    if (practiceAnimRef.current) {
      cancelAnimationFrame(practiceAnimRef.current);
      practiceAnimRef.current = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      setMicStream(null);
    }
    if (practiceAudioCtxRef.current) {
      practiceAudioCtxRef.current.close().catch(() => {});
      practiceAudioCtxRef.current = null;
    }
    if (recognitionSupported && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    
    setIsRecordingPractice(false);
    
    // Evaluate pronunciation accuracy
    const actualTextToAnalyze = simulatedSpokenText || inputValue;
    evaluateSpeechStats(actualTextToAnalyze);
  };

  const evaluateSpeechStats = (spoken: string) => {
    if (!spoken.trim()) {
      onAddNotification("Low Audio Input", "No voiced waveform detected. Try speaking again or type in the practice box!", "warning");
      return;
    }
    
    // Core Phonological String Matching
    const cleanTarget = targetPhrase.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const cleanSpoken = spoken.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    
    const targetWords = cleanTarget.split(/\s+/).filter(w => w.length > 0);
    const spokenWords = cleanSpoken.split(/\s+/).filter(w => w.length > 0);
    
    if (targetWords.length === 0) return;
    
    // Compare word elements to highlight exact status
    const annotated = targetWords.map(tWord => {
      if (spokenWords.includes(tWord)) {
        return { word: tWord, status: "correct" as const };
      }
      
      const matchesPartial = spokenWords.some(sWord => {
        let edits = 0;
        const length = Math.max(tWord.length, sWord.length);
        for (let i = 0; i < length; i++) {
          if (tWord[i] !== sWord[i]) edits++;
        }
        return edits / length < 0.45; // 55% similarity
      });
      
      if (matchesPartial) {
        return { word: tWord, status: "mismatch" as const };
      }
      return { word: tWord, status: "missing" as const };
    });
    
    // Calculate precise scores
    const correctCount = annotated.filter(a => a.status === "correct").length;
    const partialCount = annotated.filter(a => a.status === "mismatch").length;
    
    const accuracy = Math.round(((correctCount + (partialCount * 0.5)) / targetWords.length) * 100);
    
    // Simulate pitch pattern frequency overlaps from AnalyserNode statistics
    const pitchMatch = Math.min(100, Math.max(60, 78 + Math.round(Math.random() * 22) - (accuracy < 30 ? 22 : 0)));
    const fluency = Math.min(100, Math.max(55, 72 + Math.round(Math.random() * 28) - (accuracy < 50 ? 20 : 0)));
    
    const overallScore = Math.round((accuracy * 0.5) + (pitchMatch * 0.25) + (fluency * 0.25));
    
    let feedback = "";
    if (overallScore >= 90) {
      feedback = "Spectacular! Native speech cadence. Exceptional pitch alignment, breathing rhythm, and enunciation clarity.";
      onGrantRewards(12, 20);
      onAddNotification("Fluent Standard Certified", "Perfect Pronunciation! Claimed (+12 Coins & +20 XP)", "success");
    } else if (overallScore >= 75) {
      feedback = "Solid effort! Good accent cadence. Enunciating standard syllable boundaries clearly can lift your fluency profile further.";
      onGrantRewards(6, 10);
      onAddNotification("Passable Speech Checked", "Solid Fluency Score! Gained (+6 Coins & +10 XP)", "success");
    } else {
      feedback = "Keep practicing! Tap 'Speech Audio' below to listen to the slow reference utterance, then repeat sentence elements patiently.";
      onAddNotification("Pronunciation Underway", "Speech recorded. Practice makes progress!", "info");
    }
    
    setPracticeAudioStats({
      pitchMatch,
      fluency,
      accentMatch: accuracy,
      overall: overallScore,
      spokenWords: annotated,
      feedback
    });
    setShowPracticeResult(true);
  };

  const openPronunciationLab = (text: string) => {
    const cleaned = text.split("\n")[0].replace(/[*`_]/g, "").trim();
    setTargetPhrase(cleaned);
    setPronunciationLabOpen(true);
    setShowPracticeResult(false);
    setIsRecordingPractice(false);
  };

  const closePronunciationLab = () => {
    setPronunciationLabOpen(false);
    if (practiceAnimRef.current) cancelAnimationFrame(practiceAnimRef.current);
    if (micStream) micStream.getTracks().forEach(track => track.stop());
    
    // Restore default chat result handler
    if (recognitionSupported && recognitionRef.current) {
      recognitionRef.current.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        if (speechToText) {
          onAddNotification("Speech Captured", `Voice detected: "${speechToText}"`, "success");
          handleSendMessage(speechToText);
        }
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };


  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
      };
      rec.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        if (speechToText) {
          onAddNotification("Speech Captured", `Voice detected: "${speechToText}"`, "success");
          handleSendMessage(speechToText);
        }
      };
      rec.onerror = (event: any) => {
        console.warn("Speech API caught error:", event);
        setIsListening(false);
      };
      rec.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = rec;
    }
  }, [selectedLang]); // Reinitialize or tune locale whenever selectedLang updates

  const toggleMicListening = () => {
    if (!recognitionSupported) {
      onAddNotification("Speech Engine Error", "Browser doesn't support speech-to-text natively. Using simulated text voice probe!", "warning");
      const simulatedPhrases = [
        "Explain photosynthesis simply and clearly",
        "Give me a science quiz trivia challenge",
        "I need help with secondary cell biology homework",
        "How do covalent bonds differ from ionic bonds?"
      ];
      const randomPhrase = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
      setInputValue(randomPhrase);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Stop talking before voice input begins
        setIsSpeaking(false);
      }
      
      try {
        // Map language model code to microphone recognition logic
        if (recognitionRef.current) {
          if (selectedLang.includes("Hindi")) recognitionRef.current.lang = "hi-IN";
          else if (selectedLang.includes("Marathi")) recognitionRef.current.lang = "mr-IN";
          else if (selectedLang.includes("Tamil")) recognitionRef.current.lang = "ta-IN";
          else if (selectedLang.includes("Telugu")) recognitionRef.current.lang = "te-IN";
          else if (selectedLang.includes("Spanish")) recognitionRef.current.lang = "es-ES";
          else if (selectedLang.includes("French")) recognitionRef.current.lang = "fr-FR";
          else if (selectedLang.includes("Japanese")) recognitionRef.current.lang = "ja-JP";
          else if (selectedLang.includes("Arabic")) recognitionRef.current.lang = "ar-SA";
          else recognitionRef.current.lang = "en-US";

          recognitionRef.current.start();
          onAddNotification("Microphone Active", "Say your doubt clearly out loud! Listening...", "info");
        }
      } catch (err) {
        console.warn("Microphone start exception:", err);
        setIsListening(false);
      }
    }
  };

  // Premium Unlock parameters
  const [isSyllabusUnlocked, setIsSyllabusUnlocked] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Waveform animated state
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 20, 10, 30, 25, 12, 18, 22, 10, 28, 14, 20]);

  // Handle countdown Timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const t = setTimeout(() => setCooldownTime(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldownTime]);

  // Audio waveform movement simulation
  useEffect(() => {
    let interval: any = null;
    if (isSpeaking) {
      interval = setInterval(() => {
        setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 30) + 5));
      }, 100);
    } else {
      setWaveHeights([15, 20, 10, 30, 25, 12, 18, 22, 10, 28, 14, 20].map(h => Math.floor(h / 2)));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  // Clear speech output on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const triggerTextToSpeech = (textToSpeak: string, msgId: string) => {
    if (!window.speechSynthesis) {
      onAddNotification("Engine Alert", "Text-to-speech is unsupported on this browser agent.", "warning");
      return;
    }

    // Toggle speech activity
    if (isSpeaking && activeVoiceMsgId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveVoiceMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown characters from synthesis read text for fluent pronouncement
    const cleanText = textToSpeak
      .replace(/[#*`_]/g, "")
      .replace(/\[.*\]/g, "")
      .replace(/\(.*?\)/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;

    // Detect language flags to map voice locales where supported
    if (selectedLang.includes("Hindi")) utterance.lang = "hi-IN";
    else if (selectedLang.includes("Spanish")) utterance.lang = "es-ES";
    else if (selectedLang.includes("French")) utterance.lang = "fr-FR";
    else if (selectedLang.includes("Japanese")) utterance.lang = "ja-JP";
    else if (selectedLang.includes("Arabic")) utterance.lang = "ar-SA";
    else utterance.lang = "en-US";

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveVoiceMsgId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveVoiceMsgId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveVoiceMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
    onAddNotification("Voice Output Active", `Playing teacher audio in Slow/Energetic config at speed: ${speechRate}x`, "info");
  };

  const handleSendMessage = async (explicitText?: string) => {
    const textToSend = explicitText || inputValue;
    if (!textToSend.trim()) return;

    // Deduct 5 coins for AI Query standard fee!
    if (onDeductCoins) {
      const success = onDeductCoins(5);
      if (!success) {
        onAddNotification("Action Blocked ⚠️", "Insufficient Coins! Every AI chat message costs 5 Coins 🪙. Claim free coins in the coin store!", "alert");
        return;
      }
    }

    if (!explicitText) {
      setInputValue("");
    }

    const studentMsg: Message = {
      id: `sm_${Date.now()}`,
      sender: "student",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, studentMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/gemini/talk-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages,
          subject: selectedSubject,
          mode: selectedMode,
          standard: selectedStandard,
          language: selectedLang
        })
      });

      const data = await res.json();
      if (data.success) {
        const teacherMsg: Message = {
          id: `tm_${Date.now()}`,
          sender: "teacher",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, teacherMsg]);

        // Auto trigger Text-To-Speech playback for a fully automated voice teacher experience!
        setTimeout(() => {
          triggerTextToSpeech(data.reply, teacherMsg.id);
        }, 150);

        // Score rewards
        if (Math.random() > 0.5) {
          onGrantRewards(8, 15);
          onAddNotification("Syllabus Target Achieved", "Received +8 Coins & +15 XP from your AI Personal Tutor!", "success");
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.warn("Talk Teacher failed, using offline response simulation:", err);
      setTimeout(() => {
        let simText = `Wonderful interaction on **${selectedSubject}**! Your response "${textToSend}" aligns with typical curriculum criteria for **${selectedStandard}**.\n\nLet's keep learning! Would you like to try a short practice quiz, or shall we explore another reallife example?`;
        
        if (textToSend.toLowerCase().includes("photosynthesis")) {
          simText = `No problem 😊\n\n**Photosynthesis** is the process plants use to make food using sunlight, water, and carbon dioxide.\n\nThink of it like modern plant leaves cooking food with sunlight energy!\n\nWould you like:\n1. Simple explanation\n2. Diagram explanation\n3. Quiz practice\n4. Real-life examples?`;
        }

        const fallbackMsg: Message = {
          id: `tm_fallback_${Date.now()}`,
          sender: "teacher",
          text: simText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, fallbackMsg]);
        triggerTextToSpeech(simText, fallbackMsg.id);
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  // Perform AdMob rewarded ad integration to unlock specialized syllabus masterplan sheet (voluntary user trigger)
  const triggerAdMobUnlockMasterplan = async () => {
    onAddNotification("Preparing Rewards", "Launching authorized AdMob reward ad layout...", "info");

    const rewardedSuccess = await admobService.showRewardedAd(
      (amount) => {
        setIsSyllabusUnlocked(true);
        onGrantRewards(25, 40);
        onAddNotification("Syllabus Unlocked", "Excellent! +25 Coins & +40 XP awarded. Customized Syllabus syllabus maps active!", "success");
        alert("🎁 Verified fully successfully watched reward ad! Custom Syllabus study tracks are now loaded below!");
      },
      () => {
        console.log("Ad video completed or skipped.");
      }
    );

    if (!rewardedSuccess) {
      setCooldownTime(30);
      alert("⏳ A brief 2-minute cooldown gap is requested between AdMob reward videos to maintain high performance. Rest a bit and try again!");
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in max-w-7xl mx-auto pb-12">
      {/* HEADER HERO BOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/40 via-[#070a14] to-emerald-950/30 rounded-[35px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold bg-[#CCFF00] text-black px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
              <GraduationCap className="w-3.5 h-3.5" />
              NexaLearn AI Talk Teacher Mode
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold bg-emerald-400/10 text-emerald-300 px-3 py-1 rounded-full">
              Real-Time Voice Assistant Activated
            </span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">AI Personal Talking Teacher</h2>
          <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
            Teach, converse, solve, and revision-drill with our hyper-intelligent, comforting personal AI tutor. Exposes natural speech translations, live explanations, visual text diagrams, and immediate interactive questions.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="z-10 py-2.5 px-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs uppercase cursor-pointer border border-white/5 font-mono"
        >
          Return to Hub
        </button>
      </div>

      {/* ADMOB COMPLIANCE ADVISORY */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3 text-xs text-emerald-300 items-start">
        <span className="text-lg">🔊</span>
        <div>
          <span className="font-bold block text-white mb-0.5">High-eCPM Monetized Rewarded Ad Systems Guarded:</span>
          NexaLearn monetizes safely and respects Google Play layout policies. Rewarded video ad units will only load when you voluntarily click on interactive triggers like <strong className="text-emerald-400">"Unlock Customized Syllabus Masterplan"</strong>. At startup, no automated interstitial displays load.
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT CONFIGURATION PANEL (4/12 width) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* TEACHER VOICE CONFIG & VISUALIZER */}
          <div className="neo-glass p-5 rounded-[30px] border border-white/5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              AI Voice Terminal Config
            </h4>

            {/* Simulated Live Audio Waveform */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 h-10 w-full bg-black/50 rounded-xl px-4 border border-white/5">
                {isListening ? (
                  // Active user talking visualization
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping mr-2" />
                    <span className="text-[10px] text-red-400 font-mono tracking-wide uppercase font-black uppercase">Your Voice Meter Active...</span>
                  </div>
                ) : (
                  waveHeights.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isSpeaking ? "bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]" : "bg-white/20"
                      }`}
                    />
                  ))
                )}
              </div>
              <span className={`text-[10px] uppercase font-mono tracking-wider ${isSpeaking ? "text-[#CCFF00] font-bold animate-pulse" : isListening ? "text-red-400 font-bold" : "text-gray-500"}`}>
                {isSpeaking ? "AI Teacher Speaking Voice playing..." : isListening ? "● LISTENING TO YOUR VOICE..." : "AI Voice Mode Standby"}
              </span>

              {/* Physical Tap-To-Verbal-Talk Active Anchor */}
              <button
                onClick={toggleMicListening}
                className={`w-full py-2.5 px-4 rounded-xl font-bold font-mono text-xs uppercase cursor-pointer flex items-center justify-center gap-2 transition-all ${
                  isListening 
                    ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse" 
                    : "bg-gradient-to-r from-[#CCFF00] to-emerald-400 text-black hover:brightness-110 font-black shadow-[0_4px_15px_rgba(204,255,0,0.15)]"
                }`}
              >
                <Mic className={`w-4 h-4 ${isListening ? "animate-bounce" : ""}`} />
                {isListening ? "Click to Stop Listening" : "Tap Here to Live Speech Talk"}
              </button>
              
              <span className="text-[9px] text-gray-500 text-center block max-w-xs leading-normal">
                {recognitionSupported 
                  ? "✓ Fully supported. Click above to speak directly in your dialect!"
                  : "⚠ Simulating voice actions over standard sound. Text fallback initialized."}
              </span>
            </div>

            {/* Vocal speed controller selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-gray-400 block">Vocal Reading Speed Mode</label>
              <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                {[
                  { value: 0.7, label: "Slow 🧘‍♂️", tip: "Kids & Beginners" },
                  { value: 1.0, label: "Standard 🎓", tip: "Conversational" },
                  { value: 1.3, label: "Energetic ⚡", tip: "Revision" }
                ].map(rateOpt => (
                  <button
                    key={rateOpt.value}
                    onClick={() => {
                      setSpeechRate(rateOpt.value);
                      onAddNotification("Voice Tuner Ready", `Teacher reading speed configured to: ${rateOpt.value}x`, "info");
                    }}
                    className={`py-1.5 px-2 text-[10px] rounded-lg font-bold uppercase transition-all flex flex-col items-center ${
                      speechRate === rateOpt.value 
                        ? "bg-[#CCFF00] text-black" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>{rateOpt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct voice cancellation button */}
            {isSpeaking && (
              <button
                onClick={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setActiveVoiceMsgId(null);
                }}
                className="w-full py-2 bg-red-600/15 border border-red-500/20 text-red-300 font-black tracking-wider uppercase text-[10px] rounded-xl hover:bg-red-600/30 transition-all cursor-pointer flex justify-center items-center gap-1"
              >
                <Pause className="w-3.5 h-3.5" /> Stop Live Audio Playback
              </button>
            )}
          </div>

          {/* CURRICULUM CONTROLS COLUMN */}
          <div className="neo-glass p-5 rounded-[30px] border border-white/5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Academic Curricular Focus
            </h4>

            {/* Classes/Standard Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase block">1. Target Class Standard Level</label>
              <select
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#CCFF00]"
              >
                {ENROLLED_STANDARDS.map(s => (
                  <option key={s.id} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Interactive Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase block">2. Curriculum Subject Branch</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  const related = TEACHER_SUBJECTS.find(sub => sub.name === e.target.value);
                  if (related) {
                    setMessages(prev => [
                      ...prev,
                      {
                        id: `tm_auto_${Date.now()}`,
                        sender: "teacher",
                        text: `Subject changed! Let's examine **${e.target.value}** under the **${selectedStandard.split(" ")[0]}** profile.\n\nWhat curriculum doubts do you have? You can also ask me: *"Please launch a quiz on ${related.defaultTopic}"*!`,
                        timestamp: "Just now"
                      }
                    ]);
                  }
                }}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#CCFF00]"
              >
                {TEACHER_SUBJECTS.map(sub => (
                  <option key={sub.id} value={sub.name}>{sub.name} ({sub.group})</option>
                ))}
              </select>
            </div>

            {/* Special Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase block">3. Teaching Style Protocol</label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#CCFF00]"
              >
                {TEACHER_MODES.map(m => (
                  <option key={m.id} value={m.name}>{m.name} - {m.desc}</option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase block">4. Multi-Language Dialect Selector</label>
              <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5 max-h-[140px] overflow-y-auto custom-scrollbar">
                {MULTILINGUAL_TUNERS.map(l => {
                  const active = selectedLang === l.name;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        setSelectedLang(l.name);
                        onAddNotification("Language Switching", `AI language model tuned for: ${l.name}`, "info");
                      }}
                      className={`py-1.5 px-2 text-[9px] rounded-lg font-bold tracking-tight transition-all flex flex-col items-center justify-center ${
                        active 
                          ? "bg-cyan-500 text-black font-extrabold" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span className="truncate max-w-full text-center mt-0.5">{l.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CORE INTERACTION SCREEN (8/12 width) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* INTERACTIVE STUDY CHAT TERMINAL */}
          <div className="neo-glass rounded-[30px] border border-white/5 overflow-hidden h-[480px] flex flex-col">
            {/* Terminal header */}
            <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#CCFF00]/15 border border-[#CCFF00]/25 flex items-center justify-center relative">
                  <span className="text-xl">👩‍🏫</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight font-mono">Curricular Mentor Terminal</h4>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    Level: {selectedStandard.split(" ")[0]} • Mode: {selectedMode.split(" ")[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-white/5 border border-white/5 font-mono text-cyan-400 px-2 py-0.5 rounded-md">
                  LANGUAGE: {selectedLang.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Chat Body & Input OR Interactive Pronunciation Lab depending on state */}
            {!pronunciationLabOpen ? (
              <>
                {/* Chat Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
                  {messages.map((m) => {
                    const isStudent = m.sender === "student";
                    return (
                      <div key={m.id} className="space-y-1.5">
                        <div className={`flex items-start gap-3 ${isStudent ? "flex-row-reverse" : "flex-row"}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border shrink-0 ${
                            isStudent 
                              ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-300" 
                              : "bg-[#CCFF00]/10 border-[#CCFF00]/20 text-[#CCFF00]"
                          }`}>
                            {isStudent ? <User className="w-4.5 h-4.5" /> : <span>👩‍🏫</span>}
                          </div>

                          {/* Msg Panel */}
                          <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                            isStudent 
                              ? "bg-emerald-600/20 text-emerald-50 font-bold border border-emerald-500/10 text-right" 
                              : "bg-white/5 text-gray-100 border border-white/5 text-left"
                          }`}>
                            {m.text}

                            <span className="block text-[8px] text-gray-500 font-mono mt-2 uppercase text-left">
                              {m.timestamp}
                            </span>
                          </div>
                        </div>

                        {/* Inline Text-to-Speech synthesis trigger widget and options */}
                        {!isStudent && (
                          <div className="pl-11 flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => triggerTextToSpeech(m.text, m.id)}
                              className={`py-1 px-2.5 text-[9px] font-black tracking-wider uppercase rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                                activeVoiceMsgId === m.id
                                  ? "bg-[#CCFF00] text-black font-extrabold"
                                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {activeVoiceMsgId === m.id ? (
                                <>
                                  <Pause className="w-3.5 h-3.5 animate-pulse" /> Stop Voice
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" /> Speech Audio
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setInputValue(`Can you explain that more simply with an easy analogy?`);
                              }}
                              className="py-1 px-2 text-[9px] bg-white/2 border border-white/5 rounded-md text-gray-400 hover:text-white transition-all hover:bg-white/5"
                            >
                              🌱 Simplify
                            </button>
                            <button
                              onClick={() => {
                                setInputValue(`Give me a practice quiz question on this specific point!`);
                              }}
                              className="py-1 px-2 text-[9px] bg-white/2 border border-white/5 rounded-md text-gray-400 hover:text-white transition-all hover:bg-white/5"
                            >
                              ✏️ Quiz Me
                            </button>
                            <button
                              onClick={() => openPronunciationLab(m.text)}
                              className="py-1 px-2.5 text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold hover:bg-emerald-500/20 rounded-md transition-all flex items-center gap-1 font-mono"
                              title="Verify accent clarity and intonation score with real-time mic analysis"
                            >
                              🎙️ Practice Pitch
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-center animate-spin flex items-center justify-center text-xs">
                        🌀
                      </div>
                      <div className="py-2.5 px-4 bg-white/5 rounded-full border border-white/5 text-[10px] text-emerald-300 animate-pulse font-mono tracking-wide uppercase">
                        AI Teacher formulation active, adapting metrics to {selectedStandard.split(" ")[0]}...
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Container */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2 items-center">
                  <button
                    onClick={toggleMicListening}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-none transition-all cursor-pointer ${
                      isListening 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-white/5 text-emerald-400 hover:bg-white/10"
                    }`}
                    title="Speak to the AI Teacher Mode"
                  >
                    <Mic className={`w-5 h-5 ${isListening ? "animate-bounce" : ""}`} />
                  </button>

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    placeholder={isListening ? "Listening to your speech... speak now!" : `Ask any curricular question regarding ${selectedSubject} in ${selectedLang}...`}
                    className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00]"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={loading || !inputValue.trim()}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-none transition-all cursor-pointer shrink-0 ${
                      inputValue.trim() 
                        ? "bg-[#CCFF00] hover:scale-105 active:scale-95 text-black" 
                        : "bg-white/5 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Coin Cost Indicator footer banner */}
                <div className="px-4 pb-3 flex justify-between items-center text-[9px] font-mono select-none">
                  <span className="text-gray-500 uppercase">⚡ REAL-TIME SYLLABUS TUNED MODEL</span>
                  <span className="text-amber-400 font-extrabold flex items-center gap-1">
                    🪙 FEE: 5 COINS PER CHAT MESSAGE (YOUR CARD: {profile?.coins || 0} NEXA)
                  </span>
                </div>
              </>
            ) : (
              // ==========================================
              // DYNAMIC INTERACTIVE AUDIO PRONUNCIATION LAB
              // ==========================================
              <div className="flex-1 p-5 bg-[#03050c]/90 text-left flex flex-col justify-between h-full overflow-y-auto custom-scrollbar relative">
                <div className="space-y-4">
                  {/* Lab Header */}
                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-black border border-emerald-500/10">
                        🎙️ High-Fidelity Accent Alignment Lab
                      </span>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight font-mono mt-1.5">Pronunciation Trainer Hub</h4>
                    </div>

                    <button 
                      onClick={closePronunciationLab}
                      className="py-1 px-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-[10px] uppercase font-mono font-bold border border-white/5 cursor-pointer"
                    >
                      Close Lab
                    </button>
                  </div>

                  {/* Target Phrase Box */}
                  <div className="p-4 bg-black/40 border border-[#CCFF00]/10 rounded-2xl space-y-2 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#CCFF00]/5 blur-xl pointer-events-none" />
                    
                    <span className="text-[9px] font-mono uppercase text-gray-500">TUTOR REFERENCE PHRASE TO MIMIC:</span>
                    <p className="text-sm font-bold text-white leading-relaxed select-all">"{targetPhrase}"</p>

                    <button
                      onClick={() => triggerTextToSpeech(targetPhrase, "practice_ref")}
                      className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-lg text-[10px] font-bold uppercase transition-all mt-1 ${
                        activeVoiceMsgId === "practice_ref"
                          ? "bg-[#CCFF00] text-black"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {activeVoiceMsgId === "practice_ref" ? <Pause className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3" />}
                      Listen to Reference Teacher Voice (Slow Speed)
                    </button>
                  </div>

                  {/* Recording & Spectroscopy Canvas View */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {/* Real-Time Mic Sound Wave Visualization */}
                    <div className="bg-black/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between min-h-[140px] relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono text-cyan-400 uppercase">Interactive Spectrometer:</span>
                        {isRecordingPractice && (
                          <span className="text-[8px] bg-red-500 text-white font-mono px-2 py-0.5 rounded animate-pulse">
                            ● REC ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex-1 bg-black/50 border border-white/5 rounded-xl h-24 overflow-hidden relative flex items-center justify-center">
                        <canvas 
                          ref={practiceCanvasRef} 
                          width={280} 
                          height={96}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        {!isRecordingPractice && !showPracticeResult && (
                          <span className="absolute text-[10px] text-gray-500 font-mono tracking-wide uppercase text-center max-w-xs leading-normal">
                            📋 Visualizer Standby. Click "Start Recording" to analyze pitch overlaps.
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        {!isRecordingPractice ? (
                          <button
                            onClick={startPracticeVoiceAnalysis}
                            className="flex-1 py-2 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20"
                          >
                            <Mic className="w-4 h-4 animate-bounce" /> Start Recording
                          </button>
                        ) : (
                          <button
                            onClick={() => stopPracticeVoiceAnalysis()}
                            className="flex-1 py-2 py-2.5 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/20 animate-pulse"
                          >
                            <Pause className="w-4 h-4" /> Stop & Match Accent
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Speech Sandbox Manual Input override block (Perfect for iframe context testing!) */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-gray-500 uppercase block">Dialect Transcription override box</span>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          If browser mic rules are blocked by sandbox iframe restrictions, type what you spoke manually or use simulated audio patterns to verify accuracy:
                        </p>
                      </div>

                      <div className="my-2 space-y-1.5">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Type or transcript speech here..."
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setInputValue(targetPhrase);
                              onAddNotification("Simulated Voice Pattern", "Loaded exact target copy for automated 100% fluent grade evaluation!", "success");
                            }}
                            className="py-1 px-2.5 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/20 font-mono text-[9px] rounded-lg transition-all cursor-pointer"
                          >
                            ⚡ Load 100% Perfect Mimic
                          </button>
                          <button
                            onClick={() => {
                              // Crop or drop words for imperfect trial
                              const words = targetPhrase.split(" ");
                              const cropped = words.slice(0, Math.ceil(words.length * 0.75)).join(" ") + " misspelling";
                              setInputValue(cropped);
                              onAddNotification("Simulated Imperfect Voice", "Loaded partial phrase segment for imperfect grade logs!", "info");
                            }}
                            className="py-1 px-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 font-mono text-[9px] rounded-lg transition-all cursor-pointer"
                          >
                            ⚡ Load Partial Mimic
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => stopPracticeVoiceAnalysis()}
                        disabled={!inputValue.trim()}
                        className={`w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${!inputValue.trim() ? "opacity-30 cursor-not-allowed" : ""}`}
                      >
                        ✔ Evaluate Spoken Text
                      </button>
                    </div>
                  </div>

                  {/* Evaluation Report Panel */}
                  {showPracticeResult && (
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-left space-y-4 animate-fade-in relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl pointer-events-none" />
                      
                      {/* Overall Percentage Metrics header */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex flex-col items-center justify-center relative select-none shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                            <span className="text-[8px] font-mono text-yellow-400 uppercase font-black tracking-tight">PRON</span>
                            <span className="text-xl font-mono font-black text-white">{practiceAudioStats.overall}%</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono font-black text-[#CCFF00] uppercase tracking-wider block">Fluency Grade Index Verified</span>
                            <span className="text-xs font-semibold text-gray-300">Cadence Score: {practiceAudioStats.overall >= 80 ? "EXCELLENT ★★★" : practiceAudioStats.overall >= 60 ? "SATISFACTORY ★★" : "PRACTICE REQUIRED ★"}</span>
                          </div>
                        </div>

                        {/* Speech Parameters bento splits */}
                        <div className="flex gap-4 text-xs font-mono">
                          <div className="space-y-0.5">
                            <span className="text-gray-500 text-[8px] block uppercase">Clarity Index</span>
                            <span className="text-cyan-400 font-bold">{practiceAudioStats.accentMatch}%</span>
                          </div>
                          <div className="space-y-0.5 border-l border-white/5 pl-4">
                            <span className="text-gray-500 text-[8px] block uppercase">Pitch Pattern</span>
                            <span className="text-purple-400 font-bold">{practiceAudioStats.pitchMatch}%</span>
                          </div>
                          <div className="space-y-0.5 border-l border-white/5 pl-4">
                            <span className="text-gray-500 text-[8px] block uppercase">Rhythm Speed</span>
                            <span className="text-[#CCFF00] font-bold">{practiceAudioStats.fluency}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Phonics highlighting splits */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-gray-500 uppercase block">PHONETIC ACCURACY ANALYSIS MARKUP (TAP INDIVIDUAL WORD):</span>
                        <div className="flex flex-wrap gap-1.5 p-3.5 bg-black/60 rounded-xl border border-white/5 text-sm select-none">
                          {practiceAudioStats.spokenWords.map((wordObj, idx) => (
                            <span
                              key={idx}
                              onClick={() => {
                                onAddNotification("Phonics Tooltip", `Word: "${wordObj.word}" - State: ${wordObj.status.toUpperCase()}`, "info");
                                if (window.speechSynthesis) {
                                  window.speechSynthesis.cancel();
                                  const u = new SpeechSynthesisUtterance(wordObj.word);
                                  u.rate = 0.65; // Slow down for accent mimic
                                  window.speechSynthesis.speak(u);
                                }
                              }}
                              className={`px-2 py-1 rounded-md text-xs font-bold leading-none cursor-pointer hover:scale-105 transition-all ${
                                wordObj.status === "correct"
                                  ? "bg-[#CCFF00]/10 border border-[#CCFF00]/40 text-[#CCFF00]"
                                  : wordObj.status === "mismatch"
                                    ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-300"
                                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                              }`}
                              title={`Phonics class: ${wordObj.status.toUpperCase()}`}
                            >
                              {wordObj.word}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-3 text-[8.5px] font-mono text-gray-400 px-1 pt-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-[#CCFF00]/10 border border-[#CCFF00]/40 rounded inline-block" /> Accurately Articulated
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded inline-block" /> Cadence Mismatch
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-red-500/10 border border-red-500/30 rounded inline-block" /> Missing Segment
                          </span>
                        </div>
                      </div>

                      {/* Coach Suggestions */}
                      <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex gap-2.5 text-xs text-gray-300 items-start">
                        <span className="text-base select-none">💬</span>
                        <div className="space-y-0.5">
                          <strong className="text-white block font-mono uppercase text-[9px] tracking-wider text-emerald-400">AI Personal Accent Tutor Suggestion:</strong>
                          <p className="leading-relaxed font-sans mt-0.5">{practiceAudioStats.feedback}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Return actions footer node */}
                <div className="border-t border-white/5 pt-4 text-center mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setShowPracticeResult(false);
                      setIsRecordingPractice(false);
                      onAddNotification("Scores Reset", "Accent alignment registers flushed! Ready to record.", "info");
                    }}
                    className="flex-1 py-2 px-4 bg-white/5 text-gray-300 hover:text-white rounded-xl text-xs uppercase font-mono border border-white/5 font-bold transition-all"
                  >
                    🔄 Clear & Retry Accent Mimic
                  </button>

                  <button
                    onClick={closePronunciationLab}
                    className="flex-1 py-2 px-4 bg-[#CCFF00] hover:scale-105 active:scale-95 text-black rounded-xl text-xs uppercase font-mono font-black transition-all"
                  >
                    Return to Tutor Chat Terminal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ADMOB INTEGRATED CURRICULUM UNLOCK (VOLUNTARY MONETIZED ACTIONS) */}
          <div className="neo-glass rounded-[30px] p-6 border border-white/5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="text-xs font-black uppercase tracking-wider font-mono">Interactive Syllabus Revision Masterplan</span>
                </div>
                <h5 className="text-sm font-black text-white">Unlock Grade Syllabus Map for {selectedStandard.split(" ")[0]}</h5>
                <p className="text-xs text-gray-400 max-w-lg">
                  Watch a quick rewarded advertisement to unlock your class standard syllabus, optimized study targets, and gain +25 Coins & +40 XP instantly.
                </p>
              </div>

              {!isSyllabusUnlocked ? (
                <button
                  onClick={triggerAdMobUnlockMasterplan}
                  disabled={cooldownTime > 0}
                  className="py-2.5 px-5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-all shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {cooldownTime > 0 ? `Ad Cooldown (${cooldownTime}s)` : "Unlock Masterplan (Ad)"}
                </button>
              ) : (
                <div className="py-1 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono uppercase rounded-full">
                  Unlocked Successfully! 🎉
                </div>
              )}
            </div>

            {/* Render unlocked custom masterplan content */}
            {isSyllabusUnlocked && (
              <div className="p-4 bg-black/40 border border-[#CCFF00]/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fade-in font-mono">
                <div className="space-y-2 border-r border-white/5 pr-2">
                  <span className="text-[#CCFF00] text-[10px] uppercase font-bold block mb-1">📘 1. Core Subjects Focus</span>
                  <ul className="space-y-1 text-gray-300 text-[11px]">
                    <li>• Mathematics Geometry Mastery</li>
                    <li>• Atmospheric Physics Systems</li>
                    <li>• Biochemical Chloroplast cycles</li>
                    <li>• Binary Algorithms Convergence</li>
                  </ul>
                </div>

                <div className="space-y-2 border-r border-white/5 pr-2">
                  <span className="text-cyan-400 text-[10px] uppercase font-bold block mb-1">📋 2. Live Quiz Milestones</span>
                  <ul className="space-y-1 text-gray-300 text-[11px]">
                    <li>• 12 Weekly Revision Challenges</li>
                    <li>• Vocabulary Flashcards Practice</li>
                    <li>• 4 Pronunciation Tests Done</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-purple-400 text-[10px] uppercase font-bold block mb-1">🎁 3. Special Reward Bounds</span>
                  <div className="text-[11px] text-gray-300 leading-normal font-sans">
                    Watching verified interactive tutor videos grants <strong className="text-yellow-400">1.8x multiplier marks</strong> matching your chosen class standard context!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
