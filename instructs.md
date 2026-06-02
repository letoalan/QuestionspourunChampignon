# instructs.md

Tu es opencode, chargé de générer une application de quiz interactive inspirée du format “Qui veut gagner des millions ?”.

Objectif :
Créer une interface de jeu télévisé immersive, élégante, modulaire et extensible, permettant de charger plusieurs jeux de questions au format JSON, avec une mécanique fidèle à l’esprit du jeu : questions progressives, 4 réponses, compteur de temps, jokers, validation de réponse, progression des gains, et ambiance dramatique.

Contraintes générales :
- Concevoir une architecture modulaire.
- Séparer clairement les responsabilités : données, logique de jeu, affichage, audio, animations, jokers, gestion du temps.
- Le moteur doit pouvoir charger des packs de questions externes en JSON sans modifier le code UI.
- Prévoir une structure permettant d’ajouter facilement de nouveaux types de quiz.
- L’interface doit être responsive et utilisable sur desktop et tablette.
- Prévoir un mode plein écran et une présentation “plateau TV”.

Direction visuelle :
- Respecter les codes visuels d’un grand jeu télévisé de culture générale :
  - fond sombre, profond, premium.
  - effets lumineux bleu/violet/or.
  - hiérarchie visuelle très lisible.
  - gros contraste pour les réponses.
  - sensation de tension, prestige et montée dramatique.
- Les éléments doivent évoquer un décor de plateau, avec mise en scène centrale de la question et des réponses.
- Prévoir des états visuels distincts : normal, survol, sélection, bonne réponse, mauvaise réponse, joker utilisé, temps critique, fin de partie.
- La présentation doit rester générique et ne pas reproduire à l’identique un habillage propriétaire.

Ambiance et rythme :
- L’application utilise un orchestrateur audio centralisé (`audio-orchestrator.js`) qui traduit des événements sémantiques en lecture audio. Le moteur de jeu et l'UI n'appellent jamais directement de fichiers audio, mais émettent des événements.
- Les événements audio déclenchés sont :
  - `game:start`: Démarrage du jeu.
  - `game:loaded`: Un pack de questions a été chargé.
  - `game:restart`: Le jeu est redémarré.
  - `question:show`: Une nouvelle question est affichée (avec le niveau de difficulté en contexte).
  - `question:switched`: La question a été changée (par exemple, via un joker).
  - `question:timer_warning`: Le temps commence à devenir critique.
  - `question:timer_critical`: Le temps est très critique.
  - `timer:start_ticking`: Le son de "ticking" du timer démarre.
  - `timer:stop_ticking`: Le son de "ticking" du timer s'arrête.
  - `answer:selected`: Une réponse a été sélectionnée par le joueur.
  - `answer:correct`: La réponse donnée est correcte.
  - `answer:incorrect`: La réponse donnée est incorrecte.
  - `question:timeout`: Le temps imparti pour la question est écoulé.
  - `lifeline:use_50_50`: Le joker 50/50 est utilisé.
  - `lifeline:use_switch`: Le joker "switch" est utilisé.
  - `game:win` / `game:victory`: Le joueur gagne la partie.
  - `game:lose` / `game:walk_away`: Le joueur perd ou abandonne la partie.
- Je fournirai moi-même les morceaux musicaux ; le code doit seulement prévoir les points d’intégration et les événements déclencheurs.

Structure fonctionnelle :
1. Écran d’accueil.
2. Chargement d’un pack JSON.
3. Sélection du jeu ou du thème.
4. Démarrage d’une partie.
5. Affichage d’une question.
6. Affichage des 4 réponses.
7. Gestion d’un timer.
8. Gestion des jokers.
9. Validation de la réponse.
10. Passage à la question suivante.
11. Écran de victoire ou d’échec.

Moteur de questions :
- Le système doit prendre en charge un JSON décrivant :
  - le titre du jeu,
  - le thème,
  - la liste des questions,
  - pour chaque question : intitulé, 4 réponses, index de la bonne réponse, difficulté, temps limite éventuel, explication, joker autorisés, gain associé.
- Prévoir un schéma simple, versionné, extensible.
- Le moteur doit vérifier la validité du JSON avant lancement.
- Il doit être possible d’avoir plusieurs jeux injectés dynamiquement.

Exemple de structure JSON attendue :
```json
{
  "version": "1.0",
  "game": {
    "title": "Quiz Millionnaire",
    "theme": "Culture générale",
    "currency": "points",
    "questions": [
      {
        "id": "q1",
        "text": "Quelle est la capitale de l'Australie ?",
        "answers": [
          "Sydney",
          "Melbourne",
          "Canberra",
          "Perth"
        ],
        "correctIndex": 2,
        "difficulty": 1,
        "timeLimit": 30,
        "gain": 100,
        "explanation": "La capitale de l'Australie est Canberra.",
        "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"]
      }
    ]
  }
}
```

Interface de jeu :
- Zone centrale pour la question.
- Zone de réponses avec 4 boutons massifs, stylés, parfaitement lisibles.
- Zone supérieure pour le statut, le score, la progression et le timer.
- Zone latérale ou inférieure pour les jokers.
- Zone de feedback pour messages, explications et transitions.
- Animation discrète mais spectaculaire au changement de question.

Timer :
- Afficher un compte à rebours visible en permanence pendant une question.
- Le timer doit pouvoir être configuré par question.
- À l’approche de la fin du temps, déclencher des alertes visuelles et audio via des événements sémantiques (`timer:start_ticking`, `timer:stop_ticking`).
- Le timer doit être suspendable si un joker l’exige, sinon continuer normalement.
- En cas de dépassement, la réponse est considérée comme fausse ou la question est annulée selon la configuration.

Jokers :
Implémenter les jokers suivants :
- 50/50 : supprime deux réponses fausses.
- Appel à un ami : ouvre une modale simulant une aide externe avec temporisation.
- Avis du public : affiche une répartition de votes simulée ou fournie par données.
- Switch : remplace la question courante par une autre question de même difficulté.
Prévoir une architecture de jokers sous forme de plugins, afin d’ajouter d’autres aides plus tard.
Chaque joker doit avoir :
- un identifiant,
- un nom,
- une icône,
- une disponibilité limitée,
- une logique d’activation,
- un effet sur l’état du jeu.

Modularité technique :
Découper l’application en modules, par exemple :
- game-engine
- question-loader
- json-schema-validator
- ui-stage
- ui-answers
- ui-timer
- lifelines
- audio-orchestrator
- state-store
- animation-controller
- result-screen

Règles de conception :
- Utiliser une architecture orientée événements ou state machine.
- Le code doit être clair, maintenable et testable.
- Isoler la logique métier de l’UI.
- Prévoir des tests unitaires pour la validation du JSON, la sélection des réponses, les jokers et le timer.
- Éviter les dépendances superflues.
- Prévoir une configuration facile pour changer les couleurs, les sons, les durées et les paliers.

Livrables attendus :
- Un squelette d’application fonctionnel.
- Une architecture claire.
- Un moteur de jeu basé sur JSON.
- Une interface élégante et immersive.
- Un système de jokers complet.
- Un timer fiable.
- Des points d’intégration audio.

Important :
- Ne pas copier à l’identique une interface existante.
- S’inspirer uniquement des codes du jeu télévisé.
- Privilégier la robustesse, l’extensibilité et la clarté du code.
- Générer un rendu soigné, professionnel, dramatique et lisible.
