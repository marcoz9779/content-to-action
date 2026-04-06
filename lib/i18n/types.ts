export type Locale = "de" | "en" | "fr" | "it";

export interface Translations {
  // Meta
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };

  // Navigation
  nav: {
    brand: string;
    analyze: string;
    saved: string;
    settings: string;
  };

  // Footer
  footer: {
    tagline: string;
    disclaimer: string;
  };

  // Landing page
  landing: {
    badge: string;
    heroTitle: string;
    heroHighlight: string;
    heroDescription: string;
    ctaPrimary: string;
    ctaSecondary: string;
    contentTypesTitle: string;
    recipes: string;
    recipesDesc: string;
    business: string;
    businessDesc: string;
    diy: string;
    diyDesc: string;
    workouts: string;
    workoutsDesc: string;
    other: string;
    otherDesc: string;
    howItWorksTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    readyTitle: string;
    readyDesc: string;
    readyCta: string;
    trustTitle: string;
    trustDesc: string;
  };

  // New analysis page
  newAnalysis: {
    title: string;
    description: string;
    contentSource: string;
    pasteUrl: string;
    uploadVideo: string;
    urlLabel: string;
    urlPlaceholder: string;
    urlHint: string;
    captionLabel: string;
    captionOptional: string;
    captionPlaceholder: string;
    commentsLabel: string;
    commentsOptional: string;
    commentsPlaceholder: string;
    analyzeButton: string;
    analyzingButton: string;
    dropzoneText: string;
    dropzoneHint: string;
    removeFile: string;
    errorNoUrl: string;
    errorNoUpload: string;
    errorGeneric: string;
    errorUploadFailed: string;
  };

  // Processing page
  processing: {
    title: string;
    progressLabel: string;
    slowNote: string;
    failedTitle: string;
    failedFetch: string;
    failedGeneric: string;
    connectionError: string;
    newAnalysis: string;
  };

  // Job status labels
  jobStatus: {
    queued: string;
    fetching_source: string;
    transcribing: string;
    extracting_ocr: string;
    classifying: string;
    structuring: string;
    completed: string;
    failed: string;
  };

  // Content type labels
  contentTypes: {
    recipe: string;
    business: string;
    diy: string;
    workout: string;
    other: string;
    travel: string;
    fashion: string;
    tech_review: string;
    education: string;
  };

  // Results page
  results: {
    notFound: string;
    loadFailed: string;
    loadErrorTitle: string;
    newButton: string;
    copyButton: string;
    copiedButton: string;
    exportText: string;
    exportJson: string;
    highConfidence: string;
    mediumConfidence: string;
    lowConfidence: string;
    warningsTitle: string;
    missingInfoTitle: string;
  };

  // Recipe result
  recipe: {
    prep: string;
    cook: string;
    ingredients: string;
    shoppingList: string;
    steps: string;
  };

  // Business result
  businessResult: {
    keyLearnings: string;
    actionItems: string;
    frameworks: string;
    toolsMentioned: string;
  };

  // DIY result
  diyResult: {
    materials: string;
    tools: string;
    steps: string;
  };

  // Workout result
  workoutResult: {
    exercises: string;
    sets: string;
    reps: string;
  };

  // Other result
  otherResult: {
    keyPoints: string;
    suggestedActions: string;
  };

  // Travel result
  travelResult: {
    destinations: string;
    travelTips: string;
    estimatedBudget: string;
    bestTime: string;
    packingList: string;
  };

  // Fashion result
  fashionResult: {
    outfitItems: string;
    brand: string;
    price: string;
    styleNotes: string;
    occasions: string;
    alternatives: string;
  };

  // Tech review result
  techResult: {
    product: string;
    pros: string;
    cons: string;
    rating: string;
    specifications: string;
    verdict: string;
    alternatives: string;
  };

  // Education result
  educationResult: {
    concepts: string;
    keyTakeaways: string;
    resources: string;
    exercises: string;
    difficulty: string;
  };

  // Saved page
  saved: {
    title: string;
    description: string;
    emptyTitle: string;
    emptyDesc: string;
    emptyCta: string;
  };

  // Settings page
  settingsPage: {
    title: string;
    description: string;
    accountTitle: string;
    accountDesc: string;
    accountNote: string;
    languageTitle: string;
    languageDesc: string;
  };

  // Auth
  auth: {
    loginTitle: string;
    loginDesc: string;
    registerTitle: string;
    registerDesc: string;
    resetTitle: string;
    resetDesc: string;
    email: string;
    password: string;
    loginButton: string;
    registerButton: string;
    resetButton: string;
    noAccount: string;
    hasAccount: string;
    forgotPassword: string;
    resetSent: string;
    logoutButton: string;
    profileTitle: string;
    orWithEmail: string;
    verifyTitle: string;
    verifyDesc: string;
    verifyButton: string;
    verifyEmailSent: string;
    resendCode: string;
    passwordMinLength: string;
  };

  // Chat
  chat: {
    title: string;
    placeholder: string;
    hint: string;
    recipePlaceholder: string;
    workoutPlaceholder: string;
    businessPlaceholder: string;
    diyPlaceholder: string;
  };

  // Shopping List
  shopping: {
    title: string;
    newList: string;
    defaultListName: string;
    addItem: string;
    stillNeeded: string;
    done: string;
    importRecipes: string;
    importFrom: string;
    copyList: string;
    deleteList: string;
    emptyTitle: string;
    emptyDesc: string;
    itemsChecked: string;
  };

  // Collections
  collections: {
    title: string;
    newCollection: string;
    namePlaceholder: string;
    items: string;
    share: string;
    public: string;
    private: string;
    shareLink: string;
    emptyTitle: string;
    emptyDesc: string;
    addTo: string;
    createNew: string;
  };

  // Watch
  watch: {
    title: string;
    description: string;
    addAccount: string;
    addDesc: string;
    active: string;
    paused: string;
    emptyTitle: string;
    emptyDesc: string;
  };

  // Modify
  modify: {
    title: string;
    custom: string;
    vegan: string;
    glutenFree: string;
    simpler: string;
    healthier: string;
    budget: string;
  };

  // Step by Step
  stepByStep: {
    finish: string;
    done: string;
  };

  // Nutrition
  nutrition: {
    title: string;
    button: string;
    perServing: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };

  // Error pages
  errors: {
    genericTitle: string;
    genericMessage: string;
    notFoundTitle: string;
    notFoundMessage: string;
    goHome: string;
    tryAgain: string;
  };
}
