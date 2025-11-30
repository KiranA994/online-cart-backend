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

app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});