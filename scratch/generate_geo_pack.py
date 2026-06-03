import json

# Define the template for questions
template = {
  "version": "1.4",
  "game": {
    "title": "Géographie 2de - Environnement, développement, mobilité",
    "theme": "Les défis d'un monde en transition (Seconde)",
    "currency": "points",
    "questions": []
  }
}

# The facts for the 36 pairs (72 questions total)
facts = [
    # Thème 1: Sociétés et environnements : des équilibres fragiles (Q1-Q9)
    ("Quel terme désigne l'ensemble des éléments naturels et artificiels qui entourent une société humaine ?", ["L'environnement", "Le biotope", "L'écosystème", "La biosphère"], 0, "L'environnement englobe à la fois les éléments naturels (relief, climat) et ceux issus de l'action humaine.", "environnement"),
    ("Quel est le principal gaz à effet de serre responsable du changement climatique actuel ?", ["Le dioxyde de carbone (CO2)", "Le méthane (CH4)", "Le protoxyde d'azote (N2O)", "L'ozone (O3)"], 0, "Le CO2, issu principalement de la combustion des énergies fossiles, est le principal responsable de l'effet de serre additionnel.", "CO2"),
    ("Comment appelle-t-on la capacité d'une société à se remettre d'une catastrophe naturelle ?", ["La résilience", "La vulnérabilité", "L'atténuation", "L'adaptation"], 0, "La résilience est la capacité d'un système, d'une communauté ou d'une société exposée aux aléas à résister, à absorber et à se corriger.", "résilience"),
    ("Quelle conférence de l'ONU en 2015 a abouti à un accord historique sur le climat ?", ["La COP21 à Paris", "Le Sommet de la Terre à Rio", "Le Protocole de Kyoto", "La COP26 à Glasgow"], 0, "L'Accord de Paris, adopté lors de la COP21 en 2015, vise à limiter le réchauffement climatique bien en deçà de 2°C.", "COP21"),
    ("Quel type de risque est lié à des phénomènes météorologiques extrêmes comme les cyclones ?", ["Un risque climatique", "Un risque sismique", "Un risque technologique", "Un risque volcanique"], 0, "Les cyclones, ouragans et typhons sont des aléas climatiques qui génèrent des risques importants pour les sociétés exposées.", "risque climatique"),
    ("Quel pays est actuellement le premier émetteur mondial de gaz à effet de serre ?", ["La Chine", "Les États-Unis", "L'Inde", "La Russie"], 0, "La Chine est le premier émetteur mondial de CO2, principalement en raison de son secteur industriel et de sa dépendance au charbon.", "Chine GES"),
    ("Comment appelle-t-on le processus de dégradation des terres dans les zones arides, semi-arides et subhumides sèches ?", ["La désertification", "La déforestation", "L'érosion", "La salinisation"], 0, "La désertification est souvent causée par les variations climatiques et les activités humaines (surpâturage, déboisement).", "désertification"),
    ("Quelle ressource naturelle renouvelable est particulièrement menacée par la surexploitation et le réchauffement climatique ?", ["L'eau douce", "Le pétrole", "Le charbon", "L'uranium"], 0, "L'eau douce est essentielle et sa disponibilité est menacée par la surconsommation, la pollution et les sécheresses.", "eau douce"),
    ("Quel terme désigne la transition vers un modèle économique respectueux de l'environnement ?", ["Le développement durable", "La croissance exponentielle", "Le libéralisme vert", "L'économie planifiée"], 0, "Le développement durable répond aux besoins du présent sans compromettre la capacité des générations futures à répondre aux leurs.", "développement durable"),
    
    # Thème 2: Territoires, populations et développement (Q10-Q18)
    ("Quel indicateur est couramment utilisé pour mesurer le niveau de développement humain d'un pays ?", ["L'IDH (Indice de Développement Humain)", "Le PIB (Produit Intérieur Brut)", "Le PNB (Produit National Brut)", "L'IPM (Indice de Pauvreté Multidimensionnelle)"], 0, "L'IDH combine l'espérance de vie, le niveau d'éducation et le revenu national brut par habitant.", "IDH"),
    ("Quel continent connaît actuellement la plus forte croissance démographique ?", ["L'Afrique", "L'Asie", "L'Amérique du Sud", "L'Europe"], 0, "L'Afrique a la croissance démographique la plus rapide au monde et sa population devrait doubler d'ici 2050.", "croissance Afrique"),
    ("Comment appelle-t-on le passage d'une population caractérisée par une mortalité et une natalité élevées à une mortalité et une natalité faibles ?", ["La transition démographique", "L'explosion démographique", "Le vieillissement de la population", "L'exode rural"], 0, "La transition démographique s'accompagne souvent d'une forte augmentation de la population pendant la phase intermédiaire.", "transition démographique"),
    ("Quel pays a mis en place la politique de l'enfant unique entre 1979 et 2015 ?", ["La Chine", "L'Inde", "Le Japon", "La Corée du Sud"], 0, "La Chine a imposé cette politique stricte pour freiner sa croissance démographique, avec des conséquences à long terme sur le vieillissement.", "enfant unique"),
    ("Comment désigne-t-on les inégalités de développement à l'intérieur d'un même pays ou d'une même ville ?", ["La fragmentation socio-spatiale", "La mondialisation", "La métropolisation", "L'étalement urbain"], 0, "La fragmentation socio-spatiale se traduit par la séparation spatiale de groupes sociaux de niveaux de vie très différents (ex: bidonvilles vs quartiers sécurisés).", "fragmentation"),
    ("Quel indicateur économique mesure la richesse totale créée sur un territoire national en un an ?", ["Le PIB (Produit Intérieur Brut)", "L'IDH", "L'inflation", "La balance commerciale"], 0, "Le PIB est l'indicateur principal pour mesurer la taille de l'économie d'un pays.", "PIB"),
    ("Comment s'appelle le phénomène de concentration de la population et des activités dans les grandes villes ?", ["La métropolisation", "La périurbanisation", "L'exode rural", "La gentrification"], 0, "La métropolisation renforce le poids des métropoles dans l'économie et la démographie mondiale.", "métropolisation"),
    ("Quel objectif mondial adopté par l'ONU vise à éradiquer l'extrême pauvreté d'ici 2030 ?", ["Les Objectifs de Développement Durable (ODD)", "Les Objectifs du Millénaire", "L'Agenda 21", "L'Accord de Paris"], 0, "Les 17 ODD adoptés en 2015 constituent un appel universel à l'action pour éliminer la pauvreté et protéger la planète.", "ODD"),
    ("Comment appelle-t-on la part de la population vivant avec moins de 1,90 dollar par jour ?", ["L'extrême pauvreté", "Le seuil de pauvreté relative", "La pauvreté laborieuse", "Le chômage structurel"], 0, "Le seuil international d'extrême pauvreté est fixé par la Banque mondiale.", "extrême pauvreté"),

    # Thème 3: Des mobilités généralisées (Q19-Q27)
    ("Quel terme désigne le déplacement de personnes d'un pays à un autre pour s'y installer ?", ["Une migration internationale", "Une migration pendulaire", "L'exode rural", "Un déplacement interne"], 0, "Les migrations internationales impliquent le franchissement d'une frontière d'État pour un changement de résidence.", "migration internationale"),
    ("Quelle est la première région d'accueil des migrants internationaux au monde ?", ["L'Europe", "L'Amérique du Nord", "Le Moyen-Orient", "L'Asie"], 0, "L'Europe est le principal pôle d'attraction pour les migrants internationaux, devant l'Amérique du Nord.", "Europe accueil"),
    ("Comment appelle-t-on les transferts d'argent des migrants vers leur pays d'origine ?", ["Les remises migratoires (remittances)", "Les investissements directs à l'étranger (IDE)", "L'aide publique au développement", "Les subventions"], 0, "Ces remises représentent souvent une part importante du PIB des pays en développement.", "remises"),
    ("Quel terme désigne les personnes forcées de fuir leur pays en raison de conflits ou de persécutions ?", ["Les réfugiés", "Les migrants économiques", "Les expatriés", "Les déplacés internes"], 0, "Le statut de réfugié est défini par la Convention de Genève de 1951.", "réfugiés"),
    ("Quel espace européen permet la libre circulation des personnes entre la plupart de ses pays membres ?", ["L'espace Schengen", "La zone euro", "L'Union douanière", "Le Conseil de l'Europe"], 0, "L'espace Schengen garantit la libre circulation à plus de 400 millions de citoyens européens.", "Schengen"),
    ("Quel pays accueille le plus grand nombre de réfugiés au monde ?", ["La Turquie", "L'Allemagne", "Les États-Unis", "Le Liban"], 0, "La Turquie accueille plusieurs millions de réfugiés, principalement des Syriens.", "Turquie réfugiés"),
    ("Quelle est la première destination touristique mondiale en nombre d'arrivées internationales ?", ["La France", "L'Espagne", "Les États-Unis", "La Chine"], 0, "La France est la destination touristique la plus visitée au monde avec près de 90 millions de visiteurs internationaux avant la pandémie.", "France tourisme"),
    ("Comment appelle-t-on le tourisme qui vise à préserver les environnements naturels et le bien-être des populations locales ?", ["L'écotourisme", "Le tourisme de masse", "Le tourisme d'affaires", "Le tourisme balnéaire"], 0, "L'écotourisme est une forme de tourisme durable centrée sur la découverte de la nature.", "écotourisme"),
    ("Quel type de mobilité quotidienne correspond aux déplacements entre le domicile et le lieu de travail ?", ["Les mobilités pendulaires", "Les mobilités résidentielles", "L'exode rural", "Les migrations saisonnières"], 0, "Ces mobilités, souvent entre la périphérie et le centre-ville, sont un enjeu majeur d'aménagement urbain.", "pendulaire"),

    # Thème 4: L'Afrique australe : un espace en profonde mutation (Q28-Q36)
    ("Quel pays est la principale puissance économique de l'Afrique australe ?", ["L'Afrique du Sud", "L'Angola", "Le Mozambique", "La Namibie"], 0, "L'Afrique du Sud est la seule puissance émergente de la région et fait partie des BRICS.", "Afrique du Sud puissance"),
    ("Quel régime de ségrégation raciale a été aboli en Afrique du Sud en 1991 ?", ["L'Apartheid", "La colonisation", "Le régime de Vichy", "La ségrégation de Jim Crow"], 0, "L'Apartheid, politique de développement séparé, a été démantelé sous l'impulsion de F. de Klerk et Nelson Mandela.", "Apartheid"),
    ("Quelle immense réserve naturelle transfrontalière associe l'Afrique du Sud, le Mozambique et le Zimbabwe ?", ["Le Parc transfrontalier du Grand Limpopo", "La réserve de Masai Mara", "Le parc national de Serengeti", "La réserve d'Etosha"], 0, "Le Grand Limpopo intègre notamment le célèbre parc national Kruger sud-africain.", "Limpopo"),
    ("Quel problème sanitaire majeur affecte particulièrement l'Afrique australe, avec des taux de prévalence très élevés ?", ["L'épidémie de VIH/SIDA", "Le paludisme", "La maladie d'Ebola", "La fièvre jaune"], 0, "L'Afrique australe est l'épicentre mondial de l'épidémie de VIH, ce qui pèse lourdement sur son développement démographique et économique.", "VIH"),
    ("Quelles ressources minérales ont historiquement fondé la puissance économique de l'Afrique du Sud ?", ["L'or et les diamants", "Le pétrole et le gaz", "L'uranium et le cuivre", "Le bauxite et le fer"], 0, "L'exploitation minière (or du Witwatersrand, diamants de Kimberley) a été le moteur du développement sud-africain.", "or diamants"),
    ("Comment appelle-t-on les quartiers défavorisés situés à la périphérie des villes sud-africaines, héritages de l'Apartheid ?", ["Les townships", "Les favelas", "Les bidonvilles", "Les ghettos"], 0, "Bien que l'Apartheid soit fini, les townships restent marqués par une forte ségrégation socio-spatiale.", "townships"),
    ("Quel pays d'Afrique australe a connu un miracle économique basé sur l'exploitation des diamants et la stabilité politique depuis son indépendance ?", ["Le Botswana", "Le Zimbabwe", "L'Angola", "La Zambie"], 0, "Le Botswana est souvent cité comme un exemple de développement réussi en Afrique grâce à la bonne gouvernance de ses ressources.", "Botswana"),
    ("Comment nomme-t-on la communauté économique des pays d'Afrique australe visant à l'intégration régionale ?", ["La SADC", "La CEDEAO", "L'Union Africaine", "L'ALENA"], 0, "La Communauté de développement d'Afrique australe (SADC) promeut la coopération économique et politique dans la région.", "SADC"),
    ("Quelle métropole est le cœur financier et industriel de l'Afrique du Sud ?", ["Johannesburg", "Le Cap", "Pretoria", "Durban"], 0, "Johannesburg est le centre de gravité économique du pays, bien qu'elle ne soit pas la capitale politique.", "Johannesburg")
]

gains = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]

questions = []
for i, fact in enumerate(facts):
    q_id = f"2de_geo_q{i+1}"
    diff = 1 if i % 9 < 3 else (2 if i % 9 < 6 else 3)
    gain_idx = min(len(gains)-1, int((i/36)*15))
    gain = gains[gain_idx]
    
    # Base question
    q = {
        "id": q_id,
        "text": fact[0],
        "answers": fact[1],
        "correctIndex": fact[2],
        "difficulty": diff,
        "timeLimit": 30 + (diff-1)*10,
        "gain": gain,
        "explanation": fact[3],
        "lifelinesAllowed": ["50_50", "phone_friend", "public_vote", "switch"],
        "jokerData": {
            "phone_friend": {
                "friendName": "Professeur de géographie",
                "relation": "Enseignant",
                "dialogue": f"La bonne réponse concerne {fact[4]}. C'est un concept fondamental du programme."
            },
            "public_vote": {
                "votes": [75 if x==fact[2] else 10 if x==(fact[2]+1)%4 else 5 for x in range(4)]
            }
        }
    }
    questions.append(q)
    
    # Alt question (slight variation)
    q_alt = dict(q)
    q_alt["id"] = f"{q_id}_alt"
    q_alt["text"] = f"[Variante] {fact[0]}"
    questions.append(q_alt)

template["game"]["questions"] = questions

with open(r'c:\Users\alano\OneDrive\Documents\GitHub\QuestionspourunChampignon\data\seconde-geo.json', 'w', encoding='utf-8') as f:
    json.dump(template, f, indent=2, ensure_ascii=False)

print("seconde-geo.json generated.")
