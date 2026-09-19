export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isUrdu = lang === 'ur'

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{isUrdu ? 'ہمارے بارے میں' : 'About Us'}</h1>
      <div className="space-y-6 text-lg text-muted-foreground">
        <p>
          {isUrdu
            ? 'یہ جامعہ دینی و عصری تعلیم کا ایک مثالی مرکز ہے جہاں طلباء کو درس نظامی کے ساتھ ساتھ جدید تعلیم بھی فراہم کی جاتی ہے۔'
            : 'Our Jamia is an exemplary center for Islamic and contemporary education. Students are provided with Darse Nizami alongside modern knowledge.'}
        </p>
        <p>
          {isUrdu
            ? 'ہمارا مقصد ایسی نسل تیار کرنا ہے جو دین اور دنیا دونوں میں کامیاب ہو اور امت مسلمہ کی صحیح معنوں میں خدمت کر سکے۔'
            : 'Our mission is to prepare a generation that succeeds in both Deen and Dunya, and can truly serve the Muslim Ummah.'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl">
            <h3 className="font-bold text-xl text-foreground mb-2">{isUrdu ? 'ہمارا وژن' : 'Our Vision'}</h3>
            <p>{isUrdu ? 'ایک ایسا معاشرہ جہاں دینی تعلیم ہر گھر تک پہنچے۔' : 'A society where Islamic education reaches every home.'}</p>
          </div>
          <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl">
            <h3 className="font-bold text-xl text-foreground mb-2">{isUrdu ? 'ہمارا مشن' : 'Our Mission'}</h3>
            <p>{isUrdu ? 'قرآن و سنت کی روشنی میں اعلیٰ تعلیم فراہم کرنا۔' : 'Providing excellent education in the light of Quran and Sunnah.'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
