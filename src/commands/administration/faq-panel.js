import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import { buildFaqSelectMenu, buildFaqButtons } from '../../select-menus/faqDropdown.js';
import { savePersistentPanel } from '../../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('faq-panel')
  .setDescription('Publish the interactive 15-question Silence Designs FAQ Panel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({ content: '❌ Only Management can publish the FAQ panel.', ephemeral: true });
  }

  const embed = createBaseEmbed({
    title: '💡 Frequently Asked Questions — Silence Designs',
    description: 'Have questions regarding our design orders, Roblox payment verification, applications, or policies?\n\n' +
      'Select any of the **15 interactive questions** from the dropdown menu below to view immediate answers!\n\n' +
      'If your question is not covered or you need personalized help, click the red **Still Need Assistance?** button below to open a ticket directly with our team.',
    color: 0x38BDF8,
    fields: [
      {
        name: 'Quick Topics Covered',
        value: '• Order closure reasons & reopen dates\n' +
          '• Payment verification & store refund policy\n' +
          '• Designer & staff application waves\n' +
          '• Server partnerships & sponsored giveaway queues\n' +
          '• Ticket rules & moderation appeal process'
      }
    ],
    footerText: 'Silence Designs Community Support'
  });

  const selectRow = buildFaqSelectMenu();
  const buttonRow = buildFaqButtons();

  const sent = await interaction.channel.send({
    embeds: [embed],
    components: [selectRow, buttonRow]
  });

  await savePersistentPanel('faq', interaction.guildId, interaction.channelId, sent.id);

  await interaction.reply({ content: '✅ Interactive FAQ Panel published and saved persistently!', ephemeral: true });
}

export default { data, execute };
