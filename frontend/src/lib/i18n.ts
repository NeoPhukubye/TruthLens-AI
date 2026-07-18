export type Language = 'en' | 'fr' | 'es' | 'ar' | 'zh' | 'zu'

export interface SignLanguageVideo {
  label: string
  url: string
}

export interface Translations {
  nav: {
    analyze: string
    learn: string
    quiz: string
    dashboard: string
    accessibility: string
  }
  home: {
    title: string
    subtitle: string
    cta: string
  }
  analyze: {
    title: string
    subtitle: string
    placeholder: string
    button: string
    analyzing: string
  }
  imageDetector: {
    title: string
    subtitle: string
    upload: string
    analyzing: string
    aiGenerated: string
    realPhoto: string
    confidence: string
  }
  accessibility: {
    voiceActivated: string
    startListening: string
    stopListening: string
    signLanguage: string
    readAloud: string
  }
  common: {
    loading: string
    error: string
    back: string
  }
}

export const languages: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ar: 'العربية',
  zh: '中文',
  zu: 'isiZulu',
}

export const signLanguages = {
  asl: { name: 'American Sign Language', code: 'ASL' },
  bsl: { name: 'British Sign Language', code: 'BSL' },
  isl: { name: 'International Sign', code: 'IS' },
  sasl: { name: 'South African Sign Language', code: 'SASL' },
}

const translations: Record<Language, Translations> = {
  en: {
    nav: { analyze: 'Analyze', learn: 'Learn', quiz: 'Quiz', dashboard: 'Dashboard', accessibility: 'Accessibility' },
    home: { title: 'See Beyond the Headlines', subtitle: 'Empowering youth to verify, understand, and critically evaluate digital information.', cta: 'Start Analyzing' },
    analyze: { title: 'Analyze Content', subtitle: 'Paste any article, tweet, or message to extract claims and evaluate credibility.', placeholder: 'Paste your content here...', button: 'Analyze', analyzing: 'Analyzing...' },
    imageDetector: { title: 'AI Image Detector', subtitle: 'Upload an image to check if it is AI-generated or a real photograph.', upload: 'Upload Image', analyzing: 'Analyzing image...', aiGenerated: 'Likely AI-Generated', realPhoto: 'Likely Real Photo', confidence: 'Confidence' },
    accessibility: { voiceActivated: 'Voice Activated', startListening: 'Start Listening', stopListening: 'Stop Listening', signLanguage: 'Sign Language', readAloud: 'Read Aloud' },
    common: { loading: 'Loading...', error: 'An error occurred', back: 'Back' },
  },
  fr: {
    nav: { analyze: 'Analyser', learn: 'Apprendre', quiz: 'Quiz', dashboard: 'Tableau de bord', accessibility: 'Accessibilité' },
    home: { title: 'Voir au-delà des gros titres', subtitle: 'Permettre aux jeunes de vérifier, comprendre et évaluer de manière critique l\'information numérique.', cta: 'Commencer l\'analyse' },
    analyze: { title: 'Analyser le contenu', subtitle: 'Collez un article, tweet ou message pour extraire les affirmations et évaluer la crédibilité.', placeholder: 'Collez votre contenu ici...', button: 'Analyser', analyzing: 'Analyse en cours...' },
    imageDetector: { title: 'Détecteur d\'images IA', subtitle: 'Téléchargez une image pour vérifier si elle est générée par IA ou une vraie photo.', upload: 'Télécharger l\'image', analyzing: 'Analyse de l\'image...', aiGenerated: 'Probablement générée par IA', realPhoto: 'Probablement une vraie photo', confidence: 'Confiance' },
    accessibility: { voiceActivated: 'Activé par la voix', startListening: 'Commencer l\'écoute', stopListening: 'Arrêter l\'écoute', signLanguage: 'Langue des signes', readAloud: 'Lire à haute voix' },
    common: { loading: 'Chargement...', error: 'Une erreur est survenue', back: 'Retour' },
  },
  es: {
    nav: { analyze: 'Analizar', learn: 'Aprender', quiz: 'Quiz', dashboard: 'Panel', accessibility: 'Accesibilidad' },
    home: { title: 'Mira más allá de los titulares', subtitle: 'Empoderando a los jóvenes para verificar, comprender y evaluar críticamente la información digital.', cta: 'Comenzar análisis' },
    analyze: { title: 'Analizar contenido', subtitle: 'Pega cualquier artículo, tweet o mensaje para extraer afirmaciones y evaluar credibilidad.', placeholder: 'Pega tu contenido aquí...', button: 'Analizar', analyzing: 'Analizando...' },
    imageDetector: { title: 'Detector de imágenes IA', subtitle: 'Sube una imagen para verificar si fue generada por IA o es una foto real.', upload: 'Subir imagen', analyzing: 'Analizando imagen...', aiGenerated: 'Probablemente generada por IA', realPhoto: 'Probablemente foto real', confidence: 'Confianza' },
    accessibility: { voiceActivated: 'Activado por voz', startListening: 'Empezar a escuchar', stopListening: 'Dejar de escuchar', signLanguage: 'Lengua de señas', readAloud: 'Leer en voz alta' },
    common: { loading: 'Cargando...', error: 'Ocurrió un error', back: 'Volver' },
  },
  ar: {
    nav: { analyze: 'تحليل', learn: 'تعلم', quiz: 'اختبار', dashboard: 'لوحة القيادة', accessibility: 'إمكانية الوصول' },
    home: { title: 'انظر ما وراء العناوين', subtitle: 'تمكين الشباب من التحقق وفهم وتقييم المعلومات الرقمية بشكل نقدي.', cta: 'ابدأ التحليل' },
    analyze: { title: 'تحليل المحتوى', subtitle: 'الصق أي مقال أو تغريدة أو رسالة لاستخراج الادعاءات وتقييم المصداقية.', placeholder: 'الصق المحتوى هنا...', button: 'تحليل', analyzing: 'جاري التحليل...' },
    imageDetector: { title: 'كاشف صور الذكاء الاصطناعي', subtitle: 'ارفع صورة للتحقق مما إذا كانت مولدة بالذكاء الاصطناعي أو صورة حقيقية.', upload: 'رفع صورة', analyzing: 'جاري تحليل الصورة...', aiGenerated: 'على الأرجح مولدة بالذكاء الاصطناعي', realPhoto: 'على الأرجح صورة حقيقية', confidence: 'الثقة' },
    accessibility: { voiceActivated: 'مفعل بالصوت', startListening: 'بدء الاستماع', stopListening: 'إيقاف الاستماع', signLanguage: 'لغة الإشارة', readAloud: 'اقرأ بصوت عالٍ' },
    common: { loading: 'جاري التحميل...', error: 'حدث خطأ', back: 'رجوع' },
  },
  zh: {
    nav: { analyze: '分析', learn: '学习', quiz: '测验', dashboard: '仪表板', accessibility: '无障碍' },
    home: { title: '看透新闻标题', subtitle: '赋能青年验证、理解和批判性评估数字信息。', cta: '开始分析' },
    analyze: { title: '分析内容', subtitle: '粘贴任何文章、推文或消息以提取声明并评估可信度。', placeholder: '在此粘贴内容...', button: '分析', analyzing: '分析中...' },
    imageDetector: { title: 'AI图片检测器', subtitle: '上传图片以检查是否为AI生成或真实照片。', upload: '上传图片', analyzing: '正在分析图片...', aiGenerated: '可能是AI生成', realPhoto: '可能是真实照片', confidence: '置信度' },
    accessibility: { voiceActivated: '语音激活', startListening: '开始聆听', stopListening: '停止聆听', signLanguage: '手语', readAloud: '朗读' },
    common: { loading: '加载中...', error: '发生错误', back: '返回' },
  },
  zu: {
    nav: { analyze: 'Hlaziya', learn: 'Funda', quiz: 'Isivivinyo', dashboard: 'Ibhodi', accessibility: 'Ukufinyelela' },
    home: { title: 'Bona Ngale Kwezihloko', subtitle: 'Ukunika amandla intsha ukuze iqinisekise, iqonde futhi ihlole ngokubucayi ulwazi lwedijithali.', cta: 'Qala Ukuhlaziya' },
    analyze: { title: 'Hlaziya Okuqukethwe', subtitle: 'Namathisela noma yisiphi isihloko, itweet noma umlayezo ukuze uthole izimangalo futhi uhlole ukwethembeka.', placeholder: 'Namathisela okuqukethwe kwakho lapha...', button: 'Hlaziya', analyzing: 'Kuyahlaziywa...' },
    imageDetector: { title: 'Umtholisizi Wezithombe ze-AI', subtitle: 'Layisha isithombe ukuhlola ukuthi senziwe yi-AI noma siyisithombe sangempela.', upload: 'Layisha Isithombe', analyzing: 'Kuhlaziywa isithombe...', aiGenerated: 'Kungenzeka senziwe yi-AI', realPhoto: 'Kungenzeka siyisithombe sangempela', confidence: 'Ukwethemba' },
    accessibility: { voiceActivated: 'Kuvulwe ngezwi', startListening: 'Qala Ukulalela', stopListening: 'Yeka Ukulalela', signLanguage: 'Ulimi Lwezimpawu', readAloud: 'Funda Kuzwakale' },
    common: { loading: 'Kuyalayisha...', error: 'Kwenzeke iphutha', back: 'Emuva' },
  },
}

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en
}

export function isRTL(lang: Language): boolean {
  return lang === 'ar'
}
