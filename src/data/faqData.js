// src/data/faqData.js

export const faqData = {
  en: [
    {
      id: "experience",
      title: "The Experience & Safety",
      icon: "🛶",
      items: [
        {
          q: "I’ve never paddled a canoe before. Can I still join?",
          a: "Absolutely. Our Sunset Tour is perfect for beginners. Eduardo provides a full safety briefing and paddling instruction before we hit the water. Our Hawaiian canoes are equipped with outriggers (lateral stabilizers), making them extremely stable and nearly impossible to flip.",
        },
        {
          q: "Do I need to know how to swim?",
          a: "It is not mandatory, but you should feel comfortable being on the water. We provide professional-grade life jackets, and wearing them is mandatory for all participants throughout the duration of the tour.",
        },
        {
          q: "Are the tours physically demanding?",
          a: "The paddling is gentle and contemplative. We move at the pace of the group, and there are plenty of breaks to enjoy the scenery and swim. It’s more about the connection with nature than a workout.",
        },
        {
          q: "Can I bring my dog or other pets?",
          a: "To ensure the safety of all guests and respect the local wildlife in the mangroves, we do not allow pets on any of our tours.",
        },
        {
          q: "What is your environmental policy?",
          a: "We operate under a strict 'Leave No Trace' policy. We are guests in the Guaraíras Lagoon ecosystem. We do not leave trash, we do not feed or touch wildlife, and we use silent propulsion to minimize our impact on the environment.",
        },
      ],
    },
    {
      id: "booking",
      title: "Booking & Payments",
      icon: "💰",
      items: [
        {
          q: "How do I confirm my booking?",
          a: "We use an automated system. Your reservation is only officially confirmed once you have completed the Pix payment through the website and received your confirmation email.",
        },
        {
          q: "What is the price for children?",
          a: "We sell spaces in the canoe. Because a child occupies a dedicated seat and requires a life jacket and insurance, the price is the same as an adult.",
        },
        {
          q: "What happens if it rains or the weather is bad?",
          a: "Eduardo monitors weather and wind conditions constantly. If conditions are deemed unsafe, we will cancel the tour. In this event, you can choose between rescheduling or receiving a full refund within 5 days.",
        },
      ],
    },
    {
      id: "sunset",
      title: "Sunset Tour (Daily)",
      icon: "🌅",
      items: [
        {
          q: "What is the price and duration?",
          a: "The Sunset Tour is R$ 100 per person. The experience lasts approximately 3 hours. The standard meeting time is {sunset_meeting_time}.",
        },
        {
          q: "How many people can join?",
          a: "We have a capacity of 30 people per day for the Sunset Tour, distributed across our fleet of canoes.",
        },
      ],
    },
    {
      id: "fullmoon",
      title: "Full Moon Celebration",
      icon: "🌕",
      items: [
        {
          q: "How is this different from the Sunset Tour?",
          a: "This is a premium 4-hour special event. It includes the sunset paddle, but continues into the night. The meeting time is usually earlier, at {full_moon_meeting_time}. It features a live Forró band on support boats, fresh tropical fruits, and a bonfire experience on the Malombar dunes to watch the moon rise over the ocean.",
        },
        {
          q: "What is the price?",
          a: "The Full Moon Celebration is R$ 200 per person.",
        },
        {
          q: "What if it is cloudy during the Full Moon tour?",
          a: "The tour proceeds even if there is cloud cover. The atmosphere created by the live music, the bonfire, and the nighttime paddling is still a magical experience. We only cancel if wind or rain makes the water unsafe.",
        },
      ],
    },
    {
      id: "logistics",
      title: "Logistics",
      icon: "📍",
      items: [
        {
          q: "{faq_tour_start_q}",
          a: "{faq_tour_start_a}",
        },
        {
          q: "Where is the meeting point?",
          a: "All tours depart from Tibau do Sul. The specific meeting point is the Sunset Stairs (Escadaria do Pôr do Sol), located in front of the Lagoa Flat Condominium. ...See the exact location at the button below:",
          isMeetingPoint: true,
        },
        {
          q: "Is transportation included?",
          a: "No. Our prices are for the tour experience only. Guests are responsible for their own transportation to the meeting point in Tibau do Sul. It is a short 10-15 minute drive from the center of Pipa.",
        },
        {
          q: "What should I bring?",
          a: "Wear swimwear or light clothing that can get wet. Bring a towel, sunscreen, a hat, water, and a camera or phone (we provide waterproof bags for gear). For the Full Moon tour, we also recommend a light jacket for the evening breeze.",
        },
      ],
    },
  ],
  pt: [
    {
      id: "experience",
      title: "Experiência e Segurança",
      icon: "🛶",
      items: [
        {
          q: "Nunca andei de canoa antes. Posso participar?",
          a: "Com certeza. Nosso Passeio ao Pôr do Sol é perfeito para iniciantes. Eduardo fornece um briefing completo de segurança e instruções de remada antes de entrarmos na água. Nossas canoas havaianas são equipadas com estabilizadores laterais, tornando-as extremamente estáveis e quase impossíveis de virar.",
        },
        {
          q: "Preciso saber nadar?",
          a: "Não é obrigatório, mas você deve se sentir confortável na água. Fornecemos coletes salva-vidas de padrão profissional, e o uso é obrigatório para todos os participantes durante toda a duração do passeio.",
        },
        {
          q: "Os passeios exigem muito esforço físico?",
          a: "A remada é suave e contemplativa. Movemo-nos ao ritmo do grupo e há várias pausas para apreciar a paisagem e nadar. É mais sobre a conexão com a natureza do que um exercício físico intenso.",
        },
        {
          q: "Posso levar meu cachorro ou outros animais de estimação?",
          a: "Para garantir a segurança de todos os hóspedes e respeitar a vida selvagem local nos manguezais, não permitimos animais de estimação em nenhum de nossos passeios.",
        },
        {
          q: "Qual é a sua política ambiental?",
          a: "Operamos sob uma política rigorosa de 'Não Deixe Rastros'. Somos convidados no ecossistema da Lagoa das Guaraíras. Não deixamos lixo, não alimentamos nem tocamos na vida selvagem e usamos propulsão silenciosa para minimizar nosso impacto no meio ambiente.",
        },
      ],
    },
    {
      id: "booking",
      title: "Reservas e Pagamentos",
      icon: "💰",
      items: [
        {
          q: "Como confirmo minha reserva?",
          a: "Utilizamos um sistema automatizado. Sua reserva só é confirmada oficialmente após a conclusão do pagamento via Pix pelo site e o recebimento do e-mail de confirmação.",
        },
        {
          q: "Qual é o preço para crianças?",
          a: "Vendemos lugares na canoa. Como uma criança ocupa um assento dedicado e requer colete salva-vidas e seguro, o preço é o mesmo de um adulto.",
        },
        {
          q: "O que acontece se chover ou o tempo estiver ruim?",
          a: "Eduardo monitora constantemente as condições de tempo e vento. Se as condições forem consideradas inseguras, cancelaremos o passeio. Nesse caso, você pode escolher entre remarcar ou receber um reembolso total em até 5 dias.",
        },
      ],
    },
    {
      id: "sunset",
      title: "Pôr do Sol (Diário)",
      icon: "🌅",
      items: [
        {
          q: "Qual é o preço e a duração?",
          a: "O Passeio ao Pôr do Sol custa R$ 100 por pessoa. A experiência dura aproximadamente 3 horas. O horário padrão de encontro é às {sunset_meeting_time}.",
        },
        {
          q: "Quantas pessoas podem participar?",
          a: "Temos capacidade para 30 pessoas por dia no Passeio ao Pôr do Sol, distribuídas em nossa frota de canoas.",
        },
      ],
    },
    {
      id: "fullmoon",
      title: "Passeio da Lua Cheia",
      icon: "🌕",
      items: [
        {
          q: "Como este passeio difere do Pôr do Sol?",
          a: "Este é um evento especial premium de 4 horas. Inclui a remada ao pôr do sol, mas continua pela noite. O horário de encontro geralmente é mais cedo, às {full_moon_meeting_time}. Conta com uma banda de Forró ao vivo em barcos de apoio, frutas tropicais frescas e uma experiência de fogueira nas dunas da Malembar para ver a lua nascer sobre o oceano.",
        },
        {
          q: "Qual é o preço?",
          a: "A Celebração da Lua Cheia custa R$ 200 por pessoa.",
        },
        {
          q: "E se estiver nublado durante o passeio da Lua Cheia?",
          a: "O passeio prossegue mesmo com cobertura de nuvens. A atmosfera criada pela música ao vivo, a fogueira e a remada noturna continua sendo uma experiência mágica. Só cancelamos se o vento ou a chuva tornarem a água insegura.",
        },
      ],
    },
    {
      id: "logistics",
      title: "Logística",
      icon: "📍",
      items: [
        {
          q: "{faq_tour_start_q}",
          a: "{faq_tour_start_a}",
        },
        {
          q: "Onde é o ponto de encontro?",
          a: "Todos os passeios partem de Tibau do Sul. O ponto de encontro específico é a Escadaria do Pôr do Sol, localizada em frente ao Condomínio Lagoa Flat. ...Veja a localização exata no botão abaixo:",
          isMeetingPoint: true,
        },
        {
          q: "O transporte está incluído?",
          a: "Não. Nossos preços são apenas para a experiência do passeio. Os hóspedes são responsáveis pelo seu próprio transporte até o ponto de encontro em Tibau do Sul. Fica a cerca de 10-15 minutos de carro do centro de Pipa.",
        },
        {
          q: "O que devo levar?",
          a: "Use roupa de banho ou roupas leves que possam molhar. Traga toalha, protetor solar, chapéu, água e uma câmera ou celular (fornecemos sacos impermeáveis para os equipamentos). Para o passeio da Lua Cheia, também recomendamos um casaco leve para a brisa da noite.",
        },
      ],
    },
  ],
  es: [
    {
      id: "experience",
      title: "Experiencia y Seguridad",
      icon: "🛶",
      items: [
        {
          q: "¿Nunca he remado en una canoa antes. ¿Puedo unirme?",
          a: "Absolutamente. Nuestro Tour Atardecer es perfecto para principiantes. Eduardo ofrece una charla de seguridad completa e instrucciones de remado antes de entrar al agua. Nuestras canoas hawaianas están equipadas con estabilizadores laterales, lo que las hace extremadamente estables y casi imposibles de volcar.",
        },
        {
          q: "¿Necesito saber nadar?",
          a: "No es obligatorio, pero debes sentirte cómodo en el agua. Proporcionamos chalecos salvavidas de nivel profesional, y su uso es obligatorio para todos los participantes durante toda la duración del tour.",
        },
        {
          q: "¿Los tours son físicamente exigentes?",
          a: "El remado es suave y contemplativo. Nos movemos al ritmo del grupo y hay muchos descansos para disfrutar del paisaje y nadar. Se trata más de la conexión con la naturaleza que de un entrenamiento intenso.",
        },
        {
          q: "¿Puedo llevar a mi perro u otras mascotas?",
          a: "Para garantizar la seguridad de todos los huéspedes y respetar la vida silvestre local en los manglares, no permitimos mascotas en ninguno de nuestros tours.",
        },
        {
          q: "¿Cuál es su política ambiental?",
          a: "Operamos bajo una estricta política de 'No Dejar Rastro'. Somos invitados en el ecosistema de la Laguna de Guaraíras. No dejamos basura, no alimentamos ni tocamos a los animales salvajes y utilizamos propulsión silenciosa para minimizar nuestro impacto en el medio ambiente.",
        },
      ],
    },
    {
      id: "booking",
      title: "Reservas y Pagos",
      icon: "💰",
      items: [
        {
          q: "¿Cómo confirmo mi reserva?",
          a: "Utilizamos un sistema automatizado. Tu reserva solo se confirma oficialmente una vez que hayas completado el pago vía Pix a través del sitio web y hayas recibido tu correo electrónico de confirmación.",
        },
        {
          q: "¿Cuál es el precio para niños?",
          a: "Vendemos espacios en la canoa. Debido a que un niño ocupa un asiento dedicado y requiere chaleco salvavidas y seguro, el precio es el mismo que el de un adulto.",
        },
        {
          q: "¿Qué pasa si llueve o el clima es malo?",
          a: "Eduardo monitorea constantemente las condiciones del viento y el clima. Si las condiciones se consideran inseguras, cancelaremos el tour. En este caso, puedes elegir entre reprogramar o recibir un reembolso completo en un plazo de 5 días.",
        },
      ],
    },
    {
      id: "sunset",
      title: "Atardecer (Diario)",
      icon: "🌅",
      items: [
        {
          q: "¿Cuál es el precio y la duración?",
          a: "El Tour Atardecer cuesta R$ 100 por persona. La experiencia dura aproximadamente 3 horas. El horario de encuentro estándar es a las {sunset_meeting_time}.",
        },
        {
          q: "¿Cuántas personas pueden unirse?",
          a: "Tenemos una capacidad de 30 personas por día para el Tour Atardecer, distribuidas en nuestra flota de canoas.",
        },
      ],
    },
    {
      id: "fullmoon",
      title: "Celebración de Luna Llena",
      icon: "🌕",
      items: [
        {
          q: "¿En qué se diferencia del Tour Atardecer?",
          a: "Este es un evento especial premium de 4 horas. Incluye el remado al atardecer, pero continúa en la noche. El horario de encuentro suele ser más temprano, a las {full_moon_meeting_time}. Cuenta con una banda de Forró en vivo en botes de apoyo, frutas tropicales frescas y una experiencia de fogata en las dunas de Malombar para ver la luna salir sobre el océano.",
        },
        {
          q: "¿Cuál es el precio?",
          a: "La Celebración de Luna Llena cuesta R$ 200 por persona.",
        },
        {
          q: "¿Qué pasa si está nublado durante el tour de Luna Llena?",
          a: "El tour continúa incluso si hay nubes. La atmósfera creada por la música en vivo, la fogata y el remado nocturno sigue siendo una experiencia mágica. Solo cancelamos si el viento o la lluvia hacen que el agua sea insegura.",
        },
      ],
    },
    {
      id: "logistics",
      title: "Logística",
      icon: "📍",
      items: [
        {
          q: "{faq_tour_start_q}",
          a: "{faq_tour_start_a}",
        },
        {
          q: "¿Dónde está el punto de encuentro?",
          a: "Todos los tours salen de Tibau do Sul. El punto de encuentro específico es la Escalera del Atardecer (Escadaria do Pôr do Sol), ubicada frente al Condominio Lagoa Flat. ...Vea la ubicación exacta en el botón de abajo:",
          isMeetingPoint: true,
        },
        {
          q: "¿El transporte está incluido?",
          a: "No. Nuestros precios son solo por la experiencia del tour. Los huéspedes son responsables de su propio transporte hasta el punto de encuentro en Tibau do Sul. Está a unos 10-15 minutos en auto desde el centro de Pipa.",
        },
        {
          q: "¿Qué debo llevar?",
          a: "Usa traje de baño o ropa ligera que se pueda mojar. Trae una toalla, protector solar, un sombrero, agua y una cámara o teléfono (proporcionamos bolsas impermeables para el equipo). Para el tour de Luna Llena, también recomendamos una chaqueta ligera para la brisa nocturna.",
        },
      ],
    },
  ],
  fr: [
    {
      id: "experience",
      title: "L'Expérience et Sécurité",
      icon: "🛶",
      items: [
        {
          q: "Je n'ai jamais fait de canoë. Puis-je quand même participer ?",
          a: "Absolument. Notre Tour au Coucher du Soleil est parfait pour les débutants. Eduardo donne un briefing de sécurité complet et des instructions de pagaie avant d'entrer dans l'eau. Nos pirogues hawaiennes sont équipées de stabilisateurs latéraux, ce qui les rend extrêmement stables et presque impossibles à renverser.",
        },
        {
          q: "Dois-je savoir nager ?",
          a: "Ce n'est pas obligatoire, mais vous devez vous sentir à l'aise sur l'eau. Nous fournissons des gilets de sauvetage de qualité professionnelle, et leur port est obligatoire pour tous les participants pendant toute la durée de l'excursion.",
        },
        {
          q: "Les excursions sont-elles physiquement exigeantes ?",
          a: "La pagaie est douce et contemplative. Nous avançons au rythme du groupe, et il y a de nombreuses pauses pour profiter du paysage et se baigner. C'est plus une question de connexion avec la nature qu'une séance de sport.",
        },
        {
          q: "Puis-je emmener mon chien ou d'autres animaux ?",
          a: "Pour garantir la sécurité de tous les clients et respecter la faune locale dans les mangroves, nous n'autorisons pas les animaux de compagnie lors de nos excursions.",
        },
        {
          q: "Quelle est votre politique environnementale ?",
          a: "Nous opérons selon une politique stricte 'Sans Trace'. Nous sommes les invités de l'écosystème de la lagune de Guaraíras. Nous ne laissons pas de déchets, nous ne nourrissons pas et ne touchons pas les animaux sauvages, et nous utilisons une propulsion silencieuse pour minimiser notre impact sur l'environnement.",
        },
      ],
    },
    {
      id: "booking",
      title: "Réservations et Paiements",
      icon: "💰",
      items: [
        {
          q: "Comment confirmer ma réservation ?",
          a: "Nous utilisons un système automatisé. Votre réservation n'est officiellement confirmée qu'une fois que vous avez effectué le paiement Pix via le site web et reçu votre e-mail de confirmation.",
        },
        {
          q: "Quel est le prix pour les enfants ?",
          a: "Nous vendons des places dans le canoë. Comme un enfant occupe un siège dédié et nécessite un gilet de sauvetage et une assurance, le prix est le même que pour un adulte.",
        },
        {
          q: "Que se passe-t-il s'il pleut ou si le temps est mauvais ?",
          a: "Eduardo surveille constamment les conditions météo et le vent. Si les conditions sont jugées dangereuses, nous annulerons l'excursion. Dans ce cas, vous pouvez choisir entre un report ou un remboursement complet sous 5 jours.",
        },
      ],
    },
    {
      id: "sunset",
      title: "Coucher du Soleil (Quotidien)",
      icon: "🌅",
      items: [
        {
          q: "Quel est le prix et la durée ?",
          a: "Le Tour au Coucher du Soleil est à 100 R$ par personne. L'expérience dure environ 3 heures. L'heure de rendez-vous standard est {sunset_meeting_time}.",
        },
        {
          q: "Combien de personnes peuvent participer ?",
          a: "Nous avons une capacité de 30 personnes par jour pour le Tour au Coucher du Soleil, réparties sur notre flotte de canoës.",
        },
      ],
    },
    {
      id: "fullmoon",
      title: "Célébration de la Pleine Lune",
      icon: "🌕",
      items: [
        {
          q: "En quoi cela diffère-t-il du Tour au Coucher du Soleil ?",
          a: "Il s'agit d'un événement spécial premium de 4 heures. Il comprend la pagaie au coucher du soleil, mais se poursuit dans la nuit. L'heure de rendez-vous est généralement plus tôt, à {full_moon_meeting_time}. Il propose un groupe de Forró en direct sur des bateaux de soutien, des fruits tropicaux frais et une expérience de feu de camp sur les dunes de Malombar pour regarder la lune se lever sur l'océan.",
        },
        {
          q: "Quel est le prix ?",
          a: "La Célébration de la Pleine Lune est à 200 R$ par personne.",
        },
        {
          q: "Et s'il y a des nuages pendant le tour de la Pleine Lune ?",
          a: "L'excursion a lieu même si le ciel est couvert. L'atmosphère créée par la musique en direct, le feu de camp et la pagaie nocturne reste une expérience magique. Nous n'annulons que si le vent ou la pluie rendent l'eau dangereuse.",
        },
      ],
    },
    {
      id: "logistics",
      title: "Logistique",
      icon: "📍",
      items: [
        {
          q: "{faq_tour_start_q}",
          a: "{faq_tour_start_a}",
        },
        {
          q: "Où est le point de rendez-vous ?",
          a: "Toutes les excursions partent de Tibau do Sul. Le point de rendez-vous spécifique est l'Escalier du Coucher de Soleil (Escadaria do Pôr do Sol), situé devant le Condominium Lagoa Flat. ...Voir l'emplacement exact sur le bouton ci-dessous :",
          isMeetingPoint: true,
        },
        {
          q: "Le transport est-il inclus ?",
          a: "Non. Nos tarifs concernent uniquement l'expérience de l'excursion. Les clients sont responsables de leur propre transport jusqu'au point de rendez-vous à Tibau do Sul. C'est à environ 10-15 minutes en voiture du centre de Pipa.",
        },
        {
          q: "Que dois-je apporter ?",
          a: "Portez un maillot de bain ou des vêtements légers qui peuvent être mouillés. Apportez une serviette, de la crème solaire, un chapeau, de l'eau et un appareil photo ou un téléphone (nous fournissons des sacs étanches pour le matériel). Pour le tour de la Pleine Lune, nous recommandons également une veste légère pour la brise du soir.",
        },
      ],
    },
  ],
};
