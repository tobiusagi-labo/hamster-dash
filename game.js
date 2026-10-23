/**
 * ハムダッシュ！ (Hamster Dash)
 * スマホ縦画面・タップ高速直線移動アクションゲーム
 */

(() => {
  'use strict';

  // --- DOM Elements ---
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const hud = document.getElementById('hud');
  const scoreValEl = document.getElementById('score-val');
  const comboBadge = document.getElementById('combo-badge');
  const comboCountEl = document.getElementById('combo-count');
  const soundBtn = document.getElementById('sound-btn');
  const menuBtn = document.getElementById('menu-btn');
  const timeTextEl = document.getElementById('time-text');
  const timerBarFill = document.getElementById('timer-bar-fill');

  const titleScreen = document.getElementById('title-screen');
  const modeSelectScreen = document.getElementById('mode-select-screen');
  const howtoModal = document.getElementById('howto-modal');
  const statsModal = document.getElementById('stats-modal');
  const pauseModal = document.getElementById('pause-modal');
  const gameoverScreen = document.getElementById('gameover-screen');

  const volumeSlider = document.getElementById('volume-slider');
  const volumeValEl = document.getElementById('volume-val');
  const btnPauseMute = document.getElementById('btn-pause-mute');
  const btnPauseResume = document.getElementById('btn-pause-resume');
  const btnPauseRestart = document.getElementById('btn-pause-restart');
  const btnPauseTitle = document.getElementById('btn-pause-title');

  const titleHeroCanvas = document.getElementById('title-hero-canvas');
  const hubHamsterCanvas = document.getElementById('hub-hamster-canvas');
  const resultIllustCanvas = document.getElementById('result-illust-canvas');

  const bestSurvivalEl = document.getElementById('best-survival');
  const bestTimeattackEl = document.getElementById('best-timeattack');
  const totalFoodsValEl = document.getElementById('total-foods-val');
  const longestTimeValEl = document.getElementById('longest-time-val');
  const alltimeComboValEl = document.getElementById('alltime-combo-val');
  const totalPlaysValEl = document.getElementById('total-plays-val');
  const historyListEl = document.getElementById('history-list');

  const btnSurvival = document.getElementById('btn-survival');
  const btnTimeattack = document.getElementById('btn-timeattack');
  const btnHowto = document.getElementById('btn-howto');
  const btnCloseHowto = document.getElementById('btn-close-howto');
  const btnStats = document.getElementById('btn-stats');
  const btnCloseStats = document.getElementById('btn-close-stats');
  const btnRetry = document.getElementById('btn-retry');
  const btnHome = document.getElementById('btn-home');

  const hubCard = document.getElementById('hub-card');
  const roomCurrentBadge = document.getElementById('room-current-badge');
  const hubSubText = document.getElementById('hub-sub-text');
  const btnRoomToggle = document.getElementById('btn-room-toggle');
  const pillLiving = document.getElementById('pill-living');
  const pillRhythm = document.getElementById('pill-rhythm');
  const hubCenterHamster = document.getElementById('hub-center-hamster');
  const rhythmTrackBadge = document.getElementById('rhythm-track-badge');
  const rhythmTrackNameEl = document.getElementById('rhythm-track-name');
  const rhythmTrackBpmEl = document.getElementById('rhythm-track-bpm');
  const livingOptionBadge = document.getElementById('living-option-badge');
  const livingOptionTextEl = document.getElementById('living-option-text');

  const POP_FONT = '"Mochiy Pop One", "M PLUS Rounded 1c", "Hiragino Maru Gothic ProN", sans-serif';

  // --- Asset Manager (Custom Image / Sound Loader with Built-in Fallbacks) ---
  class AssetManager {
    constructor() {
      this.images = {};
      this.sounds = {};
      this.initImageLoaders();
      this.initSoundLoaders();
    }

    initImageLoaders() {
      const imageFiles = {
        player: 'assets/images/player.png',
        seed: 'assets/images/seed.png',
        cheese: 'assets/images/cheese.png',
        gold: 'assets/images/gold.png',
        vacuum: 'assets/images/vacuum.png',
        yarn: 'assets/images/yarn.png',
        cat_paw: 'assets/images/cat_paw.png',
        title_mascot: 'assets/images/title_mascot.png',
        hub_hamster: 'assets/images/hub_hamster.png',
      };

      for (const [key, src] of Object.entries(imageFiles)) {
        const img = new Image();
        img.onload = () => {
          this.images[key] = img;
        };
        img.onerror = () => {
          this.images[key] = null; // ファイルが無いときは内蔵描画
        };
        img.src = src;
      }
    }

    initSoundLoaders() {
      const soundFiles = {
        living_bgm: 'assets/sounds/living_bgm.mp3',
        rhythm_1: 'assets/sounds/rhythm_1.mp3',
        rhythm_2: 'assets/sounds/rhythm_2.mp3',
        rhythm_3: 'assets/sounds/rhythm_3.mp3',
        rhythm_4: 'assets/sounds/rhythm_4.mp3',
        rhythm_5: 'assets/sounds/rhythm_5.mp3',
      };

      for (const [key, src] of Object.entries(soundFiles)) {
        const aud = new Audio();
        aud.preload = 'auto';
        aud.oncanplaythrough = () => {
          this.sounds[key] = aud;
        };
        aud.onerror = () => {
          this.sounds[key] = null; // ファイルが無いときは内蔵シンセサイザー
        };
        aud.src = src;
      }
    }

    hasImage(key) {
      return !!this.images[key];
    }

    drawImage(tCtx, key, x, y, w, h, angle = 0) {
      const img = this.images[key];
      if (!img) return false;
      tCtx.save();
      tCtx.translate(x, y);
      if (angle !== 0) tCtx.rotate(angle);
      tCtx.drawImage(img, -w / 2, -h / 2, w, h);
      tCtx.restore();
      return true;
    }
  }

  const assets = new AssetManager();

  // --- 5 Selectable RHYTHM ROOM Tracks (Different Genres, all BPM 160~180) ---
  const RHYTHM_TRACKS = [
    {
      id: 'electro',
      shortLabel: '🎵1: ELECTRO',
      fullName: 'ELECTRO CLUB',
      bpm: 160,
      accentColor: '#ec4899',
      leadWave: 'triangle',
      bassWave: 'triangle',
      kickStart: 155,
      hatFreq: 760,
      bassFreqs: [130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.0, 196.0],
      melodyFreqs: [523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 783.99],
      beatChords: [
        [523.25, 659.25, 783.99, 1046.5],
        [659.25, 783.99, 1046.5, 1318.5],
        [659.25, 783.99, 987.77, 1567.98],
        [587.33, 880.0, 1174.66, 1760.0],
        [523.25, 698.46, 880.0, 1396.91],
        [523.25, 659.25, 880.0, 1318.5],
        [587.33, 783.99, 987.77, 1174.66],
        [659.25, 783.99, 1174.66, 1567.98],
      ],
    },
    {
      id: 'chiptune',
      shortLabel: '🕹️2: 8BIT',
      fullName: '8BIT ARCADE',
      bpm: 165,
      accentColor: '#38bdf8',
      leadWave: 'square',
      bassWave: 'triangle',
      kickStart: 140,
      hatFreq: 1120,
      bassFreqs: [164.81, 329.63, 130.81, 261.63, 146.83, 293.66, 196.0, 246.94],
      melodyFreqs: [659.25, 783.99, 987.77, 1318.5, 1174.66, 987.77, 783.99, 880.0],
      beatChords: [
        [659.25, 783.99, 987.77, 1318.5],
        [659.25, 987.77, 1318.5, 1567.98],
        [523.25, 659.25, 783.99, 1046.5],
        [523.25, 783.99, 1046.5, 1318.5],
        [587.33, 739.99, 880.0, 1174.66],
        [587.33, 880.0, 1174.66, 1479.98],
        [493.88, 739.99, 987.77, 1479.98],
        [659.25, 987.77, 1174.66, 1567.98],
      ],
    },
    {
      id: 'disco',
      shortLabel: '🎷3: DISCO',
      fullName: 'FUNKY DISCO',
      bpm: 170,
      accentColor: '#f59e0b',
      leadWave: 'sawtooth',
      bassWave: 'sawtooth',
      kickStart: 150,
      hatFreq: 920,
      bassFreqs: [146.83, 293.66, 174.61, 196.0, 220.0, 261.63, 196.0, 174.61],
      melodyFreqs: [587.33, 698.46, 783.99, 880.0, 1046.5, 880.0, 783.99, 698.46],
      beatChords: [
        [587.33, 698.46, 880.0, 1046.5],
        [587.33, 783.99, 1046.5, 1318.5],
        [698.46, 880.0, 1046.5, 1396.91],
        [659.25, 783.99, 987.77, 1318.5],
        [587.33, 698.46, 880.0, 1174.66],
        [698.46, 880.0, 1174.66, 1396.91],
        [659.25, 783.99, 1046.5, 1567.98],
        [587.33, 880.0, 1046.5, 1318.5],
      ],
    },
    {
      id: 'kawaii',
      shortLabel: '🍬4: KAWAII',
      fullName: 'KAWAII FUTURE',
      bpm: 175,
      accentColor: '#f472b6',
      leadWave: 'sine',
      bassWave: 'triangle',
      kickStart: 175,
      hatFreq: 1280,
      bassFreqs: [174.61, 174.61, 196.0, 196.0, 164.81, 164.81, 220.0, 130.81],
      melodyFreqs: [698.46, 880.0, 1046.5, 1318.5, 1174.66, 1046.5, 880.0, 1567.98],
      beatChords: [
        [698.46, 880.0, 1046.5, 1318.5],
        [880.0, 1046.5, 1318.5, 1567.98],
        [587.33, 783.99, 987.77, 1396.91],
        [659.25, 783.99, 1174.66, 1567.98],
        [659.25, 783.99, 987.77, 1479.98],
        [523.25, 783.99, 987.77, 1318.5],
        [698.46, 880.0, 1046.5, 1567.98],
        [783.99, 1046.5, 1318.5, 1760.0],
      ],
    },
    {
      id: 'rave',
      shortLabel: '🔥5: RAVE',
      fullName: 'HYPER RAVE',
      bpm: 180,
      accentColor: '#a855f7',
      leadWave: 'sawtooth',
      bassWave: 'square',
      kickStart: 190,
      hatFreq: 860,
      bassFreqs: [110.0, 220.0, 174.61, 174.61, 130.81, 261.63, 196.0, 164.81],
      melodyFreqs: [880.0, 659.25, 880.0, 1046.5, 987.77, 783.99, 659.25, 1174.66],
      beatChords: [
        [440.0, 659.25, 880.0, 1046.5],
        [523.25, 659.25, 880.0, 1318.5],
        [523.25, 698.46, 880.0, 1396.91],
        [523.25, 698.46, 1046.5, 1567.98],
        [523.25, 659.25, 783.99, 1046.5],
        [523.25, 783.99, 1046.5, 1318.5],
        [493.88, 587.33, 783.99, 1174.66],
        [659.25, 783.99, 987.77, 1567.98],
      ],
    },
  ];

  // --- Cozy "Suika Game" Style Playful Marimba/Ragtime BGM Data for LIVING ROOM ---
  const LIVING_BGM_BASS = [
    // Bar 1 (C -> A7)
    130.81, 0, 196.0, 0, 220.0, 0, 164.81, 0,
    // Bar 2 (Dm7 -> G7)
    146.83, 0, 220.0, 0, 196.0, 0, 146.83, 164.81,
    // Bar 3 (C -> C7)
    130.81, 0, 196.0, 0, 130.81, 0, 233.08, 0,
    // Bar 4 (F -> G7)
    174.61, 0, 177.6, 0, 196.0, 0, 146.83, 196.0,
  ];

  const LIVING_BGM_MELODY = [
    // Bar 1: Bouncy skipping C major motif (E5-G5-C6-A5-G5-E5)
    659.25, 783.99, 1046.5, 0, 880.0, 783.99, 659.25, 0,
    // Bar 2: Playful answer (F5-A5-G5-E5-D5)
    698.46, 880.0, 783.99, 659.25, 587.33, 0, 783.99, 0,
    // Bar 3: Cheerful climb (E5-G5-A5-C6-D6-C6-A5)
    659.25, 783.99, 880.0, 1046.5, 1174.66, 1046.5, 880.0, 0,
    // Bar 4: Cute resolving cadence (A5-G5-F5-B5-C6)
    880.0, 783.99, 698.46, 987.77, 1046.5, 0, 783.99, 0,
  ];

  const LIVING_BGM_CHORD_NOTES = [
    [523.25, 659.25], // C
    [440.0, 678.0],   // A7
    [587.33, 698.46], // Dm
    [493.88, 698.46], // G7
    [523.25, 659.25], // C
    [523.25, 622.25], // C7
    [523.25, 698.46], // F
    [493.88, 783.99], // G7
  ];

  const resultReasonEl = document.getElementById('result-reason');
  const resultTitleText = document.getElementById('result-title-text');
  const finalScoreEl = document.getElementById('final-score');
  const newRecordBadge = document.getElementById('new-record-badge');
  const statFoodsEl = document.getElementById('stat-foods');
  const statMaxComboEl = document.getElementById('stat-max-combo');
  const statTimeEl = document.getElementById('stat-time');
  const statBestEl = document.getElementById('stat-best');

  // --- Audio Synthesizer (Web Audio API) ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.noiseBuffer = null;
      this.muted = false;
      this.volume = 0.8;
      try {
        const savedVol = localStorage.getItem('hamster_dash_volume_v1');
        if (savedVol !== null) {
          const parsed = parseFloat(savedVol);
          if (!Number.isNaN(parsed)) {
            this.volume = Math.max(0, Math.min(1, parsed));
          }
        }
      } catch {
        // ignore storage errors
      }
      this.syncVolumeUI();
    }

    get dest() {
      return this.masterGain || this.ctx.destination;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = this.muted ? 0 : this.volume;
          this.masterGain.connect(this.ctx.destination);

          // Pre-build short white-noise buffer for Rimshot / K-Snare percussion
          const sampleRate = this.ctx.sampleRate;
          const length = Math.floor(sampleRate * 0.12);
          this.noiseBuffer = this.ctx.createBuffer(1, length, sampleRate);
          const data = this.noiseBuffer.getChannelData(0);
          for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
          }
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    syncVolumeUI() {
      const pct = Math.round((this.muted ? 0 : this.volume) * 100);
      const icon = this.muted || pct === 0 ? '🔇' : pct < 45 ? '🔉' : '🔊';
      if (soundBtn) soundBtn.textContent = icon;
      if (btnPauseMute) btnPauseMute.textContent = icon;
      if (volumeSlider) volumeSlider.value = String(pct);
      if (volumeValEl) volumeValEl.textContent = `${pct}%`;
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
      if (this.volume > 0 && this.muted) {
        this.muted = false;
      } else if (this.volume === 0) {
        this.muted = true;
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      }
      try {
        localStorage.setItem('hamster_dash_volume_v1', String(this.volume));
      } catch {
        // ignore
      }
      this.syncVolumeUI();
    }

    toggleMute() {
      this.muted = !this.muted;
      if (!this.muted && this.volume === 0) {
        this.volume = 0.8;
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      }
      this.syncVolumeUI();
    }

    playUIClick() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.dest);
      osc.start(now);
      osc.stop(now + 0.09);
    }

    playCountdown(isGo = false) {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const freq = isGo ? 880 : 440;
      const dur = isGo ? 0.24 : 0.11;
      osc.frequency.setValueAtTime(freq, now);
      if (isGo) {
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.1);
      }
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(this.dest);
      osc.start(now);
      osc.stop(now + dur);
    }

    playDash(isPoisoned = false) {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const startF = isPoisoned ? 180 : 320;
      const endF = isPoisoned ? 310 : 920;
      osc.frequency.setValueAtTime(startF, now);
      osc.frequency.exponentialRampToValueAtTime(endF, now + 0.085);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      osc.connect(gain);
      gain.connect(this.dest);
      osc.start(now);
      osc.stop(now + 0.095);
    }

    playEat(combo = 1, isSpecial = false) {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const baseFreq = 520 + Math.min(combo * 35, 500);
      const notes = isSpecial ? [baseFreq, baseFreq * 1.25, baseFreq * 1.5] : [baseFreq, baseFreq * 1.25];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);
        gain.gain.setValueAtTime(0.2, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.12);
        osc.connect(gain);
        gain.connect(this.dest);
        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.12);
      });
    }

    playJojoBaan() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;

      const chordFreqs = [146.83, 220, 293.66, 369.99, 440];
      chordFreqs.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 1.06, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.45);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.connect(gain);
        gain.connect(this.dest);
        osc.start(now);
        osc.stop(now + 0.48);
      });

      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(130, now);
      sub.frequency.exponentialRampToValueAtTime(32, now + 0.52);
      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      sub.connect(subGain);
      subGain.connect(this.dest);
      sub.start(now);
      sub.stop(now + 0.55);
    }

    playGogogo() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [110, 98, 87.31, 73.42, 65.41];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 1.08, now + idx * 0.055);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.78, now + idx * 0.055 + 0.14);
        gain.gain.setValueAtTime(0.18, now + idx * 0.055);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.15);
        osc.connect(gain);
        gain.connect(this.dest);
        osc.start(now + idx * 0.055);
        osc.stop(now + idx * 0.055 + 0.15);
      });
    }

    playHelmetBounce() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Sharp metallic clang + energetic upward ricochet
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(280, now);
      osc1.frequency.exponentialRampToValueAtTime(960, now + 0.14);
      gain1.gain.setValueAtTime(0.24, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc1.connect(gain1);
      gain1.connect(this.dest);
      osc1.start(now);
      osc1.stop(now + 0.16);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(520, now + 0.03);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.22);
      gain2.gain.setValueAtTime(0.18, now + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc2.connect(gain2);
      gain2.connect(this.dest);
      osc2.start(now + 0.03);
      osc2.stop(now + 0.24);
    }

    playPoison() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [310, 260, 195, 145];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.065);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.82, now + idx * 0.065 + 0.09);
        gain.gain.setValueAtTime(0.16, now + idx * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.1);
        osc.connect(gain);
        gain.connect(this.dest);
        osc.start(now + idx * 0.065);
        osc.stop(now + idx * 0.065 + 0.1);
      });
    }

    playVacuumSuck() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.16);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc.connect(gain);
      gain.connect(this.dest);
      osc.start(now);
      osc.stop(now + 0.17);
    }

    playCrash() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.65);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
      osc.connect(gain);
      gain.connect(this.dest);
      osc.start(now);
      osc.stop(now + 0.68);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(520, now);
      osc2.frequency.exponentialRampToValueAtTime(90, now + 0.22);
      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc2.connect(gain2);
      gain2.connect(this.dest);
      osc2.start(now);
      osc2.stop(now + 0.24);
    }

    playTimeUp(isClear = false) {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = isClear ? [523.25, 659.25, 783.99, 1046.5] : [440, 392, 330];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);
        gain.gain.setValueAtTime(0.22, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.2);
        osc.connect(gain);
        gain.connect(this.dest);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.2);
      });
    }

    playSpawnWarn() {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.dest);
      osc.start(now);
      osc.stop(now + 0.14);
    }

    /**
     * Synthesizes a cozy, cheerful "Suika Game" style marimba/woodwind/ragtime step for LIVING ROOM
     */
    playLivingBgmStep(stepIndex) {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const s = ((stepIndex % 32) + 32) % 32;

      // 1. Bouncy "Oom-Pah" Tuba / Plucked Acoustic Bass on even steps
      const bassFreq = LIVING_BGM_BASS[s];
      if (bassFreq > 0) {
        const bass = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bass.type = 'triangle';
        bass.frequency.setValueAtTime(bassFreq * 1.03, now);
        bass.frequency.exponentialRampToValueAtTime(bassFreq, now + 0.02);
        bGain.gain.setValueAtTime(0.085, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        bass.connect(bGain);
        bGain.connect(this.dest);
        bass.start(now);
        bass.stop(now + 0.17);
      }

      // 2. Off-beat Ukulele / Ragtime Piano Chord Strums on steps 2, 6, 10, 14... (or odd steps)
      if (s % 4 === 2) {
        const chordIdx = Math.floor(s / 4) % LIVING_BGM_CHORD_NOTES.length;
        const chordNotes = LIVING_BGM_CHORD_NOTES[chordIdx];
        chordNotes.forEach((cFreq, idx) => {
          const cOsc = this.ctx.createOscillator();
          const cGain = this.ctx.createGain();
          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(cFreq, now + idx * 0.012);
          cGain.gain.setValueAtTime(0.038, now + idx * 0.012);
          cGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.012 + 0.095);
          cOsc.connect(cGain);
          cGain.connect(this.dest);
          cOsc.start(now + idx * 0.012);
          cOsc.stop(now + idx * 0.012 + 0.1);
        });
      }

      // 3. Playful Staccato Marimba / Woodwind Melody (Suika Game vibe!)
      const melFreq = LIVING_BGM_MELODY[s];
      if (melFreq > 0) {
        // Warm fundamental sine
        const mel = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mel.type = 'sine';
        mel.frequency.setValueAtTime(melFreq, now);
        mGain.gain.setValueAtTime(0.09, now);
        mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.145);
        mel.connect(mGain);
        mGain.connect(this.dest);
        mel.start(now);
        mel.stop(now + 0.155);

        // Wooden marimba harmonic overtone (2x / 3x partial with fast decay)
        const harm = this.ctx.createOscillator();
        const hGain = this.ctx.createGain();
        harm.type = 'triangle';
        harm.frequency.setValueAtTime(melFreq * 2, now);
        hGain.gain.setValueAtTime(0.035, now);
        hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        harm.connect(hGain);
        hGain.connect(this.dest);
        harm.start(now);
        harm.stop(now + 0.065);
      }
    }

    /**
     * Synthesizes an upbeat 8-beat musical groove for RHYTHM ROOM (beatIndex: 0..7)
     * Richer layered drums, bass groove, chords, and lead melodies
     */
    playRhythmBeat(beatIndex, trackIdx = 0) {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const b = ((beatIndex % 8) + 8) % 8;
      const track = RHYTHM_TRACKS[trackIdx % RHYTHM_TRACKS.length] || RHYTHM_TRACKS[0];

      // 1. Kick on beats 0, 2, 4, 6 (Four on the Floor punch)
      if (b % 2 === 0) {
        const kick = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kick.type = 'sine';
        const isDown = b === 0;
        kick.frequency.setValueAtTime(isDown ? 165 : 135, now);
        kick.frequency.exponentialRampToValueAtTime(32, now + 0.13);
        kGain.gain.setValueAtTime(isDown ? 0.28 : 0.21, now);
        kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        kick.connect(kGain);
        kGain.connect(this.dest);
        kick.start(now);
        kick.stop(now + 0.14);

        // Click transient for punchy modern club kick
        const click = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        click.type = 'triangle';
        click.frequency.setValueAtTime(800, now);
        click.frequency.exponentialRampToValueAtTime(80, now + 0.025);
        cGain.gain.setValueAtTime(0.12, now);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        click.connect(cGain);
        cGain.connect(this.dest);
        click.start(now);
        click.stop(now + 0.03);
      } else {
        // Snare / Clap on odd beats (1, 3, 5, 7)
        const snare = this.ctx.createOscillator();
        const sGain = this.ctx.createGain();
        snare.type = 'triangle';
        snare.frequency.setValueAtTime(220, now);
        snare.frequency.exponentialRampToValueAtTime(65, now + 0.09);
        sGain.gain.setValueAtTime(0.15, now);
        sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
        snare.connect(sGain);
        sGain.connect(this.dest);
        snare.start(now);
        snare.stop(now + 0.095);

        // Sizzling Clap Noise burst
        const hat = this.ctx.createOscillator();
        const hGain = this.ctx.createGain();
        hat.type = 'square';
        hat.frequency.setValueAtTime(track.hatFreq, now);
        hat.frequency.exponentialRampToValueAtTime(260, now + 0.07);
        hGain.gain.setValueAtTime(0.08, now);
        hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
        hat.connect(hGain);
        hGain.connect(this.dest);
        hat.start(now);
        hat.stop(now + 0.075);
      }

      // 2. Driving Bassline (Groovy pulse on every beat)
      const bass = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bass.type = track.bassWave;
      const bFreq = track.bassFreqs[b];
      bass.frequency.setValueAtTime(bFreq, now);
      // Slight pitch envelope for funky punch
      bass.frequency.exponentialRampToValueAtTime(bFreq * 0.98, now + 0.08);
      const bVol = (track.bassWave === 'sawtooth' || track.bassWave === 'square') ? 0.09 : 0.15;
      bGain.gain.setValueAtTime(bVol, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      bass.connect(bGain);
      bGain.connect(this.dest);
      bass.start(now);
      bass.stop(now + 0.18);

      // 3. Ambient Chord Pad Harmony (Gives depth and emotion)
      const chord = track.beatChords[b];
      if (chord && chord.length >= 2) {
        [chord[0], chord[1]].forEach((cFreq, idx) => {
          const pad = this.ctx.createOscillator();
          const pGain = this.ctx.createGain();
          pad.type = 'sine';
          pad.frequency.setValueAtTime(cFreq, now);
          pGain.gain.setValueAtTime(0.042, now);
          pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          pad.connect(pGain);
          pGain.connect(this.ctx.destination);
          pad.start(now);
          pad.stop(now + 0.23);
        });
      }

      // 4. Catchy Lead Melody
      const lead = this.ctx.createOscillator();
      const lGain = this.ctx.createGain();
      lead.type = track.leadWave;
      lead.frequency.setValueAtTime(track.melodyFreqs[b], now);
      const baseLeadGain = (track.leadWave === 'sawtooth' || track.leadWave === 'square') ? 0.085 : 0.13;
      lGain.gain.setValueAtTime(b === 0 ? baseLeadGain * 1.25 : baseLeadGain, now);
      lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      lead.connect(lGain);
      lGain.connect(this.dest);
      lead.start(now);
      lead.stop(now + 0.18);
    }

    /**
     * Simple, crisp Rimshot / K-Snare percussion when dashing on the beat in RHYTHM ROOM!
     * Woody rim knock + high-passed tight K-snare snap (no chord stabs that clash with BGM).
     */
    playRhythmDash(beatIndex = 0, isPoisoned = false, trackIdx = 0) {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const pitchMult = isPoisoned ? 0.68 : 1.0;

      // 1. Rimshot woody shell transient (tight pitch drop)
      const rimBody = this.ctx.createOscillator();
      const rbGain = this.ctx.createGain();
      rimBody.type = 'triangle';
      rimBody.frequency.setValueAtTime(480 * pitchMult, now);
      rimBody.frequency.exponentialRampToValueAtTime(175 * pitchMult, now + 0.032);
      rbGain.gain.setValueAtTime(0.32, now);
      rbGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);
      rimBody.connect(rbGain);
      rbGain.connect(this.dest);
      rimBody.start(now);
      rimBody.stop(now + 0.045);

      // 2. Metallic rim click overtone ("カッ" attack)
      const rimClick = this.ctx.createOscillator();
      const rcGain = this.ctx.createGain();
      rimClick.type = 'sine';
      rimClick.frequency.setValueAtTime(1760 * pitchMult, now);
      rimClick.frequency.exponentialRampToValueAtTime(840 * pitchMult, now + 0.018);
      rcGain.gain.setValueAtTime(0.24, now);
      rcGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
      rimClick.connect(rcGain);
      rcGain.connect(this.dest);
      rimClick.start(now);
      rimClick.stop(now + 0.025);

      // 3. K-Snare crisp high-mid noise burst ("ツッ / タッ" snare wire snap)
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(isPoisoned ? 1200 : 2600, now);
        filter.Q.setValueAtTime(1.8, now);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.34, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.062);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.dest);
        noise.start(now);
        noise.stop(now + 0.068);
      }
    }

    playQueueTap(queueIndex = 1) {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const freq = Math.min(1300, 820 + (queueIndex - 1) * 55);
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.022);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.026);
      osc.connect(gain);
      gain.connect(this.dest);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  }

  const sound = new SoundManager();

  // --- High Score & Lifetime Stats Storage ---
  const STORAGE_KEYS = {
    survival: 'hamster_dash_best_survival_v1',
    timeattack: 'hamster_dash_best_timeattack_v1',
    stats: 'hamster_dash_lifetime_stats_v1',
  };

  function getBestScore(mode) {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS[mode]) || '0', 10);
    } catch {
      return 0;
    }
  }

  function setBestScore(mode, val) {
    try {
      localStorage.setItem(STORAGE_KEYS[mode], String(val));
    } catch {
      // ignore storage errors
    }
  }

  function getLifetimeStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.stats);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          totalFoods: parsed.totalFoods || 0,
          longestTime: parsed.longestTime || 0,
          maxCombo: parsed.maxCombo || 0,
          totalPlays: parsed.totalPlays || 0,
          history: Array.isArray(parsed.history) ? parsed.history : [],
        };
      }
    } catch {
      // ignore
    }
    return {
      totalFoods: 0,
      longestTime: 0,
      maxCombo: 0,
      totalPlays: 0,
      history: [],
    };
  }

  function recordGameStats(mode, finalScore, foodsCount, runMaxCombo, runTime, cause) {
    const stats = getLifetimeStats();
    stats.totalFoods += foodsCount;
    if (runTime > stats.longestTime) {
      stats.longestTime = runTime;
    }
    if (runMaxCombo > stats.maxCombo) {
      stats.maxCombo = runMaxCombo;
    }
    stats.totalPlays += 1;

    stats.history.unshift({
      mode,
      score: finalScore,
      foods: foodsCount,
      combo: runMaxCombo,
      time: Number(runTime.toFixed(1)),
      cause,
    });
    if (stats.history.length > 10) {
      stats.history.length = 10;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }

  function renderStatsModalContent() {
    const stats = getLifetimeStats();
    bestSurvivalEl.textContent = getBestScore('survival').toLocaleString();
    bestTimeattackEl.textContent = getBestScore('timeattack').toLocaleString();

    totalFoodsValEl.textContent = `${stats.totalFoods.toLocaleString()}個`;
    longestTimeValEl.textContent = `${stats.longestTime.toFixed(1)}s`;
    alltimeComboValEl.textContent = `${stats.maxCombo} COMBO`;
    totalPlaysValEl.textContent = `${stats.totalPlays.toLocaleString()}回`;

    if (stats.history.length === 0) {
      historyListEl.innerHTML = '<div class="history-empty">まだプレイ履歴がありません</div>';
      return;
    }

    const causeIconMap = {
      clear: '🎉',
      roomba: '🧹',
      yarn: '🧶',
      patrol: '🐭',
      starve: '⏳',
    };

    historyListEl.innerHTML = stats.history
      .map((item) => {
        const modeLabel = item.mode === 'survival' ? '🔥サバイバル' : '⏱️60秒';
        const icon = causeIconMap[item.cause] || '💥';
        return `
          <div class="history-row">
            <div class="history-left">
              <span>${icon}</span>
              <span class="history-mode-tag ${item.mode}">${modeLabel}</span>
            </div>
            <div class="history-right">
              <span class="history-meta">🌻${item.foods} / ${item.combo}連 / ${item.time}s</span>
              <span class="history-score">${Number(item.score).toLocaleString()} pt</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // --- Canonical Virtual Resolution (Guarantees 100% Identical Physics & Ratios Across All Devices) ---
  const VIRTUAL_WIDTH = 390;
  const VIRTUAL_HEIGHT = 694; // Standard 9:16 vertical arcade proportion
  let width = VIRTUAL_WIDTH;
  let height = VIRTUAL_HEIGHT;
  let dpr = 1;
  let viewScaleX = 1;
  let viewScaleY = 1;
  const HUD_TOP_MARGIN = 92;
  const WALL_PADDING = 20;

  // 'TITLE' | 'MODESELECT' | 'COUNTDOWN' | 'PLAYING' | 'DYING' | 'GAMEOVER'
  let state = 'TITLE';
  let isPaused = false;
  let gameMode = 'survival'; // 'survival' | 'timeattack'
  let roomType = 'living'; // 'living' (LIVINGROOM) | 'rhythm' (RHYTHMROOM)

  // LIVING ROOM Options ('none' | 'cat' | 'ice')
  let livingOption = 'none';
  let livingTapCount = 0;

  // Cat Paw Hazard State (Cat+)
  const catPaw = {
    active: false,
    state: 'idle', // 'idle' | 'warn' | 'thrust' | 'hold' | 'retract'
    side: 'left', // 'top' | 'bottom' | 'left' | 'right'
    coord: 0, // position along that side
    reach: 0, // current extension length (px)
    maxReach: 0,
    width: 50, // thickness of paw
    timer: 0,
    warnDuration: 0.65,
    thrustSpeed: 780,
    holdDuration: 0.45,
    retractSpeed: 520,
    nextSpawnTimer: 3.5,
  };

  // 8-Beat Rhythm Room State (5 selectable tracks, BPM 160~180)
  const RHYTHM_BEATS = 8;
  let rhythmTrackIndex = 0;
  let hamsterTapPulseTimer = 0;
  let previewTimeouts = [];
  let rhythmTimer = 0;
  let currentBeatIndex = 0;
  let rhythmBeatPulse = 0;
  let rhythmTapQueue = [];

  function getRhythmBeatInterval() {
    const track = RHYTHM_TRACKS[rhythmTrackIndex] || RHYTHM_TRACKS[0];
    return 60 / track.bpm;
  }

  // Living Room Suika-Game-Style BGM Sequencer State
  const LIVING_BGM_STEP_INTERVAL = 0.22;
  let livingBgmTimer = 0;
  let livingBgmStep = 0;

  let countdownTimer = 0;
  let lastCountdownBeep = 4;
  let startBannerTimer = 0;

  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let foodsCollected = 0;
  let elapsedTime = 0;
  let maxTime = 16;
  let timeLeft = 16;
  let difficultyLevel = 1;
  let nextObstacleTimer = 0;
  let deathSlowMoTimer = 0;
  let deathReason = '';
  let deathCause = 'roomba'; // 'roomba' | 'yarn' | 'patrol' | 'starve' | 'clear'
  let screenShake = 0;
  let crashEffect = null;

  // Timer Item & Slow-Motion Effect State
  let timerItems = [];
  let nextTimerItemSpawn = 10;
  let worldSlowTimer = 0;
  const WORLD_SLOW_DURATION = 5.0;
  let gogogoCutIn = null;

  // Poison Item & Player Slow Debuff State
  let poisonItem = null;
  let nextPoisonItemSpawn = 6.5;
  let playerPoisonTimer = 0;
  const PLAYER_POISON_DURATION = 5.0;
  let poisonCutIn = null;

  // Helmet Item & One-Time Obstacle Bounce Shield State
  let helmetItem = null;
  let nextHelmetItemSpawn = 15.0;
  let baanCutIn = null;
  let zugyaanCutIn = null;

  // Player (Compact Top-Down Hamster)
  const player = {
    x: 195,
    y: 420,
    radius: 15.5,
    targetX: 195,
    targetY: 420,
    dashStartX: 195,
    dashStartY: 420,
    isDashing: false,
    baseDashSpeed: 1850,
    vx: 0,
    vy: 0,
    inertiaFriction: 9.5,
    angle: -Math.PI / 2,
    walkPhase: 0,
    chewTimer: 0,
    dashEatCount: 0,
    isDizzy: false,
    hasHelmet: false,
    helmetInvulnTimer: 0,
    afterimages: [],
  };

  // Entities
  let foods = [];
  let vacuum = null;
  let obstacles = [];
  let particles = [];
  let dashStreaks = [];
  let floatingTexts = [];
  let targetRipples = [];

  // --- Resize Canvas with Canonical Virtual Resolution ---
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const displayW = rect.width || VIRTUAL_WIDTH;
    const displayH = rect.height || VIRTUAL_HEIGHT;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const newCanvasW = Math.round(displayW * dpr);
    const newCanvasH = Math.round(displayH * dpr);

    if (canvas.width !== newCanvasW || canvas.height !== newCanvasH) {
      canvas.width = newCanvasW;
      canvas.height = newCanvasH;
    }

    viewScaleX = displayW / VIRTUAL_WIDTH;
    viewScaleY = displayH / VIRTUAL_HEIGHT;
    width = VIRTUAL_WIDTH;
    height = VIRTUAL_HEIGHT;

    ctx.setTransform(dpr * viewScaleX, 0, 0, dpr * viewScaleY, 0, 0);

    if (state === 'TITLE' || state === 'MODESELECT') {
      player.x = width / 2;
      player.y = height * 0.58;
    } else {
      player.x = clamp(player.x, WALL_PADDING, width - WALL_PADDING);
      player.y = clamp(player.y, HUD_TOP_MARGIN + WALL_PADDING, height - WALL_PADDING);
    }
  }

  window.addEventListener('resize', resizeCanvas);

  // --- Utility Functions ---
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  // --- Food Spawning ---
  const FOOD_TYPES = [
    {
      id: 'seed',
      name: 'ひまわりの種',
      weight: 68,
      baseScore: 100,
      timeBonus: 1.75,
      lifetime: 4.8,
      radius: 15.5,
    },
    {
      id: 'cheese',
      name: 'チーズ',
      weight: 24,
      baseScore: 250,
      timeBonus: 2.7,
      lifetime: 4.1,
      radius: 17,
    },
    {
      id: 'gold',
      name: '黄金の種',
      weight: 8,
      baseScore: 500,
      timeBonus: 3.8,
      lifetime: 3.3,
      radius: 17,
    },
  ];

  function pickFoodType() {
    const totalWeight = FOOD_TYPES.reduce((acc, f) => acc + f.weight, 0);
    let r = Math.random() * totalWeight;
    for (const f of FOOD_TYPES) {
      if (r < f.weight) return f;
      r -= f.weight;
    }
    return FOOD_TYPES[0];
  }

  function spawnFood(forceType = null) {
    const type = forceType || pickFoodType();
    const margin = 34;
    const minY = HUD_TOP_MARGIN + margin;
    const maxY = height - margin;
    const minX = margin;
    const maxX = width - margin;

    let bestX = randRange(minX, maxX);
    let bestY = randRange(minY, maxY);

    for (let attempt = 0; attempt < 30; attempt++) {
      const cx = randRange(minX, maxX);
      const cy = randRange(minY, maxY);

      if (dist(cx, cy, player.x, player.y) < 68) continue;
      if (vacuum && dist(cx, cy, vacuum.x, vacuum.y) < 100) continue;
      if (poisonItem && dist(cx, cy, poisonItem.x, poisonItem.y) < 48) continue;
      if (helmetItem && dist(cx, cy, helmetItem.x, helmetItem.y) < 48) continue;

      let tooCloseFood = false;
      for (const f of foods) {
        if (dist(cx, cy, f.x, f.y) < 48) {
          tooCloseFood = true;
          break;
        }
      }
      if (tooCloseFood) continue;

      bestX = cx;
      bestY = cy;
      break;
    }

    const speedFactor = Math.max(0.75, 1 - (difficultyLevel - 1) * 0.025);
    const maxLife = type.lifetime * speedFactor;

    foods.push({
      x: bestX,
      y: bestY,
      type,
      radius: type.radius,
      maxLife,
      life: maxLife,
      scale: 0.1,
      bobPhase: Math.random() * Math.PI * 2,
      beingSucked: false,
    });
  }

  // --- Timer Item Spawning ---
  function spawnTimerItem() {
    const margin = 44;
    const minY = HUD_TOP_MARGIN + margin;
    const maxY = height - margin;
    const minX = margin;
    const maxX = width - margin;

    let bestX = randRange(minX, maxX);
    let bestY = randRange(minY, maxY);

    for (let attempt = 0; attempt < 25; attempt++) {
      const cx = randRange(minX, maxX);
      const cy = randRange(minY, maxY);
      if (dist(cx, cy, player.x, player.y) < 85) continue;
      if (vacuum && dist(cx, cy, vacuum.x, vacuum.y) < 100) continue;
      if (poisonItem && dist(cx, cy, poisonItem.x, poisonItem.y) < 55) continue;
      if (helmetItem && dist(cx, cy, helmetItem.x, helmetItem.y) < 55) continue;
      bestX = cx;
      bestY = cy;
      break;
    }

    timerItems.push({
      x: bestX,
      y: bestY,
      radius: 18.5,
      life: 7.5,
      maxLife: 7.5,
      scale: 0.1,
      pulsePhase: 0,
      beingSucked: false,
    });
  }

  // --- Poison Item Spawning ---
  function spawnPoisonItem() {
    if (poisonItem) return;

    const margin = 44;
    const minY = HUD_TOP_MARGIN + margin;
    const maxY = height - margin;
    const minX = margin;
    const maxX = width - margin;

    let bestX = randRange(minX, maxX);
    let bestY = randRange(minY, maxY);

    for (let attempt = 0; attempt < 30; attempt++) {
      const cx = randRange(minX, maxX);
      const cy = randRange(minY, maxY);
      if (dist(cx, cy, player.x, player.y) < 95) continue;
      if (dist(cx, cy, player.targetX, player.targetY) < 75) continue;
      if (vacuum && dist(cx, cy, vacuum.x, vacuum.y) < 100) continue;
      if (helmetItem && dist(cx, cy, helmetItem.x, helmetItem.y) < 55) continue;

      let tooCloseFood = false;
      for (const f of foods) {
        if (dist(cx, cy, f.x, f.y) < 48) {
          tooCloseFood = true;
          break;
        }
      }
      if (tooCloseFood) continue;

      bestX = cx;
      bestY = cy;
      break;
    }

    poisonItem = {
      x: bestX,
      y: bestY,
      radius: 17,
      scale: 0.1,
      bobPhase: Math.random() * Math.PI * 2,
      beingSucked: false,
    };
  }

  // --- Helmet Item Spawning (Rare, max 1 on screen, sucked by Vacuum) ---
  function spawnHelmetItem() {
    if (helmetItem) return;

    const margin = 44;
    const minY = HUD_TOP_MARGIN + margin;
    const maxY = height - margin;
    const minX = margin;
    const maxX = width - margin;

    let bestX = randRange(minX, maxX);
    let bestY = randRange(minY, maxY);

    for (let attempt = 0; attempt < 30; attempt++) {
      const cx = randRange(minX, maxX);
      const cy = randRange(minY, maxY);
      if (dist(cx, cy, player.x, player.y) < 90) continue;
      if (vacuum && dist(cx, cy, vacuum.x, vacuum.y) < 100) continue;
      if (poisonItem && dist(cx, cy, poisonItem.x, poisonItem.y) < 55) continue;

      let tooCloseFood = false;
      for (const f of foods) {
        if (dist(cx, cy, f.x, f.y) < 48) {
          tooCloseFood = true;
          break;
        }
      }
      if (tooCloseFood) continue;

      bestX = cx;
      bestY = cy;
      break;
    }

    helmetItem = {
      x: bestX,
      y: bestY,
      radius: 18.5,
      life: 8.5,
      maxLife: 8.5,
      scale: 0.1,
      bobPhase: Math.random() * Math.PI * 2,
      beingSucked: false,
    };
  }

  // Timer Item -> "ゴゴゴゴゴ……" (like Poison's eerie rising/rumbling style)
  function triggerTimerGogogo(x, y) {
    worldSlowTimer = WORLD_SLOW_DURATION;
    screenShake = 8;
    sound.playGogogo();

    addParticles(x, y, '#d946ef', 16, 1.5, true);
    addParticles(x, y, '#facc15', 14, 1.3, true);

    targetRipples.push({
      x,
      y,
      radius: 10,
      maxRadius: Math.max(width, height) * 0.85,
      alpha: 0.9,
      color: 'rgba(192, 38, 211, 0.85)',
    });

    gogogoCutIn = {
      timer: 0,
      maxTimer: 1.0,
      pillars: Array.from({ length: 24 }, (_, i) => ({
        x: ((i + 0.5) / 24) * width + randRange(-8, 8),
        speed: randRange(130, 260),
        len: randRange(55, 145),
        width: randRange(3, 7),
      })),
    };
  }

  // Helmet Item -> "バァーン！！" (JoJo radial burst cut-in, equips 1-hit non-stacking helmet)
  function triggerHelmetBaan(x, y) {
    // Non-stacking: max 1 helmet stock at all times
    player.hasHelmet = true;
    screenShake = 9;
    sound.playJojoBaan();

    addParticles(x, y, '#facc15', 18, 1.6, true);
    addParticles(x, y, '#38bdf8', 14, 1.4, true);

    targetRipples.push({
      x,
      y,
      radius: 10,
      maxRadius: Math.max(width, height) * 0.78,
      alpha: 0.9,
      color: 'rgba(56, 189, 248, 0.85)',
    });

    baanCutIn = {
      timer: 0,
      maxTimer: 0.95,
      originX: x,
      originY: y,
      lines: Array.from({ length: 28 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 28 + randRange(-0.05, 0.05),
        innerR: randRange(75, 130),
        width: randRange(2, 5.5),
      })),
    };
  }

  // Helmet Obstacle Bounce -> Repels player & obstacle + displays "ズギャーン！！"
  function triggerHelmetBounce(hitObs) {
    player.hasHelmet = false;
    player.helmetInvulnTimer = 0.65;
    player.isDashing = false;
    rhythmTapQueue = [];
    screenShake = 13;
    sound.playHelmetBounce();

    const obsHitR = (hitObs && typeof hitObs.hitRadius === 'number' && !isNaN(hitObs.hitRadius))
      ? hitObs.hitRadius
      : 24;
    const obsX = (hitObs && typeof hitObs.x === 'number' && !isNaN(hitObs.x))
      ? hitObs.x
      : player.x;
    const obsY = (hitObs && typeof hitObs.y === 'number' && !isNaN(hitObs.y))
      ? hitObs.y
      : player.y;

    let bounceAng = Math.atan2(player.y - obsY, player.x - obsX);
    if (Math.hypot(player.y - obsY, player.x - obsX) < 0.01) {
      bounceAng = -player.angle;
    }

    const impactX = (player.x + obsX) * 0.5;
    const impactY = (player.y + obsY) * 0.5;

    // Immediately separate player outside obstacle hit radius
    const minSep = player.radius + obsHitR + 7;
    player.x = clamp(obsX + Math.cos(bounceAng) * minSep, WALL_PADDING, width - WALL_PADDING);
    player.y = clamp(
      obsY + Math.sin(bounceAng) * minSep,
      HUD_TOP_MARGIN + WALL_PADDING,
      height - WALL_PADDING
    );

    // Strong bounce velocity on player
    const bounceSpeed = 620;
    player.vx = Math.cos(bounceAng) * bounceSpeed;
    player.vy = Math.sin(bounceAng) * bounceSpeed;
    player.angle = bounceAng;

    // Also knock the obstacle back in the opposite direction
    if (hitObs && typeof hitObs.vx === 'number' && typeof hitObs.vy === 'number') {
      const obsSpeed = Math.hypot(hitObs.vx, hitObs.vy) || 160;
      hitObs.vx = -Math.cos(bounceAng) * obsSpeed * 1.15;
      hitObs.vy = -Math.sin(bounceAng) * obsSpeed * 1.15;
    }

    addParticles(impactX, impactY, '#38bdf8', 18, 1.8, true);
    addParticles(impactX, impactY, '#facc15', 16, 1.9, true);
    addFloatingText(impactX, impactY - 18, 'ズギャーン！！', '#0284c7', 22);

    targetRipples.push({
      x: impactX,
      y: impactY,
      radius: 8,
      maxRadius: 95,
      alpha: 0.95,
      color: 'rgba(56, 189, 248, 0.95)',
    });

    zugyaanCutIn = {
      timer: 0,
      maxTimer: 0.88,
      originX: impactX,
      originY: impactY,
      slashes: Array.from({ length: 18 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 18 + randRange(-0.08, 0.08),
        innerR: randRange(35, 80),
        outerR: randRange(130, 240),
        width: randRange(2.5, 6),
      })),
    };
  }

  function triggerPoisonDebuff(x, y) {
    playerPoisonTimer = PLAYER_POISON_DURATION;
    screenShake = 7;
    sound.playPoison();

    player.vx *= 0.125;
    player.vy *= 0.125;

    addParticles(x, y, '#a855f7', 16, 1.1, false);
    addParticles(x, y, '#4ade80', 12, 0.9, false);

    poisonCutIn = {
      timer: 0,
      maxTimer: 1.05,
      drips: Array.from({ length: 22 }, (_, i) => ({
        x: ((i + 0.5) / 22) * width + randRange(-8, 8),
        speed: randRange(110, 240),
        len: randRange(45, 130),
        width: randRange(3, 7),
      })),
    };
  }

  // --- Single Robot Vacuum ---
  function initVacuum() {
    const spawnX = width * 0.5;
    const spawnY = HUD_TOP_MARGIN + (height - HUD_TOP_MARGIN) * 0.24;
    const baseSpeed = 150;
    const angle = randRange(0.45, 0.95) * (Math.random() < 0.5 ? 1 : -1);

    vacuum = {
      kind: 'roomba',
      x: spawnX,
      y: spawnY,
      baseSpeed,
      vx: Math.cos(angle) * baseSpeed,
      vy: Math.sin(angle) * baseSpeed,
      radius: 36,
      hitRadius: 30,
      suctionRadius: 62,
      rotation: 0,
      suckAnimTimer: 0,
      hitHighlight: false,
    };
  }

  // --- Increasing Obstacles: Rolling Yarn Ball & Cat Toy ---
  function spawnObstacle(immediate = false) {
    const margin = 40;
    const minY = HUD_TOP_MARGIN + margin;
    const maxY = height - margin;
    const minX = margin;
    const maxX = width - margin;

    let spawnX = randRange(minX, maxX);
    let spawnY = randRange(minY, maxY);

    for (let i = 0; i < 30; i++) {
      const tx = randRange(minX, maxX);
      const ty = randRange(minY, maxY);
      if (dist(tx, ty, player.x, player.y) > 130 && dist(tx, ty, player.targetX, player.targetY) > 95) {
        spawnX = tx;
        spawnY = ty;
        break;
      }
    }

    const isYarn = Math.random() < 0.55;
    let kind = isYarn ? 'yarn' : 'patrol';
    let radius = isYarn ? 20 : 21;
    let speed = (isYarn ? randRange(145, 180) : randRange(130, 168)) + difficultyLevel * 10;
    let angle = Math.random() * Math.PI * 2;

    if (kind === 'yarn') {
      if (Math.abs(Math.cos(angle)) < 0.25) angle += 0.45;
      if (Math.abs(Math.sin(angle)) < 0.25) angle -= 0.45;
    } else {
      const dirs = [0, Math.PI, Math.PI / 2, -Math.PI / 2];
      angle = dirs[Math.floor(Math.random() * dirs.length)] + randRange(-0.18, 0.18);
    }

    if (!immediate) {
      sound.playSpawnWarn();
    }

    obstacles.push({
      kind,
      x: spawnX,
      y: spawnY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      hitRadius: radius * 0.82,
      warningTimer: immediate ? 0 : 1.4,
      rotation: 0,
      tailPhase: Math.random() * Math.PI * 2,
      hitHighlight: false,
    });
  }

  // --- Visual Effects ---
  function addParticles(x, y, color, count = 10, speedScale = 1, forceStar = false) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = randRange(45, 210) * speedScale;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: randRange(2.5, 6.5),
        color,
        life: randRange(0.28, 0.65),
        maxLife: 0.65,
        shape: forceStar || Math.random() < 0.38 ? 'star' : 'circle',
      });
    }
  }

  function addDashEffect(x1, y1, x2, y2, isPoisoned = false) {
    // Disabled to completely eliminate strobe lines during dashing
    return;
  }

  function addFloatingText(x, y, text, color = '#b45309', size = 16) {
    floatingTexts.push({
      x: clamp(x, 45, width - 45),
      y: Math.max(HUD_TOP_MARGIN + 20, y),
      text,
      color,
      size,
      life: 0.75,
      maxLife: 0.75,
    });
  }

  function clearTrackPreview() {
    while (previewTimeouts.length > 0) {
      clearTimeout(previewTimeouts.pop());
    }
  }

  function playRhythmTrackPreview(trackIdx) {
    clearTrackPreview();
    const track = RHYTHM_TRACKS[trackIdx] || RHYTHM_TRACKS[0];
    const beatMs = (60 / track.bpm) * 1000;
    for (let b = 0; b < 4; b++) {
      const tid = setTimeout(() => {
        if (state === 'MODESELECT' && roomType === 'rhythm') {
          sound.playRhythmBeat(b, trackIdx);
        }
      }, Math.round(b * beatMs));
      previewTimeouts.push(tid);
    }
  }

  // --- Start / Reset Game ---
  function startGame(mode) {
    sound.init();
    clearTrackPreview();
    sound.playUIClick();
    gameMode = mode;
    state = 'COUNTDOWN';
    countdownTimer = 3.0;
    lastCountdownBeep = 4;
    startBannerTimer = 0;

    score = 0;
    combo = 0;
    maxCombo = 0;
    foodsCollected = 0;
    elapsedTime = 0;
    difficultyLevel = 1;
    deathSlowMoTimer = 0;
    screenShake = 0;
    crashEffect = null;

    timerItems = [];
    nextTimerItemSpawn = randRange(9.5, 13.5);
    worldSlowTimer = 0;
    gogogoCutIn = null;

    poisonItem = null;
    nextPoisonItemSpawn = randRange(5.5, 8.5);
    playerPoisonTimer = 0;
    poisonCutIn = null;

    helmetItem = null;
    nextHelmetItemSpawn = randRange(13.5, 19.5);
    baanCutIn = null;
    zugyaanCutIn = null;

    rhythmTimer = 0;
    currentBeatIndex = 0;
    rhythmBeatPulse = 0;
    rhythmTapQueue = [];

    livingBgmTimer = 0;
    livingBgmStep = 0;

    // Reset Cat Paw Hazard
    catPaw.active = false;
    catPaw.state = 'idle';
    catPaw.reach = 0;
    catPaw.timer = 0;
    catPaw.nextSpawnTimer = randRange(2.5, 4.5);

    if (gameMode === 'survival') {
      maxTime = 16.0;
      timeLeft = 16.0;
      hud.classList.add('mode-survival');
      hud.classList.remove('mode-timeattack');
    } else {
      maxTime = 60.0;
      timeLeft = 60.0;
      hud.classList.add('mode-timeattack');
      hud.classList.remove('mode-survival');
    }

    player.x = width / 2;
    player.y = HUD_TOP_MARGIN + (height - HUD_TOP_MARGIN) * 0.65;
    player.targetX = player.x;
    player.targetY = player.y;
    player.dashStartX = player.x;
    player.dashStartY = player.y;
    player.isDashing = false;
    player.vx = 0;
    player.vy = 0;
    player.angle = -Math.PI / 2;
    player.walkPhase = 0;
    player.chewTimer = 0;
    player.dashEatCount = 0;
    player.isDizzy = false;
    player.hasHelmet = false;
    player.helmetInvulnTimer = 0;
    player.inertiaFriction = (roomType === 'living' && livingOption === 'ice') ? 1.8 : 9.5;
    player.afterimages = [];

    foods = [];
    obstacles = [];
    particles = [];
    dashStreaks = [];
    floatingTexts = [];
    targetRipples = [];

    initVacuum();
    spawnObstacle(true);
    nextObstacleTimer = 7.5;

    spawnFood(FOOD_TYPES[0]);
    spawnFood(FOOD_TYPES[0]);
    spawnFood(FOOD_TYPES[1]);

    titleScreen.classList.add('hidden');
    modeSelectScreen.classList.add('hidden');
    howtoModal.classList.add('hidden');
    statsModal.classList.add('hidden');
    if (pauseModal) pauseModal.classList.add('hidden');
    isPaused = false;
    gameoverScreen.classList.add('hidden');
    hud.classList.remove('hidden');

    updateHUD();
  }

  function triggerCrashGameOver(hitObs, reasonText, causeKey) {
    if (state !== 'PLAYING') return;
    state = 'DYING';
    deathSlowMoTimer = 1.25;
    deathReason = reasonText;
    deathCause = causeKey;
    resultTitleText.textContent = 'GAME OVER';
    resultReasonEl.classList.remove('clear-badge');

    player.isDashing = false;
    player.isDizzy = true;
    screenShake = 14;
    sound.playCrash();

    const obsX = (hitObs && typeof hitObs.x === 'number' && !isNaN(hitObs.x)) ? hitObs.x : player.x;
    const obsY = (hitObs && typeof hitObs.y === 'number' && !isNaN(hitObs.y)) ? hitObs.y : player.y;

    const angToPlayer = Math.atan2(player.y - obsY, player.x - obsX);
    const impactX = (player.x + obsX) * 0.5;
    const impactY = (player.y + obsY) * 0.5;

    player.vx = Math.cos(angToPlayer) * 340;
    player.vy = Math.sin(angToPlayer) * 340;

    crashEffect = {
      x: impactX,
      y: impactY,
      timer: 0,
      maxTimer: 1.25,
      flashAlpha: 0.65,
      rays: Array.from({ length: 12 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 12 + randRange(-0.12, 0.12),
        len: randRange(26, 48),
      })),
    };

    addParticles(impactX, impactY, '#ef4444', 18, 1.8, false);
    addParticles(impactX, impactY, '#facc15', 16, 2.0, true);
    addFloatingText(impactX, impactY - 18, '💥 CRASH!!', '#dc2626', 20);
  }

  function triggerTimeUpGameOver(reasonText, isClear = false) {
    if (state !== 'PLAYING') return;
    state = 'DYING';
    deathSlowMoTimer = 0.7;
    deathReason = reasonText;
    deathCause = isClear ? 'clear' : 'starve';
    resultTitleText.textContent = isClear ? 'CLEAR!!' : 'TIME UP!';
    if (isClear) {
      resultReasonEl.classList.add('clear-badge');
    } else {
      resultReasonEl.classList.remove('clear-badge');
    }
    crashEffect = null;
  }

  function showGameOverModal() {
    state = 'GAMEOVER';
    hud.classList.add('hidden');
    gameoverScreen.classList.remove('hidden');

    const prevBest = getBestScore(gameMode);
    const isNewRecord = score > prevBest && score > 0;
    const bestScore = isNewRecord ? score : prevBest;
    if (isNewRecord) {
      setBestScore(gameMode, score);
    }

    // Record into lifetime stats & history
    recordGameStats(gameMode, score, foodsCollected, maxCombo, elapsedTime, deathCause);

    resultReasonEl.textContent = deathReason;
    finalScoreEl.textContent = score.toLocaleString();
    if (isNewRecord) {
      newRecordBadge.classList.remove('hidden');
    } else {
      newRecordBadge.classList.add('hidden');
    }

    statFoodsEl.textContent = `${foodsCollected}個`;
    statMaxComboEl.textContent = `${maxCombo} COMBO`;
    statTimeEl.textContent = `${elapsedTime.toFixed(1)}s`;
    statBestEl.textContent = bestScore.toLocaleString();
    renderStatsModalContent();
  }

  function updateHUD() {
    scoreValEl.textContent = score.toLocaleString();

    if (combo >= 2) {
      comboBadge.classList.remove('combo-hidden');
      comboCountEl.textContent = combo;
    } else {
      comboBadge.classList.add('combo-hidden');
    }

    const displayTime = Math.max(0, timeLeft);
    timeTextEl.textContent = `${displayTime.toFixed(1)}s`;
    const ratio = clamp((displayTime / maxTime) * 100, 0, 100);
    timerBarFill.style.width = `${ratio}%`;

    if (displayTime <= 4.0) {
      timerBarFill.classList.add('danger');
    } else {
      timerBarFill.classList.remove('danger');
    }
  }

  function popComboBadge() {
    comboBadge.classList.add('combo-pop');
    setTimeout(() => comboBadge.classList.remove('combo-pop'), 150);
  }

  // --- Input Handling & Rhythm Dash Execution ---
  function executeDashTo(tx, ty) {
    const d = dist(player.x, player.y, tx, ty);
    if (d < 3) return;

    const isPoisoned = playerPoisonTimer > 0;

    player.dashStartX = player.x;
    player.dashStartY = player.y;
    player.targetX = tx;
    player.targetY = ty;
    player.angle = Math.atan2(ty - player.y, tx - player.x);
    player.isDashing = true;
    player.dashEatCount = 0;

    if (roomType === 'rhythm') {
      sound.playRhythmDash(currentBeatIndex, isPoisoned, rhythmTrackIndex);
    } else {
      sound.playDash(isPoisoned);
    }

    // Gentle tiny puff of dust without flashing streaks or strobe ripples
    addParticles(
      player.x,
      player.y,
      isPoisoned ? '#c084fc' : roomType === 'rhythm' ? '#f472b6' : '#fde047',
      3,
      0.45,
      false
    );
  }

  function handleTap(clientX, clientY) {
    if (state !== 'PLAYING' || isPaused) return;
    sound.init();

    const rect = canvas.getBoundingClientRect();
    const rawX = (clientX - rect.left) / viewScaleX;
    const rawY = (clientY - rect.top) / viewScaleY;

    const tx = clamp(rawX, WALL_PADDING, width - WALL_PADDING);
    const ty = clamp(rawY, HUD_TOP_MARGIN + WALL_PADDING, height - WALL_PADDING);

    if (roomType === 'rhythm') {
      // Queue tap for the next beat! Multiple consecutive taps execute on consecutive beats.
      const lastRef =
        rhythmTapQueue.length > 0
          ? rhythmTapQueue[rhythmTapQueue.length - 1]
          : player.isDashing
          ? { x: player.targetX, y: player.targetY }
          : { x: player.x, y: player.y };

      if (dist(lastRef.x, lastRef.y, tx, ty) < 5) return;

      rhythmTapQueue.push({ x: tx, y: ty });
      sound.playQueueTap(rhythmTapQueue.length);
    } else {
      // LIVING ROOM: Immediate high-speed linear dash
      executeDashTo(tx, ty);
    }
  }

  // --- Mobile Touch & Pointer Event Handlers (Zero-Flicker) ---
  let lastCanvasTouchTime = 0;

  canvas.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      if (e.touches && e.touches.length > 0) {
        lastCanvasTouchTime = Date.now();
        const t = e.touches[0];
        handleTap(t.clientX, t.clientY);
      }
    },
    { passive: false }
  );

  canvas.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  canvas.addEventListener('pointerdown', (e) => {
    // If handled by touchstart, ignore duplicate pointerdown
    if (e.pointerType === 'touch' || Date.now() - lastCanvasTouchTime < 450) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    handleTap(e.clientX, e.clientY);
  });

  // Step 1 Title Screen -> Tap anywhere -> Step 2 Mode Select Hub
  titleScreen.addEventListener('click', () => {
    sound.init();
    sound.playUIClick();
    state = 'MODESELECT';
    titleScreen.classList.add('hidden');
    modeSelectScreen.classList.remove('hidden');
    updateRoomSwitchUI();
    renderStatsModalContent();
    if (roomType === 'living') {
      livingBgmTimer = 0;
      livingBgmStep = 0;
      sound.playLivingBgmStep(0);
    } else {
      clearTrackPreview();
      rhythmTimer = 0;
      currentBeatIndex = 0;
      sound.playRhythmBeat(0, rhythmTrackIndex);
    }
  });

  // Step 2 Mode Select Hub -> Tap outside .hub-card -> Return to Step 1 Title Screen!
  modeSelectScreen.addEventListener('click', (e) => {
    if (e.target === modeSelectScreen) {
      sound.init();
      clearTrackPreview();
      sound.playUIClick();
      state = 'TITLE';
      modeSelectScreen.classList.add('hidden');
      titleScreen.classList.remove('hidden');
    }
  });

  // Tap outside modals to close them
  howtoModal.addEventListener('click', (e) => {
    if (e.target === howtoModal) {
      sound.playUIClick();
      howtoModal.classList.add('hidden');
    }
  });

  statsModal.addEventListener('click', (e) => {
    if (e.target === statsModal) {
      sound.playUIClick();
      statsModal.classList.add('hidden');
    }
  });

  // UI Buttons
  if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.init();
      sound.toggleMute();
    });
  }

  let pauseOpenedTime = 0;

  function openPauseMenu() {
    if (state === 'GAMEOVER' || state === 'TITLE' || state === 'MODESELECT') return;
    sound.init();
    sound.playUIClick();
    isPaused = true;
    pauseOpenedTime = Date.now();
    sound.syncVolumeUI();
    if (pauseModal) pauseModal.classList.remove('hidden');
  }

  function closePauseMenu() {
    if (!isPaused) return;
    sound.init();
    sound.playUIClick();
    isPaused = false;
    lastTime = performance.now();
    if (pauseModal) pauseModal.classList.add('hidden');
  }

  function bindInstantTrigger(el, callback) {
    if (!el) return;
    let lastActionTime = 0;
    const handler = (e) => {
      const now = Date.now();
      if (now - lastActionTime < 320) return;
      lastActionTime = now;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      callback();
    };
    el.addEventListener('pointerdown', handler);
    el.addEventListener('touchstart', handler, { passive: false });
    el.addEventListener('click', handler);
  }

  if (menuBtn) {
    bindInstantTrigger(menuBtn, () => {
      if (isPaused) {
        closePauseMenu();
      } else {
        openPauseMenu();
      }
    });
  }

  if (pauseModal) {
    pauseModal.addEventListener('click', (e) => {
      if (e.target === pauseModal) {
        // Prevent accidental backdrop closing from the same touch that opened the menu
        if (Date.now() - pauseOpenedTime < 380) return;
        closePauseMenu();
      }
    });
  }

  bindInstantTrigger(btnPauseResume, () => {
    closePauseMenu();
  });

  bindInstantTrigger(btnPauseRestart, () => {
    isPaused = false;
    if (pauseModal) pauseModal.classList.add('hidden');
    startGame(gameMode);
  });

  bindInstantTrigger(btnPauseTitle, () => {
    isPaused = false;
    if (pauseModal) pauseModal.classList.add('hidden');
    goToTitleScreen();
  });

  bindInstantTrigger(btnPauseMute, () => {
    sound.init();
    sound.toggleMute();
  });

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      sound.init();
      const val = Number(e.target.value) / 100;
      sound.setVolume(val);
    });
  }

  btnSurvival.addEventListener('click', () => startGame('survival'));
  btnTimeattack.addEventListener('click', () => startGame('timeattack'));

  // Room Toggle Button: Switch between LIVINGROOM and RHYTHMROOM
  function updateRoomSwitchUI() {
    if (!hubCard) return;
    const track = RHYTHM_TRACKS[rhythmTrackIndex] || RHYTHM_TRACKS[0];
    if (roomType === 'rhythm') {
      hubCard.classList.add('rhythm-room-active');
      if (roomCurrentBadge) {
        roomCurrentBadge.textContent = `🎵 RHYTHM ROOM (${track.fullName})`;
      }
      if (hubSubText) {
        hubSubText.textContent = 'リズムに合わせて高速移動‼';
      }
      if (pillLiving) pillLiving.classList.remove('active');
      if (pillRhythm) pillRhythm.classList.add('active');
      if (rhythmTrackBadge) {
        rhythmTrackBadge.classList.remove('hidden');
        rhythmTrackBadge.style.borderColor = track.accentColor;
      }
      if (rhythmTrackNameEl) rhythmTrackNameEl.textContent = track.shortLabel;
      if (rhythmTrackBpmEl) rhythmTrackBpmEl.textContent = `BPM${track.bpm} 👆曲変更`;
      if (livingOptionBadge) livingOptionBadge.classList.add('hidden');
    } else {
      hubCard.classList.remove('rhythm-room-active');
      let livingTitle = '🏠 LIVING ROOM';
      if (livingOption === 'cat') livingTitle = '🏠 LIVING ROOM (Cat+)';
      else if (livingOption === 'ice') livingTitle = '🏠 LIVING ROOM (Ice+)';
      if (roomCurrentBadge) roomCurrentBadge.textContent = livingTitle;
      if (hubSubText) hubSubText.textContent = '画面タップの位置に高速移動！';
      if (pillLiving) pillLiving.classList.add('active');
      if (pillRhythm) pillRhythm.classList.remove('active');
      if (rhythmTrackBadge) rhythmTrackBadge.classList.add('hidden');

      if (livingOptionBadge) {
        if (livingOption === 'cat') {
          livingOptionBadge.classList.remove('hidden', 'ice-theme');
          if (livingOptionTextEl) livingOptionTextEl.textContent = '🐾 Cat+';
        } else if (livingOption === 'ice') {
          livingOptionBadge.classList.remove('hidden');
          livingOptionBadge.classList.add('ice-theme');
          if (livingOptionTextEl) livingOptionTextEl.textContent = '❄️ Ice+';
        } else {
          livingOptionBadge.classList.add('hidden');
        }
      }
    }
  }

  if (btnRoomToggle) {
    btnRoomToggle.addEventListener('click', () => {
      sound.init();
      roomType = roomType === 'living' ? 'rhythm' : 'living';
      clearTrackPreview();
      if (roomType === 'rhythm') {
        rhythmTimer = 0;
        currentBeatIndex = 0;
        sound.playRhythmBeat(0, rhythmTrackIndex);
      } else {
        sound.playUIClick();
        livingBgmTimer = 0;
        livingBgmStep = 0;
        sound.playLivingBgmStep(0);
      }
      updateRoomSwitchUI();
    });
  }

  // Center Hamster Tap in Mode Select:
  // - RHYTHM: Switch between 5 tracks
  // - LIVING: 5 taps cycle through 'none' -> 'cat' -> 'ice' -> 'none'
  if (hubCenterHamster) {
    hubCenterHamster.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.init();
      if (roomType === 'rhythm') {
        rhythmTrackIndex = (rhythmTrackIndex + 1) % RHYTHM_TRACKS.length;
        hamsterTapPulseTimer = 0.36;
        rhythmTimer = 0;
        currentBeatIndex = 0;
        sound.playRhythmBeat(0, rhythmTrackIndex);
        updateRoomSwitchUI();
      } else {
        hamsterTapPulseTimer = 0.25;
        livingTapCount++;
        if (livingTapCount >= 5) {
          livingTapCount = 0;
          if (livingOption === 'none') {
            livingOption = 'cat';
          } else if (livingOption === 'cat') {
            livingOption = 'ice';
          } else {
            livingOption = 'none';
          }
          sound.playCountdown(true); // ポップな通知音
        } else {
          sound.playUIClick();
        }
        updateRoomSwitchUI();
      }
    });
  }

  btnHowto.addEventListener('click', () => {
    sound.init();
    sound.playUIClick();
    howtoModal.classList.remove('hidden');
  });

  btnCloseHowto.addEventListener('click', () => {
    sound.init();
    sound.playUIClick();
    howtoModal.classList.add('hidden');
  });

  btnStats.addEventListener('click', () => {
    sound.init();
    sound.playUIClick();
    renderStatsModalContent();
    statsModal.classList.remove('hidden');
  });

  btnCloseStats.addEventListener('click', () => {
    sound.init();
    sound.playUIClick();
    statsModal.classList.add('hidden');
  });

  btnRetry.addEventListener('click', () => startGame(gameMode));

  // Game Over -> Return to Title Screen first!
  function goToTitleScreen() {
    sound.init();
    clearTrackPreview();
    sound.playUIClick();
    isPaused = false;
    state = 'TITLE';
    if (pauseModal) pauseModal.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    modeSelectScreen.classList.add('hidden');
    hud.classList.add('hidden');
    titleScreen.classList.remove('hidden');
  }

  btnHome.addEventListener('click', goToTitleScreen);

  gameoverScreen.addEventListener('click', (e) => {
    if (e.target === gameoverScreen) {
      goToTitleScreen();
    }
  });

  // --- Collect Food Logic ---
  function collectFood(food, index) {
    foods.splice(index, 1);
    foodsCollected++;
    combo++;
    if (combo > maxCombo) maxCombo = combo;
    player.chewTimer = 0.35;
    player.dashEatCount++;

    const comboMultiplier = 1 + Math.min(combo - 1, 20) * 0.15;
    const multiDashBonus = player.dashEatCount >= 2 ? player.dashEatCount : 1;
    const gainedScore = Math.round(food.type.baseScore * comboMultiplier * multiDashBonus);
    score += gainedScore;

    if (gameMode === 'survival') {
      const decay = Math.max(0.62, 1 - elapsedTime * 0.0045);
      const addedTime = food.type.timeBonus * decay;
      timeLeft = Math.min(maxTime, timeLeft + addedTime);
      addFloatingText(
        food.x,
        food.y - 14,
        `+${gainedScore.toLocaleString()} (+${addedTime.toFixed(1)}s)`,
        '#15803d',
        14
      );
    } else {
      addFloatingText(food.x, food.y - 14, `+${gainedScore.toLocaleString()}`, '#b45309', 15);
    }

    if (player.dashEatCount >= 2) {
      addFloatingText(player.x, player.y - 28, `⚡ ${player.dashEatCount}連ダッシュ!`, '#dc2626', 16);
    }

    sound.playEat(combo, food.type.id !== 'seed');
    popComboBadge();

    const pColor = food.type.id === 'gold' ? '#facc15' : food.type.id === 'cheese' ? '#fb923c' : '#84cc16';
    addParticles(food.x, food.y, pColor, 12, 1.0);

    const targetFoodCount = difficultyLevel >= 3 ? 4 : 3;
    while (foods.length < targetFoodCount) {
      spawnFood();
    }
  }

  // --- Helper: Vacuum Suction on Any Item ---
  function applyVacuumSuctionToItem(item, worldDt) {
    if (!vacuum || !item) return false;
    const d = dist(vacuum.x, vacuum.y, item.x, item.y);

    if (d < vacuum.suctionRadius + item.radius) {
      item.beingSucked = true;
      const pullStrength = 250 * worldDt;
      const ang = Math.atan2(vacuum.y - item.y, vacuum.x - item.x);
      item.x += Math.cos(ang) * pullStrength;
      item.y += Math.sin(ang) * pullStrength;
      item.scale = Math.max(0.25, item.scale - worldDt * 2.5);
    } else {
      item.beingSucked = false;
    }

    if (d < vacuum.radius + item.radius * 0.35) {
      vacuum.suckAnimTimer = 0.32;
      sound.playVacuumSuck();
      addParticles(vacuum.x, vacuum.y, '#94a3b8', 8, 0.7);
      return true;
    }
    return false;
  }

  // --- Update Loop ---
  function update(rawDt) {
    if (hamsterTapPulseTimer > 0) {
      hamsterTapPulseTimer = Math.max(0, hamsterTapPulseTimer - rawDt);
    }

    // Play Living Room Suika-style BGM while in Mode Select (when LIVING ROOM is selected)
    if (state === 'MODESELECT' && roomType === 'living') {
      livingBgmTimer += rawDt;
      while (livingBgmTimer >= LIVING_BGM_STEP_INTERVAL) {
        livingBgmTimer -= LIVING_BGM_STEP_INTERVAL;
        livingBgmStep = (livingBgmStep + 1) % 32;
        sound.playLivingBgmStep(livingBgmStep);
      }
    }

    // Play Rhythm Room groove BGM while in Mode Select (when RHYTHM ROOM is selected)
    if (state === 'MODESELECT' && roomType === 'rhythm') {
      const beatInterval = getRhythmBeatInterval();
      rhythmTimer += rawDt;
      while (rhythmTimer >= beatInterval) {
        rhythmTimer -= beatInterval;
        currentBeatIndex = (currentBeatIndex + 1) % RHYTHM_BEATS;
        rhythmBeatPulse = 1.0;
        sound.playRhythmBeat(currentBeatIndex, rhythmTrackIndex);
      }
    }

    if (isPaused) return;

    if (screenShake > 0) {
      screenShake = Math.max(0, screenShake - rawDt * 22);
    }

    if (gogogoCutIn) {
      gogogoCutIn.timer += rawDt;
      if (gogogoCutIn.timer >= gogogoCutIn.maxTimer) {
        gogogoCutIn = null;
      }
    }

    if (poisonCutIn) {
      poisonCutIn.timer += rawDt;
      if (poisonCutIn.timer >= poisonCutIn.maxTimer) {
        poisonCutIn = null;
      }
    }

    if (baanCutIn) {
      baanCutIn.timer += rawDt;
      if (baanCutIn.timer >= baanCutIn.maxTimer) {
        baanCutIn = null;
      }
    }

    if (zugyaanCutIn) {
      zugyaanCutIn.timer += rawDt;
      if (zugyaanCutIn.timer >= zugyaanCutIn.maxTimer) {
        zugyaanCutIn = null;
      }
    }

    if (startBannerTimer > 0) {
      startBannerTimer = Math.max(0, startBannerTimer - rawDt);
    }

    // --- Shorter, Brisker 3-2-1 Countdown State (1.85x speed = ~1.6s total) ---
    if (state === 'COUNTDOWN') {
      for (const f of foods) {
        f.scale = Math.min(1, f.scale + rawDt * 8);
        f.bobPhase += rawDt * 3;
      }
      const currentSec = Math.ceil(countdownTimer);
      if (currentSec < lastCountdownBeep && currentSec >= 1) {
        lastCountdownBeep = currentSec;
        sound.playCountdown(false);
      }

      countdownTimer -= rawDt * 1.85;
      if (countdownTimer <= 0) {
        state = 'PLAYING';
        startBannerTimer = 0.42;
        sound.playCountdown(true);
        if (roomType === 'rhythm') {
          rhythmTimer = 0;
          currentBeatIndex = 0;
          rhythmBeatPulse = 1.0;
          sound.playRhythmBeat(0, rhythmTrackIndex);
        } else {
          livingBgmTimer = 0;
          livingBgmStep = 0;
          sound.playLivingBgmStep(0);
        }
      }
      return;
    }

    const crashTimeScale = state === 'DYING' ? 0.18 : 1.0;
    const dt = rawDt * crashTimeScale;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * (state === 'DYING' ? rawDt * 0.35 : dt);
      p.y += p.vy * (state === 'DYING' ? rawDt * 0.35 : dt);
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= state === 'DYING' ? rawDt * 0.55 : dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = dashStreaks.length - 1; i >= 0; i--) {
      const ds = dashStreaks[i];
      ds.life -= dt;
      if (ds.life <= 0) dashStreaks.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 38 * (state === 'DYING' ? rawDt * 0.45 : dt);
      ft.life -= state === 'DYING' ? rawDt * 0.6 : dt;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    for (let i = targetRipples.length - 1; i >= 0; i--) {
      const r = targetRipples[i];
      r.radius += (r.maxRadius - r.radius) * 10 * dt;
      r.alpha -= dt * 2.2;
      if (r.alpha <= 0) targetRipples.splice(i, 1);
    }

    for (let i = player.afterimages.length - 1; i >= 0; i--) {
      player.afterimages[i].alpha -= dt * 4.2;
      if (player.afterimages[i].alpha <= 0) {
        player.afterimages.splice(i, 1);
      }
    }

    const minX = WALL_PADDING;
    const maxX = width - WALL_PADDING;
    const minY = HUD_TOP_MARGIN + WALL_PADDING;
    const maxY = height - WALL_PADDING;

    // --- Slow-Motion Crash Sequence (`DYING` state) ---
    if (state === 'DYING') {
      if (crashEffect) {
        crashEffect.timer += rawDt;
        crashEffect.flashAlpha = Math.max(0, crashEffect.flashAlpha - rawDt * 2.2);
      }

      player.x = clamp(player.x + player.vx * dt, minX, maxX);
      player.y = clamp(player.y + player.vy * dt, minY, maxY);
      player.angle += rawDt * 5.5;

      if (vacuum) {
        vacuum.x += vacuum.vx * dt;
        vacuum.y += vacuum.vy * dt;
        vacuum.rotation += (Math.hypot(vacuum.vx, vacuum.vy) * dt) / vacuum.radius;
      }
      for (const obs of obstacles) {
        if (obs.warningTimer <= 0) {
          obs.x += obs.vx * dt;
          obs.y += obs.vy * dt;
          obs.rotation += (Math.hypot(obs.vx, obs.vy) * dt) / obs.radius;
        }
      }

      deathSlowMoTimer -= rawDt;
      if (deathSlowMoTimer <= 0) {
        showGameOverModal();
      }
      return;
    }

    if (state !== 'PLAYING') return;

    // --- 8-Beat Rhythm Clock & Queued Dash Trigger (RHYTHM ROOM) or Suika-Style BGM (LIVING ROOM) ---
    if (roomType === 'rhythm') {
      const beatInterval = getRhythmBeatInterval();
      rhythmBeatPulse = Math.max(0, rhythmBeatPulse - rawDt * 4.5);
      rhythmTimer += rawDt;
      while (rhythmTimer >= beatInterval) {
        rhythmTimer -= beatInterval;
        currentBeatIndex = (currentBeatIndex + 1) % RHYTHM_BEATS;
        rhythmBeatPulse = 1.0;
        sound.playRhythmBeat(currentBeatIndex, rhythmTrackIndex);

        if (rhythmTapQueue.length > 0) {
          const nextTap = rhythmTapQueue.shift();
          executeDashTo(nextTap.x, nextTap.y);
        }
      }
    } else {
      livingBgmTimer += rawDt;
      while (livingBgmTimer >= LIVING_BGM_STEP_INTERVAL) {
        livingBgmTimer -= LIVING_BGM_STEP_INTERVAL;
        livingBgmStep = (livingBgmStep + 1) % 32;
        sound.playLivingBgmStep(livingBgmStep);
      }
    }

    // --- Cat Paw Hazard Update (Cat+) ---
    updateCatPaw(dt);

    // --- World Slow-Motion Factor ---
    if (worldSlowTimer > 0) {
      worldSlowTimer = Math.max(0, worldSlowTimer - dt);
    }
    const worldDt = worldSlowTimer > 0 ? dt * 0.22 : dt;

    // --- Player Helmet Invulnerability Grace Timer ---
    if (player.helmetInvulnTimer > 0) {
      player.helmetInvulnTimer = Math.max(0, player.helmetInvulnTimer - dt);
    }

    // --- Player Poison Debuff Timer (5s player speed 1/8) ---
    if (playerPoisonTimer > 0) {
      playerPoisonTimer = Math.max(0, playerPoisonTimer - dt);
      if (Math.random() < 0.28) {
        particles.push({
          x: player.x + randRange(-8, 8),
          y: player.y + randRange(-8, 8),
          vx: randRange(-12, 12),
          vy: randRange(-35, -15),
          size: randRange(2.5, 4.5),
          color: Math.random() < 0.5 ? '#a855f7' : '#4ade80',
          life: 0.35,
          maxLife: 0.35,
          shape: 'circle',
        });
      }
    }

    // Ensure player coordinates are always valid numbers
    if (isNaN(player.x) || isNaN(player.y) || isNaN(player.vx) || isNaN(player.vy)) {
      player.x = width / 2;
      player.y = HUD_TOP_MARGIN + (height - HUD_TOP_MARGIN) * 0.65;
      player.vx = 0;
      player.vy = 0;
    }

    // Time & Difficulty Progression
    elapsedTime += dt;
    timeLeft -= dt;

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateHUD();
      if (gameMode === 'timeattack') {
        sound.playTimeUp(true);
        triggerTimeUpGameOver('🎉 60秒完走！お腹いっぱい大満足！', true);
      } else {
        sound.playTimeUp(false);
        triggerTimeUpGameOver('⏳ 時間切れ！お腹がすいて動けない…', false);
      }
      return;
    }

    difficultyLevel = 1 + Math.floor(elapsedTime / 11);

    // --- Periodically Spawn Timer Item ---
    if (timerItems.length === 0 && worldSlowTimer <= 0) {
      nextTimerItemSpawn -= dt;
      if (nextTimerItemSpawn <= 0) {
        spawnTimerItem();
        nextTimerItemSpawn = randRange(13.0, 17.5);
      }
    }

    for (let i = timerItems.length - 1; i >= 0; i--) {
      const ti = timerItems[i];
      if (!ti.beingSucked) {
        ti.scale = Math.min(1, ti.scale + dt * 6);
      }
      ti.pulsePhase += dt * 6;
      ti.life -= worldDt;
      if (ti.life <= 0) {
        timerItems.splice(i, 1);
      }
    }

    // --- Periodically Spawn Poison Item ---
    if (!poisonItem) {
      nextPoisonItemSpawn -= dt;
      if (nextPoisonItemSpawn <= 0) {
        spawnPoisonItem();
        nextPoisonItemSpawn = randRange(7.5, 11.5);
      }
    } else {
      if (!poisonItem.beingSucked) {
        poisonItem.scale = Math.min(1, poisonItem.scale + dt * 6);
      }
      poisonItem.bobPhase += dt * 4;
    }

    // --- Periodically Spawn Helmet Item (Low spawn rate, max 1 on screen, non-stacking stock) ---
    if (!helmetItem) {
      nextHelmetItemSpawn -= dt;
      if (nextHelmetItemSpawn <= 0) {
        spawnHelmetItem();
        nextHelmetItemSpawn = randRange(18.0, 26.0);
      }
    } else {
      if (!helmetItem.beingSucked) {
        helmetItem.scale = Math.min(1, helmetItem.scale + dt * 6);
      }
      helmetItem.bobPhase += dt * 5;
      helmetItem.life -= worldDt;
      if (helmetItem.life <= 0) {
        helmetItem = null;
        nextHelmetItemSpawn = randRange(18.0, 26.0);
      }
    }

    // --- Spawn Additional Obstacles Over Time ---
    const maxExtraObstacles = Math.min(6, 1 + Math.floor(elapsedTime / 11));
    nextObstacleTimer -= worldDt;
    if (obstacles.length < maxExtraObstacles && nextObstacleTimer <= 0) {
      spawnObstacle(false);
      nextObstacleTimer = randRange(7.5, 10.5);
    }

    // --- Update the Single Robot Vacuum ---
    if (vacuum) {
      if (vacuum.suckAnimTimer > 0) {
        vacuum.suckAnimTimer = Math.max(0, vacuum.suckAnimTimer - dt);
      }

      const targetSpeed = Math.min(260, vacuum.baseSpeed + (difficultyLevel - 1) * 12);

      let nearestTarget = null;
      let nearestDist = 155;
      for (const f of foods) {
        const d = dist(vacuum.x, vacuum.y, f.x, f.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearestTarget = f;
        }
      }

      if (nearestTarget) {
        const desiredAngle = Math.atan2(nearestTarget.y - vacuum.y, nearestTarget.x - vacuum.x);
        const curAngle = Math.atan2(vacuum.vy, vacuum.vx);
        let diff = desiredAngle - curAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turnRate = 1.05 * worldDt;
        const newAngle = curAngle + clamp(diff, -turnRate, turnRate);
        vacuum.vx = Math.cos(newAngle) * targetSpeed;
        vacuum.vy = Math.sin(newAngle) * targetSpeed;
      } else {
        const curAngle = Math.atan2(vacuum.vy, vacuum.vx);
        vacuum.vx = Math.cos(curAngle) * targetSpeed;
        vacuum.vy = Math.sin(curAngle) * targetSpeed;
      }

      vacuum.x += vacuum.vx * worldDt;
      vacuum.y += vacuum.vy * worldDt;
      vacuum.rotation += (targetSpeed * worldDt) / vacuum.radius;

      if (vacuum.x - vacuum.radius < minX) {
        vacuum.x = minX + vacuum.radius;
        vacuum.vx = Math.abs(vacuum.vx);
        vacuum.vy += randRange(-20, 20);
      } else if (vacuum.x + vacuum.radius > maxX) {
        vacuum.x = maxX - vacuum.radius;
        vacuum.vx = -Math.abs(vacuum.vx);
        vacuum.vy += randRange(-20, 20);
      }

      if (vacuum.y - vacuum.radius < minY) {
        vacuum.y = minY + vacuum.radius;
        vacuum.vy = Math.abs(vacuum.vy);
        vacuum.vx += randRange(-20, 20);
      } else if (vacuum.y + vacuum.radius > maxY) {
        vacuum.y = maxY - vacuum.radius;
        vacuum.vy = -Math.abs(vacuum.vy);
        vacuum.vx += randRange(-20, 20);
      }

      for (let fi = foods.length - 1; fi >= 0; fi--) {
        if (applyVacuumSuctionToItem(foods[fi], worldDt)) {
          foods.splice(fi, 1);
          spawnFood();
        }
      }

      for (let ti = timerItems.length - 1; ti >= 0; ti--) {
        if (applyVacuumSuctionToItem(timerItems[ti], worldDt)) {
          timerItems.splice(ti, 1);
        }
      }

      if (poisonItem && applyVacuumSuctionToItem(poisonItem, worldDt)) {
        poisonItem = null;
        nextPoisonItemSpawn = randRange(7.5, 11.5);
      }

      if (helmetItem && applyVacuumSuctionToItem(helmetItem, worldDt)) {
        helmetItem = null;
        nextHelmetItemSpawn = randRange(18.0, 26.0);
      }
    }

    // --- Update Extra Obstacles ---
    for (const obs of obstacles) {
      if (obs.warningTimer > 0) {
        obs.warningTimer = Math.max(0, obs.warningTimer - worldDt);
        continue;
      }

      obs.x += obs.vx * worldDt;
      obs.y += obs.vy * worldDt;
      obs.rotation += (Math.hypot(obs.vx, obs.vy) * worldDt) / obs.radius;
      obs.tailPhase += worldDt * 10;

      if (obs.x - obs.radius < minX) {
        obs.x = minX + obs.radius;
        obs.vx = Math.abs(obs.vx);
      } else if (obs.x + obs.radius > maxX) {
        obs.x = maxX - obs.radius;
        obs.vx = -Math.abs(obs.vx);
      }

      if (obs.y - obs.radius < minY) {
        obs.y = minY + obs.radius;
        obs.vy = Math.abs(obs.vy);
      } else if (obs.y + obs.radius > maxY) {
        obs.y = maxY - obs.radius;
        obs.vy = -Math.abs(obs.vy);
      }
    }

    // --- Update Player High-Speed Linear Dash & Inertia ---
    const playerSpeedMultiplier = playerPoisonTimer > 0 ? 0.125 : 1.0;
    const currentDashSpeed = player.baseDashSpeed * playerSpeedMultiplier;

    if (player.chewTimer > 0) {
      player.chewTimer = Math.max(0, player.chewTimer - dt);
    }

    if (player.isDashing) {
      const dx = player.targetX - player.x;
      const dy = player.targetY - player.y;
      const remDist = Math.hypot(dx, dy);
      const stepDist = currentDashSpeed * dt;

      const moveDist = Math.min(remDist, stepDist);
      const subSteps = Math.max(1, Math.ceil(moveDist / 5));
      const ux = remDist > 0.0001 ? dx / remDist : 0;
      const uy = remDist > 0.0001 ? dy / remDist : 0;
      const subMove = moveDist / subSteps;

      player.walkPhase += moveDist * 0.25;

      for (let s = 0; s < subSteps; s++) {
        player.x += ux * subMove + player.vx * 0.12 * (dt / subSteps);
        player.y += uy * subMove + player.vy * 0.12 * (dt / subSteps);

        player.x = clamp(player.x, minX, maxX);
        player.y = clamp(player.y, minY, maxY);

        // Afterimages disabled for a completely clean, crisp, flicker-free movement

        if (Math.random() < 0.45) {
          particles.push({
            x: player.x + randRange(-6, 6),
            y: player.y + randRange(-6, 6),
            vx: -ux * randRange(30, 90) + randRange(-25, 25),
            vy: -uy * randRange(30, 90) + randRange(-25, 25),
            size: randRange(2, 4.5),
            color:
              playerPoisonTimer > 0
                ? '#c084fc'
                : Math.random() < 0.5
                ? '#fde047'
                : '#ffffff',
            life: randRange(0.16, 0.3),
            maxLife: 0.3,
            shape: playerPoisonTimer > 0 ? 'circle' : 'star',
          });
        }

        checkPlayerFoodAndItemCollection();

        if (checkAllCollisions()) {
          return;
        }
      }

      if (remDist <= stepDist) {
        const baseSlideSpeed = (roomType === 'living' && livingOption === 'ice') ? 540 : 300;
        const slideInitialSpeed = baseSlideSpeed * playerSpeedMultiplier;
        player.vx = ux * slideInitialSpeed;
        player.vy = uy * slideInitialSpeed;
        player.isDashing = false;
      }
    } else {
      const speed = Math.hypot(player.vx, player.vy);
      if (speed > 4) {
        player.x += player.vx * dt;
        player.y += player.vy * dt;
        player.walkPhase += speed * dt * 0.22;

        if (speed > 90 && Math.random() < 0.35) {
          particles.push({
            x: player.x - Math.cos(player.angle) * 8 + randRange(-4, 4),
            y: player.y - Math.sin(player.angle) * 8 + randRange(-4, 4),
            vx: randRange(-15, 15),
            vy: randRange(-15, 15),
            size: randRange(2, 3.5),
            color: 'rgba(217, 119, 6, 0.35)',
            life: 0.2,
            maxLife: 0.2,
            shape: 'circle',
          });
        }

        const damping = Math.exp(-player.inertiaFriction * dt);
        player.vx *= damping;
        player.vy *= damping;

        if (player.x < minX) {
          player.x = minX;
          player.vx *= -0.3;
        } else if (player.x > maxX) {
          player.x = maxX;
          player.vx *= -0.3;
        }
        if (player.y < minY) {
          player.y = minY;
          player.vy *= -0.3;
        } else if (player.y > maxY) {
          player.y = maxY;
          player.vy *= -0.3;
        }
      } else {
        player.vx = 0;
        player.vy = 0;
      }

      checkPlayerFoodAndItemCollection();
      if (checkAllCollisions()) {
        return;
      }
    }

    // Update Foods
    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      if (!f.beingSucked) {
        f.scale = Math.min(1, f.scale + dt * 6);
      }
      f.bobPhase += worldDt * 4.5;
      f.life -= worldDt;

      if (f.life <= 0) {
        foods.splice(i, 1);
        if (combo > 0) {
          combo = 0;
        }
        spawnFood();
      }
    }

    updateHUD();
  }

  function checkPlayerFoodAndItemCollection() {
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const f = foods[fi];
      if (dist(player.x, player.y, f.x, f.y) <= player.radius + f.radius + 5) {
        collectFood(f, fi);
      }
    }

    for (let ti = timerItems.length - 1; ti >= 0; ti--) {
      const item = timerItems[ti];
      if (dist(player.x, player.y, item.x, item.y) <= player.radius + item.radius + 6) {
        timerItems.splice(ti, 1);
        triggerTimerGogogo(item.x, item.y);
      }
    }

    if (poisonItem) {
      if (dist(player.x, player.y, poisonItem.x, poisonItem.y) <= player.radius + poisonItem.radius + 4) {
        const px = poisonItem.x;
        const py = poisonItem.y;
        poisonItem = null;
        nextPoisonItemSpawn = randRange(7.5, 11.5);
        triggerPoisonDebuff(px, py);
      }
    }

    if (helmetItem) {
      if (dist(player.x, player.y, helmetItem.x, helmetItem.y) <= player.radius + helmetItem.radius + 5) {
        const hx = helmetItem.x;
        const hy = helmetItem.y;
        helmetItem = null;
        nextHelmetItemSpawn = randRange(18.0, 26.0);
        triggerHelmetBaan(hx, hy);
      }
    }
  }

  // --- Cat Paw Hazard Helpers (Cat+) ---
  function getCatPawRect() {
    if (catPaw.state === 'idle' || catPaw.reach <= 0) return null;
    const minX = WALL_PADDING;
    const maxX = width - WALL_PADDING;
    const minY = HUD_TOP_MARGIN + WALL_PADDING;
    const maxY = height - WALL_PADDING;
    const halfW = catPaw.width / 2;

    if (catPaw.side === 'top') {
      return { x: catPaw.coord - halfW, y: minY, w: catPaw.width, h: catPaw.reach };
    } else if (catPaw.side === 'bottom') {
      return { x: catPaw.coord - halfW, y: maxY - catPaw.reach, w: catPaw.width, h: catPaw.reach };
    } else if (catPaw.side === 'left') {
      return { x: minX, y: catPaw.coord - halfW, w: catPaw.reach, h: catPaw.width };
    } else {
      return { x: maxX - catPaw.reach, y: catPaw.coord - halfW, w: catPaw.reach, h: catPaw.width };
    }
  }

  function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
    const clampedX = clamp(cx, rx, rx + rw);
    const clampedY = clamp(cy, ry, ry + rh);
    return dist(cx, cy, clampedX, clampedY) < cr;
  }

  function handleObstacleCatPawBounce(obs) {
    if (roomType !== 'living' || livingOption !== 'cat' || catPaw.state === 'idle' || catPaw.reach < 6) return;
    const rect = getCatPawRect();
    if (!rect) return;
    if (!circleRectCollision(obs.x, obs.y, obs.radius, rect.x, rect.y, rect.w, rect.h)) return;

    // Bounce obstacle like a solid wall
    const minX = WALL_PADDING;
    const maxX = width - WALL_PADDING;
    const minY = HUD_TOP_MARGIN + WALL_PADDING;
    const maxY = height - WALL_PADDING;

    if (catPaw.side === 'top') {
      obs.y = minY + catPaw.reach + obs.radius + 1;
      obs.vy = Math.abs(obs.vy) || 120;
    } else if (catPaw.side === 'bottom') {
      obs.y = maxY - catPaw.reach - obs.radius - 1;
      obs.vy = -Math.abs(obs.vy) || -120;
    } else if (catPaw.side === 'left') {
      obs.x = minX + catPaw.reach + obs.radius + 1;
      obs.vx = Math.abs(obs.vx) || 120;
    } else if (catPaw.side === 'right') {
      obs.x = maxX - catPaw.reach - obs.radius - 1;
      obs.vx = -Math.abs(obs.vx) || -120;
    }

    addParticles(obs.x, obs.y, '#f59e0b', 6, 0.6);
  }

  function updateCatPaw(dt) {
    if (roomType !== 'living' || livingOption !== 'cat') {
      catPaw.state = 'idle';
      catPaw.reach = 0;
      return;
    }

    const minX = WALL_PADDING;
    const maxX = width - WALL_PADDING;
    const minY = HUD_TOP_MARGIN + WALL_PADDING;
    const maxY = height - WALL_PADDING;

    if (catPaw.state === 'idle') {
      catPaw.nextSpawnTimer -= dt;
      if (catPaw.nextSpawnTimer <= 0) {
        catPaw.state = 'warn';
        catPaw.timer = 0;
        const sides = ['top', 'bottom', 'left', 'right'];
        catPaw.side = sides[Math.floor(Math.random() * sides.length)];

        if (catPaw.side === 'top' || catPaw.side === 'bottom') {
          catPaw.coord = randRange(minX + 40, maxX - 40);
          catPaw.maxReach = (maxY - minY) * randRange(0.40, 0.50);
        } else {
          catPaw.coord = randRange(minY + 40, maxY - 40);
          catPaw.maxReach = (maxX - minX) * randRange(0.40, 0.50);
        }
        sound.playSpawnWarn();
      }
    } else if (catPaw.state === 'warn') {
      catPaw.timer += dt;
      if (catPaw.timer >= catPaw.warnDuration) {
        catPaw.state = 'thrust';
        catPaw.reach = 0;
        sound.playDash(false);
      }
    } else if (catPaw.state === 'thrust') {
      catPaw.reach += catPaw.thrustSpeed * dt;
      if (catPaw.reach >= catPaw.maxReach) {
        catPaw.reach = catPaw.maxReach;
        catPaw.state = 'hold';
        catPaw.timer = 0;
      }
    } else if (catPaw.state === 'hold') {
      catPaw.timer += dt;
      if (catPaw.timer >= catPaw.holdDuration) {
        catPaw.state = 'retract';
      }
    } else if (catPaw.state === 'retract') {
      catPaw.reach -= catPaw.retractSpeed * dt;
      if (catPaw.reach <= 0) {
        catPaw.reach = 0;
        catPaw.state = 'idle';
        catPaw.nextSpawnTimer = randRange(3.2, 5.2);
      }
    }

    // Check collision with obstacles bouncing on cat paw
    if (catPaw.reach > 4) {
      if (vacuum) handleObstacleCatPawBounce(vacuum);
      for (const obs of obstacles) {
        handleObstacleCatPawBounce(obs);
      }
    }
  }

  function checkAllCollisions() {
    if (player.helmetInvulnTimer > 0) {
      return false;
    }

    // Cat Paw Collision (Cat+)
    if (roomType === 'living' && livingOption === 'cat' && catPaw.state !== 'idle' && catPaw.reach > 6) {
      const rect = getCatPawRect();
      if (rect && circleRectCollision(player.x, player.y, player.radius, rect.x, rect.y, rect.w, rect.h)) {
        const pawCenter = {
          x: rect.x + rect.w / 2,
          y: rect.y + rect.h / 2,
          hitRadius: Math.min(rect.w, rect.h) * 0.5,
          vx: 0,
          vy: 0
        };
        if (player.hasHelmet) {
          triggerHelmetBounce(pawCenter);
          catPaw.state = 'retract';
          return true;
        }
        triggerCrashGameOver(pawCenter, '🐾 飛び出してきた猫の手に捕まった！', 'cat');
        return true;
      }
    }

    if (vacuum) {
      const d = dist(player.x, player.y, vacuum.x, vacuum.y);
      if (d < player.radius + vacuum.hitRadius) {
        if (player.hasHelmet) {
          triggerHelmetBounce(vacuum);
          return true;
        }
        vacuum.hitHighlight = true;
        triggerCrashGameOver(vacuum, '💥 お掃除ロボに激突！', 'roomba');
        return true;
      }
    }

    for (const obs of obstacles) {
      if (obs.warningTimer > 0) continue;
      const d = dist(player.x, player.y, obs.x, obs.y);
      if (d < player.radius + obs.hitRadius) {
        if (player.hasHelmet) {
          triggerHelmetBounce(obs);
          return true;
        }
        obs.hitHighlight = true;
        const reason =
          obs.kind === 'yarn' ? '💥 転がる毛糸玉に激突！' : '💥 ネコのおもちゃに激突！';
        triggerCrashGameOver(obs, reason, obs.kind);
        return true;
      }
    }

    return false;
  }

  // --- Rendering ---
  function drawRhythmPerimeter(rx, ry, rw, rh) {
    const xL = rx;
    const xM = rx + rw * 0.5;
    const xR = rx + rw;
    const yT = ry;
    const yM = ry + rh * 0.5;
    const yB = ry + rh;

    // 8 Beat Points around the perimeter: 4 Corners (0,2,4,6) & 4 Edge Midpoints (1,3,5,7)
    const pts = [
      { x: xL, y: yT, isCorner: true },  // Beat 1: Top-Left Corner
      { x: xM, y: yT, isCorner: false }, // Beat 2: Top Edge Center
      { x: xR, y: yT, isCorner: true },  // Beat 3: Top-Right Corner
      { x: xR, y: yM, isCorner: false }, // Beat 4: Right Edge Center
      { x: xR, y: yB, isCorner: true },  // Beat 5: Bottom-Right Corner
      { x: xM, y: yB, isCorner: false }, // Beat 6: Bottom Edge Center
      { x: xL, y: yB, isCorner: true },  // Beat 7: Bottom-Left Corner
      { x: xL, y: yM, isCorner: false }, // Beat 8: Left Edge Center
    ];

    function getPointAtBeat(beatVal) {
      const wrapped = ((beatVal % RHYTHM_BEATS) + RHYTHM_BEATS) % RHYTHM_BEATS;
      const i0 = Math.floor(wrapped);
      const i1 = (i0 + 1) % RHYTHM_BEATS;
      const f = wrapped - i0;
      return {
        x: pts[i0].x + (pts[i1].x - pts[i0].x) * f,
        y: pts[i0].y + (pts[i1].y - pts[i0].y) * f,
      };
    }

    ctx.save();

    // Outer perimeter rhythm track
    ctx.strokeStyle = `rgba(147, 51, 234, ${0.32 + rhythmBeatPulse * 0.28})`;
    ctx.lineWidth = 5;
    ctx.strokeRect(rx, ry, rw, rh);

    const beatInterval = getRhythmBeatInterval();
    const frac = state === 'PLAYING' ? clamp(rhythmTimer / beatInterval, 0, 1) : 0;
    const currentContinuousBeat = currentBeatIndex + frac;

    // 1. Draw glowing comet trail of the orbiting light along the perimeter
    const trailSteps = 18;
    const trailSpanBeats = 0.85;
    for (let s = 0; s < trailSteps; s++) {
      const t0 = currentContinuousBeat - ((trailSteps - s) / trailSteps) * trailSpanBeats;
      const t1 = currentContinuousBeat - ((trailSteps - s - 1) / trailSteps) * trailSpanBeats;
      const p0 = getPointAtBeat(t0);
      const p1 = getPointAtBeat(t1);
      const ratio = (s + 1) / trailSteps;

      ctx.strokeStyle =
        ratio > 0.7
          ? `rgba(253, 224, 71, ${ratio * 0.95})`
          : `rgba(236, 72, 153, ${ratio * 0.8})`;
      ctx.lineWidth = 2.5 + ratio * 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    // 2. Draw the 8 Beat Nodes (4 Corners + 4 Edge Midpoints)
    const nextBeatIdx = (currentBeatIndex + 1) % RHYTHM_BEATS;
    for (let i = 0; i < RHYTHM_BEATS; i++) {
      const pt = pts[i];
      const isCurrentHit = i === currentBeatIndex;
      const isNextTarget = i === nextBeatIdx;
      const baseR = pt.isCorner ? 7.2 : 6.0;

      // Pulse ring on the node that just triggered the beat
      if (isCurrentHit && rhythmBeatPulse > 0.05) {
        const ringR = baseR + (1 - rhythmBeatPulse) * 18;
        ctx.strokeStyle = `rgba(250, 204, 21, ${rhythmBeatPulse * 0.9})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Node outer circle
      ctx.fillStyle = isCurrentHit
        ? '#fde047'
        : isNextTarget
        ? '#f472b6'
        : pt.isCorner
        ? '#a855f7'
        : '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        pt.x,
        pt.y,
        baseR + (isCurrentHit ? rhythmBeatPulse * 3.2 : 0),
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();

      // Inner bright core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.isCorner ? 2.6 : 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw the main Orbiting Light Orb at currentContinuousBeat
    const headPos = getPointAtBeat(currentContinuousBeat);

    const glowGrad = ctx.createRadialGradient(
      headPos.x,
      headPos.y,
      2,
      headPos.x,
      headPos.y,
      22
    );
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    glowGrad.addColorStop(0.35, 'rgba(253, 224, 71, 0.95)');
    glowGrad.addColorStop(0.7, 'rgba(236, 72, 153, 0.55)');
    glowGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(headPos.x, headPos.y, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(headPos.x, headPos.y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawBackground() {
    if (roomType === 'rhythm') {
      // Dark Nightclub / DJ Dancefloor Background for RHYTHM ROOM
      ctx.fillStyle = '#090414';
      ctx.fillRect(-20, -20, width + 40, height + 40);

      // Subtle dark club perspective grid lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.14)';
      ctx.lineWidth = 1.5;
      const plankWidth = 48;
      for (let x = plankWidth; x < width; x += plankWidth) {
        ctx.beginPath();
        ctx.moveTo(x, -20);
        ctx.lineTo(x, height + 20);
        ctx.stroke();
      }

      const rx = WALL_PADDING - 8;
      const ry = HUD_TOP_MARGIN + WALL_PADDING - 8;
      const rw = width - (WALL_PADDING - 8) * 2;
      const rh = height - ry - (WALL_PADDING - 8);

      // Deep dark club stage floor (clean & high-visibility without tile clutter)
      ctx.fillStyle = '#140b29';
      roundRect(ctx, rx, ry, rw, rh, 20);
      ctx.fill();

      // Subtle soft ambient spotlight in the center of the club floor
      ctx.save();
      roundRect(ctx, rx + 4, ry + 4, rw - 8, rh - 8, 16);
      ctx.clip();

      const centerGlow = ctx.createRadialGradient(
        rx + rw * 0.5,
        ry + rh * 0.5,
        20,
        rx + rw * 0.5,
        ry + rh * 0.5,
        Math.max(rw, rh) * 0.6
      );
      centerGlow.addColorStop(0, `rgba(139, 92, 246, ${0.12 + rhythmBeatPulse * 0.06})`);
      centerGlow.addColorStop(1, 'rgba(17, 7, 34, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.restore();

      // Draw the 8-Beat Perimeter Dots & Orbiting Light
      drawRhythmPerimeter(rx, ry, rw, rh);
    } else {
      // LIVING ROOM: Warm Wooden Floor OR Clean Simple Ice Blue (Ice+)
      const isIce = livingOption === 'ice';
      ctx.fillStyle = isIce ? '#e0f2fe' : '#fef3c7';
      ctx.fillRect(-20, -20, width + 40, height + 40);

      ctx.strokeStyle = isIce ? 'rgba(2, 132, 199, 0.12)' : 'rgba(217, 119, 6, 0.13)';
      ctx.lineWidth = 2;
      const plankWidth = 48;
      for (let x = plankWidth; x < width; x += plankWidth) {
        ctx.beginPath();
        ctx.moveTo(x, -20);
        ctx.lineTo(x, height + 20);
        ctx.stroke();
      }

      const rx = WALL_PADDING - 8;
      const ry = HUD_TOP_MARGIN + WALL_PADDING - 8;
      const rw = width - (WALL_PADDING - 8) * 2;
      const rh = height - ry - (WALL_PADDING - 8);

      ctx.fillStyle = isIce ? 'rgba(240, 249, 255, 0.75)' : 'rgba(254, 249, 195, 0.65)';
      roundRect(ctx, rx, ry, rw, rh, 20);
      ctx.fill();

      ctx.strokeStyle =
        worldSlowTimer > 0
          ? 'rgba(192, 38, 211, 0.65)'
          : playerPoisonTimer > 0
          ? 'rgba(126, 34, 206, 0.55)'
          : isIce
          ? 'rgba(56, 189, 248, 0.5)'
          : 'rgba(217, 119, 6, 0.35)';
      ctx.lineWidth = worldSlowTimer > 0 || playerPoisonTimer > 0 || isIce ? 4 : 3;
      ctx.setLineDash([8, 6]);
      roundRect(ctx, rx, ry, rw, rh, 20);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    let statusOffsetY = HUD_TOP_MARGIN + 4;

    if (worldSlowTimer > 0) {
      const slowRatio = clamp(worldSlowTimer / WORLD_SLOW_DURATION, 0, 1);
      ctx.save();
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.22,
        width / 2,
        height / 2,
        height * 0.65
      );
      grad.addColorStop(0, 'rgba(88, 28, 135, 0)');
      grad.addColorStop(1, `rgba(147, 51, 234, ${0.22 * Math.min(1, slowRatio * 2)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const barW = 148;
      const barX = (width - barW) / 2;
      ctx.fillStyle = 'rgba(59, 7, 100, 0.8)';
      roundRect(ctx, barX, statusOffsetY, barW, 16, 8);
      ctx.fill();

      ctx.fillStyle = '#e879f9';
      roundRect(ctx, barX + 2, statusOffsetY + 2, (barW - 4) * slowRatio, 12, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 10px ${POP_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⏱️ SLOW TIME ${worldSlowTimer.toFixed(1)}s`, width / 2, statusOffsetY + 8.5);
      ctx.restore();
      statusOffsetY += 20;
    }

    if (playerPoisonTimer > 0) {
      const poisonRatio = clamp(playerPoisonTimer / PLAYER_POISON_DURATION, 0, 1);
      ctx.save();
      const barW = 148;
      const barX = (width - barW) / 2;
      ctx.fillStyle = 'rgba(20, 83, 45, 0.82)';
      roundRect(ctx, barX, statusOffsetY, barW, 16, 8);
      ctx.fill();

      ctx.fillStyle = '#a855f7';
      roundRect(ctx, barX + 2, statusOffsetY + 2, (barW - 4) * poisonRatio, 12, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 10px ${POP_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`☠️ 毒スピード低下 ${playerPoisonTimer.toFixed(1)}s`, width / 2, statusOffsetY + 8.5);
      ctx.restore();
      statusOffsetY += 20;
    }

    if (player.hasHelmet) {
      ctx.save();
      const barW = 138;
      const barX = (width - barW) / 2;
      ctx.fillStyle = 'rgba(3, 105, 161, 0.88)';
      roundRect(ctx, barX, statusOffsetY, barW, 16, 8);
      ctx.fill();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      roundRect(ctx, barX, statusOffsetY, barW, 16, 8);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 10px ${POP_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⛑️ ヘルメット装着中 (1回)', width / 2, statusOffsetY + 8.5);
      ctx.restore();
      statusOffsetY += 20;
    }

    if (roomType === 'living' && livingOption !== 'none') {
      ctx.save();
      const isIce = livingOption === 'ice';
      const label = isIce ? '❄️ ICE+ (慣性アップ)' : '🐾 CAT+ (猫の手襲撃)';
      const barW = isIce ? 134 : 142;
      const barX = (width - barW) / 2;
      ctx.fillStyle = isIce ? 'rgba(3, 105, 161, 0.85)' : 'rgba(194, 65, 12, 0.85)';
      roundRect(ctx, barX, statusOffsetY, barW, 16, 8);
      ctx.fill();

      ctx.strokeStyle = isIce ? '#bae6fd' : '#fde047';
      ctx.lineWidth = 1.4;
      roundRect(ctx, barX, statusOffsetY, barW, 16, 8);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 10px ${POP_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, width / 2, statusOffsetY + 8.5);
      ctx.restore();
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawDashTrailsAndRipples() {
    for (const ds of dashStreaks) {
      const ratio = clamp(ds.life / ds.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = ratio;
      ctx.lineCap = 'round';

      ctx.strokeStyle = ds.color;
      ctx.lineWidth = ds.width * ratio;
      ctx.beginPath();
      ctx.moveTo(ds.x1, ds.y1);
      ctx.lineTo(ds.x2, ds.y2);
      ctx.stroke();

      if (ds.coreColor) {
        ctx.strokeStyle = ds.coreColor;
        ctx.lineWidth = Math.max(1.5, ds.width * 0.42 * ratio);
        ctx.beginPath();
        ctx.moveTo(ds.x1, ds.y1);
        ctx.lineTo(ds.x2, ds.y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw queued rhythm tap path & numbered beat target markers in RHYTHM ROOM
    if (roomType === 'rhythm' && rhythmTapQueue.length > 0) {
      ctx.save();
      let prevX = player.isDashing ? player.targetX : player.x;
      let prevY = player.isDashing ? player.targetY : player.y;

      ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      for (const qt of rhythmTapQueue) {
        ctx.lineTo(qt.x, qt.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      rhythmTapQueue.forEach((qt, idx) => {
        const pulseR = 11 + Math.sin(performance.now() * 0.015 + idx) * 2;
        ctx.fillStyle = idx === 0 ? 'rgba(236, 72, 153, 0.28)' : 'rgba(56, 189, 248, 0.22)';
        ctx.strokeStyle = idx === 0 ? '#ec4899' : '#0284c7';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(qt.x, qt.y, pulseR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = idx === 0 ? '#9d174d' : '#0369a1';
        ctx.lineWidth = 3;
        ctx.font = '900 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(String(idx + 1), qt.x, qt.y + 0.5);
        ctx.fillText(String(idx + 1), qt.x, qt.y + 0.5);
      });
      ctx.restore();
    }

    for (const r of targetRipples) {
      ctx.save();
      ctx.globalAlpha = clamp(r.alpha, 0, 1);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawFoods() {
    for (const f of foods) {
      const lifeRatio = clamp(f.life / f.maxLife, 0, 1);
      const isUrgent = f.life < 1.6;
      const pulse = isUrgent ? 1 + Math.sin(performance.now() * 0.028) * 0.14 : 1;
      const bobY = Math.sin(f.bobPhase) * 2.0;

      ctx.save();
      ctx.translate(f.x, f.y + bobY);
      ctx.scale(f.scale * pulse, f.scale * pulse);

      ctx.fillStyle = 'rgba(120, 53, 15, 0.13)';
      ctx.beginPath();
      ctx.ellipse(0, f.radius + 3, f.radius * 0.8, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();

      const ringRadius = f.radius + 2.5;
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.14)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle =
        worldSlowTimer > 0
          ? '#c026d3'
          : isUrgent
          ? '#ef4444'
          : f.type.id === 'gold'
          ? '#eab308'
          : '#22c55e';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
      ctx.stroke();

      // Custom food image override if present
      if (assets.drawImage(ctx, f.type.id, 0, 0, f.radius * 2.2, f.radius * 2.2)) {
        ctx.restore();
        continue;
      }

      if (f.type.id === 'seed') {
        ctx.rotate(-0.3);
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8.2, 11.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, -8.5);
        ctx.lineTo(0, 8.5);
        ctx.moveTo(-3.8, -6);
        ctx.quadraticCurveTo(-5.5, 0, -3, 7);
        ctx.moveTo(3.8, -6);
        ctx.quadraticCurveTo(5.5, 0, 3, 7);
        ctx.stroke();
      } else if (f.type.id === 'cheese') {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-9.5, 6.5);
        ctx.lineTo(10.5, 6.5);
        ctx.lineTo(3, -9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(-1.8, 2.5, 2, 0, Math.PI * 2);
        ctx.arc(4, 3, 1.5, 0, Math.PI * 2);
        ctx.arc(1.2, -2.5, 1.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8.8, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-2.5, -5.5);
        ctx.lineTo(-2.5, 4.5);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function drawTimerItems() {
    for (const ti of timerItems) {
      const pulse = 1 + Math.sin(ti.pulsePhase) * 0.09;
      const lifeRatio = clamp(ti.life / ti.maxLife, 0, 1);

      ctx.save();
      ctx.translate(ti.x, ti.y);
      ctx.scale(ti.scale * pulse, ti.scale * pulse);

      ctx.fillStyle = 'rgba(192, 38, 211, 0.22)';
      ctx.beginPath();
      ctx.arc(0, 0, ti.radius + 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, ti.radius + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
      ctx.stroke();

      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.6;
      ctx.fillRect(-3.5, -ti.radius - 4, 7, 4);
      ctx.strokeRect(-3.5, -ti.radius - 4, 7, 4);

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, ti.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#faf5ff';
      ctx.beginPath();
      ctx.arc(0, 0, ti.radius - 3, 0, Math.PI * 2);
      ctx.fill();

      const handAng = performance.now() * 0.008;
      ctx.strokeStyle = '#7e22ce';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(handAng) * 7, Math.sin(handAng) * 7);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -8);
      ctx.stroke();

      ctx.restore();
    }
  }

  function drawPoisonItem() {
    if (!poisonItem) return;
    const p = poisonItem;
    const bobY = Math.sin(p.bobPhase) * 2.2;
    const pulse = 1 + Math.sin(p.bobPhase * 1.5) * 0.07;

    ctx.save();
    ctx.translate(p.x, p.y + bobY);
    ctx.scale(p.scale * pulse, p.scale * pulse);

    ctx.fillStyle = 'rgba(147, 51, 234, 0.22)';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(74, 222, 128, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#e9d5ff';
    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 1.8;
    roundRect(ctx, -4.5, 1, 9, 11, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9333ea';
    ctx.strokeStyle = '#3b0764';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 1, 13, Math.PI, 0, false);
    ctx.quadraticCurveTo(13, 4, 0, 4);
    ctx.quadraticCurveTo(-13, 4, -13, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(-6, -3, 2.6, 0, Math.PI * 2);
    ctx.arc(0, -7, 3.0, 0, Math.PI * 2);
    ctx.arc(6.5, -2.5, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawHelmetItem() {
    if (!helmetItem) return;
    const h = helmetItem;
    const bobY = Math.sin(h.bobPhase) * 2.2;
    const pulse = 1 + Math.sin(h.bobPhase * 1.4) * 0.08;
    const lifeRatio = clamp(h.life / h.maxLife, 0, 1);

    ctx.save();
    ctx.translate(h.x, h.y + bobY);
    ctx.scale(h.scale * pulse, h.scale * pulse);

    // Glowing cyan/gold shield aura
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, h.radius + 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, h.radius + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
    ctx.stroke();

    // Helmet brim (bottom visor edge)
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 5, 14.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet dome (safety yellow)
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 4, 12.5, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center white/red stripe & star emblem
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, -3, -8.2, 6, 11, 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    drawStar(ctx, 0, -2, 3.2);

    // Highlight shine
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-4.5, -1, 6, Math.PI * 1.15, Math.PI * 1.55);
    ctx.stroke();

    ctx.restore();
  }

  function drawVacuum() {
    if (!vacuum) return;
    const now = performance.now();

    ctx.save();
    ctx.translate(vacuum.x, vacuum.y);

    const suckPulse = 1 - ((now * 0.0022) % 1);
    ctx.strokeStyle = `rgba(148, 163, 184, ${suckPulse * 0.45})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, vacuum.radius + suckPulse * 20, 0, Math.PI * 2);
    ctx.stroke();

    if (vacuum.suckAnimTimer > 0) {
      const s = 1 + Math.sin(vacuum.suckAnimTimer * Math.PI * 6) * 0.12;
      ctx.scale(s, s);
    }

    ctx.fillStyle = vacuum.hitHighlight ? 'rgba(239, 68, 68, 0.55)' : 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.arc(0, 4.5, vacuum.radius + (vacuum.hitHighlight ? 6 : 2.5), 0, Math.PI * 2);
    ctx.fill();

    const moveAngle = Math.atan2(vacuum.vy, vacuum.vx);
    ctx.rotate(moveAngle);

    // Custom vacuum image override if present
    if (assets.drawImage(ctx, 'vacuum', 0, 0, vacuum.radius * 2.2, vacuum.radius * 2.2)) {
      ctx.restore();
      return;
    }

    const brushPositions = [
      { bx: vacuum.radius * 0.56, by: -vacuum.radius * 0.66, dir: 1 },
      { bx: vacuum.radius * 0.56, by: vacuum.radius * 0.66, dir: -1 },
    ];
    for (const bp of brushPositions) {
      ctx.save();
      ctx.translate(bp.bx, bp.by);
      ctx.rotate(vacuum.rotation * 2.5 * bp.dir);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.4;
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = vacuum.hitHighlight ? '#ef4444' : worldSlowTimer > 0 ? '#a855f7' : '#334155';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, vacuum.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.arc(0, 0, vacuum.radius - 1.8, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-2.5, 0, vacuum.radius * 0.64, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = vacuum.suckAnimTimer > 0 ? '#38bdf8' : '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawExtraObstacles() {
    const now = performance.now();

    for (const obs of obstacles) {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.warningTimer > 0) {
        const blink = 0.4 + Math.abs(Math.sin(now * 0.015)) * 0.6;
        ctx.strokeStyle = `rgba(239, 68, 68, ${blink})`;
        ctx.fillStyle = `rgba(254, 226, 226, ${blink * 0.55})`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠️', 0, -2);
        ctx.font = '900 10px sans-serif';
        ctx.fillText(`${obs.warningTimer.toFixed(1)}s`, 0, 11);
        ctx.restore();
        continue;
      }

      ctx.fillStyle = obs.hitHighlight ? 'rgba(239, 68, 68, 0.55)' : 'rgba(0, 0, 0, 0.18)';
      ctx.beginPath();
      ctx.arc(0, 3.5, obs.radius + (obs.hitHighlight ? 5 : 1.5), 0, Math.PI * 2);
      ctx.fill();

      if (obs.kind === 'yarn') {
        ctx.rotate(obs.rotation);
        if (assets.drawImage(ctx, 'yarn', 0, 0, obs.radius * 2.2, obs.radius * 2.2)) {
          ctx.restore();
          continue;
        }

        ctx.fillStyle = '#e11d48';
        ctx.strokeStyle = '#881337';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-3.5, -2.5, obs.radius * 0.68, -0.5, 1.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(4, 3.5, obs.radius * 0.65, 1.5, 3.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-obs.radius * 0.6, 4);
        ctx.quadraticCurveTo(0, -3, obs.radius * 0.65, -4);
        ctx.stroke();
      } else {
        const moveAng = Math.atan2(obs.vy, obs.vx);
        ctx.rotate(moveAng);

        const tailWag = Math.sin(obs.tailPhase) * 5;
        ctx.strokeStyle = '#4c1d95';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-obs.radius, 0);
        ctx.quadraticCurveTo(-obs.radius - 7, tailWag, -obs.radius - 13, -tailWag * 0.6);
        ctx.stroke();

        const keyScale = Math.sin(obs.rotation * 2);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(-3, 0, 3, Math.max(1.5, Math.abs(keyScale) * 7), 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#7c3aed';
        ctx.strokeStyle = '#4c1d95';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, obs.radius, obs.radius * 0.82, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(3, -obs.radius * 0.68, 4.5, 0, Math.PI * 2);
        ctx.arc(3, obs.radius * 0.68, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(7, -5, 3.5, 0, Math.PI * 2);
        ctx.arc(7, 5, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(8.2, -5, 1.7, 0, Math.PI * 2);
        ctx.arc(8.2, 5, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Compact Top-Down Whole-Body Hamster Illustration (for gameplay & title hero)
   */
  function drawHamsterOnCtx(targetCtx, x, y, angle, isDashing, alpha = 1, scaleMult = 1, forcePoison = false, forceDizzy = false) {
    if (assets.hasImage('player')) {
      targetCtx.save();
      targetCtx.globalAlpha = alpha;
      targetCtx.translate(x, y);
      targetCtx.rotate(angle);
      const breathe = Math.sin(performance.now() * 0.008) * 0.03;
      const s = isDashing ? 1.2 : (1 + breathe);
      targetCtx.scale(scaleMult * s, scaleMult * (2 - s));
      assets.drawImage(targetCtx, 'player', 0, 0, 36, 36);
      targetCtx.restore();
      return;
    }

    targetCtx.save();
    targetCtx.globalAlpha = alpha;
    targetCtx.translate(x, y);
    targetCtx.rotate(angle);
    targetCtx.scale(scaleMult, scaleMult);

    const isPoisoned = forcePoison || (targetCtx === ctx && playerPoisonTimer > 0);
    const isDizzy = forceDizzy || (targetCtx === ctx && player.isDizzy);
    const breathe = Math.sin(performance.now() * 0.008) * 0.03;
    const speed = targetCtx === ctx ? Math.hypot(player.vx, player.vy) : 0;
    const isMoving = isDashing || speed > 15;
    const pawOffset = isMoving ? Math.sin(player.walkPhase) * 2.8 : Math.sin(performance.now() * 0.006) * 0.8;

    if (isDashing) {
      targetCtx.scale(isPoisoned ? 1.1 : 1.26, isPoisoned ? 0.92 : 0.82);
    } else {
      targetCtx.scale(1 + breathe, 1 - breathe);
    }

    if (alpha >= 0.99) {
      targetCtx.fillStyle = isPoisoned ? 'rgba(147, 51, 234, 0.28)' : 'rgba(120, 53, 15, 0.18)';
      targetCtx.beginPath();
      targetCtx.ellipse(-1, 2.5, 13.5, 9.5, 0, 0, Math.PI * 2);
      targetCtx.fill();
    }

    targetCtx.fillStyle = '#fde68a';
    targetCtx.strokeStyle = '#b45309';
    targetCtx.lineWidth = 1.2;
    const paws = [
      { px: 6 + pawOffset, py: -8.2 },
      { px: 6 - pawOffset, py: 8.2 },
      { px: -7 - pawOffset, py: -7.8 },
      { px: -7 + pawOffset, py: 7.8 },
    ];
    for (const p of paws) {
      targetCtx.beginPath();
      targetCtx.ellipse(p.px, p.py, 3.2, 2.1, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.stroke();
    }

    targetCtx.fillStyle = '#fef3c7';
    targetCtx.strokeStyle = '#b45309';
    targetCtx.lineWidth = 1.3;
    targetCtx.beginPath();
    targetCtx.arc(-13, 0, 2.8, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    const furMain = isPoisoned ? '#c084fc' : '#f59e0b';
    const furStroke = isPoisoned ? '#581c87' : '#92400e';

    targetCtx.fillStyle = furMain;
    targetCtx.strokeStyle = furStroke;
    targetCtx.lineWidth = 1.8;
    targetCtx.beginPath();
    targetCtx.ellipse(-1.5, 0, 12, 9.2, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    targetCtx.fillStyle = furMain;
    targetCtx.beginPath();
    targetCtx.ellipse(6.5, 0, 7.8, 6.8, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.beginPath();
    targetCtx.arc(6.5, 0, 6.9, -Math.PI * 0.45, Math.PI * 0.45);
    targetCtx.strokeStyle = furStroke;
    targetCtx.lineWidth = 1.8;
    targetCtx.stroke();

    if (targetCtx === ctx && player.chewTimer > 0) {
      const puff = 1 + Math.sin(performance.now() * 0.05) * 0.25;
      targetCtx.fillStyle = isPoisoned ? '#d8b4fe' : '#fbbf24';
      targetCtx.strokeStyle = furStroke;
      targetCtx.lineWidth = 1.3;
      targetCtx.beginPath();
      targetCtx.arc(5.5, -6.2 * puff, 3.8, 0, Math.PI * 2);
      targetCtx.arc(5.5, 6.2 * puff, 3.8, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.stroke();
    }

    targetCtx.fillStyle = isPoisoned ? '#f3e8ff' : '#fef3c7';
    targetCtx.beginPath();
    targetCtx.ellipse(1.5, 0, 6.5, 5.5, 0, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.strokeStyle = isPoisoned ? '#6b21a8' : '#b45309';
    targetCtx.lineWidth = 2.2;
    targetCtx.lineCap = 'round';
    targetCtx.beginPath();
    targetCtx.moveTo(-11, 0);
    targetCtx.lineTo(4, 0);
    targetCtx.stroke();

    const earPositions = [
      { ex: 3.5, ey: -6.5, rot: -0.35 },
      { ex: 3.5, ey: 6.5, rot: 0.35 },
    ];
    for (const ep of earPositions) {
      targetCtx.save();
      targetCtx.translate(ep.ex, ep.ey);
      targetCtx.rotate(ep.rot);
      targetCtx.fillStyle = isPoisoned ? '#9333ea' : '#d97706';
      targetCtx.strokeStyle = furStroke;
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, 3.2, 2.4, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = '#fda4af';
      targetCtx.beginPath();
      targetCtx.ellipse(0.3, 0, 1.8, 1.3, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();
    }

    if (isDizzy && alpha >= 0.99) {
      targetCtx.strokeStyle = '#1c1917';
      targetCtx.lineWidth = 1.6;
      [-3.8, 3.8].forEach((ey) => {
        targetCtx.beginPath();
        targetCtx.moveTo(7.3, ey - 1.5);
        targetCtx.lineTo(10.3, ey + 1.5);
        targetCtx.moveTo(10.3, ey - 1.5);
        targetCtx.lineTo(7.3, ey + 1.5);
        targetCtx.stroke();
      });
    } else {
      targetCtx.fillStyle = '#1c1917';
      targetCtx.beginPath();
      targetCtx.arc(8.8, -3.8, 1.8, 0, Math.PI * 2);
      targetCtx.arc(8.8, 3.8, 1.8, 0, Math.PI * 2);
      targetCtx.fill();

      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(9.3, -4.1, 0.65, 0, Math.PI * 2);
      targetCtx.arc(9.3, 3.5, 0.65, 0, Math.PI * 2);
      targetCtx.fill();
    }

    targetCtx.strokeStyle = 'rgba(120, 53, 15, 0.45)';
    targetCtx.lineWidth = 1;
    targetCtx.beginPath();
    targetCtx.moveTo(11, -3);
    targetCtx.lineTo(13, -7.5);
    targetCtx.moveTo(10, -3.5);
    targetCtx.lineTo(10.5, -8.2);
    targetCtx.moveTo(11, 3);
    targetCtx.lineTo(13, 7.5);
    targetCtx.moveTo(10, 3.5);
    targetCtx.lineTo(10.5, 8.2);
    targetCtx.stroke();

    targetCtx.fillStyle = '#f43f5e';
    targetCtx.beginPath();
    targetCtx.arc(13.8, 0, 1.7, 0, Math.PI * 2);
    targetCtx.fill();

    // Draw equipped safety helmet on the hamster's head + protective shield ring
    if (targetCtx === ctx && player.hasHelmet && alpha >= 0.9) {
      // Subtle cyan/gold protective aura ring around the hamster
      targetCtx.save();
      const shieldPulse = 1 + Math.sin(performance.now() * 0.01) * 0.06;
      targetCtx.strokeStyle = 'rgba(56, 189, 248, 0.78)';
      targetCtx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      targetCtx.lineWidth = 2;
      targetCtx.beginPath();
      targetCtx.ellipse(1, 0, 17.5 * shieldPulse, 13.5 * shieldPulse, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.stroke();

      // Top-down safety helmet cap on the hamster's head (centered around x=4.5, y=0)
      targetCtx.fillStyle = '#facc15';
      targetCtx.strokeStyle = '#78350f';
      targetCtx.lineWidth = 1.5;
      targetCtx.beginPath();
      targetCtx.ellipse(4.2, 0, 6.8, 6.2, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.stroke();

      // Front visor brim
      targetCtx.fillStyle = '#f59e0b';
      targetCtx.beginPath();
      targetCtx.arc(7.8, 0, 4.4, -Math.PI * 0.42, Math.PI * 0.42);
      targetCtx.fill();
      targetCtx.stroke();

      // Center white stripe on helmet
      targetCtx.fillStyle = '#ffffff';
      targetCtx.fillRect(-1.2, -1.6, 10.5, 3.2);

      // Red cross/star dot on top
      targetCtx.fillStyle = '#ef4444';
      targetCtx.beginPath();
      targetCtx.arc(4.2, 0, 1.8, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();
    } else if (targetCtx === ctx && player.helmetInvulnTimer > 0 && alpha >= 0.9) {
      // Shimmering bounce shield afterimage right after deflecting an obstacle
      targetCtx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      targetCtx.lineWidth = 2.4;
      targetCtx.beginPath();
      targetCtx.arc(1, 0, 17, 0, Math.PI * 2);
      targetCtx.stroke();
    }

    targetCtx.restore();
  }

  function drawHamster(x, y, angle, isDashing, alpha = 1) {
    drawHamsterOnCtx(ctx, x, y, angle, isDashing, alpha, 1.35, false, false);
  }

  /**
   * Compact Front-Facing Whole-Body Standing Hamster Illustration (for Mode Select Hub Center)
   */
  function drawFrontStandingHamster(hCtx, cx, cy, now) {
    hCtx.save();
    hCtx.translate(cx, cy);

    const tapHop = hamsterTapPulseTimer > 0 ? -Math.sin((hamsterTapPulseTimer / 0.36) * Math.PI) * 10 : 0;
    const tapScale = hamsterTapPulseTimer > 0 ? 1 + Math.sin((hamsterTapPulseTimer / 0.36) * Math.PI) * 0.14 : 1;
    const bounce = Math.sin(now * 0.006) * 2.2 + tapHop;
    const tilt = Math.sin(now * 0.003) * 0.06 + (hamsterTapPulseTimer > 0 ? Math.sin(now * 0.04) * 0.14 : 0);
    hCtx.translate(0, bounce);
    hCtx.rotate(tilt);
    hCtx.scale(tapScale, tapScale);

    // Custom hub standing hamster image override if present
    if (assets.hasImage('hub_hamster')) {
      assets.drawImage(hCtx, 'hub_hamster', 0, 0, 72, 88);
      if (roomType === 'rhythm') {
        // DJ Accessories overlay
        const track = RHYTHM_TRACKS[rhythmTrackIndex] || RHYTHM_TRACKS[0];
        hCtx.strokeStyle = '#7c3aed';
        hCtx.lineWidth = 3.2;
        hCtx.beginPath();
        hCtx.arc(0, -10, 21.5, -Math.PI * 0.88, -Math.PI * 0.12);
        hCtx.stroke();

        hCtx.fillStyle = track.accentColor;
        hCtx.strokeStyle = '#581c87';
        hCtx.lineWidth = 1.6;
        hCtx.beginPath();
        hCtx.ellipse(-20, -10, 4.5, 7.5, -0.1, 0, Math.PI * 2);
        hCtx.ellipse(20, -10, 4.5, 7.5, 0.1, 0, Math.PI * 2);
        hCtx.fill();
        hCtx.stroke();
      }
      hCtx.restore();
      return;
    }

    // Soft ground shadow
    hCtx.fillStyle = 'rgba(120, 53, 15, 0.18)';
    hCtx.beginPath();
    hCtx.ellipse(0, 34 - bounce * 0.5, 22, 6, 0, 0, Math.PI * 2);
    hCtx.fill();

    // Little hind feet at the bottom
    hCtx.fillStyle = '#fde68a';
    hCtx.strokeStyle = '#92400e';
    hCtx.lineWidth = 1.6;
    hCtx.beginPath();
    hCtx.ellipse(-11, 31, 6.5, 4, -0.2, 0, Math.PI * 2);
    hCtx.ellipse(11, 31, 6.5, 4, 0.2, 0, Math.PI * 2);
    hCtx.fill();
    hCtx.stroke();

    // Round Ears on top of head
    hCtx.fillStyle = '#d97706';
    hCtx.strokeStyle = '#78350f';
    hCtx.lineWidth = 1.8;
    hCtx.beginPath();
    hCtx.arc(-14, -24, 7.5, 0, Math.PI * 2);
    hCtx.arc(14, -24, 7.5, 0, Math.PI * 2);
    hCtx.fill();
    hCtx.stroke();

    hCtx.fillStyle = '#fda4af';
    hCtx.beginPath();
    hCtx.arc(-14, -24, 4.2, 0, Math.PI * 2);
    hCtx.arc(14, -24, 4.2, 0, Math.PI * 2);
    hCtx.fill();

    // Lower chubby body (pear/peanut standing hamster silhouette)
    hCtx.fillStyle = '#f59e0b';
    hCtx.strokeStyle = '#92400e';
    hCtx.lineWidth = 2;
    hCtx.beginPath();
    hCtx.ellipse(0, 12, 22, 20, 0, 0, Math.PI * 2);
    hCtx.fill();
    hCtx.stroke();

    // Upper head
    hCtx.fillStyle = '#f59e0b';
    hCtx.beginPath();
    hCtx.ellipse(0, -10, 19.5, 16, 0, 0, Math.PI * 2);
    hCtx.fill();
    hCtx.beginPath();
    hCtx.arc(0, -10, 18.5, -Math.PI * 0.88, -Math.PI * 0.12);
    hCtx.stroke();

    // Soft white/cream belly & lower face patch
    hCtx.fillStyle = '#fffbeb';
    hCtx.beginPath();
    hCtx.ellipse(0, 14, 15, 14.5, 0, 0, Math.PI * 2);
    hCtx.ellipse(0, -4, 13, 9, 0, 0, Math.PI * 2);
    hCtx.fill();

    // Rosy cheeks
    hCtx.fillStyle = '#fb7185';
    hCtx.beginPath();
    hCtx.arc(-12.5, -6, 4.8, 0, Math.PI * 2);
    hCtx.arc(12.5, -6, 4.8, 0, Math.PI * 2);
    hCtx.fill();

    // Shiny dark eyes
    hCtx.fillStyle = '#1c1917';
    hCtx.beginPath();
    hCtx.arc(-7.5, -12, 2.8, 0, Math.PI * 2);
    hCtx.arc(7.5, -12, 2.8, 0, Math.PI * 2);
    hCtx.fill();

    hCtx.fillStyle = '#ffffff';
    hCtx.beginPath();
    hCtx.arc(-8.3, -13, 1.1, 0, Math.PI * 2);
    hCtx.arc(6.7, -13, 1.1, 0, Math.PI * 2);
    hCtx.fill();

    // Cute pink nose & happy mouth
    hCtx.fillStyle = '#f43f5e';
    hCtx.beginPath();
    hCtx.arc(0, -8.5, 2.1, 0, Math.PI * 2);
    hCtx.fill();

    hCtx.strokeStyle = '#78350f';
    hCtx.lineWidth = 1.5;
    hCtx.beginPath();
    hCtx.moveTo(0, -6.5);
    hCtx.quadraticCurveTo(-3, -3.5, -5, -5);
    hCtx.moveTo(0, -6.5);
    hCtx.quadraticCurveTo(3, -3.5, 5, -5);
    hCtx.stroke();

    // Whiskers
    hCtx.strokeStyle = 'rgba(120, 53, 15, 0.45)';
    hCtx.lineWidth = 1;
    hCtx.beginPath();
    hCtx.moveTo(-14, -7);
    hCtx.lineTo(-22, -9);
    hCtx.moveTo(-14, -5);
    hCtx.lineTo(-22, -5);
    hCtx.moveTo(14, -7);
    hCtx.lineTo(22, -9);
    hCtx.moveTo(14, -5);
    hCtx.lineTo(22, -5);
    hCtx.stroke();

    // Cute front paws held neatly on chest
    const pawWave = Math.sin(now * 0.008) * 1.2;
    hCtx.fillStyle = '#fde68a';
    hCtx.strokeStyle = '#92400e';
    hCtx.lineWidth = 1.5;
    hCtx.beginPath();
    hCtx.ellipse(-6.5, 5 + pawWave, 4.2, 3.2, 0.35, 0, Math.PI * 2);
    hCtx.ellipse(6.5, 5 - pawWave, 4.2, 3.2, -0.35, 0, Math.PI * 2);
    hCtx.fill();
    hCtx.stroke();

    // Cute DJ Headphones, Cool Club Sunglasses & Musical Notes when RHYTHM ROOM is selected!
    if (roomType === 'rhythm') {
      const track = RHYTHM_TRACKS[rhythmTrackIndex] || RHYTHM_TRACKS[0];
      // 1. DJ Headphones arch & earcups (tinted with current track accent color!)
      hCtx.strokeStyle = '#7c3aed';
      hCtx.lineWidth = 3.2;
      hCtx.beginPath();
      hCtx.arc(0, -10, 21.5, -Math.PI * 0.88, -Math.PI * 0.12);
      hCtx.stroke();

      hCtx.fillStyle = track.accentColor;
      hCtx.strokeStyle = '#581c87';
      hCtx.lineWidth = 1.6;
      hCtx.beginPath();
      hCtx.ellipse(-20, -10, 4.5, 7.5, -0.1, 0, Math.PI * 2);
      hCtx.ellipse(20, -10, 4.5, 7.5, 0.1, 0, Math.PI * 2);
      hCtx.fill();
      hCtx.stroke();

      // 2. Cool Club Sunglasses over the eyes!
      hCtx.save();
      // Temples (side arms going to ears/headphones)
      hCtx.strokeStyle = '#0f172a';
      hCtx.lineWidth = 2.2;
      hCtx.beginPath();
      hCtx.moveTo(-15, -13.5);
      hCtx.lineTo(-19, -12);
      hCtx.moveTo(15, -13.5);
      hCtx.lineTo(19, -12);
      hCtx.stroke();

      // Left & Right Stylish Angular Club Lenses
      const lensGrad = hCtx.createLinearGradient(0, -16, 0, -8);
      lensGrad.addColorStop(0, '#090414');
      lensGrad.addColorStop(0.55, '#1e1b4b');
      lensGrad.addColorStop(1, '#7e22ce');

      hCtx.fillStyle = lensGrad;
      hCtx.strokeStyle = '#facc15';
      hCtx.lineWidth = 1.6;

      // Left lens
      roundRect(hCtx, -15.5, -16, 13.5, 7.6, 2.5);
      hCtx.fill();
      hCtx.stroke();

      // Right lens
      roundRect(hCtx, 2.0, -16, 13.5, 7.6, 2.5);
      hCtx.fill();
      hCtx.stroke();

      // Gold nose bridge
      hCtx.strokeStyle = '#facc15';
      hCtx.lineWidth = 2;
      hCtx.beginPath();
      hCtx.moveTo(-2, -13.5);
      hCtx.lineTo(2, -13.5);
      hCtx.stroke();

      // Diagonal white/cyan lens reflection shine
      hCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      hCtx.lineWidth = 1.6;
      hCtx.lineCap = 'round';
      hCtx.beginPath();
      hCtx.moveTo(-12.5, -10.2);
      hCtx.lineTo(-8.5, -14.2);
      hCtx.moveTo(5.0, -10.2);
      hCtx.lineTo(9.0, -14.2);
      hCtx.stroke();
      hCtx.restore();

      // 3. Floating neon musical notes
      hCtx.fillStyle = '#d946ef';
      hCtx.font = '900 13px sans-serif';
      hCtx.textAlign = 'center';
      const noteY = Math.sin(now * 0.01) * 3;
      hCtx.fillText('♪', 24, -28 + noteY);
      hCtx.fillText('♫', -24, -26 - noteY);
    }

    hCtx.restore();
  }

  /**
   * Cute & Stylish Mascot Illustration for the Title Screen (#title-hero-canvas 240x216)
   */
  function drawCuteTitleMascot(tCtx, now) {
    const cw = 240;
    const ch = 216;
    tCtx.clearRect(0, 0, cw, ch);

    const cx = cw / 2;
    const cy = ch / 2 + 4;

    // Custom title mascot override if present
    if (assets.hasImage('title_mascot')) {
      const bounce = Math.sin(now * 0.0055) * 4.5;
      assets.drawImage(tCtx, 'title_mascot', cx, cy + bounce, 160, 160);
      return;
    }

    tCtx.save();
    tCtx.translate(cx, cy);

    // 1. Scalloped pastel floral/cookie medallion backdrop
    const petals = 16;
    const baseR = 82;
    const rotSlow = now * 0.00035;
    tCtx.save();
    tCtx.rotate(rotSlow);
    tCtx.fillStyle = 'rgba(255, 255, 255, 0.86)';
    tCtx.strokeStyle = '#fbbf24';
    tCtx.lineWidth = 3;
    tCtx.beginPath();
    for (let i = 0; i <= petals * 12; i++) {
      const a = (i / (petals * 12)) * Math.PI * 2;
      const r = baseR + Math.sin(a * petals) * 5.5;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) tCtx.moveTo(px, py);
      else tCtx.lineTo(px, py);
    }
    tCtx.closePath();
    tCtx.fill();
    tCtx.stroke();
    tCtx.restore();

    // Inner warm pastel circle + stitched ring
    const innerGrad = tCtx.createRadialGradient(0, -10, 10, 0, 0, 74);
    innerGrad.addColorStop(0, '#fffbeb');
    innerGrad.addColorStop(0.7, '#fef3c7');
    innerGrad.addColorStop(1, '#fde68a');
    tCtx.fillStyle = innerGrad;
    tCtx.beginPath();
    tCtx.arc(0, 0, 73, 0, Math.PI * 2);
    tCtx.fill();

    tCtx.save();
    tCtx.rotate(-rotSlow * 1.4);
    tCtx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
    tCtx.lineWidth = 2;
    tCtx.setLineDash([6, 6]);
    tCtx.beginPath();
    tCtx.arc(0, 0, 66, 0, Math.PI * 2);
    tCtx.stroke();
    tCtx.restore();

    // Speed sparkle lines behind hamster
    tCtx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
    tCtx.lineWidth = 3;
    tCtx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const shift = ((now * 0.12 + i * 28) % 60) - 30;
      const ly = -22 + i * 22;
      tCtx.beginPath();
      tCtx.moveTo(-58 - shift * 0.2, ly + 8);
      tCtx.lineTo(-28 - shift * 0.2, ly - 6);
      tCtx.stroke();
    }

    // Soft ground shadow under hamster
    const bounce = Math.sin(now * 0.0055) * 4.5;
    tCtx.fillStyle = 'rgba(180, 83, 9, 0.16)';
    tCtx.beginPath();
    tCtx.ellipse(0, 52, 44 - bounce * 0.6, 10, 0, 0, Math.PI * 2);
    tCtx.fill();

    // 2. Floating Treats around the Hamster (Sunflower Seed, Cheese, Golden Seed)
    // Left top: Sunflower Seed
    tCtx.save();
    tCtx.translate(-68, -36 + Math.sin(now * 0.0045) * 4);
    tCtx.rotate(-0.45 + Math.sin(now * 0.003) * 0.12);
    tCtx.fillStyle = '#451a03';
    tCtx.strokeStyle = '#ffffff';
    tCtx.lineWidth = 2.5;
    tCtx.beginPath();
    tCtx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
    tCtx.stroke();
    tCtx.fill();
    tCtx.strokeStyle = '#fef3c7';
    tCtx.lineWidth = 1.8;
    tCtx.beginPath();
    tCtx.moveTo(0, -10);
    tCtx.lineTo(0, 10);
    tCtx.moveTo(-4.5, -7);
    tCtx.quadraticCurveTo(-6, 0, -3.5, 8);
    tCtx.moveTo(4.5, -7);
    tCtx.quadraticCurveTo(6, 0, 3.5, 8);
    tCtx.stroke();
    tCtx.restore();

    // Right top: Golden Seed
    tCtx.save();
    tCtx.translate(68, -34 + Math.cos(now * 0.005) * 4.5);
    tCtx.rotate(0.35 - Math.sin(now * 0.004) * 0.12);
    tCtx.fillStyle = '#fde047';
    tCtx.strokeStyle = '#ca8a04';
    tCtx.lineWidth = 2;
    tCtx.beginPath();
    tCtx.ellipse(0, 0, 10, 13.5, 0, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();
    tCtx.strokeStyle = '#ffffff';
    tCtx.lineWidth = 2;
    tCtx.beginPath();
    tCtx.moveTo(-3, -6);
    tCtx.lineTo(-3, 5);
    tCtx.stroke();
    tCtx.restore();

    // Left bottom: Cute Cheese Wedge
    tCtx.save();
    tCtx.translate(-66, 28 + Math.cos(now * 0.0048) * 3.5);
    tCtx.rotate(-0.2);
    tCtx.fillStyle = '#facc15';
    tCtx.strokeStyle = '#ca8a04';
    tCtx.lineWidth = 2;
    tCtx.beginPath();
    tCtx.moveTo(-11, 8);
    tCtx.lineTo(12, 8);
    tCtx.lineTo(3, -10);
    tCtx.closePath();
    tCtx.fill();
    tCtx.stroke();
    tCtx.fillStyle = '#eab308';
    tCtx.beginPath();
    tCtx.arc(-2, 3, 2.2, 0, Math.PI * 2);
    tCtx.arc(4.5, 4, 1.7, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.restore();

    // 3. Main Fluffy Chubby Hamster Mascot (Joyful Leaping Pose)
    tCtx.save();
    tCtx.translate(0, bounce);
    tCtx.rotate(Math.sin(now * 0.0035) * 0.045);

    // Cute fluffy tail
    tCtx.fillStyle = '#fef3c7';
    tCtx.strokeStyle = '#92400e';
    tCtx.lineWidth = 2.2;
    tCtx.beginPath();
    tCtx.arc(-34, 24, 7.5, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();

    // Hind feet with pink paw pads
    const footKick = Math.sin(now * 0.008) * 2.5;
    [
      { fx: -22, fy: 40 + footKick, rot: -0.35 },
      { fx: 22, fy: 40 - footKick, rot: 0.35 },
    ].forEach((f) => {
      tCtx.save();
      tCtx.translate(f.fx, f.fy);
      tCtx.rotate(f.rot);
      tCtx.fillStyle = '#fde68a';
      tCtx.strokeStyle = '#92400e';
      tCtx.lineWidth = 2.2;
      tCtx.beginPath();
      tCtx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();

      tCtx.fillStyle = '#fda4af';
      tCtx.beginPath();
      tCtx.arc(0, 1, 3.2, 0, Math.PI * 2);
      tCtx.arc(-4.5, -2, 1.6, 0, Math.PI * 2);
      tCtx.arc(0, -3.2, 1.6, 0, Math.PI * 2);
      tCtx.arc(4.5, -2, 1.6, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.restore();
    });

    // Big round ears with pink inner ear
    const earWiggle = Math.sin(now * 0.007) * 0.07;
    [
      { ex: -26, ey: -36, rot: -0.35 - earWiggle },
      { ex: 26, ey: -36, rot: 0.35 + earWiggle },
    ].forEach((e) => {
      tCtx.save();
      tCtx.translate(e.ex, e.ey);
      tCtx.rotate(e.rot);
      tCtx.fillStyle = '#d97706';
      tCtx.strokeStyle = '#78350f';
      tCtx.lineWidth = 2.5;
      tCtx.beginPath();
      tCtx.arc(0, 0, 14, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.stroke();

      tCtx.fillStyle = '#fda4af';
      tCtx.beginPath();
      tCtx.arc(0, 1, 8.2, 0, Math.PI * 2);
      tCtx.fill();
      tCtx.restore();
    });

    // Chubby pear-shaped hamster body + head
    const bodyGrad = tCtx.createLinearGradient(0, -45, 0, 42);
    bodyGrad.addColorStop(0, '#fbbf24');
    bodyGrad.addColorStop(0.55, '#f59e0b');
    bodyGrad.addColorStop(1, '#d97706');
    tCtx.fillStyle = bodyGrad;
    tCtx.strokeStyle = '#78350f';
    tCtx.lineWidth = 2.8;

    // Lower body
    tCtx.beginPath();
    tCtx.ellipse(0, 14, 40, 32, 0, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();

    // Upper head & puffy cheeks
    tCtx.beginPath();
    tCtx.ellipse(0, -14, 37, 29, 0, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.beginPath();
    tCtx.arc(0, -14, 36, -Math.PI * 0.92, -Math.PI * 0.08);
    tCtx.stroke();

    // Forehead cute fur tuft
    tCtx.fillStyle = '#fbbf24';
    tCtx.beginPath();
    tCtx.moveTo(-6, -41);
    tCtx.quadraticCurveTo(0, -49, 4, -42);
    tCtx.quadraticCurveTo(8, -47, 9, -40);
    tCtx.fill();
    tCtx.stroke();

    // Soft cream belly & lower face fur
    tCtx.fillStyle = '#fffbeb';
    tCtx.beginPath();
    tCtx.ellipse(0, 18, 28, 23, 0, 0, Math.PI * 2);
    tCtx.ellipse(0, -5, 25, 16, 0, 0, Math.PI * 2);
    tCtx.fill();

    // Stylish berry-red ribbon scarf around neck
    tCtx.fillStyle = '#f43f5e';
    tCtx.strokeStyle = '#881337';
    tCtx.lineWidth = 2;
    tCtx.beginPath();
    tCtx.ellipse(0, 4, 29, 7.5, 0, 0, Math.PI);
    tCtx.closePath();
    tCtx.fill();
    tCtx.stroke();

    // Cute bow knot in center of scarf
    tCtx.fillStyle = '#fb7185';
    tCtx.beginPath();
    tCtx.ellipse(-7, 8, 7, 4.5, -0.25, 0, Math.PI * 2);
    tCtx.ellipse(7, 8, 7, 4.5, 0.25, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();
    tCtx.fillStyle = '#fde047';
    tCtx.beginPath();
    tCtx.arc(0, 8, 3.5, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();

    // Soft rosy cheeks with blush lines
    tCtx.fillStyle = 'rgba(251, 113, 133, 0.75)';
    tCtx.beginPath();
    tCtx.ellipse(-23, -8, 9.5, 6.5, 0, 0, Math.PI * 2);
    tCtx.ellipse(23, -8, 9.5, 6.5, 0, 0, Math.PI * 2);
    tCtx.fill();

    // Big sparkling anime eyes
    [-13.5, 13.5].forEach((ex) => {
      tCtx.fillStyle = '#1c1917';
      tCtx.beginPath();
      tCtx.ellipse(ex, -17, 5.4, 6.2, 0, 0, Math.PI * 2);
      tCtx.fill();

      // Big top-left catchlight
      tCtx.fillStyle = '#ffffff';
      tCtx.beginPath();
      tCtx.arc(ex - 1.8, -19.2, 2.3, 0, Math.PI * 2);
      tCtx.fill();

      // Small bottom-right catchlight
      tCtx.beginPath();
      tCtx.arc(ex + 1.8, -14.8, 1.1, 0, Math.PI * 2);
      tCtx.fill();
    });

    // Cute pink nose & happy open mouth
    tCtx.fillStyle = '#f43f5e';
    tCtx.beginPath();
    tCtx.ellipse(0, -11, 3.6, 2.6, 0, 0, Math.PI * 2);
    tCtx.fill();

    // Happy mouth (open smile + omega lip)
    tCtx.fillStyle = '#fb7185';
    tCtx.beginPath();
    tCtx.arc(0, -6.5, 5.5, 0, Math.PI);
    tCtx.fill();

    tCtx.strokeStyle = '#78350f';
    tCtx.lineWidth = 2.2;
    tCtx.lineCap = 'round';
    tCtx.beginPath();
    tCtx.moveTo(0, -8.5);
    tCtx.quadraticCurveTo(-4.5, -3.5, -8.5, -6.5);
    tCtx.moveTo(0, -8.5);
    tCtx.quadraticCurveTo(4.5, -3.5, 8.5, -6.5);
    tCtx.stroke();

    // Cute single bucktooth
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(-2, -6.5, 4, 2.8);

    // Whiskers
    tCtx.strokeStyle = 'rgba(120, 53, 15, 0.5)';
    tCtx.lineWidth = 1.5;
    tCtx.beginPath();
    tCtx.moveTo(-27, -10);
    tCtx.lineTo(-40, -13);
    tCtx.moveTo(-27, -6);
    tCtx.lineTo(-41, -6);
    tCtx.moveTo(27, -10);
    tCtx.lineTo(40, -13);
    tCtx.moveTo(27, -6);
    tCtx.lineTo(41, -6);
    tCtx.stroke();

    // Cute front paws holding a big Sunflower Seed on chest!
    const pawBob = Math.sin(now * 0.009) * 1.5;
    tCtx.save();
    tCtx.translate(0, 19 + pawBob);
    tCtx.fillStyle = '#451a03';
    tCtx.strokeStyle = '#78350f';
    tCtx.lineWidth = 1.8;
    tCtx.beginPath();
    tCtx.ellipse(0, 0, 7.5, 10.5, 0.2, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();
    tCtx.strokeStyle = '#fef3c7';
    tCtx.lineWidth = 1.4;
    tCtx.beginPath();
    tCtx.moveTo(1.5, -7.5);
    tCtx.lineTo(-1.5, 7.5);
    tCtx.stroke();
    tCtx.restore();

    tCtx.fillStyle = '#fde68a';
    tCtx.strokeStyle = '#92400e';
    tCtx.lineWidth = 2;
    tCtx.beginPath();
    tCtx.ellipse(-10, 18 + pawBob, 7.5, 5.2, 0.4, 0, Math.PI * 2);
    tCtx.ellipse(10, 18 + pawBob, 7.5, 5.2, -0.4, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.stroke();

    tCtx.restore();

    // 4. Twinkling Stars & Pastel Hearts around the Medallion
    const twinkle1 = 0.6 + Math.sin(now * 0.008) * 0.4;
    const twinkle2 = 0.6 + Math.cos(now * 0.007) * 0.4;
    tCtx.fillStyle = '#facc15';
    drawStar(tCtx, -46, -64, 5.5 * twinkle1);
    drawStar(tCtx, 54, 46, 5.0 * twinkle2);
    tCtx.fillStyle = '#f43f5e';
    drawStar(tCtx, 48, -66, 4.2 * twinkle2);

    tCtx.restore();
  }

  /**
   * Renders the 3 Food Type Icons inside the How-To-Play Modal
   */
  function drawFoodGuideIcons() {
    const seedCanvas = document.getElementById('guide-food-seed');
    if (seedCanvas) {
      const sCtx = seedCanvas.getContext('2d');
      sCtx.clearRect(0, 0, 38, 38);
      sCtx.save();
      sCtx.translate(19, 19);
      sCtx.fillStyle = 'rgba(34, 197, 94, 0.16)';
      sCtx.beginPath();
      sCtx.arc(0, 0, 16, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.strokeStyle = '#22c55e';
      sCtx.lineWidth = 2;
      sCtx.stroke();

      sCtx.rotate(-0.3);
      sCtx.fillStyle = '#451a03';
      sCtx.beginPath();
      sCtx.ellipse(0, 0, 8, 11, 0, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.strokeStyle = '#fef3c7';
      sCtx.lineWidth = 1.6;
      sCtx.beginPath();
      sCtx.moveTo(0, -8.5);
      sCtx.lineTo(0, 8.5);
      sCtx.moveTo(-3.8, -6);
      sCtx.quadraticCurveTo(-5.5, 0, -3, 7);
      sCtx.moveTo(3.8, -6);
      sCtx.quadraticCurveTo(5.5, 0, 3, 7);
      sCtx.stroke();
      sCtx.restore();
    }

    const cheeseCanvas = document.getElementById('guide-food-cheese');
    if (cheeseCanvas) {
      const cCtx = cheeseCanvas.getContext('2d');
      cCtx.clearRect(0, 0, 38, 38);
      cCtx.save();
      cCtx.translate(19, 19);
      cCtx.fillStyle = 'rgba(249, 115, 22, 0.16)';
      cCtx.beginPath();
      cCtx.arc(0, 0, 16, 0, Math.PI * 2);
      cCtx.fill();
      cCtx.strokeStyle = '#f97316';
      cCtx.lineWidth = 2;
      cCtx.stroke();

      cCtx.fillStyle = '#facc15';
      cCtx.strokeStyle = '#ca8a04';
      cCtx.lineWidth = 1.8;
      cCtx.beginPath();
      cCtx.moveTo(-9.5, 6.5);
      cCtx.lineTo(10.5, 6.5);
      cCtx.lineTo(3, -9);
      cCtx.closePath();
      cCtx.fill();
      cCtx.stroke();

      cCtx.fillStyle = '#eab308';
      cCtx.beginPath();
      cCtx.arc(-1.8, 2.5, 2, 0, Math.PI * 2);
      cCtx.arc(4, 3, 1.5, 0, Math.PI * 2);
      cCtx.arc(1.2, -2.5, 1.4, 0, Math.PI * 2);
      cCtx.fill();
      cCtx.restore();
    }

    const goldCanvas = document.getElementById('guide-food-gold');
    if (goldCanvas) {
      const gCtx = goldCanvas.getContext('2d');
      gCtx.clearRect(0, 0, 38, 38);
      gCtx.save();
      gCtx.translate(19, 19);
      gCtx.fillStyle = 'rgba(234, 179, 8, 0.24)';
      gCtx.beginPath();
      gCtx.arc(0, 0, 16, 0, Math.PI * 2);
      gCtx.fill();
      gCtx.strokeStyle = '#eab308';
      gCtx.lineWidth = 2.2;
      gCtx.stroke();

      gCtx.fillStyle = '#fde047';
      gCtx.shadowColor = '#f59e0b';
      gCtx.shadowBlur = 8;
      gCtx.beginPath();
      gCtx.ellipse(0, 0, 8.5, 11.5, 0.2, 0, Math.PI * 2);
      gCtx.fill();
      gCtx.shadowBlur = 0;

      gCtx.strokeStyle = '#ca8a04';
      gCtx.lineWidth = 1.5;
      gCtx.stroke();

      gCtx.strokeStyle = '#ffffff';
      gCtx.lineWidth = 1.8;
      gCtx.beginPath();
      gCtx.moveTo(-2.5, -5.5);
      gCtx.lineTo(-2.5, 4.5);
      gCtx.stroke();
      gCtx.restore();
    }
  }

  // --- Title Splash & Hub Whole-Body Hamster Illustrations ---
  function renderMenuCanvases(now) {
    // 1. Title Splash Canvas (Cute & Stylish Mascot Scene!)
    if (state === 'TITLE' && titleHeroCanvas) {
      drawCuteTitleMascot(titleHeroCanvas.getContext('2d'), now);
    }

    // 2. Mode Select Hub Center Canvas (Compact Front-Facing Standing Hamster!)
    if (state === 'MODESELECT' && hubHamsterCanvas) {
      const hCtx = hubHamsterCanvas.getContext('2d');
      hCtx.clearRect(0, 0, 88, 108);
      drawFrontStandingHamster(hCtx, 44, 56, now);
    }

    // 3. Game Over / Clear Result Illustration Canvas
    if (state === 'GAMEOVER' && resultIllustCanvas) {
      drawResultIllustration(resultIllustCanvas.getContext('2d'), now);
    }
  }

  /**
   * Draws the cause-specific Game Over illustration or the Full-Belly Clear illustration
   */
  function drawResultIllustration(rCtx, now) {
    const cw = 210;
    const ch = 110;
    rCtx.clearRect(0, 0, cw, ch);

    const cx = cw / 2;
    const cy = ch / 2 + 4;

    if (deathCause === 'clear') {
      rCtx.save();
      rCtx.translate(cx, cy);

      rCtx.fillStyle = 'rgba(217, 119, 6, 0.18)';
      rCtx.beginPath();
      rCtx.ellipse(0, 26, 56, 14, 0, 0, Math.PI * 2);
      rCtx.fill();

      rCtx.fillStyle = '#451a03';
      rCtx.beginPath();
      rCtx.ellipse(-54, 18, 5, 3, 0.4, 0, Math.PI * 2);
      rCtx.ellipse(52, 22, 5, 3, -0.5, 0, Math.PI * 2);
      rCtx.ellipse(-42, 28, 4.5, 2.5, -0.2, 0, Math.PI * 2);
      rCtx.fill();

      rCtx.fillStyle = '#facc15';
      rCtx.beginPath();
      rCtx.arc(44, 12, 3, 0, Math.PI * 2);
      rCtx.arc(-48, 8, 2.5, 0, Math.PI * 2);
      rCtx.fill();

      rCtx.fillStyle = '#d97706';
      rCtx.strokeStyle = '#78350f';
      rCtx.lineWidth = 1.8;
      rCtx.beginPath();
      rCtx.arc(-20, -24, 9, 0, Math.PI * 2);
      rCtx.arc(20, -24, 9, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.fillStyle = '#fda4af';
      rCtx.beginPath();
      rCtx.arc(-20, -24, 5, 0, Math.PI * 2);
      rCtx.arc(20, -24, 5, 0, Math.PI * 2);
      rCtx.fill();

      const bellyBreathe = 1 + Math.sin(now * 0.005) * 0.035;
      rCtx.scale(bellyBreathe, 1 / bellyBreathe);

      rCtx.fillStyle = '#f59e0b';
      rCtx.strokeStyle = '#92400e';
      rCtx.lineWidth = 2.4;
      rCtx.beginPath();
      rCtx.ellipse(0, 2, 42, 32, 0, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.fillStyle = '#fffbeb';
      rCtx.strokeStyle = '#fde68a';
      rCtx.lineWidth = 2;
      rCtx.beginPath();
      rCtx.ellipse(0, 7, 32, 23, 0, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.strokeStyle = '#d97706';
      rCtx.lineWidth = 1.8;
      rCtx.beginPath();
      rCtx.moveTo(-2.5, 8.5);
      rCtx.lineTo(2.5, 13.5);
      rCtx.moveTo(2.5, 8.5);
      rCtx.lineTo(-2.5, 13.5);
      rCtx.stroke();

      rCtx.fillStyle = '#fb7185';
      rCtx.beginPath();
      rCtx.arc(-22, -11, 7.5, 0, Math.PI * 2);
      rCtx.arc(22, -11, 7.5, 0, Math.PI * 2);
      rCtx.fill();

      rCtx.strokeStyle = '#451a03';
      rCtx.lineWidth = 2.4;
      rCtx.lineCap = 'round';
      rCtx.beginPath();
      rCtx.arc(-11, -14, 4.5, Math.PI * 1.15, Math.PI * 1.85);
      rCtx.stroke();
      rCtx.beginPath();
      rCtx.arc(11, -14, 4.5, Math.PI * 1.15, Math.PI * 1.85);
      rCtx.stroke();

      rCtx.fillStyle = '#f43f5e';
      rCtx.beginPath();
      rCtx.arc(0, -11, 2.5, 0, Math.PI * 2);
      rCtx.fill();

      rCtx.strokeStyle = '#78350f';
      rCtx.lineWidth = 1.8;
      rCtx.beginPath();
      rCtx.moveTo(0, -9);
      rCtx.quadraticCurveTo(-4, -5, -7, -7);
      rCtx.moveTo(0, -9);
      rCtx.quadraticCurveTo(4, -5, 7, -7);
      rCtx.stroke();

      const pat = Math.sin(now * 0.012) * 2.5;
      rCtx.fillStyle = '#fde68a';
      rCtx.strokeStyle = '#92400e';
      rCtx.lineWidth = 1.6;
      rCtx.beginPath();
      rCtx.ellipse(-20, 2 + pat, 6, 4, 0.4, 0, Math.PI * 2);
      rCtx.ellipse(20, 2 - pat, 6, 4, -0.4, 0, Math.PI * 2);
      rCtx.ellipse(-26, 25, 7, 4.5, -0.3, 0, Math.PI * 2);
      rCtx.ellipse(26, 25, 7, 4.5, 0.3, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.font = '900 13px "Hiragino Maru Gothic ProN", sans-serif';
      rCtx.fillStyle = '#e11d48';
      rCtx.textAlign = 'center';
      const floatY = Math.sin(now * 0.006) * 3;
      rCtx.fillText('💗 満腹♪', 48, -22 + floatY);
      rCtx.fillText('✨', -48, -20 - floatY);

      rCtx.restore();
    } else if (deathCause === 'roomba') {
      rCtx.save();
      rCtx.translate(cx, cy);

      rCtx.save();
      rCtx.translate(-34, 4);
      rCtx.fillStyle = '#1e293b';
      rCtx.strokeStyle = '#ef4444';
      rCtx.lineWidth = 3;
      rCtx.beginPath();
      rCtx.arc(0, 0, 26, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.fillStyle = '#334155';
      rCtx.strokeStyle = '#94a3b8';
      rCtx.lineWidth = 1.8;
      rCtx.beginPath();
      rCtx.arc(0, 0, 16, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.fillStyle = '#ef4444';
      rCtx.beginPath();
      rCtx.arc(0, 0, 5, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.restore();

      rCtx.save();
      rCtx.translate(-4, 0);
      drawSpikyBurst(rCtx, 8, 18, 8, '#facc15', '#ef4444');
      rCtx.restore();

      const wobble = Math.sin(now * 0.01) * 0.12;
      drawHamsterOnCtx(rCtx, 36, 4, -0.4 + wobble, false, 1, 2.1, false, true);

      const starAng = now * 0.005;
      rCtx.fillStyle = '#eab308';
      for (let i = 0; i < 3; i++) {
        const a = starAng + (i * Math.PI * 2) / 3;
        drawStar(rCtx, 38 + Math.cos(a) * 26, -18 + Math.sin(a) * 8, 4.5);
      }

      rCtx.restore();
    } else if (deathCause === 'yarn') {
      rCtx.save();
      rCtx.translate(cx, cy);

      rCtx.save();
      rCtx.translate(-32, 6);
      rCtx.fillStyle = '#e11d48';
      rCtx.strokeStyle = '#881337';
      rCtx.lineWidth = 2.5;
      rCtx.beginPath();
      rCtx.arc(0, 0, 23, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.strokeStyle = '#fda4af';
      rCtx.lineWidth = 2.2;
      rCtx.beginPath();
      rCtx.arc(-4, -3, 15, -0.5, 1.8);
      rCtx.stroke();
      rCtx.beginPath();
      rCtx.arc(5, 4, 14, 1.5, 3.8);
      rCtx.stroke();
      rCtx.restore();

      drawHamsterOnCtx(rCtx, 28, 6, 0.35, false, 1, 2.1, false, true);

      rCtx.strokeStyle = '#e11d48';
      rCtx.lineWidth = 3;
      rCtx.beginPath();
      rCtx.moveTo(-12, 12);
      rCtx.bezierCurveTo(5, -18, 12, 28, 42, -6);
      rCtx.bezierCurveTo(52, 8, 14, -14, 24, 18);
      rCtx.stroke();

      const starAng = now * 0.005;
      rCtx.fillStyle = '#eab308';
      for (let i = 0; i < 3; i++) {
        const a = starAng + (i * Math.PI * 2) / 3;
        drawStar(rCtx, 28 + Math.cos(a) * 25, -18 + Math.sin(a) * 7, 4.2);
      }

      rCtx.restore();
    } else if (deathCause === 'cat') {
      rCtx.save();
      rCtx.translate(cx, cy);

      // Huge Cat Paw coming from top-left
      rCtx.save();
      rCtx.translate(-24, 0);
      rCtx.rotate(0.35);

      rCtx.fillStyle = '#fef3c7';
      rCtx.strokeStyle = '#c2410c';
      rCtx.lineWidth = 2.4;
      rCtx.beginPath();
      rCtx.ellipse(0, 0, 32, 22, 0, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      // Big pink pad
      rCtx.fillStyle = '#f43f5e';
      rCtx.beginPath();
      rCtx.ellipse(-4, 0, 11, 12, 0, 0, Math.PI * 2);
      rCtx.fill();

      // Little toe pads
      const ctoes = [
        { dx: 14, dy: -12, r: 4.5 },
        { dx: 18, dy: -4, r: 4.8 },
        { dx: 18, dy: 6, r: 4.8 },
        { dx: 13, dy: 14, r: 4.5 },
      ];
      for (const t of ctoes) {
        rCtx.beginPath();
        rCtx.arc(t.dx, t.dy, t.r, 0, Math.PI * 2);
        rCtx.fill();
      }

      rCtx.restore();

      // Spiky impact burst
      rCtx.save();
      rCtx.translate(6, 2);
      drawSpikyBurst(rCtx, 8, 18, 8, '#facc15', '#ea580c');
      rCtx.restore();

      // Dizzy Hamster pushed back
      const wobble = Math.sin(now * 0.01) * 0.14;
      drawHamsterOnCtx(rCtx, 38, 4, 0.4 + wobble, false, 1, 2.1, false, true);

      const starAng = now * 0.005;
      rCtx.fillStyle = '#eab308';
      for (let i = 0; i < 3; i++) {
        const a = starAng + (i * Math.PI * 2) / 3;
        drawStar(rCtx, 40 + Math.cos(a) * 26, -18 + Math.sin(a) * 8, 4.5);
      }

      rCtx.restore();
    } else if (deathCause === 'patrol') {
      rCtx.save();
      rCtx.translate(cx, cy);

      rCtx.save();
      rCtx.translate(-30, 6);
      rCtx.strokeStyle = '#eab308';
      rCtx.lineWidth = 2.5;
      rCtx.beginPath();
      rCtx.ellipse(-4, -18, 7, 4, 0, 0, Math.PI * 2);
      rCtx.moveTo(-4, -14);
      rCtx.lineTo(-4, 0);
      rCtx.stroke();

      rCtx.fillStyle = '#7c3aed';
      rCtx.strokeStyle = '#4c1d95';
      rCtx.lineWidth = 2.4;
      rCtx.beginPath();
      rCtx.ellipse(0, 0, 22, 18, 0, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.fillStyle = '#fef08a';
      rCtx.beginPath();
      rCtx.arc(9, -5, 4, 0, Math.PI * 2);
      rCtx.arc(9, 5, 4, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.restore();

      rCtx.save();
      rCtx.translate(0, 2);
      drawSpikyBurst(rCtx, 8, 16, 7, '#facc15', '#ef4444');
      rCtx.restore();

      drawHamsterOnCtx(rCtx, 34, 6, 2.4, false, 1, 2.1, false, true);

      rCtx.restore();
    } else {
      rCtx.save();
      rCtx.translate(cx, cy + 8);

      rCtx.fillStyle = '#f59e0b';
      rCtx.strokeStyle = '#92400e';
      rCtx.lineWidth = 2.2;
      rCtx.beginPath();
      rCtx.ellipse(-12, 8, 32, 16, 0, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.fillStyle = '#1c1917';
      rCtx.beginPath();
      rCtx.arc(-22, 3, 2.2, 0, Math.PI * 2);
      rCtx.arc(-6, 3, 2.2, 0, Math.PI * 2);
      rCtx.fill();

      rCtx.fillStyle = '#38bdf8';
      rCtx.beginPath();
      rCtx.arc(-24, 7, 2.2, 0, Math.PI * 2);
      rCtx.arc(-4, 7, 2.2, 0, Math.PI * 2);
      rCtx.fill();

      rCtx.fillStyle = '#ffffff';
      rCtx.strokeStyle = '#d97706';
      rCtx.lineWidth = 1.8;
      rCtx.beginPath();
      rCtx.arc(16, -8, 3.5, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.beginPath();
      rCtx.arc(26, -16, 5, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.beginPath();
      rCtx.ellipse(48, -26, 22, 16, 0, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.stroke();

      rCtx.save();
      rCtx.translate(48, -26);
      rCtx.rotate(0.3);
      rCtx.fillStyle = '#451a03';
      rCtx.beginPath();
      rCtx.ellipse(0, 0, 6.5, 9.5, 0, 0, Math.PI * 2);
      rCtx.fill();
      rCtx.strokeStyle = '#fef3c7';
      rCtx.lineWidth = 1.4;
      rCtx.beginPath();
      rCtx.moveTo(0, -7);
      rCtx.lineTo(0, 7);
      rCtx.stroke();
      rCtx.restore();

      rCtx.restore();
    }
  }

  function drawCrashImpactEffect() {
    if (!crashEffect) return;

    const progress = clamp(crashEffect.timer / crashEffect.maxTimer, 0, 1);

    if (crashEffect.flashAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(239, 68, 68, ${crashEffect.flashAlpha * 0.45})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(crashEffect.x, crashEffect.y);

    const ring1Radius = 12 + Math.pow(progress, 0.5) * 95;
    const ring1Alpha = Math.max(0, 1 - progress * 1.15);
    ctx.strokeStyle = `rgba(239, 68, 68, ${ring1Alpha})`;
    ctx.lineWidth = 4 * ring1Alpha;
    ctx.beginPath();
    ctx.arc(0, 0, ring1Radius, 0, Math.PI * 2);
    ctx.stroke();

    const ring2Radius = 6 + Math.pow(progress, 0.65) * 65;
    ctx.strokeStyle = `rgba(250, 204, 21, ${ring1Alpha})`;
    ctx.lineWidth = 3 * ring1Alpha;
    ctx.beginPath();
    ctx.arc(0, 0, ring2Radius, 0, Math.PI * 2);
    ctx.stroke();

    const burstScale = progress < 0.2 ? 0.5 + (progress / 0.2) * 0.85 : Math.max(0, 1.35 - (progress - 0.2) * 1.2);
    if (burstScale > 0.05) {
      ctx.save();
      ctx.scale(burstScale, burstScale);
      ctx.rotate(progress * 1.2);

      drawSpikyBurst(ctx, 10, 34, 16, '#ef4444', '#ffffff');
      drawSpikyBurst(ctx, 10, 22, 10, '#facc15', '#ea580c');

      ctx.restore();
    }

    ctx.strokeStyle = `rgba(255, 255, 255, ${ring1Alpha * 0.9})`;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (const ray of crashEffect.rays) {
      const innerR = 16 + progress * 48;
      const outerR = innerR + ray.len * (1 - progress * 0.5);
      ctx.beginPath();
      ctx.moveTo(Math.cos(ray.angle) * innerR, Math.sin(ray.angle) * innerR);
      ctx.lineTo(Math.cos(ray.angle) * outerR, Math.sin(ray.angle) * outerR);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * JoJo's Bizarre Adventure Onomatopoeia Cut-In for Helmet Pickup ("バァーン！！")
   */
  function drawBaanCutIn() {
    if (!baanCutIn) return;

    const t = baanCutIn.timer;
    const dur = baanCutIn.maxTimer;
    const progress = clamp(t / dur, 0, 1);

    let alpha = 1;
    let scale = 1;
    if (progress < 0.14) {
      const p = progress / 0.14;
      scale = 2.1 - p * 1.1;
      alpha = p;
    } else if (progress > 0.68) {
      alpha = 1 - (progress - 0.68) / 0.32;
      scale = 1 + ((progress - 0.68) / 0.32) * 0.16;
    }

    const cx = width * 0.5;
    const cy = HUD_TOP_MARGIN + (height - HUD_TOP_MARGIN) * 0.45;

    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);

    if (progress < 0.2) {
      ctx.fillStyle = `rgba(250, 204, 21, ${(1 - progress / 0.2) * 0.28})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = `rgba(180, 83, 9, ${alpha * 0.45})`;
    for (const line of baanCutIn.lines) {
      ctx.lineWidth = line.width;
      ctx.beginPath();
      const r1 = line.innerR + Math.sin(t * 30 + line.angle) * 8;
      const r2 = Math.max(width, height) * 0.75;
      ctx.moveTo(Math.cos(line.angle) * r1, Math.sin(line.angle) * r1);
      ctx.lineTo(Math.cos(line.angle) * r2, Math.sin(line.angle) * r2);
      ctx.stroke();
    }
    ctx.restore();

    const vibX = Math.sin(t * 95) * 3.5;
    const vibY = Math.cos(t * 110) * 3.5;

    ctx.translate(cx + vibX, cy + vibY);
    ctx.rotate(-0.24);
    ctx.scale(scale, scale);

    const glyphs = [
      { char: 'バ', x: -128, y: 12, size: 84, rot: -0.08, skew: -0.22 },
      { char: 'ァ', x: -58, y: 24, size: 58, rot: 0.05, skew: -0.18 },
      { char: 'ー', x: 2, y: 4, size: 74, rot: -0.12, skew: -0.25 },
      { char: 'ン', x: 72, y: -6, size: 88, rot: 0.06, skew: -0.2 },
      { char: '!!', x: 142, y: -16, size: 82, rot: 0.12, skew: -0.24 },
    ];

    for (const g of glyphs) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      ctx.transform(1, 0, g.skew, 1, 0, 0);

      ctx.font = `900 ${g.size}px "Hiragino Kaku Gothic StdN", "Impact", "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let d = 10; d >= 1; d--) {
        ctx.fillStyle = d > 6 ? '#090214' : '#3b0764';
        ctx.strokeStyle = '#090214';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'miter';
        ctx.strokeText(g.char, d * 1.1, d * 1.3);
        ctx.fillText(g.char, d * 1.1, d * 1.3);
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 11;
      ctx.strokeText(g.char, -1, -1);

      ctx.strokeStyle = '#0f051d';
      ctx.lineWidth = 6;
      ctx.strokeText(g.char, 0, 0);

      const grad = ctx.createLinearGradient(0, -g.size * 0.5, 0, g.size * 0.5);
      grad.addColorStop(0, '#fde047');
      grad.addColorStop(0.45, '#f43f5e');
      grad.addColorStop(1, '#a21caf');
      ctx.fillStyle = grad;
      ctx.fillText(g.char, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * JoJo's Bizarre Adventure Rumbling Onomatopoeia Cut-In for Timer Item ("ゴゴゴゴゴ……")
   */
  function drawGogogoCutIn() {
    if (!gogogoCutIn) return;

    const t = gogogoCutIn.timer;
    const dur = gogogoCutIn.maxTimer;
    const progress = clamp(t / dur, 0, 1);

    let alpha = 1;
    if (progress < 0.14) {
      alpha = progress / 0.14;
    } else if (progress > 0.68) {
      alpha = 1 - (progress - 0.68) / 0.32;
    }

    const cx = width * 0.5;
    const cy = HUD_TOP_MARGIN + (height - HUD_TOP_MARGIN) * 0.45;

    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);

    if (progress < 0.25) {
      ctx.fillStyle = `rgba(147, 51, 234, ${(1 - progress / 0.25) * 0.3})`;
      ctx.fillRect(0, 0, width, height);
    }

    // Rising vertical menace lines (like Poison's vertical lines)
    ctx.save();
    ctx.lineCap = 'round';
    for (const p of gogogoCutIn.pillars) {
      const yBot = height - ((t * p.speed) % (height * 0.62));
      const yTop = yBot - p.len * (0.55 + progress * 0.55);
      const grad = ctx.createLinearGradient(p.x, yBot, p.x, yTop);
      grad.addColorStop(0, 'rgba(59, 7, 100, 0)');
      grad.addColorStop(0.5, `rgba(192, 38, 211, ${alpha * 0.52})`);
      grad.addColorStop(1, `rgba(250, 204, 21, ${alpha * 0.7})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.moveTo(p.x, yBot);
      ctx.lineTo(p.x, yTop);
      ctx.stroke();
    }
    ctx.restore();

    ctx.translate(cx, cy);

    const glyphs = [
      { char: 'ゴ', x: -138, y: 24, size: 76, rot: -0.14 },
      { char: 'ゴ', x: -78, y: 8, size: 68, rot: -0.08 },
      { char: 'ゴ', x: -20, y: -6, size: 62, rot: -0.11 },
      { char: 'ゴ', x: 34, y: -18, size: 54, rot: -0.07 },
      { char: 'ゴ', x: 84, y: -28, size: 48, rot: -0.1 },
      { char: '…', x: 126, y: -36, size: 40, rot: -0.05 },
      { char: '…', x: 154, y: -42, size: 36, rot: -0.05 },
    ];

    glyphs.forEach((g, idx) => {
      const charDelay = idx * 0.025;
      if (t < charDelay) return;

      const rumbleX = Math.sin(t * 95 + idx * 2.4) * 3.2;
      const rumbleY = Math.cos(t * 85 + idx * 1.9) * 3.0 - (t - charDelay) * 14;
      const scalePulse = 1 + Math.sin(t * 14 + idx) * 0.08;

      ctx.save();
      ctx.translate(g.x + rumbleX, g.y + rumbleY);
      ctx.rotate(g.rot);
      ctx.scale(scalePulse, scalePulse);
      ctx.transform(1, -0.08, -0.22, 1, 0, 0);

      ctx.font = `900 ${g.size}px "Hiragino Kaku Gothic StdN", "Impact", "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let d = 10; d >= 1; d--) {
        ctx.fillStyle = d > 5 ? '#090214' : '#4a044e';
        ctx.strokeStyle = '#090214';
        ctx.lineWidth = 7;
        ctx.lineJoin = 'miter';
        ctx.strokeText(g.char, d * 1.0, d * 1.4);
        ctx.fillText(g.char, d * 1.0, d * 1.4);
      }

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 9;
      ctx.strokeText(g.char, -1, -1);

      ctx.strokeStyle = '#1e052e';
      ctx.lineWidth = 5;
      ctx.strokeText(g.char, 0, 0);

      const grad = ctx.createLinearGradient(0, -g.size * 0.5, 0, g.size * 0.55);
      grad.addColorStop(0, '#facc15');
      grad.addColorStop(0.5, '#d946ef');
      grad.addColorStop(1, '#6b21a8');
      ctx.fillStyle = grad;
      ctx.fillText(g.char, 0, 0);

      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * JoJo's Bizarre Adventure Impact Onomatopoeia Cut-In for Helmet Obstacle Bounce ("ズギャーン！！")
   */
  function drawZugyaanCutIn() {
    if (!zugyaanCutIn) return;

    const t = zugyaanCutIn.timer;
    const dur = zugyaanCutIn.maxTimer;
    const progress = clamp(t / dur, 0, 1);

    let alpha = 1;
    let scale = 1;
    if (progress < 0.12) {
      const p = progress / 0.12;
      scale = 2.0 - p * 1.0;
      alpha = p;
    } else if (progress > 0.65) {
      alpha = 1 - (progress - 0.65) / 0.35;
      scale = 1 + ((progress - 0.65) / 0.35) * 0.18;
    }

    const cx = width * 0.5;
    const cy = HUD_TOP_MARGIN + (height - HUD_TOP_MARGIN) * 0.42;

    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);

    if (progress < 0.18) {
      ctx.fillStyle = `rgba(56, 189, 248, ${(1 - progress / 0.18) * 0.32})`;
      ctx.fillRect(0, 0, width, height);
    }

    // Impact slash lines radiating from collision origin
    ctx.save();
    ctx.translate(zugyaanCutIn.originX, zugyaanCutIn.originY);
    ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 0.55})`;
    for (const s of zugyaanCutIn.slashes) {
      ctx.lineWidth = s.width;
      ctx.beginPath();
      const r1 = s.innerR + progress * 25;
      const r2 = s.outerR + progress * 40;
      ctx.moveTo(Math.cos(s.angle) * r1, Math.sin(s.angle) * r1);
      ctx.lineTo(Math.cos(s.angle) * r2, Math.sin(s.angle) * r2);
      ctx.stroke();
    }
    ctx.restore();

    const vibX = Math.sin(t * 115) * 4;
    const vibY = Math.cos(t * 125) * 4;

    ctx.translate(cx + vibX, cy + vibY);
    ctx.rotate(-0.18);
    ctx.scale(scale, scale);

    const glyphs = [
      { char: 'ズ', x: -138, y: 14, size: 74, rot: -0.08, skew: -0.24 },
      { char: 'ギ', x: -72, y: 6, size: 72, rot: 0.04, skew: -0.22 },
      { char: 'ャ', x: -16, y: 18, size: 54, rot: -0.05, skew: -0.2 },
      { char: 'ー', x: 36, y: 0, size: 68, rot: -0.1, skew: -0.25 },
      { char: 'ン', x: 94, y: -8, size: 76, rot: 0.06, skew: -0.22 },
      { char: '!!', x: 150, y: -16, size: 72, rot: 0.12, skew: -0.24 },
    ];

    for (const g of glyphs) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      ctx.transform(1, 0, g.skew, 1, 0, 0);

      ctx.font = `900 ${g.size}px "Hiragino Kaku Gothic StdN", "Impact", "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let d = 9; d >= 1; d--) {
        ctx.fillStyle = d > 5 ? '#082f49' : '#1e3a8a';
        ctx.strokeStyle = '#082f49';
        ctx.lineWidth = 7;
        ctx.lineJoin = 'miter';
        ctx.strokeText(g.char, d * 1.1, d * 1.3);
        ctx.fillText(g.char, d * 1.1, d * 1.3);
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      ctx.strokeText(g.char, -1, -1);

      ctx.strokeStyle = '#0c4a6e';
      ctx.lineWidth = 5;
      ctx.strokeText(g.char, 0, 0);

      const grad = ctx.createLinearGradient(0, -g.size * 0.5, 0, g.size * 0.5);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.45, '#38bdf8');
      grad.addColorStop(1, '#2563eb');
      ctx.fillStyle = grad;
      ctx.fillText(g.char, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * JoJo's Bizarre Adventure Eerie Poison Onomatopoeia Cut-In ("ドロドロドロ……")
   */
  function drawPoisonCutIn() {
    if (!poisonCutIn) return;

    const t = poisonCutIn.timer;
    const dur = poisonCutIn.maxTimer;
    const progress = clamp(t / dur, 0, 1);

    let alpha = 1;
    if (progress < 0.14) {
      alpha = progress / 0.14;
    } else if (progress > 0.68) {
      alpha = 1 - (progress - 0.68) / 0.32;
    }

    const cx = width * 0.5;
    const cy = HUD_TOP_MARGIN + (height - HUD_TOP_MARGIN) * 0.46;

    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);

    if (progress < 0.25) {
      ctx.fillStyle = `rgba(88, 28, 135, ${(1 - progress / 0.25) * 0.32})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.save();
    ctx.lineCap = 'round';
    for (const d of poisonCutIn.drips) {
      const yTop = HUD_TOP_MARGIN + ((t * d.speed) % (height * 0.55));
      const yBot = yTop + d.len * (0.5 + progress * 0.6);
      const grad = ctx.createLinearGradient(d.x, yTop, d.x, yBot);
      grad.addColorStop(0, 'rgba(59, 7, 100, 0)');
      grad.addColorStop(0.5, `rgba(88, 28, 135, ${alpha * 0.5})`);
      grad.addColorStop(1, `rgba(74, 222, 128, ${alpha * 0.65})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = d.width;
      ctx.beginPath();
      ctx.moveTo(d.x, yTop);
      ctx.lineTo(d.x, yBot);
      ctx.stroke();
    }
    ctx.restore();

    ctx.translate(cx, cy);

    const glyphs = [
      { char: 'ド', x: -135, y: -26, size: 70, rot: -0.12 },
      { char: 'ロ', x: -82, y: -6, size: 58, rot: 0.08 },
      { char: 'ド', x: -30, y: 8, size: 64, rot: -0.09 },
      { char: 'ロ', x: 20, y: 20, size: 54, rot: 0.1 },
      { char: 'ド', x: 66, y: 28, size: 50, rot: -0.07 },
      { char: 'ロ', x: 106, y: 36, size: 44, rot: 0.09 },
      { char: '…', x: 140, y: 44, size: 40, rot: 0.05 },
      { char: '…', x: 166, y: 50, size: 36, rot: 0.05 },
    ];

    glyphs.forEach((g, idx) => {
      const charDelay = idx * 0.025;
      if (t < charDelay) return;

      const waveY = Math.sin(t * 11 + idx * 1.1) * 6 + (t - charDelay) * 16;
      const tremorX = Math.sin(t * 65 + idx * 3) * 2.2;
      const stretchY = 1 + Math.sin(t * 8 + idx) * 0.14 + progress * 0.18;

      ctx.save();
      ctx.translate(g.x + tremorX, g.y + waveY);
      ctx.rotate(g.rot);
      ctx.scale(0.95, stretchY);
      ctx.transform(1, 0.12, -0.15, 1, 0, 0);

      ctx.font = `900 ${g.size}px "Hiragino Kaku Gothic StdN", "Impact", "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let d = 9; d >= 1; d--) {
        ctx.fillStyle = d > 5 ? '#05100a' : '#2e1065';
        ctx.strokeStyle = '#05100a';
        ctx.lineWidth = 7;
        ctx.lineJoin = 'round';
        ctx.strokeText(g.char, d * 0.8, d * 1.6);
        ctx.fillText(g.char, d * 0.8, d * 1.6);
      }

      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 9;
      ctx.strokeText(g.char, 0, 0);

      ctx.strokeStyle = '#140524';
      ctx.lineWidth = 5;
      ctx.strokeText(g.char, 0, 0);

      const grad = ctx.createLinearGradient(0, -g.size * 0.5, 0, g.size * 0.55);
      grad.addColorStop(0, '#c084fc');
      grad.addColorStop(0.55, '#7e22ce');
      grad.addColorStop(1, '#22c55e');
      ctx.fillStyle = grad;
      ctx.fillText(g.char, 0, 0);

      ctx.restore();
    });

    ctx.restore();
  }

  function drawCountdownOverlay() {
    if (state !== 'COUNTDOWN' && startBannerTimer <= 0) return;

    const cx = width / 2;
    const cy = HUD_TOP_MARGIN + (height - HUD_TOP_MARGIN) * 0.42;

    ctx.save();

    if (state === 'COUNTDOWN') {
      ctx.fillStyle = 'rgba(45, 28, 15, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const num = Math.ceil(countdownTimer);
      const frac = countdownTimer - Math.floor(countdownTimer);
      const scale = 0.85 + Math.pow(frac, 0.5) * 0.55;

      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      ctx.font = `900 92px ${POP_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 14;
      ctx.strokeText(String(num), 0, 4);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.strokeText(String(num), 0, 0);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText(String(num), 0, 0);

      ctx.font = `900 16px ${POP_FONT}`;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.strokeText('READY...', 0, 62);
      ctx.fillStyle = '#fffbeb';
      ctx.fillText('READY...', 0, 62);
    } else if (startBannerTimer > 0) {
      const ratio = clamp(startBannerTimer / 0.42, 0, 1);
      const scale = 1 + (1 - ratio) * 0.45;
      ctx.globalAlpha = ratio;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      ctx.font = `900 64px ${POP_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 12;
      ctx.strokeText('START!!', 0, 3);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeText('START!!', 0, 0);

      ctx.fillStyle = '#22c55e';
      ctx.fillText('START!!', 0, 0);
    }

    ctx.restore();
  }

  function drawSpikyBurst(targetCtx, points, outerR, innerR, fillStyle, strokeStyle) {
    targetCtx.fillStyle = fillStyle;
    targetCtx.strokeStyle = strokeStyle;
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / points;
      if (i === 0) targetCtx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else targetCtx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();
  }

  function drawStar(targetCtx, cx, cy, r) {
    targetCtx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      targetCtx.lineTo(cx + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r * 1.5);
      const a2 = a + Math.PI / 4;
      targetCtx.lineTo(cx + Math.cos(a2) * r * 0.45, cy + Math.sin(a2) * r * 0.45);
    }
    targetCtx.closePath();
    targetCtx.fill();
  }

  function drawEffects() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      if (p.shape === 'star') {
        drawStar(ctx, p.x, p.y, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawCrashImpactEffect();

    for (const ft of floatingTexts) {
      const alpha = clamp(ft.life / ft.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${ft.size}px ${POP_FONT}`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    drawBaanCutIn();
    drawGogogoCutIn();
    drawPoisonCutIn();
    drawZugyaanCutIn();
    drawCountdownOverlay();
  }

  function drawCatPaw() {
    if (roomType !== 'living' || livingOption !== 'cat') return;

    const minX = WALL_PADDING;
    const maxX = width - WALL_PADDING;
    const minY = HUD_TOP_MARGIN + WALL_PADDING;
    const maxY = height - WALL_PADDING;

    let originX = 0;
    let originY = 0;
    let angle = 0;

    if (catPaw.side === 'top') {
      originX = catPaw.coord;
      originY = minY;
      angle = Math.PI / 2;
    } else if (catPaw.side === 'bottom') {
      originX = catPaw.coord;
      originY = maxY;
      angle = -Math.PI / 2;
    } else if (catPaw.side === 'left') {
      originX = minX;
      originY = catPaw.coord;
      angle = 0;
    } else {
      originX = maxX;
      originY = catPaw.coord;
      angle = Math.PI;
    }

    // 1. Warning Marker before extending
    if (catPaw.state === 'warn') {
      const pulse = 0.8 + Math.sin(catPaw.timer * 22) * 0.25;
      ctx.save();
      ctx.translate(originX, originY);
      ctx.rotate(angle);

      // Warning dash line along wall edge
      ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -catPaw.width / 2);
      ctx.lineTo(0, catPaw.width / 2);
      ctx.stroke();

      // Flashing Paw alert badge
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(16, 0, 11 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 11px ${POP_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐾', 16, 0);

      ctx.restore();
      return;
    }

    // 2. Extending Cat Paw Arm & Paws
    if (catPaw.reach <= 1) return;

    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(angle);

    const r = catPaw.reach;
    const armW = catPaw.width;

    // Custom cat paw image override if present
    if (assets.hasImage('cat_paw')) {
      assets.drawImage(ctx, 'cat_paw', r - armW * 0.6, 0, armW * 1.4, armW * 1.4);
      ctx.restore();
      return;
    }

    // Ground soft shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.beginPath();
    ctx.ellipse(r * 0.5, 6, r * 0.52, armW * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cat arm body (Cream / Calico white base)
    const armGrad = ctx.createLinearGradient(0, -armW / 2, 0, armW / 2);
    armGrad.addColorStop(0, '#fef3c7');
    armGrad.addColorStop(0.5, '#fffbeb');
    armGrad.addColorStop(1, '#fed7aa');
    ctx.fillStyle = armGrad;
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, -armW / 2);
    ctx.lineTo(r - 14, -armW / 2 + 2);
    ctx.quadraticCurveTo(r + 6, 0, r - 14, armW / 2 - 2);
    ctx.lineTo(0, armW / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cute Tabby Stripes on the arm
    ctx.fillStyle = '#ea580c';
    const stripeCount = Math.max(1, Math.floor(r / 36));
    for (let i = 1; i <= stripeCount; i++) {
      const sx = i * 32;
      if (sx < r - 16) {
        ctx.beginPath();
        ctx.ellipse(sx, -armW / 4, 3.5, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(sx + 8, armW / 4, 3.5, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Fluffy Paw Tip (Puffy cat hand)
    const tipX = r - 10;
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(tipX, 0, 16, armW * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cute Pink Paw Pads (肉球)
    ctx.fillStyle = '#f43f5e';
    // Main big pad
    ctx.beginPath();
    ctx.ellipse(tipX - 2, 0, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 Little toe beans
    const toes = [
      { dx: 7, dy: -12, r: 3.2 },
      { dx: 9, dy: -4, r: 3.5 },
      { dx: 9, dy: 4, r: 3.5 },
      { dx: 7, dy: 12, r: 3.2 },
    ];
    for (const toe of toes) {
      ctx.beginPath();
      ctx.arc(tipX + toe.dx, toe.dy, toe.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Little cute white claws
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.2;
    for (const toe of toes) {
      ctx.beginPath();
      ctx.moveTo(tipX + toe.dx + toe.r * 0.6, toe.dy);
      ctx.lineTo(tipX + toe.dx + toe.r * 1.8, toe.dy);
      ctx.lineTo(tipX + toe.dx + toe.r * 0.6, toe.dy + 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function render() {
    ctx.setTransform(dpr * viewScaleX, 0, 0, dpr * viewScaleY, 0, 0);
    ctx.clearRect(-20, -20, width + 40, height + 40);

    ctx.save();
    if (screenShake > 0) {
      const sx = (Math.random() - 0.5) * screenShake;
      const sy = (Math.random() - 0.5) * screenShake;
      ctx.translate(sx, sy);
    }

    drawBackground();
    drawDashTrailsAndRipples();
    drawFoods();
    drawTimerItems();
    drawPoisonItem();
    drawHelmetItem();

    for (const img of player.afterimages) {
      drawHamster(img.x, img.y, img.angle, true, img.alpha * 0.55);
    }

    drawHamster(player.x, player.y, player.angle, player.isDashing, 1);
    drawVacuum();
    drawExtraObstacles();
    drawCatPaw();
    drawEffects();

    ctx.restore();
  }

  // --- Main Animation Loop ---
  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    update(dt);
    render();
    renderMenuCanvases(now);

    requestAnimationFrame(loop);
  }

  // Initialize
  resizeCanvas();
  drawFoodGuideIcons();
  renderStatsModalContent();
  requestAnimationFrame(loop);
})();
