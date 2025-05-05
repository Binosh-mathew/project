const jwt = require('jsonwebtoken');

exports.protectDeveloperRoute = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Developer access required'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== 'developer') {
        return res.status(403).json({
          success: false,
          message: 'Developer access required'
        });
      }

      req.developer = {
        id: decoded.id,
        email: decoded.email,
        role: 'developer'
      };

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Developer access required'
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.validateDeveloperCredentials = (email, password) => {
  if (!process.env.DEVELOPER_EMAIL || !process.env.DEVELOPER_PASSWORD) {
    throw new Error('Developer credentials not configured');
  }
  return email === process.env.DEVELOPER_EMAIL && password === process.env.DEVELOPER_PASSWORD;
}; 