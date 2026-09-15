'use strict';

/* ═══════════════════════════════════════════════════════════
   Books catalog
   File paths are relative to assets/books/
   Arabic filenames are used as-is — encodeURI handles them at runtime.
   ═══════════════════════════════════════════════════════════ */

/* ── Categories ── */
const BOOK_CATEGORIES = [
  { id: 'quran',     ar: 'القرآن وعلومه',         en: 'Quran & Its Sciences',           color: '#4caf89' },
  { id: 'hadith',    ar: 'الحديث الشريف وعلومه',   en: 'Hadith & Its Sciences',          color: '#4c7fc9' },
  { id: 'seerah',    ar: 'السيرة والتاريخ',        en: 'Seerah & History',               color: '#c9604c' },
  { id: 'aqeedah',   ar: 'العقيدة والتوحيد',       en: 'Creed & Theology',               color: '#8b4cc9' },
  { id: 'fiqh',      ar: 'الفقه وأصوله',           en: 'Fiqh & Its Principles',          color: '#c9a84c' },
  { id: 'adhkar',    ar: 'الرقائق والأذكار',       en: 'Spirituality & Adhkar',          color: '#f5a623' },
  { id: 'modern',    ar: 'دراسات وقضايا معاصرة',   en: 'Modern Studies & Issues',        color: '#4cc9c9' },
  { id: 'general',   ar: 'كتب عامة وأدب',          en: 'General Books & Literature',     color: '#9a9db5' },
];

/* ── Books ── */
const BOOKS = [

  /* ═══════════════════════════════════════════════════════════
     1. القرآن وعلومه — Quran & Its Sciences
     ═══════════════════════════════════════════════════════════ */

  {
    id: 'tadabbur-quran',
    file: '1. القرآن وعلومه - Quran & Its Sciences/31-faedah-fi-tdabbor-alquran-ara.pdf',
    titleAr: 'إحدى وثلاثون فائدة في تدبر القرآن',
    titleEn: '31 Benefits in Contemplating the Quran',
    author: 'عبد المحسن بن حمد العباد البدر',
    authorEn: 'Abd al-Muhsin al-Abbad',
    category: 'quran',
    descriptionAr: 'رسالة موجزة تجمع فوائد عملية في تدبر القرآن الكريم، وبيان كيف يتعامل المسلم مع كتاب الله تدبرًا وتأملًا.',
    descriptionEn: 'A concise treatise collecting practical benefits on contemplating the Quran, guiding the reader on how to engage with the Book of Allah.'
  },

  {
    id: 'jazariyyah',
    file: '1. القرآن وعلومه - Quran & Its Sciences/Noor-Book.com المقدمة الجزرية 3 .pdf',
    titleAr: 'متن المقدمة الجزرية في علم التجويد',
    titleEn: 'Al-Jazariyyah — Introduction to Tajweed',
    author: 'محمد بن محمد الجزري',
    authorEn: 'Ibn al-Jazari',
    category: 'quran',
    descriptionAr: 'منظومة مشهورة في علم التجويد، تُعدّ من أوائل ما يدرسه طالب التجويد، تجمع قواعد التلاوة بأسلوب شعري مختصر.',
    descriptionEn: 'A famous poem on the science of Tajweed, among the first texts studied by students of Quranic recitation, covering recitation rules in verse.'
  },

  {
    id: 'tafsir-sadi',
    file: '1. القرآن وعلومه - Quran & Its Sciences/تيسير الكريم الرحمن في تفسير كلام المنان = تفسير السعدي (ط. دار الحديث).pdf',
    titleAr: 'تيسير الكريم الرحمن في تفسير كلام المنان',
    titleEn: "Tafsir al-Sa'di",
    author: 'عبد الرحمن بن ناصر السعدي',
    authorEn: "Abd al-Rahman al-Sa'di",
    category: 'quran',
    descriptionAr: 'تفسير مختصر جامع لمعاني القرآن الكريم، يميزه السهولة والوضوح، مع التركيز على الفوائد العملية والهدايات.',
    descriptionEn: "A concise yet comprehensive tafsir of the Quran, notable for its clarity and focus on practical guidance and lessons."
  },

  /* ═══════════════════════════════════════════════════════════
     2. الحديث الشريف وعلومه — Hadith & Its Sciences
     ═══════════════════════════════════════════════════════════ */

  {
    id: 'umdat-al-ahkam',
    file: '2. الحديث الشريف وعلومه - Hadith & Its Sciences/Noor-Book.com عمدة الأحكام من كلام خير الأنام.pdf',
    titleAr: 'عمدة الأحكام من كلام خير الأنام',
    titleEn: 'Umdat al-Ahkam',
    author: 'عبد الغني المقدسي',
    authorEn: 'Abd al-Ghani al-Maqdisi',
    category: 'hadith',
    descriptionAr: 'مجموعة من الأحاديث المتفق عليها بين البخاري ومسلم في الأحكام الشرعية، مرتبة على أبواب الفقه.',
    descriptionEn: 'A collection of hadiths agreed upon by Bukhari and Muslim on legal rulings, arranged by fiqh chapters.'
  },

  {
    id: 'taysir-mustalah',
    file: '2. الحديث الشريف وعلومه - Hadith & Its Sciences/تيسير مصطلح الحديث مكتبة الحرمين.pdf',
    titleAr: 'تيسير مصطلح الحديث',
    titleEn: 'Simplification of Hadith Terminology',
    author: 'محمود الطحان',
    authorEn: 'Mahmoud al-Tahhan',
    category: 'hadith',
    descriptionAr: 'كتاب ميسر في علم مصطلح الحديث، يشرح أنواع الحديث وشروطه وأحكامه بأسلوب واضح مناسب للمبتدئين.',
    descriptionEn: 'An accessible work on hadith terminology, explaining types and conditions of hadiths clearly for beginners.'
  },

  {
    id: 'riyad-salihin',
    file: '2. الحديث الشريف وعلومه - Hadith & Its Sciences/رياض الصالحين من كلام رسول الله سيد العارفين- النووي - ط دار المنهاج.pdf',
    titleAr: 'رياض الصالحين من كلام سيد المرسلين',
    titleEn: 'Riyad al-Salihin (Gardens of the Righteous)',
    author: 'الإمام يحيى بن شرف النووي',
    authorEn: 'Imam Yahya ibn Sharaf al-Nawawi',
    category: 'hadith',
    descriptionAr: 'من أشهر كتب الحديث الجامعة، جمع فيه الإمام النووي أحاديث الأخلاق والآداب والعبادات مرتبة على الأبواب.',
    descriptionEn: 'One of the most beloved hadith compilations, gathering authentic narrations on ethics, etiquette, and worship, organised by topic.'
  },

  {
    id: 'sharh-arbaeen-nawawi',
    file: '2. الحديث الشريف وعلومه - Hadith & Its Sciences/sharh_arbaeen_nawawi.pdf',
    titleAr: 'شرح الأربعين النووية',
    titleEn: 'Explanation of the Forty Hadiths of al-Nawawi',
    author: 'محمد بن صالح العثيمين',
    authorEn: 'Shaykh Muhammad ibn Salih al-Uthaymeen',
    category: 'hadith',
    descriptionAr: 'شرح معاصر للأحاديث الأربعين التي جمعها الإمام النووي، بأسلوب سهل مع الاستنباطات الفقهية والتربوية.',
    descriptionEn: "A contemporary commentary on al-Nawawi's Forty Hadiths, with accessible explanations and jurisprudential insights."
  },

  /* ═══════════════════════════════════════════════════════════
     3. السيرة النبوية والتاريخ — Seerah & History
     ═══════════════════════════════════════════════════════════ */

  {
    id: 'raheeq-makhtum',
    file: '3. السيرة النبوية والتاريخ - Prophet\'s Biography & History/Noor-Book.com الرحيق المختوم 2 .pdf',
    titleAr: 'الرحيق المختوم',
    titleEn: 'The Sealed Nectar',
    author: 'صفي الرحمن المباركفوري',
    authorEn: 'Safi al-Rahman al-Mubarakpuri',
    category: 'seerah',
    descriptionAr: 'من أفضل كتب السيرة النبوية المعاصرة، حاز على جائزة رابطة العالم الإسلامي، يعرض حياة النبي ﷺ بأسلوب علمي مرتب.',
    descriptionEn: 'One of the finest contemporary works on the Prophet\'s biography, awarded by the Muslim World League, presenting the Seerah in scholarly detail.'
  },

  {
    id: 'urjuzah-miyah',
    file: '3. السيرة النبوية والتاريخ - Prophet\'s Biography & History/متن الأرجوزة الميئية في ذكر حال أشرف البرية الشيخ علي بن أبي العز الحنفي.pdf',
    titleAr: 'الأرجوزة الميئية في ذكر حال أشرف البرية',
    titleEn: 'The Hundred-Line Poem on the Prophet\'s Life',
    author: 'علي بن أبي العز الحنفي',
    authorEn: 'Ali ibn Abi al-Izz al-Hanafi',
    category: 'seerah',
    descriptionAr: 'منظومة شعرية مختصرة في سيرة النبي ﷺ، تجمع الأحداث الرئيسية في مائة بيت.',
    descriptionEn: 'A concise hundred-line poem summarising the life of the Prophet ﷺ through its main events.'
  },

  /* ═══════════════════════════════════════════════════════════
     4. العقيدة والتوحيد — Creed & Theology
     ═══════════════════════════════════════════════════════════ */

  {
    id: 'ashariyyah',
    file: '4. العقيدة والتوحيد - Islamic Creed & Theology/ashareeah-fi-alislam_arb.pdf',
    titleAr: 'الأشعرية في الإسلام',
    titleEn: 'Ash\'arism in Islam',
    author: 'المؤلف (نص عربي)',
    authorEn: 'Unknown / Academic Text',
    category: 'aqeedah',
    descriptionAr: 'دراسة علمية عن المذهب الأشعري في العقيدة، نشأته وأصوله وأبرز أعلامه.',
    descriptionEn: 'A scholarly study of the Ash\'ari school of theology — its origins, principles, and prominent figures.'
  },

  {
    id: 'qawaid-arba',
    file: '4. العقيدة والتوحيد - Islamic Creed & Theology/Noor-Book.com القواعد الأربع 2 .pdf',
    titleAr: 'القواعد الأربع',
    titleEn: 'The Four Foundational Principles',
    author: 'محمد بن عبد الوهاب',
    authorEn: 'Muhammad ibn Abd al-Wahhab',
    category: 'aqeedah',
    descriptionAr: 'رسالة موجزة في أربع قواعد أساسية في التوحيد، تُعدّ من أوائل المتون التي يدرسها طالب العلم.',
    descriptionEn: 'A brief treatise on four foundational principles of Tawhid, commonly among the first texts studied by seekers of knowledge.'
  },

  {
    id: 'sharh-usul-thalatha',
    file: '4. العقيدة والتوحيد - Islamic Creed & Theology/Noor-Book.com شرح الأصول الثلاثة للشيخ محمد بن عبد الوهاب شرح الشيخ محمد العثيمين ملون 2 .pdf',
    titleAr: 'شرح الأصول الثلاثة',
    titleEn: 'Explanation of the Three Fundamental Principles',
    author: 'محمد بن صالح العثيمين',
    authorEn: 'Shaykh Muhammad ibn Salih al-Uthaymeen',
    category: 'aqeedah',
    descriptionAr: 'شرح مبسط لمتن الأصول الثلاثة، يبين معرفة العبد ربه ودينه ونبيه بأسلوب واضح مدعوم بالأدلة.',
    descriptionEn: "An accessible commentary on the Three Fundamental Principles — knowing one's Lord, religion, and prophet."
  },

  {
    id: 'lannaka-allah',
    file: '4. العقيدة والتوحيد - Islamic Creed & Theology/Noor-Book.com لانك الله 1.pdf',
    titleAr: 'لأنك الله',
    titleEn: 'Because You Are Allah',
    author: 'مؤلف معاصر',
    authorEn: 'Contemporary Author',
    category: 'aqeedah',
    descriptionAr: 'كتاب معاصر يتناول قرب الله من عباده ومعاني أسمائه وصفاته بأسلوب وجداني مؤثر.',
    descriptionEn: "A contemporary book exploring Allah's nearness to His servants and the meanings of His names in an affecting style."
  },

  {
    id: 'sharh-asma-husna',
    file: '4. العقيدة والتوحيد - Islamic Creed & Theology/شرح أسماء الله الحسنى (لـ سعيد بن علي بن وهف القحطاني أو عبد الرزاق البدر).pdf',
    titleAr: 'شرح أسماء الله الحسنى',
    titleEn: 'Explanation of the Beautiful Names of Allah',
    author: 'سعيد بن علي بن وهف القحطاني',
    authorEn: 'Sa\'id ibn Ali al-Qahtani',
    category: 'aqeedah',
    descriptionAr: 'شرح تفصيلي لأسماء الله الحسنى التسعة والتسعين، مع بيان معانيها وآثارها الإيمانية.',
    descriptionEn: "A detailed explanation of Allah's 99 names, with their meanings and spiritual impacts."
  },

  {
    id: 'sharh-wasitiyyah',
    file: '4. العقيدة والتوحيد - Islamic Creed & Theology/شرح العقيدة الواسطية - ابن عثيمين.pdf',
    titleAr: 'شرح العقيدة الواسطية',
    titleEn: 'Explanation of al-Aqidah al-Wasitiyyah',
    author: 'محمد بن صالح العثيمين',
    authorEn: 'Shaykh Muhammad ibn Salih al-Uthaymeen',
    category: 'aqeedah',
    descriptionAr: 'شرح لرسالة العقيدة الواسطية لابن تيمية، يتناول أصول الإيمان وصفات الله بأسلوب علمي مبسط.',
    descriptionEn: "A commentary on Ibn Taymiyyah's Wasitiyyah creed, covering the fundamentals of faith and Allah's attributes."
  },

  {
    id: 'tawhid-haqq-allah',
    file: '4. العقيدة والتوحيد - Islamic Creed & Theology/لتوحيد الذي هو حق الله على العبيد مؤلف الكتاب محمد بن عبد الوهاب.pdf',
    titleAr: 'التوحيد الذي هو حق الله على العبيد',
    titleEn: 'Tawhid — The Right of Allah upon His Servants',
    author: 'محمد بن عبد الوهاب',
    authorEn: 'Muhammad ibn Abd al-Wahhab',
    category: 'aqeedah',
    descriptionAr: 'كتاب التوحيد الذي هو حق الله على العبيد، يجمع الآيات والأحاديث في بيان التوحيد وأنواعه ونواقضه.',
    descriptionEn: 'A foundational book gathering verses and hadiths on Tawhid, its categories, and what nullifies it.'
  },

  {
    id: 'aqeedah-series',
    file: '4. العقيدة والتوحيد - Islamic Creed & Theology/سلسلة_العقيدة_في_ضوء_الكتاب_والسنة.pdf',
    titleAr: 'سلسلة العقيدة في ضوء الكتاب والسنة',
    titleEn: 'Creed Series in Light of the Book and Sunnah',
    author: 'عمر بن سليمان الأشقر',
    authorEn: 'Umar ibn Sulayman al-Ashqar',
    category: 'aqeedah',
    descriptionAr: 'سلسلة علمية شاملة في العقيدة الإسلامية، تعرض أصول الإيمان بالأدلة من الكتاب والسنة.',
    descriptionEn: 'A comprehensive scholarly series on Islamic creed, presenting the fundamentals of faith with evidence from Quran and Sunnah.'
  },

  {
    id: 'jinn-shayateen',
    file: '4. العقيدة والتوحيد - Islamic Creed & Theology/Noor-Book.com سلسلة العقيدة في ضوء الكتاب والسنة 3 عالم الجن والشياطين.pdf',
    titleAr: 'عالم الجن والشياطين',
    titleEn: 'The World of Jinn and Devils',
    author: 'عمر بن سليمان الأشقر',
    authorEn: 'Umar ibn Sulayman al-Ashqar',
    category: 'aqeedah',
    descriptionAr: 'الجزء الثالث من سلسلة العقيدة، يتناول عالم الجن والشياطين في ضوء الكتاب والسنة.',
    descriptionEn: 'The third volume of the Creed Series, covering the world of jinn and devils in light of Quran and Sunnah.'
  },

  /* ═══════════════════════════════════════════════════════════
     5. الفقه وأصوله — Fiqh & Its Principles
     ═══════════════════════════════════════════════════════════ */

  {
    id: 'sifat-salat-nabi',
    file: '5. الفقه وأصوله - Islamic Jurisprudence (Fiqh)/Noor-Book.com صفة صلاة النبي من التكبير إلى التسليم كأنك تراها.pdf',
    titleAr: 'صفة صلاة النبي ﷺ من التكبير إلى التسليم كأنك تراها',
    titleEn: "The Prophet's Prayer Described",
    author: 'محمد ناصر الدين الألباني',
    authorEn: 'Shaykh Muhammad Nasir al-Din al-Albani',
    category: 'fiqh',
    descriptionAr: 'كتاب مفصّل يصف صلاة النبي ﷺ من التكبير إلى التسليم بالدليل، يعتمد على الأحاديث الصحيحة.',
    descriptionEn: "A detailed description of the Prophet's ﷺ prayer from takbir to tasleem, based on authentic hadiths."
  },

  {
    id: 'fiqh-ibadat-uthaymeen',
    file: '5. الفقه وأصوله - Islamic Jurisprudence (Fiqh)/Noor-Book.com فقه العبادات لابن عثيمين رحمه الله فتاوى مفهرسة 3 .pdf',
    titleAr: 'فقه العبادات',
    titleEn: 'Fiqh of Worship',
    author: 'محمد بن صالح العثيمين',
    authorEn: 'Shaykh Muhammad ibn Salih al-Uthaymeen',
    category: 'fiqh',
    descriptionAr: 'مجموعة من فتاوى الشيخ ابن عثيمين في فقه العبادات، مفهرسة وسهلة البحث، تغطي الطهارة والصلاة والزكاة والصيام والحج.',
    descriptionEn: 'A collection of fatwas by Shaykh Ibn Uthaymeen on the fiqh of worship — purification, prayer, zakat, fasting, and Hajj — indexed for easy reference.'
  },

  {
    id: 'mulakhkhas-fiqhi-1',
    file: '5. الفقه وأصوله - Islamic Jurisprudence (Fiqh)/الملخص الفقهي١ - صالح الفوزان.pdf',
    titleAr: 'الملخص الفقهي (الجزء الأول)',
    titleEn: 'The Fiqh Summary (Volume 1)',
    author: 'صالح بن فوزان الفوزان',
    authorEn: 'Shaykh Salih al-Fawzan',
    category: 'fiqh',
    descriptionAr: 'ملخص فقهي شامل يغطي أحكام العبادات والمعاملات، مبسط لطالب العلم المبتدئ.',
    descriptionEn: 'A comprehensive fiqh summary covering worship and transactions, simplified for the beginning student of knowledge.'
  },

  {
    id: 'mulakhkhas-fiqhi-2',
    file: '5. الفقه وأصوله - Islamic Jurisprudence (Fiqh)/الملخص الفقهي٢ - صالح الفوزان.pdf',
    titleAr: 'الملخص الفقهي (الجزء الثاني)',
    titleEn: 'The Fiqh Summary (Volume 2)',
    author: 'صالح بن فوزان الفوزان',
    authorEn: 'Shaykh Salih al-Fawzan',
    category: 'fiqh',
    descriptionAr: 'الجزء الثاني من الملخص الفقهي، يكمل أبواب المعاملات والمواريث والجنايات.',
    descriptionEn: 'The second volume of the Fiqh Summary, completing chapters on transactions, inheritance, and penal law.'
  },

  {
    id: 'manhaj-salikin',
    file: '5. الفقه وأصوله - Islamic Jurisprudence (Fiqh)/منهج السالكين وتوضيح الفقه في الدين.pdf',
    titleAr: 'منهج السالكين وتوضيح الفقه في الدين',
    titleEn: 'The Path of the Wayfarer — Fiqh Clarified',
    author: 'عبد الرحمن بن ناصر السعدي',
    authorEn: "Abd al-Rahman al-Sa'di",
    category: 'fiqh',
    descriptionAr: 'كتاب فقهي جامع بأسلوب السعدي المميز، يجمع بين الدليل والتعليل والترجيح.',
    descriptionEn: "A comprehensive fiqh work in al-Sa'di's distinctive style, combining evidence, reasoning, and juristic preference."
  },

  /* ═══════════════════════════════════════════════════════════
     6. الرقائق، الأذكار والتزكية — Spirituality & Adhkar
     ═══════════════════════════════════════════════════════════ */

  {
    id: 'wasaaya-waba',
    file: '6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/10 وصايا للوقاية من الوباء.pdf',
    titleAr: 'عشر وصايا للوقاية من الوباء',
    titleEn: 'Ten Precepts for Protection from Epidemics',
    author: 'مؤلف معاصر',
    authorEn: 'Contemporary Author',
    category: 'adhkar',
    descriptionAr: 'رسالة موجزة تجمع عشر وصايا شرعية وعملية للوقاية من الأوبئة والأمراض.',
    descriptionEn: 'A concise treatise gathering ten Shariah-based and practical guidelines for protection from epidemics and illness.'
  },

  {
    id: 'dawa-dawa',
    file: '6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/ابن القيم الجوزية - الجواب الكافي لمن سأل عن الدواء الشافي – الداء والدواء.pdf',
    titleAr: 'الجواب الكافي لمن سأل عن الدواء الشافي (الداء والدواء)',
    titleEn: 'The Sufficient Answer — The Disease and the Cure',
    author: 'ابن قيم الجوزية',
    authorEn: 'Ibn Qayyim al-Jawziyyah',
    category: 'adhkar',
    descriptionAr: 'كتاب عظيم في تزكية النفس وعلاج أمراض القلوب، يعالج أدواء القلب وسبل شفائها.',
    descriptionEn: 'A profound work on the purification of the soul and the diseases of the heart, offering diagnoses and cures.'
  },

  {
    id: 'mukhtasar-minhaj-qasidin',
    file: '6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/ابن قدامة المقدسي - مختصر منهاج القاصدين (ت - الأرناؤوط).pdf',
    titleAr: 'مختصر منهاج القاصدين',
    titleEn: 'The Abridged Minhaj al-Qasidin',
    author: 'ابن قدامة المقدسي',
    authorEn: 'Ibn Qudamah al-Maqdisi',
    category: 'adhkar',
    descriptionAr: 'اختصار لكتاب منهاج القاصدين، يعالج مراتب النفس وأخلاقها وأعمالها، على منهج أهل السنة.',
    descriptionEn: "An abridgement of Minhaj al-Qasidin, addressing the soul's stages, morals, and deeds according to Ahl al-Sunnah."
  },

  {
    id: 'adhkar-nawawi',
    file: '6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/الأذكار للنووي.pdf',
    titleAr: 'الأذكار للإمام النووي',
    titleEn: 'Al-Adhkar by al-Nawawi',
    author: 'الإمام يحيى بن شرف النووي',
    authorEn: 'Imam Yahya ibn Sharaf al-Nawawi',
    category: 'adhkar',
    descriptionAr: 'من أشهر كتب الأذكار، جمع فيه النووي الأذكار النبوية مرتبة على المواضع والأحوال.',
    descriptionEn: 'One of the most beloved books of adhkar, collecting prophetic remembrances arranged by occasion and state.'
  },

  {
    id: 'hizb-aadham',
    file: '6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/hizb_aadham.pdf',
    titleAr: 'الحزب الأعظم والورد الأفخم',
    titleEn: 'The Grandest Litany and Most Exalted Invocation',
    author: 'الملا علي القاري',
    authorEn: 'Mulla Ali al-Qari',
    category: 'adhkar',
    descriptionAr: 'مجموعة من الأذكار والدعوات النبوية، جمعها الملا علي القاري في كتاب واحد للاستعمال اليومي.',
    descriptionEn: 'A collection of prophetic adhkar and supplications compiled by Mulla Ali al-Qari for daily use.'
  },

  {
    id: 'kalim-tayyib',
    file: '6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/الكلم الطيب.pdf',
    titleAr: 'الكلم الطيب',
    titleEn: 'The Good Words',
    author: 'ابن تيمية',
    authorEn: 'Ibn Taymiyyah',
    category: 'adhkar',
    descriptionAr: 'رسالة لابن تيمية في فضل الذكر والدعاء، تبيّن أنواع الأذكار وأوقاتها وآثارها.',
    descriptionEn: 'A treatise by Ibn Taymiyyah on the virtue of dhikr and supplication, explaining types, times, and impacts.'
  },

  {
    id: 'waabil-sayyib',
    file: '6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/الوابل الصيب ورافع الكلم الطيب - محمد بن أبي بكر بن أيوب ابن قيم الجوزية.pdf',
    titleAr: 'الوابل الصيب ورافع الكلم الطيب',
    titleEn: 'The Beneficial Rain',
    author: 'ابن قيم الجوزية',
    authorEn: 'Ibn Qayyim al-Jawziyyah',
    category: 'adhkar',
    descriptionAr: 'كتاب عظيم في فضل الذكر، يبين أنواعه وأثره في حياة القلب وسلامة النفس.',
    descriptionEn: "A profound work on the virtue of dhikr, explaining its types and its effect on the heart's life and the soul's peace."
  },

  {
    id: 'hisn-muslim',
    file: '6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/حصن المسلم.pdf',
    titleAr: 'حصن المسلم من أذكار الكتاب والسنة',
    titleEn: 'Fortress of the Muslim',
    author: 'سعيد بن علي بن وهف القحطاني',
    authorEn: "Sa'id ibn Ali al-Qahtani",
    category: 'adhkar',
    descriptionAr: 'كتاب جامع لأذكار الرسول ﷺ مرتبة على المواضع، من أشهر كتب الأذكار وأكثرها انتشارًا.',
    descriptionEn: "A comprehensive collection of the Prophet's ﷺ remembrances, arranged by situation — one of the most widely used adhkar books."
  },

  {
    id: 'madarij-salikin',
    file: '6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/مدارج السالكين بين منازل اياك نعبد واياك نستعين - ابن القيم الجوزية.pdf',
    titleAr: 'مدارج السالكين بين منازل إياك نعبد وإياك نستعين',
    titleEn: 'Ranks of the Seekers',
    author: 'ابن قيم الجوزية',
    authorEn: 'Ibn Qayyim al-Jawziyyah',
    category: 'adhkar',
    descriptionAr: 'من أعظم كتب تزكية النفس، يشرح منازل السائرين إلى الله في ضوء سورة الفاتحة.',
    descriptionEn: "Among the greatest works on purification of the soul, explaining the stages of the seeker's journey to Allah through Surah al-Fatihah."
  },

  /* ═══════════════════════════════════════════════════════════
     7. دراسات وقضايا معاصرة — Modern Studies & Issues
     ═══════════════════════════════════════════════════════════ */

  {
    id: 'fiqh-aqalliyyat',
    file: '7. دراسات وقضايا معاصرة - Modern Studies & Issues/095 pdf كتاب يوسف القرضاوي في فقه الأقليات المسلمة.pdf',
    titleAr: 'فقه الأقليات المسلمة',
    titleEn: 'Fiqh of Muslim Minorities',
    author: 'يوسف القرضاوي',
    authorEn: 'Yusuf al-Qaradawi',
    category: 'modern',
    descriptionAr: 'دراسة معاصرة في فقه الأقليات المسلمة، تعالج أحكامًا خاصة بالمسلمين في المجتمعات غير الإسلامية.',
    descriptionEn: 'A contemporary study on the fiqh of Muslim minorities, addressing rulings specific to Muslims in non-Muslim societies.'
  },

  {
    id: 'ibda-mudarr',
    file: '7. دراسات وقضايا معاصرة - Modern Studies & Issues/الإبداع في مضار الابتداع -علي محفوظ .pdf',
    titleAr: 'الإبداع في مضار الابتداع',
    titleEn: 'The Innovation in the Harms of Innovation',
    author: 'علي محفوظ',
    authorEn: 'Ali Mahfuz',
    category: 'modern',
    descriptionAr: 'كتاب كلاسيكي يناقش البدع في الدين وأضرارها، وبيان موقف الشرع منها.',
    descriptionEn: 'A classical work discussing religious innovations, their harms, and the Shariah position on them.'
  },

  {
    id: 'din-sahih',
    file: '7. دراسات وقضايا معاصرة - Modern Studies & Issues/الدين الصحيح يحل جميع المشاكل.pdf',
    titleAr: 'الدين الصحيح يحل جميع المشاكل',
    titleEn: 'The True Religion Solves All Problems',
    author: 'محمد بن جميل زينو',
    authorEn: 'Muhammad Jamil Zino',
    category: 'modern',
    descriptionAr: 'رسالة تبين أن الإسلام بمبادئه وتشريعاته يحل جميع مشاكل الحياة.',
    descriptionEn: 'A treatise demonstrating that Islam, with its principles and laws, solves all problems of life.'
  },

  /* ═══════════════════════════════════════════════════════════
     8. كتب عامة وأدب — General Books & Literature
     ═══════════════════════════════════════════════════════════ */

  {
    id: 'rilke-letters',
    file: '8. كتب عامة وأدب - General Books & Literature/Rilke_Rainer_Maria_Lettres_a_un_jeune_poete.pdf',
    titleAr: 'رسائل إلى شاعر شاب',
    titleEn: 'Letters to a Young Poet',
    author: 'راينر ماريا ريلكه',
    authorEn: 'Rainer Maria Rilke',
    category: 'general',
    descriptionAr: 'مجموعة رسائل للشاعر الألماني ريلكه إلى شاعر شاب، تتناول الحياة والفن والإبداع.',
    descriptionEn: "A collection of letters by the German poet Rilke to a young poet, exploring life, art, and creativity."
  },

  {
    id: 'art-of-war',
    file: '8. كتب عامة وأدب - General Books & Literature/The Art of War (Sun Tzu ).pdf',
    titleAr: 'فن الحرب',
    titleEn: 'The Art of War',
    author: 'صن تزو',
    authorEn: 'Sun Tzu',
    category: 'general',
    descriptionAr: 'أطروحة عسكرية صينية قديمة، تُعدّ من أقدم وأشهر الكتب في الاستراتيجية والحكم.',
    descriptionEn: 'An ancient Chinese military treatise, one of the oldest and most famous works on strategy and leadership.'
  },

  {
    id: 'mencius',
    file: '8. كتب عامة وأدب - General Books & Literature/The Works of Mencius (1960).pdf',
    titleAr: 'أعمال مينسيوس',
    titleEn: 'The Works of Mencius',
    author: 'مينسيوس',
    authorEn: 'Mencius',
    category: 'general',
    descriptionAr: 'مجموعة محاورات الفيلسوف الصيني مينسيوس، من أهم نصوص الفلسفة الكونفوشيوسية.',
    descriptionEn: 'Collected dialogues of the Chinese philosopher Mencius, a central text of Confucian philosophy.'
  },

  /* ─────────────────────────────────────────────────────────────
     TO ADD A NEW BOOK:
     1. Copy the PDF into the right assets/books/ folder
     2. Copy the template below, paste it before the closing ];
     3. Fill in the fields

     {
       id: 'unique-slug',
       file: 'Category folder/filename.pdf',
       titleAr: '',
       titleEn: '',
       author: '',
       authorEn: '',
       category: 'quran|hadith|seerah|aqeedah|fiqh|adhkar|modern|general',
       descriptionAr: '',
       descriptionEn: ''
     },
     ───────────────────────────────────────────────────────────── */

];