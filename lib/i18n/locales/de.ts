import type { Translations } from "../types";

export const de: Translations = {
  meta: {
    title: "Content to Action — Kurzvideos in strukturierte Aktionen umwandeln",
    description:
      "Füge eine URL ein oder lade ein Video hoch. Erhalte strukturierte, umsetzbare Ergebnisse — Rezepte, Business-Insights, DIY-Anleitungen, Trainingspläne und mehr.",
    ogTitle: "Content to Action",
    ogDescription:
      "Kurzvideos einfügen. Etwas Brauchbares erhalten.",
  },

  nav: {
    brand: "Content to Action",
    analyze: "Analysieren",
    saved: "Gespeichert",
    settings: "Einstellungen",
  },

  footer: {
    tagline:
      "Content to Action — Kurzvideos in strukturierte Aktionen umwandeln.",
    disclaimer:
      "KI-generierte Ergebnisse können Fehler enthalten. Überprüfe wichtige Informationen immer selbst.",
  },

  landing: {
    badge: "Inhalte in Aktionen umwandeln",
    heroTitle: "Kurzvideos einfügen.",
    heroHighlight: "Etwas Brauchbares erhalten.",
    heroDescription:
      "Verwandle Instagram Reels, TikToks und YouTube Shorts in strukturierte Rezepte, Aktionspunkte, Trainingspläne und mehr.",
    ctaPrimary: "Jetzt analysieren",
    ctaSecondary: "So funktioniert's",
    contentTypesTitle: "Funktioniert mit allen Kurzvideos",
    recipes: "Rezepte",
    recipesDesc: "Zutaten, Einkaufslisten, Zubereitungsschritte",
    business: "Business",
    businessDesc: "Erkenntnisse, Aktionspunkte, Frameworks",
    diy: "DIY",
    diyDesc: "Materialien, Werkzeuge, Schritt-für-Schritt",
    workouts: "Workouts",
    workoutsDesc: "Übungen, Wiederholungen, Sätze, Struktur",
    other: "Sonstiges",
    otherDesc: "Kernaussagen und Handlungsempfehlungen",
    howItWorksTitle: "So funktioniert's",
    step1Title: "Einfügen oder hochladen",
    step1Desc:
      "Füge eine URL von Instagram, TikTok, YouTube oder Facebook ein. Oder lade ein Video direkt hoch.",
    step2Title: "KI analysiert",
    step2Desc:
      "Unsere KI erkennt den Inhaltstyp und extrahiert strukturierte Informationen — nicht nur eine Zusammenfassung.",
    step3Title: "Umsetzbare Ergebnisse",
    step3Desc:
      "Erhalte ein strukturiertes Ergebnis zum Kopieren, Exportieren und tatsächlichen Nutzen.",
    readyTitle: "Bereit zum Ausprobieren?",
    readyDesc:
      "Keine Anmeldung nötig. Füge eine URL ein oder lade ein Video hoch.",
    readyCta: "Jetzt Inhalt analysieren",
    trustTitle: "Transparenz und Vertrauen",
    trustDesc:
      "KI-generierte Ergebnisse können Fehler enthalten. Wir kennzeichnen unsichere Daten und fehlende Informationen klar, damit du überprüfen kannst, was wichtig ist. Deine Uploads werden sicher verarbeitet und nicht weitergegeben.",
  },

  newAnalysis: {
    title: "Inhalt analysieren",
    description:
      "Füge eine URL ein oder lade ein Video hoch, um strukturierte, umsetzbare Ergebnisse zu erhalten.",
    contentSource: "Inhaltsquelle",
    pasteUrl: "URL einfügen",
    uploadVideo: "Video hochladen",
    urlLabel: "Inhalts-URL",
    urlPlaceholder: "https://instagram.com/reel/... oder tiktok.com/...",
    urlHint: "Unterstützt Instagram, TikTok, Facebook und YouTube Shorts",
    captionLabel: "Beschreibungstext",
    captionOptional: "(optional)",
    captionPlaceholder:
      "Füge die Beitragsbeschreibung hier ein für bessere Ergebnisse...",
    commentsLabel: "Kommentare",
    commentsOptional: "(optional)",
    commentsPlaceholder:
      "Füge relevante Kommentare ein, die Kontext liefern...",
    analyzeButton: "Inhalt analysieren",
    analyzingButton: "Analyse wird gestartet...",
    dropzoneText: "Video hier ablegen oder klicken zum Hochladen",
    dropzoneHint: ".MP4, .MOV, .WEBM bis 50MB",
    removeFile: "Datei entfernen",
    errorNoUrl: "Bitte gib eine URL ein.",
    errorNoUpload: "Bitte lade zuerst ein Video hoch.",
    errorGeneric: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    errorUploadFailed: "Upload fehlgeschlagen. Bitte versuche es erneut.",
  },

  processing: {
    title: "Inhalt wird analysiert",
    progressLabel: "Verarbeitung",
    slowNote:
      "Die Verarbeitung dauert länger als erwartet. Diese Seite aktualisiert sich automatisch.",
    failedTitle: "Analyse fehlgeschlagen",
    failedFetch: "Jobstatus konnte nicht abgerufen werden.",
    failedGeneric: "Analyse fehlgeschlagen.",
    connectionError:
      "Verbindungsfehler. Bitte überprüfe deine Internetverbindung.",
    newAnalysis: "Neue Analyse starten",
  },

  jobStatus: {
    queued: "In der Warteschlange",
    fetching_source: "Inhalt wird abgerufen",
    transcribing: "Audio wird transkribiert",
    extracting_ocr: "Bildschirmtext wird gelesen",
    classifying: "Inhaltstyp wird erkannt",
    structuring: "Ergebnis wird strukturiert",
    completed: "Abgeschlossen",
    failed: "Fehlgeschlagen",
  },

  contentTypes: {
    recipe: "Rezept",
    business: "Business",
    diy: "DIY",
    workout: "Workout",
    other: "Sonstiges",
    travel: "Reise",
    fashion: "Mode",
    tech_review: "Tech-Review",
    education: "Bildung",
  },

  results: {
    notFound: "Ergebnis nicht gefunden.",
    loadFailed: "Ergebnis konnte nicht geladen werden.",
    loadErrorTitle: "Ergebnis konnte nicht geladen werden",
    newButton: "Neu",
    copyButton: "Kopieren",
    copiedButton: "Kopiert",
    exportText: "Text",
    exportJson: "JSON",
    highConfidence: "Hohe Konfidenz",
    mediumConfidence: "Mittlere Konfidenz",
    lowConfidence: "Niedrige Konfidenz",
    warningsTitle: "Warnungen",
    missingInfoTitle: "Fehlende Informationen",
  },

  recipe: {
    prep: "Vorbereitung",
    cook: "Kochzeit",
    ingredients: "Zutaten",
    shoppingList: "Einkaufsliste",
    steps: "Zubereitungsschritte",
  },

  businessResult: {
    keyLearnings: "Wichtige Erkenntnisse",
    actionItems: "Aktionspunkte",
    frameworks: "Frameworks",
    toolsMentioned: "Erwähnte Tools",
  },

  diyResult: {
    materials: "Materialien",
    tools: "Benötigte Werkzeuge",
    steps: "Schritte",
  },

  workoutResult: {
    exercises: "Übungen",
    sets: "Sätze",
    reps: "Wiederholungen",
  },

  otherResult: {
    keyPoints: "Kernaussagen",
    suggestedActions: "Empfohlene Aktionen",
  },

  travelResult: {
    destinations: "Reiseziele",
    travelTips: "Reisetipps",
    estimatedBudget: "Geschätztes Budget",
    bestTime: "Beste Reisezeit",
    packingList: "Packliste",
  },

  fashionResult: {
    outfitItems: "Outfit-Teile",
    brand: "Marke",
    price: "Preis",
    styleNotes: "Stil-Tipps",
    occasions: "Anlässe",
    alternatives: "Alternativen",
  },

  techResult: {
    product: "Produkt",
    pros: "Vorteile",
    cons: "Nachteile",
    rating: "Bewertung",
    specifications: "Spezifikationen",
    verdict: "Fazit",
    alternatives: "Alternativen",
  },

  educationResult: {
    concepts: "Konzepte",
    keyTakeaways: "Wichtige Erkenntnisse",
    resources: "Weiterführende Ressourcen",
    exercises: "Übungsaufgaben",
    difficulty: "Schwierigkeitsgrad",
  },

  saved: {
    title: "Gespeicherte Ergebnisse",
    description: "Deine gespeicherten Analyseergebnisse erscheinen hier.",
    emptyTitle: "Anmelden um Ergebnisse zu speichern",
    emptyDesc:
      "Erstelle ein Konto, um deine Analyseergebnisse zu speichern und zu organisieren. Diese Funktion kommt bald.",
    emptyCta: "Neuen Inhalt analysieren",
  },

  settingsPage: {
    title: "Einstellungen",
    description: "Konfiguriere dein Content to Action Erlebnis.",
    accountTitle: "Konto",
    accountDesc:
      "Kontoeinstellungen und Präferenzen werden hier verfügbar sein, sobald die Authentifizierung aktiviert ist.",
    accountNote:
      "Die MVP-Version von Content to Action funktioniert ohne Konto. Anmeldung und Personalisierung sind für ein zukünftiges Release geplant.",
    languageTitle: "Sprache",
    languageDesc: "Wähle die Anzeigesprache der App.",
  },

  auth: {
    loginTitle: "Anmelden",
    loginDesc: "Melde dich an, um deine Ergebnisse zu speichern.",
    registerTitle: "Konto erstellen",
    registerDesc: "Erstelle ein Konto, um Ergebnisse zu speichern und zu verwalten.",
    resetTitle: "Passwort zurücksetzen",
    resetDesc: "Gib deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen zu erhalten.",
    email: "E-Mail",
    password: "Passwort",
    loginButton: "Anmelden",
    registerButton: "Konto erstellen",
    resetButton: "Link senden",
    noAccount: "Noch kein Konto?",
    hasAccount: "Bereits ein Konto?",
    forgotPassword: "Passwort vergessen?",
    resetSent: "E-Mail zum Zurücksetzen wurde gesendet. Überprüfe dein Postfach.",
    logoutButton: "Abmelden",
    profileTitle: "Profil",
    orWithEmail: "oder mit E-Mail",
    verifyTitle: "Code eingeben",
    verifyDesc: "Wir haben dir einen 6-stelligen Code gesendet an:",
    verifyButton: "Bestätigen",
    verifyEmailSent: "Bestätigungscode gesendet!",
    resendCode: "Code erneut senden",
    passwordMinLength: "Passwort muss mindestens 6 Zeichen lang sein",
  },

  chat: {
    title: "Fragen zu diesem Ergebnis",
    placeholder: "Frage stellen...",
    hint: "Stelle eine Frage zu diesem Ergebnis",
    recipePlaceholder: "Was kann ich statt Butter nehmen?",
    workoutPlaceholder: "Geht das auch ohne Geräte?",
    businessPlaceholder: "Wie setze ich das konkret um?",
    diyPlaceholder: "Welches Werkzeug brauche ich genau?",
  },

  shopping: {
    title: "Einkaufsliste",
    newList: "Neue Liste",
    defaultListName: "Wocheneinkauf",
    addItem: "Artikel hinzufügen",
    stillNeeded: "Noch zu kaufen",
    done: "Erledigt",
    importRecipes: "Aus Rezepten importieren",
    importFrom: "Importieren von",
    copyList: "Liste kopieren",
    deleteList: "Liste löschen",
    emptyTitle: "Noch keine Artikel",
    emptyDesc: "Füge Artikel hinzu oder importiere sie aus deinen Rezepten.",
    itemsChecked: "Artikel abgehakt",
  },

  collections: {
    title: "Sammlungen",
    newCollection: "Neue Sammlung",
    namePlaceholder: "Name der Sammlung",
    items: "Einträge",
    share: "Teilen",
    public: "Öffentlich",
    private: "Privat",
    shareLink: "Link teilen",
    emptyTitle: "Keine Sammlungen",
    emptyDesc: "Erstelle eine Sammlung, um Ergebnisse zu gruppieren.",
    addTo: "Zur Sammlung hinzufügen",
    createNew: "Neue erstellen",
  },

  watch: {
    title: "Accounts beobachten",
    description: "Beobachte Social-Media-Accounts. Bald: automatische Analyse neuer Posts.",
    addAccount: "Account hinzufügen",
    addDesc: "Gib einen Benutzernamen ein",
    active: "Aktiv",
    paused: "Pausiert",
    emptyTitle: "Keine Accounts beobachtet",
    emptyDesc: "Füge oben einen Account hinzu.",
  },

  modify: {
    title: "KI-Modifikation",
    custom: "Eigene Änderung...",
    vegan: "Vegan",
    glutenFree: "Glutenfrei",
    simpler: "Einfacher",
    healthier: "Gesünder",
    budget: "Günstiger",
  },

  stepByStep: {
    finish: "Fertig",
    done: "Erledigt",
  },

  nutrition: {
    title: "Nährwerte (geschätzt)",
    button: "Nährwerte",
    perServing: "Pro Portion",
    calories: "Kalorien",
    protein: "Protein",
    carbs: "Kohlenhydrate",
    fat: "Fett",
    fiber: "Ballaststoffe",
  },

  errors: {
    genericTitle: "Etwas ist schiefgelaufen",
    genericMessage:
      "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.",
    notFoundTitle: "Seite nicht gefunden",
    notFoundMessage:
      "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    goHome: "Zur Startseite",
    tryAgain: "Erneut versuchen",
  },
};
