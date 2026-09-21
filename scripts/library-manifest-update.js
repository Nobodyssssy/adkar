'use strict';

const fs = require('fs');
const path = require('path');

const REPO = 'C:\\Users\\Protagonist\\Desktop\\Html app\\Sahib';
const DATA_FILE = path.join(REPO, 'js', 'books-data.js');

function removeBookById(src, id) {
  const re = new RegExp("id:\\s*['\"]" + id + "['\"]");
  const match = re.exec(src);

  if (!match) {
    return src;
  }

  let start = match.index;

  while (start > 0 && src[start] !== '{') {
    start--;
  }

  let depth = 0;
  let end = start;

  for (; end < src.length; end++) {
    const ch = src[end];

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;

      if (depth === 0) {
        end++;
        break;
      }
    }
  }

  let after = end;

  while (after < src.length && /\s/.test(src[after])) {
    after++;
  }

  if (src[after] === ',') {
    after++;
  }

  return src.slice(0, start) + src.slice(after);
}

const newEntries = `
{
id: 'bulugh-maram',
file: "2. الحديث الشريف وعلومه - Hadith & Its Sciences/بلوغ المرام من أدلة الأحكام إبن حجر العسقلاني.pdf",
titleAr: 'بلوغ المرام من أدلة الأحكام',
titleEn: 'Bulugh al-Maram',
author: 'ابن حجر العسقلاني',
authorEn: 'Ibn Hajar al-Asqalani',
category: 'hadith',
descriptionAr: 'جامع لأحاديث الأحكام مرتب على أبواب الفقه مع ذكر التخريج والدراسة.',
descriptionEn: 'A collection of hadiths on Islamic rulings arranged by fiqh chapters, with source references and grading notes.'
},
{
id: 'muwatta-malik',
file: "2. الحديث الشريف وعلومه - Hadith & Its Sciences/الموطأ لإمام دار الهجرة مالك بن أنس رواية يحي بن يحي الليثي.pdf",
titleAr: 'الموطأ',
titleEn: 'Al-Muwatta',
author: 'مالك بن أنس',
authorEn: 'Imam Malik ibn Anas',
category: 'hadith',
descriptionAr: 'أحد أقدم كتب الحديث والفقه، يجمع أحاديث النبي وآثار الصحابة والتابعين برواية يحيى بن يحيى الليثي.',
descriptionEn: 'One of the earliest compilations of hadith and fiqh, containing narrations of the Prophet and statements of the Companions and Successors in the narration of Yahya ibn Yahya al-Laythi.'
},
{
id: 'shamail-muhammadiyya',
file: "3. السيرة النبوية والتاريخ - Prophet's Biography & History/الشمائل المحمدية -محمد بن عيسى الترمذي-محمد ناصر الدين الألباني.pdf",
titleAr: 'الشمائل المحمدية',
titleEn: 'Ash-Shama.il al-Muhammadiyya',
author: 'الترمذي',
authorEn: 'Imam at-Tirmidhi',
category: 'seerah',
descriptionAr: 'كتاب في أخلاق النبي وشمله وهيئته ولباسه وعاداته اليومية.',
descriptionEn: 'A book on the character, appearance, dress, and daily habits of the Prophet.'
},
{
id: 'adawi-seerah-nabawiyya',
file: "3. السيرة النبوية والتاريخ - Prophet's Biography & History/مصطفى العدوي سيرة نبوية.pdf",
titleAr: 'سيرة نبوية',
titleEn: 'Seerah Nabawiyyah',
author: 'مصطفى العدوي',
authorEn: 'Mustafa al-Adawi',
category: 'seerah',
descriptionAr: 'عرض مبسط لسيرة النبي وأحداث بعثته وهجرته وغزواته.',
descriptionEn: 'An accessible presentation of the life of the Prophet, his mission, migration, and major events.'
},
{
id: 'muqaddimah-ibn-khaldun',
file: "3. السيرة النبوية والتاريخ - Prophet's Biography & History/مقدمة ابن خلدون .pdf",
titleAr: 'مقدمة ابن خلدون',
titleEn: 'The Muqaddimah',
author: 'ابن خلدون',
authorEn: 'Ibn Khaldun',
category: 'seerah',
descriptionAr: 'كتاب في علم العمران البشري ونشأة الدول وأخبار الأمم وسنن التاريخ.',
descriptionEn: 'A foundational work on human society, the rise and fall of states, history, and civilization.'
},
{
id: 'sharh-tahawiyyah',
file: "4. العقيدة والتوحيد - Islamic Creed & Theology/شرح العقيدة الطحاوية لابن أبي العز الحنفي.pdf",
titleAr: 'شرح العقيدة الطحاوية',
titleEn: 'Commentary on al-Aqidah al-Tahawiyyah',
author: 'ابن أبي العز الحنفي',
authorEn: 'Ibn Abi al-Izz al-Hanafi',
category: 'aqeedah',
descriptionAr: 'شرح معتبر للعقيدة الطحاوية يبين معتقد أهل السنة والجماعة في التوحيد والأسماء والصفات والقدر.',
descriptionEn: 'A respected commentary on al-Tahawiyyah, explaining the creed of Ahl al-Sunnah regarding monotheism, divine names, attributes, and decree.'
},
{
id: 'bidayat-mujtahid',
file: "5. الفقه وأصوله - Islamic Jurisprudence (Fiqh)/بداية المجتهد ونهاية المقتصد لابن رشد.pdf",
titleAr: 'بداية المجتهد ونهاية المقتصد',
titleEn: 'Bidayat al-Mujtahid',
author: 'ابن رشد',
authorEn: 'Ibn Rushd',
category: 'fiqh',
descriptionAr: 'كتاب في الفقه المقارن يشرح أسباب اختلاف المجتهدين في الأحكام الفقهية.',
descriptionEn: 'A comparative fiqh work explaining the causes of disagreement among jurists in legal rulings.'
},
{
id: 'maqasid-shariah',
file: "5. الفقه وأصوله - Islamic Jurisprudence (Fiqh)/مقــاصـد الشريعة الإسلامية تأصيلاً وتفعيلاً.pdf",
titleAr: 'مقاصد الشريعة الإسلامية تأصيلا وتفعيلا',
titleEn: 'Maqasid al-Shariah',
author: 'مؤلف معاصر',
authorEn: 'Contemporary Author',
category: 'fiqh',
descriptionAr: 'كتاب في تأصيل مقاصد الشريعة وتطبيقها على القضايا المعاصرة.',
descriptionEn: 'A work on grounding the higher objectives of Shariah and applying them to contemporary issues.'
},
{
id: 'tazkiyat-nafs-ibn-taymiyyah',
file: "6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/ابن تيمية  تزكية النفس.pdf",
titleAr: 'تزكية النفس',
titleEn: 'Purification of the Soul',
author: 'ابن تيمية',
authorEn: 'Ibn Taymiyyah',
category: 'adhkar',
descriptionAr: 'مجموعة من نصوص ابن تيمية في تزكية النفس وبيان أمراض القلوب وعلاجها.',
descriptionEn: 'A collection of texts by Ibn Taymiyyah on purifying the soul and treating diseases of the heart.'
},
{
id: 'adab-mufrad',
file: "6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/الأدب المفرد الجامع للآداب النبوية للإمام البخاري.pdf",
titleAr: 'الأدب المفرد',
titleEn: 'Al-Adab al-Mufrad',
author: 'الإمام البخاري',
authorEn: 'Imam al-Bukhari',
category: 'adhkar',
descriptionAr: 'كتاب في الآداب والأخلاق النبوية جمعها الإمام البخاري في كتاب مستقل.',
descriptionEn: 'A book of prophetic manners and ethics compiled by Imam al-Bukhari in a standalone collection.'
},
{
id: 'fawa-id-ibn-qayyim',
file: "6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/الفوائد مجموعة من الحكم لابن قيم الجوزية.pdf",
titleAr: 'الفوائد',
titleEn: 'Al-Fawa.id',
author: 'ابن قيم الجوزية',
authorEn: 'Ibn Qayyim al-Jawziyyah',
category: 'adhkar',
descriptionAr: 'مجموعة من الحكم والفوائد الروحية والعلمية لابن قيم الجوزية.',
descriptionEn: 'A collection of spiritual and scholarly insights by Ibn Qayyim al-Jawziyyah.'
},
{
id: 'sayd-al-khatir',
file: "6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/صيد الخاطر ابن الجوزي.pdf",
titleAr: 'صيد الخاطر',
titleEn: 'Sayd al-Khatir',
author: 'ابن الجوزي',
authorEn: 'Ibn al-Jawzi',
category: 'adhkar',
descriptionAr: 'خواطر وملاحظات ابن الجوزي في النفس والمجتمع والدين بأسلوب شخصي مباشر.',
descriptionEn: 'Personal reflections by Ibn al-Jawzi on the soul, society, and religion in a direct style.'
},
{
id: 'thinking-fast-and-slow',
file: "7. دراسات وقضايا معاصرة - Modern Studies & Issues/Daniel Kahneman-Thinking, Fast and Slow.pdf",
titleAr: 'التفكير السريع والبطيء',
titleEn: 'Thinking, Fast and Slow',
author: 'دانيال كانمان',
authorEn: 'Daniel Kahneman',
category: 'modern',
descriptionAr: 'كتاب في علم النفس المعرفي يوضح نظامي التفكير والتحيزات العقلية.',
descriptionEn: 'A book on cognitive psychology explaining fast and slow thinking and mental biases.'
},
{
id: 'deep-work',
file: "7. دراسات وقضايا معاصرة - Modern Studies & Issues/Deep Work Cal Newport.pdf",
titleAr: 'العمل العميق',
titleEn: 'Deep Work',
author: 'كال نيوبورت',
authorEn: 'Cal Newport',
category: 'modern',
descriptionAr: 'كتاب في التركيز والإنتاجية وبناء عادات عمل عميق في عالم مليء بالمشتتات.',
descriptionEn: 'A book on focus, productivity, and building habits of deep work in a distracted world.'
},
{
id: 'atomic-habits',
file: "8. كتب عامة وأدب - General Books & Literature/Atomic-Habits-James-Clear.pdf",
titleAr: 'العادات الذرية',
titleEn: 'Atomic Habits',
author: 'جيمس كلير',
authorEn: 'James Clear',
category: 'general',
descriptionAr: 'دليل عملي لبناء العادات الحسنة وترك السيئات عبر أنظمة صغيرة مستمرة.',
descriptionEn: 'A practical guide to building good habits and breaking bad ones through small continuous systems.'
},
{
id: 'meditations-marcus-aurelius',
file: "8. كتب عامة وأدب - General Books & Literature/Meditations Marcus Aurelius.pdf",
titleAr: 'تأملات',
titleEn: 'Meditations',
author: 'ماركوس أوريليوس',
authorEn: 'Marcus Aurelius',
category: 'general',
descriptionAr: 'خواطر الإمبراطور الروماني ماركوس أوريليوس في ضبط النفس والصبر والموت.',
descriptionEn: 'Private reflections of the Roman emperor Marcus Aurelius on self-discipline, patience, and death.'
},
`;

let src = fs.readFileSync(DATA_FILE, 'utf8');
const beforeSize = src.length;

src = removeBookById(src, 'hizb-aadham');

if (src.indexOf("id: 'bulugh-maram'") !== -1) {
  fs.writeFileSync(DATA_FILE, src, 'utf8');
  console.log('books-data.js already contains the new entries. Removed hizb-aadham if present.');
  process.exit(0);
}

const toAddIndex = src.indexOf('TO ADD A NEW BOOK:');
let insertAt;

if (toAddIndex !== -1) {
  insertAt = src.lastIndexOf('/*', toAddIndex);

  if (insertAt === -1) {
    insertAt = toAddIndex;
  }
} else {
  insertAt = src.lastIndexOf('];');
}

if (insertAt === -1) {
  throw new Error('Could not find insertion point in books-data.js');
}

src = src.slice(0, insertAt) + newEntries + '\n' + src.slice(insertAt);

fs.writeFileSync(DATA_FILE, src, 'utf8');

console.log('books-data.js updated.');
console.log('Size before:', beforeSize);
console.log('Size after:', src.length);