const router = require('express').Router(); // require express and use the Router method to create a router object
const { register, login, verifyToken } = require('../controllers/authController');
const {requireAuth} = require('../middleware/requireAuth');

router.post('/login', login);
router.post('/register', register);
router.get('/verify', requireAuth, verifyToken);

module.exports = router;