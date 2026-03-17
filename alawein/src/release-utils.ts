/**
 * Release management and versioning utilities
 */

/**
 * Semantic version structure
 */
export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Parse semantic version string to object
 */
export function parseVersion(versionString: string): SemanticVersion {
  const parts = versionString.replace(/^v/, '').split('.');
  return {
    major: parseInt(parts[0], 10) || 0,
    minor: parseInt(parts[1], 10) || 0,
    patch: parseInt(parts[2], 10) || 0,
  };
}

/**
 * Format version object to string
 */
export function formatVersion(version: SemanticVersion): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

/**
 * Increment major version (e.g., 1.2.3 -> 2.0.0)
 */
export function incrementMajor(versionString: string): string {
  const version = parseVersion(versionString);
  version.major += 1;
  version.minor = 0;
  version.patch = 0;
  return formatVersion(version);
}

/**
 * Increment minor version (e.g., 1.2.3 -> 1.3.0)
 */
export function incrementMinor(versionString: string): string {
  const version = parseVersion(versionString);
  version.minor += 1;
  version.patch = 0;
  return formatVersion(version);
}

/**
 * Increment patch version (e.g., 1.2.3 -> 1.2.4)
 */
export function incrementPatch(versionString: string): string {
  const version = parseVersion(versionString);
  version.patch += 1;
  return formatVersion(version);
}

/**
 * Validate semantic version format
 */
export function isValidVersion(versionString: string): boolean {
  const versionRegex = /^v?\d+\.\d+\.\d+$/;
  return versionRegex.test(versionString);
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const ver1 = parseVersion(v1);
  const ver2 = parseVersion(v2);

  if (ver1.major !== ver2.major) {
    return ver1.major > ver2.major ? 1 : -1;
  }
  if (ver1.minor !== ver2.minor) {
    return ver1.minor > ver2.minor ? 1 : -1;
  }
  if (ver1.patch !== ver2.patch) {
    return ver1.patch > ver2.patch ? 1 : -1;
  }

  return 0;
}

/**
 * Release note entry
 */
export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  changes: {
    feature?: string[];
    fix?: string[];
    breaking?: string[];
  };
}

/**
 * Release manifest
 */
export interface ReleaseManifest {
  name: string;
  description: string;
  currentVersion: string;
  releases: ReleaseNote[];
  lastUpdated: string;
}

/**
 * Create release manifest structure
 */
export function createReleaseManifest(
  name: string,
  description: string,
  initialVersion = '1.0.0'
): ReleaseManifest {
  return {
    name,
    description,
    currentVersion: initialVersion,
    releases: [
      {
        version: initialVersion,
        date: new Date().toISOString().split('T')[0],
        title: 'Initial Release',
        changes: {
          feature: ['Initial design token set', 'Base theme family'],
        },
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Add release entry
 */
export function addRelease(
  manifest: ReleaseManifest,
  newVersion: string,
  title: string,
  changes: ReleaseNote['changes']
): ReleaseManifest {
  return {
    ...manifest,
    currentVersion: newVersion,
    releases: [
      {
        version: newVersion,
        date: new Date().toISOString().split('T')[0],
        title,
        changes,
      },
      ...manifest.releases,
    ],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Distribution configuration
 */
export interface DistributionConfig {
  name: string;
  version: string;
  formats: ('css' | 'ts' | 'json' | 'esm')[];
  entryPoints: {
    css?: string;
    typescript?: string;
    json?: string;
  };
  channels: {
    npm?: {
      scope: string;
      name: string;
    };
    cdn?: {
      baseUrl: string;
      path: string;
    };
  };
}

/**
 * Create distribution configuration
 */
export function createDistributionConfig(
  name: string,
  version: string
): DistributionConfig {
  return {
    name,
    version,
    formats: ['css', 'ts', 'json', 'esm'],
    entryPoints: {
      css: `dist/${name}.css`,
      typescript: `dist/${name}.d.ts`,
      json: `dist/${name}.json`,
    },
    channels: {
      npm: {
        scope: '@alawein',
        name: 'design-tokens',
      },
      cdn: {
        baseUrl: 'https://cdn.alawein.design',
        path: '/design-tokens',
      },
    },
  };
}
