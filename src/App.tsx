import React, { useState } from 'react';
import { Terminal, Shield, CheckCircle, Database, Bot, Sparkles, FolderTree, BookOpen, Copy, ExternalLink, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'commands' | 'setup' | 'architecture'>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const commandCategories = [
    {
      name: 'Orders (10 Commands)',
      count: 10,
      color: 'border-sky-500/40 text-sky-400',
      items: [
        { cmd: '/order-create', desc: 'Open guided order modal or select service category' },
        { cmd: '/order-status <order_id>', desc: 'Real-time status, designer, quote & payment status' },
        { cmd: '/order-cancel <order_id>', desc: 'Cancel active commission with audit reason' },
        { cmd: '/order-list [status]', desc: 'List your active and past orders (or server-wide for staff)' },
        { cmd: '/order-claim <order_id>', desc: 'Assign yourself as the designer for an order' },
        { cmd: '/order-complete <order_id>', desc: 'Mark order as completed and delivered to customer' },
        { cmd: '/order-submit <order_id>', desc: 'Upload preview image or livery draft for customer' },
        { cmd: '/order-review <order_id>', desc: 'Leave 1-5 star review and rating for your designer' },
        { cmd: '/order-tip <order_id>', desc: 'Send a tip/donation link to support the designer' },
        { cmd: '/showcase', desc: 'View recent completed ER:LC liveries and client works' }
      ]
    },
    {
      name: 'AI Design Assistance (5 Commands)',
      count: 5,
      color: 'border-purple-500/40 text-purple-400',
      items: [
        { cmd: '/ai-idea <theme>', desc: 'Generate innovative ER:LC livery concepts with Gemini AI' },
        { cmd: '/ai-palette <style>', desc: 'Generate 5-color aesthetic palette with Hex codes & tips' },
        { cmd: '/ai-lore <department>', desc: 'Generate rich roleplay backstory, divisions & history' },
        { cmd: '/ai-slogan <agency>', desc: 'Generate livery quarter-panel mottos and quotes' },
        { cmd: '/ai-name <vibe>', desc: 'Generate realistic fictional county, city & agency names' }
      ]
    },
    {
      name: 'Tickets & Support (8 Commands)',
      count: 8,
      color: 'border-emerald-500/40 text-emerald-400',
      items: [
        { cmd: '/ticket-open [category]', desc: 'Open support, design order, or report ticket' },
        { cmd: '/ticket-close [reason]', desc: 'Close ticket, compile transcript, send receipt DM & archive' },
        { cmd: '/ticket-add <user>', desc: 'Grant a member access to the current ticket channel' },
        { cmd: '/ticket-remove <user>', desc: 'Revoke a member access from current ticket' },
        { cmd: '/ticket-transcript [ref_id]', desc: 'Export formatted conversation history text file' },
        { cmd: '/ticket-claim', desc: 'Claim active ticket as handling staff member' },
        { cmd: '/ticket-transfer <staff>', desc: 'Hand off ticket ownership to another staff member' },
        { cmd: '/ticket-priority <level>', desc: 'Set priority: Low, Normal, High, Urgent' }
      ]
    },
    {
      name: 'Applications (5 Commands)',
      count: 5,
      color: 'border-amber-500/40 text-amber-400',
      items: [
        { cmd: '/apply-designer', desc: 'Submit portfolio to join our design team' },
        { cmd: '/apply-staff', desc: 'Apply for community moderation & management' },
        { cmd: '/app-review <id>', desc: 'Inspect applicant answers & portfolio (Management)' },
        { cmd: '/app-accept <id>', desc: 'Accept application and assign configured role' },
        { cmd: '/app-deny <id>', desc: 'Deny application with constructive feedback' }
      ]
    },
    {
      name: 'Information (6 Commands)',
      count: 6,
      color: 'border-cyan-500/40 text-cyan-400',
      items: [
        { cmd: '/server-info', desc: 'Display community member count, channels, boost stats' },
        { cmd: '/rules [section]', desc: 'View server rules, order rules, and marketplace rules' },
        { cmd: '/department-info', desc: 'Display Roblox group data, owner, and join links' },
        { cmd: '/price-list', desc: 'Official Silence Designs design prices and how to order' },
        { cmd: '/schedule', desc: 'Operational hours, release drop times, hiring waves' },
        { cmd: '/announcement', desc: 'View latest official updates from the team' }
      ]
    },
    {
      name: 'Moderation (10 Commands)',
      count: 10,
      color: 'border-rose-500/40 text-rose-400',
      items: [
        { cmd: '/ban <user> [reason]', desc: 'Ban member from server with audit log' },
        { cmd: '/kick <user> [reason]', desc: 'Kick member from server' },
        { cmd: '/mute <user> <mins>', desc: 'Timeout member with duration' },
        { cmd: '/unmute <user>', desc: 'Remove timeout from member' },
        { cmd: '/warn <user> <reason>', desc: 'Issue formal warning recorded in SQLite' },
        { cmd: '/warnings [user]', desc: 'Inspect warning history and moderator notes' },
        { cmd: '/clearwarn <user>', desc: 'Clear disciplinary warnings (Staff only)' },
        { cmd: '/purge <amount>', desc: 'Bulk delete up to 100 messages' },
        { cmd: '/lock [reason]', desc: 'Lock channel preventing member chats' },
        { cmd: '/unlock', desc: 'Restore channel chat permissions' }
      ]
    },
    {
      name: 'Utility (6 Commands)',
      count: 6,
      color: 'border-slate-500/40 text-slate-300',
      items: [
        { cmd: '/help [category]', desc: 'Browse all commands with interactive category filters' },
        { cmd: '/botinfo', desc: 'System stats, Node/discord.js version, uptime, and ping' },
        { cmd: '/ping', desc: 'Check Discord API latency and websocket heartbeat' },
        { cmd: '/profile [user]', desc: 'View Silence Designs client profile & order stats' },
        { cmd: '/leaderboard', desc: 'View top clients and reputable community members' },
        { cmd: '/credits', desc: 'Official developer credits (Carlos473) & team roster' }
      ]
    },
    {
      name: 'Management & Panels (16 Commands)',
      count: 16,
      color: 'border-blue-500/40 text-blue-400',
      items: [
        { cmd: '/botsay', desc: 'Publish custom embeds with colors, attachments, and role pings' },
        { cmd: '/service-status', desc: 'Toggle services Open/Closed in real-time' },
        { cmd: '/service-panel', desc: 'Publish interactive Services Panel with status dropdown' },
        { cmd: '/store-panel', desc: 'Publish persistent Server Store Panel with Roblox buy links' },
        { cmd: '/faq-panel', desc: 'Publish 15-question interactive FAQ panel with assistance button' },
        { cmd: '/marketplace-panel', desc: 'Publish Marketplace pricing and advertisement slots' },
        { cmd: '/giveaway-create', desc: 'Create persistent giveaway with timer recovery & entry tracking' },
        { cmd: '/giveaway-end', desc: 'Conclude giveaway immediately and announce winners' },
        { cmd: '/giveaway-reroll', desc: 'Pick new winners for an ended giveaway' },
        { cmd: '/release', desc: 'Publish asset release with ZIP attachments and previews' },
        { cmd: '/manage-hosting', desc: 'Subcommand structure for client and staff bot hosting records' },
        { cmd: '/hosting-pricing', desc: 'Display dedicated bot hosting plans & pricing' },
        { cmd: '/ticket-panel', desc: 'Publish 10-category persistent ticket creation panel' },
        { cmd: '/application-panel', desc: 'Publish recruitment panel with interactive buttons' },
        { cmd: '/paid-advertisement', desc: 'Publish approved advertising pings with safe text formatting' },
        { cmd: '/settings', desc: 'Review runtime configuration and assigned role/channel IDs' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e0e6ed] font-sans antialiased selection:bg-sky-500/30 selection:text-sky-300">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#111622]/90 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold text-xl">
              💎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">SILENCE DESIGNS</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  DISCORD BOT v1.0
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  STANDALONE NODE.JS PACKAGE
                </span>
              </div>
              <p className="text-xs text-slate-400">Your vision. Our design. • Lead Developer: Carlos473 (1025813762684502168)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'commands'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              50+ Commands Explorer
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'setup'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Windows Setup Guide
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'architecture'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Architecture & SQLite
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Banner Alert */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141b2d] via-[#101726] to-[#121c2f] border border-sky-500/20 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mt-1">
                  <Terminal className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">Standalone Discord.js Bot Package Ready for Local Execution</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    This repository is a fully functional, complete Discord bot codebase ready to run locally on your Windows PC or Linux server.
                    All customer-facing features operate inside Discord using slash commands, embeds, buttons, dropdowns, and private ticket channels.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('setup')}
                      className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-[#0b0e14] font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition"
                    >
                      <Zap className="w-4 h-4" /> Run on Windows PowerShell
                    </button>
                    <button
                      onClick={() => setActiveTab('commands')}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs flex items-center gap-2 transition"
                    >
                      <Bot className="w-4 h-4" /> Inspect All 68 Slash Commands
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#121722] border border-white/5">
                <div className="text-xs text-slate-400 font-medium">Slash Commands</div>
                <div className="text-2xl font-bold text-white mt-1">68 Registered</div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> All 50 required + 18 management
                </div>
              </div>
              <div className="p-5 rounded-xl bg-[#121722] border border-white/5">
                <div className="text-xs text-slate-400 font-medium">Activity Statuses</div>
                <div className="text-2xl font-bold text-white mt-1">100 Unique</div>
                <div className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Auto-rotated safely every 30s
                </div>
              </div>
              <div className="p-5 rounded-xl bg-[#121722] border border-white/5">
                <div className="text-xs text-slate-400 font-medium">Database Persistence</div>
                <div className="text-2xl font-bold text-white mt-1">SQLite (WAL)</div>
                <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> Local file, zero cloud fees
                </div>
              </div>
              <div className="p-5 rounded-xl bg-[#121722] border border-white/5">
                <div className="text-xs text-slate-400 font-medium">AI & Integrations</div>
                <div className="text-2xl font-bold text-white mt-1">Gemini & Roblox</div>
                <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Optional key, graceful fallback
                </div>
              </div>
            </div>

            {/* Quick Run Commands Box */}
            <div className="p-6 rounded-2xl bg-[#121722] border border-white/10 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                Local Execution Command Snippet
              </h3>
              <p className="text-xs text-slate-400">
                Run these four commands inside PowerShell or Command Prompt in this folder:
              </p>
              <div className="p-4 rounded-xl bg-[#090c12] border border-white/5 font-mono text-xs text-slate-200 relative group">
                <button
                  onClick={() => copyToClipboard('npm install\nCopy-Item .env.example .env\nnpm run deploy\nnpm start', 'quickrun')}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                  title="Copy Commands"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <div className="text-slate-500"># 1. Install dependencies</div>
                <div className="text-emerald-400">npm install</div>
                <div className="text-slate-500 mt-2"># 2. Setup your bot token</div>
                <div className="text-emerald-400">Copy-Item .env.example .env</div>
                <div className="text-slate-500 mt-2"># 3. Deploy all 50+ slash commands to Discord API</div>
                <div className="text-sky-400">npm run deploy</div>
                <div className="text-slate-500 mt-2"># 4. Launch Silence Designs Bot</div>
                <div className="text-purple-400">npm start</div>
              </div>
              {copiedText === 'quickrun' && (
                <div className="text-xs text-emerald-400 font-semibold animate-pulse">
                  ✓ Copied commands to clipboard!
                </div>
              )}
            </div>

            {/* System Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-[#121722] border border-white/5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="p-1 rounded bg-sky-500/20 text-sky-400">📦</span>
                  Order Management System
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Full commission lifecycle: creation modal, review step, assigned designer, real-time status tracker, draft uploads,
                  and 1-5 star reviews saved to SQLite.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#121722] border border-white/5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">🎫</span>
                  Persistent Ticket System
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  10 distinct ticket categories, private channels, claim controls, staff transfer, and closure receipt with full
                  downloadable text transcripts.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#121722] border border-white/5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="p-1 rounded bg-purple-500/20 text-purple-400">🔮</span>
                  AI Design & Roblox Links
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Google Gemini powers `/ai-idea`, `/ai-palette`, `/ai-lore`, `/ai-slogan`, and `/ai-name`.
                  Official Roblox developer products for Silence Designs+ and community donations.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'commands' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Slash Commands Registry (68 Total)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Every command is implemented in its own modular file under <code className="text-sky-400">src/commands/</code> with full permission checks, embeds, and SQLite persistence.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {commandCategories.map((cat, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#121722] border border-white/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className={`text-sm font-bold tracking-tight ${cat.color}`}>{cat.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/5 text-slate-300">
                      {cat.count} commands
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="p-2.5 rounded-lg bg-[#0b0e14]/80 border border-white/5 hover:border-white/10 transition">
                        <div className="font-mono text-xs font-semibold text-sky-300">{item.cmd}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Windows Local Setup Instructions</h2>
              <p className="text-xs text-slate-400 mt-1">
                Follow these exact steps to run Silence Designs on Windows 10/11 using PowerShell.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#121722] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">1</span>
                  Create Discord Application & Get Bot Token
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  Open the <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">Discord Developer Portal</a>, create a New Application named <strong>Silence Designs</strong>, navigate to the <strong>Bot</strong> tab, and click <strong>Reset Token</strong>. Under <strong>Privileged Gateway Intents</strong>, turn ON all three: <em>Presence Intent</em>, <em>Server Members Intent</em>, and <em>Message Content Intent</em>.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#121722] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">2</span>
                  Invite Bot to Your Discord Server
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  In the Developer Portal, go to <strong>OAuth2 &gt; URL Generator</strong>, check <code>bot</code> and <code>applications.commands</code>, grant <code>Administrator</code> permissions, and open the generated invite link.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#121722] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">3</span>
                  Configure Environment Variables (.env)
                </div>
                <div className="pl-8 space-y-2">
                  <p className="text-xs text-slate-300">
                    Duplicate <code>.env.example</code> to <code>.env</code> in PowerShell:
                  </p>
                  <pre className="p-3 rounded-lg bg-[#090c12] text-xs font-mono text-emerald-400">Copy-Item .env.example .env</pre>
                  <p className="text-xs text-slate-400">
                    Open <code>.env</code> and fill in <code>DISCORD_TOKEN</code>, <code>CLIENT_ID</code>, and your test <code>GUILD_ID</code>.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#121722] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">4</span>
                  Deploy Commands & Start the Bot
                </div>
                <div className="pl-8 space-y-2">
                  <pre className="p-3 rounded-lg bg-[#090c12] text-xs font-mono text-sky-400">npm run deploy
npm start</pre>
                  <p className="text-xs text-slate-400">
                    If Windows PowerShell execution policy blocks <code>npm.ps1</code>, use <code>npm.cmd start</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Technical Architecture & SQLite Schemas</h2>
              <p className="text-xs text-slate-400 mt-1">
                Zero external database dependencies. Runs locally on native SQLite with Write-Ahead Logging (WAL).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#121722] border border-white/5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  SQLite Tables in ./data/
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                  <li>• orders (ID, client, service, status, quote, review)</li>
                  <li>• order_history (audit logs of status changes)</li>
                  <li>• tickets (ID, ref_id, channel, inquiry, claimed_by)</li>
                  <li>• ticket_messages (transcripts conversation cache)</li>
                  <li>• applications (designer & staff portfolio submissions)</li>
                  <li>• warnings (disciplinary infractions)</li>
                  <li>• giveaways (timer, prizes, entries, winners)</li>
                  <li>• hosting_records (bot hosting dates & plans)</li>
                  <li>• marketplace_ads (30-day channel expiry scheduler)</li>
                  <li>• persistent_panels (stored panel message IDs)</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-[#121722] border border-white/5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-sky-400" />
                  Assets Directory Mapping
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Custom PNG artwork can be placed in <code>assets/</code> without modifying any source code:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 font-mono">
                  <li>• assets/commands/ (command icons)</li>
                  <li>• assets/banners/ (panel top banners)</li>
                  <li>• assets/footers/ (silence-designs-footer.png)</li>
                  <li>• assets/thumbnails/ (square logos)</li>
                  <li>• assets/branding/ (watermarks)</li>
                </ul>
                <p className="text-[11px] text-emerald-400">
                  ✓ Built-in fallback: Missing images never throw exceptions.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0d1017] px-6 py-6 text-center text-xs text-slate-500">
        <p>SILENCE DESIGNS — Your vision. Our design. • Built for Carlos473 & ER:LC Design Operations</p>
        <p className="mt-1 text-[11px] text-slate-600">Local Discord Bot deliverable • No web hosting required • 100% Standalone</p>
      </footer>
    </div>
  );
}
