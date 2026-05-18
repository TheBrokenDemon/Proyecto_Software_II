const { getActiveEvaluationTypes } = require('../services/evaluation.service');

const getEvaluations = async (_req, res) => {
  try {
    const types = await getActiveEvaluationTypes();
    res.status(200).json({ evaluation_types: types });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getEvaluations };
