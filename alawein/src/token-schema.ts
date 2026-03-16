export interface ColorToken {
  value: string;
  category: string;
  accessible?: boolean;
  aliases?: string[];
}

export interface TokenSet {
  primitives?: {
    colors?: Record<string, any>;
    typography?: Record<string, any>;
    spacing?: Record<string, any>;
  };
  semantic?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTokens(tokens: TokenSet): ValidationResult {
  const errors: string[] = [];

  if (tokens.primitives?.colors) {
    for (const [name, token] of Object.entries(tokens.primitives.colors)) {
      if (!token.value || !token.category) {
        errors.push(`Color token '${name}' missing required fields: value, category`);
      }
      if (token.value && !/^#[0-9A-F]{6}$/i.test(token.value)) {
        errors.push(`Color token '${name}' has invalid hex format: ${token.value}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
