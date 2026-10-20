import { SlashCommandBuilder } from 'discord.js';
import { getApplication, updateApplication } from '../../database/db.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('app-deny')
  .setDescription('Deny an application with constructive feedback')
  .addStringOption(option =>
    option.setName('app_id').setDescription('The Application ID').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason').setDescription('Reason or constructive advice').setRequired(false)
  );

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only Management or Executive members can deny applications.')],
      ephemeral: true
    });
  }

  const appId = interaction.options.getString('app_id').toUpperCase();
  const reason = interaction.options.getString('reason') || 'Thank you for your interest. We encourage you to reapply during our next wave.';
  const app = await getApplication(appId);

  if (!app) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Application \`${appId}\` was not found.`)],
      ephemeral: true
    });
  }

  await updateApplication(appId, {
    status: 'Denied',
    reviewer_id: interaction.user.id,
    review_notes: reason,
    reviewed_at: Date.now()
  });

  // DM applicant
  try {
    const applicant = await interaction.client.users.fetch(app.user_id).catch(() => null);
    if (applicant) {
      await applicant.send({
        embeds: [
          createErrorEmbed(
            'Application Update',
            `Thank you for applying for **${app.app_type}** at Silence Designs.\n\n` +
            `At this time, we have decided not to move forward with your application.\n` +
            `• **Feedback:** ${reason}\n\n` +
            `You are welcome to build your portfolio and reapply in the future!`
          )
        ]
      }).catch(() => null);
    }
  } catch {
    // Ignore DM error
  }

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Application Denied',
        `Application **${appId}** (<@${app.user_id}>) has been marked as **Denied**.\n• Reason: ${reason}`
      )
    ]
  });
}

export default { data, execute };
