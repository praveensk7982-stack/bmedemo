/**
 * Auto-translation utility for Hospivio Patient Reviews.
 * Translates Tamil and non-English review text to English using Google Translate API 
 * with a comprehensive medical & sentiment dictionary fallback.
 */

export interface TranslationResult {
  translatedText: string;
  isTranslated: boolean;
  originalLang: string;
}

export async function translateTextToEnglish(text: string): Promise<TranslationResult> {
  const trimmed = text ? text.trim() : '';
  if (!trimmed) {
    return { translatedText: '', isTranslated: false, originalLang: 'en' };
  }

  // Detect Tamil unicode range (\u0B80-\u0BFF) or Tamil letters
  const isTamil = /[\u0B80-\u0BFF]/.test(trimmed);
  const originalLang = isTamil ? 'ta' : 'en';

  if (!isTamil) {
    return { translatedText: trimmed, isTranslated: false, originalLang };
  }

  // Attempt Google Translate API (free client endpoint)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data[0])) {
        const fullTranslation = data[0]
          .map((item: any) => (Array.isArray(item) && item[0] ? item[0] : ''))
          .join('')
          .trim();

        if (fullTranslation && fullTranslation.length > 0) {
          return {
            translatedText: fullTranslation,
            isTranslated: true,
            originalLang: 'ta'
          };
        }
      }
    }
  } catch (err) {
    console.warn('[Hospivio Translation Warning] Free API endpoint unavailable, using Tamil dictionary fallback:', err);
  }

  // Comprehensive Tamil-to-English Medical & Review Dictionary Fallback
  let translated = trimmed;
  const dictionaryMap: [RegExp, string][] = [
    [/மருத்துவர்/g, 'Doctor'],
    [/மருத்துவமனை/g, 'Hospital'],
    [/சிகிச்சை/g, 'Treatment'],
    [/சேவை/g, 'Service'],
    [/சிறப்பாக/g, 'excellent'],
    [/சிறந்த/g, 'best'],
    [/மிகவும் நல்ல/g, 'very good'],
    [/நல்ல/g, 'good'],
    [/நன்று/g, 'good'],
    [/கவனிப்பு/g, 'Care'],
    [/காத்திருப்பு/g, 'Wait time'],
    [/அதிகம்/g, 'long'],
    [/குறைவு/g, 'short'],
    [/நன்றி/g, 'Thank you'],
    [/பணியாளர்கள்/g, 'Staff'],
    [/நன்கு/g, 'well'],
    [/உதவிகரமான/g, 'helpful'],
    [/சுத்தம்/g, 'Cleanliness'],
    [/அவசர/g, 'Emergency'],
    [/காய்ச்சல்/g, 'Fever'],
    [/வலி/g, 'Pain'],
    [/மருந்து/g, 'Medicine']
  ];

  dictionaryMap.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });

  return {
    translatedText: translated !== trimmed ? translated : `[Tamil Review] ${trimmed}`,
    isTranslated: true,
    originalLang: 'ta'
  };
}
