# CDN Delivery Configuration

Alawein Design System distribution via CDN for global access and rapid delivery.

## Overview

The CDN delivers design tokens in multiple formats, enabling developers to use the design system across different technology stacks without complex builds.

**CDN Base URL**: `https://cdn.alawein.design`

## CDN Structure

```
cdn.alawein.design/
├── v1.0.0/                          # Version-specific resources
│   ├── css/
│   │   ├── alawein.css              # Full CSS custom properties
│   │   ├── alawein.min.css          # Minified CSS
│   │   └── themes/
│   │       ├── midnight-standard.css
│   │       ├── dawn-primary.css
│   │       └── ... (all themes)
│   ├── js/
│   │   ├── alawein.js               # ESM export wrapper
│   │   ├── alawein.umd.js           # UMD export (legacy)
│   │   └── alawein.umd.min.js       # UMD minified
│   ├── types/
│   │   ├── alawein.d.ts             # TypeScript definitions
│   │   └── themes.d.ts              # Theme-specific types
│   ├── json/
│   │   ├── themes.json              # All themes bundled
│   │   ├── index.json               # Theme registry index
│   │   └── themes/
│   │       ├── midnight-standard.json
│   │       └── ... (individual theme files)
│   └── metadata.json                # Version metadata
├── latest/ → v1.0.0/                # Alias to latest version
└── index.html                       # CDN documentation
```

## Usage Patterns

### CSS in HTML

```html
<!-- Latest version (recommended) -->
<link rel="stylesheet" href="https://cdn.alawein.design/latest/css/alawein.min.css">

<!-- Specific version -->
<link rel="stylesheet" href="https://cdn.alawein.design/v1.0.0/css/alawein.min.css">

<!-- Specific theme -->
<link rel="stylesheet" href="https://cdn.alawein.design/v1.0.0/css/themes/midnight-standard.css">
```

### JavaScript ESM Import

```javascript
// Import all themes
import themes from 'https://cdn.alawein.design/latest/js/alawein.js';

// Access theme data
const midnightTheme = themes['midnight-standard'];
const colors = midnightTheme.colors;
```

### JavaScript Fetch JSON

```javascript
// Fetch theme registry
fetch('https://cdn.alawein.design/latest/json/index.json')
  .then(r => r.json())
  .then(index => {
    console.log('Available themes:', Object.keys(index.themes));
  });

// Fetch specific theme
fetch('https://cdn.alawein.design/latest/json/themes/midnight-standard.json')
  .then(r => r.json())
  .then(theme => {
    // Use theme data in application
  });
```

### TypeScript Type Imports

```typescript
// Import types from CDN
/// <reference types="https://cdn.alawein.design/latest/types/alawein.d.ts" />

// Now have full type support
const colors: AlaweinColors = { /* ... */ };
```

## HTTP Headers Configuration

### Cache Control Strategy

```
# CSS files - Cache for 1 year (immutable content)
/v*/css/*.css
Cache-Control: public, max-age=31536000, immutable
ETag: [version-hash]

# JSON files - Cache for 24 hours
/v*/json/*.json
Cache-Control: public, max-age=86400
ETag: [version-hash]

# Version aliases - No cache (always get latest)
/latest/*
Cache-Control: public, max-age=0, must-revalidate
```

### CORS Headers

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'none'
```

## CDN Provider Configuration

### Cloudflare Configuration

```toml
# cloudflare.toml
[env.production]
name = "alawein-cdn"
main = "src/cdn-handler.ts"
routes = [
  { pattern = "cdn.alawein.design/*" }
]

[env.production.build]
command = "npm run build:cdn"
cwd = "./"

[env.production.vars]
CDN_BUCKET = "alawein-cdn"
CACHE_DURATION = "31536000"
```

### Vercel Edge Configuration

```javascript
// vercel.json
{
  "buildCommand": "npm run build && npm run build:cdn",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/v*/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### AWS CloudFront Configuration

```json
{
  "DistributionConfig": {
    "Enabled": true,
    "Origins": [
      {
        "DomainName": "alawein-cdn.s3.amazonaws.com",
        "Id": "S3Origin",
        "S3OriginConfig": {}
      }
    ],
    "DefaultCacheBehavior": {
      "AllowedMethods": ["GET", "HEAD"],
      "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
      "Compress": true,
      "ViewerProtocolPolicy": "redirect-to-https"
    }
  }
}
```

## Deployment Process

### Step 1: Build Distribution Artifacts

```bash
npm run build:distribution
```

Generates:
- CSS files (formatted & minified)
- TypeScript definitions
- JSON theme files
- Index and metadata files

### Step 2: Version the Artifacts

```bash
# Create version directory
mkdir -p dist/v1.0.0

# Copy artifacts
cp dist/*.css dist/v1.0.0/css/
cp dist/*.d.ts dist/v1.0.0/types/
cp dist/*.json dist/v1.0.0/json/
```

### Step 3: Upload to CDN

```bash
# Using AWS S3
aws s3 sync dist/v1.0.0 s3://alawein-cdn/v1.0.0 \
  --cache-control "public, max-age=31536000, immutable"

# Using Cloudflare
wrangler publish --env production

# Using Vercel
vercel deploy --prod
```

### Step 4: Update Latest Alias

```bash
# Update symlink or redirect
# Latest points to current stable version
aws s3api put-object-acl --bucket alawein-cdn \
  --key latest --acl public-read
```

### Step 5: Verify Deployment

```bash
# Test CSS availability
curl -I https://cdn.alawein.design/v1.0.0/css/alawein.min.css

# Test JSON availability
curl https://cdn.alawein.design/latest/json/index.json | head

# Verify headers
curl -I https://cdn.alawein.design/latest/css/alawein.min.css | grep Cache-Control
```

## Performance Optimization

### Gzip Compression

```bash
# Enable gzip for text assets
# .css, .js, .d.ts, .json files

# Example: nginx configuration
gzip on;
gzip_types text/css application/javascript text/x-typescript application/json;
gzip_comp_level 9;
gzip_vary on;
```

### Brotli Compression (Optional)

```bash
# Higher compression ratio than gzip
brotli -11 dist/*.css dist/*.js dist/*.json
```

### File Size Targets

- `alawein.css`: < 150 KB
- `alawein.min.css`: < 50 KB
- `alawein.js`: < 100 KB
- `themes.json`: < 200 KB
- Individual theme JSON: < 5 KB each

## Monitoring & Analytics

### CDN Metrics to Track

1. **Request Volume**: Downloads per version
2. **Cache Hit Ratio**: Should be >95% for stable releases
3. **Response Times**: p50 < 100ms, p99 < 500ms
4. **Bandwidth Usage**: Monitor for unexpected spikes
5. **Error Rates**: 4xx/5xx should be < 0.1%

### Example Monitoring Setup

```javascript
// analytics.js - Track CDN usage
fetch('https://cdn.alawein.design/latest/json/index.json')
  .then(r => r.json())
  .then(data => {
    // Log CDN usage
    navigator.sendBeacon('/api/cdn-analytics', {
      timestamp: Date.now(),
      version: 'latest',
      format: 'json',
      themes: data.total
    });
  });
```

## Version Management

### Current Version: 1.0.0

- Latest: `https://cdn.alawein.design/latest/`
- Stable: `https://cdn.alawein.design/v1.0.0/`

### Upcoming Versions

- v1.1.0 (Q2 2026): New seasonal themes
- v2.0.0 (Q4 2026): Redesigned token structure with new semantic categories

## Rollback Procedure

If a CDN version has critical issues:

```bash
# 1. Identify issue
# 2. Determine previous stable version
PREVIOUS_VERSION="v0.9.0"

# 3. Update latest alias
aws s3api put-object \
  --bucket alawein-cdn \
  --key latest \
  --website-redirect-location /${PREVIOUS_VERSION}

# 4. Announce on status page
# 5. File issue for fix
# 6. Deploy patch when ready
```

## Security Considerations

1. **No authentication required** — Intentional for public CDN access
2. **Immutable releases** — Version directories never change
3. **SRI (Subresource Integrity)** — Provide hashes for integrity verification

```html
<link
  rel="stylesheet"
  href="https://cdn.alawein.design/v1.0.0/css/alawein.min.css"
  integrity="sha384-[base64-hash]"
  crossorigin="anonymous"
>
```

## Support

For CDN issues, performance questions, or version requests:
- GitHub Issues: https://github.com/blackmalejournal/alawein-design-system/issues
- Email: cdn@alawein.design
- Status: https://status.alawein.design
