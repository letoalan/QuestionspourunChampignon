/**
 * audio-orchestrator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrateur audio centralisé pour Le Grand Quiz.
 *
 * ARCHITECTURE :
 *  - Le moteur de jeu n'appelle JAMAIS directement un fichier audio.
 *  - Il émet uniquement des événements sémantiques (ex: "question:show").
 *  - Cet orchestrateur traduit ces événements en identifiants de piste via
 *    la configuration JSON externe (data/audio-config.json).
 *  - Les pistes MP3 du dossier /music/ sont utilisées en priorité.
 *  - Un fallback Web Audio API (synthèse) prend le relais si un MP3 est absent.
 *
 * TRANSITIONS :
 *  - Crossfade entre les pistes ambiantes (loop).
 *  - Arrêt net (stop) + lecture immédiate pour les événements ponctuels.
 *  - Les sons de tension se superposent au fond musical.
 *
 * UTILISATION :
 *   import audioOrchestrator from './audio-orchestrator.js';
 *   audioOrchestrator.loadConfig('./data/audio-config.json').then(() => {
 *     audioOrchestrator.on('game:start');
 *     audioOrchestrator.on('question:show', { difficulty: 2 });
 *   });
 *
 * REMPLACEMENT DES SONS :
 *   Modifier uniquement data/audio-config.json → champ "url" de chaque piste.
 * ─────────────────────────────────────────────────────────────────────────────
 */

class AudioOrchestrator {
  constructor() {
    // Web Audio API
    this.ctx = null;
    this.masterGain = null;

    // Configuration chargée depuis audio-config.json
    this.config = null;          // { audio: {...}, eventMapping: {...} }
    this.tracks = {};            // { trackId: AudioTrackInstance }

    // Piste ambiante en cours (fond musical)
    this.currentAmbientTrackId = null;
    this.currentAmbientNode = null;

    // Piste de tension superposée
    this.currentTensionTrackId = null;
    this.currentTensionNode = null;

    // État global
    this.isMuted = false;
    this.volume = 0.7;

    // Oscillateurs de drone (fallback synthèse)
    this.droneOscs = [];
    this.droneGain = null;
    this.tickingInterval = null;

    // Cache des buffers audio décodés
    this._bufferCache = {};

    this.currentLevel = 1; // palier courant mémorisé
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALISATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Charge la configuration audio depuis un fichier JSON externe.
   * @param {string} configUrl = Chemin vers data/audio-config.json
   */
  async loadConfig(configUrl = './data/audio-config.json') {
    try {
      const res = await fetch(configUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.config = await res.json();
      console.log('[AudioOrchestrator] Configuration chargée :', Object.keys(this.config.audio).length, 'pistes définies.');
    } catch (err) {
      console.warn('[AudioOrchestrator] Impossible de charger audio-config.json, fallback synthèse activé.', err);
      this.config = null;
    }
  }

  /**
   * Initialise le contexte Web Audio API (doit être appelé après un geste utilisateur).
   */
  init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      console.log('[AudioOrchestrator] Web Audio API initialisée.');
    } catch (e) {
      console.error('[AudioOrchestrator] Web Audio API non supportée :', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTRÔLE DU VOLUME
  // ─────────────────────────────────────────────────────────────────────────

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime, 0.05
      );
    }
    return this.isMuted;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POINT D'ENTRÉE PRINCIPAL — Réception des événements du moteur de jeu
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Traduit un événement sémantique en lecture audio.
   * @param {string} gameEvent - Ex: 'question:show', 'game:win'
   * @param {object} [context] - Données contextuelles (ex: { difficulty: 2, levelIndex: 8 })
   */
  on(gameEvent, context = {}) {
    this.init();
    this.resume();

    // Handle internal timer events directly
    if (gameEvent === 'timer:start_ticking') {
      this.startTicking();
      return;
    }
    if (gameEvent === 'timer:stop_ticking') {
      this.stopTicking();
      return;
    }

    if (!this.config) {
      // Mode dégradé sans config : fallback synthèse pure
      this._fallbackSynth(gameEvent, context);
      return;
    }

    const trackId = this._resolveTrackId(gameEvent, context);
    if (!trackId) {
      console.warn(`[AudioOrchestrator] Aucune piste mappée pour l'événement : "${gameEvent}"`);
      return;
    }

    const trackDef = this.config.audio[trackId];
    if (!trackDef) {
      console.warn(`[AudioOrchestrator] Piste inconnue : "${trackId}"`);
      return;
    }

    console.log(`[AudioOrchestrator] Événement "${gameEvent}" → piste "${trackId}"`);
    this._playTrack(trackId, trackDef, gameEvent);
  }

  /**
   * Résout l'identifiant de piste en fonction de l'événement et du contexte.
   * Permet des surcharges contextuelles (ex: fond musical selon difficulté).
   */
  _resolveTrackId(gameEvent, context) {
    if (gameEvent === 'question:show') {
      // Mémoriser le palier pour les événements suivants
      if (context.level != null) {
        this.currentLevel = context.level;
      }
      const level = String(this.currentLevel);
      if (this.config.questionLevelToTrack) {
        const override = this.config.questionLevelToTrack[level];
        if (override) {
          console.log(`[AudioOrchestrator] Palier ${level} → piste "${override}"`);
          return override;
        }
        console.warn(`[AudioOrchestrator] Aucun mapping pour level="${level}" dans questionLevelToTrack.`);
      } else {
        console.warn(`[AudioOrchestrator] question:show reçu sans 'level' dans le contexte ou questionLevelToTrack non configuré. Contexte:`, context);
      }
      // Fallback : palier 1 si rien trouvé
      return this.config.questionLevelToTrack?.['1'] ?? null;
    }
    return this.config.eventMapping[gameEvent] ?? null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LECTURE DES PISTES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Orchestre la lecture d'une piste selon sa catégorie.
   * - ambient : crossfade avec le fond actuel
   * - tension  : superposition au fond (layering)
   * - event    : lecture ponctuelle (one-shot)
   * - lifeline : lecture ponctuelle + pause éventuelle du fond
   */
  _playTrack(trackId, trackDef, gameEvent) {
    const category = trackDef.category || 'event';

    switch (category) {
      case 'ambient':
        this._crossfadeAmbient(trackId, trackDef);
        break;
      case 'tension':
        this._crossfadeTension(trackId, trackDef);
        break;
      case 'event':
        this._playOneShot(trackId, trackDef);
        break;
      case 'lifeline':
        this._playLifeline(trackId, trackDef);
        break;
      default:
        this._playOneShot(trackId, trackDef);
    }
  }

  // ─── AMBIENT : Crossfade fluide entre deux fonds musicaux ───────────────

  _crossfadeAmbient(trackId, trackDef) {
    if (this.currentAmbientTrackId === trackId) {
      console.log(`[AudioOrchestrator] Ambient déjà actif: ${trackId}`);
      return;
    }

    console.log(`[AudioOrchestrator] Initiating crossfade for ambient track: ${trackId}`);

    const previousNode = this.currentAmbientNode;
    const previousTrackId = this.currentAmbientTrackId;

    const fadeOutMs = previousNode ? (trackDef.fadeOutMs || 800) : 0;
    const fadeInMs = trackDef.fadeInMs || 0;

    this.currentAmbientTrackId = trackId;
    this.currentAmbientNode = null;

    this.stopTension();

    if (previousNode) {
      this._fadeOut(previousNode.gainNode, fadeOutMs, () => {
        try { previousNode.source.stop(); } catch (e) {}
        console.log(`[AudioOrchestrator] Faded out and stopped previous ambient track: ${previousTrackId}`);
      });
    }

    const startNew = () => {
      if (trackDef.url) {
        this._loadAndPlay(trackDef, fadeInMs, true, (node) => {
          this.currentAmbientNode = node;
          console.log(`[AudioOrchestrator] New ambient track "${trackId}" (URL) started.`);
        });
      } else if (trackDef.synth) {
        this._synthPlay(trackDef.synth, trackDef.volume || 0.7);
        console.log(`[AudioOrchestrator] New ambient track "${trackId}" (SYNTH) started.`);
      }
    };

    if (previousNode) {
      setTimeout(startNew, 150);
    } else {
      startNew();
    }
  }

  // ─── TENSION : Superposition sur le fond musical ────────────────────────

  _crossfadeTension(trackId, trackDef) {
    if (this.currentTensionTrackId === trackId) return;

    // Fade out tension précédente
    if (this.currentTensionNode) {
      this._fadeOut(this.currentTensionNode.gainNode, trackDef.fadeOutMs || 400, () => {
        try { this.currentTensionNode.source.stop(); } catch (e) {}
      });
    }

    this.currentTensionTrackId = trackId;
    this.currentTensionNode = null;

    if (trackDef.url) {
      this._loadAndPlay(trackDef, trackDef.fadeInMs || 500, trackDef.loop, (node) => {
        this.currentTensionNode = node;
      });
    } else if (trackDef.synth) {
      this._synthPlay(trackDef.synth, trackDef.volume || 0.5);
    }
  }

  stopTension() {
    if (this.currentTensionNode) {
      this._fadeOut(this.currentTensionNode.gainNode, 500, () => {
        try { this.currentTensionNode.source.stop(); } catch (e) {}
      });
      this.currentTensionNode = null;
      this.currentTensionTrackId = null;
    }
  }

  // ─── ONE-SHOT : Événement ponctuel (correct, wrong, victory…) ───────────

  _playOneShot(trackId, trackDef) {
    // Pour les événements finaux, arrêter tout ce qui est en cours
    if (['event'].includes(trackDef.category)) {
      this.stopDrone();
      this.stopTicking();
    }

    if (trackDef.url) {
      this._loadAndPlay(trackDef, 0, false, null);
    } else if (trackDef.synth) {
      this._synthPlay(trackDef.synth, trackDef.volume || 0.8);
    }
  }

  // ─── LIFELINE : Joker (one-shot, peut suspendre le fond) ────────────────

  _playLifeline(trackId, trackDef) {
    if (trackDef.url) {
      this._loadAndPlay(trackDef, trackDef.fadeInMs || 0, false, null);
    } else if (trackDef.synth) {
      this._synthPlay(trackDef.synth, trackDef.volume || 0.7);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHARGEMENT ET DÉCODAGE DES MP3
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Charge un fichier MP3, le décode et le joue. Cache les buffers décodés.
   * @param {object} trackDef - Définition de la piste (url, volume, loop…)
   * @param {number} fadeInMs - Durée du fade-in en ms
   * @param {boolean} loop - Lecture en boucle
   * @param {function|null} onReady - Callback recevant { source, gainNode }
   */
  async _loadAndPlay(trackDef, fadeInMs = 0, loop = false, onReady = null) {
    if (!this.ctx) return;

    try {
      let buffer = this._bufferCache[trackDef.url];

      if (!buffer) {
        console.log(`[AudioOrchestrator] Loading and decoding audio from URL: ${trackDef.url}`); // ADDED DEBUG LOG
        const response = await fetch(trackDef.url);
        if (!response.ok) throw new Error(`HTTP ${response.status} pour ${trackDef.url}`);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await this.ctx.decodeAudioData(arrayBuffer);
        this._bufferCache[trackDef.url] = buffer;
        console.log(`[AudioOrchestrator] Successfully loaded and decoded: ${trackDef.url}`); // ADDED DEBUG LOG
      } else {
        console.log(`[AudioOrchestrator] Using cached audio for URL: ${trackDef.url}`); // ADDED DEBUG LOG
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = loop;

      const gainNode = this.ctx.createGain();
      const targetVolume = this.isMuted ? 0 : (trackDef.volume || 0.7) * this.volume;

      if (fadeInMs > 0) {
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          targetVolume,
          this.ctx.currentTime + fadeInMs / 1000
        );
      } else {
        gainNode.gain.setValueAtTime(targetVolume, this.ctx.currentTime);
      }

      source.connect(gainNode);
      gainNode.connect(this.masterGain);
      source.start();
      console.log(`[AudioOrchestrator] Playback started for "${trackDef.url}" (loop: ${loop}, volume: ${targetVolume})`); // ADDED DEBUG LOG

      if (onReady) onReady({ source, gainNode });

    } catch (err) {
      console.warn(`[AudioOrchestrator] Impossible de lire "${trackDef.url}" (TrackId: ${trackDef.id}, Event: ${gameEvent}), fallback synthèse.`, err); // ENHANCED DEBUG LOG
      if (trackDef.synth) {
        this._synthPlay(trackDef.synth, trackDef.volume || 0.5);
      }
    }
  }

  /**
   * Effectue un fade-out progressif sur un GainNode et appelle un callback.
   */
  _fadeOut(gainNode, durationMs = 600, onComplete = null) {
    if (!gainNode || !this.ctx) {
      if (onComplete) onComplete();
      return;
    }
    const duration = durationMs / 1000;
    gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    if (onComplete) setTimeout(onComplete, durationMs + 50);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ARRÊT GÉNÉRAL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Arrête tous les sons en cours (ambiance, tension, ticking, drone).
   */
  stopAll(fadeOutMs = 500) {
    if (this.currentAmbientNode) {
      this._fadeOut(this.currentAmbientNode.gainNode, fadeOutMs, () => {
        try { this.currentAmbientNode.source.stop(); } catch (e) {}
        console.log(`[AudioOrchestrator] Stopped all: Faded out and stopped ambient track: ${this.currentAmbientTrackId}`); // ADDED DEBUG LOG
        this.currentAmbientNode = null;
        this.currentAmbientTrackId = null;
      });
    }
    this.stopTension();
    this.stopDrone();
    this.stopTicking();
    console.log(`[AudioOrchestrator] Stopped all: Tension, Drone, Ticking.`); // ADDED DEBUG LOG
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHÈSE WEB AUDIO — Fallback pour les pistes sans fichier MP3
  // ─────────────────────────────────────────────────────────────────────────

  _synthPlay(synthType, volume = 0.5) {
    const map = {
      'drone':      () => this.playDrone(),
      'transition': () => this.playTransition(),
      'sweep':      () => this.playTransition(),
      'crowd':      () => this._playCrowdMurmur(),
      'gameOver':   () => this.playGameOver(),
      'correct':    () => this.playCorrect(),
      'wrong':      () => this.playWrong(),
      'victory':    () => this.playVictory(),
      'ticking':    () => this.startTicking(),
    };
    const fn = map[synthType];
    if (fn) fn();
    else console.warn(`[AudioOrchestrator] Synthèse inconnue : "${synthType}"`);
  }

  _fallbackSynth(gameEvent, context) {
    const map = {
      'game:start':               () => this.playDrone(1),
      'game:loaded':              () => this.playTransition(),
      'game:restart':             () => this.stopAll(),
      'question:show':            () => this.playDrone(context.difficulty || 1),
      'question:switched':        () => this.playTransition(),
      'question:timer_warning':   () => this.playDrone(2),
      'question:timer_critical':  () => this.startTicking(),
      'answer:selected':          () => this.playDrone(context.difficulty || 1),
      'answer:correct':           () => this.playCorrect(),
      'answer:incorrect':         () => this.playWrong(),
      'question:timeout':         () => this.playWrong(),
      'lifeline:use_50_50':       () => this.playTransition(),
      'lifeline:use_switch':      () => this.playTransition(),
      'game:win':                 () => this.playVictory(),
      'game:victory':             () => this.playVictory(),
      'game:lose':                () => this.playGameOver(),
      'game:walk_away':           () => this.playGameOver(),
    };
    const fn = map[gameEvent];
    if (fn) fn();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHÈSE — Drone de tension (fond harmonique)
  // ─────────────────────────────────────────────────────────────────────────

  playDrone(difficultyLevel = 1) {
    this.init();
    this.resume();
    if (!this.ctx) return;

    this.stopDrone();

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.droneGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 2);

    const baseFreq = 55 - difficultyLevel * 1.5;
    const frequencies = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 3.03];

    this.droneOscs = frequencies.map((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (i > 0) osc.frequency.linearRampToValueAtTime(freq + (Math.random() * 2 - 1), this.ctx.currentTime + 10);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.04 / (i + 1), this.ctx.currentTime);
      osc.connect(g);
      g.connect(this.droneGain);
      return osc;
    });

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(250 + difficultyLevel * 30, this.ctx.currentTime);
    this.droneGain.connect(lp);
    lp.connect(this.masterGain);
    this.droneOscs.forEach(o => o.start());
  }

  stopDrone() {
    if (this.droneGain) {
      try {
        const g = this.droneGain;
        g.gain.cancelScheduledValues(this.ctx.currentTime);
        g.gain.setValueAtTime(g.gain.value, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
        setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 1200);
      } catch (e) {}
    }
    this.droneOscs.forEach(o => { try { o.stop(); o.disconnect(); } catch (e) {} });
    this.droneOscs = [];
    this.droneGain = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHÈSE — Ticking (temps critique)
  // ─────────────────────────────────────────────────────────────────────────

  startTicking() {
    this.init();
    this.resume();
    if (!this.ctx || this.tickingInterval) return;
    let count = 0;
    this.tickingInterval = setInterval(() => {
      if (!this.isMuted) this.playTick(count % 2 === 0);
      count++;
    }, 1000);
  }

  stopTicking() {
    if (this.tickingInterval) {
      clearInterval(this.tickingInterval);
      this.tickingInterval = null;
    }
  }

  playTick(isTick = true) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isTick ? 800 : 600, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHÈSE — Transition (sweep)
  // ─────────────────────────────────────────────────────────────────────────

  playTransition() {
    this.init();
    this.resume();
    if (!this.ctx) return;

    const len = 1.5;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + len);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + len);

    noise.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    noise.start();
    noise.stop(this.ctx.currentTime + len);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHÈSE — Murmure du public
  // ─────────────────────────────────────────────────────────────────────────

  _playCrowdMurmur() {
    this.init();
    this.resume();
    if (!this.ctx) return;

    const len = 3.0;
    const buf = this.ctx.createBuffer(2, this.ctx.sampleRate * len, this.ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.5, this.ctx.currentTime);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.3);
    g.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + len - 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + len);

    noise.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    noise.start();
    noise.stop(this.ctx.currentTime + len);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHÈSE — Bonne réponse (arpège majeur)
  // ─────────────────────────────────────────────────────────────────────────

  playCorrect() {
    this.init();
    this.resume();
    if (!this.ctx) return;
    this.stopDrone();
    this.stopTicking();

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    const delay = this._createDelayNode(0.5, 0.25);

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      g.gain.setValueAtTime(0, now + i * 0.08);
      g.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.8);
      osc.connect(g);
      g.connect(delay ? delay.input : this.masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.9);
    });

    if (delay) delay.output.connect(this.masterGain);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHÈSE — Mauvaise réponse (dissonance grave)
  // ─────────────────────────────────────────────────────────────────────────

  playWrong() {
    this.init();
    this.resume();
    if (!this.ctx) return;
    this.stopDrone();
    this.stopTicking();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.linearRampToValueAtTime(80, now + 1.2);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(113, now);
    osc2.frequency.linearRampToValueAtTime(83, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    [osc1, osc2].forEach(o => { o.connect(filter); o.start(now); o.stop(now + 1.6); });
    filter.connect(g);
    g.connect(this.masterGain);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHÈSE — Victoire (fanfare)
  // ─────────────────────────────────────────────────────────────────────────

  playVictory() {
    this.init();
    this.resume();
    if (!this.ctx) return;
    this.stopDrone();
    this.stopTicking();

    const now = this.ctx.currentTime;
    const chords = [
      [261.63, 329.63, 392.00],
      [293.66, 349.23, 440.00],
      [349.23, 440.00, 523.25],
      [392.00, 493.88, 587.33, 783.99]
    ];
    const delay = this._createDelayNode(0.3, 0.2);

    chords.forEach((chord, ci) => {
      const t = now + ci * 0.5;
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
        osc.connect(g);
        g.connect(delay ? delay.input : this.masterGain);
        osc.start(t);
        osc.stop(t + 0.7);
      });
    });

    if (delay) delay.output.connect(this.masterGain);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHÈSE — Game Over (accord descendant)
  // ─────────────────────────────────────────────────────────────────────────

  playGameOver() {
    this.init();
    this.resume();
    if (!this.ctx) return;
    this.stopDrone();
    this.stopTicking();

    const now = this.ctx.currentTime;
    [196.00, 155.56, 130.81, 98.00].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const lp = this.ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.25);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(200, now + i * 0.25);
      g.gain.setValueAtTime(0, now + i * 0.25);
      g.gain.linearRampToValueAtTime(0.12, now + i * 0.25 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.25 + 1.5);
      osc.connect(lp);
      lp.connect(g);
      g.connect(this.masterGain);
      osc.start(now + i * 0.25);
      osc.stop(now + i * 0.25 + 1.6);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITAIRES INTERNES
  // ─────────────────────────────────────────────────────────────────────────

  _createDelayNode(feedbackAmount = 0.4, delayTime = 0.3) {
    if (!this.ctx) return null;
    const delay = this.ctx.createDelay();
    delay.delayTime.setValueAtTime(delayTime, this.ctx.currentTime);
    const feedback = this.ctx.createGain();
    feedback.gain.setValueAtTime(feedbackAmount, this.ctx.currentTime);
    delay.connect(feedback);
    feedback.connect(delay);
    return { input: delay, output: delay };
  }
}

// Instance globale unique (singleton)
export const audioOrchestrator = new AudioOrchestrator();
export default audioOrchestrator;
