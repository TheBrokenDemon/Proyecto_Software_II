const { getActiveEvaluations, getEvaluationWithQuestions, submitEvaluationResponses, getMyHistory } = require('../services/evaluation.service');

const listEvaluations = async (_req, res) => {
  try {
    const evaluations = await getActiveEvaluations();
    res.status(200).json({ evaluations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getEvaluation = async (req, res) => {
  try {
    const evaluation = await getEvaluationWithQuestions(req.params.slug);
    res.status(200).json({ evaluation });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const submitResponses = async (req, res) => {
  try {
    const result = await submitEvaluationResponses(req.user.id, req.params.slug, req.body.answers);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const myHistory = async (req, res) => {
  try {
    const history = await getMyHistory(req.user.id);
    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listEvaluations, getEvaluation, submitResponses, myHistory };
