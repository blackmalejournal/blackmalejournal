/**
 * Export design tokens as CSS custom properties
 */

interface TokenValue {
  value: string;
  description?: string;
}

interface TokenCategory {
  [key: string]: TokenValue;
}

interface Theme {
  metadata: {
    family: string;
    variant: string;
    name: string;
    description: string;
  };
  colors: TokenCategory;
  typography: TokenCategory;
  spacing: TokenCategory;
}

/**
 * Convert a token category to CSS custom properties
 */
function tokensToCss(category: string, tokens: TokenCategory, prefix = 'alawein'): string {
  const cssVars: string[] = [];
  
  Object.entries(tokens).forEach(([key, token]) => {
    const varName = `--${prefix}-${category}-${key}`;
    const value = token.value;
    const comment = token.description ? ` /* ${token.description} */` : '';
    cssVars.push(`${varName}: ${value};${comment}`);
  });

  return cssVars.join('\n');
}

/**
 * Export a complete theme as CSS custom properties
 */
export function exportThemeCss(theme: Theme, prefix = 'alawein'): string {
  const lines: string[] = [];
  
  // Add theme metadata comment
  const { family, variant, name } = theme.metadata;
  lines.push(`/* ${name} Theme (${family}/${variant}) */`);
  lines.push(':root {');

  // Export color tokens
  lines.push('  /* Colors */');
  Object.entries(theme.colors).forEach(([key, token]) => {
    const varName = `--${prefix}-color-${key}`;
    const value = token.value;
    const comment = token.description ? ` /* ${token.description} */` : '';
    lines.push(`  ${varName}: ${value};${comment}`);
  });

  // Export typography tokens
  lines.push('\n  /* Typography */');
  Object.entries(theme.typography).forEach(([key, token]) => {
    const varName = `--${prefix}-typo-${key}`;
    const value = token.value;
    const comment = token.description ? ` /* ${token.description} */` : '';
    lines.push(`  ${varName}: ${value};${comment}`);
  });

  // Export spacing tokens
  lines.push('\n  /* Spacing */');
  Object.entries(theme.spacing).forEach(([key, token]) => {
    const varName = `--${prefix}-space-${key}`;
    const value = token.value;
    const comment = token.description ? ` /* ${token.description} */` : '';
    lines.push(`  ${varName}: ${value};${comment}`);
  });

  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate minified CSS variables for production
 */
export function exportThemeCssMinified(theme: Theme, prefix = 'alawein'): string {
  const vars: string[] = [];

  Object.entries(theme.colors).forEach(([key, token]) => {
    vars.push(`--${prefix}-color-${key}:${token.value}`);
  });

  Object.entries(theme.typography).forEach(([key, token]) => {
    vars.push(`--${prefix}-typo-${key}:${token.value}`);
  });

  Object.entries(theme.spacing).forEach(([key, token]) => {
    vars.push(`--${prefix}-space-${key}:${token.value}`);
  });

  return `:root{${vars.join(';')}}`;
}

/**
 * Export CSS file content with multiple themes
 */
export function exportMultipleThemesCss(themes: Theme[], prefix = 'alawein'): string {
  const lines: string[] = [];
  
  lines.push(`/* Alawein Design System - CSS Custom Properties */`);
  lines.push(`/* Generated: ${new Date().toISOString()} */`);
  lines.push('');

  themes.forEach((theme, index) => {
    if (index > 0) lines.push('');
    lines.push(exportThemeCss(theme, prefix));
  });

  return lines.join('\n');
}
