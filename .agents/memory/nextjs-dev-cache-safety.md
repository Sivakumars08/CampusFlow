---
name: Next.js dev-cache safety
description: Safe cache cleanup for the managed Next.js Preview workflow.
---

Stop the Next.js dev server before removing `.next/dev`. In this Replit workspace, deleting the cache while Turbopack was running caused a task-storage panic; the managed restart then found port 3000 still held by the orphaned server process.

**Why:** Turbopack's persisted task state can reference files being removed, and stopping only the managed workflow may not release a separately started Next process.

**How to apply:** Stop the managed workflow first, confirm port 3000 is free, then remove generated dev cache and restart the managed workflow.