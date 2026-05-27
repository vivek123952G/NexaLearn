import { Capacitor } from "@capacitor/core";
import { 
  AdMob, 
  RewardAdOptions, 
  RewardAdPluginEvents, 
  AdMobRewardItem,
  AdOptions,
  InterstitialAdPluginEvents
} from "@capacitor-community/admob";

// Real production-ready Google AdMob identifiers
export const ADMOB_CONFIG = {
  APP_ID: "ca-app-pub-2996487725106736~5645483039",
  // Google test IDs as requested for FIRST TEST (replace with your real IDs shown below when ads work)
  REWARDED_INTERSTITIAL_ID: "ca-app-pub-3940256099942544/5224354917", // Real: ca-app-pub-2996487725106736/3879142624
  NATIVE_AD_ID: "ca-app-pub-2996487725106736/2904587862",
  INTERSTITIAL_ID: "ca-app-pub-3940256099942544/1033173712" // Real: ca-app-pub-2996487725106736/8251906012
};

// Log entry interface for audit and debugging
export interface AdLogEntry {
  id: string;
  timestamp: string;
  event: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "COOLDOWN" | "INFO";
  details: string;
}

class AdMobService {
  private isInitialized = false;
  private isRewardAdPreloaded = false;
  private isInterstitialPreloaded = false;
  private logs: AdLogEntry[] = [];
  
  // Cooldown timers
  private lastInterstitialTimeKey = "nexa_admob_last_interstitial_time";
  private lastAppOpenTimeKey = "nexa_admob_last_appopen_time";
  private logsStorageKey = "nexa_admob_audit_logs";
  private rewardHistoryKey = "nexa_admob_reward_history";

  constructor() {
    this.loadLogs();
  }

  private logEvent(event: string, status: "SUCCESS" | "FAILED" | "PENDING" | "COOLDOWN" | "INFO", details: string) {
    const entry: AdLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      event,
      status,
      details
    };
    this.logs.unshift(entry);
    this.logs = this.logs.slice(0, 100); // Maintain last 100 logs
    this.saveLogs();
    console.log(`[AdMobService] [${status}] ${event}: ${details}`);
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.logsStorageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (_) {}
  }

  private saveLogs() {
    try {
      localStorage.setItem(this.logsStorageKey, JSON.stringify(this.logs));
    } catch (_) {}
  }

  public getLogs(): AdLogEntry[] {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
    this.saveLogs();
    this.logEvent("Logs cleared", "INFO", "AdMob Audit log stack reset.");
  }

  // -----------------------------------------------------
  // SDK INITIALIZATION
  // -----------------------------------------------------
  public async initialize(): Promise<boolean> {
    const isNative = Capacitor.isNativePlatform();
    console.log(`Native platform detected: ${isNative}`);
    this.logEvent("Native platform detected", isNative ? "SUCCESS" : "INFO", `isNativePlatform: ${isNative}`);

    if (this.isInitialized) return true;

    if (isNative === false) {
      console.log("AdMob initialized: Web Sandbox Bypassed");
      this.logEvent(
        "AdMob initialized", 
        "INFO", 
        "Web Sandbox detected. Real Google AdMob ads work only inside native Android APK builds."
      );
      this.isInitialized = true;
      return true;
    }

    try {
      console.log("AdMob initialized: Starting...");
      this.logEvent("AdMob SDK initializing", "PENDING", `Targeting App ID: ${ADMOB_CONFIG.APP_ID}`);
      await AdMob.initialize({
        initializeForTesting: false,
      });
      this.isInitialized = true;
      console.log("AdMob initialized: SUCCESS");
      this.logEvent("AdMob initialized", "SUCCESS", "Capacitor AdMob integrated successfully.");
      
      // Auto-trigger preload pipelines for next display
      this.preloadRewardedAd();
      this.preloadInterstitialAd();
      return true;
    } catch (err: any) {
      console.error("AdMob initialized: FAILED", err);
      this.logEvent("AdMob Initialization Failed", "FAILED", err?.message || String(err));
      return false;
    }
  }

  // -----------------------------------------------------
  // REWARDED ADS PIPELINE
  // -----------------------------------------------------
  public async preloadRewardedAd(): Promise<boolean> {
    if (Capacitor.isNativePlatform() === false) return false;
    
    try {
      console.log("Reward ad loading");
      this.logEvent("Reward ad loading", "PENDING", "Requesting reward ad token from Google AdMob servers...");
      const options: RewardAdOptions = {
        adId: ADMOB_CONFIG.REWARDED_INTERSTITIAL_ID,
        isTesting: ADMOB_CONFIG.REWARDED_INTERSTITIAL_ID.includes("599942544")
      };
      await AdMob.prepareRewardVideoAd(options);
      this.isRewardAdPreloaded = true;
      console.log("Reward ad loaded");
      this.logEvent("Reward ad loaded", "SUCCESS", `Rewarded Interstitial ad cache ready. ID: ${ADMOB_CONFIG.REWARDED_INTERSTITIAL_ID}`);
      return true;
    } catch (err: any) {
      this.isRewardAdPreloaded = false;
      console.error("Reward ad failed to load:", err);
      this.logEvent("Reward Ad Failed to Load", "FAILED", err?.message || String(err));
      return false;
    }
  }

  public async showRewardedAd(onRewardGranted: (amount: number) => void, onDismiss?: () => void): Promise<boolean> {
    if (!navigator.onLine) {
      this.logEvent("Reward Load Rejected", "FAILED", "Device network offline.");
      throw new Error("No network connectivity. Connect to the internet to load real rewards.");
    }

    if (Capacitor.isNativePlatform() === false) {
      this.logEvent("Web Browser Blocked", "INFO", "Web view fallback requested. AdMob cannot render interactive full-screen ads inside standard browser tabs.");
      return false;
    }

    await this.initialize();

    if (!this.isRewardAdPreloaded) {
      console.log("Reward ad loading");
      this.logEvent("Reward ad loading", "INFO", "Preloaded ad token missing. Forcing programmatic queue synchronization...");
      const preloaded = await this.preloadRewardedAd();
      if (!preloaded) {
        throw new Error("AdMob server was unable to fulfill rewarded ad request. Please try again in 30 seconds.");
      }
    }

    try {
      let earnedReward = false;
      let rewardItem: AdMobRewardItem | null = null;

      // Add actual reward receipt listener
      const rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        (reward: AdMobRewardItem) => {
          earnedReward = true;
          rewardItem = reward;
          console.log("Reward granted successfully:", reward);
          this.logEvent("Reward Granted", "SUCCESS", `Verified: +${reward.amount} ${reward.type}`);
        }
      );

      // Add dismissal listener to handle preloads and callbacks
      const dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          console.log("Reward ad dismissed");
          this.logEvent("Reward Ad Dismissed", "INFO", "Full-screen ad presentation completed.");
          // Clean listener references safely
          rewardListener.remove();
          dismissListener.remove();
          
          this.isRewardAdPreloaded = false;
          // Auto pre-load subsequent ads for zero-wait performance on next request
          this.preloadRewardedAd();

          if (earnedReward && rewardItem) {
            onRewardGranted(rewardItem.amount || 10);
          } else {
            this.logEvent("Reward Rejected", "FAILED", "Ad session was terminated by player prior to reward callback trigger.");
          }

          if (onDismiss) onDismiss();
        }
      );

      // Invoke Ad view with Google native frames
      console.log("Reward ad shown");
      this.logEvent("Reward ad shown", "PENDING", "Presenting full-screen Android Google AdMob modal...");
      await AdMob.showRewardVideoAd();
      return true;
    } catch (err: any) {
      console.error("Reward ad show error:", err);
      this.logEvent("Reward Ad Show Error", "FAILED", err?.message || String(err));
      return false;
    }
  }

  // -----------------------------------------------------
  // INTERSTITIAL ADS PIPELINE
  // -----------------------------------------------------
  public async preloadInterstitialAd(): Promise<boolean> {
    if (Capacitor.isNativePlatform() === false) return false;

    try {
      this.logEvent("Loading Interstitial", "PENDING", "Buffering non-rewarded interstitial content...");
      const options: AdOptions = {
        adId: ADMOB_CONFIG.INTERSTITIAL_ID,
        isTesting: ADMOB_CONFIG.INTERSTITIAL_ID.includes("599942544")
      };
      await AdMob.prepareInterstitial(options);
      this.isInterstitialPreloaded = true;
      this.logEvent("Interstitial Loaded", "SUCCESS", `Interstitial inventory ready. ID: ${ADMOB_CONFIG.INTERSTITIAL_ID}`);
      return true;
    } catch (err: any) {
      this.isInterstitialPreloaded = false;
      this.logEvent("Interstitial Failed to Load", "FAILED", err?.message || String(err));
      return false;
    }
  }

  public async showInterstitialAd(forceOverride = false): Promise<boolean> {
    if (!navigator.onLine || Capacitor.isNativePlatform() === false) {
      return false;
    }

    // Cooldown verification (Strictly limit to once every 10 minutes to protect UX and prevent invalid traffic)
    const cooldownMs = 10 * 60 * 1000; // 10 minutes
    const lastTime = Number(localStorage.getItem(this.lastInterstitialTimeKey)) || 0;
    const now = Date.now();

    if (!forceOverride && (now - lastTime < cooldownMs)) {
      const minutesLeft = Math.ceil((cooldownMs - (now - lastTime)) / 60000);
      this.logEvent("Interstitial Prevented", "COOLDOWN", `UX Protection filter active. ${minutesLeft}m remaining.`);
      return false;
    }

    await this.initialize();

    if (!this.isInterstitialPreloaded) {
      this.logEvent("Interstitial Launch Delayed", "INFO", "Prefetched token absent. Forcing sync pull...");
      const loaded = await this.preloadInterstitialAd();
      if (!loaded) return false;
    }

    try {
      const dismissListener = await AdMob.addListener(
        InterstitialAdPluginEvents.Dismissed,
        () => {
          this.logEvent("Interstitial Dismissed", "INFO", "Interstitial overlay closed.");
          dismissListener.remove();
          this.isInterstitialPreloaded = false;
          // Pre-buffer next interstitial
          this.preloadInterstitialAd();
        }
      );

      this.logEvent("Showing Interstitial", "PENDING", "Opening interstitial full-screen canvas.");
      await AdMob.showInterstitial();
      localStorage.setItem(this.lastInterstitialTimeKey, now.toString());
      return true;
    } catch (err: any) {
      this.logEvent("Interstitial Show Error", "FAILED", err?.message || String(err));
      return false;
    }
  }

  // -----------------------------------------------------
  // APP OPEN ADS (Shows on app resume / launch)
  // -----------------------------------------------------
  public async showAppOpenAd(): Promise<boolean> {
    if (!navigator.onLine || Capacitor.isNativePlatform() === false) {
      return false;
    }

    // Strict safety check - limit to once every 4 hours
    const appOpenCooldownMs = 4 * 60 * 60 * 1000;
    const lastOpenTime = Number(localStorage.getItem(this.lastAppOpenTimeKey)) || 0;
    const now = Date.now();

    if (now - lastOpenTime < appOpenCooldownMs) {
      this.logEvent("App Open Ad Suppressed", "COOLDOWN", "Ad limits active. Showing again in next window.");
      return false;
    }

    try {
      this.logEvent("App Open Request", "PENDING", "Triggering initial launch screen brand ad...");
      // For App Open Ads, we can prepare and show safely.
      // Since App Open is an advanced feature, we can support it safely using our main interstitial unit or standard test parameters if defined
      const options: AdOptions = {
        adId: ADMOB_CONFIG.INTERSTITIAL_ID // Fallback safely to our pre-authorized unit
      };
      
      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
      
      localStorage.setItem(this.lastAppOpenTimeKey, now.toString());
      this.logEvent("App Open Rendered", "SUCCESS", "Initial entry portal ad presented successfully.");
      return true;
    } catch (err: any) {
      this.logEvent("App Open Render Failed", "FAILED", err?.message || String(err));
      return false;
    }
  }

  // -----------------------------------------------------
  // ACCOUNT REWARD HISTORY LOGGER
  // -----------------------------------------------------
  public logRewardToHistory(username: string, amount: number, transactionId: string) {
    try {
      const historyStr = localStorage.getItem(`${this.rewardHistoryKey}_${username}`) || "[]";
      const history = JSON.parse(historyStr);
      history.unshift({
        id: transactionId,
        timestamp: new Date().toISOString(),
        amount,
        type: "ADMOB_PROMPT_WATCH",
        status: "VERIFIED"
      });
      localStorage.setItem(`${this.rewardHistoryKey}_${username}`, JSON.stringify(history.slice(0, 50)));
    } catch (_) {}
  }

  public getRewardHistory(username: string): Array<any> {
    try {
      const historyStr = localStorage.getItem(`${this.rewardHistoryKey}_${username}`) || "[]";
      return JSON.parse(historyStr);
    } catch (_) {
      return [];
    }
  }
}

export const admobService = new AdMobService();
