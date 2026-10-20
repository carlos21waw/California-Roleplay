# 🏛️ Silence Designs — Technical Architecture

This document outlines the architecture, database design, and operational workflows of the Silence Designs Discord Bot.

---

## 1. High-Level Architecture

```text
               Discord Gateway / REST API
                          ▲
                          │ (discord.js v14)
                          ▼
                  src/index.js (Client)
                          │
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
Event Dispatcher    Command Router    Interaction Router
(events/*.js)     (commands/*/*.js)  (interactions/router.js)
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                 Core Business Services
   ┌──────────────────────┼──────────────────────┐
   ▼                      ▼                      ▼
Database Service    Gemini AI Service     Roblox Service
(database/db.js)  (geminiAiService.js)   (robloxService.js)
   │                      │                      │
   ▼                      ▼                      ▼
SQLite Storage     Google Gemini API     Roblox Web APIs
(data/*.sqlite)
```

---

## 2. SQLite Database Schema

The bot operates on a persistent SQLite database located at `./data/silence_designs.sqlite` with WAL (Write-Ahead Logging) enabled:

1. `orders`: Persistent record for all client commissions.
   - `id`: Unique formatted ID (e.g. `ORD-89FA21`).
   - `user_id`, `user_tag`, `roblox_username`, `service_type`, `description`, `preferred_colors`, `requested_text`, `attachments`, `designer_id`, `status`, `price_estimate`, `payment_status`, `created_at`, `completed_at`, `review`, `rating`.
2. `order_history`: Audit log tracking order status changes.
3. `tickets`: Support and order tickets tracking.
   - `id`, `ref_id` (e.g. `REF-B2EB6F7E`), `channel_id`, `guild_id`, `user_id`, `user_tag`, `category`, `inquiry`, `status`, `claimed_by`, `priority`, `created_at`, `closed_at`, `closure_reason`.
4. `ticket_messages`: Message history cache for instant transcript compilation.
5. `applications`: Designer and Staff application submissions.
6. `warnings`: Infraction points recorded by moderators.
7. `moderation_logs`: Audit log for bans, kicks, timeouts, and unbans.
8. `service_statuses`: Live availability toggle (`is_open`) for Clothing, Livery, Graphics, Bot Dev.
9. `giveaways` & `giveaway_entries`: Active giveaways, scheduled end timers, and verified entries with duplicate prevention.
10. `hosting_records`: Dedicated bot hosting subscriptions, expiration timestamps, and plans.
11. `marketplace_ads`: Marketplace advertising queue, pings, and 30-day rental expiration.
12. `persistent_panels`: Panel message IDs (`ticket`, `store`, `faq`, `services`, `marketplace`, `application`) for persistent restart recovery.
13. `user_profiles`: Client stats, orders count, reviews, tips, and reputation.

---

## 3. Background Jobs & Recovery

1. **Status Rotation (`src/utils/statusRotation.js`)**:
   - Rotates through 100 unique Silence Designs presence activities at safe 30-second intervals.
2. **Giveaway Scheduler (`src/jobs/giveawayScheduler.js`)**:
   - Queries `giveaways` where `status = 'Active'`.
   - When `now >= end_time`, selects winners randomly without duplicates, edits the message embed to "ENDED", and announces winners.
   - Recovers automatically upon bot restart.
3. **Channel Expiration Monitor (`src/jobs/channelExpiryJob.js`)**:
   - Checks marketplace channels for 30-day lease expiration.
   - Cleans up expired rental channels and logs status to staff.

---

## 4. Asset Resolver & Fault Tolerance

The asset resolver in `src/utils/assetResolver.js` ensures that:
- Embeds look up corresponding PNG files in `assets/commands/`, `assets/banners/`, etc.
- If a PNG file is not found, the resolver returns `null`.
- Commands display styled text embeds without throwing Discord attachment exceptions.
- Custom emoji IDs are configurable and never invented.
- User input is sanitized via `safeText()` to prevent unintended `@everyone` and `@here` mass mentions.
