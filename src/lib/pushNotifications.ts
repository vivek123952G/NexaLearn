import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { syncUserProfileUpdate } from "./firebase";

export interface PushNotificationLog {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: "received" | "clicked" | "info";
}

class PushNotificationsService {
  private hasRegistered = false;
  private token: string | null = null;
  private logs: PushNotificationLog[] = [];

  constructor() {
    try {
      const saved = localStorage.getItem("nexa_push_logs");
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (_) {}
  }

  private log(type: "received" | "clicked" | "info", title: string, body: string) {
    const newLog: PushNotificationLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      title,
      body,
      type
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 50) this.logs.pop();
    try {
      localStorage.setItem("nexa_push_logs", JSON.stringify(this.logs));
    } catch (_) {}
  }

  // Initial setup for Push Notifications on Native Device
  async init(username: string) {
    const cleanedUsername = username?.toLowerCase().trim();
    if (!cleanedUsername) return;

    if (!Capacitor.isNativePlatform()) {
      console.log("ℹ️ Push Notifications Bypassed: Browser sandbox mode. Simulation ready.");
      this.log("info", "Browser Notification Sandbox", "Simulating Push Notifications interface. Ready to broadcast.");
      
      // Load simulated mock token
      const mockToken = `mock_fcm_token_web_${Math.random().toString(36).substring(2, 12)}`;
      this.token = mockToken;
      await syncUserProfileUpdate(cleanedUsername, { fcmToken: mockToken });
      return;
    }

    try {
      // Check/request permissions
      let permission = await PushNotifications.checkPermissions();
      if (permission.receive !== "granted") {
        permission = await PushNotifications.requestPermissions();
      }

      if (permission.receive !== "granted") {
        this.log("info", "Permission Refused", "Student denied push notifications sync parameters.");
        return;
      }

      // Register with FCM/APNS gate
      await PushNotifications.register();
      this.hasRegistered = true;

      // Add actual Native Event Listeners
      await PushNotifications.addListener("registration", async (token) => {
        console.log("🔑 FCM Registration Token:", token.value);
        this.token = token.value;
        this.log("info", "FCM Connection Established", `Token: ${token.value.substring(0, 15)}...`);
        
        // Sync to Firestore profile
        await syncUserProfileUpdate(cleanedUsername, { fcmToken: token.value });
      });

      await PushNotifications.addListener("registrationError", (err: any) => {
        console.error("❌ FCM registration error: ", err);
        this.log("info", "Registration Error", String(err.error || err));
      });

      await PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log("📬 Push Received: ", notification);
        const title = notification.title || "Alert from NexaSnap AI";
        const body = notification.body || "New high priority sync complete.";
        this.log("received", title, body);
        
        // Show in-app alert/toast if in focus
        if (typeof window !== "undefined") {
          const customEvent = new CustomEvent("nexasnap_push_received", {
            detail: { title, body }
          });
          window.dispatchEvent(customEvent);
        }
      });

      await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.log("👆 Push Action Clicked: ", action);
        const notification = action.notification;
        const title = notification.title || "Action Opened";
        const body = notification.body || "A student accessed the notification portal.";
        this.log("clicked", title, body);
      });

    } catch (error) {
      console.error("❌ Error setting up native Push Notifications:", error);
      this.log("info", "Setup Failed", String(error));
    }
  }

  getLogs(): PushNotificationLog[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem("nexa_push_logs");
  }

  getToken() {
    return this.token;
  }
}

export const pushNotificationsService = new PushNotificationsService();
export default pushNotificationsService;
