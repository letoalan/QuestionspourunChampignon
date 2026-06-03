import os
import json
import sys

# Ce script va écrire un pack de 36 questions conformes à democratie.json sur le programme d'histoire de seconde.
sys.stdout.reconfigure(encoding='utf-8')

# Définissons nos questions avec leurs jokers
questions = [
  # --- PALIERS DE DIFFICULTÉ 1 (100 à 1000) ---
  # Q1 (100) / Q1_alt (100) : Athènes / Périclès
  {
    "id": "2de_hist_q1",
    "text": "Quel célèbre stratège athénien du Ve siècle av. J.-C. a marqué de son empreinte la démocratie de sa cité et a fait reconstruire le Parthénon ?",
    "answers": ["Périclès", "Clisthène", "Solon", "Thémistocle"],
    "correctIndex": 0,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 100,
    "explanation": "Périclès a été réélu stratège près de trente fois et a dirigé la démocratie athénienne à son apogée au Ve siècle av. J.-C., lançant de grands travaux sur l'Acropole comme le Parthénon.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Léa, historienne de l'art",
        "relation": "Cousine",
        "dialogue": "C'est Périclès sans hésiter ! Il est indissociable du siècle d'or athénien et du Parthénon."
      },
      "public_vote": {
        "votes": [85, 5, 5, 5]
      }
    }
  },
  {
    "id": "2de_hist_q1_alt",
    "text": "Quelle institution de la démocratie athénienne, réunie sur la colline de la Pnyx, votait les lois et la guerre ?",
    "answers": ["La Boulè", "L'Héliée", "L'Ecclésia", "L'Aréopage"],
    "correctIndex": 2,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 100,
    "explanation": "L'Ecclésia est l'assemblée des citoyens athéniens qui se rassemble sur la Pnyx pour délibérer et voter les lois, le budget et déclarer la guerre.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Professeur Jean",
        "relation": "Ancien prof d'histoire",
        "dialogue": "C'est l'Ecclésia, l'assemblée souveraine des citoyens."
      },
      "public_vote": {
        "votes": [10, 10, 75, 5]
      }
    }
  },
  
  # Q2 (200) / Q2_alt (200) : Rome Antique
  {
    "id": "2de_hist_q2",
    "text": "Qui est considéré comme le premier empereur romain sous le nom d'Auguste, fondant le Principat en 27 avant J.-C. ?",
    "answers": ["Jules César", "Octave", "Néron", "Marc Aurèle"],
    "correctIndex": 1,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 200,
    "explanation": "Octave, petit-neveu et fils adoptif de Jules César, reçoit le titre d'Auguste en 27 av. J.-C. et fonde un nouveau régime politique : le Principat (Empire).",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, latiniste",
        "relation": "Ami de fac",
        "dialogue": "Octave prend le titre d'Auguste en 27 avant notre ère. C'est lui !"
      },
      "public_vote": {
        "votes": [15, 70, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q2_alt",
    "text": "Quel empereur romain promulgue en 313 l'édit de Milan, accordant la liberté de culte aux chrétiens ?",
    "answers": ["Constantin", "Théodose", "Néron", "Trajan"],
    "correctIndex": 0,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 200,
    "explanation": "Constantin promulgue l'édit de Milan en 313, mettant fin aux persécutions contre les chrétiens, avant de fonder Constantinople en 330.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Thomas, théologien",
        "relation": "Collègue",
        "dialogue": "Constantin a signé l'édit de Milan en 313. C'est l'acte fondateur de la christianisation de l'Empire."
      },
      "public_vote": {
        "votes": [75, 15, 5, 5]
      }
    }
  },

  # Q3 (300) / Q3_alt (300) : Byzance & Islam
  {
    "id": "2de_hist_q3",
    "text": "Comment appelle-t-on l'empereur byzantin qui détient les pouvoirs politique, militaire et religieux ?",
    "answers": ["Le Calife", "Le Doge", "Le Basileus", "Le Tsar"],
    "correctIndex": 2,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 300,
    "explanation": "Dans l'Empire byzantin, l'empereur porte le titre de Basileus et dirige une théocratie impériale.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, médiéviste",
        "relation": "Amie d'enfance",
        "dialogue": "C'est Basileus. C'est le terme grec officiel pour l'empereur byzantin."
      },
      "public_vote": {
        "votes": [5, 10, 80, 5]
      }
    }
  },
  {
    "id": "2de_hist_q3_alt",
    "text": "Quel événement majeur de 1054 consacre la rupture théologique définitive entre l'Église catholique d'Occident et l'Église orthodoxe d'Orient ?",
    "answers": ["Le Grand Schisme", "Le Concile de Nicée", "La quatrième Croisade", "La Bulle d'Or"],
    "correctIndex": 0,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 300,
    "explanation": "Le Grand Schisme d'Orient en 1054 sépare définitivement la chrétienté latine (catholique) de l'orthodoxie grecque.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Professeur Jean",
        "relation": "Ancien prof d'histoire",
        "dialogue": "C'est le Grand Schisme d'Orient. Une séparation majeure dans l'histoire chrétienne."
      },
      "public_vote": {
        "votes": [80, 5, 10, 5]
      }
    }
  },

  # Q4 (500) / Q4_alt (500) : Venise et l'économie sucrière
  {
    "id": "2de_hist_q4",
    "text": "Quelle cité marchande d'Italie domine le commerce en Méditerranée médiévale grâce à sa flotte et au titre de son chef, le Doge ?",
    "answers": ["Gênes", "Florence", "Pise", "Venise"],
    "correctIndex": 3,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 500,
    "explanation": "Venise est une république maritime et aristocratique d'exception gouvernée par le Doge, dominant les routes de la soie et des épices.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Léa, historienne de l'art",
        "relation": "Cousine",
        "dialogue": "C'est Venise ! La Sérénissime avec sa lagune et son Doge."
      },
      "public_vote": {
        "votes": [10, 5, 5, 80]
      }
    }
  },
  {
    "id": "2de_hist_q4_alt",
    "text": "Dans quel archipel atlantique les Portugais ont-ils développé la culture de la canne à sucre avec de la main-d'œuvre esclave au XVe siècle ?",
    "answers": ["Les Açores", "Madère", "Les Canaries", "Les Bahamas"],
    "correctIndex": 1,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 500,
    "explanation": "L'île de Madère, colonisée par les Portugais au XVe siècle, devient le laboratoire de l'économie sucrière et de la traite négrière avant le Brésil.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, géographe",
        "relation": "Ami",
        "dialogue": "Les Portugais ont testé cela à Madère avec beaucoup de succès économique."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },

  # Q5 (1000) / Q5_alt (1000) : Croisades / Peste
  {
    "id": "2de_hist_q5",
    "text": "Quel moine cistercien français a prêché la deuxième croisade à Vézelay en 1146 et a rédigé la règle de l'ordre des Templiers ?",
    "answers": ["Bernard de Clairvaux", "Pierre l'Ermite", "L'abbé Suger", "Saint Dominique"],
    "correctIndex": 0,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 1000,
    "explanation": "Bernard de Clairvaux est une figure clé du XIIe siècle, réformateur de l'ordre cistercien, qui a rédigé la règle des moines-soldats (les Templiers) et prêché la seconde croisade.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, médiéviste",
        "relation": "Amie d'enfance",
        "dialogue": "C'est Bernard de Clairvaux, le grand prédicateur de la deuxième croisade !"
      },
      "public_vote": {
        "votes": [75, 10, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q5_alt",
    "text": "Quelle pandémie majeure, arrivée en Europe en 1347 par le port de Messine et propagée par les puces de rats, décime plus de la moitié de la population européenne ?",
    "answers": ["Le choléra", "La grippe espagnole", "La peste noire", "La variole"],
    "correctIndex": 2,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 1000,
    "explanation": "La peste noire, provoquée par le bacille Yersinia pestis, s'est propagée en 1347-1348 le long des routes maritimes génoises et vénitiennes.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Thomas, médecin",
        "relation": "Ami",
        "dialogue": "C'est la peste noire de 1348. Un désastre démographique sans précédent."
      },
      "public_vote": {
        "votes": [5, 5, 85, 5]
      }
    }
  },

  # --- PALIERS DE DIFFICULTÉ 2 (2000 à 32000) ---
  # Q6 (2000) / Q6_alt (2000) : Découverte & Valladolid
  {
    "id": "2de_hist_q6",
    "text": "En quelle année le navigateur génois Christophe Colomb, pour le compte des Rois Catholiques d'Espagne, a-t-il atteint l'Amérique ?",
    "answers": ["1453", "1492", "1498", "1515"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 2000,
    "explanation": "Le 12 octobre 1492, les navires de Christophe Colomb touchent l'île de San Salvador dans les Bahamas, marquant la découverte européenne de l'Amérique.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Professeur Jean",
        "relation": "Ancien prof d'histoire",
        "dialogue": "C'est 1492 ! Une des dates les plus connues au monde."
      },
      "public_vote": {
        "votes": [5, 90, 3, 2]
      }
    }
  },
  {
    "id": "2de_hist_q6_alt",
    "text": "Quel dominicain espagnol a défendu l'humanité des Amérindiens face au théologien Sepúlveda lors de la Controverse de Valladolid en 1550-1551 ?",
    "answers": ["Bartolomé de Las Casas", "Francisco Pizarro", "Hernán Cortés", "Ignace de Loyola"],
    "correctIndex": 0,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 2000,
    "explanation": "Bartolomé de Las Casas, auteur de la Très brève relation de la destruction des Indes, a plaidé pour le respect des droits des Indiens durant la controverse de Valladolid.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Thomas, théologien",
        "relation": "Collègue",
        "dialogue": "C'est Bartolomé de Las Casas, le défenseur acharné des indigènes."
      },
      "public_vote": {
        "votes": [75, 10, 10, 5]
      }
    }
  },

  # Q7 (4000) / Q7_alt (4000) : Humanisme et Érasme
  {
    "id": "2de_hist_q7",
    "text": "Quel penseur néerlandais, auteur de 'L'Éloge de la folie' et traducteur du Nouveau Testament, est surnommé le 'Prince des humanistes' ?",
    "answers": ["Thomas More", "Érasme de Rotterdam", "Guillaume Budé", "Montaigne"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 4000,
    "explanation": "Érasme de Rotterdam (1467-1536) a voyagé dans toute l'Europe, incarnant l'Humanisme chrétien et la 'République des Lettres'.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, littéraire",
        "relation": "Ami",
        "dialogue": "C'est Érasme, bien sûr. Il a écrit l'Éloge de la folie."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q7_alt",
    "text": "Dans quelle ville italienne s'est épanouie la Renaissance artistique sous le mécénat de la riche famille des Médicis ?",
    "answers": ["Venise", "Florence", "Rome", "Milan"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 4000,
    "explanation": "Florence est considérée comme le berceau de la Renaissance italienne au XVe siècle, largement soutenue par les Médicis (comme Laurent le Magnifique).",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Léa, historienne de l'art",
        "relation": "Cousine",
        "dialogue": "Florence est la capitale incontestée du mécénat et de la Renaissance avec les Médicis."
      },
      "public_vote": {
        "votes": [10, 80, 5, 5]
      }
    }
  },

  # Q8 (8000) / Q8_alt (8000) : Réforme protestante
  {
    "id": "2de_hist_q8",
    "text": "Quel moine augustin allemand a déclenché la Réforme protestante en publiant ses '95 thèses' contre le commerce des indulgences en 1517 ?",
    "answers": ["Jean Calvin", "Martin Luther", "Ulrich Zwingli", "Henri VIII"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 8000,
    "explanation": "Martin Luther placarde ses 95 thèses à Wittemberg en 1517 pour dénoncer la vente des indulgences par le Pape pour financer la basilique Saint-Pierre.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Thomas, théologien",
        "relation": "Collègue",
        "dialogue": "Martin Luther a ouvert la rupture de 1517. C'est l'acte fondateur du protestantisme."
      },
      "public_vote": {
        "votes": [5, 85, 5, 5]
      }
    }
  },
  {
    "id": "2de_hist_q8_alt",
    "text": "Quel pape commanditaire de la fresque de la chapelle Sixtine par Michel-Ange (1508) incarne le faste et la puissance de la papauté de la Renaissance ?",
    "answers": ["Alexandre VI Borgia", "Jules II", "Léon X", "Clément VII"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 8000,
    "explanation": "Jules II (Giuliano della Rovere) est le pape guerrier et grand mécène qui commanda la Sixtine à Michel-Ange et fit reconstruire la basilique Saint-Pierre.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Léa, historienne de l'art",
        "relation": "Cousine",
        "dialogue": "Jules II ! C'est lui qui a forcé Michel-Ange à peindre la voûte de la chapelle Sixtine."
      },
      "public_vote": {
        "votes": [10, 70, 10, 10]
      }
    }
  },

  # Q9 (16000) / Q9_alt (16000) : Affirmation de l'État en France
  {
    "id": "2de_hist_q9",
    "text": "Quelle ordonnance royale signée par François Ier en 1539 impose l'usage du français à la place du latin dans les actes juridiques et d'état civil ?",
    "answers": ["L'ordonnance de Blois", "L'ordonnance de Moulins", "L'ordonnance de Villers-Cotterêts", "L'ordonnance de Saint-Germain"],
    "correctIndex": 2,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 16000,
    "explanation": "L'ordonnance de Villers-Cotterêts de 1539 exige la rédaction des actes officiels et de justice en 'langage maternel françois'. Elle fonde aussi les registres paroissiaux (ancêtres de l'état civil).",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Professeur Jean",
        "relation": "Ancien prof d'histoire",
        "dialogue": "C'est Villers-Cotterêts en 1539. C'est l'acte fondateur du français administratif."
      },
      "public_vote": {
        "votes": [10, 10, 75, 5]
      }
    }
  },
  {
    "id": "2de_hist_q9_alt",
    "text": "Quel contrôleur général des finances de Louis XIV développe une politique économique axée sur le mercantilisme et le développement des manufactures ?",
    "answers": ["Mazarin", "Fouquet", "Colbert", "Louvois"],
    "correctIndex": 2,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 16000,
    "explanation": "Jean-Baptiste Colbert met en œuvre le 'colbertisme' (mercantilisme à la française) en créant les manufactures royales et les compagnies commerciales (Indes orientales).",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, médiéviste",
        "relation": "Amie",
        "dialogue": "Jean-Baptiste Colbert. Il a beaucoup travaillé avec Louis XIV pour enrichir l'État."
      },
      "public_vote": {
        "votes": [10, 10, 75, 5]
      }
    }
  },

  # Q10 (32000) / Q10_alt (32000) : Édit de Nantes / Versailles
  {
    "id": "2de_hist_q10",
    "text": "Quel roi de France promulgue l'Édit de Nantes en 1598 pour mettre fin aux guerres de religion entre catholiques et protestants ?",
    "answers": ["Charles IX", "Henri III", "Henri IV", "Louis XIII"],
    "correctIndex": 2,
    "difficulty": 2,
    "timeLimit": 45,
    "gain": 32000,
    "explanation": "Henri IV signe l'Édit de Nantes en 1598, accordant la liberté de conscience et des lieux de culte aux protestants pour restaurer la paix.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Professeur Jean",
        "relation": "Ancien prof d'histoire",
        "dialogue": "C'est Henri IV. L'édit de tolérance de 1598 est l'un des faits marquants de son règne."
      },
      "public_vote": {
        "votes": [5, 10, 80, 5]
      }
    }
  },
  {
    "id": "2de_hist_q10_alt",
    "text": "Quel roi de France décide la révocation de l'Édit de Nantes par l'Édit de Fontainebleau en 1685, provoquant l'exil de milliers de huguenots ?",
    "answers": ["Louis XIII", "Louis XIV", "Louis XV", "Louis XVI"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 45,
    "gain": 32000,
    "explanation": "Louis XIV révoque l'Édit de Nantes en 1685 avec l'Édit de Fontainebleau dans le but d'unifier religieusement son royaume sous la devise 'un roi, une loi, une foi'.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Thomas, historien",
        "relation": "Ami",
        "dialogue": "Louis XIV révoque l'édit en 1685. Une décision lourde de conséquences économiques et sociales."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },

  # --- PALIERS DE DIFFICULTÉ 3 (64000 à 1000000) ---
  # Q11 (64000) / Q11_alt (64000) : Modèle britannique / Habeas Corpus
  {
    "id": "2de_hist_q11",
    "text": "Quel texte de loi britannique voté en 1679 interdit l'emprisonnement arbitraire d'un citoyen sans jugement ?",
    "answers": ["La Grande Charte", "La Déclaration des Droits", "L'Habeas Corpus", "L'Acte de Tolérance"],
    "correctIndex": 2,
    "difficulty": 3,
    "timeLimit": 50,
    "gain": 64000,
    "explanation": "L'Habeas Corpus Act voté par le Parlement anglais sous Charles II en 1679 garantit qu'aucun sujet ne peut être emprisonné arbitrairement sans être présenté à un juge dans les trois jours.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Clara, étudiante en droit",
        "relation": "Amie",
        "dialogue": "L'Habeas Corpus de 1679 ! C'est le texte fondamental contre l'arbitraire royal."
      },
      "public_vote": {
        "votes": [10, 10, 70, 10]
      }
    }
  },
  {
    "id": "2de_hist_q11_alt",
    "text": "Quel texte imposé en 1689 au roi Guillaume III fixe les droits constitutionnels du Parlement et limite définitivement le pouvoir de la couronne anglaise ?",
    "answers": ["L'Habeas Corpus", "La Grande Charte", "Le Bill of Rights", "Le Traité de Douvres"],
    "correctIndex": 2,
    "difficulty": 3,
    "timeLimit": 50,
    "gain": 64000,
    "explanation": "La déclaration des Droits (Bill of Rights) de 1689 consacre la monarchie parlementaire en Angleterre en donnant des pouvoirs permanents au Parlement (voter l'impôt, se réunir librement).",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, politologue",
        "relation": "Ancien prof",
        "dialogue": "C'est le Bill of Rights en 1689. Il instaure la balance des pouvoirs en Angleterre."
      },
      "public_vote": {
        "votes": [15, 10, 70, 5]
      }
    }
  },

  # Q12 (125000) / Q12_alt (125000) : Sociologie de la cour / Versailles
  {
    "id": "2de_hist_q12",
    "text": "Quel sociologue allemand a théorisé le fonctionnement de la noblesse française sous Louis XIV dans son livre 'La Société de cour' ?",
    "answers": ["Max Weber", "Karl Marx", "Norbert Elias", "Émile Durkheim"],
    "correctIndex": 2,
    "difficulty": 3,
    "timeLimit": 50,
    "gain": 125000,
    "explanation": "Norbert Elias a analysé l'étiquette et la mise en scène du pouvoir à Versailles comme un instrument de domestication de la noblesse par le roi Louis XIV.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "David, philosophe",
        "relation": "Mentor",
        "dialogue": "C'est Norbert Elias. Son livre 'La Société de cour' est une référence incontournable de la sociologie historique."
      },
      "public_vote": {
        "votes": [10, 10, 75, 5]
      }
    }
  },
  {
    "id": "2de_hist_q12_alt",
    "text": "Quel mémorialiste et noble français a décrit avec précision et acrimonie la vie quotidienne, l'étiquette et les intrigues de la cour de Louis XIV à Versailles ?",
    "answers": ["Saint-Simon", "La Bruyère", "Bossuet", "La Rochefoucauld"],
    "correctIndex": 0,
    "difficulty": 3,
    "timeLimit": 50,
    "gain": 125000,
    "explanation": "Les Mémoires du duc de Saint-Simon constituent un témoignage inestimable, plein de verve littéraire et d'esprit critique, sur le système curial de Versailles.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, professeur",
        "relation": "Collègue",
        "dialogue": "Le duc de Saint-Simon a laissé des mémoires précieux sur la cour du Roi-Soleil."
      },
      "public_vote": {
        "votes": [70, 15, 10, 5]
      }
    }
  },

  # Q13 (250000) / Q13_alt (250000) : Économie-monde / Potosí
  {
    "id": "2de_hist_q13",
    "text": "Quelle cité minière des Andes (actuelle Bolivie) devient au XVIe siècle le centre mondial de l'extraction de l'argent espagnol ?",
    "answers": ["Tenochtitlan", "Potosí", "Cuzco", "Zacatecas"],
    "correctIndex": 1,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 250000,
    "explanation": "Potosí, située à plus de 4000 mètres d'altitude, abritait le 'Cerro Rico', d'où l'Espagne a tiré des milliers de tonnes d'argent au prix du travail forcé des indigènes (mita).",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, historienne",
        "relation": "Amie",
        "dialogue": "C'est Potosí, la mine d'argent mythique qui a financé la puissance espagnole en Europe."
      },
      "public_vote": {
        "votes": [15, 70, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q13_alt",
    "text": "Quel empereur aztèque régnait sur Tenochtitlan lors de l'arrivée du conquistador espagnol Hernán Cortés en 1519 ?",
    "answers": ["Atahualpa", "Moctezuma II", "Cuauhtémoc", "Pachacutec"],
    "correctIndex": 1,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 250000,
    "explanation": "Moctezuma II accueille Cortés à Tenochtitlan avant d'être fait prisonnier et de mourir en 1520 pendant les affrontements de la 'Noche Triste'.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Émilie, archéologue",
        "relation": "Amie",
        "dialogue": "Moctezuma II ! C'est lui qui gouvernait l'Empire aztèque à ce moment fatidique."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },

  # Q14 (500000) / Q14_alt (500000) : Influence du modèle britannique / Voltaire
  {
    "id": "2de_hist_q14",
    "text": "Dans quel ouvrage publié en 1734 Voltaire fait-il l'éloge du modèle politique et de la liberté religieuse de l'Angleterre ?",
    "answers": ["Candide", "Les Lettres philosophiques", "Le Traité sur la tolérance", "Le Dictionnaire philosophique"],
    "correctIndex": 1,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 500000,
    "explanation": "Dans les Lettres philosophiques (ou Lettres anglaises), Voltaire utilise l'éloge du régime parlementaire et de la tolérance anglaise pour critiquer indirectement la monarchie absolue française.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, littéraire",
        "relation": "Ami",
        "dialogue": "Il s'agit des Lettres philosophiques. Un ouvrage censuré en France à sa sortie."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q14_alt",
    "text": "Quelle guerre (1775-1783) a opposé les treize colonies d'Amérique du Nord à la Grande-Bretagne, donnant naissance au premier État constitutionnel moderne ?",
    "answers": ["La guerre de Sept Ans", "La guerre de Sécession", "La guerre d'Indépendance américaine", "La guerre de Cent Ans"],
    "correctIndex": 2,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 500000,
    "explanation": "La guerre d'Indépendance américaine, soutenue par la France de Louis XVI, aboutit au traité de Paris en 1783 et à la Constitution américaine de 1787.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Isabelle, historienne",
        "relation": "Amie",
        "dialogue": "La guerre d'Indépendance américaine. Elle a beaucoup influencé la Révolution française par la suite."
      },
      "public_vote": {
        "votes": [10, 10, 75, 5]
      }
    }
  },

  # Q15 (1000000) / Q15_alt (1000000) : Bulle d'Or et Choc Microbien
  {
    "id": "2de_hist_q15",
    "text": "Quel document impérial byzantin promulgué en 1082 accorde d'immenses privilèges commerciaux et d'exemptions douanières aux marchands de Venise ?",
    "answers": ["La Bulle d'Or", "La Bulle d'Alexandrie", "Le Traité de Nymphaion", "L'Édit de Caracalla"],
    "correctIndex": 0,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 1000000,
    "explanation": "La Bulle d'Or (Chrysobulle) d'Alexis Ier Comnène en 1082 exempte les Vénitiens de taxes douanières dans l'Empire byzantin en échange de leur aide maritime contre les Normands.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, médiéviste",
        "relation": "Amie d'enfance",
        "dialogue": "C'est la Bulle d'Or de 1082. Elle a permis à Venise de devenir la superpuissance commerciale de la Méditerranée."
      },
      "public_vote": {
        "votes": [65, 15, 10, 10]
      }
    }
  },
  {
    "id": "2de_hist_q15_alt",
    "text": "Quel concept historique désigne la disparition massive (jusqu'à 90%) des Amérindiens suite à l'introduction involontaire de maladies européennes comme la variole ?",
    "answers": ["La grande peste des Andes", "Le choc microbien", "Le fléau colombien", "L'hécatombe virale"],
    "correctIndex": 1,
    "difficulty": 3,
    "timeLimit": 60,
    "gain": 1000000,
    "explanation": "Le choc microbien désigne l'effondrement démographique des populations indigènes des Amériques, dépourvues de défenses immunitaires contre la variole, la rougeole ou la grippe importées par les Européens.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Thomas, médecin",
        "relation": "Ami",
        "dialogue": "On appelle cela le choc microbien. C'est le principal facteur de la dépopulation amérindienne."
      },
      "public_vote": {
        "votes": [10, 80, 5, 5]
      }
    }
  },

  # Questions supplémentaires 16, 17, 18 pour correspondre aux 36 questions de democratie.json
  {
    "id": "2de_hist_q16",
    "text": "Quel empereur romain fonde en 330 une 'Nouvelle Rome' chrétienne sur le site de l'ancienne cité de Byzance ?",
    "answers": ["Auguste", "Constantin", "Théodose", "Justinien"],
    "correctIndex": 1,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 100,
    "explanation": "L'empereur Constantin fonde Constantinople en 330, déplaçant le centre de gravité politique et culturel de l'Empire vers l'Orient.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Professeur Jean",
        "relation": "Ancien prof d'histoire",
        "dialogue": "C'est Constantin. Il a donné son propre nom à la nouvelle capitale."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q16_alt",
    "text": "Dans l'Empire byzantin, quel haut dignitaire ecclésiastique partage l'autorité spirituelle de l'Église orthodoxe avec le Basileus ?",
    "answers": ["Le Pape de Rome", "Le Patriarche de Constantinople", "Le Grand Mufti", "L'Archevêque de Nicée"],
    "correctIndex": 1,
    "difficulty": 1,
    "timeLimit": 30,
    "gain": 100,
    "explanation": "Le Patriarche de Constantinople est le chef de l'Église byzantine (orthodoxe) sous la tutelle impériale du Basileus.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Thomas, théologien",
        "relation": "Collègue",
        "dialogue": "C'est le Patriarche de Constantinople. Il jouait un rôle central à la cour."
      },
      "public_vote": {
        "votes": [5, 80, 10, 5]
      }
    }
  },

  {
    "id": "2de_hist_q17",
    "text": "En quelle année l'Empire romain d'Orient s'effondre-t-il avec la prise de Constantinople par les Ottomans de Mehmed II ?",
    "answers": ["1204", "1348", "1453", "1492"],
    "correctIndex": 2,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 2000,
    "explanation": "En 1453, Constantinople tombe aux mains du sultan ottoman Mehmed II, marquant la fin de l'Empire byzantin et la transition vers l'époque moderne.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Lucie, médiéviste",
        "relation": "Amie d'enfance",
        "dialogue": "C'est 1453. C'est une date clé qui marque le basculement géopolitique vers l'Atlantique."
      },
      "public_vote": {
        "votes": [10, 10, 75, 5]
      }
    }
  },
  {
    "id": "2de_hist_q17_alt",
    "text": "Comment se nomme le célèbre souverain aztèque capturé puis exécuté par le conquistador espagnol Francisco Pizarro en 1533 ?",
    "answers": ["Moctezuma II", "Atahualpa", "Pachacutec", "Tupac Amaru"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 2000,
    "explanation": "Atahualpa est le dernier empereur de l'Empire inca (et non aztèque), capturé par traîtrise par Pizarro à Cajamarca en 1532 et exécuté en 1533.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Émilie, archéologue",
        "relation": "Amie",
        "dialogue": "C'est Atahualpa. Pizarro l'a fait exécuter malgré le paiement d'une rançon colossale en or."
      },
      "public_vote": {
        "votes": [10, 70, 10, 10]
      }
    }
  },

  {
    "id": "2de_hist_q18",
    "text": "Quel traité signé en 1494 partage le 'Nouveau Monde' à découvrir entre l'Espagne et le Portugal sous l'égide du pape ?",
    "answers": ["Le traité de Saragosse", "Le traité de Tordesillas", "Le traité de Madrid", "Le traité de Utrecht"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 4000,
    "explanation": "Le traité de Tordesillas (1494) trace une ligne imaginaire de démarcation : les terres à l'ouest appartiennent à l'Espagne (Amérique), celles à l'est au Portugal (Afrique, Brésil).",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Marc, géographe",
        "relation": "Ami",
        "dialogue": "C'est le traité de Tordesillas. Il explique pourquoi on parle portugais au Brésil et espagnol ailleurs."
      },
      "public_vote": {
        "votes": [10, 75, 10, 5]
      }
    }
  },
  {
    "id": "2de_hist_q18_alt",
    "text": "Quelle institution judiciaire anglaise, réorganisée par la dynastie des Tudor, servait d'instrument politique arbitraire avant d'être abolie en 1641 ?",
    "answers": ["La Chambre des Communes", "La Chambre étoilée", "Le Banc du Roi", "Le Conseil privé"],
    "correctIndex": 1,
    "difficulty": 2,
    "timeLimit": 40,
    "gain": 4000,
    "explanation": "La Chambre étoilée (Star Chamber) était un tribunal d'exception royal très redouté pour sa procédure secrète et arbitraire sous Charles Ier.",
    "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
    "jokerData": {
      "phone_friend": {
        "friendName": "Clara, étudiante en droit",
        "relation": "Amie",
        "dialogue": "La Chambre Étoilée (Star Chamber) incarnait l'injustice royale anglaise avant sa suppression."
      },
      "public_vote": {
        "votes": [5, 80, 10, 5]
      }
    }
  }
]

pack = {
  "version": "1.4",
  "game": {
    "title": "Histoire 2de - Le Monde Moderne",
    "theme": "Grandes étapes de la formation du monde moderne (Seconde)",
    "currency": "points",
    "questions": questions
  }
}

# Écriture du fichier JSON
dest_path = r"c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\data\seconde-histoire.json"
with open(dest_path, "w", encoding="utf-8") as f:
    json.dump(pack, f, ensure_ascii=False, indent=2)

print(f"Pack généré avec succès dans : {dest_path}")
print(f"Nombre de questions : {len(questions)}")
