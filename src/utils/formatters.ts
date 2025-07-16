// JSON formatting utilities
export const formatJson = (
  jsonString: string,
  indentSize: number = 2,
  indentType: 'spaces' | 'tabs' = 'spaces'
): string => {
  try {
    const parsed = JSON.parse(jsonString);
    const indent = indentType === 'tabs' ? '\t' : ' '.repeat(indentSize);
    return JSON.stringify(parsed, null, indent);
  } catch (error) {
    throw new Error('Invalid JSON: ' + (error as Error).message);
  }
};

export const minifyJson = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error('Invalid JSON: ' + (error as Error).message);
  }
};

export const validateJsonSyntax = (
  jsonString: string
): { isValid: boolean; error?: string } => {
  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: (error as Error).message,
    };
  }
};

export const escapeJsonString = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
};

export const unescapeJsonString = (str: string): string => {
  return str
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t');
};
