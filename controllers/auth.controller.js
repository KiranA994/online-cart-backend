const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/token');

// REGISTER
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    res.json({
      id: result.insertId,
      name,
      email,
      role,
      token: generateToken({ id: result.insertId, email, role }),
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

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
    });

  } catch (err) {
    next(err);
  }
};


exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "Refresh token missing" });

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE refreshToken=?",
    [token]
  );
  const user = rows[0];

  if (!user) return res.status(403).json({ message: "Invalid refresh token" });

  jwt.verify(token, process.env.REFRESH_SECRET, (err) => {
    if (err) return res.status(403).json({ message: "Expired refresh token" });

    const accessToken = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);

    pool.query("UPDATE users SET refreshToken=? WHERE id=?", [
      newRefresh,
      user.id,
    ]);

    res.json({ accessToken, refreshToken: newRefresh });
  });
};
