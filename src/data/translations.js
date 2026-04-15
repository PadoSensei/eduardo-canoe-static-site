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
    // --- Navigation ---
    navHome: "Home",
    navTours: "Tours",
    navBook: "Book",
    navFaq: "FAQ",
    navAbout: "About Us",

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
    noTours: "No tours available for this date. Please try another day!",

    // --- Booking Form ---
    bookTitle: "Book",
    labelDate: "Date",
    labelName: "Your Name",
    placeholderName: "Enter your full name",
    labelEmail: "Your Email",
    placeholderEmail: "your@email.com",
    labelNotes: "Special Notes (Optional)",
    placeholderNotes: "Food allergies or special occasions...",
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
    labelPixString: "Pix Copy & Paste Code",
    btnClose: "Close",
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
    btnDone: "Done",
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
    about_iko_status: "IKO Certified Instructor",
    about_projects:
      "Pipa Canoa Havaiana • Pipa Kite Center • Esporte Clube Guaraíras",
    logoAlt: "Pipa Canoa Havaiana Logo",

    tour_full_moon_short:
      "A mystical 4-hour journey with live Forró music and a bonfire on the dunes.",
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
  },

  pt: {
    // --- Navegação ---
    navHome: "Início",
    navTours: "Passeios",
    navBook: "Reservar",
    navFaq: "FAQ",
    navAbout: "Sobre Nós",

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
    noTours: "Nenhum passeio disponível nesta data. Tente outro dia!",

    // --- Booking Form ---
    bookTitle: "Reservar",
    labelDate: "Data",
    labelName: "Seu Nome",
    placeholderName: "Digite seu nome completo",
    labelEmail: "Seu E-mail",
    placeholderEmail: "seu@email.com",
    labelNotes: "Observações (Opcional)",
    placeholderNotes: "Alergias alimentares ou ocasiões especiais...",
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
    labelPixString: "Pix Copia e Cola",
    btnClose: "Fechar",
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
    btnDone: "Concluído",
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
    about_iko_status: "Instrutor Certificado IKO",
    about_projects:
      "Pipa Canoa Havaiana • Pipa Kite Center • Esporte Clube Guaraíras",
    logoAlt: "Pipa Canoa Havaiana Logo",

    tour_full_moon_short:
      "Uma jornada mística de 4 horas com forró ao vivo e fogueira nas dunas.",
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
    Notifications: "Notificações",
    Settings: "Configurações",
    SaveChanges: "Salvar Alterações",
  },

  es: {
    // --- Navegación ---
    navHome: "Inicio",
    navTours: "Tours",
    navBook: "Reservar",
    navFaq: "FAQ",
    navAbout: "Sobre Nosotros",

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
    noTours: "No hay tours disponibles para esta fecha.",

    // --- Booking Form ---
    bookTitle: "Reservar",
    labelDate: "Fecha",
    labelName: "Tu Nombre",
    placeholderName: "Ingresa tu nombre completo",
    labelEmail: "Tu Correo",
    placeholderEmail: "tu@email.com",
    labelNotes: "Notas Especiales (Opcional)",
    placeholderNotes: "Alergias u ocasiones especiales...",
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
    labelPixString: "Código Pix Copia y Pega",
    btnClose: "Cerrar",
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
    btnDone: "Listo",
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
    about_iko_status: "Instructor Certificado IKO",
    about_projects:
      "Pipa Canoa Havaiana • Pipa Kite Center • Esporte Clube Guaraíras",
    logoAlt: "Pipa Canoa Havaiana Logo",

    tour_full_moon_short:
      "Un viaje místico de 4 horas con forró en vivo y fogata en las dunas.",
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
    Notifications: "Notificaciones",
    Settings: "Configuración",
    SaveChanges: "Guardar Cambios",
  },
  fr: {
    // --- Navigation ---
    navHome: "Accueil",
    navTours: "Tours",
    navBook: "Réserver",
    navFaq: "FAQ",
    navAbout: "À Propos",

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
    noTours: "Aucun tour disponible pour cette date. Essayez un autre jour !",

    // --- Booking Form ---
    bookTitle: "Réserver",
    labelDate: "Date",
    labelName: "Votre Nom",
    placeholderName: "Entrez votre nom complet",
    labelEmail: "Votre Email",
    placeholderEmail: "votre@email.com",
    labelNotes: "Notes Spéciales (Optionnel)",
    placeholderNotes: "Allergies alimentaires ou occasions spéciales...",
    btnSubmitting: "Réservation...",
    btnConfirm: "Confirmer la réservation",
    btnCancel: "Annuler",

    // --- Form Validation & LGPD ---
    labelAcceptTerms: "J'accepte les ",
    linkTerms: "Conditions d'utilisation",
    linkAnd: " et la ",
    linkPrivacy: "Politique de confidentialité",
    errorTerms: "Vous devez accepter les conditions pour continuer.",
    alertMissing: "Veuillez fournir un nom et un email.",
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
    labelPixString: "Code Pix Copier-Coller",
    btnClose: "Fermer",
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
    btnDone: "Terminé",
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
    about_iko_status: "Instructeur certifié IKO",
    about_projects:
      "Pipa Canoa Havaiana • Pipa Kite Center • Esporte Clube Guaraíras",
    logoAlt: "Logo Pipa Canoa Havaiana",

    // --- Special Tours ---
    tour_full_moon_short:
      "Un voyage mystique de 4 heures avec de la musique Forró en direct et un feu de camp sur les dunes.",
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
    Notifications: "Notifications",
    Settings: "Paramètres",
    SaveChanges: "Enregistrer les modifications",
  },
};
