import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('[Deploy] ERROR: DISCORD_TOKEN and CLIENT_ID must be set in your .env file to register slash commands.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const categories = fs.readdirSync(commandsPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`[Deploy] Scanning ${categories.length} command category folders...`);

for (const category of categories) {
  const categoryPath = path.join(commandsPath, category);
  const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(categoryPath, file);
    const commandModule = await import(`file://${filePath}`);
    const command = commandModule.default || commandModule;

    if (command && command.data) {
      commands.push(command.data.toJSON());
      console.log(`[Deploy] Loaded /${command.data.name} (${category})`);
    }
  }
}

console.log(`[Deploy] Found ${commands.length} slash commands to register.`);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`[Deploy] Started refreshing application (/) commands...`);

    if (guildId) {
      // Guild-specific registration (instant updates for testing)
      console.log(`[Deploy] Registering to Test Guild ID: ${guildId}`);
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`[Deploy] SUCCESS: Successfully reloaded ${data.length} application (/) commands to Guild ${guildId}!`);
    } else {
      // Global registration
      console.log(`[Deploy] Registering globally to all Discord servers...`);
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`[Deploy] SUCCESS: Successfully reloaded ${data.length} global application (/) commands!`);
    }
  } catch (error) {
    console.error('[Deploy] Deployment failed:', error);
    process.exit(1);
  }
})();
