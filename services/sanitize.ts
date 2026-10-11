const NOT_NAMES = new Set([
  "amazon", "flipkart", "paytm", "google", "microsoft", "customer", "bank", "cyber", "crime", "police",
  "mumbai", "delhi", "head", "income", "electricity", "fedex", "courier", "telecom", "airtel", "jio",
  "inspector", "officer", "sir", "madam", "your", "the", "from", "calling", "speaking",
]);

export function sanitize(input: string): { text: string; count: number } {
  let count = 0;
  const sub = (re: RegExp, tag: string) => {
    input = input.replace(re, () => {
      count++;
      return tag;
    });
  };

  sub(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, "[EMAIL]");
  sub(/\b[\w.-]{2,}@[a-z]{2,}\b/gi, "[UPI]");
  sub(/\b(?:\+?91[\s-]?)?[6-9]\d{9}\b/g, "[PHONE]");
  sub(/\bending\s+(?:in\s+)?\d{4}\b/gi, "ending [ACCOUNT]");
  sub(/\b\d{9,18}\b/g, "[ACCOUNT]");
  sub(/\b(?:Mr|Mrs|Ms|Dr)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g, "[NAME]");

  // Titles stay ("Inspector [NAME]"): the claim of authority is a scam signal, the name is not.
  // Organisation words are never names ("This is Amazon Customer Care").
  input = input.replace(
    /\b([Tt]his is|I am|I'm|my name is|Hi|Hello|Dear)\s+((?:(?:Sub[- ])?Inspector|Officer|Constable|Agent|Advocate|Sir|Madam)\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
    (m, lead, title = "", name: string) => {
      if (NOT_NAMES.has(name.split(/\s+/)[0].toLowerCase())) return m;
      count++;
      return `${lead} ${title}[NAME]`;
    }
  );

  return { text: input, count };
}