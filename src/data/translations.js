// Translation functionality
function translatePage(lang) {
  const language = translations[lang] ? lang : "en";
  const content = translations[language];

  console.log("Translating to:", language, "from hash:", window.location.hash); // Debug log

  // Update all elements with data-key attributes
  document.querySelectorAll("[data-key]").forEach((element) => {
    const key = element.dataset.key;
    if (content[key]) {
      // Handle form inputs with placeholders
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = content[key];
      } else {
        // Handle regular text content
        element.textContent = content[key];
      }
    }
  });

  // Update language link styling
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.remove("opacity-100", "font-bold");
    link.classList.add("opacity-70");
  });

  const activeLink = document.querySelector(`a[href="#${language}"]`);
  if (activeLink) {
    activeLink.classList.remove("opacity-70");
    activeLink.classList.add("opacity-100", "font-bold");
  }
}

function handleLanguageChange() {
  let lang = window.location.hash.substring(1);
  console.log("Hash detected:", window.location.hash, "Extracted lang:", lang);

  // If no hash or empty hash, default to English
  if (!lang || lang === "") {
    lang = "en";
  }

  translatePage(lang);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded, initializing translations");
  // Start with English by default
  window.location.hash = "en";
  handleLanguageChange();
});

window.addEventListener("hashchange", () => {
  console.log("Hash changed to:", window.location.hash);
  handleLanguageChange();
});

// Add click handlers for language links
document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    const href = e.target.getAttribute("href");
    const lang = href.substring(1);
    console.log("Language clicked:", lang, "Setting hash to:", href);

    // Directly set the hash and translate
    window.location.hash = href;
    translatePage(lang);
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

export const translations = {
  en: {
    inquireBtn: "Book Your Tour",
    heroTitle: "Feel the Ocean's Heartbeat",
    heroSubtitle:
      "Discover the soul of Pipa from a new perspective. Glide through serene waters, connect with nature, and create memories that last a lifetime.",
    detailsTitle: "Your Adventure Awaits",
    detailsSubtitle:
      "We offer more than just a tour; we offer an experience. Each journey is designed to immerse you in the natural beauty of Pipa.",
    card1Title: "Sunrise Tour",
    card1Text: "Wake up before the world and paddle into magic.",
    card2Title: "Full Day Tour",
    card2Text:
      "Pipa's ultimate experience! 8 hours. 4 ecosystems. Secret beaches. And maybe a dolphin or two!",
    card3Title: "Sunset Tour",
    card3Text:
      "Don't just watch the sunset - live it from inside a Hawaiian canoe on Tibau's crystal waters.",
    carouselTitle: "Moments on the Water",
    carouselSubtitle: "Visual stories from our unforgettable canoe excursions.",
    mapTitle: "Find Your Starting Point",
    mapSubtitle:
      "Our main departure is from Tibau do Sul, right next to the stunning Guaraíras Lagoon, the gateway to your adventure.",
    contactTitle: "Ready to Paddle?",
    contactSubtitle:
      "Get in touch to book your excursion or to ask any questions. We can't wait to welcome you to the water.",
    formNameLabel: "Name",
    formNamePlaceholder: "Your Name",
    formPhoneLabel: "Phone",
    formPhonePlaceholder: "Your Phone Number",
    formMessageLabel: "Message",
    formMessagePlaceholder: "Interested in the sunset tour...",
    formSubmitBtn: "Send Inquiry",
    footerText: "© 2025 Pipa Canoe Adventures. Paddle with passion.",
    navTours: "Tours",
    navBook: "Book",
    navFaq: "FAQ",
    ctaButton: "Book Now",
    learnMore: "Our Tours",
    faqSectionTitle: "Your Questions Answered",
    faqSubtitle:
      "Everything you need to know about our canoe adventures in Pipa.",
  },
  pt: {
    inquireBtn: "Reserve Seu Passeio",
    heroTitle: "Sinta a Pulsação do Oceano",
    heroSubtitle:
      "Descubra a alma de Pipa de uma nova perspectiva. Deslize por águas serenas, conecte-se com a natureza e crie memórias que durarão para sempre.",
    detailsTitle: "Sua Aventura o Aguarda",
    detailsSubtitle:
      "Oferecemos mais do que um passeio; oferecemos uma experiência. Cada jornada é projetada para imergir você na beleza natural de Pipa.",
    card1Title: "Passeio ao nascer do sol",
    card1Text: "Acorde antes do mundo e reme em direção à magia.",
    card2Title: "Tour Dia Completo",
    card2Text:
      "A experiência definitiva de Pipa! 8 horas. 4 ecossistemas. Praias secretas. E talvez um golfinho ou dois!",
    card3Title: "Passeio ao pôr do sol",
    card3Text:
      "Não apenas assista ao pôr do sol - viva-o de dentro de uma canoa havaiana nas águas cristalinas de Tibau.",
    carouselTitle: "Momentos na Água",
    carouselSubtitle:
      "Histórias visuais de nossos inesquecíveis passeios de canoa.",
    mapTitle: "Encontre Seu Ponto de Partida",
    mapSubtitle:
      "Nossa principal saída é de Tibau do Sul, bem ao lado da deslumbrante Lagoa de Guaraíras, o portão para a sua aventura.",
    contactTitle: "Pronto para Remar?",
    contactSubtitle:
      "Entre em contato para reservar seu passeio ou para tirar qualquer dúvida. Mal podemos esperar para recebê-lo na água.",
    formNameLabel: "Nome",
    formNamePlaceholder: "Seu Nome",
    formPhoneLabel: "Telefone",
    formPhonePlaceholder: "Seu Número de Telefone",
    formMessageLabel: "Mensagem",
    formMessagePlaceholder: "Interessado no passeio ao pôr do sol...",
    formSubmitBtn: "Enviar Contato",
    footerText: "© 2025 Pipa Canoe Adventures. Reme com paixão.",
    navTours: "Passeios",
    navBook: "Reservar",
    navFaq: "FAQ", // or "Dúvidas" if you prefer
    ctaButton: "Reservar Agora",
    learnMore: "Nossos Passeios",
    faqSectionTitle: "Perguntas Frequentes",
    faqSubtitle: "Tudo o que você precisa saber sobre nossos passeios em Pipa.",
  },
  es: {
    inquireBtn: "Reserva Tu Tour",
    heroTitle: "Siente el Latido del Océano",
    heroSubtitle:
      "Descubre el alma de Pipa desde una nueva perspectiva. Deslízate por aguas serenas, conecta con la naturaleza y crea recuerdos que durarán toda la vida.",
    detailsTitle: "Tu Aventura te Espera",
    detailsSubtitle:
      "Ofrecemos más que un tour; ofrecemos una experiencia. Cada viaje está diseñado para sumergirte en la belleza natural de Pipa.",
    card1Title: "Tour Amanecer",
    card1Text: "Despierta antes que el mundo y rema hacia la magia.",
    card2Title: "Tour Día Completo",
    card2Text:
      "¡La experiencia definitiva de Pipa! 8 horas. 4 ecosistemas. Playas secretas. ¡Y quizás un delfín o dos!",
    card3Title: "Tour Atardecer",
    card3Text:
      "No solo mires el atardecer, vívelo desde dentro de una canoa hawaiana en las aguas cristalinas de Tibau.",
    carouselTitle: "Momentos en el Agua",
    carouselSubtitle:
      "Historias visuales de nuestras inolvidables excursiones en canoa.",
    mapTitle: "Encuentra Tu Punto de Partida",
    mapSubtitle:
      "Nuestra salida principal es desde Tibau do Sul, justo al lado de la impresionante Laguna de Guaraíras, la puerta a tu aventura.",
    contactTitle: "¿Listo para Remar?",
    contactSubtitle:
      "Ponte en contacto para reservar tu excursión o para hacer cualquier pregunta. Estamos ansiosos por darte la bienvenida al agua.",
    formNameLabel: "Nombre",
    formNamePlaceholder: "Tu Nombre",
    formPhoneLabel: "Teléfono",
    formPhonePlaceholder: "Tu Número de Teléfono",
    formMessageLabel: "Mensaje",
    formMessagePlaceholder: "Interesado en el tour al atardecer...",
    formSubmitBtn: "Enviar Consulta",
    footerText: "© 2025 Pipa Canoe Adventures. Rema con pasión.",
    navTours: "Tours",
    navBook: "Reservar",
    navFaq: "FAQ",
    ctaButton: "Reservar Ahora",
    learnMore: "Nuestros Tours",
    faqSectionTitle: "Preguntas Frecuentes",
    faqSubtitle:
      "Todo lo que necesitas saber sobre nuestras aventuras en Pipa.",
  },
};
