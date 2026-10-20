import { SlashCommandBuilder } from 'discord.js';
import { getAllOrders } from '../../database/db.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('showcase')
  .setDescription('View recent verified showcase pieces crafted by Silence Designs');

export async function execute(interaction) {
  const completed = await getAllOrders('Completed');

  const embed = createBaseEmbed({
    title: '✨ Silence Designs Showcase',
    description: 'Explore the high-fidelity ER:LC liveries, tactical uniforms, and community branding crafted by our verified team.\n\n' +
      '**Featured Specialties:**\n' +
      '• ER:LC Law Enforcement & Fire Rescue Liveries\n' +
      '• Roblox 2D/3D Tactical Uniforms & Polos\n' +
      '• High-Impact Vector Logos & Emblems\n' +
      '• Custom Discord Bot & Architecture Solutions\n\n' +
      (completed.length > 0
        ? `**Recent Completed Deliveries:**\n` +
          completed.slice(0, 5).map(c => `• **${c.id}** (${c.service_type}) — for <@${c.user_id}> by ${c.designer_id ? `<@${c.designer_id}>` : 'Team'}`).join('\n')
        : '*New showcase drops are posted regularly in our releases channel.*'),
    color: 0x38BDF8,
    footerText: 'Ready to elevate your department? Type /order-create to get started.'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
