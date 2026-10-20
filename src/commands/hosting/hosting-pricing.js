import { SlashCommandBuilder } from 'discord.js';
import products from '../../config/products.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('hosting-pricing')
  .setDescription('View official Silence Designs bot hosting plans and subscription pricing');

export async function execute(interaction) {
  const hosting = products.hosting;

  const fields = hosting.plans.map(p => ({
    name: `${p.name} — ${p.priceRobux} Robux / ${p.priceUsd}`,
    value: `• Duration: **${p.durationDays} Days**\n• Includes 99.9% uptime, auto-restarts, and error logs monitoring.`,
    inline: false
  }));

  const embed = createBaseEmbed({
    title: '🖥️ Silence Designs — Bot Hosting Plans',
    description: `Need reliable, 24/7 dedicated hosting for your custom ER:LC or community Discord bot?\n\n` +
      `**Special Policy:**\n${hosting.note}\n\n` +
      `*Hosting is strictly managed through our verified team infrastructure.*`,
    color: 0x38BDF8,
    fields,
    footerText: 'SILENCE DESIGNS — High Uptime Hosting'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
