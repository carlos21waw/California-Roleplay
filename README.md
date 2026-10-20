# 💎 Silence Designs — Premium Discord Bot

A production-grade, enterprise-quality Discord bot engineered for **Silence Designs**, a professional ER:LC (Emergency Response: Liberty County) livery and design team.

Built with **discord.js v14**, **Node.js**, **SQLite**, and **Google Gemini AI**, this repository provides an autonomous, downloadable bot solution featuring all **50 required slash commands**, persistent tickets, interactive stores, giveaway automation, order tracking, and moderation.

---

## 🚀 Quick Start (Local Windows Setup)

```powershell
# 1. Install dependencies
npm install

# 2. Copy environment template
Copy-Item .env.example .env

# 3. Edit .env with your Bot Token and Client ID
notepad .env

# 4. Register all 50+ slash commands to Discord
npm run deploy

# 5. Launch the Silence Designs bot
npm start
```

*For step-by-step Windows instructions and Discord Developer Portal setup, see [docs/SETUP_WINDOWS.md](docs/SETUP_WINDOWS.md).*

---

## 📁 Repository Structure

```text
silence-designs/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── SETUP_WINDOWS.md
│   ├── COMMANDS.md
│   └── ARCHITECTURE.md
├── src/
│   ├── index.js                     # Bot entry point & gateway client
│   ├── deploy-commands.js           # Discord slash command deployment
│   ├── commands/
│   │   ├── orders/                  # 10 Order & showcase commands
│   │   ├── ai/                      # 5 Google Gemini design assistance commands
│   │   ├── tickets/                 # 8 Support & order ticket commands
│   │   ├── applications/            # 5 Designer & staff application commands
│   │   ├── information/             # 6 Information & price-list commands
│   │   ├── moderation/              # 10 Moderation & audit commands
│   │   ├── utility/                 # 6 Utility, profile & credit commands
│   │   ├── marketplace/             # Marketplace advertisement panel
│   │   ├── store/                   # Server store with Roblox buy links
│   │   ├── services/                # Services panel & bundle configurations
│   │   ├── giveaways/               # Automated giveaway scheduler
│   │   ├── releases/                # Asset release with ZIP attachments
│   │   ├── hosting/                 # Dedicated bot hosting management
│   │   └── administration/          # /botsay, FAQ panel, settings
│   ├── events/                      # Discord gateway event listeners
│   ├── interactions/                # Central router for buttons, selects & modals
│   ├── buttons/                     # Ticket and giveaway interactive buttons
│   ├── select-menus/                # 15-question FAQ, store & ticket dropdowns
│   ├── modals/                      # Guided forms for orders, tickets & applications
│   ├── embeds/                      # Reusable Silence Designs branded embeds
│   ├── services/                    # Gemini AI, Roblox API, transcripts, logger
│   ├── database/                    # SQLite connection, schema, queries
│   ├── permissions/                 # Role hierarchy & staff authority
│   ├── utils/                       # Safe text escaping, asset resolver, 100 statuses
│   ├── config/                      # Central config, products, pricing, rules, FAQ
│   └── jobs/                        # Giveaway timer & channel expiration jobs
├── assets/                          # Organized asset folders for PNG artwork
├── data/                            # Persistent SQLite database storage
├── logs/                            # Safe file logs with secret masking
├── tests/                           # Automated test suite
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── LICENSE
```

---

## ⚡ The 50 Required Slash Commands

### Orders (10 Commands)
- `/order-create` — Open guided modal or select service category
- `/order-status` — Check live status, quote, and designer progress
- `/order-cancel` — Cancel an order with audit reason
- `/order-list` — List your active and completed orders
- `/order-claim` — Assign yourself as the designer for an order
- `/order-complete` — Mark order as delivered and completed in SQLite
- `/order-submit` — Upload draft preview file to customer
- `/order-review` — Leave 1-5 star review and rating for your designer
- `/order-tip` — Send a tip to support your designer
- `/showcase` — View recent completed deliveries and liveries

### AI Design Assistance (5 Commands)
- `/ai-idea` — Generate innovative ER:LC livery concepts with Gemini AI
- `/ai-palette` — Generate aesthetic 5-color palettes with Hex codes
- `/ai-lore` — Generate rich roleplay backstory and history
- `/ai-slogan` — Generate quarter-panel mottos and quotes
- `/ai-name` — Generate realistic fictional county/city names

### Tickets & Support (8 Commands)
- `/ticket-open` — Open support, design, or report ticket
- `/ticket-close` — Close ticket, compile transcript, and generate receipt
- `/ticket-add` — Grant member access to current ticket
- `/ticket-remove` — Remove member from current ticket
- `/ticket-transcript` — Export formatted conversation history file
- `/ticket-claim` — Claim active ticket as handling staff member
- `/ticket-transfer` — Hand off ticket to another team member
- `/ticket-priority` — Set priority: Low, Normal, High, Urgent

### Applications (5 Commands)
- `/apply-designer` — Submit portfolio to join our design team
- `/apply-staff` — Apply for community moderation team
- `/app-review` — Inspect applicant answers & portfolio (Management)
- `/app-accept` — Accept application and assign configured role
- `/app-deny` — Deny application with constructive feedback

### Information (6 Commands)
- `/server-info` — Display community member count, channels, boost stats
- `/rules` — View server rules, order rules, and marketplace rules
- `/department-info` — Display Roblox group data, owner, and join links
- `/price-list` — Official Silence Designs design prices and how to order
- `/schedule` — Operational hours, release drop times, hiring waves
- `/announcement` — View latest official updates from the team

### Moderation (10 Commands)
- `/ban` — Ban member from server with audit log
- `/kick` — Kick member from server
- `/mute` — Timeout member with duration
- `/unmute` — Remove timeout from member
- `/warn` — Issue formal warning recorded in SQLite
- `/warnings` — Inspect warning history and moderator notes
- `/clearwarn` — Clear disciplinary warnings (Staff only)
- `/purge` — Bulk delete up to 100 messages
- `/lock` — Lock channel preventing member chats
- `/unlock` — Restore channel chat permissions

### Utility (6 Commands)
- `/help` — Browse all commands with interactive filters
- `/botinfo` — System stats, Node/discord.js version, uptime, and ping
- `/ping` — Check Discord API latency and websocket heartbeat
- `/profile` — View Silence Designs client profile & order stats
- `/leaderboard` — View top clients and reputable community members
- `/credits` — Official developer credits (**Carlos473**, ID: `1025813762684502168`)

---

## 🎨 Asset Image Customization

Drop your custom `.png` artwork directly into the corresponding folders in `assets/`:
- `assets/commands/` — e.g. `order-create.png`, `order-status.png`, `ticket-open.png`
- `assets/banners/` — e.g. `ticket-panel.png`, `store.png`, `services.png`
- `assets/footers/` — e.g. `silence-designs-footer.png`
- `assets/thumbnails/` — e.g. `support-thumb.png`

The bot automatically attaches available assets. Missing images **never** crash a command.

---

## 🧪 Testing

To run the full automated verification test suite:

```bash
npm test
```

---

## 📄 License & Credits

- **Developer:** Carlos473 (`1025813762684502168`)
- **Branding:** Silence Designs ER:LC Creative Team
- **License:** MIT License — See [LICENSE](LICENSE) for details.
