/**
 * Pipa Canoe Adventures - Unified Localization Dictionary
 *
 * STRUCTURE GUIDE:
 * - nav: Navigation elements
 * - hero: Landing page hero section
 * - features: Adventure details section
 * - tours: Tour list and card elements
 * - modal: Tour detail modal specific strings
 * - booking: Date selection and availability list
 * - form: Booking input fields and validation
 * - pay: Pix payment and polling states
 * - success: Post-payment confirmation
 * - footer: Site footer and legal links
 */

export const translations = {
  en: {
    // --- SEO ---
    seo_home_title: "Pipa Canoa Havaiana | Sunset & Full Moon Tours",
    seo_home_description:
      "Experience the magic of Pipa from the water. Authentic Hawaiian Canoe tours, sunset adventures, and full moon celebrations.",
    seo_about_title: "Meet Edu | Your Captain in Pipa",
    seo_about_description:
      "Learn about Eduardo's journey from Hawaii to Pipa and his passion for the ocean.",
    seo_tours_title: "Canoe Tours in Pipa | Sunrise & Sunset",
    seo_tours_description:
      "Explore our selection of Hawaiian Canoe adventures in Tibau do Sul. Sunrise, Sunset and Full Moon tours available.",

    // --- Navigation ---
    navHome: "Home",
    navTours: "Tours",
    navBook: "Book",
    navFaq: "FAQ",
    navAbout: "About Us",
    nav_notifications: "Notifications",
    nav_notifications_desc: "System alerts and activity",
    nav_operations: "Operations",
    nav_activity: "Activity",
    nav_emails: "E-mails",

    // --- Hero Section ---
    heroTitle: "Feel the Ocean's Heartbeat",
    heroSubtitle:
      "Discover the soul of Pipa from a new perspective. Glide through serene waters, connect with nature, and create memories that last a lifetime.",
    ctaButton: "Book Now",
    learnMore: "Our Tours",

    // --- Features Section ---
    detailsTitle: "Your Adventure Awaits",
    detailsSubtitle:
      "We offer more than just a tour; we offer an experience. Each journey is designed to immerse you in the natural beauty of Pipa.",

    // --- Tour Cards & Templates ---
    card1Title: "Sunrise Tour",
    card1Text: "Wake up before the world and paddle into magic.",
    card2Title: "Full Day Tour",
    card2Text:
      "Pipa's ultimate experience! 8 hours. 4 ecosystems. Secret beaches. And maybe a dolphin or two!",
    card3Title: "Sunset Tour",
    card3Text:
      "Don't just watch the sunset - live it from inside a Hawaiian canoe on Tibau's crystal waters.",
    viewDetails: "View Details",
    duration: "Duration",
    spotsLeft: "spots left",
    pricePrefix: "R$",
    tour_closed_badge: "Closed",
    tour_manifest_finalized: "Manifest Finalized",

    // --- Tour Detail Modal ---
    tourSunriseDetail:
      "Experience the ultimate tranquility. We depart while the stars are still out to witness the Atlantic sun emerge from the horizon. Perfect for photography and spotting dolphins in their most active hour.",
    tourFullDayDetail:
      "The total immersion. We explore the Guaraíras Lagoon, hidden mangrove tunnels, and secret sandbars. Includes local snacks and a specialized guide who knows every corner of this ecosystem.",
    tourSunsetDetail:
      "Our most popular tour. Watch the sky turn into a painting as you glide through the calm waters of Tibau. A relaxing, spiritual experience to end your day in Pipa.",
    modalIncluded: "Included:",
    modalBring: "What to bring:",
    modalIncludedList: "Canoe, Lifejacket, Professional Guide, Waterproof bags",
    modalBringList: "Sunscreen, Hat, Water, Towel, Swimwear",
    tour_sunset_short: "Don't just watch the sunset - live it from the water.",
    tour_sunset_detail:
      "Our most popular tour. Watch the sky turn into a painting as you glide through the calm waters of Tibau. A relaxing, spiritual experience to end your day in Pipa.",

    // --- Booking Search/List ---
    bookingTitle: "Check Tour Availability",
    bookingSubtitle: "Select a date to see available adventures",
    selectDateLabel: "Select Date",
    loading: "Loading available adventures...",
    errorGeneric: "Sorry, we couldn't load tour availability.",
    tours_none_available_date:
      "No tours available for this date. Please select another day.",
    closed_notice: "Bookings for this date are closed.",
    view_next_available: "View next available date",
    tours_none_available_general:
      "No tours currently available. Please check back soon!",

    // --- Booking Form ---
    bookTitle: "Book",
    labelDate: "Date",
    labelName: "Your Name",
    placeholderName: "Enter your full name",
    labelEmail: "Your Email",
    placeholderEmail: "your@email.com",
    labelNotes: "Special Notes (Optional)",
    placeholderNotes: "Food allergies or special occasions...",
    "booking.your_notes": "Your Special Requests",
    btnSubmitting: "Booking...",
    btnConfirm: "Confirm Booking",
    btnCancel: "Cancel",

    // --- Form Validation & LGPD ---
    labelAcceptTerms: "I accept the ",
    linkTerms: "Terms of Service",
    linkAnd: " and ",
    linkPrivacy: "Privacy Policy",
    errorTerms: "You must accept the terms to proceed.",
    alertMissing: "Please provide name and email.",
    alertEmail: "Invalid email address.",
    alertFailed: "Booking failed",
    alertError: "An unexpected error occurred.",
    alertPastDate:
      "Cannot book tours for past dates. Please select today or a future date.",
    error_system_overloaded:
      "We're experiencing heavy traffic. Please try again in a moment.",
    error_contract_violation:
      "A system update is required to complete this action. Please refresh the page.",
    booking_session_expired:
      "Your booking session has expired due to inactivity.",
    error_internal_server_with_id:
      "An internal error occurred. Ref: {{id}}. Please contact support.",

    // --- Payment View (Pix) ---
    paymentTitle: "Booking Reserved!",
    payment_timeout_title: "Payment Timeout",
    payment_timeout_detail:
      "We haven't received confirmation. If you've already paid, please send an email with your receipt.",
    btn_contact_support: "Contact Support",
    paymentInstruction: "Scan the QR code below to pay via Pix.",
    btnCopy: "Copy Pix Code",
    btnCopied: "Code Copied!",
    alertCopyFail: "Failed to copy. Please try selecting the text manually.",
    altQrCode: "Pix QR Code for payment",
    labelPixString: "Pix Copy & Paste Code",
    btnClose: "Close",
    btnRetry: "Try Again",
    expiresIn: "QR Code expires in",
    connectionWarning:
      "Connection slow. We are still waiting for your payment confirmation...",
    expiredTitle: "Payment Expired",
    expiredDetail:
      "This Pix code is no longer valid. Please close this window and try booking again.",
    failedTitle: "Payment Rejected",
    failedDetail:
      "The payment was rejected by the bank. Please try again or use a different payment method.",

    // --- Success View ---
    successTitle: "Payment Confirmed!",
    successMessage:
      "Your adventure is booked. We have sent a confirmation email to",
    label_booking_id: "Reservation ID",
    btn_copy_id: "Copy ID",
    btnDone: "Done",
    booking_next_full_moon_on: "The next Full Moon tour is on {date}",
    booking_no_full_moon_scheduled:
      "No Full Moon tour scheduled at the moment.",
    btn_see_meeting_point: "See Meeting Point",
    logistics_view_map: "View on Google Maps",
    logistics_meeting_instruction:
      "...See the exact location at the button below:",

    // --- Site Footer & Meta ---
    footerLegal: "Legal",
    footerTerms: "Terms of Service",
    footerPrivacy: "Privacy Policy",
    footerText: "Paddle with passion.",
    faqSectionTitle: "Your Questions Answered",
    faqSubtitle:
      "Everything you need to know about our canoe adventures in Pipa.",
    mapTitle: "Find Your Starting Point",
    mapSubtitle:
      "Our main departure is from Tibau do Sul, next to the Guaraíras Lagoon.",
    footer_developed_by: "Developed by",
    footer_powered_by: "Powered by Innovation & Human Spirit",

    // --- About Page
    about_title: "Meet Your Guide, Edu!",
    about_bio: [
      "Born in Rio de Janeiro, I grew up with the sea as an extension of my own life. Between waves, salt, and horizon, surfing and swimming shaped my relationship with nature from an early age—a connection that was never just sport, but feeling, belonging, and freedom.",
      "While still young, I went to live in the United States, where I matured, traveled, and carried this maritime identity with me. At 25, destiny took me to Hawaii, one of the most sacred places for those who live the ocean. There I dove deeply into Polynesian culture, learned about respect for the waters, ancestry, and community, and fell in love with Hawaiian canoe and kitesurfing. It was 10 years of learning, transformation, and experience living the sea in its purest form.",
      "In 2011 I returned to Brazil and arrived at Praia da Pipa, and it was love at first sight. Here I found a place where wind, lagoon, sea, and nature meet in a unique way. Pipa wasn't just a new home; it was a calling to share everything I had learned.",
      "I am a certified instructor with IKO (International Kiteboarding Organization) and since then I have been working in training, teaching, and promoting kitesurfing and Hawaiian canoe in Tibau do Sul and the region.",
      "My purpose has always been to go beyond lessons: to create experiences, build community, and bring people closer to the ocean and Guaraíras Lagoon in a conscious and respectful way.",
      "Today I follow this path through Pipa Canoa Havaiana, Pipa Kite Center, and Esporte Clube Guaraíras—projects that unite sport, culture, tourism, and connection with nature. My work is about movement, encounter, and transformation, in the water and in life.",
      "More than teaching how to paddle or sail, I want every person who crosses my path to feel what the sea gave me: freedom, balance, and belonging.",
    ],
    about_hero_tagline: "IKO Instructor · Tibau do Sul · Aloha Spirit",
    about_badges: [
      "Pipa Canoa Havaiana",
      "Pipa Kite Center",
      "Esporte Clube Guaraíras",
    ],
    about_section_story: "His Story",
    about_section_journey: "The Journey",
    about_journey_heading: "From Rio to the Pacific, and back to Pipa",
    about_timeline: [
      {
        year: "Early Years",
        location: "Rio de Janeiro",
        text: "Born into the rhythm of the Atlantic. Waves, surf, and open water shaped my earliest sense of self.",
      },
      {
        year: "Age 25",
        location: "Hawaii, USA",
        text: "Ten years of deep immersion in Polynesian culture — canoe paddling, kitesurfing, and a reverence for the ocean that changed everything.",
      },
      {
        year: "2011",
        location: "Praia da Pipa, Brazil",
        text: "Love at first sight. Wind, lagoon, sea, and nature in perfect harmony. Pipa wasn't just a destination — it was a calling.",
      },
      {
        year: "Today",
        location: "Tibau do Sul",
        text: "IKO Certified, community builder, and guide — sharing the freedom, balance, and belonging the sea once gave me.",
      },
    ],
    about_pullquote:
      "More than teaching how to paddle or sail, I want every person who crosses my path to feel what the sea gave me: freedom, balance, and belonging.",
    about_pullquote_attribution: "— Edu, Guide & Instructor",
    about_iko_status: "IKO Certified Instructor",
    about_projects:
      "Pipa Canoa Havaiana • Pipa Kite Center • Esporte Clube Guaraíras",
    about_credential_label: "Certified · Active since 2011 · Tibau do Sul, RN",
    about_cta_label: "Ready for the Experience?",
    about_cta_heading: "Book Your Tour with Edu",
    about_cta_button: "Book Now",
    logoAlt: "Pipa Canoa Havaiana Logo",

    tour_full_moon_short:
      "A mystical 4-hour journey with live Forró music and a bonfire on the dunes.",
    tour_full_moon_party_short:
      "A magical experience under the full moon, paddling through the calm waters of Pipa.",
    tour_full_moon_detail:
      "Experience the most magical tour we offer – a journey that begins with the sunset and continues into the enchanted evening to witness the full moon rising over the Atlantic. \n\nMeeting at 2:40 PM at the Sunset Stairs (Escadaria do Pôr do Sol). Includes a live Forró band, fresh tropical fruits, and a bonfire experience on the Malombar dunes. A celebration of nature's celestial dance.",

    logistics_meeting: "Meeting Point",
    logistics_duration: "Duration",
    logistics_capacity: "Capacity",

    // --- Admin Dashboard ---
    admin_cancel_confirm_title: "Cancel Tour for Weather?",
    admin_cancel_confirm_body:
      "Are you sure? This will cancel all bookings for this tour and send cancellation emails to all guests immediately. This action cannot be undone.",
    admin_cancel_success_toast:
      "Tour successfully cancelled. Guests have been notified.",
    admin_cancel_error_toast: "Failed to cancel tour: {{error}}",
    admin_cancel_go_back: "Go Back",
    admin_cancel_guests_booked: "Guests Booked",
    admin_cancel_weather_button: "Weather Cancel",

    // --- Command Center ---
    admin_cc_title: "Command Center",
    admin_cc_subtitle:
      "Real-time monitoring and system communications management.",
    admin_cc_activity_feed: "Live Activity Feed",
    admin_cc_activity_empty: "No recent activity found.",
    admin_cc_search_empty: "No events found for this search.",
    admin_cc_search_placeholder: "Search Guest or Booking ID...",
    admin_cc_refresh: "Refresh",
    admin_cc_filter_all: "All",
    admin_cc_cat_payments: "Payments",
    admin_cc_cat_communications: "E-mails",
    admin_cc_cat_bookings: "Operational",
    admin_cc_cat_system: "System",
    admin_cc_activity_hint: "Try adjusting your filters or search term.",
    admin_cc_email_controls: "Email Controls",
    admin_cc_customer: "Customer",
    admin_cc_internal: "Internal",
    admin_cc_time_label: "Time",
    admin_cc_template_gallery: "Template Gallery",
    admin_cc_preview: "Preview",
    admin_cc_preview_title: "Preview: {{name}}",
    admin_cc_preview_subtitle:
      "Exact visualization of how the customer will receive this email.",
    admin_cc_loading: "Loading template...",
    admin_cc_preview_error: "Error loading email template.",
    admin_cc_close: "Close",
    admin_cc_toast_activated: "enabled",
    admin_cc_toast_disabled: "disabled",
    admin_cc_toast_error: "Error saving change.",
    admin_cc_toast_time_success: "Time updated",
    admin_cc_toast_time_error: "Error updating time",
    admin_cc_timezone_warning:
      "TIMEZONE: PIPA/BR (GMT-3). All automated events are triggered based on local operations time.",
    admin_cc_tpl_guest_ticket: "Guest Ticket",
    admin_cc_tpl_new_booking: "New Booking Alert",
    admin_cc_tpl_refund_list: "Daily Refund List",
    admin_cc_badge_scheduled: "Scheduled",
    admin_cc_badge_instant: "Instant",
    admin_cc_tpl_guest_reminder: "24h Reminder",
    admin_cc_tpl_guest_cancel: "Weather Cancel",
    admin_cc_tpl_guest_review: "Review Request",
    admin_cc_tpl_admin_manifest: "Daily Manifest",
    admin_cc_tpl_admin_summary: "Monthly Summary",
    admin_cc_confirm_toggle_title: "Are you sure?",
    admin_cc_confirm_toggle_description:
      "You are about to {{action}} the '{{name}}' setting. This will affect all future automated communications.",
    admin_cc_confirm_toggle_confirm: "Yes, Change It",
    admin_cc_confirm_toggle_cancel: "No, Keep It",
    admin_cc_toast_settings_updated:
      "Settings updated. Event logged in Activity Feed.",
    "admin.notes_label": "Notes:",
  },

  pt: {
    // --- SEO ---
    seo_home_title: "Pipa Canoa Havaiana | Passeios ao Pôr do Sol e Lua Cheia",
    seo_home_description:
      "Experimente a magia de Pipa a partir da água. Passeios autênticos de Canoa Havaiana, aventuras ao pôr do sol e celebrações de lua cheia.",
    seo_about_title: "Conheça o Edu | Seu Capitão em Pipa",
    seo_about_description:
      "Saiba mais sobre a jornada de Eduardo do Havaí até Pipa e sua paixão pelo oceano.",
    seo_tours_title: "Passeios de Canoa em Pipa | Nascer e Pôr do Sol",
    seo_tours_description:
      "Explore nossa seleção de aventuras de Canoa Havaiana em Tibau do Sul. Passeios ao Nascer do Sol, Pôr do Sol e Lua Cheia disponíveis.",

    // --- Navegação ---
    navHome: "Início",
    navTours: "Passeios",
    navBook: "Reservar",
    navFaq: "FAQ",
    navAbout: "Sobre Nós",
    nav_notifications: "Notificações",
    nav_notifications_desc: "Alertas do sistema e atividade",
    nav_operations: "Operações",
    nav_activity: "Atividade",
    nav_emails: "E-mails",

    // --- Hero Section ---
    heroTitle: "Sinta a Pulsação do Oceano",
    heroSubtitle:
      "Descubra a alma de Pipa de uma nova perspectiva. Deslize por águas serenas, conecte-se com a natureza e crie memórias que durarão para sempre.",
    ctaButton: "Reservar Agora",
    learnMore: "Nossos Passeios",

    // --- Features Section ---
    detailsTitle: "Sua Aventura o Aguarda",
    detailsSubtitle:
      "Oferecemos mais do que um passeio; oferecemos uma experiência. Cada jornada é projetada para imergir você na beleza natural de Pipa.",

    // --- Tour Cards & Templates ---
    card1Title: "Passeio ao nascer do sol",
    card1Text: "Acorde antes do mundo e reme em direção à magia.",
    card2Title: "Tour Dia Completo",
    card2Text:
      "A experiência definitiva de Pipa! 8 horas. 4 ecossistemas. Praias secretas. E talvez um golfinho ou dois!",
    card3Title: "Passeio ao pôr do sol",
    card3Text:
      "Não apenas assista ao pôr do sol - viva-o de dentro de uma canoa havaiana nas águas cristalinas de Tibau.",
    viewDetails: "Ver Detalhes",
    duration: "Duração",
    spotsLeft: "vagas restantes",
    pricePrefix: "R$",
    tour_closed_badge: "Encerrado",
    tour_manifest_finalized: "Manifesto Finalizado",

    // --- Tour Detail Modal ---
    tourSunriseDetail:
      "Experimente a tranquilidade suprema. Partimos enquanto as estrelas ainda estão fora para testemunhar o sol surgindo no horizonte. Perfeito para fotografia e observação de golfinhos.",
    tourFullDayDetail:
      "A imersão total. Exploramos a Lagoa de Guaraíras, túneis de mangue escondidos e bancos de areia secretos. Inclui lanches locais e guia especializado.",
    tourSunsetDetail:
      "Nosso passeio mais popular. Assista ao céu se transformar em uma pintura enquanto desliza pelas águas calmas de Tibau. Uma experiência relaxante e espiritual.",
    modalIncluded: "Incluído:",
    modalBring: "O que levar:",
    modalIncludedList:
      "Canoa, Colete salva-vidas, Guia Profissional, Sacos impermeáveis",
    modalBringList: "Protetor solar, Chapéu, Água, Toalha, Roupa de banho",
    tour_sunset_short:
      "Não apenas assista ao pôr do sol - viva-o dentro d'água.",
    tour_sunset_detail:
      "Nosso passeio mais popular. Veja o céu se transformar em uma pintura enquanto desliza pelas águas calmas de Tibau. Uma experiência relaxante e espiritual.",

    // --- Booking Search/List ---
    bookingTitle: "Verificar Disponibilidade",
    bookingSubtitle: "Selecione uma data para ver as aventuras disponíveis",
    selectDateLabel: "Selecione a Data",
    loading: "Carregando aventuras disponíveis...",
    errorGeneric: "Desculpe, não conseguimos carregar a disponibilidade.",
    tours_none_available_date:
      "Não há passeios disponíveis para esta data. Por favor, selecione outro dia.",
    closed_notice: "Passeios para esta data estão encerrados.",
    view_next_available: "Ver próxima data disponível",
    tours_none_available_general:
      "Não há passeios disponíveis no momento. Por favor, volte em breve!",

    // --- Booking Form ---
    bookTitle: "Reservar",
    labelDate: "Data",
    labelName: "Seu Nome",
    placeholderName: "Digite seu nome completo",
    labelEmail: "Seu E-mail",
    placeholderEmail: "seu@email.com",
    labelNotes: "Observações (Opcional)",
    placeholderNotes: "Alergias alimentares ou ocasiões especiais...",
    "booking.your_notes": "Suas Observações",
    btnSubmitting: "Reservando...",
    btnConfirm: "Confirmar Reserva",
    btnCancel: "Cancelar",

    // --- Form Validation & LGPD ---
    labelAcceptTerms: "Eu aceito os ",
    linkTerms: "Termos de Serviço",
    linkAnd: " e a ",
    linkPrivacy: "Política de Privacidade",
    errorTerms: "Você deve aceitar os termos para continuar.",
    alertMissing: "Por favor, forneça nome e e-mail.",
    alertEmail: "Endereço de e-mail inválido.",
    alertFailed: "Falha na reserva",
    alertError: "Ocorreu um erro inesperado.",
    alertPastDate: "Não é possível reservar passeios para datas passadas.",
    error_system_overloaded:
      "Estamos com alto tráfego. Por favor, tente novamente em alguns instantes.",
    error_contract_violation:
      "Atualização necessária. Por favor, recarregue a página.",
    booking_session_expired: "Sua sessão de reserva expirou por inatividade.",
    error_internal_server_with_id:
      "Ocorreu um erro interno. Ref: {{id}}. Por favor, contate o suporte.",

    // --- Payment View (Pix) ---
    paymentTitle: "Reserva Iniciada!",
    payment_timeout_title: "Tempo de pagamento expirado",
    payment_timeout_detail:
      "Não recebemos a confirmação. Se você já pagou, envie um e-mail com o comprovante.",
    btn_contact_support: "Contactar Suporte",
    paymentInstruction: "Escaneie o QR code abaixo para pagar via Pix.",
    btnCopy: "Copiar Código Pix",
    btnCopied: "Código Copiado!",
    alertCopyFail:
      "Falha ao copiar. Por favor, tente selecionar o texto manualmente.",
    altQrCode: "QR Code Pix para pagamento",
    labelPixString: "Pix Copia e Cola",
    btnClose: "Fechar",
    btnRetry: "Tentar Novamente",
    expiresIn: "O código expira em",
    connectionWarning:
      "Conexão lenta. Ainda estamos aguardando a confirmação do seu pagamento...",
    expiredTitle: "Pagamento Expirado",
    expiredDetail:
      "Este código Pix não é mais válido. Por favor, feche esta janela e tente reservar novamente.",
    failedTitle: "Pagamento Rejeitado",
    failedDetail:
      "O pagamento foi rejeitado pelo banco. Por favor, tente novamente.",

    // --- Success View ---
    successTitle: "Pagamento Confirmado!",
    successMessage:
      "Sua aventura está reservada. Enviamos um e-mail de confirmação para",
    label_booking_id: "ID da Reserva",
    btn_copy_id: "Copiar ID",
    btnDone: "Concluído",
    booking_next_full_moon_on: "O próximo passeio de Lua Cheia é dia {date}",
    booking_no_full_moon_scheduled:
      "Nenhum passeio de Lua Cheia agendado no momento.",
    btn_see_meeting_point: "Ver Ponto de Encontro",
    logistics_view_map: "Ver no Google Maps",
    logistics_meeting_instruction:
      "...Veja a localização exata no botão abaixo:",

    // --- Footer & Meta ---
    footerLegal: "Jurídico",
    footerTerms: "Termos de Serviço",
    footerPrivacy: "Política de Privacidade",
    footerText: "Reme com paixão.",
    faqSectionTitle: "Perguntas Frequentes",
    faqSubtitle: "Tudo o que você precisa saber sobre nossos passeios em Pipa.",
    mapTitle: "Encontre Seu Ponto de Partida",
    mapSubtitle:
      "Nossa principal saída é de Tibau do Sul, ao lado da Lagoa de Guaraíras.",
    footer_developed_by: "Desenvolvido por",
    footer_powered_by: "Impulsionado por Inovação e Espírito Humano",

    // --- About Page
    about_title: "Conheça Seu Guia, Edu!",
    about_bio: [
      "Nascido no Rio de Janeiro, cresci com o mar como uma extensão da minha própria vida. Entre ondas, sal e horizonte, o surfe e a natação moldaram minha relação com a natureza desde cedo — uma conexão que nunca foi apenas esporte, mas sentimento, pertencimento e liberdade.",
      "Ainda jovem, fui viver nos Estados Unidos, onde amadureci, viajei e carreguei essa identidade marítima comigo. Aos 25 anos, o destino me levou para o Havaí, um dos lugares mais sagrados para quem vive o oceano. Lá mergulhei profundamente na cultura polinésia, aprendi sobre respeito às águas, ancestralidade e comunidade, e me apaixonei pela canoa havaiana e pelo kitesurf. Foram 10 anos de aprendizado, transformação e experiência vivendo o mar em sua forma mais pura.",
      "Em 2011 voltei para o Brasil e cheguei à Praia da Pipa, e foi amor à primeira vista. Aqui encontrei um lugar onde vento, lagoa, mar e natureza se encontram de uma forma única. Pipa não era apenas um novo lar; era um chamado para compartilhar tudo o que eu tinha aprendido.",
      "Sou instrutor certificado pela IKO (International Kiteboarding Organization) e desde então venho trabalhando em treinamento, ensino e promoção do kitesurf e da canoa havaiana em Tibau do Sul e região.",
      "Meu propósito sempre foi ir além das aulas: criar experiências, construir comunidade e aproximar as pessoas do oceano e da Lagoa de Guaraíras de uma forma consciente e respeitosa.",
      "Hoje sigo esse caminho através da Pipa Canoa Havaiana, Pipa Kite Center e Esporte Clube Guaraíras — projetos que unem esporte, cultura, turismo e conexão com a natureza. Meu trabalho é sobre movimento, encontro e transformação, na água e na vida.",
      "Mais do que ensinar a remar ou velejar, quero que cada pessoa que cruza meu caminho sinta o que o mar me deu: liberdade, equilíbrio e pertencimento.",
    ],
    about_hero_tagline: "Instrutor IKO · Tibau do Sul · Aloha Spirit",
    about_badges: [
      "Pipa Canoa Havaiana",
      "Pipa Kite Center",
      "Esporte Clube Guaraíras",
    ],
    about_section_story: "Sua História",
    about_section_journey: "A Jornada",
    about_journey_heading: "Do Rio ao Pacífico, e de volta a Pipa",
    about_timeline: [
      {
        year: "Primeiros Anos",
        location: "Rio de Janeiro",
        text: "Nascido no ritmo do Atlântico. As ondas, o surfe e o mar aberto moldaram minha identidade desde cedo.",
      },
      {
        year: "Aos 25 Anos",
        location: "Havaí, EUA",
        text: "Dez anos de imersão profunda na cultura polinésia — canoa havaiana, kitesurf e um respeito pelo oceano que transformou tudo.",
      },
      {
        year: "2011",
        location: "Praia da Pipa, Brasil",
        text: "Amor à primeira vista. Vento, lagoa, mar e natureza em perfeita harmonia. Pipa não era só um destino — era um chamado.",
      },
      {
        year: "Hoje",
        location: "Tibau do Sul",
        text: "Instrutor certificado IKO, construtor de comunidade e guia — compartilhando a liberdade, equilíbrio e pertencimento que o mar me deu.",
      },
    ],
    about_pullquote:
      "Mais do que ensinar a remar ou velejar, quero que cada pessoa que cruza meu caminho sinta o que o mar me deu: liberdade, equilíbrio e pertencimento.",
    about_pullquote_attribution: "— Edu, Guia e Instrutor",
    about_iko_status: "Instrutor Certificado IKO",
    about_projects:
      "Pipa Canoa Havaiana • Pipa Kite Center • Esporte Clube Guaraíras",
    about_credential_label: "Certificado · Ativo desde 2011 · Tibau do Sul, RN",
    about_cta_label: "Pronto para a Experiência?",
    about_cta_heading: "Reserve Seu Passeio com Edu",
    about_cta_button: "Reservar Agora",
    logoAlt: "Pipa Canoa Havaiana Logo",

    tour_full_moon_short:
      "Uma jornada mística de 4 horas com forró ao vivo e fogueira nas dunas.",
    tour_full_moon_party_short:
      "Uma experiência mágica sob a lua cheia, navegando pelas águas calmas da Pipa.",
    tour_full_moon_detail:
      "Viva o passeio mais mágico que oferecemos – uma jornada que começa com o pôr do sol e continua pela noite encantada para testemunhar a lua cheia nascendo sobre o Oceano Atlântico. \n\nEncontro às 14:40 na Escadaria do Pôr do Sol. Inclui banda de Forró ao vivo, frutas tropicais frescas e fogueira nas dunas da Malembar. Uma celebração da dança celestial da natureza.",

    logistics_meeting: "Ponto de Encontro",
    logistics_duration: "Duração",
    logistics_capacity: "Capacidade",

    // --- Admin Dashboard ---
    admin_cancel_confirm_title: "Cancelar Passeio por Clima?",
    admin_cancel_confirm_body:
      "Tem certeza? Isso cancelará todas as reservas para este passeio e enviará e-mails de cancelamento a todos os hóspedes imediatamente. Esta ação não pode ser desfeita.",
    admin_cancel_success_toast:
      "Passeio cancelado com sucesso. Os hóspedes foram notificados.",
    admin_cancel_error_toast: "Falha ao cancelar o passeio: {{error}}",
    admin_cancel_go_back: "Voltar",
    admin_cancel_guests_booked: "Hóspedes Reservados",
    admin_cancel_weather_button: "Cancelar Clima",

    // --- Command Center ---
    admin_cc_title: "Central de Comando",
    admin_cc_subtitle:
      "Monitoramento em tempo real e gestão de comunicações do sistema.",
    admin_cc_activity_feed: "Feed de Atividade ao Vivo",
    admin_cc_activity_empty: "Nenhuma atividade recente encontrada.",
    admin_cc_search_empty: "Nenhum evento encontrado para esta busca.",
    admin_cc_search_placeholder: "Buscar Hóspede ou ID da Reserva...",
    admin_cc_refresh: "Recarregar",
    admin_cc_filter_all: "Tudo",
    admin_cc_cat_payments: "Pagamentos",
    admin_cc_cat_communications: "E-mails",
    admin_cc_cat_bookings: "Operacional",
    admin_cc_cat_system: "Sistema",
    admin_cc_activity_hint: "Tente ajustar seus filtros ou termo de busca.",
    admin_cc_email_controls: "Controles de E-mail",
    admin_cc_customer: "Cliente",
    admin_cc_internal: "Interno",
    admin_cc_time_label: "Horário",
    admin_cc_template_gallery: "Galeria de Templates",
    admin_cc_preview: "Visualizar",
    admin_cc_preview_title: "Visualização: {{name}}",
    admin_cc_preview_subtitle:
      "Visualização exata de como o cliente receberá este e-mail.",
    admin_cc_loading: "Carregando template...",
    admin_cc_preview_error: "Erro ao carregar o template do e-mail.",
    admin_cc_close: "Fechar",
    admin_cc_toast_activated: "ativado",
    admin_cc_toast_disabled: "desativado",
    admin_cc_toast_error: "Erro ao salvar alteração.",
    admin_cc_toast_time_success: "Horário atualizado",
    admin_cc_toast_time_error: "Erro ao atualizar horário",
    admin_cc_timezone_warning:
      "FUSO HORÁRIO: PIPA/BR (GMT-3). Todos os eventos automáticos são disparados com base no horário local da operação.",
    admin_cc_tpl_guest_ticket: "Ticket do Hóspede",
    admin_cc_tpl_new_booking: "Alerta de Nova Reserva",
    admin_cc_tpl_refund_list: "Lista Diária de Reembolsos",
    admin_cc_badge_scheduled: "Agendado",
    admin_cc_badge_instant: "Instantâneo",
    admin_cc_tpl_guest_reminder: "Lembrete 24h",
    admin_cc_tpl_guest_cancel: "Cancelamento por Clima",
    admin_cc_tpl_guest_review: "Pedido de Avaliação",
    admin_cc_tpl_admin_manifest: "Manifesto Diário",
    admin_cc_tpl_admin_summary: "Resumo Mensal",
    admin_cc_confirm_toggle_title: "Tem certeza?",
    admin_cc_confirm_toggle_description:
      "Você está prestes a {{action}} a configuração '{{name}}'. Isso afetará todas as futuras comunicações automatizadas.",
    admin_cc_confirm_toggle_confirm: "Sim, Alterar",
    admin_cc_confirm_toggle_cancel: "Não, Manter",
    admin_cc_toast_settings_updated:
      "Configurações atualizadas. Evento registrado no Feed de Atividade.",
    "admin.notes_label": "Notas:",
  },

  es: {
    // --- SEO ---
    seo_home_title: "Pipa Canoa Havaiana | Tours de Atardecer y Luna Llena",
    seo_home_description:
      "Vive la magia de Pipa desde el agua. Tours auténticos en Canoa Hawaiana, aventuras al atardecer y celebraciones de luna llena.",
    seo_about_title: "Conoce a Edu | Tu Capitán en Pipa",
    seo_about_description:
      "Conoce el viaje de Eduardo desde Hawái hasta Pipa y su pasión por el océano.",
    seo_tours_title: "Tours en Canoa en Pipa | Amanecer y Atardecer",
    seo_tours_description:
      "Explora nuestra selección de aventuras en Canoa Hawaiana en Tibau do Sul. Tours al Amanecer, Atardecer y Luna Llena disponibles.",

    // --- Navegación ---
    navHome: "Inicio",
    navTours: "Tours",
    navBook: "Reservar",
    navFaq: "FAQ",
    navAbout: "Sobre Nosotros",
    nav_notifications: "Notificaciones",
    nav_notifications_desc: "Alertas del sistema y actividad",
    nav_operations: "Operaciones",
    nav_activity: "Actividad",
    nav_emails: "E-mails",

    // --- Hero Section ---
    heroTitle: "Siente el Latido del Océano",
    heroSubtitle:
      "Descubre el alma de Pipa desde una nueva perspectiva. Deslízate por aguas serenas, conecta con la naturaleza y crea recuerdos que durarán toda la vida.",
    ctaButton: "Reservar Ahora",
    learnMore: "Nuestros Tours",

    // --- Features Section ---
    detailsTitle: "Tu Aventura te Espera",
    detailsSubtitle:
      "Ofrecemos más que un tour; ofrecemos una experiencia. Cada viaje está diseñado para sumergirte en la belleza natural de Pipa.",

    // --- Tour Cards & Templates ---
    card1Title: "Tour Amanecer",
    card1Text: "Despierta antes que el mundo y rema hacia la magia.",
    card2Title: "Tour Día Completo",
    card2Text:
      "¡La experiencia definitiva de Pipa! 8 horas. 4 ecosistemas. Playas secretas. ¡Y quizás un delfín o dos!",
    card3Title: "Tour Atardecer",
    card3Text:
      "No solo mires el atardecer, vívelo desde dentro de una canoa hawaiana en las aguas cristalinas de Tibau.",
    viewDetails: "Ver Detalles",
    duration: "Duración",
    spotsLeft: "lugares disponibles",
    pricePrefix: "R$",
    tour_closed_badge: "Cerrado",
    tour_manifest_finalized: "Manifiesto Finalizado",

    // --- Tour Detail Modal ---
    tourSunriseDetail:
      "Experimenta la máxima tranquilidad. Partimos mientras las estrellas aún están fuera para presenciar el sol emergiendo en el horizonte. Perfecto para el avistamiento de delfines.",
    tourFullDayDetail:
      "La inmersión total. Exploramos la Laguna Guaraíras, túneles de manglar ocultos y bancos de arena secretos. Incluye bocadillos locales y guía especializado.",
    tourSunsetDetail:
      "Nuestro tour más popular. Mira cómo el cielo se convierte en una pintura mientras te deslizas por las tranquilas aguas de Tibau.",
    modalIncluded: "Incluido:",
    modalBring: "Qué llevar:",
    modalIncludedList:
      "Canoa, Chaleco salvavidas, Guía Profesional, Bolsas impermeables",
    modalBringList: "Protector solar, Gorra, Agua, Toalla, Ropa de baño",
    tour_sunset_short: "No solo mires el atardecer, vívelo desde el agua.",
    tour_sunset_detail:
      "Nuestro tour más popular. Mira cómo el cielo se convierte en una pintura mientras te deslizas por las tranquilas aguas de Tibau.",

    // --- Booking Search/List ---
    bookingTitle: "Verificar Disponibilidad",
    bookingSubtitle: "Selecciona una fecha para ver las aventuras disponibles",
    selectDateLabel: "Selecciona Fecha",
    loading: "Cargando aventuras disponibles...",
    errorGeneric: "Lo siento, no pudimos cargar la disponibilidad.",
    tours_none_available_date:
      "No hay tours disponibles para esta fecha. Por favor, seleccione otro día.",
    closed_notice: "Las reservas para esta fecha están cerradas.",
    view_next_available: "Ver próxima fecha disponible",
    tours_none_available_general:
      "No hay tours disponibles en este momento. ¡Por favor, vuelva pronto!",

    // --- Booking Form ---
    bookTitle: "Reservar",
    labelDate: "Fecha",
    labelName: "Tu Nombre",
    placeholderName: "Ingresa tu nombre completo",
    labelEmail: "Tu Correo",
    placeholderEmail: "tu@email.com",
    labelNotes: "Notas Especiales (Opcional)",
    placeholderNotes: "Alergias u ocasiones especiales...",
    "booking.your_notes": "Tus Observaciones",
    btnSubmitting: "Reservando...",
    btnConfirm: "Confirmar Reserva",
    btnCancel: "Cancelar",

    // --- Form Validation & LGPD ---
    labelAcceptTerms: "Acepto los ",
    linkTerms: "Términos de Servicio",
    linkAnd: " y la ",
    linkPrivacy: "Política de Privacidad",
    errorTerms: "Debes aceptar los términos para continuar.",
    alertMissing: "Por favor proporcione nombre y correo.",
    alertEmail: "Correo electrónico inválido.",
    alertFailed: "Fallo en la reserva",
    alertError: "Ocurrió un error inesperado.",
    alertPastDate: "No se pueden reservar tours para fechas pasadas.",
    error_system_overloaded:
      "Estamos experimentando mucho tráfico. Por favor, inténtelo de nuevo en un momento.",
    error_contract_violation:
      "Se requiere una actualización del sistema. Por favor, recarga la página.",
    booking_session_expired:
      "Tu sesión de reserva ha expirado por inactividad.",
    error_internal_server_with_id:
      "Ocurrió un error interno. Ref: {{id}}. Por favor, contacte al soporte.",

    // --- Payment View (Pix) ---
    paymentTitle: "¡Reserva Iniciada!",
    payment_timeout_title: "Tiempo de pago agotado",
    payment_timeout_detail:
      "No hemos recibido la confirmación. Si ya has pagado, por favor envía un correo con tu comprobante.",
    btn_contact_support: "Contactar Soporte",
    paymentInstruction: "Escanea el código QR abajo para pagar vía Pix.",
    btnCopy: "Copiar Código Pix",
    btnCopied: "¡Código Copiado!",
    alertCopyFail:
      "Error al copiar. Por favor, intente seleccionar el texto manualmente.",
    altQrCode: "Código QR Pix para el pago",
    labelPixString: "Código Pix Copia y Pega",
    btnClose: "Cerrar",
    btnRetry: "Reintentar",
    expiresIn: "El código expira en",
    connectionWarning:
      "Conexión lenta. Todavía estamos esperando la confirmación de su pago...",
    expiredTitle: "Pago Expirado",
    expiredDetail:
      "Este código Pix ya no es válido. Por favor, cierre esta ventana e intente reservar de nuevo.",
    failedTitle: "Pago Rechazado",
    failedDetail:
      "El pago fue rechazado por el banco. Por favor, intente de nuevo.",

    // --- Success View ---
    successTitle: "¡Pago Confirmado!",
    successMessage:
      "Tu aventura está reservada. Hemos enviado un correo de confirmación a",
    label_booking_id: "ID de Reserva",
    btn_copy_id: "Copiar ID",
    btnDone: "Listo",
    booking_next_full_moon_on: "El próximo tour de Luna Llena es el {date}",
    booking_no_full_moon_scheduled:
      "No hay tours de Luna Llena programados en este momento.",
    btn_see_meeting_point: "Ver Punto de Encuentro",
    logistics_view_map: "Ver en Google Maps",
    logistics_meeting_instruction:
      "...Vea la ubicación exacta en el botón de abajo:",

    // --- Footer & Meta ---
    footerLegal: "Aviso Legal",
    footerTerms: "Términos de Servicio",
    footerPrivacy: "Política de Privacidad",
    footerText: "Rema con pasión.",
    faqSectionTitle: "Preguntas Frecuentes",
    faqSubtitle:
      "Todo lo que necesitas saber sobre nuestras aventuras en Pipa.",
    mapTitle: "Encuentra Tu Punto de Partida",
    mapSubtitle:
      "Nuestra salida principal es desde Tibau do Sul, al lado de la Laguna de Guaraíras.",
    footer_developed_by: "Desarrollado por",
    footer_powered_by: "Impulsado por Innovación y Espíritu Humano",

    // --- About Page
    about_title: "Conoce a tu Guía, Edu!",
    about_bio: [
      "Nacido en Río de Janeiro, crecí con el mar como una extensión de mi propia vida. Entre olas, sal y horizonte, el surf y la natación moldearon mi relación con la naturaleza desde temprana edad—una conexión que nunca fue solo deporte, sino sentimiento, pertenencia y libertad.",
      "Siendo aún joven, me fui a vivir a los Estados Unidos, donde maduré, viajé y llevé conmigo esta identidad marítima. A los 25 años, el destino me llevó a Hawái, uno de los lugares más sagrados para quienes viven el océano. Allí me sumergí profundamente en la cultura polinesia, aprendí sobre el respeto por las aguas, la ancestralidad y la comunidad, y me enamoré de la canoa hawaiana y el kitesurf. Fueron 10 años de aprendizaje, transformación y vivencia del mar en su forma más pura.",
      "En 2011 regresé a Brasil y llegué a Praia da Pipa, y fue amor a primera vista. Aquí encontrei un lugar donde el viento, la laguna, el mar y la naturaleza se encuentran de una manera única. Pipa no fue solo un nuevo hogar; fue un llamado a compartir todo lo que había aprendido.",
      "Soy instructor certificado por la IKO (International Kiteboarding Organization) y desde entonces trabajo en la formación, enseñanza y promoción del kitesurf y la canoa hawaiana en Tibau do Sul y la región.",
      "Mi propósito siempre ha sido ir más allá de las clases: crear experiencias, construir comunidad y acercar a las personas al océano y a la Laguna de Guaraíras de una manera consciente y respetuosa.",
      "Hoy sigo este camino a través de Pipa Canoa Havaiana, Pipa Kite Center y Esporte Clube Guaraíras—proyectos que unen deporte, cultura, turismo y conexión con la naturaleza. Mi trabajo se trata de movimiento, encuentro y transformación, en el agua y en la vida.",
      "Más que enseñar a remar o navegar, quiero que cada persona que se cruce en mi camino sienta lo que el mar me dio: libertad, equilibrio y pertenencia.",
    ],
    about_hero_tagline: "Instructor IKO · Tibau do Sul · Aloha Spirit",
    about_badges: [
      "Pipa Canoa Havaiana",
      "Pipa Kite Center",
      "Esporte Clube Guaraíras",
    ],
    about_section_story: "Su Historia",
    about_section_journey: "El Viaje",
    about_journey_heading: "De Río al Pacífico, y de vuelta a Pipa",
    about_timeline: [
      {
        year: "Primeros Años",
        location: "Río de Janeiro",
        text: "Nacido al ritmo del Atlántico. Las olas, el surf y el mar abierto forjaron mi identidad desde temprano.",
      },
      {
        year: "A los 25 Años",
        location: "Hawái, EE.UU.",
        text: "Diez años de inmersión profunda en la cultura polinesia — canoa hawaiana, kitesurf y un respeto por el océano que lo cambió todo.",
      },
      {
        year: "2011",
        location: "Praia da Pipa, Brasil",
        text: "Amor a primera vista. Viento, laguna, mar y naturaleza en perfecta armonía. Pipa no era solo un destino — era un llamado.",
      },
      {
        year: "Hoy",
        location: "Tibau do Sul",
        text: "Instructor certificado IKO, constructor de comunidad y guía — compartiendo la libertad, el equilibrio y la pertenencia que el mar me dio.",
      },
    ],
    about_pullquote:
      "Más que enseñar a remar o navegar, quiero que cada persona que se cruce en mi camino sienta lo que el mar me dio: libertad, equilibrio y pertenencia.",
    about_pullquote_attribution: "— Edu, Guía e Instructor",
    about_iko_status: "Instructor Certificado IKO",
    about_projects:
      "Pipa Canoa Havaiana • Pipa Kite Center • Esporte Clube Guaraíras",
    about_credential_label:
      "Certificado · Activo desde 2011 · Tibau do Sul, RN",
    about_cta_label: "¿Listo para la Experiencia?",
    about_cta_heading: "Reserva Tu Tour con Edu",
    about_cta_button: "Reservar Ahora",
    logoAlt: "Pipa Canoa Havaiana Logo",

    tour_full_moon_short:
      "Un viaje místico de 4 horas con forró en vivo y fogata en las dunas.",
    tour_full_moon_party_short:
      "Una experiencia mágica bajo la luna llena, navegando por las tranquilas aguas de Pipa.",
    tour_full_moon_detail:
      "Vive el tour más mágico que ofrecemos – un viaje que comienza con el atardecer y continúa en la noche encantada para presenciar la luna llena elevándose sobre el Océano Atlántico. \n\nEncuentro a las 14:40 en la Escalera del Atardecer. Incluye banda de Forró en vivo, frutas tropicales frescas y fogata en las dunas de Malembar. Una celebración de la danza celestial de la naturaleza.",
    logistics_meeting: "Punto de Encuentro",
    logistics_duration: "Duración",
    logistics_capacity: "Capacidad",

    // --- Admin Dashboard ---
    admin_cancel_confirm_title: "¿Cancelar Tour por Clima?",
    admin_cancel_confirm_body:
      "¿Está seguro? Esto cancelará todas las reservas para este tour y enviará correos electrónicos de cancelación a todos los huéspedes de inmediato. Esta acción no se puede deshacer.",
    admin_cancel_success_toast:
      "Tour cancelado con éxito. Los huéspedes han sido notificados.",
    admin_cancel_error_toast: "Error al cancelar el tour: {{error}}",
    admin_cancel_go_back: "Volver",
    admin_cancel_guests_booked: "Huéspedes Reservados",
    admin_cancel_weather_button: "Cancelar Clima",

    // --- Command Center ---
    admin_cc_title: "Centro de Comando",
    admin_cc_subtitle:
      "Monitoreo en tiempo real y gestión de comunicaciones del sistema.",
    admin_cc_activity_feed: "Feed de Actividad en Vivo",
    admin_cc_activity_empty: "No se encontró actividad reciente.",
    admin_cc_search_empty: "No se encontraron eventos para esta búsqueda.",
    admin_cc_search_placeholder: "Buscar Huésped o ID de Reserva...",
    admin_cc_refresh: "Recargar",
    admin_cc_filter_all: "Todo",
    admin_cc_cat_payments: "Pagos",
    admin_cc_cat_communications: "E-mails",
    admin_cc_cat_bookings: "Operativo",
    admin_cc_cat_system: "Sistema",
    admin_cc_activity_hint:
      "Intente ajustar sus filtros o término de búsqueda.",
    admin_cc_email_controls: "Controles de Correo",
    admin_cc_customer: "Cliente",
    admin_cc_internal: "Interno",
    admin_cc_time_label: "Horario",
    admin_cc_template_gallery: "Galería de Plantillas",
    admin_cc_preview: "Vista Previa",
    admin_cc_preview_title: "Vista Previa: {{name}}",
    admin_cc_preview_subtitle:
      "Visualización exacta de cómo el cliente recibirá este correo.",
    admin_cc_loading: "Cargando plantilla...",
    admin_cc_preview_error: "Error al cargar la plantilla de correo.",
    admin_cc_close: "Cerrar",
    admin_cc_toast_activated: "activado",
    admin_cc_toast_disabled: "desactivado",
    admin_cc_toast_error: "Error al guardar el cambio.",
    admin_cc_toast_time_success: "Horario actualizado",
    admin_cc_toast_time_error: "Error al actualizar el horario",
    admin_cc_timezone_warning:
      "ZONA HORARIA: PIPA/BR (GMT-3). Todos los eventos automáticos se activan según la hora local de operación.",
    admin_cc_tpl_guest_ticket: "Ticket de Huésped",
    admin_cc_tpl_new_booking: "Alerta de Nueva Reserva",
    admin_cc_tpl_refund_list: "Lista Diaria de Reembolsos",
    admin_cc_badge_scheduled: "Programado",
    admin_cc_badge_instant: "Instantáneo",
    admin_cc_tpl_guest_reminder: "Recordatorio 24h",
    admin_cc_tpl_guest_cancel: "Cancelación por Clima",
    admin_cc_tpl_guest_review: "Solicitud de Reseña",
    admin_cc_tpl_admin_manifest: "Manifiesto Diario",
    admin_cc_tpl_admin_summary: "Resumen Mensual",
    admin_cc_confirm_toggle_title: "¿Está seguro?",
    admin_cc_confirm_toggle_description:
      "Está a punto de {{action}} la configuración '{{name}}'. Esto afectará a todas las comunicaciones automatizadas futuras.",
    admin_cc_confirm_toggle_confirm: "Sí, Cambiar",
    admin_cc_confirm_toggle_cancel: "No, Mantener",
    admin_cc_toast_settings_updated:
      "Configuraciones actualizadas. Evento registrado en el Feed de Atividad.",
    "admin.notes_label": "Notas:",
  },
  fr: {
    // --- SEO ---
    seo_home_title:
      "Pipa Canoa Havaiana | Tours au Coucher du Soleil et Pleine Lune",
    seo_home_description:
      "Vivez la magie de Pipa depuis l'eau. Tours authentiques en pirogue hawaïenne, aventures au coucher du soleil et célébrations de la pleine lune.",
    seo_about_title: "Rencontrez Edu | Votre Capitaine à Pipa",
    seo_about_description:
      "Découvrez le parcours d'Eduardo d'Hawaï à Pipa et sa passion pour l'océan.",
    seo_tours_title: "Tours en Pirogue à Pipa | Lever et Coucher du Soleil",
    seo_tours_description:
      "Explorez notre sélection d'aventures en pirogue hawaïenne à Tibau do Sul. Tours au lever du soleil, coucher du soleil et pleine lune disponibles.",

    // --- Navigation ---
    navHome: "Accueil",
    navTours: "Tours",
    navBook: "Réserver",
    navFaq: "FAQ",
    navAbout: "À Propos",
    nav_notifications: "Notifications",
    nav_notifications_desc: "Alertes système et activité",
    nav_operations: "Opérations",
    nav_activity: "Activité",
    nav_emails: "E-mails",

    // --- Hero Section ---
    heroTitle: "Ressentez le Pouls de l'Océan",
    heroSubtitle:
      "Découvrez l'âme de Pipa sous un nouvel angle. Glissez sur des eaux sereines, connectez-vous à la nature et créez des souvenirs impérissables.",
    ctaButton: "Réserver",
    learnMore: "Nos Tours",

    // --- Features Section ---
    detailsTitle: "Votre Aventure vous Attend",
    detailsSubtitle:
      "Nous offrons plus qu'un simple tour ; nous offrons une expérience. Chaque voyage est conçu pour vous immerger dans la beauté naturelle de Pipa.",

    // --- Tour Cards & Templates ---
    card1Title: "Tour au Lever du Soleil",
    card1Text: "Éveillez-vous avant le monde et pagayez vers la magie.",
    card2Title: "Tour Journée Complète",
    card2Text:
      "L'expérience ultime de Pipa ! 8 heures. 4 écosystèmes. Plages secrètes. Et peut-être un dauphin ou deux !",
    card3Title: "Tour au Coucher du Soleil",
    card3Text:
      "Ne vous contentez pas de regarder le coucher du soleil - vivez-le depuis une pirogue hawaïenne sur les eaux cristallines de Tibau.",
    viewDetails: "Détails",
    duration: "Durée",
    spotsLeft: "places restantes",
    pricePrefix: "R$",
    tour_closed_badge: "Fermé",
    tour_manifest_finalized: "Manifeste Finalisé",

    // --- Tour Detail Modal ---
    tourSunriseDetail:
      "Découvrez la tranquillité absolue. Nous partons sous les étoiles pour voir le soleil de l'Atlantique émerger de l'horizon. Idéal pour la photographie et l'observation des dauphins à leur heure la plus active.",
    tourFullDayDetail:
      "L'immersion totale. Nous explorons la lagune de Guaraíras, les tunnels de mangrove cachés et les bancs de sable secrets. Inclut des collations locales et un guide spécialisé qui connaît chaque recoin de cet écosystème.",
    tourSunsetDetail:
      "Notre tour le plus populaire. Regardez le ciel devenir une peinture alors que vous glissez sur les eaux calmes de Tibau. Une expérience relaxante et spirituelle pour terminer votre journée à Pipa.",
    modalIncluded: "Inclus :",
    modalBring: "À apporter :",
    modalIncludedList:
      "Pirogue, Gilet de sauvetage, Guide professionnel, Sacs étanches",
    modalBringList: "Crème solaire, Chapeau, Eau, Serviette, Maillot de bain",
    tour_sunset_short:
      "Ne regardez pas seulement le coucher du soleil - vivez-le depuis l'eau.",
    tour_sunset_detail:
      "Notre tour le plus populaire. Regardez le ciel se transformer en tableau en glissant sur les eaux calmes de Tibau. Une expérience relaxante et spirituelle.",

    // --- Booking Search/List ---
    bookingTitle: "Vérifier la Disponibilité",
    bookingSubtitle:
      "Sélectionnez une date pour voir les aventures disponibles",
    selectDateLabel: "Choisir une date",
    loading: "Chargement des aventures...",
    errorGeneric: "Désolé, nous n'avons pas pu charger les disponibilités.",
    tours_none_available_date:
      "Aucun tour disponible pour cette date. Veuillez sélectionner un autre jour.",
    closed_notice: "Les réservations pour cette date sont fermées.",
    view_next_available: "Voir la prochaine date disponible",
    tours_none_available_general:
      "Aucun tour disponible pour le moment. Veuillez revenir bientôt !",

    // --- Booking Form ---
    bookTitle: "Réserver",
    labelDate: "Date",
    labelName: "Votre Nom",
    placeholderName: "Entrez votre nom complet",
    labelEmail: "Votre Email",
    placeholderEmail: "votre@email.com",
    labelNotes: "Notes Spéciales (Optionnel)",
    placeholderNotes: "Allergies alimentaires ou occasions spéciales...",
    "booking.your_notes": "Vos Observations",
    btnSubmitting: "Réservation...",
    btnConfirm: "Confirmer la réservation",
    btnCancel: "Annuler",

    // --- Form Validation & LGPD ---
    labelAcceptTerms: "J'accepte les ",
    linkTerms: "Conditions d'utilisation",
    linkAnd: " et la ",
    linkPrivacy: "Politique de confidentialité",
    errorTerms: "Vous devez accepter les conditions pour continuer.",
    alertMissing:
      "Veuillez fournir un nom et un email.",
    alertEmail: "Adresse email invalide.",
    alertFailed: "Échec de la réservation",
    alertError: "Une erreur inattendue est survenue.",
    alertPastDate:
      "Impossible de réserver pour une date passée. Veuillez choisir aujourd'hui ou une date future.",
    error_system_overloaded:
      "Nous rencontrons un trafic important. Veuillez réessayer dans un instant.",
    error_contract_violation:
      "Une mise à jour du système est requise. Veuillez rafraîchir la page.",
    booking_session_expired:
      "Votre session de réservation a expiré pour cause d'inactivité.",
    error_internal_server_with_id:
      "Une erreur interne est survenue. Réf : {{id}}. Veuillez contacter le support.",

    // --- Payment View (Pix) ---
    paymentTitle: "Réservation Enregistrée !",
    payment_timeout_title: "Délai de paiement expiré",
    payment_timeout_detail:
      "Nous n'avons pas reçu de confirmation. Si vous avez déjà payé, veuillez envoyer un e-mail avec votre reçu.",
    btn_contact_support: "Contacter le support",
    paymentInstruction: "Scannez le code QR ci-dessous pour payer via Pix.",
    btnCopy: "Copier le code Pix",
    btnCopied: "Code Copié !",
    alertCopyFail:
      "Échec de la copie. Veuillez essayer de sélectionner le texte manuellement.",
    altQrCode: "Code QR Pix pour le paiement",
    labelPixString: "Code Pix Copier-Coller",
    btnClose: "Fermer",
    btnRetry: "Réessayer",
    expiresIn: "Le code QR expire dans",
    connectionWarning:
      "Connexion lente. Nous attendons toujours la confirmation de votre paiement...",
    expiredTitle: "Paiement Expiré",
    expiredDetail:
      "Ce code Pix n'est plus valide. Veuillez fermer cette fenêtre et réessayer de réserver.",
    failedTitle: "Paiement Rejeté",
    failedDetail:
      "Le paiement a été rejeté par la banque. Veuillez réessayer ou utiliser une autre méthode.",

    // --- Success View ---
    successTitle: "Paiement Confirmé !",
    successMessage:
      "Votre aventure est réservée. Nous avons envoyé un email de confirmation à",
    label_booking_id: "ID de Réservation",
    btn_copy_id: "Copier l'ID",
    btnDone: "Terminé",
    booking_next_full_moon_on: "Le prochain tour de Pleine Lune est le {date}",
    booking_no_full_moon_scheduled:
      "Aucun tour de Pleine Lune prévu pour le moment.",
    btn_see_meeting_point: "Voir le point de rendez-vous",
    logistics_view_map: "Voir sur Google Maps",
    logistics_meeting_instruction:
      "...Voir l'emplacement exact sur le bouton ci-dessous :",

    // --- Site Footer & Meta ---
    footerLegal: "Mentions Légales",
    footerTerms: "Conditions d'utilisation",
    footerPrivacy: "Politique de confidentialité",
    footerText: "Pagayez avec passion.",
    faqSectionTitle: "Vos Questions, nos Réponses",
    faqSubtitle:
      "Tout ce que vous devez savoir sur nos aventures en pirogue à Pipa.",
    mapTitle: "Trouvez votre point de départ",
    mapSubtitle:
      "Notre départ principal se fait depuis Tibau do Sul, à côté de la lagune de Guaraíras.",
    footer_developed_by: "Développé par",
    footer_powered_by: "Propulsé par l'Innovation et l'Esprit Humain",

    // --- About Page ---
    about_title: "Rencontrez votre guide, Edu !",
    about_bio: [
      "Né à Rio de Janeiro, j'ai grandi avec la mer comme une extension de ma propre vie. Entre vagues, sel et horizon, le surf et la natation ont façonné ma relation avec la nature dès mon plus jeune âge — une connexion qui n'a jamais été qu'un sport, mais un sentiment, une appartenance et une liberté.",
      "Encore jeune, je suis parti vivre aux États-Unis, où j'ai mûri, voyagé et porté cette identité maritime avec moi. À 25 ans, le destin m'a conduit à Hawaï, l'un des lieux les plus sacrés pour ceux qui vivent l'océan. Là-bas, j'ai plongé profondément dans la culture polynésienne, appris le respect des eaux, l'ancestralité et la communauté, et je suis tombé amoureux de la pirogue hawaïenne et du kitesurf. Ce furent 10 années d'apprentissage, de transformation et d'expérience de la mer dans sa forme la plus pure.",
      "En 2011, je suis revenu au Brésil et je suis arrivé à Praia da Pipa, et ce fut le coup de foudre. J'y ai trouvé un endroit où le vent, la lagune, la mer et la nature se rencontrent de manière unique. Pipa n'était pas seulement un nouveau foyer ; c'était un appel à partager tout ce que j'avais appris.",
      "Je suis instructeur certifié par l'IKO (International Kiteboarding Organization) et depuis lors, je travaille à la formation, l'enseignement et la promotion du kitesurf et de la pirogue hawaïenne à Tibau do Sul et dans la région.",
      "Mon but a toujours été d'aller au-delà des leçons : créer des expériences, bâtir une communauté et rapprocher les gens de l'océan et de la lagune de Guaraíras de manière consciente et respectueuse.",
      "Aujourd'hui, je poursuis ce chemin à travers Pipa Canoa Havaiana, Pipa Kite Center et l'Esporte Clube Guaraíras — des projets qui unissent sport, culture, tourisme et connexion avec la nature. Mon travail est une question de mouvement, de rencontre et de transformation, dans l'eau comme dans la vie.",
      "Plus que d'enseigner à pagayer ou à naviguer, je veux que chaque personne qui croise mon chemin ressente ce que la mer m'a donné : liberté, équilibre et appartenance.",
    ],
    about_hero_tagline: "Instructeur IKO · Tibau do Sul · Aloha Spirit",
    about_badges: [
      "Pipa Canoa Havaiana",
      "Pipa Kite Center",
      "Esporte Clube Guaraíras",
    ],
    about_section_story: "Son Histoire",
    about_section_journey: "Le Voyage",
    about_journey_heading: "De Rio au Pacifique, et retour à Pipa",
    about_timeline: [
      {
        year: "Premières Années",
        location: "Rio de Janeiro",
        text: "Né au rythme de l'Atlantique. Les vagues, le surf et la mer ouverte ont façonné mon identité dès le plus jeune âge.",
      },
      {
        year: "À 25 Ans",
        location: "Hawaï, États-Unis",
        text: "Dix ans d'immersion profonde dans la culture polynésienne — pirogue hawaïenne, kitesurf et un respect de l'océan qui a tout changé.",
      },
      {
        year: "2011",
        location: "Praia da Pipa, Brésil",
        text: "Le coup de foudre. Vent, lagune, mer et nature en parfaite harmonie. Pipa n'était pas seulement une destination — c'était un appel.",
      },
      {
        year: "Aujourd'hui",
        location: "Tibau do Sul",
        text: "Instructeur certifié IKO, bâtisseur de communauté et guide — partageant la liberté, l'équilibre et l'appartenance que la mer m'a donnés.",
      },
    ],
    about_pullquote:
      "Plus que d'enseigner à pagayer ou naviguer, je veux que chaque personne qui croise mon chemin ressente ce que la mer m'a donné : liberté, équilibre et appartenance.",
    about_pullquote_attribution: "— Edu, Guide et Instructeur",
    about_iko_status: "Instructeur certifié IKO",
    about_projects:
      "Pipa Canoa Havaiana • Pipa Kite Center • Esporte Clube Guaraíras",
    about_credential_label: "Certifié · Actif depuis 2011 · Tibau do Sul, RN",
    about_cta_label: "Prêt pour l'Expérience ?",
    about_cta_heading: "Réservez Votre Tour avec Edu",
    about_cta_button: "Réserver",
    logoAlt: "Logo Pipa Canoa Havaiana",

    // --- Special Tours ---
    tour_full_moon_short:
      "Un voyage mystique de 4 heures avec de la musique Forró en direct et un feu de camp sur les dunes.",
    tour_full_moon_party_short:
      "Une expérience magique sous la pleine lune, naviguant dans les eaux calmes de Pipa.",
    tour_full_moon_detail:
      "Découvrez le tour le plus magique que nous proposons – un voyage qui commence par le coucher du soleil et se poursuit dans la soirée enchantée pour observer la pleine lune se lever sur l'Atlantique. \n\nRDV à 14h40 à l'Escalier du Coucher de Soleil (Escadaria do Pôr do Sol). Inclut un groupe de Forró en direct, des fruits tropicaux frais et un feu de camp sur les dunes de Malombar. Une célébration de la danse céleste de la nature.",

    logistics_meeting: "Point de rencontre",
    logistics_duration: "Durée",
    logistics_capacity: "Capacité",

    // --- Admin Dashboard ---
    admin_cancel_confirm_title: "Annuler le tour pour météo ?",
    admin_cancel_confirm_body:
      "Êtes-vous sûr ? Cela annulera toutes les réservations pour ce tour et enverra immédiatement des e-mails d'annulation à tous les clients. Cette action est irréversible.",
    admin_cancel_success_toast:
      "Tour annulé avec succès. Les clients ont été informés.",
    admin_cancel_error_toast: "Échec de l'annulation du tour : {{error}}",
    admin_cancel_go_back: "Retour",
    admin_cancel_guests_booked: "Clients réservés",
    admin_cancel_weather_button: "Annulation météo",

    // --- Command Center ---
    admin_cc_title: "Centre de Commande",
    admin_cc_subtitle:
      "Surveillance en temps réel et gestion des communications système.",
    admin_cc_activity_feed: "Flux d'Activité en Direct",
    admin_cc_activity_empty: "Aucune activité récente trouvée.",
    admin_cc_search_empty: "Aucun événement trouvé pour cette recherche.",
    admin_cc_search_placeholder: "Chercher Client ou ID Réservation...",
    admin_cc_refresh: "Rafraîchir",
    admin_cc_filter_all: "Tout",
    admin_cc_cat_payments: "Paiements",
    admin_cc_cat_communications: "E-mails",
    admin_cc_cat_bookings: "Opérationnel",
    admin_cc_cat_system: "Système",
    admin_cc_activity_hint:
      "Essayez d'ajuster vos filtres ou votre terme de recherche.",
    admin_cc_email_controls: "Contrôles d'Email",
    admin_cc_customer: "Client",
    admin_cc_internal: "Interne",
    admin_cc_time_label: "Horaire",
    admin_cc_template_gallery: "Galerie de Modèles",
    admin_cc_preview: "Aperçu",
    admin_cc_preview_title: "Aperçu : {{name}}",
    admin_cc_preview_subtitle:
      "Visualisation exacte de la manière dont le client recevra cet email.",
    admin_cc_loading: "Chargement du modèle...",
    admin_cc_preview_error: "Erreur lors du chargement du modèle d'email.",
    admin_cc_close: "Fermer",
    admin_cc_toast_activated: "activé",
    admin_cc_toast_disabled: "désactivé",
    admin_cc_toast_error: "Erreur lors de l'enregistrement de la modification.",
    admin_cc_toast_time_success: "Horaire mis à jour",
    admin_cc_toast_time_error: "Erreur lors de la mise à jour de l'horaire",
    admin_cc_timezone_warning:
      "FUSEAU HORAIRE : PIPA/BR (GMT-3). Tous les événements automatisés sont déclenchés en fonction de l'heure locale des opérations.",
    admin_cc_tpl_guest_ticket: "Ticket Client",
    admin_cc_tpl_new_booking: "Alerte Nouvelle Réservation",
    admin_cc_tpl_refund_list: "Liste Quotidienne des Remboursements",
    admin_cc_badge_scheduled: "Programmé",
    admin_cc_badge_instant: "Instantané",
    admin_cc_tpl_guest_reminder: "Rappel 24h",
    admin_cc_tpl_guest_cancel: "Annulation Météo",
    admin_cc_tpl_guest_review: "Demande d'Avis",
    admin_cc_tpl_admin_manifest: "Manifeste Quotidien",
    admin_cc_tpl_admin_summary: "Résumé Mensuel",
    admin_cc_confirm_toggle_title: "Êtes-vous sûr ?",
    admin_cc_confirm_toggle_description:
      "Vous êtes sur le point de {{action}} le paramètre '{{name}}'. Cela affectera toutes les communications automatisées futures.",
    admin_cc_confirm_toggle_confirm: "Oui, Modifier",
    admin_cc_confirm_toggle_cancel: "Non, Garder",
    admin_cc_toast_settings_updated:
      "Paramètres mis à jour. Événement enregistré dans le flux d'activité.",
    "admin.notes_label": "Notes :",
  },
};
