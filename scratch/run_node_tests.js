import { validateQuestionPack } from '../js/schema-validator.js';
import { runTests } from '../js/tests.js';
import fs from 'fs';

console.log("Démarrage du test automatique du nouveau pack JSON d'histoire...");

// Charger le fichier généré
const rawData = fs.readFileSync('data/seconde-histoire.json', 'utf8');
const packData = JSON.parse(rawData);

const result = validateQuestionPack(packData);
if (result.isValid) {
  console.log("✓ Le pack Histoire 2de est 100% VALIDE vis-à-vis du schéma !");
  if (result.errors.length > 0) {
    console.log("Avertissements non bloquants détectés :", result.errors);
  }
} else {
  console.error("❌ Erreur de validation du pack d'histoire !");
  console.error(result.errors);
  process.exit(1);
}

// Lancer le banc de tests unitaires pour vérifier que tout fonctionne toujours
let suitesCount = 0;
let successCount = 0;
let failCount = 0;

runTests((event) => {
  if (event.type === 'suite_start') {
    console.log(`\nSuite: ${event.name}`);
    suitesCount++;
  } else if (event.type === 'test_success') {
    console.log(`  [PASS] ${event.name}`);
    successCount++;
  } else if (event.type === 'test_failure') {
    console.error(`  [FAIL] ${event.name}`);
    console.error(`         Erreur : ${event.error}`);
    failCount++;
  }
});

console.log(`\nBilan : ${successCount} tests réussis, ${failCount} tests en échec.`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log("Tous les tests passent avec succès !");
}
