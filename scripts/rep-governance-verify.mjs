/**
 * Verifies REP GitHub Issue Form files and the `documentation` label via `gh` CLI.
 * Manual UI check still required: open the printed "new issue" chooser URL.
 *
 * Prerequisites: GitHub CLI (`gh`) authenticated (`gh auth status`), unless running in GitHub Actions (`GITHUB_ACTIONS` + `GH_TOKEN`).
 */
import { execSync } from "child_process";

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (e) {
    const stderr = e.stderr?.toString?.() ?? "";
    throw new Error(`${e.message}\n${stderr}`);
  }
}

const REQUIRED_TEMPLATES = [
  "config.yml",
  "rep-pilot-nomination.yml",
  "rep-weekly-status.yml",
];

if (process.env.GITHUB_ACTIONS !== "true") {
  try {
    sh("gh auth status");
  } catch {
    console.error("Run `gh auth login` first, then retry.");
    process.exit(1);
  }
}

let nameWithOwner = process.env.GITHUB_REPOSITORY?.trim();
if (!nameWithOwner) {
  try {
    nameWithOwner = sh("gh repo view --json nameWithOwner -q .nameWithOwner");
  } catch (e) {
    console.error("Could not resolve repo with `gh repo view`.", e.message);
    process.exit(1);
  }
}

let entries;
try {
  const raw = sh(`gh api "repos/${nameWithOwner}/contents/.github/ISSUE_TEMPLATE"`);
  entries = JSON.parse(raw);
} catch (e) {
  console.error(
    `Missing or unreadable .github/ISSUE_TEMPLATE for ${nameWithOwner}:`,
    e.message,
  );
  process.exit(1);
}

const names = entries.map((f) => f.name).filter(Boolean);
const missing = REQUIRED_TEMPLATES.filter((r) => !names.includes(r));
if (missing.length > 0) {
  console.error(
    `Missing Issue Template file(s) in ${nameWithOwner}: ${missing.join(", ")}`,
  );
  console.error("Found:", names.sort().join(", ") || "(none)");
  process.exit(1);
}

let labels;
try {
  labels = JSON.parse(sh(`gh label list --repo "${nameWithOwner}" --json name`));
} catch (e) {
  console.error("Could not list labels:", e.message);
  process.exit(1);
}

const hasDocumentation = labels.some((l) => l.name === "documentation");
if (!hasDocumentation) {
  console.error(
    `Repo ${nameWithOwner} is missing the "documentation" label (used by REP Issue Forms).`,
  );
  console.error('Create with: gh label create documentation --repo "' + nameWithOwner + '" --color "0075ca"');
  process.exit(1);
}

const chooseUrl = `https://github.com/${nameWithOwner}/issues/new/choose`;
console.log(`OK: ${nameWithOwner}`);
console.log(`  Issue templates: ${REQUIRED_TEMPLATES.join(", ")}`);
console.log(`  Label "documentation": present`);
console.log(`  Next (browser): ${chooseUrl}`);
