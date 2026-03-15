Run the full pre-deployment checklist in this exact order:

1. Run `npx tsc --noEmit` — report any TypeScript errors
2. Run `npm run lint` — report any linting issues
3. Run `npm run build` — report any build failures

If ALL three pass, output:
✅ All checks passed — ready to deploy to Vercel.

If ANY fail, output the errors with file paths and line numbers, then suggest fixes.
Do not proceed to the next check if the current one fails — fix first.
