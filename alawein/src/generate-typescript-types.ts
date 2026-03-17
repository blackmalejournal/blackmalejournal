/**
 * Generate TypeScript type definitions from design tokens
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
 * Generate TypeScript type definitions for theme colors
 */
export function generateColorTypes(theme: Theme): string {
  const colorKeys = Object.keys(theme.colors);
  const typeLines: string[] = [];

  typeLines.push(`/**`);
  typeLines.push(`* ${theme.metadata.name} - Color tokens`);
  typeLines.push(`* ${theme.metadata.description}`);
  typeLines.push(`*/`);
  typeLines.push(`export type ColorTokens = {`);

  colorKeys.forEach((key) => {
    const token = theme.colors[key];
    typeLines.push(`  /** ${token.description} */`);
    typeLines.push(`  ${key}: '${token.value}';`);
  });

  typeLines.push(`};`);
  return typeLines.join('\n');
}

/**
 * Generate TypeScript type definitions for typography
 */
export function generateTypographyTypes(theme: Theme): string {
  const typographyKeys = Object.keys(theme.typography);
  const typeLines: string[] = [];

  typeLines.push(`/**`);
  typeLines.push(`* ${theme.metadata.name} - Typography tokens`);
  typeLines.push(`*/`);
  typeLines.push(`export type TypographyTokens = {`);

  typographyKeys.forEach((key) => {
    const token = theme.typography[key];
    typeLines.push(`  /** ${token.description} */`);
    typeLines.push(`  ${key}: '${token.value}';`);
  });

  typeLines.push(`};`);
  return typeLines.join('\n');
}

/**
 * Generate TypeScript type definitions for spacing
 */
export function generateSpacingTypes(theme: Theme): string {
  const spacingKeys = Object.keys(theme.spacing);
  const typeLines: string[] = [];

  typeLines.push(`/**`);
  typeLines.push(`* ${theme.metadata.name} - Spacing tokens`);
  typeLines.push(`*/`);
  typeLines.push(`export type SpacingTokens = {`);

  spacingKeys.forEach((key) => {
    const token = theme.spacing[key];
    typeLines.push(`  /** ${token.description} */`);
    typeLines.push(`  ${key}: '${token.value}';`);
  });

  typeLines.push(`};`);
  return typeLines.join('\n');
}

/**
 * Generate complete TypeScript definitions for a theme
 */
export function generateThemeTypes(theme: Theme): string {
  const typeLines: string[] = [];
  const familyVariant = `${theme.metadata.family}${theme.metadata.variant.charAt(0).toUpperCase()}${theme.metadata.variant.slice(1)}`.replace(/-/g, '');

  typeLines.push(`/**`);
  typeLines.push(`* ${theme.metadata.name}`);
  typeLines.push(`* ${theme.metadata.description}`);
  typeLines.push(`*/`);
  typeLines.push('');

  typeLines.push(generateColorTypes(theme));
  typeLines.push('');
  typeLines.push(generateTypographyTypes(theme));
  typeLines.push('');
  typeLines.push(generateSpacingTypes(theme));
  typeLines.push('');

  typeLines.push(`/**`);
  typeLines.push(`* Complete theme definition`);
  typeLines.push(`*/`);
  typeLines.push(`export interface ${familyVariant}Theme {`);
  typeLines.push(`  colors: ColorTokens;`);
  typeLines.push(`  typography: TypographyTokens;`);
  typeLines.push(`  spacing: SpacingTokens;`);
  typeLines.push(`}`);

  return typeLines.join('\n');
}

/**
 * Generate module declaration for CSS variables
 */
export function generateCssVariableTypes(theme: Theme, prefix = 'alawein'): string {
  const typeLines: string[] = [];

  typeLines.push(`/**`);
  typeLines.push(`* CSS Variable types for ${theme.metadata.name}`);
  typeLines.push(`*/`);
  typeLines.push(`declare global {`);
  typeLines.push(`  interface CSSCustomProperties {`);

  // Color vars
  Object.keys(theme.colors).forEach((key) => {
    typeLines.push(`    '--${prefix}-color-${key}': string;`);
  });

  // Typography vars
  Object.keys(theme.typography).forEach((key) => {
    typeLines.push(`    '--${prefix}-typo-${key}': string;`);
  });

  // Spacing vars
  Object.keys(theme.spacing).forEach((key) => {
    typeLines.push(`    '--${prefix}-space-${key}': string;`);
  });

  typeLines.push(`  }`);
  typeLines.push(`}`);
  typeLines.push('');
  typeLines.push(`export {};`);

  return typeLines.join('\n');
}
