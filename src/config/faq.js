/**
 * Silence Designs — FAQ Configuration
 * 15 interactive FAQ questions and configurable answers.
 */

export const faqList = [
  {
    id: 'faq_1',
    question: 'Why are my orders closed?',
    answer: 'Orders are temporarily closed due to high demand. Our design team is currently at full capacity and focused on completing existing orders. We expect to reopen within approximately one week. Thank you for your patience.'
  },
  {
    id: 'faq_2',
    question: 'When will applications open?',
    answer: 'Applications for Designer and Staff positions open periodically based on team capacity. Keep an eye on announcements or check `/schedule` and `/application-panel` for active hiring waves.'
  },
  {
    id: 'faq_3',
    question: 'My purchase did not go through.',
    answer: 'Roblox transactions may take a few minutes to process. Please ensure you purchased the correct developer product or game pass, then open a Billing ticket with your Roblox transaction screenshot and username for staff verification.'
  },
  {
    id: 'faq_4',
    question: 'Do you offer refunds?',
    answer: 'All sales are final under the configured store policy. We do not offer refunds under any circumstances once work has commenced or digital goods are delivered, subject to applicable law and platform requirements.'
  },
  {
    id: 'faq_5',
    question: 'How can I affiliate or partner with you?',
    answer: 'To partner with Silence Designs, your server must have at least 100 members, be fully established, SFW, and follow Discord/PRC Terms of Service. Design servers are not eligible. Open a Partnership ticket to apply.'
  },
  {
    id: 'faq_6',
    question: 'Can I ask Silence Designs to join my event?',
    answer: 'Yes! We frequently participate in ER:LC community events, auto shows, and collaborative livery showcases. Open a General Support ticket with your event proposal, dates, and expected attendance.'
  },
  {
    id: 'faq_7',
    question: 'Where did you get your emojis and icons from?',
    answer: 'Our emojis, icons, and UI assets are custom-crafted by the Silence Designs creative team and our licensed partners. Custom emoji IDs can be configured in the bot settings.'
  },
  {
    id: 'faq_8',
    question: 'What is the sponsored giveaway queue?',
    answer: 'Sponsored giveaways require purchasing an eligible advertisement ping and funding the prize (minimum R$500). Once payment is verified by staff, your giveaway enters the queue unless Priority/Instant Postage was selected.'
  },
  {
    id: 'faq_9',
    question: 'How do I appeal a ban or moderation action?',
    answer: 'To appeal a moderation action, contact our support team through an authorized alternate or submit a ticket. Explain the situation honestly. Note that submitting an appeal does not guarantee it will be accepted.'
  },
  {
    id: 'faq_10',
    question: 'Why was my ticket closed without a reason?',
    answer: 'Tickets may be closed if inactive for over 48 hours, if duplicate inquiries were submitted, or if staff conduct rules were violated. Every closure generates a Reference ID receipt. You may open a new ticket quoting that ID if needed.'
  },
  {
    id: 'faq_11',
    question: 'Can I request action against or report a member?',
    answer: 'Yes. Use the "Report a Member" option in our ticket panel or run `/ticket-open` with the Report category. Provide the member ID, reason, and verifiable screenshot/video evidence. Staff will review it objectively.'
  },
  {
    id: 'faq_12',
    question: 'How do I place an order?',
    answer: 'Check `/price-list` or `/services` to see available services and prices. Then use `/order-create` or open a Design Order ticket from our ticket panel. Provide your Roblox username, service type, and design details.'
  },
  {
    id: 'faq_13',
    question: 'How do I check my order status?',
    answer: 'Run `/order-status <order-id>` at any time to see real-time updates, assigned designer, payment status, and progress. You can also view your active orders using `/order-list`.'
  },
  {
    id: 'faq_14',
    question: 'How do I apply to become a designer?',
    answer: 'Run `/apply-designer` or select Designer Application from the ticket panel. You will be asked for your portfolio links, design specialties (liveries, clothing, graphics), and ER:LC experience.'
  },
  {
    id: 'faq_15',
    question: 'How can I contact support?',
    answer: 'Click the "Still Need Assistance?" button below, run `/ticket-open`, or choose General Support in our ticket panel. A dedicated staff member will assist you shortly!'
  }
];

export default faqList;
