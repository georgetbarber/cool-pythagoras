import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  writeBatch,
  type Firestore,
  type Unsubscribe
} from "firebase/firestore";
import { cloudProfile, cloudSketch } from "./sync";
import type { CloudProfile } from "./sync";
import type { CompetencyEvidence, Sketch, V8State } from "./types";
import { useV8Store } from "./store";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined
};

export const CLOUD_CONFIGURED = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);

const app = CLOUD_CONFIGURED ? (getApps()[0] ?? initializeApp(firebaseConfig)) : null;
const auth = app ? getAuth(app) : null;
const database = app ? getFirestore(app) : null;

export type SyncStatus = "local-only" | "signed-out" | "syncing" | "synced" | "offline" | "error";

interface CloudValue {
  configured: boolean;
  user: User | null;
  status: SyncStatus;
  message: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const CloudContext = createContext<CloudValue | null>(null);

interface SyncCache {
  profileUpdatedAt: string;
  profileSignature: string;
  evidenceIds: Set<string>;
  sketchVersions: Map<string, string>;
  deletionVersions: Map<string, string>;
}

function emptyCache(): SyncCache {
  return { profileUpdatedAt: "", profileSignature: "", evidenceIds: new Set(), sketchVersions: new Map(), deletionVersions: new Map() };
}

function profileSignature(profile: CloudProfile): string {
  return JSON.stringify(profile);
}

async function commitInChunks(database: Firestore, operations: Array<(batch: ReturnType<typeof writeBatch>) => void>) {
  for (let index = 0; index < operations.length; index += 400) {
    const batch = writeBatch(database);
    for (const operation of operations.slice(index, index + 400)) operation(batch);
    await batch.commit();
  }
}

async function uploadChanges(database: Firestore, uid: string, state: V8State, cache: SyncCache) {
  const profile = cloudProfile(state);
  const signature = profileSignature(profile);
  if (state.updatedAt >= cache.profileUpdatedAt && signature !== cache.profileSignature) {
    await setDoc(doc(database, "users", uid), profile);
    cache.profileUpdatedAt = profile.updatedAt;
    cache.profileSignature = signature;
  }

  const operations: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
  for (const evidence of state.evidence) {
    if (cache.evidenceIds.has(evidence.id)) continue;
    operations.push((batch) => batch.set(doc(database, "users", uid, "evidence", evidence.id), evidence));
  }
  for (const sketch of state.sketches) {
    const remoteVersion = cache.sketchVersions.get(sketch.id);
    if (remoteVersion && remoteVersion >= sketch.updatedAt) continue;
    operations.push((batch) => batch.set(doc(database, "users", uid, "sketches", sketch.id), cloudSketch(sketch)));
  }
  await commitInChunks(database, operations);
  for (const evidence of state.evidence) cache.evidenceIds.add(evidence.id);
  for (const sketch of state.sketches) cache.sketchVersions.set(sketch.id, sketch.updatedAt);

  for (const [id, deletedAt] of Object.entries(state.deletedSketchIds)) {
    if ((cache.deletionVersions.get(id) ?? "") >= deletedAt) continue;
    await deleteDoc(doc(database, "users", uid, "sketches", id));
    cache.deletionVersions.set(id, deletedAt);
    cache.sketchVersions.delete(id);
  }
}

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const { state, dispatch, hydrated } = useV8Store();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SyncStatus>(CLOUD_CONFIGURED ? "signed-out" : "local-only");
  const [message, setMessage] = useState(CLOUD_CONFIGURED ? "Sign in to synchronise devices." : "Cloud sync is ready for Firebase configuration.");
  const [remoteReady, setRemoteReady] = useState(false);
  const cacheRef = useRef<SyncCache>(emptyCache());
  const uploadingRef = useRef(false);
  const queuedRef = useRef(false);

  useEffect(() => {
    if (!auth) return;
    void getRedirectResult(auth).catch((error: unknown) => {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Google sign-in could not finish.");
    });
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setRemoteReady(false);
      cacheRef.current = emptyCache();
      setStatus(nextUser ? "syncing" : "signed-out");
      setMessage(nextUser ? "Connecting your learning history…" : "Sign in to synchronise devices.");
    });
  }, []);

  useEffect(() => {
    if (!database || !user) return;
    const loaded = new Set<string>();
    const subscriptions: Unsubscribe[] = [];
    const markLoaded = (part: string) => {
      loaded.add(part);
      if (loaded.size === 3) {
        setRemoteReady(true);
        setStatus(navigator.onLine ? "synced" : "offline");
        setMessage(navigator.onLine ? "Progress synchronises across signed-in devices." : "Working offline. Changes will synchronise when connected.");
      }
    };
    subscriptions.push(onSnapshot(doc(database, "users", user.uid), (snapshot) => {
      const profile = snapshot.exists() ? snapshot.data() as CloudProfile : null;
      cacheRef.current.profileUpdatedAt = profile?.updatedAt ?? "";
      cacheRef.current.profileSignature = profile ? profileSignature(profile) : "";
      for (const [id, deletedAt] of Object.entries(profile?.deletedSketchIds ?? {})) cacheRef.current.deletionVersions.set(id, deletedAt);
      dispatch({ type: "mergeCloud", snapshot: { profile } });
      markLoaded("profile");
    }, handleError));
    subscriptions.push(onSnapshot(collection(database, "users", user.uid, "evidence"), (snapshot) => {
      const evidence = snapshot.docs.map((item) => item.data() as CompetencyEvidence);
      cacheRef.current.evidenceIds = new Set(evidence.map((item) => item.id));
      dispatch({ type: "mergeCloud", snapshot: { evidence } });
      markLoaded("evidence");
    }, handleError));
    subscriptions.push(onSnapshot(collection(database, "users", user.uid, "sketches"), (snapshot) => {
      const sketches = snapshot.docs.map((item) => item.data() as Sketch);
      cacheRef.current.sketchVersions = new Map(sketches.map((sketch) => [sketch.id, sketch.updatedAt]));
      dispatch({ type: "mergeCloud", snapshot: { sketches } });
      markLoaded("sketches");
    }, handleError));
    function handleError(error: Error) {
      setStatus("error");
      setMessage(error.message || "Cloud sync is unavailable. Local work remains safe.");
    }
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [user?.uid, dispatch]);

  useEffect(() => {
    const online = () => { if (user) { setStatus("syncing"); setMessage("Connection restored. Synchronising…"); } };
    const offline = () => { setStatus("offline"); setMessage("Working offline. Changes will synchronise when connected."); };
    addEventListener("online", online);
    addEventListener("offline", offline);
    return () => { removeEventListener("online", online); removeEventListener("offline", offline); };
  }, [user]);

  useEffect(() => {
    if (!database || !user || !hydrated || !remoteReady) return;
    const timer = setTimeout(() => {
      if (uploadingRef.current) { queuedRef.current = true; return; }
      uploadingRef.current = true;
      setStatus(navigator.onLine ? "syncing" : "offline");
      void uploadChanges(database, user.uid, state, cacheRef.current)
        .then(() => {
          setStatus(navigator.onLine ? "synced" : "offline");
          setMessage(navigator.onLine ? "All progress is synchronised." : "Saved offline; waiting for a connection.");
        })
        .catch((error: unknown) => {
          setStatus(navigator.onLine ? "error" : "offline");
          setMessage(error instanceof Error ? error.message : "Sync failed. Local work remains safe.");
        })
        .finally(() => {
          uploadingRef.current = false;
          if (queuedRef.current) { queuedRef.current = false; setRemoteReady(false); setTimeout(() => setRemoteReady(true), 0); }
        });
    }, 650);
    return () => clearTimeout(timer);
  }, [state, user?.uid, hydrated, remoteReady]);

  const value = useMemo<CloudValue>(() => ({
    configured: CLOUD_CONFIGURED,
    user,
    status,
    message,
    signIn: async () => {
      if (!auth) throw new Error("Firebase is not configured yet.");
      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    signOut: async () => { if (auth) await firebaseSignOut(auth); }
  }), [user, status, message]);
  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}

export function useCloudSync() {
  const value = useContext(CloudContext);
  if (!value) throw new Error("useCloudSync must be used inside CloudSyncProvider");
  return value;
}
