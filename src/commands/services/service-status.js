import { SlashCommandBuilder } from 'discord.js';
import { getServicesStatus, setServiceStatus } from '../../database/db.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createBaseEmbed, createSuccessEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('service-status')
  .setDescription('View or update service availability status (Open / Closed)')
  .addStringOption(option =>
    option
      .setName('service')
      .setDescription('The service to update (Staff only)')
      .setRequired(false)
      .addChoices(
        { name: 'Clothing', value: 'Clothing' },
        { name: 'Livery', value: 'Livery' },
        { name: 'Graphics', value: 'Graphics' },
        { name: 'Bot Development', value: 'Bot Development' }
      )
  )
  .addBooleanOption(option =>
    option
      .setName('is_open')
      .setDescription('Set status to Open (True) or Closed (False)')
      .setRequired(false)
  );

export async function execute(interaction) {
  const serviceName = interaction.options.getString('service');
  const isOpen = interaction.options.getBoolean('is_open');

  // If modifying status, require staff permission
  if (serviceName !== null && isOpen !== null) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({ content: '❌ Only staff members can change service availability.', ephemeral: true });
    }

    await setServiceStatus(serviceName, isOpen, interaction.user.tag);
    return interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Service Status Updated',
          `**${serviceName}** is now **${isOpen ? 'OPEN 🟢' : 'CLOSED 🔴'}**.\nUpdated by <@${interaction.user.id}>.`
        )
      ]
    });
  }

  // Otherwise, view all services status
  const statuses = await getServicesStatus();

  const lines = statuses.map(s =>
    `• **${s.service_name}:** ${s.is_open ? '🟢 **OPEN** — Accepting orders' : '🔴 **CLOSED** — At full capacity'}`
  );

  const embed = createBaseEmbed({
    title: '🛠️ Silence Designs — Current Service Availability',
    description: lines.join('\n\n'),
    color: 0x38BDF8,
    fields: [
      {
        name: 'Ordering Information',
        value: 'When a service is closed, new orders cannot be submitted until queue space opens up. Check back regularly!'
      }
    ]
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
