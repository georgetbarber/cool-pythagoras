import { CHROMATIC_SCALE_SIZE, getChordNotes, getNoteName, CHORD_INTERVAL_NAMES, getScaleNotes, getPentatonicNotes } from './core/engine.js';
import { getDiatonicChords } from './core/diatonic.js';
import { calculateVoicing } from './core/voicing.js';
import { initFretboard, updateFretboard } from './ui/fretboard.js';
import { Router } from './ui/router.js';
import { PracticeController } from './features/games.js';
import { LessonsController } from './features/lessons.js';
import { VoiceController } from './features/voice.js';

// ─── Progression Templates ───────────────────────────────────────────
const MAJOR_PROGRESSIONS = [
    { name: 'Pop Canon',        label: 'I – V – vi – IV',   degrees: ['I', 'V', 'vi', 'IV'] },
    { name: '50s Doo-Wop',      label: 'I – vi – IV – V',   degrees: ['I', 'vi', 'IV', 'V'] },
    { name: 'Blues Turnaround', label: 'I – IV – V',        degrees: ['I', 'IV', 'V'] },
    { name: 'Jazz ii-V-I',      label: 'ii – V – I',        degrees: ['ii', 'V', 'I'] },
    { name: 'Andalusian',       label: 'vi – V – IV – iii', degrees: ['vi', 'V', 'IV', 'iii'] },
    { name: 'Axis',             label: 'I – V – vi – iii – IV', degrees: ['I', 'V', 'vi', 'iii', 'IV'] },
];

const MINOR_PROGRESSIONS = [
    { name: 'Minor Pop',        label: 'i – VI – III – VII', degrees: ['i', 'VI', 'III', 'VII'] },
    { name: 'Aeolian Descent',  label: 'i – VII – VI – V',   degrees: ['i', 'VII', 'VI', 'V'] },
    { name: 'Minor Blues',      label: 'i – iv – v',         degrees: ['i', 'iv', 'v'] },
    { name: 'Emotional',        label: 'i – iv – VI – V',    degrees: ['i', 'iv', 'VI', 'V'] },
    { name: 'Classic Minor',    label: 'i – iv – i – V',     degrees: ['i', 'iv', 'i', 'V'] },
];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Subsystems
    const router = new Router();
    const practice = new PracticeController();
    const lessons = new LessonsController();
    const voice = new VoiceController();
    // Start listening globally for the wake word
    voice.start();

    // ─── Element References ──────────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    const keyRootSelect = document.getElementById('key-root');
    const keyTypeSelect = document.getElementById('key-type');
    const focusModeToggle = document.getElementById('focus-mode');
    const textureToggle = document.getElementById('texture-toggle');
    const extendedToggle = document.getElementById('extended-toggle');
    const chromaticOverrideToggle = document.getElementById('chromatic-override');
    const btnRelFlip = document.getElementById('btn-rel-flip');
    
    const showScaleToggle = document.getElementById('show-scale');
    const pentatonicToggle = document.getElementById('pentatonic-toggle');
    const cagedToggle = document.getElementById('caged-toggle');
    const perimeterToggle = document.getElementById('perimeter-toggle');
    
    const chordRootSelect = document.getElementById('chord-root');
    const chordQualitySelect = document.getElementById('chord-quality');
    const voicingModeSelect = document.getElementById('voicing-mode');
    
    const diatonicTableContainer = document.getElementById('diatonic-table');
    const chromaticTableContainer = document.getElementById('chromatic-table');
    const chromaticPanel = document.getElementById('chromatic-panel');
    const extendedTableContainer = document.getElementById('extended-table');
    const extendedPanel = document.getElementById('extended-panel');
    const fretboardContainer = document.getElementById('fretboard');
    const chordDnaContainer = document.getElementById('chord-dna');
    const progressionsContainer = document.getElementById('progressions');
    const noteCountBadge = document.getElementById('note-count-badge');
    
    const tuningSelect = document.getElementById('tuning-select');
    const btnPlayActive = document.getElementById('btn-play-active');
    
    const btnResetSort = document.getElementById('btn-reset-sort');

    // ─── Initialization ──────────────────────────────────────────────
    function populateRoots(selectElem) {
        selectElem.innerHTML = '';
        for (let i = 0; i < CHROMATIC_SCALE_SIZE; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = getNoteName(i, false); 
            selectElem.appendChild(option);
        }
    }

    populateRoots(keyRootSelect);
    populateRoots(chordRootSelect);
    
    // Initialize Fretboard DOM structure
    initFretboard(fretboardContainer, tuningSelect.value);

    // ─── Event Listeners ─────────────────────────────────────────────
    
    const reRender = () => {
        renderDiatonic();
        illuminateActiveChord();
    };

    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
        }
    });

    tuningSelect.addEventListener('change', () => {
        initFretboard(fretboardContainer, tuningSelect.value);
        illuminateActiveChord();
    });

    keyRootSelect.addEventListener('change', () => {
        renderDiatonic();
        renderProgressions();
        illuminateActiveChord();
    });
    
    keyTypeSelect.addEventListener('change', () => {
        renderDiatonic();
        renderProgressions();
        illuminateActiveChord();
    });
    
    if (focusModeToggle) focusModeToggle.addEventListener('change', reRender);
    if (textureToggle) textureToggle.addEventListener('change', reRender);
    
    if (chromaticOverrideToggle) {
        chromaticOverrideToggle.addEventListener('change', () => {
            if (chromaticOverrideToggle.checked) {
                chromaticPanel.style.display = 'flex';
            } else {
                chromaticPanel.style.display = 'none';
            }
            renderDiatonic();
            illuminateActiveChord();
        });
    }

    if (extendedToggle) {
        extendedToggle.addEventListener('change', () => {
            if (extendedToggle.checked) {
                extendedPanel.style.display = 'flex';
            } else {
                extendedPanel.style.display = 'none';
            }
            renderDiatonic();
            illuminateActiveChord();
        });
    }

    btnRelFlip.addEventListener('click', () => {
        const rootInt = parseInt(keyRootSelect.value, 10);
        const keyMode = keyTypeSelect.value;
        const isMinor = (keyMode === 'minor' || keyMode === 'dorian' || keyMode === 'phrygian');
        
        let newRootInt;
        let newKeyMode;
        if (isMinor) {
            newRootInt = (rootInt + 3) % 12;
            newKeyMode = 'major';
        } else {
            newRootInt = (rootInt + 9) % 12;
            newKeyMode = 'minor';
        }
        
        const newIsMinor = (newKeyMode === 'minor' || newKeyMode === 'dorian' || newKeyMode === 'phrygian');
        keyRootSelect.value = newRootInt;
        keyTypeSelect.value = newKeyMode;
        renderDiatonic();
        renderProgressions();
        illuminateActiveChord();
    });

    showScaleToggle.addEventListener('change', (e) => {
        pentatonicToggle.disabled = !e.target.checked;
        illuminateActiveChord();
    });
    
    pentatonicToggle.addEventListener('change', illuminateActiveChord);
    cagedToggle.addEventListener('change', illuminateActiveChord);
    if (perimeterToggle) perimeterToggle.addEventListener('change', illuminateActiveChord);

    chordRootSelect.addEventListener('change', illuminateActiveChord);
    chordQualitySelect.addEventListener('change', illuminateActiveChord);
    voicingModeSelect.addEventListener('change', illuminateActiveChord);

    btnPlayActive.addEventListener('click', () => {
        const activeCells = document.querySelectorAll('.fret-cell.active');
        const voicingMidi = [];
        for (let s = 5; s >= 0; s--) {
            let lowestNoteOnString = Infinity;
            activeCells.forEach(cell => {
                if (parseInt(cell.dataset.string, 10) === s) {
                    const midi = parseInt(cell.dataset.midi, 10);
                    if (midi < lowestNoteOnString) lowestNoteOnString = midi;
                }
            });
            if (lowestNoteOnString !== Infinity) voicingMidi.push(lowestNoteOnString);
        }

        if (window.synth && voicingMidi.length > 0) {
            window.synth.playChord(voicingMidi);
        }
    });

    let currentSortColumn = null;
    let currentSortDirection = 1;

    if (btnResetSort) {
        btnResetSort.addEventListener('click', () => {
            currentSortColumn = null;
            currentSortDirection = 1;
            renderDiatonic();
            illuminateActiveChord();
        });
    }

    window.addEventListener('voice-command', (e) => {
        const cmd = e.detail.command;
        if (cmd === 'transpose') {
            const payload = e.detail.payload || "";
            const match = payload.match(/to\s+([a-g](?:[#b]|sharp|flat)?)\s*(major|minor)?/i);
            if (match) {
                let noteStr = match[1].toLowerCase()
                    .replace('sharp', '#')
                    .replace('flat', 'b');
                
                let foundInt = -1;
                for (let i = 0; i < 12; i++) {
                    if (getNoteName(i, false).toLowerCase() === noteStr || getNoteName(i, true).toLowerCase() === noteStr) {
                        foundInt = i;
                        break;
                    }
                }
                
                if (foundInt !== -1) {
                    keyRootSelect.value = foundInt;
                    const type = match[2] ? match[2].toLowerCase() : 'major';
                    keyTypeSelect.value = type;
                    
                    const keyMode = type;
                    const isMinor = (keyMode === 'minor' || keyMode === 'dorian' || keyMode === 'phrygian');
                    
                    renderDiatonic();
                    renderProgressions();
                    illuminateActiveChord();
                    console.log(`Voice Transposed to ${getNoteName(foundInt, false)} ${type}`);
                }
            }
        }
    });

    // ─── 12-Tone Serialism Matrix ────────────────────────────────────
    const primeRowInput = document.getElementById('prime-row-input');
    const btnGenerateMatrix = document.getElementById('btn-generate-matrix');
    const serialismMatrixContainer = document.getElementById('serialism-matrix-container');

    if (btnGenerateMatrix) {
        btnGenerateMatrix.addEventListener('click', () => {
            const inputStr = primeRowInput.value.trim();
            const primeRow = inputStr.split(/\s+/).map(x => parseInt(x, 10)).filter(x => !isNaN(x) && x >= 0 && x <= 11);
            if (primeRow.length !== 12 || new Set(primeRow).size !== 12) {
                serialismMatrixContainer.innerHTML = '<p style="color: #ff4444;">Error: Must enter exactly 12 unique integers (0-11).</p>';
                return;
            }

            const matrix = [];
            for (let i = 0; i < 12; i++) {
                matrix[i] = new Array(12).fill(0);
            }
            
            for (let j = 0; j < 12; j++) {
                matrix[0][j] = primeRow[j];
            }

            const first = primeRow[0];
            for (let i = 0; i < 12; i++) {
                matrix[i][0] = (first + (first - primeRow[i]) + 12) % 12;
            }

            for (let i = 1; i < 12; i++) {
                const diff = (matrix[i][0] - matrix[0][0] + 12) % 12;
                for (let j = 1; j < 12; j++) {
                    matrix[i][j] = (matrix[0][j] + diff) % 12;
                }
            }

            let html = '<table style="width: 100%; max-width: 600px; border-collapse: collapse; text-align: center; font-family: monospace;">';
            html += '<tr><th></th>';
            for (let j=0; j<12; j++) html += `<th style="color: var(--accent-secondary); padding: 0.5rem; font-size: 0.8rem;">I${j}</th>`;
            html += '<th></th></tr>';

            for (let i = 0; i < 12; i++) {
                html += `<tr><th style="color: var(--accent-primary); padding: 0.5rem; border-right: 1px solid var(--glass-border); font-size: 0.8rem;">P${i}</th>`;
                for (let j = 0; j < 12; j++) {
                    html += `<td style="padding: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02);">${matrix[i][j]}</td>`;
                }
                html += `<th style="color: var(--text-muted); padding: 0.5rem; border-left: 1px solid var(--glass-border); font-size: 0.8rem;">R${i}</th></tr>`;
            }
            
            html += '<tr><th></th>';
            for (let j=0; j<12; j++) html += `<th style="color: var(--text-muted); padding: 0.5rem; font-size: 0.8rem;">RI${j}</th>`;
            html += '<th></th></tr>';
            html += '</table>';
            
            serialismMatrixContainer.innerHTML = html;
        });
        
        // Auto-generate on load if elements exist
        btnGenerateMatrix.click();
    }

    // ─── Diatonic Table ──────────────────────────────────────────────
    function renderDiatonic() {
        const rootInt = parseInt(keyRootSelect.value, 10);
        const keyMode = keyTypeSelect.value;
        const isFocus = focusModeToggle && focusModeToggle.checked;
        const isTexture = textureToggle && textureToggle.checked;
        const isChromatic = chromaticOverrideToggle && chromaticOverrideToggle.checked;

        // Fetch all 24+ units
        const allChords = getDiatonicChords(rootInt, keyMode, false, true);

        // Separate Diatonic and Foreign, ignoring Extended if toggle is off
        let diatonicChords = allChords.filter(c => !c.isForeign && !c.isExtended && c.is7th === isTexture);
        let chromaticChords = allChords.filter(c => c.isForeign && !c.isExtended && c.is7th === isTexture);
        let extendedChords = allChords.filter(c => c.isExtended);

        // Focus Mode Filter (only applies to Diatonic Seven and Extended)
        if (isFocus) {
            diatonicChords = diatonicChords.filter(c => c.isFocus);
            extendedChords = extendedChords.filter(c => c.isFocus);
        }

        if (currentSortColumn) {
            const sortFn = (a, b) => {
                let valA, valB;
                if (currentSortColumn === 'numeral') { valA = a.romanNumeral; valB = b.romanNumeral; }
                if (currentSortColumn === 'root') { valA = a.rootSpelling; valB = b.rootSpelling; }
                if (currentSortColumn === 'quality') { valA = a.quality; valB = b.quality; }
                if (currentSortColumn === 'function') { valA = a.functionWord; valB = b.functionWord; }
                if (currentSortColumn === 'state') { valA = a.state; valB = b.state; }
                
                if (valA < valB) return -1 * currentSortDirection;
                if (valA > valB) return 1 * currentSortDirection;
                return 0;
            };
            diatonicChords.sort(sortFn);
            chromaticChords.sort(sortFn);
            extendedChords.sort(sortFn);
        }

        const buildTableHTML = (chordsArray) => {
            if (chordsArray.length === 0) return '';
            
            const getSortIcon = (col) => {
                if (currentSortColumn !== col) return '';
                return currentSortDirection === 1 ? ' ▲' : ' ▼';
            };

            let html = `
                <table>
                    <thead>
                        <tr>
                            <th class="sortable-th" data-col="numeral">Numeral${getSortIcon('numeral')}</th>
                            <th class="sortable-th" data-col="root">Root${getSortIcon('root')}</th>
                            <th class="sortable-th" data-col="quality">Quality${getSortIcon('quality')}</th>
                            <th class="sortable-th" data-col="function">Function${getSortIcon('function')}</th>
                            <th class="sortable-th" data-col="state">State${getSortIcon('state')}</th>
                            <th>Intervals</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            chordsArray.forEach((chord) => {
                const intervals = CHORD_INTERVAL_NAMES[chord.quality]
                    ? CHORD_INTERVAL_NAMES[chord.quality].join(', ')
                    : '';
                
                let baseState = 'stability';
                if (chord.state.includes('Departure')) baseState = 'departure';
                else if (chord.state.includes('Tension')) baseState = 'tension';
                
                html += `
                    <tr data-root="${chord.rootInt}" data-quality="${chord.quality}">
                        <td class="numeral-cell">${chord.romanNumeral}</td>
                        <td><strong>${chord.rootSpelling}</strong></td>
                        <td>${chord.quality}</td>
                        <td class="function-cell">${chord.functionWord}</td>
                        <td class="state-cell"><span class="state-badge state-${baseState}">${chord.state}</span></td>
                        <td class="intervals-cell">${intervals}</td>
                        <td>
                            <button class="btn-play-chord" data-root="${chord.rootInt}" data-quality="${chord.quality}">
                                Select
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;
            return html;
        };

        diatonicTableContainer.innerHTML = buildTableHTML(diatonicChords);
        chromaticTableContainer.innerHTML = buildTableHTML(chromaticChords);
        extendedTableContainer.innerHTML = buildTableHTML(extendedChords);

        const bindSelectBtns = (container) => {
            const selectBtns = container.querySelectorAll('.btn-play-chord');
            selectBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const rInt = parseInt(e.target.dataset.root, 10);
                    const q = e.target.dataset.quality;
                    
                    chordRootSelect.value = rInt;
                    const validQualities = Array.from(chordQualitySelect.options).map(o => o.value);
                    if (validQualities.includes(q)) chordQualitySelect.value = q;

                    highlightDiatonicRow(rInt, q);
                    illuminateActiveChord();
                });
            });
        };

        bindSelectBtns(diatonicTableContainer);
        bindSelectBtns(chromaticTableContainer);
        bindSelectBtns(extendedTableContainer);

        const bindSortBtns = (container) => {
            const ths = container.querySelectorAll('.sortable-th');
            ths.forEach(th => {
                th.addEventListener('click', (e) => {
                    const col = e.currentTarget.dataset.col;
                    if (currentSortColumn === col) {
                        currentSortDirection *= -1; // toggle
                    } else {
                        currentSortColumn = col;
                        currentSortDirection = 1;
                    }
                    renderDiatonic();
                    illuminateActiveChord();
                });
            });
        };
        bindSortBtns(diatonicTableContainer);
        bindSortBtns(chromaticTableContainer);
        bindSortBtns(extendedTableContainer);
    }

    function highlightDiatonicRow(rInt, q) {
        diatonicTableContainer.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
        chromaticTableContainer.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
        extendedTableContainer.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
        
        if (rInt !== null && q !== null) {
            const diatonicRow = diatonicTableContainer.querySelector(`tr[data-root="${rInt}"][data-quality="${q}"]`);
            if (diatonicRow) diatonicRow.classList.add('selected-row');
            
            const chromaticRow = chromaticTableContainer.querySelector(`tr[data-root="${rInt}"][data-quality="${q}"]`);
            if (chromaticRow) chromaticRow.classList.add('selected-row');
            
            const extendedRow = extendedTableContainer.querySelector(`tr[data-root="${rInt}"][data-quality="${q}"]`);
            if (extendedRow) extendedRow.classList.add('selected-row');
        }
    }

    // ─── Chord Progressions ──────────────────────────────────────────
    function renderProgressions() {
        const keyMode = keyTypeSelect.value;
        const isMinor = (keyMode === 'minor' || keyMode === 'dorian' || keyMode === 'phrygian');
        const templates = isMinor ? MINOR_PROGRESSIONS : MAJOR_PROGRESSIONS;

        let html = '<div class="progression-chips">';
        templates.forEach((prog, index) => {
            html += `
                <button class="progression-chip" data-prog-index="${index}" title="${prog.name}">
                    <span class="prog-name">${prog.name}</span>
                    <span class="prog-label">${prog.label}</span>
                </button>
            `;
        });
        html += '</div><div id="progression-timeline" style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;"></div>';

        progressionsContainer.innerHTML = html;
        const timelineContainer = document.getElementById('progression-timeline');

        progressionsContainer.querySelectorAll('.progression-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.progIndex, 10);
                const prog = templates[idx];

                progressionsContainer.querySelectorAll('.progression-chip').forEach(c => c.classList.remove('active-chip'));
                e.currentTarget.classList.add('active-chip');

                const rootInt = parseInt(keyRootSelect.value, 10);
                const isTexture = textureToggle && textureToggle.checked;
                const allChords = getDiatonicChords(rootInt, keyMode, false, true);

                const getTargetChord = (numeral) => {
                    const baseChord = allChords.find(c => c.romanNumeral === numeral && c.is7th === false);
                    if (baseChord) {
                        return allChords.find(c => c.rootInt === baseChord.rootInt && c.is7th === isTexture && !c.isForeign === !baseChord.isForeign) || baseChord;
                    }
                    return null;
                };

                const firstChord = getTargetChord(prog.degrees[0]);
                if (firstChord) {
                    chordRootSelect.value = firstChord.rootInt;
                    const validQualities = Array.from(chordQualitySelect.options).map(o => o.value);
                    if (validQualities.includes(firstChord.quality)) {
                        chordQualitySelect.value = firstChord.quality;
                    }
                    highlightDiatonicRow(firstChord.rootInt, firstChord.quality);
                    illuminateActiveChord();
                }

                diatonicTableContainer.querySelectorAll('tr').forEach(r => r.classList.remove('progression-highlight'));
                chromaticTableContainer.querySelectorAll('tr').forEach(r => r.classList.remove('progression-highlight'));
                
                let timelineHtml = '';
                prog.degrees.forEach(numeral => {
                    const chord = getTargetChord(numeral);
                    if (chord) {
                        timelineHtml += `
                            <button class="btn-timeline-block" data-root="${chord.rootInt}" data-quality="${chord.quality}" style="padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--accent-primary); background: rgba(255,255,255,0.05); color: var(--text-primary); cursor: pointer; text-align: center;">
                                <strong>${chord.romanNumeral}</strong><br>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);">${chord.rootSpelling} ${chord.quality}</span>
                            </button>
                        `;

                        const row1 = diatonicTableContainer.querySelector(`tr[data-root="${chord.rootInt}"][data-quality="${chord.quality}"]`);
                        if (row1) row1.classList.add('progression-highlight');
                        const row2 = chromaticTableContainer.querySelector(`tr[data-root="${chord.rootInt}"][data-quality="${chord.quality}"]`);
                        if (row2) row2.classList.add('progression-highlight');
                    }
                });
                
                timelineContainer.innerHTML = timelineHtml;
                
                timelineContainer.querySelectorAll('.btn-timeline-block').forEach((btn, idx) => {
                    if (idx === 0) {
                        btn.style.background = 'var(--accent-primary)';
                        btn.style.color = '#000';
                    }
                    btn.addEventListener('click', (ev) => {
                        const rInt = parseInt(ev.currentTarget.dataset.root, 10);
                        const q = ev.currentTarget.dataset.quality;
                        
                        chordRootSelect.value = rInt;
                        const validQualities = Array.from(chordQualitySelect.options).map(o => o.value);
                        if (validQualities.includes(q)) chordQualitySelect.value = q;
                        
                        highlightDiatonicRow(rInt, q);
                        illuminateActiveChord();
                        
                        timelineContainer.querySelectorAll('.btn-timeline-block').forEach(b => {
                            b.style.background = 'rgba(255,255,255,0.05)';
                            b.style.color = 'var(--text-primary)';
                        });
                        ev.currentTarget.style.background = 'var(--accent-primary)';
                        ev.currentTarget.style.color = '#000';
                    });
                });
            });
        });
    }

    // ─── Chord DNA Panel ─────────────────────────────────────────────
    function renderChordDna(rawNoteInts, activeNoteInts, quality, isFlatContext, allIntervalNames) {
        let html = '<div class="dna-pills">';
        rawNoteInts.forEach((noteInt, index) => {
            const isOmitted = !activeNoteInts.includes(noteInt);
            const noteName = getNoteName(noteInt, isFlatContext);
            const intervalLabel = allIntervalNames[index] || '?';
            const isRoot = index === 0;
            
            let pillClass = 'dna-pill';
            if (isRoot) pillClass += ' root-pill';
            if (isOmitted) pillClass += ' omitted-pill';
            
            const omittedStyle = isOmitted ? 'style="opacity: 0.4; border-style: dashed;" title="Omitted for physical voicing constraints"' : '';
            
            html += `
                <div class="${pillClass}" ${omittedStyle}>
                    <span class="dna-note">${noteName}</span>
                    <span class="dna-interval">${intervalLabel}</span>
                </div>
            `;
        });
        html += '</div>';

        const rootName = getNoteName(rawNoteInts[0], isFlatContext);
        html += `<p class="dna-summary">${rootName} ${quality} — mapped to physical fret geometry.</p>`;
        
        const droppedCount = rawNoteInts.length - activeNoteInts.length;
        if (droppedCount > 0) {
            html += `<p style="font-size: 0.8rem; color: var(--accent-secondary); margin-top: 0.5rem;">Geometrist Override: ${droppedCount} interval(s) omitted to enforce physical fretboard playability.</p>`;
        }

        chordDnaContainer.innerHTML = html;
    }

    // ─── Fretboard Illumination ──────────────────────────────────────
    function illuminateActiveChord() {
        const rootInt = parseInt(chordRootSelect.value, 10);
        const quality = chordQualitySelect.value;
        const voicingMode = voicingModeSelect.value;
        
        const keyRootInt = parseInt(keyRootSelect.value, 10);
        const keyMode = keyTypeSelect.value;
        const isMinor = (keyMode === 'minor' || keyMode === 'dorian' || keyMode === 'phrygian');
        
        const flatRootsMajor = [5, 10, 3, 8, 1, 6];
        const flatRootsMinor = [2, 7, 0, 5, 10, 3];
        const isFlatContext = isMinor ? flatRootsMinor.includes(keyRootInt) : flatRootsMajor.includes(keyRootInt);

        try {
            const rawNoteInts = getChordNotes(rootInt, quality);
            // Apply Voicing Engine
            const voicingData = calculateVoicing(rawNoteInts, rootInt, voicingMode);
            const activeNoteInts = voicingData.notes;
            const allowedStrings = voicingData.allowedStrings;
            
            // Bypass Eustress Perimeter if toggle is disabled
            const fretRange = (perimeterToggle && !perimeterToggle.checked) ? null : voicingData.fretRange;

            const allIntervalNames = CHORD_INTERVAL_NAMES[quality] || [];
            const noteNamesMap = {};
            activeNoteInts.forEach(n => {
                const idx = rawNoteInts.indexOf(n);
                noteNamesMap[n] = allIntervalNames[idx] || '?';
            });

            let scaleNoteInts = [];
            let scaleNamesMap = {};
            if (showScaleToggle.checked) {
                if (pentatonicToggle.checked) {
                    scaleNoteInts = getPentatonicNotes(keyRootInt, isMinor);
                } else {
                    scaleNoteInts = getScaleNotes(keyRootInt, isMinor);
                }
                
                // Keep scale intervals relative to key root if we want, or just hide them. 
                // Since this is macroeconomic function, absolute pitches are banned. Let's use scale degrees.
                const scaleIntervals = ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'];
                scaleNoteInts.forEach(n => {
                    let diff = (n - keyRootInt + 12) % 12;
                    scaleNamesMap[n] = scaleIntervals[diff];
                });
            }

            const activeCount = updateFretboard(fretboardContainer, activeNoteInts, rootInt, noteNamesMap, scaleNoteInts, scaleNamesMap, allowedStrings, fretRange);

            if (cagedToggle.checked) {
                document.getElementById('fretboard').classList.add('caged-mode');
            } else {
                document.getElementById('fretboard').classList.remove('caged-mode');
            }

            noteCountBadge.textContent = `${activeCount} positions`;

            renderChordDna(rawNoteInts, activeNoteInts, quality, isFlatContext, allIntervalNames);

            // Rationale Readout Logic
            const allChords = getDiatonicChords(keyRootInt, keyMode, false, true); // Get all mapped chords
            const match = allChords.find(c => c.rootInt === rootInt && c.quality === quality);
            
            const rationaleElem = document.getElementById('rationale-readout');
            if (rationaleElem) {
                if (match) {
                    rationaleElem.style.display = 'block';
                    const prefix = match.isForeign ? 'Foreign Exchange' : 'Domestic Structure';
                    rationaleElem.innerHTML = `<strong>${match.romanNumeral} (${prefix}):</strong> ${match.rationale}`;
                } else {
                    rationaleElem.style.display = 'block';
                    rationaleElem.innerHTML = `<strong>Exogenous Asset:</strong> Unmapped chromatic tension outside the standard structural exchange.`;
                }
            }

            // Highlight corresponding row in diatonic table if it's currently rendered
            const currentMatchIndex = allChords.findIndex(c => c.rootInt === rootInt && c.quality === quality);
            if (currentMatchIndex !== -1) {
                const c = allChords[currentMatchIndex];
                highlightDiatonicRow(c.rootInt, c.quality);
            } else {
                highlightDiatonicRow(null, null);
            }

        } catch (error) {
            console.error('Error illuminating chord:', error);
        }
    }

    // ─── Initial Render ──────────────────────────────────────────────
    renderDiatonic();
    renderProgressions();
    illuminateActiveChord();
});
