# ⚡ Silence Designs — Complete Slash Commands Directory

This document provides a reference for all 50 required slash commands and management modules in Silence Designs.

---

## 1. Orders (10 Commands)

| Command | Options | Description |
|---|---|---|
| `/order-create` | `[service]` | Open guided order modal or select service category |
| `/order-status` | `<order_id>` | Check real-time order status, assigned designer, quote, and payment status |
| `/order-cancel` | `<order_id>`, `[reason]` | Cancel an active order (Customer or authorized Staff) |
| `/order-list` | `[status]` | List your active & past orders (Staff can view all orders across server) |
| `/order-claim` | `<order_id>` | Claim an active order as the assigned designer |
| `/order-complete` | `<order_id>`, `[delivery_notes]` | Mark order as delivered and completed in SQLite |
| `/order-submit` | `<order_id>`, `<file>`, `[description]` | Submit draft livery or preview image for client review |
| `/order-review` | `<order_id>`, `<rating>`, `<feedback>` | Leave 1-5 star review and rating for your designer |
| `/order-tip` | `<order_id>` | Tip your designer via configured Roblox products |
| `/showcase` | None | View recent completed ER:LC liveries and client works |

---

## 2. AI Design Assistance (5 Commands)

Powered by Google Gemini API:

| Command | Options | Description |
|---|---|---|
| `/ai-idea` | `<theme>` | Generate innovative ER:LC livery concepts and specs |
| `/ai-palette` | `<style>` | Generate 5-color aesthetic palette with Hex codes & usage tips |
| `/ai-lore` | `<department_name>` | Generate rich roleplay backstory, divisions, and history |
| `/ai-slogan` | `<agency_type>` | Generate livery quarter-panel mottos and quotes |
| `/ai-name` | `<region_vibe>` | Generate authentic fictional county, city, and agency names |

---

## 3. Tickets & Support (8 Commands)

| Command | Options | Description |
|---|---|---|
| `/ticket-open` | `[category]` | Open a support ticket, design order, or report |
| `/ticket-close` | `[reason]` | Close ticket, compile transcript, send receipt DM, and archive |
| `/ticket-add` | `<user>` | Grant a member access to the current ticket channel |
| `/ticket-remove` | `<user>` | Revoke a member's access from current ticket |
| `/ticket-transcript` | `[ref_id]` | Export formatted `.txt` transcript with message history |
| `/ticket-claim` | None | Claim active ticket as handling staff member |
| `/ticket-transfer` | `<target_staff>` | Hand off ticket ownership to another staff member |
| `/ticket-priority` | `<level>` | Set priority: Low, Normal, High, Urgent |

---

## 4. Applications (5 Commands)

| Command | Options | Description |
|---|---|---|
| `/apply-designer` | None | Open modal to submit portfolio & software experience |
| `/apply-staff` | None | Open modal to apply for community moderation team |
| `/app-review` | `<app_id>` | Inspect applicant answers & portfolio (Management) |
| `/app-accept` | `<app_id>`, `[feedback]` | Accept applicant and assign configured role |
| `/app-deny` | `<app_id>`, `[reason]` | Deny applicant with constructive advice |

---

## 5. Information (6 Commands)

| Command | Options | Description |
|---|---|---|
| `/server-info` | None | Display server stats, boost level, channels, and roles |
| `/rules` | `[section]` | View official rulebook, order conduct, and partner rules |
| `/department-info` | None | View official Roblox group data, owner, and join links |
| `/price-list` | None | View official Silence Designs prices and ordering rules |
| `/schedule` | None | View operational hours, drop dates, and application waves |
| `/announcement` | None | View latest official announcements and team updates |

---

## 6. Moderation (10 Commands)

| Command | Options | Description |
|---|---|---|
| `/ban` | `<user>`, `[reason]`, `[delete_days]` | Ban member with audit log and optional message purge |
| `/kick` | `<user>`, `[reason]` | Kick member from server with audit log |
| `/mute` | `<user>`, `<minutes>`, `[reason]` | Apply Discord timeout (1 to 40,320 minutes) |
| `/unmute` | `<user>`, `[reason]` | Remove timeout from member |
| `/warn` | `<user>`, `<reason>` | Issue formal warning recorded in SQLite database |
| `/warnings` | `[user]` | View warning history and active disciplinary points |
| `/clearwarn` | `<user>` | Clear warning records for a user (Staff only) |
| `/purge` | `<amount>` | Bulk delete up to 100 messages from channel |
| `/lock` | `[reason]` | Lock channel to prevent member messages |
| `/unlock` | None | Restore member chat permissions in channel |

---

## 7. Utility (6 Commands)

| Command | Options | Description |
|---|---|---|
| `/help` | `[category]` | Browse all commands with category selector |
| `/botinfo` | None | View system stats, Node/discord.js version, ping, uptime |
| `/ping` | None | Test roundtrip websocket heartbeat and API latency |
| `/profile` | `[user]` | View client profile, reputation, and order count |
| `/leaderboard` | None | View top clients and reputable community members |
| `/credits` | None | Official developer credits (Carlos473) & team roster |

---

## 8. Management & Persistent Panels

| Command | Description |
|---|---|
| `/botsay` | Publish custom embeds with colors, attachments, and role pings |
| `/service-status` | Toggle services Open/Closed in real-time |
| `/service-panel` | Publish interactive Services Panel with status dropdown |
| `/store-panel` | Publish persistent Server Store Panel with Roblox buy links |
| `/faq-panel` | Publish 15-question interactive FAQ panel with assistance button |
| `/marketplace-panel` | Publish Marketplace pricing and advertisement slots |
| `/giveaway-create` | Create persistent giveaway with timer recovery & entry tracking |
| `/giveaway-end` | Conclude giveaway immediately and announce winners |
| `/giveaway-reroll` | Pick new winners for an ended giveaway |
| `/release` | Publish asset release with ZIP attachments and previews |
| `/manage-hosting` | Subcommand structure for client and staff bot hosting records |
| `/hosting-pricing` | Display dedicated bot hosting plans & pricing |
| `/ticket-panel` | Publish 10-category persistent ticket creation panel |
| `/application-panel` | Publish recruitment panel with interactive buttons |
| `/paid-advertisement` | Publish approved advertising pings with safe text formatting |
| `/settings` | Review runtime configuration and assigned role/channel IDs |
