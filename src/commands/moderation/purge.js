import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Bulk delete up to 100 messages from the current channel')
  .addIntegerOption(option =>
    option
      .setName('amount')
      .setDescription('Number of messages to delete (1-100)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
  if (!isStaff(interaction.member) || !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You need the `Manage Messages` permission to purge messages.')],
      ephemeral: true
    });
  }

  const amount = interaction.options.getInteger('amount');

  try {
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({
      embeds: [createSuccessEmbed('Purge Successful', `Successfully deleted **${deleted.size}** message(s).`)],
      ephemeral: true
    });
  } catch (err) {
    await interaction.reply({
      embeds: [createErrorEmbed('Purge Failed', `Could not delete messages: ${err.message}`)],
      ephemeral: true
    });
  }
}

export default { data, execute };
