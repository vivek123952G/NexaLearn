import React, { useEffect, useState, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from "@capacitor-community/admob";
import { Shield, Sparkles, ExternalLink, RefreshCw } from "lucide-react";

interface AdBannerProps {
  placement: "home_top" | "home_bottom" | "leaderboard_bottom" | "reels_interstitial";
  className?: string;
  premiumActive?: boolean;
}

const TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";
const REAL_BANNER_ID = "ca-app-pub-2996487725106736/8251906012"; // Live Registered AdMob ID

export const AdBanner: React.FC<AdBannerProps> = ({ placement, className = "", premiumActive = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [simulatedLoad, setSimulatedLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    setIsOnline(navigator.onLine);

    const checkOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", checkOnline);
    window.addEventListener("offline", checkOnline);

    // Simulate short network delay for browser demo aesthetics
    const timer = setTimeout(() => {
      setSimulatedLoad(true);
    }, 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", checkOnline);
      window.removeEventListener("offline", checkOnline);
    };
  }, []);

  // Native AdMob Banner Handler
  useEffect(() => {
    if (premiumActive) {
      // Premium members see absolutely no ads
      return;
    }

    if (!isNative || !isOnline) return;

    let bannerShowing = false;

    const loadNativeBanner = async () => {
      try {
        const isTestMode = !isNative; // Real ads on native platform container, test ads on simulated browser environments
        const adId = isTestMode ? TEST_BANNER_ID : REAL_BANNER_ID;

        console.log(`📡 Influxing Native AdMob Banner Unit [ID: ${adId}] for [${placement}]`);

        // Register action listeners
        const adLoadedListener = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
          setIsLoaded(true);
          bannerShowing = true;
          console.log("✅ Native Banner Ad Mounted successfully.");
        });

        const adFailedListener = await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (info: any) => {
          console.warn("⚠️ Native Banner failed to load:", info);
          setIsLoaded(false);
        });

        // Show banner overlay anchored at bottom or top of screen based on container
        await AdMob.showBanner({
          adId: adId,
          adSize: BannerAdSize.BANNER,
          position: placement.includes("top") ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: isTestMode
        });

        return () => {
          adLoadedListener.remove();
          adFailedListener.remove();
          if (bannerShowing) {
            AdMob.removeBanner().catch(err => console.warn("Failed to tear down banner node:", err));
          }
        };
      } catch (err) {
        console.warn("Unable to trigger Native AdMob banner. Standard fallback initialized.", err);
      }
    };

    const cleanupPromise = loadNativeBanner();

    return () => {
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === "function") cleanup();
      });
    };
  }, [isNative, isOnline, placement, premiumActive]);

  // If premium tier is active, suppress visual element completely
  if (premiumActive) {
    return (
      <div className="text-[10px] text-yellow-400 font-mono font-bold bg-[#CCFF00]/5 border border-[#CCFF00]/10 p-2.5 rounded-xl flex items-center justify-center gap-1.5 uppercase">
        <Sparkles className="w-3.5 h-3.5" /> VIP Sponsor Ad Shield Engaged (Zero Ads Active)
      </div>
    );
  }

  // 1. OFFLINE VIEW
  if (!isOnline) {
    return (
      <div className={`p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-center space-y-1 ${className}`}>
        <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black">Offline Ad Network Node</p>
        <p className="text-[9px] text-gray-500">Enable wifi/mobile data parameters to sync live Google Sponsors.</p>
      </div>
    );
  }

  // 2. BROWSER SANDBOX VIEW
  if (!isNative) {
    return (
      <div 
        ref={containerRef}
        className={`p-4.5 rounded-[22px] bg-black/40 border border-white/5 relative overflow-hidden text-left shadow-lg ${className}`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/2 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10 font-mono">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[8px] bg-[#CCFF00]/10 text-[#CCFF00] font-black tracking-wider px-2 py-0.5 rounded-md border border-[#CCFF00]/25 uppercase w-fit">
              <Shield className="w-2.5 h-2.5 animate-pulse" /> Google AdMob Banner
            </div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-tight pt-1">
              {simulatedLoad ? "📢 NexaSnap Global Sponsor Node" : "📡 Preloading Sponsor Feed..."}
            </h4>
            <p className="text-[9px] text-gray-400 leading-normal max-w-lg font-sans">
              {simulatedLoad 
                ? "This slot renders a 320x50 AdMob banner inside the native Android build container."
                : "Synchronizing crypto credentials, Ad ID metrics, and geographic placement vectors..."}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <span className="text-[8px] text-gray-500 uppercase">
              {placement.replace("_", " ")}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>
      </div>
    );
  }

  // 3. NATIVE CONTAINER PLACEHOLDER
  return (
    <div className={`p-1.5 rounded-lg border border-dashed border-gray-800 text-center text-[8px] font-mono text-gray-600 uppercase ${className}`}>
      <span>Native Google AdMob Banner Space (Mapped via Layout Overlay)</span>
    </div>
  );
};

export default AdBanner;
