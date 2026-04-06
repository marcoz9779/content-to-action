const INGREDIENT_EMOJIS: Record<string, string> = {
  // Gemüse
  kartoffel: "🥔", tomate: "🍅", zwiebel: "🧅", knoblauch: "🧄",
  gurke: "🥒", karotte: "🥕", paprika: "🫑", salat: "🥬",
  spinat: "🥬", brokkoli: "🥦", mais: "🌽", kürbis: "🎃",
  avocado: "🥑", aubergine: "🍆", pilz: "🍄", champignon: "🍄",
  erbse: "🫛", bohne: "🫘", linse: "🫘", kichererbse: "🫘",
  sellerie: "🥬", lauch: "🥬", fenchel: "🥬", rucola: "🥬",
  radieschen: "🫑", rote_bete: "🫑", zucchini: "🥒", spargel: "🌿",
  ingwer: "🫚", chili: "🌶️", peperoni: "🌶️", jalapeño: "🌶️",

  // Obst
  apfel: "🍎", birne: "🍐", banane: "🍌", zitrone: "🍋",
  limette: "🍋", orange: "🍊", mandarine: "🍊", erdbeere: "🍓",
  blaubeere: "🫐", himbeere: "🫐", traube: "🍇", kirsche: "🍒",
  pfirsich: "🍑", mango: "🥭", ananas: "🍍", wassermelone: "🍉",
  kokos: "🥥", kiwi: "🥝", pflaume: "🍑", feige: "🍇",

  // Milchprodukte & Eier
  ei: "🥚", eier: "🥚", eigelb: "🥚", eiweiss: "🥚",
  milch: "🥛", butter: "🧈", käse: "🧀", joghurt: "🥛",
  sahne: "🥛", quark: "🥛", rahm: "🥛", schmand: "🥛",
  mozzarella: "🧀", parmesan: "🧀", gouda: "🧀", feta: "🧀",
  reibekäse: "🧀", frischkäse: "🧀", mascarpone: "🧀",
  ricotta: "🧀", emmentaler: "🧀", creme_fraiche: "🥛",

  // Fleisch & Fisch
  fleisch: "🥩", rindfleisch: "🥩", rind: "🥩", steak: "🥩",
  schweinefleisch: "🥩", schwein: "🥩", hackfleisch: "🥩", hack: "🥩",
  hähnchen: "🍗", huhn: "🍗", poulet: "🍗", hühnerbrust: "🍗",
  pute: "🍗", truthahn: "🍗", ente: "🍗", lamm: "🥩",
  schinken: "🥓", speck: "🥓", bacon: "🥓", wurst: "🌭",
  salami: "🥩", bratwurst: "🌭",
  lachs: "🐟", thunfisch: "🐟", garnele: "🦐", shrimp: "🦐",
  muschel: "🦪", tintenfisch: "🦑", forelle: "🐟", kabeljau: "🐟",

  // Getreide & Backwaren
  mehl: "🌾", brot: "🍞", brötchen: "🍞", toast: "🍞",
  reis: "🍚", nudel: "🍝", pasta: "🍝", spaghetti: "🍝",
  penne: "🍝", fusilli: "🍝", lasagne: "🍝", tortilla: "🫓",
  wrap: "🫓", couscous: "🌾", bulgur: "🌾", haferflocken: "🌾",
  müsli: "🥣", cornflakes: "🥣",

  // Gewürze & Kräuter
  salz: "🧂", pfeffer: "🫚", zucker: "🍬", honig: "🍯",
  zimt: "🫚", vanille: "🫚", curry: "🫚", kurkuma: "🫚",
  oregano: "🌿", basilikum: "🌿", thymian: "🌿", rosmarin: "🌿",
  petersilie: "🌿", schnittlauch: "🌿", dill: "🌿", koriander: "🌿",
  minze: "🌿", lorbeer: "🍃", muskat: "🫚", majoran: "🌿",
  paprikapulver: "🌶️", kreuzkümmel: "🫚",

  // Öle & Saucen
  öl: "🫒", olivenöl: "🫒", sonnenblumenöl: "🫒", rapsöl: "🫒",
  essig: "🫙", senf: "🫙", ketchup: "🫙", mayonnaise: "🫙",
  sojasauce: "🫙", worcestersauce: "🫙", tabasco: "🌶️",
  sriracha: "🌶️", tomatenmark: "🫙", tomatensosse: "🫙",

  // Nüsse & Samen
  mandel: "🥜", walnuss: "🥜", haselnuss: "🥜", erdnuss: "🥜",
  cashew: "🥜", pistazie: "🥜", sesam: "🥜", leinsamen: "🥜",
  sonnenblumenkern: "🌻", kürbiskern: "🥜", pinienkern: "🥜",

  // Getränke
  wasser: "💧", kaffee: "☕", tee: "🍵", wein: "🍷",
  bier: "🍺", saft: "🧃", limonade: "🥤",

  // Sonstiges
  schokolade: "🍫", kakao: "🍫", hefe: "🧫", backpulver: "🧫",
  stärke: "🌾", speisestärke: "🌾", gelatine: "🫙",
  kokosmilch: "🥥", nuss: "🥜",
};

const DEFAULT_EMOJI = "🥄";

/**
 * Get emoji for an ingredient name.
 * Uses fuzzy matching: normalizes input, strips plurals, checks partial matches.
 */
export function getIngredientEmoji(name: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");

  const originalNormalized = name.toLowerCase().trim();

  // Direct match
  if (INGREDIENT_EMOJIS[originalNormalized]) return INGREDIENT_EMOJIS[originalNormalized];

  // Strip common German plural suffixes
  const stems = [
    originalNormalized,
    originalNormalized.replace(/en$/, ""),
    originalNormalized.replace(/n$/, ""),
    originalNormalized.replace(/s$/, ""),
    originalNormalized.replace(/e$/, ""),
  ];

  for (const stem of stems) {
    if (INGREDIENT_EMOJIS[stem]) return INGREDIENT_EMOJIS[stem];
  }

  // Partial match — check if any key is contained in the name
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJIS)) {
    if (originalNormalized.includes(key) || key.includes(originalNormalized)) {
      return emoji;
    }
  }

  // Try with normalized (ae/oe/ue) version
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJIS)) {
    const keyNorm = key.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
    if (normalized.includes(keyNorm) || keyNorm.includes(normalized)) {
      return emoji;
    }
  }

  return DEFAULT_EMOJI;
}
