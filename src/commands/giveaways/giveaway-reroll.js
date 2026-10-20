import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { rerollWinners } from '../../jobs/giveawayScheduler.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('giveaway-reroll')
  .setDescription('Reroll winners for an ended giveaway')
  .addStringOption(option => option.setName('giveaway_id').setDescription('The Giveaway ID').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Only staff can reroll giveaways.', ephemeral: true });
  }

  const id = interaction.options.getString('giveaway_id').toUpperCase();

  try {
    await interaction.deferReply({ ephemeral: true });
    const winners = await rerollWinners(interaction.client, id);

    await interaction.editReply({
      embeds: [
        createSuccessEmbed(
          'Giveaway Rerolled',
          `New winners have been selected and announced for Giveaway **${id}**:\n${winners.map(w => `<@${w}>`).join(', ')}`
        )
      ]
    });
  } catch (err) {
    await interaction.editReply({
      embeds: [createErrorEmbed('Reroll Error', err.message)]
    });
  }
}

export default { data, execute };
