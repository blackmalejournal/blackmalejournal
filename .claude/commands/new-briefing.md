Create a new Weekend Briefing MDX file in src/content/briefings/.

Ask me for:
1. Issue number (check existing files to auto-suggest next number)
2. Headline / title
3. Number of sections (default 3)
4. Section titles

Then generate:
- File: src/content/briefings/weekend-briefing-[issue-number].mdx
- publishedAt set to today's date
- The "WEEKEND BRIEFING / [DATE]" header format matching the IG posts
- BriefingHeader component import at the top
- Each section with ## heading and placeholder body text
- Access tier defaulted to "free"
