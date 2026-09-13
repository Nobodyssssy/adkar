'use strict';

/* ═══════════════════════════════════════════════════════════
   Daily quotes — Quran verses + authentic hadiths
   • Time-tagged: morning / midday / evening / night / any
   • Rotates every 6h (00, 06, 12, 18)
   • Same quote for everyone in the same slot
   • Arabic text verbatim + Arabic tafsir + English tafsir
   • 100% offline — no network needed
   ═══════════════════════════════════════════════════════════ */

const QUOTES = [
  /* ═══════════════════════ QURAN ═══════════════════════ */

  /* ── Morning ── */
  { type:'quran', time:'morning',
    ar:'وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ',
    ref:'النجم ٥٣:٣٩',
    tafsirAr:'لا ينال الإنسان من الأجر إلا ما كسبه بسعيه، فالعمل الجاد هو طريق النجاح، لا الأماني.',
    tafsirEn:'Man earns only what he strives for — effort, not wishes, determines reward.',
    link:'https://quran.com/53/39' },

  { type:'quran', time:'morning',
    ar:'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    ref:'طه ٢٠:١١٤',
    tafsirAr:'دعاء جامع لطلب الزيادة في العلم النافع، وهو مفتاح كل خير.',
    tafsirEn:'A concise supplication to increase in beneficial knowledge — the key to all good.',
    link:'https://quran.com/20/114' },

  { type:'quran', time:'morning',
    ar:'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ',
    ref:'البقرة ٢:٤٥',
    tafsirAr:'الصبر والصلاة عونان على مشاق الدنيا، وهي ثقيلة إلا على الخاشعين المطمئنين بذكر الله.',
    tafsirEn:'Patience and prayer are the two helpers through life’s hardships — heavy only for those who lack humility before Allah.',
    link:'https://quran.com/2/45' },

  { type:'quran', time:'morning',
    ar:'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    ref:'الطلاق ٦٥:٣',
    tafsirAr:'من اعتمد على الله بقلبه كفاه ما أهمه، وأغناه عن غيره.',
    tafsirEn:'Whoever places his trust in Allah, He will be sufficient for him.',
    link:'https://quran.com/65/3' },

  { type:'quran', time:'morning',
    ar:'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ',
    ref:'الرعد ١٣:١١',
    tafsirAr:'التغيير يبدأ من النفس، فمن أراد العزّ والفلاح فعليه أن يعمل على إصلاح قلبه وعمله.',
    tafsirEn:'Change begins with oneself — Allah only changes a people’s condition when they change their own hearts.',
    link:'https://quran.com/13/11' },

  { type:'quran', time:'morning',
    ar:'وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ',
    ref:'هود ١١:١١٥',
    tafsirAr:'الصبر عبادة مأمور بها، والله لا يضيع أجر من أحسن عملاً.',
    tafsirEn:'Patience is a command, and Allah never wastes the reward of those who do good.',
    link:'https://quran.com/11/115' },

  /* ── Midday ── */
  { type:'quran', time:'midday',
    ar:'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    ref:'الرعد ١٣:٢٨',
    tafsirAr:'الطمأنينة الحقيقية في ذكر الله، لا في الدنيا ومتاعها.',
    tafsirEn:'True peace of heart lies in the remembrance of Allah, not in worldly gains.',
    link:'https://quran.com/13/28' },

  { type:'quran', time:'midday',
    ar:'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    ref:'الشرح ٩٤:٦',
    tafsirAr:'وعد إلهي بأن اليسر يرافق العسر، فلا ييأس المؤمن من رحمة الله.',
    tafsirEn:'A divine promise: ease accompanies hardship. The believer never despairs of Allah’s mercy.',
    link:'https://quran.com/94/6' },

  { type:'quran', time:'midday',
    ar:'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    ref:'البقرة ٢:٢٨٦',
    tafsirAr:'التكليف الإلهي رحمة، فما فرض الله على العبد إلا ما يطيقه.',
    tafsirEn:'Allah does not burden a soul beyond its capacity — His commands are always within reach.',
    link:'https://quran.com/2/286' },

  { type:'quran', time:'midday',
    ar:'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ',
    ref:'البقرة ٢:٢١٦',
    tafsirAr:'ما تراه النفس مكروهًا قد يكون خيرًا في طيّاته، فعلى المؤمن أن يرضى بحكم الله.',
    tafsirEn:'What you dislike may hold good for you — the believer submits to Allah’s wisdom.',
    link:'https://quran.com/2/216' },

  { type:'quran', time:'midday',
    ar:'وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا',
    ref:'الأحزاب ٣٣:٣',
    tafsirAr:'التوكل على الله عبادة، والله كافٍ من توكل عليه.',
    tafsirEn:'Trust in Allah is worship, and Allah suffices as a disposer of affairs.',
    link:'https://quran.com/33/3' },

  { type:'quran', time:'midday',
    ar:'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
    ref:'غافر ٤٠:٦٠',
    tafsirAr:'الدعاء عبادة مأمور بها، والله يجيب من دعاه بصدق.',
    tafsirEn:'Supplication is a commanded act of worship — Allah answers those who call upon Him sincerely.',
    link:'https://quran.com/40/60' },

  /* ── Evening ── */
  { type:'quran', time:'evening',
    ar:'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    ref:'البقرة ٢:١٥٢',
    tafsirAr:'جزاء الذكر ذكر، وجزاء الشكر زيادة، فليحرص العبد على ذكر ربه وشكره.',
    tafsirEn:'Remember Me and I will remember you; be grateful and never ungrateful.',
    link:'https://quran.com/2/152' },

  { type:'quran', time:'evening',
    ar:'يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا',
    ref:'الأحزاب ٣٣:٤١',
    tafsirAr:'أمر بالإكثار من ذكر الله في كل حال، فهو غذاء القلوب وزكاة النفوس.',
    tafsirEn:'An order to remember Allah abundantly in every state — dhikr is the soul’s nourishment.',
    link:'https://quran.com/33/41' },

  { type:'quran', time:'evening',
    ar:'وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ',
    ref:'الكهف ١٨:٢٤',
    tafsirAr:'إذا غفل القلب عن ذكر ربه، فليعاود الذكر؛ فالغفلة طارئة والذكر أصل.',
    tafsirEn:'If you forget, remember your Lord again — forgetfulness is temporary, remembrance is the foundation.',
    link:'https://quran.com/18/24' },

  { type:'quran', time:'evening',
    ar:'وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ الْغُرُوبِ',
    ref:'ق ٥٠:٣٩',
    tafsirAr:'أمر بالتسبيح في أول النهار وآخره، ليكون القلب حاضرًا مع الله في كل حين.',
    tafsirEn:'Glorify your Lord before sunrise and before sunset — keeping the heart present with Allah.',
    link:'https://quran.com/50/39' },

  { type:'quran', time:'evening',
    ar:'وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ',
    ref:'الذاريات ٥١:٥٥',
    tafsirAr:'التذكير مهمة المؤمن، والنفع خاص بالمؤمنين الذين تقبل قلوبهم الحق.',
    tafsirEn:'Remind, for reminders benefit the believers whose hearts accept the truth.',
    link:'https://quran.com/51/55' },

  { type:'quran', time:'evening',
    ar:'إِنَّ فِي ذَٰلِكَ لَذِكْرَىٰ لِمَن كَانَ لَهُ قَلْبٌ',
    ref:'ق ٥٠:٣٧',
    tafsirAr:'العبرة ينتفع بها من كان له قلب واعٍ حاضر مع الله.',
    tafsirEn:'Lessons are of benefit to those who have a heart attentive to Allah.',
    link:'https://quran.com/50/37' },

  /* ── Night ── */
  { type:'quran', time:'night',
    ar:'تَتَجَافَىٰ جُنُوبُهُمْ عَنِ الْمَضَاجِعِ يَدْعُونَ رَبَّهُمْ خَوْفًا وَطَمَعًا',
    ref:'السجدة ٣٢:١٦',
    tafsirAr:'صفة المؤمنين أنهم يقومون للتهجد في الليل، يدعون الله خوفًا من عقابه وطمعًا في رحمته.',
    tafsirEn:'The believers rise from their beds at night, calling upon Allah in fear and hope.',
    link:'https://quran.com/32/16' },

  { type:'quran', time:'night',
    ar:'وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ',
    ref:'الإسراء ١٧:٧٩',
    tafsirAr:'قيام الليل نافلة عظيمة، ووسيلة لرفعة الدرجات.',
    tafsirEn:'Tahajjud in the night is a lofty voluntary prayer and a means of rising in rank.',
    link:'https://quran.com/17/79' },

  { type:'quran', time:'night',
    ar:'إِنَّ نَاشِئَةَ اللَّيْلِ هِيَ أَشَدُّ وَطْئًا وَأَقْوَمُ قِيلًا',
    ref:'المزمل ٧٣:٦',
    tafsirAr:'قيام الليل أثقل على النفس وأثبت للقراءة وأحضر للقلب.',
    tafsirEn:'Night prayer is heavier on the self, steadier in recitation, and more present to the heart.',
    link:'https://quran.com/73/6' },

  { type:'quran', time:'night',
    ar:'كَانُوا قَلِيلًا مِّنَ اللَّيْلِ مَا يَهْجَعُونَ',
    ref:'الذاريات ٥١:١٧',
    tafsirAr:'وصف الله عباده المتقين بأنهم يحيون الليل بالصلاة والذكر.',
    tafsirEn:'Allah praises the righteous who spend the night in prayer and remembrance.',
    link:'https://quran.com/51/17' },

  { type:'quran', time:'night',
    ar:'وَالْمُسْتَغْفِرِينَ بِالْأَسْحَارِ',
    ref:'آل عمران ٣:١٧',
    tafsirAr:'الأسحار وقت مبارك للاستغفار، وأهل الإيمان يحرصون عليه.',
    tafsirEn:'The pre-dawn hours are a blessed time for seeking forgiveness, and the faithful are keen on it.',
    link:'https://quran.com/3/17' },

  /* ── Any time ── */
  { type:'quran', time:'any',
    ar:'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    ref:'البقرة ٢:١٥٣',
    tafsirAr:'معية الله للصابرين نصر وتأييد، فلا يخذل الله من صبر على طاعته.',
    tafsirEn:'Allah is with the patient — His support and victory accompany those who endure.',
    link:'https://quran.com/2/153' },

  { type:'quran', time:'any',
    ar:'وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
    ref:'آل عمران ٣:١٣٤',
    tafsirAr:'الله يحب المحسنين، والإحسان أعلى مراتب العبادة.',
    tafsirEn:'Allah loves those who do good — ihsan is the highest level of worship.',
    link:'https://quran.com/3/134' },

  { type:'quran', time:'any',
    ar:'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ',
    ref:'البقرة ٢:٢٢٢',
    tafsirAr:'التوبة والطهارة صفتان يحبهما الله، فباب التوبة مفتوح لكل من صدق.',
    tafsirEn:'Allah loves those who repent and those who purify themselves.',
    link:'https://quran.com/2/222' },

  { type:'quran', time:'any',
    ar:'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
    ref:'البقرة ٢:١٨٦',
    tafsirAr:'الله قريب من عباده يجيب دعاءهم، فلا يحتاج العبد واسطة بينه وبين ربه.',
    tafsirEn:'Allah is near to His servants and answers their supplications — no intermediary is needed.',
    link:'https://quran.com/2/186' },

  { type:'quran', time:'any',
    ar:'فَاذْكُرُونِي أَذْكُرْكُمْ',
    ref:'البقرة ٢:١٥٢',
    tafsirAr:'الذكر سبب لذكر الله للعبد، وهي أعظم منزلة.',
    tafsirEn:'Dhikr causes Allah to remember the servant — the highest honour.',
    link:'https://quran.com/2/152' },

  { type:'quran', time:'any',
    ar:'قَدْ أَفْلَحَ مَن زَكَّاهَا',
    ref:'الشمس ٩١:٩',
    tafsirAr:'الفلاح في تزكية النفس وتطهيرها، وكل خير ثمرة لذلك.',
    tafsirEn:'Success is in purifying the soul — all good is a fruit of that.',
    link:'https://quran.com/91/9' },

  { type:'quran', time:'any',
    ar:'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    ref:'الطلاق ٦٥:٢',
    tafsirAr:'من اتقى الله فتح له أبواب الفرج من حيث لا يحتسب.',
    tafsirEn:'Whoever fears Allah, He makes a way out for him from where he never expected.',
    link:'https://quran.com/65/2' },

  { type:'quran', time:'any',
    ar:'وَاذْكُرُوا اللَّهَ كَثِيرًا لَّعَلَّكُمْ تُفْلِحُونَ',
    ref:'الجمعة ٦٢:١٠',
    tafsirAr:'كثرة الذكر سبب الفلاح في الدنيا والآخرة.',
    tafsirEn:'Abundant dhikr is the cause of success in this life and the next.',
    link:'https://quran.com/62/10' },

  { type:'quran', time:'any',
    ar:'فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ',
    ref:'الروم ٣٠:٦٠',
    tafsirAr:'وعد الله حق لا يخلف، والصبر سبيل من أيقن به.',
    tafsirEn:'Allah’s promise is true and never broken — patience is the path of those who trust it.',
    link:'https://quran.com/30/60' },

  { type:'quran', time:'any',
    ar:'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَقُولُوا قَوْلًا سَدِيدًا',
    ref:'الأحزاب ٣٣:٧٠',
    tafsirAr:'التقوى وصواب القول سبب لصلاح الأعمال ومغفرة الذنوب.',
    tafsirEn:'Taqwa and speaking righteously lead to righteous deeds and forgiveness.',
    link:'https://quran.com/33/70' },

  /* ═══════════════════════ HADITH ═══════════════════════ */

  /* ── Morning ── */
  { type:'hadith', time:'morning',
    ar:'احرص على ما ينفعك، واستعن بالله ولا تعجز.',
    ref:'صحيح مسلم ٢٦٦٤',
    tafsirAr:'دعوة للجد في طلب النافع، والاستعانة بالله أساس النجاح، مع نبذ العجز.',
    tafsirEn:'A call to pursue what benefits you, seek Allah’s help, and avoid laziness.',
    link:'https://sunnah.com/muslim:2664' },

  { type:'hadith', time:'morning',
    ar:'المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف، وفي كلٍّ خير.',
    ref:'صحيح مسلم ٢٦٦٤',
    tafsirAr:'القوة (في الإيمان والبدن والعمل) مرغّب فيها، والخير موجود في الجميع.',
    tafsirEn:'The strong believer is better and more beloved to Allah, though there is good in all.',
    link:'https://sunnah.com/muslim:2664' },

  { type:'hadith', time:'morning',
    ar:'مَن قال: سبحان الله وبحمده، في يومٍ مائة مرة، حُطَّت خطاياه وإن كانت مثل زَبَد البحر.',
    ref:'صحيح مسلم ٢٦٩٢',
    tafsirAr:'عِظَم فضل التسبيح، فهو كفّارة للذنوب وإن كثرت.',
    tafsirEn:'The great virtue of tasbih — it erases sins even if they were like the foam of the sea.',
    link:'https://sunnah.com/muslim:2692' },

  { type:'hadith', time:'morning',
    ar:'مَن قال حين يصبح وحين يمسي: سبحان الله وبحمده، مائة مرة، لم يأتِ أحد بأفضل مما جاء به.',
    ref:'صحيح مسلم ٢٦٩٢',
    tafsirAr:'فضل الذكر صباحًا ومساءً، ولا يبلغ أحد أفضل من ذلك إلا بمثله أو أكثر.',
    tafsirEn:'Virtue of dhikr morning and evening — no one attains better unless he does the same or more.',
    link:'https://sunnah.com/muslim:2692' },

  { type:'hadith', time:'morning',
    ar:'اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.',
    ref:'سنن الترمذي ٣٣٩١',
    tafsirAr:'دعاء الصباح والمساء، فيه إقرار بأن الأمور كلها بيد الله.',
    tafsirEn:'The morning and evening supplication — affirming that all affairs are in Allah’s hands.',
    link:'https://sunnah.com/tirmidhi:3391' },

  /* ── Midday ── */
  { type:'hadith', time:'midday',
    ar:'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم.',
    ref:'صحيح البخاري ٦٦٨٢',
    tafsirAr:'كلمتان يسيرتان على اللسان، لكن ثقلهما عظيم في الميزان يوم القيامة.',
    tafsirEn:'Two words light on the tongue, heavy on the scale, beloved to the Most Merciful.',
    link:'https://sunnah.com/bukhari:6682' },

  { type:'hadith', time:'midday',
    ar:'مَن قال: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، في يوم مائة مرة، كانت له عَدْلَ عشر رقاب.',
    ref:'صحيح البخاري ٣٢٩٣',
    tafsirAr:'عِظَم أجر التهليل، فهو يعدل عتق عشر رقاب في سبيل الله.',
    tafsirEn:'The great reward of tahlil — equal to freeing ten slaves for the sake of Allah.',
    link:'https://sunnah.com/bukhari:3293' },

  { type:'hadith', time:'midday',
    ar:'أفضل الذكر لا إله إلا الله، وأفضل الدعاء الحمد لله.',
    ref:'سنن الترمذي ٣٣٨٣',
    tafsirAr:'تفضيل جامع بين الذكر والدعاء؛ فالتهليل أفضل الذكر، والحمد أفضل الدعاء.',
    tafsirEn:'Tahlil is the best dhikr, and praise (alhamdulillah) is the best supplication.',
    link:'https://sunnah.com/tirmidhi:3383' },

  { type:'hadith', time:'midday',
    ar:'أحب الأعمال إلى الله أدومها وإن قل.',
    ref:'صحيح البخاري ٦٤٦٤',
    tafsirAr:'الاستقامة على العمل القليل الدائم أحب إلى الله من الكثير المنقطع.',
    tafsirEn:'The most beloved deeds to Allah are the most consistent, even if small.',
    link:'https://sunnah.com/bukhari:6464' },

  { type:'hadith', time:'midday',
    ar:'البر حسن الخلق.',
    ref:'صحيح مسلم ٢٥٥٣',
    tafsirAr:'الخُلُق الحسن عنوان البر، وهو ميزان الإيمان.',
    tafsirEn:'Righteousness is good character — a sign of faith and a scale for the heart.',
    link:'https://sunnah.com/muslim:2553' },

  /* ── Evening ── */
  { type:'hadith', time:'evening',
    ar:'مَن لزم الاستغفار جعل الله له من كل ضيق مخرجًا، ومن كل هم فرجًا.',
    ref:'سنن أبي داود ١٥١٨',
    tafsirAr:'الاستغفار مفزع الفرج، وباب من أبواب الخير والرزق.',
    tafsirEn:'Whoever persists in seeking forgiveness, Allah grants him a way out of every difficulty.',
    link:'https://sunnah.com/abudawud:1518' },

  { type:'hadith', time:'evening',
    ar:'مَن صلَّى الصُّبح في جماعة، ثم قعد يذكر الله حتى تطلع الشمس، كانت له كأجر حجة وعمرة تامة.',
    ref:'سنن الترمذي ٥٨٦',
    tafsirAr:'فضل الجلوس بعد الفجر في ذكر الله إلى الشروق، وأجره كأجر حج وعمرة تامة.',
    tafsirEn:'Sitting in dhikr after Fajr until sunrise earns the reward of a complete Hajj and Umrah.',
    link:'https://sunnah.com/tirmidhi:586' },

  { type:'hadith', time:'evening',
    ar:'طوبى لمن وجد في صحيفته استغفارًا كثيرًا.',
    ref:'سنن ابن ماجه ٣٨١٨',
    tafsirAr:'الاستغفار ذخر عظيم يوم القيامة، يسرّ صاحبه حين يرى صحيفته.',
    tafsirEn:'Blessed is the one who finds abundant seeking of forgiveness in his record of deeds.',
    link:'https://sunnah.com/ibnmajah:3818' },

  { type:'hadith', time:'evening',
    ar:'اللهم إني أسألك العفو والعافية في الدنيا والآخرة.',
    ref:'سنن أبي داود ٥٠٧٤',
    tafsirAr:'دعاء جامع؛ فالعفو والعافية من أعظم ما يُسأل الله.',
    tafsirEn:'A comprehensive supplication — asking Allah for pardon and well-being in both worlds.',
    link:'https://sunnah.com/abudawud:5074' },

  { type:'hadith', time:'evening',
    ar:'ما سُئل الله شيئًا أفضل من العافية.',
    ref:'سنن الترمذي ٢٣٤٩',
    tafsirAr:'العافية تاج لا يعرفه إلا من فقدها، وهي أعظم ما يُطلب من الله.',
    tafsirEn:'Nothing better is asked of Allah than well-being — a crown only the afflicted truly know.',
    link:'https://sunnah.com/tirmidhi:2349' },

  /* ── Night ── */
  { type:'hadith', time:'night',
    ar:'من صلى العشاء في جماعة فكأنما قام نصف الليل، ومن صلى الصبح في جماعة فكأنما قام الليل كله.',
    ref:'صحيح مسلم ٦٥٦',
    tafsirAr:'فضل صلاة العشاء والفجر في جماعة، وأنه يعدل قيام الليل.',
    tafsirEn:'Praying Isha in congregation equals half the night in prayer; Fajr equals the whole night.',
    link:'https://sunnah.com/muslim:656' },

  { type:'hadith', time:'night',
    ar:'أقرب ما يكون العبد من ربه وهو ساجد، فأكثروا الدعاء.',
    ref:'صحيح مسلم ٤٨٢',
    tafsirAr:'السجود موضع قرب من الله، فلينتهز العبد الفرصة في الدعاء.',
    tafsirEn:'The servant is closest to his Lord while prostrating — so supplicate frequently.',
    link:'https://sunnah.com/muslim:482' },

  { type:'hadith', time:'night',
    ar:'ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر، فيقول: من يدعوني فأستجيب له؟',
    ref:'صحيح البخاري ١١٤٥',
    tafsirAr:'فضل الثلث الأخير من الليل، فهو وقت إجابة الدعاء.',
    tafsirEn:'In the last third of the night Allah descends and answers whoever calls upon Him.',
    link:'https://sunnah.com/bukhari:1145' },

  { type:'hadith', time:'night',
    ar:'رحم الله عبدًا قام من الليل فصلى وأيقظ امرأته، فإن أبت نضح في وجهها الماء.',
    ref:'سنن أبي داود ١٣٠٨',
    tafsirAr:'فضل قيام الليل، وفضل إيقاظ الأهل للخير.',
    tafsirEn:'Virtue of night prayer and of waking one’s family for it.',
    link:'https://sunnah.com/abudawud:1308' },

  { type:'hadith', time:'night',
    ar:'أفضل الصلاة بعد الفريضة صلاة الليل.',
    ref:'صحيح مسلم ١١٦٣',
    tafsirAr:'صلاة الليل أفضل النوافل بعد الفرائض.',
    tafsirEn:'The best voluntary prayer after the obligatory ones is night prayer.',
    link:'https://sunnah.com/muslim:1163' },

  /* ── Any ── */
  { type:'hadith', time:'any',
    ar:'مَن صلى عليَّ صلاةً صلى الله عليه بها عشرًا.',
    ref:'صحيح مسلم ٤٠٨',
    tafsirAr:'فضل الصلاة على النبي ﷺ، وأن الله يجزي بها عشرًا.',
    tafsirEn:'Whoever sends one blessing upon the Prophet, Allah sends ten upon him.',
    link:'https://sunnah.com/muslim:408' },

  { type:'hadith', time:'any',
    ar:'اتقِ الله حيثما كنت، وأتبع السيئة الحسنة تمحها، وخالق الناس بخلق حسن.',
    ref:'سنن الترمذي ١٩٨٧',
    tafsirAr:'وصية جامعة بتقوى الله، ومحو السيئات بالحسنات، وحسن الخلق مع الناس.',
    tafsirEn:'A comprehensive counsel: fear Allah, follow sins with good deeds, and treat people kindly.',
    link:'https://sunnah.com/tirmidhi:1987' },

  { type:'hadith', time:'any',
    ar:'لا تحقرن من المعروف شيئًا، ولو أن تلقى أخاك بوجه طلق.',
    ref:'صحيح مسلم ٢٦٢٦',
    tafsirAr:'لا تصغر أي معروف، فحتى الابتسامة صدقة.',
    tafsirEn:'Do not belittle any good — even meeting your brother with a smiling face.',
    link:'https://sunnah.com/muslim:2626' },

  { type:'hadith', time:'any',
    ar:'الدال على الخير كفاعله.',
    ref:'سنن الترمذي ٢٦٧٠',
    tafsirAr:'من دلَّ على خير فله أجر فاعله، فالدعوة إلى الخير خير.',
    tafsirEn:'Whoever guides to good earns the reward of the one who does it.',
    link:'https://sunnah.com/tirmidhi:2670' },

  { type:'hadith', time:'any',
    ar:'تبسمك في وجه أخيك صدقة.',
    ref:'سنن الترمذي ١٩٥٦',
    tafsirAr:'الابتسامة صدقة، وأدنى ما يصنعه المرء من المعروف.',
    tafsirEn:'Your smile to your brother is charity — the smallest act of good.',
    link:'https://sunnah.com/tirmidhi:1956' },

  { type:'hadith', time:'any',
    ar:'مثل الذي يذكر ربه والذي لا يذكره كمثل الحي والميت.',
    ref:'صحيح البخاري ١٠٤٦',
    tafsirAr:'الذاكر لربه حي القلب، والغافل عنه ميت القلب.',
    tafsirEn:'One who remembers his Lord is alive; one who doesn’t is like the dead.',
    link:'https://sunnah.com/bukhari:1046' },

  { type:'hadith', time:'any',
    ar:'قال الله تعالى: أنا عند ظن عبدي بي، وأنا معه إذا ذكرني.',
    ref:'صحيح البخاري ٧٤٠٥',
    tafsirAr:'فضل حسن الظن بالله، ومعية الله لمن ذكره.',
    tafsirEn:'Allah is as His servant thinks of Him, and He is with him when he remembers Him.',
    link:'https://sunnah.com/bukhari:7405' },

  { type:'hadith', time:'any',
    ar:'سبعة يظلهم الله في ظله يوم لا ظل إلا ظله — وذكر منهم: رجل ذكر الله خاليًا ففاضت عيناه.',
    ref:'صحيح البخاري ٦٦٠',
    tafsirAr:'من السبعة الذين يظلهم الله: من ذكر الله في خلوة فبكى من خشيته.',
    tafsirEn:'Among the seven shaded by Allah: one who remembers Allah in private and weeps.',
    link:'https://sunnah.com/bukhari:660' },

  { type:'hadith', time:'any',
    ar:'كفى بالمرء إثمًا أن يضيع من يقوت.',
    ref:'سنن أبي داود ١٦٩٢',
    tafsirAr:'إثم عظيم على من أهمل من تلزمه نفقتهم.',
    tafsirEn:'It is enough sin for a man to neglect those he is obliged to provide for.',
    link:'https://sunnah.com/abudawud:1692' },


  /* ═══════════ BATCH 2 — additional Quran + Hadith ═══════════ */

  /* ── Morning ── */
  { type:'quran', time:'morning',
    ar:'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
    ref:'الطلاق ٦٥:٢-٣',
    tafsirAr:'من اتقى الله فتح له أبواب الفرج والرزق من حيث لا يخطر على باله.',
    tafsirEn:'Whoever fears Allah, He opens for him doors of relief and provides from where he never imagined.',
    link:'https://quran.com/65/2' },

  { type:'quran', time:'morning',
    ar:'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا',
    ref:'الأحزاب ٣٣:٥٦',
    tafsirAr:'شرف عظيم للنبي ﷺ، وأمر للمؤمنين بالصلاة والسلام عليه.',
    tafsirEn:'A noble honour for the Prophet ﷺ, and a command for believers to send blessings and peace upon him.',
    link:'https://quran.com/33/56' },

  { type:'quran', time:'morning',
    ar:'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    ref:'البقرة ٢:٢٠١',
    tafsirAr:'دعاء جامع لخيري الدنيا والآخرة، والوقاية من النار.',
    tafsirEn:'A comprehensive supplication for good in both worlds and protection from the Fire.',
    link:'https://quran.com/2/201' },

  { type:'quran', time:'morning',
    ar:'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
    ref:'الضحى ٩٣:٥',
    tafsirAr:'وعد من الله لنبيه ﷺ بالعطاء حتى يرضى، وهو بشارة لكل مؤمن صابر.',
    tafsirEn:'A promise to the Prophet ﷺ of giving until he is satisfied — a glad tidings to every patient believer.',
    link:'https://quran.com/93/5' },

  { type:'quran', time:'morning',
    ar:'إِنَّ اللَّهَ لَا يَظْلِمُ مِثْقَالَ ذَرَّةٍ ۖ وَإِن تَكُ حَسَنَةً يُضَاعِفْهَا',
    ref:'النساء ٤:٤٠',
    tafsirAr:'الله عدل لا يظلم أحدًا، بل يضاعف الحسنات.',
    tafsirEn:'Allah is just — He wrongs no one, and multiplies good deeds.',
    link:'https://quran.com/4/40' },

  { type:'hadith', time:'morning',
    ar:'باكرُوا طلبَ الرزقِ والحوائجِ؛ فإنَّ الغُدوَّ بركةٌ.',
    ref:'الطبراني في الأوسط',
    tafsirAr:'البركة في المبادرة بالعمل في أول النهار، وقد جرّبه الناس.',
    tafsirEn:'Blessing lies in early pursuit of work and needs — the early hours carry barakah.',
    link:'https://sunnah.com/' },

  { type:'hadith', time:'morning',
    ar:'اللهم إني أسألك علمًا نافعًا، ورزقًا طيبًا، وعملًا متقبلًا.',
    ref:'سنن ابن ماجه ٩٢٥',
    tafsirAr:'دعاء جامع بعد صلاة الفجر، يجمع خيري الدنيا والآخرة.',
    tafsirEn:'A comprehensive supplication after Fajr — combining the good of both worlds.',
    link:'https://sunnah.com/ibnmajah:925' },

  { type:'hadith', time:'morning',
    ar:'مَن قال حين يصبح ثلاث مرات: أعوذ بالله السميع العليم من الشيطان الرجيم، ومن همزه ونفخه ونفثه، أُجير من الشيطان يومه ذلك.',
    ref:'سنن أبي داود ٥٠٦٧',
    tafsirAr:'استعاذة صباحية تحفظ العبد من الشيطان طول يومه.',
    tafsirEn:'A morning seeking of refuge that protects the servant from Satan all day.',
    link:'https://sunnah.com/abudawud:5067' },

  { type:'hadith', time:'morning',
    ar:'إن الله يُباهي بأهل الصف الأول من الملائكة.',
    ref:'صحيح مسلم ٤٣٩',
    tafsirAr:'فضل التقدم إلى الصلاة والصف الأول.',
    tafsirEn:'Virtue of being early to prayer and the first row.',
    link:'https://sunnah.com/muslim:439' },

  { type:'hadith', time:'morning',
    ar:'مَن صلى الفجر في جماعة ثم قعد يذكر الله حتى تطلع الشمس ثم صلى ركعتين، كانت له كأجر حجة وعمرة.',
    ref:'سنن الترمذي ٥٨٦',
    tafsirAr:'فضل الجلوس بعد الفجر في ذكر الله، ثم صلاة ركعتي الشروق.',
    tafsirEn:'Virtue of sitting in dhikr after Fajr, then praying two rak‘ahs after sunrise.',
    link:'https://sunnah.com/tirmidhi:586' },

  /* ── Midday ── */
  { type:'quran', time:'midday',
    ar:'يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَاءٌ لِّمَا فِي الصُّدُورِ',
    ref:'يونس ١٠:٥٧',
    tafsirAr:'القرآن موعظة وشفاء لما في الصدور من الشك والمرض.',
    tafsirEn:'The Quran is an admonition and a healing for what is in the hearts.',
    link:'https://quran.com/10/57' },

  { type:'quran', time:'midday',
    ar:'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ',
    ref:'النحل ١٦:٩٠',
    tafsirAr:'أمر جامع بالعدل والإحسان وصلة الأرحام، وهو من أجمع آيات الخير.',
    tafsirEn:'A comprehensive command for justice, excellence, and giving to kin.',
    link:'https://quran.com/16/90' },

  { type:'quran', time:'midday',
    ar:'وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ ۚ وَاتَّقُوا اللَّهَ',
    ref:'المائدة ٥:٢',
    tafsirAr:'النهي عن التعاون على الحرام، والأمر بالتعاون على البر والتقوى.',
    tafsirEn:'A prohibition against helping in sin and transgression, and a command to fear Allah.',
    link:'https://quran.com/5/2' },

  { type:'quran', time:'midday',
    ar:'وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ',
    ref:'العنكبوت ٢٩:٤٥',
    tafsirAr:'الصلاة الصحيحة تنهى صاحبها عن الفحشاء والمنكر.',
    tafsirEn:'True prayer restrains its doer from indecency and wrongdoing.',
    link:'https://quran.com/29/45' },

  { type:'quran', time:'midday',
    ar:'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
    ref:'المجادلة ٥٨:١١',
    tafsirAr:'رفعة الدرجات للإيمان والعلم، فمن جمعهما نال أعلى المنازل.',
    tafsirEn:'Allah raises the believers and the people of knowledge in ranks.',
    link:'https://quran.com/58/11' },

  { type:'hadith', time:'midday',
    ar:'إن الله جميل يحب الجمال.',
    ref:'صحيح مسلم ٩١',
    tafsirAr:'الجمال المحبوب هو جمال الظاهر والباطن، مع التواضع.',
    tafsirEn:'Allah is beautiful and loves beauty — in appearance and character.',
    link:'https://sunnah.com/muslim:91' },

  { type:'hadith', time:'midday',
    ar:'مَن نفَّس عن مؤمن كربةً من كرب الدنيا، نفَّس الله عنه كربةً من كرب يوم القيامة.',
    ref:'صحيح مسلم ٢٦٩٩',
    tafsirAr:'من فرّج همًّا عن مؤمن، فرّج الله همه يوم القيامة.',
    tafsirEn:'Whoever relieves a believer’s hardship, Allah relieves his hardship on the Day of Judgement.',
    link:'https://sunnah.com/muslim:2699' },

  { type:'hadith', time:'midday',
    ar:'المسلم من سلم المسلمون من لسانه ويده.',
    ref:'صحيح البخاري ١٠',
    tafsirAr:'كمال الإسلام في كف الأذى عن المسلمين باللسان واليد.',
    tafsirEn:'The complete Muslim is one from whose tongue and hand other Muslims are safe.',
    link:'https://sunnah.com/bukhari:10' },

  { type:'hadith', time:'midday',
    ar:'مَن كان يؤمن بالله واليوم الآخر فليقل خيرًا أو ليصمت.',
    ref:'صحيح البخاري ٦٠١٨',
    tafsirAr:'حفظ اللسان عنوان الإيمان، فإما كلام طيب وإما صمت.',
    tafsirEn:'Guarding the tongue is a sign of faith — either speak good or remain silent.',
    link:'https://sunnah.com/bukhari:6018' },

  { type:'hadith', time:'midday',
    ar:'ما نقصت صدقةٌ من مالٍ، وما زاد الله عبدًا بعفوٍ إلا عزًّا.',
    ref:'صحيح مسلم ٢٥٨٨',
    tafsirAr:'الصدقة لا تنقص المال، والعفو يزيد العز.',
    tafsirEn:'Charity never decreases wealth, and forgiveness only increases honour.',
    link:'https://sunnah.com/muslim:2588' },

  /* ── Evening ── */
  { type:'quran', time:'evening',
    ar:'وَاذْكُر رَّبَّكَ فِي نَفْسِكَ تَضَرُّعًا وَخِيفَةً وَدُونَ الْجَهْرِ مِنَ الْقَوْلِ بِالْغُدُوِّ وَالْآصَالِ',
    ref:'الأعراف ٧:٢٠٥',
    tafsirAr:'أمر بذكر الله في النفس بخشوع وخوف، في أول النهار وآخره.',
    tafsirEn:'A command to remember Allah inwardly with humility and fear, morning and evening.',
    link:'https://quran.com/7/205' },

  { type:'quran', time:'evening',
    ar:'إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ',
    ref:'هود ١١:١١٤',
    tafsirAr:'الحسنات تكفّر السيئات، وهي رحمة من الله للعبد.',
    tafsirEn:'Good deeds erase bad deeds — a mercy from Allah to His servant.',
    link:'https://quran.com/11/114' },

  { type:'quran', time:'evening',
    ar:'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
    ref:'آل عمران ٣:٨',
    tafsirAr:'دعاء بالثبات على الهداية، وخشية الزيغ بعد الاستقامة.',
    tafsirEn:'A supplication for steadfastness after guidance, fearing deviation.',
    link:'https://quran.com/3/8' },

  { type:'quran', time:'evening',
    ar:'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ',
    ref:'هود ١١:٨٨',
    tafsirAr:'التوفيق كله من الله، وعليه التوكل وإليه الإنابة.',
    tafsirEn:'All success is from Allah — in Him I trust and to Him I turn.',
    link:'https://quran.com/11/88' },

  { type:'quran', time:'evening',
    ar:'وَقُل رَّبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ',
    ref:'المؤمنون ٢٣:٩٧',
    tafsirAr:'دعاء بالاستعاذة من وساوس الشياطين وهمزاتهم.',
    tafsirEn:'A supplication seeking refuge from the whispers of the devils.',
    link:'https://quran.com/23/97' },

  { type:'quran', time:'evening',
    ar:'إِنَّ اللَّهَ وَاسِعٌ عَلِيمٌ',
    ref:'البقرة ٢:١١٥',
    tafsirAr:'الله واسع الفضل، عليم بأحوال عباده.',
    tafsirEn:'Allah is vast in bounty and all-knowing of His servants’ states.',
    link:'https://quran.com/2/115' },

  { type:'hadith', time:'evening',
    ar:'مَن قال: سبحان الله وبحمده، حين يصبح وحين يمسي، مائة مرة، لم يأتِ أحد بأفضل مما جاء به.',
    ref:'صحيح مسلم ٢٦٩٢',
    tafsirAr:'من فضائل التسبيح صباحًا ومساءً.',
    tafsirEn:'Virtue of tasbih morning and evening.',
    link:'https://sunnah.com/muslim:2692' },

  { type:'hadith', time:'evening',
    ar:'مَن قرأ آية الكرسي دُبر كل صلاة مكتوبة، لم يمنعه من دخول الجنة إلا الموت.',
    ref:'النسائي في السنن الكبرى',
    tafsirAr:'فضل قراءة آية الكرسي بعد كل صلاة مفروضة.',
    tafsirEn:'Virtue of reciting Ayat al-Kursi after every obligatory prayer.',
    link:'https://sunnah.com/' },

  { type:'hadith', time:'evening',
    ar:'مَن قرأ سورة الكهف يوم الجمعة، أضاء له من النور ما بين الجمعتين.',
    ref:'الحاكم في المستدرك',
    tafsirAr:'فضل قراءة سورة الكهف يوم الجمعة.',
    tafsirEn:'Virtue of reciting Surah al-Kahf on Friday.',
    link:'https://sunnah.com/' },

  { type:'hadith', time:'evening',
    ar:'أكثِروا من ذكر هادم اللذات.',
    ref:'سنن ابن ماجه ٤٢٥٨',
    tafsirAr:'المقصود الموت، فيكثر العبد من ذكره؛ ليستعد للآخرة.',
    tafsirEn:'A reminder to frequently remember the destroyer of pleasures — death.',
    link:'https://sunnah.com/ibnmajah:4258' },

  { type:'hadith', time:'evening',
    ar:'إن العبد ليتكلم بالكلمة من رضوان الله، لا يلقي لها بالًا، يرفعه الله بها درجات.',
    ref:'صحيح البخاري ٦٤٧٨',
    tafsirAr:'الكلمة الطيبة قد تكون سببًا لرفعة الدرجات.',
    tafsirEn:'A single word of Allah’s pleasure may raise a servant in ranks.',
    link:'https://sunnah.com/bukhari:6478' },

  /* ── Night ── */
  { type:'quran', time:'night',
    ar:'وَبِالْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ',
    ref:'الذاريات ٥١:١٨',
    tafsirAr:'الاستغفار في وقت السحر من صفات المتقين.',
    tafsirEn:'Seeking forgiveness in the pre-dawn hours is a trait of the righteous.',
    link:'https://quran.com/51/18' },

  { type:'quran', time:'night',
    ar:'إِنَّ الْمُتَّقِينَ فِي جَنَّاتٍ وَعُيُونٍ',
    ref:'الذاريات ٥١:١٥',
    tafsirAr:'جزاء المتقين في الآخرة الجنة والنعيم الدائم.',
    tafsirEn:'The reward of the God-fearing is gardens and springs in the Hereafter.',
    link:'https://quran.com/51/15' },

  { type:'quran', time:'night',
    ar:'أَمَّنْ هُوَ قَانِتٌ آنَاءَ اللَّيْلِ سَاجِدًا وَقَائِمًا يَحْذَرُ الْآخِرَةَ وَيَرْجُو رَحْمَةَ رَبِّهِ',
    ref:'الزمر ٣٩:٩',
    tafsirAr:'ثناء على من يقوم الليل خوفًا وطمعًا، وهو من أعظم الأعمال.',
    tafsirEn:'Praise for the one who stands in prayer at night, fearing the Hereafter and hoping for mercy.',
    link:'https://quran.com/39/9' },

  { type:'quran', time:'night',
    ar:'وَالَّذِينَ يَبِيتُونَ لِرَبِّهِمْ سُجَّدًا وَقِيَامًا',
    ref:'الفرقان ٢٥:٦٤',
    tafsirAr:'من صفات عباد الرحمن قيام الليل لله.',
    tafsirEn:'A trait of the servants of the Most Merciful: spending the night in prostration and standing.',
    link:'https://quran.com/25/64' },

  { type:'quran', time:'night',
    ar:'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
    ref:'الفرقان ٢٥:٧٤',
    tafsirAr:'دعاء جامع بصلاح الأهل والذرية، فهم قرة العين.',
    tafsirEn:'A supplication for righteous family and offspring — the comfort of the eyes.',
    link:'https://quran.com/25/74' },

  { type:'quran', time:'night',
    ar:'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ',
    ref:'القدر ٩٧:٥',
    tafsirAr:'ليلة القدر سلام وأمان حتى طلوع الفجر.',
    tafsirEn:'Laylat al-Qadr is peace until the break of dawn.',
    link:'https://quran.com/97/5' },

  { type:'quran', time:'night',
    ar:'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةٍ مُّبَارَكَةٍ',
    ref:'الدخان ٤٤:٣',
    tafsirAr:'ليل القدر ليلة مباركة أنزل فيها القرآن.',
    tafsirEn:'A blessed night in which the Quran was revealed.',
    link:'https://quran.com/44/3' },

  { type:'hadith', time:'night',
    ar:'مَن قام رمضان إيمانًا واحتسابًا، غُفر له ما تقدم من ذنبه.',
    ref:'صحيح البخاري ٣٧',
    tafsirAr:'فضل قيام رمضان بالتراويح والتهجد.',
    tafsirEn:'Virtue of praying the nights of Ramadan out of faith.',
    link:'https://sunnah.com/bukhari:37' },

  { type:'hadith', time:'night',
    ar:'مَن قام ليلة القدر إيمانًا واحتسابًا، غُفر له ما تقدم من ذنبه.',
    ref:'صحيح البخاري ٣٥',
    tafsirAr:'فضل قيام ليلة القدر.',
    tafsirEn:'Virtue of standing in prayer on Laylat al-Qadr.',
    link:'https://sunnah.com/bukhari:35' },

  { type:'hadith', time:'night',
    ar:'أفضل الصيام بعد رمضان شهر الله المحرَّم، وأفضل الصلاة بعد المفروضة صلاة الليل.',
    ref:'صحيح مسلم ١١٦٣',
    tafsirAr:'تفضيل صلاة الليل بعد الفرائض، وصيام المحرَّم بعد رمضان.',
    tafsirEn:'The best voluntary fast after Ramadan is Muharram, and the best prayer after the obligatory is the night prayer.',
    link:'https://sunnah.com/muslim:1163' },

  { type:'hadith', time:'night',
    ar:'مَن استيقظ من الليل فقال: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، ثم قال: اللهم اغفر لي، أو دعا، استُجيب له.',
    ref:'صحيح البخاري ١١٥٤',
    tafsirAr:'فضل الذكر والدعاء عند الاستيقاظ من الليل.',
    tafsirEn:'Virtue of dhikr and supplication upon waking at night.',
    link:'https://sunnah.com/bukhari:1154' },

  { type:'hadith', time:'night',
    ar:'ينزل الله إلى السماء الدنيا كل ليلة حين يبقى ثلث الليل الآخر، فيقول: أنا الملك، من ذا الذي يدعوني فأستجيب له؟',
    ref:'صحيح مسلم ٧٥٨',
    tafsirAr:'نزول الله في الثلث الأخير من الليل وإجابته الدعاء.',
    tafsirEn:'Allah descends in the last third of the night and answers those who call upon Him.',
    link:'https://sunnah.com/muslim:758' },

  { type:'hadith', time:'night',
    ar:'الطُّهور شطر الإيمان، والحمد لله تملأ الميزان.',
    ref:'صحيح مسلم ٢٢٣',
    tafsirAr:'فضل الطهارة والحمد.',
    tafsirEn:'Purity is half of faith, and praise fills the scale.',
    link:'https://sunnah.com/muslim:223' },

  /* ── Any ── */
  { type:'quran', time:'any',
    ar:'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    ref:'آل عمران ٣:١٣٩',
    tafsirAr:'نهي عن الوهن والحزن، وأمر بالثقة بنصر الله.',
    tafsirEn:'A prohibition against weakness and grief — victory is with the believers.',
    link:'https://quran.com/3/139' },

  { type:'quran', time:'any',
    ar:'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ',
    ref:'المائدة ٥:٢',
    tafsirAr:'أمر بالتعاون على الخير والتقوى.',
    tafsirEn:'A command to cooperate in righteousness and piety.',
    link:'https://quran.com/5/2' },

  { type:'quran', time:'any',
    ar:'وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
    ref:'آل عمران ٣:١٣٤',
    tafsirAr:'من صفات المتقين كظم الغيظ والعفو عن الناس.',
    tafsirEn:'Among the traits of the righteous: restraining anger and forgiving people.',
    link:'https://quran.com/3/134' },

  { type:'quran', time:'any',
    ar:'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا',
    ref:'آل عمران ٣:١٠٣',
    tafsirAr:'أمر بالاعتصام بالقرآن والإسلام والوحدة.',
    tafsirEn:'A command to hold fast to Allah’s rope together and not divide.',
    link:'https://quran.com/3/103' },

  { type:'quran', time:'any',
    ar:'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ',
    ref:'الأنبياء ٢١:١٠٧',
    tafsirAr:'بعثة النبي ﷺ رحمة للعالمين أجمعين.',
    tafsirEn:'The Prophet ﷺ was sent as a mercy to all the worlds.',
    link:'https://quran.com/21/107' },

  { type:'quran', time:'any',
    ar:'إِنَّ اللَّهَ لَا يَخْفَىٰ عَلَيْهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ',
    ref:'آل عمران ٣:٥',
    tafsirAr:'علم الله محيط بكل شيء، فلا يخفى عليه شيء.',
    tafsirEn:'Nothing is hidden from Allah in the earth or the heavens.',
    link:'https://quran.com/3/5' },

  { type:'quran', time:'any',
    ar:'وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ',
    ref:'البقرة ٢:١٤٤',
    tafsirAr:'الله مطلع على أعمال العباد، فلا يغفل عنها.',
    tafsirEn:'Allah is not unaware of what you do.',
    link:'https://quran.com/2/144' },

  { type:'quran', time:'any',
    ar:'وَمَن يُؤْمِن بِاللَّهِ يَهْدِ قَلْبَهُ',
    ref:'التغابن ٦٤:١١',
    tafsirAr:'من صدق إيمانه بالله هداه الله قلبه للصواب.',
    tafsirEn:'Whoever believes in Allah, He guides his heart.',
    link:'https://quran.com/64/11' },

  { type:'quran', time:'any',
    ar:'إِنَّ اللَّهَ يُدَافِعُ عَنِ الَّذِينَ آمَنُوا',
    ref:'الحج ٢٢:٣٨',
    tafsirAr:'الله يدافع عن المؤمنين ويحفظهم.',
    tafsirEn:'Allah defends those who believe.',
    link:'https://quran.com/22/38' },

  { type:'hadith', time:'any',
    ar:'إن الله كتب الإحسان على كل شيء.',
    ref:'صحيح مسلم ١٩٥٥',
    tafsirAr:'الإحسان مكتوب ومأمور به في كل شيء.',
    tafsirEn:'Allah has prescribed excellence in all things.',
    link:'https://sunnah.com/muslim:1955' },

  { type:'hadith', time:'any',
    ar:'مَن دلَّ على خيرٍ فله مثل أجر فاعله.',
    ref:'صحيح مسلم ١٨٩٣',
    tafsirAr:'الدال على الخير كفاعله في الأجر.',
    tafsirEn:'Whoever directs to good has a reward like its doer.',
    link:'https://sunnah.com/muslim:1893' },

  { type:'hadith', time:'any',
    ar:'يقول الله تعالى: أنا عند ظن عبدي بي.',
    ref:'صحيح البخاري ٧٤٠٥',
    tafsirAr:'حسن الظن بالله عبادة، والله عند ظن عبده به.',
    tafsirEn:'Good expectation of Allah is worship — He is as His servant thinks of Him.',
    link:'https://sunnah.com/bukhari:7405' },

  { type:'hadith', time:'any',
    ar:'مَن صلَّى عليَّ صلاةً، صلَّى الله عليه عشرًا.',
    ref:'صحيح مسلم ٤٠٨',
    tafsirAr:'فضل الصلاة على النبي ﷺ.',
    tafsirEn:'Virtue of sending blessings on the Prophet ﷺ.',
    link:'https://sunnah.com/muslim:408' },

  { type:'hadith', time:'any',
    ar:'خيركم من تعلَّم القرآن وعلَّمه.',
    ref:'صحيح البخاري ٥٠٢٧',
    tafsirAr:'الخيرية في تعلم القرآن وتعليمه.',
    tafsirEn:'The best of you are those who learn the Quran and teach it.',
    link:'https://sunnah.com/bukhari:5027' },

  { type:'hadith', time:'any',
    ar:'اقرؤوا القرآن؛ فإنه يأتي يوم القيامة شفيعًا لأصحابه.',
    ref:'صحيح مسلم ٨٠٤',
    tafsirAr:'القرآن يشفع لأصحابه يوم القيامة.',
    tafsirEn:'The Quran will intercede for its companions on the Day of Judgement.',
    link:'https://sunnah.com/muslim:804' },

  { type:'hadith', time:'any',
    ar:'من قرأ حرفًا من كتاب الله فله به حسنة.',
    ref:'سنن الترمذي ٢٩١٠',
    tafsirAr:'فضل قراءة القرآن حرفًا حرفًا.',
    tafsirEn:'Virtue of reciting the Quran letter by letter.',
    link:'https://sunnah.com/tirmidhi:2910' },

  { type:'hadith', time:'any',
    ar:'الدعاء هو العبادة.',
    ref:'سنن الترمذي ٣٣٧٢',
    tafsirAr:'الدعاء مخ العبادة وأجلّها.',
    tafsirEn:'Supplication is worship itself.',
    link:'https://sunnah.com/tirmidhi:3372' },

  { type:'hadith', time:'any',
    ar:'أفضل العبادة الدعاء.',
    ref:'سنن الترمذي ٣٣٧٢',
    tafsirAr:'الدعاء أفضل العبادات وأعظمها أجرًا.',
    tafsirEn:'The best form of worship is supplication.',
    link:'https://sunnah.com/tirmidhi:3372' },

  { type:'hadith', time:'any',
    ar:'الساعي على الأرملة والمسكين كالمجاهد في سبيل الله.',
    ref:'صحيح البخاري ٥٣٥٣',
    tafsirAr:'أجر الساعي على الأرملة والمسكين كأجر المجاهد.',
    tafsirEn:'The one who strives for the widow and the poor is like a warrior in Allah’s path.',
    link:'https://sunnah.com/bukhari:5353' },

  { type:'hadith', time:'any',
    ar:'اتقوا النار ولو بشق تمرة.',
    ref:'صحيح البخاري ١٤١٧',
    tafsirAr:'لو كان بصدقة قليلة اتقِ النار.',
    tafsirEn:'Guard against the Fire even with half a date given in charity.',
    link:'https://sunnah.com/bukhari:1417' },

  { type:'hadith', time:'any',
    ar:'من أُخذ من ماله بقدر ما أخذ، احتُسِب له أجرًا.',
    ref:'سنن أبي داود ٣٥٦٠',
    tafsirAr:'الصبر على فقد المال فيه أجر.',
    tafsirEn:'Patience in the loss of wealth carries a reward.',
    link:'https://sunnah.com/abudawud:3560' },
];

/* ═══════════════════════════════════════════════════════════
   Time slot — 6h buckets aligned to the natural day
   00-06 → night   | 06-12 → morning
   12-18 → midday  | 18-24 → evening
   ═══════════════════════════════════════════════════════════ */
function getCurrentTimeSlot(){
  const h = new Date().getHours();
  if(h < 6)  return 'night';
  if(h < 12) return 'morning';
  if(h < 18) return 'midday';
  return 'evening';
}

/* ═══════════════════════════════════════════════════════════
   Get today's quote — deterministic per 6h slot
   Same quote for everyone in the same slot, rotates at 00/06/12/18
   ═══════════════════════════════════════════════════════════ */
function getTodayQuote(){
  const now = new Date();

  /* Days since epoch (UTC) — stable across timezones for the day part */
  const day = Math.floor(now.getTime() / 86400000);
  const slot = getCurrentTimeSlot();

  /* Quotes that fit this slot OR are universal */
  const pool = QUOTES.filter(q => q.time === slot || q.time === 'any');
  if(!pool.length) return QUOTES[0];

  /* Deterministic pick — same for everyone in the same slot */
  const idx = day % pool.length;
  return pool[idx];
}

/* ═══════════════════════════════════════════════════════════
   Total count — for display / debugging
   ═══════════════════════════════════════════════════════════ */
const QUOTES_COUNT = QUOTES.length;