export interface SpeechCommand {
  type: "next" | "reveal" | "transpose";
  payload?: string;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
    };
  };
}

interface RecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionConstructor = new () => RecognitionLike;

export class SpeechService {
  private recognition: RecognitionLike | null = null;
  private active = false;

  constructor(private readonly onCommand: (command: SpeechCommand) => void) {
    const windowWithSpeech = window as typeof window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    const Constructor =
      windowWithSpeech.SpeechRecognition ?? windowWithSpeech.webkitSpeechRecognition;
    if (!Constructor) return;

    this.recognition = new Constructor();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";
    this.recognition.onresult = (event) => {
      const transcript =
        event.results[event.resultIndex][0].transcript.toLowerCase().trim();
      if (!transcript.includes("matrix")) return;
      const command = transcript.split("matrix").at(-1)?.trim() ?? "";
      if (command.includes("reveal")) this.onCommand({ type: "reveal" });
      if (command.includes("next")) this.onCommand({ type: "next" });
      if (command.includes("transpose")) {
        this.onCommand({ type: "transpose", payload: command });
      }
    };
    this.recognition.onend = () => {
      if (this.active) this.recognition?.start();
    };
  }

  get supported(): boolean {
    return this.recognition !== null;
  }

  start(): void {
    if (!this.recognition || this.active) return;
    this.active = true;
    this.recognition.start();
  }

  stop(): void {
    this.active = false;
    this.recognition?.stop();
  }
}
