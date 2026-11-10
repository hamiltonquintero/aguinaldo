// Secret Santa / Aguinaldo Raffle Engine with Exclusions, Derangement and Group Sharing

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateRaffle(participants) {
  if (!participants || participants.length < 2) {
    throw new Error('Se necesitan al menos 2 participantes para realizar el sorteo.');
  }

  const ids = participants.map(p => p.id);
  const participantMap = new Map(participants.map(p => [p.id, p]));

  const isForbidden = (giverId, receiverId) => {
    if (giverId === receiverId) return true;
    const giver = participantMap.get(giverId);
    if (giver && giver.exclusions && giver.exclusions.includes(receiverId)) {
      return true;
    }
    return false;
  };

  const MAX_GLOBAL_ATTEMPTS = 50;

  for (let attempt = 0; attempt < MAX_GLOBAL_ATTEMPTS; attempt++) {
    const givers = shuffleArray(ids);
    const assignedReceivers = new Set();
    const resultPairs = [];

    const backtrack = (index) => {
      if (index === givers.length) {
        return true;
      }

      const giverId = givers[index];
      const candidates = shuffleArray(
        ids.filter(candidateId => !assignedReceivers.has(candidateId) && !isForbidden(giverId, candidateId))
      );

      for (const receiverId of candidates) {
        assignedReceivers.add(receiverId);
        resultPairs.push({ giverId, receiverId });

        if (backtrack(index + 1)) {
          return true;
        }

        assignedReceivers.delete(receiverId);
        resultPairs.pop();
      }

      return false;
    };

    if (backtrack(0)) {
      return resultPairs.map(pair => {
        const giver = participantMap.get(pair.giverId);
        const receiver = participantMap.get(pair.receiverId);
        return {
          giverId: giver.id,
          giverName: giver.name,
          giverPhone: giver.phone || '',
          giverPin: giver.pin || (giver.phone ? giver.phone.replace(/[^0-9]/g, '').slice(-4) : ''),
          receiverId: receiver.id,
          receiverName: receiver.name,
          receiverWishlist: receiver.wishlist || '',
        };
      });
    }
  }

  throw new Error('No fue posible encontrar una combinación válida con las restricciones actuales. Intenta reducir las exclusiones.');
}

/**
 * Encode secret data for WhatsApp individual link
 */
export function encodeSecretTicket(ticketData) {
  try {
    const jsonStr = JSON.stringify(ticketData);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  } catch (e) {
    return null;
  }
}

/**
 * Decode secret data for individual link
 */
export function decodeSecretTicket(encodedStr) {
  try {
    const jsonStr = decodeURIComponent(escape(atob(encodedStr)));
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

/**
 * Encode FULL GROUP state for ONE single WhatsApp link
 */
export function encodeGroupPackage(raffleResults, eventConfig, requirePin = false) {
  try {
    const payload = {
      v: 1,
      title: eventConfig.title,
      date: eventConfig.date,
      time: eventConfig.time,
      budget: eventConfig.budget,
      location: eventConfig.location,
      rules: eventConfig.rules,
      requirePin: !!requirePin,
      members: raffleResults.map(r => ({
        id: r.giverId,
        name: r.giverName,
        phone: r.giverPhone,
        pin: r.giverPin || '',
        match: r.receiverName,
        wishlist: r.receiverWishlist,
      })),
    };
    const jsonStr = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  } catch (e) {
    return null;
  }
}

/**
 * Decode FULL GROUP state from URL hash
 */
export function decodeGroupPackage(encodedStr) {
  try {
    const jsonStr = decodeURIComponent(escape(atob(encodedStr)));
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

export const DEMO_PARTICIPANTS = [
  {
    id: 'p1',
    name: 'Abuela Carmen 👵',
    phone: '3001112233',
    pin: '2233',
    wishlist: 'Bufandas de lana, galletas de canela o cremas aromáticas',
    exclusions: ['p2'],
  },
  {
    id: 'p2',
    name: 'Abuelo Roberto 👴',
    phone: '3002223344',
    pin: '3344',
    wishlist: 'Café colombiano gourmet, libros de historia o medias abrigadas',
    exclusions: ['p1'],
  },
  {
    id: 'p3',
    name: 'Mamá Patricia 👩',
    phone: '3003334455',
    pin: '4455',
    wishlist: 'Velas aromáticas de vainilla, plantas suculentas o chocolates finos',
    exclusions: [],
  },
  {
    id: 'p4',
    name: 'Papá Carlos 👨',
    phone: '3004445566',
    pin: '5566',
    wishlist: 'Herramientas multiusos, gorra deportiva o una buena botella de vino',
    exclusions: [],
  },
  {
    id: 'p5',
    name: 'Prima Sofía ✨',
    phone: '3005556677',
    pin: '6677',
    wishlist: 'Maquillaje cruelty-free, audífonos o termos aesthetic para agua',
    exclusions: [],
  },
  {
    id: 'p6',
    name: 'Primo Andrés 🎮',
    phone: '3006667788',
    pin: '7788',
    wishlist: 'Juegos de mesa, funkos, chocolates con almendras o sudadera talla M',
    exclusions: [],
  },
];

export const DEMO_EVENT_CONFIG = {
  title: 'Gran Aguinaldo Navideño Familiar 2026',
  date: '24 de Diciembre (Nochebuena)',
  time: '8:00 PM',
  location: 'Casa de los Abuelos 🏡',
  budget: '$50.000 COP / $20 USD aprox.',
  rules: 'Traer el regalo empacado bien bonito sin marcar quién lo da. ¡Pista navideña obligatoria en la tarjeta!',
};
