const User = require('../models/user');
const OTP = require('../models/OTP.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email.js');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);
// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// 1. REGISTER USER (Creates unverified account + sends OTP)
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (default: isVerified = false)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user',
            isVerified: false
        });

        // Generate 6-digit random OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database mapping it to the email
        await OTP.create({
            email,
            otp: otpCode,
            action: 'account_verification'
        });

        // Send OTP via Nodemailer utility
        await sendOTPEmail(email, otpCode, 'account_verification');

        res.status(201).json({
            message: 'User registration successful. OTP sent to email.',
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. VERIFY OTP (Activates account + sends back JWT)
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        // Find matching active OTP documentation
        const otpRecord = await OTP.findOne({ email, otp, action: 'account_verification' });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Update user verification status in DB
        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });

        // Clean up and delete used OTP record
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            message: 'Account verified successfully',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. LOGIN USER (Validates password + handles unverified fallbacks)
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials. Please sign up first.' });
        }

        // Compare password hashes
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Fallback: If user never verified their email, trigger a new OTP cycle
        if (!user.isVerified && user.role !== 'admin') {
            await OTP.deleteOne({ email, action: 'account_verification' }); // clear old records

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            await OTP.create({ email, otp: otpCode, action: 'account_verification' });
            await sendOTPEmail(email, otpCode, 'account_verification');

            return res.status(403).json({
                message: 'Account not verified. A new OTP has been sent to your email.'
            });
        }

        // Successful authentication
        res.status(200).json({
            message: 'Login successful',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const email = payload.email;
        const name = payload.name;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                password: 'google-login',
                role: 'user',
                isVerified: true
            });
        }

        res.status(200).json({
            token: generateToken(user._id, user.role),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Google login failed'
        });
    }
};