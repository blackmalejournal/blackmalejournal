Generate seed/sample content for the database:

Create a seed script at scripts/seed.ts that:
1. Inserts 9 articles (3 per lens: health, philosophy, politics)
   - Mix of free and premium access tiers
   - 2 featured articles total
   - Realistic titles and excerpts matching the BMJ voice
   - Each with 2-4 relevant tags

2. Inserts 3 Weekend Briefings (issues 1-3)
   - Each with 3 sections
   - Issue 1 = free, Issue 2 = free, Issue 3 = basic

3. Uses the Supabase client from src/lib/supabase/

Make the content reflect the revolutionary masculinist tone — strong, direct,
historically grounded. Reference real topics: stoicism, physical training,
political organization, mental resilience, community building.
