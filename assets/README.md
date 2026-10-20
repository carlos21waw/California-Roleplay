# Silence Designs — Asset Directory & Image Mapping Guide

This folder holds all custom PNG graphic assets for Silence Designs Discord embeds, banners, thumbnails, and commands.

## How to Add Custom PNG Images

You can place your custom PNG artwork in any of the corresponding subfolders below. The bot automatically checks for the files and includes them in Discord embeds. Missing image files will **never** crash a command; the bot uses graceful embedded fallbacks when an image is absent.

### Folder Mapping

- `assets/commands/` — Command-specific icons and embeds
  - `order-create.png`
  - `order-status.png`
  - `order-list.png`
  - `ticket-open.png`
  - `server-info.png`
  - `price-list.png`
  - `showcase.png`
  - `rules.png`

- `assets/banners/` — Large top banners for persistent panels
  - `ticket-panel.png`
  - `store.png`
  - `services.png`
  - `faq.png`
  - `marketplace.png`

- `assets/footers/` — Sleek bottom divider banners
  - `silence-designs-footer.png`

- `assets/thumbnails/` — Square icon graphics (e.g. 512x512)
  - `order-thumb.png`
  - `support-thumb.png`
  - `giveaway-thumb.png`

- `assets/branding/` — Core identity assets
  - `silence-designs-logo.png`
  - `watermark.png`

- `assets/services/` — Service showcase graphics (Livery, Clothing, Graphics, Bots)
- `assets/store/` — Product and donation graphics
- `assets/releases/` — Livery templates and drop previews
- `assets/giveaways/` — Promotional giveaway graphics

### Image Guidelines

- Format: `.png` (recommended) or `.jpg`
- Embed Banners: `1920x1080` or `1200x400`
- Embed Thumbnails: `512x512` or `256x256`
- Footer Banners: `1200x150`
