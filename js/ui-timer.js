import { audioOrchestrator } from './audio-orchestrator.js';

/**
 * Composant de Compte à Rebours Visuel SVG Circulaire.
 * Gère le temps limite de réponse, l'animation du cercle SVG,
 * et déclenche les alertes visuelles et sonores associées.
 */
export class UITimer {
  /**
   * @param {HTMLElement} container - Élément DOM parent où dessiner le timer.
   * @param {Object} callbacks - Fonctions de retour pour les événements.
   * @param {Function} callbacks.onTimeout - Déclenché quand le temps expire.
   * @param {Function} callbacks.onTick - Déclenché à chaque seconde écoulée (reçoit le temps restant).
   */
  constructor(container, callbacks = {}) {
    this.container = container;
    this.onTimeout = callbacks.onTimeout || (() => {});
    this.onTick = callbacks.onTick || (() => {});
    
    this.duration = 30; // Durée totale en secondes
    this.timeLeft = 30; // Temps restant en secondes
    this.intervalId = null;
    this.isPaused = false;
    this.isCritical = false;

    this.initDOM();
  }

  /**
   * Crée la structure SVG circulaire pour le timer.
   */
  initDOM() {
    this.container.innerHTML = '';
    this.container.className = 'timer-container';

    // Structure SVG circulaire premium
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'timer-svg');

    // Cercle d'arrière-plan (gris/bleu sombre dépoli)
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', '50');
    bgCircle.setAttribute('cy', '50');
    bgCircle.setAttribute('r', '45');
    bgCircle.setAttribute('class', 'timer-circle-bg');
    svg.appendChild(bgCircle);

    // Cercle de progression (néon bleu pulsant qui devient rouge sous 10s)
    this.progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.progressCircle.setAttribute('cx', '50');
    this.progressCircle.setAttribute('cy', '50');
    this.progressCircle.setAttribute('r', '45');
    this.progressCircle.setAttribute('class', 'timer-circle-progress');
    
    // Calcul de la circonférence pour le dasharray : 2 * pi * r = 2 * 3.14159 * 45 = 282.74
    this.circumference = 2 * Math.PI * 45;
    this.progressCircle.setAttribute('style', `stroke-dasharray: ${this.circumference}; stroke-dashoffset: 0;`);
    svg.appendChild(this.progressCircle);

    this.container.appendChild(svg);

    // Affichage textuel du temps restant
    this.textDisplay = document.createElement('div');
    this.textDisplay.className = 'timer-text';
    this.textDisplay.innerText = '00';
    this.container.appendChild(this.textDisplay);
  }

  /**
   * Démarre le compte à rebours pour une durée donnée.
   */
  start(durationInSeconds) {
    this.stop();
    this.duration = Math.max(5, durationInSeconds);
    this.timeLeft = this.duration;
    this.isPaused = false;
    this.isCritical = false;
    this.container.classList.remove('critical', 'paused');

    this.updateVisuals();

    this.intervalId = setInterval(() => {
      if (this.isPaused) return;

      this.timeLeft--;
      this.updateVisuals();
      this.onTick(this.timeLeft);

      // Sous 10 secondes : état critique déclenché
      if (this.timeLeft <= 10 && !this.isCritical) {
        this.isCritical = true;
        this.container.classList.add('critical');
        audioOrchestrator.on('timer:start_ticking'); // Changed from audioOrchestrator.startTicking();
      }

      if (this.timeLeft <= 0) {
        this.stop();
        this.onTimeout();
      }
    }, 1000);
  }

  /**
   * Suspend temporairement le chronomètre (utile pendant les Jokers interactifs).
   */
  pause() {
    if (this.intervalId && !this.isPaused) {
      this.isPaused = true;
      this.container.classList.add('paused');
      audioOrchestrator.on('timer:stop_ticking'); // Changed from audioOrchestrator.stopTicking();
    }
  }

  /**
   * Reprend le chronomètre là où il s'était arrêté.
   */
  resume() {
    if (this.intervalId && this.isPaused) {
      this.isPaused = false;
      this.container.classList.remove('paused');
      if (this.isCritical) {
        audioOrchestrator.on('timer:start_ticking'); // Changed from audioOrchestrator.startTicking();
      }
    }
  }

  /**
   * Arrête définitivement et réinitialise le timer.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    audioOrchestrator.on('timer:stop_ticking'); // Changed from audioOrchestrator.stopTicking();
    this.isPaused = false;
    this.isCritical = false;
    this.container.classList.remove('critical', 'paused');
  }

  /**
   * Met à jour le tracé SVG et le texte en temps réel.
   */
  updateVisuals() {
    // Formatage texte en 2 chiffres (ex : "09")
    this.textDisplay.innerText = this.timeLeft.toString().padStart(2, '0');

    // Progression circulaire : 0 (complet) à circumference (vide)
    const progressFactor = (this.duration - this.timeLeft) / this.duration;
    const offset = this.circumference * progressFactor;
    this.progressCircle.setAttribute('style', `stroke-dasharray: ${this.circumference}; stroke-dashoffset: ${offset};`);
  }
}
export default UITimer;
