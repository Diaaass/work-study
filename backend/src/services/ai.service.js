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

Требования к письму:
- На русском языке
- 3-4 абзаца, не более 250 слов
- Профессиональный тон, конкретные примеры из профиля
- Не начинай с "Я хочу", начни оригинально
- Без шаблонных фраз типа "командный игрок"
- Завершить призывом к действию

Верни ТОЛЬКО текст письма, без заголовков и пояснений.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('[AI] Ошибка cover letter:', err.message);
    throw new Error('Не удалось сгенерировать письмо');
  }
}

function invalidateCache(userId) {
  scoreCache.delete(userId);
}

module.exports = { scoreInternships, generateCoverLetter, invalidateCache };
