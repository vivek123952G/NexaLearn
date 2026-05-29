import {
  AdMob,
  RewardAdPluginEvents,
  InterstitialAdPluginEvents,
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// =========================
// REAL ADMOB IDS (Production)
// =========================
const APP_ID = 'ca-app-pub-2996487725106736~8712669509';
const REWARDED_ID = 'ca-app-pub-2996487725106736/1704475233';

export const ADMOB_CONFIG = {
  APP_ID: APP_ID,
  REWARDED_INTERSTITIAL_ID: REWARDED_ID,
  NATIVE_AD_ID: 'ca-app-pub-2996487725106736/2904587862',
  INTERSTITIAL_ID: 'ca-app-pub-2996487725106736/8251906012'
};

// Log entry interface for audit and debugging compatibility
export interface AdLogEntry {
  id: string;
  timestamp: string;
  event: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "COOLDOWN" | "INFO";
  details: string;
}

// =========================
// ADMOB SERVICE
// =========================
class AdMobService {
  private lastRewardTime = 0;
  private logs: AdLogEntry[] = [];
  
  // Single Initialization Lock Pattern
  private initPromise: Promise<void> | null = null;
  private isInitialized = false;

  // Preloading & Loaded Status Tracking
  private isRewardedLoaded = false;
  private isInterstitialLoaded = false;
  private isPreloadingRewarded = false;
  private isPreloadingInterstitial = false;

  constructor() {
    try {
      const saved = localStorage.getItem("nexa_admob_audit_logs");
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (_) {}
    if (this.logs.length === 0) {
      this.log("INFO", "AdMob Service Initialized", "Telemetry stream started successfully.");
    }
  }

  private log(status: "SUCCESS" | "FAILED" | "PENDING" | "COOLDOWN" | "INFO", event: string, details: string) {
    const newLog: AdLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      event,
      status,
      details
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 50) this.logs.pop();
    try {
      localStorage.setItem("nexa_admob_audit_logs", JSON.stringify(this.logs));
    } catch (_) {}
  }

  // ===================================
  // INITIALIZE ADMOB (ONCE & RUNS FIRST)
  // ===================================
  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const isNative = Capacitor.isNativePlatform();
        const isTestMode = !isNative; // Real ads on native platform, browser sandbox on dev previews

        await AdMob.initialize({
          initializeForTesting: isTestMode,
        });

        this.isInitialized = true;
        console.log('✅ AdMob Initialized (Native=' + isNative + ', TestMode=' + isTestMode + ')');
        this.log("INFO", "AdMob Engine Ready", `Ready to build streams. Test mode: ${isTestMode ? "ENABLED" : "DISABLED"}`);

        // Kickoff background ad preloads so they are immediately available on screen open
        if (isNative) {
          this.preloadRewardedAd();
          this.preloadInterstitialAd();
        }
      } catch (error) {
        console.error('❌ AdMob Init Error:', error);
        this.log("FAILED", "Initialization Failure", String(error));
        // Reset promise to allow retrying initialization if it failed
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  // ===================================
  // PRELOAD REWARDED VIDEO AD IN BG
  // ===================================
  async preloadRewardedAd(retryCount = 0): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    if (this.isPreloadingRewarded || this.isRewardedLoaded) return this.isRewardedLoaded;

    this.isPreloadingRewarded = true;
    try {
      this.log("INFO", "Preloading Rewarded", "Loading production rewarded unit ID in background...");
      
      await AdMob.prepareRewardVideoAd({
        adId: REWARDED_ID,
        isTesting: false,
      });

      this.isRewardedLoaded = true;
      this.log("SUCCESS", "Rewarded Preload Successful", "Production rewarded ad fully loaded and cached.");
      return true;
    } catch (error) {
      this.isRewardedLoaded = false;
      this.log("FAILED", "Rewarded Preload Failed", `Error: ${String(error)}. Retrying soon.`);
      
      // Retry handling: 15–30 seconds retry logic
      if (retryCount < 5) {
        const backoff = 15000 + Math.random() * 15000; // 15-30 seconds backoff
        setTimeout(() => {
          this.preloadRewardedAd(retryCount + 1);
        }, backoff);
      }
      return false;
    } finally {
      this.isPreloadingRewarded = false;
    }
  }

  // ===================================
  // PRELOAD INTERSTITIAL AD IN BG
  // ===================================
  async preloadInterstitialAd(retryCount = 0): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    if (this.isPreloadingInterstitial || this.isInterstitialLoaded) return this.isInterstitialLoaded;

    this.isPreloadingInterstitial = true;
    try {
      this.log("INFO", "Preloading Interstitial", "Loading production interstitial unit ID in background...");

      await AdMob.prepareInterstitial({
        adId: ADMOB_CONFIG.INTERSTITIAL_ID,
        isTesting: false,
      });

      this.isInterstitialLoaded = true;
      this.log("SUCCESS", "Interstitial Preload Successful", "Production Interstitial ad cached successfully.");
      return true;
    } catch (error) {
      this.isInterstitialLoaded = false;
      this.log("FAILED", "Interstitial Preload Failed", `Error: ${String(error)}. Retrying soon.`);

      // Retry handling: 15–30 seconds retry logic
      if (retryCount < 5) {
        const backoff = 15000 + Math.random() * 15000;
        setTimeout(() => {
          this.preloadInterstitialAd(retryCount + 1);
        }, backoff);
      }
      return false;
    } finally {
      this.isPreloadingInterstitial = false;
    }
  }

  // =========================
  // SHOW REWARDED AD
  // =========================
  async showRewarded(onReward?: () => void) {
    try {
      const now = Date.now();
      // 2 minutes cooldown gap to guard account integrity
      if (now - this.lastRewardTime < 120000) {
        console.log('⏳ Wait before next reward ad');
        this.log("COOLDOWN", "Request Rejected", "Throttled to secure account. Wait 120s.");
        return;
      }

      this.lastRewardTime = now;

      const isNative = Capacitor.isNativePlatform();
      const isTestMode = !isNative; 

      // On Native, ALWAYS use the production real unit
      const targetAdId = isTestMode ? 'ca-app-pub-3940256099942544/5224354917' : REWARDED_ID;

      this.log("PENDING", "Ad Requested", `Loading unit ID: ${targetAdId} (TestMode: ${isTestMode})`);

      // Ensure SDK is active first
      await this.initialize();

      // If playing on native, try to prepare if not loaded
      if (isNative && !this.isRewardedLoaded) {
        await AdMob.prepareRewardVideoAd({
          adId: targetAdId,
          isTesting: isTestMode,
        });
      }

      this.log("INFO", "Ad Loaded", "Preparing to render video presentation to student node...");

      // =========================
      // LISTENERS
      // =========================
      const rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        (reward: any) => {
          const earned = reward?.amount || 10;
          this.log("SUCCESS", "Node Reward Complete", `Authorized completion. Yield: +${earned} Coins.`);
          if (onReward) {
            onReward();
          }
        }
      );

      const dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          this.log("INFO", "Video Dismissed", "Ad closed. Event tracking cleanup finished.");
          rewardListener.remove();
          dismissListener.remove();
          this.isRewardedLoaded = false;
          // Reload interstitial right away in background as requested
          this.preloadRewardedAd();
        }
      );

      // =========================
      // SHOW FULLSCREEN AD
      // =========================
      await AdMob.showRewardVideoAd();

    } catch (error) {
      console.error('❌ Rewarded Ad Error:', error);
      this.log("FAILED", "Ad Stream Interrupted", String(error));
      this.isRewardedLoaded = false;
      this.preloadRewardedAd();
    }
  }

  // ===================================
  // COMPATIBILITY SHIM METHODS FOR APP
  // ===================================
  async showRewardedAd(onRewardGranted: (amount: number) => void, onDismiss?: () => void): Promise<boolean> {
    const isNative = Capacitor.isNativePlatform();
    if (!isNative) {
      this.log("INFO", "Simulated Ad Triggered", "Dispatching browser-based AdMob interactive video playback simulator.");
      const customEvent = new CustomEvent("nexasnap_trigger_simulated_rewarded_ad", {
        detail: {
          onReward: () => {
            this.log("SUCCESS", "Simulated Reward Dispatched", "User completed the simulated video loop (+10 NEXA)");
            onRewardGranted(10);
          },
          onDismiss: () => {
            this.log("INFO", "Simulated Ad Dismissed", "User exited simulated advertiser window.");
            if (onDismiss) onDismiss();
          }
        }
      });
      window.dispatchEvent(customEvent);
      return true;
    }

    await this.showRewarded(() => {
      onRewardGranted(10);
      if (onDismiss) onDismiss();
    });
    return true;
  }

  async showInterstitialAd(): Promise<boolean> {
    const isNative = Capacitor.isNativePlatform();
    if (!isNative) {
      this.log("INFO", "Simulated Interstitial Triggered", "Dispatching slide transition sponsor overlay simulator on browser.");
      const customEvent = new CustomEvent("nexasnap_trigger_simulated_interstitial_ad", {
        detail: {
          onClosed: () => {
            this.log("INFO", "Simulated Interstitial Closed", "Simulation card dismissed.");
          }
        }
      });
      window.dispatchEvent(customEvent);
      return true;
    }

    try {
      this.log("PENDING", "Interstitial Showing", "Preparing to show preloaded production Interstitial ad...");
      
      await this.initialize();

      if (!this.isInterstitialLoaded) {
        await AdMob.prepareInterstitial({
          adId: ADMOB_CONFIG.INTERSTITIAL_ID,
          isTesting: false,
        });
      }

      const dismissListener = await AdMob.addListener(
        InterstitialAdPluginEvents.Dismissed,
        () => {
          this.log("INFO", "Interstitial Dismissed", "Real ad segment finished. Reloading background queue.");
          dismissListener.remove();
          this.isInterstitialLoaded = false;
          // Reload right after each display as requested!
          this.preloadInterstitialAd();
        }
      );

      await AdMob.showInterstitial();
      return true;
    } catch (err) {
      console.error("❌ Interstitial Ad failure:", err);
      this.log("FAILED", "Interstitial Interrupted", String(err));
      this.preloadInterstitialAd();
      return false;
    }
  }

  async showAppOpenAd(): Promise<boolean> {
    console.log('ℹ️ App Open ad suppressed for structural UX stream.');
    return true;
  }

  getLogs(): AdLogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem("nexa_admob_audit_logs");
    } catch (_) {}
    this.log("INFO", "Logs Cleared", "Telemetry buffer re-allocated.");
  }

  logRewardToHistory(username: string, amount: number, transactionId: string): void {
    this.log("SUCCESS", "Rewarded Yield Dispatched", `Target student: ${username} | +${amount} Nexa coins | ID: ${transactionId}`);
  }
}

const admobServiceInstance = new AdMobService();
export default admobServiceInstance;
export const admobService = admobServiceInstance;
