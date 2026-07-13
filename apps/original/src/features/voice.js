export class VoiceController {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        
        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true; // Keep listening
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            console.log("Voice Controller Active. Waiting for Wake Word: 'Matrix'");
        };

        this.recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript.trim().toLowerCase();
            console.log("Heard:", transcript);
            
            this.processCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.warn("Speech Recognition Error:", event.error);
        };

        this.recognition.onend = () => {
            // Auto-restart if it dies
            if (this.isListening) {
                try {
                    this.recognition.start();
                } catch(e) {}
            }
        };
    }

    start() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch(e) {}
        }
    }

    stop() {
        this.isListening = false;
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    processCommand(transcript) {
        // Strict Wake Word Protocol: Must start with or contain "matrix"
        if (!transcript.includes("matrix")) return;
        
        // Remove 'matrix' and punctuation to parse the actual command
        const commandStr = transcript.replace(/[^a-z0-9 ]/g, "").split("matrix")[1]?.trim() || "";
        
        if (!commandStr) return;

        if (commandStr.includes("reveal")) {
            this.emit('reveal');
        } else if (commandStr.includes("next")) {
            this.emit('next');
        } else if (commandStr.includes("transpose")) {
            // Rough parsing for "Transpose to A Minor"
            this.emit('transpose', commandStr);
        }
    }

    emit(action, payload = null) {
        const event = new CustomEvent('voice-command', {
            detail: { command: action, payload: payload }
        });
        window.dispatchEvent(event);
    }
}
