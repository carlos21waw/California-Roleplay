import { SlashCommandBuilder } from 'discord.js';
import { getApplication } from '../../database/db.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('app-review')
  .setDescription('View the submitted details and answers for an application')
  .addStringOption(option =>
    option.setName('app_id').setDescription('The Application ID (e.g. APP-F4A19B)').setRequired(true)
  );

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only Management or Executive members can review staff applications.')],
      ephemeral: true
    });
  }

  const appId = interaction.options.getString('app_id').toUpperCase();
  const app = await getApplication(appId);

  if (!app) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Application \`${appId}\` was not found.`)],
      ephemeral: true
    });
  }

  const embed = createBaseEmbed({
    title: `📋 Application Review — ${app.id}`,
    color: 0x8B5CF6,
    fields: [
      { name: 'Applicant', value: `<@${app.user_id}> (\`${app.user_tag}\`)`, inline: true },
      { name: 'Roblox Username', value: app.roblox_username || 'None', inline: true },
      { name: 'Position Applied', value: `\`${app.app_type}\``, inline: true },
      { name: 'Current Status', value: `\`${app.status}\``, inline: true },
      { name: 'Submitted At', value: `<t:${Math.floor(app.created_at / 1000)}:f>`, inline: true },
      { name: 'Reviewer', value: app.reviewer_id ? `<@${app.reviewer_id}>` : '*Unassigned*', inline: true },
      { name: 'Portfolio / Links', value: app.portfolio || 'No portfolio provided.' },
      { name: 'Experience & Qualifications', value: `>>> ${app.experience}` },
      { name: 'Review Notes', value: app.review_notes || '*No notes yet.*' }
    ]
  });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

export default { data, execute };
