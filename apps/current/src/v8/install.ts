export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: InstallPromptEvent | null = null;
const listeners = new Set<(prompt: InstallPromptEvent | null) => void>();
const standaloneQuery = "(display-mode: standalone)";

export function currentStandaloneMode() {
  if (typeof window === "undefined") return false;
  const iosStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return matchMedia(standaloneQuery).matches || iosStandalone;
}

export function subscribeStandaloneMode(listener: (standalone: boolean) => void) {
  if (typeof window === "undefined") return () => undefined;
  const media = matchMedia(standaloneQuery);
  const notify = () => listener(currentStandaloneMode());
  media.addEventListener("change", notify);
  addEventListener("focus", notify);
  addEventListener("pageshow", notify);
  return () => {
    media.removeEventListener("change", notify);
    removeEventListener("focus", notify);
    removeEventListener("pageshow", notify);
  };
}

if (typeof window !== "undefined") {
  if ("serviceWorker" in navigator) {
    let refreshing = false;
    const requestUpdate = () => {
      void navigator.serviceWorker.getRegistration()
        .then((registration) => registration?.update())
        .catch(() => undefined);
    };
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
    addEventListener("focus", requestUpdate);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") requestUpdate();
    });
  }
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
