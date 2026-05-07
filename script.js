/* =====================================================
   ARAS SEARCH - SCRIPT.JS
   Full polished version
   Features:
   - Normal search
   - Wikipedia search
   - Built-in facts
   - Direct answers
   - Smart comparisons
   - Voice input
   - Voice output toggle
   - Search history
   - Related results
   ===================================================== */


/* =====================================================
   1. ELEMENTS
   ===================================================== */

const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const voiceBtn = document.getElementById("voiceBtn");
const speakToggleBtn = document.getElementById("speakToggleBtn");

const resultSection = document.getElementById("result");
const comparisonSection = document.getElementById("comparison");
const relatedSection = document.getElementById("related");
const historySection = document.getElementById("history");

const loader = document.getElementById("loader");
const statusText = document.getElementById("statusText");

const answerTitle = document.getElementById("answerTitle");
const answerText = document.getElementById("answerText");

const directAnswerBox = document.getElementById("directAnswerBox");
const directAnswer = document.getElementById("directAnswer");

const extraContent = document.getElementById("extraContent");

const compare1Title = document.getElementById("compare1Title");
const compare1Text = document.getElementById("compare1Text");
const compare2Title = document.getElementById("compare2Title");
const compare2Text = document.getElementById("compare2Text");

const relatedList = document.getElementById("relatedList");
const historyList = document.getElementById("historyList");

const chips = document.querySelectorAll(".chip");


/* =====================================================
   2. APP STATE
   ===================================================== */

let searchHistory = [];
let speakEnabled = false;
let isSearching = false;
let lastSpokenText = "";


/* =====================================================
   3. BUILT-IN FACT DATABASE
   ===================================================== */

const FACTS = {
  earth: {
    name: "Earth",
    category: "planet",
    diameterKm: 12742,
    massKg: 5.972e24,
    distanceFromSunKm: 149600000,
    orbitalPeriodDays: 365.25,
    summary: "Earth is the third planet from the Sun and the only known astronomical object where life is known to exist."
  },

  mars: {
    name: "Mars",
    category: "planet",
    diameterKm: 6779,
    massKg: 6.39e23,
    distanceFromSunKm: 227900000,
    orbitalPeriodDays: 687,
    summary: "Mars is the fourth planet from the Sun. It is often called the Red Planet because of its reddish appearance."
  },

  jupiter: {
    name: "Jupiter",
    category: "planet",
    diameterKm: 139820,
    massKg: 1.898e27,
    distanceFromSunKm: 778500000,
    orbitalPeriodDays: 4333,
    summary: "Jupiter is the largest planet in the Solar System and is a gas giant."
  },

  saturn: {
    name: "Saturn",
    category: "planet",
    diameterKm: 116460,
    massKg: 5.683e26,
    distanceFromSunKm: 1434000000,
    orbitalPeriodDays: 10759,
    summary: "Saturn is a gas giant known for its large and bright ring system."
  },

  mercury: {
    name: "Mercury",
    category: "planet",
    diameterKm: 4879,
    massKg: 3.285e23,
    distanceFromSunKm: 57900000,
    orbitalPeriodDays: 88,
    summary: "Mercury is the smallest planet in the Solar System and the closest planet to the Sun."
  },

  venus: {
    name: "Venus",
    category: "planet",
    diameterKm: 12104,
    massKg: 4.867e24,
    distanceFromSunKm: 108200000,
    orbitalPeriodDays: 225,
    summary: "Venus is the second planet from the Sun and has a very hot, dense atmosphere."
  },

  uranus: {
    name: "Uranus",
    category: "planet",
    diameterKm: 50724,
    massKg: 8.681e25,
    distanceFromSunKm: 2871000000,
    orbitalPeriodDays: 30687,
    summary: "Uranus is an ice giant planet known for rotating on its side."
  },

  neptune: {
    name: "Neptune",
    category: "planet",
    diameterKm: 49244,
    massKg: 1.024e26,
    distanceFromSunKm: 4495000000,
    orbitalPeriodDays: 60190,
    summary: "Neptune is the farthest known planet from the Sun in the Solar System."
  },

  moon: {
    name: "Moon",
    category: "moon",
    diameterKm: 3474,
    massKg: 7.342e22,
    summary: "The Moon is Earth's only natural satellite."
  },

  sun: {
    name: "Sun",
    category: "star",
    diameterKm: 1392700,
    massKg: 1.989e30,
    summary: "The Sun is the star at the center of the Solar System."
  },

  "bmw m4": {
    name: "BMW M4",
    category: "car",
    topSpeedKmh: 290,
    zeroTo100Sec: 3.5,
    powerHp: 503,
    summary: "The BMW M4 is a high-performance coupe made by BMW M."
  },

  "bmw m5": {
    name: "BMW M5",
    category: "car",
    topSpeedKmh: 305,
    zeroTo100Sec: 3.3,
    powerHp: 617,
    summary: "The BMW M5 is a high-performance sports sedan made by BMW M."
  },

  "bmw m4 cs": {
    name: "BMW M4 CS",
    category: "car",
    topSpeedKmh: 302,
    zeroTo100Sec: 3.4,
    powerHp: 543,
    summary: "The BMW M4 CS is a lighter, more performance-focused version of the BMW M4."
  },

  "mercedes amg gt black series": {
    name: "Mercedes-AMG GT Black Series",
    category: "car",
    topSpeedKmh: 325,
    zeroTo100Sec: 3.2,
    powerHp: 720,
    summary: "The Mercedes-AMG GT Black Series is a high-performance track-focused sports car."
  },

  "amg gt black series": {
    aliasOf: "mercedes amg gt black series"
  },

  "iphone 14": {
    name: "iPhone 14",
    category: "phone",
    releaseYear: 2022,
    summary: "The iPhone 14 is a smartphone released by Apple in 2022."
  },

  "iphone 15": {
    name: "iPhone 15",
    category: "phone",
    releaseYear: 2023,
    summary: "The iPhone 15 is a smartphone released by Apple in 2023."
  },

  "iphone 16": {
    name: "iPhone 16",
    category: "phone",
    releaseYear: 2024,
    summary: "The iPhone 16 is a smartphone released by Apple in 2024."
  },

  ps4: {
    aliasOf: "playstation 4"
  },

  ps5: {
    aliasOf: "playstation 5"
  },

  "playstation 4": {
    name: "PlayStation 4",
    category: "console",
    releaseYear: 2013,
    summary: "The PlayStation 4 is a video game console released by Sony in 2013."
  },

  "playstation 5": {
    name: "PlayStation 5",
    category: "console",
    releaseYear: 2020,
    summary: "The PlayStation 5 is a video game console released by Sony in 2020."
  }
};


/* =====================================================
   4. INIT
   ===================================================== */

init();

function init() {
  loadSettings();
  loadHistory();
  bindEvents();
  setupVoiceSearch();
  updateSpeakButton();
  renderHistory();

  console.log("Aras Search loaded successfully.");
}

function bindEvents() {
  searchBtn.addEventListener("click", search);

  queryInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      search();
    }
  });

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      queryInput.value = chip.dataset.query;
      search();
    });
  });

  speakToggleBtn.addEventListener("click", toggleSpeech);
}


/* =====================================================
   5. SETTINGS
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
  } else if (lastSpokenText) {
    speak("Voice answers are now on.");
  }
}

function updateSpeakButton() {
  if (!speakToggleBtn) return;

  if (speakEnabled) {
    speakToggleBtn.textContent = "🔊";
    speakToggleBtn.classList.add("on");
    speakToggleBtn.title = "Voice answers on";
  } else {
    speakToggleBtn.textContent = "🔇";
    speakToggleBtn.classList.remove("on");
    speakToggleBtn.title = "Voice answers off";
  }
}


/* =====================================================
   6. MAIN SEARCH
   ===================================================== */

async function search() {
  const query = queryInput.value.trim();

  if (!query) {
    showEmpty();
    return;
  }

  if (isSearching) return;

  isSearching = true;
  saveHistory(query);
  resetUI();
  showLoading("Understanding your question...");

  try {
    if (isComparisonQuestion(query)) {
      await handleComparison(query);
    } else {
      await handleNormalSearch(query);
    }
  } catch (error) {
    showError(error.message);
  } finally {
    isSearching = false;
    searchBtn.disabled = false;
  }
}


/* =====================================================
   7. NORMAL SEARCH
   ===================================================== */

async function handleNormalSearch(query) {
  showLoading("Looking for a direct answer...");

  const builtIn = getBuiltInAnswer(query);

  if (builtIn) {
    showNormalResult({
      title: builtIn.title,
      direct: builtIn.direct,
      text: builtIn.text,
      sourceUrl: "",
      isHTML: false
    });

    return;
  }

  showLoading("Searching Wikipedia...");

  const wiki = await getBestWikipediaSummary(query);

  if (!wiki || !wiki.extract) {
    showNoResult(query);
    return;
  }

  const extracted = extractDirectAnswer(query, wiki.extract, wiki.title);

  showNormalResult({
    title: wiki.title,
    direct: extracted.direct,
    text: extracted.highlightedText || wiki.extract,
    sourceUrl: wiki.url,
    isHTML: true
  });

  const related = await getWikipediaSearchResults(query);

  if (related.length > 1) {
    showRelatedResults(related.slice(1, 6));
  }
}


/* =====================================================
   8. BUILT-IN ANSWERS
   ===================================================== */

function getBuiltInAnswer(query) {
  const q = normalize(query);

  if (q.includes("value of pi") || q.includes("value of π")) {
    return {
      title: "Pi",
      direct: "π ≈ 3.14159",
      text: "Pi is the ratio of a circle's circumference to its diameter. Its value begins with 3.14159 and continues forever."
    };
  }

  if (q.includes("speed of light")) {
    return {
      title: "Speed of light",
      direct: "299,792,458 metres per second",
      text: "The speed of light in vacuum is exactly 299,792,458 metres per second."
    };
  }

  if (q.includes("speed of sound")) {
    return {
      title: "Speed of sound",
      direct: "About 343 metres per second",
      text: "The speed of sound in air at about 20°C is around 343 metres per second."
    };
  }

  if (
    q.includes("atatürk") &&
    (q.includes("born") || q.includes("birth") || q.includes("when"))
  ) {
    return {
      title: "Mustafa Kemal Atatürk",
      direct: "1881",
      text: "Mustafa Kemal Atatürk was born in 1881 in Salonica, then part of the Ottoman Empire."
    };
  }

  const fact = findFact(q);

  if (fact && (q === normalize(fact.name) || q.includes("what is") || q.includes("who is"))) {
    return {
      title: fact.name,
      direct: fact.name,
      text: fact.summary || `${fact.name} is in the built-in fact database.`
    };
  }

  return null;
}


/* =====================================================
   9. COMPARISON HANDLING
   ===================================================== */

async function handleComparison(query) {
  showLoading("Detecting the two things to compare...");

  const parts = splitComparisonQuestion(query);

  if (parts.length < 2) {
    showComparisonHelp();
    return;
  }

  const itemA = parts[0];
  const itemB = parts[1];

  showLoading("Checking built-in comparison data...");

  const factA = findFact(itemA);
  const factB = findFact(itemB);

  if (factA && factB) {
    const judgement = compareFacts(query, factA, factB);

    showComparisonResult({
      direct: judgement.direct,
      explanation: judgement.explanation,
      item1Name: factA.name,
      item2Name: factB.name,
      item1Text: factA.summary || "",
      item2Text: factB.summary || ""
    });

    return;
  }

  showLoading("Searching Wikipedia for both topics...");

  const wikiA = factA ? factToWikiLike(factA) : await getBestWikipediaSummary(itemA);
  const wikiB = factB ? factToWikiLike(factB) : await getBestWikipediaSummary(itemB);

  const judgement = compareWikiResults(query, wikiA, wikiB);

  showComparisonResult({
    direct: judgement.direct,
    explanation: judgement.explanation,
    item1Name: wikiA.title || itemA,
    item2Name: wikiB.title || itemB,
    item1Text: wikiA.extract || "No summary found.",
    item2Text: wikiB.extract || "No summary found."
  });
}

function showComparisonResult(data) {
  stopLoading("Comparison completed");

  resultSection.classList.remove("hidden");
  comparisonSection.classList.remove("hidden");

  answerTitle.textContent = "Comparison result";

  directAnswerBox.classList.remove("hidden");
  directAnswer.textContent = data.direct;

  answerText.textContent = data.explanation;

  compare1Title.textContent = data.item1Name;
  compare1Text.textContent = data.item1Text;

  compare2Title.textContent = data.item2Name;
  compare2Text.textContent = data.item2Text;

  extraContent.innerHTML =
    `<p class="small-note"><strong>Note:</strong> This app compares built-in data when possible and uses Wikipedia summaries as backup.</p>`;

  speak(`${data.direct}. ${data.explanation}`);
}


/* =====================================================
   10. COMPARISON LOGIC
   ===================================================== */

function compareFacts(query, a, b) {
  const intent = getComparisonIntent(query);

  if (intent === "bigger") {
    return compareByHigher(a, b, "diameterKm", "km diameter", "bigger");
  }

  if (intent === "smaller") {
    return compareByLower(a, b, "diameterKm", "km diameter", "smaller");
  }

  if (intent === "heavier") {
    return compareByHigher(a, b, "massKg", "kg mass", "heavier");
  }

  if (intent === "lighter") {
    return compareByLower(a, b, "massKg", "kg mass", "lighter");
  }

  if (intent === "faster") {
    if (hasNumber(a.zeroTo100Sec) && hasNumber(b.zeroTo100Sec)) {
      return compareByLower(a, b, "zeroTo100Sec", "seconds from 0 to 100 km/h", "faster");
    }

    if (hasNumber(a.topSpeedKmh) && hasNumber(b.topSpeedKmh)) {
      return compareByHigher(a, b, "topSpeedKmh", "km/h top speed", "faster");
    }

    return missingData(a, b, "faster");
  }

  if (intent === "morePowerful") {
    return compareByHigher(a, b, "powerHp", "horsepower", "more powerful");
  }

  if (intent === "newer") {
    return compareByHigher(a, b, "releaseYear", "release year", "newer");
  }

  if (intent === "older") {
    return compareByLower(a, b, "releaseYear", "release year", "older");
  }

  if (intent === "fartherFromSun") {
    return compareByHigher(a, b, "distanceFromSunKm", "km from the Sun", "farther from the Sun");
  }

  if (intent === "closerToSun") {
    return compareByLower(a, b, "distanceFromSunKm", "km from the Sun", "closer to the Sun");
  }

  if (intent === "better") {
    return {
      direct: "It depends on what you mean by better.",
      explanation: `${a.name} and ${b.name} can be compared by speed, size, power, price, age, or purpose. Try asking a more specific comparison.`
    };
  }

  return {
    direct: `I found ${a.name} and ${b.name}, but I need a clearer comparison category.`,
    explanation: "Try asking which is bigger, faster, older, newer, heavier, lighter, or more powerful."
  };
}

function compareByHigher(a, b, key, unit, word) {
  if (!hasNumber(a[key]) || !hasNumber(b[key])) {
    return missingData(a, b, word);
  }

  return compareNumbers(a, b, a[key], b[key], unit, word, "higher");
}

function compareByLower(a, b, key, unit, word) {
  if (!hasNumber(a[key]) || !hasNumber(b[key])) {
    return missingData(a, b, word);
  }

  return compareNumbers(a, b, a[key], b[key], unit, word, "lower");
}

function compareNumbers(a, b, valueA, valueB, unit, word, direction) {
  if (valueA === valueB) {
    return {
      direct: `${a.name} and ${b.name} are equal.`,
      explanation: `Both have the same value: ${formatNumber(valueA)} ${unit}.`
    };
  }

  let winner;
  let loser;
  let winnerValue;
  let loserValue;

  if (direction === "higher") {
    winner = valueA > valueB ? a : b;
    loser = valueA > valueB ? b : a;
    winnerValue = valueA > valueB ? valueA : valueB;
    loserValue = valueA > valueB ? valueB : valueA;
  } else {
    winner = valueA < valueB ? a : b;
    loser = valueA < valueB ? b : a;
    winnerValue = valueA < valueB ? valueA : valueB;
    loserValue = valueA < valueB ? valueB : valueA;
  }

  return {
    direct: `${winner.name} is ${word} than ${loser.name}.`,
    explanation: `${winner.name} wins because it has ${formatNumber(winnerValue)} ${unit}, while ${loser.name} has ${formatNumber(loserValue)} ${unit}.`
  };
}

function missingData(a, b, word) {
  return {
    direct: `I cannot confidently decide which is ${word}.`,
    explanation: `I found ${a.name} and ${b.name}, but I do not have the exact data needed for this comparison.`
  };
}


/* =====================================================
   11. WIKIPEDIA COMPARISON FALLBACK
   ===================================================== */

function compareWikiResults(query, wikiA, wikiB) {
  const intent = getComparisonIntent(query);

  const nameA = wikiA.title || "First option";
  const nameB = wikiB.title || "Second option";

  const textA = wikiA.extract || "";
  const textB = wikiB.extract || "";

  if (intent === "older" || intent === "newer") {
    const yearA = extractYear(textA);
    const yearB = extractYear(textB);

    if (yearA && yearB) {
      if (intent === "older") {
        return yearA < yearB
          ? {
              direct: `${nameA} is older than ${nameB}.`,
              explanation: `${nameA} is linked to ${yearA}, while ${nameB} is linked to ${yearB}.`
            }
          : {
              direct: `${nameB} is older than ${nameA}.`,
              explanation: `${nameB} is linked to ${yearB}, while ${nameA} is linked to ${yearA}.`
            };
      }

      return yearA > yearB
        ? {
            direct: `${nameA} is newer than ${nameB}.`,
            explanation: `${nameA} is linked to ${yearA}, while ${nameB} is linked to ${yearB}.`
          }
        : {
            direct: `${nameB} is newer than ${nameA}.`,
            explanation: `${nameB} is linked to ${yearB}, while ${nameA} is linked to ${yearA}.`
          };
    }
  }

  const numberA = extractUsefulNumber(textA);
  const numberB = extractUsefulNumber(textB);

  if (numberA !== null && numberB !== null) {
    const higherWins = ["bigger", "heavier", "faster", "morePowerful"].includes(intent);
    const lowerWins = ["smaller", "lighter"].includes(intent);

    if (higherWins) {
      return numberA > numberB
        ? {
            direct: `${nameA} is probably ${intentToWord(intent)} than ${nameB}.`,
            explanation: `${nameA} has the higher detected number: ${numberA}, while ${nameB} has ${numberB}.`
          }
        : {
            direct: `${nameB} is probably ${intentToWord(intent)} than ${nameA}.`,
            explanation: `${nameB} has the higher detected number: ${numberB}, while ${nameA} has ${numberA}.`
          };
    }

    if (lowerWins) {
      return numberA < numberB
        ? {
            direct: `${nameA} is probably ${intentToWord(intent)} than ${nameB}.`,
            explanation: `${nameA} has the lower detected number: ${numberA}, while ${nameB} has ${numberB}.`
          }
        : {
            direct: `${nameB} is probably ${intentToWord(intent)} than ${nameA}.`,
            explanation: `${nameB} has the lower detected number: ${numberB}, while ${nameA} has ${numberA}.`
          };
    }
  }

  if (intent === "better") {
    return {
      direct: "It depends on what you mean by better.",
      explanation: `${nameA} and ${nameB} can be compared in many different ways. Try asking a more specific question.`
    };
  }

  return {
    direct: "I found both topics, but I cannot confidently choose a winner.",
    explanation: `I found information about ${nameA} and ${nameB}, but not enough structured data to make a direct judgement.`
  };
}

function intentToWord(intent) {
  if (intent === "morePowerful") return "more powerful";
  return intent;
}


/* =====================================================
   12. INTENT DETECTION
   ===================================================== */

function getComparisonIntent(query) {
  const q = normalize(query);

  if (q.includes("bigger") || q.includes("larger") || q.includes("greater")) {
    return "bigger";
  }

  if (q.includes("smaller") || q.includes("smallest")) {
    return "smaller";
  }

  if (q.includes("heavier") || q.includes("more massive") || q.includes("weighs more")) {
    return "heavier";
  }

  if (q.includes("lighter") || q.includes("weighs less")) {
    return "lighter";
  }

  if (q.includes("faster") || q.includes("quicker") || q.includes("higher speed")) {
    return "faster";
  }

  if (q.includes("more powerful") || q.includes("stronger") || q.includes("horsepower")) {
    return "morePowerful";
  }

  if (q.includes("newer") || q.includes("younger") || q.includes("more recent")) {
    return "newer";
  }

  if (q.includes("older") || q.includes("earlier")) {
    return "older";
  }

  if (q.includes("farther from the sun") || q.includes("further from the sun")) {
    return "fartherFromSun";
  }

  if (q.includes("closer to the sun")) {
    return "closerToSun";
  }

  if (q.includes("better")) {
    return "better";
  }

  return "unknown";
}


/* =====================================================
   13. FACT HELPERS
   ===================================================== */

function findFact(text) {
  const q = normalize(text);

  if (FACTS[q]) {
    return resolveFact(FACTS[q]);
  }

  let bestKey = "";

  Object.keys(FACTS).forEach(key => {
    if (q.includes(key) || key.includes(q)) {
      if (key.length > bestKey.length) {
        bestKey = key;
      }
    }
  });

  return bestKey ? resolveFact(FACTS[bestKey]) : null;
}

function resolveFact(fact) {
  if (fact.aliasOf) {
    return FACTS[fact.aliasOf];
  }

  return fact;
}

function factToWikiLike(fact) {
  return {
    title: fact.name,
    extract: fact.summary || "",
    url: ""
  };
}


/* =====================================================
   14. COMPARISON QUESTION SPLITTING
   ===================================================== */

function isComparisonQuestion(query) {
  const q = normalize(query);

  return (
    q.includes(" vs ") ||
    q.includes(" versus ") ||
    q.startsWith("compare ") ||
    q.includes(" compare ") ||
    q.includes("which is") ||
    q.includes("which one") ||
    q.includes(" or ")
  );
}

function splitComparisonQuestion(query) {
  let cleaned = ` ${query} `;

  cleaned = cleaned
    .replace(/\?/g, " ")
    .replace(/,/g, " ")
    .replace(/:/g, " ")
    .replace(/which one is/gi, " ")
    .replace(/which one/gi, " ")
    .replace(/which is/gi, " ")
    .replace(/compare/gi, " ")
    .replace(/bigger/gi, " ")
    .replace(/larger/gi, " ")
    .replace(/smaller/gi, " ")
    .replace(/faster/gi, " ")
    .replace(/quicker/gi, " ")
    .replace(/better/gi, " ")
    .replace(/older/gi, " ")
    .replace(/newer/gi, " ")
    .replace(/heavier/gi, " ")
    .replace(/lighter/gi, " ")
    .replace(/more powerful/gi, " ")
    .replace(/stronger/gi, " ")
    .replace(/more expensive/gi, " ")
    .replace(/cheaper/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const parts = cleaned
    .split(/\s+vs\s+|\s+versus\s+|\s+or\s+|\s+and\s+/i)
    .map(part => part.trim())
    .filter(part => part.length > 1);

  if (parts.length >= 2) {
    return [parts[0], parts[1]];
  }

  return parts;
}


/* =====================================================
   15. WIKIPEDIA
   ===================================================== */

async function getWikipediaSearchResults(query) {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
    encodeURIComponent(query) +
    "&format=json&origin=*";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Wikipedia search failed.");
  }

  const data = await response.json();

  if (!data.query || !data.query.search) {
    return [];
  }

  return data.query.search.map(item => ({
    title: item.title,
    snippet: stripHTML(item.snippet)
  }));
}

async function getBestWikipediaSummary(query) {
  const results = await getWikipediaSearchResults(query);

  if (!results.length) {
    return {};
  }

  const bestTitle = results[0].title;

  const summaryUrl =
    "https://en.wikipedia.org/api/rest_v1/page/summary/" +
    encodeURIComponent(bestTitle);

  const response = await fetch(summaryUrl);

  if (!response.ok) {
    throw new Error("Wikipedia summary failed.");
  }

  const data = await response.json();

  return {
    title: data.title || bestTitle,
    extract: data.extract || "",
    url:
      data.content_urls &&
      data.content_urls.desktop &&
      data.content_urls.desktop.page
        ? data.content_urls.desktop.page
        : ""
  };
}


/* =====================================================
   16. DIRECT ANSWERS
   ===================================================== */

function extractDirectAnswer(query, text, title) {
  const q = normalize(query);

  let direct = "";
  let highlightedText = escapeHTML(text);

  if (q.includes("when") || q.includes("born") || q.includes("birth")) {
    const date = extractDate(text);

    if (date) {
      direct = date;
      highlightedText = highlightPhrase(text, date);
    }
  } else if (q.includes("how many") || q.includes("how much") || q.includes("population")) {
    const number = extractUsefulNumber(text);

    if (number !== null) {
      direct = String(number);
      highlightedText = highlightPhrase(text, String(number));
    }
  } else if (q.includes("where")) {
    const place = extractPlace(text);

    if (place) {
      direct = place;
      highlightedText = highlightPhrase(text, place);
    }
  } else if (q.includes("who is") || q.includes("what is")) {
    direct = title;
  }

  return {
    direct,
    highlightedText
  };
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
    .map(num => Number(num.replace(/,/g, "")))
    .filter(num => !Number.isNaN(num));

  return numbers.length ? numbers[0] : null;
}

function extractPlace(text) {
  const match = text.match(
    /\b(in|at|from|near)\s+([A-Z][a-zA-ZÀ-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÿ]+){0,4})/
  );

  return match ? match[0] : "";
}


/* =====================================================
   17. DISPLAY NORMAL RESULT
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
      `<a class="source-link" href="${data.sourceUrl}" target="_blank">Open source →</a>`;
  }

  speak(`${data.direct ? data.direct + ". " : ""}${stripHTML(data.text)}`);
}


/* =====================================================
   18. RELATED RESULTS
   ===================================================== */

function showRelatedResults(results) {
  if (!results || !results.length) return;

  relatedSection.classList.remove("hidden");
  relatedList.innerHTML = "";

  results.forEach(item => {
    const card = document.createElement("div");
    card.className = "related-item";

    const title = document.createElement("h4");
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
   19. HISTORY
   ===================================================== */

function loadHistory() {
  try {
    searchHistory = JSON.parse(localStorage.getItem("arasSearchHistory") || "[]");
  } catch {
    searchHistory = [];
  }
}

function saveHistory(query) {
  searchHistory = searchHistory.filter(item => normalize(item) !== normalize(query));
  searchHistory.unshift(query);

  if (searchHistory.length > 8) {
    searchHistory.pop();
  }

  localStorage.setItem("arasSearchHistory", JSON.stringify(searchHistory));

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

  searchHistory.forEach(item => {
    const button = document.createElement("button");
    button.className = "history-item";
    button.textContent = item;

    button.addEventListener("click", () => {
      queryInput.value = item;
      search();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    historyList.appendChild(button);
  });
}


/* =====================================================
   20. VOICE INPUT
   ===================================================== */

function setupVoiceSearch() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition || !voiceBtn) {
    if (voiceBtn) voiceBtn.style.display = "none";
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.addEventListener("click", () => {
    try {
      recognition.start();
      voiceBtn.classList.add("listening");
      voiceBtn.textContent = "🎙️";
      resultSection.classList.remove("hidden");
      loader.style.display = "block";
      statusText.textContent = "Listening...";
    } catch {
      statusText.textContent = "Voice search is already listening.";
    }
  });

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    queryInput.value = transcript;
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
    search();
  };

  recognition.onerror = () => {
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
    loader.style.display = "none";
    statusText.textContent = "Voice search failed. Try again.";
  };

  recognition.onend = () => {
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
  };
}


/* =====================================================
   21. VOICE OUTPUT
   ===================================================== */

function speak(text) {
  if (!speakEnabled) return;
  if (!("speechSynthesis" in window)) return;

  const clean = String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return;

  lastSpokenText = clean;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(clean);

  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}


/* =====================================================
   22. UI HELPERS
   ===================================================== */

function resetUI() {
  resultSection.classList.add("hidden");
  comparisonSection.classList.add("hidden");
  relatedSection.classList.add("hidden");

  loader.style.display = "none";
  statusText.textContent = "";

  answerTitle.textContent = "";
  answerText.textContent = "";
  directAnswer.textContent = "";
  directAnswerBox.classList.add("hidden");

  extraContent.innerHTML = "";
  relatedList.innerHTML = "";

  compare1Title.textContent = "";
  compare1Text.textContent = "";
  compare2Title.textContent = "";
  compare2Text.textContent = "";
}

function showLoading(message) {
  resultSection.classList.remove("hidden");
  loader.style.display = "block";
  statusText.textContent = message;
  searchBtn.disabled = true;
}

function stopLoading(message) {
  loader.style.display = "none";
  statusText.textContent = message;
  searchBtn.disabled = false;
}

function showEmpty() {
  resetUI();
  resultSection.classList.remove("hidden");
  loader.style.display = "none";
  statusText.textContent = "No search entered";
  answerTitle.textContent = "Type something first";
  answerText.textContent = "Write a question or topic, then press Search.";
}

function showNoResult(query) {
  stopLoading("No result found");
  resultSection.classList.remove("hidden");
  answerTitle.textContent = "No result";
  answerText.textContent = `I could not find a good result for: ${query}. Try using more specific words.`;
}

function showComparisonHelp() {
  stopLoading("Comparison detected");
  resultSection.classList.remove("hidden");
  answerTitle.textContent = "I need two clear things";
  answerText.textContent = "Try writing your comparison like: Earth vs Mars, BMW M4 vs BMW M5, or iPhone 15 vs iPhone 14.";
}

function showError(message) {
  loader.style.display = "none";
  searchBtn.disabled = false;
  resultSection.classList.remove("hidden");
  statusText.textContent = "Error";
  answerTitle.textContent = "Something went wrong";
  answerText.textContent = message;
}


/* =====================================================
   23. TEXT HELPERS
   ===================================================== */

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[?.,:;!]/g, " ")
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
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlightPhrase(text, phrase) {
  if (!phrase) return escapeHTML(text);

  const safeText = escapeHTML(text);
  const safePhrase = escapeRegExp(escapeHTML(phrase));

  const regex = new RegExp(`(${safePhrase})`, "i");

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

  if (Math.abs(num) >= 1000000) {
    return num.toExponential(3);
  }

  return num.toLocaleString();
}
