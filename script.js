// =====================================================
// ARAS SMART SEARCH ENGINE
// Full replacement script.js
// Includes:
// - Normal search
// - Wikipedia fallback
// - Built-in facts
// - Smart comparisons
// - Direct answers
// - Highlighting
// - Related results
// - Search history
// - Voice search
// =====================================================


// =====================================================
// 1. HTML ELEMENTS
// =====================================================

const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");

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

const suggestionButtons = document.querySelectorAll(".suggestion");


// =====================================================
// 2. CREATE VOICE BUTTON AUTOMATICALLY
// =====================================================

let voiceBtn = document.getElementById("voiceBtn");

if (!voiceBtn && searchBtn) {
  voiceBtn = document.createElement("button");
  voiceBtn.id = "voiceBtn";
  voiceBtn.type = "button";
  voiceBtn.textContent = "🎤";
  voiceBtn.title = "Voice search";

  searchBtn.insertAdjacentElement("afterend", voiceBtn);
}


// =====================================================
// 3. BUILT-IN FACT DATABASE
// =====================================================

const FACTS = {
  "earth": {
    name: "Earth",
    type: "planet",
    diameterKm: 12742,
    massKg: 5.972e24,
    distanceFromSunKm: 149600000,
    summary: "Earth is the third planet from the Sun and the only known planet with life."
  },

  "mars": {
    name: "Mars",
    type: "planet",
    diameterKm: 6779,
    massKg: 6.39e23,
    distanceFromSunKm: 227900000,
    summary: "Mars is the fourth planet from the Sun and is often called the Red Planet."
  },

  "jupiter": {
    name: "Jupiter",
    type: "planet",
    diameterKm: 139820,
    massKg: 1.898e27,
    distanceFromSunKm: 778500000,
    summary: "Jupiter is the largest planet in the Solar System."
  },

  "saturn": {
    name: "Saturn",
    type: "planet",
    diameterKm: 116460,
    massKg: 5.683e26,
    distanceFromSunKm: 1434000000,
    summary: "Saturn is a gas giant famous for its ring system."
  },

  "mercury": {
    name: "Mercury",
    type: "planet",
    diameterKm: 4879,
    massKg: 3.285e23,
    distanceFromSunKm: 57900000,
    summary: "Mercury is the smallest planet and the closest planet to the Sun."
  },

  "venus": {
    name: "Venus",
    type: "planet",
    diameterKm: 12104,
    massKg: 4.867e24,
    distanceFromSunKm: 108200000,
    summary: "Venus is the second planet from the Sun and has a very hot atmosphere."
  },

  "uranus": {
    name: "Uranus",
    type: "planet",
    diameterKm: 50724,
    massKg: 8.681e25,
    distanceFromSunKm: 2871000000,
    summary: "Uranus is an ice giant planet known for rotating on its side."
  },

  "neptune": {
    name: "Neptune",
    type: "planet",
    diameterKm: 49244,
    massKg: 1.024e26,
    distanceFromSunKm: 4495000000,
    summary: "Neptune is the farthest known planet from the Sun."
  },

  "moon": {
    name: "Moon",
    type: "moon",
    diameterKm: 3474,
    massKg: 7.342e22,
    summary: "The Moon is Earth's natural satellite."
  },

  "sun": {
    name: "Sun",
    type: "star",
    diameterKm: 1392700,
    massKg: 1.989e30,
    summary: "The Sun is the star at the center of the Solar System."
  },

  "bmw m4": {
    name: "BMW M4",
    type: "car",
    topSpeedKmh: 290,
    zeroTo100Sec: 3.5,
    powerHp: 503,
    summary: "The BMW M4 is a high-performance coupe made by BMW M."
  },

  "bmw m5": {
    name: "BMW M5",
    type: "car",
    topSpeedKmh: 305,
    zeroTo100Sec: 3.3,
    powerHp: 617,
    summary: "The BMW M5 is a high-performance sports sedan made by BMW M."
  },

  "bmw m4 cs": {
    name: "BMW M4 CS",
    type: "car",
    topSpeedKmh: 302,
    zeroTo100Sec: 3.4,
    powerHp: 543,
    summary: "The BMW M4 CS is a lighter, more performance-focused version of the BMW M4."
  },

  "mercedes amg gt black series": {
    name: "Mercedes-AMG GT Black Series",
    type: "car",
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
    type: "phone",
    releaseYear: 2022,
    summary: "The iPhone 14 is a smartphone released by Apple in 2022."
  },

  "iphone 15": {
    name: "iPhone 15",
    type: "phone",
    releaseYear: 2023,
    summary: "The iPhone 15 is a smartphone released by Apple in 2023."
  },

  "iphone 16": {
    name: "iPhone 16",
    type: "phone",
    releaseYear: 2024,
    summary: "The iPhone 16 is a smartphone released by Apple in 2024."
  },

  "ps4": {
    aliasOf: "playstation 4"
  },

  "playstation 4": {
    name: "PlayStation 4",
    type: "console",
    releaseYear: 2013,
    summary: "The PlayStation 4 is a video game console released by Sony in 2013."
  },

  "ps5": {
    aliasOf: "playstation 5"
  },

  "playstation 5": {
    name: "PlayStation 5",
    type: "console",
    releaseYear: 2020,
    summary: "The PlayStation 5 is a video game console released by Sony in 2020."
  }
};


// =====================================================
// 4. HISTORY
// =====================================================

let searchHistory = [];

try {
  const storedHistory = localStorage.getItem("arasSearchHistory");

  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
} catch (error) {
  searchHistory = [];
}

renderHistory();


// =====================================================
// 5. EVENT LISTENERS
// =====================================================

if (searchBtn) {
  searchBtn.addEventListener("click", search);
}

if (queryInput) {
  queryInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      search();
    }
  });
}

suggestionButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    queryInput.value = button.dataset.query;
    search();
  });
});


// =====================================================
// 6. MAIN SEARCH
// =====================================================

async function search() {
  const query = queryInput.value.trim();

  if (!query) {
    showEmptyMessage();
    return;
  }

  saveSearch(query);
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
  }
}


// =====================================================
// 7. NORMAL SEARCH
// =====================================================

async function handleNormalSearch(query) {
  showLoading("Searching for the best answer...");

  const builtIn = answerFromBuiltInFacts(query);

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


// =====================================================
// 8. BUILT-IN DIRECT ANSWERS
// =====================================================

function answerFromBuiltInFacts(query) {
  const q = normalize(query);

  if (q.includes("value of pi") || q.includes("value of π")) {
    return {
      title: "Pi",
      direct: "π ≈ 3.14159",
      text: "Pi is the ratio of a circle's circumference to its diameter. Its value starts with 3.14159 and continues forever."
    };
  }

  if (q.includes("speed of light")) {
    return {
      title: "Speed of light",
      direct: "299,792,458 metres per second",
      text: "The speed of light in vacuum is exactly 299,792,458 metres per second."
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

  return null;
}


// =====================================================
// 9. COMPARISON SEARCH
// =====================================================

async function handleComparison(query) {
  showLoading("Detecting the two things to compare...");

  const parts = splitComparisonQuestion(query);

  if (parts.length < 2) {
    showComparisonHelp();
    return;
  }

  const rawItem1 = parts[0];
  const rawItem2 = parts[1];

  showLoading("Looking for comparison data...");

  const fact1 = findFact(rawItem1);
  const fact2 = findFact(rawItem2);

  if (fact1 && fact2) {
    const judgement = compareFacts(query, fact1, fact2);

    showComparisonResult({
      item1Name: fact1.name,
      item2Name: fact2.name,
      item1Text: fact1.summary || "",
      item2Text: fact2.summary || "",
      direct: judgement.direct,
      explanation: judgement.explanation
    });

    return;
  }

  showLoading("Searching Wikipedia for both topics...");

  const wiki1 = fact1 ? factToWikiLike(fact1) : await getBestWikipediaSummary(rawItem1);
  const wiki2 = fact2 ? factToWikiLike(fact2) : await getBestWikipediaSummary(rawItem2);

  const judgement = compareWikiResults(query, wiki1, wiki2);

  showComparisonResult({
    item1Name: wiki1.title || rawItem1,
    item2Name: wiki2.title || rawItem2,
    item1Text: wiki1.extract || "No summary found.",
    item2Text: wiki2.extract || "No summary found.",
    direct: judgement.direct,
    explanation: judgement.explanation
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
    '<p class="small-note"><strong>Note:</strong> This app uses built-in facts when possible and Wikipedia as a fallback. It is not full AI, but it can make simple comparisons.</p>';
}


// =====================================================
// 10. SMART FACT COMPARISON
// =====================================================

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
    if (a.zeroTo100Sec !== undefined && b.zeroTo100Sec !== undefined) {
      return compareByLower(a, b, "zeroTo100Sec", "seconds 0–100 km/h", "faster");
    }

    if (a.topSpeedKmh !== undefined && b.topSpeedKmh !== undefined) {
      return compareByHigher(a, b, "topSpeedKmh", "km/h top speed", "faster");
    }
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

  if (intent === "better") {
    return {
      direct: "It depends on what you mean by better.",
      explanation:
        `${a.name} and ${b.name} can be compared in different ways. Try asking something more specific, like faster, bigger, newer, or more powerful.`
    };
  }

  return {
    direct: `I found ${a.name} and ${b.name}, but I need a clearer comparison category.`,
    explanation:
      "Try using words like bigger, smaller, faster, older, newer, heavier, lighter, or more powerful."
  };
}

function compareByHigher(a, b, key, unit, word) {
  if (a[key] === undefined || b[key] === undefined) {
    return missingData(a, b, word);
  }

  return compareNumbers(a, b, a[key], b[key], unit, word, "higher");
}

function compareByLower(a, b, key, unit, word) {
  if (a[key] === undefined || b[key] === undefined) {
    return missingData(a, b, word);
  }

  return compareNumbers(a, b, a[key], b[key], unit, word, "lower");
}

function compareNumbers(a, b, valueA, valueB, unit, word, direction) {
  let winner;
  let loser;
  let winnerValue;
  let loserValue;

  if (direction === "higher") {
    if (valueA > valueB) {
      winner = a;
      loser = b;
      winnerValue = valueA;
      loserValue = valueB;
    } else if (valueB > valueA) {
      winner = b;
      loser = a;
      winnerValue = valueB;
      loserValue = valueA;
    } else {
      return {
        direct: `${a.name} and ${b.name} are equal.`,
        explanation: `Both have the same value: ${formatNumber(valueA)} ${unit}.`
      };
    }
  }

  if (direction === "lower") {
    if (valueA < valueB) {
      winner = a;
      loser = b;
      winnerValue = valueA;
      loserValue = valueB;
    } else if (valueB < valueA) {
      winner = b;
      loser = a;
      winnerValue = valueB;
      loserValue = valueA;
    } else {
      return {
        direct: `${a.name} and ${b.name} are equal.`,
        explanation: `Both have the same value: ${formatNumber(valueA)} ${unit}.`
      };
    }
  }

  return {
    direct: `${winner.name} is ${word} than ${loser.name}.`,
    explanation:
      `${winner.name} wins because it has ${formatNumber(winnerValue)} ${unit}, while ${loser.name} has ${formatNumber(loserValue)} ${unit}.`
  };
}

function missingData(a, b, word) {
  return {
    direct: `I cannot confidently decide which is ${word}.`,
    explanation:
      `I found ${a.name} and ${b.name}, but I do not have the exact data needed for this comparison.`
  };
}


// =====================================================
// 11. WIKIPEDIA FALLBACK COMPARISON
// =====================================================

function compareWikiResults(query, wiki1, wiki2) {
  const intent = getComparisonIntent(query);

  const name1 = wiki1.title || "First option";
  const name2 = wiki2.title || "Second option";

  const text1 = wiki1.extract || "";
  const text2 = wiki2.extract || "";

  if (intent === "older" || intent === "newer") {
    const y1 = extractYear(text1);
    const y2 = extractYear(text2);

    if (y1 && y2) {
      if (intent === "older") {
        if (y1 < y2) {
          return {
            direct: `${name1} is older than ${name2}.`,
            explanation: `${name1} is linked to ${y1}, while ${name2} is linked to ${y2}.`
          };
        }

        return {
          direct: `${name2} is older than ${name1}.`,
          explanation: `${name2} is linked to ${y2}, while ${name1} is linked to ${y1}.`
        };
      }

      if (intent === "newer") {
        if (y1 > y2) {
          return {
            direct: `${name1} is newer than ${name2}.`,
            explanation: `${name1} is linked to ${y1}, while ${name2} is linked to ${y2}.`
          };
        }

        return {
          direct: `${name2} is newer than ${name1}.`,
          explanation: `${name2} is linked to ${y2}, while ${name1} is linked to ${y1}.`
        };
      }
    }
  }

  if (
    intent === "bigger" ||
    intent === "smaller" ||
    intent === "faster" ||
    intent === "heavier" ||
    intent === "lighter" ||
    intent === "morePowerful"
  ) {
    const n1 = extractUsefulNumber(text1);
    const n2 = extractUsefulNumber(text2);

    if (n1 !== null && n2 !== null) {
      const higherWins =
        intent === "bigger" ||
        intent === "faster" ||
        intent === "heavier" ||
        intent === "morePowerful";

      const lowerWins = intent === "smaller" || intent === "lighter";

      if (higherWins) {
        if (n1 > n2) {
          return {
            direct: `${name1} is probably ${intentToWord(intent)} than ${name2}.`,
            explanation: `${name1} has the higher detected number: ${n1}, compared with ${name2}: ${n2}.`
          };
        }

        return {
          direct: `${name2} is probably ${intentToWord(intent)} than ${name1}.`,
          explanation: `${name2} has the higher detected number: ${n2}, compared with ${name1}: ${n1}.`
        };
      }

      if (lowerWins) {
        if (n1 < n2) {
          return {
            direct: `${name1} is probably ${intentToWord(intent)} than ${name2}.`,
            explanation: `${name1} has the lower detected number: ${n1}, compared with ${name2}: ${n2}.`
          };
        }

        return {
          direct: `${name2} is probably ${intentToWord(intent)} than ${name1}.`,
          explanation: `${name2} has the lower detected number: ${n2}, compared with ${name1}: ${n1}.`
        };
      }
    }
  }

  if (intent === "better") {
    return {
      direct: "It depends on what you mean by better.",
      explanation:
        `${name1} and ${name2} can be compared in many ways. Try asking which is faster, bigger, newer, cheaper, or more powerful.`
    };
  }

  return {
    direct: "I found both topics, but I cannot confidently choose a winner.",
    explanation:
      `I found information about ${name1} and ${name2}, but not enough structured data to make a direct judgement.`
  };
}

function intentToWord(intent) {
  if (intent === "morePowerful") return "more powerful";
  return intent;
}


// =====================================================
// 12. INTENT DETECTION
// =====================================================

function getComparisonIntent(query) {
  const q = normalize(query);

  if (q.includes("bigger") || q.includes("larger") || q.includes("greater")) {
    return "bigger";
  }

  if (q.includes("smaller") || q.includes("smallest")) {
    return "smaller";
  }

  if (q.includes("heavier") || q.includes("more massive")) {
    return "heavier";
  }

  if (q.includes("lighter")) {
    return "lighter";
  }

  if (q.includes("faster") || q.includes("quicker") || q.includes("higher speed")) {
    return "faster";
  }

  if (q.includes("more powerful") || q.includes("stronger") || q.includes("more horsepower")) {
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

  if (q.includes("better")) {
    return "better";
  }

  return "unknown";
}


// =====================================================
// 13. FACT FINDING
// =====================================================

function findFact(text) {
  const q = normalize(text);

  if (FACTS[q]) {
    return resolveFact(FACTS[q]);
  }

  const keys = Object.keys(FACTS);
  let bestKey = "";

  for (const key of keys) {
    if (q.includes(key) || key.includes(q)) {
      if (key.length > bestKey.length) {
        bestKey = key;
      }
    }
  }

  if (bestKey) {
    return resolveFact(FACTS[bestKey]);
  }

  return null;
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


// =====================================================
// 14. COMPARISON QUESTION SPLITTING
// =====================================================

function isComparisonQuestion(query) {
  const q = normalize(query);

  return (
    q.includes(" vs ") ||
    q.includes(" versus ") ||
    q.includes(" compare ") ||
    q.startsWith("compare ") ||
    q.includes("which is") ||
    q.includes("which one") ||
    q.includes(" or ")
  );
}

function splitComparisonQuestion(query) {
  let cleaned = " " + query + " ";

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
    .map(function (part) {
      return part.trim();
    })
    .filter(function (part) {
      return part.length > 1;
    });

  if (parts.length >= 2) {
    return [parts[0], parts[1]];
  }

  return parts;
}


// =====================================================
// 15. WIKIPEDIA API
// =====================================================

async function getWikipediaSearchResults(query) {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
    encodeURIComponent(query) +
    "&format=json&origin=*";

  const response = await fetch(url);
  const data = await response.json();

  if (!data.query || !data.query.search) {
    return [];
  }

  return data.query.search.map(function (item) {
    return {
      title: item.title,
      snippet: stripHTML(item.snippet)
    };
  });
}

async function getBestWikipediaSummary(query) {
  const searchResults = await getWikipediaSearchResults(query);

  if (!searchResults.length) {
    return {};
  }

  const bestTitle = searchResults[0].title;

  const summaryUrl =
    "https://en.wikipedia.org/api/rest_v1/page/summary/" +
    encodeURIComponent(bestTitle);

  const response = await fetch(summaryUrl);
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


// =====================================================
// 16. DIRECT ANSWER EXTRACTION
// =====================================================

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
  }

  else if (q.includes("how many") || q.includes("how much") || q.includes("population")) {
    const number = extractUsefulNumber(text);

    if (number !== null) {
      direct = String(number);
      highlightedText = highlightPhrase(text, String(number));
    }
  }

  else if (q.includes("where")) {
    const place = extractPlace(text);

    if (place) {
      direct = place;
      highlightedText = highlightPhrase(text, place);
    }
  }

  else if (q.includes("who is") || q.includes("what is")) {
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

  if (fullDate) {
    return fullDate[0];
  }

  const year = extractYear(text);

  if (year) {
    return String(year);
  }

  return "";
}

function extractYear(text) {
  const match = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);

  if (!match) return null;

  return Number(match[0]);
}

function extractUsefulNumber(text) {
  const matches = text.match(/\b\d{1,3}(,\d{3})*(\.\d+)?\b|\b\d+(\.\d+)?\b/g);

  if (!matches) return null;

  const numbers = matches
    .map(function (num) {
      return Number(num.replace(/,/g, ""));
    })
    .filter(function (num) {
      return !Number.isNaN(num);
    });

  if (!numbers.length) return null;

  return numbers[0];
}

function extractPlace(text) {
  const match = text.match(
    /\b(in|at|from|near)\s+([A-Z][a-zA-ZÀ-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÿ]+){0,4})/
  );

  if (!match) return "";

  return match[0];
}


// =====================================================
// 17. SHOW NORMAL RESULT
// =====================================================

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
      '<a class="source-link" href="' +
      data.sourceUrl +
      '" target="_blank">Open source →</a>';
  }
}


// =====================================================
// 18. RELATED RESULTS
// =====================================================

function showRelatedResults(results) {
  if (!results || !results.length) return;

  relatedSection.classList.remove("hidden");
  relatedList.innerHTML = "";

  results.forEach(function (item) {
    const card = document.createElement("div");
    card.className = "related-item";

    const title = document.createElement("h4");
    title.textContent = item.title;

    const snippet = document.createElement("p");
    snippet.textContent = item.snippet;

    card.appendChild(title);
    card.appendChild(snippet);

    card.addEventListener("click", function () {
      queryInput.value = item.title;
      search();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    relatedList.appendChild(card);
  });
}


// =====================================================
// 19. SEARCH HISTORY
// =====================================================

function saveSearch(query) {
  searchHistory = searchHistory.filter(function (item) {
    return normalize(item) !== normalize(query);
  });

  searchHistory.unshift(query);

  if (searchHistory.length > 8) {
    searchHistory.pop();
  }

  try {
    localStorage.setItem("arasSearchHistory", JSON.stringify(searchHistory));
  } catch (error) {}

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

  searchHistory.forEach(function (item) {
    const button = document.createElement("button");
    button.className = "history-item";
    button.textContent = item;

    button.addEventListener("click", function () {
      queryInput.value = item;
      search();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    historyList.appendChild(button);
  });
}


// =====================================================
// 20. UI HELPERS
// =====================================================

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

function showEmptyMessage() {
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
  answerText.textContent =
    "I could not find a good result for: " +
    query +
    ". Try using more specific words.";
}

function showComparisonHelp() {
  stopLoading("Comparison detected");

  resultSection.classList.remove("hidden");
  answerTitle.textContent = "I need two clear things";
  answerText.textContent =
    "Try writing your comparison like: Earth vs Mars, BMW M4 vs BMW M5, or iPhone 15 vs iPhone 14.";
}

function showError(message) {
  loader.style.display = "none";
  searchBtn.disabled = false;

  resultSection.classList.remove("hidden");
  statusText.textContent = "Error";
  answerTitle.textContent = "Something went wrong";
  answerText.textContent = message;
}


// =====================================================
// 21. VOICE SEARCH
// =====================================================

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition && voiceBtn) {
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.addEventListener("click", function () {
    try {
      recognition.start();

      voiceBtn.classList.add("listening");
      voiceBtn.textContent = "🎙️";

      resultSection.classList.remove("hidden");
      loader.style.display = "block";
      statusText.textContent = "Listening...";
    } catch (error) {
      statusText.textContent = "Voice search is already listening.";
    }
  });

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;

    queryInput.value = transcript;

    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";

    search();
  };

  recognition.onerror = function () {
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";

    loader.style.display = "none";
    statusText.textContent = "Voice search failed. Try again.";
  };

  recognition.onend = function () {
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤";
  };
} else {
  if (voiceBtn) {
    voiceBtn.style.display = "none";
  }
}


// =====================================================
// 22. TEXT HELPERS
// =====================================================

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

  const regex = new RegExp("(" + safePhrase + ")", "i");

  return safeText.replace(regex, "<mark>$1</mark>");
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatNumber(num) {
  if (typeof num !== "number") return String(num);

  if (Math.abs(num) >= 1000000) {
    return num.toExponential(3);
  }

  return num.toLocaleString();
}


// =====================================================
// 23. STARTUP
// =====================================================

console.log("Aras Smart Search loaded with voice search.");
