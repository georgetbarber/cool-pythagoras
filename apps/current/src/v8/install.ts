export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: InstallPromptEvent | null = null;
const listeners = new Set<(prompt: InstallPromptEvent | null) => void>();

if (typeof window !== "undefined") {
  addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    listeners.forEach((listener) => listener(deferredPrompt));
  });
  addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((listener) => listener(null));
  });
}

export function currentInstallPrompt() {
  return deferredPrompt;
}

export function subscribeInstallPrompt(listener: (prompt: InstallPromptEvent | null) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export async function showInstallPrompt() {
  if (!deferredPrompt) return "unavailable" as const;
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  listeners.forEach((listener) => listener(null));
  return choice.outcome;
}
