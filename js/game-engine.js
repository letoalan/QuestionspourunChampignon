import { organizeQuestionsByDifficulty } from './question-loader.js';
import { lifelines } from './lifelines.js';

// Liste par défaut des gains classiques (15 paliers)
const DEFAULT_PRIZE_LADDER = [
  100, 200, 300, 500, 1000, // Niveau 1-5 (Palier 1 de sécurité à 1000)
  2000, 4000, 8000, 16000, 32000, // Niveau 6-10 (Palier 2 de sécurité à 32000)
  64000, 125000, 250000, 500000, 1000000 // Niveau 11-15 (Le Million !)
];

export const GameStates = {
  INIT: 'INIT',
  START: 'START',
  QUESTION_ACTIVE: 'QUESTION_ACTIVE',
  ANSWER_SELECTED: 'ANSWER_SELECTED',
  REVEAL_ANSWER: 'REVEAL_ANSWER',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY'
};

export class GameEngine {
  constructor() {
    this.state = GameStates.INIT;
    this.gameData = null;
    this.questionBank = null; // Map de (difficulté -> tableau de questions)
    
    this.prizeLadder = DEFAULT_PRIZE_LADDER;
    this.currency = '€';
    
    // Variables d'état d'une partie
    this.currentLevelIndex = 0; // 0 à 14
    this.currentQuestion = null;
    this.usedQuestionIds = new Set();
    this.accumulatedGain = 0;
    this.isLifelineActiveMap = {}; // Enregistre l'usage des jokers
    this.eliminatedIndices = []; // Indices des réponses éliminées par le joker 50/50

    // Système d'écouteurs d'événements (Event Emitter simple)
    this.listeners = {};
  }

  // Enregistre un écouteur sur un événement de jeu
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Déclenche un événement
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * Charge un pack de questions validé dans le moteur.
   */
  loadGame(gameData) {
    this.gameData = gameData;
    this.questionBank = organizeQuestionsByDifficulty(gameData);
    this.currency = gameData.game.currency || '€';
    
    // Si le pack définit des gains sur les questions, on peut ajuster l'échelle
    const questions = gameData.game.questions;
    const customGains = questions
      .map(q => Number(q.gain))
      .filter(g => !isNaN(g))
      .sort((a, b) => a - b);
      
    // Garder unique et ordonné
    const uniqueGains = [...new Set(customGains)];
    if (uniqueGains.length >= 5) {
      this.prizeLadder = uniqueGains;
    } else {
      this.prizeLadder = DEFAULT_PRIZE_LADDER;
    }

    this.state = GameStates.START;
    this.emit('loaded', {
      title: gameData.game.title,
      theme: gameData.game.theme,
      levelsCount: this.prizeLadder.length
    });
  }

  /**
   * Démarre une nouvelle partie.
   */
  startNewGame() {
    if (!this.gameData) {
      throw new Error("Aucun pack de questions n'est chargé !");
    }

    this.currentLevelIndex = 0;
    this.usedQuestionIds.clear();
    this.accumulatedGain = 0;
    
    // Réinitialiser les jokers dans le registre
    lifelines.resetAll();
    
    this.state = GameStates.QUESTION_ACTIVE;
    this.emit('game_started');
    this.nextQuestion();
  }

  /**
   * Sélectionne et prépare la question pour le niveau actuel.
   */
  nextQuestion() {
    if (this.currentLevelIndex >= this.prizeLadder.length) {
      this.state = GameStates.VICTORY;
      this.accumulatedGain = this.prizeLadder[this.prizeLadder.length - 1];
      this.emit('victory', { finalGain: this.accumulatedGain });
      return;
    }

    // Déterminer la difficulté de la question requise
    // Pour une échelle standard de 15 questions :
    // - Niveaux 0-4 : Difficulté 1
    // - Niveaux 5-9 : Difficulté 2
    // - Niveaux 10-14 : Difficulté 3
    const totalLevels = this.prizeLadder.length;
    let requiredDifficulty = 1;
    if (this.currentLevelIndex >= Math.floor(totalLevels * 0.66)) {
      requiredDifficulty = 3;
    } else if (this.currentLevelIndex >= Math.floor(totalLevels * 0.33)) {
      requiredDifficulty = 2;
    }

    // Choisir une question dans la banque pour cette difficulté
    let list = this.questionBank.get(requiredDifficulty) || [];
    let unused = list.filter(q => !this.usedQuestionIds.has(q.id));

    // Fallback de sécurité si plus de questions disponibles pour cette difficulté
    if (unused.length === 0) {
      // Tenter de prendre n'importe quelle difficulté non posée
      const allQuestions = this.gameData.game.questions;
      unused = allQuestions.filter(q => !this.usedQuestionIds.has(q.id));
    }
    
    if (unused.length === 0) {
      // Ultime recours : réutiliser n'importe quelle question (sauf la courante)
      const allQuestions = this.gameData.game.questions;
      unused = allQuestions.filter(q => !this.currentQuestion || q.id !== this.currentQuestion.id);
    }

    const question = unused[Math.floor(Math.random() * unused.length)];
    this.currentQuestion = question;
    this.usedQuestionIds.add(question.id);
    this.eliminatedIndices = []; // Réinitialiser pour la nouvelle question
    
    this.state = GameStates.QUESTION_ACTIVE;
    this.emit('question_ready', {
      question: question,
      levelIndex: this.currentLevelIndex,
      prizeValue: this.prizeLadder[this.currentLevelIndex],
      nextPrizeValue: this.prizeLadder[this.currentLevelIndex],
      ladder: this.prizeLadder,
      currency: this.currency
    });
  }

  /**
   * Traite la sélection d'une réponse par le joueur.
   */
  selectAnswer(answerIndex) {
    if (this.state !== GameStates.QUESTION_ACTIVE) return;

    this.state = GameStates.ANSWER_SELECTED;
    this.emit('answer_selected', { selectedIndex: answerIndex });
  }

  /**
   * Valide la réponse sélectionnée et effectue la transition de score/état.
   */
  validateAnswer(selectedIndex) {
    if (this.state !== GameStates.ANSWER_SELECTED) return;

    const isCorrect = selectedIndex === this.currentQuestion.correctIndex;
    this.state = GameStates.REVEAL_ANSWER;

    if (isCorrect) {
      // Gain accumulé correspond au niveau franchi
      this.accumulatedGain = this.prizeLadder[this.currentLevelIndex];
      this.emit('answer_correct', {
        correctIndex: this.currentQuestion.correctIndex,
        explanation: this.currentQuestion.explanation,
        levelIndex: this.currentLevelIndex,
        gain: this.accumulatedGain
      });
      
      this.currentLevelIndex++;
    } else {
      // Défaite ! Application des paliers de sécurité
      // Palier 1 : Niveau 5 franchi (index 4) -> Sécurité à l'index 4
      // Palier 2 : Niveau 10 franchi (index 9) -> Sécurité à l'index 9
      let safetyGain = 0;
      if (this.currentLevelIndex >= 10) {
        safetyGain = this.prizeLadder[9]; // Niveau 10 garanti
      } else if (this.currentLevelIndex >= 5) {
        safetyGain = this.prizeLadder[4]; // Niveau 5 garanti
      }

      this.accumulatedGain = safetyGain;
      this.state = GameStates.GAME_OVER;
      
      this.emit('answer_incorrect', {
        selectedIndex: selectedIndex,
        correctIndex: this.currentQuestion.correctIndex,
        explanation: this.currentQuestion.explanation,
        finalGain: safetyGain
      });
    }
  }

  /**
   * Permet au joueur de quitter le jeu de lui-même et d'empocher ses gains actuels.
   */
  walkAway() {
    if (this.state !== GameStates.QUESTION_ACTIVE && this.state !== GameStates.ANSWER_SELECTED) return;

    // S'il quitte, il repart avec tout ce qu'il a déjà gagné (le niveau précédent)
    // S'il est à la question 1 et abandonne sans y répondre, il gagne 0.
    const finalGain = this.currentLevelIndex > 0 ? this.prizeLadder[this.currentLevelIndex - 1] : 0;
    this.accumulatedGain = finalGain;
    this.state = GameStates.GAME_OVER;
    
    this.emit('walked_away', { finalGain });
  }

  /**
   * Cas spécial où le temps imparti expire sans réponse.
   */
  handleTimeout() {
    if (this.state !== GameStates.QUESTION_ACTIVE && this.state !== GameStates.ANSWER_SELECTED) return;

    let safetyGain = 0;
    if (this.currentLevelIndex >= 10) {
      safetyGain = this.prizeLadder[9];
    } else if (this.currentLevelIndex >= 5) {
      safetyGain = this.prizeLadder[4];
    }

    this.accumulatedGain = safetyGain;
    this.state = GameStates.GAME_OVER;

    this.emit('timeout', {
      correctIndex: this.currentQuestion.correctIndex,
      explanation: this.currentQuestion.explanation,
      finalGain: safetyGain
    });
  }

  /**
   * Déclenche un joker enregistré (50/50, public, ami, switch).
   */
  useLifeline(lifelineId) {
    const joker = lifelines.get(lifelineId);
    if (!joker) {
      throw new Error(`Le joker '${lifelineId}' n'existe pas.`);
    }

    // Le joker délègue l'effet en fournissant un état partiel du jeu
    const result = joker.use({
      currentQuestion: this.currentQuestion,
      questionBank: this.questionBank,
      usedQuestionIds: this.usedQuestionIds,
      eliminatedIndices: this.eliminatedIndices // Indices déjà retirés par le 50/50
    });

    // Mémoriser les indices éliminés si c'est un joker 50/50
    if (lifelineId === '50_50' && result.removedIndices) {
      this.eliminatedIndices = result.removedIndices;
    }

    // Si c'est un joker SWITCH (changement de question) : on doit mettre à jour la question courante
    if (lifelineId === 'switch' && result.newQuestion) {
      this.currentQuestion = result.newQuestion;
      this.usedQuestionIds.add(result.newQuestion.id);
      
      // On notifie la vue pour rafraîchir l'affichage sans changer de niveau
      this.emit('question_switched', {
        question: result.newQuestion,
        levelIndex: this.currentLevelIndex,
        prizeValue: this.prizeLadder[this.currentLevelIndex]
      });
    } else {
      this.emit('lifeline_used', result);
    }

    return result;
  }
}
export default GameEngine;
