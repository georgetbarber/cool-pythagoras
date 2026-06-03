export class LessonsController {
    constructor() {
        this.container = document.getElementById('view-lessons');
        this.initDOM();
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="glass-panel">
                <div class="panel-header">
                    <h2>Guided Lesson Paths</h2>
                </div>
                
                <div class="lesson-list">
                    
                    <div class="lesson-card">
                        <div class="lesson-status done">✔</div>
                        <div class="lesson-content">
                            <h3>1. The Musical Alphabet & Enharmonics</h3>
                            <p>Understand the 12 chromatic notes and why F# is exactly the same physical fret as Gb.</p>
                            <button class="btn-outline">Review Lesson</button>
                        </div>
                    </div>

                    <div class="lesson-card">
                        <div class="lesson-status active">▶</div>
                        <div class="lesson-content">
                            <h3>2. Building Major & Minor Chords</h3>
                            <p>Learn how stacking intervals (1, 3, 5 vs 1, b3, 5) fundamentally alters the emotional DNA of a chord.</p>
                            <button class="btn-primary">Start Lesson</button>
                        </div>
                    </div>

                    <div class="lesson-card">
                        <div class="lesson-status locked">🔒</div>
                        <div class="lesson-content">
                            <h3>3. The CAGED System</h3>
                            <p>Unlock the fretboard by realizing there are only 5 physical shapes that repeat endlessly.</p>
                            <button class="btn-outline" disabled>Locked</button>
                        </div>
                    </div>

                </div>
            </div>

            <style>
                .lesson-list { display: flex; flex-direction: column; gap: 1rem; }
                .lesson-card { display: flex; gap: 1.5rem; align-items: flex-start; background: rgba(0,0,0,0.05); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--glass-border); }
                .theme-dark .lesson-card { background: rgba(255,255,255,0.03); }
                .lesson-status { font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; background: var(--bg-base); flex-shrink: 0; }
                .lesson-status.done { color: var(--accent-tertiary); }
                .lesson-status.active { color: #fff; background: var(--accent-primary); box-shadow: 0 0 15px var(--accent-glow); }
                .lesson-status.locked { color: var(--text-muted); opacity: 0.5; }
                .lesson-content h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
                .lesson-content p { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; }
            </style>
        `;
    }
}
