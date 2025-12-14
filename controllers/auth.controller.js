const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    // Check existing user
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    const user = {
      id: result.insertId,
      email,
      role,
    };

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    await pool.query(
      "UPDATE users SET refreshToken=? WHERE id=?",
      [refreshToken, user.id]
    );

    // Respond same as login
    res.status(201).json({
      id: user.id,
      name,
      email,
      role,
      accessToken,
      refreshToken,
    });

  } catch (err) {
    next(err);
  }
};


// LOGIN
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query(
      "UPDATE users SET refreshToken=? WHERE id=?",
      [refreshToken, user.id]
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
      refreshToken,
    });

  } catch (err) {
    next(err);
  }
};


exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE refreshToken=?",
    [refreshToken]
  );

  if (!rows.length) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  const user = rows[0];

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err) => {
    if (err) {
      return res.status(403).json({ message: "Expired refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    pool.query(
      "UPDATE users SET refreshToken=? WHERE id=?",
      [newRefreshToken, user.id]
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
};

