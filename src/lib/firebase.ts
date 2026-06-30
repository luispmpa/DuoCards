import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { AppData } from "../types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let servicePromise: Promise<{
  auth: Auth;
  db: Firestore;
  authApi: typeof import("firebase/auth");
  firestoreApi: typeof import("firebase/firestore");
}> | null = null;

async function services() {
  if (!firebaseConfigured) {
    throw new Error("Firebase ainda não foi configurado neste deploy.");
  }

  if (!servicePromise) {
    servicePromise = Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
      import("firebase/firestore"),
    ]).then(([appApi, authApi, firestoreApi]) => {
      app = app ?? appApi.initializeApp(firebaseConfig);
      auth = auth ?? authApi.getAuth(app);
      db = db ?? firestoreApi.getFirestore(app);
      return { auth, db, authApi, firestoreApi };
    });
  }

  return servicePromise;
}

export function watchFirebaseUser(callback: (user: User | null) => void) {
  if (!firebaseConfigured) return () => undefined;
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
