// MyMemory API — free, no API key required, 1000 words/day anonymous
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const cache = new Map();

// Split long texts into chunks that fit within MyMemory's 500-char limit
function splitIntoChunks(text, maxLen = 480) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxLen;
    if (end >= text.length) {
      chunks.push(text.slice(start));
      break;
    }
    const slice = text.slice(start, end);
    const lastBreak = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? ')
    );
    end = lastBreak > maxLen / 2 ? start + lastBreak + 2 : end;
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

export async function translateText(text, targetLang) {
  if (!text || targetLang === 'en') return text;

  const cacheKey = `${targetLang}:${text.slice(0, 80)}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const chunks = splitIntoChunks(text);
    const parts = await Promise.all(
      chunks.map(async chunk => {
        const url = `${MYMEMORY_URL}?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.responseData?.translatedText || chunk;
      })
    );
    const translated = parts.join(' ');
    cache.set(cacheKey, translated);
    return translated;
  } catch (err) {
    console.warn('Translation failed, using original:', err.message);
    return text;
  }
}

export async function translateBatch(texts, targetLang) {
  if (targetLang === 'en') return texts;
  return Promise.all(texts.map(text => translateText(text, targetLang)));
}

export function clearTranslationCache() {
  cache.clear();
}
