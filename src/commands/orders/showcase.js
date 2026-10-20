import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getAllOrders } from '../../database/db.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import { formatDiscordTimestamp } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('showcase')
  .setDescription('Explore recent verified livery and design showcase pieces crafted by Silence Designs');

export async function execute(interaction) {
  const completed = await getAllOrders('Completed');

  const fields = [
    {
      name: 'Department Livery Specialties',
      value: '• **Law Enforcement:** State Police, County Sheriff, Metro SWAT, Highway Interceptors\n' +
        '• **Fire & Rescue:** Heavy Rescue Squads, Tower Ladders, EMS Paramedic Units\n' +
        '• **Civic & Private:** DOT Roadway Operations, Airport Police, Security Patrols',
      inline: false
    },
    {
      name: 'Asset Craftsmanship',
      value: '• High-detail Roblox tactical vests, duty uniforms, and agency polos\n' +
        '• Vector community logos, department seals, and Discord icon suites\n' +
        '• Precision alignment with ER:LC 3D template coordinates',
      inline: false
    }
  ];

  if (completed.length > 0) {
    const list = completed.slice(0, 5).map(c =>
      `• **${c.id}** — \`${c.service_type}\` for <@${c.user_id}> by ${c.designer_id ? `<@${c.designer_id}>` : 'Silence Staff'} (${formatDiscordTimestamp(c.completed_at || c.created_at, 'd')})`
    );
    fields.push({
      name: 'Recent Verified Deliveries',
      value: list.join('\n'),
      inline: false
    });
  }

  const embed = createBaseEmbed({
    title: '✦ Silence Designs Portfolio Showcase',
    description: 'A curated selection of authentic emergency vehicle liveries, tactical uniforms, and community graphics crafted by our verified design roster.',
    color: 0x38BDF8,
    fields,
    footerText: 'Silence Designs • Master Craftsmanship'
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_open_order_ticket')
      .setLabel('Commission A Design')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('✍️')
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

export default { data, execute };
