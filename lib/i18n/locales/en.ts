import type { Translations } from "../types";

export const en: Translations = {
  meta: {
    title: "Content to Action — Transform short-form content into structured action",
    description:
      "Paste a short-form content URL or upload a video. Get structured, actionable output — recipes, business insights, DIY guides, workout plans, and more.",
    ogTitle: "Content to Action",
    ogDescription: "Paste short-form content. Get something you can actually use.",
  },

  nav: {
    brand: "Content to Action",
    analyze: "Analyze",
    saved: "Saved",
    settings: "Settings",
  },

  footer: {
    tagline: "Content to Action — Transform short-form content into structured action.",
    disclaimer: "AI-generated outputs may contain errors. Always verify critical information.",
  },

  landing: {
    badge: "Transform content into action",
    heroTitle: "Paste short-form content.",
    heroHighlight: "Get something you can actually use.",
    heroDescription:
      "Turn Instagram reels, TikToks, and YouTube Shorts into structured recipes, action items, workout plans, and more.",
    ctaPrimary: "Start analyzing",
    ctaSecondary: "See how it works",
    contentTypesTitle: "Works with any short-form content",
    recipes: "Recipes",
    recipesDesc: "Ingredients, shopping lists, prep steps",
    business: "Business",
    businessDesc: "Key learnings, action items, frameworks",
    diy: "DIY",
    diyDesc: "Materials, tools, step-by-step guide",
    workouts: "Workouts",
    workoutsDesc: "Exercises, reps, sets, structure",
    other: "Other",
    otherDesc: "Key points and suggested actions",
    howItWorksTitle: "How it works",
    step1Title: "Paste or upload",
    step1Desc:
      "Paste a content URL from Instagram, TikTok, YouTube, or Facebook. Or upload a video directly.",
    step2Title: "AI analyzes",
    step2Desc:
      "Our AI detects the content type and extracts structured information, not just a summary.",
    step3Title: "Get actionable output",
    step3Desc:
      "Receive a structured result you can copy, export, and actually use in your life.",
    readyTitle: "Ready to try it?",
    readyDesc: "No sign-up required. Paste a URL or upload a video to get started.",
    readyCta: "Analyze content now",
    trustTitle: "Transparency and trust",
    trustDesc:
      "AI-generated outputs may contain errors. We clearly flag uncertain data and missing information so you can verify what matters. Your uploads are processed securely and not shared.",
  },

  newAnalysis: {
    title: "Analyze Content",
    description: "Paste a URL or upload a video to extract structured, actionable output.",
    contentSource: "Content Source",
    pasteUrl: "Paste URL",
    uploadVideo: "Upload Video",
    urlLabel: "Content URL",
    urlPlaceholder: "https://instagram.com/reel/... or tiktok.com/...",
    urlHint: "Supports Instagram, TikTok, Facebook, and YouTube Shorts",
    captionLabel: "Caption text",
    captionOptional: "(optional)",
    captionPlaceholder: "Paste the post caption here for better analysis accuracy...",
    commentsLabel: "Comments",
    commentsOptional: "(optional)",
    commentsPlaceholder: "Paste relevant comments that add context...",
    analyzeButton: "Analyze Content",
    analyzingButton: "Starting analysis...",
    dropzoneText: "Drop a video here or click to upload",
    dropzoneHint: ".MP4, .MOV, .WEBM up to 50MB",
    removeFile: "Remove file",
    errorNoUrl: "Please enter a URL.",
    errorNoUpload: "Please upload a video first.",
    errorGeneric: "Something went wrong. Please try again.",
    errorUploadFailed: "Upload failed. Please try again.",
  },

  processing: {
    title: "Analyzing content",
    progressLabel: "Processing",
    slowNote:
      "Processing is taking longer than expected. This page will automatically update when complete.",
    failedTitle: "Analysis failed",
    failedFetch: "Failed to fetch job status.",
    failedGeneric: "Analysis failed.",
    connectionError: "Connection error. Please check your network.",
    newAnalysis: "Start new analysis",
  },

  jobStatus: {
    queued: "Queued",
    fetching_source: "Fetching content",
    transcribing: "Transcribing audio",
    extracting_ocr: "Reading on-screen text",
    classifying: "Detecting content type",
    structuring: "Structuring output",
    completed: "Complete",
    failed: "Failed",
  },

  contentTypes: {
    recipe: "Recipe",
    business: "Business",
    diy: "DIY",
    workout: "Workout",
    other: "Other",
    travel: "Travel",
    fashion: "Fashion",
    tech_review: "Tech Review",
    education: "Education",
  },

  results: {
    notFound: "Result not found.",
    loadFailed: "Failed to load result.",
    loadErrorTitle: "Could not load result",
    newButton: "New",
    copyButton: "Copy",
    copiedButton: "Copied",
    exportText: "Text",
    exportJson: "JSON",
    highConfidence: "High confidence",
    mediumConfidence: "Medium confidence",
    lowConfidence: "Low confidence",
    warningsTitle: "Warnings",
    missingInfoTitle: "Missing Information",
  },

  recipe: {
    prep: "Prep",
    cook: "Cook",
    ingredients: "Ingredients",
    shoppingList: "Shopping List",
    steps: "Preparation Steps",
  },

  businessResult: {
    keyLearnings: "Key Learnings",
    actionItems: "Action Items",
    frameworks: "Frameworks",
    toolsMentioned: "Tools Mentioned",
  },

  diyResult: {
    materials: "Materials",
    tools: "Tools Needed",
    steps: "Steps",
  },

  workoutResult: {
    exercises: "Exercises",
    sets: "sets",
    reps: "reps",
  },

  otherResult: {
    keyPoints: "Key Points",
    suggestedActions: "Suggested Actions",
  },

  travelResult: {
    destinations: "Destinations",
    travelTips: "Travel Tips",
    estimatedBudget: "Estimated Budget",
    bestTime: "Best Time to Visit",
    packingList: "Packing List",
  },

  fashionResult: {
    outfitItems: "Outfit Items",
    brand: "Brand",
    price: "Price",
    styleNotes: "Style Notes",
    occasions: "Occasions",
    alternatives: "Alternatives",
  },

  techResult: {
    product: "Product",
    pros: "Pros",
    cons: "Cons",
    rating: "Rating",
    specifications: "Specifications",
    verdict: "Verdict",
    alternatives: "Alternatives",
  },

  educationResult: {
    concepts: "Concepts",
    keyTakeaways: "Key Takeaways",
    resources: "Further Resources",
    exercises: "Practice Exercises",
    difficulty: "Difficulty Level",
  },

  saved: {
    title: "Saved Results",
    description: "Your saved analysis results will appear here.",
    emptyTitle: "Sign in to save results",
    emptyDesc:
      "Create an account to save and organize your analysis results. This feature is coming soon.",
    emptyCta: "Analyze something new",
  },

  settingsPage: {
    title: "Settings",
    description: "Configure your Content to Action experience.",
    accountTitle: "Account",
    accountDesc:
      "Account settings and preferences will be available here once authentication is enabled.",
    accountNote:
      "The MVP version of Content to Action works without an account. Sign-in and personalization features are planned for a future release.",
    languageTitle: "Language",
    languageDesc: "Choose the display language for the app.",
  },

  auth: {
    loginTitle: "Sign in",
    loginDesc: "Sign in to save your analysis results.",
    registerTitle: "Create account",
    registerDesc: "Create an account to save and manage your results.",
    resetTitle: "Reset password",
    resetDesc: "Enter your email to receive a password reset link.",
    email: "Email",
    password: "Password",
    loginButton: "Sign in",
    registerButton: "Create account",
    resetButton: "Send reset link",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    forgotPassword: "Forgot password?",
    resetSent: "Password reset email sent. Check your inbox.",
    logoutButton: "Sign out",
    profileTitle: "Profile",
    orWithEmail: "or with email",
    verifyTitle: "Enter code",
    verifyDesc: "We sent a 6-digit code to:",
    verifyButton: "Verify",
    verifyEmailSent: "Verification code sent!",
    resendCode: "Resend code",
    passwordMinLength: "Password must be at least 6 characters",
  },

  chat: {
    title: "Questions about this result",
    placeholder: "Ask a question...",
    hint: "Ask a question about this result",
    recipePlaceholder: "What can I use instead of butter?",
    workoutPlaceholder: "Can I do this without equipment?",
    businessPlaceholder: "How do I implement this?",
    diyPlaceholder: "What tools do I need exactly?",
  },

  shopping: {
    title: "Shopping List",
    newList: "New list",
    defaultListName: "Weekly shop",
    addItem: "Add item",
    stillNeeded: "Still needed",
    done: "Done",
    importRecipes: "Import from recipes",
    importFrom: "Import from",
    copyList: "Copy list",
    deleteList: "Delete list",
    emptyTitle: "No items yet",
    emptyDesc: "Add items or import from your recipes.",
    itemsChecked: "items checked",
  },

  collections: {
    title: "Collections",
    newCollection: "New collection",
    namePlaceholder: "Collection name",
    items: "items",
    share: "Share",
    public: "Public",
    private: "Private",
    shareLink: "Share link",
    emptyTitle: "No collections",
    emptyDesc: "Create a collection to group results together.",
    addTo: "Add to collection",
    createNew: "Create new",
  },

  watch: {
    title: "Watch Accounts",
    description: "Monitor social media accounts. Coming soon: automatic analysis of new posts.",
    addAccount: "Add account",
    addDesc: "Enter a username",
    active: "Active",
    paused: "Paused",
    emptyTitle: "No accounts watched",
    emptyDesc: "Add an account above to start monitoring.",
  },

  modify: {
    title: "AI Modification",
    custom: "Custom change...",
    vegan: "Vegan",
    glutenFree: "Gluten-free",
    simpler: "Simpler",
    healthier: "Healthier",
    budget: "Budget-friendly",
  },

  stepByStep: {
    finish: "Finish",
    done: "Done",
  },

  nutrition: {
    title: "Nutrition (estimated)",
    button: "Nutrition",
    perServing: "Per serving",
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    fiber: "Fiber",
  },

  errors: {
    genericTitle: "Something went wrong",
    genericMessage: "An unexpected error occurred. Please try again.",
    notFoundTitle: "Page not found",
    notFoundMessage: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go home",
    tryAgain: "Try again",
  },
};
