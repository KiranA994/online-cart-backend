const router = require('express').Router();
const { register, login, refreshToken } = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post("/refresh", refreshToken);

// protected test route
router.get('/me', auth, (req, res) => {
  res.json({ message: "Authorized!", user: req.user });
});

module.exports = router;
