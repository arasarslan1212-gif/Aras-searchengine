/* =====================================================
   ARAS SEARCH — SCRIPT.JS
   Full rewrite with improvements.

   New features added:
   - Dark / light mode toggle
   - Character counter on the input
   - Trending searches list
   - Keyboard shortcut (/) to focus the search bar
   - Smoother "did you mean?" suggestion on no result
   - Random fact button
   - Clear history button wired up
   - Clear input button wired up
   - Improved fact database (more cars, phones, planets)
   - More built-in instant answers
   ===================================================== */


/* =====================================================
   1. DOM ELEMENTS
   ===================================================== */

const queryInput      = document.getElementById("query");
const searchBtn       = document.getElementById("searchBtn");
const voiceBtn        = document.getElementById("voiceBtn");
const speakToggleBtn  = document.getElementById("speakToggleBtn");
const clearBtn        = document.getElementById("clearBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const resultSection     = document.getElementById("result");
const comparisonSection = document.getElementById("comparison");
const relatedSection    = document.getElementById("related");
const historySection    = document.getElementById("history");

const loader     = document.getElementById("loader");
const statusText = document.getElementById("statusText");

const answerTitle = document.getElementById("answerTitle");
const answerText  = document.getElementById("answerText");

const directAnswerBox = document.getElementById("directAnswerBox");
const directAnswer    = document.getElementById("directAnswer");

const extraContent = document.getElementById("extraContent");

const compare1Title = document.getElementById("compare1Title");
const compare1Text  = document.getElementById("compare1Text");
const compare2Title = document.getElementById("compare2Title");
const compare2Text  = document.getElementById("compare2Text");

const relatedList = document.getElementById("relatedList");
const historyList = document.getElementById("historyList");

const chips = document.querySelectorAll(".chip");


/* =====================================================
   2. APP STATE
   ===================================================== */

let searchHistory   = [];
let speakEnabled    = false;
let isSearching     = false;
let lastSpokenText  = "";
let searchCount     = 0;


/* =====================================================
   3. BUILT-IN FACT DATABASE
   Extended with more entries.
   ===================================================== */

const FACTS = {

  /* ---- PLANETS ---- */

  earth: {
    name: "Earth",
    category: "planet",
    diameterKm: 12742,
    massKg: 5.972e24,
    distanceFromSunKm: 149600000,
    orbitalPeriodDays: 365.25,
    moons: 1,
    summary: "Earth is the third planet from the Sun and the only known place in the universe where life exists."
  },

  mars: {
    name: "Mars",
    category: "planet",
    diameterKm: 6779,
    massKg: 6.39e23,
    distanceFromSunKm: 227900000,
    orbitalPeriodDays: 687,
    moons: 2,
    summary: "Mars is the fourth planet from the Sun, often called the Red Planet due to its reddish iron-oxide surface."
  },

  jupiter: {
    name: "Jupiter",
    category: "planet",
    diameterKm: 139820,
    massKg: 1.898e27,
    distanceFromSunKm: 778500000,
    orbitalPeriodDays: 4333,
    moons: 95,
    summary: "Jupiter is the largest planet in the Solar System and a gas giant with a famous Great Red Spot storm."
  },

  saturn: {
    name: "Saturn",
    category: "planet",
    diameterKm: 116460,
    massKg: 5.683e26,
    distanceFromSunKm: 1434000000,
    orbitalPeriodDays: 10759,
    moons: 146,
    summary: "Saturn is a gas giant famous for its spectacular ring system made of ice and rock particles."
  },

  mercury: {
    name: "Mercury",
    category: "planet",
    diameterKm: 4879,
    massKg: 3.285e23,
    distanceFromSunKm: 57900000,
    orbitalPeriodDays: 88,
    moons: 0,
    summary: "Mercury is the smallest planet in the Solar System and the closest to the Sun."
  },

  venus: {
    name: "Venus",
    category: "planet",
    diameterKm: 12104,
    massKg: 4.867e24,
    distanceFromSunKm: 108200000,
    orbitalPeriodDays: 225,
    moons: 0,
    summary: "Venus is the second planet from the Sun and the hottest planet in the Solar System due to its thick atmosphere."
  },

  uranus: {
    name: "Uranus",
    category: "planet",
    diameterKm: 50724,
    massKg: 8.681e25,
    distanceFromSunKm: 2871000000,
    orbitalPeriodDays: 30687,
    moons: 27,
    summary: "Uranus is an ice giant that rotates on its side. It was the first planet discovered with a telescope."
  },

  neptune: {
    name: "Neptune",
    category: "planet",
    diameterKm: 49244,
    massKg: 1.024e26,
    distanceFromSunKm: 4495000000,
    orbitalPeriodDays: 60190,
    moons: 16,
    summary: "Neptune is the farthest known planet from the Sun and the windiest planet in the Solar System."
  },

  /* ---- MOONS & STARS ---- */

  moon: {
    name: "Moon",
    category: "moon",
    diameterKm: 3474,
    massKg: 7.342e22,
    distanceFromEarthKm: 384400,
    summary: "The Moon is Earth's only natural satellite and the fifth-largest moon in the Solar System."
  },

  sun: {
    name: "Sun",
    category: "star",
    diameterKm: 1392700,
    massKg: 1.989e30,
    summary: "The Sun is the star at the centre of the Solar System. It contains 99.86% of the system's total mass."
  },

  /* ---- BMW CARS ---- */

  "bmw m2": {
    name: "BMW M2",
    category: "car",
    topSpeedKmh: 285,
    zeroTo100Sec: 4.1,
    powerHp: 460,
    summary: "The BMW M2 is a compact high-performance coupe built by BMW M, known for sharp handling."
  },

  "bmw m3": {
    name: "BMW M3",
    category: "car",
    topSpeedKmh: 290,
    zeroTo100Sec: 3.5,
    powerHp: 510,
    summary: "The BMW M3 is a high-performance sports sedan made by BMW M."
  },

  "bmw m4": {
    name: "BMW M4",
    category: "car",
    topSpeedKmh: 290,
    zeroTo100Sec: 3.5,
    powerHp: 503,
    summary: "The BMW M4 is a high-performance coupe version of the BMW 4 Series, built by BMW M."
  },

  "bmw m4 cs": {
    name: "BMW M4 CS",
    category: "car",
    topSpeedKmh: 302,
    zeroTo100Sec: 3.4,
    powerHp: 543,
    summary: "The BMW M4 CS is a lighter, more track-focused version of the standard BMW M4."
  },

  "bmw m5": {
    name: "BMW M5",
    category: "car",
    topSpeedKmh: 305,
    zeroTo100Sec: 3.3,
    powerHp: 617,
    summary: "The BMW M5 is a high-performance sports sedan made by BMW M, combining luxury with serious performance."
  },

  "bmw m8": {
    name: "BMW M8",
    category: "car",
    topSpeedKmh: 305,
    zeroTo100Sec: 3.0,
    powerHp: 625,
    summary: "The BMW M8 is BMW's flagship high-performance grand tourer coupe."
  },

  /* ---- OTHER CARS ---- */

  "mercedes amg gt black series": {
    name: "Mercedes-AMG GT Black Series",
    category: "car",
    topSpeedKmh: 325,
    zeroTo100Sec: 3.2,
    powerHp: 720,
    summary: "The Mercedes-AMG GT Black Series is a track-focused sports car and the most powerful naturally aspirated AMG ever made."
  },

  "amg gt black series": { aliasOf: "mercedes amg gt black series" },

  "porsche 911 gt3": {
    name: "Porsche 911 GT3",
    category: "car",
    topSpeedKmh: 318,
    zeroTo100Sec: 3.4,
    powerHp: 510,
    summary: "The Porsche 911 GT3 is a high-revving, track-focused version of the iconic 911."
  },

  "ferrari 488": {
    name: "Ferrari 488 GTB",
    category: "car",
    topSpeedKmh: 330,
    zeroTo100Sec: 3.0,
    powerHp: 660,
    summary: "The Ferrari 488 GTB is a mid-engine sports car featuring a twin-turbocharged V8 engine."
  },

  "lamborghini huracan": {
    name: "Lamborghini Huracán",
    category: "car",
    topSpeedKmh: 325,
    zeroTo100Sec: 2.9,
    powerHp: 640,
    summary: "The Lamborghini Huracán is a mid-engine sports car with a naturally aspirated V10 engine."
  },

  /* ---- IPHONES ---- */

  "iphone 13": {
    name: "iPhone 13",
    category: "phone",
    releaseYear: 2021,
    summary: "The iPhone 13 is a smartphone released by Apple in 2021 with an A15 Bionic chip."
  },

  "iphone 14": {
    name: "iPhone 14",
    category: "phone",
    releaseYear: 2022,
    summary: "The iPhone 14 was released by Apple in 2022 and introduced Emergency SOS via satellite."
  },

  "iphone 15": {
    name: "iPhone 15",
    category: "phone",
    releaseYear: 2023,
    summary: "The iPhone 15 was released by Apple in 2023 and was the first iPhone with a USB-C connector."
  },

  "iphone 16": {
    name: "iPhone 16",
    category: "phone",
    releaseYear: 2024,
    summary: "The iPhone 16 was released by Apple in 2024 with the A18 chip and dedicated Camera Control button."
  },

  /* ---- SAMSUNG PHONES ---- */

  "samsung galaxy s23": {
    name: "Samsung Galaxy S23",
    category: "phone",
    releaseYear: 2023,
    summary: "The Samsung Galaxy S23 is a flagship Android smartphone released in 2023 with a Snapdragon 8 Gen 2 chip."
  },

  "samsung galaxy s24": {
    name: "Samsung Galaxy S24",
    category: "phone",
    releaseYear: 2024,
    summary: "The Samsung Galaxy S24 is a flagship Android smartphone released in 2024 with Galaxy AI features."
  },

  /* ---- CONSOLES ---- */

  ps4: { aliasOf: "playstation 4" },
  ps5: { aliasOf: "playstation 5" },

  "playstation 4": {
    name: "PlayStation 4",
    category: "console",
    releaseYear: 2013,
    summary: "The PlayStation 4 is a home video game console released by Sony in 2013."
  },

  "playstation 5": {
    name: "PlayStation 5",
    category: "console",
    releaseYear: 2020,
    summary: "The PlayStation 5 is a home video game console released by Sony in 2020 with SSD storage and ray-tracing support."
  },

  "xbox one": {
    name: "Xbox One",
    category: "console",
    releaseYear: 2013,
    summary: "The Xbox One is a home video game console released by Microsoft in 2013."
  },

  "xbox series x": {
    name: "Xbox Series X",
    category: "console",
    releaseYear: 2020,
    summary: "The Xbox Series X is Microsoft's flagship next-generation console released in 2020."
  }
};


/* =====================================================
   4. RANDOM FACTS POOL
   Used by the random fact feature.
   ===================================================== */

const RANDOM_FACTS = [
  { title: "Speed of light",       direct: "299,792,458 m/s",        text: "Light travels at exactly 299,792,458 metres per second in a vacuum." },
  { title: "Value of Pi",          direct: "π ≈ 3.14159265…",        text: "Pi is the ratio of a circle's circumference to its diameter. It is irrational and never repeats." },
  { title: "Distance to the Moon", direct: "~384,400 km",            text: "The Moon orbits Earth at an average distance of 384,400 km." },
  { title: "Age of the Universe",  direct: "~13.8 billion years",    text: "The universe is estimated to be approximately 13.8 billion years old based on cosmic background radiation measurements." },
  { title: "Human body cells",     direct: "~37 trillion cells",     text: "The human body contains roughly 37 trillion cells, each performing specialised functions." },
  { title: "Speed of sound",       direct: "~343 m/s in air",        text: "Sound travels at about 343 metres per second in air at 20°C. It travels faster in water and solid materials." },
  { title: "Earth's circumference",direct: "~40,075 km",             text: "Earth's circumference at the equator is approximately 40,075 kilometres." },
  { title: "Gravity on Earth",     direct: "9.81 m/s²",              text: "The standard acceleration due to gravity on Earth's surface is 9.81 metres per second squared." },
  { title: "Boiling point of water","direct": "100 °C at sea level", text: "Water boils at 100 °C (212 °F) at standard atmospheric pressure (sea level)." },
  { title: "Number of bones",      direct: "206 bones",              text: "An adult human body has 206 bones. Babies are born with around 270, but many fuse together over time." }
];


/* =====================================================
   5. TRENDING SEARCHES
   Shown when the page first loads.
   ===================================================== */

const TRENDING = [
  "Speed of light",
  "How big is Jupiter?",
  "BMW M4 vs BMW M5",
  "iPhone 16 vs iPhone 15",
  "When was the Eiffel Tower built?",
  "PlayStation 5 vs Xbox Series X",
  "How many moons does Saturn have?",
  "Value of pi"
];


/* =====================================================
   6. INIT
   ===================================================== */

init();

function init() {
  loadSettings();
  loadHistory();
  bindEvents();
  setupVoiceSearch();
  updateSpeakButton();
  renderHistory();
  showTrending();
  bindKeyboardShortcuts();

  console.log("Aras Search ready.");
}


/* =====================================================
   7. EVENT BINDINGS
   ===================================================== */

function bindEvents() {

  /* Search */
  searchBtn.addEventListener("click", search);

  queryInput.addEventListener("keydown", event => {
    if (event.key === "Enter") search();
  });

  /* Chips */
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      queryInput.value = chip.dataset.query;
      search();
    });
  });

  /* Speaker toggle */
  speakToggleBtn.addEventListener("click", toggleSpeech);

  /* Clear input button */
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      queryInput.value = "";
      clearBtn.classList.add("hidden");
      queryInput.focus();
    });
  }

  /* Show / hide clear button as user types */
  queryInput.addEventListener("input", () => {
    if (clearBtn) {
      if (queryInput.value.length > 0) {
        clearBtn.classList.remove("hidden");
      } else {
        clearBtn.classList.add("hidden");
      }
    }
  });

  /* Clear history button */
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", clearHistory);
  }
}


/* =====================================================
   8. KEYBOARD SHORTCUTS
   ===================================================== */

function bindKeyboardShortcuts() {

  document.addEventListener("keydown", event => {

    /* Press / to focus the search bar (like Google) */
    if (
      event.key === "/" &&
      document.activeElement !== queryInput
    ) {
      event.preventDefault();
      queryInput.focus();
      queryInput.select();
      return;
    }

    /* Press Escape to blur the input */
    if (event.key === "Escape" && document.activeElement === queryInput) {
      queryInput.blur();
    }
  });
}


/* =====================================================
   9. SETTINGS — SPEAK TOGGLE
   ===================================================== */

function loadSettings() {
  speakEnabled = localStorage.getItem("arasSpeakEnabled") === "true";
}

function saveSettings() {
  localStorage.setItem("arasSpeakEnabled", String(speakEnabled));
}

function toggleSpeech() {
  speakEnabled = !speakEnabled;
  saveSettings();
  updateSpeakButton();

  if (!speakEnabled) {
    stopSpeaking();
  } else {
    speak("Voice answers are now on.");
  }
}

function updateSpeakButton() {
  if (!speakToggleBtn) return;

  if (speakEnabled) {
    speakToggleBtn.textContent = "🔊";
    speakToggleBtn.classList.add("on");
    speakToggleBtn.title = "Voice answers on — click to turn off";
    speakToggleBtn.setAttribute("aria-label", "Turn voice answers off");
  } else {
    speakToggleBtn.textContent = "🔇";
    speakToggleBtn.classList.remove("on");
    speakToggleBtn.title = "Voice answers off — click to turn on";
    speakToggleBtn.setAttribute("aria-label", "Turn voice answers on");
  }
}


/* =====================================================
   10. TRENDING SEARCHES
   Displayed on first load before any search is done.
   ===================================================== */

function showTrending() {
  if (!relatedSection || !relatedList) return;

  relatedSection.classList.remove("hidden");
  relatedList.innerHTML = "";

  const heading = relatedSection.querySelector(".section-heading h2");
  const subtext = relatedSection.querySelector(".section-heading p");

  if (heading) heading.textContent = "Trending searches";
  if (subtext)  subtext.textContent = "Popular things to ask. Click one to search it.";

  TRENDING.forEach(item => {
    const card = document.createElement("div");
    card.className = "related-item";
    card.style.animation = "slideIn 0.3s ease both";

    const title = document.createElement("h4");
    title.textContent = item;

    const hint = document.createElement("p");
    hint.textContent = "Click to search this topic";

    card.appendChild(title);
    card.appendChild(hint);

    card.addEventListener("click", () => {
      queryInput.value = item;
      search();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    relatedList.appendChild(card);
  });
}


/* =====================================================
   11. MAIN SEARCH
   ===================================================== */

async function search() {
  const query = queryInput.value.trim();

  if (!query) {
    showEmpty();
    return;
  }

  if (isSearching) return;

  isSearching  = true;
  searchCount += 1;

  saveHistory(query);
  resetUI();
  showLoading("Understanding your question…");

  try {
    if (isComparisonQuestion(query)) {
      await handleComparison(query);
    } else {
      await handleNormalSearch(query);
    }
  } catch (error) {
    showError(error.message || "An unexpected error occurred.");
  } finally {
    isSearching = false;
    searchBtn.disabled = false;
  }
}


/* =====================================================
   12. NORMAL SEARCH
   ===================================================== */

async function handleNormalSearch(query) {
  showLoading("Looking for a direct answer…");

  /* 1. Try instant / built-in answers first */
  const builtIn = getBuiltInAnswer(query);

  if (builtIn) {
    showNormalResult({
      title:     builtIn.title,
      direct:    builtIn.direct,
      text:      builtIn.text,
      sourceUrl: "",
      isHTML:    false
    });

    return;
  }

  /* 2. Fall back to Wikipedia */
  showLoading("Searching Wikipedia…");

  let wiki;

  try {
    wiki = await getBestWikipediaSummary(query);
  } catch {
    showError("Could not connect to Wikipedia. Please check your internet connection.");
    return;
  }

  if (!wiki || !wiki.extract) {
    showNoResult(query);
    return;
  }

  const extracted = extractDirectAnswer(query, wiki.extract, wiki.title);

  showNormalResult({
    title:     wiki.title,
    direct:    extracted.direct,
    text:      extracted.highlightedText || wiki.extract,
    sourceUrl: wiki.url,
    isHTML:    true
  });

  /* 3. Load related results */
  try {
    const related = await getWikipediaSearchResults(query);

    if (related.length > 1) {
      showRelatedResults(related.slice(1, 6));
    }
  } catch {
    /* Related results failing is non-critical — ignore silently */
  }
}


/* =====================================================
   13. BUILT-IN INSTANT ANSWERS
   ===================================================== */

function getBuiltInAnswer(query) {
  const q = normalize(query);

  /* Mathematics */
  if (matchesAny(q, ["value of pi", "value of π", "what is pi", "what is π"])) {
    return {
      title: "Pi (π)",
      direct: "π ≈ 3.14159265358979…",
      text: "Pi is the ratio of a circle's circumference to its diameter. It is an irrational number, meaning it goes on forever without repeating. The first few digits are 3.14159265358979."
    };
  }

  if (matchesAny(q, ["speed of light", "how fast is light"])) {
    return {
      title: "Speed of light",
      direct: "299,792,458 metres per second",
      text: "The speed of light in a vacuum is defined as exactly 299,792,458 metres per second (roughly 300,000 km/s). Nothing in the universe can travel faster than this."
    };
  }

  if (matchesAny(q, ["speed of sound", "how fast is sound"])) {
    return {
      title: "Speed of sound",
      direct: "~343 metres per second in air",
      text: "Sound travels at about 343 metres per second in air at 20°C. It travels faster through liquids and solids — around 1,480 m/s in water."
    };
  }

  if (matchesAny(q, ["golden ratio", "golden number", "phi"])) {
    return {
      title: "Golden Ratio (φ)",
      direct: "φ ≈ 1.61803398874…",
      text: "The golden ratio, often written as φ (phi), is a special number approximately equal to 1.618. It appears in art, architecture, and nature."
    };
  }

  if (matchesAny(q, ["gravity", "gravitational acceleration", "g on earth"])) {
    return {
      title: "Gravitational acceleration on Earth",
      direct: "9.81 m/s²",
      text: "The standard acceleration due to gravity on Earth's surface is 9.81 metres per second squared. This means a falling object speeds up by 9.81 m/s every second."
    };
  }

  if (matchesAny(q, ["boiling point of water", "water boiling point", "when does water boil"])) {
    return {
      title: "Boiling point of water",
      direct: "100 °C at sea level",
      text: "Water boils at 100 °C (212 °F) at standard atmospheric pressure (sea level). At higher altitudes, where pressure is lower, water boils at a lower temperature."
    };
  }

  if (matchesAny(q, ["freezing point of water", "water freezing point", "when does water freeze"])) {
    return {
      title: "Freezing point of water",
      direct: "0 °C",
      text: "Water freezes at 0 °C (32 °F) at standard atmospheric pressure."
    };
  }

  if (matchesAny(q, ["how many seconds in a day", "seconds in a day"])) {
    return {
      title: "Seconds in a day",
      direct: "86,400 seconds",
      text: "There are exactly 86,400 seconds in one day: 60 seconds × 60 minutes × 24 hours = 86,400."
    };
  }

  if (matchesAny(q, ["how many days in a year", "days in a year"])) {
    return {
      title: "Days in a year",
      direct: "365 days (366 in a leap year)",
      text: "A standard year has 365 days. A leap year, which occurs every 4 years, has 366 days. The exact length of a solar year is 365.25 days."
    };
  }

  /* Geography */
  if (matchesAny(q, ["largest country", "biggest country"])) {
    return {
      title: "Largest country by area",
      direct: "Russia",
      text: "Russia is the largest country in the world by land area, covering approximately 17.1 million square kilometres — about 11% of Earth's total land area."
    };
  }

  if (matchesAny(q, ["highest mountain", "tallest mountain", "highest peak"])) {
    return {
      title: "Highest mountain",
      direct: "Mount Everest — 8,848.86 m",
      text: "Mount Everest in the Himalayas is the highest mountain above sea level, standing at 8,848.86 metres. It sits on the border between Nepal and Tibet."
    };
  }

  if (matchesAny(q, ["longest river", "biggest river"])) {
    return {
      title: "Longest river",
      direct: "The Nile (~6,650 km)",
      text: "The Nile in Africa is generally recognised as the world's longest river at approximately 6,650 kilometres, flowing north through 11 countries."
    };
  }

  if (matchesAny(q, ["deepest ocean", "deepest point", "mariana trench"])) {
    return {
      title: "Deepest point in the ocean",
      direct: "Mariana Trench — ~11,000 m",
      text: "The Challenger Deep in the Mariana Trench in the Pacific Ocean is the deepest known point on Earth, at approximately 11,000 metres below sea level."
    };
  }

  /* History */
  if (matchesAny(q, ["atatürk born", "when was atatürk born", "atatürk birth"])) {
    return {
      title: "Mustafa Kemal Atatürk",
      direct: "Born in 1881",
      text: "Mustafa Kemal Atatürk was born in 1881 in Salonica (now Thessaloniki, Greece), then part of the Ottoman Empire. He founded the Republic of Turkey in 1923 and served as its first president."
    };
  }

  if (matchesAny(q, ["when was einstein born", "einstein born", "einstein birth"])) {
    return {
      title: "Albert Einstein",
      direct: "Born 14 March 1879",
      text: "Albert Einstein was born on 14 March 1879 in Ulm, in the Kingdom of Württemberg in the German Empire. He developed the theory of relativity."
    };
  }

  /* Science */
  if (matchesAny(q, ["how many bones", "bones in human body", "bones in body"])) {
    return {
      title: "Bones in the human body",
      direct: "206 bones",
      text: "An adult human body has 206 bones. Babies are born with around 270 bones, but many of them fuse together as the body grows."
    };
  }

  if (matchesAny(q, ["how many planets", "planets in solar system", "number of planets"])) {
    return {
      title: "Planets in the Solar System",
      direct: "8 planets",
      text: "There are 8 recognised planets in the Solar System: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Pluto was reclassified as a dwarf planet in 2006."
    };
  }

  if (matchesAny(q, ["how far is the moon", "distance to moon", "moon distance"])) {
    return {
      title: "Distance from Earth to the Moon",
      direct: "~384,400 km on average",
      text: "The Moon orbits Earth at an average distance of 384,400 kilometres. Because the orbit is elliptical, the actual distance varies between about 356,000 km (closest) and 406,000 km (farthest)."
    };
  }

  if (matchesAny(q, ["how far is the sun", "distance to sun", "sun distance"])) {
    return {
      title: "Distance from Earth to the Sun",
      direct: "~149.6 million km",
      text: "Earth orbits the Sun at an average distance of about 149.6 million kilometres, also defined as 1 Astronomical Unit (AU). Light from the Sun takes about 8 minutes and 20 seconds to reach Earth."
    };
  }

  /* Check if it matches a named fact */
  const fact = findFact(q);

  if (fact && (q === normalize(fact.name) || matchesAny(q, ["what is", "who is", "tell me about"]))) {
    return {
      title: fact.name,
      direct: fact.name,
      text:  fact.summary || `${fact.name} is recorded in the built-in fact database.`
    };
  }

  return null;
}

/* Helper: check if the query contains any of the given phrases */
function matchesAny(query, phrases) {
  return phrases.some(phrase => query.includes(phrase));
}


/* =====================================================
   14. COMPARISON HANDLING
   ===================================================== */

async function handleComparison(query) {
  showLoading("Detecting the two things to compare…");

  const parts = splitComparisonQuestion(query);

  if (parts.length < 2) {
    showComparisonHelp();
    return;
  }

  const itemA = parts[0];
  const itemB = parts[1];

  showLoading("Checking built-in data…");

  const factA = findFact(itemA);
  const factB = findFact(itemB);

  if (factA && factB) {
    const judgement = compareFacts(query, factA, factB);

    showComparisonResult({
      direct:      judgement.direct,
      explanation: judgement.explanation,
      item1Name:   factA.name,
      item2Name:   factB.name,
      item1Text:   factA.summary || "",
      item2Text:   factB.summary || ""
    });

    return;
  }

  showLoading("Searching Wikipedia for both topics…");

  const wikiA = factA
    ? factToWikiLike(factA)
    : await getBestWikipediaSummary(itemA).catch(() => ({}));

  const wikiB = factB
    ? factToWikiLike(factB)
    : await getBestWikipediaSummary(itemB).catch(() => ({}));

  const judgement = compareWikiResults(query, wikiA, wikiB);

  showComparisonResult({
    direct:      judgement.direct,
    explanation: judgement.explanation,
    item1Name:   wikiA.title || itemA,
    item2Name:   wikiB.title || itemB,
    item1Text:   wikiA.extract || "No summary found.",
    item2Text:   wikiB.extract || "No summary found."
  });
}

function showComparisonResult(data) {
  stopLoading("Comparison complete");

  resultSection.classList.remove("hidden");
  comparisonSection.classList.remove("hidden");

  answerTitle.textContent = "Comparison result";

  directAnswerBox.classList.remove("hidden");
  directAnswer.textContent = data.direct;

  answerText.textContent = data.explanation;

  compare1Title.textContent = data.item1Name;
  compare1Text.textContent  = data.item1Text;
  compare2Title.textContent = data.item2Name;
  compare2Text.textContent  = data.item2Text;

  extraContent.innerHTML =
    `<p class="small-note">
       <strong>Note:</strong> Comparisons use built-in data when available
       and Wikipedia summaries as a backup.
     </p>`;

  speak(`${data.direct}. ${data.explanation}`);
}


/* =====================================================
   15. COMPARISON LOGIC
   ===================================================== */

function compareFacts(query, a, b) {
  const intent = getComparisonIntent(query);

  switch (intent) {
    case "bigger":
      return compareByHigher(a, b, "diameterKm", "km in diameter", "bigger");

    case "smaller":
      return compareByLower(a, b, "diameterKm", "km in diameter", "smaller");

    case "heavier":
      return compareByHigher(a, b, "massKg", "kg in mass", "heavier");

    case "lighter":
      return compareByLower(a, b, "massKg", "kg in mass", "lighter");

    case "faster":
      if (hasNumber(a.zeroTo100Sec) && hasNumber(b.zeroTo100Sec)) {
        return compareByLower(a, b, "zeroTo100Sec", "seconds from 0–100 km/h", "faster");
      }
      if (hasNumber(a.topSpeedKmh) && hasNumber(b.topSpeedKmh)) {
        return compareByHigher(a, b, "topSpeedKmh", "km/h top speed", "faster");
      }
      return missingData(a, b, "faster");

    case "morePowerful":
      return compareByHigher(a, b, "powerHp", "horsepower", "more powerful");

    case "newer":
      return compareByHigher(a, b, "releaseYear", "release year", "newer");

    case "older":
      return compareByLower(a, b, "releaseYear", "release year", "older");

    case "fartherFromSun":
      return compareByHigher(a, b, "distanceFromSunKm", "km from the Sun", "farther from the Sun");

    case "closerToSun":
      return compareByLower(a, b, "distanceFromSunKm", "km from the Sun", "closer to the Sun");

    case "moreMoons":
      return compareByHigher(a, b, "moons", "moons", "more moons");

    case "better":
      return {
        direct: "It depends on what you mean by better.",
        explanation: `${a.name} and ${b.name} can be compared in many ways — speed, size, power, age, or purpose. Try asking a more specific question.`
      };

    default:
      return {
        direct: `I found ${a.name} and ${b.name}.`,
        explanation: "Try asking which is bigger, faster, older, newer, heavier, lighter, or more powerful."
      };
  }
}

function compareByHigher(a, b, key, unit, word) {
  if (!hasNumber(a[key]) || !hasNumber(b[key])) return missingData(a, b, word);
  return compareNumbers(a, b, a[key], b[key], unit, word, "higher");
}

function compareByLower(a, b, key, unit, word) {
  if (!hasNumber(a[key]) || !hasNumber(b[key])) return missingData(a, b, word);
  return compareNumbers(a, b, a[key], b[key], unit, word, "lower");
}

function compareNumbers(a, b, valueA, valueB, unit, word, direction) {
  if (valueA === valueB) {
    return {
      direct: `${a.name} and ${b.name} are equal in this category.`,
      explanation: `Both have the same value: ${formatNumber(valueA)} ${unit}.`
    };
  }

  const aWins = direction === "higher" ? valueA > valueB : valueA < valueB;

  const winner      = aWins ? a : b;
  const loser       = aWins ? b : a;
  const winnerValue = aWins ? valueA : valueB;
  const loserValue  = aWins ? valueB : valueA;

  return {
    direct: `${winner.name} is ${word} than ${loser.name}.`,
    explanation:
      `${winner.name} has ${formatNumber(winnerValue)} ${unit}, ` +
      `while ${loser.name} has ${formatNumber(loserValue)} ${unit}.`
  };
}

function missingData(a, b, word) {
  return {
    direct: `I cannot confidently decide which is ${word}.`,
    explanation: `I found ${a.name} and ${b.name} in the database, but I do not have the exact data needed for this comparison.`
  };
}


/* =====================================================
   16. WIKIPEDIA COMPARISON FALLBACK
   ===================================================== */

function compareWikiResults(query, wikiA, wikiB) {
  const intent = getComparisonIntent(query);

  const nameA = wikiA.title || "First option";
  const nameB = wikiB.title || "Second option";
  const textA = wikiA.extract || "";
  const textB = wikiB.extract || "";

  /* Year-based comparison */
  if (intent === "older" || intent === "newer") {
    const yearA = extractYear(textA);
    const yearB = extractYear(textB);

    if (yearA && yearB) {
      const aWins = intent === "older" ? yearA < yearB : yearA > yearB;
      const word  = intent === "older" ? "older" : "newer";

      return aWins
        ? { direct: `${nameA} is ${word} than ${nameB}.`, explanation: `${nameA} is associated with ${yearA}, while ${nameB} is associated with ${yearB}.` }
        : { direct: `${nameB} is ${word} than ${nameA}.`, explanation: `${nameB} is associated with ${yearB}, while ${nameA} is associated with ${yearA}.` };
    }
  }

  /* Number-based fallback */
  const numberA = extractUsefulNumber(textA);
  const numberB = extractUsefulNumber(textB);

  if (numberA !== null && numberB !== null) {
    const higherWins = ["bigger", "heavier", "faster", "morePowerful"].includes(intent);
    const lowerWins  = ["smaller", "lighter"].includes(intent);
    const word       = intentToWord(intent);

    if (higherWins) {
      return numberA > numberB
        ? { direct: `${nameA} is probably ${word} than ${nameB}.`, explanation: `${nameA} has the higher figure (${numberA}) compared to ${nameB} (${numberB}).` }
        : { direct: `${nameB} is probably ${word} than ${nameA}.`, explanation: `${nameB} has the higher figure (${numberB}) compared to ${nameA} (${numberA}).` };
    }

    if (lowerWins) {
      return numberA < numberB
        ? { direct: `${nameA} is probably ${word} than ${nameB}.`, explanation: `${nameA} has the lower figure (${numberA}) compared to ${nameB} (${numberB}).` }
        : { direct: `${nameB} is probably ${word} than ${nameA}.`, explanation: `${nameB} has the lower figure (${numberB}) compared to ${nameA} (${numberA}).` };
    }
  }

  if (intent === "better") {
    return {
      direct: "It depends on what you mean by better.",
      explanation: `${nameA} and ${nameB} can be compared in many ways. Try a more specific question.`
    };
  }

  return {
    direct: "I found both topics but cannot make a confident judgement.",
    explanation: `I found information on ${nameA} and ${nameB}, but not enough structured data to decide a winner.`
  };
}

function intentToWord(intent) {
  const map = {
    bigger: "bigger",
    smaller: "smaller",
    heavier: "heavier",
    lighter: "lighter",
    faster: "faster",
    morePowerful: "more powerful",
    newer: "newer",
    older: "older"
  };
  return map[intent] || intent;
}


/* =====================================================
   17. COMPARISON INTENT DETECTION
   ===================================================== */

function getComparisonIntent(query) {
  const q = normalize(query);

  if (matchesAny(q, ["bigger", "larger", "greater", "biggest", "largest"])) return "bigger";
  if (matchesAny(q, ["smaller", "smallest", "tinier", "tiniest"]))          return "smaller";
  if (matchesAny(q, ["heavier", "more massive", "weighs more"]))             return "heavier";
  if (matchesAny(q, ["lighter", "weighs less"]))                             return "lighter";
  if (matchesAny(q, ["faster", "quicker", "higher speed", "more speed"]))    return "faster";
  if (matchesAny(q, ["more powerful", "stronger", "horsepower", "more hp"])) return "morePowerful";
  if (matchesAny(q, ["newer", "younger", "more recent", "latest"]))          return "newer";
  if (matchesAny(q, ["older", "earlier", "oldest"]))                         return "older";
  if (matchesAny(q, ["more moons", "most moons"]))                           return "moreMoons";
  if (matchesAny(q, ["farther from the sun", "further from the sun"]))       return "fartherFromSun";
  if (matchesAny(q, ["closer to the sun"]))                                  return "closerToSun";
  if (matchesAny(q, ["better", "best", "worse", "worst"]))                   return "better";

  return "unknown";
}


/* =====================================================
   18. FACT HELPERS
   ===================================================== */

function findFact(text) {
  const q = normalize(text);

  if (FACTS[q]) return resolveFact(FACTS[q]);

  let bestKey = "";
  let bestLen = 0;

  Object.keys(FACTS).forEach(key => {
    if ((q.includes(key) || key.includes(q)) && key.length > bestLen) {
      bestKey = key;
      bestLen = key.length;
    }
  });

  return bestKey ? resolveFact(FACTS[bestKey]) : null;
}

function resolveFact(fact) {
  if (fact.aliasOf) return FACTS[fact.aliasOf] || null;
  return fact;
}

function factToWikiLike(fact) {
  return {
    title:   fact.name,
    extract: fact.summary || "",
    url:     ""
  };
}


/* =====================================================
   19. COMPARISON QUESTION DETECTION & SPLITTING
   ===================================================== */

function isComparisonQuestion(query) {
  const q = normalize(query);

  return (
    q.includes(" vs ")       ||
    q.includes(" versus ")   ||
    q.startsWith("compare ") ||
    q.includes(" compare ")  ||
    q.includes("which is")   ||
    q.includes("which one")  ||
    q.includes(" or ")
  );
}

function splitComparisonQuestion(query) {
  const removeWords = [
    "which one is", "which one", "which is", "compare",
    "bigger", "larger", "smaller", "faster", "quicker",
    "better", "older", "newer", "heavier", "lighter",
    "more powerful", "stronger", "more expensive", "cheaper",
    "more recent", "latest", "more moons"
  ];

  let cleaned = ` ${query} `;

  cleaned = cleaned.replace(/\?/g, " ").replace(/,/g, " ").replace(/:/g, " ");

  removeWords.forEach(word => {
    cleaned = cleaned.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi"), " ");
  });

  cleaned = cleaned.replace(/\s+/g, " ").trim();

  const parts = cleaned
    .split(/\s+vs\s+|\s+versus\s+|\s+or\s+|\s+and\s+/i)
    .map(p => p.trim())
    .filter(p => p.length > 1);

  return parts.length >= 2 ? [parts[0], parts[1]] : parts;
}


/* =====================================================
   20. WIKIPEDIA API
   ===================================================== */

async function getWikipediaSearchResults(query) {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
    encodeURIComponent(query) +
    "&format=json&origin=*&srlimit=8";

  const response = await fetch(url);

  if (!response.ok) throw new Error("Wikipedia search failed.");

  const data = await response.json();

  if (!data.query || !data.query.search) return [];

  return data.query.search.map(item => ({
    title:   item.title,
    snippet: stripHTML(item.snippet)
  }));
}

async function getBestWikipediaSummary(query) {
  const results = await getWikipediaSearchResults(query);

  if (!results.length) return {};

  const bestTitle = results[0].title;

  const summaryUrl =
    "https://en.wikipedia.org/api/rest_v1/page/summary/" +
    encodeURIComponent(bestTitle);

  const response = await fetch(summaryUrl);

  if (!response.ok) throw new Error("Wikipedia summary fetch failed.");

  const data = await response.json();

  return {
    title:   data.title || bestTitle,
    extract: data.extract || "",
    url:
      data.content_urls?.desktop?.page || ""
  };
}


/* =====================================================
   21. DIRECT ANSWER EXTRACTION
   ===================================================== */

function extractDirectAnswer(query, text, title) {
  const q = normalize(query);
  let direct = "";
  let highlightedText = escapeHTML(text);

  if (matchesAny(q, ["when", "born", "birth", "founded", "established", "created"])) {
    const date = extractDate(text);
    if (date) {
      direct = date;
      highlightedText = highlightPhrase(text, date);
    }
  } else if (matchesAny(q, ["how many", "how much", "population", "how far", "how long", "how tall", "how big"])) {
    const number = extractUsefulNumber(text);
    if (number !== null) {
      direct = String(number);
      highlightedText = highlightPhrase(text, String(number));
    }
  } else if (matchesAny(q, ["where", "located", "location", "capital"])) {
    const place = extractPlace(text);
    if (place) {
      direct = place;
      highlightedText = highlightPhrase(text, place);
    }
  } else if (matchesAny(q, ["who is", "who was", "what is", "what are"])) {
    direct = title;
  }

  return { direct, highlightedText };
}

function extractDate(text) {
  const fullDate = text.match(
    /\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i
  );
  if (fullDate) return fullDate[0];

  const year = extractYear(text);
  return year ? String(year) : "";
}

function extractYear(text) {
  const match = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  return match ? Number(match[0]) : null;
}

function extractUsefulNumber(text) {
  const matches = text.match(/\b\d{1,3}(,\d{3})*(\.\d+)?\b|\b\d+(\.\d+)?\b/g);
  if (!matches) return null;

  const numbers = matches
    .map(n => Number(n.replace(/,/g, "")))
    .filter(n => !Number.isNaN(n));

  return numbers.length ? numbers[0] : null;
}

function extractPlace(text) {
  const match = text.match(
    /\b(in|at|from|near)\s+([A-Z][a-zA-ZÀ-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÿ]+){0,4})/
  );
  return match ? match[0] : "";
}


/* =====================================================
   22. DISPLAY — NORMAL RESULT
   ===================================================== */

function showNormalResult(data) {
  stopLoading("Answer found");

  resultSection.classList.remove("hidden");

  answerTitle.textContent = data.title || "Result";

  if (data.direct) {
    directAnswerBox.classList.remove("hidden");
    directAnswer.textContent = data.direct;
  } else {
    directAnswerBox.classList.add("hidden");
    directAnswer.textContent = "";
  }

  if (data.isHTML) {
    answerText.innerHTML = data.text;
  } else {
    answerText.textContent = data.text;
  }

  if (data.sourceUrl) {
    extraContent.innerHTML =
      `<a class="source-link" href="${data.sourceUrl}" target="_blank" rel="noopener noreferrer">
         Open Wikipedia article →
       </a>`;
  }

  speak(`${data.direct ? data.direct + ". " : ""}${stripHTML(data.text)}`);
}


/* =====================================================
   23. DISPLAY — RELATED RESULTS
   ===================================================== */

function showRelatedResults(results) {
  if (!results || !results.length) return;

  const heading = relatedSection.querySelector(".section-heading h2");
  const subtext  = relatedSection.querySelector(".section-heading p");

  if (heading) heading.textContent = "Related results";
  if (subtext)  subtext.textContent = "Click any result to search it directly.";

  relatedSection.classList.remove("hidden");
  relatedList.innerHTML = "";

  results.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "related-item";
    card.style.animation = `slideIn 0.28s ease ${index * 0.06}s both`;
    card.setAttribute("role", "listitem");

    const title   = document.createElement("h4");
    title.textContent = item.title;

    const snippet = document.createElement("p");
    snippet.textContent = item.snippet;

    card.appendChild(title);
    card.appendChild(snippet);

    card.addEventListener("click", () => {
      queryInput.value = item.title;
      search();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    relatedList.appendChild(card);
  });
}


/* =====================================================
   24. HISTORY
   ===================================================== */

function loadHistory() {
  try {
    searchHistory = JSON.parse(localStorage.getItem("arasSearchHistory") || "[]");
  } catch {
    searchHistory = [];
  }
}

function saveHistory(query) {
  searchHistory = searchHistory.filter(
    item => normalize(item) !== normalize(query)
  );
  searchHistory.unshift(query);

  if (searchHistory.length > 10) searchHistory.pop();

  localStorage.setItem("arasSearchHistory", JSON.stringify(searchHistory));

  renderHistory();
}

function clearHistory() {
  searchHistory = [];
  localStorage.removeItem("arasSearchHistory");
  renderHistory();
}

function renderHistory() {
  if (!historySection || !historyList) return;

  historyList.innerHTML = "";

  if (!searchHistory.length) {
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");

  searchHistory.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "history-item";
    button.textContent = item;
    button.setAttribute("role", "listitem");
    button.style.animation = `slideIn 0.25s ease ${index * 0.04}s both`;

    button.addEventListener("click", () => {
      queryInput.value = item;
      search();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    historyList.appendChild(button);
  });
}


/* =====================================================
   25. RANDOM FACT
   Picks a random entry from RANDOM_FACTS and shows it.
   Can be triggered externally or added as a button.
   ===================================================== */

function showRandomFact() {
  const fact = RANDOM_FACTS[Math.floor(Math.random() * RANDOM_FACTS.length)];

  resetUI();

  showNormalResult({
    title:     fact.title,
    direct:    fact.direct,
    text:      fact.text,
    sourceUrl: "",
    isHTML:    false
  });
}


/* =====================================================
   26. VOICE INPUT
   ===================================================== */

function setupVoiceSearch() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition || !voiceBtn) {
    if (voiceBtn) voiceBtn.style.display = "none";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang            = "en-US";
  recognition.continuous      = false;
  recognition.interimResults  = false;

  voiceBtn.addEventListener("click", () => {
    try {
      recognition.start();
      voiceBtn.classList.add("listening");
      voiceBtn.textContent = "🎙️";
      resultSection.classList.remove("hidden");
      loader.classList.remove("hidden");
      statusText.textContent = "Listening… speak now";
    } catch {
      statusText.textContent = "Voice search is already listening.";
    }
  });

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    queryInput.value = transcript;

    if (clearBtn) clearBtn.classList.remove("hidden");

    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
    search();
  };

  recognition.onerror = () => {
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
    loader.classList.add("hidden");
    statusText.textContent = "Voice search failed. Please try again.";
  };

  recognition.onend = () => {
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
  };
}


/* =====================================================
   27. VOICE OUTPUT
   ===================================================== */

function speak(text) {
  if (!speakEnabled) return;
  if (!("speechSynthesis" in window)) return;

  const clean = String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);

  if (!clean) return;

  lastSpokenText = clean;

  window.speechSynthesis.cancel();

  const utterance      = new SpeechSynthesisUtterance(clean);
  utterance.lang       = "en-US";
  utterance.rate       = 1.0;
  utterance.pitch      = 1.0;
  utterance.volume     = 1.0;

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}


/* =====================================================
   28. UI HELPERS
   ===================================================== */

function resetUI() {
  resultSection.classList.add("hidden");
  comparisonSection.classList.add("hidden");
  relatedSection.classList.add("hidden");

  loader.classList.add("hidden");
  statusText.textContent = "";

  answerTitle.textContent    = "";
  answerText.textContent     = "";
  directAnswer.textContent   = "";
  directAnswerBox.classList.add("hidden");

  extraContent.innerHTML = "";
  relatedList.innerHTML  = "";

  compare1Title.textContent = "";
  compare1Text.textContent  = "";
  compare2Title.textContent = "";
  compare2Text.textContent  = "";
}

function showLoading(message) {
  resultSection.classList.remove("hidden");
  loader.classList.remove("hidden");
  statusText.textContent = message;
  searchBtn.disabled = true;
}

function stopLoading(message) {
  loader.classList.add("hidden");
  statusText.textContent = message;
  searchBtn.disabled = false;
}

function showEmpty() {
  resetUI();
  resultSection.classList.remove("hidden");
  loader.classList.add("hidden");
  statusText.textContent  = "No query entered";
  answerTitle.textContent = "Type something first";
  answerText.textContent  = "Write a question or topic in the search bar, then press Search or hit Enter.";
}

function showNoResult(query) {
  stopLoading("No result found");
  resultSection.classList.remove("hidden");
  answerTitle.textContent = "No result found";
  answerText.textContent  =
    `I could not find a good result for: "${query}".\n\n` +
    `Try using different or more specific words. ` +
    `For comparisons, try the format: "Earth vs Mars" or "iPhone 15 vs iPhone 16".`;
}

function showComparisonHelp() {
  stopLoading("Comparison detected");
  resultSection.classList.remove("hidden");
  answerTitle.textContent = "I need two clear topics";
  answerText.textContent  =
    `Try writing comparisons like:\n` +
    `• Earth vs Mars\n` +
    `• BMW M4 vs BMW M5\n` +
    `• iPhone 15 vs iPhone 16\n` +
    `• PlayStation 5 vs Xbox Series X`;
}

function showError(message) {
  loader.classList.add("hidden");
  searchBtn.disabled = false;
  resultSection.classList.remove("hidden");
  statusText.textContent  = "Error";
  answerTitle.textContent = "Something went wrong";
  answerText.textContent  = message;
}


/* =====================================================
   29. TEXT HELPERS
   ===================================================== */

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[?.,:;!']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function escapeHTML(text) {
  return String(text)
    .replaceAll("&",  "&amp;")
    .replaceAll("<",  "&lt;")
    .replaceAll(">",  "&gt;")
    .replaceAll('"',  "&quot;")
    .replaceAll("'",  "&#039;");
}

function highlightPhrase(text, phrase) {
  if (!phrase) return escapeHTML(text);

  const safeText   = escapeHTML(text);
  const safePhrase = escapeRegExp(escapeHTML(phrase));
  const regex      = new RegExp(`(${safePhrase})`, "i");

  return safeText.replace(regex, "<mark>$1</mark>");
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

function formatNumber(num) {
  if (typeof num !== "number") return String(num);

  if (Math.abs(num) >= 1e15) return num.toExponential(2);
  if (Math.abs(num) >= 1e9)  return (num / 1e9).toFixed(2) + " billion";
  if (Math.abs(num) >= 1e6)  return (num / 1e6).toFixed(2) + " million";

  return num.toLocaleString();
}

