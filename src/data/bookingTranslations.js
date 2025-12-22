export const bookingTranslations = {
  en: {
    title: "Check Tour Availability",
    subtitle: "Select a date to see available adventures",
    selectDateLabel: "Select Date",

    // States
    loading: "Loading available adventures...",
    errorGeneric: "Sorry, we couldn't load tour availability.",
    noTours: "No tours available for this date. Please try another day!",

    // Tour Card
    duration: "Duration",
    spotsLeft: "spots left", // e.g., "5 spots left"
    pricePrefix: "R$",
    bookBtn: "Book Now",
    labelNotes: "Special Notes (Optional)",
    placeholderNotes: "Food allergies or special occasions...",

    // Validation & Alerts
    alertMissing: "Please provide name and email.",
    alertEmail: "Invalid email address.",
    alertFailed: "Booking failed",
    alertError: "An unexpected error occurred.",

    // --- Booking Form Additions ---
    bookTitle: "Book", // Used as "Book {tourName}"
    labelDate: "Date",
    labelPrice: "Price",
    labelName: "Your Name",
    placeholderName: "Enter your full name",
    labelEmail: "Your Email",
    placeholderEmail: "your@email.com",
    btnSubmitting: "Booking...",
    btnConfirm: "Confirm Booking",
    btnCancel: "Cancel",

    // --- Payment View Additions ---
    paymentTitle: "Booking Reserved!",
    paymentInstruction: "Scan the QR code below to pay via Pix.",
    btnCopy: "Copy Pix Code",
    btnCopied: "Code Copied!",
    labelPixString: "Pix Copy & Paste Code",
    btnClose: "Close",
    alertCopyFail: "Please copy the code manually from the text box below.",
    altQrCode: "Payment QR Code",

    // --- Success View Additions ---
    successTitle: "Payment Confirmed!",
    successMessage:
      "Your adventure is booked. We have sent a confirmation email to",
    btnDone: "Done",
  },
  pt: {
    title: "Verificar Disponibilidade",
    subtitle: "Selecione uma data para ver as aventuras disponíveis",
    selectDateLabel: "Selecione a Data",

    // States
    loading: "Carregando aventuras disponíveis...",
    errorGeneric: "Desculpe, não conseguimos carregar a disponibilidade.",
    noTours: "Nenhum passeio disponível nesta data. Tente outro dia!",

    // Tour Card
    duration: "Duração",
    spotsLeft: "vagas restantes",
    pricePrefix: "R$",
    bookBtn: "Reservar",

    // Validation & Alerts
    alertMissing: "Por favor, forneça nome e e-mail.",
    alertEmail: "Endereço de e-mail inválido.",
    alertFailed: "Falha na reserva",
    alertError: "Ocorreu um erro inesperado.",

    // --- Booking Form Additions ---
    bookTitle: "Reservar",
    labelDate: "Data",
    labelPrice: "Preço",
    labelName: "Seu Nome",
    placeholderName: "Digite seu nome completo",
    labelEmail: "Seu E-mail",
    placeholderEmail: "seu@email.com",
    btnSubmitting: "Reservando...",
    btnConfirm: "Confirmar Reserva",
    btnCancel: "Cancelar",
    labelNotes: "Observações (Opcional)",
    placeholderNotes: "Alergias alimentares ou ocasiões especiais...",

    // --- Payment View Additions ---
    paymentTitle: "Reserva Iniciada!",
    paymentInstruction: "Escaneie o QR code abaixo para pagar via Pix.",
    btnCopy: "Copiar Código Pix",
    btnCopied: "Código Copiado!",
    labelPixString: "Pix Copia e Cola",
    btnClose: "Fechar",
    alertCopyFail: "Por favor, copie o código manualmente da caixa abaixo.",
    altQrCode: "QR Code de Pagamento",

    // --- Success View Additions ---
    successTitle: "Pagamento Confirmado!",
    successMessage:
      "Sua aventura está reservada. Enviamos um e-mail de confirmação para",
    btnDone: "Concluído",
  },
  es: {
    title: "Verificar Disponibilidad",
    subtitle: "Selecciona una fecha para ver las aventuras disponibles",
    selectDateLabel: "Selecciona Fecha",

    // States
    loading: "Cargando aventuras disponibles...",
    errorGeneric: "Lo siento, no pudimos cargar la disponibilidad.",
    noTours: "No hay tours disponibles para esta fecha. ¡Prueba otro día!",

    // Tour Card
    duration: "Duración",
    spotsLeft: "lugares disponibles",
    pricePrefix: "R$",
    bookBtn: "Reservar",

    // Validation & Alerts
    alertMissing: "Por favor proporcione nombre y correo.",
    alertEmail: "Correo electrónico inválido.",
    alertFailed: "Fallo en la reserva",
    alertError: "Ocurrió un error inesperado.",

    // --- Booking Form Additions ---
    bookTitle: "Reservar",
    labelDate: "Fecha",
    labelPrice: "Precio",
    labelName: "Tu Nombre",
    placeholderName: "Ingresa tu nombre completo",
    labelEmail: "Tu Correo",
    placeholderEmail: "tu@email.com",
    btnSubmitting: "Reservando...",
    btnConfirm: "Confirmar Reserva",
    btnCancel: "Cancelar",
    labelNotes: "Notas Especiales (Opcional)",
    placeholderNotes: "Alergias u ocasiones especiales...",

    // --- Payment View Additions ---
    paymentTitle: "¡Reserva Iniciada!",
    paymentInstruction: "Escanea el código QR abajo para pagar vía Pix.",
    btnCopy: "Copiar Código Pix",
    btnCopied: "¡Código Copiado!",
    labelPixString: "Código Pix Copia y Pega",
    btnClose: "Cerrar",
    alertCopyFail:
      "Por favor, copia el código manualmente del cuadro de abajo.",
    altQrCode: "Código QR de Pago",

    // --- Success View Additions ---
    successTitle: "¡Pago Confirmado!",
    successMessage:
      "Tu aventura está reservada. Hemos enviado un correo de confirmación a",
    btnDone: "Listo",
  },
};
