import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { createApplication } from '../database/db.js';
import { generateRefId, safeText } from '../utils/formatters.js';
import { createSuccessEmbed } from '../embeds/embedBuilder.js';

export function buildDesignerAppModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_apply_designer')
    .setTitle('Silence Designs — Designer Application');

  const robloxInput = new TextInputBuilder()
    .setCustomId('roblox_username')
    .setLabel('Roblox Username')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Your Roblox profile username')
    .setRequired(true);

  const portfolioInput = new TextInputBuilder()
    .setCustomId('portfolio')
    .setLabel('Portfolio Links (Imgur, Behance, Google Drive)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Provide links showcasing your ER:LC liveries, clothing, or graphics...')
    .setRequired(true);

  const experienceInput = new TextInputBuilder()
    .setCustomId('experience')
    .setLabel('Design Experience & Software Used')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('e.g. 2 years Photoshop/Illustrator, paint.net, ER:LC templates...')
    .setRequired(true);

  const availabilityInput = new TextInputBuilder()
    .setCustomId('availability')
    .setLabel('Weekly Turnaround / Availability')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. 10-15 hours/week, 24-48h turnaround')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(robloxInput),
    new ActionRowBuilder().addComponents(portfolioInput),
    new ActionRowBuilder().addComponents(experienceInput),
    new ActionRowBuilder().addComponents(availabilityInput)
  );

  return modal;
}

export function buildStaffAppModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_apply_staff')
    .setTitle('Silence Designs — Staff Application');

  const robloxInput = new TextInputBuilder()
    .setCustomId('roblox_username')
    .setLabel('Roblox Username')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Your Roblox username')
    .setRequired(true);

  const experienceInput = new TextInputBuilder()
    .setCustomId('experience')
    .setLabel('Discord Moderation Experience')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Detail previous servers, staff roles held, and moderation tools used...')
    .setRequired(true);

  const scenarioInput = new TextInputBuilder()
    .setCustomId('scenario')
    .setLabel('Conflict Resolution Approach')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('How do you handle a customer disputing an order price or disrespecting staff?')
    .setRequired(true);

  const timezoneInput = new TextInputBuilder()
    .setCustomId('timezone')
    .setLabel('Timezone & Active Hours')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. EST / UTC-5, 4pm - 10pm daily')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(robloxInput),
    new ActionRowBuilder().addComponents(experienceInput),
    new ActionRowBuilder().addComponents(scenarioInput),
    new ActionRowBuilder().addComponents(timezoneInput)
  );

  return modal;
}

export async function handleApplicationSubmit(interaction, appType) {
  await interaction.deferReply({ ephemeral: true });

  const appId = generateRefId('APP');
  const robloxUsername = safeText(interaction.fields.getTextInputValue('roblox_username'));
  const experience = safeText(interaction.fields.getTextInputValue('experience'));
  const portfolio = interaction.fields.components.some(c => c.components[0].customId === 'portfolio')
    ? safeText(interaction.fields.getTextInputValue('portfolio'))
    : null;

  await createApplication({
    id: appId,
    userId: interaction.user.id,
    userTag: interaction.user.tag,
    robloxUsername,
    appType,
    portfolio,
    experience
  });

  const successEmbed = createSuccessEmbed(
    'Application Submitted Successfully',
    `Thank you for applying for **${appType}** at Silence Designs!\n\n` +
    `• **Application ID:** \`${appId}\`\n` +
    `• **Status:** \`Pending Review\`\n` +
    `• Staff will evaluate your submission. You will receive updates via Discord.`
  );

  await interaction.editReply({ embeds: [successEmbed] });
}

export default {
  buildDesignerAppModal,
  buildStaffAppModal,
  handleApplicationSubmit
};
