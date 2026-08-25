import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle2, Circle, Clock } from 'lucide-react'

export default async function TeacherSyllabusPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const isRtl = lang === 'ur'
  const supabase = await createClient()

  // Pull syllabus from Supabase or provide standard Darse Nizami topics
  const { data: syllabusData } = (await supabase
    .from('syllabus')
    .select(`
      *,
      syllabus_topics (*)
    `)
    .limit(5)) as any

  // Default syllabus modules for Islamic Seminary
  const defaultSyllabus = [
    {
      subject: isRtl ? 'صرف و نحو (ہدایۃ النحو)' : 'Arabic Grammar (Hidayat-un-Nahw)',
      class: isRtl ? 'ابتدائی اول' : 'Ibtidai Awwal',
      progress: 68,
      topics: [
        { name: isRtl ? 'تعریف کلام اور اس کی اقسام' : 'Definition of Kalam & Categories', covered: true },
        { name: isRtl ? 'اسم معرب اور اس کے احکام' : 'Ism Mu\'rab and Rules', covered: true },
        { name: isRtl ? 'مرفوعات کی تفصیل (فاعل و مفعول)' : 'Marfoo\'at (Fail & Mafool)', covered: true },
        { name: isRtl ? 'منصوبات و مجرورات' : 'Mansoobat & Majroorat', covered: false },
        { name: isRtl ? 'افعال قلوب و افعال مدح و ذم' : 'Af\'al Quloob & Af\'al Madh', covered: false },
      ],
    },
    {
      subject: isRtl ? 'تجوید و حفظ القرآن' : 'Tajweed & Hifz Tracker',
      class: isRtl ? 'حفظ القرآن' : 'Hifz Class',
      progress: 85,
      topics: [
        { name: isRtl ? 'مخارج الحروف کی مشق' : 'Makhaarij al-Huroof Practice', covered: true },
        { name: isRtl ? 'احکام نون ساکن و تنوین' : 'Noon Sakin & Tanween Rules', covered: true },
        { name: isRtl ? 'احکام مد و قصر' : 'Madd & Qasr Rules', covered: true },
        { name: isRtl ? 'پارہ ۱ تا ۵ کی دہرائی' : 'Juz 1 to 5 Revision (Dour)', covered: false },
      ],
    },
    {
      subject: isRtl ? 'فقہ اسلامی (قدوری)' : 'Islamic Jurisprudence (Qudoori)',
      class: isRtl ? 'متوسط اول' : 'Mutawassit Awwal',
      progress: 50,
      topics: [
        { name: isRtl ? 'کتاب الطہارۃ (وضو، غسل، تیمم)' : 'Kitab al-Taharah (Wudu, Ghusl, Tayammum)', covered: true },
        { name: isRtl ? 'کتاب الصلاۃ (نماز کے ارکان و شرائط)' : 'Kitab al-Salah (Conditions & Pillars)', covered: true },
        { name: isRtl ? 'کتاب الزکاۃ و الصوم' : 'Kitab al-Zakat & Fasting', covered: false },
        { name: isRtl ? 'کتاب النکاح و الطلاق' : 'Kitab al-Nikah', covered: false },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-accent" />
          {isRtl ? 'نصاب و تدریسی پیش رفت' : 'Syllabus & Course Progress'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRtl
            ? 'درس نظامی اور تجوید کے نصاب کی تکمیل کی نگرانی کریں۔'
            : 'Track chapter completion, syllabus coverage, and Tajweed progress.'}
        </p>
      </div>

      <div className="grid gap-6">
        {defaultSyllabus.map((item, idx) => (
          <Card key={idx} className="border-primary/15 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg text-primary">{item.subject}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.class}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">{item.progress}%</span>
                    <span className="text-xs text-muted-foreground block">{isRtl ? 'مکمل' : 'Covered'}</span>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                {isRtl ? 'اسباق و عنوانات:' : 'Course Topics:'}
              </h4>
              <div className="space-y-2.5">
                {item.topics.map((topic, tIdx) => (
                  <div
                    key={tIdx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-card hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {topic.covered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                      )}
                      <span className={`text-sm ${topic.covered ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {topic.name}
                      </span>
                    </div>
                    <Badge
                      variant={topic.covered ? 'default' : 'outline'}
                      className={`text-xs ${
                        topic.covered
                          ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {topic.covered ? (isRtl ? 'مکمل' : 'Completed') : (isRtl ? 'زیر تدریس' : 'In Progress')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
