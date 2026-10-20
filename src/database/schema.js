/**
 * Silence Designs — SQLite Database Schema Definitions
 */

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_tag TEXT NOT NULL,
  roblox_username TEXT,
  service_type TEXT NOT NULL,
  description TEXT NOT NULL,
  preferred_colors TEXT,
  requested_text TEXT,
  attachments TEXT,
  additional_notes TEXT,
  designer_id TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  price_estimate TEXT DEFAULT 'Pending Quote',
  payment_status TEXT NOT NULL DEFAULT 'Unpaid',
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  review TEXT,
  rating INTEGER
);

CREATE TABLE IF NOT EXISTS order_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  ref_id TEXT UNIQUE NOT NULL,
  channel_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_tag TEXT NOT NULL,
  roblox_username TEXT,
  category TEXT NOT NULL,
  inquiry TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  claimed_by TEXT,
  priority TEXT NOT NULL DEFAULT 'Normal',
  created_at INTEGER NOT NULL,
  closed_at INTEGER,
  closure_reason TEXT
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_ref_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_tag TEXT NOT NULL,
  content TEXT,
  attachments TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_tag TEXT NOT NULL,
  roblox_username TEXT,
  app_type TEXT NOT NULL,
  portfolio TEXT,
  experience TEXT NOT NULL,
  answers TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  reviewer_id TEXT,
  review_notes TEXT,
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);

CREATE TABLE IF NOT EXISTS warnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  moderator_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS moderation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  action TEXT NOT NULL,
  moderator_id TEXT NOT NULL,
  reason TEXT,
  duration TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS service_statuses (
  service_name TEXT PRIMARY KEY,
  is_open INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS giveaways (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  prize TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sponsor TEXT NOT NULL,
  server_name TEXT NOT NULL,
  server_invite TEXT,
  image_url TEXT,
  winner_count INTEGER NOT NULL DEFAULT 1,
  end_time INTEGER NOT NULL,
  ping_role TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  winners TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  giveaway_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  entered_at INTEGER NOT NULL,
  UNIQUE(giveaway_id, user_id),
  FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hosting_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_tag TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  order_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  start_date INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  renewal_info TEXT
);

CREATE TABLE IF NOT EXISTS marketplace_ads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_tag TEXT NOT NULL,
  ad_type TEXT NOT NULL,
  add_ons TEXT,
  payment_verified INTEGER NOT NULL DEFAULT 0,
  queue_pos INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Queued',
  channel_id TEXT,
  expires_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS persistent_panels (
  panel_type TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  roblox_username TEXT,
  bio TEXT,
  orders_completed INTEGER DEFAULT 0,
  reviews_given INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  tips_given INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  payload TEXT,
  execute_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending'
);
`;

export default SCHEMA_SQL;
