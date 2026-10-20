/* ==================================================================
   Virtual Artifact Hunt — content data
   Every artifact's text is drawn from the client-provided catalog
   (Idols.docx, Masks.docx, MASKS2.docx, QUIZ.pdf). Two corrections
   applied after cross-checking the source files against each other:

   - Po Nagar temple: Idols.docx says "8th-12th c. CE", QUIZ.pdf says
     "8th-13th c. CE" — used the quiz's wider (and more specific) range.
   - Jade Funeral Mask of King Pakal: Masks.docx's own table mislabels
     the find as "Guatemala"; QUIZ.pdf's own quiz question gives the
     correct country as Mexico (tomb of Pakal at Palenque, Chiapas).
     Used Mexico. This artifact also has NO description/use in any
     source file (every other entry has both) — see `gap: true` below,
     the short factual description was written to fill that hole, not
     sourced from the client's catalog like the rest.
   ================================================================== */

const REGIONS = [
  {
    key: 'asia',
    name: 'Asia',
    subtitle: 'Temple Courtyard Gallery',
    blurb: 'Sacred masks and a goddess statue from Vietnam, Japan, Bali and Tibet.',
  },
  {
    key: 'africa',
    name: 'Africa',
    subtitle: 'Savanna Gallery',
    blurb: 'Ceremonial masks and a royal stool from Southern, West and Central Africa.',
  },
  {
    key: 'europe',
    name: 'Europe',
    subtitle: 'Standing Stones Gallery',
    blurb: 'Horned gods and winter masks from Celtic Europe and Sardinia.',
  },
  {
    key: 'oceania',
    name: 'Oceania',
    subtitle: 'Lagoon Gallery',
    blurb: 'Ancestor masks and a carved figure from Australia, Papua and New Zealand.',
  },
  {
    key: 'namerica',
    name: 'North America',
    subtitle: 'Rainforest & Coast Gallery',
    blurb: 'Maya stonework and Pacific Northwest transformation masks.',
  },
];

const ARTIFACTS = [
  // ---------------------------------------------------------------- ASIA
  {
    id: 'cham-dance-mask', region: 'asia', icon: 'chamMask', photo: 'assets/artifacts/cham-dance-mask.jpg',
    name: 'Cham Dance Mask', culture: 'Cham people · Vietnam',
    desc: 'A traditional ritual mask used in sacred performances. It portrays deities, spirits, and legendary figures, preserving Cham cultural heritage.',
    use: 'Worn in temple dances, festivals, and religious ceremonies.',
    points: 100,
  },
  {
    id: 'noh-mask', region: 'asia', icon: 'nohMask', photo: 'assets/artifacts/noh-mask.jpg',
    name: 'Noh Mask', culture: 'Japanese',
    desc: 'A carved wooden mask used in classical Noh theatre. Each mask represents a specific character — gods, women, demons, spirits — conveying emotion through subtle expression. Did you know? By tilting the mask up or down, a performer changes how light falls across the carved face, so the same mask can look joyful or sorrowful.',
    use: 'Worn in Noh theatrical performances and religious ceremonies.',
    points: 100,
    quiz: {
      q: 'How do Noh masks convey emotion despite a fixed carved expression?',
      options: [
        'Through changes in the angle of the mask and how light falls on it',
        'Through written symbols painted on the forehead',
        'Through a hidden mechanical jaw the performer operates',
        'Through different colors of paint applied mid-performance',
      ],
      answer: 0,
    },
  },
  {
    id: 'barong-mask', region: 'asia', icon: 'barongMask', photo: 'assets/artifacts/barong-mask.jpg',
    name: 'Barong Mask', culture: 'Balinese · Indonesia',
    desc: 'Represents the king of spirits, symbolizing the triumph of good over evil in Balinese Hindu culture.',
    use: 'Featured in temple festivals, ritual dances, and religious ceremonies.',
    points: 100,
    quiz: {
      q: 'What does the Barong represent in Balinese Hindu tradition?',
      options: [
        'A trickster spirit with no fixed loyalty',
        'A protective and benevolent figure whose battle with the witch Rangda symbolizes good vs. evil',
        'A minor forest demon appeased with offerings',
        'A historical king deified after death',
      ],
      answer: 1,
    },
  },
  {
    id: 'mahakala-mask', region: 'asia', icon: 'mahakalaMask', photo: 'assets/artifacts/mahakala-mask.jpg',
    name: 'Mahakala Ritual Mask', culture: 'Tibetan',
    desc: 'Portrays a wrathful Buddhist protector deity, symbolizing the destruction of ignorance and the protection of Buddhist teachings.',
    use: 'Worn in Cham dances performed in monasteries and at religious festivals.',
    points: 100,
    quiz: {
      q: "What does the wrathful appearance of a Mahakala mask symbolize?",
      options: [
        'A call for literal violence against enemies of the monastery',
        'The destructive power directed against ignorance and obstacles',
        'A warning to keep outsiders away from sacred sites',
        'The deity’s bad temper toward unfaithful worshippers',
      ],
      answer: 1,
    },
  },
  {
    id: 'po-nagar-statue', region: 'asia', icon: 'poNagarStatue', photo: 'assets/artifacts/po-nagar-statue.jpg',
    name: 'Po Nagar Statue (Mukhalinga)', culture: 'Cham people · Vietnam',
    desc: 'A sacred image of the Cham Mother Goddess, dating to the 8th–12th centuries CE. It reflects Hindu influence on the Champa Kingdom, symbolizing fertility, prosperity, and protection. The Po Nagar temple complex itself was built in stages across roughly the 8th–13th centuries CE.',
    use: 'Worshipped in temples during religious ceremonies and annual festivals.',
    points: 120,
  },

  // -------------------------------------------------------------- AFRICA
  {
    id: 'nguni-mask', region: 'africa', icon: 'nguniMask', photo: 'assets/artifacts/nguni-mask.jpg',
    name: 'Nguni Ceremonial Mask', culture: 'Nguni · Southern Africa',
    desc: 'Represents ancestral spirits and tribal traditions, important to preserving cultural identity and spiritual beliefs.',
    use: 'Worn during initiation rites, rituals, and cultural festivals.',
    points: 100,
  },
  {
    id: 'gelede-mask', region: 'africa', icon: 'geledeMask', photo: 'assets/artifacts/gelede-mask.jpg',
    name: 'Gelede Mask', culture: 'Yoruba · Nigeria',
    desc: 'Honors women, mothers, and female spiritual power, celebrating harmony, fertility, and community well-being.',
    use: 'Worn at Gelede festivals, dances, and community ceremonies.',
    points: 100,
  },
  {
    id: 'kanaga-mask', region: 'africa', icon: 'kanagaMask', photo: 'assets/artifacts/kanaga-mask.jpg',
    name: 'Kanaga Mask', culture: 'Dogon · Mali',
    desc: 'Symbolizes the connection between heaven and earth and is associated with ancestral spirits. Its double-cross form is commonly interpreted as linking heaven and earth.',
    use: 'Worn during funeral ceremonies and ancestor rituals, including the Dogon "Dama" funerary ceremony.',
    points: 110,
    quiz: {
      q: 'What does the Kanaga mask’s distinctive double-cross superstructure represent?',
      options: [
        'A hunting trophy rack',
        'The connection between heaven and earth',
        'A clan boundary marker',
        'The four cardinal winds',
      ],
      answer: 1,
    },
  },
  {
    id: 'punu-mask', region: 'africa', icon: 'punuMask', photo: 'assets/artifacts/punu-mask.jpg',
    name: 'White Maiden (Punu) Mask', culture: 'Punu · Gabon',
    desc: 'Represents ideal beauty, purity, and ancestral female spirits. The white kaolin-clay paint symbolizes the spirit world.',
    use: 'Worn in initiation ceremonies and funeral dances.',
    points: 100,
  },
  {
    id: 'golden-stool', region: 'africa', icon: 'goldenStool', photo: 'assets/artifacts/golden-stool.jpg',
    name: 'Golden Stool (Sika Dwa Kofi)', culture: 'Asante · Ghana',
    desc: 'A sacred national object believed to hold the soul of the Ashanti nation. It originates in the 17th century and represents unity, authority, and cultural identity. Tradition holds it descended from the heavens to Osei Tutu I in the late 17th century — some accounts say 1701.',
    use: 'Central to coronations, royal ceremonies, and state rituals — it is never sat on, even by the king.',
    points: 130,
    quiz: {
      q: 'Which people does the Golden Stool (Sika Dwa Kofi) belong to?',
      options: [
        'The Yoruba of Nigeria',
        'The Zulu of Southern Africa',
        'The Asante of Ghana',
        'The Dogon of Mali',
      ],
      answer: 2,
    },
  },

  // -------------------------------------------------------------- EUROPE
  {
    id: 'celtic-horned-mask', region: 'europe', icon: 'celticHornedMask', photo: 'assets/artifacts/celtic-horned-mask.jpg',
    name: 'Celtic Horned Ritual Mask', culture: 'Celtic',
    desc: 'Worn during religious ceremonies to honor nature and spiritual beings, symbolizing fertility, transformation, and sacred tradition.',
    use: 'Worn at seasonal festivals and ritual performances.',
    points: 100,
  },
  {
    id: 'mamuthones-mask', region: 'europe', icon: 'mamuthonesMask', photo: 'assets/artifacts/mamuthones-mask.jpg',
    name: 'Mamuthones Mask', culture: 'Sardinian · Italy',
    desc: 'A heavy black wooden mask representing ancient pastoral traditions and protective spirits, still carved and worn in Mamoiada, Sardinia.',
    use: 'Worn during traditional winter festivals and processions, including the Feast of Sant’Antonio Abate and Sardinia’s Carnival season.',
    points: 110,
  },
  {
    id: 'cernunnos-figure', region: 'europe', icon: 'cernunnosFigure', photo: 'assets/artifacts/cernunnos-figure.jpg',
    name: 'Cernunnos (Horned God) Figure', culture: 'Celtic',
    desc: 'Depicts the Celtic horned god of nature and abundance, reflecting Iron Age Celtic beliefs in harmony with the natural world.',
    use: 'Used in religious ceremonies and seasonal festivals.',
    points: 100,
  },

  // ------------------------------------------------------------- OCEANIA
  {
    id: 'tiwi-pukumani-mask', region: 'oceania', icon: 'tiwiMask', photo: 'assets/artifacts/tiwi-mask.jpg',
    name: 'Tiwi Pukumani Mask', culture: 'Tiwi · Aboriginal Australia',
    desc: 'A ceremonial funerary mask representing ancestral spirits, reflecting Tiwi beliefs about death and the afterlife.',
    use: 'Used in funeral and memorial ceremonies.',
    points: 100,
  },
  {
    id: 'asmat-spirit-mask', region: 'oceania', icon: 'asmatMask', photo: 'assets/artifacts/asmat-mask.jpg',
    name: 'Ancestor Spirit Mask', culture: 'Asmat · Papua, Indonesia',
    desc: 'Represents ancestors and serves as a bridge between the living and the spirit world.',
    use: 'Used in ancestor festivals and rituals.',
    points: 100,
  },
  {
    id: 'tiki-figure', region: 'oceania', icon: 'tikiFigure', photo: 'assets/artifacts/tiki-figure.jpg',
    name: 'Tiki Figure', culture: 'Māori · New Zealand',
    desc: 'Represents revered ancestors, symbolizing protection, wisdom, fertility, and the continuity of ancestral tradition.',
    use: 'Worn, displayed, and used in traditional ceremonies.',
    points: 100,
  },

  // ------------------------------------------------------- NORTH AMERICA
  {
    id: 'pakal-jade-mask', region: 'namerica', icon: 'jadeMask',
    name: 'Jade Funeral Mask of King Pakal', culture: 'Maya · Mexico',
    desc: 'A jade mosaic funerary mask from the Classic Maya period, discovered inside K’inich Janaab’ Pakal’s tomb at Palenque, in Chiapas, Mexico.',
    use: 'Placed over the king’s face as part of his burial, meant to accompany and protect him into the afterlife.',
    points: 120,
    gap: true,
    note: 'Content note: the source catalog lists this artifact’s name but never wrote a description or use for it — every other entry in the catalog has both. The description above was written to fill that gap, not drawn from the client’s text. The catalog’s own table also mislabels the find as Guatemala; the quiz material in the same source correctly places it at Palenque, Chiapas, Mexico, which is what’s used here.',
    quiz: {
      q: 'In which present-day country was the Jade Funeral Mask of King Pakal discovered?',
      options: ['Guatemala', 'Mexico', 'Honduras', 'Belize'],
      answer: 1,
    },
  },
  {
    id: 'chaac-statue', region: 'namerica', icon: 'chaacStatue', photo: 'assets/artifacts/chaac-statue.jpg',
    name: 'Chaac Rain God Statue', culture: 'Maya · Guatemala',
    desc: 'Represents the Maya god of rain and agriculture, dating to the Classic Maya period, symbolizing fertility, rainfall, and the importance of farming.',
    use: 'Used in temple worship and agricultural rituals.',
    points: 110,
  },
  {
    id: 'transformation-mask', region: 'namerica', icon: 'transformMask',
    name: 'Transformation Mask', culture: 'Haida · Canada',
    desc: 'Opens mechanically to reveal another face inside, symbolizing transformation between human, animal, and spiritual worlds.',
    use: 'Used in potlatch ceremonies and storytelling — click it again to see it open.',
    points: 120,
    interactive: 'transform',
  },
  {
    id: 'hamatsa-mask', region: 'namerica', icon: 'hamatsaMask', photo: 'assets/artifacts/hamatsa-mask.jpg',
    name: 'Hamatsa Mask', culture: 'Kwakwaka’wakw · Canada',
    desc: 'Represents supernatural beings and initiates during sacred ceremonies, often depicting birds and mythical creatures.',
    use: 'Worn in winter ceremonial dances and initiation rituals.',
    points: 110,
    quiz: {
      q: 'During which season are Hamatsa ceremonies traditionally held?',
      options: ['Summer', 'Spring', 'Winter (the "tseyka" season)', 'Autumn harvest'],
      answer: 2,
    },
  },
];

/* ------------------------------------------------------------------
   Researched additions — NOT from the client catalog. Drafted from
   general knowledge and fact-checked against museum sources (British
   Museum, National Museum of Denmark, Met, Getty, EISP, NMA, etc.).
   Every one carries `draft: true` and shows a review note on its card
   until the client approves the wording. Cultural-sensitivity flags
   (Nataraja, Benin plaque, Moai) are listed in the README.
   ------------------------------------------------------------------ */
const DRAFT_NOTE = 'Draft entry: added from outside research, not from the client catalog. Pending client review.';

ARTIFACTS.push(
  {
    id: 'dong-son-drum', region: 'asia', icon: 'dongSonDrum', draft: true,
    name: 'Dong Son Bronze Drum', culture: 'Dong Son culture · Vietnam',
    desc: 'A large bronze drum cast by the Dong Son people of the Red River Valley in northern Vietnam, made from about 600 BCE into the first centuries CE. Its flat top is decorated with a central star, often read as the sun, ringed by birds, boats and people.',
    use: 'Played at ceremonies and festivals, used in rituals for rain and good harvests, and buried with important people as a sign of status.',
    points: 110,
    quiz: {
      q: 'What sits at the very center of a Dong Son drum’s decorated top?',
      options: ['A star, often read as the sun', 'A dragon', 'A map of the river', 'A portrait of a king'],
      answer: 0,
    },
  },
  {
    id: 'chola-nataraja', region: 'asia', icon: 'nataraja', draft: true,
    name: 'Chola Bronze Nataraja', culture: 'Tamil · Chola dynasty, India',
    desc: 'A bronze statue of the Hindu god Shiva as Nataraja, the Lord of Dance. The finest were cast in South India under the Chola dynasty (about the 10th–12th centuries CE) using the lost-wax method. Shiva dances inside a ring of fire, standing on a small figure who represents ignorance.',
    use: 'Worshipped in temples and carried through the streets in temple processions during festivals.',
    points: 120,
    quiz: {
      q: 'What does the small figure beneath Nataraja’s foot represent?',
      options: ['A defeated king', 'Ignorance', 'The earth', 'A temple servant'],
      answer: 1,
    },
  },
  {
    id: 'benin-plaque', region: 'africa', icon: 'beninPlaque', draft: true,
    name: 'Benin Bronze Plaque', culture: 'Edo people · Kingdom of Benin, Nigeria',
    desc: 'A cast brass plaque made by the royal guild of bronze casters in the Kingdom of Benin, mostly in the 16th–17th centuries. Hundreds of these plaques once covered the pillars of the royal palace in Benin City, recording rulers, court life and ceremonies. Many were looted by British forces in the 1897 attack on Benin City; some have since been returned.',
    use: 'Displayed in the Oba’s (king’s) palace as a visual record of the kingdom’s history.',
    points: 120,
    quiz: {
      q: 'Where were Benin bronze plaques originally displayed?',
      options: ['In a marketplace', 'On trading ships', 'On the pillars of the royal palace', 'In a library'],
      answer: 2,
    },
  },
  {
    id: 'kente-cloth', region: 'africa', icon: 'kenteCloth', draft: true,
    name: 'Kente Cloth', culture: 'Asante & Ewe peoples · Ghana',
    desc: 'A brightly coloured cloth woven in narrow strips, about a hand’s width each, which are then sewn together edge to edge. Each pattern and colour combination has its own name and meaning. Among the Asante, kente was long reserved for royalty; today it is a symbol of Ghanaian pride.',
    use: 'Worn at important occasions such as festivals, weddings, graduations and ceremonies.',
    points: 100,
    quiz: {
      q: 'How is kente cloth made?',
      options: ['Painted on one large sheet', 'Woven in narrow strips that are sewn together', 'Knitted from wool', 'Printed by stamping blocks'],
      answer: 1,
    },
  },
  {
    id: 'gundestrup-cauldron', region: 'europe', icon: 'gundestrupCauldron', draft: true,
    name: 'Gundestrup Cauldron', culture: 'Celtic imagery · found in Denmark',
    desc: 'A gilded silver bowl made around 2,000 years ago, probably by silversmiths in southeastern Europe, and decorated with images linked to Celtic religion. Peat cutters found it in a bog near Gundestrup, Denmark, in 1891, taken apart with its plates stacked inside. One panel shows an antlered figure holding a ring (torc) and a snake, often linked to the god Cernunnos.',
    use: 'Probably used in religious rituals, and later placed in the bog as an offering.',
    points: 120,
    quiz: {
      q: 'Where was the Gundestrup Cauldron found?',
      options: ['In a cave in France', 'In a peat bog in Denmark', 'In a river in Italy', 'Under a castle in Scotland'],
      answer: 1,
    },
  },
  {
    id: 'lewis-chessmen', region: 'europe', icon: 'lewisChessman', draft: true,
    name: 'Lewis Chessmen', culture: 'Norse · found in Scotland',
    desc: 'A hoard of chess pieces carved mostly from walrus ivory around 1150–1200, probably in Norway, and found on the Isle of Lewis in Scotland in 1831. The pieces have wonderfully expressive faces; some warrior pieces bite the tops of their shields.',
    use: 'Used to play chess and other board games.',
    points: 110,
    quiz: {
      q: 'What were most of the Lewis Chessmen carved from?',
      options: ['Marble', 'Bronze', 'Walrus ivory', 'Oak wood'],
      answer: 2,
    },
  },
  {
    id: 'moai-statue', region: 'oceania', icon: 'moai', draft: true,
    name: 'Moai Statue', culture: 'Rapa Nui people · Easter Island',
    desc: 'One of nearly 900 giant stone figures carved by the Rapa Nui people, roughly between 1250 and 1500 CE (estimates vary), mostly from volcanic rock at the Rano Raraku quarry. Each moai is believed to represent an important ancestor.',
    use: 'Set up on stone platforms called ahu, most of them facing inland to watch over and protect the community.',
    points: 120,
    quiz: {
      q: 'Which way do most moai face?',
      options: ['Out to sea', 'Inland, toward the community', 'Toward the volcano only', 'Straight up at the sky'],
      answer: 1,
    },
  },
  {
    id: 'boomerang', region: 'oceania', icon: 'boomerang', draft: true,
    name: 'Boomerang', culture: 'Aboriginal Australians',
    desc: 'A curved throwing stick made by many Aboriginal groups for thousands of years; the oldest found in Australia is about 10,000 years old. Most boomerangs were designed to fly straight and hit a target, not to come back. Returning boomerangs are a lighter, special type.',
    use: 'Used for hunting, fighting, digging and making fire, and tapped together as clapsticks to keep rhythm in music and ceremonies.',
    points: 100,
    quiz: {
      q: 'Did most traditional boomerangs come back when thrown?',
      options: ['Yes, every one of them', 'No, most were made to fly straight at a target', 'Only when thrown at night', 'Only the very heavy ones'],
      answer: 1,
    },
  },
  {
    id: 'sun-stone', region: 'namerica', icon: 'sunStone', draft: true,
    name: 'Aztec Sun Stone', culture: 'Mexica (Aztec) · Mexico',
    desc: 'A huge carved basalt disc, about 3.6 metres across and weighing around 24 tonnes, made by the Mexica in the early 1500s and rediscovered in Mexico City’s main square in 1790. Its central face is usually identified as the sun god Tonatiuh, ringed by the symbols of the 20 days of the Mexica calendar.',
    use: 'Probably a ceremonial or sacrificial monument expressing the Mexica view of time and the cosmos, rather than a working calendar.',
    points: 120,
    quiz: {
      q: 'How many day signs ring the Sun Stone?',
      options: ['7', '12', '20', '365'],
      answer: 2,
    },
  },
  {
    id: 'dine-blanket', region: 'namerica', icon: 'dineBlanket', draft: true,
    name: 'Diné (Navajo) Woven Blanket', culture: 'Diné (Navajo) · Southwestern United States',
    desc: 'A wool textile woven on an upright loom by Diné weavers, famous for bold stripes and geometric designs. In Diné tradition, the people learned weaving from Spider Woman. “Chief blankets” of the 1800s were prized and traded far across the region.',
    use: 'Worn as blankets and garments; from the 1880s onward, also woven as rugs for trade.',
    points: 110,
    quiz: {
      q: 'In Diné tradition, who taught the people to weave?',
      options: ['Coyote', 'The Sun', 'Spider Woman', 'A travelling trader'],
      answer: 2,
    },
  },
);
ARTIFACTS.forEach(a => { if (a.draft && !a.note) a.note = DRAFT_NOTE; });

const ARTIFACTS_BY_REGION = REGIONS.reduce((map, r) => {
  map[r.key] = ARTIFACTS.filter(a => a.region === r.key);
  return map;
}, {});
