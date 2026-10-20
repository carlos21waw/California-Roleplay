# 🪟 Windows Local Setup & Hosting Guide — Silence Designs Bot

This guide walks you through setting up and hosting the **Silence Designs Discord Bot** on your local Windows PC (Windows 10 / 11) using PowerShell or Command Prompt.

---

## 1. Prerequisites

1. **Node.js (v20 or v22 recommended)**:
   - Download the LTS installer from [https://nodejs.org](https://nodejs.org).
   - In the installer, check the box to automatically install necessary build tools.
   - Verify installation in PowerShell:
     ```powershell
     node -v
     npm -v
     ```

2. **Git for Windows (Optional)**:
   - Download from [https://git-scm.com](https://git-scm.com).

---

## 2. Discord Developer Portal Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application**, name it **Silence Designs**, and click **Create**.
3. Under the **Bot** tab on the left:
   - Click **Add Bot** (or **Reset Token**).
   - Copy your **Bot Token** and keep it secret.
   - Scroll down to **Privileged Gateway Intents** and enable ALL three:
     - ✅ **Presence Intent**
     - ✅ **Server Members Intent**
     - ✅ **Message Content Intent**
   - Click **Save Changes**.
4. Under the **OAuth2** -> **General** tab:
   - Copy your **Client ID** (Application ID).
5. Under **OAuth2** -> **URL Generator**:
   - Check `bot` and `applications.commands`.
   - Bot Permissions: Check `Administrator` (or Manage Roles, Manage Channels, Kick Members, Ban Members, Moderate Members, Send Messages, Attach Files, Read Message History, Use Slash Commands).
   - Copy the generated URL and open it in your browser to invite the bot to your Discord server.

---

## 3. Project Installation on Windows

Open **Windows PowerShell** or **Command Prompt** in the project folder:

```powershell
# 1. Install dependencies
npm install

# Note: If Windows PowerShell shows an Execution Policy error about npm.ps1,
# run npm using cmd:
npm.cmd install
```

---

## 4. Environment Configuration (.env)

Duplicate `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Open `.env` in Notepad or VS Code and configure:

```env
# Mandatory credentials from Discord Developer Portal
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# For instant slash command registration on your test server:
GUILD_ID=your_server_id_here

# Bot Owner
OWNER_ID=1025813762684502168

# Optional AI Features (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 5. Register Slash Commands

Deploy all 50+ slash commands to Discord:

```powershell
npm run deploy
# or:
npm.cmd run deploy
```

You should see:
```text
[Deploy] SUCCESS: Successfully reloaded application (/) commands!
```

---

## 6. Start the Bot

Start the Discord bot process:

```powershell
npm start
# or:
npm.cmd start
```

You will see:
```text
========================================================
✨ Silence Designs Discord Bot is ONLINE!
Logged in as: Silence Designs#0001
Commands    : 68 loaded
========================================================
[StatusRotation] Started rotating 100 Silence Designs activity statuses.
[GiveawayScheduler] Background timer active for giveaways.
```

---

## 7. Keeping the Bot Online 24/7 (PM2 on Windows)

To run the bot persistently in the background on Windows:

```powershell
npm install -g pm2
pm2 start src/index.js --name "silence-bot"
pm2 save
pm2 startup
```

---

## 8. Database Backups

The bot saves all orders, tickets, warnings, hosting records, and giveaways in `./data/silence_designs.sqlite`.
To back up your data:

```powershell
Copy-Item ./data/silence_designs.sqlite ./data/backup_$(Get-Date -Format "yyyyMMdd").sqlite
```
