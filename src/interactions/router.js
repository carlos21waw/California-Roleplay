import { handleTicketButtons } from '../buttons/ticketButtons.js';
import { handleGiveawayButtons } from '../buttons/giveawayButtons.js';
import { handleTicketDropdownSelection } from '../select-menus/ticketDropdown.js';
import { handleFaqSelection } from '../select-menus/faqDropdown.js';
import { handleStoreSelection } from '../select-menus/storeDropdown.js';
import { handleServicesSelection } from '../select-menus/servicesDropdown.js';
import { handleDesignOrderSubmit, buildDesignOrderModal } from '../modals/designOrderModal.js';
import { handleGeneralSupportSubmit, buildGeneralSupportModal } from '../modals/generalSupportModal.js';
import { handleReportMemberSubmit } from '../modals/reportMemberModal.js';
import { handleApplicationSubmit } from '../modals/applicationModals.js';
import logger from '../services/logger.js';

export async function handleInteraction(interaction) {
  try {
    // 1. Buttons
    if (interaction.isButton()) {
      const id = interaction.customId;
      if (id.startsWith('ticket_')) {
        return await handleTicketButtons(interaction);
      }
      if (id.startsWith('gw_')) {
        return await handleGiveawayButtons(interaction);
      }
      if (id === 'faq_need_assistance_btn') {
        return await interaction.showModal(buildGeneralSupportModal());
      }
      if (id === 'btn_open_order_ticket' || id === 'btn_order_start_bundle') {
        return await interaction.showModal(buildDesignOrderModal());
      }
    }

    // 2. String Select Menus
    if (interaction.isStringSelectMenu()) {
      const id = interaction.customId;
      if (id === 'ticket_category_select') {
        return await handleTicketDropdownSelection(interaction);
      }
      if (id === 'faq_question_select') {
        return await handleFaqSelection(interaction);
      }
      if (id === 'store_catalog_select') {
        return await handleStoreSelection(interaction);
      }
      if (id === 'services_detail_select') {
        return await handleServicesSelection(interaction);
      }
    }

    // 3. Modal Submissions
    if (interaction.isModalSubmit()) {
      const id = interaction.customId;
      if (id === 'modal_design_order') {
        return await handleDesignOrderSubmit(interaction);
      }
      if (id === 'modal_general_support') {
        return await handleGeneralSupportSubmit(interaction);
      }
      if (id === 'modal_report_member') {
        return await handleReportMemberSubmit(interaction);
      }
      if (id === 'modal_apply_designer') {
        return await handleApplicationSubmit(interaction, 'Designer');
      }
      if (id === 'modal_apply_staff') {
        return await handleApplicationSubmit(interaction, 'Staff');
      }
    }
  } catch (err) {
    logger.error('[InteractionRouter] Unhandled interaction error:', err.message);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'An unexpected error occurred while processing this interaction.',
        ephemeral: true
      }).catch(() => null);
    }
  }
}

export default {
  handleInteraction
};
