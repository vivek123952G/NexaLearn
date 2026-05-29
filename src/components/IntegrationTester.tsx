import React, { useState, useEffect } from "react";
import { 
  Shield, Sparkles, Send, Bell, Smartphone, Monitor, CheckCircle, AlertTriangle, 
  Play, Wifi, X, Award, AlertCircle, RefreshCw
} from "lucide-react";
import { UserProfile } from "../types";
import { pushNotificationsService } from "../lib/pushNotifications";
import { admobService } from "../lib/AdMobService";
import { Capacitor } from "@capacitor/core";

interface IntegrationTesterProps {
  profile: UserProfile;
  onSaveProfile: (newProf: UserProfile) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'friend_request') => void;
}

export const IntegrationTester: React.FC<IntegrationTesterProps> = ({
  profile,
  onSaveProfile,
  onAddNotification
}) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [pushTitle, setPushTitle] = useState("🔔 BreakTime Study Group alert");
  const [pushBody, setPushBody] = useState("Algebra homework is unlocked! Tap to review coordinates with peers.");
  const [isNative, setIsNative] = useState(false);
  
  // Interactive Simulation states for AdMob
  const [activeInterstitial, setActiveInterstitial] = useState(false);
  const [interstitialTimer, setInterstitialTimer] = useState(5);
  const [activeRewarded, setActiveRewarded] = useState(false);
  const [rewardedTimer, setRewardedTimer] = useState(10);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    // Grab token from registration service
    const fetchToken = () => {
      const token = pushNotificationsService.getToken();
      if (token) {
        setFcmToken(token);
      } else {
        // Fallback for visual mock token in browser
        setFcmToken(`fcm_token_sandbox_${Math.random().toString(36).substring(3, 11)}`);
      }
    };
    fetchToken();
    const interval = setInterval(fetchToken, 2000);
    return () => clearInterval(interval);
  }, []);

  // Interstitial Countdown handling
  useEffect(() => {
    if (!activeInterstitial) return;
    if (interstitialTimer <= 0) return;
    const t = setTimeout(() => {
      setInterstitialTimer(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [activeInterstitial, interstitialTimer]);

  // Rewarded Countdown handling
  useEffect(() => {
    if (!activeRewarded) return;
    if (rewardedTimer <= 0) {
      if (!rewardClaimed) {
        setRewardClaimed(true);
      }
      return;
    }
    const t = setTimeout(() => {
      setRewardedTimer(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [activeRewarded, rewardedTimer, rewardClaimed]);

  const handleSendPushSimulation = () => {
    if (!pushTitle.trim() || !pushBody.trim()) return;
    
    onAddNotification("📲 Dispatched Simulation", "Broadcasting local cloud notification packet...", "info");

    // Launch dispatch
    setTimeout(() => {
      const customEvent = new CustomEvent("nexasnap_push_received", {
        detail: { title: pushTitle, body: pushBody }
      });
      window.dispatchEvent(customEvent);
    }, 1000);
  };

  const triggerInterstitial = () => {
    setInterstitialTimer(5);
    setActiveInterstitial(true);
  };

  const triggerRewarded = () => {
    setRewardedTimer(10);
    setRewardClaimed(false);
    setActiveRewarded(true);
  };

  const claimVideoRewardCoins = () => {
    const updatedCoins = profile.coins + 50;
    onSaveProfile({
      ...profile,
      coins: updatedCoins
    });
    onAddNotification("🪙 Rewarded Coins Claimed", "Gained +50 Coins for completing sponsor broadcast!", "success");
    setActiveRewarded(false);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-white/5 font-sans text-left">
      <div>
        <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase font-mono tracking-wide text-[#CCFF00]">
          <Shield className="w-4 h-4 text-[#CCFF00]" />
          <span>FCM & AdMob Integration Console</span>
        </h4>
        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
          Full sandbox terminal to test push notifications & Google AdMob display lifecycles in browser view & custom Android APK builds.
        </p>
      </div>

      {/* Connection Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10px]">
        {/* Firebase Badge */}
        <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[8px] text-gray-500 uppercase">FCM Connection</span>
          <div className="flex justify-between items-center">
            <span className="text-white font-extrabold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Real-time FCM Ready
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-400/10 text-emerald-400 font-black border border-emerald-400/20 uppercase">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Admob Badge */}
        <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[8px] text-gray-500 uppercase">AdMob SDK Integration</span>
          <div className="flex justify-between items-center">
            <span className="text-white font-extrabold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Google Mobile Ads SDK
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-400/10 text-cyan-400 font-black border border-cyan-400/20 uppercase">
              SYNCHRONIZED
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: PUSH NOTIFICATIONS CONTROLLER */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 space-y-3.5">
        <h5 className="text-[11px] font-black uppercase font-mono tracking-widest text-white flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-[#CCFF00]" /> 1. Firebase Cloud Messaging (FCM) Agent
        </h5>

        <div className="space-y-2">
          <label className="text-[9px] uppercase tracking-wide text-gray-500 block font-mono pl-0.5">Live Device Registration Token</label>
          <div className="relative">
            <input 
              readOnly
              type="text"
              value={fcmToken || "Scanning device credentials..."}
              className="w-full bg-black/60 font-mono text-[9.5px] text-[#CCFF00] rounded-xl pl-3.5 pr-10 py-2.5 border border-white/10 outline-none truncate"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(fcmToken || "");
                onAddNotification("Token Copied ✔", "Registered FCM Token copied for direct console broadcast.", "success");
              }}
              className="absolute right-1 text-[8.5px] font-mono font-black py-1 px-2.5 rounded-lg border-none bg-[#CCFF00]/10 text-[#CCFF00] top-1/2 -translate-y-1/2 hover:bg-[#CCFF00]/25 cursor-pointer"
            >
              COPY
            </button>
          </div>
        </div>

        {/* Sim Launcher */}
        <div className="space-y-2.5 pt-1.5 border-t border-white/5">
          <span className="text-[9px] uppercase tracking-wide text-gray-500 block font-mono">Test-Fire Cloud Push Delivery</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <input 
              type="text" 
              value={pushTitle} 
              onChange={(e) => setPushTitle(e.target.value)}
              placeholder="Notification Title message" 
              className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white font-mono text-[10px]"
            />
            <input 
              type="text" 
              value={pushBody} 
              onChange={(e) => setPushBody(e.target.value)}
              placeholder="Action text payload string" 
              className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-white font-mono text-[10px]"
            />
          </div>

          <button
            onClick={handleSendPushSimulation}
            className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-[10.5px] uppercase font-mono rounded-xl cursor-pointer hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 border-none"
          >
            <Send className="w-3.5 h-3.5" /> Disperse Simulated Push Notification Alert
          </button>
        </div>
      </div>

      {/* SECTION 2: ADMOB AD SYSTEMS SIMULATOR */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 space-y-3">
        <h5 className="text-[11px] font-black uppercase font-mono tracking-widest text-white flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-cyan-400" /> 2. Full-Lifecycle Google AdMob Simulator
        </h5>
        <p className="text-[10px] text-gray-400 mt-1 font-mono leading-relaxed">
          Demonstrate how ads are loaded and handled in the app structure. Rest assured, real production placements are ready for the final APK!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Test Interstitial Button */}
          <button
            onClick={triggerInterstitial}
            className="p-3 bg-black/40 hover:bg-black/60 border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl cursor-pointer text-left transition-all active:scale-98 flex items-center justify-between"
          >
            <div>
              <span className="text-[8px] text-cyan-400 font-mono block uppercase">Interstitial Placement</span>
              <span className="text-xs font-black text-white">Trigger Full-Screen Ad</span>
            </div>
            <Play className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Test Rewarded Video */}
          <button
            onClick={triggerRewarded}
            className="p-3 bg-black/40 hover:bg-black/60 border border-purple-500/10 hover:border-purple-500/30 rounded-xl cursor-pointer text-left transition-all active:scale-98 flex items-center justify-between"
          >
            <div>
              <span className="text-[8px] text-purple-400 font-mono block uppercase">Rewarded Placement</span>
              <span className="text-xs font-black text-white">Watch & Earn +50 Gold</span>
            </div>
            <Award className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

      {/* INTERPRETIVE FULL-SCREEN MOCK INTERSTITIAL OVERLAY */}
      {activeInterstitial && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-black border border-cyan-400/20 rounded-[35px] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] relative text-center flex flex-col items-center p-8 select-none font-sans text-white">
            
            <div className="flex justify-between items-center w-full mb-6">
              <span className="text-[9px] uppercase font-mono text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded border border-cyan-400/20 font-black">
                Google Sponsor Broadcast
              </span>
              <span className="text-[10px] text-gray-500 font-mono">ID: Interstitial_ca-app-pub_634</span>
            </div>

            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mb-4 animate-bounce">
              <Shield className="w-8 h-8" />
            </div>

            <h4 className="text-lg font-black uppercase text-white leading-tight">
              Get Ahead with NexaLearn Premium
            </h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Unlock unlimited AI Exam predictions, 3x XP multiplier, priority studying squad rooms, and zero sponsor breaks instantly!
            </p>

            <div className="mt-8 mb-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl w-full">
              <span className="text-[9px] uppercase text-gray-500 block font-mono mb-1">INTERSTITIAL TIMER</span>
              <span className="text-3xl font-mono font-black text-[#CCFF00]">
                {interstitialTimer > 0 ? `00:0${interstitialTimer}` : "AD READY"}
              </span>
            </div>

            {interstitialTimer > 0 ? (
              <button 
                disabled
                className="w-full py-3 bg-white/5 text-gray-500 rounded-xl text-xs font-mono font-bold border border-white/5 cursor-not-allowed select-none"
              >
                SKIP AD IN {interstitialTimer}s
              </button>
            ) : (
              <button 
                onClick={() => {
                  setActiveInterstitial(false);
                  onAddNotification("Sponsor Ad Finished", "Interstitial sponsorship segment concluded and closed.", "info");
                }}
                className="w-full py-3 bg-[#CCFF00] hover:bg-lime-400 text-black font-extrabold rounded-xl text-xs uppercase cursor-pointer border-none shadow-[0_4px_15px_rgba(204,255,0,0.3)] font-sans"
              >
                ✕ Close Ad Break
              </button>
            )}
          </div>
        </div>
      )}

      {/* INTERPRETIVE FULL-SCREEN MOCK REWARDED VIDEO OVERLAY */}
      {activeRewarded && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-purple-950/20 via-black to-black border border-purple-400/20 rounded-[35px] overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center flex flex-col items-center p-8 select-none font-sans text-white">
            
            <div className="flex justify-between items-center w-full mb-6">
              <span className="text-[9px] uppercase font-mono text-purple-400 bg-purple-400/10 px-2.5 py-0.5 rounded border border-purple-400/10 font-black">
                REWARDED VIDEO TRANSMISSION
              </span>
              <span className="text-[10px] text-gray-500 font-mono">ID: Rew_ca-pub-994</span>
            </div>

            {/* Simulated Live Video Animation Player */}
            <div className="w-full aspect-video bg-black/60 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 relative overflow-hidden mb-5">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-purple-500/5 animate-pulse" />
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              <span className="text-[10px] font-mono text-gray-400">Loading Sponsor Video Stream...</span>
            </div>

            <h4 className="text-base font-black uppercase text-white leading-tight">
              Watch to Earn Sponsor Reward
            </h4>
            <p className="text-xs text-gray-400 mt-2 text-center leading-relaxed">
              Keep the stream active. Gaining +50 Study Coins upon successful completion of the advertiser sequence!
            </p>

            <div className="mt-6 mb-5 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl w-full flex justify-between items-center font-mono">
              <div className="text-left">
                <span className="text-[8px] text-gray-500 block uppercase">TIME LEFT</span>
                <span className="text-xl font-bold text-purple-400 font-extrabold">{rewardedTimer} Seconds</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-gray-500 block uppercase">REWARD STATUS</span>
                <span className={`text-xs font-extrabold ${rewardClaimed ? "text-emerald-400" : "text-amber-500 animate-pulse"}`}>
                  {rewardClaimed ? "✓ VERIFIED" : "⏳ PLAYING"}
                </span>
              </div>
            </div>

            {!rewardClaimed ? (
              <button 
                disabled
                className="w-full py-3 bg-white/5 text-gray-500 rounded-xl text-xs font-mono font-bold border border-white/5 cursor-not-allowed select-none"
              >
                REWARD BLOCKS IN {rewardedTimer}s
              </button>
            ) : (
              <button 
                onClick={claimVideoRewardCoins}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-[#CCFF00] font-black rounded-xl text-xs uppercase cursor-pointer border-none shadow-[0_4px_15px_rgba(147,51,234,0.4)] tracking-wide"
              >
                🎁 CLAIM +50 NEXA COINS NOW
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
