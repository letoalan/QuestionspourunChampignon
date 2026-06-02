/**
 * Module des Jokers (Lifelines) modulaires sous forme de plugins.
 * Gère l'activation et les effets logiques de chaque joker sur le jeu.
 */

class LifelineRegistry {
  constructor() {
    this.plugins = new Map();
  }

  register(lifeline) {
    this.plugins.set(lifeline.id, lifeline);
    console.log(`Joker enregistré : ${lifeline.name} (${lifeline.id})`);
  }

  get(id) {
    return this.plugins.get(id);
  }

  getAll() {
    return Array.from(this.plugins.values());
  }

  resetAll() {
    this.plugins.forEach(p => p.reset());
  }
}

class BaseLifeline {
  constructor(id, name, icon) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.isUsed = false;
  }

  use(gameState) {
    if (this.isUsed) {
      throw new Error(`Le joker ${this.name} a déjà été utilisé !`);
    }
    this.isUsed = true;
    return this.execute(gameState);
  }

  execute(gameState) {
    // À surcharger par les classes dérivées
    return null;
  }

  reset() {
    this.isUsed = false;
  }
}

// 1. JOKER 50/50 : Élimine deux mauvaises réponses au hasard
class FiftyFiftyLifeline extends BaseLifeline {
  constructor() {
    super(
      '50_50', 
      '50/50', 
      `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16M4 15h16M10 9l4 6"/></svg>`
    );
  }

  execute(gameState) {
    const question = gameState.currentQuestion;
    const correctIdx = question.correctIndex;
    
    // Liste des indices incorrects
    const incorrectIndices = [0, 1, 2, 3].filter(idx => idx !== correctIdx);
    
    // Sélectionner aléatoirement 2 indices à retirer parmi les 3 incorrects
    const indicesToRemove = [];
    while (indicesToRemove.length < 2) {
      const randIdx = Math.floor(Math.random() * incorrectIndices.length);
      const chosen = incorrectIndices.splice(randIdx, 1)[0];
      indicesToRemove.push(chosen);
    }

    return {
      type: '50_50',
      removedIndices: indicesToRemove // Les indices des réponses à cacher dans l'UI
    };
  }
}

// 2. JOKER APPEL À UN AMI : Simule un appel minuté avec un texte d'aide réaliste
class PhoneFriendLifeline extends BaseLifeline {
  constructor() {
    super(
      'phone_friend', 
      'Appel à un ami', 
      `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
    );
    this.friendsList = [
      { name: "Professeur Jean", relation: "Ton prof d'université", confidence: [95, 80, 50] },
      { name: "Maman", relation: "Ta plus grande fan", confidence: [98, 65, 30] },
      { name: "Thomas le geek", relation: "Ton meilleur ami incollable", confidence: [90, 85, 60] },
      { name: "Lucie", relation: "Ta cousine férue de lecture", confidence: [88, 75, 45] }
    ];
  }

  execute(gameState) {
    const question = gameState.currentQuestion;
    const correctIdx = question.correctIndex;
    const difficulty = Number(question.difficulty);

    // Choisir un ami au hasard
    const friend = this.friendsList[Math.floor(Math.random() * this.friendsList.length)];
    
    // Déterminer la probabilité de donner la bonne réponse (dépend de la difficulté du palier)
    const confidenceRating = friend.confidence[difficulty - 1] || 50;
    const isCorrect = (Math.random() * 100) <= confidenceRating;
    
    let suggestedIdx = correctIdx;
    if (!isCorrect) {
      // Si l'ami se trompe, il choisit un index incorrect au hasard
      const incorrects = [0, 1, 2, 3].filter(idx => idx !== correctIdx);
      suggestedIdx = incorrects[Math.floor(Math.random() * incorrects.length)];
    }

    const answerLetter = String.fromCharCode(65 + suggestedIdx); // 'A', 'B', 'C', ou 'D'
    const answerText = question.answers[suggestedIdx];

    // Génération du script de dialogue dynamique
    let dialogue = "";
    if (difficulty === 1) {
      dialogue = `"Allô ? Ah, salut ! Oui, je connais super bien ce sujet. C'est facile, c'est sans aucun doute la réponse **${answerLetter} : ${answerText}**. Tu peux y aller les yeux fermés !"`;
    } else if (difficulty === 2) {
      dialogue = `"Allô ! Ouh là, le chrono tourne déjà ? Bon, laisse-moi réfléchir... Je crois que c'est la **${answerLetter} : ${answerText}**. Je dirais que j'en suis sûr à environ ${confidenceRating}%. C'est mon dernier mot !"`;
    } else {
      dialogue = `"Allô ? Ah mince, c'est une question très difficile... Attends... Hmm, j'hésite énormément. Je pencherais peut-être pour la **${answerLetter} : ${answerText}**, mais c'est vraiment une supposition. Je ne suis sûr qu'à ${confidenceRating}%. Prends mon avis avec précaution !"`;
    }

    return {
      type: 'phone_friend',
      friendName: friend.name,
      relation: friend.relation,
      dialogue: dialogue,
      suggestedIndex: suggestedIdx
    };
  }
}

// 3. JOKER AVIS DU PUBLIC : Simule les votes du public avec histogrammes
class PublicVoteLifeline extends BaseLifeline {
  constructor() {
    super(
      'public_vote', 
      'Avis du public', 
      `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    );
  }

  execute(gameState) {
    const question = gameState.currentQuestion;
    const correctIdx = question.correctIndex;
    const difficulty = Number(question.difficulty);

    // Ajuste la pertinence de l'avis du public en fonction de la difficulté
    let correctWeight = 0.7; // Facile (70% des votes sur la bonne réponse)
    if (difficulty === 2) {
      correctWeight = 0.5;   // Moyen (50% de votes)
    } else if (difficulty === 3) {
      correctWeight = 0.32;  // Difficile (le public est divisé ou indécis, ~32%)
    }

    const votes = [0, 0, 0, 0];
    let remaining = 100;

    // Assigner la part de la bonne réponse
    const correctPercent = Math.floor(correctWeight * 100 + (Math.random() * 10 - 5));
    votes[correctIdx] = correctPercent;
    remaining -= correctPercent;

    // Distribuer le reste sur les 3 mauvaises réponses de façon aléatoire
    const badIndices = [0, 1, 2, 3].filter(idx => idx !== correctIdx);
    
    // Premier faux
    const firstBad = Math.floor(Math.random() * (remaining - 10));
    votes[badIndices[0]] = firstBad;
    remaining -= firstBad;

    // Deuxième faux
    const secondBad = Math.floor(Math.random() * remaining);
    votes[badIndices[1]] = secondBad;
    remaining -= secondBad;

    // Troisième faux prend tout le reste restant
    votes[badIndices[2]] = remaining;

    // Retourne le tableau des pourcentages des votes (ex: [10, 65, 15, 10])
    return {
      type: 'public_vote',
      votes: votes
    };
  }
}

// 4. JOKER SWITCH : Remplace la question courante par une autre de même difficulté
class SwitchQuestionLifeline extends BaseLifeline {
  constructor() {
    super(
      'switch', 
      'Changer de question', 
      `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`
    );
  }

  execute(gameState) {
    const question = gameState.currentQuestion;
    const difficulty = Number(question.difficulty);
    const bank = gameState.questionBank;

    if (!bank || !bank.has(difficulty)) {
      throw new Error("Aucune banque de questions n'est configurée pour ce joker !");
    }

    const diffQuestions = bank.get(difficulty);
    
    // Filtrer pour éviter la question courante et celles déjà utilisées
    const unused = diffQuestions.filter(q => q.id !== question.id && !gameState.usedQuestionIds.has(q.id));

    if (unused.length === 0) {
      throw new Error("Désolé, il n'y a plus de questions alternatives disponibles pour cette difficulté.");
    }

    // Prendre une question alternative au hasard
    const newQuestion = unused[Math.floor(Math.random() * unused.length)];

    return {
      type: 'switch',
      newQuestion: newQuestion
    };
  }
}

// Initialisation et enregistrement des jokers standards
export const lifelines = new LifelineRegistry();
lifelines.register(new FiftyFiftyLifeline());
lifelines.register(new PhoneFriendLifeline());
lifelines.register(new PublicVoteLifeline());
lifelines.register(new SwitchQuestionLifeline());

export default lifelines;
