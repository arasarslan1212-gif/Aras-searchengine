// =====================================================
// ARAS SMART SEARCH ENGINE
// script.js
// Works with GitHub Pages
// Uses Wikipedia public APIs
// No API key needed
// =====================================================



// =====================================================
// 1. GET HTML ELEMENTS
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
// 2. SEARCH HISTORY
// =====================================================

let searchHistory = [];

const savedHistory = localStorage.getItem("arasSearchHistory");

if (savedHistory) {
  try {
    searchHistory = JSON.parse(savedHistory);
    renderHistory();
  } catch (error) {
    searchHistory = [];
  }
}



// =====================================================
// 3. EVENT LISTENERS
// =====================================================

searchBtn.addEventListener("click", search);

queryInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    search();
  }
});

suggestionButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const text = button.dataset.query;
    queryInput.value = text;
    search();
  });
});



// =====================================================
// 4. MAIN SEARCH FUNCTION
// =====================================================

async function search() {
  const query = queryInput.value.trim();

  if (!query) {
    showEmptyMessage();
    return;
  }

  resetUI();
  showLoading("Understanding your question...");
  saveSearch(query);

  try {
    if (isComparisonQuestion(query)) {
      await handleComparisonQuestion(query);
    } else {
      await handleNormalQuestion(query);
    }
  } catch (error) {
    showError(error.message);
  }
}



// =====================================================
// 5. NORMAL QUESTION HANDLING
// =====================================================

async function handleNormalQuestion(query) {
  showLoading("Searching Wikipedia...");

  const result = await getBestWikipediaSummary(query);

  if (!result || !result.extract) {
    showNoResult(query);
    return;
  }

  const extracted = extractDirectAnswer(query, result.extract, result.title);

  showResult({
    title: result.title,
    extract: result.extract,
    url: result.url,
    direct: extracted.direct,
    highlightedText: extracted.highlightedText
  });

  const relatedResults = await getSearchResults(query);

  if (relatedResults.length > 1) {
    showRelatedResults(relatedResults.slice(1, 6));
  }
}



// =====================================================
// 6. COMPARISON QUESTION HANDLING
// =====================================================

async function handleComparisonQuestion(query) {
  showLoading("Detected a comparison question...");

  const parts = splitComparisonQuestion(query);

  if (parts.length < 2) {
    showComparisonHelp();
    return;
  }

  const item1 = parts[0];
  const item2 = parts[1];

  showLoading("Searching both topics...");

  const result1 = await getBestWikipediaSummary(item1);
  const result2 = await getBestWikipediaSummary(item2);

  if (!result1.extract && !result2.extract) {
    showNoResult(query);
    return;
  }

  showComparisonResult(query, item1, item2, result1, result2);
}



// =====================================================
// 7. WIKIPEDIA SEARCH FUNCTIONS
// =====================================================

async function getSearchResults(query) {
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
  const results = await getSearchResults(query);

  if (!results.length) {
    return {};
  }

  const bestTitle = results[0].title;

  const summaryUrl =
    "https://en.wikipedia.org/api/rest_v1/page/summary/" +
    encodeURIComponent(bestTitle);

  const response = await fetch(summaryUrl);
  const data = await response.json();

  return {
    title: data.title || bestTitle,
    extract: data.extract || "",
    description: data.description || "",
    url:
      data.content_urls &&
      data.content_urls.desktop &&
      data.content_urls.desktop.page
        ? data.content_urls.desktop.page
        : ""
  };
}



// =====================================================
// 8. DIRECT ANSWER EXTRACTION
// =====================================================

function extractDirectAnswer(query, text, title) {
  const lower = query.toLowerCase();

  let direct = "";
  let highlightedText = text;

  if (isWhenQuestion(lower)) {
    const date = findDate(text);

    if (date) {
      direct = date;
      highlightedText = highlightText(text, date);
    }
  }

  else if (isWhereQuestion(lower)) {
    const place = findPlace(text);

    if (place) {
      direct = place;
      highlightedText = highlightText(text, place);
    }
  }

  else if (isHowManyQuestion(lower)) {
    const number = findNumber(text);

    if (number) {
      direct = number;
      highlightedText = highlightText(text, number);
    }
  }

  else if (isWhatValueQuestion(lower)) {
    const value = findValueForQuestion(lower, text);

    if (value) {
      direct = value;
      highlightedText = highlightText(text, value);
    }
  }

  else if (lower.includes("who is") || lower.includes("what is")) {
    direct = title;
  }

  return {
    direct,
    highlightedText
  };
}



function isWhenQuestion(lower) {
  return (
    lower.startsWith("when") ||
    lower.includes("when was") ||
    lower.includes("when is") ||
    lower.includes("birth") ||
    lower.includes("born")
  );
}



function isWhereQuestion(lower) {
  return (
    lower.startsWith("where") ||
    lower.includes("where is") ||
    lower.includes("where was") ||
    lower.includes("located")
  );
}



function isHowManyQuestion(lower) {
  return (
    lower.startsWith("how many") ||
    lower.startsWith("how much") ||
    lower.includes("population") ||
    lower.includes("height") ||
    lower.includes("distance") ||
    lower.includes("speed")
  );
}



function isWhatValueQuestion(lower) {
  return (
    lower.includes("value of pi") ||
    lower.includes("value of π") ||
    lower.includes("speed of light") ||
    lower.includes("speed of sound")
  );
}



// =====================================================
// 9. FACT FINDING HELPERS
// =====================================================

function findDate(text) {
  const fullDate =
    /\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i;

  const yearOnly =
    /\b(1[0-9]{3}|20[0-9]{2})\b/;

  const fullDateMatch = text.match(fullDate);

  if (fullDateMatch) {
    return fullDateMatch[0];
  }

  const yearMatch = text.match(yearOnly);

  if (yearMatch) {
    return yearMatch[0];
  }

  return "";
}



function findNumber(text) {
  const numberPattern =
    /\b\d{1,3}(,\d{3})*(\.\d+)?\b|\b\d+(\.\d+)?\b/;

  const match = text.match(numberPattern);

  if (match) {
    return match[0];
  }

  return "";
}



function findPlace(text) {
  const placePattern =
    /\b(in|at|from|near|within)\s+([A-Z][a-zA-ZÀ-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÿ]+){0,4})/;

  const match = text.match(placePattern);

  if (match) {
    return match[0];
  }

  return "";
}



function findValueForQuestion(lower, text) {
  if (lower.includes("value of pi") || lower.includes("value of π")) {
    return "approximately 3.14159";
  }

  if (lower.includes("speed of light")) {
    return "299,792,458 metres per second";
  }

  if (lower.includes("speed of sound")) {
    return "about 343 metres per second in air at 20°C";
  }

  return findNumber(text);
}



// =====================================================
// 10. HIGHLIGHTING
// =====================================================

function highlightText(text, phrase) {
  if (!phrase) return escapeHTML(text);

  const escapedText = escapeHTML(text);
  const escapedPhrase = escapeRegExp(phrase);

  const regex = new RegExp("(" + escapedPhrase + ")", "i");

  return escapedText.replace(regex, "<mark>$1</mark>");
}



// =====================================================
// 11. COMPARISON DETECTION
// =====================================================

function isComparisonQuestion(query) {
  const lower = query.toLowerCase();

  return (
    lower.includes(" vs ") ||
    lower.includes(" versus ") ||
    lower.includes("compare ") ||
    lower.includes("which is ") ||
    lower.includes("which one ") ||
    lower.includes(" or ")
  );
}



function splitComparisonQuestion(query) {
  let cleaned = query
    .replace(/\?/g, "")
    .replace(/which one is/gi, "")
    .replace(/which one/gi, "")
    .replace(/which is/gi, "")
    .replace(/compare/gi, "")
    .replace(/better/gi, "")
    .replace(/faster/gi, "")
    .replace(/bigger/gi, "")
    .replace(/larger/gi, "")
    .replace(/smaller/gi, "")
    .replace(/older/gi, "")
    .replace(/newer/gi, "")
    .replace(/stronger/gi, "")
    .replace(/more powerful/gi, "")
    .replace(/more expensive/gi, "")
    .replace(/cheaper/gi, "")
    .replace(/:/g, "")
    .trim();

  let parts = cleaned
    .split(/\s+vs\s+|\s+versus\s+|\s+or\s+|\s+and\s+/i)
    .map(function (part) {
      return part.trim();
    })
    .filter(function (part) {
      return part.length > 1;
    });

  if (parts.length > 2) {
    parts = [parts[0], parts[1]];
  }

  return parts;
}



// =====================================================
// 12. SHOW NORMAL RESULT
// =====================================================

function showResult(data) {
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

  if (data.highlightedText) {
    answerText.innerHTML = data.highlightedText;
  } else {
    answerText.textContent = data.extract;
  }

  if (data.url) {
    extraContent.innerHTML =
      '<a class="source-link" href="' +
      data.url +
      '" target="_blank">Open source →</a>';
  }
}



// =====================================================
// 13. SHOW COMPARISON RESULT
// =====================================================

function showComparisonResult(query, item1, item2, result1, result2) {
  stopLoading("Comparison search completed");

  resultSection.classList.remove("hidden");
  comparisonSection.classList.remove("hidden");

  answerTitle.textContent = "Comparison result";

  directAnswerBox.classList.add("hidden");

  answerText.textContent = makeComparisonIntro(query);

  compare1Title.textContent = result1.title || item1;
  compare1Text.textContent = result1.extract || "No summary found.";

  compare2Title.textContent = result2.title || item2;
  compare2Text.textContent = result2.extract || "No summary found.";

  extraContent.innerHTML =
    '<p class="small-note"><strong>Note:</strong> This app can compare search results, but it cannot always make a perfect judgement without a real AI model or a special database.</p>';
}



function makeComparisonIntro(query) {
  const lower = query.toLowerCase();

  if (lower.includes("faster")) {
    return "This is a speed comparison. I searched both topics so you can compare their information.";
  }

  if (lower.includes("bigger") || lower.includes("larger")) {
    return "This is a size comparison. I searched both topics so you can compare them.";
  }

  if (lower.includes("better")) {
    return "This is partly opinion-based. I searched both topics so you can compare them fairly.";
  }

  if (lower.includes("older") || lower.includes("newer")) {
    return "This is a time/date comparison. I searched both topics so you can compare their dates.";
  }

  return "I found both sides of your comparison.";
}



// =====================================================
// 14. RELATED RESULTS
// =====================================================

function showRelatedResults(results) {
  if (!results.length) return;

  relatedSection.classList.remove("hidden");
  relatedList.innerHTML = "";

  results.forEach(function (item) {
    const div = document.createElement("div");
    div.className = "related-item";

    const title = document.createElement("h4");
    title.textContent = item.title;

    const snippet = document.createElement("p");
    snippet.textContent = item.snippet;

    div.appendChild(title);
    div.appendChild(snippet);

    div.addEventListener("click", function () {
      queryInput.value = item.title;
      search();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    relatedList.appendChild(div);
  });
}



// =====================================================
// 15. HISTORY
// =====================================================

function saveSearch(query) {
  searchHistory = searchHistory.filter(function (item) {
    return item.toLowerCase() !== query.toLowerCase();
  });

  searchHistory.unshift(query);

  if (searchHistory.length > 8) {
    searchHistory.pop();
  }

  localStorage.setItem("arasSearchHistory", JSON.stringify(searchHistory));

  renderHistory();
}



function renderHistory() {
  if (!searchHistory.length) {
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");
  historyList.innerHTML = "";

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
// 16. UI HELPERS
// =====================================================

function resetUI() {
  resultSection.classList.add("hidden");
  comparisonSection.classList.add("hidden");
  relatedSection.classList.add("hidden");

  answerTitle.textContent = "";
  answerText.textContent = "";
  directAnswer.textContent = "";
  extraContent.innerHTML = "";
  relatedList.innerHTML = "";

  directAnswerBox.classList.add("hidden");
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
  answerText.textContent = "Enter a question or topic, then press Search.";
}



function showNoResult(query) {
  stopLoading("No result found");

  resultSection.classList.remove("hidden");
  answerTitle.textContent = "No result";
  answerText.textContent =
    "I could not find a good result for: " + query + ". Try using more specific words.";
}



function showComparisonHelp() {
  stopLoading("Comparison detected");

  resultSection.classList.remove("hidden");
  answerTitle.textContent = "I need two clear things";
  answerText.textContent =
    "Try writing your comparison like this: BMW M4 vs BMW M5, Earth vs Mars, or Apple vs Samsung.";
}



function showError(message) {
  loader.style.display = "none";
  searchBtn.disabled = false;

  resultSection.classList.remove("hidden");
  answerTitle.textContent = "Error";
  statusText.textContent = "Something went wrong";
  answerText.textContent = message;
}



// =====================================================
// 17. TEXT HELPERS
// =====================================================

function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}



function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}



function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
