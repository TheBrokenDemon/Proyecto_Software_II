const getDashboard = async (req, res) => {
  try {
    // Aquí a futuro consultarás la base de datos para traer métricas, alertas críticas, etc.
    res.status(200).json({ 
      message: 'Bienvenido al panel psicológico',
      professional: req.user.email,
      role: req.user.role
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { getDashboard };