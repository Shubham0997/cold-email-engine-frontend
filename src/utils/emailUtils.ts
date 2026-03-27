/**
 * Extracts placeholders like {{name}} from a string.
 */
export const extractPlaceholders = (text: string): string[] => {
  const matches = text.match(/{{(.*?)}}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.slice(2, -2))));
};

/**
 * Applies variable values to subject and body strings.
 */
export const applyVariables = (
  subject: string, 
  body: string, 
  variableValues: {[key: string]: string}
): { subject: string; body: string } => {
  let newSubject = subject;
  let newBody = body;
  
  Object.entries(variableValues).forEach(([key, val]) => {
    if (!val) return;
    const regex = new RegExp(`{{${key}}}`, 'g');
    newSubject = newSubject.replace(regex, val);
    newBody = newBody.replace(regex, val);
  });
  
  return { subject: newSubject, body: newBody };
};
