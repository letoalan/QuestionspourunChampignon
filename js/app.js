import { GameEngine } from './game-engine.js';
import { UIManager } from './ui.js';
import { loadPackFromUrl } from './question-loader.js';
import audioOrchestrator from './audio-orchestrator.js';

/**
 * Script de bootstrapper principal de l'application.
 * Coordonne le démarrage des services et le chargement initial du pack de questions.
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log("Démarrage de l'application Le Grand Quiz...");

  const preLandingScreen = document.getElementById('pre-landing-screen');
  const appContainer = document.getElementById('app');
  const enterGameBtn = document.getElementById('enter-game-btn');

  // Initially hide the app content and show pre-landing
  if (appContainer) appContainer.classList.add('hidden');
  if (preLandingScreen) preLandingScreen.classList.add('active');

  enterGameBtn.addEventListener('click', async () => {
    // Hide pre-landing and show main app
    if (preLandingScreen) preLandingScreen.classList.remove('active');
    if (appContainer) appContainer.classList.remove('hidden');

    // Resume AudioContext and trigger game:start on user gesture
    audioOrchestrator.resume();
    audioOrchestrator.on('game:start');

    try {
      // 1. Charger la configuration audio centralisée (mapping événements → pistes MP3)
      await audioOrchestrator.loadConfig('./data/audio-config.json');

      // 2. Instancier la logique métier du jeu
      const gameEngine = new GameEngine();

      // 3. Instancier l'interface utilisateur en la reliant au moteur
      const uiManager = new UIManager(gameEngine);

      // 4. Charger le pack de questions de culture générale par défaut
      // Utilise le dossier local. En cas d'erreur CORS (chargement file:// local),
      // la fonction loadPackFromUrl bascule de façon transparente sur le pack embarqué BACKUP_PACK !
      const defaultPackPath = './data/culture-generale.json';
      const { data, validation } = await loadPackFromUrl(defaultPackPath);

      // 5. Injecter les données dans le moteur de jeu
      gameEngine.loadGame(data);

      // 6. Afficher les métadonnées et rapports de chargement initiaux
      console.log(`Pack chargé : "${data.game.title}" (Version: ${data.version})`);
      if (validation.errors && validation.errors.length > 0) {
        console.warn("Certains avertissements ont été levés lors du chargement :", validation.errors);
        uiManager.renderValidationReport({ data, validation });
      }

      // The game:start event is now triggered by the enterGameBtn click, no need for generic document click
      // document.addEventListener('click', () => {
      //   audioOrchestrator.on('game:start');
      // }, { once: true });

    } catch (error) {
      console.error("Une erreur fatale est survenue lors de l'initialisation de l'application :", error);
      
      // Afficher une alerte visuelle de repli pour l'utilisateur
      const appBox = document.getElementById('app');
      if (appBox) {
        appBox.innerHTML = `
          <div style="background: rgba(231,76,60,0.15); border: 2px dashed #e74c3c; border-radius: 12px; padding: 2rem; margin: 3rem auto; max-width: 600px; text-align: center; font-family: sans-serif; color: #f3f4f6;">
            <h2 style="color: #e74c3c; margin-bottom: 1rem;">Erreur d'initialisation</h2>
            <p style="margin-bottom: 1.5rem; line-height: 1.6;">L'application n'a pas pu démarrer correctement. Veuillez vérifier vos fichiers ou lancer un serveur HTTP local.</p>
            <code style="display: block; background: #000; padding: 1rem; border-radius: 6px; font-size: 0.85rem; text-align: left; overflow-x: auto; color: #f87171;">${error.stack || error.message}</code>
          </div>
        `;
      }
    }
  }, { once: true }); // Ensure the click listener only fires once
});
