/**
 * Robustly parses email addresses from raw CSV/Text content.
 */
export const parseEmailsFromCsv = (text: string): string[] => {
  if (!text) return [];
  
  const lines = text.split(/\r?\n/);
  const extractedEmails: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  lines.forEach(line => {
    const columns = line.split(',');
    columns.forEach(col => {
      const trimmed = col.trim();
      if (emailRegex.test(trimmed)) {
        extractedEmails.push(trimmed);
      }
    });
  });

  return Array.from(new Set(extractedEmails));
};
