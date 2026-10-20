import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import faqList from '../config/faq.js';
import { createInfoEmbed } from '../embeds/embedBuilder.js';

export function buildFaqSelectMenu() {
  const select = new StringSelectMenuBuilder()
    .setCustomId('faq_question_select')
    .setPlaceholder('Choose a question to view the answer...')
    .addOptions(
      faqList.map(item =>
        new StringSelectMenuOptionBuilder()
          .setLabel(item.question.length > 100 ? item.question.slice(0, 97) + '...' : item.question)
          .setValue(item.id)
          .setDescription(`FAQ #${item.id.replace('faq_', '')}`)
          .setEmoji('💡')
      )
    );

  return new ActionRowBuilder().addComponents(select);
}

export function buildFaqButtons() {
  const button = new ButtonBuilder()
    .setCustomId('faq_need_assistance_btn')
    .setLabel('Still Need Assistance?')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🆘');

  return new ActionRowBuilder().addComponents(button);
}

export async function handleFaqSelection(interaction) {
  const selectedId = interaction.values[0];
  const faqItem = faqList.find(f => f.id === selectedId);

  if (!faqItem) {
    return interaction.reply({ content: 'Question not found.', ephemeral: true });
  }

  const embed = createInfoEmbed(
    faqItem.question,
    faqItem.answer
  );

  await interaction.reply({
    embeds: [embed],
    components: [buildFaqButtons()],
    ephemeral: true
  });
}

export default {
  buildFaqSelectMenu,
  buildFaqButtons,
  handleFaqSelection
};
