import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../services/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads all slash commands from all category directories inside src/commands/
 */
export async function loadCommands(client) {
  const commandsCollection = client.commands;
  const commandDataList = [];

  const categories = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const category of categories) {
    const categoryPath = path.join(__dirname, category);
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      try {
        const commandModule = await import(`file://${filePath}`);
        const command = commandModule.default || commandModule;

        if (command && command.data && command.execute) {
          commandsCollection.set(command.data.name, command);
          commandDataList.push(command.data.toJSON());
        } else {
          logger.warn(`[CommandLoader] Command at ${filePath} is missing data or execute.`);
        }
      } catch (err) {
        logger.error(`[CommandLoader] Failed to load command ${file}:`, err.message);
      }
    }
  }

  logger.info(`[CommandLoader] Successfully loaded ${commandsCollection.size} slash commands across ${categories.length} categories.`);
  return commandDataList;
}

export default { loadCommands };
