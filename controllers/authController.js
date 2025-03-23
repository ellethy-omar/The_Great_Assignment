const User = require('../models/User');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { generateToken } = require('../middleware/requireAuth'); // Import your JWT generator

// Register a new user
const register = async (req, res) => {
    const { username, email, password } = req.body;
    if(!username || !email || !password){
        return res.status(400).json({ error: 'All fields are required' });
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({ error: 'Invalid email address' });
    }

    if(!validator.isStrongPassword(password)){
        return res.status(400).json({ error: 'Password is not strong enough' });
    }

    try {
        // Check if a user already exists with this username or email
        const existingUser = await User.findOne({
        $or: [{ username }, { email }]
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        const savedUser = await user.save();

        // Generate JWT for the new user
        const token = generateToken(savedUser._id);

        res.status(201).json({
            message: 'User registered successfully',
            user: savedUser,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// Login an existing user
const login = async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    
    // Ensure both username/email and password are provided
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Both username/email and password are required' });
    }
    
    try {
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
    
        // Generate JWT for the user
        const token = generateToken(user._id);
        // console.log(user);
    
        res.status(200).json({
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

const verifyToken = (req, res) => {
    res.status(200).json({ message: 'Token is valid', user: req.user });
};
  

module.exports = { register, login, verifyToken };
