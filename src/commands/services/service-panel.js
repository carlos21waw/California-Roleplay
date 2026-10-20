import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import { buildServicesSelectMenu } from '../../select-menus/servicesDropdown.js';
import { savePersistentPanel } from '../../database/db.js';
import config from '../../config/config.js';

export const data = new SlashCommandBuilder()
  .setName('service-panel')
  .setDescription('Publish the interactive Silence Designs Services Panel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({ content: '❌ Only Management can publish the service panel.', ephemeral: true });
  }

  const embed = createBaseEmbed({
    title: '💎 View Our Services!',
    description: 'Our services are built to deliver high-quality results with precision and consistency. From concept to completion, every order is managed with care by our trusted creative team. Select a service below to get started.\n\n' +
      `By requesting any service, you agree to our Master Service Agreement:\n${config.masterServiceAgreementUrl}`,
    color: 0x181B22,
    fields: [
      {
        name: '💳 Payment Upfront',
        value: 'All payments must be made upfront according to the agreed order terms. Failure to complete required payment may result in order closure.',
        inline: true
      },
      {
        name: '🤝 Respect',
        value: 'Please remain respectful. Disrespect toward staff will not be tolerated.',
        inline: true
      },
      {
        name: '⏱️ Delays',
        value: 'Delays may occur due to real-life schedules. Please be patient and understanding.',
        inline: true
      }
    ],
    footerText: 'Select a service from the dropdown below to check live status and pricing.'
  });

  const buttonsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_open_order_ticket')
      .setLabel('Prices & Order')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('💎'),
    new ButtonBuilder()
      .setLabel('Master Terms')
      .setStyle(ButtonStyle.Link)
      .setURL(config.masterServiceAgreementUrl)
      .setEmoji('📜'),
    new ButtonBuilder()
      .setLabel('Roblox Community')
      .setStyle(ButtonStyle.Link)
      .setURL(config.roblox.defaultGroupUrl)
      .setEmoji('🏛️')
  );

  const selectRow = buildServicesSelectMenu();

  const sent = await interaction.channel.send({
    embeds: [embed],
    components: [selectRow, buttonsRow]
  });

  await savePersistentPanel('services', interaction.guildId, interaction.channelId, sent.id);

  await interaction.reply({ content: '✅ Services Panel published and saved persistently!', ephemeral: true });
}

export default { data, execute };
