import os
import json
import sys

# Ce script va lire le pack existant seconde-histoire.json et lui ajouter 18 questions supplémentaires (9 principales + 9 alternatives)
sys.stdout.reconfigure(encoding='utf-8')

dest_path = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\data\seconde-histoire.json"

with open(dest_path, "r", encoding="utf-8") as f:
    pack = json.load(f)

# Questions supplémentaires (q19 à q27, principales et alternatives)
new_questions = [
  # Q19 (8000) / Q19_alt (8000) : Les ports français et le commerce atlantique / Colbertisme
  {
    "id": "2de_hist_q19",
    "text": "Quel port de la façade atlantique française connaît un essor fulgurant au XVIIe siècle grâce au commerce colonial et à la traite négrière ?",
    "answers": ["Marseille", "Bordeaux", "Nantes", "Le Havre"],
    "correctIndex": 2,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 8000,
    "explanation": "Nantes devient à l'époque moderne le premier port négrier de France, tirant sa richesse du commerce triangulaire avec les colonies des Antilles.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Isabelle, historienne",
        "relation": "Amie",
        "dialogue": "C'est Nantes ! La ville a fondé une grande partie de sa richesse moderne sur ce commerce colonial."
      },
      "public_vote": {
        "votes": [10, 15, 70, 5]
      }
    }
  },
  {
    "id": "2de_hist_q19_alt",
    "text": "Quelle compagnie de commerce maritime à monopole d'État Colbert fonde-t-il en 1664 pour concurrencer les Provinces-Unies ?",
    "answers": ["La Compagnie des Cent-Associés", "La Compagnie des Indes orientales", "La Compagnie du Mississippi", "La Compagnie de la Baie d'Hudson"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 8000,
    "explanation": "La Compagnie française des Indes orientales est créée par Colbert en 1664 pour mener le commerce dans l'océan Indien et concurrencer la redoutable VOC hollandaise.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, historienne",
        "relation": "Amie",
        "dialogue": "La Compagnie des Indes orientales, c'est l'outil économique phare du colbertisme."
      },
      "public_vote": {
        "votes": [15, 75, 5, 5]
      }
    }
  },

  # Q20 (16000) / Q20_alt (16000) : Guerre et affirmation monarchique (François Ier / Charles VII / Louis XIV)
  {
    "id": "2de_hist_q20",
    "text": "Quelle célèbre bataille de 1515, remportée par le jeune roi François Ier en Italie, consacre l'usage de l'artillerie moderne ?",
    "answers": ["La bataille de Pavie", "La bataille de Marignan", "La bataille de Cérisoles", "La bataille de Rocroi"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 16000,
    "explanation": "La victoire de Marignan les 13 et 14 septembre 1515 contre les piquiers suisses alliés du duché de Milan glorifie le début du règne de François Ier.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Professeur Jean",
        "relation": "Ancien prof d'histoire",
        "dialogue": "Marignan, 1515. C'est l'une des dates les plus mémorables de l'histoire de France !"
      },
      "public_vote": {
        "votes": [5, 90, 3, 2]
      }
    }
  },
  {
    "id": "2de_hist_q20_alt",
    "text": "Quel souverain français, surnommé le Victorieux, a créé la première armée permanente et professionnelle de France au XVe siècle ?",
    "answers": ["Philippe Auguste", "Charles VII", "Louis XI", "François Ier"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 16000,
    "explanation": "Par l'ordonnance de Cabannes en 1445, Charles VII crée les compagnies d'ordonnance, première armée de métier permanente payée par un impôt régulier (la taille).",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, médiéviste",
        "relation": "Amie d'enfance",
        "dialogue": "C'est Charles VII, à la fin de la guerre de Cent Ans. C'est capital pour l'affirmation de l'État."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },

  # Q21 (32000) / Q21_alt (32000) : Révolutions anglaises / Charles Ier
  {
    "id": "2de_hist_q21",
    "text": "Quel roi d'Angleterre a été jugé pour trahison et décapité à Londres en 1649 à la suite de la première guerre civile anglaise ?",
    "answers": ["Jacques Ier", "Charles Ier", "Jacques II", "Charles II"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 45,
    "gain": 32000,
    "explanation": "Charles Ier Stuart, partisan de l'absolutisme, s'est heurté au Parlement, ce qui a mené à la guerre civile, à sa condamnation à mort et à l'instauration de la République d'Oliver Cromwell.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, politologue",
        "relation": "Ancien prof",
        "dialogue": "C'est Charles Ier, décapité devant le palais de Whitehall. Un événement inouï pour l'époque."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q21_alt",
    "text": "Comment appelle-t-on la période de république dictatoriale dirigée par Oliver Cromwell en Angleterre entre 1649 et 1660 ?",
    "answers": ["La Restauration", "Le Protectorat (Commonwealth)", "La Glorieuse Révolution", "Le Régime d'exception"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 45,
    "gain": 32000,
    "explanation": "Oliver Cromwell dirige le Commonwealth d'Angleterre en tant que 'Lord Protecteur' de 1653 à sa mort en 1658, imposant une dictature puritaine.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Thomas, historien",
        "relation": "Ami",
        "dialogue": "Il s'agit du Commonwealth et du Protectorat de Cromwell."
      },
      "public_vote": {
        "votes": [15, 70, 10, 5]
      }
    }
  },

  # Q22 (64000) / Q22_alt (64000) : Colonisation espagnole et choc démographique
  {
    "id": "2de_hist_q22",
    "text": "Quel système colonial de travail forcé imposé par l'Espagne confiait des groupes d'Amérindiens à des colons pour les catéchiser en échange de leur travail ?",
    "answers": ["La mita", "L'encomienda", "Le salariat royal", "L'asiento"],
    "correctIndex": 1,
    "difficulty": 3,
    "timeLimit": 50,
    "gain": 64000,
    "explanation": "L'encomienda octroyait à un espagnol (encomendero) des terres et la soumission de populations locales en échange de leur conversion au christianisme. C'est devenu une forme d'esclavage déguisé.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Émilie, archéologue",
        "relation": "Amie",
        "dialogue": "C'est l'encomienda. Bartolomé de Las Casas l'a vigoureusement combattue."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q22_alt",
    "text": "Quel conquistador espagnol a mené la conquête de l'Empire inca au Pérou à partir de 1531 ?",
    "answers": ["Hernán Cortés", "Francisco Pizarro", "Pedro de Valdivia", "Vasco de Gama"],
    "correctIndex": 1,
    "difficulty": 3,
    "timeLimit": 50,
    "gain": 64000,
    "explanation": "Francisco Pizarro, avec une poignée d'hommes, profite des divisions internes de l'Empire inca pour capturer l'empereur Atahualpa et s'emparer de Cuzco.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Émilie, archéologue",
        "relation": "Amie",
        "dialogue": "Pizarro a conquis l'Empire inca, tandis que Cortés s'est occupé de l'Empire aztèque."
      },
      "public_vote": {
        "votes": [10, 80, 5, 5]
      }
    }
  },

  # Q23 (125000) / Q23_alt (125000) : Byzance et la dynastie des Comnène / Venise
  {
    "id": "2de_hist_q23",
    "text": "Quel empereur byzantin a signé la Bulle d'Or de 1082 avec Venise pour obtenir leur aide militaire contre les Normands ?",
    "answers": ["Alexis Ier Comnène", "Justinien Ier", "Constantin XI", "Basile II"],
    "correctIndex": 0,
    "difficulty": 3,
    "timeLimit": 50,
    "gain": 125000,
    "explanation": "Alexis Ier Comnène a signé ce traité pour s'assurer du secours de la flotte vénitienne contre Robert Guiscard et ses chevaliers normands.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, médiéviste",
        "relation": "Amie d'enfance",
        "dialogue": "C'est Alexis Ier Comnène, le fondateur de la dynastie des Comnènes au XIe siècle."
      },
      "public_vote": {
        "votes": [75, 10, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q23_alt",
    "text": "Quel est le nom du navire officiel d'apparat du Doge de Venise utilisé pour la cérémonie annuelle du Mariage de la cité avec la mer ?",
    "answers": ["Le Bucentaure", "La Santa Maria", "La Réale", "Le Trirème"],
    "correctIndex": 0,
    "difficulty": 3,
    "timeLimit": 50,
    "gain": 125000,
    "explanation": "Le Bucentaure est la galère d'apparat dorée à bord de laquelle le Doge jetait un anneau d'or dans la mer Adriatique pour symboliser la domination maritime de Venise.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, médiéviste",
        "relation": "Amie d'enfance",
        "dialogue": "C'est le Bucentaure. Un bateau d'une richesse incroyable, brûlé par les troupes de Napoléon."
      },
      "public_vote": {
        "votes": [70, 10, 10, 10]
      }
    }
  },

  # Q24 (250000) / Q24_alt (250000) : Voyages d'exploration / Tour du monde
  {
    "id": "2de_hist_q24",
    "text": "Quel navigateur portugais a commandé le premier voyage d'exploration maritime européen à atteindre l'Inde par le cap de Bonne-Espérance en 1498 ?",
    "answers": ["Vasco de Gama", "Fernand de Magellan", "Bartolomeu Dias", "Christophe Colomb"],
    "correctIndex": 0,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 250000,
    "explanation": "Vasco de Gama contourne l'Afrique et accoste à Calicut en 1548, ouvrant pour le Portugal la route des Indes et le lucratif monopole des épices.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, géographe",
        "relation": "Ami",
        "dialogue": "C'est Vasco de Gama. Bartolomeu Dias avait découvert le cap de Bonne-Espérance, mais c'est Vasco de Gama qui est allé jusqu'en Inde."
      },
      "public_vote": {
        "votes": [75, 10, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q24_alt",
    "text": "Qui a commandé l'expédition espagnole qui a réalisé la première circumnavigation (tour du monde) de l'histoire entre 1519 et 1522 ?",
    "answers": ["Vasco de Gama", "Fernand de Magellan", "Jacques Cartier", "Francisco Pizarro"],
    "correctIndex": 1,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 250000,
    "explanation": "Bien que Magellan ait été tué aux Philippines en 1521, son expédition, ramenée par Juan Sebastián Elcano à bord de la Victoria, boucle le premier tour du monde.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, géographe",
        "relation": "Ami de fac",
        "dialogue": "C'est Fernand de Magellan. L'expédition a prouvé empiriquement la rotondité de la Terre."
      },
      "public_vote": {
        "votes": [5, 85, 5, 5]
      }
    }
  },

  # Q25 (500000) / Q25_alt (500000) : Modèle britannique / Philosophie politique et influence des Lumières
  {
    "id": "2de_hist_q25",
    "text": "Quel philosophe anglais a théorisé le contrat social et la limitation du pouvoir royal dans ses 'Deux traités du gouvernement civil' (1690) ?",
    "answers": ["Thomas Hobbes", "John Locke", "David Hume", "Francis Bacon"],
    "correctIndex": 1,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 500000,
    "explanation": "John Locke justifie la Glorieuse Révolution de 1688 en affirmant que l'État doit garantir les droits naturels (vie, liberté, propriété) et que les citoyens ont un droit de résistance à l'oppression.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "David, philosophe",
        "relation": "Mentor",
        "dialogue": "C'est John Locke, le père fondateur du libéralisme politique moderne."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q25_alt",
    "text": "Quel souverain d'Angleterre de la maison Stuart a été chassé du trône lors de la Glorieuse Révolution de 1688 en raison de son catholicisme et de ses dérives autoritaires ?",
    "answers": ["Jacques Ier", "Charles II", "Jacques II", "Guillaume III"],
    "correctIndex": 2,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 500000,
    "explanation": "Jacques II est renversé pacifiquement en 1688 au profit de sa fille protestante Marie et de son gendre hollandais Guillaume d'Orange, qui acceptent le Bill of Rights.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, politologue",
        "relation": "Ancien prof",
        "dialogue": "C'est Jacques II (James II). Son départ marque la fin des tentatives absolutistes en Angleterre."
      },
      "public_vote": {
        "votes": [10, 10, 75, 5]
      }
    }
  },

  # Q26 (1000000) / Q26_alt (1000000) : Byzance et l'Hégire / Empire ottoman
  {
    "id": "2de_hist_q26",
    "text": "Quelle année chrétienne correspond à l'Hégire (départ de Mahomet de la Mecque pour Médine), an I du calendrier musulman ?",
    "answers": ["313", "476", "622", "800"],
    "correctIndex": 2,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 1000000,
    "explanation": "L'Hégire se déroule en 622 de l'ère chrétienne. C'est le point de départ de l'Islam et de la construction d'un empire arabo-musulman aux dépens de l'Empire byzantin.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Thomas, théologien",
        "relation": "Collègue",
        "dialogue": "C'est 622. Une date indispensable à connaître pour situer la naissance de l'Islam."
      },
      "public_vote": {
        "votes": [5, 10, 80, 5]
      }
    }
  },
  {
    "id": "2de_hist_q26_alt",
    "text": "Quel souverain ottoman, dit le Conquérant, a dirigé le siège de Constantinople et y a mis fin en mai 1453 ?",
    "answers": ["Mehmed II", "Soliman le Magnifique", "Osman Ier", "Selim Ier"],
    "correctIndex": 0,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 1000000,
    "explanation": "Mehmed II s'empare de Constantinople à l'âge de 21 ans, mettant fin à l'Empire romain d'Orient et faisant de la ville la capitale de l'Empire ottoman sous le nom d'Istanbul.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, médiéviste",
        "relation": "Amie d'enfance",
        "dialogue": "Mehmed II. Il est surnommé Fatih (le Conquérant) en raison de cette victoire décisive."
      },
      "public_vote": {
        "votes": [75, 10, 10, 5]
      }
    }
  },

  # Q27 (100) / Q27_alt (100) : Humanisme et l'Imprimerie
  {
    "id": "2de_hist_q27",
    "text": "Quel inventeur allemand a mis au point les caractères mobiles métalliques d'imprimerie vers 1450 à Mayence ?",
    "answers": ["Nicolas Copernic", "Johannes Gutenberg", "Galilée", "Albert Dürer"],
    "correctIndex": 1,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 100,
    "explanation": "L'invention de la typographie par Gutenberg vers 1450 permet la diffusion massive de la Bible et des idées des humanistes et réformateurs en Europe.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Professeur Jean",
        "relation": "Ancien prof d'histoire",
        "dialogue": "C'est Gutenberg ! Sa presse à imprimer a complètement révolutionné le savoir."
      },
      "public_vote": {
        "votes": [5, 90, 3, 2]
      }
    }
  },
  {
    "id": "2de_hist_q27_alt",
    "text": "Quel astronome polonais a formulé la théorie révolutionnaire de l'héliocentrisme dans son ouvrage publié en 1543 ?",
    "answers": ["Galilée", "Johannes Kepler", "Nicolas Copernic", "Isaac Newton"],
    "correctIndex": 2,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 100,
    "explanation": "Nicolas Copernic a démontré que la Terre et les autres planètes tournent autour du Soleil (héliocentrisme), remettant en cause le géocentrisme antique hérité de Ptolémée.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, géographe",
        "relation": "Ami",
        "dialogue": "C'est Copernic. Sa théorie a ouvert la révolution scientifique moderne."
      },
      "public_vote": {
        "votes": [10, 10, 75, 5]
      }
    }
  }
]

# Fusionner les questions existantes avec les nouvelles
pack["game"]["questions"].extend(new_questions)

# Sauvegarder dans seconde-histoire.json
with open(dest_path, "w", encoding="utf-8") as f:
    json.dump(pack, f, ensure_ascii=False, indent=2)

print(f"18 nouvelles questions ajoutées avec succès dans : {dest_path}")
print(f"Nouveau total de questions dans le pack : {len(pack['game']['questions'])}")
