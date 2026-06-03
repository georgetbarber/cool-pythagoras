export class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5; // Master volume
        this.masterGain.connect(this.ctx.destination);
    }

    /**
     * Converts a MIDI note number to frequency
     * @param {number} midiNote 
     */
    midiToFreq(midiNote) {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }

    /**
     * Plays a single note
     * @param {number} midiNote - The absolute MIDI note value (e.g. low E on guitar is 40)
     * @param {number} duration - Duration in seconds
     */
    playNote(midiNote, duration = 1.5) {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        // Plucked string envelope
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + 0.02); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration); // Decay

        // Slight lowpass filter for guitar-like tone
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;

        // Waveform
        osc.type = 'triangle'; // Closest simple wave to a clean guitar

        osc.frequency.setValueAtTime(this.midiToFreq(midiNote), this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /**
     * Strums a chord (array of MIDI notes)
     * @param {number[]} midiNotes 
     */
    playChord(midiNotes) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const strumDelay = 0.03; // Time between each string
        midiNotes.sort((a, b) => a - b).forEach((note, index) => {
            setTimeout(() => {
                this.playNote(note, 2.0);
            }, index * strumDelay * 1000);
        });
    }
}
