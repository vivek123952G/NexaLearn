import React, { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  Share2, 
  Tv, 
  ShieldAlert, 
  Radio, 
  TrendingUp, 
  Lock, 
  Clipboard, 
  Users, 
  ShieldCheck, 
  Clock, 
  Globe, 
  Printer, 
  Download, 
  RefreshCw, 
  Check, 
  ChevronRight, 
  Zap, 
  AlertTriangle,
  Flame,
  UserCheck
} from "lucide-react";
import { UserProfile } from "../types";

interface GrowthEngineHubProps {
  profile: UserProfile;
  onGrantRewards: (xp: number, coins: number) => void;
  onAddNotification: (title: string, message: string, type: "success" | "info" | "alert") => void;
  onSaveProfile: (updated: UserProfile) => void;
  onClose: () => void;
}

export const GrowthEngineHub: React.FC<GrowthEngineHubProps> = ({
  profile,
  onGrantRewards,
  onAddNotification,
  onSaveProfile,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<
    "qr" | "p2p" | "ab" | "bio" | "clipboard" | "b2b" | "parent" | "scraping" | "ttl" | "lang"
  >("qr");

  // Helper: Generates a deterministic high-fidelity mock vector QR code represented as an array of black/white blocks
  const generateMockQrMatrix = (input: string, size = 15) => {
    // Generate a pseudo-random grid seeded by input length & characters
    const matrix: boolean[][] = [];
    const seed = input.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Custom seed-based pseudo random generator
    let currentSeed = seed;
    const rand = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    for (let r = 0; r < size; r++) {
      matrix[r] = [];
      for (let c = 0; c < size; c++) {
        // Standard QR code positioning blocks (Finder patterns)
        const isFinderTopLeft = r < 5 && c < 5;
        const isFinderTopRight = r < 5 && c >= size - 5;
        const isFinderBottomLeft = r >= size - 5 && c < 5;

        if (isFinderTopLeft || isFinderTopRight || isFinderBottomLeft) {
          // Render outer ring & inner point of finder structures
          const innerOffsetRow = isFinderTopRight ? 0 : (isFinderBottomLeft ? size - 5 : 0);
          const innerOffsetCol = isFinderTopRight ? size - 5 : (isFinderBottomLeft ? 0 : 0);
          const relR = r - innerOffsetRow;
          const relC = c - innerOffsetCol;
          
          const isOuterBorder = relR === 0 || relR === 4 || relC === 0 || relC === 4;
          const isCenterSolid = relR === 2 && relC === 2;
          
          matrix[r][c] = isOuterBorder || isCenterSolid;
        } else {
          // Semi-random data modules
          matrix[r][c] = rand() > 0.45;
        }
      }
    }
    return matrix;
  };

  // ─── 1. DYNAMIC QR GENERATOR STATES ───
  const [qrPayload, setQrPayload] = useState(`https://nexalearn.ai/deck/math_poly_105?referrer=${profile.username || "guest"}`);
  const [qrColor, setQrColor] = useState("#CCFF00");
  const [qrSizeScale, setQrSizeScale] = useState(250);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handlePrintQr = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked! Enable popups to print QR worksheets.");
      return;
    }
    const matrix = generateMockQrMatrix(qrPayload);
    const size = matrix.length;
    const itemSize = 16;
    
    // Build actual SVG elements for print
    let svgContent = "";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          svgContent += `<rect x="${c * itemSize}" y="${r * itemSize}" width="${itemSize}" height="${itemSize}" fill="black" />`;
        }
      }
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>NexaLearn Printable Worksheets - Deep-Link QR Nodes</title>
          <style>
            body { font-family: 'Inter', sans-serif; background: white; color: black; padding: 40px; text-align: center; }
            .worksheet-card { border: 2px dashed #ccc; padding: 30px; border-radius: 20px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            h1 { font-size: 24px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            p { font-size: 13px; color: #555; margin-bottom: 25px; }
            .meta-info { font-family: monospace; font-size: 11px; color: #777; margin-top: 15px; word-break: break-all; }
            @media print { body { padding: 0; } .worksheet-card { border: none; box-shadow: none; } button { display: none; } }
          </style>
        </head>
        <body>
          <div class="worksheet-card">
            <span style="font-size:24px;">🔬</span>
            <h1>AP CHEMISTRY DECK GATEWAY</h1>
            <p>Scan this vector-compiled deep link worksheet node to boot interactive flashcards automatically.</p>
            <div style="display: flex; justify-content: center; margin: 20px 0;">
              <svg width="${size * itemSize}" height="${size * itemSize}" viewBox="0 0 ${size * itemSize} ${size * itemSize}">
                ${svgContent}
              </svg>
            </div>
            <div class="meta-info">Deep-Link Target: ${qrPayload}</div>
            <p style="margin-top:20px; font-weight:bold; font-size:12px;">NexaLearn © 2026 Academic Distribution Network</p>
            <button onclick="window.print()" style="margin-top:20px; padding: 10px 20px; background: #000; color: #fff; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">Print Sheet</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ─── 2. P2P OFFLINE PEER SHARING STATES ───
  const [p2pActive, setP2pActive] = useState(true);
  const [simulatedPeers, setSimulatedPeers] = useState([
    { username: "@matrix_guru", dbm: -58, online: true, device: "iPad Pro MT4" },
    { username: "@algebra_titan", dbm: -74, online: true, device: "OnePlus Nord v3" },
    { username: "@physics_pioneer", dbm: -89, online: false, device: "iPhone 15 Pro" },
    { username: "@chem_cadet", dbm: -45, online: true, device: "Pixel Book Hub" }
  ]);
  const [sharingToPeer, setSharingToPeer] = useState<string | null>(null);
  const [p2pShareCompleted, setP2pShareCompleted] = useState(false);

  const triggerOfflineP2PShare = (targetPeerName: string) => {
    setSharingToPeer(targetPeerName);
    setP2pShareCompleted(false);
    setTimeout(() => {
      setP2pShareCompleted(true);
      onGrantRewards(15, 30); // Award 15 XP & 30 Local Coins for zero-cellular connection sharing!
      onAddNotification("P2P Dispatch OK 📡", `Offline packet successfully piped to ${targetPeerName} over localized Bluetooth broadcast! Reward granted.`, "success");
    }, 2500);
  };

  // ─── 3. SPLIT-TEST REFERRAL INCENTIVE STATES ───
  const [userSegment, setUserSegment] = useState<"A" | "B" | "C">("A");
  const segmentBonuses = {
    A: { title: "Nexa Plus Premium Access", duration: "3 Days Access", valueRate: "42% Acquisition Boost", desc: "Premium tier trial access on referral signup." },
    B: { title: "Nexa Gold Coins Pack", coins: 500, valueRate: "61% Acquisition Boost", desc: "Awarding 100 Nexa coins daily for 5 continuous milestones." },
    C: { title: "Dual Multiplier Matrix", multiplier: "2x XP Buff", valueRate: "35% Acquisition Boost", desc: "Doubles student XP earned on all community whiteboards." }
  };
  const [simulatedClicks, setSimulatedClicks] = useState({ A: 1420, B: 2060, C: 1115 });
  const [simulatedSignups, setSimulatedSignups] = useState({ A: 340, B: 625, C: 195 });

  const registerSimulatedSegmentAction = (segment: "A" | "B" | "C") => {
    // Increase values to simulate test growth matrix
    setSimulatedClicks(prev => ({ ...prev, [segment]: prev[segment] + 5 }));
    setSimulatedSignups(prev => ({ ...prev, [segment]: prev[segment] + (Math.random() > 0.3 ? 1 : 0) }));
    onAddNotification(`Segment ${segment} Conversion Matrix Recorded`, "A/B segment analytics synced to secure server logs.", "info");
  };

  // ─── 4. BIOMETRIC/PIN GATED PERMISSION SHIELD STATES ───
  const [pinGatedEnabled, setPinGatedEnabled] = useState(true);
  const [isPinModalPrompting, setIsPinModalPrompting] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [customPin, setCustomPin] = useState("4872");
  const [biometricValidating, setBiometricValidating] = useState(false);
  const [passedActionPayload, setPassedActionPayload] = useState<(() => void) | null>(null);

  const requestGatedPermissionShield = (gatedTask: () => void) => {
    if (!pinGatedEnabled) {
      gatedTask();
      return;
    }
    setPassedActionPayload(() => gatedTask);
    setIsPinModalPrompting(true);
    setEnteredPin("");
  };

  const handleAuthPinAttempt = () => {
    if (enteredPin === customPin) {
      setIsPinModalPrompting(false);
      onAddNotification("Secure PIN Unlocked", "Student credentials certified securely.", "success");
      if (passedActionPayload) passedActionPayload();
    } else {
      onAddNotification("Invalid PIN Key", "Security lockout activated. Check matching secure pin.", "alert");
      setEnteredPin("");
    }
  };

  const handleSimulateBiometricTouchId = () => {
    setBiometricValidating(true);
    setTimeout(() => {
      setBiometricValidating(false);
      setIsPinModalPrompting(false);
      onAddNotification("Biometric Fingerprint Verified", "FaceID secure certificate node validated.", "success");
      if (passedActionPayload) passedActionPayload();
    }, 1800);
  };

  // ─── 5. SYSTEM CLIPBOARD AUTO SCANNER STATES ───
  const [clipboardStudyLink, setClipboardStudyLink] = useState<string | null>(null);
  const [clipboardLoading, setClipboardLoading] = useState(false);

  const simulateStartupClipboardScanner = () => {
    setClipboardLoading(true);
    setTimeout(() => {
      setClipboardLoading(false);
      // Mock valid shared deck links
      setClipboardStudyLink("nexalearn://deck/organic_chemistry_ap?sender=ProfJefferson&token=b2b_LincolnUSD");
      onAddNotification("External Clip Detected 📋", "Located valid peer study-deck inside system clipboard hierarchy!", "info");
    }, 1200);
  };

  // ─── 6. B2B INSTITUTIONAL CLASSROOM LICENSING STATES ───
  const [schoolDistrict, setSchoolDistrict] = useState("Lincoln Unified School District");
  const [licensingTier, setLicensingTier] = useState<"SilverClass" | "GoldCampus" | "DistrictEnterprise">("SilverClass");
  const [activeRoster, setActiveRoster] = useState([
    { name: "Alissa Vance", currentXp: 480, level: 3 },
    { name: "Brad Fletcher", currentXp: 920, level: 5 },
    { name: "Cassandra Kyle", currentXp: 1540, level: 8 },
    { name: "Diego Sanders", currentXp: 280, level: 2 }
  ]);
  const [newRosterMemberName, setNewRosterMemberName] = useState("");

  const addNewStudentToRoster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRosterMemberName.trim()) return;
    setActiveRoster(prev => [
      ...prev,
      { name: newRosterMemberName.trim(), currentXp: 0, level: 1 }
    ]);
    setNewRosterMemberName("");
    onAddNotification("Roster Sync Updated", `Scribed ${newRosterMemberName} into structural Classroom Licences, synced real-time.`, "success");
  };

  // ─── 7. PARENTAL WEB-HOOK SIGNATURE ROUTING STATES ───
  const [studentBirthYear, setStudentBirthYear] = useState<string>("2014"); // Underage default
  const [parentEmail, setParentEmail] = useState("guardian@familydefense.org");
  const [webhookToken, setWebhookToken] = useState("");
  const [parentApprovalStatus, setParentApprovalStatus] = useState<"pending" | "approved" | "unverified">("unverified");

  const sendParentalApprovalWebhook = () => {
    if (!parentEmail.match(/^\S+@\S+\.\S+$/)) {
      alert("Introduce a valid parent / guardian email!");
      return;
    }
    const token = `token_cop_${Math.floor(100000 + Math.random() * 900000)}`;
    setWebhookToken(token);
    setParentApprovalStatus("pending");
    onAddNotification("Approval Webhook Outgoing 📬", `Registered digital consent payload and dispatched encrypted webhook link.`, "info");
  };

  const simulateGuardianApproveHook = () => {
    setParentApprovalStatus("approved");
    onAddNotification("COPPA Sanctions Unlocked 🔑", "Active guardian profile signed securely. All sharing features validated!", "success");
  };

  // ─── 8. CONTENT SCRAPING ANTI-IP PROTECTION COUPLING STATES ───
  const [sharingTrafficHits, setSharingTrafficHits] = useState<number>(0);
  const [rateLimitState, setRateLimitState] = useState<"nominal" | "warn" | "throttled">("nominal");
  const [scrapersFoilRecords, setScrapersFoilRecords] = useState<string[]>([]);

  // Periodically decay request spikes
  useEffect(() => {
    const decay = setInterval(() => {
      setSharingTrafficHits(p => Math.max(0, p - 3));
    }, 2000);
    return () => clearInterval(decay);
  }, []);

  const triggerLinkGenerationActivity = () => {
    setSharingTrafficHits(p => {
      const next = p + 12;
      if (next >= 40) {
        setRateLimitState("throttled");
        if (!scrapersFoilRecords.includes(`Block IP Proxy ${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.14.2`)) {
          setScrapersFoilRecords(prev => [
            `Blocked IP ${100 + Math.floor(Math.random()*154)}.${Math.floor(Math.random()*254)}.14.2 at ${new Date().toLocaleTimeString()}`,
            ...prev.slice(0, 4)
          ]);
        }
        onAddNotification("ANTI-SCRAPING INTERCEPT 🛑", "Rate limit exceeded. Lockout active for 15s to bypass scrapers & shield assets.", "alert");
      } else if (next >= 24) {
        setRateLimitState("warn");
      } else {
        setRateLimitState("nominal");
      }
      return next;
    });
  };

  // ─── 9. DEEP ROUTING EXPIRE TTL & SELF HEALING METADATA STATES ───
  const [tempLinkMinutesTtl, setTempLinkMinutesTtl] = useState(5);
  const [activeTempLinks, setActiveTempLinks] = useState([
    { id: "ttl_calc_1", path: "nexalearn://room/ap_chemistry_live", minutesLeft: 4, fallback: "nexalearn://room/public_chemistry_hub", healed: false },
    { id: "ttl_chem_2", path: "nexalearn://room/geometry_blitz", minutesLeft: 0, fallback: "nexalearn://room/public_geometry_hub", healed: false }
  ]);

  const handleTriggerTempLink = (linkId: string) => {
    setActiveTempLinks(prev => prev.map(lnk => {
      if (lnk.id === linkId) {
        if (lnk.minutesLeft === 0) {
          // Heal automatically- Self-Healing Interceptor Engine takes control!
          onAddNotification("Self-Healing Triggered 🚀", "Temporary deck invitation expired. Intercepted error & routed to fallback room!", "info");
          return { ...lnk, healed: true, minutesLeft: 10 }; // Auto-heals link TTL
        } else {
          onAddNotification("Room Connection established", "Joined group session node successfully.", "success");
        }
      }
      return lnk;
    }));
  };

  // ─── 10. MULTILANGUAGE REVIEW STORE LINK DISPATCH ROTATOR ───
  const [academicLang, setAcademicLang] = useState("fr-FR");
  const fallbackStoreLinks: Record<string, { storeUrl: string; countryCode: string; localizedPrompt: string }> = {
    "en-US": { storeUrl: "https://apps.apple.com/us/app/nexalearn-study", countryCode: "US", localizedPrompt: "Rate us with 5 Stars on iOS US Store" },
    "es-MX": { storeUrl: "https://apps.apple.com/mx/app/nexalearn-study", countryCode: "MX", localizedPrompt: "Calificar con 5 estrellas en la tienda MX" },
    "fr-FR": { storeUrl: "https://apps.apple.com/fr/app/nexalearn-study", countryCode: "FR", localizedPrompt: "Évaluez-nous avec 5 étoiles sur le Store FR" },
    "zh-CN": { storeUrl: "https://apps.apple.com/cn/app/nexalearn-study", countryCode: "CN", localizedPrompt: "在 iOS 中国商店为我们评分 5 星" },
    "hi-IN": { storeUrl: "https://apps.apple.com/in/app/nexalearn-study", countryCode: "IN", localizedPrompt: "भारतीय प्ले स्टोर पर हमें 5 स्टार दें" }
  };

  const handleLaunchLocalizedAppstoreReview = () => {
    const selected = fallbackStoreLinks[academicLang];
    // Create fully localized regional deeplink
    const fullDeeplink = `${selected.storeUrl}?action=write-review&country=${selected.countryCode}&hl=${academicLang}`;
    onAddNotification("Review Dispatched", "Redirecting review stream directly to localized academic storefront app page.", "success");
    onGrantRewards(20, 10);
    window.open(fullDeeplink, "_blank");
  };


  return (
    <div className="fixed inset-0 bg-[#070709]/95 backdrop-blur-2xl z-[170] flex flex-col p-4 md:p-6 text-white overflow-hidden uppercase font-mono">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-xl flex items-center justify-center text-[#CCFF00]">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest text-[#CCFF00]">
              GROWTH & DEEP-ROUTING STACK
            </h2>
            <p className="text-[10px] text-gray-400 font-sans tracking-wide">
              EDTECH ENG ARCHITECTURE • MOBILE RECRUIT MATRIX WORKSPACE
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          DISMISS LAB
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        {/* SIDEBAR TABS LIST (10 EXPERIMENTAL MODULES) */}
        <div className="lg:col-span-4 bg-black/40 border border-white/5 rounded-3xl p-3 flex flex-col gap-1.5 overflow-y-auto max-h-[220px] lg:max-h-full">
          <span className="text-[10px] pl-2 py-1 text-gray-500 font-sans tracking-wider block font-bold uppercase">
            Active Integration Sub-Systems
          </span>
          {[
            { id: "qr", label: "1. Vector QR Generator", sub: "Printable worksheet links" },
            { id: "p2p", label: "2. Offline P2P Sharing", sub: "Local WiFi/BLE direct link" },
            { id: "ab", label: "3. A/B Referral Split", sub: "Incentive variants compiler" },
            { id: "bio", label: "4. Biometric PIN Shield", sub: "Lock anti-exfiltration" },
            { id: "clipboard", label: "5. Auto Clipboard Scan", sub: "In-app URL listener toast" },
            { id: "b2b", label: "6. Classroom Licensing", sub: "Licence grouping clusters" },
            { id: "parent", label: "7. Guardian COPPA Gate", sub: "Encrypted parental logs" },
            { id: "scraping", label: "8. Anti-Scraping Shield", sub: "Device link rate protector" },
            { id: "ttl", label: "9. TTL link Self-Heal", sub: "Expire fallback router" },
            { id: "lang", label: "10. Store Local Router", sub: "Regional reviews generator" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full py-3 px-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${activeTab === tab.id ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-bold' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'}`}
            >
              <span className="text-xs font-black tracking-wide">{tab.label}</span>
              <span className={`text-[9px] lowercase tracking-normal mt-0.5 font-sans ${activeTab === tab.id ? 'text-black/70 font-semibold' : 'text-gray-400'}`}>
                {tab.sub}
              </span>
            </button>
          ))}
        </div>

        {/* DETAILS WORKSPACE PANEL */}
        <div className="lg:col-span-8 bg-[#0a0a0d] border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col justify-between overflow-y-auto relative">
          
          <div className="space-y-5">
            {/* 🔬 MODULE LAB ENVIRONMENT TITLE CARDS */}
            {activeTab === "qr" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 01
                  </span>
                  <h3 className="text-md font-black text-white">Dynamic Printable Vector QR Generator</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    generates customizable, vector-based printable worksheet templates containing embedded deep links, providing teachers the ability to dispatch physical cards to smart devices.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CONFIG PANEL */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-3.5 text-left">
                    <span className="text-[10px] text-gray-400 block font-bold border-b border-white/5 pb-1">QR DEEP ROUTE MODIFIERS</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400 tracking-wider">Target Link Address</label>
                      <input 
                        type="text" 
                        value={qrPayload}
                        onChange={(e) => setQrPayload(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#CCFF00] focus:outline-none" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-400 block pb-1">Vector Accent Color</label>
                        <select 
                          value={qrColor} 
                          onChange={(e) => setQrColor(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="#CCFF00">Lime Green</option>
                          <option value="#22d3ee">Cyan Sky</option>
                          <option value="#a855f7">Retro Purple</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-400 block pb-1">Worksheet Size</label>
                        <select 
                          value={qrSizeScale} 
                          onChange={(e) => setQrSizeScale(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value={150}>Mobile (150px)</option>
                          <option value={250}>Worksheet (250px)</option>
                          <option value={400}>Classroom Poster (400px)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* HIGH-FIDELITY LIVE VECTOR PREVIEW */}
                  <div className="bg-black/80 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center space-y-3 text-center">
                    <div className="bg-white p-2.5 rounded-xl flex items-center justify-center shadow-lg" style={{ width: 140, height: 140 }}>
                      {/* Dynamically draw matrix elements inside micro SVG for clean crisp vectors */}
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        {generateMockQrMatrix(qrPayload).map((row, rIdx, rowArr) => {
                          const size = rowArr.length;
                          const d = 120 / size;
                          return row.map((val, cIdx) => {
                            if (val) {
                              return (
                                <rect 
                                  key={`${rIdx}-${cIdx}`}
                                  x={cIdx * d} 
                                  y={rIdx * d} 
                                  width={d} 
                                  height={d} 
                                  fill={qrColor === "#CCFF00" ? "#000000" : qrColor} 
                                />
                              );
                            }
                            return null;
                          });
                        })}
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block font-sans">VEKTOR DISPATCH BLOCK</span>
                      <span className="text-[9px] text-gray-400 max-w-[200px] block truncate font-mono">{qrPayload}</span>
                    </div>

                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => {
                          setDownloadSuccess(true);
                          onAddNotification("Vector Transferred", "SVG parameters exported into local storage formats.", "success");
                          setTimeout(() => setDownloadSuccess(false), 2000);
                        }}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] border border-white/10 flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3 h-3" />
                        {downloadSuccess ? "COPIED" : "EXPORT"}
                      </button>
                      <button 
                        onClick={handlePrintQr}
                        className="flex-1 py-1.5 bg-[#CCFF00] hover:bg-cyan-400 text-black font-extrabold rounded-xl text-[9px] flex items-center justify-center gap-1.5 border-none cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        PRINT DECK
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "p2p" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 02
                  </span>
                  <h3 className="text-md font-black text-white">Peer-to-Peer (P2P) Local Link Sharing</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    bypass central cellular connections & cell jammers altogether! local study deck bundles are piped securely via simulated bluetooth low energy & local wifi p2p discovery streams.
                  </p>
                </div>

                <div className="bg-black/60 p-5 rounded-2xl border border-white/5 space-y-4 text-left">
                  <div className="flex justify-between items-center bg-black/40 px-4 py-3 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${p2pActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                      <span className="text-xs font-bold text-gray-300">LOCAL P2P RADIO TRANSMITTER STATE</span>
                    </div>
                    <button 
                      onClick={() => setP2pActive(!p2pActive)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-bold ${p2pActive ? "bg-red-500/20 text-red-400 border border-red-505/30" : "bg-green-500/20 text-green-400 border border-green-500/30"}`}
                    >
                      {p2pActive ? "SHUTDOWN" : "ACTIVATE"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] text-gray-500 font-bold block">PEERS DISCOVERED IN RANGE (SIMULATED Wi-Fi DIRECT / BLE)</span>
                    
                    {p2pActive ? (
                      <div className="space-y-2">
                        {simulatedPeers.map(peer => (
                          <div key={peer.username} className="bg-black/80 px-4 py-3 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="text-md">📱</span>
                              <div>
                                <h4 className="text-xs font-black text-white">{peer.username}</h4>
                                <span className="text-[9px] text-gray-500 font-sans">{peer.device}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 justify-between">
                              <div className="text-right">
                                <span className="text-[9px] text-cyan-400 font-bold block">{peer.dbm} DBM</span>
                                <span className="text-[8px] text-gray-400 font-mono">SIGNAL INDEX</span>
                              </div>

                              <button 
                                onClick={() => requestGatedPermissionShield(() => triggerOfflineP2PShare(peer.username))}
                                className="px-3 py-1.5 bg-[#CCFF00] hover:bg-cyan-400 text-black font-extrabold rounded-lg text-[10px] uppercase border-none cursor-pointer scale-100 hover:scale-[1.03] transition-all"
                              >
                                share notes
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 bg-black/40 rounded-xl text-center border border-white/5">
                        <p className="text-xs text-red-400">P2P radio link offline. Activate the beacon to detect nearby classmate study nodes!</p>
                      </div>
                    )}
                  </div>

                  {sharingToPeer && (
                    <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl space-y-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                        <span className="text-xs font-bold text-cyan-400">P2P PIPING IN PROGRESS...</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans max-w-sm mx-auto">
                        Transferring 1.48MB notes zip file pack to student <strong className="text-white">{sharingToPeer}</strong> over low energy bluetooth mesh cluster.
                      </p>
                      {p2pShareCompleted && (
                        <div className="text-green-400 text-[10px] font-bold pt-1">
                          ✓ TRANSMISSION DETECTED (+30 NEXA / +15 XP)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "ab" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 03
                  </span>
                  <h3 className="text-md font-black text-white">A/B Referral Incentives Split-Testing Suite</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    mathematically maximize edtech conversion coefficients. active variant algorithms distribute optimized reward incentives across user cohorts automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {/* COHORT SPLIT MATRIX CARDS */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-3">
                    <span className="text-[10px] text-[#CCFF00] block font-bold border-b border-white/5 pb-1 uppercase">A/B Testing Variants</span>
                    
                    <div className="space-y-2">
                      {(["A", "B", "C"] as const).map(varId => {
                        const target = segmentBonuses[varId];
                        return (
                          <div 
                            key={varId} 
                            onClick={() => setUserSegment(varId)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${userSegment === varId ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-black border-white/5 text-gray-400 hover:border-white/15'}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black">Cohort Variant [{varId}]</span>
                              <span className="text-[9px] font-sans font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                                {target.valueRate}
                              </span>
                            </div>
                            <h4 className="text-[11px] font-bold mt-1 text-white">{target.title}</h4>
                            <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{target.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* REALTIME ANALYTICS PERFORMANCE MOCKUP */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold border-b border-white/5 pb-1 uppercase">COHORT PERFORMANCE MATRIX</span>
                      
                      <div className="space-y-3 mt-4">
                        {(["A", "B", "C"] as const).map(vId => {
                          const clicks = simulatedClicks[vId];
                          const signups = simulatedSignups[vId];
                          const rate = ((signups / clicks) * 100).toFixed(1);
                          return (
                            <div key={vId} className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className={userSegment === vId ? "text-amber-400 font-bold" : "text-gray-400"}>Variant {vId} ({rate}%)</span>
                                <span className="text-gray-500">{signups} signups / {clicks} clicks</span>
                              </div>
                              <div className="w-full bg-black/80 rounded-full h-1.5 overflow-hidden border border-white/5 p-0.5">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${vId === "B" ? 'bg-green-400' : (vId === "A" ? 'bg-amber-400' : 'bg-red-400')}`}
                                  style={{ width: `${Math.min(100, (Number(rate) * 2.5))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <p className="text-[9px] text-gray-500 leading-normal font-sans">
                        Press below to trigger dynamic traffic distribution simulation and view variant conversions real-time.
                      </p>
                      <button 
                        onClick={() => registerSimulatedSegmentAction(userSegment)}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] rounded-xl border-none cursor-pointer uppercase font-mono tracking-wider transition-all"
                      >
                        ⚡ Simulate Click Segment [{userSegment}]
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bio" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-500 px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 04
                  </span>
                  <h3 className="text-md font-black text-white">Biometric-Gated Share Restrictions</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    shield sensitive study decks and personal homework assets from unauthorized exfiltration. mandates pin or FaceID validation layers.
                  </p>
                </div>

                <div className="bg-black/60 p-5 rounded-2xl border border-white/5 text-left space-y-4">
                  <div className="flex justify-between items-center bg-black/40 px-4 py-3 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${pinGatedEnabled ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
                      <span className="text-xs font-bold text-gray-300">SHIELD EXFILTRATION CONTROLS</span>
                    </div>
                    <button 
                      onClick={() => setPinGatedEnabled(!pinGatedEnabled)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-bold ${pinGatedEnabled ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 text-gray-400 border border-white/10"}`}
                    >
                      {pinGatedEnabled ? "SHIELD ENGAGED" : "SHIELD DEACTIVATED"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/80 rounded-xl border border-white/5 space-y-2.5">
                      <span className="text-[10px] text-gray-400 block font-bold">GATED PASSCODE SECTOR</span>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-500">Secure Backup PIN Key (4 Digits)</label>
                        <input 
                          type="text" 
                          maxLength={4}
                          value={customPin}
                          onChange={(e) => setCustomPin(e.target.value.replace(/\D/g,""))}
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-1.5 text-center font-black tracking-widest text-red-400 text-lg focus:outline-none" 
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 font-sans leading-relaxed">
                        If a classmate or parent attempts to click "Share notes bundle" while this safety module is active, the operation freezes and requests biometric authentication.
                      </p>
                    </div>

                    <div className="p-4 bg-black/80 rounded-xl border border-white/5 flex flex-col justify-between items-center text-center space-y-3">
                      <span className="text-[32px]">🕵️</span>
                      <div className="space-y-1">
                        <span className="text-[10px] text-white font-bold block">TEST EXFILTRATION TRIGGER</span>
                        <p className="text-[9px] text-gray-500 max-w-[170px] leading-tight mx-auto font-sans">
                          A simulated try at exporting classroom licenses.
                        </p>
                      </div>

                      <button 
                        onClick={() => {
                          requestGatedPermissionShield(() => {
                            alert("Access Authorized! Scribed notes successfully routed to secure email.");
                          });
                        }}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] rounded-xl border-none cursor-pointer uppercase font-mono tracking-wider transition-all"
                      >
                        🚨 TEST GATED SHARE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "clipboard" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 05
                  </span>
                  <h3 className="text-md font-black text-white">System Clipboard Auto-Detection</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    automatically scan clipboard data for study deep-links on dispatch load. skips manual address copy-paste vectors wholly!
                  </p>
                </div>

                <div className="bg-black/60 p-5 rounded-2xl border border-white/5 text-left space-y-4">
                  <div className="p-4 bg-black/80 rounded-xl border border-white/5 space-y-3">
                    <span className="text-[10px] text-gray-400 font-bold block">AUTO-SCAN PROCESS MONITOR</span>
                    
                    <button 
                      onClick={simulateStartupClipboardScanner}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold border-none cursor-pointer tracking-wider hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                      <Clipboard className="w-4 h-4" />
                      SIMULATE APP BOOTUP SYSTEM AUTO-SCAN
                    </button>
                  </div>

                  {clipboardLoading && (
                    <div className="py-6 text-center animate-pulse text-cyan-400">
                      Scanning Clipboard Wavelength Matrix...
                    </div>
                  )}

                  {clipboardStudyLink && (
                    <div className="p-4 bg-[#CCFF00]/5 border border-[#CCFF00]/30 rounded-xl space-y-3 animate-fade-in relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      
                      <div className="flex gap-2.5 items-start">
                        <span className="text-2xl">📋</span>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-white">NEXALearn URL Packet Detected</h4>
                          <span className="text-[9px] text-[#CCFF00] font-mono block break-all">{clipboardStudyLink}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <button 
                          onClick={() => setClipboardStudyLink(null)}
                          className="py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[9px] font-mono border border-white/10"
                        >
                          IGNORE TOAST
                        </button>
                        <button 
                          onClick={() => {
                            onAddNotification("Deck Loaded ✔", "AP Organic Chemistry successfully compiled.", "success");
                            setClipboardStudyLink(null);
                          }}
                          className="py-1.5 bg-[#CCFF00] text-black rounded-lg text-[9px] font-extrabold font-mono border-none"
                        >
                          LAUNCH STUDY DECK
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "b2b" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-sky-400/10 border border-sky-400/20 text-sky-400 px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 06
                  </span>
                  <h3 className="text-md font-black text-white">B2B Institutional Classroom Roster Compiler</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    consolidate groups of students under administrative district control. teachers generate deep links to auto-allocate licenses.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {/* DISTRICT & LICENSE CONFIGS */}
                  <form onSubmit={addNewStudentToRoster} className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-3.5">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase border-b border-white/5 pb-1">LICENSE METALS</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400">Allocated School District</label>
                      <input 
                        type="text" 
                        value={schoolDistrict}
                        onChange={(e) => setSchoolDistrict(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400">Licensing Tier Select</label>
                      <select 
                        value={licensingTier} 
                        onChange={(e) => setLicensingTier(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="SilverClass">Silver Class (Max 30 Students)</option>
                        <option value="GoldCampus">Gold Campus (Max 500 Students)</option>
                        <option value="DistrictEnterprise">District Unlimited Enterprise</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400">Enroll Student into Licence Database</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. Frank Sinatra"
                          value={newRosterMemberName}
                          onChange={(e) => setNewRosterMemberName(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" 
                        />
                        <button 
                          type="submit"
                          className="px-3 bg-[#CCFF00] text-black font-extrabold text-xs rounded-xl border-none cursor-pointer"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* ACTIVE ROSTER VIEWPORT */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Active Class Roster ({activeRoster.length})</span>
                        <span className="text-[9px] text-[#CCFF00] font-mono">{licensingTier === "SilverClass" ? "26 spots left" : "unlimited"}</span>
                      </div>

                      <div className="space-y-2 mt-3 max-h-[140px] overflow-y-auto">
                        {activeRoster.map(student => (
                          <div key={student.name} className="flex justify-between items-center bg-black/40 px-3 py-2 border border-white/5 rounded-xl text-xs">
                            <span className="text-white text-xs lowercase">{student.name}</span>
                            <div className="flex gap-2 text-[9px] font-mono font-bold text-gray-400">
                              <span>LVL {student.level}</span>
                              <span className="text-cyan-400">{student.currentXp} XP</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        onAddNotification("License Dispatched 📦", "B2B license invitation link copied into active clipboard sector.", "success");
                        alert(`Classroom DeepLink: https://nexalearn.ai/join-class?license=${licensingTier}&district=${encodeURIComponent(schoolDistrict)}`);
                      }}
                      className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-black font-black text-[10px] rounded-xl border-none cursor-pointer uppercase font-mono tracking-wider transition-all mt-3"
                    >
                      🔗 Dispatch Multiuser Invitation LINK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "parent" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-pink-500/10 border border-pink-500/20 text-pink-500 px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 07
                  </span>
                  <h3 className="text-md font-black text-white">Parental Approval Router (COPPA Gating)</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    protect children's privacy variables. underage student accounts trigger cryptographically signed webhooks requiring parent signature authorization.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {/* UNDERAGE COMPLIANCE CONFIGS */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-3.5">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase border-b border-white/5 pb-1">COPPA COMPLIANCE SCAN</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400">Student Birth Year</label>
                      <select 
                        value={studentBirthYear} 
                        onChange={(e) => setStudentBirthYear(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="2008">2008 (Age 18 - Major)</option>
                        <option value="2011">2011 (Age 15 - Teenager)</option>
                        <option value="2015">2015 (Age 11 - Gated COPPA Mode)</option>
                        <option value="2018">2018 (Age 8 - Gated COPPA Mode)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400">Guardian Contact Email Node</label>
                      <input 
                        type="email" 
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="parent@home.gov"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-purple-400 focus:outline-none" 
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={sendParentalApprovalWebhook}
                      className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-[10px] rounded-xl border-none cursor-pointer uppercase transition-all"
                    >
                      Discharge consent webhook
                    </button>
                  </div>

                  {/* APPROVAL HUB WEB-HOOK MOCK */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase border-b border-white/5 pb-1">GUARDIAN PORTAL CONSOLE</span>
                      
                      <div className="space-y-3 mt-3">
                        <div className="flex justify-between items-center bg-black/80 px-3 py-2 border border-white/5 rounded-xl">
                          <span className="text-xs">Consent Node Status:</span>
                          <span className={`text-[10px] font-bold uppercase ${parentApprovalStatus === "approved" ? "text-green-400" : (parentApprovalStatus === "pending" ? "text-yellow-400 animate-pulse" : "text-red-400")}`}>
                            {parentApprovalStatus}
                          </span>
                        </div>

                        {webhookToken && (
                          <div className="p-3 bg-indigo-950/20 border border-indigo-505/30 rounded-xl space-y-1 text-xs">
                            <span className="text-[9px] text-gray-500 font-mono block">ENCRYPTED WEBH0OK DISPATCH LOG</span>
                            <span className="font-mono text-[10px] text-cyan-400 block truncate">{`https://nexalearn.ai/coppa/auth?key=${webhookToken}&user=${profile.username}`}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {parentApprovalStatus === "pending" && (
                      <div className="pt-3 space-y-1">
                        <p className="text-[8px] text-gray-500 leading-normal font-sans">
                          A parental device clicked the encrypted signature code.
                        </p>
                        <button 
                          type="button"
                          onClick={simulateGuardianApproveHook}
                          className="w-full py-1.5 bg-green-500 text-black font-extrabold text-[10px] rounded-xl border-none cursor-pointer uppercase transition-all"
                        >
                          ✍️ Approve Signatures Consent Node
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "scraping" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-500 px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 08
                  </span>
                  <h3 className="text-md font-black text-white">Intelligent Harvesting Protection (Sharing Rate Limiting)</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    foils continuous web-scrapers and data bot assaults. dynamically monitors shared links generation velocity and freezes device-level traffic nodes on threat thresholds.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-4">
                    <span className="text-[10px] text-gray-400 block font-bold border-b border-white/5 pb-1">RATE VELOCITY MONITOR</span>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Generated Last 10 seconds:</span>
                      <span className={`text-sm font-black ${rateLimitState === "throttled" ? "text-red-500 font-extrabold" : (rateLimitState === "warn" ? "text-yellow-400" : "text-green-400")}`}>
                        {sharingTrafficHits} / 40
                      </span>
                    </div>

                    <div className="w-full bg-black rounded-full h-3 border border-white/10 p-0.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${rateLimitState === "throttled" ? 'bg-red-500' : (rateLimitState === "warn" ? 'bg-yellow-400' : 'bg-green-400')}`}
                        style={{ width: `${Math.min(100, (sharingTrafficHits / 40) * 100)}%` }}
                      />
                    </div>

                    <p className="text-[9px] text-gray-500 font-sans leading-relaxed">
                      If link requests exceed the 40 requests/min buffer standard, the system temporarily bans the requester's client for safety.
                    </p>

                    <button 
                      type="button"
                      onClick={triggerLinkGenerationActivity}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-extrabold rounded-xl border-none cursor-pointer uppercase transition-all"
                    >
                      🛡️ Execute Rapid link request clicks
                    </button>
                  </div>

                  {/* LOG CAPTURES AND BLOCK DETECTS */}
                  <div className="bg-black/80 p-4 rounded-2xl border border-red-500/10 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-red-400 font-bold block pb-1 border-b border-white/5 uppercase">Foiled Harvesting Threats Logs</span>
                      
                      <div className="space-y-2 mt-3 text-[10px] font-mono">
                        {scrapersFoilRecords.length > 0 ? (
                          scrapersFoilRecords.map((log, index) => (
                            <div key={index} className="p-2 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-[10px]">
                              🚨 {log}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No active crawler spikes detected. System status: SECURE.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[9px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 block text-center font-black">
                        DEVICE COOKIE COMPLIANCE NODES
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ttl" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 09
                  </span>
                  <h3 className="text-md font-black text-white">Automated Temp-Link Expiry & Self-Healing Engines</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    set absolute time-to-live bounds on shared study nodes. if an expired link is clicked, self-healing code routes them instantly to public networks.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-4">
                    <span className="text-[10px] text-gray-400 block font-bold border-b border-white/5 pb-1">EXPIRE TIME-TO-LIVE LIMITERS</span>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Lobby Link TTL Span:</span>
                        <span className="text-[#CCFF00] font-bold">{tempLinkMinutesTtl} min</span>
                      </div>
                      <input 
                        type="range" 
                        min={1} 
                        max={60} 
                        value={tempLinkMinutesTtl}
                        onChange={(e) => setTempLinkMinutesTtl(Number(e.target.value))}
                        className="w-full accent-[#CCFF00]" 
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        const newId = `ttl_rand_${Date.now().toString().slice(-4)}`;
                        setActiveTempLinks(p => [
                          { id: newId, path: `nexalearn://room/quick_study_${newId}`, minutesLeft: tempLinkMinutesTtl, fallback: "nexalearn://room/standard_academic_commons", healed: false },
                          ...p
                        ]);
                        onAddNotification("Temporary Link Generated", `Dispatched invitation with strict ${tempLinkMinutesTtl} min timeout parameters.`, "success");
                      }}
                      className="w-full py-2 bg-[#CCFF00] hover:bg-cyan-400 text-black font-extrabold text-[10px] rounded-xl border-none cursor-pointer uppercase transition-all tracking-wider"
                    >
                      🚀 SPIT FRESH TEMPORARY INVITE LINK
                    </button>
                  </div>

                  {/* ACTIVE LINKS VIEWPORT */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-3">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase pb-1 border-b border-white/5">DISPATCHED LINKS COUPLINGS ({activeTempLinks.length})</span>
                    
                    <div className="space-y-2 max-h-[170px] overflow-y-auto">
                      {activeTempLinks.map((lnk) => (
                        <div key={lnk.id} className="p-3 bg-black rounded-xl border border-white/5 text-xs text-left space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold font-mono text-white text-[10px] truncate max-w-[130px]">{lnk.path}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-black ${lnk.minutesLeft === 0 ? "bg-red-500/20 text-red-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                              {lnk.minutesLeft === 0 ? "EXPIRED" : `${lnk.minutesLeft}m left`}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[9px] text-gray-500 uppercase pt-1 border-t border-white/5">
                            <span>{lnk.healed ? "✓ REDIRECTED / HEALED" : `FALLBACK: ${lnk.fallback.split("/").pop()}`}</span>
                            <button 
                              onClick={() => handleTriggerTempLink(lnk.id)}
                              className="px-2.5 py-0.5 bg-white/5 hover:bg-white/10 text-white rounded cursor-pointer border border-white/10"
                            >
                              {lnk.minutesLeft === 0 ? "HEAL LINK" : "JOIN"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "lang" && (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2.5 py-0.5 rounded-full font-bold">
                    FUNCTIONALITY 10
                  </span>
                  <h3 className="text-md font-black text-white">Multi-Language Review App Store Routing Eng</h3>
                  <p className="text-xs font-sans text-gray-400 leading-normal lowercase">
                    boost academic application store reviews dynamically. detects prefers regional browser languages and routes reviewing paths into matching native storefront locales.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5 space-y-4">
                    <span className="text-[10px] text-gray-400 block font-bold border-b border-white/5 pb-1">APPSTORE REGIONAL DEEP LINK ROUTER</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400">Student Preferred Academic Tongue</label>
                      <select 
                        value={academicLang} 
                        onChange={(e) => setAcademicLang(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="en-US">English (United States) [en-US]</option>
                        <option value="es-MX">Español (México) [es-MX]</option>
                        <option value="fr-FR">Français (France) [fr-FR]</option>
                        <option value="zh-CN">简体中文 (中国) [zh-CN]</option>
                        <option value="hi-IN">हिन्दी (भारत印度) [hi-IN]</option>
                      </select>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 select-all font-mono text-[10px] text-emerald-400 break-all">
                      <span className="text-[8px] text-gray-500 block">GENERATED REGIONAL DEEP LINK PATH:</span>
                      {`${fallbackStoreLinks[academicLang]?.storeUrl}?action=write-review&hl=${academicLang}&country=${fallbackStoreLinks[academicLang]?.countryCode}`}
                    </div>
                  </div>

                  {/* DEEP LINK LAUNCHER SIM FRAME */}
                  <div className="bg-black/80 p-5 rounded-2xl border border-white/5 flex flex-col justify-between items-center text-center space-y-4">
                    <span className="text-3xl text-emerald-400 animate-bounce">🌍</span>
                    
                    <div className="space-y-1">
                      <span className="text-xs font-black text-white">LOCALIZED STOREFRONT MOCK PREVIEW</span>
                      <p className="text-[10px] text-emerald-400 font-sans leading-relaxed">
                        "{fallbackStoreLinks[academicLang]?.localizedPrompt}"
                      </p>
                    </div>

                    <button 
                      onClick={handleLaunchLocalizedAppstoreReview}
                      className="w-full py-2 bg-emerald-500 hover:bg-[#CCFF00] hover:text-black text-black font-black text-[10px] rounded-xl border-none cursor-pointer uppercase transition-all"
                    >
                      ⭐⭐⭐⭐⭐ Rate academic store reviews now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SHARED DYNAMIC LAB FOOTER CONTROLS */}
          <div className="border-t border-white/10 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 select-none">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
              <span>ACTIVE USER LEVEL:</span>
              <span className="text-[#CCFF00] font-bold">LVL {Math.floor((profile.xp || 100) / 300) + 1}</span>
              <span className="text-gray-500">•</span>
              <span>WALLET BALANCE:</span>
              <span className="text-[#CCFF00] font-bold">{profile.coins || 0} NEXA</span>
            </div>

            <div className="flex gap-2">
              <span className="text-[9px] text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-md border border-[#CCFF00]/20 font-black">
                MODERATED WITH AUDITED CYBER SECURITY METRICS
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* SECURE PIN / BIOMETRIC PROMPT GATE MODAL OVERLAY */}
      {isPinModalPrompting && (
        <div className="fixed inset-0 bg-[#000000]/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0a0a0d] border border-red-500/30 p-6 rounded-[28px] text-center shadow-[0_8px_32px_rgba(239,68,68,0.2)] space-y-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-1 select-none">
              <span className="text-[10px] font-bold text-red-400 uppercase font-mono">
                🔒 Security Auth Wavelength Gate
              </span>
              <button 
                onClick={() => setIsPinModalPrompting(false)} 
                className="text-xs text-gray-400 border-none bg-transparent hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-3xl block">🛡️</span>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                EXFILTRATION PROTECTION ACTIVE
              </h4>
              <p className="text-[9px] text-gray-400 leading-relaxed font-sans">
                This academic node contains sensitive institutional properties or protected curriculum logs. Auth checks required.
              </p>
            </div>

            {/* PIN GATOR */}
            <div className="space-y-2">
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((pos) => (
                  <div 
                    key={pos} 
                    className={`w-10 h-10 border-2 rounded-xl flex items-center justify-center text-lg font-black font-mono transition-all ${enteredPin.length > pos ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/15'}`}
                  >
                    {enteredPin.length > pos ? "•" : ""}
                  </div>
                ))}
              </div>

              {/* Pin Pad Keys */}
              <div className="grid grid-cols-3 gap-2 max-w-[210px] mx-auto pt-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "Clear", "0", "OK"].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === "Clear") {
                        setEnteredPin("");
                      } else if (key === "OK") {
                        handleAuthPinAttempt();
                      } else {
                        if (enteredPin.length < 4) {
                          setEnteredPin(p => p + key);
                        }
                      }
                    }}
                    className="py-2.5 bg-white/5 hover:bg-white/10 active:bg-[#CCFF00]/20 text-white active:text-black border border-white/10 rounded-lg text-xs font-bold cursor-pointer font-mono"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 space-y-2 select-none">
              <span className="text-[9px] text-gray-500 uppercase block font-mono">─── OR TOUCH ID FINGERPRINT ───</span>
              <button
                type="button"
                onClick={handleSimulateBiometricTouchId}
                disabled={biometricValidating}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-indigo-600 text-white hover:opacity-90 rounded-xl text-[10px] font-bold border-none cursor-pointer flex items-center justify-center gap-2"
              >
                {biometricValidating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    AUTENTICATING IMMUNOLOGY SECTOR...
                  </>
                ) : (
                  <>
                    <span>🔴</span> Simulate TouchID Biometrics
                  </>
                )}
              </button>
            </div>

            <div className="text-[9px] text-yellow-500/60 font-sans leading-none pt-1">
              Hint: Default secure PIN is <strong className="text-yellow-400 font-bold">4872</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
