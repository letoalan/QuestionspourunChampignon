/**
 * Module de validation de schéma pour les packs de questions.
 * Valide la structure du fichier JSON importé et retourne les erreurs.
 */
export function validateQuestionPack(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Le fichier JSON chargé est invalide ou vide.'] };
  }

  // 1. Validation de la version
  if (!data.version) {
    errors.push("Le champ 'version' est requis à la racine.");
  } else if (typeof data.version !== 'string') {
    errors.push("Le champ 'version' doit être une chaîne de caractères (ex: \"1.0\").");
  }

  // 2. Validation de l'objet principal 'game'
  if (!data.game || typeof data.game !== 'object') {
    errors.push("L'objet principal 'game' est requis à la racine.");
    return { isValid: false, errors };
  }

  const game = data.game;

  // 3. Validation des métadonnées du jeu
  if (!game.title || typeof game.title !== 'string') {
    errors.push("Le champ 'game.title' est requis et doit être une chaîne de caractères.");
  }

  if (!game.theme || typeof game.theme !== 'string') {
    errors.push("Le champ 'game.theme' est requis et doit être une chaîne de caractères.");
  }

  // 4. Validation du tableau de questions
  if (!game.questions) {
    errors.push("Le tableau 'game.questions' est requis.");
    return { isValid: false, errors };
  }

  if (!Array.isArray(game.questions)) {
    errors.push("Le champ 'game.questions' doit être un tableau.");
    return { isValid: false, errors };
  }

  if (game.questions.length === 0) {
    errors.push("Le tableau 'game.questions' doit contenir au moins une question.");
    return { isValid: false, errors };
  }

  const questionIds = new Set();

  // 5. Validation détaillée de chaque question
  game.questions.forEach((q, idx) => {
    const qPath = `game.questions[${idx}]`;

    if (typeof q !== 'object' || q === null) {
      errors.push(`${qPath} n'est pas un objet valide.`);
      return;
    }

    // ID de la question
    if (!q.id) {
      errors.push(`${qPath} : Le champ 'id' est manquant.`);
    } else {
      if (typeof q.id !== 'string' && typeof q.id !== 'number') {
        errors.push(`${qPath} : L'id doit être une chaîne ou un nombre.`);
      }
      if (questionIds.has(q.id)) {
        errors.push(`${qPath} : L'id '${q.id}' est en doublon.`);
      }
      questionIds.add(q.id);
    }

    // Texte de la question
    if (!q.text || typeof q.text !== 'string') {
      errors.push(`${qPath} (id: ${q.id || idx}) : Le champ 'text' est manquant ou n'est pas une chaîne.`);
    }

    // Réponses (4 attendues)
    if (!q.answers) {
      errors.push(`${qPath} (id: ${q.id || idx}) : Le tableau 'answers' est manquant.`);
    } else if (!Array.isArray(q.answers)) {
      errors.push(`${qPath} (id: ${q.id || idx}) : Le champ 'answers' doit être un tableau.`);
    } else if (q.answers.length !== 4) {
      errors.push(`${qPath} (id: ${q.id || idx}) : Il doit y avoir exactement 4 réponses possibles.`);
    } else {
      q.answers.forEach((ans, ansIdx) => {
        if (typeof ans !== 'string' && typeof ans !== 'number') {
          errors.push(`${qPath} (id: ${q.id || idx}) : La réponse à l'index ${ansIdx} doit être du texte ou un nombre.`);
        }
      });
    }

    // Index correct (0 à 3)
    if (q.correctIndex === undefined || q.correctIndex === null) {
      errors.push(`${qPath} (id: ${q.id || idx}) : Le champ 'correctIndex' est manquant.`);
    } else {
      const cIdx = Number(q.correctIndex);
      if (!Number.isInteger(cIdx) || cIdx < 0 || cIdx > 3) {
        errors.push(`${qPath} (id: ${q.id || idx}) : 'correctIndex' doit être un entier compris entre 0 et 3.`);
      }
    }

    // Difficulté
    if (q.difficulty === undefined || q.difficulty === null) {
      errors.push(`${qPath} (id: ${q.id || idx}) : Le champ 'difficulty' est manquant.`);
    } else if (!Number.isInteger(Number(q.difficulty)) || Number(q.difficulty) <= 0) {
      errors.push(`${qPath} (id: ${q.id || idx}) : 'difficulty' doit être un entier positif.`);
    }

    // Gain
    if (q.gain === undefined || q.gain === null) {
      errors.push(`${qPath} (id: ${q.id || idx}) : Le champ 'gain' est manquant.`);
    } else if (isNaN(Number(q.gain)) || Number(q.gain) < 0) {
      errors.push(`${qPath} (id: ${q.id || idx}) : 'gain' doit être un nombre positif.`);
    }

    // Limite de temps optionnelle
    if (q.timeLimit !== undefined && q.timeLimit !== null) {
      if (isNaN(Number(q.timeLimit)) || Number(q.timeLimit) <= 0) {
        errors.push(`${qPath} (id: ${q.id || idx}) : 'timeLimit' doit être un nombre positif si présent.`);
      }
    }

    // Explications optionnelles
    if (q.explanation !== undefined && typeof q.explanation !== 'string') {
      errors.push(`${qPath} (id: ${q.id || idx}) : 'explanation' doit être une chaîne de caractères si présent.`);
    }

    // Jokers autorisés optionnels
    if (q.lifelinesAllowed !== undefined) {
      if (!Array.isArray(q.lifelinesAllowed)) {
        errors.push(`${qPath} (id: ${q.id || idx}) : 'lifelinesAllowed' doit être un tableau s'il est fourni.`);
      } else {
        const validLifelines = ['50_50', 'phone_friend', 'public_vote', 'switch'];
        q.lifelinesAllowed.forEach((life) => {
          if (!validLifelines.includes(life)) {
            errors.push(`${qPath} (id: ${q.id || idx}) : Le joker '${life}' n'est pas reconnu. Valides: ${validLifelines.join(', ')}.`);
          }
        });
      }
    }
  });

  // Recommandation : Avoir au moins 15 questions au total (ou par paliers de difficulté) pour un jeu classique
  const uniqueDifficulties = new Set(game.questions.map(q => Number(q.difficulty)));
  if (game.questions.length < 15 && uniqueDifficulties.size < 3) {
    errors.push("Avertissement : Le pack contient moins de 15 questions. Le jeu s'adaptera, mais pour une expérience classique complète, 15 questions progressives sont recommandées.");
  }

  return {
    isValid: errors.filter(e => !e.startsWith("Avertissement")).length === 0,
    errors
  };
}
