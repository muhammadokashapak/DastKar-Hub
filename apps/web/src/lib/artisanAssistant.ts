import { Product, SellerProfile } from '../types';
import { api } from './api';

/**
 * DastKar Hub - Intelligent Artisan Liaison & Heritage Craft Knowledge Engine
 * Connects patrons with authentic Pakistani master artisans, regional guilds,
 * live catalog discovery, and order management.
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  products?: Product[];
  makers?: SellerProfile[];
  actionType?: 'order_lookup' | 'custom_commission' | 'contact_liaison';
}

export const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'bot',
  text: 'Salam! Welcome to DastKar Hub. Sourcing directly from Pakistani master artisans without commercial middlemen. How may our workshop liaison assist your craft discovery today?',
  timestamp: 'Just now',
  quickReplies: [
    '🌟 Top Master Artisans',
    '🏺 Multani Blue Pottery',
    '🪵 Chiniot Woodcraft',
    '🧣 Handwoven Pashmina',
    '📦 Custom Orders & Escrow',
  ],
};

export interface ChatContextOptions {
  pathname?: string;
  productTitle?: string;
  makerName?: string;
}

// Safely fetch products from live API with fallback
async function fetchCatalogProducts(query: string, limit = 3): Promise<Product[]> {
  try {
    const res = await api.getProducts({ q: query, per_page: limit });
    return res.data || [];
  } catch (err) {
    console.warn('Catalog search fallback:', err);
    return [];
  }
}

// Safely fetch makers from live API with fallback
async function fetchVerifiedMakers(limit = 3): Promise<SellerProfile[]> {
  try {
    const res = await api.getMakers();
    return (res.data || []).slice(0, limit);
  } catch (err) {
    console.warn('Makers search fallback:', err);
    return [];
  }
}

export async function getArtisanAssistantReply(
  userPrompt: string,
  _history: ChatMessage[] = [],
  context?: ChatContextOptions
): Promise<Omit<ChatMessage, 'id' | 'sender' | 'timestamp'>> {
  const rawQuery = userPrompt.trim();
  const query = rawQuery.toLowerCase();

  // 1. Live Order Tracking (e.g. ORD-1234 or "track order")
  const orderMatch = query.match(/(ord-?\d+|\b\d{4,6}\b)/i);
  if (
    query.includes('track') ||
    query.includes('kahan hai mera order') ||
    query.includes('order status') ||
    query.includes('mera order') ||
    orderMatch
  ) {
    if (orderMatch) {
      const orderNum = orderMatch[1].toUpperCase();
      try {
        const orderRes = await api.getOrderByNumber(orderNum);
        if (orderRes && orderRes.data) {
          const ord = orderRes.data;
          return {
            text: `📦 **Order Status: #${ord.order_number || orderNum}**\n\n` +
              `• **Current Status:** \`${(ord.status || 'Processing').toUpperCase()}\`\n` +
              `• **Escrow Vault:** PROTECTED (HELD IN ESCROW)\n` +
              `• **Shipping Courier:** ${ord.shipping_method === 'express' ? 'Express Insured Air' : 'Standard Insured Overland'}\n` +
              `• **Total Value:** Rs. ${Number(ord.total_amount || 0).toLocaleString()}\n\n` +
              `Your payment is safely protected in double-entry escrow and will only be disbursed to the artisan once you inspect and accept your delivery!`,
            quickReplies: [
              '🚚 Delivery & Transit Times',
              '🛡️ Escrow Guarantee',
              '🌟 Top Master Artisans',
            ],
            actionType: 'order_lookup',
          };
        }
      } catch {
        // If order lookup fails or not authenticated
        return {
          text: `🔍 **Order Inquiry for #${orderNum}**\n\n` +
            `We couldn't retrieve order **#${orderNum}** directly from the guest session.\n\n` +
            `• If you placed this order under your patron account, please ensure you are signed in under **Account > Orders**.\n` +
            `• All orders feature live status milestones: *Kiln Firing / Wood Curing &rarr; Workshop Quality Inspection &rarr; Express Insured Courier Handover*.\n\n` +
            `Would you like to check your account dashboard or view delivery times?`,
          quickReplies: [
            '🚚 Courier Delivery Times',
            '🛡️ Escrow Buyer Protection',
            '🌟 Top Master Artisans',
          ],
          actionType: 'order_lookup',
        };
      }
    }

    return {
      text: `📦 **DastKar Hub Live Order Tracking**\n\n` +
        `To track an ongoing commission or delivery, simply type your order number here (e.g. **ORD-1002**) or navigate to your **Account > Orders** page.\n\n` +
        `• **Handcrafted Milestone Tracking:** Real-time visibility through raw crafting, kiln firing, packaging, and courier transit.\n` +
        `• **Transit Insurance:** If your fragile ceramics or carved crafts suffer transit breakage, our instant replacement guarantee has you covered.`,
      quickReplies: [
        '🚚 Courier Delivery Times',
        '🛡️ Escrow Buyer Protection',
        '🌟 Top Master Artisans',
      ],
      actionType: 'order_lookup',
    };
  }

  // 2. Best Handicraftsmen / Master Artisans / Top Makers / Karigar (English & Roman Urdu)
  if (
    query.includes('handicraftsmen') ||
    query.includes('artisan') ||
    query.includes('karigar') ||
    query.includes('maker') ||
    query.includes('best craftsman') ||
    query.includes('best craftsmen') ||
    query.includes('who are the best') ||
    query.includes('top craftsman') ||
    query.includes('top maker') ||
    query.includes('best artists') ||
    query.includes('famous artisan') ||
    query.includes('banane wale') ||
    query.includes('ustad kon') ||
    query.includes('top karigar')
  ) {
    const liveMakers = await fetchVerifiedMakers(3);
    return {
      text: `Pakistan is home to some of the world's most gifted master artisans, and DastKar Hub connects you directly to their ancestral workshops without middlemen:\n\n` +
        `🏺 **Ustad Ahmad Ali (Multan)** - 4th generation master of *Kashigari* (Blue Pottery). Renowned for cobalt-glazed floral urns, dining plates, and high-fired terracotta.\n\n` +
        `🪵 **Master Mohammad Rafiq & Sons (Chiniot)** - Royal Sheesham (Rosewood) carvers specializing in Mughal geometric fretwork, jharokas, and fine brass wire inlay (*Tarkashi*).\n\n` +
        `🧵 **Bibi Zarina Baloch (Turbat & Kalat)** - Master craftswoman leading a guild of 40+ rural embroiderers in authentic Balochi *Sheeshadoz* (mirror needlework).\n\n` +
        `🧣 **Ustad Ghulam Rasool (Hala, Sindh)** - Master of 14-stage natural indigo block-printed *Ajrak* and traditional Hala terracotta.\n\n` +
        `✨ **Ustad Qasim Shah (Peshawar / Qissa Khwani)** - Heritage metalsmith crafting hand-hammered brass samovars, etched tea sets, and filigree lanterns.\n\n` +
        `Every maker on our platform undergoes strict vetting with an artisan authenticity certificate. Explore featured master studios below:`,
      quickReplies: [
        '🏺 Multani Blue Pottery',
        '🪵 Chiniot Woodcraft',
        '🧣 Handwoven Pashmina',
        '📦 Custom Order Request',
      ],
      makers: liveMakers,
    };
  }

  // 3. Greetings & Introductions (English, Urdu & Roman Urdu)
  if (
    query === 'hello' ||
    query === 'hi' ||
    query === 'hey' ||
    query.startsWith('salam') ||
    query.startsWith('aoa') ||
    query.includes('assalam') ||
    query === 'hy' ||
    query === 'halo' ||
    query.includes('kese ho') ||
    query.includes('kaise ho') ||
    query.includes('kya hal') ||
    query.includes('kia haal')
  ) {
    let contextualNote = '';
    if (context?.productTitle) {
      contextualNote = `\n\nI see you are viewing **${context.productTitle}**. Would you like details regarding custom sizing, food safety, or lead-free glaze certifications?`;
    }

    return {
      text: `Walaikum Assalam and a warm welcome to DastKar Hub! 🌺\n\n` +
        `I am your direct **Artisan Workshop Liaison**. I can assist you with:\n` +
        `• Recommending verified Pakistani master artisans\n` +
        `• Exploring regional heritage crafts (Multan, Chiniot, Swat, Hala, Peshawar)\n` +
        `• Arranging bespoke custom commissions (Urdu calligraphy, customized dimensions)\n` +
        `• Explaining materials, dimensions, and lead-safe certifications\n` +
        `• Order tracking, fragile packaging, and double-entry escrow protection${contextualNote}\n\n` +
        `What craft or artisan would you like to explore today?`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '🏺 Multani Blue Pottery',
        '🪵 Chiniot Woodcraft',
        '📦 How Custom Orders Work',
      ],
    };
  }

  // 4. Multani Blue Pottery / Kashigari / Ceramics / Bartan (English & Roman Urdu)
  if (
    query.includes('blue pottery') ||
    query.includes('pottery') ||
    query.includes('kashigari') ||
    query.includes('multan') ||
    query.includes('plate') ||
    query.includes('vase') ||
    query.includes('bowl') ||
    query.includes('ceramic') ||
    query.includes('bartan') ||
    query.includes('mitti ke bartan') ||
    query.includes('multani')
  ) {
    const liveProducts = await fetchCatalogProducts('blue pottery', 3);
    return {
      text: `🏺 **Multani Blue Pottery (Kashigari)**\n\n` +
        `Originating along ancient Silk Road routes in Multan, authentic Kashigari pottery is crafted from a refined blend of white clay, quartz stone, and feldspar.\n\n` +
        `• **Glazing:** Hand-painted with natural cobalt oxide (vibrant royal blue) and copper oxide (turquoise teal).\n` +
        `• **Firing:** Kiln-baked above 1200°C for glass-like permanence.\n` +
        `• **Safety:** 100% lead-safe and food-grade, suitable for dining, hot tea, and decorative display.\n` +
        `• **Packaging:** Shipped in double-walled shock-proof wooden crates with transit replacement guarantee.\n\n` +
        `Here are authentic hand-painted pieces available right now from Multani masters:`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Engraved Pottery',
        '🚚 Fragile Packaging & Shipping',
      ],
      products: liveProducts,
    };
  }

  // 5. Woodwork / Chiniot / Rosewood / Furniture / Sheesham / Lakri (English & Roman Urdu)
  if (
    query.includes('wood') ||
    query.includes('chiniot') ||
    query.includes('sheesham') ||
    query.includes('rosewood') ||
    query.includes('table') ||
    query.includes('carving') ||
    query.includes('jharoka') ||
    query.includes('furniture') ||
    query.includes('lakri') ||
    query.includes('lakri ka kaam') ||
    query.includes('mez') ||
    query.includes('kursi')
  ) {
    const liveProducts = await fetchCatalogProducts('chiniot', 3);
    return {
      text: `🪵 **Royal Chinioti Woodcraft**\n\n` +
        `Chiniot is celebrated across South Asia for heirloom furniture and home accents crafted from seasoned Pakistani Sheesham (Dalbergia sissoo / Rosewood).\n\n` +
        `• **Technique:** Traditional hand-carved Mughal geometric openwork and floral arabesques.\n` +
        `• **Tarkashi:** Authentic master carvers hand-inlay genuine brass and copper wires directly into solid wood.\n` +
        `• **Seasoning:** Termite-treated, seasoned for 24+ months, and finished with organic wax and shellac polish.\n` +
        `• **Custom Sizes:** Master Mohammad Rafiq & Sons can build custom dimensions to fit your exact living space!`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Furniture Request',
        '🛡️ Escrow Buyer Protection',
      ],
      products: liveProducts,
    };
  }

  // 6. Pashmina / Shawls / Textiles / Swat / Hunza / Wool / Chadar (English & Roman Urdu)
  if (
    query.includes('shawl') ||
    query.includes('pashmina') ||
    query.includes('swat') ||
    query.includes('wool') ||
    query.includes('textile') ||
    query.includes('hunza') ||
    query.includes('fabric') ||
    query.includes('khadi') ||
    query.includes('embroidery') ||
    query.includes('chadar') ||
    query.includes('oon') ||
    query.includes('soot') ||
    query.includes('kashmiri')
  ) {
    const liveProducts = await fetchCatalogProducts('pashmina', 3);
    return {
      text: `🧣 **Swat Valley Pashmina & Northern Heritage Textiles**\n\n` +
        `Woven on ancestral wooden pit-looms in the northern valleys of Swat, Hunza, and Kashmir:\n\n` +
        `• **Materials:** Pure Himalayan Changthangi goat down (Pashmina) and organic mountain sheep wool.\n` +
        `• **Weaving:** Traditional 2/2 twill and diamond-weave patterns that feel feather-light yet exceptionally warm.\n` +
        `• **Needlework:** Intricate hand-stitched Kashmiri *Ari* and fine needle-drawn *Sozni* borders.\n` +
        `• **Patience:** A single intricately embroidered heirloom shawl requires 3 to 6 weeks of artisan handwork.\n\n` +
        `Every shawl is stamped with a fiber composition seal and maker authenticity certificate.`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '🧵 Balochi Needlework',
        '🌿 Sindhi Ajrak',
      ],
      products: liveProducts,
    };
  }

  // 7. Ajrak / Sindh / Hala / Block Print / Indigo / Ralli (English & Roman Urdu)
  if (
    query.includes('ajrak') ||
    query.includes('sindh') ||
    query.includes('hala') ||
    query.includes('block print') ||
    query.includes('indigo') ||
    query.includes('ralli') ||
    query.includes('chunnri') ||
    query.includes('neel')
  ) {
    const liveProducts = await fetchCatalogProducts('ajrak', 3);
    return {
      text: `🌿 **Authentic Sindhi Ajrak & Hala Heritage**\n\n` +
        `Genuine Ajrak from Hala and Matiari is one of the oldest textile traditions on Earth, dating back to Mohenjo-Daro:\n\n` +
        `• **14-Step Natural Process:** Purified cotton treated with camel milk, castor oil, and soda ash before dying.\n` +
        `• **Natural Dyes:** Deep blue from pure natural indigo (*Nīl*) and ruby red from madder root (*Majhith*).\n` +
        `• **Teak Blocks:** Carved teak wood blocks (*Por*) aligned with microscopic hand precision.\n` +
        `• **Ralli Quilts:** Patchwork quilts hand-stitched by desert craftswomen of Tharparkar.\n\n` +
        `Our Ajraks are 100% chemical-free, colourfast, and bleed-tested.`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '🏺 Multani Blue Pottery',
        '📦 Place an Order',
      ],
      products: liveProducts,
    };
  }

  // 8. Leather Crafts / Khussa / Shoes / Jutti (English & Roman Urdu)
  if (
    query.includes('leather') ||
    query.includes('khussa') ||
    query.includes('shoe') ||
    query.includes('jutti') ||
    query.includes('wallet') ||
    query.includes('chamra') ||
    query.includes('joota')
  ) {
    const liveProducts = await fetchCatalogProducts('khussa', 3);
    return {
      text: `👞 **Traditional Handcrafted Khussas & Leather**\n\n` +
        `Crafted by master cobblers in Multan, Bahawalpur, and Lahore:\n\n` +
        `• **Leather:** 100% vegetable-tanned genuine leather that molds naturally to your feet over time.\n` +
        `• **Embroidery:** Intricate gold and silver *Tilla* thread, silk floss, and dabka beadwork.\n` +
        `• **Construction:** Stitched entirely by hand with heavy waxed cotton cord (no toxic synthetic glues).\n` +
        `• **Comfort:** Padded memory cushion layer added for modern all-day wear.\n\n` +
        `Available in standard men's and women's sizes, or made-to-measure with your foot trace!`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Sizing Guide',
        '🚚 Delivery Times',
      ],
      products: liveProducts,
    };
  }

  // 9. Camel Skin Lamps & Lighting
  if (
    query.includes('lamp') ||
    query.includes('camel skin') ||
    query.includes('light') ||
    query.includes('lantern') ||
    query.includes('roshni') ||
    query.includes('oonth')
  ) {
    const liveProducts = await fetchCatalogProducts('camel skin', 3);
    return {
      text: `🏮 **Multani Camel Skin Lamps & Brass Lanterns**\n\n` +
        `A signature craft unique to Multan:\n\n` +
        `• **Material:** Washed, sun-cured camel hide shaped over earthen molds into globes and urns.\n` +
        `• **Naqashi Art:** Master painters paint intricate Mughal floral frescoes using mineral pigments.\n` +
        `• **Warm Glow:** When switched on, the translucent parchment glows with an ambient amber warmth.\n` +
        `• **Wiring:** Pre-fitted with certified heat-resistant electrical sockets suitable for standard E14/E27 LED bulbs.`,
      quickReplies: [
        '🏺 Multani Blue Pottery',
        '🪵 Chiniot Woodcraft',
        '📦 Fragile Shipping Details',
      ],
      products: liveProducts,
    };
  }

  // 10. Brass, Copper & Metalwork (Peshawar / Gujranwala)
  if (
    query.includes('brass') ||
    query.includes('copper') ||
    query.includes('metal') ||
    query.includes('samovar') ||
    query.includes('peshawar') ||
    query.includes('pital') ||
    query.includes('tamba')
  ) {
    const liveProducts = await fetchCatalogProducts('brass', 3);
    return {
      text: `✨ **Peshawar Qissa Khwani Metalcraft**\n\n` +
        `Handcrafted in the historic artisan quarters of Peshawar and Gujranwala:\n\n` +
        `• **Techniques:** Hand-hammered (*Chitai*), pierced filigree, and floral chisel work.\n` +
        `• **Pieces:** Traditional Tea Samovars, embossed brass wall trays, calligraphic shields, and moroccan lanterns.\n` +
        `• **Finish:** Polished golden brass or antique verdigris patina protected with tarnish-resistant lacquer.`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Engraved Brass',
        '🛡️ Escrow Protection',
      ],
      products: liveProducts,
    };
  }

  // 11. Custom Orders / Personalization / Custom Made / Urdu Calligraphy
  if (
    query.includes('custom') ||
    query.includes('bespoke') ||
    query.includes('personal') ||
    query.includes('engrav') ||
    query.includes('dimension') ||
    query.includes('size') ||
    query.includes('order banwana') ||
    query.includes('bana sakte') ||
    query.includes('customize') ||
    query.includes('naam likhwana') ||
    query.includes('calligraphy')
  ) {
    return {
      text: `✍️ **Bespoke Artisan Commissions & Custom Orders**\n\n` +
        `Because you are sourcing directly from master artisans, bespoke modifications are welcomed:\n\n` +
        `1. **Custom Urdu Calligraphy:** Personalize names, wedding dates, or poetic verses engraved on pottery, Sheesham wood, and brass.\n` +
        `2. **Custom Sizing & Dimensions:** Tailor dining tables, jharoka frames, and floor rugs to match your home specifications.\n` +
        `3. **Interior Color Matching:** Request custom ceramic tile glazes or shawl colorways.\n` +
        `4. **Escrow Guarantee:** Your advance payment is held safely in bank escrow until you approve the artisan's final workshop photographs before courier dispatch.\n\n` +
        `Click any option below to specify what you would like crafted!`,
      quickReplies: [
        '✍️ Custom Urdu Calligraphy',
        '🪵 Custom Furniture Sizing',
        '🏺 Custom Pottery Set',
        '🛡️ How Escrow Protects Me',
      ],
      actionType: 'custom_commission',
    };
  }

  // 12. Delivery / Shipping / Fragile Packaging / Courier Rates
  if (
    query.includes('delivery') ||
    query.includes('shipping') ||
    query.includes('courier') ||
    query.includes('packag') ||
    query.includes('tcs') ||
    query.includes('charges') ||
    query.includes('kitne din') ||
    query.includes('kahan') ||
    query.includes('toot na jaye')
  ) {
    return {
      text: `📦 **Packaging & Nationwide / Global Dispatch**\n\n` +
        `• **Fragile Packaging:** All delicate pottery, lamps, and woodwork are crated in high-density foam and shock-resistant wooden frames with 'Fragile Glassware' handling.\n` +
        `• **Delivery Times:**\n` +
        `   - In-Stock Crafts: 2 to 4 working days across Pakistan via express insured courier.\n` +
        `   - Made-to-Order Crafts: 7 to 14 working days including kiln firing and curing.\n` +
        `   - Worldwide Shipping: 7 to 10 days via DHL Express with tracking.\n` +
        `• **Transit Insurance:** If any item arrives damaged, our 100% Transit Replacement Guarantee immediately replaces the item or refunds your escrow account.`,
      quickReplies: [
        '🛡️ Escrow Guarantee',
        '🏺 Multani Blue Pottery',
        '🌟 Top Master Artisans',
      ],
    };
  }

  // 13. Authenticity / Pricing / Escrow / COD / Fraud Protection (English & Roman Urdu)
  if (
    query.includes('price') ||
    query.includes('cost') ||
    query.includes('original') ||
    query.includes('fake') ||
    query.includes('guarantee') ||
    query.includes('escrow') ||
    query.includes('asli') ||
    query.includes('rate') ||
    query.includes('safe') ||
    query.includes('payment') ||
    query.includes('cod') ||
    query.includes('cash on delivery') ||
    query.includes('jazzcash') ||
    query.includes('easypaisa') ||
    query.includes('paise')
  ) {
    return {
      text: `🛡️ **Direct Artisan Pricing & Escrow Protection**\n\n` +
        `• **Zero Middlemen:** 100% of craft revenue goes directly to the master makers, completely eliminating retail markups.\n` +
        `• **Authenticity Guarantee:** Every product comes with an artisan origin certificate and scannable QR verification code.\n` +
        `• **Patron Escrow Vault:** When you place an order, your money is held in a protected bank escrow vault. Funds are only disbursed to the artisan AFTER you receive and verify the craft at your doorstep.\n` +
        `• **Payment Channels Supported:** Cash on Delivery (COD), Visa/Mastercard, JazzCash, EasyPaisa, and Direct Bank Transfer (IBFT).`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Order Request',
        '🏺 Multani Blue Pottery',
      ],
    };
  }

  // 14. Dynamic Live Search Fallback (Check live catalog for any keyword like "truck art", "carpet", "kettle", etc.)
  const liveResults = await fetchCatalogProducts(rawQuery, 3);
  if (liveResults.length > 0) {
    return {
      text: `We found **${liveResults.length} handcrafted pieces** matching "${rawQuery}" crafted by verified Pakistani artisans:\n\n` +
        `Each piece is handcrafted using ancestral techniques and backed by our transit guarantee. You can view them directly below or add them to your cart!`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Order Request',
        '🚚 Courier Delivery Times',
      ],
      products: liveResults,
    };
  }

  // 15. Dynamic Heritage Fallback
  return {
    text: `Thank you for your inquiry regarding "${rawQuery}". \n\n` +
      `Our artisan workshop liaison connects you directly with authentic Pakistani craft masters across the provinces:\n` +
      `• **Multani Blue Pottery (Kashigari)** - Hand-painted vases, dinnerware, and glazed tiles\n` +
      `• **Chiniot Rosewood Craft** - Inlaid Sheesham tables, jharokas, and caskets\n` +
      `• **Swat Pashmina & Shawls** - Handspun northern wool and Ari needlework\n` +
      `• **Hala Ajrak & Sindh Crafts** - 14-stage natural indigo block printing\n` +
      `• **Peshawar Metalcraft** - Hand-hammered brass lanterns and samovars\n\n` +
      `Feel free to ask about any specific craft, request custom sizing, or explore our verified master makers!`,
    quickReplies: [
      '🌟 Top Master Artisans',
      '🏺 Multani Blue Pottery',
      '🪵 Chiniot Woodcraft',
      '📦 Custom Order Request',
    ],
  };
}
