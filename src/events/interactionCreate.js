import { Events } from 'discord.js';
import { handleInteraction } from '../interactions/router.js';
import { saveTicketMessage, getTicketByChannel } from '../database/db.js';
import logger from '../services/logger.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
  // 1. Handle Slash Commands
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      logger.warn(`[Interaction] Command /${interaction.commandName} was not found on client.`);
      return interaction.reply({ content: 'Command not recognized.', ephemeral: true });
    }

    try {
      logger.info(`[Command] /${interaction.commandName} executed by ${interaction.user.tag} (${interaction.user.id}) in guild ${interaction.guildId}`);
      await command.execute(interaction);
    } catch (err) {
      logger.error(`[Command Error] Error executing /${interaction.commandName}:`, err);
      const replyPayload = {
        content: 'There was an unexpected error while executing this command! Staff has been alerted.',
        ephemeral: true
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyPayload).catch(() => null);
      } else {
        await interaction.reply(replyPayload).catch(() => null);
      }
    }
    return;
  }

  // 2. Route buttons, select menus, and modals
  await handleInteraction(interaction);
}

export default { name, execute };
