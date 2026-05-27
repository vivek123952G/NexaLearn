import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs,
  query,
  orderBy,
  onSnapshot,
  getDocFromServer,
  disableNetwork,
  enableNetwork
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
export { GoogleAuthProvider, signInWithPopup };
import { Capacitor } from "@capacitor/core";
import firebaseConfig from "../../firebase-applet-config.json";

// Normalize potential Vite default ESM wrapper
const actualConfig = (firebaseConfig as any).default || firebaseConfig;

// Initialize Firebase App robustly
const app = getApps().length === 0 ? initializeApp(actualConfig) : getApp();

const isNative = Capacitor.isNativePlatform();

// Initialize Firestore with robust connection protocols to completely prevent timeouts in restricted environments:
// 1. Force HTTP Long Polling instead of standard WebSockets/WebChannel which are often blocked.
// 2. Enable modern persistentLocalCache with persistentSingleTabManager to avoid multi-iframe/tab collision errors.
const firestoreSettings = {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({})
  }),
  experimentalForceLongPolling: true
};

const globalTemp = globalThis as any;

let dbInstance: any;
if (globalTemp._firestoreDb) {
  dbInstance = globalTemp._firestoreDb;
} else {
  try {
    dbInstance = actualConfig.firestoreDatabaseId 
      ? initializeFirestore(app, firestoreSettings, actualConfig.firestoreDatabaseId)
      : initializeFirestore(app, firestoreSettings);
  } catch (err) {
    console.warn("⚠️ Failed to initialize Firestore with advanced settings. Retrying with basic settings...", err);
    try {
      const fallbackSettings = { experimentalForceLongPolling: true };
      dbInstance = actualConfig.firestoreDatabaseId 
        ? initializeFirestore(app, fallbackSettings, actualConfig.firestoreDatabaseId)
        : initializeFirestore(app, fallbackSettings);
    } catch (err2) {
      console.warn("⚠️ Fallback Firestore initialization failed. Defaulting to getFirestore(app)...", err2);
      dbInstance = getFirestore(app);
    }
  }
  globalTemp._firestoreDb = dbInstance;
}

export const db = dbInstance;

let authInstance: any;
if (globalTemp._firebaseAuth) {
  authInstance = globalTemp._firebaseAuth;
} else {
  authInstance = getAuth(app);
  globalTemp._firebaseAuth = authInstance;
}

export const auth = authInstance;

// Timeout wrap promise helper to keep operations ultra-fast (limit to 6000ms for seamless user fallback)
function withTimeout<T>(promise: Promise<T>, ms = 6000, description = "Operation"): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${description} took longer than ${ms}ms`)), ms)
    )
  ]);
}

// Connection Health Check & Auto Offline Mode Tuning
export async function auditFirestoreConnection(): Promise<boolean> {
  const testDocRef = doc(db, "connection_test", "health");
  try {
    // Attempt to pull a document directly from the server with a short timeout.
    // If the server doesn't respond in 4.5 seconds or the sandbox blocks the network, we fall back to offline mode.
    await withTimeout(getDocFromServer(testDocRef), 4500, "Firestore database ping");
    console.log("📶 Firestore connection test successful! Cloud synchronization is fully operational.");
    localStorage.setItem("nexa_firestore_connected", "true");
    try {
      await enableNetwork(db);
    } catch (_) {}
    return true;
  } catch (err) {
    console.warn("⚠️ Firestore connection test timeout/failure - switching to absolute offline Mode:", err);
    localStorage.setItem("nexa_firestore_connected", "false");
    try {
      await disableNetwork(db);
      console.log("🔌 Firestore network traffic disabled automatically to completely prevent 10-second timeout warnings.");
    } catch (netErr) {
      console.warn("Could not disable Firestore network:", netErr);
    }
    return false;
  }
}

// Spark the connection test in the background silently
auditFirestoreConnection().catch(() => {});

// Telemetry & Diagnostic Error Handlers
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || "anonymous_username_session",
      email: auth.currentUser?.email || null,
    },
    operationType,
    path,
  };
  
  // Custom silentTelemetry logging inside errors collection
  try {
    const errorLogId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setDoc(doc(db, "errors", errorLogId), {
      ...errInfo,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Node.js"
    }).catch(e => console.error("Could not write telemetry crash log to database:", e));
  } catch (logErr) {
    console.error("Telemetry reporting failed:", logErr);
  }

  console.warn("Firestore Error Logged Silently: ", JSON.stringify(errInfo));
}


// Data Serialization Helper for Profile Sync
export async function fetchUserProfile(username: string): Promise<any | null> {
  const path = `users/${username.toLowerCase().trim()}`;
  try {
    const userDoc = await withTimeout(
      getDoc(doc(db, "users", username.toLowerCase().trim())),
      6000,
      "Fetch user profile"
    );
    if (userDoc.exists()) {
      const data = userDoc.data();
      localStorage.setItem(`nexasnap_cache_profile_${username.toLowerCase().trim()}`, JSON.stringify(data));
      return data;
    }
    const local = localStorage.getItem(`nexasnap_cache_profile_${username.toLowerCase().trim()}`);
    if (local) {
      try { return JSON.parse(local); } catch (_) {}
    }
    return null;
  } catch (err: any) {
    console.warn("Firestore fetch failed, invoking robust local storage fallbacks:", err);
    
    // Fallback path 1: Loaded cached response
    const local = localStorage.getItem(`nexasnap_cache_profile_${username.toLowerCase().trim()}`);
    if (local) {
      try { return JSON.parse(local); } catch (_) {}
    }
    // Fallback path 2: Direct profile key
    const activeUserStr = localStorage.getItem(`nexasnap_user_${username.toLowerCase().trim()}`);
    if (activeUserStr) {
      try { return JSON.parse(activeUserStr); } catch (_) {}
    }
    // Fallback path 3: general user
    const generalUserStr = localStorage.getItem("nexasnap_user");
    if (generalUserStr) {
      try {
        const generalUser = JSON.parse(generalUserStr);
        if (generalUser.username === username.toLowerCase().trim()) {
          return generalUser;
        }
      } catch (_) {}
    }
    
    handleFirestoreError(err, OperationType.GET, path);
    
    // Fallback path 4: Return null if absolutely no cache or credentials match, to avoid blocking signup
    return null;
  }
}

export async function createUserProfile(username: string, baseProfile: any): Promise<void> {
  const cleanedUsername = username.toLowerCase().trim();
  const path = `users/${cleanedUsername}`;
  try {
    localStorage.setItem(`nexasnap_cache_profile_${cleanedUsername}`, JSON.stringify(baseProfile));
    await withTimeout(
      setDoc(doc(db, "users", cleanedUsername), {
        ...baseProfile,
        username: cleanedUsername,
        daily_ad_count: 0,
        last_ad_timestamp: "",
        nexa_coins: baseProfile.coins || 0,
        current_streak: baseProfile.streak || 0,
        last_active_date: new Date().toISOString().split("T")[0]
      }),
      6000,
      "Create user profile"
    );
  } catch (err: any) {
    console.warn("Offline user creation backed up to local cache successfully due to:", err);
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function syncUserProfileUpdate(username: string, updates: any): Promise<void> {
  const cleanedUsername = username.toLowerCase().trim();
  const path = `users/${cleanedUsername}`;
  try {
    const cached = localStorage.getItem(`nexasnap_cache_profile_${cleanedUsername}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        localStorage.setItem(`nexasnap_cache_profile_${cleanedUsername}`, JSON.stringify({ ...parsed, ...updates }));
      } catch (_) {}
    }
    await withTimeout(
      updateDoc(doc(db, "users", cleanedUsername), updates),
      6000,
      "Sync user profile"
    );
  } catch (err: any) {
    console.warn("Offline user profile update recorded locally due to:", err);
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Task Sync Helpers
export async function syncTaskToFirestore(username: string, taskId: string, taskData: any): Promise<void> {
  const cleanedUsername = username.toLowerCase().trim();
  const path = `users/${cleanedUsername}/tasks/${taskId}`;
  try {
    await withTimeout(
      setDoc(doc(db, "users", cleanedUsername, "tasks", taskId), taskData),
      6000,
      "Sync task"
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getSyncTasksFromFirestore(username: string): Promise<any[]> {
  const cleanedUsername = username.toLowerCase().trim();
  const path = `users/${cleanedUsername}/tasks`;
  try {
    const snapshot = await withTimeout(
      getDocs(collection(db, "users", cleanedUsername, "tasks")),
      6000,
      "Get sync tasks"
    );
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// Chat Sync Helpers
export async function syncChatToFirestore(username: string, chatId: string, chatData: any): Promise<void> {
  const cleanedUsername = username.toLowerCase().trim();
  const path = `users/${cleanedUsername}/chats/${chatId}`;
  try {
    await withTimeout(
      setDoc(doc(db, "users", cleanedUsername, "chats", chatId), chatData),
      6000,
      "Sync chat"
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getSyncChatsFromFirestore(username: string): Promise<any[]> {
  const cleanedUsername = username.toLowerCase().trim();
  const path = `users/${cleanedUsername}/chats`;
  try {
    const snapshot = await withTimeout(
      getDocs(collection(db, "users", cleanedUsername, "chats")),
      6000,
      "Get sync chats"
    );
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// Ad Viewing Sessions Helpers
export async function syncAdSessionToFirestore(username: string, sessionId: string, sessionData: any): Promise<void> {
  const cleanedUsername = username.toLowerCase().trim();
  const path = `users/${cleanedUsername}/ad_sessions/${sessionId}`;
  try {
    // Also save in local storage cache for local lookup/session history
    const cachedSessionsKey = `nexa_ad_sessions_${cleanedUsername}`;
    const cachedSessions = localStorage.getItem(cachedSessionsKey);
    let list: any[] = [];
    if (cachedSessions) {
      try { list = JSON.parse(cachedSessions); } catch (_) {}
    }
    list.unshift({ id: sessionId, ...sessionData });
    // Keep last 30 sessions locally
    localStorage.setItem(cachedSessionsKey, JSON.stringify(list.slice(0, 30)));

    await withTimeout(
      setDoc(doc(db, "users", cleanedUsername, "ad_sessions", sessionId), sessionData),
      6000,
      "Sync ad session"
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getAdSessionsFromFirestore(username: string): Promise<any[]> {
  const cleanedUsername = username.toLowerCase().trim();
  const path = `users/${cleanedUsername}/ad_sessions`;
  try {
    // Try local storage cache fallback first for rapid feedback
    const cachedSessionsKey = `nexa_ad_sessions_${cleanedUsername}`;
    const cachedSessions = localStorage.getItem(cachedSessionsKey);
    let cachedList: any[] = [];
    if (cachedSessions) {
      try { cachedList = JSON.parse(cachedSessions); } catch (_) {}
    }

    const snapshot = await withTimeout(
      getDocs(collection(db, "users", cleanedUsername, "ad_sessions")),
      6000,
      "Get sync ad sessions"
    );
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    // Sort descending by timestamp
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Save to local cache
    localStorage.setItem(cachedSessionsKey, JSON.stringify(list.slice(0, 30)));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    
    // Fallback to local cache
    const cachedSessionsKey = `nexa_ad_sessions_${cleanedUsername}`;
    const cachedSessions = localStorage.getItem(cachedSessionsKey);
    if (cachedSessions) {
      try {
        const list = JSON.parse(cachedSessions);
        list.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return list;
      } catch (_) {}
    }
    return [];
  }
}

// Support function to delete specific user profile from Firestore and clean up related cache keys
export async function deleteUserProfileByAdmin(username: string): Promise<boolean> {
  const cleanedUsername = username.toLowerCase().trim();
  const path = `users/${cleanedUsername}`;
  try {
    const { deleteDoc, doc } = await import("firebase/firestore");
    await withTimeout(
      deleteDoc(doc(db, "users", cleanedUsername)),
      6000,
      "Delete user profile"
    );
    
    // Clear associated local storage keys
    const keysToRemoval = [
      `nexa_user_profile_${cleanedUsername}`,
      `nexa_weekly_planner_${cleanedUsername}`,
      `nexa_weekly_rotate_last_${cleanedUsername}`,
      `nexa_ad_sessions_${cleanedUsername}`,
      `watch_earn_cooldown_${cleanedUsername}`,
      `nexa_last_streak_time_${cleanedUsername}`,
      `nexa_local_tasks_${cleanedUsername}`,
      `nexa_messages_${cleanedUsername}`
    ];
    keysToRemoval.forEach((k) => localStorage.removeItem(k));
    
    // Clean current active login reference if it matches
    const currentActive = localStorage.getItem("nexa_login_success_username");
    if (currentActive && currentActive.toLowerCase().trim() === cleanedUsername) {
      localStorage.removeItem("nexa_login_success_username");
    }
    return true;
  } catch (err) {
    // If offline or fails, force local storage cleanup anyway as a failsafe
    const keysToRemoval = [
      `nexa_user_profile_${cleanedUsername}`,
      `nexa_weekly_planner_${cleanedUsername}`,
      `nexa_weekly_rotate_last_${cleanedUsername}`,
      `nexa_ad_sessions_${cleanedUsername}`,
      `watch_earn_cooldown_${cleanedUsername}`,
      `nexa_last_streak_time_${cleanedUsername}`,
      `nexa_local_tasks_${cleanedUsername}`,
      `nexa_messages_${cleanedUsername}`
    ];
    keysToRemoval.forEach((k) => localStorage.removeItem(k));
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

// --- Global Realtime Community Synchronizer Hooks & API Nodes ---

// Sync allUsers list in real-time
export function subscribeToGlobalUsers(onUpdate: (users: any[]) => void, onError?: (err: any) => void) {
  const q = query(collection(db, "users"), orderBy("xp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const usersList: any[] = [];
    snapshot.forEach((docRef) => {
      usersList.push({ username: docRef.id, ...docRef.data() });
    });
    onUpdate(usersList);
  }, (error) => {
    console.error("Global Users Sync Failure:", error);
    if (onError) onError(error);
  });
}

// Sync reels in real-time
export function subscribeToGlobalReels(onUpdate: (reels: any[]) => void, onError?: (err: any) => void) {
  const q = collection(db, "reels");
  return onSnapshot(q, (snapshot) => {
    const reelsList: any[] = [];
    snapshot.forEach((docRef) => {
      reelsList.push({ id: docRef.id, ...docRef.data() });
    });
    // Sort by id descending
    reelsList.sort((a, b) => b.id.localeCompare(a.id));
    onUpdate(reelsList);
  }, (error) => {
    console.error("Global Reels Sync Failure:", error);
    if (onError) onError(error);
  });
}

// Sync posts in real-time
export function subscribeToGlobalPosts(onUpdate: (posts: any[]) => void, onError?: (err: any) => void) {
  const q = collection(db, "posts");
  return onSnapshot(q, (snapshot) => {
    const postsList: any[] = [];
    snapshot.forEach((docRef) => {
      postsList.push({ id: docRef.id, ...docRef.data() });
    });
    postsList.sort((a, b) => b.id.localeCompare(a.id));
    onUpdate(postsList);
  }, (error) => {
    console.error("Global Posts Sync Failure:", error);
    if (onError) onError(error);
  });
}

// Publish/update individual reel to Firestore
export async function syncReelToFirestore(reelId: string, reelData: any): Promise<void> {
  const path = `reels/${reelId}`;
  try {
    await withTimeout(
      setDoc(doc(db, "reels", reelId), reelData, { merge: true }),
      6000,
      "Sync global reel"
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Publish/update individual post to Firestore
export async function syncPostToFirestore(postId: string, postData: any): Promise<void> {
  const path = `posts/${postId}`;
  try {
    await withTimeout(
      setDoc(doc(db, "posts", postId), postData, { merge: true }),
      6000,
      "Sync global post"
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}


