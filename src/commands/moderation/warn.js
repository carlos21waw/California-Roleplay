import { SlashCommandBuilder } from 'discord.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { addWarning, getWarnings } from '../../database/db.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Issue a formal warning to a member and record it in database')
  .addUserOption(option => option.setName('user').setDescription('The member to warn').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('The infraction reason').setRequired(true));

export async function execute(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only staff members can issue warnings.')],
      ephemeral: true
    });
  }

  const targetUser = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  if (targetUser.bot) {
    return interaction.reply({
      embeds: [createErrorEmbed('Invalid Target', 'You cannot warn bots.')],
      ephemeral: true
    });
  }

  const record = await addWarning(targetUser.id, interaction.guildId, interaction.user.id, reason);
  const total = await getWarnings(targetUser.id, interaction.guildId);

  // Notify member via DM
  try {
    await targetUser.send({
      embeds: [
        createErrorEmbed(
          `Warning Received in ${interaction.guild.name}`,
          `You have received a formal warning from <@${interaction.user.id}>.\n\n` +
          `• **Reason:** ${reason}\n` +
          `• **Total Warnings:** ${total.length}\n\n` +
          `Please review our server rules to avoid further disciplinary action.`
        )
      ]
    }).catch(() => null);
  } catch {
    // Ignore DM error
  }

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Warning Issued',
        `Issued warning #${record.id} to <@${targetUser.id}>.\n• **Reason:** ${reason}\n• **Total Active Warnings:** ${total.length}`
      )
    ]
  });
}

export default { data, execute };
