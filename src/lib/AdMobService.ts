import {
  AdMob,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';

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

  // =========================
  // INITIALIZE ADMOB
  // =========================
  async initialize() {
    try {
      const isTestMode = localStorage.getItem("nexa_admob_test_mode") === "true";
      await AdMob.initialize({
        initializeForTesting: isTestMode,
      });
      console.log('✅ AdMob Initialized (TestMode=' + isTestMode + ')');
      this.log("INFO", "AdMob Engine Ready", `Ready to build streams. Test mode: ${isTestMode ? "ENABLED" : "DISABLED"}`);
    } catch (error) {
      console.error('❌ AdMob Init Error:', error);
      this.log("FAILED", "Initialization Failure", String(error));
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

      const isTestMode = localStorage.getItem("nexa_admob_test_mode") === "true";
      // Official Google test ad units or real registered ones
      const targetAdId = isTestMode ? 'ca-app-pub-3940256099942544/5224354917' : REWARDED_ID;

      this.log("PENDING", "Ad Requested", `Loading unit ID: ${targetAdId} (TestMode: ${isTestMode})`);

      // =========================
      // PREPARE / CACHE AD
      // =========================
      await AdMob.prepareRewardVideoAd({
        adId: targetAdId,
        isTesting: isTestMode,
      });

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
        }
      );

      // =========================
      // SHOW FULLSCREEN AD
      // =========================
      await AdMob.showRewardVideoAd();

    } catch (error) {
      console.error('❌ Rewarded Ad Error:', error);
      this.log("FAILED", "Ad Stream Interrupted", String(error));
    }
  }

  // ===================================
  // COMPATIBILITY SHIM METHODS FOR APP
  // ===================================
  async showRewardedAd(onRewardGranted: (amount: number) => void, onDismiss?: () => void): Promise<boolean> {
    await this.showRewarded(() => {
      onRewardGranted(10);
      if (onDismiss) onDismiss();
    });
    return true;
  }

  async showInterstitialAd(): Promise<boolean> {
    const isTestMode = localStorage.getItem("nexa_admob_test_mode") === "true";
    this.log("INFO", "Interstitial Requested", `Suppressed as per active strategy (Rewarded ad priority). TestMode: ${isTestMode}`);
    return true;
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
