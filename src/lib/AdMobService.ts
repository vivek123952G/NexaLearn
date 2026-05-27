import {
  AdMob,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';

// =========================
// REAL ADMOB IDS
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

  // =========================
  // INITIALIZE ADMOB
  // =========================

  async initialize() {

    try {

      await AdMob.initialize({
        initializeForTesting: false,
      });

      console.log('✅ AdMob Initialized');

    } catch (error) {

      console.error(
        '❌ AdMob Init Error:',
        error
      );

    }
  }

  // =========================
  // SHOW REWARDED AD
  // =========================

  async showRewarded(
    onReward?: () => void
  ) {

    try {

      // =========================
      // ANTI-SPAM TIMER
      // 2 MINUTES GAP
      // =========================

      const now = Date.now();

      if (
        now - this.lastRewardTime
        < 120000
      ) {

        console.log(
          '⏳ Wait before next reward ad'
        );

        return;
      }

      this.lastRewardTime = now;

      // =========================
      // LOAD REWARDED AD
      // =========================

      await AdMob.prepareRewardVideoAd({
        adId: REWARDED_ID,
        isTesting: false,
      });

      console.log(
        '✅ Rewarded Ad Loaded'
      );

      // =========================
      // USER EARNED REWARD
      // =========================

      const rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        () => {

          console.log(
            '🎁 Reward Earned'
          );

          // RUN CUSTOM FUNCTION

          if (onReward) {
            onReward();
          }

        }
      );

      // Clean listeners safely on dismissal
      const dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          rewardListener.remove();
          dismissListener.remove();
        }
      );

      // =========================
      // SHOW AD
      // =========================

      await AdMob.showRewardVideoAd();

    } catch (error) {

      console.error(
        '❌ Rewarded Ad Error:',
        error
      );

    }
  }

  // ===================================
  // COMPATIBILITY SHIM METHODS FOR NEXALEARN
  // ===================================

  async showRewardedAd(onRewardGranted: (amount: number) => void, onDismiss?: () => void): Promise<boolean> {
    await this.showRewarded(() => {
      onRewardGranted(10);
      if (onDismiss) onDismiss();
    });
    return true;
  }

  async showInterstitialAd(): Promise<boolean> {
    console.log('ℹ️ Interstitial ad request received: suppressed as per timing strategy (rewarded ads only).');
    return true;
  }

  async showAppOpenAd(): Promise<boolean> {
    console.log('ℹ️ App Open ad request received: suppressed as per timing strategy (rewarded ads only).');
    return true;
  }

  getLogs(): AdLogEntry[] {
    return [];
  }

  clearLogs(): void {}

  logRewardToHistory(username: string, amount: number, transactionId: string): void {
    console.log(`[Compatibility] Reward logged for ${username}: +${amount} points (ID: ${transactionId})`);
  }

}

const admobServiceInstance = new AdMobService();
export default admobServiceInstance;
export const admobService = admobServiceInstance;
