Audit the project for secrets safety. Run these checks in order:

1. Verify no secrets are tracked in git
   - Run: `git ls-files | grep -iE "\.env|secret|credential|\.pem|\.key"`
   - Expected: No matches

2. Verify .gitignore covers all sensitive patterns
   - Read `.gitignore` and confirm it includes:
     - `.env*` (all env files)
     - `.env.local`
     - `node_modules`
     - `.next/`
     - `.vercel`
   - Flag any missing entries

3. Verify no hardcoded secrets in source code
   - Search `src/` for patterns that look like API keys or secrets:
     - `sk_live_`, `sk_test_` (Stripe secret keys)
     - `whsec_` (Stripe webhook secrets)
     - `eyJ` (JWT tokens / Supabase keys)
     - `re_` followed by a long string (Resend keys)
     - `sbp_` (Supabase service role patterns)
   - Expected: No matches

4. Verify NEXT_PUBLIC_ prefix correctness
   - Search `src/` for all `process.env.NEXT_PUBLIC_` references
   - Cross-check against docs/ops/env-vars.md — only these should be client-exposed:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SITE_URL`
     - `NEXT_PUBLIC_WHATSAPP_LINK`
   - Flag any server-only variable that has NEXT_PUBLIC_ prefix

5. Verify no secrets in recent commits
   - Run: `git log --diff-filter=A --name-only -20` to check recently added files
   - Flag any `.env`, credential, or key files that were committed

Report all findings with file paths and line numbers. If everything passes, output:
All checks passed — no secrets exposed.
