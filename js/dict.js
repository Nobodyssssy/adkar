'use strict';

/* ═══════════════════════════════════════════════════════════
   Bilingual dictionary for search
   Maps: English / transliteration → Arabic
   Used to expand Latin queries into Arabic before searching.
   ═══════════════════════════════════════════════════════════ */

const ADKAR_DICT = [
  /* ── Core actions ── */
  { en:['forgiveness','forgive','seeking forgiveness'], ar:['استغفار','أستغفر','مغفرة','غفران'], tr:['istighfar','istigfar','istighfaar','astaghfir'] },
  { en:['praise','thanks','thank'],                     ar:['حمد','الحمد','شكر'],                    tr:['hamd','alhamdulillah','shukr'] },
  { en:['glorify','glorification','exalt'],             ar:['تسبيح','سبحان'],                       tr:['tasbih','tasbeeh','subhan','subhanallah'] },
  { en:['greatness','greater','magnify'],               ar:['تكبير','أكبر'],                        tr:['takbir','akbar','allahu akbar'] },
  { en:['oneness','tawhid','no god but allah'],         ar:['تهليل','لا إله إلا'],                  tr:['tahlil','la ilaha illa'] },
  { en:['prayer upon prophet','blessings'],             ar:['صلاة على النبي','اللهم صل'],           tr:['salawat','durood'] },
  { en:['remembrance','reminder'],                      ar:['ذكر','أذكار'],                        tr:['dhikr','zikr','adkar','azkar'] },
  { en:['supplication','invocation','prayer request'],  ar:['دعاء','أدعية'],                       tr:['dua','duaa'] },

  /* ── Times of day ── */
  { en:['morning','dawn'],                              ar:['صباح','الصباح','أصبح'],                tr:['sabah','asbahna'] },
  { en:['evening','dusk'],                              ar:['مساء','المساء','أمسى'],                tr:['masaa','masa','amsayna'] },
  { en:['night','nighttime'],                           ar:['ليل','الليل'],                        tr:['layl'] },
  { en:['sleep','bedtime','before sleep'],              ar:['نوم','النوم','منام'],                  tr:['nawm','manam'] },
  { en:['waking','wake up','waking up'],                ar:['استيقاظ','أستيقظ'],                    tr:['istiqaz','istiqadh'] },
  { en:['sunset','maghrib'],                            ar:['مغرب','غروب'],                        tr:['maghrib'] },
  { en:['sunrise','fajr'],                              ar:['فجر','الفجر'],                        tr:['fajr','subh'] },
  { en:['noon','midday','dhuhr'],                       ar:['ظهر','الظهر'],                        tr:['dhuhr','zuhr'] },
  { en:['afternoon','asr'],                             ar:['عصر','العصر'],                        tr:['asr'] },
  { en:['evening prayer','isha'],                       ar:['عشاء','العشاء'],                      tr:['isha','ishaa'] },
  { en:['night prayer','tahajjud'],                     ar:['تهجد','قيام الليل'],                  tr:['tahajjud','qiyam'] },

  /* ── Prayer & worship ── */
  { en:['prayer','salah','ritual prayer'],              ar:['صلاة','الصلوات'],                     tr:['salah','salat','salaah'] },
  { en:['after prayer','post prayer'],                  ar:['بعد الصلاة','دبر الصلاة'],             tr:['after salah','bad salat'] },
  { en:['wudu','ablution'],                             ar:['وضوء','الوضوء'],                      tr:['wudu','wudhu'] },
  { en:['restroom','toilet','bathroom'],                ar:['خلاء','الخلاء','دخول الخلاء'],         tr:['khala','toilet'] },
  { en:['mosque','masjid'],                             ar:['مسجد','المسجد'],                      tr:['masjid','mosque'] },
  { en:['call to prayer','adhan'],                      ar:['أذان','الأذان'],                      tr:['adhan','azan'] },
  { en:['quran','recitation'],                          ar:['قرآن','القرآن'],                      tr:['quran'] },
  { en:['verse','ayat','ayat al-kursi'],                ar:['آية','آية الكرسي'],                    tr:['ayah','ayat','kursi'] },

  /* ── Situations ── */
  { en:['travel','journey','travelling'],               ar:['سفر','السفر','مسافر'],                tr:['safar','musafir'] },
  { en:['food','eating','meal'],                        ar:['طعام','الطعام','أكل'],                tr:['taam','akl'] },
  { en:['drink','drinking'],                            ar:['شرب','الشراب'],                       tr:['shurb','sharab'] },
  { en:['home','house','household'],                    ar:['منزل','المنزل','بيت'],                tr:['manzil','bayt'] },
  { en:['entering','enter'],                            ar:['دخول','عند الدخول'],                  tr:['dukhul'] },
  { en:['leaving','exit','leaving home'],               ar:['خروج','عند الخروج'],                  tr:['khuruj'] },
  { en:['clothing','clothes','dress'],                  ar:['ثوب','اللباس','ملابس'],                tr:['thawb','libas','malabis'] },
  { en:['illness','sick','sickness'],                   ar:['مرض','المرض','مريض'],                 tr:['marad','marid'] },
  { en:['death','dying','deceased'],                    ar:['موت','الميت','وفاة'],                 tr:['mawt','wafat'] },
  { en:['distress','anxiety','sorrow','grief'],         ar:['هم','حزن','كرب','ضيق'],               tr:['hamm','huzn','karb'] },
  { en:['fear','afraid'],                               ar:['خوف','الخوف'],                        tr:['khawf'] },
  { en:['anger','angry'],                               ar:['غضب','الغضب'],                        tr:['ghadab'] },
  { en:['debt','loan','owing'],                         ar:['دين','الدين'],                        tr:['dayn'] },
  { en:['rain','raining'],                              ar:['مطر','المطر'],                        tr:['matar'] },
  { en:['wind','windy'],                                ar:['ريح','الريح'],                        tr:['rih'] },
  { en:['thunder','lightning'],                         ar:['رعد','برق'],                          tr:['rad','barq'] },
  { en:['moon','crescent','new moon'],                  ar:['هلال','القمر'],                       tr:['hilal','qamar'] },
  { en:['market','shopping','shop'],                    ar:['سوق','السوق'],                        tr:['suq','souq'] },

  /* ── Names / attributes of Allah ── */
  { en:['allah','god'],                                 ar:['الله','اللهم'],                       tr:['allah','allahumma'] },
  { en:['merciful','mercy','compassionate'],            ar:['رحمن','رحيم','رحمة'],                  tr:['rahman','rahim','rahma'] },
  { en:['living','ever living'],                        ar:['حي'],                                 tr:['hayy'] },
  { en:['sustainer','self-subsisting'],                 ar:['قيوم'],                               tr:['qayyum'] },
  { en:['mighty','great','magnificent'],                ar:['عظيم','العظيم'],                      tr:['adhim','azeem'] },
  { en:['wise','all-wise'],                             ar:['حكيم'],                               tr:['hakim','hakeem'] },
  { en:['hearing','all-hearing'],                       ar:['سميع'],                               tr:['sami','samee'] },
  { en:['seeing','all-seeing'],                         ar:['بصير'],                               tr:['basir','baseer'] },
  { en:['forgiving','oft-forgiving'],                   ar:['غفور','غفار'],                        tr:['ghafur','ghaffar'] },
  { en:['high','most high'],                            ar:['علي'],                                tr:['aliyy','ali'] },
  { en:['knowing','all-knowing'],                       ar:['عليم'],                               tr:['alim','aleem'] },
  { en:['sufficient','enough','suffices'],              ar:['كافي','حسبنا'],                       tr:['kafi','hasbuna'] },
  { en:['protector','protection','guardian'],           ar:['حفيظ','حفظ','حرز'],                   tr:['hafiz','hifz','hirz'] },
  { en:['guide','guidance'],                            ar:['هدى','هداية'],                        tr:['huda','hidaya'] },

  /* ── Afterlife ── */
  { en:['paradise','jannah','garden'],                  ar:['جنة','الجنة'],                        tr:['jannah'] },
  { en:['hell','hellfire','fire'],                      ar:['نار','جهنم'],                         tr:['nar','jahannam'] },
  { en:['grave','tomb'],                                ar:['قبر','القبر'],                        tr:['qabr'] },
  { en:['resurrection','day of judgment'],              ar:['قيامة','يوم القيامة'],                tr:['qiyamah'] },
  { en:['hereafter','afterlife'],                       ar:['آخرة','الآخرة'],                      tr:['akhirah','akhira'] },

  /* ── Entities ── */
  { en:['satan','devil','shaytan'],                     ar:['شيطان','الشيطان'],                    tr:['shaytan','shaitan','satan'] },
  { en:['angel','angels'],                              ar:['ملك','ملائكة'],                       tr:['malak','malaika'] },
  { en:['prophet','messenger','muhammad'],              ar:['النبي','محمد','رسول'],                 tr:['nabi','muhammad','rasul'] },
  { en:['companions','sahaba'],                         ar:['صحابة','الصحابة'],                    tr:['sahaba'] },

  /* ── Feelings / states ── */
  { en:['purity','clean','pure'],                       ar:['طهارة','طاهر'],                       tr:['tahara','tahir'] },
  { en:['safety','safe','security'],                    ar:['سلامة','أمان'],                       tr:['salama','aman'] },
  { en:['peace','tranquility'],                         ar:['سلام','طمأنينة'],                     tr:['salam','tumanina'] },
  { en:['health','wellbeing','healthy'],                ar:['صحة','عافية'],                        tr:['sihha','afiya'] },
  { en:['blessing','blessings','barakah'],              ar:['بركة','نعمة'],                        tr:['barakah','nimah'] },
  { en:['goodness','good','righteous'],                 ar:['خير','صالح'],                         tr:['khayr','salih'] },
  { en:['evil','bad'],                                  ar:['شر','سوء'],                           tr:['sharr'] },
  { en:['heart','inner self'],                          ar:['قلب','القلب'],                        tr:['qalb'] },
  { en:['soul','self','nafs'],                          ar:['نفس','روح'],                          tr:['nafs','ruh'] },
  { en:['body','physical'],                             ar:['بدن','جسد'],                          tr:['badan','jasad'] },

  /* ── Numbers ── */
  { en:['three','3'],                                   ar:['ثلاث','ثلاثاً'],                      tr:['thalath','3'] },
  { en:['seven','7'],                                   ar:['سبع','سبعاً'],                        tr:['sab','7'] },
  { en:['ten','10'],                                    ar:['عشر','عشراً'],                        tr:['ashr','10'] },
  { en:['hundred','100'],                               ar:['مائة','مئة'],                         tr:['miah','100'] },
  { en:['thousand','1000'],                             ar:['ألف'],                                tr:['alf','1000'] },
];

/* ═══════════════════════════════════════════════════════════
   Lookup — Latin token → matching Arabic forms
   ═══════════════════════════════════════════════════════════ */
function dictLatinToArabic(token){
  if(!token) return [];
  const t = token.toLowerCase().trim();
  const out = [];
  for(const entry of ADKAR_DICT){
    const hit = entry.en.some(w => w === t || w.startsWith(t) || t.startsWith(w))
             || entry.tr.some(w => w === t || w.startsWith(t) || t.startsWith(w));
    if(hit) out.push(...entry.ar);
  }
  return out;
}

/* Expand a full Latin query → array of Arabic phrases */
function expandQueryToArabic(query){
  if(!query) return [];
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const phrases = [];
  for(const tok of tokens){
    const arForms = dictLatinToArabic(tok);
    arForms.forEach(ar => {
      if(!phrases.includes(ar)) phrases.push(ar);
    });
  }
  return phrases;
}