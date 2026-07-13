import type { Sketch, V8State } from "./types";

const DB_NAME = "guitar-academy-v8";
const DB_VERSION = 1;
const STATE_STORE = "state";
const BLOB_STORE = "blobs";
const STATE_KEY = "learner";
const LOCAL_FALLBACK = "guitar-academy-v8-fallback";

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STATE_STORE)) database.createObjectStore(STATE_STORE);
      if (!database.objectStoreNames.contains(BLOB_STORE)) database.createObjectStore(BLOB_STORE);
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

export async function loadPersistedState(): Promise<V8State | null> {
  try {
    const database = await openDatabase();
    const transaction = database.transaction(STATE_STORE, "readonly");
    const value = await requestResult(transaction.objectStore(STATE_STORE).get(STATE_KEY));
    database.close();
    return value as V8State | null;
  } catch {
    try {
      const raw = localStorage.getItem(LOCAL_FALLBACK);
      return raw ? JSON.parse(raw) as V8State : null;
    } catch {
      return null;
    }
  }
}

export async function savePersistedState(state: V8State): Promise<void> {
  localStorage.setItem(LOCAL_FALLBACK, JSON.stringify(state));
  const database = await openDatabase();
  const transaction = database.transaction(STATE_STORE, "readwrite");
  transaction.objectStore(STATE_STORE).put(state, STATE_KEY);
  await new Promise<void>((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("error", () => reject(transaction.error));
  });
  database.close();
}

export async function saveBlob(id: string, blob: Blob): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(BLOB_STORE, "readwrite");
  transaction.objectStore(BLOB_STORE).put(blob, id);
  await new Promise<void>((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("error", () => reject(transaction.error));
  });
  database.close();
}

export async function loadBlob(id: string): Promise<Blob | null> {
  try {
    const database = await openDatabase();
    const transaction = database.transaction(BLOB_STORE, "readonly");
    const value = await requestResult(transaction.objectStore(BLOB_STORE).get(id));
    database.close();
    return value as Blob | null;
  } catch {
    return null;
  }
}

export async function retainedRecordingBytes(state: V8State): Promise<number> {
  const ids = new Set(state.sketches.flatMap((sketch) => sketch.takes.map((take) => take.blobId).filter(Boolean) as string[]));
  let bytes = 0;
  for (const id of ids) bytes += (await loadBlob(id))?.size ?? 0;
  return bytes;
}

export async function clearStoredRecordings(state: V8State): Promise<void> {
  const ids = new Set(state.sketches.flatMap((sketch) => sketch.takes.map((take) => take.blobId).filter(Boolean) as string[]));
  if (!ids.size) return;
  const database = await openDatabase();
  const transaction = database.transaction(BLOB_STORE, "readwrite");
  for (const id of ids) transaction.objectStore(BLOB_STORE).delete(id);
  await new Promise<void>((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("error", () => reject(transaction.error));
  });
  database.close();
}

export async function clearSketchRecordings(sketch: Sketch): Promise<void> {
  const ids = sketch.takes.map((take) => take.blobId).filter(Boolean) as string[];
  if (!ids.length) return;
  const database = await openDatabase();
  const transaction = database.transaction(BLOB_STORE, "readwrite");
  for (const id of ids) transaction.objectStore(BLOB_STORE).delete(id);
  await new Promise<void>((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("error", () => reject(transaction.error));
  });
  database.close();
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const estimate = await navigator.storage.estimate();
  return { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 };
}

interface Archive {
  format: "guitar-academy";
  version: 8;
  exportedAt: string;
  state: V8State;
  recordings: Array<{ id: string; type: string; data: string }>;
}

function blobToData(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function dataToBlob(data: string): Blob {
  const [header, body] = data.split(",");
  const type = /data:(.*?);/.exec(header)?.[1] ?? "application/octet-stream";
  const bytes = Uint8Array.from(atob(body), (value) => value.charCodeAt(0));
  return new Blob([bytes], { type });
}

export async function exportArchive(state: V8State): Promise<Blob> {
  const ids = new Set(state.sketches.flatMap((sketch) => sketch.takes.map((take) => take.blobId).filter(Boolean) as string[]));
  const recordings: Archive["recordings"] = [];
  for (const id of ids) {
    const blob = await loadBlob(id);
    if (blob) recordings.push({ id, type: blob.type, data: await blobToData(blob) });
  }
  const archive: Archive = { format: "guitar-academy", version: 8, exportedAt: new Date().toISOString(), state, recordings };
  return new Blob([JSON.stringify(archive, null, 2)], { type: "application/vnd.guitar-academy+json" });
}

export async function importArchive(file: File): Promise<V8State> {
  const archive = JSON.parse(await file.text()) as Archive;
  if (archive.format !== "guitar-academy" || archive.version !== 8 || archive.state.version !== 8) {
    throw new Error("This is not a supported Guitar Academy V8 archive.");
  }
  for (const recording of archive.recordings ?? []) await saveBlob(recording.id, dataToBlob(recording.data));
  await savePersistedState(archive.state);
  return archive.state;
}

export function newSketch(index: number): Sketch {
  const now = new Date().toISOString();
  return {
    id: `sketch-${Date.now()}-${index}`,
    name: `Untitled sketch ${index + 1}`,
    intention: "Explore one relationship and listen for what it wants to become.",
    tags: [], tempo: 72, metre: "4/4", key: "C", mode: "major",
    chords: [], melody: [], rhythmPattern: "1 & 2 & 3 & 4 &", bassMovement: "",
    sections: ["A"], notes: "", ambiguityNotes: "", takes: [], revisions: [], reflections: [],
    status: "capture", createdAt: now, updatedAt: now
  };
}
