const router = require('express').Router(); // require express and use the Router method to create a router object
const { register, login } = require('../controllers/authController');

router.post('/login', login); // create a POST route for the login endpoint that calls the UserLogin function
router.post('/register', register); // create a POST route for the signup endpoint that calls the UserSignUp function

module.exports = router; // export the router object