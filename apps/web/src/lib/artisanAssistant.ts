/**
 * DastKar Hub - Intelligent Artisan Liaison & Heritage Craft Knowledge Engine
 * Provides rich, authentic cultural knowledge about Pakistani master artisans,
 * regional guilds, craft techniques, custom orders, authenticity, and logistics.
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}

export const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'bot',
  text: 'Salam! Welcome to DastKar Hub. Sourcing directly from Pakistani master artisans. How may we assist your craft discovery today?',
  timestamp: 'Just now',
  quickReplies: [
    '🌟 Top Master Artisans',
    '🏺 Multani Blue Pottery',
    '🪵 Chiniot Woodcraft',
    '🧣 Handwoven Pashmina',
    '📦 Custom Orders & Escrow',
  ],
};

export function getArtisanAssistantReply(
  userPrompt: string,
  _history: ChatMessage[] = []
): { text: string; quickReplies?: string[] } {
  const query = userPrompt.toLowerCase().trim();

  // 1. Best Handicraftsmen / Master Artisans / Top Makers / Karigar
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
    query.includes('famous artisan')
  ) {
    return {
      text: `Pakistan is home to some of the world's most gifted master artisans, and DastKar Hub connects you directly to their ancestral workshops:\n\n` +
        `🏺 **Ustad Ahmad Ali (Multan)** - 4th generation master of *Kashigari* (Blue Pottery). Renowned for cobalt-glazed floral urns, dining plates, and high-fired terracotta tiles.\n\n` +
        `🪵 **Master Mohammad Rafiq & Sons (Chiniot)** - Royal Sheesham (Rosewood) carvers specializing in Mughal geometric fretwork, jharokas, and fine brass wire inlay (*Tarkashi*).\n\n` +
        `🧵 **Bibi Zarina Baloch (Turbat & Kalat)** - Master craftswoman leading a guild of 40+ rural embroiderers in authentic Balochi *Sheeshadoz* (mirror needlework).\n\n` +
        `🧣 **Ustad Ghulam Rasool (Hala, Sindh)** - Master of 14-stage natural indigo block-printed *Ajrak* and traditional Hala earthenware.\n\n` +
        `✨ **Ustad Qasim Shah (Peshawar / Qissa Khwani)** - Heritage metalsmith crafting hand-hammered brass samovars, etched tea sets, and moroccan filigree lanterns.\n\n` +
        `🐑 **Swat Valley Handloom Guild (Swat & Hunza)** - Master weavers producing handspun Himalayan Pashmina, pure sheep wool shawls, and walnut wood items.\n\n` +
        `Every maker on our platform is verified with an authenticity certificate. Would you like to view a specific artisan's catalog or commission a custom heirloom?`,
      quickReplies: [
        '🏺 Multani Blue Pottery',
        '🪵 Chiniot Woodcraft',
        '🧣 Handwoven Pashmina',
        '📦 Custom Order Request',
      ],
    };
  }

  // 2. Greetings & Introductions
  if (
    query === 'hello' ||
    query === 'hi' ||
    query === 'hey' ||
    query.startsWith('salam') ||
    query.startsWith('aoa') ||
    query.includes('assalam') ||
    query === 'hy' ||
    query === 'halo' ||
    query === 'kese ho' ||
    query === 'kaise ho'
  ) {
    return {
      text: `Walaikum Assalam and a warm welcome to DastKar Hub! 🌺\n\n` +
        `I am your direct Artisan Workshop Liaison. I can assist you with:\n` +
        `• Recommending verified Pakistani master artisans\n` +
        `• Exploring regional heritage crafts (Multan, Chiniot, Swat, Hala, Peshawar)\n` +
        `• Arranging custom bespoke commissions with master makers\n` +
        `• Explaining materials, dimensions, and lead-safe certifications\n` +
        `• Order tracking, fragile packaging, and escrow protection\n\n` +
        `What craft or artisan would you like to explore today?`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '🏺 Multani Blue Pottery',
        '🪵 Chiniot Woodcraft',
        '📦 How Custom Orders Work',
      ],
    };
  }

  // 3. Multani Blue Pottery / Kashigari / Ceramics / Plates / Vases
  if (
    query.includes('blue pottery') ||
    query.includes('pottery') ||
    query.includes('kashigari') ||
    query.includes('multan') ||
    query.includes('plate') ||
    query.includes('vase') ||
    query.includes('bowl') ||
    query.includes('ceramic')
  ) {
    return {
      text: `🏺 **Multani Blue Pottery (Kashigari)**\n\n` +
        `Originated along ancient Silk Road routes in Multan, authentic Kashigari pottery is made from a blend of white clay, quartz stone, and feldspar. \n\n` +
        `• **Glazing:** Hand-painted with natural cobalt oxide (vibrant royal blue) and copper oxide (turquoise teal).\n` +
        `• **Firing:** Kiln-baked above 1200°C for glass-like durability.\n` +
        `• **Safety:** 100% lead-safe and food-grade, suitable for dining and display.\n` +
        `• **Makers:** Handcrafted by Ustad Ahmad Ali and Multan Artisan Cooperative.\n\n` +
        `We package all ceramics in double-walled shock-proof wooden crates. Would you like decorative wall platters, dinner sets, or custom tea mugs?`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Engraved Pottery',
        '🚚 Fragile Packaging & Shipping',
      ],
    };
  }

  // 4. Woodwork / Chiniot / Rosewood / Furniture / Sheesham
  if (
    query.includes('wood') ||
    query.includes('chiniot') ||
    query.includes('sheesham') ||
    query.includes('rosewood') ||
    query.includes('table') ||
    query.includes('carving') ||
    query.includes('jharoka') ||
    query.includes('furniture')
  ) {
    return {
      text: `🪵 **Royal Chinioti Woodcraft**\n\n` +
        `Chiniot is celebrated across South Asia for heirloom furniture crafted from seasoned Pakistani Sheesham (Dalbergia sissoo / Rosewood).\n\n` +
        `• **Technique:** Traditional hand-carved Mughal geometric openwork and floral arabesques.\n` +
        `• **Tarkashi:** Authentic master carvers hand-inlay genuine brass and copper wires into solid wood.\n` +
        `• **Durability:** Termite-treated, seasoned for 24+ months, and finished with organic wax polish.\n` +
        `• **Specialties:** Jharoka wall mirrors, nested tables, jewelry boxes, and carved dining chairs.\n\n` +
        `Master Mohammad Rafiq can also customize dimensions to fit your living space!`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Furniture Request',
        '🛡️ Escrow Buyer Protection',
      ],
    };
  }

  // 5. Pashmina / Shawls / Textiles / Swat / Hunza / Wool / Embroidery
  if (
    query.includes('shawl') ||
    query.includes('pashmina') ||
    query.includes('swat') ||
    query.includes('wool') ||
    query.includes('textile') ||
    query.includes('hunza') ||
    query.includes('fabric') ||
    query.includes('khadi') ||
    query.includes('embroidery')
  ) {
    return {
      text: `🧣 **Swat Valley Pashmina & Heritage Textiles**\n\n` +
        `Woven on ancestral wooden pit-looms in the northern valleys of Swat, Hunza, and Kashmir:\n\n` +
        `• **Materials:** Pure Himalayan Changthangi goat down (Pashmina) and organic mountain sheep wool.\n` +
        `• **Weaving:** Traditional 2/2 twill and diamond-weave patterns that feel ultra-light yet remarkably warm.\n` +
        `• **Embroidery:** Intricate hand-stitched Kashmiri *Ari* and needle-drawn *Sozni* borders.\n` +
        `• **Craft Time:** A single embroidered pashmina requires between 3 to 6 weeks of patient artisan labor.\n\n` +
        `Every shawl comes with a fiber composition seal and artisan origin certificate.`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '🧵 Balochi Needlework',
        '🧣 Sindhi Ajrak',
      ],
    };
  }

  // 6. Ajrak / Sindh / Hala / Block Print / Indigo
  if (
    query.includes('ajrak') ||
    query.includes('sindh') ||
    query.includes('hala') ||
    query.includes('block print') ||
    query.includes('indigo') ||
    query.includes('ralli')
  ) {
    return {
      text: `🌿 **Authentic Sindhi Ajrak & Hala Heritage**\n\n` +
        `Genuine Ajrak from Hala and Matiari is one of the oldest textile traditions on Earth, dating back to Mohenjo-Daro:\n\n` +
        `• **14-Step Natural Process:** Purified cotton treated with camel dung, castor oil, and soda ash before dyeing.\n` +
        `• **Natural Dyes:** Deep blue from natural indigo (*Nīl*) and ruby red from madder root (*Majhith*).\n` +
        `• **Blocks:** Hand-carved teak wood blocks (*Por*) aligned with mathematical precision.\n` +
        `• **Ralli Quilts:** Patchwork quilts hand-stitched by desert women of Tharparkar.\n\n` +
        `Our Ajraks are 100% chemical-free and bleed-tested.`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '🏺 Multani Blue Pottery',
        '📦 Place an Order',
      ],
    };
  }

  // 7. Leather Crafts / Khussa / Shoes
  if (
    query.includes('leather') ||
    query.includes('khussa') ||
    query.includes('shoe') ||
    query.includes('jutti') ||
    query.includes('wallet')
  ) {
    return {
      text: `👞 **Traditional Handcrafted Khussas & Leather**\n\n` +
        `Crafted by master cobblers in Multan, Bahawalpur, and Lahore:\n\n` +
        `• **Leather:** 100% vegetable-tanned genuine leather that molds comfortably to your feet over time.\n` +
        `• **Embroidery:** Intricate gold and silver *Tilla* thread, silk floss, and dabka beadwork.\n` +
        `• **Construction:** Stitched entirely by hand with heavy waxed cotton cord (no synthetic glue used).\n` +
        `• **Comfort:** Padded memory insole added for modern daily comfort.\n\n` +
        `Available in standard men's and women's sizes, or made-to-measure with your foot outline!`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Sizing Guide',
        '🚚 Delivery Times',
      ],
    };
  }

  // 8. Camel Skin Lamps & Lighting
  if (
    query.includes('lamp') ||
    query.includes('camel skin') ||
    query.includes('light') ||
    query.includes('lantern')
  ) {
    return {
      text: `🏮 **Multani Camel Skin Lamps & Brass Lanterns**\n\n` +
        `A signature craft unique to Multan:\n\n` +
        `• **Material:** Washed, sun-cured camel hide shaped over earthen molds into globes, table urns, and domes.\n` +
        `• **Naqashi Art:** Master painters paint intricate Mughal floral frescoes using natural mineral pigments.\n` +
        `• **Illumination:** When switched on, the parchment glows with a rich, translucent amber warmth.\n` +
        `• **Wiring:** Fitted with certified heat-resistant electrical sockets suitable for standard E14/E27 LED bulbs.`,
      quickReplies: [
        '🏺 Multani Blue Pottery',
        '🪵 Chiniot Woodcraft',
        '📦 Fragile Shipping Details',
      ],
    };
  }

  // 9. Brass, Copper & Metalwork (Peshawar)
  if (
    query.includes('brass') ||
    query.includes('copper') ||
    query.includes('metal') ||
    query.includes('samovar') ||
    query.includes('peshawar')
  ) {
    return {
      text: `✨ **Peshawar Qissa Khwani Metalcraft**\n\n` +
        `Handcrafted in the historic lanes of Peshawar and Gujranwala:\n\n` +
        `• **Techniques:** Hand-hammered (*Chitai*), pierced filigree, and floral chisel work.\n` +
        `• **Pieces:** Traditional Tea Samovars, embossed brass wall trays, calligraphic Qur'anic shields, and filigree hanging lanterns.\n` +
        `• **Finish:** Polished golden brass or antique verdigris patina protected with tarnish-resistant lacquer.`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Engraved Brass',
        '🛡️ Escrow Protection',
      ],
    };
  }

  // 10. Custom Orders / Personalization / Custom Made
  if (
    query.includes('custom') ||
    query.includes('bespoke') ||
    query.includes('personal') ||
    query.includes('engrav') ||
    query.includes('dimension') ||
    query.includes('size') ||
    query.includes('order banwana') ||
    query.includes('bana sakte') ||
    query.includes('customize')
  ) {
    return {
      text: `✍️ **Bespoke Artisan Commissions & Custom Orders**\n\n` +
        `Because you are sourcing directly from master artisans, custom pieces are welcomed:\n\n` +
        `1. **What can be customized?**\n` +
        `   • Engraved names, wedding dates, or calligraphy on pottery, wood, and brass.\n` +
        `   • Custom dimensions for dining tables, mirrors, or wall panels.\n` +
        `   • Color palette matching for tiles and dinnerware to match your home interior.\n\n` +
        `2. **Lead Time:** Typically 5 to 14 working days depending on craft complexity.\n` +
        `3. **Escrow Guarantee:** Your advance payment is held safely in escrow until you approve the artisan's final workshop photos before dispatch.\n\n` +
        `To start, message our liaison here with your specifications or click 'Request Custom Commission' on the product page!`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '🛡️ How Escrow Works',
        '🚚 Courier Delivery Times',
      ],
    };
  }

  // 11. Delivery / Shipping / Fragile Packaging
  if (
    query.includes('delivery') ||
    query.includes('shipping') ||
    query.includes('courier') ||
    query.includes('packag') ||
    query.includes('tcs') ||
    query.includes('charges') ||
    query.includes('kitne din') ||
    query.includes('kahan')
  ) {
    return {
      text: `📦 **Packaging & Nationwide / Global Dispatch**\n\n` +
        `• **Fragile Packaging:** All delicate pottery, lamps, and woodwork are crated in high-density foam and wooden frames with 'Fragile Glassware' handling.\n` +
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

  // 12. Authenticity / Pricing / Escrow / Fraud Protection
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
    query.includes('payment')
  ) {
    return {
      text: `🛡️ **Direct Artisan Pricing & Escrow Protection**\n\n` +
        `• **No Middlemen:** 100% of product revenue goes directly to the master makers, eliminating retail markups.\n` +
        `• **Authenticity Guarantee:** Every product comes with an artisan origin certificate and scannable QR verification code.\n` +
        `• **Buyer Escrow:** When you place an order, your money is held in a protected bank escrow vault. Funds are only disbursed to the artisan AFTER you receive and verify the craft at your doorstep.\n` +
        `• **Payment Methods:** Cash on Delivery (COD), Visa/Mastercard, JazzCash, EasyPaisa, and Direct Bank Transfer.`,
      quickReplies: [
        '🌟 Top Master Artisans',
        '📦 Custom Order Request',
        '🏺 Multani Blue Pottery',
      ],
    };
  }

  // 13. Dynamic Heritage Fallback
  return {
    text: `Thank you for your inquiry regarding "${userPrompt}". \n\n` +
      `Our artisan workshop liaison is here to help you connect with authentic Pakistani craft masters. We specialize in:\n` +
      `• **Multani Blue Pottery (Kashigari)** - Hand-painted vases, bowls, and tiles\n` +
      `• **Chiniot Rosewood Craft** - Inlaid Sheesham tables, jharokas, and caskets\n` +
      `• **Swat Pashmina & Shawls** - Handspun northern wool and Ari embroidery\n` +
      `• **Hala Ajrak & Sindh Crafts** - 14-stage natural indigo block printing\n` +
      `• **Peshawar Metalcraft** - Hand-hammered brass lanterns and samovars\n\n` +
      `Feel free to ask about any specific craft, request bespoke sizing, or ask to see our top master artisans!`,
    quickReplies: [
      '🌟 Top Master Artisans',
      '🏺 Multani Blue Pottery',
      '🪵 Chiniot Woodcraft',
      '📦 Custom Order Request',
    ],
  };
}
