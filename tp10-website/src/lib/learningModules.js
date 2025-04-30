/* --------------------------------------------------------------------------
   File: src/lib/learningModules.js
   --------------------------------------------------------------------------
   Enhanced content for each learning module: expanded overviews,
   more learning objectives, and richer etiquette entries.
   -------------------------------------------------------------------------- */

export const modulesIndex = [
    { id: 1, title: "Indigenous Heritage",   img: "/images/indigenous.jpg",    progress: 100 },
    { id: 2, title: "Asian Influences",      img: "/images/asian.jpg",         progress: 75  },
    { id: 3, title: "European Legacy",       img: "/images/european.jpg",      progress: 20  },
    { id: 4, title: "African Traditions",    img: "/images/african.jpg",       progress: 10  },
    { id: 5, title: "Middle Eastern Mosaic", img: "/images/middle-eastern.jpg",progress: 0   },
];

export const modulesById = {
    1: {
        ...modulesIndex[0],
        overview: `Explore the deep-rooted histories and living cultures of Indigenous peoples across Australia. 
    This module delves into the significance of Acknowledgement of Country, kinship systems, and the sacred
    connection to country, water, and sky. Through case studies and contemporary narratives, you will discover
    how ancient stewardship practices continue to inform modern land management, ecological science, and
    intergenerational knowledge transfer.

    By the end of this module, you will appreciate the resilience of First Nations communities and gain
    practical insights for respectful engagement in both formal ceremonies and everyday interactions.`,
        objectives: [
            "Explain the purpose and proper delivery of an Acknowledgement of Country.",
            "Describe core elements of kinship and community structures.",
            "Identify protocols for communication (including use of silence and pauses).",
            "Demonstrate when and how to seek permission for stories, images, and names.",
            "Apply principles of Caring for Country in project planning or community engagement.",
        ],
        etiquette: [
            ["Greetings",      "Begin with an Acknowledgement of Country spoken clearly and respectfully."],
            ["Communication",   "Embrace comfortable silences; avoid rapid questioning and affirm understanding."],
            ["Eye contact",     "Short glances are acceptable; sustained eye contact may be perceived as disrespectful."],
            ["Personal space", "Maintain an arm’s-length distance unless invited closer by community members."],
            ["Sorry Business",  "Respect 'Sorry Business' closures of land; avoid meetings during mourning periods."],
            ["Gift-giving",     "Offer practical gifts like food or tools; never assume alcohol is appropriate."],
            ["Names & images", "Always ask permission before using names, images, or stories—especially of the deceased."],
        ],
        resources: {
            video: "https://www.youtube.com/embed/-yXNp0yA6P8",
            guide: "https://www.qld.gov.au/__data/assets/pdf_file/0021/54769/protocols-document.pdf",
        },
    },

    2: {
        ...modulesIndex[1],
        overview: `Journey through the multifaceted cultures of East, South, and South-East Asia.
    From the Confucian courts of imperial China to the vibrant marketplaces of Mumbai and the serene temples of Japan,
    this module unpacks how historical philosophies shape modern etiquette. You will learn why the concept of
    'face' underpins professional interactions, how gift-giving varies by region, and why harmony often trumps
    blunt honesty.

    Case studies include cross-border business negotiations, dining etiquette in multi-course meals, and the role
    of honorifics in daily conversation. By module end, you will conduct yourself with confidence and cultural
    sensitivity in diverse Asian settings.`,
        objectives: [
            "Define 'face' and its impact on decision-making and conflict resolution.",
            "Exchange business cards correctly in Japanese, Chinese, and Korean contexts.",
            "List five dining taboos across Asia and explain their origins.",
            "Demonstrate appropriate use of honorific titles in various languages.",
            "Adapt nonverbal cues (bowing depth, hand placement) to regional norms.",
        ],
        etiquette: [
            ["Greetings",      "Use bows or light handshakes; always address with correct honorifics (e.g., -san, Khun)."],
            ["Business cards", "Present and receive with both hands; pause to read the card before storing it respectfully."],
            ["Dining",         "Never stick chopsticks upright in rice; allow elders or hosts to begin eating first."],
            ["Gift-giving",    "Present gifts ceremonially; avoid clocks/white flowers in Chinese contexts."],
            ["Shoes",          "Remove footwear before entering homes, certain temples, and some offices."],
            ["Harmony",        "Phrase disagreements indirectly; use softening phrases like 'maybe' or 'possibly'."],
            ["Silence",        "Silences convey respect and thoughtfulness; avoid filling every pause."],
        ],
        resources: {
            video: "https://www.youtube.com/embed/zD1h7u9Tx6Q",
            guide: "https://asiasociety.org/education/manners-east-asia",
        },
    },

    3: {
        ...modulesIndex[2],
        overview: `Uncover the layers of European cultural etiquette, from the punctual precision of
    Northern Europe to the leisurely social rituals of the Mediterranean. Explore how historical events—such as
    the Renaissance, Reformation, and Industrial Revolution—influenced modern business decorum, table manners,
    and conversational frameworks.

    Through comparative analysis, you will master the art of small talk, historical greetings, and appropriate
    gift-giving across countries. Interactive maps highlight regional differences, while real-world scenarios
    prepare you for diplomatic receptions and cross-border collaborations.`,
        objectives: [
            "Compare punctuality expectations between Germany, Sweden, Italy, and Spain.",
            "Apply EU-wide dining etiquette at formal and informal occasions.",
            "Recognize taboo topics and redirect conversations tactfully.",
            "Select culturally appropriate gifts for business and personal exchanges.",
            "Navigate dress code nuances from business formal to smart casual across capitals.",
        ],
        etiquette: [
            ["Punctuality",    "Northern Europe: arrive 5 minutes early; Southern Europe: up to 15 minutes socially acceptable."],
            ["Communication","North = direct and succinct; South = expressive with hand gestures and emotive tone."],
            ["Dining",        "Keep hands visible; finish all food; never rest elbows on the table."],
            ["Dress code",    "Formal, muted colors in boardrooms; stylish flair in Mediterranean social settings."],
            ["Toast etiquette","Maintain eye contact during toasts; wait until host signals you to drink."],
            ["Gift-giving",   "Avoid overly expensive items in business contexts; handwritten notes are valued."],
        ],
        resources: {
            video: "https://www.youtube.com/embed/SLp6LmwBpyQ",
            guide: "https://europa.eu/youreurope/citizens/travel/cultural-etiquette/index_en.htm",
        },
    },

    4: {
        ...modulesIndex[3],
        overview: `Traverse the rich tapestry of African cultural practices, from the Sahelian kingdoms'
    oral traditions to the modern tech hubs of Cape Town and Nairobi. This module explores how greetings,
    hospitality, and respect for elders form the backbone of community cohesion. You’ll study the symbolism
    behind colors in traditional dress and discover how dance and music are woven into social rituals.

    Real-life interviews with community leaders and multimedia documentaries offer an immersive experience
    that prepares you to engage respectfully at local ceremonies, business events, and informal gatherings.`,
        objectives: [
            "Perform traditional greetings: West African handshake, North African cheek kiss, Southern African nod." ,
            "Explain the social function of communal meals and feasts.",
            "Identify and avoid region-specific offensive gestures.",
            "Honor elders through seating and speaking protocols.",
            "Understand the significance of dress colors and patterns in different communities.",
        ],
        etiquette: [
            ["Greetings",      "Ask about family and health; use right hand or both hands for handshake; learn local variants."],
            ["Hospitality",    "Accept at least one offering of food/drink; refusing repeatedly is impolite."],
            ["Elders",         "Stand when elders enter; allow them to sit or eat first."],
            ["Dress & color",  "Bright fabrics welcome at celebrations; modest attire in rural or conservative areas."],
            ["Photography",    "Always request permission before taking photos of people or sacred sites."],
            ["Gift-giving",    "Small tokens like coffee, fruit, or local crafts are appreciated in home visits."],
        ],
        resources: {
            video: "https://www.youtube.com/embed/qUoNceJ4k80",
            guide: "https://theculturetrip.com/africa/articles/etiquette-rules-africa",
        },
    },

    5: {
        ...modulesIndex[4],
        overview: `Delve into the intricate etiquette of the Middle East, where millennia-old traditions
    coexist with bustling metropolises. Understand the role of religious observances—such as daily prayers and
    Ramadan—in shaping business hours, social invitations, and dining practices. You will explore the values
    of hospitality, discretion, and family that drive interpersonal dynamics.

    Through personal narratives and cultural analyses, you’ll be equipped to navigate gender interaction norms,
    appropriate attire, and conversational rituals in diverse Middle Eastern contexts.`,
        objectives: [
            "Demonstrate correct greeting exchanges including Salam alaikum and Wa-alaikum salaam.",
            "Navigate business negotiations during Ramadan and daily prayer times.",
            "Describe appropriate dress codes for men and women in conservative and liberal areas.",
            "Respect privacy norms: avoid personal questions about family or income.",
            "Differentiate cultural practices across Gulf, Levant, and North African regions.",
        ],
        etiquette: [
            ["Greetings",      "Offer right-hand handshake to same gender; await woman's initiation if cross-gender."],
            ["Hospitality",    "Accept at least one cup of tea or coffee; refill only when offered."],
            ["Dress",          "Men: long trousers and shirts; Women: cover shoulders, knees, and hair where required."],
            ["Gestures",       "Never point with index finger or show soles of shoes to others."],
            ["Conversation",   "Avoid discussing politics or religion unless invited by your host."],
            ["Dining",         "Eat with right hand; accept and return communal dishes respectfully."],
        ],
        resources: {
            video: "https://www.youtube.com/embed/Vk8N9_2hc7w",
            guide: "https://www.britannica.com/place/Middle-East/Cultural-etiquette",
        },
    },
};
