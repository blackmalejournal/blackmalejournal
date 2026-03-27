-- Consolidate 6 lenses → 5: merge 'philosophy' into 'culture' (now "Culture/Ideology"),
-- drop 'commemoration', add 'business' (Business/Finance).
-- New canonical set: health, politics, culture, entertainment, business

-- Step 1: Migrate existing 'philosophy' rows to 'culture'
UPDATE public.articles    SET lens = 'culture' WHERE lens = 'philosophy';
UPDATE public.dispatches  SET lens = 'culture' WHERE lens = 'philosophy';
UPDATE public.handbooks   SET lens = 'culture' WHERE lens = 'philosophy';

-- Step 2: Migrate any 'commemoration' rows to 'culture' (closest match)
UPDATE public.articles    SET lens = 'culture' WHERE lens = 'commemoration';
UPDATE public.dispatches  SET lens = 'culture' WHERE lens = 'commemoration';
UPDATE public.handbooks   SET lens = 'culture' WHERE lens = 'commemoration';

-- Step 3: Replace CHECK constraints on all tables with the new 5-lens set

-- articles
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_lens_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_lens_check
  CHECK (lens IN ('health', 'politics', 'culture', 'entertainment', 'business'));

-- dispatches
ALTER TABLE public.dispatches DROP CONSTRAINT IF EXISTS dispatches_lens_check;
ALTER TABLE public.dispatches ADD CONSTRAINT dispatches_lens_check
  CHECK (lens IN ('health', 'politics', 'culture', 'entertainment', 'business'));

-- handbooks
ALTER TABLE public.handbooks DROP CONSTRAINT IF EXISTS handbooks_lens_check;
ALTER TABLE public.handbooks ADD CONSTRAINT handbooks_lens_check
  CHECK (lens IN ('health', 'politics', 'culture', 'entertainment', 'business'));
