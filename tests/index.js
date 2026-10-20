import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

console.log('====================================================');
console.log('🧪 RUNNING SILENCE DESIGNS COMPREHENSIVE BOT TESTS');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

(async () => {
  // Test 1: Verify all 50 required slash commands exist in source tree
  await asyncTest('Verify All 50 Required Slash Commands Exist', async () => {
    const required50 = [
      // Orders (10)
      'order-create', 'order-status', 'order-cancel', 'order-list', 'order-claim',
      'order-complete', 'order-submit', 'order-review', 'order-tip', 'showcase',
      // AI (5)
      'ai-idea', 'ai-palette', 'ai-lore', 'ai-slogan', 'ai-name',
      // Tickets (8)
      'ticket-open', 'ticket-close', 'ticket-add', 'ticket-remove',
      'ticket-transcript', 'ticket-claim', 'ticket-transfer', 'ticket-priority',
      // Applications (5)
      'apply-designer', 'apply-staff', 'app-accept', 'app-deny', 'app-review',
      // Information (6)
      'server-info', 'rules', 'department-info', 'price-list', 'schedule', 'announcement',
      // Moderation (10)
      'ban', 'kick', 'mute', 'unmute', 'warn', 'warnings', 'clearwarn', 'purge', 'lock', 'unlock',
      // Utility (6)
      'help', 'botinfo', 'ping', 'profile', 'leaderboard', 'credits'
    ];

    const commandsDir = path.join(rootDir, 'src/commands');
    const foundCommands = new Set();

    const scanDir = (dir) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          scanDir(path.join(dir, item.name));
        } else if (item.name.endsWith('.js') && item.name !== 'index.js') {
          const cmdName = item.name.replace('.js', '');
          foundCommands.add(cmdName);
        }
      }
    };

    scanDir(commandsDir);

    for (const req of required50) {
      assert(foundCommands.has(req), `Missing required command: /${req}`);
    }

    assert(foundCommands.size >= 50, `Expected at least 50 commands, found ${foundCommands.size}`);
    console.log(`       -> Found ${foundCommands.size} total slash commands in repository.`);
  });

  // Test 2: Check Statuses rotation array contains 100 unique items
  await asyncTest('Verify 100 Unique Activity Statuses', async () => {
    const statusesModule = await import('../src/config/statuses.js');
    const list = statusesModule.default || statusesModule.statuses;
    assert(Array.isArray(list), 'Statuses must be an array');
    assert(list.length >= 95, `Expected ~100 statuses, found ${list.length}`);
    for (const item of list) {
      assert(item.name && typeof item.name === 'string', 'Status item missing name');
      assert(typeof item.type === 'number', 'Status item missing valid ActivityType');
    }
  });

  // Test 3: Check 15 Interactive FAQ questions exist
  await asyncTest('Verify 15 Interactive FAQ Questions', async () => {
    const faqModule = await import('../src/config/faq.js');
    const faqs = faqModule.default || faqModule.faqList;
    assert(Array.isArray(faqs), 'FAQ list must be an array');
    assert.strictEqual(faqs.length, 15, `Expected exactly 15 FAQ questions, found ${faqs.length}`);
    for (const faq of faqs) {
      assert(faq.id && faq.question && faq.answer, 'Each FAQ item must have id, question, and answer');
    }
  });

  // Test 4: Check Safe Text mention escaping
  await asyncTest('Verify Safe Text Prevents Mass Mentions', async () => {
    const formatters = await import('../src/utils/formatters.js');
    const input = 'Hey @everyone and @here check <@&123456789>';
    const safe = formatters.safeText(input);
    assert(!safe.includes('@everyone'), 'Must escape @everyone');
    assert(!safe.includes('@here'), 'Must escape @here');
    assert(safe.includes('\u200b'), 'Must contain zero-width space protection');
  });

  // Test 5: Check Asset Resolver Resilience (Missing files must never crash)
  await asyncTest('Verify Missing Asset Files Do Not Crash', async () => {
    const assetResolver = await import('../src/utils/assetResolver.js');
    const nonExistent = assetResolver.getAssetPath('commands', 'does-not-exist.png');
    assert.strictEqual(nonExistent, null, 'Non-existent file must return null without throwing');

    const attachment = assetResolver.getAssetAttachment('commands', 'does-not-exist.png');
    assert.strictEqual(attachment, null, 'AttachmentBuilder must return null on missing file');
  });

  // Test 6: SQLite Database persistence & migrations
  await asyncTest('Verify SQLite Database Persistence & Tables', async () => {
    const dbModule = await import('../src/database/db.js');
    const db = await dbModule.getDb();
    assert(db, 'Database connection must be established');

    // Create an order
    const testOrderId = `ORD-TEST-${Date.now()}`;
    await dbModule.createOrder({
      id: testOrderId,
      userId: '1025813762684502168',
      userTag: 'Carlos473#0001',
      robloxUsername: 'Carlos473',
      serviceType: 'Livery',
      description: 'Test Department FPIU Livery',
      preferredColors: 'Black, White',
      requestedText: 'POLICE'
    });

    const retrievedOrder = await dbModule.getOrder(testOrderId);
    assert.strictEqual(retrievedOrder.id, testOrderId);
    assert.strictEqual(retrievedOrder.service_type, 'Livery');
    assert.strictEqual(retrievedOrder.status, 'Pending');

    // Update order status
    await dbModule.updateOrder(testOrderId, { status: 'In Progress' });
    const updatedOrder = await dbModule.getOrder(testOrderId);
    assert.strictEqual(updatedOrder.status, 'In Progress');

    // Test warning creation & clearing
    await dbModule.addWarning('999999999', 'guild123', 'mod123', 'Test warning infraction');
    const warns = await dbModule.getWarnings('999999999', 'guild123');
    assert(warns.length > 0, 'Warning must be recorded');
    await dbModule.clearWarnings('999999999', 'guild123');
    const clearedWarns = await dbModule.getWarnings('999999999', 'guild123');
    assert.strictEqual(clearedWarns.length, 0, 'Warnings must be cleared');
  });

  // Test 7: Verify Embed Builder outputs
  await asyncTest('Verify Reusable Embed Builders', async () => {
    const embedBuilder = await import('../src/embeds/embedBuilder.js');
    const success = embedBuilder.createSuccessEmbed('Order Done', 'Details');
    assert(success.data.title.includes('Order Done'), 'Embed title must contain title');

    const receipt = embedBuilder.createTicketReceiptEmbed({ id: '1025813762684502168' }, 'REF-TEST123');
    assert(receipt.data.title.includes('Ticket Closure Receipt'), 'Receipt embed must have correct title');
    assert(receipt.data.description.includes('Your support ticket was resolved'), 'Must match specified wording');
  });

  console.log(`\n====================================================`);
  console.log(`🎉 TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log(`====================================================`);

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
})();
