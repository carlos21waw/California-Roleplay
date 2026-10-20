import { SlashCommandBuilder } from 'discord.js';
import { getApplication, updateApplication } from '../../database/db.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import config from '../../config/config.js';

export const data = new SlashCommandBuilder()
  .setName('app-accept')
  .setDescription('Accept an application and optionally assign the role')
  .addStringOption(option =>
    option.setName('app_id').setDescription('The Application ID').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('feedback').setDescription('Feedback or onboarding notes').setRequired(false)
  );

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only Management or Executive members can accept applications.')],
      ephemeral: true
    });
  }

  const appId = interaction.options.getString('app_id').toUpperCase();
  const feedback = interaction.options.getString('feedback') || 'Welcome to the Silence Designs team!';
  const app = await getApplication(appId);

  if (!app) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Application \`${appId}\` was not found.`)],
      ephemeral: true
    });
  }

  await updateApplication(appId, {
    status: 'Accepted',
    reviewer_id: interaction.user.id,
    review_notes: feedback,
    reviewed_at: Date.now()
  });

  // Assign role if configured
  let roleAssigned = false;
  try {
    const guildMember = await interaction.guild.members.fetch(app.user_id).catch(() => null);
    if (guildMember) {
      const targetRoleId = app.app_type === 'Designer' ? config.roles.designer : config.roles.staff;
      if (targetRoleId) {
        await guildMember.roles.add(targetRoleId).catch(() => null);
        roleAssigned = true;
      }
    }
  } catch {
    // Ignore role assignment failure
  }

  // DM applicant
  try {
    const applicant = await interaction.client.users.fetch(app.user_id).catch(() => null);
    if (applicant) {
      await applicant.send({
        embeds: [
          createSuccessEmbed(
            'Application Accepted! 🎉',
            `Congratulations! Your application for **${app.app_type}** at Silence Designs has been **Accepted**.\n\n` +
            `• **Reviewer:** <@${interaction.user.id}>\n` +
            `• **Feedback / Next Steps:** ${feedback}`
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
        'Application Accepted',
        `Application **${appId}** (<@${app.user_id}> for \`${app.app_type}\`) has been **Accepted**.\n` +
        `• Role assignment: ${roleAssigned ? '✅ Success' : 'Manual verification needed'}\n` +
        `• Feedback: ${feedback}`
      )
    ]
  });
}

export default { data, execute };
