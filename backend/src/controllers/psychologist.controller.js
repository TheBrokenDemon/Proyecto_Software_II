const {
  getStudentsList,
  getStudentResponses,
  sendCitationEmail,
} = require('../services/psychologist.service');

const listStudents = async (_req, res) => {
  try {
    const students = await getStudentsList();
    res.status(200).json({ students });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const studentResponses = async (req, res) => {
  try {
    const data = await getStudentResponses(req.params.studentId);
    res.status(200).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const citateStudent = async (req, res) => {
  try {
    const result = await sendCitationEmail(req.params.studentId, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { listStudents, studentResponses, citateStudent };
