import { validateQuestionPack } from './schema-validator.js';
import { lifelines } from './lifelines.js';
import { GameEngine } from './game-engine.js';

// Une boîte à outils très simple d'assertions
class Assert {
  static equals(actual, expected, msg = "") {
    if (actual !== expected) {
      throw new Error(`${msg} | Attendu: ${expected}, Reçu: ${actual}`);
    }
  }

  static isTrue(condition, msg = "") {
    if (!condition) {
      throw new Error(`${msg} | Devrait être VRAI`);
    }
  }

  static isFalse(condition, msg = "") {
    if (condition) {
      throw new Error(`${msg} | Devrait être FAUX`);
    }
  }
}

export function runTests(reporterCallback) {
  const suites = [
    {
      name: "Validateur de Schéma JSON (schema-validator.js)",
      tests: [
        {
          name: "Devrait échouer si le JSON est vide ou nul",
          fn: () => {
            const res = validateQuestionPack(null);
            Assert.isFalse(res.isValid, "Un objet nul ne devrait pas être valide");
            Assert.isTrue(res.errors.length > 0);
          }
        },
        {
          name: "Devrait échouer si le champ version est absent",
          fn: () => {
            const invalidData = { game: { title: "Test", theme: "Culture", questions: [] } };
            const res = validateQuestionPack(invalidData);
            Assert.isFalse(res.isValid, "Absence de version");
            Assert.isTrue(res.errors.some(e => e.includes("version")));
          }
        },
        {
          name: "Devrait valider si le format est correct et renseigner les métadonnées",
          fn: () => {
            const validData = {
              version: "1.0",
              game: {
                title: "Quiz Test",
                theme: "Culture",
                questions: [
                  {
                    id: "t1",
                    text: "Question ?",
                    answers: ["A", "B", "C", "D"],
                    correctIndex: 1,
                    difficulty: 1,
                    gain: 100
                  }
                ]
              }
            };
            const res = validateQuestionPack(validData);
            Assert.isTrue(res.isValid, "Le JSON valide doit être accepté");
            Assert.equals(res.errors.length, 0, "Il ne devrait y avoir aucune erreur");
          }
        }
      ]
    },
    {
      name: "Jokers / Lifelines (lifelines.js)",
      tests: [
        {
          name: "Joker 50/50 : Devrait exclure précisément 2 mauvaises réponses et préserver la bonne",
          fn: () => {
            const mockState = {
              currentQuestion: {
                id: "q_test",
                text: "Capitale ?",
                answers: ["A", "B", "C", "D"],
                correctIndex: 2 // Bonne réponse est 'C' (index 2)
              }
            };

            const joker50 = lifelines.get('50_50');
            joker50.reset(); // S'assurer de la disponibilité
            
            const result = joker50.execute(mockState);
            Assert.equals(result.type, '50_50');
            Assert.equals(result.removedIndices.length, 2, "Doit renvoyer exactement 2 réponses à cacher");
            
            // La bonne réponse (index 2) ne doit JAMAIS être retirée !
            Assert.isFalse(result.removedIndices.includes(2), "La bonne réponse ne doit pas être cachée");
          }
        },
        {
          name: "Joker Public : Devrait générer exactement 100% de répartition totale",
          fn: () => {
            const mockState = {
              currentQuestion: { correctIndex: 1, difficulty: 1 }
            };
            
            const jokerPublic = lifelines.get('public_vote');
            jokerPublic.reset();
            
            const result = jokerPublic.execute(mockState);
            const sum = result.votes.reduce((acc, val) => acc + val, 0);
            
            Assert.equals(sum, 100, "Le total des pourcentages des votes doit être de 100%");
          }
        }
      ]
    },
    {
      name: "Moteur de Jeu & Paliers (game-engine.js)",
      tests: [
        {
          name: "Paliers de sécurité : Doit garantir 1 000€ après l'échec au niveau 7",
          fn: () => {
            const engine = new GameEngine();
            const mockGame = {
              version: "1.0",
              game: {
                title: "Test",
                theme: "Test",
                questions: Array.from({ length: 15 }, (_, i) => ({
                  id: `q${i}`,
                  text: `Q ${i}`,
                  answers: ["A", "B", "C", "D"],
                  correctIndex: 0,
                  difficulty: i < 5 ? 1 : (i < 10 ? 2 : 3),
                  gain: 100 * (i + 1)
                }))
              }
            };
            
            engine.loadGame(mockGame);
            engine.startNewGame();
            
            // Simuler la progression jusqu'au niveau 7 (index 6, gain 700€)
            // L'index 4 représente le niveau 5 (1000€ sur l'échelle par défaut)
            engine.currentLevelIndex = 6; 
            
            // Faire une erreur
            engine.selectAnswer(2); // Mauvaise réponse
            engine.validateAnswer(2);
            
            // Après l'erreur à l'index 6, le joueur doit retomber au palier 5 (index 4 = 1000€)
            Assert.equals(engine.accumulatedGain, 1000, "Doit retomber au palier de sécurité de 1000 €");
            Assert.equals(engine.state, 'GAME_OVER', "L'état de jeu doit passer à GAME_OVER");
          }
        },
        {
          name: "Paliers de sécurité : Doit garantir 32 000€ après l'échec au niveau 12",
          fn: () => {
            const engine = new GameEngine();
            const mockGame = {
              version: "1.0",
              game: {
                title: "Test",
                theme: "Test",
                questions: Array.from({ length: 15 }, (_, i) => ({
                  id: `q${i}`,
                  text: `Q ${i}`,
                  answers: ["A", "B", "C", "D"],
                  correctIndex: 0,
                  difficulty: i < 5 ? 1 : (i < 10 ? 2 : 3),
                  gain: 100 * (i + 1)
                }))
              }
            };
            
            engine.loadGame(mockGame);
            engine.startNewGame();
            
            // Simuler la progression jusqu'au niveau 12 (index 11)
            // L'index 9 représente le niveau 10 (32000€ sur l'échelle par défaut)
            engine.currentLevelIndex = 11;
            
            engine.selectAnswer(3); // Mauvaise réponse
            engine.validateAnswer(3);
            
            Assert.equals(engine.accumulatedGain, 32000, "Doit retomber au palier de sécurité de 32 000 €");
          }
        }
      ]
    }
  ];

  // Exécution de la suite
  suites.forEach(suite => {
    reporterCallback({ type: 'suite_start', name: suite.name });
    
    suite.tests.forEach(test => {
      try {
        test.fn();
        reporterCallback({ type: 'test_success', name: test.name });
      } catch (err) {
        reporterCallback({ type: 'test_failure', name: test.name, error: err.message });
      }
    });

    reporterCallback({ type: 'suite_end', name: suite.name });
  });
}
export default runTests;
