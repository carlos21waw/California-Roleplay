import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { buildDesignOrderModal } from '../modals/designOrderModal.js';
import { buildGeneralSupportModal } from '../modals/generalSupportModal.js';
import { buildReportMemberModal } from '../modals/reportMemberModal.js';
import { buildDesignerAppModal, buildStaffAppModal } from '../modals/applicationModals.js';

export function buildTicketSelectMenu() {
  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket_category_select')
    .setPlaceholder('Select a topic to open a ticket...')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Design Order')
        .setDescription('Request custom liveries, clothing, embeds, or graphics')
        .setValue('cat_design_order')
        .setEmoji('🎨'),
      new StringSelectMenuOptionBuilder()
        .setLabel('General Support')
        .setDescription('Questions, assistance, or inquiries')
        .setValue('cat_general_support')
        .setEmoji('💬'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Report a Member')
        .setDescription('Confidential report regarding rule violations')
        .setValue('cat_report_member')
        .setEmoji('🚨'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Partnership Inquiry')
        .setDescription('Affiliations for servers with 100+ members')
        .setValue('cat_partnership')
        .setEmoji('🤝'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Paid Advertisement')
        .setDescription('Promote your server via our announcement pings')
        .setValue('cat_paid_ad')
        .setEmoji('📢'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Sponsored Giveaway')
        .setDescription('Host a funded giveaway with promo')
        .setValue('cat_sponsored_gw')
        .setEmoji('🎁'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Designer Application')
        .setDescription('Apply to join the Silence Designs creative team')
        .setValue('cat_apply_designer')
        .setEmoji('🖌️'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Staff Application')
        .setDescription('Apply for community moderation and management')
        .setValue('cat_apply_staff')
        .setEmoji('🛡️'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Billing and Purchase')
        .setDescription('Payment verification, invoices, and product support')
        .setValue('cat_billing')
        .setEmoji('💳'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Other Inquiry')
        .setDescription('Any other questions not listed above')
        .setValue('cat_other')
        .setEmoji('❓')
    );

  return new ActionRowBuilder().addComponents(select);
}

export async function handleTicketDropdownSelection(interaction) {
  const value = interaction.values[0];

  switch (value) {
    case 'cat_design_order':
      return interaction.showModal(buildDesignOrderModal());

    case 'cat_general_support':
    case 'cat_partnership':
    case 'cat_paid_ad':
    case 'cat_sponsored_gw':
    case 'cat_billing':
    case 'cat_other':
      return interaction.showModal(buildGeneralSupportModal());

    case 'cat_report_member':
      return interaction.showModal(buildReportMemberModal());

    case 'cat_apply_designer':
      return interaction.showModal(buildDesignerAppModal());

    case 'cat_apply_staff':
      return interaction.showModal(buildStaffAppModal());

    default:
      return interaction.showModal(buildGeneralSupportModal());
  }
}

export default {
  buildTicketSelectMenu,
  handleTicketDropdownSelection
};
