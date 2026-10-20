import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import config from '../config/config.js';
import { SCHEMA_SQL } from './schema.js';

let dbInstance = null;

class DatabaseWrapper {
  constructor(filePath) {
    this.rawDb = new DatabaseSync(filePath);
  }

  async exec(sql) {
    return this.rawDb.exec(sql);
  }

  async run(sql, params = []) {
    const stmt = this.rawDb.prepare(sql);
    const result = stmt.run(...params);
    return {
      lastID: result.lastInsertRowid,
      changes: result.changes
    };
  }

  async get(sql, params = []) {
    const stmt = this.rawDb.prepare(sql);
    const row = stmt.get(...params);
    return row || null;
  }

  async all(sql, params = []) {
    const stmt = this.rawDb.prepare(sql);
    return stmt.all(...params);
  }
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  const dbDir = path.dirname(config.databasePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new DatabaseWrapper(config.databasePath);

  // Enable WAL mode
  await dbInstance.exec('PRAGMA journal_mode = WAL;');
  await dbInstance.exec('PRAGMA foreign_keys = ON;');

  // Run schema definitions
  await dbInstance.exec(SCHEMA_SQL);

  // Seed default service statuses if not yet created
  const defaultServices = ['Clothing', 'Livery', 'Graphics', 'Bot Development'];
  const now = Date.now();
  for (const s of defaultServices) {
    const existing = await dbInstance.get('SELECT service_name FROM service_statuses WHERE service_name = ?', [s]);
    if (!existing) {
      await dbInstance.run(
        "INSERT INTO service_statuses (service_name, is_open, updated_by, updated_at) VALUES (?, 1, 'SYSTEM', ?)",
        [s, now]
      );
    }
  }

  return dbInstance;
}

// ----------------- ORDERS -----------------
export async function createOrder(data) {
  const db = await getDb();
  await db.run(
    `INSERT INTO orders (
      id, user_id, user_tag, roblox_username, service_type, description,
      preferred_colors, requested_text, attachments, additional_notes,
      designer_id, status, price_estimate, payment_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.userId,
      data.userTag,
      data.robloxUsername || null,
      data.serviceType,
      data.description,
      data.preferredColors || 'None specified',
      data.requestedText || 'None specified',
      data.attachments || null,
      data.additionalNotes || null,
      data.designerId || null,
      data.status || 'Pending',
      data.priceEstimate || 'Pending Quote',
      data.paymentStatus || 'Unpaid',
      data.createdAt || Date.now()
    ]
  );
  return getOrder(data.id);
}

export async function getOrder(id) {
  const db = await getDb();
  return db.get('SELECT * FROM orders WHERE id = ?', [id]);
}

export async function getUserOrders(userId) {
  const db = await getDb();
  return db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

export async function getAllOrders(status = null) {
  const db = await getDb();
  if (status) {
    return db.all('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC', [status]);
  }
  return db.all('SELECT * FROM orders ORDER BY created_at DESC');
}

export async function updateOrder(id, updates) {
  const db = await getDb();
  const fields = [];
  const values = [];
  for (const [key, val] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(val);
  }
  values.push(id);
  await db.run(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
  return getOrder(id);
}

export async function addOrderHistory(orderId, actorId, oldStatus, newStatus, note = '') {
  const db = await getDb();
  return db.run(
    'INSERT INTO order_history (order_id, actor_id, old_status, new_status, note, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [orderId, actorId, oldStatus, newStatus, note, Date.now()]
  );
}

// ----------------- TICKETS -----------------
export async function createTicket(data) {
  const db = await getDb();
  await db.run(
    `INSERT INTO tickets (
      id, ref_id, channel_id, guild_id, user_id, user_tag, roblox_username,
      category, inquiry, status, claimed_by, priority, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?)`,
    [
      data.id,
      data.refId,
      data.channelId,
      data.guildId,
      data.userId,
      data.userTag,
      data.robloxUsername || 'Not Provided',
      data.category,
      data.inquiry,
      data.claimedBy || null,
      data.priority || 'Normal',
      data.createdAt || Date.now()
    ]
  );
  return getTicketByRef(data.refId);
}

export async function getTicketByChannel(channelId) {
  const db = await getDb();
  return db.get('SELECT * FROM tickets WHERE channel_id = ? AND status = "Open"', [channelId]);
}

export async function getTicketByRef(refId) {
  const db = await getDb();
  return db.get('SELECT * FROM tickets WHERE ref_id = ?', [refId]);
}

export async function updateTicket(refId, updates) {
  const db = await getDb();
  const fields = [];
  const values = [];
  for (const [key, val] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(val);
  }
  values.push(refId);
  await db.run(`UPDATE tickets SET ${fields.join(', ')} WHERE ref_id = ?`, values);
  return getTicketByRef(refId);
}

export async function saveTicketMessage(refId, authorId, authorTag, content, attachments = '') {
  const db = await getDb();
  return db.run(
    'INSERT INTO ticket_messages (ticket_ref_id, author_id, author_tag, content, attachments, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [refId, authorId, authorTag, content, attachments, Date.now()]
  );
}

export async function getTicketMessages(refId) {
  const db = await getDb();
  return db.all('SELECT * FROM ticket_messages WHERE ticket_ref_id = ? ORDER BY created_at ASC', [refId]);
}

// ----------------- SERVICES -----------------
export async function getServicesStatus() {
  const db = await getDb();
  return db.all('SELECT * FROM service_statuses ORDER BY service_name ASC');
}

export async function getServiceStatus(name) {
  const db = await getDb();
  return db.get('SELECT * FROM service_statuses WHERE service_name = ?', [name]);
}

export async function setServiceStatus(name, isOpen, updatedBy) {
  const db = await getDb();
  await db.run(
    'INSERT INTO service_statuses (service_name, is_open, updated_by, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(service_name) DO UPDATE SET is_open = ?, updated_by = ?, updated_at = ?',
    [name, isOpen ? 1 : 0, updatedBy, Date.now(), isOpen ? 1 : 0, updatedBy, Date.now()]
  );
  return getServiceStatus(name);
}

// ----------------- GIVEAWAYS -----------------
export async function createGiveaway(data) {
  const db = await getDb();
  await db.run(
    `INSERT INTO giveaways (
      id, message_id, channel_id, guild_id, prize, title, description,
      sponsor, server_name, server_invite, image_url, winner_count, end_time,
      ping_role, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)`,
    [
      data.id,
      data.messageId,
      data.channelId,
      data.guildId,
      data.prize,
      data.title,
      data.description || '',
      data.sponsor,
      data.serverName,
      data.serverInvite || null,
      data.imageUrl || null,
      data.winnerCount || 1,
      data.endTime,
      data.pingRole || null,
      Date.now()
    ]
  );
  return getGiveaway(data.id);
}

export async function getGiveaway(id) {
  const db = await getDb();
  return db.get('SELECT * FROM giveaways WHERE id = ?', [id]);
}

export async function getGiveawayByMessage(messageId) {
  const db = await getDb();
  return db.get('SELECT * FROM giveaways WHERE message_id = ?', [messageId]);
}

export async function getActiveGiveaways() {
  const db = await getDb();
  return db.all('SELECT * FROM giveaways WHERE status = "Active"');
}

export async function addGiveawayEntry(giveawayId, userId) {
  const db = await getDb();
  try {
    await db.run(
      'INSERT INTO giveaway_entries (giveaway_id, user_id, entered_at) VALUES (?, ?, ?)',
      [giveawayId, userId, Date.now()]
    );
    return { success: true };
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return { success: false, duplicate: true };
    }
    throw err;
  }
}

export async function getGiveawayEntries(giveawayId) {
  const db = await getDb();
  return db.all('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?', [giveawayId]);
}

export async function getGiveawayEntryCount(giveawayId) {
  const db = await getDb();
  const row = await db.get('SELECT COUNT(*) as count FROM giveaway_entries WHERE giveaway_id = ?', [giveawayId]);
  return row ? row.count : 0;
}

export async function completeGiveaway(id, winners) {
  const db = await getDb();
  await db.run(
    'UPDATE giveaways SET status = "Ended", winners = ? WHERE id = ?',
    [JSON.stringify(winners), id]
  );
  return getGiveaway(id);
}

// ----------------- HOSTING -----------------
export async function createHostingRecord(data) {
  const db = await getDb();
  await db.run(
    `INSERT INTO hosting_records (
      id, user_id, user_tag, bot_name, order_id, plan, status, start_date, expires_at, renewal_info
    ) VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?)`,
    [
      data.id,
      data.userId,
      data.userTag,
      data.botName,
      data.orderId || null,
      data.plan,
      data.startDate || Date.now(),
      data.expiresAt,
      data.renewalInfo || 'Auto-renewal pending client payment'
    ]
  );
  return getHostingRecord(data.id);
}

export async function getUserHosting(userId) {
  const db = await getDb();
  return db.all('SELECT * FROM hosting_records WHERE user_id = ? ORDER BY start_date DESC', [userId]);
}

export async function getHostingRecord(id) {
  const db = await getDb();
  return db.get('SELECT * FROM hosting_records WHERE id = ?', [id]);
}

export async function updateHosting(id, updates) {
  const db = await getDb();
  const fields = [];
  const values = [];
  for (const [key, val] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(val);
  }
  values.push(id);
  await db.run(`UPDATE hosting_records SET ${fields.join(', ')} WHERE id = ?`, values);
  return getHostingRecord(id);
}

// ----------------- MODERATION -----------------
export async function addWarning(userId, guildId, moderatorId, reason) {
  const db = await getDb();
  const res = await db.run(
    'INSERT INTO warnings (user_id, guild_id, moderator_id, reason, created_at) VALUES (?, ?, ?, ?, ?)',
    [userId, guildId, moderatorId, reason, Date.now()]
  );
  return { id: res.lastID, userId, guildId, moderatorId, reason, createdAt: Date.now() };
}

export async function getWarnings(userId, guildId) {
  const db = await getDb();
  return db.all('SELECT * FROM warnings WHERE user_id = ? AND guild_id = ? ORDER BY created_at DESC', [userId, guildId]);
}

export async function clearWarnings(userId, guildId) {
  const db = await getDb();
  const res = await db.run('DELETE FROM warnings WHERE user_id = ? AND guild_id = ?', [userId, guildId]);
  return res.changes;
}

export async function logModeration(userId, guildId, action, moderatorId, reason = 'No reason provided', duration = null) {
  const db = await getDb();
  return db.run(
    'INSERT INTO moderation_logs (user_id, guild_id, action, moderator_id, reason, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, guildId, action, moderatorId, reason, duration, Date.now()]
  );
}

// ----------------- APPLICATIONS -----------------
export async function createApplication(data) {
  const db = await getDb();
  await db.run(
    `INSERT INTO applications (
      id, user_id, user_tag, roblox_username, app_type, portfolio, experience, answers, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
    [
      data.id,
      data.userId,
      data.userTag,
      data.robloxUsername || 'Not Provided',
      data.appType,
      data.portfolio || 'None Provided',
      data.experience,
      JSON.stringify(data.answers || {}),
      Date.now()
    ]
  );
  return getApplication(data.id);
}

export async function getApplication(id) {
  const db = await getDb();
  return db.get('SELECT * FROM applications WHERE id = ?', [id]);
}

export async function updateApplication(id, updates) {
  const db = await getDb();
  const fields = [];
  const values = [];
  for (const [key, val] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(val);
  }
  values.push(id);
  await db.run(`UPDATE applications SET ${fields.join(', ')} WHERE id = ?`, values);
  return getApplication(id);
}

// ----------------- PERSISTENT PANELS -----------------
export async function savePersistentPanel(panelType, guildId, channelId, messageId) {
  const db = await getDb();
  await db.run(
    `INSERT INTO persistent_panels (panel_type, guild_id, channel_id, message_id, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(panel_type) DO UPDATE SET guild_id = ?, channel_id = ?, message_id = ?, updated_at = ?`,
    [panelType, guildId, channelId, messageId, Date.now(), guildId, channelId, messageId, Date.now()]
  );
}

export async function getPersistentPanel(panelType) {
  const db = await getDb();
  return db.get('SELECT * FROM persistent_panels WHERE panel_type = ?', [panelType]);
}

// ----------------- USER PROFILES & LEADERBOARDS -----------------
export async function getOrCreateUserProfile(userId, robloxUsername = null) {
  const db = await getDb();
  let profile = await db.get('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
  if (!profile) {
    await db.run(
      'INSERT INTO user_profiles (user_id, roblox_username, bio, orders_completed, reviews_given, reputation, tips_given, created_at) VALUES (?, ?, "Silence Designs Client", 0, 0, 0, 0, ?)',
      [userId, robloxUsername, Date.now()]
    );
    profile = await db.get('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
  } else if (robloxUsername && !profile.roblox_username) {
    await db.run('UPDATE user_profiles SET roblox_username = ? WHERE user_id = ?', [robloxUsername, userId]);
    profile.roblox_username = robloxUsername;
  }
  return profile;
}

export async function getLeaderboard(limit = 10) {
  const db = await getDb();
  return db.all('SELECT * FROM user_profiles ORDER BY orders_completed DESC, reputation DESC LIMIT ?', [limit]);
}

export async function incrementUserProfile(userId, field, amount = 1) {
  const db = await getDb();
  await getOrCreateUserProfile(userId);
  await db.run(`UPDATE user_profiles SET ${field} = ${field} + ? WHERE user_id = ?`, [amount, userId]);
}

export default {
  getDb,
  createOrder,
  getOrder,
  getUserOrders,
  getAllOrders,
  updateOrder,
  addOrderHistory,
  createTicket,
  getTicketByChannel,
  getTicketByRef,
  updateTicket,
  saveTicketMessage,
  getTicketMessages,
  getServicesStatus,
  getServiceStatus,
  setServiceStatus,
  createGiveaway,
  getGiveaway,
  getGiveawayByMessage,
  getActiveGiveaways,
  addGiveawayEntry,
  getGiveawayEntries,
  getGiveawayEntryCount,
  completeGiveaway,
  createHostingRecord,
  getUserHosting,
  getHostingRecord,
  updateHosting,
  addWarning,
  getWarnings,
  clearWarnings,
  logModeration,
  createApplication,
  getApplication,
  updateApplication,
  savePersistentPanel,
  getPersistentPanel,
  getOrCreateUserProfile,
  getLeaderboard,
  incrementUserProfile
};
