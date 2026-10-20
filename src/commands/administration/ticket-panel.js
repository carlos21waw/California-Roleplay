import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import { buildTicketSelectMenu } from '../../select-menus/ticketDropdown.js';
import { savePersistentPanel } from '../../database/db.js';
import rules from '../../config/rules.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-panel')
  .setDescription('Publish the persistent Silence Designs Ticket Panel with category dropdown')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({ content: '❌ Only Management can publish the ticket panel.', ephemeral: true });
  }

  const embed = createBaseEmbed({
    title: '🎫 Contact Silence Designs — Support & Orders',
    description: 'Welcome to the official Silence Designs contact portal! Whether you want to order custom ER:LC liveries, ask questions, apply for our team, or partner with us, select the appropriate option below to open a private ticket.\n\n' +
      '**Ticket Conduct Rules:**\n' +
      rules.ticketRules.map(r => `• ${r}`).join('\n') +
      '\n\n*Refer to `/price-list` for current rates. Do not ping staff members while waiting.*',
    color: 0x181B22,
    fields: [
      {
        name: 'Available Ticket Categories',
        value: '🎨 **Design Order** — Custom liveries, uniforms, graphics\n' +
          '💬 **General Support** — Questions, help, assistance\n' +
          '🚨 **Report a Member** — Confidential rule violation reports\n' +
          '🤝 **Partnership Inquiry** — Server affiliation requests\n' +
          '📢 **Paid Advertisement** — Sponsored announcement pings\n' +
          '🎁 **Sponsored Giveaway** — Community giveaway hosting\n' +
          '🖌️ **Designer Application** — Join our creative roster\n' +
          '🛡️ **Staff Application** — Moderation & management roles\n' +
          '💳 **Billing and Purchase** — Payment verification & store receipts\n' +
          '❓ **Other Inquiry** — Any other matter'
      }
    ],
    footerText: 'SILENCE DESIGNS — Your vision. Our design. • Select an option below'
  });

  const row = buildTicketSelectMenu();

  const sent = await interaction.channel.send({
    embeds: [embed],
    components: [row]
  });

  await savePersistentPanel('ticket', interaction.guildId, interaction.channelId, sent.id);

  await interaction.reply({ content: '✅ Persistent Ticket Panel published successfully!', ephemeral: true });
}

export default { data, execute };
