# Chairman Operator Manual

This is the top-level operating guide for BMJ after handoff. Use the SOPs below for the step-by-step workflows.

## Daily Surfaces

- Public site: `/`
- Member portal: `/portal`
- Admin dashboard: `/admin`
- Messages triage: `/admin/messages`
- Members: `/admin/members`
- Subscribers: `/admin/subscribers`
- Courses: `/admin/courses`

## Core Operator Workflows

- Publishing and content updates: [publishing-sop.md](/mnt/c/Users/mesha/Desktop/GitHub/github.com/blackmalejournal/docs/ops/publishing-sop.md)
- Member tier and billing operations: [member-billing-sop.md](/mnt/c/Users/mesha/Desktop/GitHub/github.com/blackmalejournal/docs/ops/member-billing-sop.md)
- Inbox and subscriber handling: [inbox-subscriber-sop.md](/mnt/c/Users/mesha/Desktop/GitHub/github.com/blackmalejournal/docs/ops/inbox-subscriber-sop.md)
- Launch and release checks: [launch-checklist.md](/mnt/c/Users/mesha/Desktop/GitHub/github.com/blackmalejournal/docs/ops/launch-checklist.md)
- Backup and restore: [backup-restore.md](/mnt/c/Users/mesha/Desktop/GitHub/github.com/blackmalejournal/docs/ops/backup-restore.md)

## Operator Rules

1. Do not edit production data directly in Supabase unless the admin panel cannot complete the task.
2. Use the upload controls in admin forms before pasting raw file paths.
3. For paid access issues, treat Stripe webhook completion as the source of truth.
4. Never remove the final `admin` role from the members table.
5. Run the launch checklist before any production announcement or campaign push.

## If Something Looks Wrong

1. Check `/admin/messages` for recent contact issues.
2. Check the affected member in `/admin/members/[id]`.
3. Verify the environment and webhook configuration against [env-audit.md](/mnt/c/Users/mesha/Desktop/GitHub/github.com/blackmalejournal/docs/ops/env-audit.md).
4. If the issue involves checkout or billing, use [member-billing-sop.md](/mnt/c/Users/mesha/Desktop/GitHub/github.com/blackmalejournal/docs/ops/member-billing-sop.md).
