import { SlashCommandBuilder } from 'discord.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { clearWarnings } from '../../database/db.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('clearwarn')
  .setDescription('Clear all recorded warnings for a member (Staff only)')
  .addUserOption(option => option.setName('user').setDescription('The user whose warnings to clear').setRequired(true));

export async function execute(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only authorized staff members can clear warnings.')],
      ephemeral: true
    });
  }

  const targetUser = interaction.options.getUser('user');
  const count = await clearWarnings(targetUser.id, interaction.guildId);

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Warnings Cleared',
        `Cleared **${count}** warning(s) for <@${targetUser.id}>. Their disciplinary record is now clean.`
      )
    ]
  });
}

export default { data, execute };
