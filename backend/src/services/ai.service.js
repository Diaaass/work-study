const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// In-memory cache: userId -> { scores: [...], generatedAt: Date }
const scoreCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 часа

function buildStudentProfile(user) {
  const experience = Array.isArray(user.cvExperience)
    ? user.cvExperience.map(e => `${e.position} в ${e.company} (${e.duration || ''})`).join('; ')
    : '';
  const languages = Array.isArray(user.cvLanguages)
    ? user.cvLanguages.map(l => `${l.language} ${l.level}`).join(', ')
    : '';

  return [
    user.major        && `Направление: ${user.major}`,
    user.university   && `Университет: ${user.university}`,
    user.gpa          && `GPA: ${user.gpa}`,
    user.graduationYear && `Год окончания: ${user.graduationYear}`,
    user.skills?.length && `Навыки: ${user.skills.join(', ')}`,
    experience        && `Опыт: ${experience}`,
    languages         && `Языки: ${languages}`,
    user.bio          && `О себе: ${user.bio}`,
  ].filter(Boolean).join('\n');
}

// Scoring: оценить список стажировок для студента
async function scoreInternships(user, internships) {
  const cached = scoreCache.get(user.id);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
    const ids = new Set(internships.map(i => i.id));
    const fresh = cached.scores.filter(s => ids.has(s.id));
    if (fresh.length === internships.length) return fresh;
  }

  const profile = buildStudentProfile(user);
  if (!profile.trim()) {
    return internships.map(i => ({ id: i.id, score: 50, reason: 'Заполните профиль для точных рекомендаций' }));
  }

  const internshipList = internships.map(i => ({
    id: i.id,
    title: i.title,
    company: i.company,
    description: i.description?.slice(0, 300),
    requirements: i.requirements?.join(', '),
    skills: i.skills?.join(', '),
    workType: i.workType,
  }));

  const prompt = `Ты — AI-рекрутер на платформе Work&Study для студентов Казахстана.

Профиль студента:
${profile}

Оцени подходящесть каждой стажировки для этого студента от 0 до 100.
Критерии: соответствие навыков (40%), направление учёбы (30%), опыт (20%), прочее (10%).

Стажировки:
${JSON.stringify(internshipList, null, 2)}

Верни ТОЛЬКО валидный JSON-массив без markdown, без пояснений:
[{"id": <number>, "score": <0-100>, "reason": "<краткая причина на русском, 1 предложение>"}]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const scores = JSON.parse(cleaned);

    scoreCache.set(user.id, { scores, generatedAt: Date.now() });
    return scores;
  } catch (err) {
    console.error('[AI] Ошибка scoring:', err.message);
    return internships.map(i => ({ id: i.id, score: 50, reason: 'Не удалось рассчитать' }));
  }
}

// Cover letter: сгенерировать сопроводительное письмо
async function generateCoverLetter(user, internship) {
  const profile = buildStudentProfile(user);

  const prompt = `Ты — карьерный консультант. Напиши сопроводительное письмо для студента.

Профиль студента:
Имя: ${user.name}
${profile}

Стажировка:
Название: ${internship.title}
Компания: ${internship.company}
Описание: ${internship.description?.slice(0, 400)}
Требования: ${internship.requirements?.join(', ')}
Навыки: ${internship.skills?.join(', ')}

Напиши короткое профессиональное сопроводительное письмо на русском языке от лица студента. Конкретные примеры из профиля, без воды и шаблонных фраз. Завершить призывом к интервью.

Верни ТОЛЬКО текст письма.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (text.length <= 1800) return text;
    const truncated = text.slice(0, 1800);
    const lastDot = truncated.lastIndexOf('.');
    return lastDot > 500 ? truncated.slice(0, lastDot + 1) : truncated.trimEnd();
  } catch (err) {
    console.error('[AI] Ошибка cover letter:', err.message);
    throw new Error('Не удалось сгенерировать письмо');
  }
}

// Smart search: Gemini расширяет запрос → код ищет по словоформам
async function smartSearch(query, internships) {
  // Шаг 1: Gemini генерирует все словоформы и синонимы запроса
  const expandPrompt = `You expand search queries into all related word forms for text search.

Query: "${query}"

Return ONLY valid JSON (no markdown):
{
  "terms": ["word1", "word2", ...],
  "city": null,
  "workType": null
}

For "terms" — list EXACT words/phrases that might appear in job titles or skill lists:
- Include Russian AND English word forms
- Include all grammatical forms: маркетинг → [маркетинг, маркетолог, маркетолога, маркетинговый, marketing, marketer, smm, pr, реклама, рекламный]
- финансы → [финансы, финансист, финансовый, аналитик, экономист, бухгалтер, finance, financial, analyst, banking, банк]
- кибербезопасность → [кибербезопасность, безопасность, security, cybersecurity, soc, иб, penetration, защита]
- разработка → [разработчик, разработка, developer, программист, engineer, frontend, backend, fullstack, devops, qa]
- дизайн → [дизайнер, дизайн, designer, ui, ux, figma, графический]
- Natural language: extract the TOPIC first, then expand it the same way
  "брат хочу быть финансовым аналитиком" → topic is финансовый аналитик → expand accordingly
  "хочу удалённую работу в IT" → topic is IT + set workType: remote

For city (only these exact values or null): "Алматы", "Астана", "Удалённо"
For workType (only these exact values or null): "remote", "office", "hybrid"

Minimum 5 terms, maximum 20 terms.`;

  let terms = [];
  let city = null;
  let workType = null;

  try {
    const result = await model.generateContent(expandPrompt);
    const raw = result.response.text().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      terms = (parsed.terms || []).map(t => t.toLowerCase().trim()).filter(t => t.length >= 2);
      city = parsed.city || null;
      workType = parsed.workType || null;
    }
    console.log(`[AI] expanded "${query}" →`, terms);
  } catch (err) {
    console.error('[AI] expand error:', err.message);
    // Fallback: сами берём слова из запроса
    terms = query.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
  }

  // Шаг 2: ищем каждый term через includes() в данных вакансии
  const scored = internships
    .map(i => {
      if (city && i.city !== city) return null;
      if (workType && i.workType !== workType) return null;

      const titleLow = (i.title || '').toLowerCase();
      const bodyLow = [
        i.company,
        i.description,
        ...(Array.isArray(i.skills) ? i.skills : []),
        ...(Array.isArray(i.requirements) ? i.requirements : []),
      ].join(' ').toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (titleLow.includes(term))       score += 60;
        else if (bodyLow.includes(term))   score += 25;
      }

      // Если только город/тип без terms — все подходят
      if (terms.length === 0) return { id: i.id, score: 70 };
      return score > 0 ? { id: i.id, score: Math.min(score, 100) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  console.log(`[AI] smartSearch "${query}": ${scored.length} results`);
  return scored;
}

function invalidateCache(userId) {
  scoreCache.delete(userId);
}

module.exports = { scoreInternships, generateCoverLetter, smartSearch, invalidateCache };
