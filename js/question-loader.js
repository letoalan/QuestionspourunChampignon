import { validateQuestionPack } from './schema-validator.js';

// Question de secours intégrées pour parer aux erreurs CORS si index.html est ouvert en direct file://
const BACKUP_PACK = {
  version: "1.0",
  game: {
    title: "Le Grand Quiz (Mode Secours - Sans Serveur)",
    theme: "Culture Générale",
    currency: "points",
    questions: [
      {
        id: "b1",
        text: "Quelle couleur obtient-on en mélangeant du bleu et du jaune ?",
        answers: ["Le violet", "Le orange", "Le vert", "Le marron"],
        correctIndex: 2,
        difficulty: 1,
        timeLimit: 30,
        gain: 100,
        explanation: "Le vert est une couleur secondaire issue du mélange des deux couleurs primaires : bleu et jaune.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b2",
        text: "Dans quel sport utilise-t-on un volant et une raquette ?",
        answers: ["Le tennis", "Le badminton", "Le ping-pong", "Le squash"],
        correctIndex: 1,
        difficulty: 1,
        timeLimit: 30,
        gain: 200,
        explanation: "Le badminton se joue avec une raquette et un volant plumeux ou plastique.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b3",
        text: "Qui a peint la célèbre Joconde exposée au Louvre ?",
        answers: ["Claude Monet", "Vincent van Gogh", "Léonard de Vinci", "Pablo Picasso"],
        correctIndex: 2,
        difficulty: 1,
        timeLimit: 30,
        gain: 300,
        explanation: "Léonard de Vinci a débuté la peinture de la Joconde (Mona Lisa) au début du XVIe siècle.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b4",
        text: "Quel est le nom du satellite naturel de la Terre ?",
        answers: ["Mars", "La Lune", "Vénus", "Titan"],
        correctIndex: 1,
        difficulty: 1,
        timeLimit: 30,
        gain: 500,
        explanation: "La Lune est le seul satellite naturel de la Terre.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b5",
        text: "Quelle planète du système solaire est surnommée la planète rouge ?",
        answers: ["Vénus", "Mars", "Jupiter", "Mercure"],
        correctIndex: 1,
        difficulty: 1,
        timeLimit: 30,
        gain: 1000,
        explanation: "Mars est recouverte d'oxyde de fer qui lui confère sa couleur rouge rouille.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b6",
        text: "Quel célèbre détroit sépare l'Espagne du Maroc ?",
        answers: ["Le détroit de Gibraltar", "Le détroit de Magellan", "Le détroit de Béring", "Le canal de Suez"],
        correctIndex: 0,
        difficulty: 2,
        timeLimit: 40,
        gain: 2000,
        explanation: "Le détroit de Gibraltar relie l'océan Atlantique à la mer Méditerranée.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b7",
        text: "En quelle année s'est déroulée la prise de la Bastille ?",
        answers: ["1492", "1789", "1815", "1914"],
        correctIndex: 1,
        difficulty: 2,
        timeLimit: 40,
        gain: 4000,
        explanation: "La prise de la Bastille a eu lieu le 14 juillet 1789 à Paris.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b8",
        text: "Dans quelle mythologie trouve-t-on le dieu de la foudre nommé Zeus ?",
        answers: ["La mythologie romaine", "La mythologie égyptienne", "La mythologie grecque", "La mythologie nordique"],
        correctIndex: 2,
        difficulty: 2,
        timeLimit: 40,
        gain: 8000,
        explanation: "Zeus est le roi des dieux de la mythologie grecque.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b9",
        text: "Quel élément chimique a pour symbole 'O' ?",
        answers: ["L'Or", "Le Carbone", "L'Azote", "L'Oxygène"],
        correctIndex: 3,
        difficulty: 2,
        timeLimit: 40,
        gain: 16000,
        explanation: "Le symbole de l'Oxygène est O (numéro atomique 8).",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b10",
        text: "Quel scientifique a formulé la théorie de la relativité générale ?",
        answers: ["Isaac Newton", "Albert Einstein", "Galilée", "Marie Curie"],
        correctIndex: 1,
        difficulty: 2,
        timeLimit: 45,
        gain: 32000,
        explanation: "Albert Einstein a publié sa théorie de la relativité générale en 1915.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b11",
        text: "Quelle dynastie régnait en France lors de la construction du château de Versailles ?",
        answers: ["Les Mérovingiens", "Les Capétiens", "Les Bourbons", "Les Bonaparte"],
        correctIndex: 2,
        difficulty: 3,
        timeLimit: 50,
        gain: 64000,
        explanation: "Louis XIV et la dynastie des Bourbons ont fait construire ce palais.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b12",
        text: "Qui fut le premier homme à effectuer un vol dans l'espace en 1961 ?",
        answers: ["Neil Armstrong", "Yuri Gagarine", "Buzz Aldrin", "John Glenn"],
        correctIndex: 1,
        difficulty: 3,
        timeLimit: 50,
        gain: 125000,
        explanation: "Yuri Gagarine est le premier cosmonaute de l'histoire humaine.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b13",
        text: "Quel est le nom du boson découvert au CERN en 2012 ?",
        answers: ["Le quark top", "Le neutrino", "Le boson de Higgs", "Le graviton"],
        correctIndex: 2,
        difficulty: 3,
        timeLimit: 60,
        gain: 250000,
        explanation: "Le boson de Higgs confère leur masse aux autres particules élémentaires.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b14",
        text: "Dans quelle mer se jette le fleuve Jourdain ?",
        answers: ["La mer Noire", "La mer Rouge", "La mer Morte", "La mer Caspienne"],
        correctIndex: 2,
        difficulty: 3,
        timeLimit: 60,
        gain: 500000,
        explanation: "Le Jourdain se jette dans la mer Morte, réputée pour sa salinité record.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      },
      {
        id: "b15",
        text: "Quelle est la capitale de l'Australie ?",
        answers: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correctIndex: 2,
        difficulty: 3,
        timeLimit: 60,
        gain: 1000000,
        explanation: "Canberra a été fondée en 1913 comme un compromis géographique pour calmer la rivalité Sydney/Melbourne.",
        lifelinesAllowed: ["50_50", "phone_friend", "public_vote", "switch"]
      }
    ]
  }
};

/**
 * Charge un fichier JSON de questions depuis une URL.
 */
export async function loadPackFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur réseau HTTP : ${response.status}`);
    }
    const data = await response.json();
    const validation = validateQuestionPack(data);
    if (!validation.isValid) {
      console.warn("Erreurs détectées lors de la validation du pack chargé par URL :", validation.errors);
      return { data, validation };
    }
    return { data, validation };
  } catch (error) {
    console.warn(`Impossible de charger le pack à ${url} (${error.message}). Utilisation du pack de secours.`);
    return {
      data: BACKUP_PACK,
      validation: { isValid: true, errors: ["Utilisation des questions intégrées en mode secours local."] }
    };
  }
}

/**
 * Analyse et valide un fichier JSON importé textuellement.
 */
export function parseAndValidateCustomPack(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    const validation = validateQuestionPack(data);
    return { data, validation, error: null };
  } catch (err) {
    return {
      data: null,
      validation: { isValid: false, errors: [`Erreur de parsing JSON : ${err.message}`] },
      error: err.message
    };
  }
}

/**
 * Extrait les questions d'un pack et les organise par paliers de difficulté.
 * Assure qu'on dispose de questions alternatives pour le joker Switch.
 */
export function organizeQuestionsByDifficulty(gameData) {
  const questions = gameData.game.questions;
  const map = new Map();

  questions.forEach(q => {
    const diff = Number(q.difficulty);
    if (!map.has(diff)) {
      map.set(diff, []);
    }
    map.get(diff).push(q);
  });

  return map;
}
