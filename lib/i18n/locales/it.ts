import type { Translations } from "../types";

export const it: Translations = {
  meta: {
    title: "Content to Action — Trasforma i video brevi in azioni strutturate",
    description:
      "Incolla un URL o carica un video. Ottieni risultati strutturati e utilizzabili — ricette, insight business, guide fai-da-te, piani di allenamento e altro.",
    ogTitle: "Content to Action",
    ogDescription: "Incolla contenuti brevi. Ottieni qualcosa di utile.",
  },

  nav: {
    brand: "Content to Action",
    analyze: "Analizza",
    saved: "Salvati",
    settings: "Impostazioni",
  },

  footer: {
    tagline: "Content to Action — Trasforma i video brevi in azioni strutturate.",
    disclaimer: "I risultati generati dall'IA possono contenere errori. Verifica sempre le informazioni importanti.",
  },

  landing: {
    badge: "Trasforma i contenuti in azione",
    heroTitle: "Incolla contenuti brevi.",
    heroHighlight: "Ottieni qualcosa di utile.",
    heroDescription:
      "Trasforma Reel di Instagram, TikTok e YouTube Shorts in ricette strutturate, piani d'azione, programmi di allenamento e altro.",
    ctaPrimary: "Inizia l'analisi",
    ctaSecondary: "Come funziona",
    contentTypesTitle: "Funziona con qualsiasi video breve",
    recipes: "Ricette",
    recipesDesc: "Ingredienti, lista della spesa, passaggi",
    business: "Business",
    businessDesc: "Insegnamenti chiave, azioni, framework",
    diy: "Fai da te",
    diyDesc: "Materiali, strumenti, guida passo-passo",
    workouts: "Allenamenti",
    workoutsDesc: "Esercizi, ripetizioni, serie, struttura",
    other: "Altro",
    otherDesc: "Punti chiave e azioni suggerite",
    howItWorksTitle: "Come funziona",
    step1Title: "Incolla o carica",
    step1Desc:
      "Incolla un URL da Instagram, TikTok, YouTube o Facebook. Oppure carica direttamente un video.",
    step2Title: "L'IA analizza",
    step2Desc:
      "La nostra IA rileva il tipo di contenuto ed estrae informazioni strutturate, non solo un riassunto.",
    step3Title: "Risultati utilizzabili",
    step3Desc:
      "Ricevi un risultato strutturato da copiare, esportare e usare concretamente.",
    readyTitle: "Pronto a provare?",
    readyDesc: "Nessuna registrazione richiesta. Incolla un URL o carica un video.",
    readyCta: "Analizza contenuto ora",
    trustTitle: "Trasparenza e fiducia",
    trustDesc:
      "I risultati generati dall'IA possono contenere errori. Segnaliamo chiaramente i dati incerti e le informazioni mancanti. I tuoi file vengono elaborati in modo sicuro.",
  },

  newAnalysis: {
    title: "Analizza contenuto",
    description: "Incolla un URL o carica un video per ottenere risultati strutturati.",
    contentSource: "Fonte del contenuto",
    pasteUrl: "Incolla URL",
    uploadVideo: "Carica video",
    urlLabel: "URL del contenuto",
    urlPlaceholder: "https://instagram.com/reel/... o tiktok.com/...",
    urlHint: "Supporta Instagram, TikTok, Facebook e YouTube Shorts",
    captionLabel: "Testo descrizione",
    captionOptional: "(opzionale)",
    captionPlaceholder: "Incolla la descrizione del post per risultati migliori...",
    commentsLabel: "Commenti",
    commentsOptional: "(opzionale)",
    commentsPlaceholder: "Incolla i commenti rilevanti che aggiungono contesto...",
    analyzeButton: "Analizza contenuto",
    analyzingButton: "Avvio analisi...",
    dropzoneText: "Trascina un video qui o clicca per caricare",
    dropzoneHint: ".MP4, .MOV, .WEBM fino a 50MB",
    removeFile: "Rimuovi file",
    errorNoUrl: "Inserisci un URL.",
    errorNoUpload: "Carica prima un video.",
    errorGeneric: "Qualcosa è andato storto. Riprova.",
    errorUploadFailed: "Caricamento fallito. Riprova.",
  },

  processing: {
    title: "Analisi in corso",
    progressLabel: "Elaborazione",
    slowNote:
      "L'elaborazione richiede più tempo del previsto. Questa pagina si aggiornerà automaticamente.",
    failedTitle: "Analisi fallita",
    failedFetch: "Impossibile recuperare lo stato.",
    failedGeneric: "L'analisi è fallita.",
    connectionError: "Errore di connessione. Controlla la tua rete.",
    newAnalysis: "Nuova analisi",
  },

  jobStatus: {
    queued: "In coda",
    fetching_source: "Recupero del contenuto",
    transcribing: "Trascrizione audio",
    extracting_ocr: "Lettura testo su schermo",
    classifying: "Rilevamento tipo di contenuto",
    structuring: "Strutturazione risultato",
    completed: "Completato",
    failed: "Fallito",
  },

  contentTypes: {
    recipe: "Ricetta",
    business: "Business",
    diy: "Fai da te",
    workout: "Allenamento",
    other: "Altro",
    travel: "Viaggio",
    fashion: "Moda",
    tech_review: "Recensione tech",
    education: "Istruzione",
  },

  results: {
    notFound: "Risultato non trovato.",
    loadFailed: "Impossibile caricare il risultato.",
    loadErrorTitle: "Impossibile caricare il risultato",
    newButton: "Nuovo",
    copyButton: "Copia",
    copiedButton: "Copiato",
    exportText: "Testo",
    exportJson: "JSON",
    highConfidence: "Confidenza alta",
    mediumConfidence: "Confidenza media",
    lowConfidence: "Confidenza bassa",
    warningsTitle: "Avvertenze",
    missingInfoTitle: "Informazioni mancanti",
  },

  recipe: {
    prep: "Preparazione",
    cook: "Cottura",
    ingredients: "Ingredienti",
    shoppingList: "Lista della spesa",
    steps: "Passaggi di preparazione",
  },

  businessResult: {
    keyLearnings: "Insegnamenti chiave",
    actionItems: "Azioni da compiere",
    frameworks: "Framework",
    toolsMentioned: "Strumenti menzionati",
  },

  diyResult: {
    materials: "Materiali",
    tools: "Strumenti necessari",
    steps: "Passaggi",
  },

  workoutResult: {
    exercises: "Esercizi",
    sets: "serie",
    reps: "ripetizioni",
  },

  otherResult: {
    keyPoints: "Punti chiave",
    suggestedActions: "Azioni suggerite",
  },

  travelResult: {
    destinations: "Destinazioni",
    travelTips: "Consigli di viaggio",
    estimatedBudget: "Budget stimato",
    bestTime: "Periodo migliore",
    packingList: "Lista bagagli",
  },

  fashionResult: {
    outfitItems: "Capi d'abbigliamento",
    brand: "Marca",
    price: "Prezzo",
    styleNotes: "Note di stile",
    occasions: "Occasioni",
    alternatives: "Alternative",
  },

  techResult: {
    product: "Prodotto",
    pros: "Vantaggi",
    cons: "Svantaggi",
    rating: "Valutazione",
    specifications: "Specifiche",
    verdict: "Verdetto",
    alternatives: "Alternative",
  },

  educationResult: {
    concepts: "Concetti",
    keyTakeaways: "Punti chiave",
    resources: "Risorse aggiuntive",
    exercises: "Esercizi pratici",
    difficulty: "Livello di difficoltà",
  },

  saved: {
    title: "Risultati salvati",
    description: "I tuoi risultati di analisi salvati appariranno qui.",
    emptyTitle: "Accedi per salvare i risultati",
    emptyDesc:
      "Crea un account per salvare e organizzare i tuoi risultati. Questa funzionalità arriverà presto.",
    emptyCta: "Analizza nuovo contenuto",
  },

  settingsPage: {
    title: "Impostazioni",
    description: "Configura la tua esperienza Content to Action.",
    accountTitle: "Account",
    accountDesc:
      "Le impostazioni dell'account saranno disponibili una volta attivata l'autenticazione.",
    accountNote:
      "La versione MVP funziona senza account. Login e personalizzazione sono previsti per una versione futura.",
    languageTitle: "Lingua",
    languageDesc: "Scegli la lingua di visualizzazione dell'app.",
  },

  auth: {
    loginTitle: "Accedi",
    loginDesc: "Accedi per salvare i tuoi risultati.",
    registerTitle: "Crea account",
    registerDesc: "Crea un account per salvare e gestire i tuoi risultati.",
    resetTitle: "Reimposta password",
    resetDesc: "Inserisci la tua email per ricevere un link di reimpostazione.",
    email: "Email",
    password: "Password",
    loginButton: "Accedi",
    registerButton: "Crea account",
    resetButton: "Invia link",
    noAccount: "Non hai un account?",
    hasAccount: "Hai già un account?",
    forgotPassword: "Password dimenticata?",
    resetSent: "Email di reimpostazione inviata. Controlla la tua casella di posta.",
    logoutButton: "Esci",
    profileTitle: "Profilo",
    orWithEmail: "o con email",
    verifyTitle: "Inserisci il codice",
    verifyDesc: "Ti abbiamo inviato un codice a 6 cifre a:",
    verifyButton: "Verifica",
    verifyEmailSent: "Codice di verifica inviato!",
    resendCode: "Invia di nuovo il codice",
    passwordMinLength: "La password deve avere almeno 6 caratteri",
  },

  chat: {
    title: "Domande su questo risultato",
    placeholder: "Fai una domanda...",
    hint: "Fai una domanda su questo risultato",
    recipePlaceholder: "Cosa posso usare al posto del burro?",
    workoutPlaceholder: "Si può fare senza attrezzi?",
    businessPlaceholder: "Come lo metto in pratica?",
    diyPlaceholder: "Quali strumenti mi servono esattamente?",
  },

  shopping: {
    title: "Lista della spesa",
    newList: "Nuova lista",
    defaultListName: "Spesa settimanale",
    addItem: "Aggiungi articolo",
    stillNeeded: "Da comprare",
    done: "Fatto",
    importRecipes: "Importa dalle ricette",
    importFrom: "Importa da",
    copyList: "Copia lista",
    deleteList: "Elimina lista",
    emptyTitle: "Nessun articolo",
    emptyDesc: "Aggiungi articoli o importali dalle tue ricette.",
    itemsChecked: "articoli spuntati",
  },

  collections: {
    title: "Collezioni",
    newCollection: "Nuova collezione",
    namePlaceholder: "Nome della collezione",
    items: "elementi",
    share: "Condividi",
    public: "Pubblico",
    private: "Privato",
    shareLink: "Link di condivisione",
    emptyTitle: "Nessuna collezione",
    emptyDesc: "Crea una collezione per raggruppare i risultati.",
    addTo: "Aggiungi a collezione",
    createNew: "Crea nuova",
  },

  watch: {
    title: "Monitora account",
    description: "Monitora account social. Presto: analisi automatica dei nuovi post.",
    addAccount: "Aggiungi account",
    addDesc: "Inserisci un nome utente",
    active: "Attivo",
    paused: "In pausa",
    emptyTitle: "Nessun account monitorato",
    emptyDesc: "Aggiungi un account qui sopra.",
  },

  modify: {
    title: "Modifica IA",
    custom: "Modifica personalizzata...",
    vegan: "Vegano",
    glutenFree: "Senza glutine",
    simpler: "Più semplice",
    healthier: "Più sano",
    budget: "Economico",
  },

  stepByStep: {
    finish: "Fine",
    done: "Fatto",
  },

  nutrition: {
    title: "Valori nutrizionali (stimati)",
    button: "Nutrizione",
    perServing: "Per porzione",
    calories: "Calorie",
    protein: "Proteine",
    carbs: "Carboidrati",
    fat: "Grassi",
    fiber: "Fibre",
  },

  errors: {
    genericTitle: "Qualcosa è andato storto",
    genericMessage: "Si è verificato un errore imprevisto. Riprova.",
    notFoundTitle: "Pagina non trovata",
    notFoundMessage: "La pagina cercata non esiste o è stata spostata.",
    goHome: "Torna alla home",
    tryAgain: "Riprova",
  },
};
