import { audioOrchestrator } from './audio-orchestrator.js';
import { UITimer } from './ui-timer.js';
import { lifelines } from './lifelines.js';
import { parseAndValidateCustomPack, loadPackFromUrl } from './question-loader.js';

/**
 * Gestionnaire principal de l'Interface Utilisateur (DOM Controller).
 * Orchestre les écrans, les boutons de réponses, la barre de gains,
 * les modales de jokers et toutes les animations dramatiques du jeu.
 */
export class UIManager {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.timer = null;
    
    // Éléments DOM globaux
    this.appContainer = document.getElementById('app');
    
    // Écrans
    this.screenHome = document.getElementById('screen-home');
    this.screenGame = document.getElementById('screen-game');
    this.screenResult = document.getElementById('screen-result');
    
    // Zone Question & Réponses
    this.questionText = document.getElementById('question-text');
    this.answerButtons = [
      document.getElementById('btn-ans-0'),
      document.getElementById('btn-ans-1'),
      document.getElementById('btn-ans-2'),
      document.getElementById('btn-ans-3')
    ];
    
    // Panneaux & Contrôles
    this.ladderList = document.getElementById('ladder-list');
    this.lifelineContainer = document.getElementById('lifelines-container');
    this.currentGainDisplay = document.getElementById('game-gain-accumulated');
    this.levelIndicator = document.getElementById('game-level-indicator');
    
    // Modales / Fenêtres de dialogue
    this.modalExplanation = document.getElementById('modal-explanation');
    this.explanationText = document.getElementById('explanation-text');
    this.btnNextLevel = document.getElementById('btn-next-level');
    
    this.modalJoker = document.getElementById('modal-joker');
    this.modalJokerTitle = document.getElementById('modal-joker-title');
    this.modalJokerContent = document.getElementById('modal-joker-content');
    this.btnModalJokerClose = document.getElementById('btn-modal-joker-close');
    
    // Contrôles Audio & Système
    this.btnMute = document.getElementById('btn-mute');
    this.sliderVolume = document.getElementById('slider-volume');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnWalkAway = document.getElementById('btn-walk-away');
    
    // Section d'importation de fichiers
    this.fileInputPack = document.getElementById('file-input-pack');
    this.btnLoadCustom = document.getElementById('btn-load-custom');
    this.btnLoadDefault = document.getElementById('btn-load-default');
    this.validationReport = document.getElementById('validation-report');
    this.selectTheme = document.getElementById('select-theme');

    // Index du bouton actuellement choisi (pour validation)
    this.selectedAnswerIndex = null;

    this.initTimer();
    this.bindEvents();
    this.setupEngineHooks();
  }

  /**
   * Initialise le chronomètre circulaire SVG.
   */
  initTimer() {
    const timerBox = document.getElementById('timer-box');
    this.timer = new UITimer(timerBox, {
      onTimeout: () => {
        this.game.handleTimeout();
      },
      onTick: (secondsLeft) => {
        // Optionnel : effets visuels plus intenses à chaque seconde sous 10s
        if (secondsLeft <= 5) {
          this.questionText.parentElement.classList.add('pulse-light');
          setTimeout(() => {
            this.questionText.parentElement.classList.remove('pulse-light');
          }, 100);
        }
      }
    });
  }

  /**
   * Associe les événements utilisateur du DOM.
   */
  bindEvents() {
    // Clic n'importe où pour déverrouiller l'AudioContext (contraintes navigateurs)
    document.addEventListener('click', () => {
      audioOrchestrator.resume();
    }, { once: true });

    // Réponses
    this.answerButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled') || btn.classList.contains('hidden-ans')) return;
        this.handleAnswerSelection(index);
      });
    });

    // Lancer la partie
    this.btnLoadDefault.addEventListener('click', () => {
      this.game.startNewGame();
    });

    // Sélection de thème
    if (this.selectTheme) {
      this.selectTheme.addEventListener('change', async (e) => {
        const url = e.target.value;
        const { data, validation } = await loadPackFromUrl(url);
        this.renderValidationReport({ data, validation });
        if (validation.isValid) {
          this.game.loadGame(data);
        }
      });
    }

    // Abandonner / Se retirer
    this.btnWalkAway.addEventListener('click', () => {
      if (confirm("Êtes-vous sûr de vouloir vous retirer et empocher vos gains actuels ?")) {
        this.game.walkAway();
      }
    });

    // Audio : Mute & Volume
    this.btnMute.addEventListener('click', () => {
      const isMuted = audioOrchestrator.toggleMute();
      this.updateMuteButtonVisual(isMuted);
    });

    this.sliderVolume.addEventListener('input', (e) => {
      audioOrchestrator.setVolume(parseFloat(e.target.value));
    });

    // Plein écran
    this.btnFullscreen.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Modales close
    this.btnModalJokerClose.addEventListener('click', () => {
      this.closeJokerModal();
    });

    this.btnNextLevel.addEventListener('click', () => {
      this.closeExplanationModal();
      this.timer.stop();
      this.game.nextQuestion();
    });

    // Boutons de fin de jeu
    document.querySelectorAll('.btn-restart').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showScreen(this.screenHome);
        audioOrchestrator.on('game:restart'); // Changed from audioOrchestrator.stopDrone();
      });
    });

    // Drag and Drop & Import de JSON personnalisé
    this.btnLoadCustom.addEventListener('click', () => {
      this.fileInputPack.click();
    });

    this.fileInputPack.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const result = parseAndValidateCustomPack(text);

        this.renderValidationReport(result);
        
        if (result.validation.isValid) {
          this.game.loadGame(result.data);
          this.btnLoadDefault.innerText = "Jouer avec le pack importé";
          this.btnLoadDefault.focus();
        }
      };
      reader.readAsText(file);
    });
  }

  /**
   * Écoute et réagit aux événements diffusés par la logique GameEngine.
   */
  setupEngineHooks() {
    // Pack de questions chargé
    this.game.on('loaded', (info) => {
      audioOrchestrator.on('game:loaded'); // Changed from audioOrchestrator.playTransition();
    });

    // Démarrage de partie
    this.game.on('game_started', () => {
      this.showScreen(this.screenGame);
    });

    // Nouvelle question prête
    this.game.on('question_ready', (data) => {
      this.renderQuestionScreen(data);
      this.renderLifelines(); // Rafraîchi ici car currentQuestion est garantie non-nulle
    });

    // Question changée (Joker Switch)
    this.game.on('question_switched', (data) => {
      // Effet visuel de transition
      const board = document.querySelector('.quiz-board');
      board.classList.add('slide-out');
      
      setTimeout(() => {
        this.renderQuestionScreen(data);
        this.renderLifelines(); // Reconstruire les jokers avec la nouvelle question
        board.classList.remove('slide-out');
        board.classList.add('slide-in');
        
        // Jouer un effet sonore de vent/transition
        audioOrchestrator.on('question:switched'); // Changed from audioOrchestrator.playTransition();
        setTimeout(() => board.classList.remove('slide-in'), 600);
      }, 500);
    });

    // Sélection d'une réponse
    this.game.on('answer_selected', ({ selectedIndex }) => {
      this.selectedAnswerIndex = selectedIndex;
      this.timer.pause();
      
      // Mettre en évidence la réponse choisie
      this.answerButtons.forEach((btn, idx) => {
        btn.classList.add('disabled');
        if (idx === selectedIndex) {
          btn.classList.add('selected');
        }
      });

      // Simulation d'une tension dramatique : attente de 2 secondes avant validation
      audioOrchestrator.on('timer:stop'); // Changed from audioOrchestrator.stopTicking();
      audioOrchestrator.on('answer:selected', { difficulty: Number(this.game.currentQuestion.difficulty) + 1 }); // Changed from audioOrchestrator.playDrone(...)

      setTimeout(() => {
        this.game.validateAnswer(selectedIndex);
      }, 2500);
    });

    // Bonne réponse
    this.game.on('answer_correct', ({ correctIndex, explanation, levelIndex, gain }) => {
      // Animation verte sur le bouton correct
      this.answerButtons[correctIndex].classList.remove('selected');
      this.answerButtons[correctIndex].classList.add('correct');
      
      audioOrchestrator.on('answer:correct'); // Changed from audioOrchestrator.playCorrect();

      // Mettre à jour l'échelle latérale
      this.updateLadderUI(levelIndex, true);

      // Ouvrir la modale d'explications après 1.5s
      setTimeout(() => {
        this.showExplanationModal(true, explanation, gain);
      }, 1500);
    });

    // Mauvaise réponse
    this.game.on('answer_incorrect', ({ selectedIndex, correctIndex, explanation, finalGain }) => {
      // Clignotement rouge sur le mauvais bouton et vert sur le bon
      if (selectedIndex !== null) {
        this.answerButtons[selectedIndex].classList.remove('selected');
        this.answerButtons[selectedIndex].classList.add('incorrect');
      }
      this.answerButtons[correctIndex].classList.add('correct');

      // Effet dramatique de secousse
      document.querySelector('.quiz-board').classList.add('shake');
      audioOrchestrator.on('answer:incorrect'); // Changed from audioOrchestrator.playWrong();

      setTimeout(() => {
        document.querySelector('.quiz-board').classList.remove('shake');
        this.showExplanationModal(false, explanation, finalGain);
      }, 2000);
    });

    // Temps écoulé
    this.game.on('timeout', ({ correctIndex, explanation, finalGain }) => {
      this.answerButtons[correctIndex].classList.add('correct');
      audioOrchestrator.on('question:timeout'); // Changed from audioOrchestrator.playWrong();

      // Message d'alerte rouge
      const timeoutBanner = document.createElement('div');
      timeoutBanner.className = 'timeout-banner';
      timeoutBanner.innerText = "TEMPS ÉCOULÉ !";
      this.screenGame.appendChild(timeoutBanner);

      setTimeout(() => {
        timeoutBanner.remove();
        this.showExplanationModal(false, "Vous n'avez pas répondu dans le temps imparti. " + explanation, finalGain);
      }, 2000);
    });

    // Joueur abandonne
    this.game.on('walked_away', ({ finalGain }) => {
      audioOrchestrator.on('game:walk_away'); // Changed from audioOrchestrator.playGameOver();
      this.showEndGameScreen(false, finalGain, "Vous avez choisi de vous retirer avec vos gains.");
    });

    // Victoire totale
    this.game.on('victory', ({ finalGain }) => {
      audioOrchestrator.on('game:victory'); // Changed from audioOrchestrator.playVictory();
      this.showEndGameScreen(true, finalGain, "Félicitations ! Vous êtes le nouveau millionnaire !");
    });
  }

  // --- RENDU ET LOGIQUE DE JEU ---

  /**
   * Affiche l'écran cible et masque les autres.
   */
  showScreen(targetScreen) {
    this.screenHome.classList.remove('active');
    this.screenGame.classList.remove('active');
    this.screenResult.classList.remove('active');
    
    targetScreen.classList.add('active');
  }

  /**
   * Restaure l'état visuel initial des 4 boutons de réponse.
   */
  resetAnswerButtons() {
    this.answerButtons.forEach((btn, idx) => {
      btn.className = 'answer-btn';
      btn.classList.remove('disabled', 'selected', 'correct', 'incorrect', 'hidden-ans');
      // Lettres standards A, B, C, D
      const letter = String.fromCharCode(65 + idx);
      btn.querySelector('.ans-letter').innerText = letter;
    });
    this.selectedAnswerIndex = null;
  }

  /**
   * Rendu de la question active à l'écran.
   */
  renderQuestionScreen(data) {
    const q = data.question;
    
    // Réinitialiser les états
    this.resetAnswerButtons();
    
    // Mettre à jour l'intitulé de la question et les réponses
    this.questionText.innerHTML = `<span class="q-prefix">Q${data.levelIndex + 1} :</span> ${q.text}`;
    
    this.answerButtons.forEach((btn, idx) => {
      btn.querySelector('.ans-text').innerText = q.answers[idx];
    });

    // Mettre à jour les indicateurs de gains
    this.currentGainDisplay.innerText = `${this.game.accumulatedGain} ${data.currency}`;
    this.levelIndicator.innerText = `NIVEAU ${data.levelIndex + 1} / 15`;

    // Dessiner l'échelle des gains à droite
    this.renderLadder(data.ladder, data.levelIndex, data.currency);

    // Activer le timer configuré (par défaut 30s)
    const limit = q.timeLimit || 30;
    this.timer.start(limit);

    // Lancer la musique d'ambiance progressive
    console.log(`[UIManager] Question Level: ${data.levelIndex + 1}, Question Difficulty: ${q.difficulty}`); // ADDED DEBUG LOG
    audioOrchestrator.on('question:show', { level: data.levelIndex + 1 }); // MODIFIED THIS LINE
  }

  /**
   * Dessine l'échelle latérale des gains avec les paliers de sécurité.
   */
  renderLadder(ladder, currentIdx, currency) {
    this.ladderList.innerHTML = '';
    
    // Afficher de haut en bas (le million en haut)
    for (let i = ladder.length - 1; i >= 0; i--) {
      const li = document.createElement('li');
      li.className = 'ladder-item';
      
      if (i === currentIdx) {
        li.classList.add('active');
      }

      // Détection des paliers de sécurité (Niveau 5 [index 4] et Niveau 10 [index 9])
      const isCheckpoint = (i === 4 || i === 9);
      if (isCheckpoint) {
        li.classList.add('checkpoint');
      }

      const levelNum = (i + 1).toString().padStart(2, '0');
      const val = ladder[i].toLocaleString();

      li.innerHTML = `
        <span class="ladder-num">${levelNum}</span>
        <span class="ladder-accent">♦</span>
        <span class="ladder-val">${val} ${currency}</span>
        ${isCheckpoint ? '<span class="lock-icon">🔒 Seuil</span>' : ''}
      `;
      
      this.ladderList.appendChild(li);
    }
  }

  updateLadderUI(levelIdx, isSuccess) {
    const items = this.ladderList.querySelectorAll('.ladder-item');
    // Vu que l'échelle est rendue à l'envers, l'indice DOM est : (total - 1 - levelIdx)
    const total = this.game.prizeLadder.length;
    const domIdx = total - 1 - levelIdx;
    
    if (items[domIdx]) {
      items[domIdx].classList.remove('active');
      if (isSuccess) {
        items[domIdx].classList.add('completed');
      }
    }
  }

  /**
   * Gère le choix d'une réponse par clic.
   */
  handleAnswerSelection(index) {
    if (this.game.state !== 'QUESTION_ACTIVE') return;

    // Déclenche l'état de sélection dans le moteur
    this.game.selectAnswer(index);
  }

  // --- ACTIONS DES JOKERS (LIFELINES) ---

  /**
   * Dessine les boutons des jokers disponibles dans le panneau de jeu.
   */
  renderLifelines() {
    this.lifelineContainer.innerHTML = '';
    const list = lifelines.getAll();

    // Vérifier si la question en cours restreint certains jokers (optionnel)
    const allowed = this.game.currentQuestion.lifelinesAllowed || ['50_50', 'phone_friend', 'public_vote', 'switch'];

    list.forEach(joker => {
      const btn = document.createElement('button');
      btn.className = 'lifeline-btn';
      btn.setAttribute('id', `joker-${joker.id}`);
      btn.innerHTML = `${joker.icon} <span class="joker-lbl">${joker.name}</span>`;

      // Désactivé si déjà utilisé ou non autorisé sur cette question
      if (joker.isUsed) {
        btn.classList.add('used');
        btn.setAttribute('disabled', 'true');
      } else if (!allowed.includes(joker.id)) {
        btn.classList.add('restricted');
        btn.setAttribute('disabled', 'true');
      } else {
        btn.addEventListener('click', () => {
          this.triggerLifeline(joker.id);
        });
      }

      this.lifelineContainer.appendChild(btn);
    });
  }

  /**
   * Déclenche un joker et applique les effets visuels.
   */
  triggerLifeline(id) {
    if (this.game.state !== 'QUESTION_ACTIVE') return;

    // Suspendre le timer pendant la résolution interactive du joker
    this.timer.pause();

    try {
      const result = this.game.useLifeline(id);
      
      // Désactiver visuellement le bouton du joker
      const btn = document.getElementById(`joker-${id}`);
      if (btn) {
        btn.classList.add('used');
        btn.setAttribute('disabled', 'true');
      }

      // Appliquer les effets visuels spécifiques au type de joker
      if (id === '50_50') {
        result.removedIndices.forEach(idx => {
          // Transition fluide de disparition
          this.answerButtons[idx].classList.add('hidden-ans');
        });
        // Le 50/50 n'exigeant pas de modale, on reprend le timer immédiatement
        this.timer.resume();
      } else if (id === 'phone_friend') {
        this.showPhoneFriendModal(result);
      } else if (id === 'public_vote') {
        this.showPublicVoteModal(result);
      } else if (id === 'switch') {
        // Le switch déclenche l'évent 'question_switched' qui redémarre la question et le timer
      }
    } catch (e) {
      alert(e.message);
      this.timer.resume();
    }
  }

  // --- MODAL DIALOGS ---

  showPhoneFriendModal(data) {
    this.modalJokerTitle.innerText = "☎️ APPEL À UN AMI";
    this.modalJokerContent.innerHTML = `
      <div class="friend-call-box">
        <div class="friend-profile">
          <div class="friend-avatar">🧑‍💼</div>
          <div>
            <h3>${data.friendName}</h3>
            <p class="friend-relation">${data.relation}</p>
          </div>
        </div>
        <div class="chat-bubble left animate-chat">
          <p>Allo ? Oui, je t'écoute, dis-moi tout ! Le chrono tourne...</p>
        </div>
        <div class="chat-bubble right dynamic-delay-1">
          <p>La question est : "${this.game.currentQuestion.text}"</p>
        </div>
        <div class="chat-bubble left dynamic-delay-2">
          <p>${data.dialogue}</p>
        </div>
      </div>
    `;

    this.openJokerModal();
  }

  showPublicVoteModal(data) {
    this.modalJokerTitle.innerText = "📊 AVIS DU PUBLIC";
    
    // Récupérer les indices éliminés (par exemple du 50/50 précédent)
    const eliminated = data.eliminatedIndices || [];

    // Génère des barres animées élégantes
    let barsHtml = '<div class="public-chart">';
    data.votes.forEach((percent, idx) => {
      const letter = String.fromCharCode(65 + idx);
      const isEliminated = eliminated.includes(idx);
      barsHtml += `
        <div class="chart-col ${isEliminated ? 'hidden-ans' : ''}">
          <div class="chart-bar-container">
            <div class="chart-bar" style="height: 0%" data-percent="${isEliminated ? 0 : percent}">
              <span class="bar-value">${isEliminated ? '0' : percent}%</span>
            </div>
          </div>
          <span class="chart-label">Rép. ${letter}</span>
        </div>
      `;
    });
    barsHtml += '</div>';

    // Correction cruciale : assigner le contenu HTML à la modale
    this.modalJokerContent.innerHTML = barsHtml;

    this.openJokerModal();

    // Lancer l'animation de montée des barres de graphique après affichage
    setTimeout(() => {
      const bars = this.modalJokerContent.querySelectorAll('.chart-bar');
      bars.forEach(bar => {
        const targetPercent = bar.getAttribute('data-percent');
        bar.style.height = `${targetPercent}%`;
      });
    }, 100);
  }

  openJokerModal() {
    this.modalJoker.classList.add('active');
  }

  closeJokerModal() {
    this.modalJoker.classList.remove('active');
    // Reprendre le chrono suspendu
    this.timer.resume();
  }

  // Modale Post-réponse (Explications)
  showExplanationModal(isCorrect, explanation, nextPrize) {
    this.modalExplanation.classList.add('active');
    
    const banner = this.modalExplanation.querySelector('.exp-banner');
    const header = this.modalExplanation.querySelector('.exp-header');
    
    if (isCorrect) {
      banner.className = 'exp-banner correct';
      banner.innerText = 'EXCELLENTE RÉPONSE !';
      
      const formatted = nextPrize.toLocaleString();
      header.innerHTML = `Vous remportez **${formatted} ${this.game.currency}** !<br><small>Prêt pour le niveau suivant ?</small>`;
      this.btnNextLevel.innerText = "Question Suivante";
      this.btnNextLevel.style.display = "block";
    } else {
      banner.className = 'exp-banner incorrect';
      banner.innerText = 'RÉPONSE INCORRECTE...';
      
      const formatted = nextPrize.toLocaleString();
      header.innerHTML = `Le jeu s'arrête ici.<br>Vous repartez avec le seuil garanti de **${formatted} ${this.game.currency}** !`;
      
      this.btnNextLevel.style.display = "none";
      
      // Ajouter un bouton pour aller à l'écran de fin
      let btnEnd = document.getElementById('btn-go-to-end');
      if (!btnEnd) {
        btnEnd = document.createElement('button');
        btnEnd.setAttribute('id', 'btn-go-to-end');
        btnEnd.className = 'glow-btn-gold';
        btnEnd.innerText = "Voir les résultats";
        this.modalExplanation.querySelector('.modal-body').appendChild(btnEnd);
      }
      
      btnEnd.onclick = () => {
        btnEnd.remove();
        this.closeExplanationModal();
        this.showEndGameScreen(false, nextPrize, "Vous avez échoué sur une question.");
      };
    }

    this.explanationText.innerHTML = explanation || "Pas d'explication disponible pour cette question.";
  }

  closeExplanationModal() {
    this.modalExplanation.classList.remove('active');
  }

  // --- ÉCRAN DE FIN DE PARTIE ---

  showEndGameScreen(isAbsoluteVictory, finalGain, descriptionMsg) {
    this.timer.stop();
    this.showScreen(this.screenResult);

    const titleEl = document.getElementById('result-title');
    const gainEl = document.getElementById('result-gain-value');
    const descEl = document.getElementById('result-description');
    
    const formatted = finalGain.toLocaleString();
    gainEl.innerText = `${formatted} ${this.game.currency}`;
    descEl.innerText = descriptionMsg;

    if (isAbsoluteVictory) {
      titleEl.innerText = "👑 VICTOIRE ABSOLUE ! 👑";
      titleEl.className = "victory-title glow-gold";
      this.triggerConfettiEffect();
    } else {
      titleEl.innerText = "GAME OVER";
      titleEl.className = "gameover-title";
    }
  }

  /**
   * Crée une animation festive de confettis en pur CSS pour la victoire.
   */
  triggerConfettiEffect() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    this.screenResult.appendChild(container);

    const colors = ['#ffd700', '#00d2ff', '#2ecc71', '#e74c3c', '#9b59b6', '#e67e22'];
    for (let i = 0; i < 100; i++) {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.style.left = `${Math.random() * 100}%`;
      c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDelay = `${Math.random() * 3}s`;
      c.style.transform = `scale(${Math.random() * 0.7 + 0.3})`;
      container.appendChild(c);
    }

    setTimeout(() => {
      container.remove();
    }, 6000);
  }

  // --- OUTILS COMPLÉMENTAIRES ---

  updateMuteButtonVisual(isMuted) {
    if (isMuted) {
      this.btnMute.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12a3 3 0 0 0-3 3z"/></svg>`;
      this.btnMute.classList.add('muted');
    } else {
      this.btnMute.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
      this.btnMute.classList.remove('muted');
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Impossible d'activer le plein écran : ${err.message}`);
      });
      this.btnFullscreen.classList.add('active');
    } else {
      document.exitFullscreen();
      this.btnFullscreen.classList.remove('active');
    }
  }

  renderValidationReport(result) {
    this.validationReport.innerHTML = '';
    this.validationReport.style.display = 'block';

    const header = document.createElement('h4');
    if (result.validation.isValid) {
      header.className = 'text-success';
      header.innerText = '✓ Fichier JSON valide et conforme !';
      this.validationReport.appendChild(header);

      const summary = document.createElement('p');
      summary.innerText = `Pack "${result.data.game.title}" (${result.data.game.theme}) : ${result.data.game.questions.length} questions chargées avec succès.`;
      this.validationReport.appendChild(summary);
    } else {
      header.className = 'text-error';
      header.innerText = '❌ Erreurs de validation détectées :';
      this.validationReport.appendChild(header);

      const ul = document.createElement('ul');
      result.validation.errors.forEach(err => {
        const li = document.createElement('li');
        li.innerText = err;
        if (err.startsWith("Avertissement")) {
          li.className = 'warning';
        }
        ul.appendChild(li);
      });
      this.validationReport.appendChild(ul);
    }
  }
}
export default UIManager;
