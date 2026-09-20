-- ============================================================
-- Migration 009: Phase 2 Academic Modules
-- Assignments, Quizzes, Hifz/Tajweed Tracker, Digital Library
-- Safe to run multiple times (IF NOT EXISTS everywhere)
-- ============================================================

-- ─── ASSIGNMENTS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en      text NOT NULL,
  title_ur      text,
  description   text,
  class_id      uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject_id    uuid REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id    uuid REFERENCES teachers(id) ON DELETE SET NULL,
  due_date      date,
  max_marks     numeric(6,2) DEFAULT 10,
  file_url      text,  -- optional attachment on Supabase Storage
  is_published  boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_url        text,   -- submission file on Supabase Storage
  note            text,
  marks_obtained  numeric(6,2),
  feedback        text,
  submitted_at    timestamptz DEFAULT now(),
  graded_at       timestamptz,
  UNIQUE (assignment_id, student_id)
);

-- ─── QUIZZES ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quizzes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en      text NOT NULL,
  title_ur      text,
  class_id      uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject_id    uuid REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id    uuid REFERENCES teachers(id) ON DELETE SET NULL,
  duration_mins int DEFAULT 30,
  total_marks   numeric(6,2),
  is_published  boolean DEFAULT false,
  opens_at      timestamptz,
  closes_at     timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text   text NOT NULL,
  option_a        text NOT NULL,
  option_b        text NOT NULL,
  option_c        text,
  option_d        text,
  correct_option  char(1) NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  marks           numeric(4,2) DEFAULT 1,
  sort_order      int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id    uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score         numeric(6,2),
  total_marks   numeric(6,2),
  started_at    timestamptz DEFAULT now(),
  submitted_at  timestamptz,
  UNIQUE (quiz_id, student_id)
);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id      uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id     uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  chosen_option   char(1) CHECK (chosen_option IN ('a','b','c','d')),
  is_correct      boolean,
  UNIQUE (attempt_id, question_id)
);

-- ─── HIFZ / TAJWEED TRACKER ─────────────────────────────────

-- Surah reference table (seed below)
CREATE TABLE IF NOT EXISTS surahs (
  number      int PRIMARY KEY,
  name_ar     text NOT NULL,
  name_en     text NOT NULL,
  name_ur     text,
  ayah_count  int NOT NULL
);

-- Insert all 114 surahs if not present
INSERT INTO surahs (number, name_ar, name_en, name_ur, ayah_count) VALUES
 (1,'الفاتحة','Al-Fatihah','الفاتحہ',7),
 (2,'البقرة','Al-Baqarah','البقرہ',286),
 (3,'آل عمران','Ali Imran','آل عمران',200),
 (4,'النساء','An-Nisa','النساء',176),
 (5,'المائدة','Al-Maidah','المائدہ',120),
 (6,'الأنعام','Al-Anam','الانعام',165),
 (7,'الأعراف','Al-Araf','الاعراف',206),
 (8,'الأنفال','Al-Anfal','الانفال',75),
 (9,'التوبة','At-Tawbah','التوبہ',129),
 (10,'يونس','Yunus','یونس',109),
 (11,'هود','Hud','ہود',123),
 (12,'يوسف','Yusuf','یوسف',111),
 (13,'الرعد','Ar-Rad','الرعد',43),
 (14,'إبراهيم','Ibrahim','ابراہیم',52),
 (15,'الحجر','Al-Hijr','الحجر',99),
 (16,'النحل','An-Nahl','النحل',128),
 (17,'الإسراء','Al-Isra','الاسراء',111),
 (18,'الكهف','Al-Kahf','الکہف',110),
 (19,'مريم','Maryam','مریم',98),
 (20,'طه','Taha','طہ',135),
 (21,'الأنبياء','Al-Anbiya','الانبیاء',112),
 (22,'الحج','Al-Hajj','الحج',78),
 (23,'المؤمنون','Al-Muminun','المومنون',118),
 (24,'النور','An-Nur','النور',64),
 (25,'الفرقان','Al-Furqan','الفرقان',77),
 (26,'الشعراء','Ash-Shuara','الشعراء',227),
 (27,'النمل','An-Naml','النمل',93),
 (28,'القصص','Al-Qasas','القصص',88),
 (29,'العنكبوت','Al-Ankabut','العنکبوت',69),
 (30,'الروم','Ar-Rum','الروم',60),
 (31,'لقمان','Luqman','لقمان',34),
 (32,'السجدة','As-Sajdah','السجدہ',30),
 (33,'الأحزاب','Al-Ahzab','الاحزاب',73),
 (34,'سبأ','Saba','سبا',54),
 (35,'فاطر','Fatir','فاطر',45),
 (36,'يس','Ya-Sin','یس',83),
 (37,'الصافات','As-Saffat','الصافات',182),
 (38,'ص','Sad','ص',88),
 (39,'الزمر','Az-Zumar','الزمر',75),
 (40,'غافر','Ghafir','غافر',85),
 (41,'فصلت','Fussilat','فصلت',54),
 (42,'الشورى','Ash-Shura','الشوری',53),
 (43,'الزخرف','Az-Zukhruf','الزخرف',89),
 (44,'الدخان','Ad-Dukhan','الدخان',59),
 (45,'الجاثية','Al-Jathiyah','الجاثیہ',37),
 (46,'الأحقاف','Al-Ahqaf','الاحقاف',35),
 (47,'محمد','Muhammad','محمد',38),
 (48,'الفتح','Al-Fath','الفتح',29),
 (49,'الحجرات','Al-Hujurat','الحجرات',18),
 (50,'ق','Qaf','ق',45),
 (51,'الذاريات','Adh-Dhariyat','الذاریات',60),
 (52,'الطور','At-Tur','الطور',49),
 (53,'النجم','An-Najm','النجم',62),
 (54,'القمر','Al-Qamar','القمر',55),
 (55,'الرحمن','Ar-Rahman','الرحمن',78),
 (56,'الواقعة','Al-Waqiah','الواقعہ',96),
 (57,'الحديد','Al-Hadid','الحدید',29),
 (58,'المجادلة','Al-Mujadila','المجادلہ',22),
 (59,'الحشر','Al-Hashr','الحشر',24),
 (60,'الممتحنة','Al-Mumtahanah','الممتحنہ',13),
 (61,'الصف','As-Saf','الصف',14),
 (62,'الجمعة','Al-Jumuah','الجمعہ',11),
 (63,'المنافقون','Al-Munafiqun','المنافقون',11),
 (64,'التغابن','At-Taghabun','التغابن',18),
 (65,'الطلاق','At-Talaq','الطلاق',12),
 (66,'التحريم','At-Tahrim','التحریم',12),
 (67,'الملك','Al-Mulk','الملک',30),
 (68,'القلم','Al-Qalam','القلم',52),
 (69,'الحاقة','Al-Haqqah','الحاقہ',52),
 (70,'المعارج','Al-Maarij','المعارج',44),
 (71,'نوح','Nuh','نوح',28),
 (72,'الجن','Al-Jinn','الجن',28),
 (73,'المزمل','Al-Muzzammil','المزمل',20),
 (74,'المدثر','Al-Muddaththir','المدثر',56),
 (75,'القيامة','Al-Qiyamah','القیامۃ',40),
 (76,'الإنسان','Al-Insan','الانسان',31),
 (77,'المرسلات','Al-Mursalat','المرسلات',50),
 (78,'النبأ','An-Naba','النبا',40),
 (79,'النازعات','An-Naziat','النازعات',46),
 (80,'عبس','Abasa','عبس',42),
 (81,'التكوير','At-Takwir','التکویر',29),
 (82,'الإنفطار','Al-Infitar','الانفطار',19),
 (83,'المطففين','Al-Mutaffifin','المطففین',36),
 (84,'الإنشقاق','Al-Inshiqaq','الانشقاق',25),
 (85,'البروج','Al-Buruj','البروج',22),
 (86,'الطارق','At-Tariq','الطارق',17),
 (87,'الأعلى','Al-Ala','الاعلی',19),
 (88,'الغاشية','Al-Ghashiyah','الغاشیہ',26),
 (89,'الفجر','Al-Fajr','الفجر',30),
 (90,'البلد','Al-Balad','البلد',20),
 (91,'الشمس','Ash-Shams','الشمس',15),
 (92,'الليل','Al-Layl','اللیل',21),
 (93,'الضحى','Ad-Duha','الضحی',11),
 (94,'الشرح','Ash-Sharh','الشرح',8),
 (95,'التين','At-Tin','التین',8),
 (96,'العلق','Al-Alaq','العلق',19),
 (97,'القدر','Al-Qadr','القدر',5),
 (98,'البينة','Al-Bayyinah','البینہ',8),
 (99,'الزلزلة','Az-Zalzalah','الزلزلہ',8),
 (100,'العاديات','Al-Adiyat','العادیات',11),
 (101,'القارعة','Al-Qariah','القارعہ',11),
 (102,'التكاثر','At-Takathur','التکاثر',8),
 (103,'العصر','Al-Asr','العصر',3),
 (104,'الهمزة','Al-Humazah','الہمزہ',9),
 (105,'الفيل','Al-Fil','الفیل',5),
 (106,'قريش','Quraysh','قریش',4),
 (107,'الماعون','Al-Maun','الماعون',7),
 (108,'الكوثر','Al-Kawthar','الکوثر',3),
 (109,'الكافرون','Al-Kafirun','الکافرون',6),
 (110,'النصر','An-Nasr','النصر',3),
 (111,'المسد','Al-Masad','المسد',5),
 (112,'الإخلاص','Al-Ikhlas','الاخلاص',4),
 (113,'الفلق','Al-Falaq','الفلق',5),
 (114,'الناس','An-Nas','الناس',6)
ON CONFLICT (number) DO NOTHING;

-- Hifz progress (one row per student per surah)
CREATE TABLE IF NOT EXISTS hifz_progress (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  surah_number      int NOT NULL REFERENCES surahs(number) ON DELETE CASCADE,
  -- Hifz status: not_started | in_progress | completed | revision_needed
  hifz_status       text NOT NULL DEFAULT 'not_started'
                      CHECK (hifz_status IN ('not_started','in_progress','completed','revision_needed')),
  -- Nazira / Qirat rating: 1-5
  nazira_rating     int CHECK (nazira_rating BETWEEN 1 AND 5),
  -- Tajweed mistakes log (free text or JSON)
  tajweed_notes     text,
  -- Ayahs memorized so far (out of total)
  ayahs_memorized   int DEFAULT 0,
  last_revision_at  date,
  marked_by         uuid REFERENCES teachers(id) ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE (student_id, surah_number)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_hifz_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_hifz_updated_at ON hifz_progress;
CREATE TRIGGER trg_hifz_updated_at
  BEFORE UPDATE ON hifz_progress
  FOR EACH ROW EXECUTE FUNCTION update_hifz_updated_at();

-- ─── DIGITAL KUTUB KHANA (Library) ──────────────────────────

CREATE TABLE IF NOT EXISTS library_books (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en      text NOT NULL,
  title_ur      text,
  author        text,
  category      text DEFAULT 'General',  -- Fiqh, Hadith, Tafsir, Arabic, General
  file_url      text NOT NULL,    -- PDF URL on Supabase Storage
  cover_url     text,             -- thumbnail
  class_id      uuid REFERENCES classes(id) ON DELETE SET NULL,  -- null = all
  is_active     boolean DEFAULT true,
  uploaded_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  download_count int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ─── RLS POLICIES ───────────────────────────────────────────

-- Assignments: teachers can manage their own; students can read published ones in their class
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assignments_teacher_manage" ON assignments;
CREATE POLICY "assignments_teacher_manage" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('admin','nazim','super_admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM teachers t WHERE t.profile_id = auth.uid()
        AND t.id = assignments.teacher_id
    )
  );

DROP POLICY IF EXISTS "assignments_student_read" ON assignments;
CREATE POLICY "assignments_student_read" ON assignments
  FOR SELECT USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM students s
        JOIN profiles p ON p.id = auth.uid()
        WHERE s.profile_id = auth.uid()
          AND s.class_id = assignments.class_id
    )
  );

-- Submissions: students see own; teachers see submissions for their assignments
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "submissions_student" ON assignment_submissions;
CREATE POLICY "submissions_student" ON assignment_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s WHERE s.profile_id = auth.uid()
        AND s.id = assignment_submissions.student_id
    )
  );

DROP POLICY IF EXISTS "submissions_teacher_read" ON assignment_submissions;
CREATE POLICY "submissions_teacher_read" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teachers t
        JOIN assignments a ON a.teacher_id = t.id
        WHERE t.profile_id = auth.uid()
          AND a.id = assignment_submissions.assignment_id
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('admin','nazim','super_admin')
    )
  );

-- Quizzes: similar pattern
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quizzes_teacher" ON quizzes;
CREATE POLICY "quizzes_teacher" ON quizzes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('admin','nazim','super_admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM teachers t WHERE t.profile_id = auth.uid()
        AND t.id = quizzes.teacher_id
    )
  );

DROP POLICY IF EXISTS "quizzes_student_read" ON quizzes;
CREATE POLICY "quizzes_student_read" ON quizzes
  FOR SELECT USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM students s WHERE s.profile_id = auth.uid()
        AND s.class_id = quizzes.class_id
    )
  );

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_questions_all_auth" ON quiz_questions;
CREATE POLICY "quiz_questions_all_auth" ON quiz_questions
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "quiz_questions_teacher_write" ON quiz_questions;
CREATE POLICY "quiz_questions_teacher_write" ON quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('teacher','admin','nazim','super_admin')
    )
  );

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_attempts_student" ON quiz_attempts;
CREATE POLICY "quiz_attempts_student" ON quiz_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s WHERE s.profile_id = auth.uid()
        AND s.id = quiz_attempts.student_id
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('teacher','admin','nazim','super_admin')
    )
  );

ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_answers_student" ON quiz_answers;
CREATE POLICY "quiz_answers_student" ON quiz_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
        JOIN students s ON s.id = qa.student_id
        WHERE qa.id = quiz_answers.attempt_id
          AND s.profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('teacher','admin','nazim','super_admin')
    )
  );

-- Hifz: students see own; teachers & admins see all
ALTER TABLE hifz_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hifz_student_own" ON hifz_progress;
CREATE POLICY "hifz_student_own" ON hifz_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s WHERE s.profile_id = auth.uid()
        AND s.id = hifz_progress.student_id
    )
  );
DROP POLICY IF EXISTS "hifz_teacher_all" ON hifz_progress;
CREATE POLICY "hifz_teacher_all" ON hifz_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('teacher','admin','nazim','super_admin')
    )
  );

-- Library: anyone authenticated can read active books; admins manage
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "library_read" ON library_books;
CREATE POLICY "library_read" ON library_books
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "library_admin_all" ON library_books;
CREATE POLICY "library_admin_all" ON library_books
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('admin','nazim','super_admin')
    )
  );

-- Surahs: public read
ALTER TABLE surahs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "surahs_public_read" ON surahs;
CREATE POLICY "surahs_public_read" ON surahs FOR SELECT USING (true);
