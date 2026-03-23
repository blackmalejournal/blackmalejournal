# Publishing SOP

Use this workflow for articles, briefings, dispatches, handbooks, downloads, courses, and lessons.

## Before You Publish

1. Confirm the content type and destination route.
2. Prepare title, slug, body, excerpt or description, and access tier.
3. Upload the cover, media, or file asset in the admin form before saving.
4. For scheduled content, set `published_at` before switching to `scheduled`.

## Content Routes

- Articles: `/admin/articles`
- Briefings: `/admin/briefings`
- Dispatches: `/admin/dispatches`
- Handbooks: `/admin/handbooks`
- Downloads: `/admin/downloads`
- Courses: `/admin/courses`

## Publishing Steps

1. Open the correct admin section.
2. Create a new record or edit the existing record.
3. Upload assets using the inline upload controls.
4. Save the record.
5. For public content, switch the status to `published`, or to `scheduled` with a valid publish time.
6. Open the public URL and confirm the page layout at the destination route.

## Required Verification

- Title and slug are correct.
- Access tier matches the intended audience.
- Cover image loads.
- Download or handbook file opens through the signed route if applicable.
- Course lessons appear in the correct order.
- Premium or Basic gates show the expected paywall message when signed out.

## Rollback

1. Reopen the content record in admin.
2. Change status to `draft`, `archived`, or `withdrawn` as appropriate.
3. Save.
4. Recheck the public route to confirm the content is no longer exposed.
