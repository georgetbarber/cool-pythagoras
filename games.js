import { getDiatonicChords } from './diatonic.js';
import { updateFretboard } from './fretboard.js';
import { calculateVoicing } from './voicing.js';
import { getChordNotes, getNoteName, CHROMATIC_SCALE_SIZE } from './engine.js';

export class PracticeController {
    constructor() {
        this.container = document.getElementById('view-games');
        this.fretboardContainer = document.getElementById('practice-fretboard');
        this.promptDisplay = document.getElementById('practice-prompt');
        
        this.btnStart = null;
        this.btnReveal = null;
        this.gradeControls = null;
        
        // SRS State
        this.queue = [];
        this.currentTask = null;
        this.isActive = false;
        
        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="glass-panel" style="padding: 2rem;">
                <div class="game-selector" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                    <button class="nav-btn active" data-game="retrieval">Forced Retrieval</button>
                    <button class="nav-btn" data-game="findnote">Find the Note</button>
                    <button class="nav-btn" data-game="construction">Chord Construction</button>
                </div>

                <div id="game-retrieval" class="game-view" style="display: block;">
                    <div class="panel-header" style="flex-direction: column; align-items: flex-start; margin-bottom: 2rem;">
                        <h2>Forced Retrieval Engine</h2>
                        <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">
                            Physical execution builds motor schemas. Do not look at the answers until you have forced the retrieval.
                        </p>
                    </div>
                    
                    <div class="practice-hud" style="text-align: center; margin-bottom: 2rem;">
                        <div id="practice-prompt" style="font-size: 1.5rem; font-weight: 300; margin-bottom: 1.5rem;">
                            Press Start to begin your audit.
                        </div>
                        
                        <button id="btn-practice-start" class="btn-primary">START SESSION</button>
                        
                        <button id="btn-practice-reveal" class="btn-secondary" style="display: none; margin: 0 auto;">
                            REVEAL MATRIX
                        </button>
                        
                        <div id="practice-grading" style="display: none; justify-content: center; gap: 1rem; margin-top: 1rem;">
                            <button class="btn-grade" data-grade="fail" style="border-color: var(--accent-secondary); color: var(--accent-secondary);">FAIL (Again Soon)</button>
                            <button class="btn-grade" data-grade="hard" style="border-color: var(--accent-primary); color: var(--accent-primary);">HARD (Keep in Rotation)</button>
                            <button class="btn-grade" data-grade="easy" style="border-color: var(--accent-tertiary); color: var(--accent-tertiary);">EASY (Push Back)</button>
                        </div>
                    </div>

                    <div id="practice-fretboard" class="fretboard-container" style="opacity: 0.2; pointer-events: none; transition: opacity 0.5s;"></div>
                </div>

                <div id="game-findnote" class="game-view" style="display: none; text-align: center;">
                    <div class="panel-header" style="flex-direction: column; align-items: flex-start; margin-bottom: 2rem; text-align: left;">
                        <h2>Find the Note: Time Attack</h2>
                        <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">
                            Locate every instance of the target note on the fretboard within 30 seconds.
                        </p>
                    </div>
                    <div id="fn-hud" style="display: flex; justify-content: space-around; font-size: 1.2rem; margin-bottom: 1rem;">
                        <div>Score: <span id="fn-score">0</span></div>
                        <div>Time: <span id="fn-time">30</span>s</div>
                    </div>
                    <div id="fn-prompt" style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem; color: var(--accent-primary);">
                        Press Start
                    </div>
                    <button id="btn-fn-start" class="btn-primary">START 30s DRILL</button>
                    <div id="fn-fretboard" class="fretboard-container" style="opacity: 0.5; margin-top: 2rem; pointer-events: none;"></div>
                </div>

                <div id="game-construction" class="game-view" style="display: none; text-align: center;">
                    <div class="panel-header" style="flex-direction: column; align-items: flex-start; margin-bottom: 2rem; text-align: left;">
                        <h2>Chord Construction Quiz</h2>
                        <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">
                            Assemble the requested chord by clicking the exact intervals on the fretboard.
                        </p>
                    </div>
                    <div id="cc-prompt" style="font-size: 1.5rem; margin-bottom: 1rem;">
                        Build: <strong>-</strong>
                    </div>
                    <div id="cc-status" style="min-height: 1.5rem; margin-bottom: 1rem; color: var(--text-muted);">
                        Waiting to start...
                    </div>
                    <button id="btn-cc-start" class="btn-primary">START QUIZ</button>
                    <button id="btn-cc-submit" class="btn-secondary" style="display: none; margin: 1rem auto;">SUBMIT CHORD</button>
                    <div id="cc-fretboard" class="fretboard-container" style="opacity: 0.5; margin-top: 2rem; pointer-events: none;"></div>
                </div>
            </div>
        `;
        
        this.fretboardContainer = document.getElementById('practice-fretboard');
        this.promptDisplay = document.getElementById('practice-prompt');
        this.btnStart = document.getElementById('btn-practice-start');
        this.btnReveal = document.getElementById('btn-practice-reveal');
        this.gradeControls = document.getElementById('practice-grading');
        
        // Use standard tuning by default for practice
        import('./fretboard.js').then(module => {
            module.initFretboard(this.fretboardContainer, 'standard');
            module.initFretboard(document.getElementById('fn-fretboard'), 'standard');
            module.initFretboard(document.getElementById('cc-fretboard'), 'standard');
        });
    }

    bindEvents() {
        this.btnStart.addEventListener('click', () => this.startSession());
        this.btnReveal.addEventListener('click', () => this.revealMatrix());
        
        this.gradeControls.querySelectorAll('.btn-grade').forEach(btn => {
            btn.addEventListener('click', (e) => this.processGrade(e.target.dataset.grade));
        });

        // Tab Navigation
        this.container.querySelectorAll('.game-selector .nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.container.querySelectorAll('.game-selector .nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                this.container.querySelectorAll('.game-view').forEach(v => v.style.display = 'none');
                const viewId = 'game-' + e.target.dataset.game;
                document.getElementById(viewId).style.display = 'block';
            });
        });

        // Time Attack Bindings
        document.getElementById('btn-fn-start').addEventListener('click', () => this.startFindNoteGame());

        // Chord Construction Bindings
        document.getElementById('btn-cc-start').addEventListener('click', () => this.startChordConstructionGame());
        document.getElementById('btn-cc-submit').addEventListener('click', () => this.submitChordConstruction());

        // Fretboard click delegation for games
        document.getElementById('fn-fretboard').addEventListener('click', (e) => this.handleFindNoteClick(e));
        document.getElementById('cc-fretboard').addEventListener('click', (e) => this.handleChordConstructionClick(e));

        // Listen for Voice Commands (emitted by voice.js)
        window.addEventListener('voice-command', (e) => {
            if (!this.isActive) return;
            const cmd = e.detail.command;
            if (cmd === 'reveal') this.revealMatrix();
            if (cmd === 'next') {
                if (this.gradeControls.style.display !== 'none') {
                    this.processGrade('hard');
                }
            }
        });
    }

    startSession() {
        this.isActive = true;
        this.btnStart.style.display = 'none';
        
        // Generate a queue based on the current key in the Explorer, or default to C Major
        const keyRootSelect = document.getElementById('key-root');
        const rootInt = keyRootSelect ? parseInt(keyRootSelect.value, 10) : 0;
        const keyName = getNoteName(rootInt, false);
        
        const chords = getDiatonicChords(rootInt, false, false);
        this.queue = chords.map(c => ({
            numeral: c.romanNumeral,
            rootInt: c.rootInt,
            quality: c.quality,
            keyName: keyName,
            constraint: this.getRandomConstraint()
        }));
        
        // Shuffle queue
        this.queue.sort(() => Math.random() - 0.5);
        
        this.nextPrompt();
    }

    getRandomConstraint() {
        const regions = [
            'frets 1-5',
            'frets 5-9',
            'frets 7-12'
        ];
        return regions[Math.floor(Math.random() * regions.length)];
    }

    nextPrompt() {
        if (this.queue.length === 0) {
            this.endSession();
            return;
        }
        
        this.currentTask = this.queue.shift();
        
        // Set Prompt
        this.promptDisplay.innerHTML = `Locate the <strong>${this.currentTask.numeral}</strong> chord in <strong>${this.currentTask.keyName} Major</strong>.<br><span style="font-size: 0.8rem; color: var(--text-muted);">Constraint: ${this.currentTask.constraint}</span>`;
        
        // Hide fretboard / Void mode
        this.fretboardContainer.style.opacity = '0.05';
        updateFretboard(this.fretboardContainer, [], null, {}); // Clear it
        
        this.btnReveal.style.display = 'block';
        this.gradeControls.style.display = 'none';
    }

    revealMatrix() {
        if (!this.isActive || !this.currentTask) return;
        
        this.btnReveal.style.display = 'none';
        this.fretboardContainer.style.opacity = '1';
        
        // Calculate the geometry
        const rawNoteInts = getChordNotes(this.currentTask.rootInt, this.currentTask.quality);
        const voicingData = calculateVoicing(rawNoteInts, this.currentTask.rootInt, 'triad'); // Default to Triad constraint for practice
        
        const noteNamesMap = {};
        voicingData.notes.forEach(n => { noteNamesMap[n] = getNoteName(n, false); });
        
        updateFretboard(this.fretboardContainer, voicingData.notes, this.currentTask.rootInt, noteNamesMap, [], {}, voicingData.allowedStrings, voicingData.fretRange);
        
        // Show grading
        this.gradeControls.style.display = 'flex';
    }

    processGrade(grade) {
        if (grade === 'fail') {
            // Re-insert 2 slots away
            this.queue.splice(Math.min(2, this.queue.length), 0, this.currentTask);
        } else if (grade === 'hard') {
            // Re-insert at the end
            this.queue.push(this.currentTask);
        }
        // If 'easy', do nothing (it leaves the queue)
        
        this.nextPrompt();
    }

    // ─── Find the Note: Time Attack ─────────────────────────────────────
    startFindNoteGame() {
        this.fnScore = 0;
        this.fnTimeLeft = 30;
        this.fnActiveTarget = null;
        this.fnFoundCoordinates = new Set(); // store "string-fret"
        
        document.getElementById('fn-score').textContent = this.fnScore;
        document.getElementById('fn-time').textContent = this.fnTimeLeft;
        document.getElementById('btn-fn-start').style.display = 'none';
        
        const fbContainer = document.getElementById('fn-fretboard');
        fbContainer.style.opacity = '1';
        fbContainer.style.pointerEvents = 'auto';

        this.setNewFindNoteTarget();

        this.fnTimer = setInterval(() => {
            this.fnTimeLeft--;
            document.getElementById('fn-time').textContent = this.fnTimeLeft;
            if (this.fnTimeLeft <= 0) {
                this.endFindNoteGame();
            }
        }, 1000);
    }

    setNewFindNoteTarget() {
        this.fnActiveTarget = Math.floor(Math.random() * CHROMATIC_SCALE_SIZE);
        const targetName = getNoteName(this.fnActiveTarget, false);
        document.getElementById('fn-prompt').innerHTML = `Find all: <strong>${targetName}</strong>`;
        this.fnFoundCoordinates.clear();
        updateFretboard(document.getElementById('fn-fretboard'), [], null, {}); // clear fretboard
    }

    handleFindNoteClick(e) {
        const cell = e.target.closest('.fret-cell');
        if (!cell || this.fnTimeLeft <= 0) return;
        
        const noteInt = parseInt(cell.dataset.note, 10);
        const str = cell.dataset.string;
        const fret = cell.dataset.fret;
        const coord = `${str}-${fret}`;

        if (noteInt === this.fnActiveTarget) {
            if (!this.fnFoundCoordinates.has(coord)) {
                this.fnFoundCoordinates.add(coord);
                this.fnScore += 10;
                document.getElementById('fn-score').textContent = this.fnScore;
                
                // visually mark it
                const dot = document.createElement('div');
                dot.className = 'note-dot root-dot'; // use root-dot class for green/primary color
                dot.textContent = getNoteName(noteInt, false);
                cell.appendChild(dot);
                
                // play sound
                if (window.synth) window.synth.playNote(noteInt, 4);

                // check if found all (simplification: assume there are roughly 5-6 instances on fretboard up to fret 15)
                // in standard tuning (15 frets x 6 strings), there are typically 6-8 instances of any note.
                // for rapid gameplay, we'll give them 3 seconds per note then switch, or switch if they hit 5.
                if (this.fnFoundCoordinates.size >= 5) {
                    this.setNewFindNoteTarget();
                    this.fnTimeLeft += 3; // time bonus
                }
            }
        } else {
            this.fnScore = Math.max(0, this.fnScore - 5);
            document.getElementById('fn-score').textContent = this.fnScore;
            // visual error feedback
            cell.style.backgroundColor = 'rgba(244, 63, 94, 0.3)';
            setTimeout(() => cell.style.backgroundColor = '', 300);
        }
    }

    endFindNoteGame() {
        clearInterval(this.fnTimer);
        document.getElementById('fn-prompt').innerHTML = `Game Over! Final Score: <strong>${this.fnScore}</strong>`;
        document.getElementById('btn-fn-start').style.display = 'block';
        document.getElementById('btn-fn-start').textContent = 'PLAY AGAIN';
        
        const fbContainer = document.getElementById('fn-fretboard');
        fbContainer.style.pointerEvents = 'none';
        fbContainer.style.opacity = '0.5';
    }

    // ─── Chord Construction Quiz ─────────────────────────────────────────
    startChordConstructionGame() {
        this.ccActiveRoot = Math.floor(Math.random() * CHROMATIC_SCALE_SIZE);
        const qualities = ['Major', 'Minor', 'Diminished', 'Augmented', 'Dominant 7'];
        this.ccActiveQuality = qualities[Math.floor(Math.random() * qualities.length)];
        
        const rootName = getNoteName(this.ccActiveRoot, false);
        document.getElementById('cc-prompt').innerHTML = `Build: <strong>${rootName} ${this.ccActiveQuality}</strong>`;
        document.getElementById('cc-status').textContent = 'Select notes on the fretboard.';
        
        this.ccSelectedNotes = [];
        this.ccSelectedCells = [];
        
        document.getElementById('btn-cc-start').style.display = 'none';
        document.getElementById('btn-cc-submit').style.display = 'block';
        
        const fbContainer = document.getElementById('cc-fretboard');
        fbContainer.style.opacity = '1';
        fbContainer.style.pointerEvents = 'auto';
        updateFretboard(document.getElementById('cc-fretboard'), [], null, {}); // clear fretboard
    }

    handleChordConstructionClick(e) {
        const cell = e.target.closest('.fret-cell');
        if (!cell) return;
        
        const noteInt = parseInt(cell.dataset.note, 10);
        
        // Check if already selected
        const existingIdx = this.ccSelectedCells.findIndex(c => c === cell);
        if (existingIdx > -1) {
            // Deselect
            this.ccSelectedCells.splice(existingIdx, 1);
            this.ccSelectedNotes.splice(this.ccSelectedNotes.indexOf(noteInt), 1);
            const dot = cell.querySelector('.note-dot');
            if (dot) cell.removeChild(dot);
        } else {
            // Select
            this.ccSelectedCells.push(cell);
            this.ccSelectedNotes.push(noteInt);
            
            const dot = document.createElement('div');
            dot.className = 'note-dot chord-dot';
            dot.textContent = getNoteName(noteInt, false);
            cell.appendChild(dot);
            
            if (window.synth) window.synth.playNote(noteInt, 4);
        }
    }

    submitChordConstruction() {
        const targetNotes = getChordNotes(this.ccActiveRoot, this.ccActiveQuality);
        // User must have selected exactly the target notes (ignoring octaves, so just matching noteInts)
        const uniqueSelected = [...new Set(this.ccSelectedNotes)].sort();
        const uniqueTarget = [...new Set(targetNotes)].sort();
        
        const isCorrect = JSON.stringify(uniqueSelected) === JSON.stringify(uniqueTarget);
        
        const statusEl = document.getElementById('cc-status');
        if (isCorrect) {
            statusEl.innerHTML = '<span style="color: var(--accent-tertiary); font-weight: bold;">Correct! Motor schema validated.</span>';
            if (window.synth) window.synth.playChord(targetNotes, 4);
        } else {
            const correctNames = targetNotes.map(n => getNoteName(n, false)).join(', ');
            statusEl.innerHTML = `<span style="color: var(--accent-secondary); font-weight: bold;">Incorrect. Required notes: ${correctNames}.</span>`;
        }
        
        document.getElementById('btn-cc-start').style.display = 'block';
        document.getElementById('btn-cc-start').textContent = 'NEXT CHORD';
        document.getElementById('btn-cc-submit').style.display = 'none';
        
        document.getElementById('cc-fretboard').style.pointerEvents = 'none';
    }
}
