function showComparisonResult(query, item1, item2, result1, result2) {
  stopLoading("Comparison completed");

  resultSection.classList.remove("hidden");
  comparisonSection.classList.remove("hidden");

  const judgement = makeSmartComparison(query, result1, result2);

  answerTitle.textContent = "Comparison result";
  directAnswerBox.classList.remove("hidden");
  directAnswer.textContent = judgement.shortAnswer;
  answerText.textContent = judgement.explanation;

  compare1Title.textContent = result1.title || item1;
  compare1Text.textContent = result1.extract || "No summary found.";

  compare2Title.textContent = result2.title || item2;
  compare2Text.textContent = result2.extract || "No summary found.";

  extraContent.innerHTML =
    '<p class="small-note"><strong>Note:</strong> This app estimates answers from Wikipedia summaries. It is smarter now, but not perfect like real AI.</p>';
}

function makeSmartComparison(query, result1, result2) {
  const q = query.toLowerCase();

  const name1 = result1.title || "First option";
  const name2 = result2.title || "Second option";

  const text1 = result1.extract || "";
  const text2 = result2.extract || "";

  const n1 = extractBestNumber(text1);
  const n2 = extractBestNumber(text2);

  const y1 = extractBestYear(text1);
  const y2 = extractBestYear(text2);

  if (q.includes("bigger") || q.includes("larger") || q.includes("greater")) {
    return compareHigher(name1, name2, n1, n2, "bigger");
  }

  if (q.includes("smaller") || q.includes("lower")) {
    return compareLower(name1, name2, n1, n2, "smaller");
  }

  if (q.includes("faster") || q.includes("quicker")) {
    return compareHigher(name1, name2, n1, n2, "faster");
  }

  if (q.includes("older")) {
    return compareLowerYear(name1, name2, y1, y2, "older");
  }

  if (q.includes("newer") || q.includes("younger")) {
    return compareHigherYear(name1, name2, y1, y2, "newer");
  }

  if (q.includes("better")) {
    return {
      shortAnswer: "It depends on what you mean by better.",
      explanation:
        `${name1} and ${name2} can be compared in different ways, such as performance, price, popularity, size, or purpose. I found information about both below, but “better” is opinion-based unless you give a category.`
    };
  }

  if (n1 !== null && n2 !== null) {
    return compareHigher(name1, name2, n1, n2, "larger by number");
  }

  return {
    shortAnswer: "I found both topics, but I cannot confidently choose one.",
    explanation:
      `I found information about ${name1} and ${name2}, but the summaries do not contain clear comparable data. Try asking with a clearer category, like “Which is bigger?”, “Which is faster?”, or “Which is older?”`
  };
}

function compareHigher(name1, name2, n1, n2, word) {
  if (n1 === null || n2 === null) {
    return {
      shortAnswer: "I cannot confidently decide from the available summaries.",
      explanation:
        `To decide which is ${word}, I need clear numbers for both ${name1} and ${name2}. Wikipedia summaries did not give enough clear data.`
    };
  }

  if (n1 > n2) {
    return {
      shortAnswer: `${name1} is ${word} than ${name2}.`,
      explanation: `${name1} has the higher detected value: ${n1} compared with ${n2}.`
    };
  }

  if (n2 > n1) {
    return {
      shortAnswer: `${name2} is ${word} than ${name1}.`,
      explanation: `${name2} has the higher detected value: ${n2} compared with ${n1}.`
    };
  }

  return {
    shortAnswer: `${name1} and ${name2} look equal from the detected data.`,
    explanation: `Both had the same detected value: ${n1}.`
  };
}

function compareLower(name1, name2, n1, n2, word) {
  if (n1 === null || n2 === null) {
    return {
      shortAnswer: "I cannot confidently decide from the available summaries.",
      explanation:
        `To decide which is ${word}, I need clear numbers for both ${name1} and ${name2}.`
    };
  }

  if (n1 < n2) {
    return {
      shortAnswer: `${name1} is ${word} than ${name2}.`,
      explanation: `${name1} has the lower detected value: ${n1} compared with ${n2}.`
    };
  }

  if (n2 < n1) {
    return {
      shortAnswer: `${name2} is ${word} than ${name1}.`,
      explanation: `${name2} has the lower detected value: ${n2} compared with ${n1}.`
    };
  }

  return {
    shortAnswer: `${name1} and ${name2} look equal from the detected data.`,
    explanation: `Both had the same detected value: ${n1}.`
  };
}

function compareLowerYear(name1, name2, y1, y2, word) {
  if (!y1 || !y2) {
    return {
      shortAnswer: "I cannot confidently compare their ages.",
      explanation: "I could not find clear years for both topics."
    };
  }

  if (y1 < y2) {
    return {
      shortAnswer: `${name1} is ${word} than ${name2}.`,
      explanation: `${name1} is linked to ${y1}, while ${name2} is linked to ${y2}.`
    };
  }

  return {
    shortAnswer: `${name2} is ${word} than ${name1}.`,
    explanation: `${name2} is linked to ${y2}, while ${name1} is linked to ${y1}.`
  };
}

function compareHigherYear(name1, name2, y1, y2, word) {
  if (!y1 || !y2) {
    return {
      shortAnswer: "I cannot confidently compare their dates.",
      explanation: "I could not find clear years for both topics."
    };
  }

  if (y1 > y2) {
    return {
      shortAnswer: `${name1} is ${word} than ${name2}.`,
      explanation: `${name1} is linked to ${y1}, while ${name2} is linked to ${y2}.`
    };
  }

  return {
    shortAnswer: `${name2} is ${word} than ${name1}.`,
    explanation: `${name2} is linked to ${y2}, while ${name1} is linked to ${y1}.`
  };
}

function extractBestNumber(text) {
  const matches = text.match(/\b\d{1,3}(,\d{3})*(\.\d+)?\b|\b\d+(\.\d+)?\b/g);

  if (!matches) return null;

  const numbers = matches
    .map(n => Number(n.replace(/,/g, "")))
    .filter(n => !isNaN(n));

  if (!numbers.length) return null;

  return numbers[0];
}

function extractBestYear(text) {
  const match = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  return match ? Number(match[0]) : null;
}
