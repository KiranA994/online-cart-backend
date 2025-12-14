const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('./middleware/error.middleware');

require('dotenv').config();

const app = express();

// Security & logging middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(cors());

// Body parser middleware - IMPORTANT!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

app.use("/user", require("./routes/user.route"));

// Error middleware (should be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// const bcrypt = require('bcryptjs');
// const pool = require("./config/db");  // adjust path

// async function createDefaultAdmin() {
//   const [rows] = await pool.query(
//     "SELECT * FROM users WHERE role = 'admin' LIMIT 1"
//   );

//   if (rows.length === 0) {
//     const hashed = await bcrypt.hash("Admin@123", 10);

//     await pool.query(
//       "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
//       ["Admin", "admin@example.com", hashed, "admin"]
//     );

//     console.log("Default admin created");
//   } else {
//     console.log("Admin already exists");
//   }
// }

// createDefaultAdmin();


app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});