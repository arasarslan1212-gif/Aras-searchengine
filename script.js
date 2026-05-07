function makeDirectComparison(query, result1, result2) {
  const q = query.toLowerCase();

  const name1 = result1.title || "First";
  const name2 = result2.title || "Second";

  const text1 = result1.extract || "";
  const text2 = result2.extract || "";

  // ===== SIZE / BIGGER =====
  if (q.includes("bigger") || q.includes("larger")) {
    const n1 = findNumber(text1);
    const n2 = findNumber(text2);

    if (n1 && n2) {
      if (n1 > n2) {
        return {
          short: `${name1} is bigger than ${name2}.`,
          explanation: `${name1} has a larger numerical value (${n1} vs ${n2}).`
        };
      } else {
        return {
          short: `${name2} is bigger than ${name1}.`,
          explanation: `${name2} has a larger numerical value (${n2} vs ${n1}).`
        };
      }
    }
  }

  // ===== OLDER =====
  if (q.includes("older")) {
    const d1 = findYear(text1);
    const d2 = findYear(text2);

    if (d1 && d2) {
      if (d1 < d2) {
        return {
          short: `${name1} is older than ${name2}.`,
          explanation: `${name1} dates to ${d1}, while ${name2} is from ${d2}.`
        };
      } else {
        return {
          short: `${name2} is older than ${name1}.`,
          explanation: `${name2} dates to ${d2}, while ${name1} is from ${d1}.`
        };
      }
    }
  }

  // ===== FASTER =====
  if (q.includes("faster")) {
    const n1 = findNumber(text1);
    const n2 = findNumber(text2);

    if (n1 && n2) {
      if (n1 > n2) {
        return {
          short: `${name1} is faster than ${name2}.`,
          explanation: `${name1} has a higher value (${n1} vs ${n2}).`
        };
      } else {
        return {
          short: `${name2} is faster than ${name1}.`,
          explanation: `${name2} has a higher value (${n2} vs ${n1}).`
        };
      }
    }
  }

  // ===== fallback =====
  return {
    short: "I found both topics, but I cannot decide confidently.",
    explanation:
      "This question needs more specific data. I showed both results so you can compare them."
  };
}
