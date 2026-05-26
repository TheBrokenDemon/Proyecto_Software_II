const { getUserProfile, updateUserProfile } = require('../services/user.service');

const getProfile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);
    res.status(200).json({ user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await updateUserProfile(req.user.id, req.body);
    res.status(200).json({ message: 'Perfil actualizado correctamente.', user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile };
