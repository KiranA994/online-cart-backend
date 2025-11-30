const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1hr' }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: "1d" }
  );
};