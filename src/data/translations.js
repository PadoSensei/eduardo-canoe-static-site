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

    // --- Payment View (Pix) ---
    paymentTitle: "Booking Reserved!",
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
  },

  pt: {
    // --- Navegação ---
    navHome: "Início",
    navTours: "Passeios",
    navBook: "Reservar",
    navFaq: "FAQ",

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

    // --- Payment View (Pix) ---
    paymentTitle: "Reserva Iniciada!",
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
  },

  es: {
    // --- Navegación ---
    navHome: "Inicio",
    navTours: "Tours",
    navBook: "Reservar",
    navFaq: "FAQ",

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

    // --- Payment View (Pix) ---
    paymentTitle: "¡Reserva Iniciada!",
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
  },
};
