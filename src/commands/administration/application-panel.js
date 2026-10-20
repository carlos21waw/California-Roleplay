import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import { savePersistentPanel } from '../../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('application-panel')
  .setDescription('Publish the Silence Designs Recruitment & Application Panel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({ content: '❌ Only Management can publish the application panel.', ephemeral: true });
  }

  const embed = createBaseEmbed({
    title: '📋 Join the Silence Designs Team!',
    description: 'Are you an experienced ER:LC livery artist, 2D/3D clothing tailor, vector graphics designer, or community moderator? Silence Designs is always seeking passionate creators and dependable staff!\n\n' +
      '**Available Positions:**\n' +
      '• **🎨 Livery & Asset Designer** — Craft custom liveries, department seals, uniforms, and server branding. Earn Robux / USD per completed commission!\n' +
      '• **🛡️ Community Staff** — Moderate text and voice channels, handle support tickets, assist clients, and maintain a friendly atmosphere.',
    color: 0x38BDF8,
    fields: [
      {
        name: 'Applicant Prerequisites',
        value: '• Must have an established Discord account\n• Must possess verifiable portfolio examples for designer applicants\n• Must maintain professionalism under pressure'
      }
    ],
    footerText: 'Click a button below to open an application modal.'
  });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_open_app_designer')
      .setLabel('Apply for Designer')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🖌️'),
    new ButtonBuilder()
      .setCustomId('btn_open_app_staff')
      .setLabel('Apply for Staff')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🛡️')
  );

  const sent = await interaction.channel.send({
    embeds: [embed],
    components: [buttons]
  });

  await savePersistentPanel('application', interaction.guildId, interaction.channelId, sent.id);

  await interaction.reply({ content: '✅ Application Panel published successfully!', ephemeral: true });
}

export default { data, execute };
