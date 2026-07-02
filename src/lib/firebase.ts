import type { FirebaseApp } from "firebase/app";
import type { AppCheck } from "firebase/app-check";
import type { Auth, User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { AppData } from "../types";

// A configuração do SDK Web é pública por definição. A credencial privada do
// Gemini permanece no proxy do Firebase AI Logic e não é enviada ao cliente.
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAnXrkBsfwovLK45V7Hyv0gjv6igNCwqJg",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "flashcards-gemini.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "flashcards-gemini",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "flashcards-gemini.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "867761235352",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:867761235352:web:7698bf2e7d0ea1a7fdf7ed",
};

const appCheckSiteKey =
  import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY ||
  "6LfLcUAtAAAAABH2g9HXtP2VuZZveynDYj_tMIRv";

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

export const firebaseAppCheckConfigured = Boolean(appCheckSiteKey);
export const firebaseCloudSyncConfigured =
  firebaseConfigured &&
  import.meta.env.VITE_FIREBASE_CLOUD_SYNC_ENABLED === "true";

let app: FirebaseApp | undefined;
let appCheck: AppCheck | undefined;
let appPromise: Promise<FirebaseApp> | null = null;
let appCheckPromise: Promise<AppCheck | undefined> | null = null;
let auth: Auth | undefined;
let db: Firestore | undefined;
let servicePromise: Promise<{
  auth: Auth;
  db: Firestore;
  authApi: typeof import("firebase/auth");
  firestoreApi: typeof import("firebase/firestore");
}> | null = null;

async function initializeAppCheck(appInstance: FirebaseApp) {
  if (!firebaseAppCheckConfigured) return undefined;
  if (!appCheckPromise) {
    appCheckPromise = import("firebase/app-check").then((appCheckApi) => {
      appCheck =
        appCheck ??
        appCheckApi.initializeAppCheck(appInstance, {
          provider: new appCheckApi.ReCaptchaEnterpriseProvider(appCheckSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
      return appCheck;
    });
  }
  return appCheckPromise;
}

export async function getFirebaseApp() {
  if (!firebaseConfigured) {
    throw new Error("Firebase ainda não foi configurado neste deploy.");
  }
  if (!appPromise) {
    appPromise = import("firebase/app").then((appApi) => {
      app = app ?? appApi.initializeApp(firebaseConfig);
      return app;
    });
  }
  const appInstance = await appPromise;
  await initializeAppCheck(appInstance);
  return appInstance;
}

async function services() {
  if (!firebaseConfigured) {
    throw new Error("Firebase ainda não foi configurado neste deploy.");
  }

  if (!servicePromise) {
    servicePromise = Promise.all([
      getFirebaseApp(),
      import("firebase/auth"),
      import("firebase/firestore"),
    ]).then(([appInstance, authApi, firestoreApi]) => {
      auth = auth ?? authApi.getAuth(appInstance);
      db = db ?? firestoreApi.getFirestore(appInstance);
      return { auth, db, authApi, firestoreApi };
    });
  }

  return servicePromise;
}

export function watchFirebaseUser(callback: (user: User | null) => void) {
  if (!firebaseCloudSyncConfigured) return () => undefined;
  let unsubscribe: (() => void) | undefined;
  let cancelled = false;
  void services().then(({ auth, authApi }) => {
    if (!cancelled) unsubscribe = authApi.onAuthStateChanged(auth, callback);
  });
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

export async function connectWithGoogle() {
  if (!firebaseCloudSyncConfigured) {
    throw new Error("A sincronização em nuvem ainda não foi ativada.");
  }
  const { auth, authApi } = await services();
  const provider = new authApi.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return (await authApi.signInWithPopup(auth, provider)).user;
}

export async function disconnectFirebase() {
  const { auth, authApi } = await services();
  return authApi.signOut(auth);
}

export async function loadCloudData(uid: string): Promise<AppData | null> {
  const { db, firestoreApi } = await services();
  const snapshot = await firestoreApi.getDoc(
    firestoreApi.doc(db, "users", uid, "app", "state"),
  );
  return snapshot.exists() ? (snapshot.data().payload as AppData) : null;
}

export async function saveCloudData(uid: string, data: AppData) {
  const { db, firestoreApi } = await services();
  await firestoreApi.setDoc(
    firestoreApi.doc(db, "users", uid, "app", "state"),
    {
      payload: data,
      updatedAt: firestoreApi.serverTimestamp(),
      schemaVersion: 1,
    },
  );
}
