# Changelog

All notable changes to the Alawein Design System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Design token framework with semantic naming conventions
- Initial 25 themes across 8 families
- 8 special edition themes (accessibility & seasonal variants)
- CSS, TypeScript, and JSON export formats
- Theme registry and indexing system
- Design token validation tests (105+ test cases)
- Distribution infrastructure with npm package configuration

### Changed

### Deprecated

### Removed

### Fixed

### Security

---

## [1.0.0] - 2026-03-16

### Added

#### Base Themes (12)
- **Midnight Family**: midnight-standard, midnight-high-contrast, midnight-vibrant
- **Dawn Family**: dawn-primary, dawn-soft, dawn-wisdom
- **Wisdom Family**: wisdom-light, wisdom-dark
- **Forge Family**: forge-default, forge-industrial, forge-legacy
- **Legacy Family**: legacy-warm, legacy-cool

#### Hybrid Themes (5)
- Earth family: earth-light, earth-dark, earth-midnight
- Heritage family: heritage-light, heritage-dark

#### Accessibility Themes (4)
- special-high-contrast (WCAG AAA compliant)
- special-deuteranopia-safe (red-green colorblind safe)
- special-protanopia-safe (red-green colorblind safe, alternative palette)
- special-reduced-motion (calm colors for motion-sensitive users)

#### Seasonal Themes (4)
- special-spring-renewal (fresh spring palette)
- special-summer-fire (warm summer tones)
- special-autumn-harvest (rich earthy colors)
- special-winter-silence (cool serene palette)

#### Design Tokens
- **Colors**: 13 semantic color tokens per theme (primary, secondary, background, surface, text, borders, accent, status colors)
- **Typography**: 14 typography tokens (fonts, sizes, weights, line heights)
- **Spacing**: 15 spacing tokens (gaps, padding, sizes)
- **Animation**: 8 duration tokens, 6 timing functions, 6 easing functions, 8 keyframe animations

#### Distribution Formats
- CSS custom properties (formatted & minified)
- TypeScript type definitions with full IntelliSense support
- JSON export with metadata preservation
- ES module exports
- Theme registry for package discovery

#### Documentation & Infrastructure
- Comprehensive design token schema validation
- 105+ unit and integration tests across 15 test suites
- npm package configuration with public exports
- Theme registry with categorization (base, hybrid, accessibility, seasonal)
- Package metadata for npm distribution
- Release management utilities with semantic versioning support

### Technical Details

#### Color Token Accuracy
- All colors validated as valid hex values
- Contrast ratios verified for accessibility variants
- Consistent token naming across all themes

#### Typography Consistency
- 14 font and size tokens present in every theme
- Font families: Bebas Neue (display), Libre Baskerville (body), Oswald (labels), IBM Plex Mono (mono)
- Sizes: 48px (display) → 14px (small), with 5 line height options
- Weight: 400 (regular) and 700 (bold)

#### Spacing Standardization
- 15 spacing tokens per theme (0px → 64px, plus gaps and padding)
- XS/S/M/L/XL sizing convention
- Consistent gap and padding presets

#### Animation Framework
- 8 duration presets (100ms → 2000ms)
- 6 easing functions with cubic-bezier curves
- 8 predefined keyframe animations
- Smooth, ease-in, ease-out, ease-in-out, sharp, bounce options

#### Accessibility Commitment
- WCAG AAA compliance option (high-contrast theme)
- Colorblind-safe variants for deuteranopia and protanopia
- Reduced-motion theme for vestibular sensitivity
- Semantic color naming for inclusive design

### Distribution Channels
- npm package: `@alawein/design-tokens`
- CDN delivery: `cdn.alawein.design`
- Direct JSON imports: `/tokens/themes/`
- CSS file includes: `alawein.css` & `alawein.min.css`

### Test Coverage
- 105 tests across 15 suites
- Theme structure validation
- Color token validation
- Typography consistency checks
- Spacing standardization verification
- Semantic color accessibility tests
- Special edition theme implementation tests
- Distribution format validation

### Known Limitations
- CDN configuration requires separate deployment setup
- Some features require npm v8+
- TypeScript 4.5+ recommended for best IDE support

---

## Release Guidelines

### Versioning
- **Major**: Breaking changes to token names, structure, or new theme family
- **Minor**: New themes, new tokens, new export formats (backward compatible)
- **Patch**: Bug fixes, documentation updates, build improvements

### Release Checklist
- [ ] Update version in `package.json`
- [ ] Add changes to this CHANGELOG
- [ ] Run full test suite: `npm test`
- [ ] Build distribution: `npm run build`
- [ ] Verify exports: Check `dist/` directory contents
- [ ] Tag release: `git tag v1.x.x`
- [ ] Publish to npm: `npm publish`
- [ ] Upload to CDN: Deploy to `cdn.alawein.design`

### Backport Policy
- Critical security fixes: Backported to last 2 major versions
- Bug fixes: Backported to current and previous major version
- Features: Only in new major versions

---

## Deprecated Features

### Planned Deprecations
None currently planned.

### Previously Deprecated
None in v1.0.0.

---

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to propose changes.

---

## Support

For issues or questions about specific releases, please see the GitHub releases page:
https://github.com/blackmalejournal/alawein-design-system/releases
