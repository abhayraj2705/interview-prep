export function parseJsonOutput(rawValue) {
  if (!rawValue) {
    throw new Error("AI returned an empty response");
  }

  if (typeof rawValue === "object") return rawValue;

  const text = String(rawValue).trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("AI response was not valid JSON");
  }
}
