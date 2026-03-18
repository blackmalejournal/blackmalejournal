/**
 * Brand Compliance Guard — Static Analysis
 *
 * Scans all component source files for CSS patterns prohibited by
 * docs/brand/invariants.md. This test prevents brand violations from
 * being introduced in future work.
 *
 * If this test fails, you are using a prohibited CSS pattern.
 * Read docs/brand/invariants.md for the full rules.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const COMPONENTS_DIR = join(__dirname, '..', 'src', 'components');

/** Recursively collect all .tsx files in a directory */
function collectTsxFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectTsxFiles(full));
    } else if (entry.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

const PROHIBITED = [
  {
    pattern: /\bshadow-(?:sm|md|lg|xl|2xl|inner)\b/g,
    name: 'drop shadows (shadow-sm/md/lg/xl/2xl/inner)',
  },
  {
    pattern: /\bbg-gradient-/g,
    name: 'gradient backgrounds (bg-gradient-*)',
  },
  {
    pattern: /\brounded-(?:md|lg|xl|2xl|3xl)\b/g,
    name: 'rounded corners > 4px (rounded-md/lg/xl/2xl/3xl)',
  },
];

// Files with known, explicitly allowed exceptions
const ALLOWED: Record<string, RegExp[]> = {
  // Navbar backdrop-blur-sm on scroll is allowed per invariants.md
  'Navbar.tsx': [],
};

const componentFiles = collectTsxFiles(COMPONENTS_DIR);

describe('Brand Compliance Guard', () => {
  it.each(componentFiles.map((f) => [relative(COMPONENTS_DIR, f), f]))(
    '%s has no prohibited CSS patterns',
    (_relPath, filePath) => {
      const content = readFileSync(filePath as string, 'utf-8');
      const violations: string[] = [];

      for (const { pattern, name } of PROHIBITED) {
        // Reset regex state for each file
        pattern.lastIndex = 0;
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          violations.push(`${name}: ${matches.join(', ')}`);
        }
      }

      if (violations.length > 0) {
        fail(
          `Brand violation in ${_relPath}:\n` +
            violations.map((v) => `  - ${v}`).join('\n') +
            '\n\nSee docs/brand/invariants.md for rules.',
        );
      }
    },
  );

  it('scanned at least 30 component files', () => {
    // Sanity check — if file count drops dramatically, something is wrong
    expect(componentFiles.length).toBeGreaterThanOrEqual(30);
  });
});
