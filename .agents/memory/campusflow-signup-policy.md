---
name: CampusFlow signup policy
description: User-specified Supabase signup and profile identity invariants for CampusFlow.
---

Supabase Email signup and email confirmation must remain enabled. Self-service signups are student-only, and each profile ID must match the corresponding `auth.users.id`. Never use service-role credentials or fabricate Auth users, and do not claim a profile was created unless the row was verified.

**Why:** The project owner specified these as security and identity requirements for CampusFlow.

**How to apply:** Preserve these constraints in signup UI, auth triggers, and database changes. Keep signup confirmation enabled, avoid admin-key paths, and verify actual profile rows before reporting profile creation.