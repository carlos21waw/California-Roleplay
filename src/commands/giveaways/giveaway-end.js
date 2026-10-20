import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getGiveaway } from '../../database/db.js';
import { finishGiveaway } from '../../jobs/giveawayScheduler.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('giveaway-end')
  .setDescription('End a giveaway immediately and choose winners')
  .addStringOption(option => option.setName('giveaway_id').setDescription('The Giveaway ID').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Only staff can conclude giveaways.', ephemeral: true });
  }

  const id = interaction.options.getString('giveaway_id').toUpperCase();
  const gw = await getGiveaway(id);

  if (!gw) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Giveaway \`${id}\` was not found.`)],
      ephemeral: true
    });
  }

  if (gw.status === 'Ended') {
    return interaction.reply({
      embeds: [createErrorEmbed('Already Ended', `Giveaway \`${id}\` has already concluded. Use \`/giveaway-reroll\` instead.`)],
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });
  const winners = await finishGiveaway(interaction.client, gw);

  await interaction.editReply({
    embeds: [
      createSuccessEmbed(
        'Giveaway Concluded',
        `Giveaway **${id}** for **${gw.prize}** has ended.\n• Winners: ${winners.length > 0 ? winners.map(w => `<@${w}>`).join(', ') : 'None'}`
      )
    ]
  });
}

export default { data, execute };
