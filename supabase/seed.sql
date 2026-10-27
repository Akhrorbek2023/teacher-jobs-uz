-- Comprehensive seed vacancies for Teacher Jobs UZ
-- Can be executed in Supabase SQL editor

insert into public.vacancies (
  title, subject, description, requirements, responsibilities, city, district,
  salary_min, salary_max, salary_text, employment_type, source_type, source_name, status, verified, published_at
) values
(
  'Matematika (SAT / Olimpiada) o‘qituvchisi', 'Matematika',
  'Prezident maktabi va xalqaro olimpiadalarga tayyorlovchi zamonaviy o‘quv markazi kuchli matematika mutaxassisini jamoaga taklif etadi.',
  'Oliy pedagogik ma’lumot, kamida 3 yillik ish tajribasi. Respublika olimpiadalarida g‘olib bo‘lgan shogirdlari bo‘lishi ustunlik beradi.',
  'Darslarni interaktiv tarzda o‘tish, olimpiada masalalarini tahlil qilish, oylik test sinovlarini tashkil etish.',
  'Toshkent', 'Mirzo Ulug‘bek tumani', 10000000, 18000000, '10 - 18 mln so‘m', 'full_time', 'manual', 'Prezident ta’lim maskani', 'published', true, now() - interval '1 day'
),
(
  'Ingliz tili o‘qituvchisi (IELTS Instructor)', 'Ingliz tili',
  'Cambridge International School Toshkent filiali uchun xalqaro standartlar asosida dars beruvchi tajribali IELTS o‘qituvchisi kerak.',
  'IELTS 7.5+ yoki CEFR C1 sertifikati, CELTA yoki TESOL diplomi mavjudligi, 2+ yil tajriba.',
  'Akademik ingliz tili darslarini olib borish, writing va speaking bo‘yicha individual feedback berish.',
  'Toshkent', 'Yakkasaroy tumani', 9000000, 16000000, '9 - 16 mln so‘m', 'full_time', 'manual', 'Cambridge International School', 'published', true, now() - interval '2 days'
),
(
  'Rus tili va adabiyoti o‘qituvchisi (rus sinflariga)', 'Rus tili',
  'Sodiq School xususiy maktabi rus tili va adabiyoti fanini yuqori saviyada o‘tadigan, bolalarga mehr bilan yondashadigan tajribali ustozni taklif qiladi.',
  'Oliy filologik ma''lumot, rus tilini ona tili darajasida bilish, kamida 3 yil maktab tajribasi.',
  '5-11 sinflarda rus tili va adabiyoti darslarini zamonaviy dastur asosida tashkil etish.',
  'Toshkent', 'Shayxontohur tumani', 8000000, 14000000, '8 - 14 mln so‘m', 'full_time', 'manual', 'Sodiq School', 'published', true, now() - interval '2 days'
),
(
  'Boshlang‘ich sinf o‘qituvchisi (1-4 sinf)', 'Boshlang‘ich ta''lim',
  'Vosiq International School 1-sinf o‘quvchilariga mehr bilan ta’lim beruvchi, xalqaro metodikalarni qo‘llovchi ijodkor boshlang‘ich sinf o‘qituvchisini taklif etadi.',
  'Boshlang‘ich ta’lim yo‘nalishida oliy ma’lumot, 2 yillik tajriba, zamonaviy metodikalardan xabardorlik.',
  'Sinf rahbarligi, o‘qish, yozish va matematik savodxonlik darslarini olib borish.',
  'Toshkent', 'Chilonzor tumani', 7000000, 12000000, '7 - 12 mln so‘m', 'full_time', 'manual', 'Vosiq International School', 'published', true, now() - interval '3 days'
),
(
  'Fizika o‘qituvchisi (Nazariya va Laboratoriya)', 'Fizika',
  'Al-Xorazmiy nomidagi ixtisoslashtirilgan maktab fizika laboratoriya mashg‘ulotlarini va nazariy bilimlarni chuqur o‘rgatuvchi tajribali o‘qituvchini jamoaga qabul qiladi.',
  'Fizika mutaxassisligi bo‘yicha oliy ma’lumot, laboratoriya asbob-uskunalari bilan ishlash ko‘nikmasi.',
  'Fizika fanidan nazariy va amaliy darslarni olib borish, olimpiadachilar bilan shug‘ullanish.',
  'Toshkent', 'Olmazor tumani', 8500000, 15000000, '8.5 - 15 mln so‘m', 'full_time', 'manual', 'Al-Xorazmiy ixtisoslashgan maktabi', 'published', true, now() - interval '3 days'
),
(
  'Kimyo o‘qituvchisi (Milliy sertifikat va DTM)', 'Kimyo',
  'Colba School va Registon o‘quv markaziga abituriyentlarni tibbiyot oliygohlariga tayyorlovchi yuqori malakali kimyo fani ustozi talab etiladi.',
  'Kimyo bo‘yicha oliy ma’lumot, Milliy sertifikat (A yoki A+) yoki DTM tayyorlovda 3+ yillik muvaffaqiyatli tajriba.',
  'Organik va noorganik kimyodan chuqur bilim berish, testlar va masalalar tahlili.',
  'Toshkent', 'Yunusobod tumani', 8000000, 16000000, '8 - 16 mln so‘m', 'full_time', 'manual', 'Colba School & Registon', 'published', true, now() - interval '4 days'
),
(
  'Biologiya o‘qituvchisi (Olimpiada va DTM)', 'Biologiya',
  'Abu Ali ibn Sino nomidagi ixtisoslashtirilgan maktab o‘quvchilarga biologiya va genetika fanlaridan chuqurlashtirilgan dars beradigan ustozni qidirmoqda.',
  'Biologiya bo‘yicha oliy ma’lumot, anatomiya va umumiy biologiya fanlarini mukammal bilish.',
  'Nazariy va amaliy darslarni olib borish, biologik tajribalar o‘tkazish.',
  'Toshkent', 'Yunusobod tumani', 7500000, 13000000, '7.5 - 13 mln so‘m', 'full_time', 'manual', 'Ibn Sino ixtisoslashgan maktabi', 'published', true, now() - interval '4 days'
),
(
  'Informatika va IT o‘qituvchisi (Python / Web)', 'Informatika va IT',
  'PDP Junior va Digital Generation maktabi o‘quvchilarga dasturlash asoslari va algoritmlarni o‘rgatuvchi yosh va iqtidorli IT o‘qituvchilarini taklif qiladi.',
  'Informatika yoki IT yo‘nalishida oliy ma’lumot, Python dasturlash tili va Scratch/Web asoslarini bilish.',
  'O‘quvchilarga algoritmik fikrlash, Python va web asoslarini amaliy loyihalar orqali o‘rgatish.',
  'Toshkent', 'Shayxontohur tumani', 9000000, 17000000, '9 - 17 mln so‘m', 'full_time', 'manual', 'PDP Junior School', 'published', true, now() - interval '1 day'
),
(
  'Nemis tili o‘qituvchisi (Goethe B2 / C1)', 'Nemis tili',
  'Germaniya bilan hamkorlikdagi xususiy til maktabiga o‘quvchilarni TestDaF va Goethe sertifikatlariga tayyorlovchi mutaxassis kerak.',
  'Nemis tili bo‘yicha B2 yoki C1 darajadagi xalqaro sertifikat, zamonaviy nemis tili o‘quv qo‘llanmalarini bilish.',
  'A1 dan B2 gacha bo‘lgan guruhlarda nemis tili so‘zlashuv va grammatika darslarini o‘tish.',
  'Samarqand', 'Markaz, Registon', 8000000, 15000000, '8 - 15 mln so‘m', 'full_time', 'manual', 'Samarqand Deutsch Zentrum', 'published', true, now() - interval '1 day'
),
(
  'Oliy matematika va Mantiq o‘qituvchisi', 'Matematika',
  'Samarqand shahridagi nufuzli xususiy maktabga fizika-matematika sinflari uchun kuchli matematika o‘qituvchisi talab etiladi.',
  'Matematika bo‘yicha kamida 4 yillik pedagogik staj, oliy toifa yoki ilmiy daraja ustunlik beradi.',
  '9-11 sinflarda algebra, geometriya va oliy matematika elementlari darslarini olib borish.',
  'Samarqand', 'Universitet xiyoboni', 9000000, 16000000, '9 - 16 mln so‘m', 'full_time', 'manual', 'Registan Academic School', 'published', true, now() - interval '2 days'
),
(
  'Ingliz tili (General & IELTS) o‘qituvchisi', 'Ingliz tili',
  'Farg‘ona shahridagi yetakchi o‘quv markaziga yoshlarga ingliz tilini ravon o‘rgatadigan baquvvat mentor kerak.',
  'IELTS 7.0+, o‘quvchilar bilan til topisha olish, pozitiv energiya va darsga mas''uliyat.',
  'Intermediate va Upper-Intermediate guruhlariga dars berish, speaking clublar o‘tkazish.',
  'Farg‘ona', 'Markaziy hudud', 6500000, 13000000, '6.5 - 13 mln so‘m', 'full_time', 'manual', 'Fergana Fast Education', 'published', true, now() - interval '3 days'
),
(
  'Boshlang‘ich ta''lim ustozi (Rus va o‘zbek guruhlariga)', 'Boshlang‘ich ta''lim',
  'Buxoro shahridagi Karvon Academy xususiy maktabi 1-4 sinf bolajonlariga savod o‘rgatuvchi mehridaryo ustozni taklif qiladi.',
  'Boshlang‘ich ta''lim diplomi, bolalar psixologiyasini bilish, sabr va samimiylik.',
  'Darslarni o‘yinlar va zamonaviy ko‘rgazmali qurollar orqali tashkil qilish.',
  'Buxoro', 'Buxoro shahri', 6000000, 11000000, '6 - 11 mln so‘m', 'full_time', 'manual', 'Karvon Academy Buxoro', 'published', true, now() - interval '4 days'
);
