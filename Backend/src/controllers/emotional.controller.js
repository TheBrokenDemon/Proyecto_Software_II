const {
  createEmotionalRecord,
  getEmotionalHistory,
  getAvailableEmotions,
} = require('../services/emotional.service');
const { getRecommendations } = require('../services/recommendation.service');

const createRecord = async (req, res) => {
  try {
    const record = await createEmotionalRecord(req.user.id, req.body);
    // Inmediatamente después del registro, calcular recomendaciones
    const recommendations = await getRecommendations(req.user.id);
    res.status(201).json({
      message: 'Registro emocional guardado correctamente.',
      record,
      recommendations,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getEmotionalHistory(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getEmotions = (_req, res) => {
  res.status(200).json({ emotions: getAvailableEmotions() });
};

module.exports = { createRecord, getHistory, getEmotions };
