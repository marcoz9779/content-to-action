import type { Translations } from "../types";

export const fr: Translations = {
  meta: {
    title: "Content to Action — Transformez les vidéos courtes en actions structurées",
    description:
      "Collez une URL ou téléchargez une vidéo. Obtenez des résultats structurés et exploitables — recettes, insights business, guides DIY, plans d'entraînement et plus.",
    ogTitle: "Content to Action",
    ogDescription: "Collez du contenu court. Obtenez quelque chose d'utile.",
  },

  nav: {
    brand: "Content to Action",
    analyze: "Analyser",
    saved: "Sauvegardés",
    settings: "Paramètres",
  },

  footer: {
    tagline: "Content to Action — Transformez les vidéos courtes en actions structurées.",
    disclaimer: "Les résultats générés par l'IA peuvent contenir des erreurs. Vérifiez toujours les informations importantes.",
  },

  landing: {
    badge: "Transformez le contenu en action",
    heroTitle: "Collez du contenu court.",
    heroHighlight: "Obtenez quelque chose d'utile.",
    heroDescription:
      "Transformez les Reels Instagram, TikToks et YouTube Shorts en recettes structurées, plans d'action, programmes d'entraînement et plus.",
    ctaPrimary: "Commencer l'analyse",
    ctaSecondary: "Comment ça marche",
    contentTypesTitle: "Fonctionne avec tous les contenus courts",
    recipes: "Recettes",
    recipesDesc: "Ingrédients, listes de courses, étapes de préparation",
    business: "Business",
    businessDesc: "Enseignements clés, plans d'action, frameworks",
    diy: "DIY",
    diyDesc: "Matériaux, outils, guide étape par étape",
    workouts: "Entraînements",
    workoutsDesc: "Exercices, répétitions, séries, structure",
    other: "Autre",
    otherDesc: "Points clés et actions suggérées",
    howItWorksTitle: "Comment ça marche",
    step1Title: "Collez ou téléchargez",
    step1Desc:
      "Collez une URL d'Instagram, TikTok, YouTube ou Facebook. Ou téléchargez directement une vidéo.",
    step2Title: "L'IA analyse",
    step2Desc:
      "Notre IA détecte le type de contenu et extrait des informations structurées, pas juste un résumé.",
    step3Title: "Résultats exploitables",
    step3Desc:
      "Recevez un résultat structuré que vous pouvez copier, exporter et utiliser concrètement.",
    readyTitle: "Prêt à essayer ?",
    readyDesc: "Aucune inscription requise. Collez une URL ou téléchargez une vidéo.",
    readyCta: "Analyser du contenu",
    trustTitle: "Transparence et confiance",
    trustDesc:
      "Les résultats générés par l'IA peuvent contenir des erreurs. Nous signalons clairement les données incertaines et les informations manquantes. Vos fichiers sont traités de manière sécurisée.",
  },

  newAnalysis: {
    title: "Analyser du contenu",
    description: "Collez une URL ou téléchargez une vidéo pour obtenir des résultats structurés.",
    contentSource: "Source du contenu",
    pasteUrl: "Coller une URL",
    uploadVideo: "Télécharger une vidéo",
    urlLabel: "URL du contenu",
    urlPlaceholder: "https://instagram.com/reel/... ou tiktok.com/...",
    urlHint: "Supporte Instagram, TikTok, Facebook et YouTube Shorts",
    captionLabel: "Texte de description",
    captionOptional: "(optionnel)",
    captionPlaceholder: "Collez la description du post pour de meilleurs résultats...",
    commentsLabel: "Commentaires",
    commentsOptional: "(optionnel)",
    commentsPlaceholder: "Collez les commentaires pertinents qui ajoutent du contexte...",
    analyzeButton: "Analyser le contenu",
    analyzingButton: "Analyse en cours...",
    dropzoneText: "Déposez une vidéo ici ou cliquez pour télécharger",
    dropzoneHint: ".MP4, .MOV, .WEBM jusqu'à 50 Mo",
    removeFile: "Supprimer le fichier",
    errorNoUrl: "Veuillez entrer une URL.",
    errorNoUpload: "Veuillez d'abord télécharger une vidéo.",
    errorGeneric: "Une erreur s'est produite. Veuillez réessayer.",
    errorUploadFailed: "Échec du téléchargement. Veuillez réessayer.",
  },

  processing: {
    title: "Analyse en cours",
    progressLabel: "Traitement",
    slowNote:
      "Le traitement prend plus de temps que prévu. Cette page se mettra à jour automatiquement.",
    failedTitle: "Analyse échouée",
    failedFetch: "Impossible de récupérer le statut.",
    failedGeneric: "L'analyse a échoué.",
    connectionError: "Erreur de connexion. Vérifiez votre réseau.",
    newAnalysis: "Nouvelle analyse",
  },

  jobStatus: {
    queued: "En file d'attente",
    fetching_source: "Récupération du contenu",
    transcribing: "Transcription audio",
    extracting_ocr: "Lecture du texte à l'écran",
    classifying: "Détection du type de contenu",
    structuring: "Structuration du résultat",
    completed: "Terminé",
    failed: "Échoué",
  },

  contentTypes: {
    recipe: "Recette",
    business: "Business",
    diy: "DIY",
    workout: "Entraînement",
    other: "Autre",
    travel: "Voyage",
    fashion: "Mode",
    tech_review: "Avis tech",
    education: "Éducation",
  },

  results: {
    notFound: "Résultat non trouvé.",
    loadFailed: "Impossible de charger le résultat.",
    loadErrorTitle: "Impossible de charger le résultat",
    newButton: "Nouveau",
    copyButton: "Copier",
    copiedButton: "Copié",
    exportText: "Texte",
    exportJson: "JSON",
    highConfidence: "Confiance élevée",
    mediumConfidence: "Confiance moyenne",
    lowConfidence: "Confiance faible",
    warningsTitle: "Avertissements",
    missingInfoTitle: "Informations manquantes",
  },

  recipe: {
    prep: "Préparation",
    cook: "Cuisson",
    ingredients: "Ingrédients",
    shoppingList: "Liste de courses",
    steps: "Étapes de préparation",
  },

  businessResult: {
    keyLearnings: "Enseignements clés",
    actionItems: "Plans d'action",
    frameworks: "Frameworks",
    toolsMentioned: "Outils mentionnés",
  },

  diyResult: {
    materials: "Matériaux",
    tools: "Outils nécessaires",
    steps: "Étapes",
  },

  workoutResult: {
    exercises: "Exercices",
    sets: "séries",
    reps: "répétitions",
  },

  otherResult: {
    keyPoints: "Points clés",
    suggestedActions: "Actions suggérées",
  },

  travelResult: {
    destinations: "Destinations",
    travelTips: "Conseils de voyage",
    estimatedBudget: "Budget estimé",
    bestTime: "Meilleure période",
    packingList: "Liste de bagages",
  },

  fashionResult: {
    outfitItems: "Pièces de tenue",
    brand: "Marque",
    price: "Prix",
    styleNotes: "Notes de style",
    occasions: "Occasions",
    alternatives: "Alternatives",
  },

  techResult: {
    product: "Produit",
    pros: "Avantages",
    cons: "Inconvénients",
    rating: "Note",
    specifications: "Spécifications",
    verdict: "Verdict",
    alternatives: "Alternatives",
  },

  educationResult: {
    concepts: "Concepts",
    keyTakeaways: "Points clés",
    resources: "Ressources complémentaires",
    exercises: "Exercices pratiques",
    difficulty: "Niveau de difficulté",
  },

  saved: {
    title: "Résultats sauvegardés",
    description: "Vos résultats d'analyse sauvegardés apparaîtront ici.",
    emptyTitle: "Connectez-vous pour sauvegarder",
    emptyDesc:
      "Créez un compte pour sauvegarder et organiser vos résultats. Cette fonctionnalité arrive bientôt.",
    emptyCta: "Analyser du nouveau contenu",
  },

  settingsPage: {
    title: "Paramètres",
    description: "Configurez votre expérience Content to Action.",
    accountTitle: "Compte",
    accountDesc:
      "Les paramètres du compte seront disponibles une fois l'authentification activée.",
    accountNote:
      "La version MVP fonctionne sans compte. La connexion et la personnalisation sont prévues pour une future version.",
    languageTitle: "Langue",
    languageDesc: "Choisissez la langue d'affichage de l'application.",
  },

  auth: {
    loginTitle: "Connexion",
    loginDesc: "Connectez-vous pour sauvegarder vos résultats.",
    registerTitle: "Créer un compte",
    registerDesc: "Créez un compte pour sauvegarder et gérer vos résultats.",
    resetTitle: "Réinitialiser le mot de passe",
    resetDesc: "Entrez votre email pour recevoir un lien de réinitialisation.",
    email: "Email",
    password: "Mot de passe",
    loginButton: "Se connecter",
    registerButton: "Créer un compte",
    resetButton: "Envoyer le lien",
    noAccount: "Pas encore de compte ?",
    hasAccount: "Déjà un compte ?",
    forgotPassword: "Mot de passe oublié ?",
    resetSent: "Email de réinitialisation envoyé. Vérifiez votre boîte de réception.",
    logoutButton: "Se déconnecter",
    profileTitle: "Profil",
    orWithEmail: "ou par email",
    verifyTitle: "Entrez le code",
    verifyDesc: "Nous avons envoyé un code à 6 chiffres à :",
    verifyButton: "Vérifier",
    verifyEmailSent: "Code de vérification envoyé !",
    resendCode: "Renvoyer le code",
    passwordMinLength: "Le mot de passe doit contenir au moins 6 caractères",
  },

  chat: {
    title: "Questions sur ce résultat",
    placeholder: "Poser une question...",
    hint: "Posez une question sur ce résultat",
    recipePlaceholder: "Par quoi remplacer le beurre ?",
    workoutPlaceholder: "C'est possible sans équipement ?",
    businessPlaceholder: "Comment mettre cela en pratique ?",
    diyPlaceholder: "Quels outils me faut-il exactement ?",
  },

  shopping: {
    title: "Liste de courses",
    newList: "Nouvelle liste",
    defaultListName: "Courses de la semaine",
    addItem: "Ajouter un article",
    stillNeeded: "À acheter",
    done: "Fait",
    importRecipes: "Importer des recettes",
    importFrom: "Importer de",
    copyList: "Copier la liste",
    deleteList: "Supprimer la liste",
    emptyTitle: "Aucun article",
    emptyDesc: "Ajoutez des articles ou importez-les depuis vos recettes.",
    itemsChecked: "articles cochés",
  },

  collections: {
    title: "Collections",
    newCollection: "Nouvelle collection",
    namePlaceholder: "Nom de la collection",
    items: "éléments",
    share: "Partager",
    public: "Public",
    private: "Privé",
    shareLink: "Lien de partage",
    emptyTitle: "Aucune collection",
    emptyDesc: "Créez une collection pour regrouper vos résultats.",
    addTo: "Ajouter à une collection",
    createNew: "Créer nouvelle",
  },

  watch: {
    title: "Surveiller des comptes",
    description: "Surveillez des comptes de réseaux sociaux. Bientôt : analyse automatique des nouveaux posts.",
    addAccount: "Ajouter un compte",
    addDesc: "Entrez un nom d'utilisateur",
    active: "Actif",
    paused: "En pause",
    emptyTitle: "Aucun compte surveillé",
    emptyDesc: "Ajoutez un compte ci-dessus.",
  },

  modify: {
    title: "Modification IA",
    custom: "Modification personnalisée...",
    vegan: "Végan",
    glutenFree: "Sans gluten",
    simpler: "Plus simple",
    healthier: "Plus sain",
    budget: "Économique",
  },

  stepByStep: {
    finish: "Terminer",
    done: "Fait",
  },

  nutrition: {
    title: "Nutrition (estimée)",
    button: "Nutrition",
    perServing: "Par portion",
    calories: "Calories",
    protein: "Protéines",
    carbs: "Glucides",
    fat: "Lipides",
    fiber: "Fibres",
  },

  errors: {
    genericTitle: "Une erreur s'est produite",
    genericMessage: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    notFoundTitle: "Page non trouvée",
    notFoundMessage: "La page que vous recherchez n'existe pas ou a été déplacée.",
    goHome: "Retour à l'accueil",
    tryAgain: "Réessayer",
  },
};
