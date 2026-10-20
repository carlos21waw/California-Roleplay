import { SlashCommandBuilder } from 'discord.js';
import rules from '../../config/rules.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('rules')
  .setDescription('View the official Silence Designs rulebook and community guidelines')
  .addStringOption(option =>
    option
      .setName('section')
      .setDescription('Filter by specific rulebook section')
      .setRequired(false)
      .addChoices(
        { name: 'General Server Rules', value: 'general' },
        { name: 'Order Conduct Rules', value: 'orders' },
        { name: 'Ticket Conduct Rules', value: 'tickets' },
        { name: 'Partnership Guidelines', value: 'partnerships' },
        { name: 'Paid Advertisement Rules', value: 'ads' },
        { name: 'Sponsored Giveaway Rules', value: 'giveaways' }
      )
  );

export async function execute(interaction) {
  const section = interaction.options.getString('section');

  if (section === 'orders') {
    const embed = createBaseEmbed({
      title: '📜 Silence Designs — Order Conduct Rules',
      description: rules.orderRules.map(r => `• ${r}`).join('\n\n'),
      color: 0x38BDF8
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (section === 'tickets') {
    const embed = createBaseEmbed({
      title: '🎫 Silence Designs — Ticket Conduct Rules',
      description: rules.ticketRules.map(r => `• ${r}`).join('\n\n'),
      color: 0xEF4444
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (section === 'partnerships') {
    const embed = createBaseEmbed({
      title: '🤝 Silence Designs — Partnership Requirements',
      description: rules.partnerships.map(r => `• ${r}`).join('\n\n'),
      color: 0x22C55E
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (section === 'ads') {
    const embed = createBaseEmbed({
      title: '📢 Silence Designs — Paid Advertisement Rules',
      description: rules.paidAdvertisements.map(r => `• ${r}`).join('\n\n'),
      color: 0xF59E0B
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (section === 'giveaways') {
    const embed = createBaseEmbed({
      title: '🎁 Silence Designs — Sponsored Giveaway Rules',
      description: rules.sponsoredGiveaways.map(r => `• ${r}`).join('\n\n'),
      color: 0xEC4899
    });
    return interaction.reply({ embeds: [embed] });
  }

  // Full Rulebook Overview
  const embed = createBaseEmbed({
    title: '📖 Silence Designs Official Rulebook',
    description: 'Please review our community guidelines, ordering standards, and code of conduct below.',
    color: 0x181B22,
    fields: [
      { name: '1. Community Guidelines', value: rules.generalRules.map(r => `• ${r}`).join('\n') },
      { name: '2. Order & Staff Conduct', value: rules.orderRules.slice(0, 4).map(r => `• ${r}`).join('\n') },
      { name: '3. Ticket Guidelines', value: rules.ticketRules.map(r => `• ${r}`).join('\n') }
    ],
    footerText: 'By participating in Silence Designs, you agree to these guidelines.'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
