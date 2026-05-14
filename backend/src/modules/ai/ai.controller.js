const prisma = require('../../config/db');
const { scoreInternships, generateCoverLetter, smartSearch } = require('../../services/ai.service');

// GET /api/v1/ai/recommendations
const getRecommendations = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    const { city } = req.query;

    const where = { status: 'published' };
    if (city) where.city = { contains: city, mode: 'insensitive' };

    const internships = await prisma.internship.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    if (!internships.length) return res.json([]);

    const scores = await scoreInternships(user, internships);
    const scoreMap = new Map(scores.map(s => [s.id, s]));

    const result = internships
      .map(i => ({
        ...i,
        matchScore: scoreMap.get(i.id)?.score ?? 50,
        matchReason: scoreMap.get(i.id)?.reason ?? '',
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(result);
  } catch (err) {
    console.error('[AI] recommendations error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/v1/ai/cover-letter
const getCoverLetter = async (req, res) => {
  try {
    const { internshipId } = req.body;
    if (!internshipId) return res.status(400).json({ message: 'internshipId обязателен' });

    const [user, internship] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.userId } }),
      prisma.internship.findUnique({ where: { id: parseInt(internshipId) } }),
    ]);

    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    if (!internship) return res.status(404).json({ message: 'Стажировка не найдена' });

    const text = await generateCoverLetter(user, internship);
    res.json({ text });
  } catch (err) {
    console.error('[AI] cover-letter error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/v1/ai/smart-search
const getSmartSearch = async (req, res) => {
  try {
    const { query, city, workType } = req.body;
    if (!query?.trim()) return res.status(400).json({ message: 'query обязателен' });

    const where = { status: 'published' };
    if (city && city !== 'all') where.city = { contains: city, mode: 'insensitive' };
    if (workType && workType !== 'all') where.workType = workType;

    const internships = await prisma.internship.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    if (!internships.length) return res.json([]);

    const scored = await smartSearch(query, internships);
    const scoreMap = new Map(scored.map(s => [s.id, s]));

    const result = internships
      .filter(i => scoreMap.has(i.id))
      .map(i => ({
        ...i,
        matchScore: scoreMap.get(i.id).score,
        matchReason: scoreMap.get(i.id).reason,
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(result);
  } catch (err) {
    console.error('[AI] smart-search error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRecommendations, getCoverLetter, getSmartSearch };
